"use client";

import { useState, useEffect, useRef } from "react";
import {
  completeWorkoutPlanDay,
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
import { getLocalDateString } from "@/lib/utils";
import type { TranslationVars } from "@/lib/i18n";
import type {
  WorkoutType,
  IWorkoutExercise,
  IWorkoutPlanDay,
  IWorkoutPlanExercise,
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
): PlanExerciseEditor => ({
  id: makePlanExerciseId(),
  exerciseName,
  trackingMode,
  sets,
  reps,
  seconds,
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
    })),
  );
};

/**
 * One draggable exercise row inside a plan day editor. Dragging is limited to
 * the grip handle so the inputs stay usable on touch devices.
 */
function PlanExerciseRow({
  exercise,
  canRemove,
  t,
  onChange,
  onRemove,
}: {
  exercise: PlanExerciseEditor;
  canRemove: boolean;
  t: (key: string, vars?: TranslationVars) => string;
  onChange: (patch: Partial<PlanExerciseEditor>) => void;
  onRemove: () => void;
}) {
  const dragControls = useDragControls();
  const isTime = exercise.trackingMode === "time";

  return (
    <Reorder.Item
      value={exercise.id}
      dragListener={false}
      dragControls={dragControls}
      style={{ position: "relative" }}
      className="grid grid-cols-1 items-center gap-2 rounded-2xl border border-border/60 bg-background p-2 sm:grid-cols-[32px_1fr_104px_76px_88px_36px]"
    >
      <button
        type="button"
        onPointerDown={(event) => dragControls.start(event)}
        aria-label={t("workout.builder.dragHint")}
        title={t("workout.builder.dragHint")}
        className="flex h-8 w-8 cursor-grab touch-none items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-primary active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <Input
        value={exercise.exerciseName}
        onChange={(event) => onChange({ exerciseName: event.target.value })}
        placeholder={t("workout.form.planExercisePlaceholder")}
        className="rounded-xl"
      />

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
        <SelectTrigger className="rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="reps">{t("workout.form.reps")}</SelectItem>
          <SelectItem value="time">{t("workout.form.time")}</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="number"
        inputMode="numeric"
        min={1}
        value={exercise.sets}
        onChange={(event) => onChange({ sets: Number(event.target.value) })}
        placeholder={t("workout.form.sets")}
        aria-label={t("workout.form.sets")}
        className="rounded-xl"
      />

      <Input
        type="number"
        inputMode="numeric"
        min={1}
        value={isTime ? exercise.seconds : exercise.reps}
        onChange={(event) =>
          onChange(
            isTime
              ? { seconds: Number(event.target.value) }
              : { reps: Number(event.target.value) },
          )
        }
        placeholder={isTime ? t("workout.form.seconds") : t("workout.form.reps")}
        className="rounded-xl"
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={!canRemove}
        className="rounded-xl text-muted-foreground hover:text-red-500"
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [prs, setPrs] = useState<Record<string, any>>({});
  const [planDays, setPlanDays] = useState<PlanDayEditor[]>([]);
  const [savedPlanDays, setSavedPlanDays] = useState<IWorkoutPlanDay[]>([]);
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

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  useDataUpdateListener((category) => {
    if (category === "workout" || category === "all") {
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
    const draft = index === null ? null : planDays[index];
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
      weight: 0,
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

  /** Append a fresh day and open it straight away for editing. */
  const handleAddPlanDay = () => {
    const usedDays = new Set(planDays.map((day) => day.dayOfWeek));
    const nextDay = planDays.length
      ? (weekDays.find((day) => !usedDays.has(day.value))?.value ?? 0)
      : todayDow;
    const nextDraft = sortPlanDraft([...planDays, createPlanDay(nextDay)]);
    setPlanDays(nextDraft);
    startEditingDay(nextDraft.length - 1);
  };

  const handleRemovePlanDay = (dayIndex: number) => {
    setPlanDays((prev) => prev.filter((_, index) => index !== dayIndex));
    stopEditingDay();
  };

  const handlePlanDayChange = (
    dayIndex: number,
    patch: Partial<PlanDayEditor>,
  ) => {
    setPlanDays(
      planDays.map((day, index) =>
        index === dayIndex ? { ...day, ...patch } : day,
      ),
    );
  };

  const handlePlanExerciseChange = (
    dayIndex: number,
    exerciseIndex: number,
    patch: Partial<PlanExerciseEditor>,
  ) => {
    setPlanDays(
      planDays.map((day, index) => {
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

  const handleAddPlanExercise = (dayIndex: number) => {
    setPlanDays(
      planDays.map((day, index) =>
        index === dayIndex
          ? { ...day, exercises: [...day.exercises, createPlanExercise("New Exercise")] }
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
    setPlanDays(
      planDays.map((day, index) => {
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
      await saveWorkoutPlan({
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
          })),
        })),
      });
      toast.success(t("workout.toast.planSaved"));
      notifyDataUpdated("workout");
      await fetchData();
      return true;
    } catch {
      toast.error(t("workout.toast.planSaveFailed"));
      return false;
    } finally {
      setPlanSaving(false);
    }
  };

  const handleSavePlanDay = async (dayIndex: number) => {
    const day = planDays[dayIndex];
    if (!day) return;
    if (!day.title.trim()) {
      toast.error(t("workout.builder.nameRequired"));
      return;
    }
    if (await persistPlan(planDays)) stopEditingDay();
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
            weight: 0,
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
      <section className="glass-card rounded-3xl border border-primary/20 p-5 sm:p-6 space-y-5 bg-gradient-to-br from-primary/5 via-background to-emerald-500/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
              <Calendar className="h-3.5 w-3.5" />
              {t("workout.today.badge")} · {t(`workout.weekday.${todayDow}`)}
            </div>
            <h2 className="text-xl font-black tracking-tight">
              {todayPlanDay ? todayPlanDay.title : t("workout.today.restTitle")}
            </h2>
            <p className="max-w-xl text-xs text-muted-foreground">
              {todayPlanDay
                ? t("workout.today.subtitle")
                : t("workout.today.restDescription")}
            </p>
          </div>

          {todayPlanDay && (
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/70 px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {todayPlanDay.estimatedDurationMinutes} min
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/70 px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                  <Flame className="h-3 w-3 text-amber-500" />
                  {todayPlanDay.estimatedCaloriesBurned} kcal
                </span>
              </div>
              <span className="text-xs font-bold text-primary">
                {t("workout.today.progress", {
                  done: todaySelectedCount,
                  total: todayChecklist.length,
                })}
              </span>
            </div>
          )}
        </div>

        {todayPlanDay ? (
          <>
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

      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-primary/20 space-y-5 bg-gradient-to-br from-primary/5 via-background to-amber-500/5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              {t("workout.builder.badge")}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                {t("workout.plan.heading")}
              </h2>
              <p className="text-xs text-muted-foreground max-w-2xl">
                {t("workout.plan.description")}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleAddPlanDay}
            disabled={planDays.length >= 7 || editingDayIndex !== null}
            className="rounded-xl text-xs font-bold gap-1 self-start"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("workout.actions.addDay")}
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const planDay = savedPlanDays.find(
              (item) => item.dayOfWeek === day.value,
            );
            const isToday = day.value === new Date().getDay();
            return (
              <div
                key={day.value}
                className={`rounded-2xl border p-3 min-h-24 ${
                  planDay
                    ? "bg-emerald-500/10 border-emerald-500/25"
                    : "bg-muted/20 border-border/50"
                } ${isToday ? "ring-2 ring-primary/30" : ""}`}
              >
                <p className="text-xs font-black">
                  {t(`workout.weekdayShort.${day.value}`)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 truncate">
                  {planDay?.title || t("workout.builder.restDay")}
                </p>
                {planDay && (
                  <button
                    type="button"
                    onClick={() => openCompletionDialog(planDay)}
                    disabled={completingDayId === planDay._id}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-60"
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
                  className="rounded-2xl border border-primary/40 bg-card p-4 space-y-4 shadow-sm ring-1 ring-primary/10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-3">
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
                        value={day.title}
                        onChange={(e) =>
                          handlePlanDayChange(dayIndex, {
                            title: e.target.value,
                          })
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
                  className="rounded-2xl border border-border/60 bg-card/70 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
                      {t(`workout.weekdayShort.${day.dayOfWeek}`)}
                    </span>
                    <p className="text-sm font-bold">{day.title}</p>
                    {savedDay?.estimatedDurationMinutes ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
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
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-2.5 py-1 text-[11px] font-semibold"
                      >
                        <span className="tabular-nums text-muted-foreground">
                          {exerciseIndex + 1}.
                        </span>
                        {exercise.exerciseName}
                        <span className="text-muted-foreground">
                          {exercise.sets}×
                          {exercise.trackingMode === "time"
                            ? `${exercise.seconds}s`
                            : exercise.reps}
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

      {/* PR Cards Carousel / Grid */}
      {Object.keys(prs).length > 0 && (
        <div className="glass-card p-5 rounded-3xl border border-border/50 space-y-3">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            {t("workout.prs.heading")}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(prs).map(([name, record]) => (
              <div
                key={name}
                className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1"
              >
                <p className="font-bold capitalize truncate text-foreground">
                  {name}
                </p>
                <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                  {record.weight} kg{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    &times; {record.reps} reps
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t("workout.prs.logged", { date: record.date })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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
            className="glass-card p-6 rounded-3xl border border-border/50 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                  {w.workoutType}
                </span>
                <h3 className="text-lg font-bold mt-1">{w.title}</h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {w.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {w.durationMinutes} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />{" "}
                    {w.caloriesBurned} kcal
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteWorkout(w._id)}
                className="h-8 w-8 text-muted-foreground hover:text-red-500 rounded-xl"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Exercises table */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {w.exercises.map((ex: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-muted/40 text-xs space-y-1.5"
                >
                  <p className="font-semibold text-sm">{ex.exerciseName}</p>
                  <div className="flex flex-wrap gap-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {ex.sets.map((set: any, sIdx: number) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-1 rounded-lg bg-background border border-border/50 text-[11px] font-bold"
                      >
                        {t("workout.form.set", { number: set.setNumber })}:{" "}
                        {set.durationSeconds
                          ? `${set.durationSeconds}s`
                          : `${set.weight ? `${set.weight}kg x ` : ""}${set.reps} reps`}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={completionOpen} onOpenChange={setCompletionOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
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
        <DialogContent className="sm:max-w-xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
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
                  className="p-4 rounded-2xl bg-muted/40 border border-border/40 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-2">
                    <Input
                      placeholder={t("workout.form.exerciseNamePlaceholder")}
                      value={ex.exerciseName}
                      onChange={(e) => {
                        const updated = [...exercises];
                        updated[exIdx].exerciseName = e.target.value;
                        setExercises(updated);
                      }}
                      className="rounded-xl font-bold text-sm bg-background"
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
                    {ex.sets.map((set, setIdx) => (
                      <div key={setIdx} className="flex items-center gap-2">
                        <span className="w-12 text-[11px] font-semibold text-muted-foreground">
                          {t("workout.form.set", { number: set.setNumber })}
                        </span>
                        <Input
                          type="number"
                          placeholder={
                            ex.trackingMode === "time"
                              ? t("workout.form.seconds")
                              : t("workout.form.reps")
                          }
                          value={
                            ex.trackingMode === "time"
                              ? set.durationSeconds || ex.seconds
                              : set.reps
                          }
                          onChange={(e) => {
                            const updated = [...exercises];
                            if (updated[exIdx].trackingMode === "time") {
                              updated[exIdx].sets[setIdx].durationSeconds =
                                Number(e.target.value);
                              updated[exIdx].seconds = Number(e.target.value);
                            } else {
                              updated[exIdx].sets[setIdx].reps = Number(
                                e.target.value,
                              );
                            }
                            setExercises(updated);
                          }}
                          className="rounded-xl h-8 text-xs bg-background"
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {ex.trackingMode === "time" ? "sec" : "reps"}
                        </span>
                      </div>
                    ))}
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
