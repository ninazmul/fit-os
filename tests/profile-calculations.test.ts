import test from "node:test";
import assert from "node:assert/strict";
import {
  calcBMR,
  calcTDEE,
  calcBMI,
  calcBodyFatPercentage,
  calcFatMass,
  calcLeanBodyMass,
  calcWaistToHipRatio,
  calcWaistToHeightRatio,
  calcWeightProgress,
  calcRecommendedProtein,
  evaluateCalorieAdjustment,
  calculateUnifiedHealthMetrics,
  getWHRRiskCategory,
  getBodyFatRange,
} from "../lib/health-calculations.ts";

test("NutriBD Reference Case - All Metrics Match Expected Specification Exactly", () => {
  // Reference Case Inputs:
  // Male, 25 y, 167 cm, 80.7 kg, waist 92 cm, neck 40 cm, hip 94 cm,
  // activity "moderate" (x1.55), first logged weight 86 kg, target 70 kg.
  const result = calculateUnifiedHealthMetrics({
    gender: "male",
    age: 25,
    heightCm: 167,
    currentWeightKg: 80.7,
    startWeightKg: 86,
    targetWeightKg: 70,
    activityLevel: "moderate",
    goal: "lose_weight",
    waistCm: 92,
    neckCm: 40,
    hipCm: 94,
  });

  // 1. BMR (Mifflin-St Jeor): 10 * 80.7 + 6.25 * 167 - 5 * 25 + 5 = 1730.75 -> 1731
  assert.equal(result.bmr, 1731, "BMR must be exactly 1731");

  // 2. TDEE: 1730.75 * 1.55 = 2682.66 -> 2683
  assert.equal(result.tdee, 2683, "TDEE must be exactly 2683");

  // 3. BMI: 80.7 / (1.67^2) = 28.936 -> 28.9
  assert.equal(result.bmi, 28.9, "BMI must be exactly 28.9");

  // 4. Navy Body Fat %: male formula waist 92, neck 40, height 167 -> 22.1%
  assert.equal(result.bodyFatPct, 22.1, "Navy body fat must be exactly 22.1%");

  // 5. Fat Mass: 80.7 * 0.221 = 17.8347 -> 17.8 kg
  assert.equal(result.fatMass, 17.8, "Fat mass must be exactly 17.8 kg");

  // 6. Lean Mass: 80.7 - 17.8 = 62.9 kg
  assert.equal(result.leanMass, 62.9, "Lean mass must be exactly 62.9 kg");

  // 7. Waist-to-Hip Ratio (WHR): 92 / 94 = 0.9787 -> 0.98
  assert.equal(result.whr, 0.98, "Waist-to-hip ratio must be exactly 0.98");

  // 8. Waist-to-Height Ratio (WHtR): 92 / 167 = 0.5508 -> 0.55
  assert.equal(result.whtr, 0.55, "Waist-to-height ratio must be exactly 0.55");

  // 9. Weight Progress: (86 - 80.7) / (86 - 70) = 5.3 / 16 = 33.125% -> 33%
  assert.equal(result.weightProgress?.progressPct, 33, "Weight progress must be exactly 33%");
  assert.equal(result.weightProgress?.remainingKg, 10.7, "Remaining weight must be exactly 10.7 kg");
});

test("Weight progress calculation - Clamping and Edge Cases", () => {
  // At target
  const atTarget = calcWeightProgress(86, 70, 70);
  assert.equal(atTarget.atTarget, true);
  assert.equal(atTarget.remainingKg, 0);
  assert.equal(atTarget.progressPct, 100);

  // Exceeded goal (lost more than target) - progress clamped to 100%
  // remainingKg = |68 - 70| = 2 (overshoot distance from target)
  const exceeded = calcWeightProgress(86, 68, 70);
  assert.equal(exceeded.progressPct, 100);
  assert.equal(exceeded.remainingKg, 2);

  // Gained weight beyond start (negative progress) - must clamp to 0%
  const gained = calcWeightProgress(86, 88, 70);
  assert.equal(gained.progressPct, 0);
  assert.equal(gained.remainingKg, 18);

  // Muscle gain journey (start 60, current 65, target 70) -> 50%
  const muscleGain = calcWeightProgress(60, 65, 70);
  assert.equal(muscleGain.isGain, true);
  assert.equal(muscleGain.progressPct, 50);
  assert.equal(muscleGain.remainingKg, 5);
});

test("Protein targets - Defaults to 1.4 g/kg for Fat Loss", () => {
  // Reference user: 80.7 kg fat loss default -> 80.7 * 1.4 = 112.98 -> 113g
  const defaultCut = calcRecommendedProtein({ weightKg: 80.7, goal: "lose_weight" });
  assert.equal(defaultCut.grams, 113);
  assert.equal(defaultCut.ratioUsed, 1.4);
  assert.equal(defaultCut.isCustom, false);

  // User override ratio 1.6 g/kg -> 80.7 * 1.6 = 129.12 -> 129g
  const customRatio = calcRecommendedProtein({
    weightKg: 80.7,
    goal: "lose_weight",
    proteinRatioOverride: 1.6,
  });
  assert.equal(customRatio.grams, 129);
  assert.equal(customRatio.ratioUsed, 1.6);
  assert.equal(customRatio.isCustom, false);

  // Custom gram override (e.g. 100g)
  const customOverride = calcRecommendedProtein({
    weightKg: 80.7,
    goal: "lose_weight",
    customProteinGrams: 100,
  });
  assert.equal(customOverride.grams, 100);
  assert.equal(customOverride.isCustom, true);
});

test("Calorie Target Realism - 14-Day Weigh-in Evaluation", () => {
  // Under-logging / Low TDEE case (<0.2 kg/wk lost while intake low)
  const underLoggingEval = evaluateCalorieAdjustment({
    targetCalories: 2000,
    goal: "lose_weight",
    weightEntries: [
      { date: "2026-10-01", weight: 80.8 },
      { date: "2026-10-08", weight: 80.75 },
      { date: "2026-10-15", weight: 80.7 },
    ],
    recentIntakes: [
      { date: "2026-10-10", calories: 1500 },
      { date: "2026-10-11", calories: 1550 },
      { date: "2026-10-12", calories: 1600 },
      { date: "2026-10-13", calories: 1450 },
      { date: "2026-10-14", calories: 1500 },
    ],
  });

  assert.equal(underLoggingEval.status, "slow_or_underlogged");
  assert.equal(underLoggingEval.adjustmentKcal, -150);

  // Rapid loss case (>0.7 kg/wk lost)
  const rapidLossEval = evaluateCalorieAdjustment({
    targetCalories: 2000,
    goal: "lose_weight",
    weightEntries: [
      { date: "2026-10-01", weight: 82.5 },
      { date: "2026-10-08", weight: 81.5 },
      { date: "2026-10-15", weight: 80.5 },
    ],
    recentIntakes: [],
  });

  assert.equal(rapidLossEval.status, "too_fast");
  assert.equal(rapidLossEval.adjustmentKcal, 150);
});

test("Body Fat Range and Scientific Guardrails", () => {
  const result = calculateUnifiedHealthMetrics({
    gender: "male",
    age: 25,
    heightCm: 167,
    currentWeightKg: 80.7,
    activityLevel: "moderate",
    goal: "lose_weight",
    waistCm: 92,
    neckCm: 40,
  });

  // Body fat should be 22.1%
  assert.equal(result.bodyFatPct, 22.1);

  // Range should be ±3.5%: 22.1 - 3.5 = 18.6, 22.1 + 3.5 = 25.6
  assert.ok(result.bodyFatRange !== null);
  assert.equal(result.bodyFatRange?.min, 18.6);
  assert.equal(result.bodyFatRange?.max, 25.6);

  // Guardrail check: WHR advice must not suggest spot reduction / core workouts
  const whrRisk = getWHRRiskCategory(0.98, "male");
  assert.ok(!whrRisk.risk.includes("core-focused workouts"), "Must not suggest core spot reduction");
  assert.ok(whrRisk.risk.includes("aerobic"), "Must advise aerobic activity");
  assert.ok(whrRisk.risk.includes("calorie deficit"), "Must advise calorie deficit");
  assert.ok(whrRisk.risk.includes("Screening estimate"), "Must label as screening estimate");
});

test("Individual helper functions - calcBMR and calcTDEE", () => {
  // Male: 10 * 80.7 + 6.25 * 167 - 5 * 25 + 5 = 1731
  assert.equal(calcBMR(80.7, 167, 25, "male"), 1731);

  // Female: 10 * 60 + 6.25 * 160 - 5 * 30 - 161 = 1289
  assert.equal(calcBMR(60, 160, 30, "female"), 1289);

  // TDEE with moderate multiplier
  assert.equal(calcTDEE(1731, "moderate"), 2683);
  assert.equal(calcTDEE(1731, "sedentary"), 2077);
});

test("Body fat calculation - female requires hip", () => {
  // Male without hip should work
  const maleResult = calcBodyFatPercentage({
    gender: "male",
    heightCm: 167,
    waistCm: 92,
    neckCm: 40,
  });
  assert.ok(maleResult !== null);

  // Female without hip should return null
  const femaleNoHip = calcBodyFatPercentage({
    gender: "female",
    heightCm: 160,
    waistCm: 80,
    neckCm: 32,
  });
  assert.equal(femaleNoHip, null);

  // Female with hip should work
  const femaleWithHip = calcBodyFatPercentage({
    gender: "female",
    heightCm: 160,
    waistCm: 80,
    neckCm: 32,
    hipCm: 95,
  });
  assert.ok(femaleWithHip !== null);
});

test("getBodyFatRange - ±3.5% margin", () => {
  const range = getBodyFatRange(22.1);
  assert.ok(range !== null);
  assert.equal(range!.min, 18.6);
  assert.equal(range!.max, 25.6);

  // Low body fat should clamp min to 3
  const lowRange = getBodyFatRange(5.0);
  assert.ok(lowRange !== null);
  assert.equal(lowRange!.min, 3); // clamped from 1.5

  // Null input
  assert.equal(getBodyFatRange(null), null);
});
