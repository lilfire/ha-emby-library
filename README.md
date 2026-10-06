# Emby Library for Home Assistant

A Home Assistant integration with its own dashboard card for movies and series in Emby:
see what is playing, browse the library, search, and start playback on any Emby client.

The card only talks to Home Assistant. Home Assistant talks to Emby. The API key never
reaches the browser, and it works when Home Assistant is on https and Emby is on http.

This project is unofficial and not affiliated with Emby.

> **Status: 0.1.0 in development.** The code is complete for v1 and covered by automated
> tests, but it has not yet been verified against a real Emby server (see
> [Compatibility](#compatibility)). Screenshots are added with the first release.

## Features

- **Home** with the rows Continue watching, Next up, Recently added and Recommended.
- **Library**: libraries → poster grid → detail page, and series → season → episode.
- **Search** across movies, series and episodes.
- **Detail page** with poster, backdrop, description, progress, and Play, Resume and
  Play from start.
- **Client picker**: start playback on any Emby client that can be remote controlled.
- **Now playing**: cover, title, progress, pause/resume, stop, previous/next, seek and volume.
- Several Emby servers and several Emby users in the same Home Assistant.
- Visual card editor. English and Norwegian Bokmål.

Not part of v1: playback in the card itself, casting to non-Emby devices, music,
audiobooks, photos, live TV, `media_player` entities and server administration.

## Requirements

- Home Assistant 2025.1 or newer
- Emby Server 4.8 or newer

## Installation

1. In HACS, open the menu → **Custom repositories**, add
   `https://github.com/lilfire/ha-emby-library` with the type **Integration**.
2. Install **Emby Library** and restart Home Assistant.
3. In Emby, create an API key under **Settings → Advanced → API Keys**.
4. In Home Assistant, go to **Settings → Devices & services → Add integration → Emby Library**.
   Enter the server address and the API key, then pick the Emby user whose library,
   progress and recommendations the card should show.
5. Add the card **Emby Library** from the card picker. No Lovelace resource has to be added.

To show a second Emby user, add the integration once more and pick the other user.

## Card configuration

Every field except `type` is optional.

```yaml
type: custom:emby-library-card
entry: 01JABCDEF...          # only needed with more than one Emby user set up
start_view: home             # home | library | search
shelves: [resume, next_up, latest, suggestions]
shelf_limit: 20              # 1–50
show_now_playing: true
show_search: true
poster_size: medium          # small | medium | large
height: auto                 # auto | number of pixels (at least 200)
default_target: null         # device_id of the preferred client
targets:                     # optional, edited in YAML
  - name: Living room TV
    device_id: 9ef8d0a2...
    wake_action:
      action: script.turn_on
      target: { entity_id: script.start_emby_living_room }
```

| Field | Default | Description |
| --- | --- | --- |
| `entry` | the only one | Config entry ID of the Emby user. Pick it in the visual editor. |
| `start_view` | `home` | The view the card opens with. |
| `shelves` | all four | The rows on Home, in the order given. |
| `shelf_limit` | `20` | Items per row. |
| `show_now_playing` | `true` | Show the Now playing strip when something is playing. |
| `show_search` | `true` | Show the Search tab. |
| `poster_size` | `medium` | Poster width 110, 150 or 190 pixels. |
| `height` | `auto` | A fixed height makes the card scroll internally. |
| `default_target` | none | `device_id` of the client that is preselected. |
| `targets` | none | Named clients that may be switched off, see below. |

### Playback and clients

Emby can only start playback on a client that is open and announces remote control.
The card lists those clients in the client picker (the cast button at the top right).
The choice is remembered per browser. The preselected client is, in order: the stored
choice, `default_target`, and otherwise the only available client.

`device_id` is Emby's device ID. The visual editor lists the clients that are online
under **Preferred client**, which is the easiest way to find it.

### Waking a client with `targets`

A client that is switched off does not show up in Emby. With `targets` you can name it
anyway and give it a `wake_action`: any Home Assistant action that turns on the device
and opens Emby. When you pick such a client, the card runs the action as the logged-in
Home Assistant user, waits up to 60 seconds for the client to connect to Emby, and then
starts playback. If it does not show up, the card says "The client did not respond".

## Compatibility

| | Tested versions |
| --- | --- |
| Home Assistant | Automated tests run against 2026.2. Not yet tested on a real installation. |
| Emby Server | Not yet tested against a real server. |

Six assumptions about Emby cannot be confirmed from the documentation. They are checked
with `scripts/verify_emby.py`, and each has a fallback:

| ID | Assumption | Result | Fallback |
| --- | --- | --- | --- |
| V1 | `/Suggestions` exists and answers with `Items` | Not yet run | Implemented: the row is hidden when the endpoint is missing |
| V2 | `SearchTerm` searches titles across types | Not yet run | Not implemented: one search per type, merged |
| V3 | Playback control is accepted with API key and `ControllingUserId` | Not yet run | Not implemented: login with user name and password |
| V4 | All endpoints behave the same on Emby 4.8 and the newest 4.9 | Not yet run | Raise the minimum version |
| V5 | `/Users` returns all users with an API key | Not yet run | Not implemented: `/Users/Public` and a free-text user ID |
| V6 | Sessions have the field `SupportsRemoteControl` | Not yet run | Implemented: a non-empty `SupportedCommands` counts |

Run the checks against your own server (nothing is changed; `--play` starts and pauses
one movie on the first controllable client):

```bash
python scripts/verify_emby.py --url http://192.168.1.10:8096 --api-key KEY \
    --user thomas --movie "A movie title" --episode "An episode title" --play
```

## Limitations

- Playback requires that the Emby client is open, or that it can be woken with a
  `wake_action`.
- Session state is polled every 2 seconds while something is playing and every 5 seconds
  otherwise, and only while at least one card is open.
- Image addresses are signed with a secret that is created when Home Assistant starts.
  They stop working after a restart, and the card fetches new ones when it reloads.
- The integration creates no entities, so playback cannot be used in automations yet.

## How it works

```text
Card (browser)  <-- WebSocket, images -->  Home Assistant: emby_library  -- REST -->  Emby Server
```

- The card uses eleven WebSocket commands with the prefix `emby_library/`.
- Images go through `/api/emby_library/image/...` in Home Assistant. Each address carries
  an HMAC signature for exactly one image and one width, so no login is needed and the
  browser can cache posters.
- The API key is stored in the config entry and is redacted from diagnostics.

## Development

```bash
# Backend
python -m venv .venv && . .venv/bin/activate
pip install -r requirements_test.txt
pytest && ruff check . && mypy

# Card
cd frontend
npm ci
npm run check        # tsc, eslint and vitest
npm run build        # writes custom_components/emby_library/frontend/emby-library-card.js
```

The built bundle is committed because HACS installs `custom_components/emby_library/`
straight from the repository. CI fails when the committed bundle differs from a fresh build.

Releases: set `version` in `manifest.json`, commit, and push the tag `v<version>`.

## License

MIT
