"""Constants for the Emby Library integration."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "emby_library"

CONF_SERVER_ID: Final = "server_id"
CONF_SERVER_NAME: Final = "server_name"
CONF_USER_ID: Final = "user_id"
CONF_USER_NAME: Final = "user_name"
CONF_HIDDEN_VIEWS: Final = "hidden_views"

MIN_SERVER_VERSION: Final = (4, 8, 0)

REQUEST_TIMEOUT: Final = 15
VIEWS_CACHE_SECONDS: Final = 300
TICKS_PER_SECOND: Final = 10_000_000

STATIC_URL_PATH: Final = "/emby_library_static"
CARD_FILENAME: Final = "emby-library-card.js"

IMAGE_URL_PREFIX: Final = "/api/emby_library/image"
IMAGE_TYPES: Final = frozenset({"Primary", "Backdrop", "Thumb", "Logo", "Banner"})
IMAGE_WIDTHS: Final = frozenset({160, 240, 320, 480, 780, 1280, 1920})
IMAGE_WIDTH_POSTER: Final = 320
IMAGE_WIDTH_STILL: Final = 480
IMAGE_WIDTH_BACKDROP: Final = 1280
ID_PATTERN: Final = r"^[A-Za-z0-9-]{1,64}$"

POLL_INTERVAL_PLAYING: Final = 2.0
POLL_INTERVAL_IDLE: Final = 5.0
POLL_INTERVAL_UNAVAILABLE: Final = 15.0

# Parameters sent on every list call (spec chapter 5).
LIST_PARAMS: Final[dict[str, str]] = {
    "Fields": "PrimaryImageAspectRatio,ProductionYear",
    "EnableUserData": "true",
    "EnableImageTypes": "Primary,Backdrop,Thumb",
    "ImageTypeLimit": "1",
}

COLLECTION_TYPES: Final = ("movies", "tvshows", "boxsets")
COLLECTION_ITEM_TYPES: Final[dict[str, str]] = {
    "movies": "Movie",
    "tvshows": "Series",
    "boxsets": "BoxSet",
}

SORT_FIELDS: Final = (
    "SortName",
    "DateCreated",
    "PremiereDate",
    "CommunityRating",
    "DatePlayed",
)

SHELVES: Final = ("resume", "next_up", "latest", "suggestions")

# Card command -> Emby playstate command (POST /Sessions/{id}/Playing/{cmd}).
PLAYSTATE_COMMANDS: Final[dict[str, str]] = {
    "play": "Unpause",
    "pause": "Pause",
    "play_pause": "PlayPause",
    "stop": "Stop",
    "next": "NextTrack",
    "previous": "PreviousTrack",
    "seek": "Seek",
}
# Card command -> Emby general command (POST /Sessions/{id}/Command/{cmd}).
GENERAL_COMMANDS: Final[dict[str, str]] = {
    "set_volume": "SetVolume",
    "mute": "Mute",
    "unmute": "Unmute",
}

ERR_ENTRY_REQUIRED: Final = "entry_required"
ERR_ENTRY_NOT_FOUND: Final = "entry_not_found"
ERR_EMBY_UNREACHABLE: Final = "emby_unreachable"
ERR_EMBY_AUTH_FAILED: Final = "emby_auth_failed"
ERR_NOT_FOUND: Final = "not_found"
ERR_SESSION_NOT_FOUND: Final = "session_not_found"
ERR_NOT_CONTROLLABLE: Final = "not_controllable"
ERR_UNSUPPORTED_COMMAND: Final = "unsupported_command"
