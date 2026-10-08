import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { EmbyApi, toApiError } from "./api";
import "./components/now-playing";
import "./components/target-picker";
import { POSTER_WIDTHS, validateConfig } from "./config";
import "./editor";
import type {
  ControlDetail,
  MediaDetail,
  OpenItemDetail,
  PlayDetail,
  TargetChoice,
  VolumeDetail,
} from "./events";
import { languageOf, translate, type TranslationKey } from "./localize";
import { errorText } from "./state-templates";
import { sharedStyles } from "./styles";
import type {
  CardConfig,
  ControlCommand,
  Entry,
  ErrorCode,
  ExternalControl,
  ExternalVolume,
  HomeAssistant,
  KnownClient,
  Session,
  SessionsEvent,
  StartView,
  TargetConfig,
} from "./types";
import {
  chooseDevice,
  externalControls,
  externalVolumes,
  filterCardClients,
  mergeClientTargets,
  sessionForDevice,
  targetStorageKey,
} from "./util";
import "./views/detail";
import "./views/home";
import "./views/library";
import type { EmbyLibrarySearch } from "./views/search";
import "./views/search";

export const CARD_VERSION = "0.3.1";

const WAKE_TIMEOUT_MS = 60_000;
const PLAY_START_TIMEOUT_MS = 10_000;
const TOAST_MS = 6000;

type Tab = StartView;

type Level =
  | { key: number; kind: "home" }
  | { key: number; kind: "views" }
  | { key: number; kind: "search" }
  | { key: number; kind: "items"; id: string; name: string }
  | { key: number; kind: "detail"; id: string; name: string };

interface Waiter {
  check: (sessions: Session[]) => boolean;
}

type SetupProblem = "no_entry" | ErrorCode;

const TAB_ICONS: Record<Tab, string> = {
  home: "mdi:home-outline",
  library: "mdi:filmstrip-box-multiple",
  search: "mdi:magnify",
};
const TAB_LABELS: Record<Tab, TranslationKey> = {
  home: "nav.home",
  library: "nav.library",
  search: "nav.search",
};

/** The media_player action behind each command a control_entity can take. */
const MEDIA_SERVICES: Partial<Record<ControlCommand, string>> = {
  play: "media_play",
  pause: "media_pause",
  stop: "media_stop",
  next: "media_next_track",
  previous: "media_previous_track",
};

@customElement("emby-library-card")
export class EmbyLibraryCard extends LitElement {
  static getConfigElement(): HTMLElement {
    return document.createElement("emby-library-card-editor");
  }

  static getStubConfig(): Record<string, unknown> {
    return {};
  }

  @state() private _config?: CardConfig;

  @state() private _lang = "en";

  @state() private _api?: EmbyApi;

  @state() private _entry: Entry | null = null;

  @state() private _problem: SetupProblem | null = null;

  @state() private _tab: Tab = "home";

  @state() private _stacks: Record<Tab, Level[]> = { home: [], library: [], search: [] };

  @state() private _sessions: Session[] = [];

  @state() private _clients: KnownClient[] = [];

  @state() private _receivedAt = 0;

  @state() private _available = true;

  @state() private _refreshKey = 0;

  @state() private _picker: { pending: PlayDetail | null } | null = null;

  @state() private _message: string | null = null;

  @state() private _selectedDevice: string | null = null;

  @state() private _volumes: Record<string, ExternalVolume> = {};

  private _volumesKey = "{}";

  @state() private _controls: Record<string, ExternalControl> = {};

  private _controlsKey = "{}";

  private _hass?: HomeAssistant;

  private _unsubscribe?: () => void;

  private _generation = 0;

  private _nextKey = 1;

  private _waiters = new Set<Waiter>();

  private _messageTimer?: ReturnType<typeof setTimeout>;

  private _refreshTimer?: ReturnType<typeof setTimeout>;

  private _scroll = new Map<number, { content: number; page: number }>();

  private readonly _onReady = (): void => {
    // Home Assistant is back after a lost connection.
    if (this._problem !== null || this._api === undefined) void this._init();
    else this._refreshKey += 1;
  };

  // --- Lovelace API -------------------------------------------------------

  setConfig(config: unknown): void {
    const previous = this._config;
    const next = validateConfig(config);
    this._config = next;
    if (previous === undefined || previous.start_view !== next.start_view) {
      this._showTab(next.start_view);
    }
    if (!next.show_search && this._tab === "search") this._showTab("home");
    if (previous !== undefined && previous.entry !== next.entry) void this._init();
    this._updateVolumes();
  }

  /** Re-render only when a configured volume_entity or control_entity changes. */
  private _updateVolumes(): void {
    const targets = this._targets;
    if (targets.length === 0 && this._volumesKey === "{}" && this._controlsKey === "{}") return;
    const volumes = externalVolumes(targets, this._hass?.states);
    const key = JSON.stringify(volumes);
    if (key !== this._volumesKey) {
      this._volumesKey = key;
      this._volumes = volumes;
    }
    const controls = externalControls(targets, this._hass?.states);
    const controlsKey = JSON.stringify(controls);
    if (controlsKey !== this._controlsKey) {
      this._controlsKey = controlsKey;
      this._controls = controls;
    }
  }

  set hass(hass: HomeAssistant) {
    const previous = this._hass;
    this._hass = hass;
    const lang = languageOf(hass);
    if (lang !== this._lang) this._lang = lang;
    this._updateVolumes();
    if (previous?.connection !== hass.connection) {
      previous?.connection.removeEventListener("ready", this._onReady);
      if (this.isConnected) {
        hass.connection.addEventListener("ready", this._onReady);
        void this._init();
      }
    }
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  getCardSize(): number {
    const height = this._config?.height;
    return typeof height === "number" ? Math.max(1, Math.round(height / 50)) : 8;
  }

  getGridOptions(): Record<string, number | string> {
    return { columns: 12, min_columns: 6, min_rows: 4 };
  }

  // --- Lifecycle ----------------------------------------------------------

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("emby-open-item", this._onOpenItem as EventListener);
    this.addEventListener("emby-play", this._onPlay as EventListener);
    this.addEventListener("emby-control", this._onControl as EventListener);
    this.addEventListener("emby-volume", this._onVolume as EventListener);
    this.addEventListener("emby-media", this._onMedia as EventListener);
    this.addEventListener("emby-error", this._onViewError as EventListener);
    if (this._hass) {
      this._hass.connection.addEventListener("ready", this._onReady);
      void this._init();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("emby-open-item", this._onOpenItem as EventListener);
    this.removeEventListener("emby-play", this._onPlay as EventListener);
    this.removeEventListener("emby-control", this._onControl as EventListener);
    this.removeEventListener("emby-volume", this._onVolume as EventListener);
    this.removeEventListener("emby-media", this._onMedia as EventListener);
    this.removeEventListener("emby-error", this._onViewError as EventListener);
    this._hass?.connection.removeEventListener("ready", this._onReady);
    this._generation += 1;
    this._stopSessions();
    clearTimeout(this._messageTimer);
    clearTimeout(this._refreshTimer);
    this._waiters.clear();
  }

  private _stopSessions(): void {
    this._unsubscribe?.();
    this._unsubscribe = undefined;
  }

  /** Resolve the config entry and subscribe to its sessions. */
  private async _init(): Promise<void> {
    const hass = this._hass;
    const config = this._config;
    if (!hass || !config || !this.isConnected) return;
    const generation = ++this._generation;
    this._stopSessions();

    let entries: Entry[];
    try {
      entries = await new EmbyApi(hass).entries();
    } catch {
      // The integration is not installed or not set up yet.
      entries = [];
    }
    if (generation !== this._generation) return;

    let entry: Entry | undefined;
    let problem: SetupProblem | null = null;
    if (entries.length === 0) problem = "no_entry";
    else if (config.entry !== undefined) {
      entry = entries.find((candidate) => candidate.entry_id === config.entry);
      if (!entry) problem = "entry_not_found";
    } else if (entries.length === 1) entry = entries[0];
    else problem = "entry_required";

    this._problem = problem;
    if (!entry) {
      this._entry = null;
      this._api = undefined;
      return;
    }

    const changed = this._entry?.entry_id !== entry.entry_id;
    this._entry = entry;
    const api = new EmbyApi(hass, entry.entry_id);
    this._api = api;
    this._selectedDevice = this._readStoredDevice(entry.entry_id);
    if (changed) {
      this._stacks = { home: [], library: [], search: [] };
      this._sessions = [];
      this._clients = [];
      this._showTab(this._tab);
    }

    try {
      const unsubscribe = await api.subscribeSessions((event) => this._onSessions(event));
      if (generation !== this._generation) unsubscribe();
      else this._unsubscribe = unsubscribe;
    } catch (err) {
      if (generation === this._generation) this._problem = toApiError(err).code;
    }
  }

  // --- Sessions -----------------------------------------------------------

  private _onSessions(event: SessionsEvent): void {
    const wasAvailable = this._available;
    const wasActive = this._sessions.some((session) => session.state !== "idle");
    this._sessions = event.sessions;
    this._clients = event.clients ?? [];
    this._available = event.available;
    this._receivedAt = Date.now();

    // Recover without a page refresh when Emby comes back.
    if (!wasAvailable && event.available) this._refreshKey += 1;
    // Playback ended: progress and the home rows have changed.
    if (wasActive && !event.sessions.some((session) => session.state !== "idle")) {
      clearTimeout(this._refreshTimer);
      this._refreshTimer = setTimeout(() => (this._refreshKey += 1), 1500);
    }
    for (const waiter of [...this._waiters]) {
      if (waiter.check(event.sessions)) this._waiters.delete(waiter);
    }
  }

  /** Wait until the session list satisfies `find`, or give up after `timeoutMs`. */
  private _waitFor<T>(find: (sessions: Session[]) => T | null, timeoutMs: number): Promise<T | null> {
    const now = find(this._sessions);
    if (now !== null) return Promise.resolve(now);
    return new Promise((resolve) => {
      const waiter: Waiter = {
        check: (sessions) => {
          const found = find(sessions);
          if (found === null) return false;
          clearTimeout(timer);
          resolve(found);
          return true;
        },
      };
      const timer = setTimeout(() => {
        this._waiters.delete(waiter);
        resolve(null);
      }, timeoutMs);
      this._waiters.add(waiter);
    });
  }

  // --- Target and playback --------------------------------------------------

  private _readStoredDevice(entryId: string): string | null {
    try {
      return localStorage.getItem(targetStorageKey(entryId));
    } catch {
      return null;
    }
  }

  private _storeDevice(deviceId: string): void {
    this._selectedDevice = deviceId;
    if (!this._entry) return;
    try {
      localStorage.setItem(targetStorageKey(this._entry.entry_id), deviceId);
    } catch {
      // Private browsing: the choice lasts until the card is reloaded.
    }
  }

  private get _device(): string | null {
    const config = this._config;
    if (!config) return null;
    return chooseDevice(
      this._selectedDevice,
      config.default_target,
      this._visibleSessions,
      this._targets,
    );
  }

  private get _targets(): TargetConfig[] {
    return filterCardClients(
      mergeClientTargets(this._clients, this._config?.targets ?? []),
      this._config?.allowed_targets ?? null,
    );
  }

  private get _visibleSessions(): Session[] {
    return filterCardClients(this._sessions, this._config?.allowed_targets ?? null);
  }

  private _allowsDevice(deviceId: string): boolean {
    const allowed = this._config?.allowed_targets ?? null;
    return allowed === null || allowed.includes(deviceId);
  }

  private _deviceName(deviceId: string | null): string | null {
    if (deviceId === null) return null;
    const target = this._targets.find((candidate) => candidate.device_id === deviceId);
    if (target) return target.name;
    return (
      this._sessions.find((session) => session.device_id === deviceId)?.device_name ?? null
    );
  }

  private readonly _onPlay = (event: CustomEvent<PlayDetail>): void => {
    event.stopPropagation();
    void this._requestPlay(event.detail);
  };

  private async _requestPlay(detail: PlayDetail): Promise<void> {
    const deviceId = this._device;
    const session = sessionForDevice(deviceId, this._visibleSessions);
    if (session) return this._playOn(session, detail);
    const target = this._config?.targets.find(
      (candidate) => candidate.device_id === deviceId && candidate.wake_action !== undefined,
    );
    if (target) return this._wakeAndPlay(target, detail);
    this._picker = { pending: detail };
  }

  private async _playOn(session: Session, detail: PlayDetail): Promise<void> {
    if (!this._allowsDevice(session.device_id)) return;
    const api = this._api;
    if (!api) return;
    const name = this._deviceName(session.device_id) ?? session.device_name;
    this._show(this._t("target.starting", { name }), true);
    let playedId: string;
    try {
      playedId = await api.play(session.session_id, detail.itemId, detail.mode);
    } catch (err) {
      const code = toApiError(err).code;
      this._show(errorText(this._lang, code));
      if (code === "session_not_found" || code === "not_controllable") {
        this._picker = { pending: detail };
      }
      return;
    }
    // Some clients claim to be controllable but ignore the command.
    const started = await this._waitFor(
      (sessions) =>
        sessions.find(
          (candidate) =>
            candidate.session_id === session.session_id &&
            candidate.now_playing?.id === playedId,
        ) ?? null,
      PLAY_START_TIMEOUT_MS,
    );
    if (started) this._show(null);
    else this._show(this._t("target.not_started"));
  }

  private async _wakeAndPlay(target: TargetConfig, detail: PlayDetail): Promise<void> {
    if (!this._allowsDevice(target.device_id)) return;
    const hass = this._hass;
    const action = target.wake_action;
    if (!hass || !action) return;
    this._show(this._t("target.waking", { name: target.name }), true);
    const [domain, service] = action.action.split(".", 2) as [string, string];
    try {
      // Runs as the logged-in Home Assistant user, like any dashboard button.
      await hass.callService(domain, service, action.data ?? {}, action.target);
    } catch {
      this._show(this._t("error.generic"));
      return;
    }
    const session = await this._waitFor(
      (sessions) => sessionForDevice(target.device_id, sessions),
      WAKE_TIMEOUT_MS,
    );
    if (!session) {
      this._show(this._t("target.no_response"));
      return;
    }
    await this._playOn(session, detail);
  }

  private _onTargetChosen(event: CustomEvent<TargetChoice>): void {
    const pending = this._picker?.pending ?? null;
    this._picker = null;
    const choice = event.detail;
    if (!this._allowsDevice(choice.kind === "session" ? choice.session.device_id : choice.target.device_id)) return;
    if (choice.kind === "session") {
      this._storeDevice(choice.session.device_id);
      if (pending) void this._playOn(choice.session, pending);
    } else {
      this._storeDevice(choice.target.device_id);
      if (pending) void this._wakeAndPlay(choice.target, pending);
    }
  }

  private readonly _onControl = (event: CustomEvent<ControlDetail>): void => {
    event.stopPropagation();
    const { sessionId, command, value } = event.detail;
    if (!this._visibleSessions.some((session) => session.session_id === sessionId)) return;
    this._api?.control(sessionId, command, value).catch((err: unknown) => {
      this._show(errorText(this._lang, toApiError(err).code));
    });
  };

  /** Volume through a Home Assistant media_player, as the logged-in user. */
  private readonly _onVolume = (event: CustomEvent<VolumeDetail>): void => {
    event.stopPropagation();
    const hass = this._hass;
    const { entityId, level, muted } = event.detail;
    // Only entities named in this card's own configuration can be controlled.
    const allowed = this._targets.some((target) => target.volume_entity === entityId);
    if (!hass || !allowed) return;
    const call =
      level !== undefined
        ? hass.callService(
            "media_player",
            "volume_set",
            { volume_level: Math.min(100, Math.max(0, level)) / 100 },
            { entity_id: entityId },
          )
        : hass.callService(
            "media_player",
            "volume_mute",
            { is_volume_muted: muted === true },
            { entity_id: entityId },
          );
    call.catch(() => this._show(this._t("error.generic")));
  };

  /** Play, pause and stop through a Home Assistant media_player, as the logged-in user. */
  private readonly _onMedia = (event: CustomEvent<MediaDetail>): void => {
    event.stopPropagation();
    const hass = this._hass;
    const { entityId, command } = event.detail;
    const service = MEDIA_SERVICES[command];
    // Only entities named in this card's own configuration can be controlled.
    const allowed = this._targets.some((target) => target.control_entity === entityId);
    if (!hass || !allowed || !service) return;
    hass
      .callService("media_player", service, {}, { entity_id: entityId })
      .catch(() => this._show(this._t("error.generic")));
  };

  // --- Navigation -----------------------------------------------------------

  private get _stack(): Level[] {
    return this._stacks[this._tab];
  }

  private _root(tab: Tab): Level {
    const key = this._nextKey++;
    if (tab === "home") return { key, kind: "home" };
    if (tab === "library") return { key, kind: "views" };
    return { key, kind: "search" };
  }

  private _showTab(tab: Tab): void {
    this._saveScroll();
    if (this._stacks[tab].length === 0) {
      this._stacks = { ...this._stacks, [tab]: [this._root(tab)] };
    } else if (tab === this._tab && this._stacks[tab].length > 1) {
      // A second press on the current tab goes back to its first level.
      this._stacks = { ...this._stacks, [tab]: this._stacks[tab].slice(0, 1) };
    }
    this._tab = tab;
    this._restoreScroll();
  }

  private _onTab(tab: Tab): void {
    this._showTab(tab);
    if (tab === "search") {
      void this.updateComplete.then(() =>
        this.renderRoot.querySelector<EmbyLibrarySearch>("emby-library-search")?.focusInput(),
      );
    }
  }

  private get _content(): HTMLElement | null {
    // renderRoot does not exist before the first connect.
    const root = this.renderRoot as ParentNode | undefined;
    return root?.querySelector<HTMLElement>(".content") ?? null;
  }

  private _saveScroll(): void {
    const top = this._stack[this._stack.length - 1];
    if (top) {
      this._scroll.set(top.key, {
        content: this._content?.scrollTop ?? 0,
        page: window.scrollY,
      });
    }
  }

  private _restoreScroll(): void {
    void this.updateComplete.then(() => {
      const top = this._stack[this._stack.length - 1];
      const saved = top ? this._scroll.get(top.key) : undefined;
      const content = this._content;
      if (content) content.scrollTop = saved?.content ?? 0;
      if (saved && this._config?.height === "auto" && window.scrollY !== saved.page) {
        window.scrollTo({ top: saved.page });
      }
    });
  }

  private _push(level: Level): void {
    this._saveScroll();
    this._stacks = { ...this._stacks, [this._tab]: [...this._stack, level] };
    void this.updateComplete.then(() => {
      const content = this._content;
      if (content) content.scrollTop = 0;
      // With automatic height the page scrolls, so bring the new level into view.
      if (this.getBoundingClientRect().top < 0) this.scrollIntoView({ block: "start" });
    });
  }

  private _popTo(depth: number): void {
    const stack = this._stack;
    if (depth < 1 || depth >= stack.length) return;
    for (const level of stack.slice(depth)) this._scroll.delete(level.key);
    this._stacks = { ...this._stacks, [this._tab]: stack.slice(0, depth) };
    this._restoreScroll();
  }

  private _back(): void {
    this._popTo(this._stack.length - 1);
  }

  private readonly _onOpenItem = (event: CustomEvent<OpenItemDetail>): void => {
    event.stopPropagation();
    const { id, type, name } = event.detail.item;
    const key = this._nextKey++;
    if (type === "BoxSet" || type === "Folder") this._push({ key, kind: "items", id, name });
    else this._push({ key, kind: "detail", id, name });
  };

  private readonly _onViewError = (event: CustomEvent<{ code: string }>): void => {
    event.stopPropagation();
    if (event.detail.code === "not_found") {
      this._back();
      this._show(this._t("error.not_found"));
    }
  };

  // --- Messages ---------------------------------------------------------------

  private _t(key: TranslationKey, vars?: Record<string, string | number>): string {
    return translate(this._lang, key, vars);
  }

  private _show(text: string | null, sticky = false): void {
    clearTimeout(this._messageTimer);
    this._message = text;
    if (text !== null && !sticky) {
      this._messageTimer = setTimeout(() => (this._message = null), TOAST_MS);
    }
  }

  // --- Rendering ----------------------------------------------------------------

  protected override render(): TemplateResult | typeof nothing {
    const config = this._config;
    if (!config) return nothing;
    const fixed = typeof config.height === "number";
    const style = `--el-poster-width:${POSTER_WIDTHS[config.poster_size]}px;${
      fixed ? `height:${config.height}px;` : ""
    }`;

    if (this._problem !== null) {
      return html`<ha-card style=${style}>${this._renderProblem(this._problem)}</ha-card>`;
    }
    const api = this._api;
    if (!api) {
      return html`<ha-card style=${style} aria-busy="true">
        <div class="boot"><div class="skeleton"></div></div>
      </ha-card>`;
    }

    return html`
      <ha-card class=${fixed ? "fixed" : "auto"} style=${style}>
        ${this._renderHeader(config)}
        ${this._available
          ? nothing
          : html`<div class="banner" role="status">
              <ha-icon icon="mdi:lan-disconnect"></ha-icon>${this._t("error.unreachable")}
            </div>`}
        <div class="content">
          ${(Object.keys(this._stacks) as Tab[]).map((tab) =>
            repeat(
              this._stacks[tab],
              (level) => level.key,
              (level, index) =>
                html`<div
                  class="level"
                  ?hidden=${tab !== this._tab || index !== this._stacks[tab].length - 1}
                >
                  ${this._renderLevel(level, api, config)}
                </div>`,
            ),
          )}
        </div>
        ${this._message !== null
          ? html`<div class="toast" role="status" aria-live="polite">${this._message}</div>`
          : nothing}
        ${config.show_now_playing
          ? html`<emby-library-now-playing
              class="now-playing"
              .language=${this._lang}
              .sessions=${this._visibleSessions}
              .volumes=${this._volumes}
              .controls=${this._controls}
              .receivedAt=${this._receivedAt}
            ></emby-library-now-playing>`
          : nothing}
        ${this._picker !== null
          ? html`<emby-library-target-picker
              .language=${this._lang}
              .sessions=${this._visibleSessions}
              .targets=${this._targets}
              .selectedDeviceId=${this._device}
              @emby-target-chosen=${this._onTargetChosen}
              @emby-close=${() => (this._picker = null)}
            ></emby-library-target-picker>`
          : nothing}
      </ha-card>
    `;
  }

  private _renderHeader(config: CardConfig): TemplateResult {
    const tabs: Tab[] = config.show_search ? ["home", "library", "search"] : ["home", "library"];
    const stack = this._stack;
    const deviceName = this._deviceName(this._device);
    return html`
      <header>
        <nav class="tabs" aria-label=${this._t("nav.views")}>
          ${tabs.map(
            (tab) =>
              html`<button
                class="tab"
                aria-label=${this._t(TAB_LABELS[tab])}
                aria-current=${tab === this._tab ? "page" : "false"}
                @click=${() => this._onTab(tab)}
              >
                <ha-icon icon=${TAB_ICONS[tab]}></ha-icon>
                <span class="tab-label">${this._t(TAB_LABELS[tab])}</span>
              </button>`,
          )}
          <span class="flex"></span>
          <button
            class="icon-button ${deviceName ? "has-target" : ""}"
            aria-label=${deviceName
              ? this._t("target.current", { name: deviceName })
              : this._t("target.choose")}
            title=${deviceName ?? this._t("target.choose")}
            @click=${() => (this._picker = { pending: null })}
          >
            <ha-icon icon=${deviceName ? "mdi:cast-connected" : "mdi:cast"}></ha-icon>
          </button>
        </nav>
        ${stack.length > 1
          ? html`<div class="crumbs">
              <button class="icon-button" aria-label=${this._t("nav.back")} @click=${this._back}>
                <ha-icon icon="mdi:arrow-left"></ha-icon>
              </button>
              <nav aria-label=${this._t("nav.breadcrumb")}>
                <ol>
                  ${stack.map((level, index) => {
                    const last = index === stack.length - 1;
                    const name = this._levelName(level);
                    return html`<li>
                      ${last
                        ? html`<span aria-current="page">${name}</span>`
                        : html`<button @click=${() => this._popTo(index + 1)}>${name}</button>
                            <ha-icon icon="mdi:chevron-right" aria-hidden="true"></ha-icon>`}
                    </li>`;
                  })}
                </ol>
              </nav>
            </div>`
          : nothing}
      </header>
    `;
  }

  private _levelName(level: Level): string {
    if (level.kind === "home") return this._t("nav.home");
    if (level.kind === "views") return this._t("nav.library");
    if (level.kind === "search") return this._t("nav.search");
    return level.name;
  }

  private _renderLevel(level: Level, api: EmbyApi, config: CardConfig): TemplateResult {
    switch (level.kind) {
      case "home":
        return html`<emby-library-home
          .api=${api}
          .language=${this._lang}
          .shelves=${config.shelves}
          .limit=${config.shelf_limit}
          .refreshKey=${this._refreshKey}
        ></emby-library-home>`;
      case "views":
        return html`<emby-library-library
          .api=${api}
          .language=${this._lang}
          .parent=${null}
          .refreshKey=${this._refreshKey}
        ></emby-library-library>`;
      case "items":
        return html`<emby-library-library
          .api=${api}
          .language=${this._lang}
          .parent=${level}
          .refreshKey=${this._refreshKey}
        ></emby-library-library>`;
      case "detail":
        return html`<emby-library-detail
          .api=${api}
          .language=${this._lang}
          .itemId=${level.id}
          .refreshKey=${this._refreshKey}
        ></emby-library-detail>`;
      case "search":
        return html`<emby-library-search
          .api=${api}
          .language=${this._lang}
          .refreshKey=${this._refreshKey}
        ></emby-library-search>`;
    }
  }

  private _renderProblem(problem: SetupProblem): TemplateResult {
    if (problem === "no_entry") {
      return html`<div class="state" role="status">
        <ha-icon icon="mdi:movie-open-plus-outline"></ha-icon>
        <div>${this._t("error.no_entry")}</div>
        <a class="button" href="/config/integrations/dashboard/add?domain=emby_library"
          >${this._t("error.open_integrations")}</a
        >
      </div>`;
    }
    return html`<div class="state error" role="alert">
      <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
      <div>${errorText(this._lang, problem)}</div>
      ${problem === "emby_unreachable" || problem === "unknown"
        ? html`<button class="button" @click=${() => void this._init()}>
            <ha-icon icon="mdi:refresh"></ha-icon>${this._t("error.retry")}
          </button>`
        : nothing}
      ${problem === "entry_required" || problem === "entry_not_found"
        ? html`<a class="button" href="?edit=1">${this._t("error.edit_dashboard")}</a>`
        : nothing}
    </div>`;
  }

  static override styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
      }
      ha-card {
        position: relative;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 160px;
      }
      header {
        flex: none;
      }
      .tabs {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 8px 0 12px;
      }
      .tab {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 44px;
        min-width: 44px;
        padding: 0 14px;
        border-radius: 22px;
        font-weight: 500;
        color: var(--el-muted);
      }
      .tab[aria-current="page"] {
        color: var(--primary-text-color);
        background: var(--el-surface);
      }
      .flex {
        flex: 1;
      }
      .has-target {
        color: var(--el-accent);
      }
      .crumbs {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 12px 0 8px;
        min-width: 0;
      }
      .crumbs nav {
        min-width: 0;
        overflow: hidden;
      }
      ol {
        display: flex;
        align-items: center;
        list-style: none;
        margin: 0;
        padding: 0;
        min-width: 0;
      }
      li {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-right: 4px;
        min-width: 0;
        color: var(--el-muted);
        --mdc-icon-size: 18px;
      }
      li:last-child {
        flex: 1;
        color: var(--primary-text-color);
        font-weight: 500;
      }
      li button,
      li span {
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      li button {
        max-width: 22cqi;
        display: inline-block;
      }
      .banner {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 8px 12px 0;
        padding: 8px 12px;
        border-radius: var(--el-tile-radius);
        background: var(--el-surface);
        color: var(--error-color);
        --mdc-icon-size: 20px;
      }
      .content {
        flex: 1;
        min-height: 0;
      }
      ha-card.fixed .content {
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
      }
      .now-playing {
        flex: none;
        z-index: 2;
      }
      ha-card.auto .now-playing {
        position: sticky;
        bottom: 0;
      }
      ha-card.auto {
        overflow: visible;
      }
      .toast {
        position: sticky;
        bottom: 8px;
        z-index: 3;
        align-self: center;
        max-width: calc(100% - 24px);
        margin: 8px 12px;
        padding: 10px 16px;
        border-radius: 22px;
        background: var(--primary-text-color);
        color: var(--card-background-color, var(--primary-background-color));
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }
      .boot {
        padding: 16px;
      }
      .boot .skeleton {
        height: 160px;
      }
      a.button {
        color: inherit;
        text-decoration: none;
      }
      @container (max-width: 420px) {
        .tab {
          padding: 0 12px;
        }
        .tab:not([aria-current="page"]) .tab-label {
          display: none;
        }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "emby-library-card": EmbyLibraryCard;
  }
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((card) => card.type === "emby-library-card")) {
  window.customCards.push({
    type: "emby-library-card",
    name: "Emby Library",
    description: "Browse, search and play your Emby movies and series.",
    preview: false,
  });
}

console.info(`%c EMBY-LIBRARY-CARD %c ${CARD_VERSION} `, "font-weight:700", "");
