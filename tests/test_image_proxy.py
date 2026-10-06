"""Tests for the signed image proxy."""

from __future__ import annotations

from typing import Any

from aioresponses import aioresponses
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from custom_components.emby_library.const import DOMAIN
from custom_components.emby_library.models import ImageSigner

from .conftest import API_KEY, calls, url

JPEG = b"\xff\xd8\xff\xe0" + b"x" * 200_000


def signed(hass: HomeAssistant, entry_id: str, **overrides: Any) -> str:
    """Return a signed image URL, optionally for other values than those signed."""
    signer: ImageSigner = hass.data[DOMAIN]
    address = signer.url(entry_id, "101", "Primary", "tag1", 320)
    assert address is not None
    for key, value in overrides.items():
        address = address.replace(key, value)
    return address


async def test_image_is_proxied(
    hass: HomeAssistant,
    hass_client_no_auth: ClientSessionGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
) -> None:
    """A valid URL streams the image without login and is cacheable."""
    emby.get(url("/Items/101/Images/Primary/0"), body=JPEG, headers={"Content-Type": "image/jpeg"})
    client = await hass_client_no_auth()
    address = signed(hass, loaded_entry.entry_id)
    assert API_KEY not in address

    response = await client.get(address)
    assert response.status == 200
    assert await response.read() == JPEG
    assert response.headers["Content-Type"] == "image/jpeg"
    assert response.headers["Cache-Control"] == "private, max-age=31536000, immutable"

    request = calls(emby, "GET", "/Items/101/Images/Primary/0")[0]
    assert request.kwargs["params"] == {"maxWidth": 320, "quality": 90, "tag": "tag1"}
    assert request.kwargs["headers"]["X-Emby-Token"] == API_KEY

    # The address is stable, so the browser can cache it.
    assert signed(hass, loaded_entry.entry_id) == address


async def test_image_without_tag_is_cached_briefly(
    hass: HomeAssistant,
    hass_client_no_auth: ClientSessionGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
) -> None:
    """Without a tag the image is cached for 300 seconds."""
    emby.get(url("/Items/101/Images/Thumb/0"), body=b"png", headers={"Content-Type": "image/png"})
    signer: ImageSigner = hass.data[DOMAIN]
    sig = signer.signature(loaded_entry.entry_id, "101", "Thumb", 0, "", 480)
    client = await hass_client_no_auth()
    response = await client.get(
        f"/api/emby_library/image/{loaded_entry.entry_id}/101/Thumb/0?w=480&sig={sig}"
    )
    assert response.status == 200
    assert response.headers["Cache-Control"] == "private, max-age=300"
    assert "tag" not in calls(emby, "GET", "/Items/101/Images/Thumb/0")[0].kwargs["params"]


@pytest.mark.parametrize(
    ("overrides", "status"),
    [
        ({"sig=": "sig=0"}, 403),
        ({"/101/": "/102/"}, 403),
        ({"w=320": "w=1920"}, 403),
        ({"tag=tag1": "tag=tag2"}, 403),
        ({"/Primary/": "/Backdrop/"}, 403),
        ({"/Primary/0": "/Primary/1"}, 403),
        ({"w=320": "w=321"}, 400),
        ({"w=320": "w=abc"}, 400),
        ({"/Primary/": "/Art/"}, 400),
        ({"/Primary/0": "/Primary/x"}, 400),
        ({"/Primary/0": "/Primary/00"}, 400),
        ({"/101/": "/1.1/"}, 400),
        ({"&sig=": "&nosig="}, 403),
    ],
)
async def test_invalid_requests_are_rejected(
    hass: HomeAssistant,
    hass_client_no_auth: ClientSessionGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    overrides: dict[str, str],
    status: int,
) -> None:
    """A signature only covers exactly what was signed; nothing reaches Emby."""
    client = await hass_client_no_auth()
    response = await client.get(signed(hass, loaded_entry.entry_id, **overrides))
    assert response.status == status
    assert len(emby.requests) == 1  # only /System/Info from setup


async def test_unknown_entry(
    hass: HomeAssistant,
    hass_client_no_auth: ClientSessionGenerator,
    loaded_entry: MockConfigEntry,
) -> None:
    """A valid signature for an entry that is not loaded gives 404."""
    client = await hass_client_no_auth()
    assert (await client.get(signed(hass, "unknown"))).status == 404
    assert await hass.config_entries.async_unload(loaded_entry.entry_id)
    assert (await client.get(signed(hass, loaded_entry.entry_id))).status == 404


@pytest.mark.parametrize(
    ("mock_kwargs", "status"),
    [
        ({"status": 404}, 404),
        ({"status": 500}, 502),
        ({"status": 401}, 502),
        ({"exception": TimeoutError()}, 502),
        ({"body": "<html>", "headers": {"Content-Type": "text/html"}}, 502),
    ],
)
async def test_upstream_errors(
    hass: HomeAssistant,
    hass_client_no_auth: ClientSessionGenerator,
    loaded_entry: MockConfigEntry,
    emby: aioresponses,
    mock_kwargs: dict[str, Any],
    status: int,
) -> None:
    """Emby errors and non-image answers never reach the browser."""
    emby.get(url("/Items/101/Images/Primary/0"), **mock_kwargs)
    client = await hass_client_no_auth()
    response = await client.get(signed(hass, loaded_entry.entry_id))
    assert response.status == status
    assert await response.read() == b""


def test_signature_depends_on_secret() -> None:
    """Addresses become invalid when the secret changes (restart)."""
    first, second = ImageSigner(b"a" * 32), ImageSigner(b"b" * 32)
    signature = first.signature("e", "1", "Primary", 0, "t", 320)
    assert len(signature) == 32
    assert first.verify("e", "1", "Primary", 0, "t", 320, signature)
    assert not second.verify("e", "1", "Primary", 0, "t", 320, signature)
    assert first.url("e", None, "Primary", "t", 320) is None
    assert first.url("e", "1", "Primary", None, 320) is None
