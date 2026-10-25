import { DEFAULT_LOCALE, type Locale } from "./config";
import { commonEn, commonBn } from "./dictionaries/common";
import { landingEn, landingBn } from "./dictionaries/landing";
import { dashboardEn, dashboardBn } from "./dictionaries/dashboard";
import { dietEn, dietBn } from "./dictionaries/diet";
import { workoutEn, workoutBn } from "./dictionaries/workout";
import { progressEn, progressBn } from "./dictionaries/progress";
import { analyticsEn, analyticsBn } from "./dictionaries/analytics";
import { profileEn, profileBn } from "./dictionaries/profile";
import { settingsEn, settingsBn } from "./dictionaries/settings";
import { aboutEn, aboutBn } from "./dictionaries/about";
import { calculatorsEn, calculatorsBn } from "./dictionaries/calculators";
import { sharedEn, sharedBn } from "./dictionaries/shared";
import { guideEn, guideBn } from "./dictionaries/guide";

export * from "./config";

/**
 * Merged bilingual dictionaries, one namespace module per surface.
 * Add a new namespace by importing its `en`/`bn` maps and spreading them here.
 */
export const dictionaries: Record<Locale, Record<string, string>> = {
  en: {
    ...commonEn,
    ...landingEn,
    ...dashboardEn,
    ...dietEn,
    ...workoutEn,
    ...progressEn,
    ...analyticsEn,
    ...profileEn,
    ...settingsEn,
    ...aboutEn,
    ...calculatorsEn,
    ...sharedEn,
    ...guideEn,
  },
  bn: {
    ...commonBn,
    ...landingBn,
    ...dashboardBn,
    ...dietBn,
    ...workoutBn,
    ...progressBn,
    ...analyticsBn,
    ...profileBn,
    ...settingsBn,
    ...aboutBn,
    ...calculatorsBn,
    ...sharedBn,
    ...guideBn,
  },
};

export type TranslationVars = Record<string, string | number>;

/**
 * Resolve a translation key for a locale with `{var}` interpolation and
 * automatic fallback to English (and finally the raw key) when missing.
 */
export function translate(
  locale: Locale,
  key: string,
  vars?: TranslationVars,
): string {
  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
  let value = dict[key] ?? dictionaries[DEFAULT_LOCALE][key] ?? key;

  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replace(
        new RegExp(`\\{${name}\\}`, "g"),
        String(replacement),
      );
    }
  }

  return value;
}
