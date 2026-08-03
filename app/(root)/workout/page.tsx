"use client";

import { useState, useEffect } from "react";
import { logWorkout, getWorkoutHistory, getPersonalRecords, deleteWorkoutLog } from "@/lib/actions/workout.actions";
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
} from "lucide-react";
import type { WorkoutType, IWorkoutExercise } from "@/types/fitness";
import toast from "react-hot-toast";
import AdUnit from "@/components/shared/AdUnit";

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

export default function WorkoutPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [workouts, setWorkouts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [prs, setPrs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // New Workout Dialog State
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("Push Workout");
  const [workoutType, setWorkoutType] = useState<WorkoutType>("push");
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(300);
  const [notes] = useState("");

  // Exercises list in active workout
  const [exercises, setExercises] = useState<IWorkoutExercise[]>([
    {
      exerciseName: "Bench Press",
      sets: [
        { setNumber: 1, reps: 10, weight: 60 },
        { setNumber: 2, reps: 8, weight: 70 },
        { setNumber: 3, reps: 6, weight: 80 },
      ],
    },
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [history, prData] = await Promise.all([
        getWorkoutHistory(30),
        getPersonalRecords(),
      ]);
      setWorkouts(history);
      setPrs(prData);
    } catch (err) {
      console.error("Error fetching workouts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    const targetEx = updated[exerciseIndex];
    const lastSet = targetEx.sets[targetEx.sets.length - 1] || { weight: 20, reps: 10 };
    targetEx.sets.push({
      setNumber: targetEx.sets.length + 1,
      reps: lastSet.reps,
      weight: lastSet.weight,
    });
    setExercises(updated);
  };

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        exerciseName: "Incline Dumbbell Press",
        sets: [{ setNumber: 1, reps: 10, weight: 20 }],
      },
    ]);
  };

  const handleSaveWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const today = new Date().toISOString().split("T")[0];
      await logWorkout({
        date: today,
        title,
        workoutType,
        exercises,
        durationMinutes,
        caloriesBurned,
        notes,
      });

      toast.success("Workout logged successfully! 💪");
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
          Log New Workout
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
                        Set {set.setNumber}: {set.weight}kg &times; {set.reps}
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
            <DialogTitle className="text-lg font-bold">Log Workout Session 🏋️‍♂️</DialogTitle>
            <DialogDescription className="text-xs">
              Record exercises, sets, reps, and weight lifted.
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Duration (mins)</Label>
                <Input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label>Calories Burned (kcal)</Label>
                <Input
                  type="number"
                  value={caloriesBurned}
                  onChange={(e) => setCaloriesBurned(Number(e.target.value))}
                  className="rounded-xl"
                />
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
                          placeholder="Weight (kg)"
                          value={set.weight}
                          onChange={(e) => {
                            const updated = [...exercises];
                            updated[exIdx].sets[setIdx].weight = Number(e.target.value);
                            setExercises(updated);
                          }}
                          className="rounded-xl h-8 text-xs bg-background"
                        />
                        <span className="text-[10px] text-muted-foreground">kg</span>
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
