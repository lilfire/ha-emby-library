"""Tests for the config flow, reauth, reconfigure and options."""

from __future__ import annotations

from aiohttp import ClientConnectionError
from aioresponses import aioresponses
from homeassistant.config_entries import SOURCE_USER
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.emby_library.const import DOMAIN

from .conftest import API_KEY, BASE, ENTRY_DATA, SYSTEM_INFO, USER_ID, VIEWS, calls, url

USERS = [{"Id": "u1", "Name": "thomas"}, {"Id": "u2", "Name": "guest"}]
USER_INPUT = {"url": f"{BASE}/emby/", "api_key": f" {API_KEY} ", "verify_ssl": True}


async def test_full_flow(hass: HomeAssistant, emby: aioresponses) -> None:
    """Address and key, then user selection, creates an entry."""
    emby.get(url("/System/Info"), payload=SYSTEM_INFO, repeat=True)
    emby.get(url("/Users"), payload=USERS)

    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "user"

    result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "select_user"

    result = await hass.config_entries.flow.async_configure(result["flow_id"], {"user_id": "u1"})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Home (thomas)"
    # The address is normalized and the key stripped.
    assert result["data"] == ENTRY_DATA
    assert result["result"].unique_id == "srv1:u1"

    # The API key is sent as a header and never as a query parameter.
    for request in calls(emby, "GET", "/Users"):
        assert request.kwargs["headers"]["X-Emby-Token"] == API_KEY
        assert not request.kwargs.get("params")


@pytest.mark.parametrize(
    ("mock_kwargs", "error"),
    [
        ({"exception": ClientConnectionError()}, "cannot_connect"),
        ({"exception": TimeoutError()}, "cannot_connect"),
        ({"status": 500}, "cannot_connect"),
        ({"status": 401}, "invalid_auth"),
        ({"status": 403}, "invalid_auth"),
        ({"payload": {**SYSTEM_INFO, "Version": "4.7.14.0"}}, "unsupported_version"),
        ({"payload": {"ServerName": "x", "Version": "4.9.0.0"}}, "cannot_connect"),
        ({"body": "<html>not json"}, "cannot_connect"),
    ],
)
async def test_user_step_errors(
    hass: HomeAssistant, emby: aioresponses, mock_kwargs: dict, error: str
) -> None:
    """Each failure maps to its error key and the form can be retried."""
    emby.get(url("/System/Info"), **mock_kwargs)
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"base": error}

    emby.get(url("/System/Info"), payload=SYSTEM_INFO)
    emby.get(url("/Users"), payload=USERS)
    result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
    assert result["step_id"] == "select_user"


@pytest.mark.parametrize(
    ("mock_kwargs", "error"),
    [
        ({"payload": []}, "no_users"),
        ({"status": 401}, "invalid_auth"),
        ({"status": 500}, "cannot_connect"),
    ],
)
async def test_users_errors(
    hass: HomeAssistant, emby: aioresponses, mock_kwargs: dict, error: str
) -> None:
    """Problems with /Users are reported on the first step."""
    emby.get(url("/System/Info"), payload=SYSTEM_INFO)
    emby.get(url("/Users"), **mock_kwargs)
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
    assert result["errors"] == {"base": error}


async def test_already_configured(
    hass: HomeAssistant, emby: aioresponses, config_entry: MockConfigEntry
) -> None:
    """The same user on the same server cannot be added twice."""
    emby.get(url("/System/Info"), payload=SYSTEM_INFO)
    emby.get(url("/Users"), payload=USERS)
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {"user_id": "u1"})
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"


async def test_second_user_on_same_server(
    hass: HomeAssistant, emby: aioresponses, loaded_entry: MockConfigEntry
) -> None:
    """Another user on the same server gives a second entry."""
    emby.get(url("/System/Info"), payload=SYSTEM_INFO, repeat=True)
    emby.get(url("/Users"), payload=USERS)
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {"user_id": "u2"})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Home (guest)"
    assert len(hass.config_entries.async_entries(DOMAIN)) == 2


async def test_reauth(
    hass: HomeAssistant, emby: aioresponses, loaded_entry: MockConfigEntry
) -> None:
    """Reauth stores a new API key."""
    result = await loaded_entry.start_reauth_flow(hass)
    assert result["step_id"] == "reauth_confirm"

    emby.get(url("/System/Info"), status=401)
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {"api_key": "bad"})
    assert result["errors"] == {"base": "invalid_auth"}

    emby.get(url("/System/Info"), payload={**SYSTEM_INFO, "Id": "other"})
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {"api_key": "new"})
    assert result["errors"] == {"base": "wrong_server"}

    emby.get(url("/System/Info"), payload=SYSTEM_INFO, repeat=True)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"api_key": "new-key"}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reauth_successful"
    assert loaded_entry.data["api_key"] == "new-key"
    await hass.async_block_till_done()


async def test_reconfigure(
    hass: HomeAssistant, emby: aioresponses, loaded_entry: MockConfigEntry
) -> None:
    """Reconfigure stores a new address."""
    result = await loaded_entry.start_reconfigure_flow(hass)
    assert result["step_id"] == "reconfigure"

    new = "https://emby.example.org"
    emby.get(f"{new}/emby/System/Info", exception=ClientConnectionError())
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"url": new, "verify_ssl": False}
    )
    assert result["errors"] == {"base": "cannot_connect"}

    emby.get(f"{new}/emby/System/Info", payload={**SYSTEM_INFO, "Id": "other"})
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"url": new, "verify_ssl": False}
    )
    assert result["errors"] == {"base": "wrong_server"}

    emby.get(f"{new}/emby/System/Info", payload=SYSTEM_INFO, repeat=True)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"url": f"{new}/", "verify_ssl": False}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"
    assert loaded_entry.data["url"] == new
    assert loaded_entry.data["verify_ssl"] is False
    await hass.async_block_till_done()


async def test_options_flow(
    hass: HomeAssistant, emby: aioresponses, loaded_entry: MockConfigEntry
) -> None:
    """Libraries can be hidden."""
    emby.get(url(f"/Users/{USER_ID}/Views"), payload=VIEWS)
    result = await hass.config_entries.options.async_init(loaded_entry.entry_id)
    assert result["type"] is FlowResultType.FORM
    options = result["data_schema"].schema["hidden_views"].config["options"]
    # Music is not offered because it is never shown in v1.
    assert [o["value"] for o in options] == ["v-movies", "v-tv", "v-sets", "v-mixed"]

    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"hidden_views": ["v-mixed"]}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert loaded_entry.options == {"hidden_views": ["v-mixed"]}


async def test_options_flow_emby_down(
    hass: HomeAssistant, emby: aioresponses, loaded_entry: MockConfigEntry
) -> None:
    """The options flow aborts when the libraries cannot be read."""
    emby.get(url(f"/Users/{USER_ID}/Views"), status=500)
    result = await hass.config_entries.options.async_init(loaded_entry.entry_id)
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "cannot_connect"


async def test_options_flow_not_loaded(hass: HomeAssistant, config_entry: MockConfigEntry) -> None:
    """An entry that is not loaded only offers already hidden libraries."""
    hass.config_entries.async_update_entry(config_entry, options={"hidden_views": ["v-old"]})
    result = await hass.config_entries.options.async_init(config_entry.entry_id)
    options = result["data_schema"].schema["hidden_views"].config["options"]
    assert [o["value"] for o in options] == ["v-old"]
