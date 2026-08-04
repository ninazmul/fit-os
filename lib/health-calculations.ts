import type { Gender } from "@/types/fitness";

export function calcBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  if (heightM <= 0) return 0;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

export function getBMICategory(bmi: number): {
  label: string;
  color: string;
  description: string;
} {
  if (bmi < 18.5)
    return {
      label: "Underweight",
      color: "text-blue-600 dark:text-blue-400",
      description:
        "Below healthy range. Consider a nutrition plan to gain weight safely.",
    };
  if (bmi < 25)
    return {
      label: "Healthy",
      color: "text-emerald-600 dark:text-emerald-400",
      description:
        "You're in the healthy weight range. Keep up the great work!",
    };
  if (bmi < 30)
    return {
      label: "Overweight",
      color: "text-amber-600 dark:text-amber-400",
      description:
        "Slightly above healthy range. Small lifestyle changes can make a big difference.",
    };
  if (bmi < 35)
    return {
      label: "Obese (Class I)",
      color: "text-orange-600 dark:text-orange-400",
      description:
        "Moderate obesity. Consult a healthcare provider for a personalized plan.",
    };
  if (bmi < 40)
    return {
      label: "Obese (Class II)",
      color: "text-red-600 dark:text-red-400",
      description: "Severe obesity. Consider consulting a healthcare provider.",
    };
  return {
    label: "Obese (Class III)",
    color: "text-red-700 dark:text-red-500",
    description:
      "Very severe obesity. Medical consultation is highly recommended.",
  };
}

export function calcIdealWeightRange(
  heightCm: number,
  gender?: Gender,
): { min: number; max: number } {
  const heightM = heightCm / 100;
  // Standard healthy BMI range (18.5 - 24.9)
  const minBmi = gender === "female" ? 18.5 : 18.5;
  const maxBmi = gender === "male" ? 24.9 : 24.9;
  const min = Math.round(minBmi * heightM * heightM * 10) / 10;
  const max = Math.round(maxBmi * heightM * heightM * 10) / 10;
  return { min, max };
}

export function calcBodyFatPercentage(params: {
  gender: Gender;
  heightCm: number;
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
}): number | null {
  const { gender, heightCm, waistCm, neckCm, hipCm } = params;
  if (!waistCm || !neckCm || heightCm <= 0) return null;

  if (gender === "male") {
    if (waistCm - neckCm <= 0) return null;
    const bodyFat =
      495 /
        (1.0324 -
          0.19077 * Math.log10(waistCm - neckCm) +
          0.15456 * Math.log10(heightCm)) -
      450;
    return Math.max(0, Math.min(60, Math.round(bodyFat * 10) / 10));
  } else {
    if (!hipCm) return null;
    if (waistCm + hipCm - neckCm <= 0) return null;
    const bodyFat =
      495 /
        (1.29579 -
          0.35004 * Math.log10(waistCm + hipCm - neckCm) +
          0.221 * Math.log10(heightCm)) -
      450;
    return Math.max(0, Math.min(60, Math.round(bodyFat * 10) / 10));
  }
}

export function getBodyFatCategory(
  bodyFat: number,
  gender: Gender,
): { label: string; color: string } {
  if (gender === "male") {
    if (bodyFat < 6) return { label: "Essential", color: "text-blue-500" };
    if (bodyFat < 14) return { label: "Athletes", color: "text-cyan-500" };
    if (bodyFat < 18) return { label: "Fitness", color: "text-emerald-500" };
    if (bodyFat < 25) return { label: "Acceptable", color: "text-emerald-400" };
    return { label: "Obese", color: "text-amber-500" };
  } else {
    if (bodyFat < 14) return { label: "Essential", color: "text-blue-500" };
    if (bodyFat < 21) return { label: "Athletes", color: "text-cyan-500" };
    if (bodyFat < 25) return { label: "Fitness", color: "text-emerald-500" };
    if (bodyFat < 32) return { label: "Acceptable", color: "text-emerald-400" };
    return { label: "Obese", color: "text-amber-500" };
  }
}

export function calcWaistToHipRatio(
  waistCm?: number,
  hipCm?: number,
): number | null {
  if (!waistCm || !hipCm || hipCm <= 0) return null;
  return Math.round((waistCm / hipCm) * 100) / 100;
}

export function getWHRRiskCategory(
  whr: number,
  gender: Gender,
): { label: string; color: string; risk: string } {
  if (gender === "male") {
    if (whr < 0.9)
      return {
        label: "Low Risk",
        color: "text-emerald-600 dark:text-emerald-400",
        risk: "Healthy waist-to-hip ratio. Keep it up!",
      };
    if (whr < 1.0)
      return {
        label: "Moderate Risk",
        color: "text-amber-600 dark:text-amber-400",
        risk: "Elevated cardiovascular risk. Consider core-focused workouts.",
      };
    return {
      label: "High Risk",
      color: "text-red-600 dark:text-red-400",
      risk: "High cardiovascular risk. Consult a healthcare provider.",
    };
  } else {
    if (whr < 0.8)
      return {
        label: "Low Risk",
        color: "text-emerald-600 dark:text-emerald-400",
        risk: "Healthy waist-to-hip ratio. Keep it up!",
      };
    if (whr < 0.85)
      return {
        label: "Moderate Risk",
        color: "text-amber-600 dark:text-amber-400",
        risk: "Elevated cardiovascular risk. Consider core-focused workouts.",
      };
    return {
      label: "High Risk",
      color: "text-red-600 dark:text-red-400",
      risk: "High cardiovascular risk. Consult a healthcare provider.",
    };
  }
}

export function calcWaistToHeightRatio(
  waistCm?: number,
  heightCm?: number,
): number | null {
  if (!waistCm || !heightCm || heightCm <= 0) return null;
  return Math.round((waistCm / heightCm) * 100) / 100;
}

export function getWHtRCategory(whtr: number): {
  label: string;
  color: string;
  description: string;
} {
  if (whtr < 0.4)
    return {
      label: "Underweight",
      color: "text-blue-500",
      description: "Very slim build. May indicate insufficient weight.",
    };
  if (whtr < 0.5)
    return {
      label: "Healthy",
      color: "text-emerald-600 dark:text-emerald-400",
      description: "Healthy waist-to-height ratio. Excellent body composition.",
    };
  if (whtr < 0.6)
    return {
      label: "Overweight",
      color: "text-amber-600 dark:text-amber-400",
      description:
        "Increased health risk. Reduce waist circumference for better health.",
    };
  return {
    label: "High Risk",
    color: "text-red-600 dark:text-red-400",
    description:
      "Significantly elevated health risk. Medical check recommended.",
  };
}

export function calcLeanBodyMass(
  weightKg: number,
  bodyFatPct: number | null,
): number | null {
  if (bodyFatPct === null) return null;
  return Math.round(weightKg * (1 - bodyFatPct / 100) * 10) / 10;
}

export function calcFatMass(
  weightKg: number,
  bodyFatPct: number | null,
): number | null {
  if (bodyFatPct === null) return null;
  return Math.round(weightKg * (bodyFatPct / 100) * 10) / 10;
}
