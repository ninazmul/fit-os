"use client";

import {
  Brain,
  Sparkles,
  RefreshCw,
  Utensils,
  Dumbbell,
  Heart,
  ChevronRight,
  History,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/shared/I18nProvider";
import { cn } from "@/lib/utils";
import type { AIProfileAssessmentData } from "@/lib/actions/ai-profile.actions";
import type { IGoalHistory } from "@/types/fitness";

interface AICoachMilestonesTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  aiAssessment: AIProfileAssessmentData | null;
  aiAssessmentLoading: boolean;
  onRefreshAIAssessment: () => Promise<void>;
  milestoneHistory: IGoalHistory[];
}

export default function AICoachMilestonesTab({
  data,
  aiAssessment,
  aiAssessmentLoading,
  onRefreshAIAssessment,
  milestoneHistory,
}: AICoachMilestonesTabProps) {
  const { t, locale } = useI18n();
  const isBn = locale === "bn";
  const macros = data?.macros;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Gemini AI Coach Card */}
      <div className="glass-card rounded-2xl sm:rounded-3xl border border-primary/20 overflow-hidden shadow-xs">
        <div className="bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/40">
          <div className="flex flex-wrap items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-black text-sm">{t("profile.ai.title")}</h3>
              <p className="text-[10px] text-muted-foreground">
                {t("profile.ai.subtitle")}
              </p>
            </div>
            {aiAssessment?.displayBadge && (
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold border-primary/30"
              >
                {aiAssessment.displayBadge}
              </Badge>
            )}
            {aiAssessment?.isAIGenerated && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Gemini
              </span>
            )}
          </div>
          <Button
            onClick={onRefreshAIAssessment}
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

        {/* Staleness Warning Banner */}
        {aiAssessment?.isStale && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-amber-900 dark:text-amber-200 text-[11px]">
                Your weight or measurements have updated since this assessment was generated ({aiAssessment.displayBadge || "previous metrics"}).
              </span>
            </div>
            <Button
              size="sm"
              onClick={onRefreshAIAssessment}
              disabled={aiAssessmentLoading}
              className="rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 h-7 self-start sm:self-auto"
            >
              Recalibrate
            </Button>
          </div>
        )}

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
                      {t("profile.ai.preWorkout")}:{" "}
                    </span>
                    <span className="text-muted-foreground">
                      {aiAssessment.macroStrategy.timing.preworkout}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {t("profile.ai.postWorkout")}:{" "}
                    </span>
                    <span className="text-muted-foreground">
                      {aiAssessment.macroStrategy.timing.postworkout}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {t("profile.ai.lastMeal")}:{" "}
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
                        <ChevronRight className="w-3 h-3 text-purple-500 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{day}</span>
                      </div>
                    ),
                  )}
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
                  <p className="text-[9px] text-muted-foreground/75 leading-tight">
                    Screening estimate based on waist-to-hip / waist-to-height ratios.
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
                        <span className="text-emerald-500 shrink-0 mt-0.5">
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

            {/* Localized Bangladeshi High-Protein Food Sources */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                  <Utensils className="w-3.5 h-3.5 text-primary" />
                  {isBn
                    ? "সহজলভ্য উচ্চ-প্রোটিন দেশীয় খাদ্য উৎস"
                    : "Bangladeshi High-Protein Food Staples (Hit 100g+ Protein Locally)"}
                </h4>
                <span className="text-[10px] text-primary font-bold">
                  Goal: {macros?.dailyProteinGoal || 113}g/day
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-background/70 border border-border/40 space-y-0.5">
                  <p className="font-bold text-foreground">🥚 Eggs (ডিম)</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">~6g / egg</p>
                  <p className="text-[9px] text-muted-foreground">2-3 eggs = 12-18g</p>
                </div>
                <div className="p-2.5 rounded-xl bg-background/70 border border-border/40 space-y-0.5">
                  <p className="font-bold text-foreground">🍲 Dal (মসুর ডাল)</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">~9g / cup</p>
                  <p className="text-[9px] text-muted-foreground">Thick dal</p>
                </div>
                <div className="p-2.5 rounded-xl bg-background/70 border border-border/40 space-y-0.5">
                  <p className="font-bold text-foreground">🌱 Soya Chunks</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">~52g / 100g</p>
                  <p className="text-[9px] text-muted-foreground">Budget superfood</p>
                </div>
                <div className="p-2.5 rounded-xl bg-background/70 border border-border/40 space-y-0.5">
                  <p className="font-bold text-foreground">🥗 Chola (ছোলা)</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">~15g / cup</p>
                  <p className="text-[9px] text-muted-foreground">Boiled snack</p>
                </div>
                <div className="p-2.5 rounded-xl bg-background/70 border border-border/40 space-y-0.5">
                  <p className="font-bold text-foreground">🐟 Fish (মাছ)</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">~18-22g / 100g</p>
                  <p className="text-[9px] text-muted-foreground">Rui, Katla</p>
                </div>
                <div className="p-2.5 rounded-xl bg-background/70 border border-border/40 space-y-0.5">
                  <p className="font-bold text-foreground">🍗 Chicken (মুরগি)</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">~25-30g / 100g</p>
                  <p className="text-[9px] text-muted-foreground">Breast / curry</p>
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

      {/* 2. Milestones & Achievements Trophy Shelf */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-border/50 space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="text-sm sm:text-base font-bold">
            {t("profile.milestones.title")}
          </h3>
        </div>

        {milestoneHistory.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border-2 border-dashed border-border/50 bg-muted/20">
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
  );
}
