import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

import { EmbyApi } from "./api";
import {
  type FormData,
  POSTER_SIZES,
  SHELVES,
  START_VIEWS,
  configToForm,
  formToConfig,
  validateConfig,
} from "./config";
import { languageOf, translate, type TranslationKey } from "./localize";
import type { CardConfig, Entry, HomeAssistant, Session } from "./types";

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

/** Visual editor for every field except `targets`, which is edited in YAML. */
@customElement("emby-library-card-editor")
export class EmbyLibraryCardEditor extends LitElement {
  @state() private _raw: Record<string, unknown> = {};

  @state() private _config?: CardConfig;

  @state() private _entries: Entry[] = [];

  @state() private _sessions: Session[] = [];

  @state() private _lang = "en";

  @state() private _formReady = customElements.get("ha-form") !== undefined;

  private _hass?: HomeAssistant;

  private _loadedFor?: string;

  setConfig(config: Record<string, unknown>): void {
    // Throws on invalid input, which makes Home Assistant show the YAML editor.
    this._config = validateConfig(config);
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
    for (const target of config.targets) targets.set(target.device_id, target.name);
    for (const session of this._sessions) {
      if (session.controllable && !targets.has(session.device_id)) {
        targets.set(session.device_id, `${session.device_name} (${session.client})`);
      }
    }
    if (config.default_target && !targets.has(config.default_target)) {
      targets.set(config.default_target, config.default_target);
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
      {
        name: "default_target",
        selector: {
          select: {
            mode: "dropdown",
            custom_value: true,
            options: [...targets].map(([value, label]) => option(value, label)),
          },
        },
      },
    ];
  }

  private _valueChanged(event: CustomEvent<{ value: FormData }>): void {
    event.stopPropagation();
    const config = formToConfig(event.detail.value, this._raw);
    if (config.show_search === false && config.start_view === "search") delete config.start_view;
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }),
    );
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
    `;
  }

  static override styles = css`
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
