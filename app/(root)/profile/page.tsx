"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/components/shared/I18nProvider";
import { getFullProfileHealthMetrics } from "@/lib/actions/profile.actions";
import { getBodyMeasurements } from "@/lib/actions/body-measurement.actions";
import {
  generateAIProfileAssessment,
  type AIProfileAssessmentData,
} from "@/lib/actions/ai-profile.actions";
import {
  getGoalCelebrationStats,
  getGoalHistory,
  type GoalCelebrationStats,
} from "@/lib/actions/goal-history.actions";
import { useDataUpdateListener } from "@/lib/events";
import PageHeader from "@/components/shared/PageHeader";
import OnboardingModal from "@/components/shared/OnboardingModal";
import BodyMeasurementModal from "@/components/shared/BodyMeasurementModal";
import GoalTargetsEditorModal from "@/components/profile/GoalTargetsEditorModal";
import GoalCelebrationModal from "@/components/profile/GoalCelebrationModal";
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
  Trophy,
  History,
  CheckCircle2,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import type { IBodyMeasurement, IGoalHistory } from "@/types/fitness";

const AdUnit = dynamic(() => import("@/components/shared/AdUnit"), {
  ssr: false,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HealthData = any;

type ProfileTab = "overview" | "targets" | "measurements" | "ai" | "milestones";

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
  const { t, locale } = useI18n();
  const [data, setData] = useState<HealthData>(null);
  const [measurementsHistory, setMeasurementsHistory] = useState<
    IBodyMeasurement[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [measurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [celebrationModalOpen, setCelebrationModalOpen] = useState(false);
  const [celebrationStats, setCelebrationStats] =
    useState<GoalCelebrationStats | null>(null);
  const [milestoneHistory, setMilestoneHistory] = useState<IGoalHistory[]>([]);
  const [aiAssessment, setAiAssessment] =
    useState<AIProfileAssessmentData | null>(null);
  const [aiAssessmentLoading, setAiAssessmentLoading] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [profileData, history, aiData, goalStats, goalMilestones] =
        await Promise.all([
          getFullProfileHealthMetrics(),
          getBodyMeasurements(20),
          generateAIProfileAssessment(),
          getGoalCelebrationStats(),
          getGoalHistory(),
        ]);
      setData(profileData);
      setMeasurementsHistory(history);
      setAiAssessment(aiData);
      setCelebrationStats(goalStats);
      setMilestoneHistory(goalMilestones);
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

  const isBn = locale === "bn";
  const tabsList = [
    {
      id: "overview" as ProfileTab,
      label: isBn ? "ওভারভিউ" : "Overview",
      shortLabel: isBn ? "ওভারভিউ" : "Overview",
      icon: Activity,
    },
    {
      id: "targets" as ProfileTab,
      label: isBn ? "টার্গেট ও ম্যাক্রো" : "Targets & Macros",
      shortLabel: isBn ? "টার্গেট" : "Targets",
      icon: Target,
    },
    {
      id: "measurements" as ProfileTab,
      label: isBn ? "শরীরের মাপ" : "Measurements",
      shortLabel: isBn ? "মাপ" : "Body",
      icon: Ruler,
      count: latest ? Object.keys(latest).filter((k) => k !== "_id" && k !== "clerkId" && k !== "date").length : undefined,
    },
    {
      id: "ai" as ProfileTab,
      label: isBn ? "এআই কোচ" : "AI Coach",
      shortLabel: isBn ? "এআই" : "AI Coach",
      icon: Brain,
      hasGemini: true,
    },
    {
      id: "milestones" as ProfileTab,
      label: isBn ? "মাইলস্টোন" : "Milestones",
      shortLabel: isBn ? "মাইলস্টোন" : "Milestones",
      icon: Trophy,
      count: milestoneHistory.length > 0 ? milestoneHistory.length : undefined,
    },
  ];

  if (loading && !data) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 w-48 bg-muted/60 rounded-xl" />
        <div className="h-44 rounded-3xl bg-muted/40 border border-border/40" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="h-28 rounded-2xl bg-muted/40" />
          <div className="h-28 rounded-2xl bg-muted/40" />
          <div className="h-28 rounded-2xl bg-muted/40" />
          <div className="h-28 rounded-2xl bg-muted/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-12">
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
      {celebrationStats && (
        <GoalCelebrationModal
          open={celebrationModalOpen}
          onOpenChange={setCelebrationModalOpen}
          stats={celebrationStats}
          onCompleted={fetchAll}
        />
      )}

      {/* Goal Achieved Banner */}
      {celebrationStats?.isGoalAchieved && (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-emerald-500/15 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/25 to-yellow-500/25 text-amber-500 shadow-xs">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-amber-800 dark:text-amber-300 truncate">
                  {t("profile.celebration.goalAchievedBanner")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {celebrationStats.headline}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setCelebrationModalOpen(true)}
              className="rounded-xl gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold shadow-md self-start sm:self-auto shrink-0 text-xs sm:text-sm"
            >
              <Sparkles className="w-4 h-4" />
              {t("profile.celebration.viewCelebration")}
            </Button>
          </div>
        </div>
      )}

      {/* Standard Header */}
      <PageHeader
        title={profile?.name || t("profile.defaultName")}
        subtitle={`${profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : ""} · ${profile?.age || "--"} ${t("profile.meta.years")} · ${profile?.height || "--"} cm`}
        icon={User}
        actions={
          <div className="hidden sm:flex items-center gap-2">
            <Button
              onClick={() => setGoalModalOpen(true)}
              size="sm"
              className="rounded-xl gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs text-xs"
            >
              <Target className="w-3.5 h-3.5" />
              {t("profile.actions.adjustTargets")}
            </Button>
            <Button
              onClick={() => setMeasurementModalOpen(true)}
              size="sm"
              className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-600/90 text-white font-bold shadow-xs text-xs"
            >
              <Ruler className="w-3.5 h-3.5" />
              {t("profile.actions.logMeasurements")}
            </Button>
            <Button
              onClick={() => setOnboardingOpen(true)}
              size="sm"
              variant="outline"
              className="rounded-xl gap-1.5 border-border/80 font-bold text-xs"
            >
              <Settings2 className="w-3.5 h-3.5" />
              {t("profile.actions.editProfile")}
            </Button>
          </div>
        }
      />

      {/* Profile Hero Card */}
      <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/50 relative overflow-hidden space-y-4">
        {/* Background glow accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative">
          {/* User info left */}
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-emerald-600 flex items-center justify-center text-primary-foreground text-xl sm:text-2xl font-black shadow-md shadow-primary/20 ring-2 ring-primary/20">
                {profile?.name ? profile.name[0].toUpperCase() : "U"}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight truncate">
                  {profile?.name || t("profile.defaultName")}
                </h2>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border-0 font-bold shrink-0"
                >
                  🎯 {labels?.goal || "Fitness"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-medium capitalize">
                  {profile?.gender} &middot; {profile?.age} {t("profile.meta.years")} &middot; {profile?.height} cm
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <Activity className="w-3 h-3" />
                  {labels?.activity}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  {profile?.workoutDaysPerWeek} {t("profile.meta.workoutsPerWeek")}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Capsule Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 bg-muted/40 p-2.5 rounded-2xl border border-border/40 shrink-0">
            <div className="px-2.5 py-1 text-center sm:text-left">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {t("profile.metric.currentWeight")}
              </p>
              <p className="text-sm sm:text-base font-black text-foreground">
                {profile?.currentWeight || "--"}{" "}
                <span className="text-[10px] text-muted-foreground font-normal">kg</span>
              </p>
            </div>
            <div className="px-2.5 py-1 text-center sm:text-left border-l border-border/40">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {t("profile.weightProgress.targetWeight")}
              </p>
              <p className="text-sm sm:text-base font-black text-primary">
                {profile?.targetWeight || "--"}{" "}
                <span className="text-[10px] text-muted-foreground font-normal">kg</span>
              </p>
            </div>
            <div className="px-2.5 py-1 text-center sm:text-left border-l border-border/40">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                BMI
              </p>
              <p className="text-sm sm:text-base font-black text-foreground">
                {metrics?.bmi || "--"}
              </p>
            </div>
            <div className="px-2.5 py-1 text-center sm:text-left border-l border-border/40">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {t("profile.targets.calories")}
              </p>
              <p className="text-sm sm:text-base font-black text-orange-600 dark:text-orange-400">
                {macros?.dailyCaloriesGoal || profile?.dailyCaloriesGoal || "--"}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Quick Action Buttons Bar */}
        <div className="grid grid-cols-3 gap-2 sm:hidden pt-2 border-t border-border/40">
          <Button
            onClick={() => setGoalModalOpen(true)}
            size="sm"
            className="rounded-xl gap-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs text-[11px] h-9 px-2"
          >
            <Target className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t("profile.actions.adjustTargets")}</span>
          </Button>
          <Button
            onClick={() => setMeasurementModalOpen(true)}
            size="sm"
            className="rounded-xl gap-1 bg-emerald-600 hover:bg-emerald-600/90 text-white font-bold shadow-xs text-[11px] h-9 px-2"
          >
            <Ruler className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t("profile.actions.update")}</span>
          </Button>
          <Button
            onClick={() => setOnboardingOpen(true)}
            size="sm"
            variant="outline"
            className="rounded-xl gap-1 border-border/80 font-bold text-[11px] h-9 px-2"
          >
            <Settings2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t("profile.actions.editProfile")}</span>
          </Button>
        </div>

        {/* Weight Journey Progress Bar */}
        {weightDiffLabel && weightProgressPct !== null && (
          <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent border border-primary/20 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-foreground">
                <Scale className="w-3.5 h-3.5 text-primary" />
                {t("profile.weightProgress.title")}
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                {weightDiffLabel}: {weightDiffValue} ({weightProgressPct}%)
              </span>
            </div>
            <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${weightProgressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium pt-0.5">
              <span>{t("profile.weightProgress.now")}: {profile?.currentWeight} kg</span>
              <span>{t("profile.weightProgress.goal")}: {profile?.targetWeight} kg</span>
            </div>
          </div>
        )}
      </div>

      {/* Responsive Segmented Category Navigation */}
      <div className="sticky top-14 sm:top-16 z-30 -mx-1 px-1 py-1.5 bg-background/80 backdrop-blur-md">
        <nav
          role="tablist"
          aria-label="Profile Sections"
          className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-muted/50 border border-border/40 overflow-x-auto no-scrollbar shadow-2xs"
        >
          {tabsList.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70",
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="sm:inline">{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-black leading-none",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.hasGemini && (
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.2 rounded-full font-black leading-none flex items-center gap-0.5",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-purple-500/15 text-purple-600 dark:text-purple-400",
                    )}
                  >
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: OVERVIEW                                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Core Metrics: Weight, BMI, BMR, TDEE */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
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

            {/* Custom BMI Card with visual health indicator */}
            <div className="glass-card p-3.5 sm:p-4 rounded-2xl transition-all hover:shadow-md border border-border/50 relative overflow-hidden stat-card-orange">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("profile.metric.bmi")}
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl sm:text-2xl font-bold tracking-tight">
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
                <div className="p-2 sm:p-2.5 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              {metrics?.idealWeightRange && (
                <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border/40">
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

          {/* Body Composition: Body Fat %, Lean Mass, Fat Mass, WHR, WHtR */}
          <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-border/50 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                {t("profile.bodyComp.title")}
              </h3>
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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/30 space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground">
                  {t("profile.bodyComp.bodyFat")}
                </p>
                <p className="text-lg sm:text-xl font-bold text-pink-600 dark:text-pink-400">
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
                <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
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
                <p className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">
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
                <p className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
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

              <div className="p-3 rounded-2xl bg-muted/40 border border-border/30 space-y-1 col-span-2 sm:col-span-1">
                <p className="text-[11px] font-medium text-muted-foreground">
                  {t("profile.bodyComp.whtr")}
                </p>
                <p className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">
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
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                  <span className="font-bold">
                    {t("profile.bodyComp.cardioRiskNote")}
                  </span>{" "}
                  {metrics.whrRisk.risk}
                </p>
              </div>
            )}
          </div>

          {/* Quick Demographics & Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-border/50 space-y-2.5">
              <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                {t("profile.quickFacts.title")}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 text-xs">
                  <span className="text-muted-foreground">{t("profile.quickFacts.age")}</span>
                  <span className="font-bold">{profile?.age || "--"} {t("profile.meta.years")}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 text-xs">
                  <span className="text-muted-foreground">{t("profile.quickFacts.height")}</span>
                  <span className="font-bold">{profile?.height || "--"} cm</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 text-xs">
                  <span className="text-muted-foreground">{t("profile.quickFacts.gender")}</span>
                  <span className="font-bold capitalize">{profile?.gender || "--"}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 text-xs">
                  <span className="text-muted-foreground">{t("profile.quickFacts.workoutSchedule")}</span>
                  <span className="font-bold">{profile?.workoutDaysPerWeek || 0} {t("profile.quickFacts.daysPerWeek")}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-border/50 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  {isBn ? "প্রোফাইল স্ট্যাটাস" : "Fitness Commitment"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {isBn
                    ? "আপনার লক্ষ্য পূরণ করতে নিয়মিত খাবার এবং ওয়ার্কআউট ট্র্যাক করুন।"
                    : "Consistent tracking is the foundation of lasting transformation. Update measurements monthly to recalibrate your TDEE."}
                </p>
              </div>

              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px]">
                  {t("profile.developedBy")}{" "}
                  <a
                    href="https://www.rizmec.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
                  >
                    RIZMEC <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOnboardingOpen(true)}
                  className="h-7 text-xs font-bold text-primary"
                >
                  {t("profile.actions.editProfile")} &rarr;
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: TARGETS & MACROS                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "targets" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-border/50 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  {t("profile.targets.title")}
                </h3>
                {profile?.dailyCaloriesGoal && (
                  <Badge
                    variant="outline"
                    className="text-[10px] rounded-full border-primary/30 bg-primary/5 text-primary font-bold"
                  >
                    {t("profile.modal.customNotice")}
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => setGoalModalOpen(true)}
                className="rounded-xl text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground ml-auto"
              >
                <Sliders className="w-3.5 h-3.5" />
                {t("profile.actions.adjustTargets")}
              </Button>
            </div>

            {/* Macro Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
                <p className="text-[11px] font-bold text-orange-700 dark:text-orange-400">
                  {t("profile.targets.calories")}
                </p>
                <p className="text-lg sm:text-xl font-black text-orange-600 dark:text-orange-400 mt-1">
                  {macros?.dailyCaloriesGoal || profile?.dailyCaloriesGoal || "--"}{" "}
                  <span className="text-[10px] font-semibold text-muted-foreground">kcal</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {t("profile.targets.dailyTarget")}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  {t("profile.targets.protein")}
                </p>
                <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {macros?.dailyProteinGoal || profile?.dailyProteinGoal || "--"}
                  <span className="text-[10px] font-semibold text-muted-foreground ml-0.5">g</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {t("profile.targets.musclePreservation")}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                <p className="text-[11px] font-bold text-blue-700 dark:text-blue-400">
                  {t("profile.targets.carbs")}
                </p>
                <p className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  {macros?.dailyCarbGoal || profile?.dailyCarbGoal || "--"}
                  <span className="text-[10px] font-semibold text-muted-foreground ml-0.5">g</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {t("profile.targets.energySource")}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                <p className="text-[11px] font-bold text-purple-700 dark:text-purple-400">
                  {t("profile.targets.fat")}
                </p>
                <p className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  {macros?.dailyFatGoal || profile?.dailyFatGoal || "--"}
                  <span className="text-[10px] font-semibold text-muted-foreground ml-0.5">g</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {t("profile.targets.hormoneHealth")}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  {t("profile.targets.fiber")}
                </p>
                <p className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {macros?.dailyFiberGoal || profile?.dailyFiberGoal || "--"}
                  <span className="text-[10px] font-semibold text-muted-foreground ml-0.5">g</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {t("profile.targets.digestiveHealth")}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
                <p className="text-[11px] font-bold text-cyan-700 dark:text-cyan-400">
                  {t("profile.targets.water")}
                </p>
                <p className="text-lg sm:text-xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
                  {macros?.waterGoalMl || profile?.waterGoalMl || "--"}
                  <span className="text-[10px] font-semibold text-muted-foreground ml-0.5">ml</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {t("profile.targets.stayHydrated")}
                </p>
              </div>
            </div>

            {/* Macro Split Bar */}
            {pGoal && cGoal && fGoal && (
              <div className="pt-3 border-t border-border/40 space-y-2">
                <p className="text-xs font-bold text-foreground">
                  {t("profile.targets.macroDistribution")}
                </p>
                <div className="flex h-5 rounded-full overflow-hidden bg-muted">
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
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    {t("profile.targets.proteinPct", { pct: Math.round(proteinPct) })}
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                    {t("profile.targets.carbsPct", { pct: Math.round(carbsPct) })}
                  </span>
                  <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                    {t("profile.targets.fatPct", { pct: Math.round(fatPct) })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: MEASUREMENTS                                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "measurements" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-border/50 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                  {t("profile.measurements.title")}
                </h3>
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
                className="rounded-xl text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-600/90 text-white ml-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                {t("profile.actions.update")}
              </Button>
            </div>

            {!latest ? (
              <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border/50 bg-muted/20">
                <Ruler className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-bold text-foreground">
                  {t("profile.measurements.empty")}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  {t("profile.measurements.emptyHint")}
                </p>
                <Button
                  onClick={() => setMeasurementModalOpen(true)}
                  className="mt-4 rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-600/90 text-white text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t("profile.actions.logFirst")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {MEASUREMENT_CONFIG.map(({ key, label, icon }) => {
                  const val = latest?.[key];
                  const prevVal = previous?.[key] as number | undefined;
                  return (
                    <div
                      key={key}
                      className="group p-3 sm:p-3.5 rounded-2xl bg-muted/40 border border-border/30 hover:bg-muted/60 transition-colors relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                            <span className="text-sm">{icon}</span>
                            {t(label)}
                          </p>
                          <div className="flex items-baseline gap-1 mt-1.5">
                            <span className="text-lg sm:text-xl font-black tracking-tight">
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
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 4: AI COACH ASSESSMENT                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "ai" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="glass-card rounded-2xl sm:rounded-3xl border border-primary/20 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-black text-sm">{t("profile.ai.title")}</h3>
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
                className="rounded-xl gap-1.5 text-xs font-bold border-primary/30 text-primary hover:bg-primary/10 ml-auto"
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
              <div className="p-4 sm:p-6 space-y-5">
                {/* Metabolic Numbers Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
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
                      <p className="text-[10px] font-medium text-muted-foreground truncate">
                        {item.label}
                      </p>
                      <p className={`text-base sm:text-lg font-black ${item.color}`}>
                        {item.value}
                        <span className="text-[10px] font-semibold text-muted-foreground ml-0.5">
                          {item.unit}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>

                {/* Metabolic Summary */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/15 space-y-1.5">
                  <p className="text-xs leading-relaxed text-foreground">
                    {aiAssessment.metabolicProfile.metabolicSummary}
                  </p>
                  <p className="text-[11px] text-muted-foreground italic">
                    💡 {aiAssessment.metabolicProfile.metabolicOptimizationTip}
                  </p>
                </div>

                {/* Strategy Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Macro Strategy */}
                  <div className="space-y-3 p-3.5 sm:p-4 rounded-2xl bg-card/60 border border-border/40">
                    <h4 className="font-bold text-xs flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <Utensils className="w-3.5 h-3.5" />{" "}
                      {t("profile.ai.macroStrategy")}
                    </h4>
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
                          <p className={`text-sm sm:text-base font-black ${m.color}`}>
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
                  <div className="space-y-3 p-3.5 sm:p-4 rounded-2xl bg-card/60 border border-border/40">
                    <h4 className="font-bold text-xs flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                      <Dumbbell className="w-3.5 h-3.5" />{" "}
                      {t("profile.ai.trainingBlueprint")}
                    </h4>
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
                  <div className="space-y-3 p-3.5 sm:p-4 rounded-2xl bg-card/60 border border-border/40">
                    <h4 className="font-bold text-xs flex items-center gap-1.5 text-red-500 dark:text-red-400">
                      <Heart className="w-3.5 h-3.5" /> {t("profile.ai.longevity")}
                    </h4>
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
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-muted-foreground">
                <Brain className="w-8 h-8 mx-auto mb-2 text-primary/40 animate-pulse" />
                {t("profile.ai.loading")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 5: MILESTONES & HISTORY                                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "milestones" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-border/50 space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <h3 className="text-sm sm:text-base font-bold">
                {t("profile.milestones.title")}
              </h3>
            </div>

            {milestoneHistory.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border/50 bg-muted/20">
                <Trophy className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-bold text-foreground">
                  {t("profile.milestones.empty")}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  {t("profile.milestones.emptyHint")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {milestoneHistory.map((milestone) => {
                  const goalLabel =
                    milestone.goal === "lose_weight"
                      ? "🔥 Fat Loss"
                      : milestone.goal === "gain_muscle"
                        ? "💪 Muscle Gain"
                        : "⚖️ Maintenance";
                  const changeSign = milestone.weightChange > 0 ? "+" : "";
                  return (
                    <div
                      key={milestone._id || milestone.completedDate}
                      className="p-3.5 sm:p-4 rounded-2xl bg-muted/40 border border-border/30 hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {milestone.achievementBadge?.split(" ")[0] || "🏆"}
                          </span>
                          <div>
                            <p className="text-sm font-bold">{milestone.headline}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge
                                variant="secondary"
                                className="text-[10px] rounded-full bg-primary/10 text-primary border-0 font-bold"
                              >
                                {goalLabel}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {t("profile.milestones.completedOn")}{" "}
                                {new Date(milestone.completedDate).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric", year: "numeric" },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                        <div className="p-2 rounded-xl bg-background/60 text-center">
                          <p
                            className={cn(
                              "text-xs sm:text-sm font-black",
                              milestone.weightChange < 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : milestone.weightChange > 0
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-foreground",
                            )}
                          >
                            {changeSign}{milestone.weightChange} kg
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {t("profile.milestones.weightChange")}
                          </p>
                        </div>
                        <div className="p-2 rounded-xl bg-background/60 text-center">
                          <p className="text-xs sm:text-sm font-black text-purple-600 dark:text-purple-400">
                            {milestone.daysActive}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {t("profile.celebration.daysLabel")}
                          </p>
                        </div>
                        <div className="p-2 rounded-xl bg-background/60 text-center">
                          <p className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400">
                            {milestone.totalWorkoutsLogged}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {t("profile.celebration.workoutsLabel")}
                          </p>
                        </div>
                        <div className="hidden sm:block p-2 rounded-xl bg-background/60 text-center">
                          <p className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                            {milestone.totalMealsLogged}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {t("profile.celebration.mealsLabel")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Ad */}
      <div className="pt-2">
        <AdUnit size="auto" maxWidth="970px" />
      </div>
    </div>
  );
}
