"""Tests for setup, unload and diagnostics."""

from __future__ import annotations

from unittest.mock import patch

from aioresponses import aioresponses
from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL
from homeassistant.components.lovelace.const import LOVELACE_DATA
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from custom_components.emby_library import _async_register_card, _async_unregister_card
from custom_components.emby_library.const import DOMAIN
from custom_components.emby_library.diagnostics import async_get_config_entry_diagnostics

from .conftest import API_KEY, BASE, SYSTEM_INFO, USER_ID, VIEWS, calls, url


def _card_urls(hass: HomeAssistant) -> list[str]:
    items = hass.data[LOVELACE_DATA].resources.async_items()
    return [i["url"] for i in items if i["url"].startswith("/emby_library_static/")]


async def test_setup_registers_card_and_unloads(
    hass: HomeAssistant, loaded_entry: MockConfigEntry, emby: aioresponses
) -> None:
    """The card is registered as a dashboard resource and the entry loads."""
    assert loaded_entry.state is ConfigEntryState.LOADED
    assert loaded_entry.runtime_data.server_version == "4.9.1.80"

    card = _card_urls(hass)
    assert len(card) == 1
    integration = await async_get_integration(hass, DOMAIN)
    assert card[0].startswith(f"/emby_library_static/emby-library-card.js?v={integration.version}-")
    resource = hass.data[LOVELACE_DATA].resources.async_items()[0]
    assert resource["type"] == "module"
    extra = hass.data.get(DATA_EXTRA_MODULE_URL)
    assert not extra or not [u for u in extra.urls if "emby_library" in u]

    request = calls(emby, "GET", "/System/Info")[0]
    assert request.kwargs["headers"]["X-Emby-Token"] == API_KEY
    assert not request.kwargs.get("params")

    assert await hass.config_entries.async_unload(loaded_entry.entry_id)
    assert loaded_entry.state is ConfigEntryState.NOT_LOADED


async def test_card_bundle_is_served(
    hass: HomeAssistant, hass_client_no_auth: ClientSessionGenerator, loaded_entry: MockConfigEntry
) -> None:
    """The registered resource URL serves the bundle."""
    client = await hass_client_no_auth()
    response = await client.get(_card_urls(hass)[0])
    assert response.status == 200
    assert "emby-library-card" in await response.text()


async def test_stale_and_duplicate_resources_are_replaced(hass: HomeAssistant) -> None:
    """An old ?v= is updated in place and duplicates are removed."""
    assert await async_setup_component(hass, "lovelace", {})
    resources = hass.data[LOVELACE_DATA].resources
    await resources.async_get_info()
    old = await resources.async_create_item(
        {"res_type": "js", "url": "/emby_library_static/emby-library-card.js?v=0.0.1-old"}
    )
    await resources.async_create_item(
        {"res_type": "module", "url": "/emby_library_static/emby-library-card.js"}
    )
    await resources.async_create_item({"res_type": "module", "url": "/local/other-card.js"})

    assert await _async_register_card(hass, "/emby_library_static/emby-library-card.js?v=new")
    assert await _async_register_card(hass, "/emby_library_static/emby-library-card.js?v=new")

    items = resources.async_items()
    assert [i["url"] for i in items] == [
        "/emby_library_static/emby-library-card.js?v=new",
        "/local/other-card.js",
    ]
    assert items[0]["id"] == old["id"]
    assert items[0]["type"] == "module"


async def test_yaml_resources_fall_back_to_extra_module(
    hass: HomeAssistant, config_entry: MockConfigEntry, emby: aioresponses
) -> None:
    """With resources in YAML the card is loaded as an extra frontend module."""
    assert await async_setup_component(hass, "lovelace", {"lovelace": {"resource_mode": "yaml"}})
    emby.get(url("/System/Info"), payload=SYSTEM_INFO)
    assert await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()

    modules = hass.data[DATA_EXTRA_MODULE_URL].urls
    assert len([u for u in modules if u.startswith("/emby_library_static/")]) == 1
    await hass.config_entries.async_remove(config_entry.entry_id)


async def test_failing_resource_store_falls_back(hass: HomeAssistant) -> None:
    """A store that cannot be written never breaks setup."""
    assert await async_setup_component(hass, "lovelace", {})
    resources = hass.data[LOVELACE_DATA].resources
    with patch.object(resources, "async_create_item", side_effect=RuntimeError("boom")):
        assert not await _async_register_card(hass, "/emby_library_static/emby-library-card.js")
    with patch.object(resources, "async_get_info", side_effect=RuntimeError("boom")):
        await _async_unregister_card(hass)


async def test_removing_the_last_entry_removes_the_resource(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    """The dashboard resource disappears with the last Emby user."""
    assert len(_card_urls(hass)) == 1
    await hass.config_entries.async_remove(loaded_entry.entry_id)
    await hass.async_block_till_done()
    assert _card_urls(hass) == []


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
