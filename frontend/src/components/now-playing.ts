import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { fire } from "../events";
import { translate, type TranslationKey } from "../localize";
import { sharedStyles } from "../styles";
import type { ControlCommand, Session } from "../types";
import { episodeLabel, formatClock, fraction, interpolatePosition } from "../util";

/** Now playing: one strip per active session, expandable to full control. */
@customElement("emby-library-now-playing")
export class EmbyLibraryNowPlaying extends LitElement {
  @property() language = "en";

  @property({ attribute: false }) sessions: Session[] = [];

  /** Time (ms since epoch) when `sessions` was received. */
  @property({ type: Number }) receivedAt = 0;

  @state() private _now = Date.now();

  @state() private _expanded: string | null = null;

  /** Slider value while the user drags, so updates do not move the thumb. */
  @state() private _dragging: { key: string; value: number } | null = null;

  private _ticker?: ReturnType<typeof setInterval>;

  private _t(key: TranslationKey, vars?: Record<string, string | number>): string {
    return translate(this.language, key, vars);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopTicker();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("sessions") || changed.has("receivedAt")) {
      this._now = Date.now();
      // The position is advanced locally every second between events.
      if (this.sessions.some((session) => session.state === "playing")) {
        this._ticker ??= setInterval(() => (this._now = Date.now()), 1000);
      } else {
        this._stopTicker();
      }
    }
  }

  private _stopTicker(): void {
    clearInterval(this._ticker);
    this._ticker = undefined;
  }

  private _send(session: Session, command: ControlCommand, value?: number): void {
    fire(this, "emby-control", { sessionId: session.session_id, command, value });
  }

  private _toggle(session: Session): void {
    this._expanded = this._expanded === session.session_id ? null : session.session_id;
  }

  protected override render(): TemplateResult | typeof nothing {
    const active = this.sessions.filter(
      (session) => session.state !== "idle" && session.now_playing !== null,
    );
    if (active.length === 0) return nothing;
    return html`
      <section aria-label=${this._t("np.title")}>
        ${repeat(
          active,
          (session) => session.session_id,
          (session) => this._renderSession(session),
        )}
      </section>
    `;
  }

  private _renderSession(session: Session): TemplateResult {
    const item = session.now_playing!;
    const supports = (command: ControlCommand) => session.supported_commands.includes(command);
    const expanded = this._expanded === session.session_id;
    const position = interpolatePosition(session, this._now - this.receivedAt);
    const image = item.images.still ?? item.images.poster;
    const title = item.type === "Episode" && item.series_name ? item.series_name : item.name;
    const subtitle = item.type === "Episode" ? episodeLabel(item) : "";
    const playing = session.state === "playing";
    const toggleCommand: ControlCommand | null = playing
      ? supports("pause")
        ? "pause"
        : supports("play_pause")
          ? "play_pause"
          : null
      : supports("play")
        ? "play"
        : supports("play_pause")
          ? "play_pause"
          : null;

    return html`
      <div class="session">
        <div class="strip">
          <button
            class="summary"
            aria-expanded=${expanded ? "true" : "false"}
            aria-label=${this._t(expanded ? "np.collapse" : "np.expand", {
              device: session.device_name,
            })}
            @click=${() => this._toggle(session)}
          >
            <span class="thumb">
              ${image
                ? html`<img
                    src=${image}
                    alt=${item.name}
                    decoding="async"
                    @error=${(event: Event) => (event.target as HTMLElement).remove()}
                  />`
                : html`<ha-icon icon="mdi:play-box-outline"></ha-icon>`}
            </span>
            <span class="text">
              <span class="title">${title}</span>
              <span class="muted small">
                ${subtitle ? html`${subtitle} · ` : nothing}${session.device_name}
              </span>
            </span>
          </button>
          <div class="buttons">
            ${supports("previous")
              ? this._button("mdi:skip-previous", "np.previous", () =>
                  this._send(session, "previous"),
                )
              : nothing}
            ${toggleCommand
              ? this._button(
                  playing ? "mdi:pause" : "mdi:play",
                  playing ? "np.pause" : "np.play",
                  () => this._send(session, toggleCommand),
                )
              : nothing}
            ${supports("next")
              ? this._button("mdi:skip-next", "np.next", () => this._send(session, "next"))
              : nothing}
            ${supports("stop")
              ? this._button("mdi:stop", "np.stop", () => this._send(session, "stop"))
              : nothing}
          </div>
        </div>
        <div class="bar" aria-hidden="true">
          <div style="width:${(fraction(position, session.duration_s) * 100).toFixed(2)}%"></div>
        </div>
        ${expanded ? this._renderControls(session, position) : nothing}
      </div>
    `;
  }

  private _button(icon: string, label: TranslationKey, onClick: () => void): TemplateResult {
    return html`<button class="icon-button" aria-label=${this._t(label)} @click=${onClick}>
      <ha-icon icon=${icon}></ha-icon>
    </button>`;
  }

  private _renderControls(session: Session, position: number): TemplateResult {
    const supports = (command: ControlCommand) => session.supported_commands.includes(command);
    const seekKey = `seek:${session.session_id}`;
    const volumeKey = `volume:${session.session_id}`;
    const dragValue = (key: string, fallback: number) =>
      this._dragging?.key === key ? this._dragging.value : fallback;
    const duration = session.duration_s ?? 0;
    const shownPosition = dragValue(seekKey, position);
    const canSeek = session.can_seek && supports("seek") && duration > 0;
    const muteCommand: ControlCommand | null = session.muted
      ? supports("unmute")
        ? "unmute"
        : null
      : supports("mute")
        ? "mute"
        : null;

    return html`
      <div class="controls">
        <div class="line">
          <span class="time">${formatClock(shownPosition)}</span>
          ${canSeek
            ? html`<input
                type="range"
                min="0"
                max=${duration}
                step="1"
                .value=${String(Math.floor(shownPosition))}
                aria-label=${this._t("np.seek")}
                aria-valuetext=${formatClock(shownPosition)}
                @input=${(event: Event) => this._drag(seekKey, event)}
                @change=${(event: Event) => this._commit(session, "seek", event)}
              />`
            : html`<span class="flex"></span>`}
          ${duration > 0 ? html`<span class="time">${formatClock(duration)}</span>` : nothing}
        </div>
        ${supports("set_volume") || muteCommand
          ? html`<div class="line">
              ${muteCommand
                ? this._button(
                    session.muted ? "mdi:volume-off" : "mdi:volume-high",
                    session.muted ? "np.unmute" : "np.mute",
                    () => this._send(session, muteCommand),
                  )
                : html`<ha-icon class="pad" icon="mdi:volume-high"></ha-icon>`}
              ${supports("set_volume")
                ? html`<input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    .value=${String(dragValue(volumeKey, session.volume ?? 100))}
                    aria-label=${this._t("np.volume")}
                    @input=${(event: Event) => this._drag(volumeKey, event)}
                    @change=${(event: Event) => this._commit(session, "set_volume", event)}
                  />`
                : nothing}
            </div>`
          : nothing}
      </div>
    `;
  }

  private _drag(key: string, event: Event): void {
    this._dragging = { key, value: Number((event.target as HTMLInputElement).value) };
  }

  private _commit(session: Session, command: "seek" | "set_volume", event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this._send(session, command, value);
    // Keep showing the chosen value until the next session update arrives.
    setTimeout(() => (this._dragging = null), 2500);
  }

  static override styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        container-type: inline-size;
      }
      .session {
        border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
        background: var(--card-background-color, var(--primary-background-color));
      }
      .strip {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 8px 6px 12px;
      }
      .summary {
        flex: 1;
        min-width: 0;
        min-height: 48px;
        display: flex;
        align-items: center;
        gap: 12px;
        text-align: left;
        border-radius: var(--el-tile-radius);
      }
      .thumb {
        flex: 0 0 72px;
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
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .title,
      .small {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .title {
        font-weight: 500;
      }
      .small {
        font-size: 0.85em;
      }
      .buttons {
        display: flex;
        flex: none;
      }
      .bar {
        height: 3px;
        background: var(--el-surface);
      }
      .bar div {
        height: 100%;
        background: var(--el-accent);
        transition: width 1s linear;
      }
      @media (prefers-reduced-motion: reduce) {
        .bar div {
          transition: none;
        }
      }
      .controls {
        padding: 4px 12px 10px;
      }
      .line {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
      }
      .time {
        font-variant-numeric: tabular-nums;
        font-size: 0.85em;
        color: var(--el-muted);
        min-width: 3.2em;
        text-align: center;
      }
      .flex {
        flex: 1;
      }
      .pad {
        width: 44px;
        text-align: center;
        color: var(--el-muted);
      }
      input[type="range"] {
        flex: 1;
        min-width: 0;
        height: 44px;
        margin: 0;
        accent-color: var(--el-accent);
        background: transparent;
      }
      @container (max-width: 420px) {
        .thumb {
          display: none;
        }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "emby-library-now-playing": EmbyLibraryNowPlaying;
  }
}
