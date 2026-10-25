"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Clock,
  Zap,
} from "lucide-react";
import { addWater, addSleepSession } from "@/lib/actions/water-sleep.actions";
import { cn, formatTime12h, getLocalDateString } from "@/lib/utils";
import { logWeight } from "@/lib/actions/weight.actions";
import { logWorkout } from "@/lib/actions/workout.actions";
import { appendMealItem } from "@/lib/actions/meal.actions";
import { getRecentFoods } from "@/lib/actions/recent-meals.actions";
import { notifyDataUpdated } from "@/lib/events";
import type { IMealItem, MealType, WorkoutType } from "@/types/fitness";
import toast from "react-hot-toast";
import { useI18n } from "@/components/shared/I18nProvider";

type QuickActionTab = "meal" | "weight" | "water" | "workout" | "sleep";

interface QuickActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAction?: QuickActionTab;
  onCompleted?: () => void | Promise<void>;
  dateStr?: string;
}

/** Single source of truth for the tab rail + the header title/hint. */
const TABS: {
  id: QuickActionTab;
  icon: typeof Droplet;
  color: string;
  hintKey: string;
}[] = [
  {
    id: "water",
    icon: Droplet,
    color: "text-sky-500",
    hintKey: "shared.quickAction.waterHelp",
  },
  {
    id: "meal",
    icon: UtensilsCrossed,
    color: "text-emerald-500",
    hintKey: "shared.quickAction.mealHelp",
  },
  {
    id: "sleep",
    icon: Moon,
    color: "text-indigo-500",
    hintKey: "shared.quickAction.sleepHelp",
  },
  {
    id: "workout",
    icon: Dumbbell,
    color: "text-amber-500",
    hintKey: "shared.quickAction.workoutHelp",
  },
  {
    id: "weight",
    icon: Scale,
    color: "text-rose-500",
    hintKey: "shared.quickAction.weightHelp",
  },
];

export default function QuickActionModal({
  open,
  onOpenChange,
  defaultAction = "water",
  onCompleted,
  dateStr,
}: QuickActionModalProps) {
  const [activeTab, setActiveTab] = useState<QuickActionTab>(defaultAction);

  // Water State
  const [waterAmount, setWaterAmount] = useState<number>(250);

  // Weight State
  const [weightVal, setWeightVal] = useState<string>("");
  const [weightNotes, setWeightNotes] = useState<string>("");

  // Sleep State
  const [sleepTime, setSleepTime] = useState<string>("23:00");
  const [wakeTime, setWakeTime] = useState<string>("07:00");
  const [sleepQuality, setSleepQuality] = useState<number>(4);
  const [sleepNotes] = useState<string>("");

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
  const { t } = useI18n();

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
      toast.success(t("shared.toast.waterLogged", { amount }));
      notifyDataUpdated("water");
      onOpenChange(false);
      await onCompleted?.();
    } catch {
      toast.error(t("shared.toast.logWaterFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightVal || isNaN(Number(weightVal))) {
      toast.error(t("shared.toast.invalidWeight"));
      return;
    }

    try {
      setLoading(true);
      await logWeight({
        date: activeDate,
        weight: Number(weightVal),
        notes: weightNotes,
      });
      toast.success(t("shared.toast.weightLogged", { weight: weightVal }));
      notifyDataUpdated("weight");
      onOpenChange(false);
      setWeightVal("");
      setWeightNotes("");
      await onCompleted?.();
    } catch {
      toast.error(t("shared.toast.logWeightFailed"));
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
      toast.success(t("shared.toast.sleepLogged", { hours }));
      notifyDataUpdated("sleep");
      onOpenChange(false);
      await onCompleted?.();
    } catch {
      toast.error(t("shared.toast.logSleepFailed"));
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
      toast.success(t("shared.toast.workoutLogged", { title: workoutTitle }));
      notifyDataUpdated("workout");
      onOpenChange(false);
      await onCompleted?.();
    } catch {
      toast.error(t("shared.toast.logWorkoutFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogQuickMeal = async (foodItem: IMealItem) => {
    try {
      setLoading(true);
      await appendMealItem(activeDate, selectedMealSlot, foodItem);
      toast.success(
        t("shared.toast.foodLogged", {
          name: foodItem.name,
          calories: foodItem.calories,
          meal: t(`shared.mealSlot.${selectedMealSlot}`),
        }),
      );
      notifyDataUpdated("meal");
      onOpenChange(false);
      await onCompleted?.();
    } catch {
      toast.error(t("shared.toast.logFoodFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleCustomMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMealName.trim()) {
      toast.error(t("shared.toast.enterFoodName"));
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

  const activeTabMeta = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];
  const ActiveIcon = activeTabMeta.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] w-[95vw] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-md sm:rounded-3xl">
        {/* ─────────── Header (pinned) ─────────── */}
        <DialogHeader className="shrink-0 gap-1 space-y-0 border-b border-border/40 p-4 pb-3 pr-12 text-left sm:p-5 sm:pb-3.5 sm:pr-14">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary">
            <Zap className="h-3 w-3" />
            {t("shared.quickAction.title")}
          </div>
          <DialogTitle className="flex items-center gap-2 text-base font-black sm:text-lg">
            <ActiveIcon
              className={cn("h-4 w-4 shrink-0", activeTabMeta.color)}
            />
            {t(`shared.tab.${activeTab}`)}
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            {t(activeTabMeta.hintKey)}
          </DialogDescription>
        </DialogHeader>

        {/* ─────────── Tab rail (pinned) ─────────── */}
        <div
          role="tablist"
          aria-label={t("shared.quickAction.title")}
          className="mx-4 mt-3 grid shrink-0 grid-cols-5 gap-1 rounded-2xl bg-muted/60 p-1 sm:mx-5"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`qa-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`qa-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  isActive
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn("h-4 w-4", isActive ? tab.color : "opacity-60")}
                />
                {t(`shared.tab.${tab.id}`)}
              </button>
            );
          })}
        </div>

        {/* ─────────── Body (scrollable) ─────────── */}
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5">
          {activeTab === "water" && (
            <div
              role="tabpanel"
              id="qa-panel-water"
              aria-labelledby="qa-tab-water"
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { amt: 150, labelKey: "shared.water.cup150" },
                  { amt: 250, labelKey: "shared.water.glass250" },
                  { amt: 500, labelKey: "shared.water.bottle500" },
                  { amt: 1000, labelKey: "shared.water.largeBottle1L" },
                ].map(({ amt, labelKey }) => (
                  <Button
                    key={amt}
                    variant="outline"
                    disabled={loading}
                    onClick={() => handleLogWater(amt)}
                    className="h-auto flex-col gap-0.5 rounded-2xl border-sky-500/20 py-3.5 hover:border-sky-500/40 hover:bg-sky-500/10"
                  >
                    <span className="text-base font-black text-sky-600 dark:text-sky-400">
                      +{amt >= 1000 ? `${amt / 1000}L` : `${amt}ml`}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {t(labelKey)}
                    </span>
                  </Button>
                ))}
              </div>

              <div className="flex items-end gap-2 border-t border-border/40 pt-3.5">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="custom-water" className="text-xs font-semibold">
                    {t("shared.quickAction.customWater")}
                  </Label>
                  <Input
                    id="custom-water"
                    type="number"
                    inputMode="numeric"
                    min={50}
                    step={50}
                    placeholder={t("shared.quickAction.customWaterPlaceholder")}
                    value={waterAmount || ""}
                    onChange={(e) => setWaterAmount(Number(e.target.value))}
                    className="rounded-xl"
                  />
                </div>
                <Button
                  disabled={loading || !waterAmount}
                  onClick={() => handleLogWater(waterAmount)}
                  className="h-10 rounded-xl px-4 font-bold"
                >
                  {t("shared.quickAction.addWater")}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "meal" && (
            <div
              role="tabpanel"
              id="qa-panel-meal"
              aria-labelledby="qa-tab-meal"
              className="space-y-4"
            >
              {/* Meal Slot Selector */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">
                  {t("shared.quickAction.selectMeal")}
                </Label>
                <div className="grid grid-cols-4 gap-1 rounded-2xl bg-muted/60 p-1 text-xs font-semibold">
                  {(
                    [
                      { id: "breakfast", labelKey: "shared.mealSlot.breakfast" },
                      { id: "lunch", labelKey: "shared.mealSlot.lunch" },
                      { id: "dinner", labelKey: "shared.mealSlot.dinner" },
                      { id: "snack", labelKey: "shared.mealSlot.snack" },
                    ] as const
                  ).map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      aria-pressed={selectedMealSlot === slot.id}
                      onClick={() => setSelectedMealSlot(slot.id)}
                      className={cn(
                        "rounded-xl py-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        selectedMealSlot === slot.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t(slot.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1-Tap Recent Foods */}
              {recentFoods.length > 0 && (
                <div className="space-y-1.5">
                  <p className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {t("shared.quickAction.recentFoods")}
                  </p>
                  <div className="no-scrollbar grid max-h-36 grid-cols-1 gap-1.5 overflow-y-auto pr-1">
                    {recentFoods.map((food, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={loading}
                        onClick={() => handleLogQuickMeal(food)}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/30 p-2 text-left text-xs transition-all hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
                      >
                        <span className="truncate font-bold">{food.name}</span>
                        <span className="shrink-0 font-medium text-[11px] tabular-nums text-muted-foreground">
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
                className="space-y-2.5 border-t border-border/40 pt-3.5"
              >
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {t("shared.quickAction.customItemHelp")}
                </p>
                <Input
                  placeholder={t("shared.quickAction.foodNamePlaceholder")}
                  value={quickMealName}
                  onChange={(e) => setQuickMealName(e.target.value)}
                  className="rounded-xl text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] text-muted-foreground">
                      {t("shared.quickAction.calories")}
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
                      {t("shared.quickAction.protein")}
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
                  className="h-10 w-full rounded-xl text-xs font-bold"
                >
                  {loading
                    ? t("shared.quickAction.adding")
                    : t("shared.quickAction.logTo", {
                        meal: t(`shared.mealSlot.${selectedMealSlot}`),
                      })}
                </Button>
              </form>
            </div>
          )}

          {activeTab === "sleep" && (
            <div
              role="tabpanel"
              id="qa-panel-sleep"
              aria-labelledby="qa-tab-sleep"
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { hours: 6, sleep: "23:00", wake: "05:00" },
                  { hours: 7, sleep: "23:00", wake: "06:00" },
                  { hours: 7.5, sleep: "23:00", wake: "06:30" },
                  { hours: 8, sleep: "23:00", wake: "07:00" },
                ].map((p) => (
                  <Button
                    key={p.hours}
                    variant="outline"
                    disabled={loading}
                    onClick={() => handleLogSleep(p.hours, p.sleep, p.wake)}
                    className="h-auto flex-col gap-0.5 rounded-2xl border-indigo-500/20 py-3 hover:border-indigo-500/40 hover:bg-indigo-500/10"
                  >
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {t("shared.duration.hrs", { hours: p.hours })}
                    </span>
                    <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                      {formatTime12h(p.sleep)} – {formatTime12h(p.wake)}
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
                className="space-y-3 border-t border-border/40 pt-3.5"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="sleep-time" className="text-xs font-semibold">
                      {t("shared.quickAction.sleepTime")}
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
                    <Label htmlFor="wake-time" className="text-xs font-semibold">
                      {t("shared.quickAction.wakeTime")}
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
                  <Label className="text-xs font-semibold">
                    {t("shared.quickAction.sleepQuality")}
                  </Label>
                  <div className="flex items-center justify-between gap-1 rounded-xl border border-border/40 bg-muted/40 p-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        aria-label={`${star}/5`}
                        aria-pressed={sleepQuality === star}
                        onClick={() => setSleepQuality(star)}
                        className={cn(
                          "rounded-lg p-1.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                          sleepQuality >= star
                            ? "text-amber-500"
                            : "text-muted-foreground/30",
                        )}
                      >
                        <Star
                          className={cn(
                            "h-5 w-5",
                            sleepQuality >= star && "fill-amber-400",
                          )}
                        />
                      </button>
                    ))}
                    <span className="ml-2 min-w-[46px] text-right text-xs font-bold tabular-nums text-muted-foreground">
                      {sleepQuality}/5
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-full rounded-xl font-bold"
                >
                  {loading
                    ? t("shared.saving")
                    : t("shared.quickAction.saveSleep")}
                </Button>
              </form>
            </div>
          )}

          {activeTab === "workout" && (
            <form
              role="tabpanel"
              id="qa-panel-workout"
              aria-labelledby="qa-tab-workout"
              onSubmit={handleLogWorkout}
              className="space-y-3"
            >
              <div className="space-y-1">
                <Label htmlFor="action-workout-title" className="text-xs font-semibold">
                  {t("shared.quickAction.workoutTitle")}
                </Label>
                <Input
                  id="action-workout-title"
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  placeholder={t("shared.quickAction.workoutTitlePlaceholder")}
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">
                    {t("shared.quickWorkout.type")}
                  </Label>
                  <Select
                    value={workoutType}
                    onValueChange={(v) => setWorkoutType(v as WorkoutType)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
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
                        {t("shared.workoutType.custom")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="action-workout-dur" className="text-xs font-semibold">
                    {t("shared.quickWorkout.duration")}
                  </Label>
                  <Input
                    id="action-workout-dur"
                    type="number"
                    inputMode="numeric"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(Number(e.target.value))}
                    className="rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="action-workout-cal" className="text-xs font-semibold">
                  {t("shared.quickAction.estimatedCalories")}
                </Label>
                <Input
                  id="action-workout-cal"
                  type="number"
                  inputMode="numeric"
                  value={workoutCalories}
                  onChange={(e) => setWorkoutCalories(Number(e.target.value))}
                  className="rounded-xl font-bold"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="mt-1 h-10 w-full rounded-xl font-bold"
              >
                {loading
                  ? t("shared.saving")
                  : t("shared.quickAction.logWorkout")}
              </Button>
            </form>
          )}

          {activeTab === "weight" && (
            <form
              role="tabpanel"
              id="qa-panel-weight"
              aria-labelledby="qa-tab-weight"
              onSubmit={handleLogWeight}
              className="space-y-4"
            >
              <div className="space-y-1">
                <Label htmlFor="weight-val" className="text-xs font-semibold">
                  {t("shared.quickAction.todayWeight")}
                </Label>
                <Input
                  id="weight-val"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  placeholder={t("shared.quickAction.weightPlaceholder")}
                  value={weightVal}
                  onChange={(e) => setWeightVal(e.target.value)}
                  required
                  className="rounded-xl text-lg font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="weight-notes" className="text-xs font-semibold">
                  {t("shared.notesOptional")}
                </Label>
                <Input
                  id="weight-notes"
                  placeholder={t("shared.quickAction.weightNotesPlaceholder")}
                  value={weightNotes}
                  onChange={(e) => setWeightNotes(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-10 w-full rounded-xl font-bold"
              >
                {loading ? t("shared.saving") : t("shared.quickAction.logWeight")}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
