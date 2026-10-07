// Pure helpers: image choice, formatting, position interpolation and target choice.

import type { ExternalVolume, HassEntity, Item, Session, TargetConfig } from "./types";

export type ImageShape = "poster" | "still";

/** Choose the image for a tile; falls back to the other shape before giving up. */
export function pickImage(item: Item, shape: ImageShape): string | null {
  const { poster, still, backdrop } = item.images;
  return shape === "poster" ? (poster ?? null) : (still ?? backdrop ?? null);
}

/** "1 h 56 min", "45 min" or "" when unknown. */
export function formatRuntime(seconds: number | null | undefined, h = "h", min = "min"): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} ${min}`;
  return minutes === 0 ? `${hours} ${h}` : `${hours} ${h} ${minutes} ${min}`;
}

/** Clock position: "1:02:03" or "2:03". */
export function formatClock(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

/** "S1E2", or "" for specials without numbers. */
export function episodeCode(item: Pick<Item, "season_number" | "episode_number">): string {
  if (item.season_number === null || item.episode_number === null) return "";
  return `S${item.season_number}E${item.episode_number}`;
}

/** "S1E2 · Title", or only the title for specials. */
export function episodeLabel(item: Item): string {
  const code = episodeCode(item);
  return code ? `${code} · ${item.name}` : item.name;
}

/** The two caption lines under a tile. Unknown values are left out. */
export function tileCaption(item: Item): { title: string; subtitle: string } {
  if (item.type === "Episode") {
    return item.series_name
      ? { title: item.series_name, subtitle: episodeLabel(item) }
      : { title: episodeLabel(item), subtitle: "" };
  }
  return { title: item.name, subtitle: item.year !== null ? String(item.year) : "" };
}

/** Position of a session `elapsedMs` after it was received. */
export function interpolatePosition(
  session: Pick<Session, "state" | "position_s" | "duration_s">,
  elapsedMs: number,
): number {
  const base = session.position_s ?? 0;
  if (session.state !== "playing") return base;
  const position = base + Math.max(0, elapsedMs) / 1000;
  return session.duration_s !== null ? Math.min(position, session.duration_s) : position;
}

/** Progress 0-1 for a position and a duration. */
export function fraction(position: number | null, duration: number | null): number {
  if (position === null || duration === null || duration <= 0) return 0;
  return Math.min(1, Math.max(0, position / duration));
}

export const targetStorageKey = (entryId: string): string =>
  `emby-library-card:target:${entryId}`;

/**
 * Preselected device: stored choice, then default_target, then the only
 * available client. A device counts when it is online or a configured target.
 */
export function chooseDevice(
  stored: string | null,
  defaultTarget: string | null,
  sessions: readonly Session[],
  targets: readonly TargetConfig[],
): string | null {
  const controllable = sessions.filter((session) => session.controllable);
  const known = (deviceId: string | null): deviceId is string =>
    deviceId !== null &&
    (controllable.some((session) => session.device_id === deviceId) ||
      targets.some((target) => target.device_id === deviceId));
  if (known(stored)) return stored;
  if (known(defaultTarget)) return defaultTarget;
  const devices = new Set(controllable.map((session) => session.device_id));
  if (devices.size === 1 && controllable.length === 1) return controllable[0]!.device_id;
  return null;
}

/** The controllable session for a device, if it is online. */
export function sessionForDevice(
  deviceId: string | null,
  sessions: readonly Session[],
): Session | null {
  if (deviceId === null) return null;
  return (
    sessions.find((session) => session.controllable && session.device_id === deviceId) ?? null
  );
}

/** Group search hits into movies, series and episodes, in that order. */
export function groupSearch(items: readonly Item[]): {
  movies: Item[];
  series: Item[];
  episodes: Item[];
} {
  return {
    movies: items.filter((item) => item.type === "Movie" || item.type === "Video"),
    series: items.filter((item) => item.type === "Series"),
    episodes: items.filter((item) => item.type === "Episode"),
  };
}

/** The window of tiles kept in the DOM for very large libraries. */
export function tileWindow(
  start: number,
  loaded: number,
  maxTiles: number,
  columns: number,
): number {
  const cols = Math.max(1, columns);
  if (loaded - start <= maxTiles) return start;
  const excess = loaded - start - maxTiles;
  return start + Math.ceil(excess / cols) * cols;
}

const FEATURE_VOLUME_SET = 4;
const FEATURE_VOLUME_MUTE = 8;

/**
 * Volume for each client that has a `volume_entity`, keyed by device_id.
 * Entities that are missing or unavailable are left out, so the card falls
 * back to what Emby offers for that client.
 */
export function externalVolumes(
  targets: readonly TargetConfig[],
  states: Record<string, HassEntity> | undefined,
): Record<string, ExternalVolume> {
  const result: Record<string, ExternalVolume> = {};
  for (const target of targets) {
    const entityId = target.volume_entity;
    const entity = entityId ? states?.[entityId] : undefined;
    if (!entityId || !entity || entity.state === "unavailable" || entity.state === "unknown") {
      continue;
    }
    const features = Number(entity.attributes.supported_features) || 0;
    const level = entity.attributes.volume_level;
    const canSet = (features & FEATURE_VOLUME_SET) !== 0;
    const canMute = (features & FEATURE_VOLUME_MUTE) !== 0;
    if (!canSet && !canMute) continue;
    result[target.device_id] = {
      entityId,
      level:
        typeof level === "number" && Number.isFinite(level)
          ? Math.round(Math.min(1, Math.max(0, level)) * 100)
          : null,
      muted: entity.attributes.is_volume_muted === true,
      canSet,
      canMute,
    };
  }
  return result;
}
