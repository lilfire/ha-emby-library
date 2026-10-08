# Emby Library for Home Assistant

A Home Assistant integration with its own dashboard card for movies and series in Emby:
see what is playing, browse the library, search, and start playback on any Emby client.

The card only talks to Home Assistant. Home Assistant talks to Emby. The API key never
reaches the browser, and it works when Home Assistant is on https and Emby is on http.

This project is unofficial and not affiliated with Emby.

> **Status: 0.3.1.** The code is covered by automated
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

## Changes in 0.3.1

- Adding clients in the visual editor selects them for the card. Changing or removing
  clients updates the selection and clears a default player that is no longer selected.
- **Default player** appears below client settings when at least two clients are selected.
- **Show all clients** overrides the configured selection. In YAML, use
  `allowed_targets: null` for this override; omit it to follow the configured `targets`.
- Wake actions are configured in YAML and preserved when editing other client settings.
- Disabling Search in the editor resets a Search start view to Home.

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
   The integration registers the card as a dashboard resource by itself and keeps the
   address up to date. If you manage dashboard resources in YAML (`resource_mode: yaml`),
   the card is loaded as an extra frontend module instead and no resource entry is needed.

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
allowed_targets: null        # all clients; or a list of Emby device IDs for this card
targets:                     # optional, also available in the visual editor
  - name: Living room TV
    device_id: 9ef8d0a2...
    wake_action:
      action: script.turn_on
      target: { entity_id: script.start_emby_living_room }
    volume_entity: media_player.living_room_tv   # optional
    control_entity: media_player.living_room_tv  # optional
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
| `allowed_targets` | configured targets, or all clients if none | Only these Emby device IDs appear in this card; `[]` shows no clients and `null` explicitly shows all clients. Applies to client selection and Now playing. |
| `targets` | none | Select clients for the card and configure their names, wake actions and controls, see below. |

The visual editor includes **Client settings**: add a client, choose an online Emby
client or enter its device ID, then select media players for volume and playback
control. Wake actions are an advanced YAML-only setting. The visual editor preserves
existing wake actions when you change a client's name, volume or playback controls.

Home rows are selected under **Home rows**. Select all four to show Continue watching,
Next up, Recently added and Recommended; rows without any results are hidden.
Library browsing, item details and playback buttons are accessed inside the card,
and Now playing appears when a client is playing.

### Playback and clients

Each card can show its own selection of clients. In the visual editor, turn off
**Show all clients**, then choose **Clients available in this card**. For example,
select only the living room TV in one card, only the bedroom TV in another, and
both TVs plus the office TV in a third. Selected offline clients remain visible
and can be woken when they have a `wake_action`. **Default player** appears below
client settings only when at least two clients are selected. It offers only those
clients and clears the default when that client leaves the selection. A remembered
browser choice outside the card's selection is ignored. Cards with only one online
client select it automatically.

Adding clients under **Client settings** also selects them for the card. Removing
or changing a client updates the selection and clears a removed preferred client.
Removing the last configured client returns to all discovered clients. **Show all
clients** explicitly overrides this selection while keeping volume, playback and
wake settings. In YAML, omit `allowed_targets` to follow `targets`, or set it to
`null` to show all clients regardless of `targets`.

```yaml
type: custom:emby-library-card
allowed_targets: [living_room_device_id, bedroom_device_id, office_device_id]
default_target: living_room_device_id
```

Emby can only start playback on a client that is open and announces remote control.
The card lists those clients in the client picker (the cast button at the top right).
Clients that have announced remote control and video playback are remembered per
Emby user in Home Assistant, including across restarts. They remain visible when
disconnected, in both the card editor and the client picker. Configure a `wake_action`
to start playback on a disconnected client; without one it is shown as offline and
cannot be used until it connects. Devices not yet observed by this integration can
be added manually under **Client settings**. Video support is checked again when
the client connects, before playback starts.
The choice is remembered per browser. The preselected client is, in order: the stored
choice, `default_target`, and otherwise the only available client.

`device_id` is Emby's device ID. Choose a discovered client under **Client settings**
in the visual editor to avoid entering the ID manually.

### Waking a client with `targets` (advanced, YAML only)

A client that is switched off does not show up in Emby. With `targets` you can name it
anyway and give it a `wake_action`: any Home Assistant action that turns on the device
and opens Emby. When you pick such a client, the card runs the action as the logged-in
Home Assistant user, waits up to 60 seconds for the client to connect to Emby, and then
starts playback. If it does not show up, the card says "The client did not respond".

### Volume through another media player with `volume_entity`

Some Emby clients do not let Emby set the volume. Emby for Android TV, for example,
does not announce the SetVolume command, so the card has no volume slider for it. If
Home Assistant has another `media_player` for the same device (the TV or the receiver),
name it in `volume_entity` on that client:

```yaml
targets:
  - name: Living room TV
    device_id: 9ef8d0a2...
    volume_entity: media_player.living_room_tv
```

Now playing then shows volume and mute for that client and calls
`media_player.volume_set` and `media_player.volume_mute` on the entity, as the
logged-in Home Assistant user. It only applies to the client with that `device_id`.
Other clients keep using Emby's own volume, and so does this one while the entity is
unavailable. `wake_action` is not required.

### Play, pause and stop through another media player with `control_entity`

Some Emby clients ignore Emby's remote control for playback. Emby for Android TV
1.8.54g, for example, starts a movie when asked, but Pause and Stop have no effect, also
from Emby's own dashboard. If Home Assistant has another `media_player` for the same
device, name it in `control_entity` on that client:

```yaml
targets:
  - name: Living room TV
    device_id: 9ef8d0a2...
    control_entity: media_player.living_room_tv
```

The buttons for play, pause, stop, next and previous in Now playing then call
`media_player.media_play`, `media_pause`, `media_stop`, `media_next_track` and
`media_previous_track` on the entity, as the logged-in Home Assistant user. A button is
shown only when the entity supports that action.

- What is playing, the position and whether it is paused still come from Emby, so the
  card follows along a moment after you press a button.
- These actions go to whatever app is in front on the device. When the entity reports
  the app (`app_id` or `app_name`) and it is not Emby, the buttons are hidden. An entity
  that does not report the app cannot be checked.
- Seeking and starting playback still go through Emby, and volume follows
  `volume_entity`. The same entity can be used for both.
- While the entity is unavailable, the card uses Emby's own commands again.

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
