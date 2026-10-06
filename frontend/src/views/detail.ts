import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { type EmbyApi, toApiError } from "../api";
import { typeIcon } from "../components/poster";
import { fire } from "../events";
import { translate, type TranslationKey } from "../localize";
import { errorState } from "../state-templates";
import { sharedStyles } from "../styles";
import type { ErrorCode, Item, ItemDetail, PlayMode } from "../types";
import { episodeCode, formatRuntime } from "../util";

/** Detail page for a movie, episode, series or season. */
@customElement("emby-library-detail")
export class EmbyLibraryDetail extends LitElement {
  @property({ attribute: false }) api!: EmbyApi;

  @property() language = "en";

  @property() itemId = "";

  @property({ type: Number }) refreshKey = 0;

  @state() private _item: ItemDetail | null = null;

  @state() private _error: ErrorCode | null = null;

  @state() private _seasons: Item[] = [];

  @state() private _seasonId: string | null = null;

  @state() private _episodes: Item[] | null = null;

  @state() private _expanded = false;

  @state() private _clamped = false;

  @state() private _posterFailed = false;

  @state() private _backdropFailed = false;

  @query(".overview") private _overview?: HTMLElement;

  private _generation = 0;

  private _t(key: TranslationKey, vars?: Record<string, string | number>): string {
    return translate(this.language, key, vars);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("api") || changed.has("itemId")) {
      this._item = null;
      this._seasons = [];
      this._seasonId = null;
      this._episodes = null;
      this._expanded = false;
      this._posterFailed = false;
      this._backdropFailed = false;
      void this._load();
    } else if (changed.has("refreshKey")) {
      void this._load();
    }
  }

  protected override updated(): void {
    // Offer "Show more" only when the text is actually cut off.
    const overview = this._overview;
    if (overview && !this._expanded) {
      const clamped = overview.scrollHeight > overview.clientHeight + 1;
      if (clamped !== this._clamped) this._clamped = clamped;
    }
  }

  private async _load(): Promise<void> {
    const generation = ++this._generation;
    this._error = null;
    try {
      const item = await this.api.item(this.itemId);
      if (generation !== this._generation) return;
      this._item = item;
      if (item.type === "Series") {
        const seasons = await this.api.seasons(item.id);
        if (generation !== this._generation) return;
        this._seasons = seasons;
        const current =
          seasons.find((season) => season.id === this._seasonId) ??
          seasons.find((season) => !season.played && season.unplayed_count !== 0) ??
          seasons[0];
        this._seasonId = current?.id ?? null;
        if (current) {
          await this._loadEpisodes(item.id, current.id, generation);
        } else {
          this._episodes = [];
        }
      } else if (item.type === "Season" && item.series_id) {
        await this._loadEpisodes(item.series_id, item.id, generation);
      }
    } catch (err) {
      if (generation !== this._generation) return;
      const code = toApiError(err).code;
      if (code === "not_found") {
        // The card goes back one level and shows a short message.
        fire(this, "emby-error", { code });
      } else {
        this._error = code;
      }
    }
  }

  private async _loadEpisodes(
    seriesId: string,
    seasonId: string,
    generation: number,
  ): Promise<void> {
    const episodes = await this.api.episodes(seriesId, seasonId);
    if (generation === this._generation) this._episodes = episodes;
  }

  private async _selectSeason(seasonId: string): Promise<void> {
    if (!this._item || seasonId === this._seasonId) return;
    const generation = ++this._generation;
    this._seasonId = seasonId;
    this._episodes = null;
    try {
      await this._loadEpisodes(this._item.id, seasonId, generation);
    } catch (err) {
      if (generation === this._generation) this._error = toApiError(err).code;
    }
  }

  private _play(mode: PlayMode): void {
    if (this._item) fire(this, "emby-play", { itemId: this._item.id, mode });
  }

  private _open(item: Pick<Item, "id" | "type" | "name" | "is_folder">): void {
    fire(this, "emby-open-item", { item });
  }

  protected override render(): TemplateResult {
    if (this._error !== null) {
      return errorState(this.language, this._error, () => void this._load());
    }
    const item = this._item;
    if (item === null) return this._renderSkeleton();

    const isEpisode = item.type === "Episode";
    const backdrop = this._backdropFailed ? null : (item.images.backdrop ?? item.images.still);
    const poster = this._posterFailed
      ? null
      : isEpisode
        ? (item.images.still ?? item.images.poster)
        : item.images.poster;
    const code = isEpisode ? episodeCode(item) : "";

    return html`
      <div class="hero ${backdrop ? "with-backdrop" : ""}">
        ${backdrop
          ? html`<img
              class="backdrop"
              src=${backdrop}
              alt=""
              decoding="async"
              @error=${() => (this._backdropFailed = true)}
            />`
          : nothing}
        <div class="hero-content">
          <div class="poster ${isEpisode ? "still" : ""}">
            ${poster
              ? html`<img
                  src=${poster}
                  alt=${item.name}
                  decoding="async"
                  @error=${() => (this._posterFailed = true)}
                />`
              : html`<div class="placeholder">
                  <ha-icon icon=${typeIcon(item.type)}></ha-icon>
                </div>`}
            ${item.progress > 0 && item.progress < 1
              ? html`<div class="progress" aria-hidden="true">
                  <div style="width:${Math.round(item.progress * 100)}%"></div>
                </div>`
              : nothing}
          </div>
          <div class="info">
            ${isEpisode && item.series_id && item.series_name
              ? html`<button
                  class="series-link"
                  aria-label=${this._t("detail.open_series", { name: item.series_name })}
                  @click=${() =>
                    this._open({
                      id: item.series_id!,
                      type: "Series",
                      name: item.series_name!,
                      is_folder: true,
                    })}
                >
                  ${item.series_name}
                </button>`
              : nothing}
            <h2>${code ? html`<span class="muted">${code} · </span>` : nothing}${item.name}</h2>
            ${this._renderMeta(item)}
            ${item.genres.length > 0
              ? html`<div class="genres muted">${item.genres.slice(0, 4).join(" · ")}</div>`
              : nothing}
          </div>
        </div>
      </div>

      <div class="body">
        <div class="actions">${this._renderActions(item)}</div>
        ${item.overview
          ? html`
              <p class="overview ${this._expanded ? "expanded" : ""}">${item.overview}</p>
              ${this._clamped || this._expanded
                ? html`<button
                    class="more"
                    aria-expanded=${this._expanded ? "true" : "false"}
                    @click=${() => (this._expanded = !this._expanded)}
                  >
                    ${this._t(this._expanded ? "detail.show_less" : "detail.show_more")}
                  </button>`
                : nothing}
            `
          : nothing}
        ${item.type === "Series" || item.type === "Season" ? this._renderEpisodes(item) : nothing}
      </div>
    `;
  }

  private _renderMeta(item: ItemDetail): TemplateResult {
    // Unknown values are left out, never shown as "unknown".
    const parts: (string | TemplateResult)[] = [];
    if (item.year !== null) parts.push(String(item.year));
    const runtime = formatRuntime(item.runtime_s, this._t("time.h"), this._t("time.min"));
    if (runtime) parts.push(runtime);
    if (item.type === "Series" && item.season_count) {
      parts.push(
        item.season_count === 1
          ? this._t("detail.season_count_one")
          : this._t("detail.season_count", { count: item.season_count }),
      );
    }
    if (item.official_rating) {
      parts.push(html`<span class="rating-box">${item.official_rating}</span>`);
    }
    if (item.community_rating !== null) {
      const rating = item.community_rating.toFixed(1);
      parts.push(
        html`<span class="stars" aria-label=${this._t("detail.rating", { rating })}
          ><ha-icon icon="mdi:star"></ha-icon>${rating}</span
        >`,
      );
    }
    if (item.played) {
      parts.push(
        html`<span class="stars"
          ><ha-icon icon="mdi:check-circle"></ha-icon>${this._t("detail.played")}</span
        >`,
      );
    } else if (item.unplayed_count) {
      parts.push(this._t("detail.unplayed_count", { count: item.unplayed_count }));
    }
    return html`<div class="meta">${parts.map((part) => html`<span>${part}</span>`)}</div>`;
  }

  private _renderActions(item: ItemDetail): TemplateResult | typeof nothing {
    if (item.type === "Series" || item.type === "Season") {
      return html`<button class="button primary" @click=${() => this._play("resume")}>
        <ha-icon icon="mdi:play"></ha-icon>${this._t("detail.play")}
      </button>`;
    }
    if (item.type === "BoxSet" || item.type === "Folder") return nothing;
    if (item.position_s > 0) {
      return html`
        <button class="button primary" @click=${() => this._play("resume")}>
          <ha-icon icon="mdi:play"></ha-icon>${this._t("detail.resume")}
        </button>
        <button class="button" @click=${() => this._play("start")}>
          <ha-icon icon="mdi:restart"></ha-icon>${this._t("detail.play_from_start")}
        </button>
      `;
    }
    return html`<button class="button primary" @click=${() => this._play("start")}>
      <ha-icon icon="mdi:play"></ha-icon>${this._t("detail.play_from_start")}
    </button>`;
  }

  private _renderEpisodes(item: ItemDetail): TemplateResult {
    return html`
      ${item.type === "Series" && this._seasons.length > 0
        ? html`<div class="seasons" role="tablist" aria-label=${this._t("detail.seasons")}>
            ${this._seasons.map(
              (season) =>
                html`<button
                  class="chip"
                  role="tab"
                  aria-selected=${season.id === this._seasonId ? "true" : "false"}
                  @click=${() => void this._selectSeason(season.id)}
                >
                  ${season.name}
                </button>`,
            )}
          </div>`
        : nothing}
      <h3>${this._t("detail.episodes")}</h3>
      ${this._episodes === null
        ? html`<div aria-busy="true">
            ${Array.from({ length: 4 }, () => html`<div class="skeleton episode-skel"></div>`)}
          </div>`
        : this._episodes.length === 0
          ? html`<div class="muted" role="status">${this._t("detail.no_episodes")}</div>`
          : html`<div class="episodes" role="list">
              ${repeat(
                this._episodes,
                (episode) => episode.id,
                (episode) => this._renderEpisode(episode),
              )}
            </div>`}
    `;
  }

  private _renderEpisode(episode: Item): TemplateResult {
    const runtime = formatRuntime(episode.runtime_s, this._t("time.h"), this._t("time.min"));
    const number = episode.episode_number !== null ? `${episode.episode_number}. ` : "";
    const still = episode.images.still;
    return html`
      <div role="listitem">
        <button class="episode" @click=${() => this._open(episode)}>
          <span class="thumb">
            ${still
              ? html`<img
                  src=${still}
                  alt=${episode.name}
                  loading="lazy"
                  decoding="async"
                  @error=${(event: Event) => (event.target as HTMLElement).remove()}
                />`
              : nothing}
            <ha-icon class="thumb-icon" icon="mdi:television-play"></ha-icon>
            ${episode.progress > 0 && episode.progress < 1
              ? html`<span class="progress" aria-hidden="true"
                  ><span style="width:${Math.round(episode.progress * 100)}%"></span
                ></span>`
              : nothing}
          </span>
          <span class="episode-text">
            <span class="episode-title">${number}${episode.name}</span>
            ${runtime ? html`<span class="muted small">${runtime}</span>` : nothing}
          </span>
          ${episode.played
            ? html`<ha-icon
                class="seen"
                icon="mdi:check-circle"
                role="img"
                aria-label=${this._t("detail.played")}
              ></ha-icon>`
            : nothing}
        </button>
      </div>
    `;
  }

  private _renderSkeleton(): TemplateResult {
    return html`
      <div class="hero" aria-busy="true">
        <div class="hero-content">
          <div class="poster skeleton"></div>
          <div class="info">
            <div class="skeleton" style="height:1.6em;width:60%"></div>
            <div class="skeleton" style="height:1em;width:40%;margin-top:12px"></div>
          </div>
        </div>
      </div>
      <div class="body">
        <div class="skeleton" style="height:44px;width:160px;border-radius:22px"></div>
        <div class="skeleton" style="height:4.5em;margin-top:16px"></div>
      </div>
    `;
  }

  static override styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
      }
      .hero {
        position: relative;
        overflow: hidden;
      }
      .hero.with-backdrop {
        color: #fff;
        background: #000;
      }
      .backdrop {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.55;
      }
      .hero.with-backdrop::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.85));
      }
      .hero-content {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: flex-end;
        gap: 16px;
        padding: 16px;
        min-height: 180px;
      }
      .hero.with-backdrop .hero-content {
        padding-top: 72px;
      }
      .poster {
        position: relative;
        flex: 0 0 var(--el-poster-width, 150px);
        aspect-ratio: 2 / 3;
        overflow: hidden;
        border-radius: var(--el-tile-radius);
        background: var(--el-surface);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      }
      .poster.still {
        flex-basis: calc(var(--el-poster-width, 150px) * 1.5);
        aspect-ratio: 16 / 9;
      }
      .poster img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--el-muted);
        --mdc-icon-size: 40px;
      }
      .progress {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 4px;
        background: rgba(0, 0, 0, 0.5);
        display: block;
      }
      .progress > * {
        display: block;
        height: 100%;
        background: var(--el-accent);
      }
      .info {
        flex: 1;
        min-width: 0;
      }
      h2 {
        margin: 0;
        font-size: 1.5em;
        font-weight: 500;
        line-height: 1.2;
        overflow-wrap: anywhere;
      }
      .hero.with-backdrop .muted {
        color: rgba(255, 255, 255, 0.75);
      }
      .series-link {
        min-height: 44px;
        font-weight: 500;
        text-align: left;
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      .meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px 12px;
        margin-top: 8px;
        font-size: 0.9em;
      }
      .rating-box {
        padding: 0 6px;
        border: 1px solid currentColor;
        border-radius: 4px;
        font-size: 0.85em;
      }
      .stars {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        --mdc-icon-size: 16px;
      }
      .genres {
        margin-top: 4px;
        font-size: 0.85em;
      }
      .body {
        padding: 16px;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .overview {
        margin: 16px 0 0;
        line-height: 1.5;
        white-space: pre-line;
        overflow-wrap: anywhere;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .overview.expanded {
        display: block;
      }
      .more {
        min-height: 44px;
        color: var(--el-accent);
        font-weight: 500;
      }
      .seasons {
        display: flex;
        gap: 8px;
        margin-top: 20px;
        padding-bottom: 6px;
        overflow-x: auto;
        scrollbar-width: thin;
      }
      h3 {
        margin: 16px 0 8px;
        font-size: 1.05em;
        font-weight: 500;
      }
      .episode {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        min-height: 44px;
        padding: 6px;
        border-radius: var(--el-tile-radius);
        text-align: left;
      }
      .episode:hover {
        background: var(--el-surface);
      }
      .thumb {
        position: relative;
        flex: 0 0 128px;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        border-radius: 6px;
        background: var(--el-surface);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--el-muted);
      }
      .thumb img {
        position: absolute;
        inset: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .thumb .progress {
        z-index: 2;
      }
      .episode-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .episode-title {
        overflow-wrap: anywhere;
      }
      .small {
        font-size: 0.85em;
      }
      .seen {
        color: var(--el-accent);
        --mdc-icon-size: 20px;
      }
      .episode-skel {
        height: 84px;
        margin-bottom: 8px;
      }
      @container (max-width: 460px) {
        .hero-content {
          gap: 12px;
        }
        .poster {
          flex-basis: 96px;
        }
        .poster.still {
          flex-basis: 128px;
        }
        h2 {
          font-size: 1.2em;
        }
        .thumb {
          flex-basis: 96px;
        }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "emby-library-detail": EmbyLibraryDetail;
  }
}
