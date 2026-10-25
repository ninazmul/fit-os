"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus } from "lucide-react";
import type { TranslationVars } from "@/lib/i18n";

/** A planned exercise row that the user can tick off and adjust. */
export type ChecklistExercise = {
  exerciseName: string;
  trackingMode: "reps" | "time";
  sets: number;
  reps: number;
  seconds: number;
  selected: boolean;
  setsCompleted: number;
};

type TranslateFn = (key: string, vars?: TranslationVars) => string;

/** Compact −/+ stepper used to pick sets and reps quickly (mobile friendly). */
export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  disabled = false,
  ariaLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  ariaLabel: string;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  const buttonClass =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60";
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label={`${ariaLabel} −`}
        onClick={() => onChange(clamp(value - step))}
        disabled={disabled || value <= min}
        className={buttonClass}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-9 text-center text-sm font-black tabular-nums text-foreground">
        {value}
      </span>
      <button
        type="button"
        aria-label={`${ariaLabel} +`}
        onClick={() => onChange(clamp(value + step))}
        disabled={disabled || value >= max}
        className={buttonClass}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/** One selectable exercise row: checkbox + sets/reps steppers. */
export function ExerciseChecklistItem({
  exercise,
  onChange,
  t,
}: {
  exercise: ChecklistExercise;
  onChange: (patch: Partial<ChecklistExercise>) => void;
  t: TranslateFn;
}) {
  const isTime = exercise.trackingMode === "time";
  return (
    <div
      className={`rounded-2xl border p-3 transition-colors ${
        exercise.selected
          ? "border-primary/40 bg-primary/5"
          : "border-border/60 bg-card/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={exercise.selected}
          onCheckedChange={(checked) =>
            onChange({ selected: Boolean(checked) })
          }
          className="mt-0.5"
          aria-label={exercise.exerciseName}
        />
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-bold ${
              exercise.selected
                ? "text-foreground"
                : "text-muted-foreground line-through"
            }`}
          >
            {exercise.exerciseName}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {t("workout.completion.plannedSets", {
              sets: exercise.sets,
              detail: isTime ? `${exercise.seconds}s` : `${exercise.reps} reps`,
            })}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 pl-7">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            {t("workout.form.setsDone")}
          </p>
          <NumberStepper
            value={exercise.setsCompleted}
            min={0}
            max={exercise.sets}
            disabled={!exercise.selected}
            ariaLabel={t("workout.form.setsDone")}
            onChange={(value) => onChange({ setsCompleted: value })}
          />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            {isTime
              ? t("workout.form.secondsPerSet")
              : t("workout.form.repsPerSet")}
          </p>
          <NumberStepper
            value={isTime ? exercise.seconds : exercise.reps}
            min={0}
            max={isTime ? 600 : 100}
            step={isTime ? 5 : 1}
            disabled={!exercise.selected}
            ariaLabel={
              isTime
                ? t("workout.form.secondsPerSet")
                : t("workout.form.repsPerSet")
            }
            onChange={(value) =>
              onChange(isTime ? { seconds: value } : { reps: value })
            }
          />
        </div>
      </div>
    </div>
  );
}
