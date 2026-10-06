import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { sharedStyles } from "../styles";
import type { Item } from "../types";
import type { ImageShape } from "../util";
import "./poster";

const SKELETON_TILES = 8;

/** A horizontally scrolling row. `items === null` shows skeleton tiles. */
@customElement("emby-library-shelf")
export class EmbyLibraryShelf extends LitElement {
  @property() heading = "";

  @property({ attribute: false }) items: Item[] | null = null;

  @property() shape: ImageShape = "poster";

  @property() language = "en";

  protected override render(): TemplateResult {
    return html`
      <section aria-label=${this.heading}>
        <h3>${this.heading}</h3>
        <div
          class="row ${this.shape}"
          role="list"
          aria-busy=${this.items === null ? "true" : "false"}
          @wheel=${this._onWheel}
        >
          ${this.items === null
            ? Array.from(
                { length: SKELETON_TILES },
                () => html`<div class="cell" aria-hidden="true">
                  <div class="skeleton image"></div>
                  <div class="skeleton line"></div>
                </div>`,
              )
            : repeat(
                this.items,
                (item) => item.id,
                (item) =>
                  html`<div class="cell" role="listitem">
                    <emby-library-poster
                      .item=${item}
                      .shape=${this.shape}
                      .language=${this.language}
                    ></emby-library-poster>
                  </div>`,
              )}
        </div>
      </section>
    `;
  }

  /** Let a vertical mouse wheel scroll the row while it can still move. */
  private _onWheel(event: WheelEvent): void {
    if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
    const row = event.currentTarget as HTMLElement;
    const max = row.scrollWidth - row.clientWidth;
    if (max <= 0) return;
    const atStart = row.scrollLeft <= 0 && event.deltaY < 0;
    const atEnd = row.scrollLeft >= max - 1 && event.deltaY > 0;
    if (atStart || atEnd) return;
    event.preventDefault();
    row.scrollLeft += event.deltaMode === 1 ? event.deltaY * 32 : event.deltaY;
  }

  static override styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      h3 {
        margin: 0 0 8px;
        padding: 0 16px;
        font-size: 1.05em;
        font-weight: 500;
      }
      .row {
        display: flex;
        gap: var(--el-gap);
        overflow-x: auto;
        overflow-y: hidden;
        padding: 2px 16px 10px;
        scroll-padding: 0 16px;
        scroll-snap-type: x proximity;
        scrollbar-width: thin;
        overscroll-behavior-x: contain;
        -webkit-overflow-scrolling: touch;
      }
      .cell {
        flex: 0 0 var(--el-poster-width, 150px);
        scroll-snap-align: start;
        min-width: 0;
      }
      .row.still .cell {
        flex-basis: calc(var(--el-poster-width, 150px) * 1.75);
      }
      .skeleton.image {
        aspect-ratio: 2 / 3;
      }
      .row.still .skeleton.image {
        aspect-ratio: 16 / 9;
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
    "emby-library-shelf": EmbyLibraryShelf;
  }
}
