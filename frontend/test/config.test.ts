import { describe, expect, it } from "vitest";

import {
  DEFAULT_CONFIG, configToForm, formToConfig, validateConfig,
  targetToForm, targetFormsToConfig, updateClientSettings,
} from "../src/config";

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

  it("accepts a control_entity next to a volume_entity", () => {
    const config = validateConfig({
      type: TYPE,
      targets: [
        {
          name: "TV",
          device_id: "x",
          control_entity: "media_player.stuetv_2",
          volume_entity: "media_player.receiver",
        },
      ],
    });
    expect(config.targets[0]).toEqual({
      name: "TV",
      device_id: "x",
      control_entity: "media_player.stuetv_2",
      volume_entity: "media_player.receiver",
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
    [
      { targets: [{ name: "TV", device_id: "x", control_entity: "remote.tv" }] },
      '"targets[0].control_entity" must be a media_player entity',
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
  it("clears the search start view when the editor disables search", () => {
    const base = { type: TYPE, start_view: "search" };
    const saved = formToConfig({ ...configToForm(validateConfig(base)), show_search: false }, base);
    expect(saved.start_view).toBeUndefined();
    expect(validateConfig(saved).show_search).toBe(false);
  });
  it("uses configured clients unless Show all clients explicitly overrides them", () => {
    const base = { type: TYPE, targets: [{ name: "Stue", device_id: "tv" }] };
    expect(validateConfig(base).allowed_targets).toEqual(["tv"]);
    const form = configToForm(validateConfig(base));
    expect(form.all_clients).toBe(false);
    const all = formToConfig({ ...form, all_clients: true }, base);
    expect(all.allowed_targets).toBeNull();
    expect(validateConfig(all).allowed_targets).toBeNull();
    expect(validateConfig({ ...base, allowed_targets: [] }).allowed_targets).toEqual([]);
  });

  it("tracks add, change and remove client settings without retaining old restrictions", () => {
    const base = { type: TYPE, targets: [{ name: "Stue", device_id: "tv" }],
      allowed_targets: ["tv", "office"], default_target: "tv" };
    const changed = updateClientSettings(base, [{ name: "Bedroom", device_id: "bedroom" }]);
    expect(validateConfig(changed).allowed_targets).toEqual(["office", "bedroom"]);
    expect(changed.default_target).toBeUndefined();
    const removed = updateClientSettings({ ...base, allowed_targets: ["tv"] }, []);
    expect(removed).toEqual({ type: TYPE });
    expect(validateConfig(removed).allowed_targets).toBeNull();
    const added = updateClientSettings(removed, [{ name: "Stue", device_id: "tv" }]);
    expect(validateConfig(added).allowed_targets).toEqual(["tv"]);
    expect(updateClientSettings({ type: TYPE, allowed_targets: [] }, []).allowed_targets).toEqual([]);
  });

  it("preserves an explicit all-clients override when client settings change", () => {
    const changed = updateClientSettings({ type: TYPE, allowed_targets: null }, [
      { name: "Stue", device_id: "tv", volume_entity: "media_player.tv" },
    ]);
    expect(validateConfig(changed).allowed_targets).toBeNull();
    expect(validateConfig(changed).targets[0]?.volume_entity).toBe("media_player.tv");
  });

  it("round-trips a per-card selection, including selecting no clients", () => {
    for (const ids of [["living_room"], ["bedroom", "living_room", "office"], []]) {
      const base = { type: TYPE, allowed_targets: ids };
      const form = configToForm(validateConfig(base));
      expect(form.all_clients).toBe(false);
      expect(formToConfig(form, base)).toEqual(base);
      expect(formToConfig({ ...form, all_clients: true }, base)).toEqual({ type: TYPE });
    }
  });

  it("rejects malformed client selections", () => {
    for (const allowed_targets of ["tv", [""], [12], ["   "]]) {
      expect(() => validateConfig({ type: TYPE, allowed_targets })).toThrow("allowed_targets");
    }
    expect(validateConfig({ type: TYPE, allowed_targets: ["tv", "tv"] }).allowed_targets).toEqual(["tv"]);
  });

  it("round-trips client settings including arbitrary wake targets and data", () => {
    const targets = validateConfig({
      type: TYPE,
      targets: [{
        name: "TV", device_id: "tv",
        volume_entity: "media_player.receiver", control_entity: "media_player.tv",
        wake_action: {
          service: "script.turn_on",
          target: { entity_id: ["script.wake_tv"], area_id: "living_room" },
          data: { variables: { input: "HDMI 1" } },
        },
      }],
    }).targets;
    expect(targetFormsToConfig(targets.map(targetToForm))).toEqual(targets);
  });

  it("clears optional client settings without leaving invalid empty values", () => {
    const form = targetToForm({
      name: "TV", device_id: "tv", volume_entity: "media_player.tv",
      wake_action: { action: "script.turn_on", target: { entity_id: "script.wake_tv" } },
    });
    expect(targetFormsToConfig([{
      ...form, volume_entity: "", control_entity: "", wake_action: "",
    }])).toEqual([{ name: "TV", device_id: "tv" }]);
    expect(targetFormsToConfig([])).toEqual([]);
  });

  it("rejects incomplete clients and malformed wake actions before updating the preview", () => {
    expect(() => targetFormsToConfig([{}])).toThrow("name");
    expect(() => targetFormsToConfig([{ name: "TV" }])).toThrow("device_id");
    expect(() => targetFormsToConfig([{
      name: "TV", device_id: "tv", wake_action: "turn on",
    }])).toThrow("action");
  });

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
      allowed_targets: ["x"],
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
