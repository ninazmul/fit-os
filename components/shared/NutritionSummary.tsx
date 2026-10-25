"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/components/shared/I18nProvider";

export interface NutritionMetric {
  /** Stable key used to pick a consistent colour across the app. */
  key: "calories" | "protein" | "carbs" | "fat" | "fiber" | string;
  label: string;
  consumed: number;
  target: number;
  /** Display unit, e.g. "kcal" or "g". */
  unit: string;
}

interface NutritionSummaryProps {
  calories: NutritionMetric;
  macros: NutritionMetric[];
  className?: string;
}

const METRIC_STYLES: Record<
  string,
  { bar: string; text: string; icon: string }
> = {
  protein: {
    bar: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: "text-emerald-500",
  },
  carbs: {
    bar: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    icon: "text-amber-500",
  },
  fat: {
    bar: "bg-sky-500",
    text: "text-sky-600 dark:text-sky-400",
    icon: "text-sky-500",
  },
  fiber: {
    bar: "bg-purple-500",
    text: "text-purple-600 dark:text-purple-400",
    icon: "text-purple-500",
  },
};

const FALLBACK_STYLE = {
  bar: "bg-primary",
  text: "text-primary",
  icon: "text-primary",
};

function percent(consumed: number, target: number) {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((consumed / target) * 100));
}

function format(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/**
 * Today's nutrition at a glance: calories are the most prominent metric and
 * protein / carbs / fat / fiber sit in a compact secondary section.
 *
 * Progress is conveyed with both a number and a bar so the meaning is never
 * dependent on colour alone.
 */
export default function NutritionSummary({
  calories,
  macros,
  className,
}: NutritionSummaryProps) {
  const { t } = useI18n();
  const remaining = calories.target - calories.consumed;
  const over = remaining < 0;
  const caloriePct = percent(calories.consumed, calories.target);

  return (
    <section
      aria-label={t("nutrition.summaryAria")}
      className={cn(
        "glass-card space-y-4 rounded-3xl border border-border/50 p-5 sm:p-6",
        className,
      )}
    >
      {/* Calories — primary metric */}
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-muted-foreground">
            {calories.label}
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            {t("nutrition.percentOfTarget", { pct: caloriePct })}
          </p>
        </div>

        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-heading text-3xl font-black tracking-tight sm:text-4xl">
            {format(calories.consumed)}
          </span>
          <span className="text-base font-semibold text-muted-foreground">
            / {format(calories.target)} {calories.unit}
          </span>
        </div>

        <p
          className={cn(
            "mt-1 text-sm font-semibold",
            over ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400",
          )}
        >
          {over
            ? t("nutrition.overTarget", {
                amount: format(Math.abs(remaining)),
                unit: calories.unit,
              })
            : t("nutrition.remainingAmount", {
                amount: format(remaining),
                unit: calories.unit,
              })}
        </p>

        <div
          className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={caloriePct}
          aria-label={t("nutrition.progressAria", {
            label: calories.label,
            pct: caloriePct,
          })}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              over ? "bg-amber-500" : "bg-primary",
            )}
            style={{ width: `${caloriePct}%` }}
          />
        </div>
      </div>

      {/* Macros — compact secondary section */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 pt-4 sm:grid-cols-4">
        {macros.map((macro) => {
          const style = METRIC_STYLES[macro.key] ?? FALLBACK_STYLE;
          const pct = percent(macro.consumed, macro.target);

          return (
            <div key={macro.key}>
              <div className="flex items-baseline justify-between gap-2">
                <span className={cn("text-xs font-bold", style.text)}>
                  {macro.label}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {pct}%
                </span>
              </div>
              <p className="mt-0.5 text-sm font-semibold tabular-nums">
                {format(macro.consumed)}
                <span className="font-normal text-muted-foreground">
                  {" "}
                  / {format(macro.target)}
                  {macro.unit === "kcal" ? "" : macro.unit}
                </span>
              </p>
              <div
                className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                aria-label={t("nutrition.progressAria", {
                  label: macro.label,
                  pct,
                })}
              >
                <div
                  className={cn("h-full rounded-full transition-all duration-500", style.bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
