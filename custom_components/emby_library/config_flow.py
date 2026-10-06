"""Config flow for Emby Library."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigEntryState,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.const import CONF_API_KEY, CONF_URL, CONF_VERIFY_SSL
from homeassistant.core import callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)
import voluptuous as vol

from .const import (
    CONF_HIDDEN_VIEWS,
    CONF_SERVER_ID,
    CONF_SERVER_NAME,
    CONF_USER_ID,
    CONF_USER_NAME,
    DOMAIN,
    MIN_SERVER_VERSION,
)
from .emby_client import (
    EmbyAuthError,
    EmbyClient,
    EmbyError,
    normalize_url,
    parse_version,
)
from .models import view_collection_type

URL_SELECTOR = TextSelector(TextSelectorConfig(type=TextSelectorType.URL))
API_KEY_SELECTOR = TextSelector(TextSelectorConfig(type=TextSelectorType.PASSWORD))


class EmbyLibraryConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle setup, reauth and reconfigure."""

    VERSION = 1

    def __init__(self) -> None:
        """Initialize the flow."""
        self._data: dict[str, Any] = {}
        self._users: dict[str, str] = {}

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry[Any]) -> EmbyLibraryOptionsFlow:
        """Return the options flow."""
        return EmbyLibraryOptionsFlow()

    def _client(self, url: str, api_key: str, verify_ssl: bool) -> EmbyClient:
        return EmbyClient(async_get_clientsession(self.hass, verify_ssl=verify_ssl), url, api_key)

    async def _validate_server(
        self, client: EmbyClient, errors: dict[str, str]
    ) -> dict[str, Any] | None:
        """Call /System/Info and fill ``errors`` on failure."""
        try:
            info = await client.system_info()
        except EmbyAuthError:
            errors["base"] = "invalid_auth"
            return None
        except EmbyError:
            errors["base"] = "cannot_connect"
            return None
        if not info.get("Id"):
            errors["base"] = "cannot_connect"
            return None
        if parse_version(info.get("Version")) < MIN_SERVER_VERSION:
            errors["base"] = "unsupported_version"
            return None
        return info

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Ask for address and API key."""
        errors: dict[str, str] = {}
        if user_input is not None:
            url = normalize_url(user_input[CONF_URL])
            api_key = user_input[CONF_API_KEY].strip()
            verify_ssl = user_input.get(CONF_VERIFY_SSL, True)
            client = self._client(url, api_key, verify_ssl)
            info = await self._validate_server(client, errors)
            if info is not None:
                try:
                    users = await client.users()
                except EmbyAuthError:
                    errors["base"] = "invalid_auth"
                except EmbyError:
                    errors["base"] = "cannot_connect"
                else:
                    self._users = {
                        str(user["Id"]): str(user.get("Name") or user["Id"])
                        for user in users
                        if user.get("Id")
                    }
                    if not self._users:
                        errors["base"] = "no_users"
            if info is not None and not errors:
                self._data = {
                    CONF_URL: url,
                    CONF_API_KEY: api_key,
                    CONF_VERIFY_SSL: verify_ssl,
                    CONF_SERVER_ID: str(info["Id"]),
                    CONF_SERVER_NAME: str(info.get("ServerName") or "Emby"),
                }
                return await self.async_step_select_user()

        schema = vol.Schema(
            {
                vol.Required(CONF_URL): URL_SELECTOR,
                vol.Required(CONF_API_KEY): API_KEY_SELECTOR,
                vol.Required(CONF_VERIFY_SSL, default=True): cv.boolean,
            }
        )
        return self.async_show_form(
            step_id="user",
            data_schema=self.add_suggested_values_to_schema(schema, user_input),
            errors=errors,
        )

    async def async_step_select_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Let the user pick the Emby user."""
        if user_input is not None:
            user_id: str = user_input[CONF_USER_ID]
            await self.async_set_unique_id(f"{self._data[CONF_SERVER_ID]}:{user_id}")
            self._abort_if_unique_id_configured()
            user_name = self._users[user_id]
            return self.async_create_entry(
                title=f"{self._data[CONF_SERVER_NAME]} ({user_name})",
                data={**self._data, CONF_USER_ID: user_id, CONF_USER_NAME: user_name},
            )

        schema = vol.Schema(
            {
                vol.Required(CONF_USER_ID): SelectSelector(
                    SelectSelectorConfig(
                        options=[
                            SelectOptionDict(value=user_id, label=name)
                            for user_id, name in self._users.items()
                        ],
                        mode=SelectSelectorMode.DROPDOWN,
                    )
                )
            }
        )
        return self.async_show_form(step_id="select_user", data_schema=schema)

    async def async_step_reauth(self, entry_data: Mapping[str, Any]) -> ConfigFlowResult:
        """Start reauth after HTTP 401/403 from Emby."""
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Ask for a new API key."""
        entry = self._get_reauth_entry()
        errors: dict[str, str] = {}
        if user_input is not None:
            api_key = user_input[CONF_API_KEY].strip()
            client = self._client(
                entry.data[CONF_URL], api_key, entry.data.get(CONF_VERIFY_SSL, True)
            )
            info = await self._validate_server(client, errors)
            if info is not None and str(info["Id"]) != entry.data[CONF_SERVER_ID]:
                errors["base"] = "wrong_server"
            if info is not None and not errors:
                return self.async_update_reload_and_abort(
                    entry, data_updates={CONF_API_KEY: api_key}
                )

        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=vol.Schema({vol.Required(CONF_API_KEY): API_KEY_SELECTOR}),
            description_placeholders={"title": entry.title},
            errors=errors,
        )

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Change the server address."""
        entry = self._get_reconfigure_entry()
        errors: dict[str, str] = {}
        if user_input is not None:
            url = normalize_url(user_input[CONF_URL])
            verify_ssl = user_input.get(CONF_VERIFY_SSL, True)
            client = self._client(url, entry.data[CONF_API_KEY], verify_ssl)
            info = await self._validate_server(client, errors)
            if info is not None and str(info["Id"]) != entry.data[CONF_SERVER_ID]:
                errors["base"] = "wrong_server"
            if info is not None and not errors:
                return self.async_update_reload_and_abort(
                    entry,
                    data_updates={CONF_URL: url, CONF_VERIFY_SSL: verify_ssl},
                )

        schema = vol.Schema(
            {
                vol.Required(CONF_URL): URL_SELECTOR,
                vol.Required(CONF_VERIFY_SSL, default=True): cv.boolean,
            }
        )
        suggested = user_input or {
            CONF_URL: entry.data[CONF_URL],
            CONF_VERIFY_SSL: entry.data.get(CONF_VERIFY_SSL, True),
        }
        return self.async_show_form(
            step_id="reconfigure",
            data_schema=self.add_suggested_values_to_schema(schema, suggested),
            errors=errors,
        )


class EmbyLibraryOptionsFlow(OptionsFlow):
    """Options: libraries to hide."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(
                data={CONF_HIDDEN_VIEWS: list(user_input.get(CONF_HIDDEN_VIEWS, []))}
            )

        entry = self.config_entry
        hidden: list[str] = list(entry.options.get(CONF_HIDDEN_VIEWS, []))
        views: dict[str, str] = {}
        if entry.state is ConfigEntryState.LOADED:
            try:
                raw_views = await entry.runtime_data.client.views(force=True)
            except EmbyError:
                return self.async_abort(reason="cannot_connect")
            views = {
                str(view["Id"]): str(view.get("Name") or view["Id"])
                for view in raw_views
                if view.get("Id") and view_collection_type(view) is not None
            }
        # Keep hidden libraries that no longer exist selectable so they can be removed.
        for view_id in hidden:
            views.setdefault(view_id, view_id)

        schema = vol.Schema(
            {
                vol.Optional(CONF_HIDDEN_VIEWS, default=hidden): SelectSelector(
                    SelectSelectorConfig(
                        options=[
                            SelectOptionDict(value=view_id, label=name)
                            for view_id, name in views.items()
                        ],
                        multiple=True,
                        mode=SelectSelectorMode.LIST,
                    )
                )
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
