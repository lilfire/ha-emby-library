// Validation of the card configuration (spec 7.1).

import type {
  CardConfig,
  PosterSize,
  ShelfName,
  StartView,
  TargetConfig,
  WakeAction,
} from "./types";

export const SHELVES: readonly ShelfName[] = ["resume", "next_up", "latest", "suggestions"];
export const START_VIEWS: readonly StartView[] = ["home", "library", "search"];
export const POSTER_SIZES: readonly PosterSize[] = ["small", "medium", "large"];
export const POSTER_WIDTHS: Record<PosterSize, number> = { small: 110, medium: 150, large: 190 };

export const DEFAULT_CONFIG: Omit<CardConfig, "type"> = {
  start_view: "home",
  shelves: [...SHELVES],
  shelf_limit: 20,
  show_now_playing: true,
  show_search: true,
  poster_size: "medium",
  height: "auto",
  default_target: null,
  targets: [],
};

// Keys Home Assistant itself may add to any card configuration.
const HA_KEYS = ["type", "view_layout", "layout_options", "grid_options", "visibility"];
const KNOWN_KEYS = [...HA_KEYS, "entry", ...Object.keys(DEFAULT_CONFIG)];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function oneOf<T extends string>(key: string, value: unknown, allowed: readonly T[]): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new Error(`"${key}" must be one of: ${allowed.join(", ")}`);
  }
  return value as T;
}

function bool(key: string, value: unknown): boolean {
  if (typeof value !== "boolean") throw new Error(`"${key}" must be true or false`);
  return value;
}

function validateWakeAction(prefix: string, value: unknown): WakeAction {
  if (!isObject(value)) throw new Error(`"${prefix}" must be an action`);
  const action = value.action ?? value.service;
  if (typeof action !== "string" || !/^[a-z0-9_]+\.[a-z0-9_]+$/.test(action)) {
    throw new Error(`"${prefix}.action" must be an action such as script.turn_on`);
  }
  const result: WakeAction = { action };
  if (value.target !== undefined) {
    if (!isObject(value.target)) throw new Error(`"${prefix}.target" must be a mapping`);
    result.target = value.target;
  }
  if (value.data !== undefined) {
    if (!isObject(value.data)) throw new Error(`"${prefix}.data" must be a mapping`);
    result.data = value.data;
  }
  return result;
}

function validateTargets(value: unknown): TargetConfig[] {
  if (!Array.isArray(value)) throw new Error('"targets" must be a list');
  return value.map((raw: unknown, index) => {
    const prefix = `targets[${index}]`;
    if (!isObject(raw)) throw new Error(`"${prefix}" must be a mapping`);
    for (const key of Object.keys(raw)) {
      if (!["name", "device_id", "wake_action"].includes(key)) {
        throw new Error(`Unknown field "${prefix}.${key}"`);
      }
    }
    if (typeof raw.name !== "string" || !raw.name) {
      throw new Error(`"${prefix}.name" is required`);
    }
    if (typeof raw.device_id !== "string" || !raw.device_id) {
      throw new Error(`"${prefix}.device_id" is required`);
    }
    const target: TargetConfig = { name: raw.name, device_id: raw.device_id };
    if (raw.wake_action !== undefined) {
      target.wake_action = validateWakeAction(`${prefix}.wake_action`, raw.wake_action);
    }
    return target;
  });
}

/** Validate a raw configuration and fill in defaults. Throws readable errors. */
export function validateConfig(raw: unknown): CardConfig {
  if (!isObject(raw)) throw new Error("Invalid configuration");
  for (const key of Object.keys(raw)) {
    if (!KNOWN_KEYS.includes(key)) throw new Error(`Unknown field "${key}"`);
  }

  const config: CardConfig = {
    type: typeof raw.type === "string" ? raw.type : "custom:emby-library-card",
    ...DEFAULT_CONFIG,
    shelves: [...DEFAULT_CONFIG.shelves],
    targets: [],
  };

  if (raw.entry !== undefined && raw.entry !== null && raw.entry !== "") {
    if (typeof raw.entry !== "string") throw new Error('"entry" must be a config entry ID');
    config.entry = raw.entry;
  }
  if (raw.start_view !== undefined) {
    config.start_view = oneOf("start_view", raw.start_view, START_VIEWS);
  }
  if (raw.shelves !== undefined) {
    if (!Array.isArray(raw.shelves)) throw new Error('"shelves" must be a list');
    const shelves = raw.shelves.map((shelf: unknown) => oneOf("shelves", shelf, SHELVES));
    if (new Set(shelves).size !== shelves.length) {
      throw new Error('"shelves" cannot contain the same row twice');
    }
    config.shelves = shelves;
  }
  if (raw.shelf_limit !== undefined) {
    const limit = raw.shelf_limit;
    if (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new Error('"shelf_limit" must be a whole number from 1 to 50');
    }
    config.shelf_limit = limit;
  }
  if (raw.show_now_playing !== undefined) {
    config.show_now_playing = bool("show_now_playing", raw.show_now_playing);
  }
  if (raw.show_search !== undefined) {
    config.show_search = bool("show_search", raw.show_search);
  }
  if (raw.poster_size !== undefined) {
    config.poster_size = oneOf("poster_size", raw.poster_size, POSTER_SIZES);
  }
  if (raw.height !== undefined && raw.height !== "auto") {
    const height = raw.height;
    if (typeof height !== "number" || !Number.isFinite(height) || height < 200) {
      throw new Error('"height" must be "auto" or a number of pixels (at least 200)');
    }
    config.height = Math.round(height);
  }
  if (raw.default_target !== undefined && raw.default_target !== null) {
    if (typeof raw.default_target !== "string" || !raw.default_target) {
      throw new Error('"default_target" must be a device_id');
    }
    config.default_target = raw.default_target;
  }
  if (raw.targets !== undefined && raw.targets !== null) {
    config.targets = validateTargets(raw.targets);
  }
  if (config.start_view === "search" && !config.show_search) {
    throw new Error('"start_view: search" requires "show_search: true"');
  }
  return config;
}

// --- Visual editor ---------------------------------------------------------

/** Values as ha-form sees them. `height` 0 means automatic. */
export interface FormData {
  entry?: string;
  start_view: string;
  shelves: string[];
  shelf_limit: number;
  poster_size: string;
  height: number;
  show_now_playing: boolean;
  show_search: boolean;
  default_target?: string;
}

const MIN_HEIGHT = 200;

/** Convert form values to the smallest equivalent card configuration. */
export function formToConfig(
  data: FormData,
  base: Record<string, unknown>,
): Record<string, unknown> {
  const height = Number(data.height) || 0;
  const shelves = data.shelves.filter((shelf) => (SHELVES as readonly string[]).includes(shelf));
  const defaultShelves =
    shelves.length === SHELVES.length && shelves.every((shelf, i) => shelf === SHELVES[i]);
  // undefined means "same as the default": the key is left out.
  const values: Record<string, unknown> = {
    entry: data.entry || undefined,
    start_view: data.start_view === DEFAULT_CONFIG.start_view ? undefined : data.start_view,
    shelves: defaultShelves ? undefined : shelves,
    shelf_limit: data.shelf_limit === DEFAULT_CONFIG.shelf_limit ? undefined : data.shelf_limit,
    poster_size: data.poster_size === DEFAULT_CONFIG.poster_size ? undefined : data.poster_size,
    height: height <= 0 ? undefined : Math.max(MIN_HEIGHT, Math.round(height)),
    show_now_playing: data.show_now_playing ? undefined : false,
    show_search: data.show_search ? undefined : false,
    default_target: data.default_target || undefined,
  };
  const config = Object.fromEntries(Object.entries(base).filter(([key]) => !(key in values)));
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) config[key] = value;
  }
  return config;
}

export function configToForm(config: CardConfig): FormData {
  return {
    entry: config.entry,
    start_view: config.start_view,
    shelves: [...config.shelves],
    shelf_limit: config.shelf_limit,
    poster_size: config.poster_size,
    height: config.height === "auto" ? 0 : config.height,
    show_now_playing: config.show_now_playing,
    show_search: config.show_search,
    default_target: config.default_target ?? undefined,
  };
}
