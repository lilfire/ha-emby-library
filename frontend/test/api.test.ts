import { describe, expect, it, vi } from "vitest";

import { EmbyApi, EmbyApiError, toApiError } from "../src/api";
import type { HomeAssistant, SessionsEvent } from "../src/types";

function mockHass(result: unknown = {}) {
  const sendMessagePromise = vi.fn().mockResolvedValue(result);
  const unsubscribe = vi.fn();
  const subscribeMessage = vi.fn().mockResolvedValue(unsubscribe);
  const hass = {
    connection: { sendMessagePromise, subscribeMessage },
  } as unknown as HomeAssistant;
  return { hass, sendMessagePromise, subscribeMessage, unsubscribe };
}

describe("EmbyApi", () => {
  it("sends advanced filters, random selection, statistics and watched status", async () => {
    const { hass, sendMessagePromise } = mockHass({ item: { id: "movie" } });
    const api = new EmbyApi(hass, "entry");
    const filters = { parent_id: "library", genre: "Drama", year: 2020,
      max_runtime_minutes: 100, max_official_rating: "PG-13", filter: "played" as const };
    await api.items({ ...filters, start_index: 60 });
    expect(sendMessagePromise).toHaveBeenLastCalledWith({ type: "emby_library/items", entry_id: "entry", ...filters, start_index: 60 });
    expect(await api.random({ ...filters, start_index: 60 })).toEqual({ id: "movie" });
    expect(sendMessagePromise).toHaveBeenLastCalledWith({ type: "emby_library/random", entry_id: "entry", ...filters });
    await api.statistics();
    expect(sendMessagePromise).toHaveBeenLastCalledWith({ type: "emby_library/statistics", entry_id: "entry" });
    await api.setPlayed("movie", false);
    expect(sendMessagePromise).toHaveBeenLastCalledWith({ type: "emby_library/set_played", entry_id: "entry", item_id: "movie", played: false });
  });
  it("sends the command prefix and the entry id", async () => {
    const { hass, sendMessagePromise } = mockHass({ views: [{ id: "v" }] });
    const views = await new EmbyApi(hass, "entry1").views();
    expect(views).toEqual([{ id: "v" }]);
    expect(sendMessagePromise).toHaveBeenCalledWith({
      type: "emby_library/views",
      entry_id: "entry1",
    });
  });

  it("omits entry_id when no entry is chosen, and always for entries", async () => {
    const { hass, sendMessagePromise } = mockHass({ entries: [], views: [] });
    await new EmbyApi(hass).views();
    expect(sendMessagePromise).toHaveBeenLastCalledWith({ type: "emby_library/views" });
    await new EmbyApi(hass, "entry1").entries();
    expect(sendMessagePromise).toHaveBeenLastCalledWith({ type: "emby_library/entries" });
  });

  it("leaves out undefined parameters", async () => {
    const { hass, sendMessagePromise } = mockHass({ items: [], total: 0 });
    const api = new EmbyApi(hass, "e");
    await api.items({ parent_id: "p", sort_by: "SortName", filter: undefined, start_index: 0 });
    expect(sendMessagePromise).toHaveBeenLastCalledWith({
      type: "emby_library/items",
      entry_id: "e",
      parent_id: "p",
      sort_by: "SortName",
      start_index: 0,
    });
    await api.shelf("resume");
    expect(sendMessagePromise).toHaveBeenLastCalledWith({
      type: "emby_library/shelf",
      entry_id: "e",
      shelf: "resume",
    });
  });

  it("maps every command to the contract", async () => {
    const { hass, sendMessagePromise } = mockHass({
      items: [],
      item: { id: "1" },
      played_item_id: "212",
    });
    const api = new EmbyApi(hass, "e");
    const last = () => sendMessagePromise.mock.lastCall?.[0];

    await api.shelf("next_up", 10);
    expect(last()).toMatchObject({ type: "emby_library/shelf", shelf: "next_up", limit: 10 });
    expect(await api.item("1")).toEqual({ id: "1" });
    expect(last()).toMatchObject({ type: "emby_library/item", item_id: "1" });
    await api.seasons("200");
    expect(last()).toMatchObject({ type: "emby_library/seasons", series_id: "200" });
    await api.episodes("200", "210");
    expect(last()).toMatchObject({
      type: "emby_library/episodes",
      series_id: "200",
      season_id: "210",
    });
    await api.search("arrival");
    expect(last()).toMatchObject({ type: "emby_library/search", term: "arrival" });
    expect(await api.play("s1", "200", "resume")).toBe("212");
    expect(last()).toMatchObject({
      type: "emby_library/play",
      session_id: "s1",
      item_id: "200",
      mode: "resume",
    });
    await api.control("s1", "seek", 90);
    expect(last()).toEqual({
      type: "emby_library/control",
      entry_id: "e",
      session_id: "s1",
      command: "seek",
      value: 90,
    });
    await api.control("s1", "pause");
    expect(last()).not.toHaveProperty("value");
    await api.control("s1", "set_volume", 0);
    expect(last()).toHaveProperty("value", 0);
  });

  it("turns Home Assistant errors into typed errors", async () => {
    const { hass, sendMessagePromise } = mockHass();
    sendMessagePromise.mockRejectedValue({ code: "emby_unreachable", message: "Cannot reach" });
    const error = await new EmbyApi(hass, "e").views().catch((err: unknown) => err);
    expect(error).toBeInstanceOf(EmbyApiError);
    expect((error as EmbyApiError).code).toBe("emby_unreachable");
    expect((error as EmbyApiError).message).toBe("Cannot reach");
  });

  it("maps unknown errors to 'unknown'", () => {
    expect(toApiError({ code: "unknown_command", message: "x" }).code).toBe("unknown");
    expect(toApiError(new Error("boom")).code).toBe("unknown");
    expect(toApiError(undefined).code).toBe("unknown");
    const original = new EmbyApiError("not_found", "x");
    expect(toApiError(original)).toBe(original);
  });

  it("subscribes to sessions and unsubscribes", async () => {
    const { hass, subscribeMessage, unsubscribe } = mockHass();
    const events: SessionsEvent[] = [];
    const stop = await new EmbyApi(hass, "e").subscribeSessions((event) => events.push(event));
    expect(subscribeMessage).toHaveBeenCalledWith(expect.any(Function), {
      type: "emby_library/sessions/subscribe",
      entry_id: "e",
    });
    const callback = subscribeMessage.mock.calls[0]?.[0] as (event: SessionsEvent) => void;
    callback({ available: true, sessions: [] });
    expect(events).toEqual([{ available: true, sessions: [] }]);
    stop();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it("reports subscription failures as typed errors", async () => {
    const { hass, subscribeMessage } = mockHass();
    subscribeMessage.mockRejectedValue({ code: "entry_not_found", message: "x" });
    await expect(new EmbyApi(hass, "e").subscribeSessions(() => undefined)).rejects.toMatchObject({
      code: "entry_not_found",
    });
  });
});
