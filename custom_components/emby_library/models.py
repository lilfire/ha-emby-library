"""Normalization of Emby DTOs into the DTOs sent to the card."""

from __future__ import annotations

import hashlib
import hmac
from typing import Any
from urllib.parse import parse_qs, urlencode, urlparse

from .const import (
    COLLECTION_TYPES,
    IMAGE_URL_PREFIX,
    IMAGE_WIDTH_BACKDROP,
    IMAGE_WIDTH_POSTER,
    IMAGE_WIDTH_STILL,
    TICKS_PER_SECOND,
)

type JsonDict = dict[str, Any]

ITEM_TYPES = frozenset({"Movie", "Series", "Season", "Episode", "BoxSet", "Folder", "Video"})
UNPLAYED_COUNT_TYPES = frozenset({"Series", "Season", "BoxSet"})


class ImageSigner:
    """Builds and verifies stable, signed image proxy URLs."""

    def __init__(self, secret: bytes) -> None:
        """Initialize with the in-memory secret."""
        self._secret = secret

    def signature(
        self, entry_id: str, item_id: str, image_type: str, index: int, tag: str, width: int
    ) -> str:
        """Return the first 32 hex characters of the HMAC-SHA256."""
        message = f"{entry_id}/{item_id}/{image_type}/{index}/{tag}/{width}"
        return hmac.new(self._secret, message.encode(), hashlib.sha256).hexdigest()[:32]

    def verify(
        self,
        entry_id: str,
        item_id: str,
        image_type: str,
        index: int,
        tag: str,
        width: int,
        signature: str,
    ) -> bool:
        """Verify a signature in constant time."""
        expected = self.signature(entry_id, item_id, image_type, index, tag, width)
        return hmac.compare_digest(expected.encode(), signature.encode())

    def url(
        self,
        entry_id: str,
        item_id: str | None,
        image_type: str,
        tag: str | None,
        width: int,
        index: int = 0,
    ) -> str | None:
        """Return a relative proxy URL, or None when the image does not exist."""
        if not item_id or not tag:
            return None
        item_id = str(item_id)
        query = urlencode(
            {
                "tag": tag,
                "w": width,
                "sig": self.signature(entry_id, item_id, image_type, index, tag, width),
            }
        )
        return f"{IMAGE_URL_PREFIX}/{entry_id}/{item_id}/{image_type}/{index}?{query}"


def ticks_to_seconds(ticks: Any) -> int | None:
    """Convert Emby ticks to whole seconds."""
    if not isinstance(ticks, (int, float)) or isinstance(ticks, bool):
        return None
    return int(ticks // TICKS_PER_SECOND)


def seconds_to_ticks(seconds: float) -> int:
    """Convert seconds to Emby ticks."""
    return int(seconds * TICKS_PER_SECOND)


def _str_or_none(value: Any) -> str | None:
    return str(value) if value not in (None, "") else None


def _int_or_none(value: Any) -> int | None:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    return int(value)


def _first(values: Any) -> str | None:
    if isinstance(values, list) and values:
        return _str_or_none(values[0])
    return None


def _item_type(raw: JsonDict) -> str:
    item_type = raw.get("Type")
    if item_type in ITEM_TYPES:
        return str(item_type)
    return "Folder" if raw.get("IsFolder") else "Video"


def _images(raw: JsonDict, item_type: str, entry_id: str, signer: ImageSigner) -> JsonDict:
    """Pick images according to the table in spec chapter 5."""
    item_id = _str_or_none(raw.get("Id"))
    tags = raw.get("ImageTags")
    tags = tags if isinstance(tags, dict) else {}
    primary = _str_or_none(tags.get("Primary"))
    series_id = _str_or_none(raw.get("SeriesId"))
    series_primary = _str_or_none(raw.get("SeriesPrimaryImageTag"))

    def url(owner: str | None, image_type: str, tag: str | None, width: int) -> str | None:
        return signer.url(entry_id, owner, image_type, tag, width)

    backdrop = url(
        item_id, "Backdrop", _first(raw.get("BackdropImageTags")), IMAGE_WIDTH_BACKDROP
    ) or url(
        _str_or_none(raw.get("ParentBackdropItemId")),
        "Backdrop",
        _first(raw.get("ParentBackdropImageTags")),
        IMAGE_WIDTH_BACKDROP,
    )

    parent_thumb = url(
        _str_or_none(raw.get("ParentThumbItemId")),
        "Thumb",
        _str_or_none(raw.get("ParentThumbImageTag")),
        IMAGE_WIDTH_STILL,
    )
    parent_backdrop_still = url(
        _str_or_none(raw.get("ParentBackdropItemId")),
        "Backdrop",
        _first(raw.get("ParentBackdropImageTags")),
        IMAGE_WIDTH_STILL,
    )

    if item_type == "Episode":
        poster = url(series_id, "Primary", series_primary, IMAGE_WIDTH_POSTER) or url(
            item_id, "Primary", primary, IMAGE_WIDTH_POSTER
        )
        still = (
            url(item_id, "Primary", primary, IMAGE_WIDTH_STILL)
            or parent_thumb
            or parent_backdrop_still
        )
    else:
        poster = url(item_id, "Primary", primary, IMAGE_WIDTH_POSTER)
        if poster is None and item_type == "Season":
            poster = url(series_id, "Primary", series_primary, IMAGE_WIDTH_POSTER)
        # Wide image for non-episodes in 16:9 rows (Continue watching).
        still = (
            url(item_id, "Thumb", _str_or_none(tags.get("Thumb")), IMAGE_WIDTH_STILL)
            or url(item_id, "Backdrop", _first(raw.get("BackdropImageTags")), IMAGE_WIDTH_STILL)
            or parent_thumb
            or parent_backdrop_still
        )

    return {"poster": poster, "still": still, "backdrop": backdrop}


def normalize_item(raw: JsonDict, entry_id: str, signer: ImageSigner) -> JsonDict:
    """Convert an Emby BaseItemDto to the card's Item."""
    item_type = _item_type(raw)
    user_data = raw.get("UserData")
    user_data = user_data if isinstance(user_data, dict) else {}

    runtime_s = ticks_to_seconds(raw.get("RunTimeTicks"))
    position_s = ticks_to_seconds(user_data.get("PlaybackPositionTicks")) or 0

    progress = 0.0
    percentage = user_data.get("PlayedPercentage")
    if isinstance(percentage, (int, float)) and not isinstance(percentage, bool):
        progress = float(percentage) / 100
    elif position_s and runtime_s:
        progress = position_s / runtime_s
    progress = round(min(1.0, max(0.0, progress)), 4)

    season_number: int | None = None
    episode_number: int | None = None
    if item_type == "Episode":
        season_number = _int_or_none(raw.get("ParentIndexNumber"))
        episode_number = _int_or_none(raw.get("IndexNumber"))
    elif item_type == "Season":
        season_number = _int_or_none(raw.get("IndexNumber"))

    unplayed_count: int | None = None
    if item_type in UNPLAYED_COUNT_TYPES:
        unplayed_count = _int_or_none(user_data.get("UnplayedItemCount"))

    return {
        "id": str(raw.get("Id", "")),
        "type": item_type,
        "name": str(raw.get("Name") or ""),
        "year": _int_or_none(raw.get("ProductionYear")),
        "runtime_s": runtime_s,
        "series_id": _str_or_none(raw.get("SeriesId")),
        "series_name": _str_or_none(raw.get("SeriesName")),
        "season_number": season_number,
        "episode_number": episode_number,
        "played": bool(user_data.get("Played", False)),
        "progress": progress,
        "position_s": position_s,
        "unplayed_count": unplayed_count,
        "is_folder": bool(raw.get("IsFolder", False)),
        "images": _images(raw, item_type, entry_id, signer),
    }


def normalize_items(
    raw_items: list[JsonDict], entry_id: str, signer: ImageSigner
) -> list[JsonDict]:
    """Normalize a list of items."""
    return [normalize_item(raw, entry_id, signer) for raw in raw_items]


def normalize_item_detail(raw: JsonDict, entry_id: str, signer: ImageSigner) -> JsonDict:
    """Convert an Emby BaseItemDto to the card's ItemDetail."""
    item = normalize_item(raw, entry_id, signer)
    genres = raw.get("Genres")
    rating = raw.get("CommunityRating")
    item.update(
        {
            "overview": _str_or_none(raw.get("Overview")),
            "genres": [str(g) for g in genres] if isinstance(genres, list) else [],
            "official_rating": _str_or_none(raw.get("OfficialRating")),
            "community_rating": (
                float(rating)
                if isinstance(rating, (int, float)) and not isinstance(rating, bool)
                else None
            ),
            "premiere_date": _str_or_none(raw.get("PremiereDate")),
            "trailers": _trailers(raw),
            "media_sources": _media_sources(raw),
            "season_count": (
                _int_or_none(raw.get("ChildCount")) if item["type"] == "Series" else None
            ),
        }
    )
    return item


def _trailers(raw: JsonDict) -> list[JsonDict]:
    """Expose only public YouTube embeds, never arbitrary media URLs."""
    trailers = []
    for trailer in raw.get("RemoteTrailers") or []:
        if not isinstance(trailer, dict):
            continue
        parsed = urlparse(str(trailer.get("Url") or ""))
        if parsed.scheme not in ("http", "https"):
            continue
        video_id = None
        if parsed.hostname in ("youtube.com", "www.youtube.com", "m.youtube.com"):
            video_ids = parse_qs(parsed.query).get("v")
            video_id = video_ids[0] if video_ids else None
            if parsed.path.startswith(("/embed/", "/shorts/")):
                video_id = parsed.path.split("/")[2]
        elif parsed.hostname == "youtu.be":
            video_id = parsed.path.strip("/")
        if (
            video_id
            and len(video_id) == 11
            and all(char.isascii() and (char.isalnum() or char in "-_") for char in video_id)
        ):
            trailers.append(
                {
                    "name": str(trailer.get("Name") or "Trailer"),
                    "embed_url": f"https://www.youtube-nocookie.com/embed/{video_id}",
                }
            )
    return trailers


def _media_sources(raw: JsonDict) -> list[JsonDict]:
    """Return technical metadata without paths or authenticated stream URLs."""
    sources = raw.get("MediaSources") or []
    if not sources and raw.get("MediaStreams"):
        sources = [raw]
    result = []
    for source in sources:
        if not isinstance(source, dict):
            continue
        videos = [
            stream
            for stream in source.get("MediaStreams") or []
            if isinstance(stream, dict) and stream.get("Type") == "Video"
        ]
        video = videos[0] if videos else {}
        result.append(
            {
                "width": _int_or_none(video.get("Width")),
                "height": _int_or_none(video.get("Height")),
                "video_codec": _str_or_none(video.get("Codec")),
                "video_range": _str_or_none(video.get("VideoRange")),
                "color_transfer": _str_or_none(video.get("ColorTransfer")),
                "size_bytes": _int_or_none(source.get("Size")),
                "container": _str_or_none(source.get("Container")),
            }
        )
    return result


def view_collection_type(raw: JsonDict) -> str | None:
    """Return the card's collection type, or None when the view is hidden in v1."""
    collection_type = raw.get("CollectionType")
    if not collection_type:
        return "mixed"
    if collection_type in COLLECTION_TYPES:
        return str(collection_type)
    return None


def normalize_view(raw: JsonDict, entry_id: str, signer: ImageSigner) -> JsonDict | None:
    """Convert an Emby view to the card's View, or None when it is not shown."""
    collection_type = view_collection_type(raw)
    if collection_type is None:
        return None
    tags = raw.get("ImageTags")
    tags = tags if isinstance(tags, dict) else {}
    view_id = str(raw.get("Id", ""))
    return {
        "id": view_id,
        "name": str(raw.get("Name") or ""),
        "collection_type": collection_type,
        "image": signer.url(
            entry_id, view_id, "Primary", _str_or_none(tags.get("Primary")), IMAGE_WIDTH_STILL
        ),
    }


def include_session(raw: JsonDict) -> bool:
    """Sessions are included when controllable or when something is playing."""
    return _supports_remote_control(raw) or isinstance(raw.get("NowPlayingItem"), dict)


def _supports_remote_control(raw: JsonDict) -> bool:
    # V6 fallback: without the field, a non-empty SupportedCommands counts.
    if "SupportsRemoteControl" in raw:
        return bool(raw["SupportsRemoteControl"])
    return bool(raw.get("SupportedCommands"))


def normalize_session(raw: JsonDict, entry_id: str, signer: ImageSigner) -> JsonDict:
    """Convert an Emby SessionInfo to the card's Session."""
    play_state = raw.get("PlayState")
    play_state = play_state if isinstance(play_state, dict) else {}
    now_playing_raw = raw.get("NowPlayingItem")
    now_playing_raw = now_playing_raw if isinstance(now_playing_raw, dict) else None

    remote = _supports_remote_control(raw)
    media_types = raw.get("PlayableMediaTypes")
    controllable = remote and isinstance(media_types, list) and "Video" in media_types

    can_seek = bool(play_state.get("CanSeek", False)) and now_playing_raw is not None
    emby_commands = raw.get("SupportedCommands")
    emby_commands = emby_commands if isinstance(emby_commands, list) else []

    supported: list[str] = []
    if remote:
        supported += ["play", "pause", "play_pause", "stop", "next", "previous"]
        if can_seek:
            supported.append("seek")
        if "SetVolume" in emby_commands:
            supported.append("set_volume")
        if "Mute" in emby_commands:
            supported.append("mute")
        if "Unmute" in emby_commands:
            supported.append("unmute")

    if now_playing_raw is None:
        state = "idle"
    elif play_state.get("IsPaused"):
        state = "paused"
    else:
        state = "playing"

    volume = _int_or_none(play_state.get("VolumeLevel"))
    return {
        "session_id": str(raw.get("Id", "")),
        "device_id": str(raw.get("DeviceId") or ""),
        "device_name": str(raw.get("DeviceName") or ""),
        "client": str(raw.get("Client") or ""),
        "user_name": _str_or_none(raw.get("UserName")),
        "controllable": controllable,
        "supported_commands": supported,
        "state": state,
        "now_playing": (
            normalize_item(now_playing_raw, entry_id, signer)
            if now_playing_raw is not None
            else None
        ),
        "position_s": (
            ticks_to_seconds(play_state.get("PositionTicks"))
            if now_playing_raw is not None
            else None
        ),
        "duration_s": (
            ticks_to_seconds(now_playing_raw.get("RunTimeTicks"))
            if now_playing_raw is not None
            else None
        ),
        "can_seek": can_seek,
        "volume": min(100, max(0, volume)) if volume is not None else None,
        "muted": bool(play_state.get("IsMuted", False)),
    }


def normalize_sessions(
    raw_sessions: list[JsonDict], entry_id: str, signer: ImageSigner
) -> list[JsonDict]:
    """Normalize and filter a list of sessions."""
    return [
        normalize_session(raw, entry_id, signer) for raw in raw_sessions if include_session(raw)
    ]
