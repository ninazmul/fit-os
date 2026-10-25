"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Dumbbell, Flame, Clock, Sparkles } from "lucide-react";
import { logWorkout } from "@/lib/actions/workout.actions";
import { notifyDataUpdated } from "@/lib/events";
import { getLocalDateString } from "@/lib/utils";
import type { WorkoutType } from "@/types/fitness";
import toast from "react-hot-toast";
import { useI18n } from "@/components/shared/I18nProvider";

interface QuickWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateStr?: string;
  onCompleted?: () => void | Promise<void>;
}

const PRESETS = [
  {
    title: "Push Day",
    labelKey: "shared.workoutType.push",
    type: "push" as WorkoutType,
    duration: 45,
    calories: 320,
    icon: "💪",
  },
  {
    title: "Pull Day",
    labelKey: "shared.workoutType.pull",
    type: "pull" as WorkoutType,
    duration: 45,
    calories: 310,
    icon: "🏋️",
  },
  {
    title: "Leg Day",
    labelKey: "shared.workoutType.legs",
    type: "legs" as WorkoutType,
    duration: 50,
    calories: 380,
    icon: "🦵",
  },
  {
    title: "Cardio & Run",
    labelKey: "shared.preset.cardioRun",
    type: "cardio" as WorkoutType,
    duration: 30,
    calories: 280,
    icon: "🏃",
  },
  {
    title: "Full Body",
    labelKey: "shared.workoutType.fullBody",
    type: "full_body" as WorkoutType,
    duration: 50,
    calories: 350,
    icon: "⚡",
  },
];

export default function QuickWorkoutModal({
  open,
  onOpenChange,
  dateStr,
  onCompleted,
}: QuickWorkoutModalProps) {
  const [title, setTitle] = useState("Push Workout");
  const [workoutType, setWorkoutType] = useState<WorkoutType>("push");
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(320);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const handleSelectPreset = (preset: (typeof PRESETS)[0]) => {
    setTitle(preset.title);
    setWorkoutType(preset.type);
    setDurationMinutes(preset.duration);
    setCaloriesBurned(preset.calories);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const today = dateStr || getLocalDateString();
      await logWorkout({
        date: today,
        title: title || "Workout Session",
        workoutType,
        durationMinutes: Number(durationMinutes) || 30,
        caloriesBurned: Number(caloriesBurned) || 250,
        exercises: [],
        notes,
      });

      toast.success(
        t("shared.quickWorkout.toast.logged", {
          title,
          calories: caloriesBurned,
        }),
      );
      notifyDataUpdated("workout");
      onOpenChange(false);
      await onCompleted?.();
    } catch {
      toast.error(t("shared.toast.logWorkoutFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md rounded-3xl p-5 gap-4">
        <DialogHeader className="px-1">
          <DialogTitle className="text-lg font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-amber-500" />
              {t("shared.quickWorkout.title")}
            </span>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
              {t("shared.quickWorkout.badge")}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* 1-Tap Presets */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            {t("shared.quickWorkout.presets")}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {PRESETS.map((p) => {
              const isSelected = title === p.title && workoutType === p.type;
              return (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center gap-0.5 ${
                    isSelected
                      ? "bg-amber-500/15 border-amber-500/40 text-foreground font-bold shadow-sm"
                      : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  <span className="text-base">{p.icon}</span>
                  <span className="text-[11px] font-bold leading-tight">
                    {t(p.labelKey)}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {p.duration}m &middot; {p.calories}k
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <div className="space-y-1">
            <Label htmlFor="workout-title" className="text-xs">
              {t("shared.quickWorkout.name")}
            </Label>
            <Input
              id="workout-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("shared.quickWorkout.namePlaceholder")}
              className="rounded-xl font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs">{t("shared.quickWorkout.type")}</Label>
              <Select
                value={workoutType}
                onValueChange={(val) => setWorkoutType(val as WorkoutType)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue
                    placeholder={t("shared.quickWorkout.typePlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="push">
                    {t("shared.workoutType.push")}
                  </SelectItem>
                  <SelectItem value="pull">
                    {t("shared.workoutType.pull")}
                  </SelectItem>
                  <SelectItem value="legs">
                    {t("shared.workoutType.legs")}
                  </SelectItem>
                  <SelectItem value="upper">
                    {t("shared.workoutType.upper")}
                  </SelectItem>
                  <SelectItem value="lower">
                    {t("shared.workoutType.lower")}
                  </SelectItem>
                  <SelectItem value="full_body">
                    {t("shared.workoutType.fullBody")}
                  </SelectItem>
                  <SelectItem value="cardio">
                    {t("shared.workoutType.cardio")}
                  </SelectItem>
                  <SelectItem value="custom">
                    {t("shared.workoutType.customRoutine")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="workout-duration" className="text-xs">
                {t("shared.quickWorkout.duration")}
              </Label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="workout-duration"
                  type="number"
                  min="5"
                  max="300"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="pl-8 rounded-xl"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="workout-calories" className="text-xs">
              {t("shared.quickWorkout.calories")}
            </Label>
            <div className="relative">
              <Flame className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
              <Input
                id="workout-calories"
                type="number"
                min="0"
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(Number(e.target.value))}
                className="pl-9 rounded-xl font-bold"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="workout-notes" className="text-xs">
              {t("shared.notesOptional")}
            </Label>
            <Input
              id="workout-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("shared.quickWorkout.notesPlaceholder")}
              className="rounded-xl text-xs"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold h-11 shadow-sm mt-2"
          >
            {loading ? t("shared.saving") : t("shared.quickWorkout.submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
