"""Emby Library: browse, search and remote control Emby from a dashboard card."""

from __future__ import annotations

from dataclasses import dataclass
import hashlib
import logging
from pathlib import Path
import secrets

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_API_KEY, CONF_URL, CONF_VERIFY_SSL
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed, ConfigEntryNotReady
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.typing import ConfigType
from homeassistant.loader import async_get_integration

from .const import CARD_FILENAME, CONF_USER_ID, DOMAIN, STATIC_URL_PATH
from .emby_client import EmbyAuthError, EmbyClient, EmbyError
from .image_proxy import EmbyImageView
from .models import ImageSigner
from .sessions import SessionHub
from .websocket_api import async_register_commands

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


@dataclass
class EmbyRuntimeData:
    """Runtime data stored on the config entry."""

    client: EmbyClient
    hub: SessionHub
    server_version: str


type EmbyLibraryConfigEntry = ConfigEntry[EmbyRuntimeData]


def _bundle_hash(path: Path) -> str | None:
    try:
        return hashlib.sha256(path.read_bytes()).hexdigest()[:8]
    except OSError:
        return None


CARD_URL_BASE = f"{STATIC_URL_PATH}/{CARD_FILENAME}"


def _card_resources(hass: HomeAssistant) -> ResourceStorageCollection | None:
    """Return the dashboard resource store, or None when resources live in YAML."""
    lovelace = hass.data.get("lovelace")
    resources = getattr(lovelace, "resources", None)
    if resources is None and isinstance(lovelace, dict):  # Home Assistant before 2025.2
        resources = lovelace.get("resources")
    return resources if isinstance(resources, ResourceStorageCollection) else None


def _is_card(item: dict[str, object]) -> bool:
    return str(item.get("url", "")).split("?", 1)[0] == CARD_URL_BASE


async def _async_register_card(hass: HomeAssistant, url: str) -> bool:
    """Keep exactly one dashboard resource pointing at the current card bundle.

    Dashboards wait for their resources before they draw cards, which an extra
    frontend module does not guarantee. Home Assistant has no public API for
    this, so every failure is reported as False and the caller falls back.
    """
    try:
        resources = _card_resources(hass)
        if resources is None:
            return False
        await resources.async_get_info()  # loads the store on first use
        existing = [item for item in resources.async_items() if _is_card(item)]
        if not existing:
            await resources.async_create_item({"res_type": "module", "url": url})
            return True
        first, *duplicates = existing
        if first.get("url") != url or first.get("type") != "module":
            await resources.async_update_item(first["id"], {"res_type": "module", "url": url})
        for item in duplicates:
            await resources.async_delete_item(item["id"])
    except Exception:
        _LOGGER.exception("Could not register the card as a dashboard resource")
        return False
    return True


async def _async_unregister_card(hass: HomeAssistant) -> None:
    """Remove the card's dashboard resource."""
    try:
        resources = _card_resources(hass)
        if resources is None:
            return
        await resources.async_get_info()
        for item in [item for item in resources.async_items() if _is_card(item)]:
            await resources.async_delete_item(item["id"])
    except Exception:
        _LOGGER.exception("Could not remove the card's dashboard resource")


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register the card, the WebSocket commands and the image proxy."""
    # The secret only lives in memory: image URLs are stable within one run of
    # Home Assistant and invalid after a restart.
    signer = ImageSigner(secrets.token_bytes(32))
    hass.data[DOMAIN] = signer

    frontend_dir = Path(__file__).parent / "frontend"
    await hass.http.async_register_static_paths(
        [StaticPathConfig(STATIC_URL_PATH, str(frontend_dir), cache_headers=False)]
    )
    integration = await async_get_integration(hass, DOMAIN)
    bundle_hash = await hass.async_add_executor_job(_bundle_hash, frontend_dir / CARD_FILENAME)
    if bundle_hash is None:
        _LOGGER.error("Card bundle %s is missing from the integration", CARD_FILENAME)
    else:
        card_url = f"{CARD_URL_BASE}?v={integration.version}-{bundle_hash}"

        if not await _async_register_card(hass, card_url):
            # YAML-managed resources, or the store could not be written.
            frontend.add_extra_js_url(hass, card_url)

    async_register_commands(hass)
    hass.http.register_view(EmbyImageView(signer))
    return True


async def async_setup_entry(hass: HomeAssistant, entry: EmbyLibraryConfigEntry) -> bool:
    """Set up one Emby user on one Emby server."""
    client = EmbyClient(
        async_get_clientsession(hass, verify_ssl=entry.data.get(CONF_VERIFY_SSL, True)),
        entry.data[CONF_URL],
        entry.data[CONF_API_KEY],
        entry.data[CONF_USER_ID],
    )
    try:
        info = await client.system_info()
    except EmbyAuthError as err:
        raise ConfigEntryAuthFailed("Emby rejected the API key") from err
    except EmbyError as err:
        raise ConfigEntryNotReady(str(err)) from err

    signer: ImageSigner = hass.data[DOMAIN]
    entry.runtime_data = EmbyRuntimeData(
        client=client,
        hub=SessionHub(hass, entry, client, signer),
        server_version=str(info.get("Version", "")),
    )
    return True


async def async_remove_entry(hass: HomeAssistant, entry: EmbyLibraryConfigEntry) -> None:
    """Remove the card resource together with the last Emby user."""
    if not hass.config_entries.async_entries(DOMAIN):
        await _async_unregister_card(hass)


async def async_unload_entry(hass: HomeAssistant, entry: EmbyLibraryConfigEntry) -> bool:
    """Unload a config entry."""
    entry.runtime_data.hub.shutdown()
    return True
