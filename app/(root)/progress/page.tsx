"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getWeightHistory,
  getWeightStats,
  logWeight,
  deleteWeightLog,
} from "@/lib/actions/weight.actions";
import {
  getBodyMeasurements,
  logBodyMeasurement,
} from "@/lib/actions/body-measurement.actions";
import {
  getSleepHistory,
  addSleepSession,
  removeSleepSession,
} from "@/lib/actions/water-sleep.actions";
import { getUserProfile } from "@/lib/actions/profile.actions";
import StatCard from "@/components/shared/StatCard";
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

  // Weight dialog
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [weightVal, setWeightVal] = useState("");
  const [weightNotes, setWeightNotes] = useState("");

  // Body measurement dialog
  const [bodyModalOpen, setBodyModalOpen] = useState(false);
  const [waist, setWaist] = useState("");
  const [chest, setChest] = useState("");
  const [hip, setHip] = useState("");
  const [arm, setArm] = useState("");
  const [thigh, setThigh] = useState("");

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
      const [wHist, wStats, mList, sLogs, userProf] = await Promise.all([
        getWeightHistory(60),
        getWeightStats(),
        getBodyMeasurements(10),
        getSleepHistory(14),
        getUserProfile(),
      ]);
      setWeightHistory(wHist);
      setWeightStats(wStats);
      setMeasurements(mList);
      setSleepLogs(sLogs);
      setProfile(userProf);
    } catch (err) {
      console.error("Error loading progress:", err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleSaveBody = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await logBodyMeasurement({
        date: todayStr,
        waist: waist ? Number(waist) : undefined,
        chest: chest ? Number(chest) : undefined,
        hip: hip ? Number(hip) : undefined,
        arm: arm ? Number(arm) : undefined,
        thigh: thigh ? Number(thigh) : undefined,
      });
      toast.success("Body measurements saved!");
      setBodyModalOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to save measurements");
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

  const handleDeleteWeight = async (id: string) => {
    try {
      await deleteWeightLog(id);
      toast.success("Log deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete log");
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Progress & Body Analytics 📈
        </h1>
        <p className="text-xs text-muted-foreground">
          Monitor weight trends, body circumferences, BMI, and sleep quality
        </p>
      </div>

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
        <TabsContent value="weight" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <h2 className="text-lg font-bold">Weight Progress Chart</h2>
            <Button
              onClick={() => setWeightModalOpen(true)}
              className="rounded-xl gap-2 text-xs bg-primary hover:bg-primary/90 font-bold ml-auto"
            >
              <Plus className="w-4 h-4" />
              Log Weight
            </Button>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-border/50 space-y-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weightHistory}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="weightAreaGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#22a065" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22a065" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                    stroke="#22a065"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#weightAreaGrad)"
                    name="Weight (kg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Logs table */}
          <div className="glass-card p-5 rounded-3xl border border-border/50 space-y-3">
            <h3 className="text-base font-bold">Weight Logs History</h3>
            <div className="space-y-2">
              {weightHistory.map((w) => (
                <div
                  key={w._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 text-xs"
                >
                  <div>
                    <p className="font-bold text-sm">{w.weight} kg</p>
                    <p className="text-muted-foreground text-[11px]">
                      {w.date} {w.notes && `&middot; ${w.notes}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteWeight(w._id)}
                    className="h-7 w-7 text-muted-foreground hover:text-red-500 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
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
      <Dialog open={bodyModalOpen} onOpenChange={setBodyModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Body Circumferences (cm) 📏
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveBody} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Waist (cm)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label>Chest (cm)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label>Hip (cm)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label>Arm (cm)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={arm}
                  onChange={(e) => setArm(e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label>Thigh (cm)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={thigh}
                  onChange={(e) => setThigh(e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl bg-primary hover:bg-primary/90 font-bold mt-2"
            >
              Save Measurements
            </Button>
          </form>
        </DialogContent>
      </Dialog>

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
