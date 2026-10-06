"""Asynchronous REST client for Emby Server.

The methods map one to one to the endpoints E1-E15 in the specification.
The API key is only ever sent in the ``X-Emby-Token`` header.
"""

from __future__ import annotations

import asyncio
from collections.abc import Mapping
import time
from typing import Any, cast

import aiohttp

from .const import LIST_PARAMS, REQUEST_TIMEOUT, VIEWS_CACHE_SECONDS

type JsonDict = dict[str, Any]


class EmbyError(Exception):
    """Base class for Emby errors."""


class EmbyAuthError(EmbyError):
    """Emby rejected the API key (HTTP 401 or 403)."""


class EmbyNotFoundError(EmbyError):
    """The requested resource does not exist (HTTP 404)."""


class EmbyConnectionError(EmbyError):
    """Emby could not be reached or answered with an unexpected error."""


def normalize_url(url: str) -> str:
    """Strip whitespace, trailing slashes and a trailing ``/emby``."""
    url = url.strip().rstrip("/")
    if url.lower().endswith("/emby"):
        url = url[:-5].rstrip("/")
    return url


def parse_version(version: str | None) -> tuple[int, ...]:
    """Parse a dotted Emby version into a tuple of integers."""
    parts: list[int] = []
    for part in (version or "").split("."):
        digits = "".join(ch for ch in part if ch.isdigit())
        if not digits:
            break
        parts.append(int(digits))
    return tuple(parts)


class EmbyClient:
    """REST client bound to one Emby server and one Emby user."""

    def __init__(
        self,
        session: aiohttp.ClientSession,
        url: str,
        api_key: str,
        user_id: str | None = None,
    ) -> None:
        """Initialize the client."""
        self._session = session
        self._base = f"{normalize_url(url)}/emby"
        self._api_key = api_key
        self.user_id = user_id
        self._timeout = aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)
        self._views_cache: tuple[float, list[JsonDict]] | None = None

    @property
    def _uid(self) -> str:
        if self.user_id is None:
            raise EmbyError("No Emby user selected")
        return self.user_id

    @property
    def _headers(self) -> dict[str, str]:
        return {"X-Emby-Token": self._api_key, "Accept": "application/json"}

    @staticmethod
    def _raise_for_status(status: int, path: str) -> None:
        if status in (401, 403):
            raise EmbyAuthError(f"Emby rejected the API key (HTTP {status})")
        if status == 404:
            raise EmbyNotFoundError(f"Not found: {path}")
        if status >= 400:
            raise EmbyConnectionError(f"Emby answered HTTP {status} for {path}")

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: Mapping[str, str | int] | None = None,
        json: JsonDict | None = None,
    ) -> Any:
        """Perform one request and return decoded JSON (or None)."""
        try:
            async with self._session.request(
                method,
                f"{self._base}{path}",
                params=params,
                json=json,
                headers=self._headers,
                timeout=self._timeout,
            ) as resp:
                self._raise_for_status(resp.status, path)
                if resp.status == 204 or method != "GET":
                    await resp.read()
                    return None
                return await resp.json(content_type=None)
        except (aiohttp.ClientError, asyncio.TimeoutError, ValueError) as err:
            raise EmbyConnectionError(
                f"Error talking to Emby ({type(err).__name__}) for {path}"
            ) from err

    async def _get_dict(self, path: str, params: Mapping[str, str | int] | None = None) -> JsonDict:
        data = await self._request("GET", path, params=params)
        if not isinstance(data, dict):
            raise EmbyConnectionError(f"Unexpected response for {path}")
        return cast(JsonDict, data)

    async def _get_list(
        self, path: str, params: Mapping[str, str | int] | None = None
    ) -> list[JsonDict]:
        """Return a list from either a bare list or an ``Items`` wrapper."""
        data = await self._request("GET", path, params=params)
        if isinstance(data, dict):
            data = data.get("Items", [])
        if not isinstance(data, list):
            raise EmbyConnectionError(f"Unexpected response for {path}")
        return [item for item in data if isinstance(item, dict)]

    # E1
    async def system_info(self) -> JsonDict:
        """Return server info (Id, ServerName, Version)."""
        return await self._get_dict("/System/Info")

    # E2
    async def users(self) -> list[JsonDict]:
        """Return all users on the server."""
        return await self._get_list("/Users")

    # E3
    async def views(self, *, force: bool = False) -> list[JsonDict]:
        """Return the user's libraries, cached for 300 seconds."""
        now = time.monotonic()
        if (
            not force
            and self._views_cache is not None
            and now - self._views_cache[0] < VIEWS_CACHE_SECONDS
        ):
            return self._views_cache[1]
        views = await self._get_list(f"/Users/{self._uid}/Views")
        self._views_cache = (now, views)
        return views

    # E4
    async def items(self, params: Mapping[str, str | int]) -> JsonDict:
        """Return an item list (also used for search)."""
        return await self._get_dict(f"/Users/{self._uid}/Items", {**LIST_PARAMS, **params})

    # E5
    async def item(self, item_id: str) -> JsonDict:
        """Return one item with all fields."""
        return await self._get_dict(f"/Users/{self._uid}/Items/{item_id}")

    # E6
    async def resume(self, limit: int) -> list[JsonDict]:
        """Return items the user can continue watching."""
        return await self._get_list(
            f"/Users/{self._uid}/Items/Resume",
            {**LIST_PARAMS, "Limit": limit, "MediaTypes": "Video", "Recursive": "true"},
        )

    # E7
    async def next_up(self, limit: int, series_id: str | None = None) -> list[JsonDict]:
        """Return next episodes, optionally for one series."""
        params: dict[str, str | int] = {
            **LIST_PARAMS,
            "UserId": self._uid,
            "Limit": limit,
        }
        if series_id is not None:
            params["SeriesId"] = series_id
        return await self._get_list("/Shows/NextUp", params)

    # E8
    async def latest(self, limit: int) -> list[JsonDict]:
        """Return recently added movies and episodes."""
        return await self._get_list(
            f"/Users/{self._uid}/Items/Latest",
            {
                **LIST_PARAMS,
                "Limit": limit,
                "IncludeItemTypes": "Movie,Episode",
                "GroupItems": "true",
            },
        )

    # E9
    async def suggestions(self, limit: int) -> list[JsonDict]:
        """Return suggested movies and series."""
        return await self._get_list(
            f"/Users/{self._uid}/Suggestions",
            {**LIST_PARAMS, "Limit": limit, "Type": "Movie,Series"},
        )

    # E10
    async def seasons(self, series_id: str) -> list[JsonDict]:
        """Return the seasons of a series."""
        return await self._get_list(
            f"/Shows/{series_id}/Seasons",
            {**LIST_PARAMS, "UserId": self._uid},
        )

    # E11
    async def episodes(self, series_id: str, season_id: str | None = None) -> list[JsonDict]:
        """Return the episodes of a series, optionally for one season."""
        params: dict[str, str | int] = {
            **LIST_PARAMS,
            "UserId": self._uid,
            "Fields": f"{LIST_PARAMS['Fields']},Overview",
        }
        if season_id is not None:
            params["SeasonId"] = season_id
        return await self._get_list(f"/Shows/{series_id}/Episodes", params)

    # E12
    async def open_image(
        self, item_id: str, image_type: str, index: int, width: int, tag: str
    ) -> aiohttp.ClientResponse:
        """Open an image for streaming. The caller must release the response."""
        path = f"/Items/{item_id}/Images/{image_type}/{index}"
        params: dict[str, str | int] = {"maxWidth": width, "quality": 90}
        if tag:
            params["tag"] = tag
        try:
            resp = await self._session.get(
                f"{self._base}{path}",
                params=params,
                headers={"X-Emby-Token": self._api_key},
                timeout=self._timeout,
            )
        except (aiohttp.ClientError, asyncio.TimeoutError) as err:
            raise EmbyConnectionError(
                f"Error talking to Emby ({type(err).__name__}) for {path}"
            ) from err
        try:
            self._raise_for_status(resp.status, path)
        except EmbyError:
            resp.release()
            raise
        return resp

    # E13
    async def sessions(self) -> list[JsonDict]:
        """Return sessions the user can control."""
        return await self._get_list("/Sessions", {"ControllableByUserId": self._uid})

    # E14
    async def play(self, session_id: str, item_id: str, start_position_ticks: int) -> None:
        """Start playback of an item on a session."""
        await self._request(
            "POST",
            f"/Sessions/{session_id}/Playing",
            params={
                "ItemIds": item_id,
                "PlayCommand": "PlayNow",
                "StartPositionTicks": start_position_ticks,
            },
            json={"ControllingUserId": self._uid},
        )

    # E15, playstate
    async def playstate_command(
        self, session_id: str, command: str, seek_position_ticks: int | None = None
    ) -> None:
        """Send Pause, Unpause, PlayPause, Stop, NextTrack, PreviousTrack or Seek."""
        params: dict[str, str | int] = {}
        if seek_position_ticks is not None:
            params["SeekPositionTicks"] = seek_position_ticks
        await self._request(
            "POST",
            f"/Sessions/{session_id}/Playing/{command}",
            params=params,
            json={"ControllingUserId": self._uid},
        )

    # E15, general
    async def general_command(
        self, session_id: str, command: str, arguments: Mapping[str, str] | None = None
    ) -> None:
        """Send a general command such as SetVolume, Mute or Unmute."""
        await self._request(
            "POST",
            f"/Sessions/{session_id}/Command/{command}",
            json={"Arguments": dict(arguments or {})},
        )
