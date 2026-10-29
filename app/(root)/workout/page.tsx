"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  addPersonalRecord,
  completeWorkoutPlanDay,
  deletePersonalRecord,
  deleteWorkoutLog,
  getPersonalRecords,
  getWorkoutHistory,
  getWorkoutPlan,
  logWorkout,
  saveWorkoutPlan,
} from "@/lib/actions/workout.actions";
import { notifyDataUpdated, useDataUpdateListener } from "@/lib/events";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatCard from "@/components/shared/StatCard";
import EmptyState from "@/components/shared/EmptyState";
import PageHeader from "@/components/shared/PageHeader";
import {
  ExerciseChecklistItem,
  type ChecklistExercise,
} from "@/components/shared/ExerciseChecklistItem";
import { useI18n } from "@/components/shared/I18nProvider";
import {
  Dumbbell,
  Plus,
  Trophy,
  Flame,
  Clock,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Pencil,
  RotateCcw,
  GripVertical,
  X,
} from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";
import { formatDuration, getLocalDateString, splitDuration } from "@/lib/utils";
import type { TranslationVars } from "@/lib/i18n";
import type {
  WorkoutType,
  IWorkoutExercise,
  IWorkoutPlanDay,
  IWorkoutPlanExercise,
  IPersonalRecordSummary,
} from "@/types/fitness";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

const AdUnit = dynamic(() => import("@/components/shared/AdUnit"), {
  ssr: false,
});

const workoutTypes: { type: WorkoutType; labelKey: string }[] = [
  { type: "push", labelKey: "workout.type.push" },
  { type: "pull", labelKey: "workout.type.pull" },
  { type: "legs", labelKey: "workout.type.legs" },
  { type: "upper", labelKey: "workout.type.upper" },
  { type: "lower", labelKey: "workout.type.lower" },
  { type: "full_body", labelKey: "workout.type.fullBody" },
  { type: "cardio", labelKey: "workout.type.cardio" },
  { type: "custom", labelKey: "workout.type.custom" },
];

const weekDays = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

type PlanExerciseEditor = {
  /** Stable client-side key so drag-to-reorder keeps row identity. */
  id: string;
  exerciseName: string;
  trackingMode: "reps" | "time";
  sets: number;
  reps: number;
  seconds: number;
  weight: number; // working load per set, in kg
};

type PlanDayEditor = {
  _id?: string;
  dayOfWeek: number;
  title: string;
  exercises: PlanExerciseEditor[];
};

let planExerciseIdSeq = 0;
const makePlanExerciseId = () => `pe-${(planExerciseIdSeq += 1)}`;

const createPlanExercise = (
  exerciseName: string,
  sets = 3,
  reps = 10,
  seconds = 0,
  trackingMode: "reps" | "time" = "reps",
  weight = 0,
): PlanExerciseEditor => ({
  id: makePlanExerciseId(),
  exerciseName,
  trackingMode,
  sets,
  reps,
  seconds,
  weight,
});

type QuickWorkoutExercise = IWorkoutExercise & {
  trackingMode: "reps" | "time";
  seconds: number;
};

const createPlanDay = (dayOfWeek = new Date().getDay()): PlanDayEditor => ({
  dayOfWeek,
  title: `${weekDays.find((day) => day.value === dayOfWeek)?.label || "Daily"} Workout`,
  exercises: [
    createPlanExercise("Bench Press", 3, 10),
    createPlanExercise("Shoulder Press", 3, 10),
    createPlanExercise("Triceps Pushdown", 3, 12),
  ],
});

const workoutTemplates: { nameKey: string; days: PlanDayEditor[] }[] = [
  {
    nameKey: "workout.template.fullBody3",
    days: [
      createPlanDay(1),
      { ...createPlanDay(3), title: "Full Body B" },
      { ...createPlanDay(5), title: "Full Body C" },
    ],
  },
  {
    nameKey: "workout.template.upperLower4",
    days: [
      { ...createPlanDay(1), title: "Upper Strength" },
      {
        ...createPlanDay(2),
        title: "Lower Strength",
        exercises: [
          createPlanExercise("Squat", 4, 8),
          createPlanExercise("Romanian Deadlift", 3, 10),
          createPlanExercise("Plank", 3, 0, 45, "time"),
        ],
      },
      { ...createPlanDay(4), title: "Upper Volume" },
      {
        ...createPlanDay(6),
        title: "Lower Volume",
        exercises: [
          createPlanExercise("Leg Press", 4, 12),
          createPlanExercise("Lunges", 3, 12),
          createPlanExercise("Side Plank", 3, 0, 30, "time"),
        ],
      },
    ],
  },
  {
    nameKey: "workout.template.ppl6",
    days: [
      { ...createPlanDay(0), title: "Push A" },
      {
        ...createPlanDay(1),
        title: "Pull A",
        exercises: [
          createPlanExercise("Lat Pulldown", 4, 10),
          createPlanExercise("Seated Row", 3, 10),
          createPlanExercise("Biceps Curl", 3, 12),
        ],
      },
      { ...createPlanDay(2), title: "Legs A" },
      { ...createPlanDay(4), title: "Push B" },
      { ...createPlanDay(5), title: "Pull B" },
      { ...createPlanDay(6), title: "Legs B" },
    ],
  },
];

/** Map a saved plan day into the editable draft shape. */
const toPlanDayEditor = (day: IWorkoutPlanDay): PlanDayEditor => ({
  _id: day._id,
  dayOfWeek: day.dayOfWeek,
  title: day.title,
  exercises: day.exercises.map((exercise) =>
    createPlanExercise(
      exercise.exerciseName,
      exercise.sets,
      exercise.reps,
      exercise.seconds || 0,
      exercise.trackingMode || "reps",
      exercise.weight || 0,
    ),
  ),
});

/** Draft days stay in weekday order so edit indexes remain predictable. */
const sortPlanDraft = (days: PlanDayEditor[]) =>
  [...days].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

/** Seed a checklist row from a planned exercise (defaults to fully completed). */
const toCompletionEditor = (
  exercise: IWorkoutPlanExercise | PlanExerciseEditor,
): ChecklistExercise => ({
  exerciseName: exercise.exerciseName,
  trackingMode: exercise.trackingMode || "reps",
  sets: exercise.sets,
  reps: exercise.reps,
  seconds: exercise.seconds || 0,
  weight: exercise.weight || 0,
  selected: true,
  setsCompleted: exercise.sets,
});

/** Persist a completed plan day (only the selected exercises are sent). */
const saveDayCompletion = async (
  dayId: string,
  exercises: ChecklistExercise[],
) => {
  await completeWorkoutPlanDay(
    getLocalDateString(),
    dayId,
    exercises.map((exercise) => ({
      exerciseName: exercise.exerciseName,
      trackingMode: exercise.trackingMode,
      setsCompleted: exercise.setsCompleted,
      reps: exercise.trackingMode === "time" ? 0 : exercise.reps,
      seconds: exercise.trackingMode === "time" ? exercise.seconds : 0,
      weight: exercise.trackingMode === "time" ? 0 : exercise.weight || 0,
    })),
  );
};

/** Tiny uppercase caption shown above each field in the compact plan row. */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block truncate text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}

const compactNumberInput =
  "h-9 rounded-xl bg-background px-2 text-center text-sm font-bold tabular-nums";

const compactSetInput =
  "h-8 w-16 rounded-lg bg-background px-1 text-center text-xs font-bold tabular-nums";

/**
 * One draggable exercise row inside a plan day editor. Dragging is limited to
 * the grip handle so the inputs stay usable on touch devices. Text/number
 * inputs are uncontrolled and write straight to the draft ref, so typing never
 * re-renders this framer-motion row (which would dismiss the mobile keyboard).
 */
function PlanExerciseRow({
  exercise,
  canRemove,
  t,
  onChange,
  onFieldChange,
  onDurationChange,
  onRemove,
}: {
  exercise: PlanExerciseEditor;
  canRemove: boolean;
  t: (key: string, vars?: TranslationVars) => string;
  onChange: (patch: Partial<PlanExerciseEditor>) => void;
  onFieldChange: (patch: Partial<PlanExerciseEditor>) => void;
  onDurationChange: (part: "min" | "sec", value: number) => void;
  onRemove: () => void;
}) {
  const dragControls = useDragControls();
  const isTime = exercise.trackingMode === "time";
  const duration = splitDuration(exercise.seconds);

  return (
    <Reorder.Item
      value={exercise.id}
      dragListener={false}
      dragControls={dragControls}
      style={{ position: "relative" }}
      className="flex flex-wrap items-end gap-2.5 rounded-2xl border border-border/60 bg-muted/20 p-2.5 transition-colors focus-within:border-primary/40"
    >
      <div className="flex w-full min-w-0 items-end gap-2 sm:w-auto sm:flex-1">
        <button
          type="button"
          onPointerDown={(event) => dragControls.start(event)}
          aria-label={t("workout.builder.dragHint")}
          title={t("workout.builder.dragHint")}
          className="flex h-9 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-primary active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1 space-y-1">
          <FieldLabel>{t("workout.form.exercise")}</FieldLabel>
          <Input
            defaultValue={exercise.exerciseName}
            onChange={(event) =>
              onFieldChange({ exerciseName: event.target.value })
            }
            placeholder={t("workout.form.planExercisePlaceholder")}
            className="h-9 rounded-xl font-semibold"
          />
        </div>
      </div>

      <div className="w-[86px] space-y-1">
        <FieldLabel>{t("workout.form.mode")}</FieldLabel>
        <Select
          value={exercise.trackingMode}
          onValueChange={(value) =>
            onChange({
              trackingMode: value as "reps" | "time",
              reps: value === "time" ? 0 : exercise.reps || 10,
              seconds: value === "time" ? exercise.seconds || 30 : 0,
            })
          }
        >
          <SelectTrigger className="h-9 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reps">{t("workout.form.reps")}</SelectItem>
            <SelectItem value="time">{t("workout.form.time")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-[58px] space-y-1">
        <FieldLabel>{t("workout.form.sets")}</FieldLabel>
        <Input
          key={`sets-${exercise.id}`}
          type="number"
          inputMode="numeric"
          min={1}
          defaultValue={exercise.sets}
          onChange={(event) =>
            onFieldChange({ sets: Number(event.target.value) })
          }
          aria-label={t("workout.form.sets")}
          className={compactNumberInput}
        />
      </div>

      {isTime ? (
        <>
          <div className="w-[58px] space-y-1">
            <FieldLabel>{t("workout.form.minShort")}</FieldLabel>
            <Input
              key={`min-${exercise.id}`}
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={duration.minutes}
              onChange={(event) =>
                onDurationChange("min", Number(event.target.value))
              }
              aria-label={t("workout.form.minutes")}
              className={compactNumberInput}
            />
          </div>
          <div className="w-[58px] space-y-1">
            <FieldLabel>{t("workout.form.secShort")}</FieldLabel>
            <Input
              key={`sec-${exercise.id}`}
              type="number"
              inputMode="numeric"
              min={0}
              max={59}
              defaultValue={duration.seconds}
              onChange={(event) =>
                onDurationChange("sec", Number(event.target.value))
              }
              aria-label={t("workout.form.seconds")}
              className={compactNumberInput}
            />
          </div>
        </>
      ) : (
        <>
          <div className="w-[58px] space-y-1">
            <FieldLabel>{t("workout.form.reps")}</FieldLabel>
            <Input
              key={`reps-${exercise.id}`}
              type="number"
              inputMode="numeric"
              min={1}
              defaultValue={exercise.reps}
              onChange={(event) =>
                onFieldChange({ reps: Number(event.target.value) })
              }
              aria-label={t("workout.form.reps")}
              className={compactNumberInput}
            />
          </div>
          <div className="w-[64px] space-y-1">
            <FieldLabel>{t("workout.form.weightShort")}</FieldLabel>
            <Input
              key={`weight-${exercise.id}`}
              type="number"
              inputMode="decimal"
              min={0}
              step="2.5"
              defaultValue={exercise.weight}
              onChange={(event) =>
                onFieldChange({ weight: Number(event.target.value) })
              }
              aria-label={t("workout.form.weightKg")}
              className={compactNumberInput}
            />
          </div>
        </>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={!canRemove}
        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-red-500"
        aria-label={t("workout.actions.removeExercise")}
        title={t("workout.actions.removeExercise")}
      >
        <X className="w-4 h-4" />
      </Button>
    </Reorder.Item>
  );
}

export default function WorkoutPage() {
  const { t } = useI18n();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [prs, setPrs] = useState<Record<string, IPersonalRecordSummary>>({});
  const [planDays, setPlanDaysState] = useState<PlanDayEditor[]>([]);
  /**
   * Live mirror of the plan draft. Per-keystroke text edits write straight to
   * this ref (no state update) so typing never re-renders a row. Re-rendering a
   * framer-motion `Reorder.Item` makes it re-run its layout projection for the
   * focused row on every character, which dismisses the mobile keyboard.
   */
  const planDaysRef = useRef<PlanDayEditor[]>([]);

  /** Single entry point for draft changes: keeps the ref and state in sync. */
  const setPlanDays = (
    next: PlanDayEditor[] | ((prev: PlanDayEditor[]) => PlanDayEditor[]),
  ) => {
    planDaysRef.current =
      typeof next === "function" ? next(planDaysRef.current) : next;
    setPlanDaysState(planDaysRef.current);
  };
  const [savedPlanDays, setSavedPlanDays] = useState<IWorkoutPlanDay[]>([]);
  const skipNextWorkoutRefreshRef = useRef(false);
  // Index of the single day currently open for inline editing (null = plan view).
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  // Mirrors editingDayIndex so background refreshes never clobber an open draft.
  const editingDayIndexRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [planSaving, setPlanSaving] = useState(false);
  const [completingDayId, setCompletingDayId] = useState<string | null>(null);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [completionDay, setCompletionDay] = useState<IWorkoutPlanDay | null>(
    null,
  );
  const [completionExercises, setCompletionExercises] = useState<
    ChecklistExercise[]
  >([]);

  // Today's inline workout checklist
  const [todayChecklist, setTodayChecklist] = useState<
    ChecklistExercise[]
  >([]);
  const [savingToday, setSavingToday] = useState(false);

  // New Workout Dialog State
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("Push Workout");
  const [workoutType, setWorkoutType] = useState<WorkoutType>("push");
  const [notes] = useState("");

  // Exercises list in active workout
  const [exercises, setExercises] = useState<QuickWorkoutExercise[]>([
    {
      exerciseName: "Bench Press",
      trackingMode: "reps",
      seconds: 0,
      sets: [
        { setNumber: 1, reps: 10, weight: 0 },
        { setNumber: 2, reps: 10, weight: 0 },
        { setNumber: 3, reps: 10, weight: 0 },
      ],
    },
  ]);

  // Manual personal-record dialog state
  const [prModalOpen, setPrModalOpen] = useState(false);
  const [prSaving, setPrSaving] = useState(false);
  const [prForm, setPrForm] = useState({
    exerciseName: "",
    weight: "",
    reps: "",
    date: getLocalDateString(),
  });

  /**
   * Load the latest workouts/PRs/plan.
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [history, prData, plan] = await Promise.all([
        getWorkoutHistory(30),
        getPersonalRecords(),
        getWorkoutPlan(),
      ]);
      setWorkouts(history);
      setPrs(prData);
      const days = (plan?.days || []) as IWorkoutPlanDay[];
      setSavedPlanDays(days);
      // Keep an open day draft intact; otherwise mirror the saved plan.
      if (editingDayIndexRef.current === null) {
        setPlanDays(sortPlanDraft(days.map(toPlanDayEditor)));
      }
      const todayPlan = days.find(
        (day) => day.dayOfWeek === new Date().getDay(),
      );
      setTodayChecklist(
        todayPlan ? todayPlan.exercises.map(toCompletionEditor) : [],
      );
    } catch (err) {
      console.error("Error fetching workouts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useDataUpdateListener((category) => {
    if (category === "workout" || category === "all") {
      if (skipNextWorkoutRefreshRef.current) {
        skipNextWorkoutRefreshRef.current = false;
        return;
      }
      fetchData();
    }
  });

  // Today's plan + checklist derived state
  const todayDow = new Date().getDay();
  const todayPlanDay =
    savedPlanDays.find((day) => day.dayOfWeek === todayDow) ?? null;
  const todaySelectedCount = todayChecklist.filter(
    (item) => item.selected && item.setsCompleted > 0,
  ).length;
  const todayProgress =
    todayChecklist.length > 0
      ? Math.round((todaySelectedCount / todayChecklist.length) * 100)
      : 0;
  const todayTotalSets = todayChecklist.reduce(
    (sum, item) => sum + (item.selected ? item.setsCompleted : 0),
    0,
  );

  const resetTodayChecklist = () => {
    setTodayChecklist(
      todayPlanDay ? todayPlanDay.exercises.map(toCompletionEditor) : [],
    );
  };

  const updateTodayExercise = (
    index: number,
    patch: Partial<ChecklistExercise>,
  ) => {
    setTodayChecklist((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const handleSaveTodayWorkout = async () => {
    if (!todayPlanDay?._id) return;
    const completed = todayChecklist.filter(
      (item) => item.selected && item.setsCompleted > 0,
    );
    if (completed.length === 0) {
      toast.error(t("workout.today.selectAtLeastOne"));
      return;
    }
    try {
      setSavingToday(true);
      await saveDayCompletion(todayPlanDay._id, completed);
      toast.success(t("workout.today.saved"));
      notifyDataUpdated("workout");
      await fetchData();
    } catch {
      toast.error(t("workout.toast.dayCompleteFailed"));
    } finally {
      setSavingToday(false);
    }
  };

  /** Open a single day for editing (only one day can be edited at a time). */
  const startEditingDay = (index: number) => {
    editingDayIndexRef.current = index;
    setEditingDayIndex(index);
  };

  const stopEditingDay = () => {
    editingDayIndexRef.current = null;
    setEditingDayIndex(null);
  };

  const handleCancelDayEdit = () => {
    const index = editingDayIndex;
    const draft = index === null ? null : planDaysRef.current[index];
    if (draft && !draft._id) {
      // A brand-new day that was never persisted — drop it entirely.
      setPlanDays((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    } else {
      setPlanDays(sortPlanDraft(savedPlanDays.map(toPlanDayEditor)));
    }
    stopEditingDay();
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    const targetEx = updated[exerciseIndex];
    const lastSet = targetEx.sets[targetEx.sets.length - 1] || {
      weight: 20,
      reps: 10,
    };
    targetEx.sets.push({
      setNumber: targetEx.sets.length + 1,
      reps: targetEx.trackingMode === "time" ? 0 : lastSet.reps,
      weight: targetEx.trackingMode === "time" ? 0 : Number(lastSet.weight) || 0,
      durationSeconds:
        targetEx.trackingMode === "time"
          ? lastSet.durationSeconds || targetEx.seconds || 30
          : 0,
    });
    setExercises(updated);
  };

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        exerciseName: "Incline Dumbbell Press",
        trackingMode: "reps",
        seconds: 0,
        sets: [{ setNumber: 1, reps: 10, weight: 0 }],
      },
    ]);
  };

  /** Update one set's duration from either its minutes or seconds field. */
  const handleSetDurationChange = (
    exerciseIndex: number,
    setIndex: number,
    part: "min" | "sec",
    raw: number,
  ) => {
    const safe = Math.max(0, Math.floor(Number(raw) || 0));
    setExercises((prev) =>
      prev.map((exercise, exIndex) => {
        if (exIndex !== exerciseIndex) return exercise;
        const sets = exercise.sets.map((set, sIndex) => {
          if (sIndex !== setIndex) return set;
          const { minutes, seconds: secs } = splitDuration(
            set.durationSeconds ?? exercise.seconds ?? 0,
          );
          const next =
            part === "min"
              ? safe * 60 + secs
              : minutes * 60 + Math.min(59, safe);
          return { ...set, durationSeconds: next };
        });
        const firstDuration = sets[0]?.durationSeconds;
        return {
          ...exercise,
          sets,
          seconds: firstDuration ?? exercise.seconds,
        };
      }),
    );
  };

  /** Append a fresh day and open it straight away for editing. */
  const handleAddPlanDay = () => {
    const current = planDaysRef.current;
    const usedDays = new Set(current.map((day) => day.dayOfWeek));
    const nextDay = current.length
      ? (weekDays.find((day) => !usedDays.has(day.value))?.value ?? 0)
      : todayDow;
    const created = createPlanDay(nextDay);
    const nextDraft = sortPlanDraft([...current, created]);
    setPlanDays(nextDraft);
    // The draft is weekday-sorted, so open the index of the day we just added.
    startEditingDay(nextDraft.indexOf(created));
  };

  const handleRemovePlanDay = (dayIndex: number) => {
    setPlanDays((prev) => prev.filter((_, index) => index !== dayIndex));
    stopEditingDay();
  };

  const handlePlanDayChange = (
    dayIndex: number,
    patch: Partial<PlanDayEditor>,
  ) => {
    setPlanDays((prev) =>
      prev.map((day, index) =>
        index === dayIndex ? { ...day, ...patch } : day,
      ),
    );
  };

  /**
   * Ref-only title edit (no re-render) so the focused input keeps the mobile
   * keyboard open while typing.
   */
  const handlePlanDayTitleChange = (dayIndex: number, title: string) => {
    const days = planDaysRef.current;
    if (!days[dayIndex]) return;
    planDaysRef.current = days.map((day, index) =>
      index === dayIndex ? { ...day, title } : day,
    );
  };

  const handlePlanExerciseChange = (
    dayIndex: number,
    exerciseIndex: number,
    patch: Partial<PlanExerciseEditor>,
  ) => {
    setPlanDays((prev) =>
      prev.map((day, index) => {
        if (index !== dayIndex) return day;
        return {
          ...day,
          exercises: day.exercises.map((exercise, exIndex) =>
            exIndex === exerciseIndex ? { ...exercise, ...patch } : exercise,
          ),
        };
      }),
    );
  };

  /**
   * Ref-only field edit (no re-render) for the per-keystroke text and number
   * inputs inside the draggable rows.
   */
  const handlePlanExerciseFieldChange = (
    dayIndex: number,
    exerciseIndex: number,
    patch: Partial<PlanExerciseEditor>,
  ) => {
    const days = planDaysRef.current;
    const day = days[dayIndex];
    if (!day) return;
    planDaysRef.current = days.map((item, index) =>
      index !== dayIndex
        ? item
        : {
            ...item,
            exercises: item.exercises.map((exercise, exIndex) =>
              exIndex === exerciseIndex ? { ...exercise, ...patch } : exercise,
            ),
          },
    );
  };

  /**
   * Ref-only duration edit (no re-render). The UI splits a duration into a
   * minutes field and a seconds field; both write back a single total in
   * seconds so the stored value stays canonical.
   */
  const handlePlanExerciseDurationChange = (
    dayIndex: number,
    exerciseIndex: number,
    part: "min" | "sec",
    raw: number,
  ) => {
    const days = planDaysRef.current;
    const exercise = days[dayIndex]?.exercises[exerciseIndex];
    if (!exercise) return;
    const { minutes, seconds } = splitDuration(exercise.seconds);
    const safe = Math.max(0, Math.floor(Number(raw) || 0));
    const next =
      part === "min" ? safe * 60 + seconds : minutes * 60 + Math.min(59, safe);
    planDaysRef.current = days.map((item, index) =>
      index !== dayIndex
        ? item
        : {
            ...item,
            exercises: item.exercises.map((ex, exIndex) =>
              exIndex === exerciseIndex ? { ...ex, seconds: next } : ex,
            ),
          },
    );
  };

  const handleAddPlanExercise = (dayIndex: number) => {
    setPlanDays((prev) =>
      prev.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              exercises: [...day.exercises, createPlanExercise("New Exercise")],
            }
          : day,
      ),
    );
  };

  /** Drag-to-reorder: rebuild the day's exercise list in the dropped order. */
  const handleReorderPlanExercises = (
    dayIndex: number,
    orderedIds: string[],
  ) => {
    setPlanDays((prev) =>
      prev.map((day, index) => {
        if (index !== dayIndex) return day;
        const byId = new Map(day.exercises.map((exercise) => [exercise.id, exercise]));
        return {
          ...day,
          exercises: orderedIds
            .map((id) => byId.get(id))
            .filter((exercise): exercise is PlanExerciseEditor => Boolean(exercise)),
        };
      }),
    );
  };

  const handleRemovePlanExercise = (
    dayIndex: number,
    exerciseIndex: number,
  ) => {
    setPlanDays((prev) =>
      prev.map((day, index) => {
        if (index !== dayIndex || day.exercises.length <= 1) return day;
        return {
          ...day,
          exercises: day.exercises.filter(
            (_, exIndex) => exIndex !== exerciseIndex,
          ),
        };
      }),
    );
  };

  /** Persist the whole weekly plan (the action replaces the days array). */
  const persistPlan = async (days: PlanDayEditor[]) => {
    try {
      setPlanSaving(true);
      const savedPlan = await saveWorkoutPlan({
        days: days.map((day) => ({
          _id: day._id,
          dayOfWeek: day.dayOfWeek,
          title: day.title,
          exercises: day.exercises.map((exercise) => ({
            exerciseName: exercise.exerciseName,
            trackingMode: exercise.trackingMode,
            sets: Number(exercise.sets) || 1,
            reps:
              exercise.trackingMode === "time" ? 0 : Number(exercise.reps) || 1,
            seconds:
              exercise.trackingMode === "time"
                ? Number(exercise.seconds) || 1
                : 0,
            weight:
              exercise.trackingMode === "time"
                ? 0
                : Number(exercise.weight) || 0,
          })),
        })),
      });
      const savedDays = (savedPlan?.days || []) as IWorkoutPlanDay[];
      setSavedPlanDays(savedDays);
      setPlanDays(sortPlanDraft(savedDays.map(toPlanDayEditor)));
      toast.success(t("workout.toast.planSaved"));
      // This page already has the saved plan returned by the action. Keep the
      // event for other mounted views without fetching the same data again here.
      skipNextWorkoutRefreshRef.current = true;
      notifyDataUpdated("workout");
      return true;
    } catch {
      toast.error(t("workout.toast.planSaveFailed"));
      return false;
    } finally {
      setPlanSaving(false);
    }
  };

  const handleSavePlanDay = async (dayIndex: number) => {
    const days = planDaysRef.current;
    const day = days[dayIndex];
    if (!day) return;
    if (!day.title.trim()) {
      toast.error(t("workout.builder.nameRequired"));
      return;
    }
    if (await persistPlan(days)) stopEditingDay();
  };

  /** Templates replace the whole week, so confirm before wiping a live plan. */
  const handleApplyTemplate = (days: PlanDayEditor[]) => {
    if (
      savedPlanDays.length > 0 &&
      !confirm(t("workout.builder.templatesConfirm"))
    ) {
      return;
    }
    const draft = sortPlanDraft(
      days.map((day) => ({
        ...day,
        exercises: day.exercises.map((exercise) => ({ ...exercise })),
      })),
    );
    setPlanDays(draft);
    stopEditingDay();
    void persistPlan(draft);
  };

  const openCompletionDialog = (day: IWorkoutPlanDay) => {
    setCompletionDay(day);
    setCompletionExercises(day.exercises.map(toCompletionEditor));
    setCompletionOpen(true);
  };

  const updateCompletionExercise = (
    index: number,
    patch: Partial<ChecklistExercise>,
  ) => {
    setCompletionExercises((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const handleCompleteSavedDay = async () => {
    if (!completionDay?._id) return;

    try {
      setCompletingDayId(completionDay._id);
      await saveDayCompletion(
        completionDay._id,
        completionExercises.filter(
          (exercise) => exercise.selected && exercise.setsCompleted > 0,
        ),
      );
      toast.success(
        t("workout.toast.dayCompleted", { title: completionDay.title }),
      );
      notifyDataUpdated("workout");
      setCompletionOpen(false);
      await fetchData();
    } catch {
      toast.error(t("workout.toast.dayCompleteFailed"));
    } finally {
      setCompletingDayId(null);
    }
  };

  const handleSaveWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const today = getLocalDateString();
      await logWorkout({
        date: today,
        title,
        workoutType,
        exercises: exercises.map((exercise) => ({
          exerciseName: exercise.exerciseName,
          durationMinutes:
            exercise.trackingMode === "time"
              ? Math.round(
                  (exercise.sets.reduce(
                    (sum, set) => sum + Number(set.durationSeconds || 0),
                    0,
                  ) /
                    60) *
                    10,
                ) / 10
              : undefined,
          sets: exercise.sets.map((set) => ({
            setNumber: set.setNumber,
            reps: exercise.trackingMode === "time" ? 0 : set.reps,
            weight:
              exercise.trackingMode === "time" ? 0 : Number(set.weight) || 0,
            durationSeconds:
              exercise.trackingMode === "time"
                ? Number(set.durationSeconds || exercise.seconds || 0)
                : 0,
          })),
        })),
        notes,
      });

      toast.success(t("workout.toast.logged"));
      notifyDataUpdated("workout");
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error(t("workout.toast.logFailed"));
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    try {
      await deleteWorkoutLog(id);
      toast.success(t("workout.toast.deleted"));
      notifyDataUpdated("workout");
      fetchData();
    } catch {
      toast.error(t("workout.toast.deleteFailed"));
    }
  };

  /** Add a personal record by hand (for lifts not captured in workout history). */
  const handleAddPR = async (e: React.FormEvent) => {
    e.preventDefault();
    const weight = Number(prForm.weight);
    const reps = Number(prForm.reps);
    if (!prForm.exerciseName.trim() || weight <= 0 || reps <= 0) {
      toast.error(t("workout.prs.invalid"));
      return;
    }
    try {
      setPrSaving(true);
      await addPersonalRecord({
        exerciseName: prForm.exerciseName.trim(),
        weight,
        reps,
        date: prForm.date || getLocalDateString(),
      });
      toast.success(t("workout.prs.added"));
      setPrModalOpen(false);
      setPrForm({
        exerciseName: "",
        weight: "",
        reps: "",
        date: getLocalDateString(),
      });
      notifyDataUpdated("workout");
      await fetchData();
    } catch {
      toast.error(t("workout.prs.addFailed"));
    } finally {
      setPrSaving(false);
    }
  };

  const handleDeletePR = async (id: string) => {
    try {
      await deletePersonalRecord(id);
      toast.success(t("workout.prs.deleted"));
      notifyDataUpdated("workout");
      await fetchData();
    } catch {
      toast.error(t("workout.prs.deleteFailed"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <PageHeader
        icon={Dumbbell}
        title={t("workout.title")}
        subtitle={t("workout.subtitle")}
        actions={
          <Button
            onClick={() => setModalOpen(true)}
            className="rounded-xl gap-2 font-bold"
          >
            <Plus className="w-4 h-4" />
            {t("workout.actions.quickAdd")}
          </Button>
        }
      />

      {/* Today's Workout — inline checklist */}
      <section className="glass-card space-y-4 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
              <Calendar className="h-3 w-3" />
              {t("workout.today.badge")} · {t(`workout.weekday.${todayDow}`)}
            </div>
            <h2 className="truncate text-lg font-black tracking-tight sm:text-xl">
              {todayPlanDay ? todayPlanDay.title : t("workout.today.restTitle")}
            </h2>
            <p className="max-w-xl text-xs text-muted-foreground">
              {todayPlanDay
                ? t("workout.today.subtitle")
                : t("workout.today.restDescription")}
            </p>

            {todayPlanDay && (
              <div className="flex flex-wrap gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/70 px-2.5 py-1 text-[10px] font-bold tabular-nums text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {todayPlanDay.estimatedDurationMinutes} min
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/70 px-2.5 py-1 text-[10px] font-bold tabular-nums text-muted-foreground">
                  <Flame className="h-3 w-3 text-amber-500" />
                  {todayPlanDay.estimatedCaloriesBurned} kcal
                </span>
              </div>
            )}
          </div>

          {todayPlanDay && (
            <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-primary">
              <span className="text-base font-black leading-none tabular-nums">
                {todayProgress}%
              </span>
              <span className="mt-1 text-[9px] font-bold uppercase tracking-wider">
                {t("workout.today.progressLabel")}
              </span>
            </div>
          )}
        </div>

        {todayPlanDay ? (
          <>
            <div className="space-y-1.5">
              <div
                role="progressbar"
                aria-valuenow={todayProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t("workout.today.progressLabel")}
                className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${todayProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                <span>
                  {t("workout.today.progress", {
                    done: todaySelectedCount,
                    total: todayChecklist.length,
                  })}
                </span>
                <span className="tabular-nums">
                  {todayTotalSets} {t("workout.form.sets")}
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {todayChecklist.map((exercise, index) => (
                <ExerciseChecklistItem
                  key={`${exercise.exerciseName}-${index}`}
                  exercise={exercise}
                  t={t}
                  onChange={(patch) => updateTodayExercise(index, patch)}
                />
              ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                onClick={handleSaveTodayWorkout}
                disabled={savingToday || todaySelectedCount === 0}
                className="flex-1 rounded-xl font-bold gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {savingToday
                  ? t("workout.actions.savingDots")
                  : t("workout.today.save")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={resetTodayChecklist}
                disabled={savingToday}
                className="rounded-xl font-bold gap-2 text-muted-foreground"
              >
                <RotateCcw className="h-4 w-4" />
                {t("workout.today.reset")}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              onClick={handleAddPlanDay}
              className="rounded-xl font-bold gap-2"
            >
              <Pencil className="h-4 w-4" />
              {t("workout.today.createPlan")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(true)}
              className="rounded-xl font-bold gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("workout.actions.quickAdd")}
            </Button>
          </div>
        )}
      </section>

      {/* PR Highlights & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title={t("workout.stats.prs.title")}
          value={Object.keys(prs).length}
          subtitle={t("workout.stats.prs.subtitle")}
          icon={Trophy}
          variant="orange"
        />

        <StatCard
          title={t("workout.stats.sessions.title")}
          value={workouts.length}
          subtitle={t("workout.stats.sessions.subtitle")}
          icon={Dumbbell}
          variant="green"
        />

        <StatCard
          title={t("workout.stats.calories.title")}
          value={workouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0)}
          unit="kcal"
          subtitle={t("workout.stats.calories.subtitle")}
          icon={Flame}
          variant="purple"
        />
      </div>

      <div className="glass-card space-y-4 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-amber-500/5 p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
              <Sparkles className="w-3 h-3" />
              {t("workout.builder.badge")}
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight sm:text-xl">
                {t("workout.plan.heading")}
              </h2>
              <p className="max-w-2xl text-xs text-muted-foreground">
                {t("workout.plan.description")}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleAddPlanDay}
            disabled={planDays.length >= 7 || editingDayIndex !== null}
            className="self-start rounded-xl text-xs font-bold gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("workout.actions.addDay")}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 lg:grid-cols-7">
          {weekDays.map((day) => {
            const planDay = savedPlanDays.find(
              (item) => item.dayOfWeek === day.value,
            );
            const isToday = day.value === new Date().getDay();
            return (
              <div
                key={day.value}
                className={`flex min-h-[76px] flex-col rounded-2xl border p-2.5 ${
                  planDay
                    ? "border-emerald-500/25 bg-emerald-500/10"
                    : "border-border/50 bg-muted/20"
                } ${isToday ? "ring-2 ring-primary/30" : ""}`}
              >
                <p className="text-[11px] font-black uppercase tracking-wide">
                  {t(`workout.weekdayShort.${day.value}`)}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[10px] font-semibold text-muted-foreground">
                  {planDay?.title || t("workout.builder.restDay")}
                </p>
                {planDay && (
                  <button
                    type="button"
                    onClick={() => openCompletionDialog(planDay)}
                    disabled={completingDayId === planDay._id}
                    className="mt-auto inline-flex items-center gap-1 pt-1.5 text-[10px] font-bold text-emerald-600 hover:underline disabled:opacity-60 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {completingDayId === planDay._id
                      ? t("workout.actions.saving")
                      : t("workout.actions.complete")}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-2 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {t("workout.builder.templates")}
          </p>
          <div className="flex flex-wrap gap-2">
            {workoutTemplates.map((template) => (
              <Button
                key={template.nameKey}
                type="button"
                variant="outline"
                size="sm"
                disabled={planSaving || editingDayIndex !== null}
                onClick={() => handleApplyTemplate(template.days)}
                className="rounded-xl text-xs font-bold gap-1 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Calendar className="w-3.5 h-3.5" />
                {t(template.nameKey)}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {planDays.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center space-y-1">
              <p className="text-sm font-bold">{t("workout.plan.empty")}</p>
              <p className="text-xs text-muted-foreground">
                {t("workout.plan.emptyHint")}
              </p>
            </div>
          ) : (
            planDays.map((day, dayIndex) => {
              const savedDay = savedPlanDays.find(
                (item) => item._id === day._id,
              );
              return editingDayIndex === dayIndex ? (
                <div
                  key={`${day.dayOfWeek}-${dayIndex}`}
                  className="space-y-3.5 rounded-2xl border border-primary/40 bg-card p-3.5 ring-1 ring-primary/10"
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[160px_1fr_auto]">
                    <div className="space-y-1">
                      <Label className="text-xs">
                        {t("workout.form.trainingDay")}
                      </Label>
                      <Select
                        value={String(day.dayOfWeek)}
                        onValueChange={(value) =>
                          handlePlanDayChange(dayIndex, {
                            dayOfWeek: Number(value),
                          })
                        }
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {weekDays.map((item) => (
                            <SelectItem
                              key={item.value}
                              value={String(item.value)}
                            >
                              {t(`workout.weekday.${item.value}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">
                        {t("workout.form.workoutName")}
                      </Label>
                      <Input
                        defaultValue={day.title}
                        onChange={(e) =>
                          handlePlanDayTitleChange(dayIndex, e.target.value)
                        }
                        placeholder={t("workout.form.workoutNamePlaceholder")}
                        className="rounded-xl font-bold"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePlanDay(dayIndex)}
                      disabled={planDays.length <= 1}
                      className="rounded-xl self-end text-muted-foreground hover:text-red-500"
                      title={t("workout.actions.removeDay")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <Reorder.Group
                    axis="y"
                    values={day.exercises.map((exercise) => exercise.id)}
                    onReorder={(orderedIds) =>
                      handleReorderPlanExercises(dayIndex, orderedIds)
                    }
                    className="space-y-2"
                  >
                    {day.exercises.map((exercise, exerciseIndex) => (
                      <PlanExerciseRow
                        key={exercise.id}
                        exercise={exercise}
                        canRemove={day.exercises.length > 1}
                        t={t}
                        onChange={(patch) =>
                          handlePlanExerciseChange(
                            dayIndex,
                            exerciseIndex,
                            patch,
                          )
                        }
                        onFieldChange={(patch) =>
                          handlePlanExerciseFieldChange(
                            dayIndex,
                            exerciseIndex,
                            patch,
                          )
                        }
                        onDurationChange={(part, value) =>
                          handlePlanExerciseDurationChange(
                            dayIndex,
                            exerciseIndex,
                            part,
                            value,
                          )
                        }
                        onRemove={() =>
                          handleRemovePlanExercise(dayIndex, exerciseIndex)
                        }
                      />
                    ))}
                  </Reorder.Group>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddPlanExercise(dayIndex)}
                    className="rounded-xl text-xs font-bold gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t("workout.actions.addExercise")}
                  </Button>

                  <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelDayEdit}
                      disabled={planSaving}
                      className="rounded-xl text-xs font-bold"
                    >
                      {t("workout.actions.cancelEdit")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSavePlanDay(dayIndex)}
                      disabled={planSaving}
                      className="rounded-xl text-xs font-bold gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {planSaving
                        ? t("workout.actions.estimating")
                        : t("workout.actions.savePlan")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  key={`${day.dayOfWeek}-${dayIndex}`}
                  className="space-y-2.5 rounded-2xl border border-border/60 bg-card/70 p-3.5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
                      {t(`workout.weekdayShort.${day.dayOfWeek}`)}
                    </span>
                    <p className="text-sm font-bold">{day.title}</p>
                    {savedDay?.estimatedDurationMinutes ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold tabular-nums text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {savedDay.estimatedDurationMinutes} min
                      </span>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditingDay(dayIndex)}
                      disabled={editingDayIndex !== null || planSaving}
                      className="ml-auto h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
                      title={t("workout.actions.editPlan")}
                      aria-label={t("workout.actions.editPlan")}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {day.exercises.map((exercise, exerciseIndex) => (
                      <span
                        key={exercise.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-2 py-0.5 text-[10px] font-semibold"
                      >
                        <span className="tabular-nums text-muted-foreground">
                          {exerciseIndex + 1}.
                        </span>
                        {exercise.exerciseName}
                        <span className="tabular-nums text-muted-foreground">
                          {exercise.sets}×
                          {exercise.trackingMode === "time"
                            ? formatDuration(exercise.seconds)
                            : `${exercise.reps}${
                                exercise.weight > 0
                                  ? ` @ ${exercise.weight}kg`
                                  : ""
                              }`}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Personal Records */}
      <div className="glass-card p-5 rounded-3xl border border-border/50 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            {t("workout.prs.heading")}
          </h3>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 rounded-full"
            onClick={() => setPrModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            {t("workout.prs.add")}
          </Button>
        </div>

        {Object.keys(prs).length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            {t("workout.prs.empty")}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(prs).map(([name, record]) => (
              <div
                key={name}
                className="relative p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1"
              >
                <p className="font-bold capitalize truncate text-foreground pr-5">
                  {name}
                </p>
                {record.source === "manual" && record._id && (
                  <button
                    type="button"
                    onClick={() => handleDeletePR(record._id as string)}
                    aria-label={t("workout.prs.delete")}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                  {record.weight} kg{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    &times; {record.reps} reps
                  </span>
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-[10px] text-muted-foreground">
                    {t("workout.prs.logged", { date: record.date })}
                  </p>
                  {record.source === "manual" && (
                    <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      {t("workout.prs.manual")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workout History */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">
          {t("workout.history.heading")}
        </h2>

        {workouts.length === 0 && !loading && (
          <EmptyState
            icon={Dumbbell}
            title={t("workout.empty.title")}
            description={t("workout.empty.description")}
            actionText={t("workout.empty.action")}
            onAction={() => setModalOpen(true)}
          />
        )}

        {workouts.map((w) => (
          <div
            key={w._id}
            className="glass-card space-y-3 rounded-2xl border border-border/50 p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
                    {w.workoutType}
                  </span>
                  <h3 className="truncate text-base font-bold">{w.title}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {w.date}
                  </span>
                  <span className="flex items-center gap-1 tabular-nums">
                    <Clock className="h-3.5 w-3.5" /> {w.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1 tabular-nums">
                    <Flame className="h-3.5 w-3.5 text-amber-500" />{" "}
                    {w.caloriesBurned} kcal
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteWorkout(w._id)}
                aria-label={t("workout.actions.deleteWorkout")}
                title={t("workout.actions.deleteWorkout")}
                className="h-8 w-8 shrink-0 rounded-xl text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Exercises table */}
            <div className="space-y-2 border-t border-border/40 pt-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {w.exercises.map((ex: any, idx: number) => (
                <div
                  key={idx}
                  className="space-y-1.5 rounded-xl bg-muted/30 p-3"
                >
                  <p className="text-xs font-bold">{ex.exerciseName}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {ex.sets.map((set: any, sIdx: number) => (
                      <span
                        key={sIdx}
                        className="rounded-lg border border-border/50 bg-background px-2 py-1 text-[10px] font-bold tabular-nums"
                      >
                        {t("workout.form.set", { number: set.setNumber })}:{" "}
                        {set.durationSeconds
                          ? formatDuration(set.durationSeconds)
                          : `${set.weight ? `${set.weight}kg × ` : ""}${set.reps} reps`}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={prModalOpen} onOpenChange={setPrModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              {t("workout.prs.addTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t("workout.prs.addDescription")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddPR} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pr-name">
                {t("workout.prs.field.exercise")}
              </Label>
              <Input
                id="pr-name"
                value={prForm.exerciseName}
                onChange={(e) =>
                  setPrForm((prev) => ({
                    ...prev,
                    exerciseName: e.target.value,
                  }))
                }
                placeholder={t("workout.prs.field.exercisePlaceholder")}
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pr-weight">
                  {t("workout.form.weightKg")}
                </Label>
                <Input
                  id="pr-weight"
                  type="number"
                  inputMode="decimal"
                  step="2.5"
                  min="0"
                  value={prForm.weight}
                  onChange={(e) =>
                    setPrForm((prev) => ({ ...prev, weight: e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pr-reps">{t("workout.form.reps")}</Label>
                <Input
                  id="pr-reps"
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="1"
                  value={prForm.reps}
                  onChange={(e) =>
                    setPrForm((prev) => ({ ...prev, reps: e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pr-date">{t("workout.prs.field.date")}</Label>
              <Input
                id="pr-date"
                type="date"
                value={prForm.date}
                onChange={(e) =>
                  setPrForm((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setPrModalOpen(false)}
              >
                {t("workout.actions.cancelEdit")}
              </Button>
              <Button
                type="submit"
                disabled={prSaving}
                className="flex-1 rounded-full gap-1.5"
              >
                {prSaving ? (
                  t("workout.actions.savingDots")
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {t("workout.prs.add")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={completionOpen} onOpenChange={setCompletionOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {t("workout.completion.title")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t("workout.completion.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-2xl bg-muted/30 border border-border/50 p-3">
              <p className="text-sm font-black">{completionDay?.title}</p>
              <p className="text-xs text-muted-foreground">
                {t("workout.completion.planned", {
                  duration: completionDay?.estimatedDurationMinutes || 0,
                  calories: completionDay?.estimatedCaloriesBurned || 0,
                })}
              </p>
            </div>

            {completionExercises.map((exercise, index) => (
              <ExerciseChecklistItem
                key={`${exercise.exerciseName}-${index}`}
                exercise={exercise}
                t={t}
                onChange={(patch) => updateCompletionExercise(index, patch)}
              />
            ))}

            <Button
              type="button"
              onClick={handleCompleteSavedDay}
              disabled={Boolean(completingDayId)}
              className="w-full rounded-xl bg-primary hover:bg-primary/90 font-bold"
            >
              {completingDayId
                ? t("workout.actions.savingDots")
                : t("workout.actions.saveCompleted")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Workout Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] space-y-4 overflow-y-auto rounded-3xl p-5 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {t("workout.quickAdd.title")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t("workout.quickAdd.description")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveWorkout} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{t("workout.form.title")}</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("workout.form.titlePlaceholder")}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label>{t("workout.form.routineType")}</Label>
                <Select
                  value={workoutType}
                  onValueChange={(v) => setWorkoutType(v as WorkoutType)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workoutTypes.map((type) => (
                      <SelectItem key={type.type} value={type.type}>
                        {t(type.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Exercises List Editor */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-sm">
                  {t("workout.form.exercisesAndSets")}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddExercise}
                  className="rounded-xl text-xs border-primary text-primary"
                >
                  + {t("workout.actions.addExercise")}
                </Button>
              </div>

              {exercises.map((ex, exIdx) => (
                <div
                  key={exIdx}
                  className="space-y-2.5 rounded-2xl border border-border/40 bg-muted/30 p-3"
                >
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px]">
                    <Input
                      placeholder={t("workout.form.exerciseNamePlaceholder")}
                      value={ex.exerciseName}
                      onChange={(e) => {
                        const updated = [...exercises];
                        updated[exIdx].exerciseName = e.target.value;
                        setExercises(updated);
                      }}
                      className="rounded-xl bg-background text-sm font-bold"
                    />
                    <Select
                      value={ex.trackingMode}
                      onValueChange={(value) => {
                        const updated = [...exercises];
                        updated[exIdx].trackingMode = value as "reps" | "time";
                        updated[exIdx].seconds =
                          value === "time" ? updated[exIdx].seconds || 30 : 0;
                        updated[exIdx].sets = updated[exIdx].sets.map(
                          (set) => ({
                            ...set,
                            reps: value === "time" ? 0 : set.reps || 10,
                            durationSeconds:
                              value === "time"
                                ? updated[exIdx].seconds || 30
                                : 0,
                          }),
                        );
                        setExercises(updated);
                      }}
                    >
                      <SelectTrigger className="rounded-xl bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reps">
                          {t("workout.form.reps")}
                        </SelectItem>
                        <SelectItem value="time">
                          {t("workout.form.time")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sets */}
                  <div className="space-y-2">
                    {ex.sets.map((set, setIdx) => {
                      const setDuration = splitDuration(
                        set.durationSeconds ?? ex.seconds ?? 0,
                      );
                      const isTimeEx = ex.trackingMode === "time";
                      return (
                        <div
                          key={setIdx}
                          className="flex flex-wrap items-center gap-2 rounded-xl border border-border/50 bg-background/60 px-2.5 py-1.5"
                        >
                          <span className="w-12 shrink-0 text-[11px] font-bold text-muted-foreground">
                            {t("workout.form.set", { number: set.setNumber })}
                          </span>

                          {isTimeEx ? (
                            <div className="flex items-center gap-1.5">
                              <Input
                                type="number"
                                inputMode="numeric"
                                min={0}
                                aria-label={t("workout.form.minutes")}
                                value={setDuration.minutes}
                                onChange={(e) =>
                                  handleSetDurationChange(
                                    exIdx,
                                    setIdx,
                                    "min",
                                    Number(e.target.value),
                                  )
                                }
                                className={compactSetInput}
                              />
                              <span className="text-[10px] font-semibold text-muted-foreground">
                                {t("workout.form.minShort")}
                              </span>
                              <Input
                                type="number"
                                inputMode="numeric"
                                min={0}
                                max={59}
                                aria-label={t("workout.form.seconds")}
                                value={setDuration.seconds}
                                onChange={(e) =>
                                  handleSetDurationChange(
                                    exIdx,
                                    setIdx,
                                    "sec",
                                    Number(e.target.value),
                                  )
                                }
                                className={compactSetInput}
                              />
                              <span className="text-[10px] font-semibold text-muted-foreground">
                                {t("workout.form.secShort")}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Input
                                type="number"
                                inputMode="numeric"
                                min={0}
                                aria-label={t("workout.form.reps")}
                                value={set.reps}
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  setExercises((prev) =>
                                    prev.map((item, i) =>
                                      i !== exIdx
                                        ? item
                                        : {
                                            ...item,
                                            sets: item.sets.map((s, j) =>
                                              j === setIdx
                                                ? { ...s, reps: value }
                                                : s,
                                            ),
                                          },
                                    ),
                                  );
                                }}
                                className={compactSetInput}
                              />
                              <span className="text-[10px] font-semibold text-muted-foreground">
                                {t("workout.form.reps")}
                              </span>
                              <Input
                                type="number"
                                inputMode="decimal"
                                min={0}
                                step="2.5"
                                aria-label={t("workout.form.weightKg")}
                                value={set.weight}
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  setExercises((prev) =>
                                    prev.map((item, i) =>
                                      i !== exIdx
                                        ? item
                                        : {
                                            ...item,
                                            sets: item.sets.map((s, j) =>
                                              j === setIdx
                                                ? { ...s, weight: value }
                                                : s,
                                            ),
                                          },
                                    ),
                                  );
                                }}
                                className={compactSetInput}
                              />
                              <span className="text-[10px] font-semibold text-muted-foreground">
                                {t("workout.form.weightShort")}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddSet(exIdx)}
                    className="text-[11px] text-primary hover:bg-primary/10 rounded-xl"
                  >
                    + {t("workout.actions.addSet")}
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl bg-primary hover:bg-primary/90 font-bold"
            >
              {t("workout.actions.saveSession")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer Ad Slot */}
      <AdUnit size="auto" maxWidth="970px" />
    </div>
  );
}
