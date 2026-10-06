"""Shared fixtures for the Emby Library tests."""

from __future__ import annotations

from collections.abc import AsyncIterator, Iterator
import json
from pathlib import Path
import re
from typing import Any

from aioresponses import aioresponses
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.emby_library.const import DOMAIN

BASE = "http://emby.local:8096"
API = f"{BASE}/emby"
API_KEY = "secret-api-key-123"
USER_ID = "u1"
SERVER_ID = "srv1"

ENTRY_DATA = {
    "url": BASE,
    "api_key": API_KEY,
    "verify_ssl": True,
    "server_id": SERVER_ID,
    "server_name": "Home",
    "user_id": USER_ID,
    "user_name": "thomas",
}

SYSTEM_INFO = {"Id": SERVER_ID, "ServerName": "Home", "Version": "4.9.1.80"}

VIEWS = {
    "Items": [
        {
            "Id": "v-movies",
            "Name": "Movies",
            "CollectionType": "movies",
            "ImageTags": {"Primary": "tv1"},
        },
        {"Id": "v-tv", "Name": "TV", "CollectionType": "tvshows", "ImageTags": {}},
        {"Id": "v-sets", "Name": "Collections", "CollectionType": "boxsets"},
        {"Id": "v-mixed", "Name": "Home videos"},
        {"Id": "v-music", "Name": "Music", "CollectionType": "music"},
    ]
}

FIXTURES = Path(__file__).parent / "fixtures"


def load_fixture(name: str) -> Any:
    """Load a JSON fixture."""
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


def url(path: str) -> re.Pattern[str]:
    """Match an Emby API path with any query string."""
    return re.compile(rf"^{re.escape(API + path)}(\?.*)?$")


def calls(mock: aioresponses, method: str, path: str) -> list[Any]:
    """Return the recorded calls for a method and path, ignoring the query."""
    found: list[Any] = []
    for (call_method, call_url), requests in mock.requests.items():
        if call_method == method and str(call_url.with_query(None)) == API + path:
            found.extend(requests)
    return found


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations: None) -> None:
    """Enable loading of the custom integration."""


@pytest.fixture
def items() -> dict[str, Any]:
    """Return saved Emby item examples."""
    data: dict[str, Any] = load_fixture("items.json")
    return data


@pytest.fixture
def raw_sessions() -> list[dict[str, Any]]:
    """Return saved Emby session examples."""
    data: list[dict[str, Any]] = load_fixture("sessions.json")
    return data


@pytest.fixture
def emby() -> Iterator[aioresponses]:
    """Mock Emby's REST API."""
    with aioresponses(passthrough=["http://127.0.0.1"]) as mock:
        yield mock


@pytest.fixture
def config_entry(hass: HomeAssistant) -> MockConfigEntry:
    """Return a config entry that is added to hass but not set up."""
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Home (thomas)",
        data=dict(ENTRY_DATA),
        unique_id=f"{SERVER_ID}:{USER_ID}",
    )
    entry.add_to_hass(hass)
    return entry


@pytest.fixture
async def loaded_entry(
    hass: HomeAssistant, config_entry: MockConfigEntry, emby: aioresponses
) -> AsyncIterator[MockConfigEntry]:
    """Return a loaded config entry."""
    emby.get(url("/System/Info"), payload=SYSTEM_INFO)
    assert await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()
    yield config_entry
