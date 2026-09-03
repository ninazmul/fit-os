"use client";

import { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/shared/StatCard";
import EmptyState from "@/components/shared/EmptyState";
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
  X,
} from "lucide-react";
import { getLocalDateString } from "@/lib/utils";
import type { WorkoutType, IWorkoutExercise, IWorkoutPlanDay } from "@/types/fitness";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

const AdUnit = dynamic(() => import("@/components/shared/AdUnit"), {
  ssr: false,
});

const workoutTypes: { type: WorkoutType; label: string }[] = [
  { type: "push", label: "Push Day (Chest, Shoulders, Triceps)" },
  { type: "pull", label: "Pull Day (Back, Biceps)" },
  { type: "legs", label: "Leg Day (Quads, Hamstrings, Calves)" },
  { type: "upper", label: "Upper Body" },
  { type: "lower", label: "Lower Body" },
  { type: "full_body", label: "Full Body Workout" },
  { type: "cardio", label: "Cardio & Endurance" },
  { type: "custom", label: "Custom Routine" },
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
  exerciseName: string;
  sets: number;
  reps: number;
};

type PlanDayEditor = {
  _id?: string;
  dayOfWeek: number;
  title: string;
  exercises: PlanExerciseEditor[];
};

const createPlanDay = (dayOfWeek = new Date().getDay()): PlanDayEditor => ({
  dayOfWeek,
  title: `${weekDays.find((day) => day.value === dayOfWeek)?.label || "Daily"} Workout`,
  exercises: [
    { exerciseName: "Bench Press", sets: 3, reps: 10 },
    { exerciseName: "Shoulder Press", sets: 3, reps: 10 },
    { exerciseName: "Triceps Pushdown", sets: 3, reps: 12 },
  ],
});

export default function WorkoutPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [workouts, setWorkouts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [prs, setPrs] = useState<Record<string, any>>({});
  const [planDays, setPlanDays] = useState<PlanDayEditor[]>([createPlanDay(6)]);
  const [savedPlanDays, setSavedPlanDays] = useState<IWorkoutPlanDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [planSaving, setPlanSaving] = useState(false);
  const [completingDayId, setCompletingDayId] = useState<string | null>(null);

  // New Workout Dialog State
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("Push Workout");
  const [workoutType, setWorkoutType] = useState<WorkoutType>("push");
  const [notes] = useState("");

  // Exercises list in active workout
  const [exercises, setExercises] = useState<IWorkoutExercise[]>([
    {
      exerciseName: "Bench Press",
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
      if (days.length > 0) {
        setPlanDays(
          days.map((day) => ({
            _id: day._id,
            dayOfWeek: day.dayOfWeek,
            title: day.title,
            exercises: day.exercises.map((ex) => ({
              exerciseName: ex.exerciseName,
              sets: ex.sets,
              reps: ex.reps,
            })),
          })),
        );
      }
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

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    const targetEx = updated[exerciseIndex];
    const lastSet = targetEx.sets[targetEx.sets.length - 1] || { weight: 20, reps: 10 };
    targetEx.sets.push({
      setNumber: targetEx.sets.length + 1,
      reps: lastSet.reps,
      weight: 0,
    });
    setExercises(updated);
  };

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        exerciseName: "Incline Dumbbell Press",
        sets: [{ setNumber: 1, reps: 10, weight: 0 }],
      },
    ]);
  };

  const handleAddPlanDay = () => {
    const usedDays = new Set(planDays.map((day) => day.dayOfWeek));
    const nextDay = weekDays.find((day) => !usedDays.has(day.value))?.value ?? 0;
    setPlanDays([...planDays, createPlanDay(nextDay)]);
  };

  const handleRemovePlanDay = (dayIndex: number) => {
    setPlanDays(planDays.filter((_, index) => index !== dayIndex));
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
          ? {
              ...day,
              exercises: [
                ...day.exercises,
                { exerciseName: "New Exercise", sets: 3, reps: 10 },
              ],
            }
          : day,
      ),
    );
  };

  const handleRemovePlanExercise = (dayIndex: number, exerciseIndex: number) => {
    setPlanDays(
      planDays.map((day, index) => {
        if (index !== dayIndex || day.exercises.length <= 1) return day;
        return {
          ...day,
          exercises: day.exercises.filter((_, exIndex) => exIndex !== exerciseIndex),
        };
      }),
    );
  };

  const handleSaveWorkoutPlan = async () => {
    try {
      setPlanSaving(true);
      await saveWorkoutPlan({
        days: planDays.map((day) => ({
          _id: day._id,
          dayOfWeek: day.dayOfWeek,
          title: day.title,
          exercises: day.exercises.map((exercise) => ({
            exerciseName: exercise.exerciseName,
            sets: Number(exercise.sets) || 1,
            reps: Number(exercise.reps) || 1,
          })),
        })),
      });
      toast.success("Workout plan saved with AI calorie estimates");
      notifyDataUpdated("workout");
      await fetchData();
    } catch {
      toast.error("Failed to save workout plan");
    } finally {
      setPlanSaving(false);
    }
  };

  const handleCompleteSavedDay = async (day: IWorkoutPlanDay) => {
    if (!day._id) return;

    try {
      setCompletingDayId(day._id);
      await completeWorkoutPlanDay(getLocalDateString(), day._id);
      toast.success(`${day.title} completed`);
      notifyDataUpdated("workout");
      await fetchData();
    } catch {
      toast.error("Failed to complete workout plan");
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
        exercises,
        notes,
      });

      toast.success("Workout logged successfully! 💪");
      notifyDataUpdated("workout");
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to log workout");
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    try {
      await deleteWorkoutLog(id);
      toast.success("Workout deleted");
      notifyDataUpdated("workout");
      fetchData();
    } catch {
      toast.error("Failed to delete workout");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workout Tracker 🏋️‍♂️</h1>
          <p className="text-xs text-muted-foreground">Log routines, track personal records, and build muscle consistency</p>
        </div>

        <Button onClick={() => setModalOpen(true)} className="rounded-xl gap-2 bg-primary hover:bg-primary/90 font-bold">
          <Plus className="w-4 h-4" />
          Quick Add Workout
        </Button>
      </div>

      {/* PR Highlights & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Personal Records (PRs)"
          value={Object.keys(prs).length}
          subtitle="Unique exercises with PR records"
          icon={Trophy}
          variant="orange"
        />

        <StatCard
          title="Workouts Last 30 Days"
          value={workouts.length}
          subtitle="Total sessions completed"
          icon={Dumbbell}
          variant="green"
        />

        <StatCard
          title="Est. Calories Burned"
          value={workouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0)}
          unit="kcal"
          subtitle="Past 30 days total"
          icon={Flame}
          variant="purple"
        />
      </div>

      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-primary/20 space-y-5 bg-gradient-to-br from-primary/5 via-background to-amber-500/5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Weekly Workout Builder
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Create your daily workout templates</h2>
              <p className="text-xs text-muted-foreground max-w-2xl">
                Pick the weekdays you train, add exercise names, sets, and reps. AI estimates calories so the dashboard can show the right workout button on the right day.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddPlanDay}
              disabled={planDays.length >= 7}
              className="rounded-xl text-xs font-bold gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Day
            </Button>
            <Button
              type="button"
              onClick={handleSaveWorkoutPlan}
              disabled={planSaving || planDays.length === 0}
              className="rounded-xl text-xs font-bold gap-1 bg-primary hover:bg-primary/90"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {planSaving ? "Estimating..." : "Save Plan"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const planDay = savedPlanDays.find((item) => item.dayOfWeek === day.value);
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
                <p className="text-xs font-black">{day.short}</p>
                <p className="text-[11px] text-muted-foreground mt-1 truncate">
                  {planDay?.title || "Rest day"}
                </p>
                {planDay && (
                  <button
                    type="button"
                    onClick={() => handleCompleteSavedDay(planDay)}
                    disabled={completingDayId === planDay._id}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {completingDayId === planDay._id ? "Saving" : "Complete"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          {planDays.map((day, dayIndex) => (
            <div key={`${day.dayOfWeek}-${dayIndex}`} className="rounded-2xl border border-border/60 bg-card p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Training Day</Label>
                  <Select
                    value={String(day.dayOfWeek)}
                    onValueChange={(value) =>
                      handlePlanDayChange(dayIndex, { dayOfWeek: Number(value) })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weekDays.map((item) => (
                        <SelectItem key={item.value} value={String(item.value)}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Workout Name</Label>
                  <Input
                    value={day.title}
                    onChange={(e) => handlePlanDayChange(dayIndex, { title: e.target.value })}
                    placeholder="e.g. Push Day / Upper Strength"
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
                  title="Remove day"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {day.exercises.map((exercise, exerciseIndex) => (
                  <div
                    key={`${exercise.exerciseName}-${exerciseIndex}`}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_92px_92px_36px] gap-2"
                  >
                    <Input
                      value={exercise.exerciseName}
                      onChange={(e) =>
                        handlePlanExerciseChange(dayIndex, exerciseIndex, {
                          exerciseName: e.target.value,
                        })
                      }
                      placeholder="Workout name"
                      className="rounded-xl bg-background"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={exercise.sets}
                      onChange={(e) =>
                        handlePlanExerciseChange(dayIndex, exerciseIndex, {
                          sets: Number(e.target.value),
                        })
                      }
                      placeholder="Sets"
                      className="rounded-xl bg-background"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={exercise.reps}
                      onChange={(e) =>
                        handlePlanExerciseChange(dayIndex, exerciseIndex, {
                          reps: Number(e.target.value),
                        })
                      }
                      placeholder="Reps"
                      className="rounded-xl bg-background"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePlanExercise(dayIndex, exerciseIndex)}
                      disabled={day.exercises.length <= 1}
                      className="rounded-xl text-muted-foreground hover:text-red-500"
                      title="Remove exercise"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddPlanExercise(dayIndex)}
                className="rounded-xl text-xs font-bold gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Exercise
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Mid-page Ad */}
      <AdUnit size="auto" label="Sponsored" maxWidth="970px" />

      {/* PR Cards Carousel / Grid */}
      {Object.keys(prs).length > 0 && (
        <div className="glass-card p-5 rounded-3xl border border-border/50 space-y-3">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Personal Records (PRs)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(prs).map(([name, record]) => (
              <div key={name} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                <p className="font-bold capitalize truncate text-foreground">{name}</p>
                <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                  {record.weight} kg <span className="text-xs font-normal text-muted-foreground">&times; {record.reps} reps</span>
                </p>
                <p className="text-[10px] text-muted-foreground">Logged: {record.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workout History */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">Recent Workout History</h2>

        {workouts.length === 0 && !loading && (
          <EmptyState
            icon={Dumbbell}
            title="No Workouts Logged Yet"
            description="Start logging your routines to track sets, reps, and PRs."
            actionText="Log Your First Workout"
            onAction={() => setModalOpen(true)}
          />
        )}

        {workouts.map((w) => (
          <div key={w._id} className="glass-card p-6 rounded-3xl border border-border/50 space-y-4">
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
                    <Flame className="w-3.5 h-3.5 text-amber-500" /> {w.caloriesBurned} kcal
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
                <div key={idx} className="p-3 rounded-2xl bg-muted/40 text-xs space-y-1.5">
                  <p className="font-semibold text-sm">{ex.exerciseName}</p>
                  <div className="flex flex-wrap gap-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {ex.sets.map((set: any, sIdx: number) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-1 rounded-lg bg-background border border-border/50 text-[11px] font-bold"
                      >
                        Set {set.setNumber}:{" "}
                        {set.weight ? `${set.weight}kg x ` : ""}
                        {set.reps} reps
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Log Workout Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Quick Add Workout</DialogTitle>
            <DialogDescription className="text-xs">
              Add workout names, sets, and reps. Calories are estimated automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveWorkout} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Workout Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chest & Triceps Blast"
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label>Routine Type</Label>
                <Select value={workoutType} onValueChange={(v) => setWorkoutType(v as WorkoutType)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workoutTypes.map((t) => (
                      <SelectItem key={t.type} value={t.type}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Exercises List Editor */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-sm">Exercises & Sets</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddExercise}
                  className="rounded-xl text-xs border-primary text-primary"
                >
                  + Add Exercise
                </Button>
              </div>

              {exercises.map((ex, exIdx) => (
                <div key={exIdx} className="p-4 rounded-2xl bg-muted/40 border border-border/40 space-y-3">
                  <Input
                    placeholder="Exercise Name (e.g. Squat, Bench Press)"
                    value={ex.exerciseName}
                    onChange={(e) => {
                      const updated = [...exercises];
                      updated[exIdx].exerciseName = e.target.value;
                      setExercises(updated);
                    }}
                    className="rounded-xl font-bold text-sm bg-background"
                  />

                  {/* Sets */}
                  <div className="space-y-2">
                    {ex.sets.map((set, setIdx) => (
                      <div key={setIdx} className="flex items-center gap-2">
                        <span className="w-12 text-[11px] font-semibold text-muted-foreground">Set {set.setNumber}</span>
                        <Input
                          type="number"
                          placeholder="Reps"
                          value={set.reps}
                          onChange={(e) => {
                            const updated = [...exercises];
                            updated[exIdx].sets[setIdx].reps = Number(e.target.value);
                            setExercises(updated);
                          }}
                          className="rounded-xl h-8 text-xs bg-background"
                        />
                        <span className="text-[10px] text-muted-foreground">reps</span>
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
                    + Add Set
                  </Button>
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full rounded-xl bg-primary hover:bg-primary/90 font-bold">
              Save Workout Session 🎉
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer Ad Slot */}
      <AdUnit size="auto" maxWidth="970px" />
    </div>
  );
}
