import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { type EmbyApi, toApiError } from "../api";
import "../components/shelf";
import { translate, type TranslationKey } from "../localize";
import { emptyState, errorState } from "../state-templates";
import { sharedStyles } from "../styles";
import type { ErrorCode, Item, ShelfName } from "../types";

const SHELF_TITLES: Record<ShelfName, TranslationKey> = {
  resume: "shelf.resume",
  next_up: "shelf.next_up",
  latest: "shelf.latest",
  suggestions: "shelf.suggestions",
};

type ShelfState = Item[] | "loading" | "hidden";

/** Home: one row per configured shelf, loaded in parallel. */
@customElement("emby-library-home")
export class EmbyLibraryHome extends LitElement {
  @property({ attribute: false }) api!: EmbyApi;

  @property() language = "en";

  @property({ attribute: false }) shelves: ShelfName[] = [];

  @property({ type: Number }) limit = 20;

  @property({ type: Number }) posterWidth = 150;

  /** Changes when the data should be fetched again. */
  @property({ type: Number }) refreshKey = 0;

  @state() private _rows: Partial<Record<ShelfName, ShelfState>> = {};

  @state() private _error: ErrorCode | null = null;

  private _generation = 0;

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("api") || changed.has("shelves") || changed.has("limit")) {
      this._load(false);
    } else if (changed.has("refreshKey")) {
      this._load(true);
    }
  }

  private _load(keepExisting: boolean): void {
    const generation = ++this._generation;
    const rows: Partial<Record<ShelfName, ShelfState>> = {};
    for (const shelf of this.shelves) {
      const existing = this._rows[shelf];
      rows[shelf] = keepExisting && Array.isArray(existing) ? existing : "loading";
    }
    this._rows = rows;
    this._error = null;

    let failures = 0;
    let lastError: ErrorCode = "unknown";
    const done = this.shelves.map(async (shelf) => {
      let result: ShelfState;
      try {
        const items = await this.api.shelf(shelf, this.limit);
        result = items.length > 0 ? items : "hidden";
      } catch (err) {
        // A failing row is hidden without affecting the others.
        failures += 1;
        lastError = toApiError(err).code;
        result = "hidden";
      }
      if (generation === this._generation) this._rows = { ...this._rows, [shelf]: result };
    });
    void Promise.all(done).then(() => {
      if (generation !== this._generation) return;
      if (this.shelves.length > 0 && failures === this.shelves.length) this._error = lastError;
    });
  }

  protected override render(): TemplateResult {
    if (this._error !== null) return errorState(this.language, this._error, () => this._load(false));
    const visible = this.shelves.filter((shelf) => this._rows[shelf] !== "hidden");
    if (visible.length === 0) return emptyState(translate(this.language, "home.empty"));
    return html`
      ${visible.map((shelf) => {
        const row = this._rows[shelf];
        if (row === undefined) return nothing;
        return html`<emby-library-shelf
          .heading=${translate(this.language, SHELF_TITLES[shelf])}
          .items=${row === "loading" ? null : (row as Item[])}
          .shape=${shelf === "resume" ? "still" : "poster"}
          .language=${this.language}
          .posterWidth=${this.posterWidth}
        ></emby-library-shelf>`;
      })}
    `;
  }

  static override styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        padding: 8px 0;
      }
      emby-library-shelf + emby-library-shelf {
        margin-top: 8px;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "emby-library-home": EmbyLibraryHome;
  }
}
