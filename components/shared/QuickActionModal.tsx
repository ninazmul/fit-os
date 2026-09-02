"use client";

import { useEffect, useState } from "react";
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
import {
  UtensilsCrossed,
  Scale,
  Droplet,
  Dumbbell,
  Moon,
  Star,
  Plus,
  Clock,
  Flame,
} from "lucide-react";
import { addWater, addSleepSession } from "@/lib/actions/water-sleep.actions";
import { formatTime12h, getLocalDateString } from "@/lib/utils";
import { logWeight } from "@/lib/actions/weight.actions";
import { logWorkout } from "@/lib/actions/workout.actions";
import { appendMealItem } from "@/lib/actions/meal.actions";
import { getRecentFoods } from "@/lib/actions/recent-meals.actions";
import { notifyDataUpdated } from "@/lib/events";
import type { IMealItem, MealType, WorkoutType } from "@/types/fitness";
import toast from "react-hot-toast";

interface QuickActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAction?: "meal" | "weight" | "water" | "workout" | "sleep";
  onCompleted?: () => void | Promise<void>;
  dateStr?: string;
}

export default function QuickActionModal({
  open,
  onOpenChange,
  defaultAction = "water",
  onCompleted,
  dateStr,
}: QuickActionModalProps) {
  const [activeTab, setActiveTab] = useState<
    "meal" | "weight" | "water" | "workout" | "sleep"
  >(defaultAction);

  // Water State
  const [waterAmount, setWaterAmount] = useState<number>(250);

  // Weight State
  const [weightVal, setWeightVal] = useState<string>("");
  const [weightNotes, setWeightNotes] = useState<string>("");

  // Sleep State
  const [sleepTime, setSleepTime] = useState<string>("23:00");
  const [wakeTime, setWakeTime] = useState<string>("07:00");
  const [sleepQuality, setSleepQuality] = useState<number>(4);
  const [sleepNotes, setSleepNotes] = useState<string>("");

  // Workout State
  const [workoutTitle, setWorkoutTitle] = useState("Push Workout");
  const [workoutType, setWorkoutType] = useState<WorkoutType>("push");
  const [workoutDuration, setWorkoutDuration] = useState<number>(45);
  const [workoutCalories, setWorkoutCalories] = useState<number>(300);

  // Meal State
  const [recentFoods, setRecentFoods] = useState<IMealItem[]>([]);
  const [selectedMealSlot, setSelectedMealSlot] = useState<MealType>("lunch");
  const [quickMealName, setQuickMealName] = useState("");
  const [quickMealCalories, setQuickMealCalories] = useState<number>(350);
  const [quickMealProtein, setQuickMealProtein] = useState<number>(20);

  const [loading, setLoading] = useState(false);

  const activeDate = dateStr || getLocalDateString();

  useEffect(() => {
    if (open) {
      setActiveTab(defaultAction);
      getRecentFoods(6).then((foods) => setRecentFoods(foods));

      const hour = new Date().getHours();
      if (hour >= 5 && hour < 11) setSelectedMealSlot("breakfast");
      else if (hour >= 11 && hour < 16) setSelectedMealSlot("lunch");
      else if (hour >= 16 && hour < 22) setSelectedMealSlot("dinner");
      else setSelectedMealSlot("snack");
    }
  }, [defaultAction, open]);

  const handleLogWater = async (amount: number) => {
    try {
      setLoading(true);
      await addWater(amount, activeDate);
      toast.success(`Logged ${amount}ml of water! 💧`);
      notifyDataUpdated("water");
      onOpenChange(false);
      await onCompleted?.();
    } catch {
      toast.error("Failed to log water");
    } finally {
      setLoading(false);
    }
  };

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightVal || isNaN(Number(weightVal))) {
      toast.error("Please enter a valid weight");
      return;
    }

    try {
      setLoading(true);
      await logWeight({
        date: activeDate,
        weight: Number(weightVal),
        notes: weightNotes,
      });
      toast.success(`Logged ${weightVal} kg! ⚖️`);
      notifyDataUpdated("weight");
      onOpenChange(false);
      setWeightVal("");
      setWeightNotes("");
      await onCompleted?.();
    } catch {
      toast.error("Failed to log weight");
    } finally {
      setLoading(false);
    }
  };

  const handleLogSleep = async (
    hours: number,
    sTime = sleepTime,
    wTime = wakeTime,
  ) => {
    try {
      setLoading(true);
      await addSleepSession({
        date: activeDate,
        sleepTime: sTime,
        wakeTime: wTime,
        totalHours: hours,
        quality: sleepQuality,
        notes: sleepNotes,
      });
      toast.success(`Logged ${hours}h sleep! 🌙`);
      notifyDataUpdated("sleep");
      onOpenChange(false);
      await onCompleted?.();
    } catch {
      toast.error("Failed to log sleep");
    } finally {
      setLoading(false);
    }
  };

  const handleLogWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await logWorkout({
        date: activeDate,
        title: workoutTitle || "Workout Session",
        workoutType,
        durationMinutes: Number(workoutDuration) || 30,
        caloriesBurned: Number(workoutCalories) || 250,
        exercises: [],
        notes: "",
      });
      toast.success(`Logged ${workoutTitle}! 🔥`);
      notifyDataUpdated("workout");
      onOpenChange(false);
      await onCompleted?.();
    } catch {
      toast.error("Failed to log workout");
    } finally {
      setLoading(false);
    }
  };

  const handleLogQuickMeal = async (foodItem: IMealItem) => {
    try {
      setLoading(true);
      await appendMealItem(activeDate, selectedMealSlot, foodItem);
      toast.success(
        `Logged ${foodItem.name} (${foodItem.calories} kcal) to ${selectedMealSlot}! 🍲`,
      );
      notifyDataUpdated("meal");
      onOpenChange(false);
      await onCompleted?.();
    } catch {
      toast.error("Failed to log food");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMealName.trim()) {
      toast.error("Please enter a food name");
      return;
    }
    await handleLogQuickMeal({
      foodId: "quick_custom",
      name: quickMealName.trim(),
      serving: "1 portion",
      quantity: 1,
      calories: Number(quickMealCalories) || 200,
      protein: Number(quickMealProtein) || 10,
      carbs: Math.round(((Number(quickMealCalories) || 200) * 0.4) / 4),
      fat: Math.round(((Number(quickMealCalories) || 200) * 0.3) / 9),
      fiber: 2,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md rounded-3xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto overflow-x-hidden no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Quick Log</DialogTitle>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-muted rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("water")}
            className={`flex flex-col items-center py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "water"
                ? "bg-background text-primary shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Droplet className="w-4 h-4 mb-0.5 text-blue-500" />
            Water
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("meal")}
            className={`flex flex-col items-center py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "meal"
                ? "bg-background text-primary shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 mb-0.5 text-emerald-500" />
            Meal
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sleep")}
            className={`flex flex-col items-center py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "sleep"
                ? "bg-background text-primary shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon className="w-4 h-4 mb-0.5 text-indigo-500" />
            Sleep
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("workout")}
            className={`flex flex-col items-center py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "workout"
                ? "bg-background text-primary shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Dumbbell className="w-4 h-4 mb-0.5 text-amber-500" />
            Workout
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("weight")}
            className={`flex flex-col items-center py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "weight"
                ? "bg-background text-primary shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Scale className="w-4 h-4 mb-0.5 text-purple-500" />
            Weight
          </button>
        </div>

        {/* Content based on tab */}
        {activeTab === "water" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground text-center">
              Quickly add water to today&apos;s hydration goal:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { amt: 150, label: "Cup (150ml)" },
                { amt: 250, label: "Glass (250ml)" },
                { amt: 500, label: "Bottle (500ml)" },
                { amt: 1000, label: "Large Bottle (1L)" },
              ].map(({ amt, label }) => (
                <Button
                  key={amt}
                  variant="outline"
                  disabled={loading}
                  onClick={() => handleLogWater(amt)}
                  className="rounded-xl py-5 flex flex-col gap-0.5 border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/40"
                >
                  <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                    +{amt >= 1000 ? `${amt / 1000}L` : `${amt}ml`}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {label}
                  </span>
                </Button>
              ))}
            </div>

            <div className="flex gap-2 items-end pt-2 border-t border-border/30">
              <div className="flex-1 space-y-1">
                <Label htmlFor="custom-water" className="text-xs">
                  Custom Water (ml)
                </Label>
                <Input
                  id="custom-water"
                  type="number"
                  placeholder="e.g. 350"
                  value={waterAmount}
                  onChange={(e) => setWaterAmount(Number(e.target.value))}
                  className="rounded-xl"
                />
              </div>
              <Button
                disabled={loading || !waterAmount}
                onClick={() => handleLogWater(waterAmount)}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Add Water
              </Button>
            </div>
          </div>
        )}

        {activeTab === "meal" && (
          <div className="space-y-4">
            {/* Meal Slot Selector */}
            <div className="space-y-1">
              <Label className="text-xs">Select Meal</Label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-muted/60 rounded-2xl text-xs font-semibold">
                {(
                  [
                    { id: "breakfast", label: "Breakfast" },
                    { id: "lunch", label: "Lunch" },
                    { id: "dinner", label: "Dinner" },
                    { id: "snack", label: "Snack" },
                  ] as const
                ).map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedMealSlot(slot.id)}
                    className={`py-1.5 rounded-xl transition-all capitalize ${
                      selectedMealSlot === slot.id
                        ? "bg-emerald-600 text-white shadow-sm font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 1-Tap Recent Foods */}
            {recentFoods.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Recent Foods (1-Tap Log)
                </p>
                <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {recentFoods.map((food, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={loading}
                      onClick={() => handleLogQuickMeal(food)}
                      className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/30 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-left transition-all text-xs"
                    >
                      <span className="font-bold truncate">{food.name}</span>
                      <span className="text-[11px] text-muted-foreground shrink-0 font-medium">
                        {food.calories} kcal &middot; {food.protein}g P
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick custom food form */}
            <form
              onSubmit={handleCustomMealSubmit}
              className="space-y-2.5 pt-2 border-t border-border/30"
            >
              <p className="text-[11px] font-semibold text-muted-foreground">
                Or enter a quick custom item:
              </p>
              <div className="space-y-1">
                <Input
                  placeholder="Food name (e.g. 2 Eggs + Toast)"
                  value={quickMealName}
                  onChange={(e) => setQuickMealName(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-muted-foreground">
                    Calories (kcal)
                  </Label>
                  <Input
                    type="number"
                    value={quickMealCalories}
                    onChange={(e) =>
                      setQuickMealCalories(Number(e.target.value))
                    }
                    className="rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[10px] text-muted-foreground">
                    Protein (g)
                  </Label>
                  <Input
                    type="number"
                    value={quickMealProtein}
                    onChange={(e) =>
                      setQuickMealProtein(Number(e.target.value))
                    }
                    className="rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading || !quickMealName.trim()}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9"
              >
                {loading ? "Adding..." : `+ Log to ${selectedMealSlot}`}
              </Button>
            </form>
          </div>
        )}

        {activeTab === "sleep" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground text-center">
              Quick presets for last night&apos;s sleep duration:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { hours: 6, sleep: "23:00", wake: "05:00", label: "6 hrs" },
                { hours: 7, sleep: "23:00", wake: "06:00", label: "7 hrs" },
                { hours: 7.5, sleep: "23:00", wake: "06:30", label: "7.5 hrs" },
                { hours: 8, sleep: "23:00", wake: "07:00", label: "8 hrs" },
              ].map((p) => (
                <Button
                  key={p.hours}
                  variant="outline"
                  disabled={loading}
                  onClick={() => handleLogSleep(p.hours, p.sleep, p.wake)}
                  className="rounded-xl py-4 flex flex-col gap-0.5 border-indigo-500/20 hover:bg-indigo-500/10 hover:border-indigo-500/40"
                >
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {p.label}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {formatTime12h(p.sleep)} - {formatTime12h(p.wake)}
                  </span>
                </Button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                let hrs = 8;
                try {
                  const [h1, m1] = sleepTime.split(":").map(Number);
                  const [h2, m2] = wakeTime.split(":").map(Number);
                  let mins = h2 * 60 + m2 - (h1 * 60 + m1);
                  if (mins <= 0) mins += 24 * 60;
                  hrs = Math.round((mins / 60) * 10) / 10;
                } catch {
                  hrs = 8;
                }
                handleLogSleep(hrs, sleepTime, wakeTime);
              }}
              className="space-y-3 pt-2 border-t border-border/30"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="sleep-time" className="text-xs">
                    Sleep Time
                  </Label>
                  <Input
                    id="sleep-time"
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="wake-time" className="text-xs">
                    Wake Time
                  </Label>
                  <Input
                    id="wake-time"
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Sleep Quality</Label>
                <div className="flex items-center justify-between gap-1 p-2 rounded-xl bg-muted/50 border border-border/30">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSleepQuality(star)}
                      className={`p-1.5 rounded-lg transition-transform hover:scale-110 ${
                        sleepQuality >= star
                          ? "text-amber-500 fill-amber-500"
                          : "text-muted-foreground/30"
                      }`}
                    >
                      <Star
                        className={`w-5 h-5 ${sleepQuality >= star ? "fill-amber-400" : ""}`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-muted-foreground ml-2 min-w-[50px] text-right">
                    {sleepQuality}/5 ★
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {loading ? "Saving..." : "Save Sleep Session"}
              </Button>
            </form>
          </div>
        )}

        {activeTab === "workout" && (
          <form onSubmit={handleLogWorkout} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="action-workout-title" className="text-xs">
                Workout Title
              </Label>
              <Input
                id="action-workout-title"
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                placeholder="e.g. Upper Body / Running"
                className="rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select
                  value={workoutType}
                  onValueChange={(v) => setWorkoutType(v as WorkoutType)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="push">Push Day</SelectItem>
                    <SelectItem value="pull">Pull Day</SelectItem>
                    <SelectItem value="legs">Leg Day</SelectItem>
                    <SelectItem value="upper">Upper Body</SelectItem>
                    <SelectItem value="lower">Lower Body</SelectItem>
                    <SelectItem value="full_body">Full Body</SelectItem>
                    <SelectItem value="cardio">Cardio / Run</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="action-workout-dur" className="text-xs">
                  Duration (min)
                </Label>
                <Input
                  id="action-workout-dur"
                  type="number"
                  value={workoutDuration}
                  onChange={(e) => setWorkoutDuration(Number(e.target.value))}
                  className="rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="action-workout-cal" className="text-xs">
                Estimated Calories (kcal)
              </Label>
              <Input
                id="action-workout-cal"
                type="number"
                value={workoutCalories}
                onChange={(e) => setWorkoutCalories(Number(e.target.value))}
                className="rounded-xl font-bold"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold h-10 mt-1"
            >
              {loading ? "Saving..." : "Log Workout"}
            </Button>
          </form>
        )}

        {activeTab === "weight" && (
          <form onSubmit={handleLogWeight} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="weight-val" className="text-xs">
                Today&apos;s Weight (kg)
              </Label>
              <Input
                id="weight-val"
                type="number"
                step="0.1"
                placeholder="e.g. 72.5"
                value={weightVal}
                onChange={(e) => setWeightVal(e.target.value)}
                required
                className="rounded-xl text-lg font-bold"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="weight-notes" className="text-xs">
                Notes (optional)
              </Label>
              <Input
                id="weight-notes"
                placeholder="e.g. Morning empty stomach"
                value={weightNotes}
                onChange={(e) => setWeightNotes(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              {loading ? "Saving..." : "Log Weight"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
