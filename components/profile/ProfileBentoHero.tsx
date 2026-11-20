"use client";

import Image from "next/image";
import {
  Settings2,
  Scale,
  Target,
  Ruler,
  Activity,
  Calendar,
  CheckCircle2,
  Trophy,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/shared/I18nProvider";
import { cn } from "@/lib/utils";
import type { GoalCelebrationStats } from "@/lib/actions/goal-history.actions";

interface ProfileBentoHeroProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  avatarUrl?: string;
  celebrationStats: GoalCelebrationStats | null;
  onOpenOnboarding: () => void;
  onOpenGoalModal: () => void;
  onOpenMeasurementModal: () => void;
  onOpenCelebrationModal: () => void;
}

export default function ProfileBentoHero({
  data,
  avatarUrl,
  celebrationStats,
  onOpenOnboarding,
  onOpenGoalModal,
  onOpenMeasurementModal,
  onOpenCelebrationModal,
}: ProfileBentoHeroProps) {
  const { t } = useI18n();

  const profile = data?.profile;
  const metrics = data?.metrics;
  const macros = data?.macros;
  const labels = data?.labels;

  const weightProgress = metrics?.weightProgress;
  const progressPct =
    weightProgress?.progressPct ??
    (profile?.currentWeight &&
    profile?.targetWeight &&
    profile.currentWeight === profile.targetWeight
      ? 100
      : 0);
  const remainingKg =
    weightProgress?.remainingKg ??
    (profile?.currentWeight && profile?.targetWeight
      ? Math.abs(Math.round((profile.currentWeight - profile.targetWeight) * 10) / 10)
      : 0);
  const startWeight = weightProgress?.startWeight ?? profile?.currentWeight ?? 70;
  const currentWeight = weightProgress?.currentWeight ?? profile?.currentWeight ?? 70;
  const targetWeight = weightProgress?.targetWeight ?? profile?.targetWeight ?? 70;

  return (
    <div className="space-y-3.5 w-full max-w-full overflow-hidden">
      {/* Goal Achieved Celebration Banner */}
      {celebrationStats?.isGoalAchieved && (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-emerald-500/15 p-3.5 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 p-2 sm:p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/25 to-yellow-500/25 text-amber-500 shadow-xs">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-black text-amber-800 dark:text-amber-300 truncate">
                  {t("profile.celebration.goalAchievedBanner")}
                </p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                  {celebrationStats.headline}
                </p>
              </div>
            </div>
            <Button
              onClick={onOpenCelebrationModal}
              className="rounded-xl gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold shadow-md self-start sm:self-auto shrink-0 text-xs sm:text-sm"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {t("profile.celebration.viewCelebration")}
            </Button>
          </div>
        </div>
      )}

      {/* Main Bento Hero Card */}
      <div className="glass-card p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/60 relative overflow-hidden space-y-3.5 sm:space-y-4 shadow-xs">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4 relative">
          {/* User info left */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={profile?.name || t("profile.defaultName")}
                  width={128}
                  height={128}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-sm shadow-primary/20 ring-2 ring-primary/25"
                />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-emerald-600 flex items-center justify-center text-primary-foreground text-lg sm:text-2xl font-black shadow-sm shadow-primary/20 ring-2 ring-primary/25">
                  {profile?.name ? profile.name[0].toUpperCase() : "U"}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-base sm:text-xl font-black tracking-tight truncate">
                  {profile?.name || t("profile.defaultName")}
                </h2>
                <Badge
                  variant="secondary"
                  className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 font-black shrink-0"
                >
                  🎯 {labels?.goal || "Fitness"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-0.5 sm:gap-y-1 mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-medium capitalize truncate">
                  {profile?.gender} &middot; {profile?.age} {t("profile.meta.years")} &middot; {profile?.height} cm
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Activity className="w-3 h-3" />
                  {labels?.activity}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] shrink-0">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  {profile?.workoutDaysPerWeek} {t("profile.meta.workoutsPerWeek")}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Capsule Strip */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-muted/40 p-2 sm:p-2.5 rounded-2xl border border-border/40 shrink-0 w-full lg:w-auto">
            <div className="px-1.5 sm:px-2 text-center sm:text-left">
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                BMI
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <span className="text-xs sm:text-base font-black text-foreground">
                  {metrics?.bmi || "--"}
                </span>
                {metrics?.bmiCategory && (
                  <span className={cn("text-[9px] sm:text-[10px] font-bold truncate", metrics.bmiCategory.color)}>
                    {metrics.bmiCategory.label}
                  </span>
                )}
              </div>
            </div>
            <div className="px-1.5 sm:px-2 text-center sm:text-left border-l border-border/40">
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {t("profile.targets.calories")}
              </p>
              <p className="text-xs sm:text-base font-black text-orange-600 dark:text-orange-400 mt-0.5">
                {macros?.dailyCaloriesGoal || profile?.dailyCaloriesGoal || "--"}{" "}
                <span className="text-[8px] sm:text-[9px] text-muted-foreground font-normal">kcal</span>
              </p>
            </div>
            <div className="px-1.5 sm:px-2 text-center sm:text-left border-l border-border/40">
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {t("profile.targets.water")}
              </p>
              <p className="text-xs sm:text-base font-black text-cyan-600 dark:text-cyan-400 mt-0.5">
                {macros?.waterGoalMl || profile?.waterGoalMl || "--"}{" "}
                <span className="text-[8px] sm:text-[9px] text-muted-foreground font-normal">ml</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1 border-t border-border/40">
          <Button
            onClick={onOpenGoalModal}
            size="sm"
            className="rounded-xl gap-1 sm:gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs text-[11px] sm:text-xs h-8 sm:h-9 px-2 sm:px-3"
          >
            <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">{t("profile.actions.adjustTargets")}</span>
          </Button>
          <Button
            onClick={onOpenMeasurementModal}
            size="sm"
            className="rounded-xl gap-1 sm:gap-1.5 bg-emerald-600 hover:bg-emerald-600/90 text-white font-bold shadow-xs text-[11px] sm:text-xs h-8 sm:h-9 px-2 sm:px-3"
          >
            <Ruler className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">{t("profile.actions.update")}</span>
          </Button>
          <Button
            onClick={onOpenOnboarding}
            size="sm"
            variant="outline"
            className="rounded-xl gap-1 sm:gap-1.5 border-border/80 font-bold text-[11px] sm:text-xs h-8 sm:h-9 px-2 sm:px-3"
          >
            <Settings2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">{t("profile.actions.editProfile")}</span>
          </Button>
        </div>

        {/* Weight Journey Progress Bar */}
        {profile?.targetWeight && (
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent border border-primary/20 space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
              <span className="flex items-center gap-1 font-bold text-foreground text-[11px] sm:text-xs">
                <Scale className="w-3.5 h-3.5 text-primary shrink-0" />
                {t("profile.weightProgress.title")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium text-[10px] sm:text-[11px]">
                  Remaining: <strong className="text-foreground font-black">{remainingKg} kg</strong>
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-black bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px]">
                  {progressPct}%
                </span>
              </div>
            </div>
            <div className="w-full bg-muted/60 h-2 sm:h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] sm:text-[10px] text-muted-foreground font-semibold pt-0.5">
              <span>Start: {startWeight} kg</span>
              <span className="font-bold text-foreground">Current: {currentWeight} kg</span>
              <span>Target: {targetWeight} kg</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
