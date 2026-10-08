import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

import { EmbyApi } from "./api";
import {
  type FormData,
  type TargetFormData,
  POSTER_SIZES,
  SHELVES,
  START_VIEWS,
  configToForm,
  formToConfig,
  targetToForm,
  targetFormsToConfig,
  validateConfig,
} from "./config";
import { languageOf, translate, type TranslationKey } from "./localize";
import type { CardConfig, Entry, HomeAssistant, KnownClient, Session } from "./types";

interface FormSchema {
  name: string;
  selector: Record<string, unknown>;
}

/** Ask Home Assistant to load ha-form if it has not been used yet. */
async function loadHaForm(): Promise<void> {
  if (customElements.get("ha-form")) return;
  const loader = (window as unknown as { loadCardHelpers?: () => Promise<unknown> })
    .loadCardHelpers;
  if (!loader) return;
  try {
    const helpers = (await loader()) as {
      createCardElement?: (config: Record<string, unknown>) => unknown;
    };
    const card = helpers.createCardElement?.({ type: "entities", entities: [] }) as
      | { constructor: { getConfigElement?: () => Promise<unknown> } }
      | undefined;
    await card?.constructor.getConfigElement?.();
  } catch {
    // The form still appears once Home Assistant has loaded ha-form itself.
  }
}

/** Visual editor for card settings and per-client playback configuration. */
@customElement("emby-library-card-editor")
export class EmbyLibraryCardEditor extends LitElement {
  @state() private _raw: Record<string, unknown> = {};

  @state() private _config?: CardConfig;

  @state() private _entries: Entry[] = [];

  @state() private _sessions: Session[] = [];

  @state() private _clients: KnownClient[] = [];

  @state() private _lang = "en";

  @state() private _targetForms: TargetFormData[] = [];

  @state() private _targetError = "";

  @state() private _formReady = customElements.get("ha-form") !== undefined;

  private _hass?: HomeAssistant;

  private _loadedFor?: string;

  setConfig(config: Record<string, unknown>): void {
    // Throws on invalid input, which makes Home Assistant show the YAML editor.
    const validated = validateConfig(config);
    if (!this._config || JSON.stringify(validated.targets) !== JSON.stringify(this._config.targets)) {
      this._targetForms = validated.targets.map(targetToForm);
      this._targetError = "";
    }
    this._config = validated;
    this._raw = config;
    void this._loadChoices();
  }

  set hass(hass: HomeAssistant) {
    const first = this._hass === undefined;
    this._hass = hass;
    this._lang = languageOf(hass);
    if (first) void this._loadChoices();
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this._formReady) {
      void loadHaForm()
        .then(() => customElements.whenDefined("ha-form"))
        .then(() => (this._formReady = true));
    }
  }

  /** Load the users and the clients that are online right now, once per entry. */
  private async _loadChoices(): Promise<void> {
    const hass = this._hass;
    const config = this._config;
    if (!hass || !config) return;
    const marker = config.entry ?? "";
    if (this._loadedFor === marker) return;
    this._loadedFor = marker;
    this._sessions = [];
    this._clients = [];
    try {
      this._entries = await new EmbyApi(hass).entries();
    } catch {
      this._entries = [];
    }
    const entryId = config.entry ?? (this._entries.length === 1 ? this._entries[0]!.entry_id : null);
    if (entryId === null) return;
    try {
      // One event is enough: the list is only used to suggest clients.
      const subscription: { stop?: () => void; done: boolean } = { done: false };
      subscription.stop = await new EmbyApi(hass, entryId).subscribeSessions((event) => {
        this._sessions = event.sessions;
        this._clients = event.clients ?? [];
        subscription.done = true;
        subscription.stop?.();
      });
      if (subscription.done) subscription.stop();
      else setTimeout(() => subscription.stop?.(), 10_000);
    } catch {
      this._sessions = [];
    }
  }

  private _t(key: TranslationKey): string {
    return translate(this._lang, key);
  }

  private _schema(config: CardConfig): FormSchema[] {
    const option = (value: string, label: string) => ({ value, label });
    const targets = new Map<string, string>();
    for (const client of this._clients) {
      targets.set(client.device_id, `${client.name} (${client.client})`);
    }
    for (const target of config.targets) targets.set(target.device_id, target.name);
    for (const session of this._sessions) {
      if (session.controllable && !targets.has(session.device_id)) {
        targets.set(session.device_id, `${session.device_name} (${session.client})`);
      }
    }
    if (config.default_target && !targets.has(config.default_target)) {
      targets.set(config.default_target, config.default_target);
    }
    for (const id of config.allowed_targets ?? []) {
      if (!targets.has(id)) targets.set(id, id);
    }
    return [
      {
        name: "entry",
        selector: {
          select: {
            mode: "dropdown",
            options: this._entries.map((entry) => option(entry.entry_id, entry.title)),
          },
        },
      },
      {
        name: "start_view",
        selector: {
          select: {
            mode: "dropdown",
            options: START_VIEWS.map((view) => option(view, this._t(`nav.${view}`))),
          },
        },
      },
      {
        name: "shelves",
        selector: {
          select: {
            multiple: true,
            reorder: true,
            options: SHELVES.map((shelf) => option(shelf, this._t(`shelf.${shelf}`))),
          },
        },
      },
      { name: "shelf_limit", selector: { number: { min: 1, max: 50, step: 1, mode: "box" } } },
      {
        name: "poster_size",
        selector: {
          select: {
            mode: "dropdown",
            options: POSTER_SIZES.map((size) => option(size, this._t(`editor.size.${size}`))),
          },
        },
      },
      {
        name: "height",
        selector: {
          number: { min: 0, max: 4000, step: 10, mode: "box", unit_of_measurement: "px" },
        },
      },
      { name: "show_now_playing", selector: { boolean: {} } },
      { name: "show_search", selector: { boolean: {} } },
      { name: "all_clients", selector: { boolean: {} } },
      ...(config.allowed_targets === null ? [] : [{
        name: "allowed_targets",
        selector: { select: {
          multiple: true, custom_value: true,
          options: [...targets].map(([value, label]) => option(value, label)),
        } },
      }]),
      {
        name: "default_target",
        selector: {
          select: {
            mode: "dropdown",
            custom_value: true,
            options: [...targets]
              .filter(([value]) => config.allowed_targets === null || config.allowed_targets.includes(value))
              .map(([value, label]) => option(value, label)),
          },
        },
      },
    ];
  }

  private _valueChanged(event: CustomEvent<{ value: FormData }>): void {
    event.stopPropagation();
    const config = formToConfig(event.detail.value, this._raw);
    if (config.show_search === false && config.start_view === "search") delete config.start_view;
    if (Array.isArray(config.allowed_targets) && !config.allowed_targets.includes(config.default_target)) {
      delete config.default_target;
    }
    this._emitConfig(config);
  }

  private _emitConfig(config: Record<string, unknown>): void {
    this._raw = config;
    this._config = validateConfig(config);
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }),
    );
  }

  private _targetSchema(): FormSchema[] {
    const clients = new Map<string, string>();
    for (const client of this._clients) {
      clients.set(client.device_id, `${client.name} (${client.client})`);
    }
    for (const session of this._sessions) {
      if (session.controllable) clients.set(session.device_id, `${session.device_name} (${session.client})`);
    }
    for (const target of this._targetForms) {
      if (target.device_id && !clients.has(target.device_id)) {
        clients.set(target.device_id, target.name || target.device_id);
      }
    }
    return [
      { name: "name", selector: { text: {} } },
      { name: "device_id", selector: { select: {
        mode: "dropdown", custom_value: true,
        options: [...clients].map(([value, label]) => ({ value, label })),
      } } },
      { name: "volume_entity", selector: { entity: { filter: { domain: "media_player" } } } },
      { name: "control_entity", selector: { entity: { filter: { domain: "media_player" } } } },
      { name: "wake_action", selector: { text: {} } },
      { name: "wake_target", selector: { target: {} } },
      { name: "wake_data", selector: { object: {} } },
    ];
  }

  private _saveTargets(): void {
    try {
      const targets = targetFormsToConfig(this._targetForms);
      const config = { ...this._raw };
      if (targets.length) config.targets = targets;
      else delete config.targets;
      this._targetError = "";
      this._emitConfig(config);
    } catch {
      // Keep an incomplete client locally instead of breaking the card preview.
      this._targetError = this._t("editor.target_error");
    }
  }

  private _targetChanged(index: number, event: CustomEvent<{ value: TargetFormData }>): void {
    event.stopPropagation();
    this._targetForms = this._targetForms.map((form, i) => i === index ? event.detail.value : form);
    this._saveTargets();
  }

  private _removeTarget(index: number): void {
    this._targetForms = this._targetForms.filter((_, i) => i !== index);
    this._saveTargets();
  }

  protected override render(): TemplateResult | typeof nothing {
    const config = this._config;
    if (!this._hass || !config || !this._formReady) return nothing;
    return html`
      <ha-form
        .hass=${this._hass}
        .data=${configToForm(config)}
        .schema=${this._schema(config)}
        .computeLabel=${(schema: FormSchema) => this._t(`editor.${schema.name}` as TranslationKey)}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <p>${this._t("editor.targets_hint")}</p>
      <h3>${this._t("editor.targets")}</h3>
      ${this._targetForms.map((form, index) => html`
        <section>
          <h4>${form.name || this._t("editor.new_target")}</h4>
          <ha-form
            .hass=${this._hass}
            .data=${form}
            .schema=${this._targetSchema()}
            .computeLabel=${(schema: FormSchema) => this._t(`editor.target.${schema.name}` as TranslationKey)}
            @value-changed=${(event: CustomEvent<{ value: TargetFormData }>) => this._targetChanged(index, event)}
          ></ha-form>
          <button @click=${() => this._removeTarget(index)}>${this._t("editor.remove_target")}</button>
        </section>
      `)}
      ${this._targetError ? html`<p class="error" role="alert">${this._targetError}</p>` : nothing}
      <button @click=${() => { this._targetForms = [...this._targetForms, {}]; }}>
        ${this._t("editor.add_target")}
      </button>
    `;
  }

  static override styles = css`
    section {
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 16px;
      margin: 12px 0;
    }
    h4 { margin: 0 0 16px; }
    button {
      margin-top: 16px;
      padding: 8px 16px;
      border: 1px solid var(--divider-color);
      border-radius: 20px;
      background: var(--card-background-color);
      color: var(--primary-color);
      font: inherit;
      cursor: pointer;
    }
    .error { color: var(--error-color); }
    p {
      margin: 16px 0 0;
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "emby-library-card-editor": EmbyLibraryCardEditor;
  }
}
