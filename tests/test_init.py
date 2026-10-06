"""Tests for setup, unload and diagnostics."""

from __future__ import annotations

from aioresponses import aioresponses
from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from custom_components.emby_library.const import DOMAIN
from custom_components.emby_library.diagnostics import async_get_config_entry_diagnostics

from .conftest import API_KEY, BASE, USER_ID, VIEWS, calls, url


async def test_setup_registers_card_and_unloads(
    hass: HomeAssistant, loaded_entry: MockConfigEntry, emby: aioresponses
) -> None:
    """The card is registered as an extra module and the entry loads."""
    assert loaded_entry.state is ConfigEntryState.LOADED
    assert loaded_entry.runtime_data.server_version == "4.9.1.80"

    modules = hass.data[DATA_EXTRA_MODULE_URL].urls
    card = [u for u in modules if u.startswith("/emby_library_static/emby-library-card.js?v=")]
    assert len(card) == 1
    assert card[0].split("?v=")[1].startswith("0.1.0-")

    request = calls(emby, "GET", "/System/Info")[0]
    assert request.kwargs["headers"]["X-Emby-Token"] == API_KEY
    assert not request.kwargs.get("params")

    assert await hass.config_entries.async_unload(loaded_entry.entry_id)
    assert loaded_entry.state is ConfigEntryState.NOT_LOADED


async def test_card_bundle_is_served(
    hass: HomeAssistant, hass_client_no_auth: ClientSessionGenerator, loaded_entry: MockConfigEntry
) -> None:
    """The registered module URL serves the bundle."""
    modules = hass.data[DATA_EXTRA_MODULE_URL].urls
    address = next(u for u in modules if u.startswith("/emby_library_static/"))
    client = await hass_client_no_auth()
    response = await client.get(address)
    assert response.status == 200
    assert "emby-library-card" in await response.text()


async def test_setup_retries_when_emby_is_down(
    hass: HomeAssistant, config_entry: MockConfigEntry, emby: aioresponses
) -> None:
    """Connection problems give ConfigEntryNotReady."""
    emby.get(url("/System/Info"), status=503)
    assert not await hass.config_entries.async_setup(config_entry.entry_id)
    assert config_entry.state is ConfigEntryState.SETUP_RETRY


async def test_setup_starts_reauth_on_401(
    hass: HomeAssistant, config_entry: MockConfigEntry, emby: aioresponses
) -> None:
    """A rejected API key starts reauth."""
    emby.get(url("/System/Info"), status=401)
    assert not await hass.config_entries.async_setup(config_entry.entry_id)
    assert config_entry.state is ConfigEntryState.SETUP_ERROR
    flows = hass.config_entries.flow.async_progress_by_handler(DOMAIN)
    assert [flow["context"]["source"] for flow in flows] == ["reauth"]


async def test_diagnostics_are_redacted(
    hass: HomeAssistant, loaded_entry: MockConfigEntry, emby: aioresponses
) -> None:
    """Diagnostics contain counts but no credentials."""
    emby.get(url(f"/Users/{USER_ID}/Views"), payload=VIEWS)
    emby.get(url("/Sessions"), payload=[{"Id": "s1", "SupportsRemoteControl": True}])
    result = await async_get_config_entry_diagnostics(hass, loaded_entry)
    assert result["server_version"] == "4.9.1.80"
    assert result["view_count"] == 4
    assert result["session_count"] == 1
    dumped = str(result)
    assert API_KEY not in dumped
    assert BASE not in dumped
    assert result["entry"]["data"]["user_id"] == "**REDACTED**"


async def test_diagnostics_when_emby_is_down(
    hass: HomeAssistant, loaded_entry: MockConfigEntry, emby: aioresponses
) -> None:
    """Diagnostics still work when Emby does not answer."""
    emby.get(url(f"/Users/{USER_ID}/Views"), status=500)
    emby.get(url("/Sessions"), status=500)
    result = await async_get_config_entry_diagnostics(hass, loaded_entry)
    assert result["view_count"] is None
    assert result["session_count"] is None
