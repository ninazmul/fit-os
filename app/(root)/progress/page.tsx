"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getWeightHistory,
  getWeightStats,
  logWeight,
} from "@/lib/actions/weight.actions";
import { getBodyMeasurements } from "@/lib/actions/body-measurement.actions";
import {
  getSleepHistory,
  addSleepSession,
  removeSleepSession,
} from "@/lib/actions/water-sleep.actions";
import { getUserProfile } from "@/lib/actions/profile.actions";
import {
  generateAIProgressAudit,
  type AIProgressAuditData,
} from "@/lib/actions/ai-progress.actions";
import StatCard from "@/components/shared/StatCard";
import BodyMeasurementModal from "@/components/shared/BodyMeasurementModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  TrendingUp,
  Scale,
  Plus,
  Trash2,
  Calendar,
  Award,
  Moon,
  Star,
  Clock,
  RefreshCw,
  Target,
  Dumbbell,
  ChevronRight,
  Sparkles,
  Activity,
} from "lucide-react";
import { formatTime12h, getLocalDateString } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Bar,
} from "recharts";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

const AdUnit = dynamic(() => import("@/components/shared/AdUnit"), {
  ssr: false,
});

type SleepLogItem = Partial<{
  clerkId: string;
  _id: string;
  sleepTime: string;
  wakeTime: string;
  totalHours: number | string;
  quality: number | string;
  notes: string;
}> & {
  date: string;
  sessions: {
    sleepTime: string;
    wakeTime: string;
    totalHours: number;
    quality: number;
    notes?: string;
  }[];
  totalHours: number;
  avgQuality: number;
};

export default function ProgressPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [weightStats, setWeightStats] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLogItem[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [, setLoading] = useState(true);
  const [aiProgressData, setAiProgressData] = useState<AIProgressAuditData | null>(null);
  const [aiProgressLoading, setAiProgressLoading] = useState(false);

  // Weight dialog
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [weightVal, setWeightVal] = useState("");
  const [weightNotes, setWeightNotes] = useState("");

  // Body measurement dialog
  const [bodyModalOpen, setBodyModalOpen] = useState(false);

  // Sleep session dialog
  const [sleepModalOpen, setSleepModalOpen] = useState(false);
  const [sleepTime, setSleepTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [totalHours, setTotalHours] = useState<number>(8);
  const [quality, setQuality] = useState<number>(4);
  const [sleepNotes, setSleepNotes] = useState("");
  const [sleepRemoving, setSleepRemoving] = useState<string | null>(null);

  const todayStr = getLocalDateString();

  const sleepSessionHours = (h: string, w: string) => {
    try {
      const [hh1, mm1] = h.split(":").map(Number);
      const [hh2, mm2] = w.split(":").map(Number);
      let mins = hh2 * 60 + mm2 - (hh1 * 60 + mm1);
      if (mins <= 0) mins += 24 * 60; // overnight
      return Math.round((mins / 60) * 10) / 10;
    } catch {
      return 8;
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [wHist, wStats, mList, sLogs, userProf, aiAudit] = await Promise.all([
        getWeightHistory(60),
        getWeightStats(),
        getBodyMeasurements(10),
        getSleepHistory(14),
        getUserProfile(),
        generateAIProgressAudit(),
      ]);
      setWeightHistory(wHist);
      setWeightStats(wStats);
      setMeasurements(mList);
      setSleepLogs(sLogs);
      setProfile(userProf);
      setAiProgressData(aiAudit);
    } catch (err) {
      console.error("Error loading progress:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAIProgress = async () => {
    try {
      setAiProgressLoading(true);
      const aiAudit = await generateAIProgressAudit();
      setAiProgressData(aiAudit);
    } catch {
      // silent fail — keep previous data
    } finally {
      setAiProgressLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightVal) return;
    try {
      await logWeight({
        date: todayStr,
        weight: Number(weightVal),
        notes: weightNotes,
      });
      toast.success("Weight logged!");
      setWeightModalOpen(false);
      setWeightVal("");
      setWeightNotes("");
      fetchData();
    } catch {
      toast.error("Failed to log weight");
    }
  };

  const handleSaveSleep = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const hours =
        totalHours > 0 ? totalHours : sleepSessionHours(sleepTime, wakeTime);
      await addSleepSession({
        date: todayStr,
        sleepTime,
        wakeTime,
        totalHours: hours,
        quality,
        notes: sleepNotes,
      });
      toast.success("Sleep session logged! 🌙");
      setSleepModalOpen(false);
      setSleepNotes("");
      fetchData();
    } catch {
      toast.error("Failed to save sleep session");
    }
  };

  const handleRemoveSleepSession = async (
    date: string,
    sessionIndex: number,
  ) => {
    try {
      setSleepRemoving(`${date}-${sessionIndex}`);
      await removeSleepSession(sessionIndex, date);
      toast.success("Sleep session removed");
      fetchData();
    } catch {
      toast.error("Failed to remove session");
    } finally {
      setSleepRemoving(null);
    }
  };



  useEffect(() => {
    if (sleepTime && wakeTime) {
      const hours = sleepSessionHours(sleepTime, wakeTime);
      setTotalHours(hours);
    }
  }, [sleepTime, wakeTime]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sleepChartData = sleepLogs.map((log: any) => ({
    date: log.date,
    totalHours: Number(log.totalHours) || 0,
    sessions: (log.sessions?.length ?? 0) as number,
    avgQuality: Number(log.avgQuality) || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Progress & Body Analytics
          </h1>
          <p className="text-xs text-muted-foreground">
            AI-powered weight trajectory, body recomposition, and sleep recovery analysis
          </p>
        </div>
        <Button
          onClick={refreshAIProgress}
          size="sm"
          disabled={aiProgressLoading}
          className="rounded-xl gap-1.5 text-xs font-bold bg-primary hover:bg-primary/90"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${aiProgressLoading ? "animate-spin" : ""}`} />
          {aiProgressLoading ? "Analysing…" : "✨ Refresh AI Audit"}
        </Button>
      </div>

      {/* AI Progress Banner */}
      {aiProgressData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Trajectory Card */}
          <div className="glass-card p-5 rounded-3xl border border-primary/20 space-y-3 md:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Goal Trajectory
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                aiProgressData.trajectory.plateauRisk === "Low"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : aiProgressData.trajectory.plateauRisk === "Moderate"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-red-500/15 text-red-600 dark:text-red-400"
              }`}>
                {aiProgressData.trajectory.plateauRisk} Plateau Risk
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-end gap-1">
                <span className="text-2xl font-black">
                  {aiProgressData.trajectory.weeklyVelocityKg > 0 ? "+" : ""}
                  {aiProgressData.trajectory.weeklyVelocityKg} kg
                </span>
                <span className="text-xs text-muted-foreground pb-0.5">/week</span>
              </div>
              {aiProgressData.trajectory.daysToGoal && (
                <p className="text-[11px] text-muted-foreground">
                  Est. goal in <span className="font-bold text-primary">{aiProgressData.trajectory.daysToGoal} days</span>
                  {aiProgressData.trajectory.predictedGoalDate && ` (${aiProgressData.trajectory.predictedGoalDate})`}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground leading-relaxed">{aiProgressData.trajectory.assessment}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-2.5 text-[11px] text-muted-foreground border border-border/30">
              💡 {aiProgressData.trajectory.advice}
            </div>
            {aiProgressData.isAIGenerated && (
              <span className="text-[10px] flex items-center gap-1 text-primary/70">
                <Sparkles className="w-2.5 h-2.5" /> Gemini AI · {aiProgressData.trajectory.confidencePct}% confidence
              </span>
            )}
          </div>

          {/* Recomposition Card */}
          <div className="glass-card p-5 rounded-3xl border border-purple-500/20 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-purple-500" /> Body Recomposition
            </h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                aiProgressData.recomposition.status === "Active Recomposition"
                  ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                  : aiProgressData.recomposition.status === "Fat Loss Primed"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              }`}>
                {aiProgressData.recomposition.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-muted/40 text-center">
                <p className="text-muted-foreground text-[10px]">Waist</p>
                <p className={`font-bold ${aiProgressData.recomposition.waistTrendCm < 0 ? "text-emerald-500" : aiProgressData.recomposition.waistTrendCm > 0 ? "text-red-400" : "text-muted-foreground"}`}>
                  {aiProgressData.recomposition.waistTrendCm > 0 ? "+" : ""}{aiProgressData.recomposition.waistTrendCm} cm
                </p>
              </div>
              <div className="p-2 rounded-xl bg-muted/40 text-center">
                <p className="text-muted-foreground text-[10px]">Chest</p>
                <p className={`font-bold ${aiProgressData.recomposition.chestTrendCm > 0 ? "text-emerald-500" : "text-muted-foreground"}`}>
                  {aiProgressData.recomposition.chestTrendCm > 0 ? "+" : ""}{aiProgressData.recomposition.chestTrendCm} cm
                </p>
              </div>
              <div className="p-2 rounded-xl bg-muted/40 text-center">
                <p className="text-muted-foreground text-[10px]">Hip</p>
                <p className="font-bold">
                  {aiProgressData.recomposition.hipTrendCm > 0 ? "+" : ""}{aiProgressData.recomposition.hipTrendCm} cm
                </p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{aiProgressData.recomposition.summary}</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Muscle Retention Score</span>
                <span className="font-bold">{aiProgressData.recomposition.muscleRetentionScore}/100</span>
              </div>
              <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-primary rounded-full transition-all duration-700"
                  style={{ width: `${aiProgressData.recomposition.muscleRetentionScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recovery Index Card */}
          <div className="glass-card p-5 rounded-3xl border border-blue-500/20 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Moon className="w-4 h-4 text-blue-500" /> Recovery Index
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" strokeWidth="10" className="stroke-muted/30" />
                  <circle
                    cx="50" cy="50" r="38" fill="none" strokeWidth="10"
                    stroke={aiProgressData.recoveryIndex.score >= 80 ? "#10b981" : aiProgressData.recoveryIndex.score >= 60 ? "#f59e0b" : "#ef4444"}
                    strokeDasharray={2 * Math.PI * 38}
                    strokeDashoffset={(2 * Math.PI * 38) * (1 - aiProgressData.recoveryIndex.score / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-black">{aiProgressData.recoveryIndex.score}</span>
                </div>
              </div>
              <div>
                <p className={`text-xs font-bold ${
                  aiProgressData.recoveryIndex.score >= 80 ? "text-emerald-600 dark:text-emerald-400" :
                  aiProgressData.recoveryIndex.score >= 60 ? "text-amber-600 dark:text-amber-400" :
                  "text-red-600 dark:text-red-400"
                }`}>{aiProgressData.recoveryIndex.readiness}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Recovery Score</p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{aiProgressData.recoveryIndex.sleepToWorkoutCorrelation}</p>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-2.5 text-[11px] text-blue-700 dark:text-blue-300">
              💤 {aiProgressData.recoveryIndex.actionTip}
            </div>
          </div>
        </div>
      )}

      {/* AI Milestones */}
      {aiProgressData && aiProgressData.milestones.length > 0 && (
        <div className="glass-card p-5 rounded-3xl border border-border/50 space-y-4">
          <h2 className="font-bold text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" /> Goal Milestones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiProgressData.milestones.map((m: { title: string; current: string; target: string; progressPct: number; projectedDate: string }, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[11px] truncate">{m.title}</span>
                  <span className="font-black text-primary text-[11px] ml-2 flex-shrink-0">{m.progressPct}%</span>
                </div>
                <div className="w-full h-2 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-700"
                    style={{ width: `${m.progressPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Now: {m.current}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Target: {m.target}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Est: {m.projectedDate}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Current Weight"
          value={weightStats?.todayWeight || profile?.currentWeight || "--"}
          unit="kg"
          subtitle={`Goal: ${profile?.targetWeight || "--"} kg`}
          icon={Scale}
          variant="purple"
        />

        <StatCard
          title="BMI"
          value={weightStats?.bmi || "--"}
          subtitle={
            weightStats?.bmi < 18.5
              ? "Underweight"
              : weightStats?.bmi < 25
                ? "Normal Weight ✅"
                : "Overweight"
          }
          icon={Award}
          variant="green"
        />

        <StatCard
          title="Weekly Change"
          value={
            weightStats?.weeklyChange !== null &&
            weightStats?.weeklyChange !== undefined
              ? `${weightStats.weeklyChange > 0 ? "+" : ""}${weightStats.weeklyChange}`
              : "--"
          }
          unit="kg"
          subtitle="Past 7 days"
          icon={TrendingUp}
          variant="blue"
        />

        <StatCard
          title="Monthly Change"
          value={
            weightStats?.monthlyChange !== null &&
            weightStats?.monthlyChange !== undefined
              ? `${weightStats.monthlyChange > 0 ? "+" : ""}${weightStats.monthlyChange}`
              : "--"
          }
          unit="kg"
          subtitle="Past 30 days"
          icon={Calendar}
          variant="orange"
        />
      </div>

      {/* Mid-page Ad */}
      <AdUnit size="auto" label="Sponsored" maxWidth="970px" />

      {/* Tabs */}
      <Tabs defaultValue="weight" className="space-y-4">
        <TabsList className="glass-card border border-border/50 p-1 rounded-2xl">
          <TabsTrigger
            value="weight"
            className="rounded-xl text-xs font-semibold"
          >
            Weight Trend
          </TabsTrigger>
          <TabsTrigger
            value="body"
            className="rounded-xl text-xs font-semibold"
          >
            Body Measurements
          </TabsTrigger>
          <TabsTrigger
            value="sleep"
            className="rounded-xl text-xs font-semibold"
          >
            Sleep Log
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Weight */}
        <TabsContent value="weight" className="space-y-5">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <h2 className="text-lg font-bold">Weight Journey</h2>
            <Button
              onClick={() => setWeightModalOpen(true)}
              className="rounded-xl gap-2 text-xs bg-primary hover:bg-primary/90 font-bold ml-auto"
            >
              <Plus className="w-4 h-4" />
              Log Weight
            </Button>
          </div>

          {/* Journey Rail: Start → Now → Target */}
          {(() => {
            const startW = weightHistory.length > 0 ? Number(weightHistory[0]?.weight) : null;
            const currentW = weightHistory.length > 0 ? Number(weightHistory[weightHistory.length - 1]?.weight) : Number(profile?.currentWeight) || null;
            const targetW = profile?.targetWeight ? Number(profile.targetWeight) : null;
            if (!startW || !currentW || !targetW) return null;

            const totalChange = startW - targetW; // positive = weight loss goal
            const achieved = startW - currentW;
            const isLoss = totalChange > 0;
            const pct = totalChange !== 0 ? Math.min(100, Math.max(0, Math.round((Math.abs(achieved) / Math.abs(totalChange)) * 100))) : 0;
            const remaining = Math.abs(currentW - targetW);
            const atGoal = currentW === targetW;

            return (
              <div className="glass-card p-5 rounded-3xl border border-primary/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Progress to Goal
                  </h3>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    atGoal ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : pct >= 75 ? "bg-primary/15 text-primary"
                    : pct >= 40 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "bg-muted text-muted-foreground"
                  }`}>
                    {atGoal ? "🎉 Goal Reached!" : `${pct}% complete`}
                  </span>
                </div>

                {/* Rail */}
                <div className="relative">
                  <div className="flex items-center justify-between text-[11px] font-semibold mb-2">
                    <span className="text-muted-foreground">Start<br /><span className="text-base font-black text-foreground">{startW} kg</span></span>
                    <span className="text-center text-primary">Now<br /><span className="text-base font-black">{currentW} kg</span></span>
                    <span className="text-right text-muted-foreground">Target<br /><span className="text-base font-black text-foreground">{targetW} kg</span></span>
                  </div>
                  <div className="relative h-3 bg-muted/40 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-primary via-emerald-400 to-emerald-500"
                      style={{ width: `${pct}%` }}
                    />
                    {/* Current marker */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-primary shadow-lg shadow-primary/30 transition-all duration-700"
                      style={{ left: `calc(${pct}% - 8px)` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2">
                    <span>{isLoss ? `Lost ${Math.abs(achieved).toFixed(1)} kg` : `Gained ${Math.abs(achieved).toFixed(1)} kg`}</span>
                    <span>{remaining.toFixed(1)} kg {isLoss ? "to lose" : "to gain"}</span>
                  </div>
                </div>

                {/* Mini milestone chips */}
                <div className="flex flex-wrap gap-2">
                  {[25, 50, 75, 100].map((milestone) => (
                    <span
                      key={milestone}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                        pct >= milestone
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-muted/30 border-border/30 text-muted-foreground"
                      }`}
                    >
                      {pct >= milestone ? "✓" : ""} {milestone}% milestone
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Chart */}
          <div className="glass-card p-6 rounded-3xl border border-border/50 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">Weight over time (kg)</p>
              {profile?.targetWeight && (
                <span className="text-[10px] flex items-center gap-1 text-muted-foreground">
                  <span className="inline-block w-4 border-t-2 border-dashed border-amber-400" /> Target {profile.targetWeight} kg
                </span>
              )}
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weightHistory}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22a065" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22a065" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={(() => {
                      const weights = weightHistory.map((w) => Number(w.weight));
                      const target = profile?.targetWeight ? Number(profile.targetWeight) : null;
                      const min = Math.min(...weights, target ?? Infinity);
                      const max = Math.max(...weights, target ?? -Infinity);
                      return [Math.floor(min) - 2, Math.ceil(max) + 2];
                    })()}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--chart-tooltip-bg)",
                      borderColor: "var(--chart-tooltip-border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [`${value} kg`, "Weight"]}
                  />
                  {profile?.targetWeight && (
                    <ReferenceLine
                      y={Number(profile.targetWeight)}
                      stroke="#f59e0b"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{ value: `Target ${profile.targetWeight} kg`, position: "insideTopRight", fontSize: 10, fill: "#f59e0b" }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#22a065"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#weightAreaGrad)"
                    name="Weight (kg)"
                    dot={{ fill: "#22a065", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#22a065" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rich history table */}
          {weightHistory.length > 0 && (
            <div className="glass-card p-5 rounded-3xl border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Log History</h3>
                <span className="text-[10px] text-muted-foreground">{weightHistory.length} entries</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left text-muted-foreground font-semibold pb-2.5 pr-3">Date</th>
                      <th className="text-left text-muted-foreground font-semibold pb-2.5 pr-3">Weight</th>
                      <th className="text-left text-muted-foreground font-semibold pb-2.5 pr-3">Change</th>
                      <th className="text-left text-muted-foreground font-semibold pb-2.5 pr-3">vs Target</th>
                      <th className="text-left text-muted-foreground font-semibold pb-2.5">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...weightHistory].reverse().map((w, idx, arr) => {
                      const prev = arr[idx + 1];
                      const delta = prev ? Number(w.weight) - Number(prev.weight) : null;
                      const targetW = profile?.targetWeight ? Number(profile.targetWeight) : null;
                      const vsTarget = targetW !== null ? Number(w.weight) - targetW : null;
                      const isGoalLoss = targetW !== null && (weightHistory[0] ? Number(weightHistory[0].weight) > targetW : false);
                      return (
                        <tr
                          key={w._id}
                          className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors group"
                        >
                          <td className="py-2.5 pr-3 font-medium text-muted-foreground whitespace-nowrap">{w.date}</td>
                          <td className="py-2.5 pr-3">
                            <span className="font-black text-sm text-foreground">{w.weight} kg</span>
                          </td>
                          <td className="py-2.5 pr-3">
                            {delta !== null ? (
                              <span className={`inline-flex items-center gap-0.5 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                                delta < 0
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  : delta > 0
                                  ? "bg-red-500/15 text-red-500"
                                  : "bg-muted/40 text-muted-foreground"
                              }`}>
                                {delta < 0 ? "▼" : delta > 0 ? "▲" : "—"}
                                {delta !== 0 ? ` ${Math.abs(delta).toFixed(1)} kg` : " same"}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">start</span>
                            )}
                          </td>
                          <td className="py-2.5 pr-3">
                            {vsTarget !== null ? (
                              <span className={`text-[10px] font-semibold ${
                                (isGoalLoss ? vsTarget <= 0 : vsTarget >= 0)
                                  ? "text-emerald-500"
                                  : "text-muted-foreground"
                              }`}>
                                {vsTarget === 0 ? "✓ On target" : `${vsTarget > 0 ? "+" : ""}${vsTarget.toFixed(1)} kg`}
                              </span>
                            ) : "—"}
                          </td>
                          <td className="py-2.5 text-muted-foreground italic max-w-[120px] truncate">
                            {w.notes || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Body Measurements */}
        <TabsContent value="body" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Body Circumferences</h2>
            <Button
              onClick={() => setBodyModalOpen(true)}
              className="rounded-xl gap-2 text-xs bg-primary hover:bg-primary/90 font-bold"
            >
              <Plus className="w-4 h-4" />
              Log Measurements
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {measurements.map((m) => (
              <div
                key={m._id}
                className="glass-card p-5 rounded-3xl border border-border/50 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="font-bold text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" /> {m.date}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  {m.waist && (
                    <div className="p-2 rounded-xl bg-muted/40">
                      <p className="text-muted-foreground text-[10px]">Waist</p>
                      <p className="font-bold text-sm">{m.waist} cm</p>
                    </div>
                  )}
                  {m.chest && (
                    <div className="p-2 rounded-xl bg-muted/40">
                      <p className="text-muted-foreground text-[10px]">Chest</p>
                      <p className="font-bold text-sm">{m.chest} cm</p>
                    </div>
                  )}
                  {m.hip && (
                    <div className="p-2 rounded-xl bg-muted/40">
                      <p className="text-muted-foreground text-[10px]">Hip</p>
                      <p className="font-bold text-sm">{m.hip} cm</p>
                    </div>
                  )}
                  {m.arm && (
                    <div className="p-2 rounded-xl bg-muted/40">
                      <p className="text-muted-foreground text-[10px]">Arm</p>
                      <p className="font-bold text-sm">{m.arm} cm</p>
                    </div>
                  )}
                  {m.thigh && (
                    <div className="p-2 rounded-xl bg-muted/40">
                      <p className="text-muted-foreground text-[10px]">Thigh</p>
                      <p className="font-bold text-sm">{m.thigh} cm</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Sleep Log */}
        <TabsContent value="sleep" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Sleep Tracker History</h2>
            <Button
              onClick={() => setSleepModalOpen(true)}
              className="rounded-xl gap-2 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              <Plus className="w-4 h-4" />
              Add Sleep Session
            </Button>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-border/50">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sleepChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.15}
                  />
                  <XAxis
                    dataKey="date"
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
                    dataKey="totalHours"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                    name="Sleep (hours)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sleep sessions list (per day) */}
          <div className="space-y-3">
            {sleepLogs.length === 0 && (
              <div className="glass-card p-8 rounded-3xl border border-border/50 text-center text-xs text-muted-foreground italic">
                No sleep logs yet. Add a sleep session to start tracking! 🌙
              </div>
            )}
            {sleepLogs
              .slice()
              .reverse()
              .map((log) => {
                const sessions = Array.isArray(log.sessions)
                  ? log.sessions
                  : [];
                // Legacy backward: old docs have fields directly on log
                const displaySessions = sessions.length
                  ? sessions
                  : log.sleepTime
                    ? [
                        {
                          sleepTime: log.sleepTime,
                          wakeTime: log.wakeTime,
                          totalHours: Number(log.totalHours) || 0,
                          quality: Number(log.quality) || 3,
                          notes: log.notes || "",
                        },
                      ]
                    : [];

                return (
                  <div
                    key={log._id}
                    className="glass-card p-5 rounded-3xl border border-border/50 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-border/30 pb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span className="font-bold text-sm">{log.date}</span>
                      </div>
                      <div className="text-right text-xs">
                        <p className="font-bold text-purple-600 dark:text-purple-400">
                          {Number(log.totalHours) || 0}h total
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          {displaySessions.length} session
                          {displaySessions.length !== 1 ? "s" : ""}
                          {Number(log.avgQuality) > 0 &&
                            ` · Avg quality ${Number(log.avgQuality)}/5`}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {displaySessions.map(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (ses: any, sIdx: number) => (
                          <div
                            key={sIdx}
                            className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/20 text-xs"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 mt-0.5">
                                <Moon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                  <p className="font-semibold text-sm">
                                    {formatTime12h(ses.sleepTime)} &rarr;{" "}
                                    {formatTime12h(ses.wakeTime)}
                                  </p>
                                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                    {ses.totalHours}h
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < (ses.quality || 0)
                                            ? "text-amber-400 fill-amber-400"
                                            : "text-muted-foreground/20"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  {ses.notes && (
                                    <p className="text-[11px] text-muted-foreground">
                                      &middot; {ses.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            {Array.isArray(log.sessions) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleRemoveSleepSession(log.date, sIdx)
                                }
                                disabled={
                                  sleepRemoving === `${log.date}-${sIdx}`
                                }
                                className="h-7 w-7 text-muted-foreground hover:text-red-500 rounded-lg flex-shrink-0"
                                title="Remove this session"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Log Weight Dialog */}
      <Dialog open={weightModalOpen} onOpenChange={setWeightModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Log Today&apos;s Weight ⚖️
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveWeight} className="space-y-3 text-xs">
            <div>
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g. 72.5"
                value={weightVal}
                onChange={(e) => setWeightVal(e.target.value)}
                required
                className="rounded-xl font-bold text-base mt-1"
              />
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Input
                placeholder="e.g. After morning workout"
                value={weightNotes}
                onChange={(e) => setWeightNotes(e.target.value)}
                className="rounded-xl mt-1"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl bg-primary hover:bg-primary/90 font-bold"
            >
              Save Weight
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Log Body Measurements Dialog */}
      <BodyMeasurementModal
        open={bodyModalOpen}
        onOpenChange={setBodyModalOpen}
        initialData={measurements[0]}
        onSuccess={fetchData}
      />

      {/* Log Sleep Dialog */}
      <Dialog open={sleepModalOpen} onOpenChange={setSleepModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Add Sleep Session 🌙
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Log overnight sleep, naps, or any rest period. Multiple sessions
              per day supported.
            </p>
          </DialogHeader>
          <form onSubmit={handleSaveSleep} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Sleep Time</Label>
                <Input
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label>Wake Time</Label>
                <Input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Total Hours (auto-calculated)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={totalHours}
                  onChange={(e) => setTotalHours(Number(e.target.value))}
                  className="rounded-xl mt-1 font-bold"
                />
              </div>
              <div>
                <Label>Quality Rating (1-5)</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="rounded-xl mt-1 font-bold"
                />
              </div>
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Input
                placeholder="e.g. Nap, deep sleep, woke up tired..."
                value={sleepNotes}
                onChange={(e) => setSleepNotes(e.target.value)}
                className="rounded-xl mt-1"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold mt-2"
            >
              Save Sleep Session
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer Ad Slot */}
      <AdUnit size="auto" maxWidth="970px" />
    </div>
  );
}
