"use client";

import {
  Scale,
  Zap,
  Flame,
  Heart,
  ShieldCheck,
  Target,
  Sliders,
  Award,
  ExternalLink,
  Dumbbell,
  Info,
} from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/shared/I18nProvider";
import { cn } from "@/lib/utils";

interface VitalsTargetsTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  onOpenGoalModal: () => void;
  onOpenOnboarding: () => void;
}

export default function VitalsTargetsTab({
  data,
  onOpenGoalModal,
  onOpenOnboarding,
}: VitalsTargetsTabProps) {
  const { t, locale } = useI18n();
  const isBn = locale === "bn";

  const profile = data?.profile;
  const metrics = data?.metrics;
  const macros = data?.macros;

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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Core Vitals Grid: Weight, BMI, BMR, TDEE */}
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
                <span className="text-xl sm:text-2xl font-black tracking-tight">
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
            <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border/40 font-medium">
              <span className="font-bold">
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

      {/* 2. Macro & Calorie Targets Card */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-border/50 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              {t("profile.targets.title")}
            </h3>
            {profile?.useCustomMacros ? (
              <Badge
                variant="outline"
                className="text-[10px] rounded-full border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold"
              >
                {t("profile.modal.customNotice")}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] rounded-full border-primary/30 bg-primary/5 text-primary font-bold"
              >
                🎯 {isBn ? "স্বয়ংক্রিয় হিসাব (TDEE)" : "Auto TDEE Synced"}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            onClick={onOpenGoalModal}
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

        {/* Macro Split Distribution Bar */}
        {pGoal && cGoal && fGoal && (
          <div className="pt-3 border-t border-border/40 space-y-2">
            <p className="text-xs font-bold text-foreground">
              {t("profile.targets.macroDistribution")}
            </p>
            <div className="flex h-4 rounded-full overflow-hidden bg-muted/60">
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

      {/* 3. Body Composition: Body Fat %, Lean Mass, Fat Mass, WHR, WHtR */}
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
          {/* Body Fat % */}
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30 space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground">
              {t("profile.bodyComp.bodyFat")}
            </p>
            <p className="text-lg sm:text-xl font-bold text-pink-600 dark:text-pink-400">
              {metrics?.bodyFatPct !== null && metrics?.bodyFatPct !== undefined
                ? `${metrics.bodyFatPct}%`
                : "--"}
            </p>
            {metrics?.bodyFatRange && (
              <p className="text-[10px] text-muted-foreground font-semibold">
                Range: {metrics.bodyFatRange.min}% – {metrics.bodyFatRange.max}%
              </p>
            )}
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
            <p className="text-[9px] text-muted-foreground/80 leading-tight">
              Navy est. (±3–4% variance)
            </p>
          </div>

          {/* Lean Mass */}
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30 space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground">
              {t("profile.bodyComp.leanMass")}
            </p>
            <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics?.leanMass !== null && metrics?.leanMass !== undefined
                ? `${metrics.leanMass} kg`
                : "--"}
            </p>
            {data?.bodyCompChangeSinceFirst?.leanMassChange !== null &&
            data?.bodyCompChangeSinceFirst?.leanMassChange !== undefined ? (
              <p
                className={cn(
                  "text-[10px] font-bold",
                  data.bodyCompChangeSinceFirst.leanMassChange >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400",
                )}
              >
                {data.bodyCompChangeSinceFirst.leanMassChange > 0 ? "+" : ""}
                {data.bodyCompChangeSinceFirst.leanMassChange} kg vs start
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                {t("profile.bodyComp.leanMassHint")}
              </p>
            )}
          </div>

          {/* Fat Mass */}
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30 space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground">
              {t("profile.bodyComp.fatMass")}
            </p>
            <p className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">
              {metrics?.fatMass !== null && metrics?.fatMass !== undefined
                ? `${metrics.fatMass} kg`
                : "--"}
            </p>
            {data?.bodyCompChangeSinceFirst?.fatMassChange !== null &&
            data?.bodyCompChangeSinceFirst?.fatMassChange !== undefined ? (
              <p
                className={cn(
                  "text-[10px] font-bold",
                  data.bodyCompChangeSinceFirst.fatMassChange <= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {data.bodyCompChangeSinceFirst.fatMassChange > 0 ? "+" : ""}
                {data.bodyCompChangeSinceFirst.fatMassChange} kg vs start
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                {t("profile.bodyComp.fatMassHint")}
              </p>
            )}
          </div>

          {/* WHR */}
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

          {/* WHtR */}
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

      {/* 4. Suggested Realism Check Adjustment (if flagged) */}
      {data?.suggestedAdjustment?.flag && (
        <div
          className={cn(
            "p-4 rounded-2xl border space-y-2.5",
            data.suggestedAdjustment.flag === "under_logging_or_low_tdee"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100"
              : data.suggestedAdjustment.flag === "rapid_loss"
                ? "bg-blue-500/10 border-blue-500/30 text-blue-950 dark:text-blue-100"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100",
          )}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              Suggested Target Adjustment (14-Day Realism Check)
            </h4>
            <Badge
              variant="outline"
              className="text-[10px] font-bold rounded-full bg-background/50 border-current"
            >
              {data.suggestedAdjustment.flag === "under_logging_or_low_tdee"
                ? "Plateau / Real TDEE Check"
                : data.suggestedAdjustment.flag === "rapid_loss"
                  ? "Pace Too Fast"
                  : "Pace On Track"}
            </Badge>
          </div>

          <p className="text-xs leading-relaxed">
            {data.suggestedAdjustment.message}
          </p>

          <div className="p-2.5 rounded-xl bg-background/60 border border-border/40 text-[11px] space-y-1">
            <p className="font-bold text-foreground">
              💡 Action: {data.suggestedAdjustment.suggestedAction}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Multipliers and BMR are formula estimates. Metabolism adapts dynamically; compare real weekly weight change to tune targets.
            </p>
          </div>
        </div>
      )}

      {/* 5. Workout Logging Prompt (if needed) */}
      {data?.workoutStatus?.needsWorkoutLog && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                {isBn
                  ? `এই সপ্তাহে ${profile?.workoutDaysPerWeek || 0}টি ওয়ার্কআউট পরিকল্পিত`
                  : `${profile?.workoutDaysPerWeek || 0} Workouts Planned This Week`}
              </p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                {isBn
                  ? "এই সপ্তাহে এখনও কোনো সেশন লগ করা হয়নি। ধারাবাহিকতা ধরে রাখতে আপনার ওয়ার্কআউট লগ করুন!"
                  : "You haven't logged any sessions yet this week. Remember to log your workouts to maintain your consistency streak!"}
              </p>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            className="rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white text-xs shrink-0 self-start sm:self-auto"
          >
            <a href="/workout">Log Workout</a>
          </Button>
        </div>
      )}

      {/* 6. Fitness Commitment & App Meta */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-border/50 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              {isBn ? "ফিটনেস অঙ্গীকার" : "Fitness Commitment"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {isBn
                ? "আপনার লক্ষ্য পূরণ করতে নিয়মিত খাবার এবং ওয়ার্কআউট ট্র্যাক করুন।"
                : "Consistent tracking is the foundation of lasting transformation. Update measurements monthly to recalibrate your TDEE."}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenOnboarding}
            className="h-8 text-xs font-bold text-primary shrink-0"
          >
            {t("profile.actions.editProfile")} &rarr;
          </Button>
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
          <span className="text-muted-foreground text-[11px]">
            Schedule: {profile?.workoutDaysPerWeek || 0} {t("profile.quickFacts.daysPerWeek")}
          </span>
        </div>
      </div>
    </div>
  );
}
