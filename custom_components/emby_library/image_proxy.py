"""Image proxy with stable, signed URLs."""

from __future__ import annotations

import re
from typing import TYPE_CHECKING

from aiohttp import web
from homeassistant.config_entries import ConfigEntryState
from homeassistant.helpers.http import KEY_HASS, HomeAssistantView

from .const import DOMAIN, ID_PATTERN, IMAGE_TYPES, IMAGE_URL_PREFIX, IMAGE_WIDTHS
from .emby_client import EmbyError, EmbyNotFoundError
from .models import ImageSigner

if TYPE_CHECKING:
    from . import EmbyLibraryConfigEntry

_ID_RE = re.compile(ID_PATTERN)
_MAX_TAG_LENGTH = 256
_SIG_RE = re.compile(r"^[0-9a-f]{32}$")
_CHUNK_SIZE = 64 * 1024


class EmbyImageView(HomeAssistantView):
    """Serve Emby images without exposing the API key or the Emby address.

    The view has no login, but every URL carries an HMAC signature that binds
    entry, item, image type, index, tag and width.
    """

    requires_auth = False
    url = IMAGE_URL_PREFIX + "/{entry_id}/{item_id}/{image_type}/{index}"
    name = "api:emby_library:image"

    def __init__(self, signer: ImageSigner) -> None:
        """Initialize the view."""
        self._signer = signer

    async def get(
        self,
        request: web.Request,
        entry_id: str,
        item_id: str,
        image_type: str,
        index: str,
    ) -> web.StreamResponse:
        """Validate, fetch from Emby and stream the image."""
        tag = request.query.get("tag", "")
        signature = request.query.get("sig", "")
        try:
            width = int(request.query.get("w", ""))
            image_index = int(index)
        except ValueError:
            return web.Response(status=400)

        if (
            not _ID_RE.match(entry_id)
            or not _ID_RE.match(item_id)
            or image_type not in IMAGE_TYPES
            or width not in IMAGE_WIDTHS
            or not 0 <= image_index <= 99
            or str(image_index) != index
            or len(tag) > _MAX_TAG_LENGTH
        ):
            return web.Response(status=400)

        if not _SIG_RE.match(signature) or not self._signer.verify(
            entry_id, item_id, image_type, image_index, tag, width, signature
        ):
            return web.Response(status=403)

        hass = request.app[KEY_HASS]
        entry: EmbyLibraryConfigEntry | None = hass.config_entries.async_get_entry(entry_id)
        if entry is None or entry.domain != DOMAIN or entry.state is not ConfigEntryState.LOADED:
            return web.Response(status=404)

        try:
            upstream = await entry.runtime_data.client.open_image(
                item_id, image_type, image_index, width, tag
            )
        except EmbyNotFoundError:
            return web.Response(status=404)
        except EmbyError:
            return web.Response(status=502)

        try:
            content_type = upstream.headers.get("Content-Type", "")
            if not content_type.lower().startswith("image/"):
                return web.Response(status=502)

            response = web.StreamResponse(
                headers={
                    "Content-Type": content_type,
                    "Cache-Control": (
                        "private, max-age=31536000, immutable" if tag else "private, max-age=300"
                    ),
                    "X-Content-Type-Options": "nosniff",
                }
            )
            if (
                "Content-Encoding" not in upstream.headers
                and (length := upstream.headers.get("Content-Length")) is not None
                and length.isdigit()
            ):
                response.content_length = int(length)
            await response.prepare(request)
            async for chunk in upstream.content.iter_chunked(_CHUNK_SIZE):
                await response.write(chunk)
            await response.write_eof()
            return response
        finally:
            upstream.release()
