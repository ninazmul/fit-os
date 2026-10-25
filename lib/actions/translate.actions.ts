"use server";

import { currentUser } from "@clerk/nextjs/server";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

/**
 * Dynamic (AI) translation for content that is NOT part of the static
 * dictionaries — e.g. Gemini-generated analytics, AI coach answers, or
 * user/database driven strings.
 *
 * Static UI copy should always use the `t()` dictionary instead of this;
 * calling the model for fixed labels is slow and unnecessary.
 */

const GEMINI_MODEL = "gemini-2.5-flash";

/** Bounded in-memory cache so repeated renders don't re-hit the API. */
const CACHE_LIMIT = 500;
const cache = new Map<string, string>();

function cacheGet(key: string): string | undefined {
  return cache.get(key);
}

function cacheSet(key: string, value: string) {
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
}

interface TranslateResponse {
  translations?: string[];
}

/**
 * Translate an array of strings into the target locale using Gemini.
 * Order and length of the result always match the input. On any failure the
 * original (untranslated) strings are returned so the UI never breaks.
 */
export async function translateTexts(
  texts: string[],
  targetLocale: Locale,
): Promise<string[]> {
  if (!Array.isArray(texts) || texts.length === 0) return texts ?? [];
  if (targetLocale === DEFAULT_LOCALE) return texts;

  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const results: string[] = new Array(texts.length);
  const pending: { index: number; text: string }[] = [];

  texts.forEach((text, index) => {
    const value = typeof text === "string" ? text : String(text ?? "");
    if (!value.trim()) {
      results[index] = value;
      return;
    }
    const cached = cacheGet(`${targetLocale}::${value}`);
    if (cached !== undefined) {
      results[index] = cached;
    } else {
      pending.push({ index, text: value });
    }
  });

  if (pending.length === 0) return results;

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  // Offline / unconfigured → graceful passthrough.
  if (!apiKey) {
    pending.forEach(({ index, text }) => {
      results[index] = text;
    });
    return results;
  }

  const languageName = targetLocale === "bn" ? "Bengali (বাংলা)" : "English";

  const prompt = `You are a professional fitness & nutrition translator.
Translate each string in the JSON array below into ${languageName}.

Rules:
- Preserve the exact array length and order. Return ONE translation per input string.
- Keep numbers, units (g, kg, ml, kcal, cm, %), and brand/technical names (e.g. Gemini, BMI, BMR, TDEE, PWA) unchanged.
- Use natural, conversational tone appropriate for a health app. Do not add explanations.
- If a string is already in ${languageName} or is purely numeric, return it unchanged.

Input JSON array:
${JSON.stringify(pending.map((p) => p.text))}

Output strictly valid JSON:
{ "translations": ["...", "..."] }`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!res.ok) throw new Error(`Gemini responded ${res.status}`);

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed: TranslateResponse = JSON.parse(raw || "{}");
    const out = Array.isArray(parsed.translations) ? parsed.translations : [];

    pending.forEach(({ index, text }, i) => {
      const translated =
        typeof out[i] === "string" && out[i].trim() ? out[i] : text;
      results[index] = translated;
      cacheSet(`${targetLocale}::${text}`, translated);
    });

    return results;
  } catch (err) {
    console.error("translateTexts error:", err);
    pending.forEach(({ index, text }) => {
      results[index] = text;
    });
    return results;
  }
}

/** Convenience single-string variant. */
export async function translateText(
  text: string,
  targetLocale: Locale,
): Promise<string> {
  const [translated] = await translateTexts([text], targetLocale);
  return translated ?? text;
}
