"use client";

import { useState, useEffect } from "react";
import { getFullProfileHealthMetrics } from "@/lib/actions/profile.actions";
import { getBodyMeasurements } from "@/lib/actions/body-measurement.actions";
import OnboardingModal from "@/components/shared/OnboardingModal";
import BodyMeasurementModal from "@/components/shared/BodyMeasurementModal";
import StatCard from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings2,
  Scale,
  Target,
  Flame,
  Droplet,
  ShieldCheck,
  ExternalLink,
  Ruler,
  Activity,
  Zap,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Info,
  User,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import type { IBodyMeasurement } from "@/types/fitness";

const AdUnit = dynamic(() => import("@/components/shared/AdUnit"), {
  ssr: false,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HealthData = any;

const MEASUREMENT_CONFIG: {
  key: keyof Omit<IBodyMeasurement, "_id" | "clerkId" | "date">;
  label: string;
  icon: string;
}[] = [
  { key: "chest", label: "Chest", icon: "👕" },
  { key: "waist", label: "Waist", icon: "👖" },
  { key: "hip", label: "Hip", icon: "🦴" },
  { key: "shoulder", label: "Shoulders", icon: "💪" },
  { key: "neck", label: "Neck", icon: "🧣" },
  { key: "arm", label: "Arm (Bicep)", icon: "💪" },
  { key: "forearm", label: "Forearm", icon: "✊" },
  { key: "thigh", label: "Thigh", icon: "🦵" },
  { key: "calf", label: "Calf", icon: "🦶" },
];

function TrendingBadge({ change }: { change: number | null | undefined }) {
  if (change === null || change === undefined) return null;
  if (change > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="w-3 h-3" />+{change}
      </span>
    );
  if (change < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
        <TrendingDown className="w-3 h-3" />
        {change}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground">
      <Minus className="w-3 h-3" />0
    </span>
  );
}

function MeasurementChangeBadge({
  prev,
  curr,
}: {
  prev?: number;
  curr?: number;
}) {
  if (prev === undefined || curr === undefined) return null;
  const change = Math.round((curr - prev) * 10) / 10;
  return <TrendingBadge change={change === 0 ? null : change} />;
}

export default function ProfilePage() {
  const [data, setData] = useState<HealthData>(null);
  const [measurementsHistory, setMeasurementsHistory] = useState<
    IBodyMeasurement[]
  >([]);
  const [, setLoading] = useState(true);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [measurementModalOpen, setMeasurementModalOpen] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [profileData, history] = await Promise.all([
        getFullProfileHealthMetrics(),
        getBodyMeasurements(20),
      ]);
      setData(profileData);
      setMeasurementsHistory(history);
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const profile = data?.profile;
  const metrics = data?.metrics;
  const macros = data?.macros;
  const labels = data?.labels;
  const latest = data?.latestMeasurements;
  const previous = measurementsHistory?.[1];

  const pGoal = macros?.dailyProteinGoal;
  const cGoal = macros?.dailyCarbGoal;
  const fGoal = macros?.dailyFatGoal;
  let proteinPct = 0;
  let carbsPct = 0;
  let fatPct = 0;
  if (pGoal && cGoal && fGoal) {
    const pCal = pGoal * 4;
    const cCal = cGoal * 4;
    const fCal = fGoal * 9;
    const totalCal = pCal + cCal + fCal;
    if (totalCal > 0) {
      proteinPct = Math.min(100, (pCal / totalCal) * 100);
      carbsPct = Math.min(100, (cCal / totalCal) * 100);
      fatPct = Math.min(100, (fCal / totalCal) * 100);
    }
  }

  let weightDiffLabel: string | null = null;
  let weightDiffValue: string | number = "--";
  let weightProgressPct: number | null = null;
  const curW = profile?.currentWeight as number | undefined;
  const tgtW = profile?.targetWeight as number | undefined;
  if (curW !== undefined && tgtW !== undefined && curW > 0 && tgtW > 0) {
    if (curW > tgtW) {
      weightDiffLabel = "Weight to Lose";
      const diff = Math.round((curW - tgtW) * 10) / 10;
      weightDiffValue = `${diff} kg`;
      const toLose = curW - tgtW;
      const initialGuess = toLose > 0 ? curW + toLose * 0.25 : curW;
      const totalJourney = initialGuess - tgtW;
      const already = initialGuess - curW;
      weightProgressPct =
        totalJourney > 0
          ? Math.min(
              100,
              Math.max(0, Math.round((already / totalJourney) * 100)),
            )
          : 100;
    } else if (curW < tgtW) {
      weightDiffLabel = "Weight to Gain";
      const diff = Math.round((tgtW - curW) * 10) / 10;
      weightDiffValue = `${diff} kg`;
      weightProgressPct = Math.min(
        100,
        Math.max(0, Math.round((curW / tgtW) * 100)),
      );
    } else {
      weightDiffLabel = "At Target Weight";
      weightDiffValue = "🎉 You're there!";
      weightProgressPct = 100;
    }
  }

  return (
    <div className="space-y-6">
      <OnboardingModal
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        initialData={profile}
      />
      <BodyMeasurementModal
        open={measurementModalOpen}
        onOpenChange={setMeasurementModalOpen}
        initialData={latest}
      />

      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl border border-border/50 flex flex-wrap sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
            {profile?.name ? profile.name[0].toUpperCase() : "F"}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {profile?.name || "User Profile"}
            </h1>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">
              <span className="inline-flex items-center gap-1">
                <User className="w-3 h-3" />
                {profile?.gender} &middot; {profile?.age} yrs &middot;{" "}
                {profile?.height} cm
              </span>
            </p>
          </div>
        </div>

        <div className="">
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <Badge
              variant="secondary"
              className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border-0"
            >
              🎯 {labels?.goal}
            </Badge>
            <Badge
              variant="secondary"
              className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0"
            >
              <Activity className="w-3 h-3 mr-0.5" />
              {labels?.activity}
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] px-2 py-0.5 rounded-full"
            >
              <Calendar className="w-3 h-3 mr-0.5" />
              {profile?.workoutDaysPerWeek} workouts/week
            </Badge>
          </div>
          <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
            Developed by{" "}
            <a
              href="https://www.artistycode.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              ArtistyCode Studio
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </p>
        </div>

        <div className="flex gap-2 flex-wrap items-center justify-center mt-2 sm:mt-0">
          <Button
            onClick={() => setMeasurementModalOpen(true)}
            className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-600/90 text-white font-bold"
          >
            <Ruler className="w-4 h-4" />
            Log Measurements
          </Button>
          <Button
            onClick={() => setOnboardingOpen(true)}
            className="rounded-xl gap-1.5 bg-primary hover:bg-primary/90 font-bold"
          >
            <Settings2 className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Core Metrics: Weight, BMI, BMR, TDEE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Current Weight"
          value={profile?.currentWeight || "--"}
          unit="kg"
          subtitle={`Target: ${profile?.targetWeight || "--"} kg`}
          icon={Scale}
          variant="purple"
        />
        <div className="glass-card p-4 rounded-2xl transition-all hover:shadow-md border border-border/50 relative overflow-hidden stat-card-orange">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Body Mass Index
              </p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold tracking-tight">
                  {metrics?.bmi || "--"}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  kg/m²
                </span>
              </div>
              {metrics?.bmiCategory && (
                <p
                  className={cn(
                    "text-xs font-bold mt-1",
                    metrics.bmiCategory.color,
                  )}
                >
                  {metrics.bmiCategory.label}
                </p>
              )}
            </div>
            <div className="p-2.5 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          {metrics?.bmiCategory?.description && (
            <p className="text-[10px] text-muted-foreground mt-2 leading-snug">
              {metrics.bmiCategory.description}
            </p>
          )}
          {metrics?.idealWeightRange && (
            <p className="text-[10px] text-muted-foreground mt-1.5 pt-1.5 border-t border-border/40">
              <span className="font-semibold">Ideal Range:</span>{" "}
              {metrics.idealWeightRange.min} - {metrics.idealWeightRange.max} kg
            </p>
          )}
        </div>
        <StatCard
          title="BMR (Resting)"
          value={metrics?.bmr || "--"}
          unit="kcal"
          subtitle="Calories at rest (Mifflin-St Jeor)"
          icon={Zap}
          variant="orange"
        />
        <StatCard
          title="TDEE (Daily)"
          value={metrics?.tdee || "--"}
          unit="kcal"
          subtitle="Total daily energy expenditure"
          icon={Flame}
          variant="green"
        />
      </div>

      {/* Body Composition: Body Fat %, Lean Mass, Fat Mass */}
      <div className="glass-card p-5 rounded-3xl border border-border/50">
        <div className="space-y-2 mb-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Body Composition Analysis
          </h2>
          {metrics?.bodyFatPct === null && (
            <Badge
              variant="outline"
              className="text-[10px] font-normal rounded-full border-dashed"
            >
              <Info className="w-3 h-3 mr-1" />
              Add neck + waist measurements for body fat %
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30 space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground">
              Body Fat %
            </p>
            <p className="text-xl font-bold text-pink-600 dark:text-pink-400">
              {metrics?.bodyFatPct !== null && metrics?.bodyFatPct !== undefined
                ? `${metrics.bodyFatPct}%`
                : "--"}
            </p>
            {metrics?.bodyFatCategory && (
              <p
                className={cn(
                  "text-[10px] font-bold",
                  metrics.bodyFatCategory.color,
                )}
              >
                {metrics.bodyFatCategory.label}
              </p>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30 space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground">
              Lean Body Mass
            </p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics?.leanMass !== null && metrics?.leanMass !== undefined
                ? `${metrics.leanMass} kg`
                : "--"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Muscle, bones, organs
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30 space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground">
              Fat Mass
            </p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {metrics?.fatMass !== null && metrics?.fatMass !== undefined
                ? `${metrics.fatMass} kg`
                : "--"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Total fat tissue
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30 space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground">
              Waist:Hip Ratio
            </p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {metrics?.whr !== null && metrics?.whr !== undefined
                ? metrics.whr
                : "--"}
            </p>
            {metrics?.whrRisk && (
              <p className={cn("text-[10px] font-bold", metrics.whrRisk.color)}>
                {metrics.whrRisk.label}
              </p>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30 space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground">
              Waist:Height Ratio
            </p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {metrics?.whtr !== null && metrics?.whtr !== undefined
                ? metrics.whtr
                : "--"}
            </p>
            {metrics?.whtrCategory && (
              <p
                className={cn(
                  "text-[10px] font-bold",
                  metrics.whtrCategory.color,
                )}
              >
                {metrics.whtrCategory.label}
              </p>
            )}
          </div>
        </div>

        {metrics?.whrRisk?.risk && (
          <div className="mt-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
              <span className="font-bold">Cardio Risk Note:</span>{" "}
              {metrics.whrRisk.risk}
            </p>
          </div>
        )}
      </div>

      {/* Mid-page Ad */}
      <AdUnit size="auto" label="Sponsored" maxWidth="970px" />

      {/* Latest Body Measurements */}
      <div className="glass-card p-5 rounded-3xl border border-border/50">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Ruler className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Latest Body Measurements
            </h2>
            {latest?.date && (
              <Badge
                variant="secondary"
                className="text-[10px] rounded-full font-medium bg-muted"
              >
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(latest.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => setMeasurementModalOpen(true)}
            className="rounded-xl text-xs font-bold gap-1 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-600/90 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            Update
          </Button>
        </div>

        {!latest ? (
          <div className="text-center py-8 rounded-2xl border-2 border-dashed border-border/50 bg-muted/20">
            <Ruler className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              No measurements logged yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Track your chest, waist, hips, and more to see progress over time
            </p>
            <Button
              onClick={() => setMeasurementModalOpen(true)}
              className="mt-4 rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-600/90 text-white text-sm font-bold"
            >
              <Plus className="w-4 h-4" />
              Log First Measurement
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            {MEASUREMENT_CONFIG.map(({ key, label, icon }) => {
              const val = latest?.[key];
              const prevVal = previous?.[key] as number | undefined;
              return (
                <div
                  key={key}
                  className="group p-3.5 rounded-2xl bg-muted/40 border border-border/30 hover:bg-muted/60 transition-colors relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        <span className="text-sm">{icon}</span>
                        {label}
                      </p>
                      <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="text-xl font-bold tracking-tight">
                          {val !== undefined && val !== null ? val : "--"}
                        </span>
                        {val !== undefined && val !== null && (
                          <span className="text-[11px] font-semibold text-muted-foreground">
                            cm
                          </span>
                        )}
                      </div>
                    </div>
                    <MeasurementChangeBadge
                      prev={prevVal}
                      curr={val as number | undefined}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Daily Calorie & Macro Targets */}
      <div className="glass-card p-5 rounded-3xl border border-border/50 space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Configured Daily Nutrition Targets
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
            <p className="text-[11px] font-semibold text-orange-700 dark:text-orange-400">
              🔥 Calories
            </p>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {macros?.dailyCaloriesGoal || profile?.dailyCaloriesGoal || "--"}{" "}
              <span className="text-[11px] font-semibold text-muted-foreground">
                kcal
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Daily Target
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              💪 Protein
            </p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {macros?.dailyProteinGoal || profile?.dailyProteinGoal || "--"}
              <span className="text-[11px] font-semibold text-muted-foreground ml-1">
                g
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Muscle Preservation
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
            <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">
              🌾 Carbs
            </p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {macros?.dailyCarbGoal || profile?.dailyCarbGoal || "--"}
              <span className="text-[11px] font-semibold text-muted-foreground ml-1">
                g
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Energy Source
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
            <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-400">
              🥑 Fat
            </p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {macros?.dailyFatGoal || profile?.dailyFatGoal || "--"}
              <span className="text-[11px] font-semibold text-muted-foreground ml-1">
                g
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Hormone Health
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              🌿 Fiber
            </p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {macros?.dailyFiberGoal || profile?.dailyFiberGoal || "--"}
              <span className="text-[11px] font-semibold text-muted-foreground ml-1">
                g
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Digestive Health
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
            <p className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-400">
              💧 Water
            </p>
            <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
              {macros?.waterGoalMl || profile?.waterGoalMl || "--"}
              <span className="text-[11px] font-semibold text-muted-foreground ml-1">
                ml
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Stay Hydrated
            </p>
          </div>
        </div>

        {/* Macro Split Bar */}
        {pGoal && cGoal && fGoal && (
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-muted-foreground mb-2">
              Macro Calorie Distribution
            </p>
            <div className="flex h-6 rounded-full overflow-hidden bg-muted">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${proteinPct}%` }}
              />
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${carbsPct}%` }}
              />
              <div className="bg-purple-500 h-full flex-1" />
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-medium">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                Protein {Math.round(proteinPct)}%
              </span>
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                Carbs {Math.round(carbsPct)}%
              </span>
              <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
                Fat {Math.round(fatPct)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Water & Additional Targets Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-3xl border border-border/50">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Droplet className="w-4 h-4 text-cyan-500" />
            Weight Progress
          </h2>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Current Weight
                </p>
                <p className="text-base font-bold">
                  {profile?.currentWeight || "--"} kg
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px] rounded-full">
                Now
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Target Weight
                </p>
                <p className="text-base font-bold">
                  {profile?.targetWeight || "--"} kg
                </p>
              </div>
              <Badge
                variant="secondary"
                className="text-[10px] rounded-full bg-primary/10 text-primary border-0"
              >
                🎯 Goal
              </Badge>
            </div>
            {weightDiffLabel && weightProgressPct !== null && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20">
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {weightDiffLabel}
                  </p>
                  <p className="text-base font-bold text-primary">
                    {weightDiffValue}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Progress
                  </p>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {weightProgressPct}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-border/50">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Profile Quick Facts
          </h2>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
              <span className="text-[11px] text-muted-foreground font-medium">
                Age
              </span>
              <span className="text-sm font-bold">
                {profile?.age || "--"} yrs
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
              <span className="text-[11px] text-muted-foreground font-medium">
                Height
              </span>
              <span className="text-sm font-bold">
                {profile?.height || "--"} cm
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
              <span className="text-[11px] text-muted-foreground font-medium">
                Gender
              </span>
              <span className="text-sm font-bold capitalize">
                {profile?.gender || "--"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
              <span className="text-[11px] text-muted-foreground font-medium">
                Workout Schedule
              </span>
              <span className="text-sm font-bold">
                {profile?.workoutDaysPerWeek || 0} days/week
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Ad */}
      <AdUnit size="auto" maxWidth="970px" />
    </div>
  );
}
