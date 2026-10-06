#!/usr/bin/env python3
"""Verify the assumptions V1-V6 from the specification against a real Emby server.

Uses only the standard library. Example:

    python scripts/verify_emby.py --url http://192.168.1.10:8096 --api-key KEY \\
        --user thomas --movie "Arrival" --episode "Half Loop" --play

Nothing is changed on the server. With --play, one movie is started and paused
on the first controllable client that can play video (V3); without it V3 is skipped.
The script prints a Markdown table for the "Compatibility" section of the README.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
import json
import ssl
import sys
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

PASS, FAIL, SKIP = "PASS", "FAIL", "SKIPPED"
TICKS_PER_SECOND = 10_000_000


@dataclass
class Result:
    """Outcome of one verification."""

    check: str
    assumption: str
    status: str
    detail: str


class Emby:
    """Minimal synchronous Emby client. The key is only sent as a header."""

    def __init__(self, url: str, api_key: str, verify_ssl: bool) -> None:
        url = url.strip().rstrip("/")
        if url.lower().endswith("/emby"):
            url = url[:-5]
        if not url.lower().startswith(("http://", "https://")):
            raise SystemExit("--url must start with http:// or https://")
        self.base = f"{url}/emby"
        self.api_key = api_key
        self.context = None if verify_ssl else ssl._create_unverified_context()  # noqa: S323

    def request(
        self,
        method: str,
        path: str,
        params: dict[str, Any] | None = None,
        body: dict[str, Any] | None = None,
    ) -> Any:
        """Return decoded JSON, or None for an empty answer. Raises HTTPError."""
        url = f"{self.base}{path}"
        if params:
            url = f"{url}?{urlencode(params)}"
        headers = {"X-Emby-Token": self.api_key, "Accept": "application/json"}
        data = None
        if body is not None:
            data = json.dumps(body).encode()
            headers["Content-Type"] = "application/json"
        request = Request(url, data=data, headers=headers, method=method)
        with urlopen(request, timeout=15, context=self.context) as response:
            raw = response.read()
        return json.loads(raw) if raw else None

    def get(self, path: str, **params: Any) -> Any:
        """GET a path."""
        return self.request("GET", path, params)


def describe(err: Exception) -> str:
    """Return a short description of an error."""
    if isinstance(err, HTTPError):
        return f"HTTP {err.code}"
    if isinstance(err, URLError):
        return f"no connection ({err.reason})"
    return f"{type(err).__name__}: {err}"


def items_of(data: Any) -> list[dict[str, Any]]:
    """Return the item list from a bare list or an Items wrapper."""
    if isinstance(data, dict):
        data = data.get("Items", [])
    return [item for item in data if isinstance(item, dict)] if isinstance(data, list) else []


def check_v1(emby: Emby, uid: str) -> Result:
    """V1: /Suggestions exists and answers with Items."""
    assumption = "E9 (/Suggestions) exists and answers with Items"
    try:
        data = emby.get(f"/Users/{uid}/Suggestions", Limit=5, Type="Movie,Series")
    except (HTTPError, URLError, ValueError) as err:
        return Result("V1", assumption, FAIL, describe(err))
    if isinstance(data, dict) and isinstance(data.get("Items"), list):
        return Result("V1", assumption, PASS, f"{len(data['Items'])} items")
    return Result("V1", assumption, FAIL, f"unexpected answer of type {type(data).__name__}")


def check_v2(emby: Emby, uid: str, movie: str | None, episode: str | None) -> Result:
    """V2: SearchTerm searches titles across types."""
    assumption = "E4 with SearchTerm searches titles across types"
    if not movie or not episode:
        return Result("V2", assumption, SKIP, "pass --movie and --episode")
    found: dict[str, bool] = {}
    try:
        for term, item_type in ((movie, "Movie"), (episode, "Episode")):
            data = emby.get(
                f"/Users/{uid}/Items",
                SearchTerm=term,
                Recursive="true",
                IncludeItemTypes="Movie,Series,Episode",
                Limit=60,
            )
            found[item_type] = any(
                item.get("Type") == item_type and term.lower() in str(item.get("Name", "")).lower()
                for item in items_of(data)
            )
    except (HTTPError, URLError, ValueError) as err:
        return Result("V2", assumption, FAIL, describe(err))
    if all(found.values()):
        return Result("V2", assumption, PASS, "movie and episode found in one combined search")
    missing = ", ".join(kind for kind, ok in found.items() if not ok)
    return Result("V2", assumption, FAIL, f"not found: {missing}")


def check_v5(emby: Emby) -> tuple[Result, list[dict[str, Any]]]:
    """V5: /Users returns all users with an API key."""
    assumption = "E2 (/Users) returns all users with an API key"
    try:
        users = items_of(emby.get("/Users"))
    except (HTTPError, URLError, ValueError) as err:
        return Result("V5", assumption, FAIL, describe(err)), []
    if not users:
        return Result("V5", assumption, FAIL, "empty list"), []
    names = ", ".join(str(user.get("Name")) for user in users)
    return (
        Result("V5", assumption, PASS, f"{len(users)} users: {names}. Compare with Emby."),
        users,
    )


def check_v6(emby: Emby, uid: str) -> tuple[Result, list[dict[str, Any]]]:
    """V6: the session object has SupportsRemoteControl."""
    assumption = "The session object has the field SupportsRemoteControl"
    try:
        sessions = items_of(emby.get("/Sessions", ControllableByUserId=uid))
    except (HTTPError, URLError, ValueError) as err:
        return Result("V6", assumption, FAIL, describe(err)), []
    if not sessions:
        return Result("V6", assumption, SKIP, "no sessions; open an Emby client and run again"), []
    with_field = [s for s in sessions if "SupportsRemoteControl" in s]
    status = PASS if len(with_field) == len(sessions) else FAIL
    return (
        Result("V6", assumption, status, f"{len(with_field)} of {len(sessions)} sessions have it"),
        sessions,
    )


def check_v3(emby: Emby, uid: str, sessions: list[dict[str, Any]], play: bool) -> Result:
    """V3: play and pause are accepted with API key and ControllingUserId."""
    assumption = "E14 and E15 are accepted with API key and ControllingUserId"
    if not play:
        return Result("V3", assumption, SKIP, "pass --play to start and pause a movie")
    target = next(
        (
            s
            for s in sessions
            if s.get("SupportsRemoteControl") and "Video" in (s.get("PlayableMediaTypes") or [])
        ),
        None,
    )
    if target is None:
        return Result("V3", assumption, SKIP, "no controllable client that plays video is open")
    try:
        movies = items_of(
            emby.get(f"/Users/{uid}/Items", IncludeItemTypes="Movie", Recursive="true", Limit=1)
        )
        if not movies:
            return Result("V3", assumption, SKIP, "the user has no movies")
        sid = target["Id"]
        emby.request(
            "POST",
            f"/Sessions/{sid}/Playing",
            {"ItemIds": movies[0]["Id"], "PlayCommand": "PlayNow", "StartPositionTicks": 0},
            {"ControllingUserId": uid},
        )
        started = False
        for _ in range(10):
            time.sleep(1)
            current = next((s for s in items_of(emby.get("/Sessions")) if s.get("Id") == sid), {})
            if (current.get("NowPlayingItem") or {}).get("Id") == movies[0]["Id"]:
                started = True
                break
        if not started:
            return Result("V3", assumption, FAIL, "accepted, but the client did not start")
        emby.request("POST", f"/Sessions/{sid}/Playing/Pause", None, {"ControllingUserId": uid})
        time.sleep(2)
        current = next((s for s in items_of(emby.get("/Sessions")) if s.get("Id") == sid), {})
        paused = bool((current.get("PlayState") or {}).get("IsPaused"))
        emby.request("POST", f"/Sessions/{sid}/Playing/Stop", None, {"ControllingUserId": uid})
    except (HTTPError, URLError, ValueError, KeyError) as err:
        return Result("V3", assumption, FAIL, describe(err))
    client = f"{target.get('Client')} on {target.get('DeviceName')}"
    if paused:
        return Result("V3", assumption, PASS, f"started and paused on {client}")
    return Result("V3", assumption, FAIL, f"started on {client}, but pause had no effect")


def main() -> int:
    """Run all checks and print the result."""
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--url", required=True, help="for example http://192.168.1.10:8096")
    parser.add_argument("--api-key", required=True)
    parser.add_argument("--user", help="Emby user name or ID (default: the first user)")
    parser.add_argument("--movie", help="title of a movie that exists, for V2")
    parser.add_argument("--episode", help="title of an episode that exists, for V2")
    parser.add_argument("--play", action="store_true", help="start and pause a movie, for V3")
    parser.add_argument("--no-verify-ssl", action="store_true")
    args = parser.parse_args()

    emby = Emby(args.url, args.api_key, not args.no_verify_ssl)
    try:
        info = emby.get("/System/Info")
    except (HTTPError, URLError, ValueError) as err:
        print(f"Cannot read /System/Info: {describe(err)}", file=sys.stderr)
        return 2
    version = str(info.get("Version"))
    print(f"Server: {info.get('ServerName')}  Version: {version}\n")

    v5, users = check_v5(emby)
    user = None
    if args.user:
        user = next(
            (u for u in users if args.user in (u.get("Id"), u.get("Name"))),
            None,
        )
        if user is None and not users:
            user = {"Id": args.user, "Name": args.user}  # V5 failed: treat --user as an ID
    elif users:
        user = users[0]
    if user is None:
        print("No Emby user found. Pass --user with a user ID.", file=sys.stderr)
        return 2
    uid = str(user["Id"])
    print(f"User: {user.get('Name')}\n")

    v6, sessions = check_v6(emby, uid)
    results = [
        check_v1(emby, uid),
        check_v2(emby, uid, args.movie, args.episode),
        check_v3(emby, uid, sessions, args.play),
        Result(
            "V4",
            "All endpoints behave the same on Emby 4.8 and the newest 4.9",
            SKIP,
            f"this run covers {version} only; run the script against both versions",
        ),
        v5,
        v6,
    ]

    print("| ID | Assumption | Result | Detail |")
    print("| --- | --- | --- | --- |")
    for result in results:
        print(f"| {result.check} | {result.assumption} | {result.status} | {result.detail} |")
    return 1 if any(result.status == FAIL for result in results) else 0


if __name__ == "__main__":
    sys.exit(main())
