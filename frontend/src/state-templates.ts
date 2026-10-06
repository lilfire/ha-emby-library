import { html, nothing, type TemplateResult } from "lit";

import { translate, type TranslationKey } from "./localize";
import type { ErrorCode } from "./types";

const ERROR_KEYS: Partial<Record<ErrorCode, TranslationKey>> = {
  emby_unreachable: "error.unreachable",
  emby_auth_failed: "error.auth",
  entry_required: "error.entry_required",
  entry_not_found: "error.entry_not_found",
  not_found: "error.not_found",
  unsupported_command: "error.unsupported",
  session_not_found: "target.lost",
  not_controllable: "target.lost",
};

export function errorText(lang: string, code: ErrorCode): string {
  return translate(lang, ERROR_KEYS[code] ?? "error.generic");
}

/** A readable error state. Retry is offered when trying again can help. */
export function errorState(lang: string, code: ErrorCode, retry?: () => void): TemplateResult {
  const canRetry = retry !== undefined && (code === "emby_unreachable" || code === "unknown");
  return html`
    <div class="state error" role="alert">
      <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
      <div>${errorText(lang, code)}</div>
      ${canRetry
        ? html`<button class="button" @click=${retry}>
            <ha-icon icon="mdi:refresh"></ha-icon>${translate(lang, "error.retry")}
          </button>`
        : nothing}
    </div>
  `;
}

export function emptyState(text: string, icon = "mdi:movie-open-outline"): TemplateResult {
  return html`
    <div class="state" role="status">
      <ha-icon icon=${icon}></ha-icon>
      <div>${text}</div>
    </div>
  `;
}
