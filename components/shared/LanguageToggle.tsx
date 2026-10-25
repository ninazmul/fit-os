"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/shared/I18nProvider";
import {
  LOCALES,
  LOCALE_SHORT,
  LOCALE_LABELS,
  DEFAULT_LOCALE,
  type Locale,
} from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
  variant?: "button" | "segmented";
}

/**
 * Language toggle component.
 * - "button" (default): Compact circular toggle matching ThemeToggle (h-10 w-10),
 *   ideal for TopNavbar & headers where space is limited.
 * - "segmented": Full EN / বাংলা segmented pill, ideal for sidebars & sheet footers.
 */
export function LanguageToggle({
  className,
  variant,
}: LanguageToggleProps) {
  const { locale, setLocale, toggleLocale, t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedVariant =
    variant ?? (className?.includes("w-full") ? "segmented" : "button");
  const currentLocale = mounted ? locale : DEFAULT_LOCALE;

  if (resolvedVariant === "segmented") {
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
          const active = currentLocale === code;
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

  // Button variant: compact circular toggle identical in size/shape to ThemeToggle
  if (!mounted) {
    return <div className={cn("h-10 w-10", className)} />;
  }

  const title =
    currentLocale === "en"
      ? "বাংলায় পরিবর্তন করুন (Switch to Bangla)"
      : "Switch to English";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLocale}
      className={cn(
        "group relative h-10 w-10 rounded-full",
        "text-foreground/80 hover:bg-muted/80 hover:text-foreground",
        "dark:text-foreground/80 dark:hover:bg-muted/60 dark:hover:text-foreground",
        "transition-all duration-300",
        className,
      )}
      title={title}
      aria-label={t("a11y.selectLanguage")}
    >
      <div className="relative flex items-center justify-center">
        <Languages className="h-[1.1rem] w-[1.1rem] transition-transform duration-300 group-hover:rotate-12" />
        <span className="absolute -bottom-1.5 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[8px] font-black uppercase leading-none text-primary-foreground shadow-2xs ring-2 ring-background">
          {LOCALE_SHORT[currentLocale]}
        </span>
      </div>
    </Button>
  );
}
