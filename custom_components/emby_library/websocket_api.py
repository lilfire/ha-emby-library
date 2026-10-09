"""WebSocket commands used by the card (spec chapter 6)."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from functools import wraps
import secrets
from typing import TYPE_CHECKING, Any

from homeassistant.components.websocket_api import async_register_command
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.const import ERR_INVALID_FORMAT
from homeassistant.components.websocket_api.decorators import (
    async_response,
    websocket_command,
)
from homeassistant.components.websocket_api.messages import event_message
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from .const import (
    COLLECTION_ITEM_TYPES,
    CONF_HIDDEN_VIEWS,
    CONF_SERVER_NAME,
    CONF_USER_NAME,
    DOMAIN,
    ERR_EMBY_AUTH_FAILED,
    ERR_EMBY_UNREACHABLE,
    ERR_ENTRY_NOT_FOUND,
    ERR_ENTRY_REQUIRED,
    ERR_NOT_CONTROLLABLE,
    ERR_NOT_FOUND,
    ERR_SESSION_NOT_FOUND,
    ERR_UNSUPPORTED_COMMAND,
    GENERAL_COMMANDS,
    ID_PATTERN,
    PLAYSTATE_COMMANDS,
    SHELVES,
    SORT_FIELDS,
)
from .emby_client import (
    EmbyAuthError,
    EmbyConnectionError,
    EmbyNotFoundError,
)
from .models import (
    ImageSigner,
    normalize_item_detail,
    normalize_items,
    normalize_view,
    seconds_to_ticks,
    ticks_to_seconds,
)

if TYPE_CHECKING:
    from . import EmbyLibraryConfigEntry

type JsonDict = dict[str, Any]
type EntryHandler = Callable[
    [HomeAssistant, ActiveConnection, JsonDict, "EmbyLibraryConfigEntry"],
    Awaitable[None],
]

EMBY_ID = vol.All(cv.string, vol.Match(ID_PATTERN))
ENTRY_ID = vol.Optional("entry_id")

PLAYABLE_TYPES = ("Movie", "Episode", "Video")
VALUE_COMMANDS = ("seek", "set_volume")

FILTER_SCHEMA = {
    vol.Optional("filter"): vol.In(("unplayed", "played", "favorites")),
    vol.Optional("genre"): vol.All(cv.string, vol.Strip, vol.Length(min=1, max=100)),
    vol.Optional("year"): vol.All(int, vol.Range(min=1800, max=2200)),
    vol.Optional("max_runtime_minutes"): vol.All(int, vol.Range(min=1, max=1440)),
    vol.Optional("max_official_rating"): vol.All(cv.string, vol.Length(min=1, max=50)),
}


def _apply_filters(msg: JsonDict, params: dict[str, str | int]) -> None:
    """Translate validated filters to Emby parameters."""
    filters = {"unplayed": "IsUnplayed", "played": "IsPlayed", "favorites": "IsFavorite"}
    if msg.get("filter") in filters:
        params["Filters"] = filters[msg["filter"]]
    for key, parameter in (
        ("genre", "Genres"),
        ("year", "Years"),
        ("max_official_rating", "MaxOfficialRating"),
    ):
        if key in msg:
            params[parameter] = msg[key]


async def _all_items(entry: EmbyLibraryConfigEntry, params: dict[str, str | int]) -> list[JsonDict]:
    """Read all pages, including when totals are missing."""
    result: list[JsonDict] = []
    offset = 0
    while True:
        data = await entry.runtime_data.client.items({**params, "StartIndex": offset, "Limit": 200})
        page = data.get("Items", [])
        if not isinstance(page, list) or not page:
            break
        result.extend(item for item in page if isinstance(item, dict))
        offset += len(page)
        total = data.get("TotalRecordCount")
        if isinstance(total, int) and offset >= total:
            break
    return result


def _runtime_matches(raw: JsonDict, minutes: int) -> bool:
    runtime = ticks_to_seconds(raw.get("RunTimeTicks"))
    return runtime is not None and 0 < runtime <= minutes * 60


class CommandError(Exception):
    """An error that maps to one of the contract's error codes."""

    def __init__(self, code: str, message: str) -> None:
        """Initialize the error."""
        super().__init__(message)
        self.code = code
        self.message = message


@callback
def _loaded_entries(hass: HomeAssistant) -> list[EmbyLibraryConfigEntry]:
    return [
        entry
        for entry in hass.config_entries.async_entries(DOMAIN)
        if entry.state is ConfigEntryState.LOADED
    ]


@callback
def _resolve_entry(hass: HomeAssistant, msg: JsonDict) -> EmbyLibraryConfigEntry:
    entry_id = msg.get("entry_id")
    if entry_id is None:
        entries = hass.config_entries.async_entries(DOMAIN)
        if len(entries) != 1:
            raise CommandError(ERR_ENTRY_REQUIRED, "entry_id is required")
        entry: EmbyLibraryConfigEntry | None = entries[0]
    else:
        entry = hass.config_entries.async_get_entry(entry_id)
    if entry is None or entry.domain != DOMAIN or entry.state is not ConfigEntryState.LOADED:
        raise CommandError(ERR_ENTRY_NOT_FOUND, "Config entry not found or not loaded")
    return entry


def _signer(hass: HomeAssistant) -> ImageSigner:
    signer: ImageSigner = hass.data[DOMAIN]
    return signer


def with_entry(
    func: EntryHandler,
) -> Callable[[HomeAssistant, ActiveConnection, JsonDict], Awaitable[None]]:
    """Resolve the config entry and translate errors to contract error codes."""

    @wraps(func)
    async def wrapper(hass: HomeAssistant, connection: ActiveConnection, msg: JsonDict) -> None:
        entry: EmbyLibraryConfigEntry | None = None
        try:
            entry = _resolve_entry(hass, msg)
            await func(hass, connection, msg, entry)
        except CommandError as err:
            connection.send_error(msg["id"], err.code, err.message)
        except EmbyAuthError:
            if entry is not None:
                entry.async_start_reauth(hass)
            connection.send_error(msg["id"], ERR_EMBY_AUTH_FAILED, "Emby rejected the API key")
        except EmbyNotFoundError:
            connection.send_error(msg["id"], ERR_NOT_FOUND, "Item not found")
        except EmbyConnectionError:
            connection.send_error(msg["id"], ERR_EMBY_UNREACHABLE, "Cannot reach Emby")

    return wrapper


@websocket_command({vol.Required("type"): "emby_library/entries"})
@callback
def ws_entries(hass: HomeAssistant, connection: ActiveConnection, msg: JsonDict) -> None:
    """List loaded config entries."""
    connection.send_result(
        msg["id"],
        {
            "entries": [
                {
                    "entry_id": entry.entry_id,
                    "title": entry.title,
                    "server_name": entry.data.get(CONF_SERVER_NAME, ""),
                    "server_version": entry.runtime_data.server_version,
                    "user_name": entry.data.get(CONF_USER_NAME, ""),
                }
                for entry in _loaded_entries(hass)
            ]
        },
    )


async def _visible_views(entry: EmbyLibraryConfigEntry) -> list[JsonDict]:
    try:
        return await entry.runtime_data.client.views()
    except EmbyNotFoundError as err:
        # The Emby user has been deleted.
        raise EmbyAuthError("Emby user not found") from err


@websocket_command({vol.Required("type"): "emby_library/views", ENTRY_ID: str})
@async_response
@with_entry
async def ws_views(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: JsonDict,
    entry: EmbyLibraryConfigEntry,
) -> None:
    """List the libraries shown in the card."""
    hidden = set(entry.options.get(CONF_HIDDEN_VIEWS, []))
    signer = _signer(hass)
    views = [
        view
        for raw in await _visible_views(entry)
        if str(raw.get("Id")) not in hidden
        and (view := normalize_view(raw, entry.entry_id, signer)) is not None
    ]
    connection.send_result(msg["id"], {"views": views})


@websocket_command(
    {
        vol.Required("type"): "emby_library/shelf",
        ENTRY_ID: str,
        vol.Required("shelf"): vol.In(SHELVES),
        vol.Optional("limit", default=20): vol.All(int, vol.Range(min=1, max=50)),
    }
)
@async_response
@with_entry
async def ws_shelf(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: JsonDict,
    entry: EmbyLibraryConfigEntry,
) -> None:
    """Return one home row."""
    client = entry.runtime_data.client
    limit: int = msg["limit"]
    shelf: str = msg["shelf"]
    if shelf == "resume":
        raw = await client.resume(limit)
    elif shelf == "next_up":
        raw = await client.next_up(limit)
    elif shelf == "latest":
        raw = await client.latest(limit)
    else:
        try:
            raw = await client.suggestions(limit)
        except EmbyNotFoundError:
            # V1 fallback: servers without /Suggestions get an empty row.
            raw = []
    connection.send_result(
        msg["id"], {"items": normalize_items(raw, entry.entry_id, _signer(hass))}
    )


@websocket_command(
    {
        vol.Required("type"): "emby_library/items",
        ENTRY_ID: str,
        vol.Required("parent_id"): EMBY_ID,
        vol.Optional("sort_by", default="SortName"): vol.In(SORT_FIELDS),
        vol.Optional("sort_order", default="asc"): vol.In(("asc", "desc")),
        vol.Optional("start_index", default=0): vol.All(int, vol.Range(min=0)),
        vol.Optional("limit", default=60): vol.All(int, vol.Range(min=1, max=200)),
        **FILTER_SCHEMA,
    }
)
@async_response
@with_entry
async def ws_items(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: JsonDict,
    entry: EmbyLibraryConfigEntry,
) -> None:
    """Return one page of a library or folder."""
    client = entry.runtime_data.client
    parent_id: str = msg["parent_id"]
    params: dict[str, str | int] = {
        "ParentId": parent_id,
        "SortBy": msg["sort_by"],
        "SortOrder": "Ascending" if msg["sort_order"] == "asc" else "Descending",
        "StartIndex": msg["start_index"],
        "Limit": msg["limit"],
    }

    collection_type: str | None = None
    for view in await _visible_views(entry):
        if str(view.get("Id")) == parent_id:
            collection_type = view.get("CollectionType")
            break
    if (item_types := COLLECTION_ITEM_TYPES.get(collection_type or "")) is not None:
        params["IncludeItemTypes"] = item_types
        params["Recursive"] = "true"
    else:
        # Mixed libraries and folders are listed one level at a time.
        params["Recursive"] = "false"

    _apply_filters(msg, params)

    if "max_runtime_minutes" in msg:
        matching = [
            raw
            for raw in await _all_items(entry, params)
            if _runtime_matches(raw, msg["max_runtime_minutes"])
        ]
        start = msg["start_index"]
        connection.send_result(
            msg["id"],
            {
                "items": normalize_items(
                    matching[start : start + msg["limit"]], entry.entry_id, _signer(hass)
                ),
                "total": len(matching),
            },
        )
        return

    data = await client.items(params)
    raw_items = [i for i in data.get("Items", []) if isinstance(i, dict)]
    total = data.get("TotalRecordCount")
    connection.send_result(
        msg["id"],
        {
            "items": normalize_items(raw_items, entry.entry_id, _signer(hass)),
            "total": total if isinstance(total, int) else len(raw_items),
        },
    )


@websocket_command(
    {
        vol.Required("type"): "emby_library/random",
        ENTRY_ID: str,
        vol.Required("parent_id"): EMBY_ID,
        **FILTER_SCHEMA,
    }
)
@async_response
@with_entry
async def ws_random(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: JsonDict,
    entry: EmbyLibraryConfigEntry,
) -> None:
    """Choose from every matching movie, not only the first page."""
    params: dict[str, str | int] = {
        "ParentId": msg["parent_id"],
        "Recursive": "true",
        "IncludeItemTypes": "Movie",
        "SortBy": "SortName",
        "SortOrder": "Ascending",
    }
    _apply_filters(msg, params)
    candidates = await _all_items(entry, params)
    if "max_runtime_minutes" in msg:
        candidates = [
            raw for raw in candidates if _runtime_matches(raw, msg["max_runtime_minutes"])
        ]
    item = candidates[secrets.randbelow(len(candidates))] if candidates else None
    connection.send_result(
        msg["id"],
        {
            "item": normalize_item_detail(item, entry.entry_id, _signer(hass)) if item else None,
        },
    )


@websocket_command({vol.Required("type"): "emby_library/statistics", ENTRY_ID: str})
@async_response
@with_entry
async def ws_statistics(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: JsonDict,
    entry: EmbyLibraryConfigEntry,
) -> None:
    """Aggregate visible video libraries without double counting collections."""
    hidden = set(entry.options.get(CONF_HIDDEN_VIEWS, []))
    items: dict[str, JsonDict] = {}
    for view in await _visible_views(entry):
        if (
            str(view.get("Id")) in hidden
            or normalize_view(view, entry.entry_id, _signer(hass)) is None
        ):
            continue
        for raw in await _all_items(
            entry,
            {
                "ParentId": str(view["Id"]),
                "Recursive": "true",
                "IncludeItemTypes": "Movie,Series,Episode",
                "SortBy": "SortName",
            },
        ):
            items[str(raw["Id"])] = raw
    stats = {"movies": 0, "series": 0, "episodes": 0, "unplayed_episodes": 0, "runtime_s": 0}
    for raw in items.values():
        item_type = raw.get("Type")
        key = {"Movie": "movies", "Series": "series", "Episode": "episodes"}.get(item_type)
        if key:
            stats[key] += 1
        if item_type == "Episode" and not (raw.get("UserData") or {}).get("Played"):
            stats["unplayed_episodes"] += 1
        if item_type in ("Movie", "Episode"):
            stats["runtime_s"] += max(0, ticks_to_seconds(raw.get("RunTimeTicks")) or 0)
    connection.send_result(msg["id"], stats)


@websocket_command(
    {
        vol.Required("type"): "emby_library/set_played",
        ENTRY_ID: str,
        vol.Required("item_id"): EMBY_ID,
        vol.Required("played"): bool,
    }
)
@async_response
@with_entry
async def ws_set_played(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: JsonDict,
    entry: EmbyLibraryConfigEntry,
) -> None:
    """Mark a movie, episode or all episodes in a season/series."""
    client = entry.runtime_data.client
    raw = await client.item(msg["item_id"])
    if raw.get("Type") == "Series":
        targets = await client.episodes(msg["item_id"])
    elif raw.get("Type") == "Season" and raw.get("SeriesId"):
        targets = await client.episodes(str(raw["SeriesId"]), msg["item_id"])
    elif raw.get("Type") in PLAYABLE_TYPES:
        targets = [raw]
    else:
        raise CommandError(ERR_UNSUPPORTED_COMMAND, "Cannot change watched status for this item")
    for target in targets:
        await client.set_played(str(target["Id"]), msg["played"])
    connection.send_result(msg["id"], {})


@websocket_command(
    {
        vol.Required("type"): "emby_library/item",
        ENTRY_ID: str,
        vol.Required("item_id"): EMBY_ID,
    }
)
@async_response
@with_entry
async def ws_item(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: JsonDict,
    entry: EmbyLibraryConfigEntry,
) -> None:
    """Return one item with details."""
    raw = await entry.runtime_data.client.item(msg["item_id"])
    connection.send_result(
        msg["id"], {"item": normalize_item_detail(raw, entry.entry_id, _signer(hass))}
    )


@websocket_command(
    {
        vol.Required("type"): "emby_library/seasons",
        ENTRY_ID: str,
        vol.Required("series_id"): EMBY_ID,
    }
)
@async_response
@with_entry
async def ws_seasons(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: JsonDict,
    entry: EmbyLibraryConfigEntry,
) -> None:
    """Return the seasons of a series."""
    raw = await entry.runtime_data.client.seasons(msg["series_id"])
    connection.send_result(
        msg["id"], {"items": normalize_items(raw, entry.entry_id, _signer(hass))}
    )


@websocket_command(
    {
        vol.Required("type"): "emby_library/episodes",
        ENTRY_ID: str,
        vol.Required("series_id"): EMBY_ID,
        vol.Required("season_id"): EMBY_ID,
    }
)
@async_response
@with_entry
async def ws_episodes(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: JsonDict,
    entry: EmbyLibraryConfigEntry,
) -> None:
    """Return the episodes of a season."""
    raw = await entry.runtime_data.client.episodes(msg["series_id"], msg["season_id"])
    connection.send_result(
        msg["id"], {"items": normalize_items(raw, entry.entry_id, _signer(hass))}
    )


@websocket_command(
    {
        vol.Required("type"): "emby_library/search",
        ENTRY_ID: str,
        vol.Required("term"): vol.All(cv.string, vol.Strip, vol.Length(min=2, max=200)),
        vol.Optional("limit", default=60): vol.All(int, vol.Range(min=1, max=100)),
    }
)
@async_response
@with_entry
async def ws_search(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: JsonDict,
    entry: EmbyLibraryConfigEntry,
) -> None:
    """Search movies, series and episodes."""
    data = await entry.runtime_data.client.items(
        {
            "SearchTerm": msg["term"],
            "Recursive": "true",
            "IncludeItemTypes": "Movie,Series,Episode",
            "Limit": msg["limit"],
        }
    )
    raw_items = [i for i in data.get("Items", []) if isinstance(i, dict)]
    connection.send_result(
        msg["id"], {"items": normalize_items(raw_items, entry.entry_id, _signer(hass))}
    )


@websocket_command({vol.Required("type"): "emby_library/sessions/subscribe", ENTRY_ID: str})
@async_response
@with_entry
async def ws_sessions_subscribe(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: JsonDict,
    entry: EmbyLibraryConfigEntry,
) -> None:
    """Subscribe to session updates. Polling only runs while subscribed."""

    @callback
    def forward(event: JsonDict) -> None:
        connection.send_message(event_message(msg["id"], event))

    connection.send_result(msg["id"])
    connection.subscriptions[msg["id"]] = entry.runtime_data.hub.subscribe(forward)


async def _resolve_playable(entry: EmbyLibraryConfigEntry, item_id: str) -> JsonDict:
    """Apply play rules 1-5 and return the raw item that will be started."""
    client = entry.runtime_data.client
    raw = await client.item(item_id)
    item_type = raw.get("Type")

    if item_type == "Series":
        candidates = await client.next_up(1, series_id=item_id)
        if not candidates:
            candidates = await client.episodes(item_id)
        if not candidates:
            raise CommandError(ERR_NOT_FOUND, "The series has no episodes")
        return candidates[0]

    if item_type == "Season":
        series_id = raw.get("SeriesId")
        if not series_id:
            raise CommandError(ERR_NOT_FOUND, "The season has no series")
        episodes = await client.episodes(str(series_id), item_id)
        if not episodes:
            raise CommandError(ERR_NOT_FOUND, "The season has no episodes")
        for episode in episodes:
            user_data = episode.get("UserData")
            if not (isinstance(user_data, dict) and user_data.get("Played")):
                return episode
        return episodes[0]

    if item_type in ("BoxSet", "Folder") or raw.get("IsFolder"):
        raise CommandError(ERR_UNSUPPORTED_COMMAND, "This item cannot be played")
    if item_type in PLAYABLE_TYPES or raw.get("MediaType") == "Video":
        return raw
    raise CommandError(ERR_UNSUPPORTED_COMMAND, "This item cannot be played")


async def _require_session(entry: EmbyLibraryConfigEntry, session_id: str) -> JsonDict:
    session = await entry.runtime_data.hub.async_find_session(session_id)
    if session is None:
        raise CommandError(ERR_SESSION_NOT_FOUND, "The client is no longer connected")
    if not session["controllable"]:
        raise CommandError(ERR_NOT_CONTROLLABLE, "The client cannot be remote controlled")
    return session


@websocket_command(
    {
        vol.Required("type"): "emby_library/play",
        ENTRY_ID: str,
        vol.Required("session_id"): EMBY_ID,
        vol.Required("item_id"): EMBY_ID,
        vol.Required("mode"): vol.In(("resume", "start")),
    }
)
@async_response
@with_entry
async def ws_play(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: JsonDict,
    entry: EmbyLibraryConfigEntry,
) -> None:
    """Start playback on an Emby client."""
    target = await _resolve_playable(entry, msg["item_id"])
    target_id = str(target.get("Id", ""))

    start_ticks = 0
    if msg["mode"] == "resume":
        user_data = target.get("UserData")
        if isinstance(user_data, dict) and isinstance(
            ticks := user_data.get("PlaybackPositionTicks"), int
        ):
            start_ticks = max(0, ticks)

    await _require_session(entry, msg["session_id"])
    try:
        await entry.runtime_data.client.play(msg["session_id"], target_id, start_ticks)
    except EmbyNotFoundError as err:
        raise CommandError(ERR_SESSION_NOT_FOUND, "The client is no longer connected") from err
    connection.send_result(msg["id"], {"played_item_id": target_id})


@websocket_command(
    {
        vol.Required("type"): "emby_library/control",
        ENTRY_ID: str,
        vol.Required("session_id"): EMBY_ID,
        vol.Required("command"): vol.In((*PLAYSTATE_COMMANDS, *GENERAL_COMMANDS)),
        vol.Optional("value"): vol.All(vol.Coerce(float), vol.Range(min=0)),
    }
)
@async_response
@with_entry
async def ws_control(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: JsonDict,
    entry: EmbyLibraryConfigEntry,
) -> None:
    """Send a playback or volume command to an Emby client."""
    command: str = msg["command"]
    value: float | None = msg.get("value")
    if command in VALUE_COMMANDS and value is None:
        connection.send_error(msg["id"], ERR_INVALID_FORMAT, f"value is required for {command}")
        return
    if command == "set_volume" and value is not None and value > 100:
        connection.send_error(msg["id"], ERR_INVALID_FORMAT, "value must be 0-100")
        return

    session = await _require_session(entry, msg["session_id"])
    if command not in session["supported_commands"]:
        raise CommandError(ERR_UNSUPPORTED_COMMAND, "The client does not support this command")

    client = entry.runtime_data.client
    try:
        if command in PLAYSTATE_COMMANDS:
            await client.playstate_command(
                msg["session_id"],
                PLAYSTATE_COMMANDS[command],
                seconds_to_ticks(value) if command == "seek" and value is not None else None,
            )
        else:
            await client.general_command(
                msg["session_id"],
                GENERAL_COMMANDS[command],
                {"Volume": str(round(value))}
                if command == "set_volume" and value is not None
                else None,
            )
    except EmbyNotFoundError as err:
        raise CommandError(ERR_SESSION_NOT_FOUND, "The client is no longer connected") from err
    connection.send_result(msg["id"], {})


@callback
def async_register_commands(hass: HomeAssistant) -> None:
    """Register all emby_library/* commands."""
    for command in (
        ws_entries,
        ws_views,
        ws_shelf,
        ws_items,
        ws_random,
        ws_statistics,
        ws_set_played,
        ws_item,
        ws_seasons,
        ws_episodes,
        ws_search,
        ws_sessions_subscribe,
        ws_play,
        ws_control,
    ):
        async_register_command(hass, command)


__all__ = ["async_register_commands"]
