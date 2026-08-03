"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateRecommendedMacros, createOrUpdateProfile } from "@/lib/actions/profile.actions";
import type { Gender, ActivityLevel, PrimaryGoal } from "@/types/fitness";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void | Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
}

export default function OnboardingModal({
  open,
  onOpenChange,
  onCompleted,
  initialData,
}: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(initialData?.name || "");
  const [gender, setGender] = useState<Gender>(initialData?.gender || "male");
  const [age, setAge] = useState<number>(initialData?.age || 25);
  const [height, setHeight] = useState<number>(initialData?.height || 170);
  const [currentWeight, setCurrentWeight] = useState<number>(initialData?.currentWeight || 70);
  const [targetWeight, setTargetWeight] = useState<number>(initialData?.targetWeight || 65);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(initialData?.activityLevel || "moderate");
  const [goal, setGoal] = useState<PrimaryGoal>(initialData?.goal || "lose_weight");
  const [workoutDaysPerWeek, setWorkoutDaysPerWeek] = useState<number>(initialData?.workoutDaysPerWeek || 4);

  // Targets (Auto-calculated on step 2, editable)
  const [dailyCaloriesGoal, setDailyCaloriesGoal] = useState<number>(initialData?.dailyCaloriesGoal || 2000);
  const [dailyProteinGoal, setDailyProteinGoal] = useState<number>(initialData?.dailyProteinGoal || 150);
  const [dailyFatGoal, setDailyFatGoal] = useState<number>(initialData?.dailyFatGoal || 60);
  const [dailyCarbGoal, setDailyCarbGoal] = useState<number>(initialData?.dailyCarbGoal || 200);
  const [dailyFiberGoal, setDailyFiberGoal] = useState<number>(initialData?.dailyFiberGoal || 30);
  const [waterGoalMl, setWaterGoalMl] = useState<number>(initialData?.waterGoalMl || 3000);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open || !initialData) return;

    setStep(1);
    setName(initialData.name || "");
    setGender(initialData.gender || "male");
    setAge(initialData.age || 25);
    setHeight(initialData.height || 170);
    setCurrentWeight(initialData.currentWeight || 70);
    setTargetWeight(initialData.targetWeight || 65);
    setActivityLevel(initialData.activityLevel || "moderate");
    setGoal(initialData.goal || "lose_weight");
    setWorkoutDaysPerWeek(initialData.workoutDaysPerWeek || 4);
    setDailyCaloriesGoal(initialData.dailyCaloriesGoal || 2000);
    setDailyProteinGoal(initialData.dailyProteinGoal || 150);
    setDailyFatGoal(initialData.dailyFatGoal || 60);
    setDailyCarbGoal(initialData.dailyCarbGoal || 200);
    setDailyFiberGoal(initialData.dailyFiberGoal || 30);
    setWaterGoalMl(initialData.waterGoalMl || 3000);
  }, [open, initialData]);

  const handleNextToTargets = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    const calculated = await calculateRecommendedMacros({
      gender,
      age,
      height,
      currentWeight,
      activityLevel,
      goal,
    });

    setDailyCaloriesGoal(calculated.dailyCaloriesGoal);
    setDailyProteinGoal(calculated.dailyProteinGoal);
    setDailyFatGoal(calculated.dailyFatGoal);
    setDailyCarbGoal(calculated.dailyCarbGoal);
    setDailyFiberGoal(calculated.dailyFiberGoal);
    setWaterGoalMl(calculated.waterGoalMl);

    setStep(2);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await createOrUpdateProfile({
        name,
        gender,
        age,
        height,
        currentWeight,
        targetWeight,
        activityLevel,
        goal,
        workoutDaysPerWeek,
        dailyCaloriesGoal,
        dailyProteinGoal,
        dailyFatGoal,
        dailyCarbGoal,
        dailyFiberGoal,
        waterGoalMl,
        unitSystem: "metric",
      });

      toast.success("Profile saved! Welcome to FitOS 💪");
      onOpenChange(false);
      await onCompleted?.();
      router.refresh();
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            {step === 1 ? "Welcome to FitOS! 👋" : "Your Recommended Goals 🎯"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {step === 1
              ? "Tell us about yourself so we can calculate your ideal nutrition & fitness targets."
              : "We calculated these recommended daily targets based on your profile. You can manually adjust them below."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Full Name</Label>
              <Input
                placeholder="e.g. Alex Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Gender</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Age</Label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Height (cm)</Label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Current (kg)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(Number(e.target.value))}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Target (kg)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(Number(e.target.value))}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Primary Goal</Label>
                <Select value={goal} onValueChange={(v) => setGoal(v as PrimaryGoal)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose_weight">Lose Weight 🔥</SelectItem>
                    <SelectItem value="gain_muscle">Gain Muscle 💪</SelectItem>
                    <SelectItem value="maintain">Maintain Weight ⚖️</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Activity Level</Label>
                <Select value={activityLevel} onValueChange={(v) => setActivityLevel(v as ActivityLevel)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (Office/Desk)</SelectItem>
                    <SelectItem value="light">Light (1-3 days/wk)</SelectItem>
                    <SelectItem value="moderate">Moderate (3-5 days/wk)</SelectItem>
                    <SelectItem value="active">Active (6-7 days/wk)</SelectItem>
                    <SelectItem value="very_active">Very Active (Athlete/Physical Job)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Planned Workout Days per Week</Label>
              <Input
                type="number"
                min="0"
                max="7"
                value={workoutDaysPerWeek}
                onChange={(e) => setWorkoutDaysPerWeek(Number(e.target.value))}
                className="rounded-xl"
              />
            </div>

            <Button onClick={handleNextToTargets} className="w-full rounded-xl mt-2 bg-primary hover:bg-primary/90">
              Calculate Recommended Goals &rarr;
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Daily Calories Goal</Label>
                <Input
                  type="number"
                  value={dailyCaloriesGoal}
                  onChange={(e) => setDailyCaloriesGoal(Number(e.target.value))}
                  className="rounded-xl font-bold text-primary"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Daily Water Goal (ml)</Label>
                <Input
                  type="number"
                  step="100"
                  value={waterGoalMl}
                  onChange={(e) => setWaterGoalMl(Number(e.target.value))}
                  className="rounded-xl font-bold text-blue-600 dark:text-blue-400"
                />
              </div>
            </div>

            <p className="text-xs font-semibold text-muted-foreground pt-1">Macronutrient Targets (grams)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Protein (g)</Label>
                <Input
                  type="number"
                  value={dailyProteinGoal}
                  onChange={(e) => setDailyProteinGoal(Number(e.target.value))}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Carbs (g)</Label>
                <Input
                  type="number"
                  value={dailyCarbGoal}
                  onChange={(e) => setDailyCarbGoal(Number(e.target.value))}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Fat (g)</Label>
                <Input
                  type="number"
                  value={dailyFatGoal}
                  onChange={(e) => setDailyFatGoal(Number(e.target.value))}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Fiber (g)</Label>
                <Input
                  type="number"
                  value={dailyFiberGoal}
                  onChange={(e) => setDailyFiberGoal(Number(e.target.value))}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="rounded-xl border-border"
              >
                &larr; Back
              </Button>
              <Button
                disabled={loading}
                onClick={handleSaveProfile}
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                {loading ? "Saving Profile..." : "Complete Setup & Finish 🎉"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
