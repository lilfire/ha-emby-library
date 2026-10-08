import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";

import { fire, type TargetChoice } from "../events";
import { translate, type TranslationKey } from "../localize";
import { sharedStyles } from "../styles";
import type { Session, TargetConfig } from "../types";

/** Modal list of Emby clients that can be remote controlled. */
@customElement("emby-library-target-picker")
export class EmbyLibraryTargetPicker extends LitElement {
  @property() language = "en";

  @property({ attribute: false }) sessions: Session[] = [];

  @property({ attribute: false }) targets: TargetConfig[] = [];

  @property({ attribute: false }) selectedDeviceId: string | null = null;

  @query("dialog") private _dialog?: HTMLDialogElement;

  private _t(key: TranslationKey, vars?: Record<string, string | number>): string {
    return translate(this.language, key, vars);
  }

  protected override firstUpdated(): void {
    const dialog = this._dialog;
    if (dialog && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
  }

  private _close(): void {
    fire(this, "emby-close");
  }

  private _onCancel(event: Event): void {
    event.preventDefault();
    this._close();
  }

  private _onBackdrop(event: MouseEvent): void {
    if (event.target === this._dialog) this._close();
  }

  private _choose(choice: TargetChoice): void {
    fire(this, "emby-target-chosen", choice);
  }

  protected override render(): TemplateResult {
    const controllable = this.sessions.filter((session) => session.controllable);
    const online = new Set(controllable.map((session) => session.device_id));
    const offline = this.targets.filter((target) => !online.has(target.device_id));
    const names = new Map(this.targets.map((target) => [target.device_id, target.name]));

    return html`
      <dialog
        aria-labelledby="title"
        @cancel=${this._onCancel}
        @click=${this._onBackdrop}
      >
        <div class="sheet">
          <header>
            <h2 id="title">${this._t("target.title")}</h2>
            <button class="icon-button" aria-label=${this._t("target.close")} @click=${this._close}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </header>
          ${controllable.length === 0 && offline.length === 0
              ? html`<div class="state" role="status">
                  <ha-icon icon="mdi:television-off"></ha-icon>
                  <div>${this._t("target.none")}</div>
                </div>`
              : html`<ul>
                  ${controllable.map((session) =>
                    this._renderRow(
                      names.get(session.device_id) ?? session.device_name,
                      session.now_playing
                        ? `${session.client} · ${this._t("target.playing", {
                            title: session.now_playing.name,
                          })}`
                        : session.client,
                      "mdi:television",
                      session.device_id === this.selectedDeviceId,
                      false,
                      () => this._choose({ kind: "session", session }),
                    ),
                  )}
                  ${offline.map((target) =>
                    this._renderRow(
                      target.name,
                      this._t(target.wake_action ? "target.offline" : "target.offline_no_wake"),
                      "mdi:power-sleep",
                      target.device_id === this.selectedDeviceId,
                      target.wake_action === undefined,
                      () => this._choose({ kind: "target", target }),
                    ),
                  )}
                </ul>`}
        </div>
      </dialog>
    `;
  }

  private _renderRow(
    name: string,
    detail: string,
    icon: string,
    selected: boolean,
    disabled: boolean,
    onClick: () => void,
  ): TemplateResult {
    return html`
      <li>
        <button class="row" ?disabled=${disabled} aria-current=${selected ? "true" : "false"} @click=${onClick}>
          <ha-icon icon=${icon}></ha-icon>
          <span class="text">
            <span class="name">${name}</span>
            <span class="muted small">${detail}</span>
          </span>
          ${selected
            ? html`<ha-icon
                class="check"
                icon="mdi:check"
                role="img"
                aria-label=${this._t("target.selected")}
              ></ha-icon>`
            : nothing}
        </button>
      </li>
    `;
  }

  static override styles = [
    sharedStyles,
    css`
      dialog {
        width: min(420px, calc(100vw - 32px));
        max-height: min(560px, calc(100vh - 32px));
        padding: 0;
        border: 0;
        border-radius: var(--el-radius);
        background: var(--card-background-color, var(--primary-background-color));
        color: var(--primary-text-color);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      }
      dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
      }
      .sheet {
        display: flex;
        flex-direction: column;
        max-height: inherit;
      }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 8px 8px 20px;
      }
      h2 {
        margin: 0;
        font-size: 1.15em;
        font-weight: 500;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0 8px 12px;
        overflow-y: auto;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 14px;
        width: 100%;
        min-height: 56px;
        padding: 8px 12px;
        border-radius: var(--el-tile-radius);
        text-align: left;
      }
      .row:hover:not(:disabled),
      .row[aria-current="true"] {
        background: var(--el-surface);
      }
      .text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .name,
      .small {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .small {
        font-size: 0.85em;
      }
      .check {
        color: var(--el-accent);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "emby-library-target-picker": EmbyLibraryTargetPicker;
  }
}
