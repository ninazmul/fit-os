"use client";

import { useState, useEffect, useCallback } from "react";
import { getDashboardData } from "@/lib/actions/dashboard.actions";
import {
  addWater,
  removeWaterEntry,
  getWaterLogForDate,
} from "@/lib/actions/water-sleep.actions";
import StatCard from "@/components/shared/StatCard";
import ProgressRing from "@/components/shared/ProgressRing";
import QuickActionModal from "@/components/shared/QuickActionModal";
import OnboardingModal from "@/components/shared/OnboardingModal";
import SearchModal from "@/components/shared/SearchModal";
import { DashboardSkeleton } from "@/components/shared/SkeletonLoaders";
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
import AdUnit from "@/components/shared/AdUnit";
import toast from "react-hot-toast";

export default function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [quickLogAction, setQuickLogAction] = useState<
    "meal" | "weight" | "water" | "workout"
  >("water");
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [waterLog, setWaterLog] = useState<any>({ entries: [], totalMl: 0 });
  const [waterAdding, setWaterAdding] = useState<number | null>(null);
  const [waterRemoving, setWaterRemoving] = useState<number | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchWater = useCallback(async () => {
    try {
      const w = await getWaterLogForDate(todayStr);
      setWaterLog(w);
    } catch (err) {
      console.error("Water log error:", err);
    }
  }, [todayStr]);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDashboardData();
      setData(res);
      if (res?.needsOnboarding) {
        setOnboardingOpen(true);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    await Promise.all([fetchDashboard(), fetchWater()]);
  }, [fetchDashboard, fetchWater]);

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
        <h2 className="text-xl font-bold">Welcome to FitOS</h2>
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

  const { profile, today, charts, streak, workoutDaysThisWeek } = data;

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

      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-border/50 relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-primary text-primary" /> {streak}{" "}
              Day Streak!
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Goal: {profile.goal.replace("_", " ")}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {profile.name}! 👋
          </h1>
          <p className="text-xs text-muted-foreground">
            You are {Math.abs(profile.currentWeight - profile.targetWeight)}kg
            away from your {profile.targetWeight}kg goal.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setSearchOpen(true)}
            className="rounded-xl gap-2 border-border/60 text-xs"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            Search Database
          </Button>

          <Button
            onClick={() => {
              setQuickLogAction("water");
              setQuickLogOpen(true);
            }}
            className="rounded-xl gap-2 bg-primary hover:bg-primary/90 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            Quick Log
          </Button>
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
            setQuickLogAction("water");
            setQuickLogOpen(true);
          }}
        />
      </div>

      {/* Quick Water Log Panel */}
      <div className="glass-card p-5 rounded-3xl border border-border/50 space-y-4">
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
          <div className="text-right text-xs">
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

      {/* Mid-page Ad Banner (above-the-fold high-fill placement) */}
      <AdUnit size="auto" label="Sponsored" maxWidth="970px" />

      {/* Rings & Nutrition Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Nutrition Ring Card */}
        <div className="glass-card p-6 rounded-3xl border border-border/50 flex flex-col items-center text-center justify-between">
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              Daily Calorie Budget
            </h3>
            <span className="text-xs text-muted-foreground font-semibold">
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Weekly Nutrition History
              </h3>
              <p className="text-xs text-muted-foreground">
                Calories & protein logged over the last 7 days
              </p>
            </div>
            <Link href="/analytics">
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
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Daily Habit Checklist</h3>
            <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
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
          <div className="flex items-center justify-between">
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
            <Link href="/progress">
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
