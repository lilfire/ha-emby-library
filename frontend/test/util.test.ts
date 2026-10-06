import { describe, expect, it } from "vitest";

import type { Item, Session, TargetConfig } from "../src/types";
import {
  chooseDevice,
  episodeCode,
  episodeLabel,
  formatClock,
  formatRuntime,
  fraction,
  groupSearch,
  interpolatePosition,
  pickImage,
  sessionForDevice,
  targetStorageKey,
  tileCaption,
  tileWindow,
} from "../src/util";

export function item(overrides: Partial<Item> = {}): Item {
  return {
    id: "1",
    type: "Movie",
    name: "Arrival",
    year: 2016,
    runtime_s: 6960,
    series_id: null,
    series_name: null,
    season_number: null,
    episode_number: null,
    played: false,
    progress: 0,
    position_s: 0,
    unplayed_count: null,
    is_folder: false,
    images: { poster: "/p", still: "/s", backdrop: "/b" },
    ...overrides,
  };
}

export function session(overrides: Partial<Session> = {}): Session {
  return {
    session_id: "s1",
    device_id: "d1",
    device_name: "TV",
    client: "Emby",
    user_name: null,
    controllable: true,
    supported_commands: [],
    state: "idle",
    now_playing: null,
    position_s: null,
    duration_s: null,
    can_seek: false,
    volume: null,
    muted: false,
    ...overrides,
  };
}

describe("pickImage", () => {
  it("uses the poster for posters and the still for stills", () => {
    expect(pickImage(item(), "poster")).toBe("/p");
    expect(pickImage(item(), "still")).toBe("/s");
  });

  it("falls back from still to backdrop, then to nothing", () => {
    expect(pickImage(item({ images: { poster: "/p", still: null, backdrop: "/b" } }), "still")).toBe(
      "/b",
    );
    const none = item({ images: { poster: null, still: null, backdrop: null } });
    expect(pickImage(none, "still")).toBeNull();
    expect(pickImage(none, "poster")).toBeNull();
  });
});

describe("time formatting", () => {
  it("formats runtimes", () => {
    expect(formatRuntime(6960)).toBe("1 h 56 min");
    expect(formatRuntime(7200)).toBe("2 h");
    expect(formatRuntime(2700)).toBe("45 min");
    expect(formatRuntime(20)).toBe("1 min");
    expect(formatRuntime(6960, "t", "min")).toBe("1 t 56 min");
  });

  it("leaves unknown runtimes out", () => {
    expect(formatRuntime(null)).toBe("");
    expect(formatRuntime(undefined)).toBe("");
    expect(formatRuntime(0)).toBe("");
    expect(formatRuntime(Number.NaN)).toBe("");
  });

  it("formats clock positions", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(65)).toBe("1:05");
    expect(formatClock(3723.9)).toBe("1:02:03");
    expect(formatClock(null)).toBe("0:00");
    expect(formatClock(-5)).toBe("0:00");
  });
});

describe("episode numbers", () => {
  const episode = item({
    type: "Episode",
    name: "Half Loop",
    series_name: "Severance",
    season_number: 1,
    episode_number: 2,
  });
  const special = item({ type: "Episode", name: "Behind the Scenes", series_name: "Severance" });

  it("formats season and episode", () => {
    expect(episodeCode(episode)).toBe("S1E2");
    expect(episodeLabel(episode)).toBe("S1E2 · Half Loop");
  });

  it("shows only the title for specials", () => {
    expect(episodeCode(special)).toBe("");
    expect(episodeLabel(special)).toBe("Behind the Scenes");
    expect(episodeCode(item({ season_number: 0, episode_number: 3 }))).toBe("S0E3");
  });

  it("builds tile captions", () => {
    expect(tileCaption(episode)).toEqual({ title: "Severance", subtitle: "S1E2 · Half Loop" });
    expect(tileCaption(item({ type: "Episode", name: "Pilot" }))).toEqual({
      title: "Pilot",
      subtitle: "",
    });
    expect(tileCaption(item())).toEqual({ title: "Arrival", subtitle: "2016" });
    expect(tileCaption(item({ year: null }))).toEqual({ title: "Arrival", subtitle: "" });
  });
});

describe("interpolatePosition", () => {
  it("advances while playing", () => {
    const playing = { state: "playing" as const, position_s: 100, duration_s: 200 };
    expect(interpolatePosition(playing, 0)).toBe(100);
    expect(interpolatePosition(playing, 2500)).toBe(102.5);
    expect(interpolatePosition(playing, -1000)).toBe(100);
  });

  it("never passes the duration", () => {
    expect(
      interpolatePosition({ state: "playing", position_s: 199, duration_s: 200 }, 5000),
    ).toBe(200);
    expect(
      interpolatePosition({ state: "playing", position_s: 199, duration_s: null }, 5000),
    ).toBe(204);
  });

  it("stands still when paused or idle", () => {
    expect(interpolatePosition({ state: "paused", position_s: 50, duration_s: 200 }, 9000)).toBe(
      50,
    );
    expect(interpolatePosition({ state: "idle", position_s: null, duration_s: null }, 9000)).toBe(
      0,
    );
  });

  it("computes fractions", () => {
    expect(fraction(50, 200)).toBe(0.25);
    expect(fraction(500, 200)).toBe(1);
    expect(fraction(null, 200)).toBe(0);
    expect(fraction(5, 0)).toBe(0);
  });
});

describe("target choice", () => {
  const tv = session({ session_id: "s-tv", device_id: "tv" });
  const web = session({ session_id: "s-web", device_id: "web" });
  const speaker = session({ session_id: "s-audio", device_id: "audio", controllable: false });
  const targets: TargetConfig[] = [{ name: "Bedroom", device_id: "bedroom" }];

  it("prefers the stored choice, then default_target, then the only client", () => {
    expect(chooseDevice("web", "tv", [tv, web], [])).toBe("web");
    expect(chooseDevice(null, "tv", [tv, web], [])).toBe("tv");
    expect(chooseDevice(null, null, [tv, speaker], [])).toBe("tv");
    expect(chooseDevice(null, null, [tv, web], [])).toBeNull();
    expect(chooseDevice(null, null, [], [])).toBeNull();
  });

  it("ignores choices that are neither online nor configured", () => {
    expect(chooseDevice("gone", "tv", [tv, web], [])).toBe("tv");
    expect(chooseDevice("gone", "also-gone", [tv, web], [])).toBeNull();
    expect(chooseDevice("audio", null, [tv, web, speaker], [])).toBeNull();
  });

  it("accepts configured targets that are switched off", () => {
    expect(chooseDevice("bedroom", null, [tv, web], targets)).toBe("bedroom");
    expect(chooseDevice(null, "bedroom", [], targets)).toBe("bedroom");
  });

  it("does not guess between two clients on the same device", () => {
    const second = session({ session_id: "s-tv2", device_id: "tv", client: "Other" });
    expect(chooseDevice(null, null, [tv, second], [])).toBeNull();
    expect(chooseDevice("tv", null, [tv, second], [])).toBe("tv");
  });

  it("finds the session for a device", () => {
    expect(sessionForDevice("web", [tv, web])?.session_id).toBe("s-web");
    expect(sessionForDevice("audio", [speaker])).toBeNull();
    expect(sessionForDevice(null, [tv])).toBeNull();
    expect(targetStorageKey("abc")).toBe("emby-library-card:target:abc");
  });
});

describe("groupSearch", () => {
  it("groups hits into movies, series and episodes", () => {
    const groups = groupSearch([
      item({ id: "e", type: "Episode" }),
      item({ id: "m", type: "Movie" }),
      item({ id: "s", type: "Series" }),
      item({ id: "f", type: "Folder" }),
    ]);
    expect(groups.movies.map((i) => i.id)).toEqual(["m"]);
    expect(groups.series.map((i) => i.id)).toEqual(["s"]);
    expect(groups.episodes.map((i) => i.id)).toEqual(["e"]);
  });
});

describe("tileWindow", () => {
  it("keeps everything while under the limit", () => {
    expect(tileWindow(0, 600, 600, 6)).toBe(0);
    expect(tileWindow(120, 700, 600, 6)).toBe(120);
  });

  it("drops whole rows from the top when over the limit", () => {
    expect(tileWindow(0, 660, 600, 6)).toBe(60);
    expect(tileWindow(0, 660, 600, 7)).toBe(63);
    expect(tileWindow(0, 601, 600, 0)).toBe(1);
  });
});
