"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateRecommendedMacros,
  updateNutritionTargets,
} from "@/lib/actions/profile.actions";
import { notifyDataUpdated } from "@/lib/events";
import { useI18n } from "@/components/shared/I18nProvider";
import type { PrimaryGoal, ActivityLevel, Gender, IUserProfile } from "@/types/fitness";
import {
  Target,
  Flame,
  Scale,
  Dumbbell,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  Droplet,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface GoalTargetsEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: IUserProfile | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recommendedMacros?: any;
  onSaved?: () => void | Promise<void>;
}

type ProteinTier = "balanced" | "fitness" | "athlete" | "custom";

export default function GoalTargetsEditorModal({
  open,
  onOpenChange,
  profile,
  recommendedMacros,
  onSaved,
}: GoalTargetsEditorModalProps) {
  const { t } = useI18n();

  // Core Goal & Biometrics
  const [goal, setGoal] = useState<PrimaryGoal>("lose_weight");
  const [targetWeight, setTargetWeight] = useState<number>(65);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [workoutDaysPerWeek, setWorkoutDaysPerWeek] = useState<number>(4);

  // Protein preference tier
  const [proteinTier, setProteinTier] = useState<ProteinTier>("fitness");
  const [proteinRatio, setProteinRatio] = useState<number>(1.6);

  // Calorie pace adjustment preset (e.g. -450, 0, +300)
  const [calorieAdjustment, setCalorieAdjustment] = useState<number>(-450);

  // Active editable targets
  const [calories, setCalories] = useState<number>(2000);
  const [protein, setProtein] = useState<number>(120);
  const [carbs, setCarbs] = useState<number>(200);
  const [fat, setFat] = useState<number>(60);
  const [fiber, setFiber] = useState<number>(30);
  const [waterMl, setWaterMl] = useState<number>(3000);

  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  // Initialize from current profile when opened
  useEffect(() => {
    if (!open || !profile) return;

    setGoal(profile.goal || "lose_weight");
    setTargetWeight(profile.targetWeight || profile.currentWeight || 65);
    setActivityLevel((profile.activityLevel as ActivityLevel) || "moderate");
    setWorkoutDaysPerWeek(profile.workoutDaysPerWeek ?? 4);

    // Initial targets (prefer real saved user targets)
    setCalories(profile.dailyCaloriesGoal || recommendedMacros?.dailyCaloriesGoal || 2000);
    setProtein(profile.dailyProteinGoal || recommendedMacros?.dailyProteinGoal || 120);
    setCarbs(profile.dailyCarbGoal || recommendedMacros?.dailyCarbGoal || 200);
    setFat(profile.dailyFatGoal || recommendedMacros?.dailyFatGoal || 60);
    setFiber(profile.dailyFiberGoal || recommendedMacros?.dailyFiberGoal || 30);
    setWaterMl(profile.waterGoalMl || recommendedMacros?.waterGoalMl || 3000);

    // Derive approximate protein tier
    const curW = profile.currentWeight || 70;
    const ratio = (profile.dailyProteinGoal || 120) / curW;
    if (Math.abs(ratio - 1.2) < 0.15) {
      setProteinTier("balanced");
      setProteinRatio(1.2);
    } else if (Math.abs(ratio - 1.6) < 0.15) {
      setProteinTier("fitness");
      setProteinRatio(1.6);
    } else if (Math.abs(ratio - 2.0) < 0.15) {
      setProteinTier("athlete");
      setProteinRatio(2.0);
    } else {
      setProteinTier("custom");
      setProteinRatio(Math.round(ratio * 10) / 10);
    }

    if (profile.goal === "lose_weight") {
      setCalorieAdjustment(-450);
    } else if (profile.goal === "gain_muscle") {
      setCalorieAdjustment(350);
    } else {
      setCalorieAdjustment(0);
    }
  }, [open, profile, recommendedMacros]);

  // Handle switching Goal
  const handleSelectGoal = (newGoal: PrimaryGoal) => {
    setGoal(newGoal);
    let defaultAdj = 0;
    let defaultTier: ProteinTier = "fitness";
    let defaultRatio = 1.6;

    if (newGoal === "lose_weight") {
      defaultAdj = -450;
      defaultTier = "fitness";
      defaultRatio = 1.6;
    } else if (newGoal === "gain_muscle") {
      defaultAdj = 350;
      defaultTier = "athlete";
      defaultRatio = 2.0;
    } else {
      defaultAdj = 0;
      defaultTier = "balanced";
      defaultRatio = 1.2;
    }

    setCalorieAdjustment(defaultAdj);
    setProteinTier(defaultTier);
    setProteinRatio(defaultRatio);

    // Auto recalculate smart suggestions
    handleComputeSuggestion({
      goalOverride: newGoal,
      proteinRatioOverride: defaultRatio,
      calorieAdjustmentOverride: defaultAdj,
    });
  };

  // Handle protein tier click
  const handleSelectProteinTier = (tier: ProteinTier) => {
    setProteinTier(tier);
    let ratio = 1.6;
    if (tier === "balanced") ratio = 1.2;
    else if (tier === "fitness") ratio = 1.6;
    else if (tier === "athlete") ratio = 2.0;
    else return; // custom leaves current grams editable

    setProteinRatio(ratio);
    handleComputeSuggestion({ proteinRatioOverride: ratio });
  };

  // Scientific suggestion calculator
  const handleComputeSuggestion = async (overrides?: {
    goalOverride?: PrimaryGoal;
    proteinRatioOverride?: number;
    calorieAdjustmentOverride?: number;
  }) => {
    if (!profile) return;
    try {
      setSuggesting(true);
      const computed = await calculateRecommendedMacros({
        gender: (profile.gender as Gender) || "male",
        age: profile.age || 25,
        height: profile.height || 170,
        currentWeight: profile.currentWeight || 70,
        targetWeight,
        activityLevel,
        goal: overrides?.goalOverride || goal,
        proteinRatio: overrides?.proteinRatioOverride ?? proteinRatio,
        calorieAdjustment:
          overrides?.calorieAdjustmentOverride ?? calorieAdjustment,
      });

      setCalories(computed.dailyCaloriesGoal);
      setProtein(computed.dailyProteinGoal);
      setCarbs(computed.dailyCarbGoal);
      setFat(computed.dailyFatGoal);
      setFiber(computed.dailyFiberGoal);
      setWaterMl(computed.waterGoalMl);
    } catch (e) {
      console.error("Suggestion error:", e);
    } finally {
      setSuggesting(false);
    }
  };

  // Macro split percentage
  const totalCalsFromMacros = protein * 4 + carbs * 4 + fat * 9;
  const safeTotal = Math.max(1, totalCalsFromMacros);
  const proteinPct = Math.round(((protein * 4) / safeTotal) * 100);
  const carbsPct = Math.round(((carbs * 4) / safeTotal) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

  // Weight delta
  const currentWeight = profile?.currentWeight || 70;
  const weightDiff = Math.round((targetWeight - currentWeight) * 10) / 10;

  // Save handler
  const handleSave = async () => {
    try {
      setSaving(true);
      await updateNutritionTargets({
        goal,
        targetWeight,
        activityLevel,
        workoutDaysPerWeek,
        dailyCaloriesGoal: calories,
        dailyProteinGoal: protein,
        dailyFatGoal: fat,
        dailyCarbGoal: carbs,
        dailyFiberGoal: fiber,
        waterGoalMl: waterMl,
      });

      notifyDataUpdated("all");
      toast.success(t("profile.modal.targetsSaved"));
      onOpenChange(false);
      await onSaved?.();
    } catch {
      toast.error(t("profile.modal.targetsSaveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-3xl p-6 max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {t("profile.modal.goalTargetsTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t("profile.modal.goalTargetsDesc")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* 1. Goal Selection Cards */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>{t("profile.modal.chooseGoal")}</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                {goal === "lose_weight"
                  ? "Deficit: ~0.5 kg/wk"
                  : goal === "gain_muscle"
                    ? "Surplus: Lean gain"
                    : "Maintenance: Balance"}
              </span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Lose Weight */}
              <button
                type="button"
                onClick={() => handleSelectGoal("lose_weight")}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  goal === "lose_weight"
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/60 hover:bg-muted/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                  {goal === "lose_weight" && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">
                    {t("profile.modal.loseWeight")}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                    {t("profile.modal.loseWeightDesc")}
                  </p>
                </div>
              </button>

              {/* Maintain */}
              <button
                type="button"
                onClick={() => handleSelectGoal("maintain")}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  goal === "maintain"
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/60 hover:bg-muted/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Scale className="w-4 h-4" />
                  </div>
                  {goal === "maintain" && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">
                    {t("profile.modal.maintain")}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                    {t("profile.modal.maintainDesc")}
                  </p>
                </div>
              </button>

              {/* Gain Muscle */}
              <button
                type="button"
                onClick={() => handleSelectGoal("gain_muscle")}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  goal === "gain_muscle"
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/60 hover:bg-muted/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  {goal === "gain_muscle" && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">
                    {t("profile.modal.gainMuscle")}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                    {t("profile.modal.gainMuscleDesc")}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Target Weight, Activity, and Workout Days */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border/40">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Target Weight (kg)
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.5"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(Number(e.target.value))}
                  className="rounded-xl font-bold pr-12"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                  kg
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Current: {currentWeight} kg (
                {weightDiff < 0
                  ? `${weightDiff} kg`
                  : weightDiff > 0
                    ? `+${weightDiff} kg`
                    : "At target"}
                )
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Activity Level
              </Label>
              <Select
                value={activityLevel}
                onValueChange={(v) => {
                  setActivityLevel(v as ActivityLevel);
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (Desk job)</SelectItem>
                  <SelectItem value="light">Light (1-3 days)</SelectItem>
                  <SelectItem value="moderate">Moderate (3-5 days)</SelectItem>
                  <SelectItem value="active">Active (6-7 days)</SelectItem>
                  <SelectItem value="very_active">Very Active (Athlete)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Workouts / Week
              </Label>
              <Input
                type="number"
                min="0"
                max="7"
                value={workoutDaysPerWeek}
                onChange={(e) => setWorkoutDaysPerWeek(Number(e.target.value))}
                className="rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground">
                Training days (0 to 7)
              </p>
            </div>
          </div>

          {/* 3. Protein Level Preference — NO FORCED 2.0x! */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground">
                {t("profile.modal.proteinLevel")}
              </Label>
              <span className="text-[10px] text-primary font-semibold">
                {Math.round(currentWeight * proteinRatio)}g protein for {currentWeight}kg
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Balanced: 1.2 */}
              <button
                type="button"
                onClick={() => handleSelectProteinTier("balanced")}
                className={cn(
                  "p-2.5 rounded-xl border text-left transition-all text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  proteinTier === "balanced"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs"
                    : "border-border/60 hover:bg-muted/40 text-muted-foreground",
                )}
              >
                <p className="text-[11px] font-bold">🌿 Balanced</p>
                <p className="text-[10px] opacity-80">1.2 g/kg</p>
              </button>

              {/* Fitness: 1.6 */}
              <button
                type="button"
                onClick={() => handleSelectProteinTier("fitness")}
                className={cn(
                  "p-2.5 rounded-xl border text-left transition-all text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  proteinTier === "fitness"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                    : "border-border/60 hover:bg-muted/40 text-muted-foreground",
                )}
              >
                <p className="text-[11px] font-bold">🏃 Fitness & Cut</p>
                <p className="text-[10px] opacity-80">1.6 g/kg (Optimal)</p>
              </button>

              {/* Athlete: 2.0 */}
              <button
                type="button"
                onClick={() => handleSelectProteinTier("athlete")}
                className={cn(
                  "p-2.5 rounded-xl border text-left transition-all text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  proteinTier === "athlete"
                    ? "border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold shadow-2xs"
                    : "border-border/60 hover:bg-muted/40 text-muted-foreground",
                )}
              >
                <p className="text-[11px] font-bold">💪 Athlete</p>
                <p className="text-[10px] opacity-80">2.0 g/kg (Hypertrophy)</p>
              </button>

              {/* Custom */}
              <button
                type="button"
                onClick={() => setProteinTier("custom")}
                className={cn(
                  "p-2.5 rounded-xl border text-left transition-all text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  proteinTier === "custom"
                    ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold shadow-2xs"
                    : "border-border/60 hover:bg-muted/40 text-muted-foreground",
                )}
              >
                <p className="text-[11px] font-bold">✍️ Custom</p>
                <p className="text-[10px] opacity-80">Manual entry</p>
              </button>
            </div>
          </div>

          {/* 4. "Suggest for My Goal" action */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent border border-primary/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold leading-tight">
                  Scientific Macro Suggestion
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Mifflin-St Jeor BMR with goal deficit and protein ratio
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={suggesting}
              onClick={() => handleComputeSuggestion()}
              className="rounded-xl text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <RotateCcw className={cn("w-3.5 h-3.5", suggesting && "animate-spin")} />
              {t("profile.modal.suggestButton")}
            </Button>
          </div>

          {/* 5. Live Macro Distribution Bar */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-muted/40 border border-border/40">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Sliders className="w-3.5 h-3.5 text-primary" />
                {t("profile.modal.macroBalance")}
              </span>
              <span className="text-[11px] font-mono">
                {totalCalsFromMacros} kcal from macros (Target: {calories} kcal)
              </span>
            </div>

            <div className="flex h-3.5 rounded-full overflow-hidden bg-muted/80 p-0.5">
              <div
                className="bg-emerald-500 h-full rounded-l-full transition-all duration-300"
                style={{ width: `${proteinPct}%` }}
              />
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${carbsPct}%` }}
              />
              <div
                className="bg-purple-500 h-full rounded-r-full transition-all duration-300 flex-1"
                style={{ width: `${fatPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-medium pt-0.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                Protein {proteinPct}% ({protein}g)
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                Carbs {carbsPct}% ({carbs}g)
              </span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">
                Fat {fatPct}% ({fat}g)
              </span>
            </div>
          </div>

          {/* 6. Fine-Tuning Direct Target Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Calories */}
            <div className="p-3 rounded-2xl bg-orange-500/5 border border-orange-500/20 space-y-1">
              <Label className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
                Daily Calories (kcal)
              </Label>
              <Input
                type="number"
                step="25"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="rounded-xl font-bold text-orange-600 dark:text-orange-400 text-base"
              />
            </div>

            {/* Protein */}
            <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
              <Label className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                Protein (g)
              </Label>
              <Input
                type="number"
                step="5"
                value={protein}
                onChange={(e) => {
                  setProtein(Number(e.target.value));
                  setProteinTier("custom");
                }}
                className="rounded-xl font-bold text-emerald-600 dark:text-emerald-400 text-base"
              />
            </div>

            {/* Carbs */}
            <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-1">
              <Label className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                Carbs (g)
              </Label>
              <Input
                type="number"
                step="5"
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                className="rounded-xl font-bold text-blue-600 dark:text-blue-400 text-base"
              />
            </div>

            {/* Fat */}
            <div className="p-3 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-1">
              <Label className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                Fat (g)
              </Label>
              <Input
                type="number"
                step="2"
                value={fat}
                onChange={(e) => setFat(Number(e.target.value))}
                className="rounded-xl font-bold text-purple-600 dark:text-purple-400 text-base"
              />
            </div>

            {/* Fiber */}
            <div className="p-3 rounded-2xl bg-teal-500/5 border border-teal-500/20 space-y-1">
              <Label className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                Fiber (g)
              </Label>
              <Input
                type="number"
                step="1"
                value={fiber}
                onChange={(e) => setFiber(Number(e.target.value))}
                className="rounded-xl font-bold text-teal-600 dark:text-teal-400 text-base"
              />
            </div>

            {/* Water */}
            <div className="p-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-1">
              <Label className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                <Droplet className="w-3 h-3" /> Water (ml)
              </Label>
              <Input
                type="number"
                step="100"
                value={waterMl}
                onChange={(e) => setWaterMl(Number(e.target.value))}
                className="rounded-xl font-bold text-cyan-600 dark:text-cyan-400 text-base"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]"
            >
              {saving ? t("profile.modal.savingTargets") : t("profile.modal.saveTargets")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
