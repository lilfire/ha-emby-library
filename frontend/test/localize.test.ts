import { describe, expect, it } from "vitest";

import { languageOf, localizer, translate } from "../src/localize";
import en from "../src/localize/en.json";
import nb from "../src/localize/nb.json";
import type { HomeAssistant } from "../src/types";

describe("localize", () => {
  it("has the same keys in English and Norwegian", () => {
    expect(Object.keys(nb).sort()).toEqual(Object.keys(en).sort());
  });

  it("keeps the same placeholders in both languages", () => {
    const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(placeholders(nb[key]), key).toEqual(placeholders(en[key]));
    }
  });

  it("follows the language with English as fallback", () => {
    expect(translate("nb", "shelf.resume")).toBe("Fortsett å se");
    expect(translate("nb-NO", "nav.library")).toBe("Bibliotek");
    expect(translate("no", "nav.search")).toBe("Søk");
    expect(translate("en-GB", "shelf.resume")).toBe("Continue watching");
    expect(translate("de", "shelf.resume")).toBe("Continue watching");
  });

  it("fills in placeholders", () => {
    expect(translate("nb", "search.empty", { term: "dune" })).toBe("Ingen treff på «dune».");
    expect(translate("en", "library.count", { count: 1234 })).toBe("1234 items");
  });

  it("reads the language from hass", () => {
    const hass = { locale: { language: "nb" } } as HomeAssistant;
    expect(languageOf(hass)).toBe("nb");
    expect(languageOf({ language: "sv" } as HomeAssistant)).toBe("sv");
    expect(languageOf(undefined)).toBe("en");
    expect(localizer(hass)("target.none")).toBe("Åpne Emby på enheten du vil spille på");
  });
});
