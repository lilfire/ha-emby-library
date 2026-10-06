"""Tests for normalization with saved Emby examples."""

from __future__ import annotations

from typing import Any
from urllib.parse import parse_qs, urlsplit

from custom_components.emby_library.emby_client import normalize_url, parse_version
from custom_components.emby_library.models import (
    ImageSigner,
    normalize_item,
    normalize_item_detail,
    normalize_session,
    normalize_sessions,
    normalize_view,
    seconds_to_ticks,
    ticks_to_seconds,
)

SIGNER = ImageSigner(b"0" * 32)
ENTRY = "entry1"


def image(url: str | None) -> tuple[str, str, int]:
    """Return (item_id, image_type, width) from a proxy URL and check its signature."""
    assert url is not None
    parts = urlsplit(url)
    prefix, entry_id, item_id, image_type, index = parts.path.rsplit("/", 4)
    assert prefix == "/api/emby_library/image"
    query = parse_qs(parts.query)
    width = int(query["w"][0])
    assert SIGNER.verify(
        entry_id, item_id, image_type, int(index), query["tag"][0], width, query["sig"][0]
    )
    return item_id, image_type, width


def test_ticks() -> None:
    """Ticks convert to whole seconds and back."""
    assert ticks_to_seconds(69_600_000_000) == 6960
    assert ticks_to_seconds(None) is None
    assert ticks_to_seconds(True) is None
    assert seconds_to_ticks(90) == 900_000_000
    assert seconds_to_ticks(1.5) == 15_000_000


def test_normalize_url_and_version() -> None:
    """Addresses and versions are parsed."""
    assert normalize_url(" http://emby:8096/ ") == "http://emby:8096"
    assert normalize_url("http://emby:8096/emby/") == "http://emby:8096"
    assert normalize_url("https://x.org/media/EMBY") == "https://x.org/media"
    assert parse_version("4.8.11.0") == (4, 8, 11, 0)
    assert parse_version("4.9.0.5-beta") == (4, 9, 0, 5)
    assert parse_version(None) == ()
    assert parse_version("abc") == ()


def test_movie(items: dict[str, Any]) -> None:
    """A movie in progress."""
    item = normalize_item(items["movie"], ENTRY, SIGNER)
    assert item["id"] == "101"
    assert item["type"] == "Movie"
    assert item["name"] == "Arrival"
    assert item["year"] == 2016
    assert item["runtime_s"] == 6960
    assert item["position_s"] == 1740
    assert item["progress"] == 0.25
    assert item["played"] is False
    assert item["unplayed_count"] is None
    assert item["is_folder"] is False
    assert item["series_id"] is None
    assert item["season_number"] is None
    assert image(item["images"]["poster"]) == ("101", "Primary", 320)
    assert image(item["images"]["still"]) == ("101", "Thumb", 480)
    assert image(item["images"]["backdrop"]) == ("101", "Backdrop", 1280)


def test_movie_detail(items: dict[str, Any]) -> None:
    """Detail fields of a movie."""
    item = normalize_item_detail(items["movie"], ENTRY, SIGNER)
    assert item["overview"] == "A linguist works with the military."
    assert item["genres"] == ["Drama", "Science Fiction"]
    assert item["official_rating"] == "PG-13"
    assert item["community_rating"] == 7.9
    assert item["premiere_date"] == "2016-11-11T00:00:00.0000000Z"
    assert item["season_count"] is None


def test_series(items: dict[str, Any]) -> None:
    """A series has unplayed count and season count."""
    item = normalize_item_detail(items["series"], ENTRY, SIGNER)
    assert item["type"] == "Series"
    assert item["unplayed_count"] == 7
    assert item["season_count"] == 2
    assert item["is_folder"] is True
    assert item["runtime_s"] is None
    assert item["progress"] == 0


def test_season(items: dict[str, Any]) -> None:
    """A season falls back to the series poster and backdrop."""
    item = normalize_item(items["season"], ENTRY, SIGNER)
    assert item["type"] == "Season"
    assert item["season_number"] == 1
    assert item["episode_number"] is None
    assert item["unplayed_count"] == 3
    assert image(item["images"]["poster"]) == ("200", "Primary", 320)
    assert image(item["images"]["backdrop"]) == ("200", "Backdrop", 1280)


def test_episode(items: dict[str, Any]) -> None:
    """An episode uses the series poster and its own still."""
    item = normalize_item(items["episode"], ENTRY, SIGNER)
    assert item["type"] == "Episode"
    assert item["series_id"] == "200"
    assert item["series_name"] == "Severance"
    assert (item["season_number"], item["episode_number"]) == (1, 1)
    assert item["played"] is True
    assert image(item["images"]["poster"]) == ("200", "Primary", 320)
    assert image(item["images"]["still"]) == ("211", "Primary", 480)
    assert image(item["images"]["backdrop"]) == ("200", "Backdrop", 1280)


def test_episode_without_own_image(items: dict[str, Any]) -> None:
    """Without a still, the parent thumb is used. Progress comes from position."""
    item = normalize_item(items["episode2"], ENTRY, SIGNER)
    assert image(item["images"]["still"]) == ("200", "Thumb", 480)
    assert item["position_s"] == 600
    assert item["progress"] == 0.2

    raw = dict(items["episode2"])
    del raw["ParentThumbImageTag"]
    item = normalize_item(raw, ENTRY, SIGNER)
    assert image(item["images"]["still"]) == ("200", "Backdrop", 480)

    raw = {**items["episode"], "SeriesPrimaryImageTag": None}
    item = normalize_item(raw, ENTRY, SIGNER)
    assert image(item["images"]["poster"]) == ("211", "Primary", 320)


def test_special_without_numbers(items: dict[str, Any]) -> None:
    """A special has no season or episode number."""
    item = normalize_item(items["special"], ENTRY, SIGNER)
    assert item["season_number"] is None
    assert item["episode_number"] is None
    assert item["runtime_s"] is None
    assert item["year"] is None


def test_item_without_images(items: dict[str, Any]) -> None:
    """Missing images give null, never a broken address."""
    item = normalize_item_detail(items["no_images"], ENTRY, SIGNER)
    assert item["images"] == {"poster": None, "still": None, "backdrop": None}
    assert item["overview"] is None
    assert item["genres"] == []
    assert item["community_rating"] is None


def test_other_types(items: dict[str, Any]) -> None:
    """Unknown types map to Folder or Video."""
    assert normalize_item(items["folder"], ENTRY, SIGNER)["type"] == "Folder"
    assert normalize_item(items["boxset"], ENTRY, SIGNER)["unplayed_count"] == 2
    trailer = {"Id": "9", "Name": "T", "Type": "Trailer"}
    assert normalize_item(trailer, ENTRY, SIGNER)["type"] == "Video"
    # Progress is clamped.
    weird = {"Id": "9", "Type": "Movie", "UserData": {"PlayedPercentage": 140}}
    assert normalize_item(weird, ENTRY, SIGNER)["progress"] == 1


def test_views() -> None:
    """Only movies, tvshows, boxsets and mixed libraries are shown."""
    movies = normalize_view(
        {"Id": "v1", "Name": "Movies", "CollectionType": "movies", "ImageTags": {"Primary": "t"}},
        ENTRY,
        SIGNER,
    )
    assert movies is not None
    assert movies["collection_type"] == "movies"
    assert image(movies["image"]) == ("v1", "Primary", 480)
    mixed = normalize_view({"Id": "v2", "Name": "Mixed"}, ENTRY, SIGNER)
    assert mixed is not None
    assert mixed["collection_type"] == "mixed"
    assert mixed["image"] is None
    assert normalize_view({"Id": "v3", "CollectionType": "music"}, ENTRY, SIGNER) is None


def test_sessions(raw_sessions: list[dict[str, Any]]) -> None:
    """Sessions are filtered and normalized."""
    sessions = normalize_sessions(raw_sessions, ENTRY, SIGNER)
    assert [s["session_id"] for s in sessions] == ["sess-tv", "sess-web", "sess-audio"]
    tv, web, audio = sessions

    assert tv["controllable"] is True
    assert tv["state"] == "idle"
    assert tv["now_playing"] is None
    assert tv["position_s"] is None
    assert tv["duration_s"] is None
    assert tv["can_seek"] is False
    assert tv["volume"] is None
    assert tv["supported_commands"] == [
        "play", "pause", "play_pause", "stop", "next", "previous",
        "set_volume", "mute", "unmute",
    ]  # fmt: skip

    assert web["state"] == "paused"
    assert web["now_playing"]["id"] == "212"
    assert web["position_s"] == 600
    assert web["duration_s"] == 3000
    assert web["can_seek"] is True
    assert web["volume"] == 80
    assert web["muted"] is True
    assert "seek" in web["supported_commands"]
    assert "mute" not in web["supported_commands"]
    assert web["device_name"] == "Chrome"
    assert web["client"] == "Emby Web"
    assert web["user_name"] == "thomas"

    # Remote control without video is listed but not a play target.
    assert audio["controllable"] is False
    assert audio["user_name"] is None


def test_session_playing_and_v6_fallback() -> None:
    """Playing state, and the fallback when SupportsRemoteControl is missing."""
    raw = {
        "Id": "s",
        "PlayableMediaTypes": ["Video"],
        "SupportedCommands": ["SetVolume"],
        "PlayState": {"IsPaused": False, "VolumeLevel": 140},
        "NowPlayingItem": {"Id": "1", "Type": "Movie", "RunTimeTicks": 10_000_000},
    }
    session = normalize_session(raw, ENTRY, SIGNER)
    assert session["state"] == "playing"
    assert session["controllable"] is True
    assert session["volume"] == 100
    assert normalize_sessions([{"Id": "x", "SupportedCommands": []}], ENTRY, SIGNER) == []
