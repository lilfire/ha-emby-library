import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { type EmbyApi, toApiError } from "../api";
import "../components/poster";
import { translate, type TranslationKey } from "../localize";
import { emptyState, errorState } from "../state-templates";
import { sharedStyles } from "../styles";
import type { ErrorCode, Item } from "../types";
import { type ImageShape, groupSearch } from "../util";

export const SEARCH_DEBOUNCE_MS = 300;
export const SEARCH_MIN_LENGTH = 2;

/** Search across movies, series and episodes. */
@customElement("emby-library-search")
export class EmbyLibrarySearch extends LitElement {
  @property({ attribute: false }) api!: EmbyApi;

  @property() language = "en";

  @property({ type: Number }) refreshKey = 0;

  @state() private _term = "";

  @state() private _results: Item[] | null = null;

  @state() private _searched = "";

  @state() private _loading = false;

  @state() private _error: ErrorCode | null = null;

  @query("input") private _input?: HTMLInputElement;

  private _timer?: ReturnType<typeof setTimeout>;

  private _sequence = 0;

  focusInput(): void {
    void this.updateComplete.then(() => this._input?.focus());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this._timer);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("api") && changed.get("api") !== undefined) {
      this._run();
    } else if (changed.has("refreshKey") && this._error !== null) {
      this._run();
    }
  }

  private _onInput(event: Event): void {
    this._term = (event.target as HTMLInputElement).value;
    clearTimeout(this._timer);
    // A newer search always invalidates answers to older ones.
    this._sequence += 1;
    if (this._term.trim().length < SEARCH_MIN_LENGTH) {
      this._results = null;
      this._loading = false;
      this._error = null;
      return;
    }
    this._loading = true;
    this._timer = setTimeout(() => this._run(), SEARCH_DEBOUNCE_MS);
  }

  private _run(): void {
    const term = this._term.trim();
    if (term.length < SEARCH_MIN_LENGTH) return;
    const sequence = ++this._sequence;
    this._loading = true;
    this._error = null;
    this.api
      .search(term)
      .then((items) => {
        if (sequence !== this._sequence) return;
        this._results = items;
        this._searched = term;
        this._loading = false;
      })
      .catch((err: unknown) => {
        if (sequence !== this._sequence) return;
        this._error = toApiError(err).code;
        this._loading = false;
      });
  }

  private _clear(): void {
    clearTimeout(this._timer);
    this._sequence += 1;
    this._term = "";
    this._results = null;
    this._loading = false;
    this._error = null;
    this.focusInput();
  }

  protected override render(): TemplateResult {
    const t = (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(this.language, key, vars);
    return html`
      <div class="field" role="search">
        <ha-icon icon="mdi:magnify"></ha-icon>
        <input
          type="search"
          enterkeyhint="search"
          autocomplete="off"
          spellcheck="false"
          .value=${this._term}
          placeholder=${t("search.placeholder")}
          aria-label=${t("search.placeholder")}
          @input=${this._onInput}
        />
        ${this._term
          ? html`<button class="icon-button" aria-label=${t("search.clear")} @click=${this._clear}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>`
          : nothing}
      </div>
      <div aria-live="polite">${this._renderBody(t)}</div>
    `;
  }

  private _renderBody(
    t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
  ): TemplateResult {
    if (this._error !== null) return errorState(this.language, this._error, () => this._run());
    if (this._term.trim().length < SEARCH_MIN_LENGTH) {
      return emptyState(t("search.hint"), "mdi:magnify");
    }
    if (this._results === null || (this._loading && this._results.length === 0)) {
      return html`<div class="grid" aria-busy="true">
        ${Array.from(
          { length: 12 },
          () => html`<div aria-hidden="true">
            <div class="skeleton poster"></div>
            <div class="skeleton line"></div>
          </div>`,
        )}
      </div>`;
    }
    if (this._results.length === 0) {
      return emptyState(t("search.empty", { term: this._searched }), "mdi:magnify-close");
    }
    const groups = groupSearch(this._results);
    return html`
      ${this._renderGroup(t("search.movies"), groups.movies, "poster")}
      ${this._renderGroup(t("search.series"), groups.series, "poster")}
      ${this._renderGroup(t("search.episodes"), groups.episodes, "still")}
    `;
  }

  private _renderGroup(
    heading: string,
    items: Item[],
    shape: ImageShape,
  ): TemplateResult | typeof nothing {
    if (items.length === 0) return nothing;
    return html`
      <section aria-label=${heading}>
        <h3>${heading}</h3>
        <div class="grid ${shape}" role="list">
          ${repeat(
            items,
            (item) => item.id,
            (item) =>
              html`<emby-library-poster
                role="listitem"
                .item=${item}
                .shape=${shape}
                .language=${this.language}
              ></emby-library-poster>`,
          )}
        </div>
      </section>
    `;
  }

  static override styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        padding: 8px 16px 16px;
      }
      .field {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 48px;
        padding: 0 4px 0 14px;
        border-radius: 24px;
        background: var(--el-surface);
      }
      .field:focus-within {
        outline: 2px solid var(--el-accent);
      }
      input {
        flex: 1;
        min-width: 0;
        height: 44px;
        border: 0;
        background: transparent;
        color: var(--primary-text-color);
        font: inherit;
        outline: none;
      }
      input::-webkit-search-cancel-button {
        display: none;
      }
      h3 {
        margin: 16px 0 8px;
        font-size: 1.05em;
        font-weight: 500;
      }
      .grid {
        display: grid;
        gap: 16px var(--el-gap);
        margin-top: 12px;
        grid-template-columns: repeat(
          auto-fill,
          minmax(min(var(--el-poster-width, 150px), 45%), 1fr)
        );
      }
      section .grid {
        margin-top: 0;
      }
      .grid.still {
        grid-template-columns: repeat(
          auto-fill,
          minmax(min(calc(var(--el-poster-width, 150px) * 1.5), 100%), 1fr)
        );
      }
      .skeleton.poster {
        aspect-ratio: 2 / 3;
      }
      .skeleton.line {
        height: 0.9em;
        margin: 8px 0 1.4em;
        width: 70%;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "emby-library-search": EmbyLibrarySearch;
  }
}
