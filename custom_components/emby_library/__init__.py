"""Emby Library: browse, search and remote control Emby from a dashboard card."""

from __future__ import annotations

from dataclasses import dataclass
import hashlib
import logging
from pathlib import Path
import secrets

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
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
        frontend.add_extra_js_url(
            hass,
            f"{STATIC_URL_PATH}/{CARD_FILENAME}?v={integration.version}-{bundle_hash}",
        )

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


async def async_unload_entry(hass: HomeAssistant, entry: EmbyLibraryConfigEntry) -> bool:
    """Unload a config entry."""
    entry.runtime_data.hub.shutdown()
    return True
