import { describe, expect, it } from "vitest";

import { DEFAULT_CONFIG, configToForm, formToConfig, validateConfig } from "../src/config";

const TYPE = "custom:emby-library-card";

describe("validateConfig", () => {
  it("fills in defaults", () => {
    expect(validateConfig({ type: TYPE })).toEqual({ type: TYPE, ...DEFAULT_CONFIG });
  });

  it("accepts the full example from the specification", () => {
    const config = validateConfig({
      type: TYPE,
      entry: "01JABCDEF",
      start_view: "home",
      shelves: ["resume", "next_up", "latest", "suggestions"],
      shelf_limit: 20,
      show_now_playing: true,
      show_search: true,
      poster_size: "medium",
      height: "auto",
      default_target: null,
      targets: [
        {
          name: "Stue-TV",
          device_id: "9ef8d0a2",
          wake_action: {
            action: "script.turn_on",
            target: { entity_id: "script.start_emby_stue" },
          },
        },
      ],
    });
    expect(config.entry).toBe("01JABCDEF");
    expect(config.targets[0]?.wake_action?.action).toBe("script.turn_on");
    expect(config.height).toBe("auto");
  });

  it("accepts fields Home Assistant adds itself", () => {
    expect(() =>
      validateConfig({ type: TYPE, grid_options: { columns: 12 }, visibility: [] }),
    ).not.toThrow();
  });

  it("accepts the legacy service key in wake_action", () => {
    const config = validateConfig({
      type: TYPE,
      targets: [{ name: "TV", device_id: "x", wake_action: { service: "switch.turn_on" } }],
    });
    expect(config.targets[0]?.wake_action).toEqual({ action: "switch.turn_on" });
  });

  it("accepts a volume_entity on a target without a wake_action", () => {
    const config = validateConfig({
      type: TYPE,
      targets: [{ name: "TV", device_id: "x", volume_entity: "media_player.stuetv_2" }],
    });
    expect(config.targets[0]).toEqual({
      name: "TV",
      device_id: "x",
      volume_entity: "media_player.stuetv_2",
    });
  });

  it.each([
    [{ colour: "red" }, 'Unknown field "colour"'],
    [{ start_view: "music" }, '"start_view" must be one of: home, library, search'],
    [{ shelves: "resume" }, '"shelves" must be a list'],
    [{ shelves: ["resume", "music"] }, '"shelves" must be one of'],
    [{ shelves: ["resume", "resume"] }, "same row twice"],
    [{ shelf_limit: 0 }, '"shelf_limit" must be a whole number from 1 to 50'],
    [{ shelf_limit: 51 }, '"shelf_limit"'],
    [{ shelf_limit: 2.5 }, '"shelf_limit"'],
    [{ shelf_limit: "20" }, '"shelf_limit"'],
    [{ show_now_playing: "yes" }, '"show_now_playing" must be true or false'],
    [{ show_search: 1 }, '"show_search" must be true or false'],
    [{ poster_size: "huge" }, '"poster_size" must be one of: small, medium, large'],
    [{ height: "tall" }, '"height" must be "auto" or a number'],
    [{ height: 50 }, '"height"'],
    [{ default_target: 5 }, '"default_target" must be a device_id'],
    [{ entry: 5 }, '"entry" must be a config entry ID'],
    [{ targets: {} }, '"targets" must be a list'],
    [{ targets: [{ device_id: "x" }] }, '"targets[0].name" is required'],
    [{ targets: [{ name: "TV" }] }, '"targets[0].device_id" is required'],
    [{ targets: [{ name: "TV", device_id: "x", icon: "mdi:tv" }] }, 'Unknown field "targets[0].icon"'],
    [
      { targets: [{ name: "TV", device_id: "x", wake_action: { action: "turn on" } }] },
      '"targets[0].wake_action.action" must be an action',
    ],
    [
      { targets: [{ name: "TV", device_id: "x", wake_action: { action: "a.b", target: "x" } }] },
      '"targets[0].wake_action.target" must be a mapping',
    ],
    [
      { targets: [{ name: "TV", device_id: "x", volume_entity: "light.tv" }] },
      '"targets[0].volume_entity" must be a media_player entity',
    ],
    [{ start_view: "search", show_search: false }, 'requires "show_search: true"'],
  ])("rejects %j with a readable error", (extra, message) => {
    expect(() => validateConfig({ type: TYPE, ...extra })).toThrow(message);
  });

  it("rejects things that are not a configuration", () => {
    expect(() => validateConfig(null)).toThrow("Invalid configuration");
    expect(() => validateConfig([])).toThrow("Invalid configuration");
  });

  it("accepts a pixel height and an empty shelf list", () => {
    expect(validateConfig({ type: TYPE, height: 600.4 }).height).toBe(600);
    expect(validateConfig({ type: TYPE, shelves: [] }).shelves).toEqual([]);
  });
});

describe("editor mapping", () => {
  it("round-trips the defaults to a minimal configuration", () => {
    const form = configToForm(validateConfig({ type: TYPE }));
    expect(form.height).toBe(0);
    expect(formToConfig(form, { type: TYPE })).toEqual({ type: TYPE });
  });

  it("keeps targets and writes only non-default values", () => {
    const base = { type: TYPE, targets: [{ name: "TV", device_id: "x" }] };
    const form = configToForm(validateConfig(base));
    const config = formToConfig(
      {
        ...form,
        entry: "abc",
        shelves: ["latest", "resume"],
        shelf_limit: 10,
        height: 120,
        show_search: false,
        default_target: "x",
      },
      base,
    );
    expect(config).toEqual({
      ...base,
      entry: "abc",
      shelves: ["latest", "resume"],
      shelf_limit: 10,
      height: 200,
      show_search: false,
      default_target: "x",
    });
    expect(() => validateConfig(config)).not.toThrow();
  });

  it("removes values that are set back to the default", () => {
    const base = { type: TYPE, entry: "abc", height: 500, poster_size: "large" };
    const form = configToForm(validateConfig(base));
    expect(form.height).toBe(500);
    const config = formToConfig(
      { ...form, entry: undefined, height: 0, poster_size: "medium" },
      base,
    );
    expect(config).toEqual({ type: TYPE });
  });
});
