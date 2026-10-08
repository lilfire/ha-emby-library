"""Polling of Emby sessions, shared by all subscribed cards of one entry."""

from __future__ import annotations

import asyncio
from collections.abc import Callable
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.storage import Store

from .const import (
    DOMAIN,
    POLL_INTERVAL_IDLE,
    POLL_INTERVAL_PLAYING,
    POLL_INTERVAL_UNAVAILABLE,
)
from .emby_client import EmbyAuthError, EmbyClient, EmbyError
from .models import ImageSigner, normalize_sessions

_LOGGER = logging.getLogger(__name__)

type JsonDict = dict[str, Any]
type SessionsListener = Callable[[JsonDict], None]


class SessionHub:
    """Polls ``GET /Sessions`` only while at least one card subscribes."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry[Any],
        client: EmbyClient,
        signer: ImageSigner,
    ) -> None:
        """Initialize the hub."""
        self._hass = hass
        self._entry = entry
        self._client = client
        self._signer = signer
        self._listeners: set[SessionsListener] = set()
        self._task: asyncio.Task[None] | None = None
        self._last_event: JsonDict | None = None
        self._clients: dict[str, JsonDict] = {}
        self._store: Store[list[JsonDict]] = Store(hass, 1, f"{DOMAIN}.clients.{entry.entry_id}")

    async def async_load_clients(self) -> None:
        """Restore previously observed video clients, not stale sessions."""
        clients = await self._store.async_load()
        self._clients = {client["device_id"]: client for client in clients or []}

    @property
    def is_polling(self) -> bool:
        """Return True while the poll loop runs."""
        return self._task is not None

    @property
    def session_count(self) -> int:
        """Return the number of sessions in the last poll."""
        return len(self._last_event["sessions"]) if self._last_event else 0

    @callback
    def subscribe(self, listener: SessionsListener) -> CALLBACK_TYPE:
        """Add a subscriber. The first one starts polling."""
        self._listeners.add(listener)
        if self._last_event is not None:
            listener(self._last_event)
        if self._task is None:
            self._task = self._entry.async_create_background_task(
                self._hass, self._poll_loop(), f"emby_library sessions {self._entry.entry_id}"
            )

        @callback
        def unsubscribe() -> None:
            self._listeners.discard(listener)
            if not self._listeners:
                self.stop()

        return unsubscribe

    @callback
    def stop(self) -> None:
        """Stop polling and forget the last state."""
        if self._task is not None:
            self._task.cancel()
            self._task = None
        self._last_event = None

    @callback
    def shutdown(self) -> None:
        """Stop polling and drop all subscribers (entry unload)."""
        self._listeners.clear()
        self.stop()

    async def async_fetch(self) -> list[JsonDict]:
        """Fetch and normalize the session list once."""
        raw = await self._client.sessions()
        sessions = normalize_sessions(raw, self._entry.entry_id, self._signer)
        changed = False
        for session in sessions:
            device_id = session["device_id"]
            if not session["controllable"] or not device_id:
                continue
            client = {
                "device_id": device_id,
                "name": session["device_name"],
                "client": session["client"],
            }
            if self._clients.get(device_id) != client:
                self._clients[device_id] = client
                changed = True
        if changed:
            self._store.async_delay_save(lambda: list(self._clients.values()), 1)
        return sessions

    async def async_find_session(self, session_id: str) -> JsonDict | None:
        """Find a session in the latest list, refreshing once if it is missing."""
        if self._last_event is not None and self._last_event["available"]:
            for session in self._last_event["sessions"]:
                if session["session_id"] == session_id:
                    return dict(session)
        for session in await self.async_fetch():
            if session["session_id"] == session_id:
                return session
        return None

    async def _poll_once(self) -> float:
        """Poll once, notify on change and return the next interval."""
        try:
            sessions = await self.async_fetch()
        except EmbyError as err:
            if isinstance(err, EmbyAuthError):
                self._entry.async_start_reauth(self._hass)
            _LOGGER.debug("Session poll failed: %s", err)
            event: JsonDict = {"available": False, "sessions": []}
            interval = POLL_INTERVAL_UNAVAILABLE
        else:
            event = {"available": True, "sessions": sessions}
            playing = any(s["now_playing"] is not None for s in sessions)
            interval = POLL_INTERVAL_PLAYING if playing else POLL_INTERVAL_IDLE

        event["clients"] = list(self._clients.values())

        if event != self._last_event:
            self._last_event = event
            for listener in list(self._listeners):
                listener(event)
        return interval

    async def _poll_loop(self) -> None:
        while True:
            try:
                interval = await self._poll_once()
            except Exception:
                _LOGGER.exception("Unexpected error while polling Emby sessions")
                interval = POLL_INTERVAL_UNAVAILABLE
            await asyncio.sleep(interval)
