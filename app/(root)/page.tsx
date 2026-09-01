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
import { formatTime12h, getLocalDateString } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import dynamic from "next/dynamic";
import StatCard from "@/components/shared/StatCard";
import ProgressRing from "@/components/shared/ProgressRing";
import { DashboardSkeleton } from "@/components/shared/SkeletonLoaders";

const QuickActionModal = dynamic(
  () => import("@/components/shared/QuickActionModal"),
  { ssr: false },
);
const OnboardingModal = dynamic(
  () => import("@/components/shared/OnboardingModal"),
  { ssr: false },
);
const SearchModal = dynamic(() => import("@/components/shared/SearchModal"), {
  ssr: false,
});
const AdUnit = dynamic(() => import("@/components/shared/AdUnit"), {
  ssr: false,
});
import { Button } from "@/components/ui/button";
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
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Link from "next/link";
import toast from "react-hot-toast";

export default function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [quickLogAction, setQuickLogAction] = useState<
    "meal" | "weight" | "water" | "workout" | "sleep"
  >("water");
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [waterLog, setWaterLog] = useState<any>({ entries: [], totalMl: 0 });
  const [waterAdding, setWaterAdding] = useState<number | null>(null);
  const [waterRemoving, setWaterRemoving] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sleepLog, setSleepLog] = useState<any>({
    sessions: [],
    totalHours: 0,
    avgQuality: 0,
  });
  const [sleepAdding, setSleepAdding] = useState<number | null>(null);
  const [sleepRemoving, setSleepRemoving] = useState<number | null>(null);

  const todayStr = getLocalDateString();

  const fetchWater = useCallback(async () => {
    try {
      const w = await getWaterLogForDate(todayStr);
      setWaterLog(w);
    } catch (err) {
      console.error("Water log error:", err);
    }
  }, [todayStr]);

  const fetchSleep = useCallback(async () => {
    try {
      const s = await getSleepLogForDate(todayStr);
      setSleepLog(s);
    } catch (err) {
      console.error("Sleep log error:", err);
    }
  }, [todayStr]);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDashboardData(todayStr);
      setData(res);
      if (res?.needsOnboarding) {
        setOnboardingOpen(true);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  const fetchAll = useCallback(async () => {
    await Promise.all([fetchDashboard(), fetchWater(), fetchSleep()]);
  }, [fetchDashboard, fetchWater, fetchSleep]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleQuickAddWater = async (amountMl: number) => {
    try {
      setWaterAdding(amountMl);
      await addWater(amountMl, todayStr);
      toast.success(
        `Added ${amountMl >= 1000 ? `${amountMl / 1000}L` : `${amountMl}ml`} 💧`,
      );
      await Promise.all([fetchWater(), fetchDashboard()]);
    } catch {
      toast.error("Failed to log water");
    } finally {
      setWaterAdding(null);
    }
  };

  const handleRemoveWaterEntry = async (idx: number) => {
    try {
      setWaterRemoving(idx);
      await removeWaterEntry(idx, todayStr);
      toast.success("Water entry removed");
      await Promise.all([fetchWater(), fetchDashboard()]);
    } catch {
      toast.error("Failed to remove entry");
    } finally {
      setWaterRemoving(null);
    }
  };

  const handleQuickAddSleep = async (
    hours: number,
    sleepTime = "23:00",
    wakeTime = "07:00",
  ) => {
    try {
      setSleepAdding(hours);
      await addSleepSession({
        date: todayStr,
        sleepTime,
        wakeTime,
        totalHours: hours,
        quality: 4,
      });
      toast.success(`Logged ${hours}h sleep! 🌙`);
      await Promise.all([fetchSleep(), fetchDashboard()]);
    } catch {
      toast.error("Failed to log sleep");
    } finally {
      setSleepAdding(null);
    }
  };

  const handleRemoveSleepSession = async (idx: number) => {
    try {
      setSleepRemoving(idx);
      await removeSleepSession(idx, todayStr);
      toast.success("Sleep session removed");
      await Promise.all([fetchSleep(), fetchDashboard()]);
    } catch {
      toast.error("Failed to remove session");
    } finally {
      setSleepRemoving(null);
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
          className="mt-4 rounded-xl"
        >
          Start Onboarding
        </Button>
      </div>
    );
  }

  const {
    profile,
    today,
    charts,
    streak,
    workoutDaysThisWeek,
    todaysMission,
    dailyScore,
    weightPrediction,
  } = data;

  const caloriePct = Math.round(
    (today.calories / profile.dailyCaloriesGoal) * 100,
  );
  const proteinPct = Math.round(
    (today.protein / profile.dailyProteinGoal) * 100,
  );
  const waterPct = Math.round((today.waterMl / profile.waterGoalMl) * 100);

  const checklist = [
    {
      label: "Drink Water Goal",
      done: today.waterMl >= profile.waterGoalMl,
      icon: Droplet,
    },
    { label: "Log Meals", done: today.mealCount > 0, icon: UtensilsCrossed },
    { label: "Hit Workout Target", done: today.workoutDone, icon: Dumbbell },
    { label: "Log Daily Weight", done: today.weight > 0, icon: Scale },
    { label: "Log Sleep Hours", done: today.sleepHours !== null, icon: Moon },
  ];

  const completedChecklistCount = checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-6">
      {/* Search & Modals */}
      <OnboardingModal
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        initialData={profile}
      />
      <QuickActionModal
        open={quickLogOpen}
        onOpenChange={setQuickLogOpen}
        defaultAction={quickLogAction}
      />
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Hero Section: Today's Mission (⭐⭐⭐⭐⭐ Phase 1) */}
      <div className="glass-card p-6 rounded-3xl border border-primary/20 relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-emerald-500/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white flex items-center gap-1 shadow-sm">
                <Compass className="w-3.5 h-3.5" /> Today&apos;s Mission
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-current" /> {streak} Day Streak
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Target: {profile.targetWeight} kg (
                {profile.goal.replace("_", " ")})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {todaysMission?.greetingTime || "Welcome back"}, {profile.name}!
              👋
            </h1>

            <div className="p-3.5 rounded-2xl bg-background/80 border border-border/50 backdrop-blur-md">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                Recommended Action
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5">
                {todaysMission?.primaryMission ||
                  "Log your daily progress to stay on track!"}
              </p>
            </div>

            {/* Dynamic remaining budgets */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                🔥 {todaysMission?.remainingCalories || 0} kcal left
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                🥩 {todaysMission?.remainingProtein || 0}g protein left
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                💧{" "}
                {todaysMission?.remainingWaterMl
                  ? `${(todaysMission.remainingWaterMl / 1000).toFixed(1)}L`
                  : "0L"}{" "}
                water left
              </div>
            </div>
          </div>

          {/* Quick Action Hero Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <Button
              onClick={() => {
                if (todaysMission?.missionAction === "meal") {
                  setSearchOpen(true);
                } else {
                  setQuickLogAction(todaysMission?.missionAction || "water");
                  setQuickLogOpen(true);
                }
              }}
              className="rounded-2xl gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-6 px-6 shadow-md text-sm"
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
              onClick={() => setSearchOpen(true)}
              className="rounded-2xl gap-2 border-border/60 text-xs font-semibold py-5"
            >
              <Search className="w-4 h-4 text-muted-foreground" />
              Browse BD Foods
            </Button>
          </div>
        </div>
      </div>

      {/* AI Intelligence Spotlight Banner */}
      <div className="glass-card p-4 rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/10 via-purple-500/10 to-emerald-500/10 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary font-heading">
                Gemini AI Intelligence
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                Live Coaching
              </span>
            </div>
            <p className="text-xs font-bold text-foreground mt-0.5">
              Personalized macro pacing, goal trajectory & health advice is active.
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

      {/* Daily Score & Smart Weight Prediction Grid (⭐⭐⭐⭐⭐ Phase 1) */}
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

        {/* Smart Weight Prediction Card (⭐⭐⭐⭐ Phase 1) */}
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
                  <Calendar className="w-4 h-4 text-primary" />
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

          <div className="flex justify-end pt-2 border-t border-border/30">
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

      {/* Overview Metric Cards Grid */}
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
          title="Today's Calories"
          value={today.calories}
          unit="kcal"
          subtitle={`Target: ${profile.dailyCaloriesGoal}`}
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
        />

        <StatCard
          title="Sleep Duration"
          value={today.sleepHours ? `${today.sleepHours}h` : "Not logged"}
          subtitle={
            today.sleepQuality
              ? `Quality: ${today.sleepQuality}/5`
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

      {/* Quick Log Panels: Water & Sleep */}
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
                  <h3 className="text-base font-bold">Quick Water Log</h3>
                  <p className="text-xs text-muted-foreground">
                    Tap a button to log instantly &mdash; no typing required
                  </p>
                </div>
              </div>
              <div className="text-right text-xs ml-auto">
                <p className="text-muted-foreground">Today so far</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {waterLog.totalMl >= 1000
                    ? `${(waterLog.totalMl / 1000).toFixed(1)}L`
                    : `${waterLog.totalMl}ml`}
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    / {(profile.waterGoalMl / 1000).toFixed(1)}L
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { ml: 150, label: "Sip", hint: "Small cup" },
                { ml: 250, label: "+250ml", hint: "Glass" },
                { ml: 500, label: "+500ml", hint: "Bottle" },
                { ml: 1000, label: "+1L", hint: "Large bottle" },
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
          </div>

          {/* Today's water entries timeline */}
          {waterLog.entries && waterLog.entries.length > 0 ? (
            <div className="pt-2 border-t border-border/30">
              <p className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Today&apos;s log &middot; {waterLog.entries.length} entr
                {waterLog.entries.length === 1 ? "y" : "ies"}
              </p>
              <div className="flex flex-wrap gap-1.5">
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
              No water logged today. Tap a button above to get started! 💧
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
                  <h3 className="text-base font-bold">Quick Sleep Log</h3>
                  <p className="text-xs text-muted-foreground">
                    Tap a preset or track last night&apos;s sleep duration
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
              ].map((p) => {
                return (
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
                );
              })}
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
              <span>No sleep logged today. Tap a preset above! 🌙</span>
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

      {/* Mid-page Ad Banner (above-the-fold high-fill placement) */}
      <AdUnit size="auto" label="Sponsored" maxWidth="970px" />

      {/* Rings & Nutrition Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Nutrition Ring Card */}
        <div className="glass-card p-6 rounded-3xl border border-border/50 flex flex-col items-center text-center justify-between">
          <div className="w-full flex flex-wrap items-center justify-between gap-1.5 mb-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              Daily Calorie Budget
            </h3>
            <span className="text-xs text-muted-foreground font-semibold ml-auto">
              {Math.max(0, profile.dailyCaloriesGoal - today.calories)} kcal
              left
            </span>
          </div>

          <ProgressRing
            value={caloriePct}
            size={160}
            strokeWidth={14}
            color="hsl(25, 95%, 53%)"
            label={`${today.calories}`}
            sublabel={`of ${profile.dailyCaloriesGoal} kcal`}
          />

          <div className="grid grid-cols-3 gap-2 w-full mt-6 pt-4 border-t border-border/50 text-xs">
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

        {/* Weekly Calories Bar Chart */}
        <div className="glass-card p-6 rounded-3xl border border-border/50 md:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Weekly Nutrition History
              </h3>
              <p className="text-xs text-muted-foreground">
                Calories & protein logged over the last 7 days
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

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.weeklyCalories}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.15}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--chart-tooltip-bg)",
                    borderColor: "var(--chart-tooltip-border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="calories"
                  fill="hsl(152, 58%, 42%)"
                  radius={[6, 6, 0, 0]}
                  name="Calories (kcal)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Checklist & Quick Links */}
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

        {/* Weight Trend Line Chart */}
        <div className="glass-card p-6 rounded-3xl border border-border/50 md:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-purple-500" />
                Weekly Weight Trend
              </h3>
              <p className="text-xs text-muted-foreground">
                Log daily weight to monitor trajectory toward{" "}
                {profile.targetWeight}kg
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
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={charts.weeklyWeight}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.15}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    domain={["dataMin - 1", "dataMax + 1"]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--chart-tooltip-bg)",
                      borderColor: "var(--chart-tooltip-border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#weightGrad)"
                    name="Weight (kg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-muted-foreground">
              No weight logs recorded this week. Tap &quot;Quick Log&quot; to
              log today&apos;s weight!
            </div>
          )}
        </div>
      </div>

      {/* Footer Ad Slot */}
      <AdUnit size="auto" maxWidth="970px" />
    </div>
  );
}
