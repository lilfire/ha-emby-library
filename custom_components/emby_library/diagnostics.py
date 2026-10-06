"""Diagnostics for Emby Library, with credentials redacted."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.const import CONF_API_KEY, CONF_URL
from homeassistant.core import HomeAssistant

from .const import CONF_USER_ID
from .emby_client import EmbyError
from .models import view_collection_type

if TYPE_CHECKING:
    from . import EmbyLibraryConfigEntry

TO_REDACT = {CONF_API_KEY, CONF_URL, CONF_USER_ID}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: EmbyLibraryConfigEntry
) -> dict[str, Any]:
    """Return server version, library count and session count."""
    runtime = entry.runtime_data
    view_count: int | None
    session_count: int | None
    try:
        view_count = sum(1 for view in await runtime.client.views() if view_collection_type(view))
    except EmbyError:
        view_count = None
    try:
        session_count = len(await runtime.hub.async_fetch())
    except EmbyError:
        session_count = None

    return {
        "entry": {
            "data": async_redact_data(dict(entry.data), TO_REDACT),
            "options": dict(entry.options),
        },
        "server_version": runtime.server_version,
        "view_count": view_count,
        "session_count": session_count,
        "polling": runtime.hub.is_polling,
    }
