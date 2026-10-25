"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/components/shared/I18nProvider";
import { getFullProfileHealthMetrics } from "@/lib/actions/profile.actions";
import { getBodyMeasurements } from "@/lib/actions/body-measurement.actions";
import {
  generateAIProfileAssessment,
  type AIProfileAssessmentData,
} from "@/lib/actions/ai-profile.actions";
import { useDataUpdateListener } from "@/lib/events";
import OnboardingModal from "@/components/shared/OnboardingModal";
import BodyMeasurementModal from "@/components/shared/BodyMeasurementModal";
import GoalTargetsEditorModal from "@/components/profile/GoalTargetsEditorModal";
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
  Brain,
  RefreshCw,
  Sparkles,
  Utensils,
  Dumbbell,
  ChevronRight,
  Sliders,
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
  { key: "chest", label: "profile.measure.chest", icon: "👕" },
  { key: "waist", label: "profile.measure.waist", icon: "👖" },
  { key: "hip", label: "profile.measure.hip", icon: "🦴" },
  { key: "shoulder", label: "profile.measure.shoulder", icon: "💪" },
  { key: "neck", label: "profile.measure.neck", icon: "🧣" },
  { key: "arm", label: "profile.measure.arm", icon: "💪" },
  { key: "forearm", label: "profile.measure.forearm", icon: "✊" },
  { key: "thigh", label: "profile.measure.thigh", icon: "🦵" },
  { key: "calf", label: "profile.measure.calf", icon: "🦶" },
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
  const { t } = useI18n();
  const [data, setData] = useState<HealthData>(null);
  const [measurementsHistory, setMeasurementsHistory] = useState<
    IBodyMeasurement[]
  >([]);
  const [, setLoading] = useState(true);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [measurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [aiAssessment, setAiAssessment] =
    useState<AIProfileAssessmentData | null>(null);
  const [aiAssessmentLoading, setAiAssessmentLoading] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [profileData, history, aiData] = await Promise.all([
        getFullProfileHealthMetrics(),
        getBodyMeasurements(20),
        generateAIProfileAssessment(),
      ]);
      setData(profileData);
      setMeasurementsHistory(history);
      setAiAssessment(aiData);
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshAIAssessment = async () => {
    try {
      setAiAssessmentLoading(true);
      const aiData = await generateAIProfileAssessment();
      setAiAssessment(aiData);
    } catch {
      // silent fail
    } finally {
      setAiAssessmentLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useDataUpdateListener((category) => {
    if (
      category === "profile" ||
      category === "all" ||
      category === "measurement"
    ) {
      fetchAll();
    }
  });

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
      weightDiffLabel = t("profile.weightProgress.toLose");
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
      weightDiffLabel = t("profile.weightProgress.toGain");
      const diff = Math.round((tgtW - curW) * 10) / 10;
      weightDiffValue = `${diff} kg`;
      weightProgressPct = Math.min(
        100,
        Math.max(0, Math.round((curW / tgtW) * 100)),
      );
    } else {
      weightDiffLabel = t("profile.weightProgress.atTarget");
      weightDiffValue = t("profile.weightProgress.atTargetValue");
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
      <GoalTargetsEditorModal
        open={goalModalOpen}
        onOpenChange={setGoalModalOpen}
        profile={profile}
        recommendedMacros={data?.recommendedMacros}
        onSaved={fetchAll}
      />
      <BodyMeasurementModal
        open={measurementModalOpen}
        onOpenChange={(open) => {
          setMeasurementModalOpen(open);
          if (!open) fetchAll();
        }}
        initialData={latest}
        onSuccess={fetchAll}
      />

      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl border border-border/50 flex flex-wrap sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
            {profile?.name ? profile.name[0].toUpperCase() : "F"}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {profile?.name || t("profile.defaultName")}
            </h1>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">
              <span className="inline-flex items-center gap-1">
                <User className="w-3 h-3" />
                {profile?.gender} &middot; {profile?.age}{" "}
                {t("profile.meta.years")} &middot; {profile?.height} cm
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
              {profile?.workoutDaysPerWeek} {t("profile.meta.workoutsPerWeek")}
            </Badge>
          </div>
          <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
            {t("profile.developedBy")}{" "}
            <a
              href="https://www.rizmec.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              RIZMEC
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </p>
        </div>

        <div className="flex gap-2 flex-wrap items-center justify-center mt-2 sm:mt-0">
          <Button
            onClick={() => setGoalModalOpen(true)}
            className="rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm"
          >
            <Target className="w-4 h-4" />
            {t("profile.actions.adjustTargets")}
          </Button>
          <Button
            onClick={() => setMeasurementModalOpen(true)}
            className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-600/90 text-white font-bold"
          >
            <Ruler className="w-4 h-4" />
            {t("profile.actions.logMeasurements")}
          </Button>
          <Button
            onClick={() => setOnboardingOpen(true)}
            variant="outline"
            className="rounded-xl gap-1.5 border-border/80 font-bold"
          >
            <Settings2 className="w-4 h-4" />
            {t("profile.actions.editProfile")}
          </Button>
        </div>
      </div>

      {/* Core Metrics: Weight, BMI, BMR, TDEE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title={t("profile.metric.currentWeight")}
          value={profile?.currentWeight || "--"}
          unit="kg"
          subtitle={t("profile.metric.targetSubtitle", {
            value: profile?.targetWeight || "--",
          })}
          icon={Scale}
          variant="purple"
        />
        <div className="glass-card p-4 rounded-2xl transition-all hover:shadow-md border border-border/50 relative overflow-hidden stat-card-orange">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("profile.metric.bmi")}
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
              <span className="font-semibold">
                {t("profile.metric.idealRange")}
              </span>{" "}
              {metrics.idealWeightRange.min} - {metrics.idealWeightRange.max} kg
            </p>
          )}
        </div>
        <StatCard
          title={t("profile.metric.bmrTitle")}
          value={metrics?.bmr || "--"}
          unit="kcal"
          subtitle={t("profile.metric.bmrSubtitle")}
          icon={Zap}
          variant="orange"
        />
        <StatCard
          title={t("profile.metric.tdeeTitle")}
          value={metrics?.tdee || "--"}
          unit="kcal"
          subtitle={t("profile.metric.tdeeSubtitle")}
          icon={Flame}
          variant="green"
        />
      </div>

      {/* Body Composition: Body Fat %, Lean Mass, Fat Mass */}
      <div className="glass-card p-5 rounded-3xl border border-border/50">
        <div className="space-y-2 mb-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {t("profile.bodyComp.title")}
          </h2>
          {metrics?.bodyFatPct === null && (
            <Badge
              variant="outline"
              className="text-[10px] font-normal rounded-full border-dashed"
            >
              <Info className="w-3 h-3 mr-1" />
              {t("profile.bodyComp.hint")}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30 space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground">
              {t("profile.bodyComp.bodyFat")}
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
              {t("profile.bodyComp.leanMass")}
            </p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics?.leanMass !== null && metrics?.leanMass !== undefined
                ? `${metrics.leanMass} kg`
                : "--"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {t("profile.bodyComp.leanMassHint")}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30 space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground">
              {t("profile.bodyComp.fatMass")}
            </p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {metrics?.fatMass !== null && metrics?.fatMass !== undefined
                ? `${metrics.fatMass} kg`
                : "--"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {t("profile.bodyComp.fatMassHint")}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30 space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground">
              {t("profile.bodyComp.whr")}
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
              {t("profile.bodyComp.whtr")}
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
              <span className="font-bold">
                {t("profile.bodyComp.cardioRiskNote")}
              </span>{" "}
              {metrics.whrRisk.risk}
            </p>
          </div>
        )}
      </div>

      {/* Mid-page Ad */}
      <AdUnit size="auto" label={t("profile.ad.sponsored")} maxWidth="970px" />

      {/* Latest Body Measurements */}
      <div className="glass-card p-5 rounded-3xl border border-border/50">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Ruler className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {t("profile.measurements.title")}
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
            className="rounded-xl text-xs font-bold gap-1 sm:w-auto bg-emerald-600 hover:bg-emerald-600/90 text-white ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("profile.actions.update")}
          </Button>
        </div>

        {!latest ? (
          <div className="text-center py-8 rounded-2xl border-2 border-dashed border-border/50 bg-muted/20">
            <Ruler className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              {t("profile.measurements.empty")}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {t("profile.measurements.emptyHint")}
            </p>
            <Button
              onClick={() => setMeasurementModalOpen(true)}
              className="mt-4 rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-600/90 text-white text-sm font-bold"
            >
              <Plus className="w-4 h-4" />
              {t("profile.actions.logFirst")}
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
                        {t(label)}
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              {t("profile.targets.title")}
            </h2>
            {profile?.dailyCaloriesGoal && (
              <Badge
                variant="outline"
                className="text-[10px] rounded-full border-primary/30 bg-primary/5 text-primary font-medium"
              >
                {t("profile.modal.customNotice")}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => setGoalModalOpen(true)}
            variant="outline"
            className="rounded-xl text-xs font-bold gap-1.5 border-primary/30 hover:bg-primary/10 text-primary ml-auto"
          >
            <Sliders className="w-3.5 h-3.5" />
            {t("profile.actions.adjustTargets")}
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
            <p className="text-[11px] font-semibold text-orange-700 dark:text-orange-400">
              {t("profile.targets.calories")}
            </p>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {macros?.dailyCaloriesGoal || profile?.dailyCaloriesGoal || "--"}{" "}
              <span className="text-[11px] font-semibold text-muted-foreground">
                kcal
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {t("profile.targets.dailyTarget")}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              {t("profile.targets.protein")}
            </p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {macros?.dailyProteinGoal || profile?.dailyProteinGoal || "--"}
              <span className="text-[11px] font-semibold text-muted-foreground ml-1">
                g
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {t("profile.targets.musclePreservation")}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
            <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">
              {t("profile.targets.carbs")}
            </p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {macros?.dailyCarbGoal || profile?.dailyCarbGoal || "--"}
              <span className="text-[11px] font-semibold text-muted-foreground ml-1">
                g
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {t("profile.targets.energySource")}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
            <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-400">
              {t("profile.targets.fat")}
            </p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {macros?.dailyFatGoal || profile?.dailyFatGoal || "--"}
              <span className="text-[11px] font-semibold text-muted-foreground ml-1">
                g
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {t("profile.targets.hormoneHealth")}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              {t("profile.targets.fiber")}
            </p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {macros?.dailyFiberGoal || profile?.dailyFiberGoal || "--"}
              <span className="text-[11px] font-semibold text-muted-foreground ml-1">
                g
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {t("profile.targets.digestiveHealth")}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
            <p className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-400">
              {t("profile.targets.water")}
            </p>
            <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
              {macros?.waterGoalMl || profile?.waterGoalMl || "--"}
              <span className="text-[11px] font-semibold text-muted-foreground ml-1">
                ml
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {t("profile.targets.stayHydrated")}
            </p>
          </div>
        </div>

        {/* Macro Split Bar */}
        {pGoal && cGoal && fGoal && (
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-muted-foreground mb-2">
              {t("profile.targets.macroDistribution")}
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
                {t("profile.targets.proteinPct", {
                  pct: Math.round(proteinPct),
                })}
              </span>
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                {t("profile.targets.carbsPct", { pct: Math.round(carbsPct) })}
              </span>
              <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
                {t("profile.targets.fatPct", { pct: Math.round(fatPct) })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Water & Additional Targets Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-3xl border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              {t("profile.weightProgress.title")}
            </h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setGoalModalOpen(true)}
              className="h-7 px-2.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10"
            >
              {t("profile.actions.updateGoal")} &rarr;
            </Button>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {t("profile.metric.currentWeight")}
                </p>
                <p className="text-base font-bold">
                  {profile?.currentWeight || "--"} kg
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px] rounded-full">
                {t("profile.weightProgress.now")}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {t("profile.weightProgress.targetWeight")}
                </p>
                <p className="text-base font-bold">
                  {profile?.targetWeight || "--"} kg
                </p>
              </div>
              <Badge
                variant="secondary"
                className="text-[10px] rounded-full bg-primary/10 text-primary border-0"
              >
                {t("profile.weightProgress.goal")}
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
                    {t("profile.weightProgress.progress")}
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
            {t("profile.quickFacts.title")}
          </h2>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
              <span className="text-[11px] text-muted-foreground font-medium">
                {t("profile.quickFacts.age")}
              </span>
              <span className="text-sm font-bold">
                {profile?.age || "--"} {t("profile.meta.years")}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
              <span className="text-[11px] text-muted-foreground font-medium">
                {t("profile.quickFacts.height")}
              </span>
              <span className="text-sm font-bold">
                {profile?.height || "--"} cm
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
              <span className="text-[11px] text-muted-foreground font-medium">
                {t("profile.quickFacts.gender")}
              </span>
              <span className="text-sm font-bold capitalize">
                {profile?.gender || "--"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
              <span className="text-[11px] text-muted-foreground font-medium">
                {t("profile.quickFacts.workoutSchedule")}
              </span>
              <span className="text-sm font-bold">
                {profile?.workoutDaysPerWeek || 0}{" "}
                {t("profile.quickFacts.daysPerWeek")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── AI Profile Assessment ─── */}
      <div className="glass-card rounded-3xl border border-primary/20 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10 px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-black text-sm">{t("profile.ai.title")}</h2>
              <p className="text-[10px] text-muted-foreground">
                {t("profile.ai.subtitle")}
              </p>
            </div>
            {aiAssessment?.isAIGenerated && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Gemini
              </span>
            )}
          </div>
          <Button
            onClick={refreshAIAssessment}
            size="sm"
            disabled={aiAssessmentLoading}
            variant="outline"
            className="rounded-xl gap-1.5 text-xs font-bold border-primary/30 text-primary hover:bg-primary/10"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${aiAssessmentLoading ? "animate-spin" : ""}`}
            />
            {aiAssessmentLoading
              ? t("profile.ai.analysing")
              : t("profile.ai.refresh")}
          </Button>
        </div>

        {aiAssessment ? (
          <div className="p-6 space-y-6">
            {/* Metabolic Numbers Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: t("profile.ai.bmrLabel"),
                  value: `${aiAssessment.metabolicProfile.bmr}`,
                  unit: "kcal/day",
                  color: "text-amber-600 dark:text-amber-400",
                },
                {
                  label: t("profile.ai.tdeeLabel"),
                  value: `${aiAssessment.metabolicProfile.tdee}`,
                  unit: "kcal/day",
                  color: "text-primary",
                },
                {
                  label: t("profile.ai.estBodyFat"),
                  value: `${aiAssessment.metabolicProfile.bodyFatEstimatePct}`,
                  unit: "%",
                  color: "text-purple-600 dark:text-purple-400",
                },
                {
                  label: t("profile.bodyComp.leanMass"),
                  value: `${aiAssessment.metabolicProfile.leanMassKg}`,
                  unit: "kg",
                  color: "text-emerald-600 dark:text-emerald-400",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-2xl bg-muted/40 border border-border/30 space-y-0.5"
                >
                  <p className="text-[10px] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className={`text-lg font-black ${item.color}`}>
                    {item.value}
                    <span className="text-[10px] font-semibold text-muted-foreground ml-0.5">
                      {item.unit}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            {/* Metabolic Summary */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/15 space-y-2">
              <p className="text-xs leading-relaxed">
                {aiAssessment.metabolicProfile.metabolicSummary}
              </p>
              <p className="text-[11px] text-muted-foreground italic">
                💡 {aiAssessment.metabolicProfile.metabolicOptimizationTip}
              </p>
            </div>

            {/* Macro Strategy + Workout Strategy + Longevity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Macro Strategy */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Utensils className="w-3.5 h-3.5" />{" "}
                  {t("profile.ai.macroStrategy")}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: t("profile.macro.calories"),
                      value: aiAssessment.macroStrategy.recommended.calories,
                      unit: "kcal",
                      color: "text-amber-600 dark:text-amber-400",
                    },
                    {
                      label: t("profile.macro.protein"),
                      value: aiAssessment.macroStrategy.recommended.protein,
                      unit: "g",
                      color: "text-emerald-600 dark:text-emerald-400",
                    },
                    {
                      label: t("profile.macro.carbs"),
                      value: aiAssessment.macroStrategy.recommended.carbs,
                      unit: "g",
                      color: "text-blue-600 dark:text-blue-400",
                    },
                    {
                      label: t("profile.macro.fat"),
                      value: aiAssessment.macroStrategy.recommended.fat,
                      unit: "g",
                      color: "text-purple-600 dark:text-purple-400",
                    },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="p-2.5 rounded-xl bg-muted/40 border border-border/30"
                    >
                      <p className="text-[10px] text-muted-foreground">
                        {m.label}
                      </p>
                      <p className={`text-base font-black ${m.color}`}>
                        {m.value}
                        <span className="text-[10px] ml-0.5">{m.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {aiAssessment.macroStrategy.rationale}
                </p>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {t("profile.ai.preWorkout")}{" "}
                    </span>
                    <span className="text-muted-foreground">
                      {aiAssessment.macroStrategy.timing.preworkout}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {t("profile.ai.postWorkout")}{" "}
                    </span>
                    <span className="text-muted-foreground">
                      {aiAssessment.macroStrategy.timing.postworkout}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {t("profile.ai.lastMeal")}{" "}
                    </span>
                    <span className="text-muted-foreground">
                      {aiAssessment.macroStrategy.timing.lastMeal}
                    </span>
                  </div>
                </div>
              </div>

              {/* Workout Strategy */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <Dumbbell className="w-3.5 h-3.5" />{" "}
                  {t("profile.ai.trainingBlueprint")}
                </h3>
                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-1">
                  <p className="text-[10px] text-muted-foreground">
                    {t("profile.ai.recommendedSplit")}
                  </p>
                  <p className="text-sm font-black text-purple-600 dark:text-purple-400">
                    {aiAssessment.workoutStrategy.recommendedSplit}
                  </p>
                  <span className="text-[10px] bg-purple-500/15 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-bold">
                    {aiAssessment.workoutStrategy.phaseLabel}
                  </span>
                </div>
                <div className="space-y-1">
                  {aiAssessment.workoutStrategy.weeklyStructure.map(
                    (day, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-[11px]"
                      >
                        <ChevronRight className="w-3 h-3 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{day}</span>
                      </div>
                    ),
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground">
                    {t("profile.ai.priorityMovements")}
                  </p>
                  {aiAssessment.workoutStrategy.priorityMovements
                    .slice(0, 4)
                    .map((m, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-1.5 text-[11px]"
                      >
                        <span className="text-primary font-black flex-shrink-0">
                          {i + 1}.
                        </span>
                        <span className="text-muted-foreground">{m}</span>
                      </div>
                    ))}
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-[11px] text-blue-700 dark:text-blue-300">
                  🏃 {aiAssessment.workoutStrategy.cardioRecommendation}
                </div>
              </div>

              {/* Longevity Roadmap */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs flex items-center gap-1.5 text-red-500 dark:text-red-400">
                  <Heart className="w-3.5 h-3.5" /> {t("profile.ai.longevity")}
                </h3>
                <div
                  className={`p-3 rounded-xl border space-y-1 ${
                    aiAssessment.longevityRoadmap.cardiovascularRiskLevel ===
                    "Low"
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : aiAssessment.longevityRoadmap
                            .cardiovascularRiskLevel === "Moderate"
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-red-500/5 border-red-500/20"
                  }`}
                >
                  <p className="text-[10px] text-muted-foreground">
                    {t("profile.ai.cardioRisk")}
                  </p>
                  <p
                    className={`text-sm font-black ${
                      aiAssessment.longevityRoadmap.cardiovascularRiskLevel ===
                      "Low"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : aiAssessment.longevityRoadmap
                              .cardiovascularRiskLevel === "Moderate"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {aiAssessment.longevityRoadmap.cardiovascularRiskLevel}{" "}
                    {t("profile.ai.risk")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground">
                    {t("profile.ai.preventiveHabits")}
                  </p>
                  {aiAssessment.longevityRoadmap.preventiveHabits
                    .slice(0, 4)
                    .map((h, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-1.5 text-[11px]"
                      >
                        <span className="text-emerald-500 flex-shrink-0 mt-0.5">
                          ✓
                        </span>
                        <span className="text-muted-foreground">{h}</span>
                      </div>
                    ))}
                </div>
                <div className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/20 text-[11px] text-red-700 dark:text-red-300 leading-relaxed">
                  ❤️ {aiAssessment.longevityRoadmap.wellnessGoal}
                </div>
                <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                  {aiAssessment.longevityRoadmap.lifespan}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">
            <Brain className="w-8 h-8 mx-auto mb-2 text-primary/40" />
            {t("profile.ai.loading")}
          </div>
        )}
      </div>

      {/* Footer Ad */}
      <AdUnit size="auto" maxWidth="970px" />
    </div>
  );
}
