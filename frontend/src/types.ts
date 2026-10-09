// Contract between the card and the backend (spec chapter 6).

export interface Entry {
  entry_id: string;
  title: string;
  server_name: string;
  server_version: string;
  user_name: string;
}

export type CollectionType = "movies" | "tvshows" | "boxsets" | "mixed";

export interface View {
  id: string;
  name: string;
  collection_type: CollectionType;
  image: string | null;
}

export type ItemType = "Movie" | "Series" | "Season" | "Episode" | "BoxSet" | "Folder" | "Video";

export interface ItemImages {
  poster: string | null;
  still: string | null;
  backdrop: string | null;
}

export interface Item {
  id: string;
  type: ItemType;
  name: string;
  year: number | null;
  runtime_s: number | null;
  series_id: string | null;
  series_name: string | null;
  season_number: number | null;
  episode_number: number | null;
  played: boolean;
  progress: number;
  position_s: number;
  unplayed_count: number | null;
  is_folder: boolean;
  images: ItemImages;
}

export interface ItemDetail extends Item {
  trailers?: { name: string; embed_url: string }[];
  media_sources?: MediaQuality[];
  overview: string | null;
  genres: string[];
  official_rating: string | null;
  community_rating: number | null;
  premiere_date: string | null;
  season_count: number | null;
}

export type ControlCommand =
  | "play"
  | "pause"
  | "play_pause"
  | "stop"
  | "next"
  | "previous"
  | "seek"
  | "set_volume"
  | "mute"
  | "unmute";

export interface Session {
  session_id: string;
  device_id: string;
  device_name: string;
  client: string;
  user_name: string | null;
  controllable: boolean;
  supported_commands: string[];
  state: "playing" | "paused" | "idle";
  now_playing: Item | null;
  position_s: number | null;
  duration_s: number | null;
  can_seek: boolean;
  volume: number | null;
  muted: boolean;
}

export interface SessionsEvent {
  available: boolean;
  sessions: Session[];
  clients?: KnownClient[];
}

/** Previously observed remote-controllable video clients; never live sessions. */
export interface KnownClient {
  device_id: string;
  name: string;
  client: string;
}

export type ShelfName = "resume" | "next_up" | "latest" | "suggestions";
export type SortField = "SortName" | "DateCreated" | "PremiereDate" | "CommunityRating" | "DatePlayed";
export type SortOrder = "asc" | "desc";
export type ItemFilter = "unplayed" | "played" | "favorites";

export interface MediaQuality {
  width: number | null;
  height: number | null;
  video_codec: string | null;
  video_range: string | null;
  color_transfer: string | null;
  size_bytes: number | null;
  container: string | null;
}

export interface LibraryStatistics {
  movies: number;
  series: number;
  episodes: number;
  unplayed_episodes: number;
  runtime_s: number;
}
export type PlayMode = "resume" | "start";

export type ErrorCode =
  | "entry_required"
  | "entry_not_found"
  | "emby_unreachable"
  | "emby_auth_failed"
  | "not_found"
  | "session_not_found"
  | "not_controllable"
  | "unsupported_command"
  | "unknown";

// Card configuration (spec 7.1).

export interface WakeAction {
  action: string;
  target?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export interface TargetConfig {
  name: string;
  device_id: string;
  wake_action?: WakeAction;
  /** A Home Assistant media_player that controls the volume of this client. */
  volume_entity?: string;
  /** A Home Assistant media_player that plays, pauses and stops this client. */
  control_entity?: string;
}

export type StartView = "home" | "library" | "search";
export type PosterSize = "small" | "medium" | "large";

export interface CardConfig {
  type: string;
  entry?: string;
  start_view: StartView;
  shelves: ShelfName[];
  shelf_limit: number;
  show_now_playing: boolean;
  show_search: boolean;
  poster_size: PosterSize;
  height: "auto" | number;
  default_target: string | null;
  /** Derived from the clients explicitly configured for this card. */
  allowed_targets: string[];
  targets: TargetConfig[];
}

// The small part of Home Assistant's frontend API that the card uses.

export interface HassConnection {
  sendMessagePromise<T>(message: Record<string, unknown>): Promise<T>;
  subscribeMessage<T>(
    callback: (event: T) => void,
    message: Record<string, unknown>,
    options?: { resubscribe?: boolean },
  ): Promise<() => Promise<void> | void>;
  addEventListener(event: string, callback: () => void): void;
  removeEventListener(event: string, callback: () => void): void;
}

export interface HassEntity {
  state: string;
  attributes: Record<string, unknown>;
}

/** Volume of a client taken from a Home Assistant media_player. */
export interface ExternalVolume {
  entityId: string;
  level: number | null; // 0-100
  muted: boolean;
  canSet: boolean;
  canMute: boolean;
}

/** Playback control of a client through a Home Assistant media_player. */
export interface ExternalControl {
  entityId: string;
  /** Commands the entity takes right now. Empty while another app is in front. */
  commands: ControlCommand[];
}

export interface HomeAssistant {
  connection: HassConnection;
  states?: Record<string, HassEntity>;
  locale?: { language: string };
  language?: string;
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
    target?: Record<string, unknown>,
  ): Promise<unknown>;
}
