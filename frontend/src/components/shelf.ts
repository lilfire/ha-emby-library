import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { sharedStyles } from "../styles";
import type { Item } from "../types";
import type { ImageShape } from "../util";
import "./poster";

/** One responsive row. `items === null` shows skeleton tiles. */
@customElement("emby-library-shelf")
export class EmbyLibraryShelf extends LitElement {
  @property() heading = "";

  @property({ attribute: false }) items: Item[] | null = null;

  @property() shape: ImageShape = "poster";

  @property() language = "en";

  @property({ type: Number }) posterWidth = 150;

  @state() private _columns = 1;

  @query(".row") private _row?: HTMLElement;

  private _resizeObserver?: ResizeObserver;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.updateComplete.then(() => {
      if (!this.isConnected || !this._row) return;
      this._resizeObserver ??= new ResizeObserver(() => this._measure());
      this._resizeObserver.observe(this._row);
      this._measure();
    });
  }

  override disconnectedCallback(): void {
    this._resizeObserver?.disconnect();
    super.disconnectedCallback();
  }

  protected override updated(): void {
    this._measure();
  }

  private _measure(): void {
    const row = this._row;
    if (!row) return;
    const style = getComputedStyle(row);
    const width = row.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const gap = parseFloat(style.columnGap) || 0;
    const itemWidth = this.posterWidth * (this.shape === "still" ? 1.75 : 1);
    this._columns = Math.max(1, Math.floor((width + gap) / (itemWidth + gap)));
  }

  protected override render(): TemplateResult {
    return html`
      <section aria-label=${this.heading}>
        <h3>${this.heading}</h3>
        <div
          class="row ${this.shape}"
          style=${`grid-template-columns: repeat(${this._columns}, minmax(0, 1fr))`}
          role="list"
          aria-busy=${this.items === null ? "true" : "false"}
        >
          ${this.items === null
            ? Array.from(
                { length: this._columns },
                () => html`<div class="cell" aria-hidden="true">
                  <div class="skeleton image"></div>
                  <div class="skeleton line"></div>
                </div>`,
              )
            : repeat(
                this.items.slice(0, this._columns),
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

  static override styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        min-width: 0;
      }
      h3 {
        margin: 0 0 8px;
        padding: 0 16px;
        font-size: 1.05em;
        font-weight: 500;
      }
      .row {
        display: grid;
        gap: 16px var(--el-gap);
        padding: 2px 16px 10px;
      }
      .cell {
        min-width: 0;
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
