import { describe, expect, it, vi } from "vitest";
import type { TemplateResult } from "lit";

import { configToForm, validateConfig, type FormData, type TargetFormData } from "../src/config";
import type { CardConfig, ExternalVolume, HomeAssistant, KnownClient, Session, TargetConfig } from "../src/types";

// Lit's server-side HTMLElement shim lets us exercise the real Lovelace
// editor/card contract without a Home Assistant installation or network.
vi.stubGlobal("customElements", { define: vi.fn(), get: vi.fn() });
vi.stubGlobal("window", { scrollY: 0 });
const { EmbyLibraryCardEditor } = await import("../src/editor");
const { EmbyLibraryCard } = await import("../src/emby-library-card");
const { EmbyLibraryNowPlaying } = await import("../src/components/now-playing");

const session = (deviceId: string): Session => ({
  session_id: `session-${deviceId}`, device_id: deviceId, device_name: deviceId,
  client: "Emby", user_name: null, controllable: true, supported_commands: [],
  state: "idle", now_playing: null, position_s: null, duration_s: null,
  can_seek: false, volume: null, muted: false,
});

interface EditorActions {
  _clients: KnownClient[];
  _schema(config: CardConfig): { name: string; selector: Record<string, unknown> }[];
  _targetSchema(): { name: string }[];
  _valueChanged(event: CustomEvent<{ value: FormData }>): void;
  _targetForms: TargetFormData[];
  _targetChanged(index: number, event: CustomEvent<{ value: TargetFormData }>): void;
  _removeTarget(index: number): void;
}
interface CardClients {
  _volumes: Record<string, ExternalVolume>;
  _sessions: Session[];
  _clients: KnownClient[];
  _visibleSessions: Session[];
  _targets: TargetConfig[];
  _selectedDevice: string | null;
  _device: string | null;
}

describe("client editor to card", () => {
  it("uses Stue's HA volume, follows state changes and excludes LG's Emby volume", () => {
    const card = new EmbyLibraryCard();
    const clients = card as unknown as CardClients;
    const stue = { ...session("9ef8d0a256ed06e0"), volume: 100, supported_commands: ["set_volume" as const] };
    clients._sessions = [stue, { ...session("lg"), volume: 100 }];
    const volumeEntity = "media_player.1etg_stue_tv_adb_androidtv";
    card.setConfig({ type: "custom:emby-library-card", targets: [
      { name: "Stue", device_id: stue.device_id, volume_entity: volumeEntity },
    ] });
    const connection = {
      sendMessagePromise: vi.fn(), subscribeMessage: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
    };
    const playing = new EmbyLibraryNowPlaying();
    const controls = playing as unknown as { _renderControls(s: Session, position: number): TemplateResult };
    const sliderValue = (template: TemplateResult): string | undefined => {
      if (template.strings.join("").includes('max="100"')) return template.values[0] as string;
      for (const value of template.values) {
        if (value && typeof value === "object" && "strings" in value) {
          const found = sliderValue(value as TemplateResult);
          if (found !== undefined) return found;
        }
      }
      return undefined;
    };
    for (const [level, percent] of [[0.7333333333333333, "73"], [0.4, "40"], [0, "0"]] as const) {
      card.hass = {
        connection, callService: vi.fn(), states: {
          [volumeEntity]: { state: "idle", attributes: {
            supported_features: 23997, volume_level: level, is_volume_muted: false,
          } },
        },
      } as HomeAssistant;
      expect(clients._visibleSessions.map((s) => s.device_id)).toEqual([stue.device_id]);
      playing.volumes = clients._volumes;
      expect(sliderValue(controls._renderControls(stue, 0))).toBe(percent);
    }
  });

  it("hides advanced wake fields and preserves YAML wake settings during visible edits", () => {
    const editor = new EmbyLibraryCardEditor();
    const actions = editor as unknown as EditorActions;
    const wake = {
      action: "script.turn_on",
      target: { entity_id: "script.wake_tv" },
      data: { variables: { input: "HDMI 1" } },
    };
    editor.setConfig({ type: "custom:emby-library-card", targets: [
      { name: "TV", device_id: "tv", wake_action: wake, volume_entity: "media_player.old" },
    ] });
    expect(actions._targetSchema().map((field) => field.name)).toEqual([
      "name", "device_id", "volume_entity", "control_entity",
    ]);
    const emitted = vi.spyOn(editor, "dispatchEvent");
    actions._targetChanged(0, new CustomEvent("value-changed", { detail: { value: {
      name: "Stue", device_id: "tv", volume_entity: "", control_entity: "media_player.tv",
    } } }));
    const saved = (emitted.mock.calls[0]![0] as CustomEvent).detail.config;
    expect(saved.targets).toEqual([
      { name: "Stue", device_id: "tv", control_entity: "media_player.tv", wake_action: wake },
    ]);
  });

  it("offers a default only for multiple selected clients and clears excluded defaults", () => {
    const editor = new EmbyLibraryCardEditor();
    const actions = editor as unknown as EditorActions;
    actions._clients = [
      { name: "Stue", device_id: "tv", client: "Emby" },
      { name: "Soverom", device_id: "bedroom", client: "Emby" },
      { name: "Kontor", device_id: "office", client: "Emby" },
    ];
    const base = { type: "custom:emby-library-card" };
    const defaultField = (raw: Record<string, unknown>) => actions._schema(validateConfig(raw))
      .find((field) => field.name === "default_target");
    expect(defaultField(base)).toBeUndefined();
    expect(defaultField({ ...base, allowed_targets: [] })).toBeUndefined();
    expect(defaultField({ ...base, targets: [{ name: "Soverom", device_id: "bedroom" }] }))
      .toBeUndefined();
    const selected = { ...base, allowed_targets: ["tv", "bedroom"], default_target: "tv" };
    const field = defaultField(selected);
    expect(field?.selector).toEqual({ select: {
      mode: "dropdown", options: [
        { value: "tv", label: "Stue (Emby)" },
        { value: "bedroom", label: "Soverom (Emby)" },
      ],
    } });
    editor.setConfig(selected);
    const emitted = vi.spyOn(editor, "dispatchEvent");
    actions._valueChanged(new CustomEvent("value-changed", { detail: { value: {
      ...configToForm(validateConfig(selected)), allowed_targets: ["bedroom"],
    } } }));
    const saved = (emitted.mock.calls[0]![0] as CustomEvent).detail.config;
    expect(saved.default_target).toBeUndefined();
    expect(defaultField(saved)).toBeUndefined();
    expect(validateConfig({ ...saved, default_target: "tv" }).default_target).toBeNull();

    // Adding the first configured client also invalidates an old unrestricted default.
    editor.setConfig({ ...base, default_target: "tv" });
    actions._targetForms = [{}];
    actions._targetChanged(0, new CustomEvent("value-changed", { detail: { value: {
      name: "Soverom", device_id: "bedroom",
    } } }));
    const added = (emitted.mock.calls[1]![0] as CustomEvent).detail.config;
    expect(added.default_target).toBeUndefined();
    expect(validateConfig(added).allowed_targets).toEqual(["bedroom"]);
  });

  it("applies add, edit, remove and re-add to a running card through config-changed", () => {
    const card = new EmbyLibraryCard();
    const clients = card as unknown as CardClients;
    clients._sessions = [session("tv"), session("lg")];
    clients._clients = [
      { name: "TV", device_id: "tv", client: "AndroidTV" },
      { name: "LG", device_id: "lg", client: "Emby for LG" },
    ];
    clients._selectedDevice = "lg";
    const editor = new EmbyLibraryCardEditor();
    const actions = editor as unknown as EditorActions;
    const initial = { type: "custom:emby-library-card" };
    editor.setConfig(initial);
    card.setConfig(initial);
    let emitted: Record<string, unknown> = initial;
    vi.spyOn(editor, "dispatchEvent").mockImplementation((event) => {
      emitted = (event as CustomEvent<{ config: Record<string, unknown> }>).detail.config;
      card.setConfig(emitted);
      editor.setConfig(emitted);
      return true;
    });
    const change = (form: TargetFormData) => actions._targetChanged(0,
      new CustomEvent("value-changed", { detail: { value: form } }));

    actions._targetForms = [{}];
    change({ name: "Stue", device_id: "tv" });
    expect(clients._visibleSessions.map((s) => s.device_id)).toEqual(["tv"]);
    expect(clients._targets.map((t) => t.name)).toEqual(["Stue"]);
    expect(clients._device).toBe("tv");

    change({ name: "Soverom", device_id: "lg" });
    expect(clients._visibleSessions.map((s) => s.device_id)).toEqual(["lg"]);
    expect(clients._targets.map((t) => t.name)).toEqual(["Soverom"]);

    actions._removeTarget(0);
    expect(emitted.targets).toBeUndefined();
    expect(clients._visibleSessions.map((s) => s.device_id)).toEqual(["tv", "lg"]);

    actions._targetForms = [{}];
    change({ name: "Stue igjen", device_id: "tv" });
    expect(clients._visibleSessions.map((s) => s.device_id)).toEqual(["tv"]);
    expect(clients._targets.map((t) => t.name)).toEqual(["Stue igjen"]);

    // A selected offline client must also be the only picker target.
    change({ name: "Offline TV", device_id: "offline" });
    expect(clients._visibleSessions).toEqual([]);
    expect(clients._targets).toEqual([{ name: "Offline TV", device_id: "offline" }]);
    // Without a wake action an offline client is displayed but not playable.
    expect(clients._device).toBeNull();
  });
});
