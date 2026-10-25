"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/components/shared/I18nProvider";
import { LOCALES, LOCALE_SHORT, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
}

/**
 * Compact EN / বাংলা segmented toggle.
 * Reads & writes the active locale through <I18nProvider> so the whole app
 * re-renders with the selected language and the choice is persisted.
 */
export function LanguageToggle({ className }: LanguageToggleProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("a11y.selectLanguage")}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border/60 bg-muted/40 p-0.5",
        className,
      )}
    >
      <Languages
        aria-hidden="true"
        className="ml-1.5 mr-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
      />
      {LOCALES.map((code: Locale) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            title={LOCALE_LABELS[code]}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-bold leading-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {LOCALE_SHORT[code]}
          </button>
        );
      })}
    </div>
  );
}
