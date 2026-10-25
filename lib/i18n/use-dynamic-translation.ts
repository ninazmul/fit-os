"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/shared/I18nProvider";
import { translateTexts } from "@/lib/actions/translate.actions";
import { DEFAULT_LOCALE } from "@/lib/i18n";

/** Recursively collect every string leaf, preserving traversal order. */
function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    out.push(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, out));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStrings(item, out));
  }
  return out;
}

/** Rebuild the structure, consuming translated strings from the queue. */
function applyStrings<T>(value: T, queue: string[]): T {
  if (typeof value === "string") {
    return (queue.shift() ?? value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => applyStrings(item, queue)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const clone: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      clone[key] = applyStrings(item, queue);
    }
    return clone as T;
  }
  return value;
}

/**
 * Translate AI-generated / dynamic content (analytics reports, coach answers,
 * database-driven strings) into the active locale.
 *
 * Static UI copy should use `t()` from `useI18n()` instead — this hook calls
 * the Gemini-backed `translateTexts` action and is meant for content that
 * cannot live in the dictionary.
 *
 * Returns the original structure until the translation resolves (and always
 * falls back to it on failure), so the UI never blocks or breaks.
 */
export function useDynamicTranslation<T>(source: T): T {
  const { locale } = useI18n();
  const [translated, setTranslated] = useState<T>(source);
  const sourceKey = useMemo(() => JSON.stringify(source), [source]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (locale === DEFAULT_LOCALE) {
        if (!cancelled) setTranslated(source);
        return;
      }

      const strings = collectStrings(source);
      if (strings.length === 0) {
        if (!cancelled) setTranslated(source);
        return;
      }

      try {
        const result = await translateTexts(strings, locale);
        if (!cancelled) setTranslated(applyStrings(source, [...result]));
      } catch {
        if (!cancelled) setTranslated(source);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, sourceKey]);

  return translated;
}
