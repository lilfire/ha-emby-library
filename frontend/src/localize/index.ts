import type { HomeAssistant } from "../types";
import en from "./en.json";
import nb from "./nb.json";

export type TranslationKey = keyof typeof en;
type Translations = Partial<Record<TranslationKey, string>>;

const LANGUAGES: Record<string, Translations> = { en, nb, no: nb };

export function languageOf(hass: HomeAssistant | undefined): string {
  return hass?.locale?.language ?? hass?.language ?? "en";
}

/** Translate a key. Follows hass.locale.language, with English as fallback. */
export function translate(
  language: string,
  key: TranslationKey,
  vars: Record<string, string | number> = {},
): string {
  const lang = language.toLowerCase();
  const table = LANGUAGES[lang] ?? LANGUAGES[lang.split("-")[0] ?? ""] ?? en;
  let text: string = table[key] ?? en[key] ?? key;
  for (const [name, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

export type Localize = (key: TranslationKey, vars?: Record<string, string | number>) => string;

export function localizer(hass: HomeAssistant | undefined): Localize {
  const language = languageOf(hass);
  return (key, vars) => translate(language, key, vars);
}
