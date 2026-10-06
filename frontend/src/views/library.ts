import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { type EmbyApi, toApiError } from "../api";
import "../components/poster";
import { fire } from "../events";
import { translate } from "../localize";
import { emptyState, errorState } from "../state-templates";
import { sharedStyles } from "../styles";
import type { CollectionType, ErrorCode, Item, SortField, SortOrder, View } from "../types";
import { tileWindow } from "../util";

export const PAGE_SIZE = 60;
/** At most this many tiles are kept in the DOM. */
export const MAX_TILES = 600;
const WINDOW_STEP = 120;
/** Tiles kept above the viewport when the window moves up. */
const WINDOW_BUFFER = 240;

const SORT_FIELDS: readonly SortField[] = [
  "SortName",
  "DateCreated",
  "PremiereDate",
  "CommunityRating",
  "DatePlayed",
];

const VIEW_ICONS: Record<CollectionType, string> = {
  movies: "mdi:movie-outline",
  tvshows: "mdi:television-classic",
  boxsets: "mdi:filmstrip-box-multiple",
  mixed: "mdi:folder-play-outline",
};

/**
 * Library: the libraries as large tiles when `parent` is null, otherwise a
 * poster grid for one library or folder with sorting, filter and paging.
 */
@customElement("emby-library-library")
export class EmbyLibraryLibrary extends LitElement {
  @property({ attribute: false }) api!: EmbyApi;

  @property() language = "en";

  @property({ attribute: false }) parent: { id: string; name: string } | null = null;

  @property({ type: Number }) refreshKey = 0;

  @state() private _views: View[] | null = null;

  @state() private _items: Item[] = [];

  @state() private _total: number | null = null;

  @state() private _loading = false;

  @state() private _error: ErrorCode | null = null;

  @state() private _sortBy: SortField = "SortName";

  @state() private _sortOrder: SortOrder = "asc";

  @state() private _unplayed = false;

  @state() private _windowStart = 0;

  @state() private _spacer = 0;

  @query(".grid") private _grid?: HTMLElement;

  @query(".sentinel.bottom") private _bottom?: HTMLElement;

  @query(".spacer") private _spacerElement?: HTMLElement;

  private _observer?: IntersectionObserver;

  private _generation = 0;

  override connectedCallback(): void {
    super.connectedCallback();
    this._observer = new IntersectionObserver((entries) => this._onIntersect(entries), {
      rootMargin: "800px 0px",
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._observer?.disconnect();
    this._observer = undefined;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("api") || changed.has("parent")) {
      this._reload();
    } else if (changed.has("refreshKey") && (this._error !== null || this.parent === null)) {
      this._reload();
    }
  }

  protected override updated(): void {
    // Re-observing makes the observer report the current state again, so a
    // short page keeps loading until the sentinel leaves the viewport.
    const observer = this._observer;
    if (!observer) return;
    observer.disconnect();
    if (this._bottom) observer.observe(this._bottom);
    if (this._spacerElement && this._windowStart > 0) observer.observe(this._spacerElement);
  }

  private _reload(): void {
    this._generation += 1;
    this._error = null;
    this._items = [];
    this._total = null;
    this._windowStart = 0;
    this._spacer = 0;
    this._loading = false;
    if (this.parent === null) {
      void this._loadViews();
    } else {
      void this._loadMore();
    }
  }

  private async _loadViews(): Promise<void> {
    const generation = this._generation;
    this._views = null;
    try {
      const views = await this.api.views();
      if (generation === this._generation) this._views = views;
    } catch (err) {
      if (generation === this._generation) this._error = toApiError(err).code;
    }
  }

  private get _hasMore(): boolean {
    return this._total === null || this._items.length < this._total;
  }

  private async _loadMore(): Promise<void> {
    if (this.parent === null || this._loading || !this._hasMore || this._error !== null) return;
    const generation = this._generation;
    this._loading = true;
    try {
      const page = await this.api.items({
        parent_id: this.parent.id,
        sort_by: this._sortBy,
        sort_order: this._sortOrder,
        start_index: this._items.length,
        limit: PAGE_SIZE,
        filter: this._unplayed ? "unplayed" : undefined,
      });
      if (generation !== this._generation) return;
      this._items = [...this._items, ...page.items];
      // An empty page ends paging even if the server's total says otherwise.
      this._total = page.items.length === 0 ? this._items.length : page.total;
      this._setWindow(
        tileWindow(this._windowStart, this._items.length, MAX_TILES, this._columns()),
      );
    } catch (err) {
      if (generation === this._generation) this._error = toApiError(err).code;
    } finally {
      if (generation === this._generation) this._loading = false;
    }
  }

  private _columns(): number {
    if (!this._grid) return 1;
    const template = getComputedStyle(this._grid).gridTemplateColumns;
    return Math.max(1, template.split(" ").filter(Boolean).length);
  }

  private _rowHeight(): number {
    const grid = this._grid;
    const tile = grid?.querySelector("emby-library-poster");
    if (!grid || !tile) return 0;
    const gap = Number.parseFloat(getComputedStyle(grid).rowGap) || 0;
    return tile.getBoundingClientRect().height + gap;
  }

  /** Move the DOM window and keep the scroll position with a spacer. */
  private _setWindow(start: number): void {
    const clamped = Math.max(0, start);
    if (clamped === this._windowStart) return;
    const columns = this._columns();
    this._spacer = Math.floor(clamped / columns) * this._rowHeight();
    this._windowStart = clamped;
  }

  private _onIntersect(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const columns = this._columns();
      if (entry.target === this._bottom) {
        if (this._windowStart + MAX_TILES < this._items.length) {
          this._setWindow(this._windowStart + Math.ceil(WINDOW_STEP / columns) * columns);
        } else {
          void this._loadMore();
        }
      } else if (entry.target === this._spacerElement && this._windowStart > 0) {
        // The user scrolled (or jumped) up into the space left by removed
        // tiles: move the window so that it surrounds what is visible.
        const rowHeight = this._rowHeight();
        if (rowHeight <= 0) continue;
        const offset = Math.max(0, entry.intersectionRect.top - entry.boundingClientRect.top);
        const bufferRows = Math.ceil(WINDOW_BUFFER / columns);
        const row = Math.floor(offset / rowHeight) - bufferRows;
        this._setWindow(Math.min(Math.max(0, row * columns), this._windowStart - columns));
      }
    }
  }

  private _openView(view: View): void {
    fire(this, "emby-open-item", {
      item: { id: view.id, type: "Folder", name: view.name, is_folder: true },
    });
  }

  private _setSort(event: Event): void {
    this._sortBy = (event.target as HTMLSelectElement).value as SortField;
    this._reload();
  }

  private _toggleOrder(): void {
    this._sortOrder = this._sortOrder === "asc" ? "desc" : "asc";
    this._reload();
  }

  private _toggleUnplayed(): void {
    this._unplayed = !this._unplayed;
    this._reload();
  }

  protected override render(): TemplateResult {
    return this.parent === null ? this._renderViews() : this._renderGrid();
  }

  private _renderViews(): TemplateResult {
    if (this._error !== null) return errorState(this.language, this._error, () => this._reload());
    if (this._views === null) {
      return html`<div class="views" aria-busy="true">
        ${Array.from({ length: 4 }, () => html`<div class="skeleton view"></div>`)}
      </div>`;
    }
    if (this._views.length === 0) {
      return emptyState(translate(this.language, "library.no_views"), "mdi:folder-off-outline");
    }
    return html`
      <div class="views" role="list">
        ${this._views.map(
          (view) => html`
            <div role="listitem">
              <button class="view" @click=${() => this._openView(view)}>
                ${view.image
                  ? html`<img
                      src=${view.image}
                      alt=${view.name}
                      loading="lazy"
                      decoding="async"
                      @error=${(event: Event) => (event.target as HTMLElement).remove()}
                    />`
                  : nothing}
                <span class="view-label">
                  <ha-icon icon=${VIEW_ICONS[view.collection_type]}></ha-icon>
                  <span>${view.name}</span>
                </span>
              </button>
            </div>
          `,
        )}
      </div>
    `;
  }

  private _renderGrid(): TemplateResult {
    const t = (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) =>
      translate(this.language, key, vars);
    const visible = this._items.slice(this._windowStart, this._windowStart + MAX_TILES);
    const initialLoading = this._loading && this._items.length === 0;
    const empty = !this._loading && this._error === null && this._items.length === 0;

    return html`
      <div class="toolbar">
        <label class="sort">
          <span class="sr-only">${t("library.sort")}</span>
          <select @change=${this._setSort} .value=${this._sortBy}>
            ${SORT_FIELDS.map(
              (field) =>
                html`<option value=${field} ?selected=${field === this._sortBy}>
                  ${t(`sort.${field}`)}
                </option>`,
            )}
          </select>
        </label>
        <button
          class="icon-button"
          aria-label=${t(this._sortOrder === "asc" ? "library.order_asc" : "library.order_desc")}
          @click=${this._toggleOrder}
        >
          <ha-icon
            icon=${this._sortOrder === "asc" ? "mdi:sort-ascending" : "mdi:sort-descending"}
          ></ha-icon>
        </button>
        <button
          class="chip"
          aria-pressed=${this._unplayed ? "true" : "false"}
          @click=${this._toggleUnplayed}
        >
          <ha-icon icon="mdi:eye-off-outline"></ha-icon>${t("library.unplayed")}
        </button>
        ${this._total !== null && this._total > 0
          ? html`<span class="count muted">${t("library.count", { count: this._total })}</span>`
          : nothing}
      </div>

      ${empty
        ? emptyState(t(this._unplayed ? "library.empty_unplayed" : "library.empty"))
        : html`
            <div class="spacer" style="height:${this._spacer}px"></div>
            <div class="grid" role="list" aria-busy=${this._loading ? "true" : "false"}>
              ${repeat(
                visible,
                (item) => item.id,
                (item) =>
                  html`<emby-library-poster
                    role="listitem"
                    .item=${item}
                    .language=${this.language}
                  ></emby-library-poster>`,
              )}
              ${initialLoading
                ? Array.from(
                    { length: 18 },
                    () => html`<div aria-hidden="true">
                      <div class="skeleton poster"></div>
                      <div class="skeleton line"></div>
                    </div>`,
                  )
                : nothing}
            </div>
          `}
      ${this._error !== null
        ? errorState(this.language, this._error, () => {
            this._error = null;
            void this._loadMore();
          })
        : nothing}
      ${this._loading && this._items.length > 0
        ? html`<div class="more muted" role="status">${t("library.loading_more")}…</div>`
        : nothing}
      <div class="sentinel bottom"></div>
    `;
  }

  static override styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        padding: 8px 16px 16px;
      }
      .views {
        display: grid;
        gap: var(--el-gap);
        grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
      }
      .view {
        position: relative;
        display: block;
        width: 100%;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        border-radius: var(--el-tile-radius);
        background: var(--el-surface);
      }
      .skeleton.view {
        display: block;
      }
      .view img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .view-label {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 24px 12px 10px;
        font-weight: 500;
        text-align: left;
      }
      .view img + .view-label {
        color: #fff;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
      }
      .toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }
      select {
        min-height: 44px;
        padding: 0 12px;
        border-radius: 22px;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
        background: var(--card-background-color, transparent);
        color: var(--primary-text-color);
        font: inherit;
      }
      .count {
        margin-left: auto;
        font-size: 0.85em;
      }
      .grid {
        display: grid;
        gap: 16px var(--el-gap);
        grid-template-columns: repeat(
          auto-fill,
          minmax(min(var(--el-poster-width, 150px), 45%), 1fr)
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
      .sentinel {
        height: 1px;
      }
      .more {
        padding: 16px;
        text-align: center;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "emby-library-library": EmbyLibraryLibrary;
  }
}
