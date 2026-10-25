/**
 * Lightweight i18n configuration.
 * Static UI copy lives in `lib/i18n/dictionaries/*` (bilingual EN/BN).
 * Dynamic / AI-generated content is translated on demand via
 * `translateTexts()` in `lib/actions/translate.actions.ts`.
 */

export const LOCALES = ["en", "bn"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie is read by the client provider for cross-session persistence. */
export const LOCALE_COOKIE = "nutribd_locale";

/** localStorage key used as the fast-path persistence layer. */
export const LOCALE_STORAGE_KEY = "nutribd-locale";

/** Human-readable label per locale (shown in the toggle menu). */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  bn: "বাংলা",
};

/** Short badge label used inside the compact toggle button. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  bn: "বাং",
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (LOCALES as readonly string[]).includes(value)
  );
}
