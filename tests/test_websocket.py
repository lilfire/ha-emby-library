"""Tests for the emby_library/* WebSocket commands."""

from __future__ import annotations

from typing import Any

from aioresponses import aioresponses
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from custom_components.emby_library.const import DOMAIN

from .conftest import API_KEY, BASE, ENTRY_DATA, SYSTEM_INFO, USER_ID, VIEWS, calls, url

U = f"/Users/{USER_ID}"


async def call(ws: Any, name: str, /, **kwargs: Any) -> dict[str, Any]:
    """Send a command and return the raw response."""
    await ws.send_json_auto_id({"type": f"emby_library/{name}", **kwargs})
    response: dict[str, Any] = await ws.receive_json()
    return response


async def ok(ws: Any, name: str, /, **kwargs: Any) -> dict[str, Any]:
    """Send a command that must succeed and return its result."""
    response = await call(ws, name, **kwargs)
    assert response["success"], response
    result: dict[str, Any] = response["result"]
    return result


async def err(ws: Any, name: str, /, **kwargs: Any) -> str:
    """Send a command that must fail and return the error code."""
    response = await call(ws, name, **kwargs)
    assert not response["success"], response
    code: str = response["error"]["code"]
    return code


def params(emby: aioresponses, path: str, method: str = "GET", index: int = -1) -> dict[str, Any]:
    """Return the query parameters of a recorded call."""
    result: dict[str, Any] = calls(emby, method, path)[index].kwargs["params"]
    return result


async def test_entries(
    hass: HomeAssistant, hass_ws_client: WebSocketGenerator, loaded_entry: MockConfigEntry
) -> None:
    """Entries are listed without credentials."""
    ws = await hass_ws_client(hass)
    response = await call(ws, "entries")
    assert response["result"] == {
        "entries": [
            {
                "entry_id": loaded_entry.entry_id,
                "title": "Home (thomas)",
                "server_name": "Home",
                "server_version": "4.9.1.80",
                "user_name": "thomas",
            }
        ]
    }
    assert API_KEY not in str(response)
    assert BASE not in str(response)


async def test_entries_empty(hass: HomeAssistant, hass_ws_client: WebSocketGenerator) -> None:
    """Without config entries the list is empty."""
    assert await async_setup_component(hass, DOMAIN, {})
    ws = await hass_ws_client(hass)
    assert await ok(ws, "entries") == {"entries": []}
    assert await err(ws, "views") == "entry_required"


async def test_entry_resolution(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
) -> None:
    """entry_id is optional with exactly one entry and required with two."""
    emby.get(url(f"{U}/Views"), payload=VIEWS, repeat=True)
    ws = await hass_ws_client(hass)
    assert len((await ok(ws, "views"))["views"]) == 4
    assert await err(ws, "views", entry_id="nope") == "entry_not_found"

    second = MockConfigEntry(
        domain=DOMAIN,
        data={**ENTRY_DATA, "user_id": "u2", "user_name": "guest"},
        unique_id="srv1:u2",
    )
    second.add_to_hass(hass)
    assert await err(ws, "views") == "entry_required"
    # Not loaded counts as not found.
    assert await err(ws, "views", entry_id=second.entry_id) == "entry_not_found"

    emby.get(url("/System/Info"), payload=SYSTEM_INFO)
    emby.get(url("/Users/u2/Views"), payload={"Items": [VIEWS["Items"][0]]})
    assert await hass.config_entries.async_setup(second.entry_id)
    assert len((await ok(ws, "views", entry_id=second.entry_id))["views"]) == 1
    assert len((await ok(ws, "views", entry_id=loaded_entry.entry_id))["views"]) == 4
    assert len((await ok(ws, "entries"))["entries"]) == 2


async def test_views(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
) -> None:
    """Views are filtered, cached and can be hidden."""
    emby.get(url(f"{U}/Views"), payload=VIEWS)
    ws = await hass_ws_client(hass)
    views = (await ok(ws, "views"))["views"]
    assert [(v["id"], v["collection_type"]) for v in views] == [
        ("v-movies", "movies"),
        ("v-tv", "tvshows"),
        ("v-sets", "boxsets"),
        ("v-mixed", "mixed"),
    ]
    assert views[0]["image"].startswith(
        f"/api/emby_library/image/{loaded_entry.entry_id}/v-movies/Primary/0?"
    )
    assert views[1]["image"] is None

    hass.config_entries.async_update_entry(loaded_entry, options={"hidden_views": ["v-tv"]})
    views = (await ok(ws, "views"))["views"]
    assert "v-tv" not in [v["id"] for v in views]
    # Only one call: the list is cached for 300 seconds.
    assert len(calls(emby, "GET", f"{U}/Views")) == 1


async def test_views_user_deleted(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
) -> None:
    """A 404 on views means the Emby user is gone."""
    emby.get(url(f"{U}/Views"), status=404)
    ws = await hass_ws_client(hass)
    assert await err(ws, "views") == "emby_auth_failed"


@pytest.mark.parametrize(
    ("shelf", "path", "wrapped", "expected"),
    [
        ("resume", f"{U}/Items/Resume", True, {"MediaTypes": "Video", "Recursive": "true"}),
        ("next_up", "/Shows/NextUp", True, {"UserId": USER_ID}),
        (
            "latest",
            f"{U}/Items/Latest",
            False,
            {"IncludeItemTypes": "Movie,Episode", "GroupItems": "true"},
        ),
        ("suggestions", f"{U}/Suggestions", True, {"Type": "Movie,Series"}),
    ],
)
async def test_shelf(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    items: dict[str, Any],
    shelf: str,
    path: str,
    wrapped: bool,
    expected: dict[str, str],
) -> None:
    """Each shelf calls its endpoint with the fixed list parameters."""
    raw = [items["movie"], items["episode"]]
    emby.get(url(path), payload={"Items": raw, "TotalRecordCount": 2} if wrapped else raw)
    ws = await hass_ws_client(hass)
    result = await ok(ws, "shelf", shelf=shelf, limit=7)
    assert [i["id"] for i in result["items"]] == ["101", "211"]
    sent = params(emby, path)
    assert sent["Limit"] == 7
    assert sent["Fields"] == "PrimaryImageAspectRatio,ProductionYear"
    assert sent["EnableUserData"] == "true"
    assert sent["EnableImageTypes"] == "Primary,Backdrop,Thumb"
    assert sent["ImageTypeLimit"] == "1"
    for key, value in expected.items():
        assert sent[key] == value


async def test_shelf_validation_and_fallback(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
) -> None:
    """Invalid input is rejected; a missing /Suggestions gives an empty row."""
    ws = await hass_ws_client(hass)
    assert await err(ws, "shelf", shelf="music") == "invalid_format"
    assert await err(ws, "shelf", shelf="resume", limit=51) == "invalid_format"
    emby.get(url(f"{U}/Suggestions"), status=404)
    assert await ok(ws, "shelf", shelf="suggestions") == {"items": []}
    assert params(emby, f"{U}/Suggestions")["Limit"] == 20


@pytest.mark.parametrize(
    ("parent", "types", "recursive"),
    [
        ("v-movies", "Movie", "true"),
        ("v-tv", "Series", "true"),
        ("v-sets", "BoxSet", "true"),
        ("v-mixed", None, "false"),
        ("400", None, "false"),
    ],
)
async def test_items_by_library_type(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    items: dict[str, Any],
    parent: str,
    types: str | None,
    recursive: str,
) -> None:
    """Listing depends on the library type."""
    emby.get(url(f"{U}/Views"), payload=VIEWS)
    emby.get(url(f"{U}/Items"), payload={"Items": [items["movie"]], "TotalRecordCount": 1234})
    ws = await hass_ws_client(hass)
    result = await ok(ws, "items", parent_id=parent)
    assert result["total"] == 1234
    assert result["items"][0]["id"] == "101"
    sent = params(emby, f"{U}/Items")
    assert sent["ParentId"] == parent
    assert sent.get("IncludeItemTypes") == types
    assert sent["Recursive"] == recursive
    assert sent["SortBy"] == "SortName"
    assert sent["SortOrder"] == "Ascending"
    assert sent["StartIndex"] == 0
    assert sent["Limit"] == 60
    assert "Filters" not in sent
    assert sent["Fields"] == "PrimaryImageAspectRatio,ProductionYear"


async def test_items_options(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
) -> None:
    """Sorting, paging and filters are passed on; bad input is rejected."""
    emby.get(url(f"{U}/Views"), payload=VIEWS)
    emby.get(url(f"{U}/Items"), payload={"Items": []}, repeat=True)
    ws = await hass_ws_client(hass)
    result = await ok(
        ws,
        "items",
        parent_id="v-movies",
        sort_by="DateCreated",
        sort_order="desc",
        start_index=120,
        limit=200,
        filter="unplayed",
    )
    assert result == {"items": [], "total": 0}
    sent = params(emby, f"{U}/Items")
    assert sent["SortBy"] == "DateCreated"
    assert sent["SortOrder"] == "Descending"
    assert sent["StartIndex"] == 120
    assert sent["Limit"] == 200
    assert sent["Filters"] == "IsUnplayed"

    await ok(ws, "items", parent_id="v-movies", filter="favorites")
    assert params(emby, f"{U}/Items")["Filters"] == "IsFavorite"

    assert await err(ws, "items", parent_id="v-movies", sort_by="Random") == "invalid_format"
    assert await err(ws, "items", parent_id="v-movies", limit=201) == "invalid_format"
    assert await err(ws, "items", parent_id="../System") == "invalid_format"
    assert await err(ws, "items") == "invalid_format"


async def test_item(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    items: dict[str, Any],
) -> None:
    """One item with details, and not_found."""
    emby.get(url(f"{U}/Items/101"), payload=items["movie"])
    emby.get(url(f"{U}/Items/999"), status=404)
    ws = await hass_ws_client(hass)
    item = (await ok(ws, "item", item_id="101"))["item"]
    assert item["overview"] == "A linguist works with the military."
    assert item["position_s"] == 1740
    assert await err(ws, "item", item_id="999") == "not_found"


async def test_seasons_and_episodes(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    items: dict[str, Any],
) -> None:
    """Seasons and episodes of a series."""
    emby.get(url("/Shows/200/Seasons"), payload={"Items": [items["season"]]})
    emby.get(url("/Shows/200/Episodes"), payload={"Items": [items["episode"], items["episode2"]]})
    ws = await hass_ws_client(hass)
    seasons = (await ok(ws, "seasons", series_id="200"))["items"]
    assert [s["id"] for s in seasons] == ["210"]
    assert params(emby, "/Shows/200/Seasons")["UserId"] == USER_ID

    episodes = (await ok(ws, "episodes", series_id="200", season_id="210"))["items"]
    assert [e["episode_number"] for e in episodes] == [1, 2]
    sent = params(emby, "/Shows/200/Episodes")
    assert sent["SeasonId"] == "210"
    assert sent["UserId"] == USER_ID
    assert sent["Fields"].endswith(",Overview")


async def test_search(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    items: dict[str, Any],
) -> None:
    """Search across movies, series and episodes."""
    emby.get(url(f"{U}/Items"), payload={"Items": [items["movie"], items["series"]]})
    ws = await hass_ws_client(hass)
    result = await ok(ws, "search", term="  arr & <i>val  ")
    assert [i["type"] for i in result["items"]] == ["Movie", "Series"]
    sent = params(emby, f"{U}/Items")
    assert sent["SearchTerm"] == "arr & <i>val"
    assert sent["Recursive"] == "true"
    assert sent["IncludeItemTypes"] == "Movie,Series,Episode"
    assert sent["Limit"] == 60
    assert await err(ws, "search", term="a") == "invalid_format"
    assert await err(ws, "search", term="ab", limit=101) == "invalid_format"


@pytest.mark.parametrize(
    ("mock_kwargs", "code"),
    [
        ({"status": 500}, "emby_unreachable"),
        ({"exception": TimeoutError()}, "emby_unreachable"),
        ({"status": 401}, "emby_auth_failed"),
    ],
)
async def test_emby_errors(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    mock_kwargs: dict[str, Any],
    code: str,
) -> None:
    """Emby failures map to error codes; auth failures start reauth. No retries."""
    emby.get(url(f"{U}/Items/Resume"), **mock_kwargs)
    ws = await hass_ws_client(hass)
    assert await err(ws, "shelf", shelf="resume") == code
    assert len(calls(emby, "GET", f"{U}/Items/Resume")) == 1
    await hass.async_block_till_done()
    flows = hass.config_entries.flow.async_progress_by_handler(DOMAIN)
    assert bool(flows) is (code == "emby_auth_failed")


# --- play -----------------------------------------------------------------


def mock_sessions(emby: aioresponses, raw_sessions: list[dict[str, Any]]) -> None:
    """Answer GET /Sessions."""
    emby.get(url("/Sessions"), payload=raw_sessions, repeat=True)


async def play(ws: Any, item_id: str, mode: str = "resume", session: str = "sess-tv") -> Any:
    """Send the play command."""
    return await call(ws, "play", session_id=session, item_id=item_id, mode=mode)


def played(emby: aioresponses, session: str = "sess-tv") -> Any:
    """Return the recorded E14 call."""
    return calls(emby, "POST", f"/Sessions/{session}/Playing")[-1]


@pytest.mark.parametrize(("mode", "ticks"), [("resume", 17_400_000_000), ("start", 0)])
async def test_play_movie(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    items: dict[str, Any],
    raw_sessions: list[dict[str, Any]],
    mode: str,
    ticks: int,
) -> None:
    """Movies play directly, resumed or from the start."""
    emby.get(url(f"{U}/Items/101"), payload=items["movie"])
    mock_sessions(emby, raw_sessions)
    emby.post(url("/Sessions/sess-tv/Playing"), status=204)
    ws = await hass_ws_client(hass)
    response = await play(ws, "101", mode)
    assert response["result"] == {"played_item_id": "101"}
    request = played(emby)
    assert request.kwargs["params"] == {
        "ItemIds": "101",
        "PlayCommand": "PlayNow",
        "StartPositionTicks": ticks,
    }
    assert request.kwargs["json"] == {"ControllingUserId": USER_ID}
    assert params(emby, "/Sessions")["ControllableByUserId"] == USER_ID


async def test_play_series_next_up(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    items: dict[str, Any],
    raw_sessions: list[dict[str, Any]],
) -> None:
    """A series plays the next episode, at its saved position."""
    emby.get(url(f"{U}/Items/200"), payload=items["series"])
    emby.get(url("/Shows/NextUp"), payload={"Items": [items["episode2"]]})
    mock_sessions(emby, raw_sessions)
    emby.post(url("/Sessions/sess-tv/Playing"), status=204)
    ws = await hass_ws_client(hass)
    assert (await play(ws, "200"))["result"] == {"played_item_id": "212"}
    assert params(emby, "/Shows/NextUp")["SeriesId"] == "200"
    assert played(emby).kwargs["params"]["ItemIds"] == "212"
    assert played(emby).kwargs["params"]["StartPositionTicks"] == 6_000_000_000


async def test_play_series_falls_back_to_first_episode(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    items: dict[str, Any],
    raw_sessions: list[dict[str, Any]],
) -> None:
    """With an empty NextUp, the first episode is used."""
    emby.get(url(f"{U}/Items/200"), payload=items["series"], repeat=True)
    emby.get(url("/Shows/NextUp"), payload={"Items": []}, repeat=True)
    emby.get(url("/Shows/200/Episodes"), payload={"Items": [items["episode"], items["episode2"]]})
    mock_sessions(emby, raw_sessions)
    emby.post(url("/Sessions/sess-tv/Playing"), status=204)
    ws = await hass_ws_client(hass)
    assert (await play(ws, "200"))["result"] == {"played_item_id": "211"}
    assert "SeasonId" not in params(emby, "/Shows/200/Episodes")

    emby.get(url("/Shows/200/Episodes"), payload={"Items": []})
    assert (await play(ws, "200"))["error"]["code"] == "not_found"


async def test_play_season(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    items: dict[str, Any],
    raw_sessions: list[dict[str, Any]],
) -> None:
    """A season plays its first unplayed episode, or the first when all are seen."""
    emby.get(url(f"{U}/Items/210"), payload=items["season"], repeat=True)
    emby.get(url("/Shows/200/Episodes"), payload={"Items": [items["episode"], items["episode2"]]})
    mock_sessions(emby, raw_sessions)
    emby.post(url("/Sessions/sess-tv/Playing"), status=204, repeat=True)
    ws = await hass_ws_client(hass)
    assert (await play(ws, "210", "start"))["result"] == {"played_item_id": "212"}
    assert params(emby, "/Shows/200/Episodes")["SeasonId"] == "210"
    assert played(emby).kwargs["params"]["StartPositionTicks"] == 0

    seen = {**items["episode2"], "UserData": {"Played": True}}
    emby.get(url("/Shows/200/Episodes"), payload={"Items": [items["episode"], seen]})
    assert (await play(ws, "210"))["result"] == {"played_item_id": "211"}

    emby.get(url("/Shows/200/Episodes"), payload={"Items": []})
    assert (await play(ws, "210"))["error"]["code"] == "not_found"


async def test_play_errors(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    items: dict[str, Any],
    raw_sessions: list[dict[str, Any]],
) -> None:
    """Every error code of the play rules."""
    emby.get(url(f"{U}/Items/999"), status=404)
    emby.get(url(f"{U}/Items/300"), payload=items["boxset"])
    emby.get(url(f"{U}/Items/400"), payload=items["folder"])
    emby.get(url(f"{U}/Items/101"), payload=items["movie"], repeat=True)
    mock_sessions(emby, raw_sessions)
    ws = await hass_ws_client(hass)

    assert (await play(ws, "999"))["error"]["code"] == "not_found"
    assert (await play(ws, "300"))["error"]["code"] == "unsupported_command"
    assert (await play(ws, "400"))["error"]["code"] == "unsupported_command"
    assert (await play(ws, "101", session="gone"))["error"]["code"] == "session_not_found"
    assert (await play(ws, "101", session="sess-audio"))["error"]["code"] == "not_controllable"
    assert (await play(ws, "101", "later"))["error"]["code"] == "invalid_format"

    # The session disappears between listing and play.
    emby.post(url("/Sessions/sess-tv/Playing"), status=404)
    assert (await play(ws, "101"))["error"]["code"] == "session_not_found"
    assert not calls(emby, "POST", "/Sessions/gone/Playing")


# --- control ----------------------------------------------------------------


@pytest.mark.parametrize(
    ("command", "emby_command"),
    [
        ("play", "Unpause"),
        ("pause", "Pause"),
        ("play_pause", "PlayPause"),
        ("stop", "Stop"),
        ("next", "NextTrack"),
        ("previous", "PreviousTrack"),
    ],
)
async def test_control_playstate(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    raw_sessions: list[dict[str, Any]],
    command: str,
    emby_command: str,
) -> None:
    """Playstate commands go to /Playing/{cmd}."""
    mock_sessions(emby, raw_sessions)
    emby.post(url(f"/Sessions/sess-web/Playing/{emby_command}"), status=204)
    ws = await hass_ws_client(hass)
    assert await ok(ws, "control", session_id="sess-web", command=command) == {}
    request = calls(emby, "POST", f"/Sessions/sess-web/Playing/{emby_command}")[0]
    assert "SeekPositionTicks" not in request.kwargs["params"]


async def test_control_seek_and_volume(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    raw_sessions: list[dict[str, Any]],
) -> None:
    """Seek is sent in ticks and volume as an Arguments body."""
    mock_sessions(emby, raw_sessions)
    emby.post(url("/Sessions/sess-web/Playing/Seek"), status=204)
    emby.post(url("/Sessions/sess-web/Command/SetVolume"), status=204)
    emby.post(url("/Sessions/sess-tv/Command/Mute"), status=204)
    emby.post(url("/Sessions/sess-tv/Command/Unmute"), status=204)
    ws = await hass_ws_client(hass)

    await ok(ws, "control", session_id="sess-web", command="seek", value=90.5)
    request = calls(emby, "POST", "/Sessions/sess-web/Playing/Seek")[0]
    assert request.kwargs["params"] == {"SeekPositionTicks": 905_000_000}

    await ok(ws, "control", session_id="sess-web", command="set_volume", value=35)
    request = calls(emby, "POST", "/Sessions/sess-web/Command/SetVolume")[0]
    assert request.kwargs["json"] == {"Arguments": {"Volume": "35"}}

    await ok(ws, "control", session_id="sess-tv", command="mute")
    await ok(ws, "control", session_id="sess-tv", command="unmute")
    request = calls(emby, "POST", "/Sessions/sess-tv/Command/Mute")[0]
    assert request.kwargs["json"] == {"Arguments": {}}


async def test_control_errors(
    hass: HomeAssistant,
    hass_ws_client: WebSocketGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    raw_sessions: list[dict[str, Any]],
) -> None:
    """Validation and error codes for control."""
    mock_sessions(emby, raw_sessions)
    ws = await hass_ws_client(hass)

    async def control(session: str, command: str, **kwargs: Any) -> str:
        return await err(ws, "control", session_id=session, command=command, **kwargs)

    assert await control("sess-web", "seek") == "invalid_format"
    assert await control("sess-web", "set_volume") == "invalid_format"
    assert await control("sess-web", "set_volume", value=101) == "invalid_format"
    assert await control("sess-web", "seek", value=-1) == "invalid_format"
    assert await control("sess-web", "rewind") == "invalid_format"
    assert await control("gone", "pause") == "session_not_found"
    assert await control("sess-audio", "pause") == "not_controllable"
    # The TV cannot seek and the web client does not announce Mute.
    assert await control("sess-tv", "seek", value=10) == "unsupported_command"
    assert await control("sess-web", "mute") == "unsupported_command"

    emby.post(url("/Sessions/sess-web/Playing/Pause"), status=404)
    assert await control("sess-web", "pause") == "session_not_found"
    emby.post(url("/Sessions/sess-web/Playing/Pause"), status=500)
    assert await control("sess-web", "pause") == "emby_unreachable"
