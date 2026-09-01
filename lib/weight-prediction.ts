/**
 * Weight Prediction Utility
 * Uses linear regression on recent weight data to predict goal achievement date.
 */

import type { IWeightPrediction } from "@/types/fitness";
import { getLocalDateString } from "@/lib/utils";

interface WeightDataPoint {
  date: string; // YYYY-MM-DD
  weight: number;
}

/**
 * Simple linear regression: fits y = mx + b to the data points.
 * Returns slope (m) and intercept (b).
 */
function linearRegression(points: { x: number; y: number }[]): {
  slope: number;
  intercept: number;
  r2: number;
} {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y || 0, r2: 0 };

  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return { slope: 0, intercept: sumY / n, r2: 0 };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // R² (coefficient of determination)
  const yMean = sumY / n;
  let ssRes = 0,
    ssTot = 0;
  for (const p of points) {
    const predicted = slope * p.x + intercept;
    ssRes += (p.y - predicted) ** 2;
    ssTot += (p.y - yMean) ** 2;
  }
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
}

/**
 * Calculate the weekly weight change rate from recent data.
 */
export function getWeightPace(weights: WeightDataPoint[]): number {
  if (weights.length < 2) return 0;

  const sorted = [...weights].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const baseDate = new Date(sorted[0].date).getTime();
  const points = sorted.map((w) => ({
    x: (new Date(w.date).getTime() - baseDate) / (1000 * 60 * 60 * 24), // days
    y: w.weight,
  }));

  const { slope } = linearRegression(points);

  // slope is kg/day, convert to kg/week
  return Math.round(slope * 7 * 100) / 100;
}

/**
 * Predict when the user will reach their target weight.
 */
export function predictGoalDate(
  weights: WeightDataPoint[],
  targetWeight: number
): { estimatedDate: string | null; daysToGoal: number | null } {
  if (weights.length < 3) return { estimatedDate: null, daysToGoal: null };

  const sorted = [...weights].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const baseDate = new Date(sorted[0].date).getTime();
  const points = sorted.map((w) => ({
    x: (new Date(w.date).getTime() - baseDate) / (1000 * 60 * 60 * 24),
    y: w.weight,
  }));

  const { slope, intercept } = linearRegression(points);

  // If slope is 0 or going wrong direction, can't predict
  const currentWeight = sorted[sorted.length - 1].weight;
  const needToLose = currentWeight > targetWeight;

  if (slope === 0) return { estimatedDate: null, daysToGoal: null };
  if (needToLose && slope >= 0) return { estimatedDate: null, daysToGoal: null };
  if (!needToLose && slope <= 0 && currentWeight < targetWeight)
    return { estimatedDate: null, daysToGoal: null };

  // Solve: targetWeight = slope * dayX + intercept
  const dayX = (targetWeight - intercept) / slope;
  const lastDay = points[points.length - 1].x;
  const daysFromNow = Math.max(0, Math.round(dayX - lastDay));

  // Cap at 365 days (1 year)
  if (daysFromNow > 365) return { estimatedDate: null, daysToGoal: null };

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + daysFromNow);

  return {
    estimatedDate: getLocalDateString(estimatedDate),
    daysToGoal: daysFromNow,
  };
}

/**
 * Get a motivational message based on weight pace and goal.
 */
export function getMotivationMessage(
  weeklyRate: number,
  currentWeight: number,
  targetWeight: number,
  daysToGoal: number | null
): string {
  const isLosing = targetWeight < currentWeight;
  const isGaining = targetWeight > currentWeight;
  const atGoal = Math.abs(currentWeight - targetWeight) < 0.5;

  if (atGoal) return "🎉 You've reached your goal! Amazing work!";

  if (isLosing) {
    if (weeklyRate < -0.8) return "🔥 Incredible pace! Make sure you're eating enough.";
    if (weeklyRate < -0.3)
      return daysToGoal
        ? `✅ On track! Estimated ${Math.round(daysToGoal / 7)} weeks to goal.`
        : "✅ You're on track! Great consistency.";
    if (weeklyRate < 0) return "👍 Slow and steady progress. Keep going!";
    if (weeklyRate === 0) return "⏸️ Weight is stable. Review your calorie intake.";
    return "📈 Weight trending up. Consider adjusting your plan.";
  }

  if (isGaining) {
    if (weeklyRate > 0.5) return "💪 Gaining well! Monitor body composition.";
    if (weeklyRate > 0.2) return "✅ On track for lean gains!";
    if (weeklyRate > 0) return "👍 Slow gains. Consider increasing calories.";
    return "📉 Weight trending down. Increase your surplus.";
  }

  return "📊 Keep logging to see your trend!";
}

/**
 * Full weight prediction analysis.
 */
export function analyzeWeightTrend(
  weights: WeightDataPoint[],
  targetWeight: number
): IWeightPrediction {
  if (weights.length < 3) {
    return {
      weeklyRate: 0,
      estimatedGoalDate: null,
      daysToGoal: null,
      motivationMessage: "📊 Log at least 3 weight entries to see predictions!",
      isOnTrack: false,
    };
  }

  const weeklyRate = getWeightPace(weights);
  const { estimatedDate, daysToGoal } = predictGoalDate(weights, targetWeight);
  const currentWeight = weights[weights.length - 1]?.weight || 0;
  const motivationMessage = getMotivationMessage(
    weeklyRate,
    currentWeight,
    targetWeight,
    daysToGoal
  );

  const isLosing = targetWeight < currentWeight;
  const isOnTrack = isLosing
    ? weeklyRate < -0.1
    : targetWeight > currentWeight
      ? weeklyRate > 0.1
      : Math.abs(weeklyRate) < 0.3;

  return {
    weeklyRate,
    estimatedGoalDate: estimatedDate,
    daysToGoal,
    motivationMessage,
    isOnTrack,
  };
}
