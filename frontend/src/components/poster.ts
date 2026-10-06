import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { fire } from "../events";
import { translate } from "../localize";
import { sharedStyles } from "../styles";
import type { Item, ItemType } from "../types";
import { type ImageShape, pickImage, tileCaption } from "../util";

const TYPE_ICONS: Record<ItemType, string> = {
  Movie: "mdi:movie-outline",
  Series: "mdi:television-classic",
  Season: "mdi:television-classic",
  Episode: "mdi:television-play",
  BoxSet: "mdi:filmstrip-box-multiple",
  Folder: "mdi:folder-outline",
  Video: "mdi:video-outline",
};

export const typeIcon = (type: ItemType): string => TYPE_ICONS[type] ?? "mdi:video-outline";

/** One tile: image with fixed aspect ratio, progress, badges and caption. */
@customElement("emby-library-poster")
export class EmbyLibraryPoster extends LitElement {
  @property({ attribute: false }) item!: Item;

  @property() shape: ImageShape = "poster";

  @property() language = "en";

  /** Overrides the caption, e.g. for episode lists. */
  @property({ attribute: false }) caption?: { title: string; subtitle: string };

  @state() private _failed = false;

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("item") || changed.has("shape")) this._failed = false;
  }

  protected override render(): TemplateResult {
    const item = this.item;
    const { title, subtitle } = this.caption ?? tileCaption(item);
    const src = this._failed ? null : pickImage(item, this.shape);
    const showProgress = item.progress > 0 && item.progress < 1;
    const label = [title, subtitle, item.played ? translate(this.language, "detail.played") : ""]
      .filter(Boolean)
      .join(", ");

    return html`
      <button class="tile" aria-label=${label} @click=${this._open}>
        <div class="image ${this.shape}">
          ${src
            ? html`<img
                src=${src}
                alt=${item.name}
                loading="lazy"
                decoding="async"
                @error=${this._onError}
              />`
            : html`<div class="placeholder">
                <ha-icon icon=${typeIcon(item.type)}></ha-icon>
                <span>${item.name}</span>
              </div>`}
          ${item.played
            ? html`<span class="badge" aria-hidden="true"
                ><ha-icon icon="mdi:check"></ha-icon
              ></span>`
            : item.unplayed_count
              ? html`<span class="badge count" aria-hidden="true">${item.unplayed_count}</span>`
              : nothing}
          ${showProgress
            ? html`<div class="progress" aria-hidden="true">
                <div style="width:${Math.round(item.progress * 100)}%"></div>
              </div>`
            : nothing}
        </div>
        <div class="title">${title}</div>
        <div class="subtitle">${subtitle || html`&nbsp;`}</div>
      </button>
    `;
  }

  private _onError(): void {
    this._failed = true;
  }

  private _open(): void {
    fire(this, "emby-open-item", { item: this.item });
  }

  static override styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        min-width: 0;
      }
      .tile {
        display: block;
        width: 100%;
        text-align: left;
        border-radius: var(--el-tile-radius);
      }
      .image {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: var(--el-tile-radius);
        background: var(--el-surface);
      }
      .image.poster {
        aspect-ratio: 2 / 3;
      }
      .image.still {
        aspect-ratio: 16 / 9;
      }
      img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.2s ease;
      }
      .tile:hover img {
        transform: scale(1.04);
      }
      @media (prefers-reduced-motion: reduce) {
        img {
          transition: none;
        }
      }
      .placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 8px;
        text-align: center;
        color: var(--el-muted);
        font-size: 0.85em;
        overflow: hidden;
      }
      .placeholder span {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        overflow-wrap: anywhere;
      }
      .placeholder ha-icon {
        --mdc-icon-size: 32px;
      }
      .badge {
        position: absolute;
        top: 6px;
        right: 6px;
        min-width: 22px;
        height: 22px;
        padding: 0 6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 11px;
        background: var(--el-accent);
        color: var(--el-on-accent);
        font-size: 12px;
        font-weight: 600;
        --mdc-icon-size: 16px;
      }
      .badge:not(.count) {
        padding: 0;
      }
      .progress {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 4px;
        background: rgba(0, 0, 0, 0.5);
      }
      .progress div {
        height: 100%;
        background: var(--el-accent);
      }
      .title,
      .subtitle {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        line-height: 1.35;
      }
      .title {
        margin-top: 6px;
        font-size: 0.9em;
        font-weight: 500;
      }
      .subtitle {
        font-size: 0.8em;
        color: var(--el-muted);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "emby-library-poster": EmbyLibraryPoster;
  }
}
