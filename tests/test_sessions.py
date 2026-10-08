"""Tests for session polling and subscriptions."""

from __future__ import annotations

import asyncio
from collections.abc import Iterator
from typing import Any
from unittest.mock import patch

from aioresponses import aioresponses
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.emby_library.const import DOMAIN
from custom_components.emby_library.sessions import SessionHub

from .conftest import calls, url

SESSIONS = "/Sessions"


@pytest.fixture(autouse=True)
def fast_polling() -> Iterator[None]:
    """Poll quickly in tests."""
    with (
        patch("custom_components.emby_library.sessions.POLL_INTERVAL_PLAYING", 0.01),
        patch("custom_components.emby_library.sessions.POLL_INTERVAL_IDLE", 0.01),
        patch("custom_components.emby_library.sessions.POLL_INTERVAL_UNAVAILABLE", 0.01),
    ):
        yield


async def subscribe(ws: Any) -> int:
    """Subscribe and return the subscription id."""
    await ws.send_json_auto_id({"type": "emby_library/sessions/subscribe"})
    response = await ws.receive_json()
    assert response["success"], response
    msg_id: int = response["id"]
    return msg_id


async def unsubscribe(ws: Any, subscription: int) -> None:
    """End a subscription."""
    await ws.send_json_auto_id({"type": "unsubscribe_events", "subscription": subscription})
    while True:
        response = await ws.receive_json()
        if response["type"] == "result":
            assert response["success"]
            return


async def next_event(ws: Any) -> dict[str, Any]:
    """Return the next event payload."""
    message = await asyncio.wait_for(ws.receive_json(), 2)
    assert message["type"] == "event"
    event: dict[str, Any] = message["event"]
    return event


async def test_polling_starts_and_stops_with_subscribers(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    raw_sessions: list[dict[str, Any]],
) -> None:
    """No polling without subscribers; one shared poll for several cards."""
    hub = loaded_entry.runtime_data.hub
    emby.get(url(SESSIONS), payload=raw_sessions, repeat=True)
    await asyncio.sleep(0.05)
    assert not hub.is_polling
    assert not calls(emby, "GET", SESSIONS)

    ws1 = await hass_ws_client(hass)
    ws2 = await hass_ws_client(hass)
    sub1 = await subscribe(ws1)
    assert hub.is_polling
    event = await next_event(ws1)
    assert event["available"] is True
    assert [s["session_id"] for s in event["sessions"]] == ["sess-tv", "sess-web", "sess-audio"]
    assert hub.session_count == 3

    # The second card gets the current state at once and shares the poll task.
    task = hub._task
    sub2 = await subscribe(ws2)
    assert hub._task is task
    assert await next_event(ws2) == event

    await unsubscribe(ws1, sub1)
    assert hub.is_polling
    await unsubscribe(ws2, sub2)
    assert not hub.is_polling

    count = len(calls(emby, "GET", SESSIONS))
    await asyncio.sleep(0.05)
    assert len(calls(emby, "GET", SESSIONS)) == count


async def test_events_only_on_change(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    raw_sessions: list[dict[str, Any]],
) -> None:
    """Unchanged polls are silent; a change gives exactly one event."""
    idle = [raw_sessions[0]]
    for _ in range(5):
        emby.get(url(SESSIONS), payload=idle)
    emby.get(url(SESSIONS), payload=raw_sessions, repeat=True)

    ws = await hass_ws_client(hass)
    await subscribe(ws)
    first = await next_event(ws)
    assert len(first["sessions"]) == 1
    second = await next_event(ws)
    assert len(second["sessions"]) == 3
    assert len(calls(emby, "GET", SESSIONS)) >= 6
    with pytest.raises(asyncio.TimeoutError):
        await asyncio.wait_for(ws.receive_json(), 0.1)


async def test_remembers_only_video_clients_across_disconnect_and_restart(
    hass: HomeAssistant,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    raw_sessions: list[dict[str, Any]],
) -> None:
    """Offline discovery survives restart without reviving a stale playable session."""
    hub = loaded_entry.runtime_data.hub
    emby.get(url(SESSIONS), payload=raw_sessions)
    await hub._poll_once()
    clients = hub._last_event["clients"]
    assert {c["device_id"] for c in clients} == {"dev-tv", "dev-web"}
    # Write the delayed-save data now to simulate a completed save before restart.
    await hub._store.async_save(clients)

    emby.get(url(SESSIONS), payload=[])
    await hub._poll_once()
    assert hub._last_event["sessions"] == []
    assert hub._last_event["clients"] == clients
    hub.stop()

    restored = SessionHub(hass, loaded_entry, hub._client, hub._signer)
    await restored.async_load_clients()
    emby.get(url(SESSIONS), payload=[])
    await restored._poll_once()
    assert restored._last_event["clients"] == clients
    emby.get(url(SESSIONS), payload=[])
    assert await restored.async_find_session("sess-tv") is None


async def test_unavailable_and_recovery(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    raw_sessions: list[dict[str, Any]],
) -> None:
    """Emby going down gives available: false, and polling recovers by itself."""
    emby.get(url(SESSIONS), payload=raw_sessions)
    emby.get(url(SESSIONS), status=503)
    emby.get(url(SESSIONS), exception=TimeoutError())
    emby.get(url(SESSIONS), payload=raw_sessions, repeat=True)

    ws = await hass_ws_client(hass)
    await subscribe(ws)
    assert (await next_event(ws))["available"] is True
    offline = await next_event(ws)
    assert offline["available"] is False
    assert offline["sessions"] == []
    assert {c["device_id"] for c in offline["clients"]} == {"dev-tv", "dev-web"}
    assert (await next_event(ws))["available"] is True


async def test_auth_failure_starts_reauth(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
) -> None:
    """A 401 while polling starts the reauth flow."""
    emby.get(url(SESSIONS), status=401, repeat=True)
    ws = await hass_ws_client(hass)
    await subscribe(ws)
    assert await next_event(ws) == {"available": False, "sessions": [], "clients": []}
    await hass.async_block_till_done()
    assert hass.config_entries.flow.async_progress_by_handler(DOMAIN)


async def test_unexpected_error_does_not_stop_polling(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    raw_sessions: list[dict[str, Any]],
) -> None:
    """A bug in one poll does not kill the loop."""
    emby.get(url(SESSIONS), payload=raw_sessions, repeat=True)
    hub = loaded_entry.runtime_data.hub
    original = hub.async_fetch
    attempts = 0

    async def flaky() -> list[dict[str, Any]]:
        nonlocal attempts
        attempts += 1
        if attempts == 1:
            raise RuntimeError("boom")
        return await original()

    with patch.object(hub, "async_fetch", flaky):
        ws = await hass_ws_client(hass)
        await subscribe(ws)
        assert (await next_event(ws))["available"] is True
    assert attempts >= 2


async def test_unload_stops_polling(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    raw_sessions: list[dict[str, Any]],
) -> None:
    """Unloading the entry stops polling even with subscribers."""
    emby.get(url(SESSIONS), payload=raw_sessions, repeat=True)
    ws = await hass_ws_client(hass)
    await subscribe(ws)
    await next_event(ws)
    hub = loaded_entry.runtime_data.hub
    assert await hass.config_entries.async_unload(loaded_entry.entry_id)
    assert not hub.is_polling
    assert hub.session_count == 0


async def test_find_session_uses_latest_list(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    raw_sessions: list[dict[str, Any]],
) -> None:
    """While polling, a known session is found without another call."""
    emby.get(url(SESSIONS), payload=raw_sessions)
    hub = loaded_entry.runtime_data.hub
    with patch("custom_components.emby_library.sessions.POLL_INTERVAL_PLAYING", 60):
        ws = await hass_ws_client(hass)
        await subscribe(ws)
        await next_event(ws)
        session = await hub.async_find_session("sess-web")
        assert session is not None
        assert session["device_id"] == "dev-web"
        assert len(calls(emby, "GET", SESSIONS)) == 1

        # An unknown session triggers one fresh lookup.
        emby.get(url(SESSIONS), payload=[{**raw_sessions[0], "Id": "sess-new"}])
        found = await hub.async_find_session("sess-new")
        assert found is not None
        assert len(calls(emby, "GET", SESSIONS)) == 2
