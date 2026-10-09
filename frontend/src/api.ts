// Typed WebSocket calls. The card never talks to Emby directly.

import type {
  ControlCommand,
  Entry,
  ErrorCode,
  HomeAssistant,
  Item,
  ItemDetail,
  ItemFilter,
  LibraryStatistics,
  PlayMode,
  SessionsEvent,
  ShelfName,
  SortField,
  SortOrder,
  View,
} from "./types";

const KNOWN_ERRORS: readonly ErrorCode[] = [
  "entry_required",
  "entry_not_found",
  "emby_unreachable",
  "emby_auth_failed",
  "not_found",
  "session_not_found",
  "not_controllable",
  "unsupported_command",
];

export class EmbyApiError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = "EmbyApiError";
    this.code = code;
  }
}

export function toApiError(err: unknown): EmbyApiError {
  if (err instanceof EmbyApiError) return err;
  const raw = (err ?? {}) as { code?: unknown; message?: unknown };
  const code = KNOWN_ERRORS.find((known) => known === raw.code) ?? "unknown";
  return new EmbyApiError(code, typeof raw.message === "string" ? raw.message : String(err));
}

export interface ItemsQuery {
  genre?: string;
  year?: number;
  max_runtime_minutes?: number;
  max_official_rating?: string;
  parent_id: string;
  sort_by?: SortField;
  sort_order?: SortOrder;
  start_index?: number;
  limit?: number;
  filter?: ItemFilter;
}

export class EmbyApi {
  constructor(
    private readonly hass: HomeAssistant,
    private readonly entryId?: string,
  ) {}

  private async send<T>(command: string, data: object = {}): Promise<T> {
    const message: Record<string, unknown> = { type: `emby_library/${command}` };
    if (this.entryId !== undefined && command !== "entries") message.entry_id = this.entryId;
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) message[key] = value;
    }
    try {
      return await this.hass.connection.sendMessagePromise<T>(message);
    } catch (err) {
      throw toApiError(err);
    }
  }

  async entries(): Promise<Entry[]> {
    return (await this.send<{ entries: Entry[] }>("entries")).entries;
  }

  async views(): Promise<View[]> {
    return (await this.send<{ views: View[] }>("views")).views;
  }

  async shelf(shelf: ShelfName, limit?: number): Promise<Item[]> {
    return (await this.send<{ items: Item[] }>("shelf", { shelf, limit })).items;
  }

  async items(query: ItemsQuery): Promise<{ items: Item[]; total: number }> {
    return this.send<{ items: Item[]; total: number }>("items", query);
  }

  async item(itemId: string): Promise<ItemDetail> {
    return (await this.send<{ item: ItemDetail }>("item", { item_id: itemId })).item;
  }

  async random(query: ItemsQuery): Promise<ItemDetail | null> {
    const { parent_id, filter, genre, year, max_runtime_minutes, max_official_rating } = query;
    return (await this.send<{ item: ItemDetail | null }>("random", {
      parent_id, filter, genre, year, max_runtime_minutes, max_official_rating,
    })).item;
  }

  async statistics(): Promise<LibraryStatistics> {
    return this.send<LibraryStatistics>("statistics");
  }

  async setPlayed(itemId: string, played: boolean): Promise<void> {
    await this.send("set_played", { item_id: itemId, played });
  }

  async seasons(seriesId: string): Promise<Item[]> {
    return (await this.send<{ items: Item[] }>("seasons", { series_id: seriesId })).items;
  }

  async episodes(seriesId: string, seasonId: string): Promise<Item[]> {
    return (
      await this.send<{ items: Item[] }>("episodes", { series_id: seriesId, season_id: seasonId })
    ).items;
  }

  async search(term: string, limit?: number): Promise<Item[]> {
    return (await this.send<{ items: Item[] }>("search", { term, limit })).items;
  }

  async play(sessionId: string, itemId: string, mode: PlayMode): Promise<string> {
    const result = await this.send<{ played_item_id: string }>("play", {
      session_id: sessionId,
      item_id: itemId,
      mode,
    });
    return result.played_item_id;
  }

  async control(sessionId: string, command: ControlCommand, value?: number): Promise<void> {
    await this.send<Record<string, never>>("control", { session_id: sessionId, command, value });
  }

  async subscribeSessions(callback: (event: SessionsEvent) => void): Promise<() => void> {
    const message: Record<string, unknown> = { type: "emby_library/sessions/subscribe" };
    if (this.entryId !== undefined) message.entry_id = this.entryId;
    try {
      const unsubscribe = await this.hass.connection.subscribeMessage<SessionsEvent>(
        callback,
        message,
      );
      return () => {
        // The connection may already be gone; that is fine.
        Promise.resolve(unsubscribe()).catch(() => undefined);
      };
    } catch (err) {
      throw toApiError(err);
    }
  }
}
