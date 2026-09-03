"use client";

import { useState, useEffect, useCallback } from "react";
import { getDashboardData } from "@/lib/actions/dashboard.actions";
import {
  addWater,
  removeWaterEntry,
  getWaterLogForDate,
  addSleepSession,
  removeSleepSession,
  getSleepLogForDate,
} from "@/lib/actions/water-sleep.actions";
import {
  appendMealItem,
  removeMealItem,
} from "@/lib/actions/meal.actions";
import { completeWorkoutPlanDay, deleteWorkoutLog } from "@/lib/actions/workout.actions";
import { formatTime12h, getLocalDateString } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { notifyDataUpdated, useDataUpdateListener } from "@/lib/events";
import type { IMealItem, MealType } from "@/types/fitness";
import dynamic from "next/dynamic";
import StatCard from "@/components/shared/StatCard";
import ProgressRing from "@/components/shared/ProgressRing";
import { DashboardSkeleton } from "@/components/shared/SkeletonLoaders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Flame,
  Scale,
  Target,
  Droplet,
  Dumbbell,
  Moon,
  Zap,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  TrendingDown,
  Sparkles,
  UtensilsCrossed,
  Trash2,
  Clock,
  Star,
  Award,
  Compass,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ScanBarcode,
  Sun,
  Apple,
  CalendarCheck,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const QuickActionModal = dynamic(
  () => import("@/components/shared/QuickActionModal"),
  { ssr: false },
);
const QuickWorkoutModal = dynamic(
  () => import("@/components/shared/QuickWorkoutModal"),
  { ssr: false },
);
const OnboardingModal = dynamic(
  () => import("@/components/shared/OnboardingModal"),
  { ssr: false },
);
const SearchModal = dynamic(() => import("@/components/shared/SearchModal"), {
  ssr: false,
});
const BarcodeScanner = dynamic(
  () => import("@/components/shared/BarcodeScanner"),
  { ssr: false },
);
const AdUnit = dynamic(() => import("@/components/shared/AdUnit"), {
  ssr: false,
});
const WeeklyNutritionChart = dynamic(
  () => import("@/components/dashboard/WeeklyNutritionChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-60 w-full rounded-2xl bg-muted/20 animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading chart...
      </div>
    ),
  },
);
const WeeklyWeightChart = dynamic(
  () => import("@/components/dashboard/WeeklyWeightChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-52 w-full rounded-2xl bg-muted/20 animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading chart...
      </div>
    ),
  },
);

const MEAL_SLOTS: {
  type: MealType;
  label: string;
  icon: typeof Sun;
  color: string;
}[] = [
  {
    type: "breakfast",
    label: "Breakfast",
    icon: Sun,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  {
    type: "lunch",
    label: "Lunch",
    icon: UtensilsCrossed,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    type: "dinner",
    label: "Dinner",
    icon: Moon,
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    type: "snack",
    label: "Snacks",
    icon: Apple,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  },
];

export default function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    getLocalDateString(),
  );

  // Modals state
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [quickLogAction, setQuickLogAction] = useState<
    "meal" | "weight" | "water" | "workout" | "sleep"
  >("water");
  const [quickWorkoutOpen, setQuickWorkoutOpen] = useState(false);
  const [planCompleting, setPlanCompleting] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMealSlot, setSearchMealSlot] = useState<MealType>("lunch");
  const [barcodeOpen, setBarcodeOpen] = useState(false);

  // Water inline state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [waterLog, setWaterLog] = useState<any>({ entries: [], totalMl: 0 });
  const [customWaterInput, setCustomWaterInput] = useState<string>("");
  const [waterAdding, setWaterAdding] = useState<number | null>(null);
  const [waterRemoving, setWaterRemoving] = useState<number | null>(null);

  // Sleep inline state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sleepLog, setSleepLog] = useState<any>({
    sessions: [],
    totalHours: 0,
    avgQuality: 0,
  });
  const [sleepAdding, setSleepAdding] = useState<number | null>(null);
  const [sleepRemoving, setSleepRemoving] = useState<number | null>(null);

  // Meal inline state
  const [recentAddingIdx, setRecentAddingIdx] = useState<number | null>(null);
  const [itemDeletingKey, setItemDeletingKey] = useState<string | null>(null);

  const isToday = selectedDateStr === getLocalDateString();

  // Fetch only selected date data directly from DB
  const fetchDashboard = useCallback(
    async (showLoadingSpinner = false) => {
      try {
        if (showLoadingSpinner) setLoading(true);
        const res = await getDashboardData(selectedDateStr);
        setData(res);
        if (res?.needsOnboarding) {
          setOnboardingOpen(true);
        }
        if (res?.water) {
          setWaterLog(res.water);
        }
        if (res?.sleep) {
          setSleepLog(res.sleep);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (showLoadingSpinner) setLoading(false);
      }
    },
    [selectedDateStr],
  );

  const fetchWater = useCallback(async () => {
    try {
      const w = await getWaterLogForDate(selectedDateStr);
      setWaterLog(w);
    } catch (err) {
      console.error("Water log fetch error:", err);
    }
  }, [selectedDateStr]);

  const fetchSleep = useCallback(async () => {
    try {
      const s = await getSleepLogForDate(selectedDateStr);
      setSleepLog(s);
    } catch (err) {
      console.error("Sleep log fetch error:", err);
    }
  }, [selectedDateStr]);

  // Initial load on date change
  useEffect(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

  // Reactive listener: when any modal, sheet, or action adds/updates data, refresh seamlessly
  useDataUpdateListener(() => {
    fetchDashboard(false);
    fetchWater();
    fetchSleep();
  });

  // Date navigation handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDateStr);
    d.setDate(d.getDate() - 1);
    setSelectedDateStr(getLocalDateString(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDateStr);
    d.setDate(d.getDate() + 1);
    setSelectedDateStr(getLocalDateString(d));
  };

  const handleToday = () => {
    setSelectedDateStr(getLocalDateString());
  };

  // ──────────────────────────── Water Handlers ────────────────────────────
  const handleQuickAddWater = async (amountMl: number) => {
    try {
      setWaterAdding(amountMl);
      // Optimistic state update
      setWaterLog((prev: typeof waterLog) => ({
        ...prev,
        totalMl: (prev.totalMl || 0) + amountMl,
        entries: [
          ...(prev.entries || []),
          {
            amountMl,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ],
      }));
      setData((prev: typeof data) => {
        if (!prev) return prev;
        const newWater = (prev.today?.waterMl || 0) + amountMl;
        return {
          ...prev,
          today: { ...prev.today, waterMl: newWater },
        };
      });

      await addWater(amountMl, selectedDateStr);
      toast.success(
        `Added ${amountMl >= 1000 ? `${amountMl / 1000}L` : `${amountMl}ml`} 💧`,
      );
      notifyDataUpdated("water");
      await Promise.all([fetchWater(), fetchDashboard(false)]);
    } catch {
      toast.error("Failed to log water");
      fetchWater();
      fetchDashboard(false);
    } finally {
      setWaterAdding(null);
      setCustomWaterInput("");
    }
  };

  const handleRemoveWaterEntry = async (idx: number) => {
    try {
      setWaterRemoving(idx);
      await removeWaterEntry(idx, selectedDateStr);
      toast.success("Water entry removed");
      notifyDataUpdated("water");
      await Promise.all([fetchWater(), fetchDashboard(false)]);
    } catch {
      toast.error("Failed to remove entry");
    } finally {
      setWaterRemoving(null);
    }
  };

  // ──────────────────────────── Sleep Handlers ────────────────────────────
  const handleQuickAddSleep = async (
    hours: number,
    sleepTime = "23:00",
    wakeTime = "07:00",
  ) => {
    try {
      setSleepAdding(hours);
      await addSleepSession({
        date: selectedDateStr,
        sleepTime,
        wakeTime,
        totalHours: hours,
        quality: 4,
      });
      toast.success(`Logged ${hours}h sleep! 🌙`);
      notifyDataUpdated("sleep");
      await Promise.all([fetchSleep(), fetchDashboard(false)]);
    } catch {
      toast.error("Failed to log sleep");
    } finally {
      setSleepAdding(null);
    }
  };

  const handleRemoveSleepSession = async (idx: number) => {
    try {
      setSleepRemoving(idx);
      await removeSleepSession(idx, selectedDateStr);
      toast.success("Sleep session removed");
      notifyDataUpdated("sleep");
      await Promise.all([fetchSleep(), fetchDashboard(false)]);
    } catch {
      toast.error("Failed to remove session");
    } finally {
      setSleepRemoving(null);
    }
  };

  // ──────────────────────────── Meal Handlers ────────────────────────────
  const handleQuickAddRecentFood = async (
    item: IMealItem,
    slot: MealType,
    idx: number,
  ) => {
    try {
      setRecentAddingIdx(idx);
      await appendMealItem(selectedDateStr, slot, {
        foodId: item.foodId,
        name: item.name,
        serving: item.serving || "1 serving",
        quantity: 1,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber || 0,
      });
      toast.success(`Logged ${item.name} (${item.calories} kcal) to ${slot}! 🍲`);
      notifyDataUpdated("meal");
      await fetchDashboard(false);
    } catch {
      toast.error("Failed to log food");
    } finally {
      setRecentAddingIdx(null);
    }
  };

  const handleRemoveMealItem = async (mealId: string, itemIdx: number) => {
    const key = `${mealId}_${itemIdx}`;
    try {
      setItemDeletingKey(key);
      await removeMealItem(mealId, itemIdx);
      toast.success("Item removed");
      notifyDataUpdated("meal");
      await fetchDashboard(false);
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setItemDeletingKey(null);
    }
  };

  // ──────────────────────────── Workout Handlers ────────────────────────────
  const handleDeleteWorkout = async (id: string) => {
    try {
      await deleteWorkoutLog(id);
      toast.success("Workout removed");
      notifyDataUpdated("workout");
      await fetchDashboard(false);
    } catch {
      toast.error("Failed to delete workout");
    }
  };

  const handleCompleteWorkoutPlan = async () => {
    if (!todayWorkoutPlan?._id) return;

    try {
      setPlanCompleting(true);
      await completeWorkoutPlanDay(selectedDateStr, todayWorkoutPlan._id);
      toast.success(`${todayWorkoutPlan.title} completed`);
      notifyDataUpdated("workout");
      await fetchDashboard(false);
    } catch {
      toast.error("Failed to complete workout plan");
    } finally {
      setPlanCompleting(false);
    }
  };

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  if (data.needsOnboarding) {
    return (
      <div className="text-center py-20">
        <OnboardingModal
          open={onboardingOpen}
          onOpenChange={setOnboardingOpen}
        />
        <h2 className="text-xl font-bold">Welcome to {APP_NAME}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Please complete your profile onboarding to access your dashboard.
        </p>
        <Button
          onClick={() => setOnboardingOpen(true)}
          className="mt-4 rounded-xl font-bold"
        >
          Start Onboarding
        </Button>
      </div>
    );
  }

  const {
    profile,
    today,
    meals: todayMeals,
    workouts: todayWorkouts,
    recentFoods = [],
    charts,
    streak,
    workoutDaysThisWeek,
    todaysMission,
    dailyScore,
    weightPrediction,
    todayWorkoutPlan,
  } = data;

  const caloriePct = Math.min(
    100,
    Math.round((today.calories / (profile.dailyCaloriesGoal || 2000)) * 100),
  );
  const proteinPct = Math.min(
    100,
    Math.round((today.protein / (profile.dailyProteinGoal || 120)) * 100),
  );
  const carbsPct = Math.min(
    100,
    Math.round((today.carbs / (profile.dailyCarbGoal || 250)) * 100),
  );
  const fatPct = Math.min(
    100,
    Math.round((today.fat / (profile.dailyFatGoal || 65)) * 100),
  );
  const fiberPct = Math.min(
    100,
    Math.round((today.fiber / (profile.dailyFiberGoal || 30)) * 100),
  );
  const waterPct = Math.min(
    100,
    Math.round((today.waterMl / (profile.waterGoalMl || 2500)) * 100),
  );

  const remainingKcal = profile.dailyCaloriesGoal - today.calories;
  const isSurplus = remainingKcal < 0;

  // Determine current active meal slot based on time
  const currentHour = new Date().getHours();
  let currentSuggestedSlot: MealType = "lunch";
  if (currentHour >= 5 && currentHour < 11) currentSuggestedSlot = "breakfast";
  else if (currentHour >= 11 && currentHour < 16) currentSuggestedSlot = "lunch";
  else if (currentHour >= 16 && currentHour < 22) currentSuggestedSlot = "dinner";
  else currentSuggestedSlot = "snack";

  const checklist = [
    {
      label: "Drink Water Target",
      done: today.waterMl >= profile.waterGoalMl * 0.8,
      icon: Droplet,
      points: 20,
    },
    {
      label: "Log Meals (Breakfast/Lunch/Dinner)",
      done: today.mealCount > 0,
      icon: UtensilsCrossed,
      points: 25,
    },
    {
      label: "Hit Protein Target (≥80%)",
      done: today.protein >= profile.dailyProteinGoal * 0.8,
      icon: Target,
      points: 20,
    },
    {
      label: "Complete Workout Session",
      done: today.workoutDone,
      icon: Dumbbell,
      points: 15,
    },
    {
      label: "Log Sleep Hours",
      done: today.sleepHours !== null,
      icon: Moon,
      points: 10,
    },
    {
      label: "Log Morning Weight",
      done: today.weight > 0,
      icon: Scale,
      points: 10,
    },
  ];

  const completedChecklistCount = checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Search, Barcode & Action Modals */}
      <OnboardingModal
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        initialData={profile}
      />
      <QuickActionModal
        open={quickLogOpen}
        onOpenChange={setQuickLogOpen}
        defaultAction={quickLogAction}
        dateStr={selectedDateStr}
        onCompleted={() => fetchDashboard(false)}
      />
      <QuickWorkoutModal
        open={quickWorkoutOpen}
        onOpenChange={setQuickWorkoutOpen}
        dateStr={selectedDateStr}
        onCompleted={() => fetchDashboard(false)}
      />
      <SearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        defaultMealSlot={searchMealSlot}
        dateStr={selectedDateStr}
        onCompleted={() => fetchDashboard(false)}
      />
      <BarcodeScanner
        open={barcodeOpen}
        onOpenChange={setBarcodeOpen}
        dateStr={selectedDateStr}
        defaultMealType={currentSuggestedSlot}
        onLogged={async () => {
          notifyDataUpdated("meal");
          await fetchDashboard(false);
        }}
      />

      {/* ────────────────── TOP CONTROL & DATE NAV BAR ────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-background/60 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-border/50 shadow-sm overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-3 shrink-0 overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border/40 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevDay}
              className="h-8 w-8 rounded-xl shrink-0"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <button
              type="button"
              onClick={handleToday}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                isToday
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              {isToday
                ? "Today"
                : new Date(selectedDateStr).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextDay}
              className="h-8 w-8 rounded-xl shrink-0"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="px-2.5 py-1 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1 shrink-0">
              <Zap className="w-3.5 h-3.5 fill-current" /> {streak}d Streak
            </span>
            <span className="px-2.5 py-1 rounded-full font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              ⚡ Score: {dailyScore?.score || 0}/100
            </span>
          </div>
        </div>

        {/* 1-Tap Quick Action Icons Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-0.5 shrink-0">
          <Button
            size="sm"
            onClick={() => {
              setSearchMealSlot(currentSuggestedSlot);
              setSearchOpen(true);
            }}
            className="rounded-2xl text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-8 px-3"
          >
            <Plus className="w-3.5 h-3.5" /> Food
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setQuickLogAction("water");
              setQuickLogOpen(true);
            }}
            className="rounded-2xl text-xs font-bold gap-1 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 h-8 px-3"
          >
            <Droplet className="w-3.5 h-3.5 text-blue-500" /> Water
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              todayWorkoutPlan && !today.workoutDone
                ? handleCompleteWorkoutPlan()
                : setQuickWorkoutOpen(true)
            }
            disabled={planCompleting}
            className="rounded-2xl text-xs font-bold gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 h-8 px-3"
          >
            {todayWorkoutPlan && !today.workoutDone ? (
              <CalendarCheck className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Dumbbell className="w-3.5 h-3.5 text-amber-500" />
            )}
            {todayWorkoutPlan && !today.workoutDone
              ? planCompleting
                ? "Saving..."
                : `${new Date(`${selectedDateStr}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" })} Plan`
              : "Workout"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setQuickLogAction("sleep");
              setQuickLogOpen(true);
            }}
            className="rounded-2xl text-xs font-bold gap-1 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 h-8 px-3"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-500" /> Sleep
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setQuickLogAction("weight");
              setQuickLogOpen(true);
            }}
            className="rounded-2xl text-xs font-bold gap-1 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 h-8 px-3"
          >
            <Scale className="w-3.5 h-3.5 text-purple-500" /> Weight
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setBarcodeOpen(true)}
            className="rounded-2xl text-xs font-bold gap-1 border-border/60 hover:bg-muted h-8 px-2.5"
            title="Scan Barcode"
          >
            <ScanBarcode className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* ────────────────── HERO TODAY'S MISSION ────────────────── */}
      <div className="glass-card p-6 rounded-3xl border border-primary/25 relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-emerald-500/5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-primary text-white flex items-center gap-1 shadow-sm">
                <Compass className="w-3.5 h-3.5" /> Today&apos;s Mission
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-current" /> {streak} Day Streak
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Target: {profile.targetWeight} kg (
                {profile.goal?.replace("_", " ")})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
              {todaysMission?.greetingTime || "Welcome back"}, {profile.name}!
              👋
            </h1>

            <div className="p-3.5 rounded-2xl bg-background/85 border border-border/60 backdrop-blur-md">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Recommended Action
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5">
                {todaysMission?.primaryMission ||
                  "Log your daily progress to stay on track!"}
              </p>
            </div>

            {/* Dynamic remaining budgets */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                {isSurplus
                  ? `+${Math.abs(remainingKcal)} kcal surplus`
                  : `${remainingKcal} kcal left`}
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                {todaysMission?.remainingProtein || 0}g protein left
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
                <Droplet className="w-4 h-4" />
                {todaysMission?.remainingWaterMl
                  ? `${(todaysMission.remainingWaterMl / 1000).toFixed(1)}L`
                  : "0L"}{" "}
                water left
              </div>
            </div>
          </div>

          {/* Quick Action Hero Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <Button
              onClick={() => {
                if (todaysMission?.missionAction === "meal") {
                  setSearchMealSlot(currentSuggestedSlot);
                  setSearchOpen(true);
                } else if (todaysMission?.missionAction === "workout") {
                  setQuickWorkoutOpen(true);
                } else {
                  setQuickLogAction(todaysMission?.missionAction || "water");
                  setQuickLogOpen(true);
                }
              }}
              className="rounded-2xl gap-2 bg-primary hover:bg-primary/90 text-white font-black py-6 px-6 shadow-md text-sm"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              {todaysMission?.missionAction === "weight"
                ? "Log Morning Weight"
                : todaysMission?.missionAction === "workout"
                  ? "Log Workout Now"
                  : todaysMission?.missionAction === "sleep"
                    ? "Log Sleep Hours"
                    : "Log Food Now"}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setSearchMealSlot(currentSuggestedSlot);
                setSearchOpen(true);
              }}
              className="rounded-2xl gap-2 border-border/60 text-xs font-bold py-5 hover:bg-accent"
            >
              <Search className="w-4 h-4 text-primary" />
              Browse Bangladeshi Foods
            </Button>
          </div>
        </div>
      </div>

      {/* ────────────────── AI INTELLIGENCE COACHING SPOTLIGHT ────────────────── */}
      <div className="glass-card p-4 rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/10 via-purple-500/10 to-emerald-500/10 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary font-heading">
                AI Coach Insight
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                Live Macro Pacing
              </span>
            </div>
            <p className="text-xs font-bold text-foreground mt-0.5">
              {today.protein >= profile.dailyProteinGoal
                ? "Great job! You hit your daily protein target for muscle repair."
                : today.calories > 0
                  ? `You have reached ${proteinPct}% of protein goal. Consider high-protein BD meals (Dim, Dal, Chicken, Chhola).`
                  : "Log your morning breakfast to initialize your personalized AI metabolic trajectory."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/diet">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Recipe Estimator
            </Button>
          </Link>
          <Link href="/analytics">
            <Button
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              Ask AI Coach &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {/* ────────────────── OVERVIEW STAT CARDS GRID ────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Current Weight"
          value={today.weight}
          unit="kg"
          subtitle={`Target: ${profile.targetWeight} kg`}
          icon={Scale}
          variant="purple"
          onClick={() => {
            setQuickLogAction("weight");
            setQuickLogOpen(true);
          }}
        />

        <StatCard
          title="Calories In"
          value={today.calories}
          unit="kcal"
          subtitle={`Budget: ${profile.dailyCaloriesGoal}`}
          icon={Flame}
          variant="orange"
          progress={caloriePct}
        />

        <StatCard
          title="Protein"
          value={today.protein}
          unit="g"
          subtitle={`Goal: ${profile.dailyProteinGoal}g`}
          icon={Target}
          variant="green"
          progress={proteinPct}
        />

        <StatCard
          title="Water Intake"
          value={
            today.waterMl >= 1000
              ? `${(today.waterMl / 1000).toFixed(1)}L`
              : `${today.waterMl}ml`
          }
          subtitle={`Goal: ${(profile.waterGoalMl / 1000).toFixed(1)}L`}
          icon={Droplet}
          variant="blue"
          progress={waterPct}
          onClick={() => {
            setQuickLogAction("water");
            setQuickLogOpen(true);
          }}
        />

        <StatCard
          title="Workout Status"
          value={today.workoutDone ? "Completed" : "Rest / Pending"}
          subtitle={`${workoutDaysThisWeek}/${profile.workoutDaysPerWeek} Days this week`}
          icon={Dumbbell}
          variant="orange"
          onClick={() => setQuickWorkoutOpen(true)}
        />

        <StatCard
          title="Sleep Duration"
          value={today.sleepHours ? `${today.sleepHours}h` : "Not logged"}
          subtitle={
            today.sleepQuality
              ? `Quality: ${today.sleepQuality}/5 ★`
              : "Tap to track"
          }
          icon={Moon}
          variant="purple"
          onClick={() => {
            setQuickLogAction("sleep");
            setQuickLogOpen(true);
          }}
        />
      </div>

      {/* ────────────────── TODAY'S MEALS & DIRECT FOOD STATION ────────────────── */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-border/50 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black flex items-center gap-2 font-heading">
              <UtensilsCrossed className="w-5 h-5 text-emerald-500" />
              Today&apos;s Meals &amp; Nutrition
            </h3>
            <p className="text-xs text-muted-foreground">
              Log, track, and manage each meal slot directly without leaving dashboard
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                setSearchMealSlot(currentSuggestedSlot);
                setSearchOpen(true);
              }}
              className="rounded-xl text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-3.5 h-3.5" /> Add Food
            </Button>
            <Link href="/diet">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400"
              >
                Full Diet Page &rarr;
              </Button>
            </Link>
          </div>
        </div>

        {/* 1-Tap Recent Foods Quick Strip */}
        {recentFoods && recentFoods.length > 0 && (
          <div className="p-3 rounded-2xl bg-muted/30 border border-border/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" /> 1-Tap Recent Foods (Log to {currentSuggestedSlot})
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">
                Auto-adds to current meal slot
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {recentFoods.slice(0, 7).map((food: IMealItem, idx: number) => {
                const isAdding = recentAddingIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAdding}
                    onClick={() =>
                      handleQuickAddRecentFood(
                        food,
                        currentSuggestedSlot,
                        idx,
                      )
                    }
                    className="group px-3 py-2 rounded-xl bg-background border border-border/60 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all shrink-0 flex items-center gap-2 text-left"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate max-w-[120px]">
                        {food.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {food.calories} kcal &middot; {food.protein}g P
                      </p>
                    </div>
                    <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">
                      {isAdding ? "..." : "+"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4 Meal Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {MEAL_SLOTS.map((slot) => {
            const slotData = todayMeals?.[slot.type] || {
              items: [],
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
            };
            const Icon = slot.icon;
            const hasItems = slotData.items && slotData.items.length > 0;

            return (
              <div
                key={slot.type}
                className="p-4 rounded-2xl bg-card border border-border/50 flex flex-col justify-between space-y-3 hover:border-primary/30 transition-all shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${slot.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-foreground capitalize">
                        {slot.label}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-foreground">
                      {slotData.calories} kcal
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold border-b border-border/30 pb-2 mb-2">
                    <span>P: {slotData.protein}g</span>
                    <span>&middot;</span>
                    <span>C: {slotData.carbs}g</span>
                    <span>&middot;</span>
                    <span>F: {slotData.fat}g</span>
                  </div>

                  {/* Logged items list */}
                  {hasItems ? (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {slotData.items.map(
                        (item: IMealItem, itemIdx: number) => {
                          const itemKey = `${slotData._id || slot.type}_${itemIdx}`;
                          const isDeleting = itemDeletingKey === itemKey;
                          return (
                            <div
                              key={itemIdx}
                              className="flex items-center justify-between p-1.5 rounded-lg bg-muted/40 text-[11px] group"
                            >
                              <div className="truncate mr-1">
                                <p className="font-bold truncate text-foreground">
                                  {item.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {item.calories} kcal &middot; {item.serving}
                                </p>
                              </div>

                              {slotData._id && (
                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={() =>
                                    handleRemoveMealItem(
                                      slotData._id!,
                                      itemIdx,
                                    )
                                  }
                                  className="p-1 rounded text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0 opacity-80 group-hover:opacity-100"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-3 text-center">
                      No foods logged yet
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearchMealSlot(slot.type);
                    setSearchOpen(true);
                  }}
                  className="w-full rounded-xl text-xs font-bold gap-1 border-dashed hover:border-solid hover:bg-emerald-500/10 hover:text-emerald-600 h-8"
                >
                  <Plus className="w-3.5 h-3.5" /> Log {slot.label}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ────────────────── MACRONUTRIENT & CALORIE VISUALIZER ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Calorie Budget Ring */}
        <div className="glass-card p-6 rounded-3xl border border-border/50 flex flex-col items-center text-center justify-between">
          <div className="w-full flex flex-wrap items-center justify-between gap-1.5 mb-2">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              Daily Calorie Budget
            </h3>
            <span
              className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                isSurplus
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isSurplus
                ? `+${Math.abs(remainingKcal)} kcal over`
                : `${remainingKcal} kcal left`}
            </span>
          </div>

          <div className="py-2">
            <ProgressRing
              value={caloriePct}
              size={150}
              strokeWidth={12}
              color={isSurplus ? "hsl(0, 84%, 60%)" : "hsl(25, 95%, 53%)"}
              label={`${today.calories}`}
              sublabel={`of ${profile.dailyCaloriesGoal} kcal`}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t border-border/50 text-xs">
            <div>
              <p className="text-muted-foreground font-medium">Protein</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {today.protein}g / {profile.dailyProteinGoal}g
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Carbs</p>
              <p className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                {today.carbs}g / {profile.dailyCarbGoal}g
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Fat</p>
              <p className="font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                {today.fat}g / {profile.dailyFatGoal}g
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Macro Progress Bars & Pacing */}
        <div className="glass-card p-6 rounded-3xl border border-border/50 md:col-span-2 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-500" />
                  Target Macro Distribution
                </h3>
                <p className="text-xs text-muted-foreground">
                  Track exact grams against your daily fitness formula
                </p>
              </div>
              <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10">
                Pacing Active
              </span>
            </div>

            <div className="space-y-3.5 pt-1">
              {/* Protein Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    🥩 Protein ({proteinPct}%)
                  </span>
                  <span className="font-semibold text-muted-foreground">
                    {today.protein}g / {profile.dailyProteinGoal}g
                  </span>
                </div>
                <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${proteinPct}%` }}
                  />
                </div>
              </div>

              {/* Carbs Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    🍞 Carbohydrates ({carbsPct}%)
                  </span>
                  <span className="font-semibold text-muted-foreground">
                    {today.carbs}g / {profile.dailyCarbGoal}g
                  </span>
                </div>
                <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${carbsPct}%` }}
                  />
                </div>
              </div>

              {/* Fat Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    🥑 Dietary Fat ({fatPct}%)
                  </span>
                  <span className="font-semibold text-muted-foreground">
                    {today.fat}g / {profile.dailyFatGoal}g
                  </span>
                </div>
                <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${fatPct}%` }}
                  />
                </div>
              </div>

              {/* Fiber Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    🥦 Dietary Fiber ({fiberPct}%)
                  </span>
                  <span className="font-semibold text-muted-foreground">
                    {today.fiber}g / {profile.dailyFiberGoal || 30}g
                  </span>
                </div>
                <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${fiberPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/30 text-xs text-muted-foreground">
            <span>Burned Today: {today.workoutCalories || 0} kcal</span>
            <Link
              href="/diet"
              className="text-primary font-bold hover:underline"
            >
              Adjust Macro Goals &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ────────────────── QUICK LOG PANELS: WATER & SLEEP ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Water Log Panel */}
        <div className="glass-card p-5 rounded-3xl border border-border/50 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Hydration Station</h3>
                  <p className="text-xs text-muted-foreground">
                    Instant 1-tap logging &middot; zero page reload
                  </p>
                </div>
              </div>
              <div className="text-right text-xs ml-auto">
                <p className="text-muted-foreground">Today so far</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {waterLog.totalMl >= 1000
                    ? `${(waterLog.totalMl / 1000).toFixed(1)}L`
                    : `${waterLog.totalMl || 0}ml`}
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    / {(profile.waterGoalMl / 1000).toFixed(1)}L
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { ml: 150, label: "+150ml", hint: "Small Cup" },
                { ml: 250, label: "+250ml", hint: "Glass" },
                { ml: 500, label: "+500ml", hint: "Bottle" },
                { ml: 1000, label: "+1L", hint: "Large Bottle" },
              ].map((p) => (
                <Button
                  key={p.ml}
                  variant="outline"
                  disabled={waterAdding !== null}
                  onClick={() => handleQuickAddWater(p.ml)}
                  className="h-auto py-3 rounded-2xl flex-col gap-0.5 border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/40 min-h-[3.5rem]"
                >
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {p.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {p.hint}
                  </span>
                </Button>
              ))}
            </div>

            {/* Custom water amount input */}
            <div className="flex gap-2 items-center pt-1">
              <Input
                type="number"
                placeholder="Custom amount in ml (e.g. 350)"
                value={customWaterInput}
                onChange={(e) => setCustomWaterInput(e.target.value)}
                className="rounded-xl text-xs h-9"
              />
              <Button
                size="sm"
                disabled={!customWaterInput || Number(customWaterInput) <= 0}
                onClick={() => handleQuickAddWater(Number(customWaterInput))}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 shrink-0"
              >
                Add Water
              </Button>
            </div>
          </div>

          {/* Today's water entries timeline */}
          {waterLog.entries && waterLog.entries.length > 0 ? (
            <div className="pt-2 border-t border-border/30">
              <p className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Today&apos;s log &middot; {waterLog.entries.length} entr
                {waterLog.entries.length === 1 ? "y" : "ies"}
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {waterLog.entries.map(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (entry: any, idx: number) => (
                    <div
                      key={idx}
                      className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs"
                    >
                      <Clock className="w-3 h-3 text-blue-500/70" />
                      <span className="font-medium text-blue-700 dark:text-blue-300">
                        {entry.time}
                      </span>
                      <span className="text-muted-foreground">
                        {entry.amountMl >= 1000
                          ? `${(entry.amountMl / 1000).toFixed(1)}L`
                          : `${entry.amountMl}ml`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWaterEntry(idx)}
                        disabled={waterRemoving === idx}
                        className="ml-0.5 p-0.5 rounded-full text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Remove entry"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-border/30 text-xs text-muted-foreground italic text-center py-2">
              No water logged for this date. Tap a preset above to log! 💧
            </div>
          )}
        </div>

        {/* Quick Sleep Log Panel */}
        <div className="glass-card p-5 rounded-3xl border border-border/50 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Sleep &amp; Recovery</h3>
                  <p className="text-xs text-muted-foreground">
                    Tap a preset or track last night&apos;s duration
                  </p>
                </div>
              </div>
              <div className="text-right text-xs ml-auto">
                <p className="text-muted-foreground">Today so far</p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {sleepLog.totalHours || today.sleepHours || 0}h
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    {sleepLog.avgQuality
                      ? `(${sleepLog.avgQuality}/5 ★)`
                      : "/ 8h target"}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { hours: 6, label: "6 hrs", sleep: "23:00", wake: "05:00" },
                { hours: 7, label: "7 hrs", sleep: "23:00", wake: "06:00" },
                { hours: 7.5, label: "7.5 hrs", sleep: "23:00", wake: "06:30" },
                { hours: 8, label: "8 hrs", sleep: "23:00", wake: "07:00" },
              ].map((p) => (
                <Button
                  key={p.hours}
                  variant="outline"
                  disabled={sleepAdding !== null}
                  onClick={() =>
                    handleQuickAddSleep(p.hours, p.sleep, p.wake)
                  }
                  className="h-auto py-3 rounded-2xl flex-col gap-0.5 border-indigo-500/20 hover:bg-indigo-500/10 hover:border-indigo-500/40 min-h-[3.5rem]"
                >
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {p.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatTime12h(p.sleep)} - {formatTime12h(p.wake)}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Today's sleep sessions timeline */}
          {sleepLog.sessions && sleepLog.sessions.length > 0 ? (
            <div className="pt-2 border-t border-border/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Today&apos;s log &middot; {sleepLog.sessions.length} session
                  {sleepLog.sessions.length === 1 ? "" : "s"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuickLogAction("sleep");
                    setQuickLogOpen(true);
                  }}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  + Custom Session
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sleepLog.sessions.map(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (session: any, idx: number) => (
                    <div
                      key={idx}
                      className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs"
                    >
                      <Moon className="w-3 h-3 text-indigo-500/70" />
                      <span className="font-medium text-indigo-700 dark:text-indigo-300">
                        {formatTime12h(session.sleepTime)} &rarr;{" "}
                        {formatTime12h(session.wakeTime)}
                      </span>
                      <span className="font-bold text-foreground">
                        ({session.totalHours}h)
                      </span>
                      {session.quality && (
                        <span className="text-amber-500 font-semibold text-[10px] flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />
                          {session.quality}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveSleepSession(idx)}
                        disabled={sleepRemoving === idx}
                        className="ml-0.5 p-0.5 rounded-full text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Remove session"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground italic py-1">
              <span>No sleep logged for this date. Tap a preset above! 🌙</span>
              <button
                type="button"
                onClick={() => {
                  setQuickLogAction("sleep");
                  setQuickLogOpen(true);
                }}
                className="not-italic font-bold text-indigo-600 dark:text-indigo-400 hover:underline text-xs"
              >
                + Custom
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ────────────────── WORKOUTS & ACTIVITY CARD ────────────────── */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl border border-border/50 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Today&apos;s Workout Activity</h3>
              <p className="text-xs text-muted-foreground">
                Active minutes &amp; energy burned today
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {todayWorkoutPlan && !today.workoutDone ? (
              <Button
                size="sm"
                onClick={handleCompleteWorkoutPlan}
                disabled={planCompleting}
                className="rounded-xl text-xs font-bold gap-1 bg-amber-500 hover:bg-amber-600 text-white"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {planCompleting ? "Saving..." : "Complete Plan"}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setQuickWorkoutOpen(true)}
                className="rounded-xl text-xs font-bold gap-1 bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Plus className="w-3.5 h-3.5" /> Log Workout
              </Button>
            )}
            <Link href="/workout">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-amber-600 dark:text-amber-400"
              >
                Workouts &rarr;
              </Button>
            </Link>
          </div>
        </div>

        {todayWorkoutPlan && !today.workoutDone && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  {new Date(`${selectedDateStr}T12:00:00`).toLocaleDateString(
                    "en-US",
                    { weekday: "long" },
                  )}{" "}
                  Workout Plan
                </p>
                <h4 className="text-base font-black text-foreground mt-0.5">
                  {todayWorkoutPlan.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {todayWorkoutPlan.estimatedDurationMinutes} min &middot;{" "}
                  {todayWorkoutPlan.estimatedCaloriesBurned} kcal estimated by AI
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleCompleteWorkoutPlan}
                disabled={planCompleting}
                className="rounded-xl text-xs font-bold gap-1 bg-foreground text-background hover:bg-foreground/90"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {planCompleting ? "Saving..." : "Mark Complete"}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {todayWorkoutPlan.exercises.map(
                (
                  ex: {
                    _id?: string;
                    exerciseName: string;
                    sets: number;
                    reps: number;
                  },
                  idx: number,
                ) => (
                  <div
                    key={ex._id || `${ex.exerciseName}-${idx}`}
                    className="rounded-xl bg-background/80 border border-border/50 p-3"
                  >
                    <p className="text-sm font-bold truncate">{ex.exerciseName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ex.sets} sets &times; {ex.reps} reps
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {todayWorkouts && todayWorkouts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {todayWorkouts.map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (w: any) => (
                <div
                  key={w._id}
                  className="p-3.5 rounded-2xl bg-card border border-border/50 flex items-center justify-between group hover:border-amber-500/40 transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate text-foreground">
                      {w.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {w.durationMinutes} min &middot; {w.caloriesBurned} kcal
                      burned
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteWorkout(w._id)}
                    className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Delete workout"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-muted/20 border border-dashed border-border/50 text-center text-xs text-muted-foreground">
            No workout logged today. Tap &quot;+ Log Workout&quot; to track your exercise session! 💪
          </div>
        )}
      </div>

      {/* ────────────────── DAILY SCORE & SMART WEIGHT PREDICTION ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Score Card (0-100) */}
        <div className="glass-card p-5 rounded-3xl border border-border/50 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Daily Score</h3>
                <p className="text-[11px] text-muted-foreground">
                  Habit consistency score
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 ml-auto">
              {dailyScore?.gradeEmoji || "⚡"} {dailyScore?.grade || "Good"}
            </span>
          </div>

          <div className="flex items-center justify-around py-2">
            <ProgressRing
              value={dailyScore?.score || 0}
              size={110}
              strokeWidth={10}
              color="hsl(25, 95%, 53%)"
              label={`${dailyScore?.score || 0}`}
              sublabel="/ 100 pts"
            />

            <div className="space-y-1 text-xs">
              <p className="font-bold text-foreground">
                {dailyScore?.breakdown?.filter((b: { done: boolean }) => b.done)
                  .length || 0}{" "}
                of 6 Completed
              </p>
              <p className="text-[11px] text-muted-foreground max-w-[140px] leading-tight">
                Complete daily habits to boost your health score to 100!
              </p>
            </div>
          </div>

          {/* Habit breakdown checklist */}
          <div className="space-y-1.5 pt-2 border-t border-border/40 text-xs">
            {dailyScore?.breakdown?.map(
              (
                item: { label: string; done: boolean; points: number },
                idx: number,
              ) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/20 text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span
                      className={
                        item.done
                          ? "line-through text-muted-foreground"
                          : "font-medium"
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                  <span className="font-bold text-muted-foreground">
                    +{item.points}pts
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Smart Weight Prediction Card */}
        <div className="glass-card p-5 rounded-3xl border border-border/50 md:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    Smart Weight Prediction
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Linear regression forecast based on history
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ml-auto ${
                  weightPrediction?.isOnTrack
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                }`}
              >
                {weightPrediction?.isOnTrack ? "✅ On Track" : "📊 Needs Data"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/40">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                  Current Pace
                </p>
                <p className="text-lg font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                  {weightPrediction?.weeklyRate
                    ? `${weightPrediction.weeklyRate > 0 ? "+" : ""}${weightPrediction.weeklyRate} kg/wk`
                    : "0.0 kg/wk"}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border/40">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                  Estimated Goal Date
                </p>
                <p className="text-sm font-bold text-foreground mt-1 flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  {weightPrediction?.estimatedGoalDate
                    ? new Date(
                        weightPrediction.estimatedGoalDate,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Log more entries"}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border/40 col-span-2 sm:col-span-1">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                  Target Weight
                </p>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {profile.targetWeight} kg
                </p>
              </div>
            </div>

            {/* Motivational message banner */}
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-800 dark:text-purple-200">
              {weightPrediction?.motivationMessage ||
                "Log daily weight to unlock accurate goal date predictions!"}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuickLogAction("weight");
                setQuickLogOpen(true);
              }}
              className="text-xs font-bold rounded-xl"
            >
              + Log Today&apos;s Weight
            </Button>
            <Link href="/progress">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-purple-600 dark:text-purple-400 gap-1"
              >
                View Weight Chart &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ────────────────── CHARTS & DAILY HABITS ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Checklist */}
        <div className="glass-card p-6 rounded-3xl border border-border/50 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <h3 className="text-base font-bold">Daily Habit Checklist</h3>
            <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 ml-auto">
              {completedChecklistCount}/{checklist.length} Done
            </span>
          </div>

          <div className="space-y-2.5">
            {checklist.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/30 text-xs font-medium"
                >
                  <div className="flex items-center gap-3">
                    {item.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
                    )}
                    <span
                      className={
                        item.done ? "line-through text-muted-foreground" : ""
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                  <Icon className="w-4 h-4 text-muted-foreground/60" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Nutrition History Bar Chart */}
        <div className="glass-card p-6 rounded-3xl border border-border/50 md:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Weekly Nutrition History
              </h3>
              <p className="text-xs text-muted-foreground">
                Calories &amp; protein logged over the last 7 days
              </p>
            </div>
            <Link href="/analytics" className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary font-semibold"
              >
                Analytics &rarr;
              </Button>
            </Link>
          </div>

          <WeeklyNutritionChart data={charts.weeklyCalories} />
        </div>
      </div>

      {/* Weekly Weight Trend Line Chart */}
      <div className="glass-card p-6 rounded-3xl border border-border/50 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-purple-500" />
              Weekly Weight Trend
            </h3>
            <p className="text-xs text-muted-foreground">
              Monitor weight trajectory toward {profile.targetWeight}kg
            </p>
          </div>
          <Link href="/progress" className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-purple-600 dark:text-purple-400 font-semibold"
            >
              Weight Log &rarr;
            </Button>
          </Link>
        </div>

        {charts.weeklyWeight.length > 0 ? (
          <WeeklyWeightChart data={charts.weeklyWeight} />
        ) : (
          <div className="text-center py-12 text-xs text-muted-foreground">
            No weight logs recorded this week. Tap &quot;+ Log Weight&quot; to log today&apos;s weight!
          </div>
        )}
      </div>

      {/* Footer Ad Slot */}
      <AdUnit size="auto" maxWidth="970px" />
    </div>
  );
}
