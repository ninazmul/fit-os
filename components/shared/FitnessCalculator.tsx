"use client";

import { useState } from "react";
import {
  Calculator,
  Flame,
  Scale,
  Heart,
  Target,
  Activity,
  ChevronRight,
} from "lucide-react";

type CalcTab = "bmi" | "bmr" | "tdee" | "bodyfat" | "idealweight";

const TABS: { id: CalcTab; label: string; icon: typeof Calculator }[] = [
  { id: "bmi", label: "BMI", icon: Scale },
  { id: "bmr", label: "BMR", icon: Flame },
  { id: "tdee", label: "TDEE", icon: Activity },
  { id: "bodyfat", label: "Body Fat %", icon: Heart },
  { id: "idealweight", label: "Ideal Weight", icon: Target },
];

function getBmiCategory(bmi: number) {
  if (bmi < 16) return { label: "Severe Thinness", color: "#EF4444" };
  if (bmi < 17) return { label: "Moderate Thinness", color: "#F59E0B" };
  if (bmi < 18.5) return { label: "Mild Thinness", color: "#F59E0B" };
  if (bmi < 25) return { label: "Normal Weight ✅", color: "#4E8B2E" };
  if (bmi < 30) return { label: "Overweight", color: "#F59E0B" };
  if (bmi < 35) return { label: "Obese Class I", color: "#EF4444" };
  if (bmi < 40) return { label: "Obese Class II", color: "#EF4444" };
  return { label: "Obese Class III", color: "#DC2626" };
}

function getBodyFatCategory(bf: number, gender: string) {
  if (gender === "male") {
    if (bf < 6) return { label: "Essential Fat", color: "#F59E0B" };
    if (bf < 14) return { label: "Athletic", color: "#4E8B2E" };
    if (bf < 18) return { label: "Fitness", color: "#4E8B2E" };
    if (bf < 25) return { label: "Average", color: "#6B7580" };
    return { label: "Above Average", color: "#EF4444" };
  }
  if (bf < 14) return { label: "Essential Fat", color: "#F59E0B" };
  if (bf < 21) return { label: "Athletic", color: "#4E8B2E" };
  if (bf < 25) return { label: "Fitness", color: "#4E8B2E" };
  if (bf < 32) return { label: "Average", color: "#6B7580" };
  return { label: "Above Average", color: "#EF4444" };
}

export default function FitnessCalculator() {
  const [tab, setTab] = useState<CalcTab>("bmi");
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [neck, setNeck] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [activityLevel, setActivityLevel] = useState("1.55");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);

  const reset = () => setResult(null);

  const calcBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h) return;
    const bmi = Math.round((w / (h * h)) * 10) / 10;
    const cat = getBmiCategory(bmi);
    const idealMin = Math.round(18.5 * h * h * 10) / 10;
    const idealMax = Math.round(24.9 * h * h * 10) / 10;
    setResult({ bmi, category: cat, idealMin, idealMax });
  };

  const calcBMR = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    if (!w || !h || !a) return;
    let bmr: number;
    if (gender === "male") {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }
    setResult({ bmr: Math.round(bmr) });
  };

  const calcTDEE = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    const al = parseFloat(activityLevel);
    if (!w || !h || !a) return;
    let bmr: number;
    if (gender === "male") {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }
    const tdee = Math.round(bmr * al);
    const lose = Math.round(tdee - 500);
    const gain = Math.round(tdee + 500);
    setResult({ bmr: Math.round(bmr), tdee, lose, gain });
  };

  const calcBodyFat = () => {
    const w = parseFloat(waist);
    const n = parseFloat(neck);
    const h = parseFloat(height);
    if (!w || !n || !h) return;
    let bf: number;
    if (gender === "male") {
      bf =
        495 /
          (1.0324 -
            0.19077 * Math.log10(w - n) +
            0.15456 * Math.log10(h)) -
        450;
    } else {
      const hi = parseFloat(hip);
      if (!hi) return;
      bf =
        495 /
          (1.29579 -
            0.35004 * Math.log10(w + hi - n) +
            0.22100 * Math.log10(h)) -
        450;
    }
    bf = Math.round(bf * 10) / 10;
    const cat = getBodyFatCategory(bf, gender);
    const wt = parseFloat(weight);
    const leanMass = wt ? Math.round(wt * (1 - bf / 100) * 10) / 10 : null;
    const fatMass = wt ? Math.round(wt * (bf / 100) * 10) / 10 : null;
    setResult({ bf, category: cat, leanMass, fatMass });
  };

  const calcIdealWeight = () => {
    const h = parseFloat(height);
    if (!h) return;
    const hInch = h / 2.54;
    const overFive = Math.max(0, hInch - 60);

    let robinson: number, miller: number, devine: number, hamwi: number;
    if (gender === "male") {
      robinson = 52 + 1.9 * overFive;
      miller = 56.2 + 1.41 * overFive;
      devine = 50 + 2.3 * overFive;
      hamwi = 48 + 2.7 * overFive;
    } else {
      robinson = 49 + 1.7 * overFive;
      miller = 53.1 + 1.36 * overFive;
      devine = 45.5 + 2.3 * overFive;
      hamwi = 45.5 + 2.2 * overFive;
    }
    const hM = h / 100;
    const bmiMin = Math.round(18.5 * hM * hM * 10) / 10;
    const bmiMax = Math.round(24.9 * hM * hM * 10) / 10;

    setResult({
      robinson: Math.round(robinson * 10) / 10,
      miller: Math.round(miller * 10) / 10,
      devine: Math.round(devine * 10) / 10,
      hamwi: Math.round(hamwi * 10) / 10,
      bmiMin,
      bmiMax,
    });
  };

  const handleCalc = () => {
    reset();
    if (tab === "bmi") calcBMI();
    if (tab === "bmr") calcBMR();
    if (tab === "tdee") calcTDEE();
    if (tab === "bodyfat") calcBodyFat();
    if (tab === "idealweight") calcIdealWeight();
  };

  const inputClass =
    "w-full rounded-xl border border-[#E9EBEC] bg-white px-3 py-2.5 text-sm font-medium text-[#1F2937] outline-none focus:border-[#4E8B2E] focus:ring-2 focus:ring-[#4E8B2E]/20 transition-all placeholder:text-[#6B7580]/60";
  const labelClass = "text-[11px] font-semibold text-[#6B7580] mb-1 block";

  return (
    <section id="fitness-calculator" className="py-10 border-t border-[#E9EBEC]">
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF6E9] text-[#4E8B2E] text-xs font-semibold">
          <Calculator className="w-3.5 h-3.5" />
          <span>Free Fitness Calculators</span>
        </div>
        <h2
          className="text-2xl sm:text-3xl font-bold tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Calculate Your BMI, BMR, TDEE &amp; Body Fat
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7580]">
          Use our free online fitness calculators to find your Body Mass Index (BMI),
          Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE), Body Fat
          Percentage, and Ideal Weight — powered by scientifically validated formulas.
        </p>
      </div>

      <div className="max-w-3xl mx-auto p-5 sm:p-6 rounded-3xl border border-[#E9EBEC] bg-white shadow-sm">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  reset();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "bg-[#4E8B2E] text-white shadow-sm"
                    : "bg-[#F1F2F3] text-[#37414A] hover:bg-[#E9EBEC]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          {/* Gender selector */}
          <div>
            <label className={labelClass}>Gender</label>
            <div className="flex gap-2">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGender(g);
                    reset();
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                    gender === g
                      ? "border-[#4E8B2E] bg-[#EEF6E9] text-[#4E8B2E]"
                      : "border-[#E9EBEC] bg-white text-[#6B7580] hover:bg-[#F1F2F3]"
                  }`}
                >
                  {g === "male" ? "♂ Male" : "♀ Female"}
                </button>
              ))}
            </div>
          </div>

          {/* Age — needed for BMR, TDEE */}
          {(tab === "bmr" || tab === "tdee") && (
            <div>
              <label className={labelClass}>Age (years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  reset();
                }}
                placeholder="e.g. 25"
                className={inputClass}
                min={1}
                max={120}
              />
            </div>
          )}

          {/* Height — always needed */}
          <div>
            <label className={labelClass}>Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => {
                setHeight(e.target.value);
                reset();
              }}
              placeholder="e.g. 170"
              className={inputClass}
              min={50}
              max={300}
            />
          </div>

          {/* Weight — BMI, BMR, TDEE, BodyFat */}
          {tab !== "idealweight" && (
            <div>
              <label className={labelClass}>Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  reset();
                }}
                placeholder="e.g. 70"
                className={inputClass}
                min={10}
                max={500}
              />
            </div>
          )}

          {/* Body fat specific fields */}
          {tab === "bodyfat" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Neck (cm)</label>
                  <input
                    type="number"
                    value={neck}
                    onChange={(e) => {
                      setNeck(e.target.value);
                      reset();
                    }}
                    placeholder="e.g. 38"
                    className={inputClass}
                    min={10}
                    max={80}
                  />
                </div>
                <div>
                  <label className={labelClass}>Waist (cm)</label>
                  <input
                    type="number"
                    value={waist}
                    onChange={(e) => {
                      setWaist(e.target.value);
                      reset();
                    }}
                    placeholder="e.g. 82"
                    className={inputClass}
                    min={30}
                    max={200}
                  />
                </div>
              </div>
              {gender === "female" && (
                <div>
                  <label className={labelClass}>Hip (cm)</label>
                  <input
                    type="number"
                    value={hip}
                    onChange={(e) => {
                      setHip(e.target.value);
                      reset();
                    }}
                    placeholder="e.g. 96"
                    className={inputClass}
                    min={30}
                    max={200}
                  />
                </div>
              )}
            </>
          )}

          {/* Activity level — TDEE */}
          {tab === "tdee" && (
            <div>
              <label className={labelClass}>Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => {
                  setActivityLevel(e.target.value);
                  reset();
                }}
                className={inputClass}
              >
                <option value="1.2">Sedentary (office job, little exercise)</option>
                <option value="1.375">Lightly Active (1-3 days/week)</option>
                <option value="1.55">Moderately Active (3-5 days/week)</option>
                <option value="1.725">Very Active (6-7 days/week)</option>
                <option value="1.9">Extra Active (athlete / physical job)</option>
              </select>
            </div>
          )}

          {/* Calculate button */}
          <button
            onClick={handleCalc}
            className="w-full py-3 rounded-xl bg-[#4E8B2E] text-white font-bold text-sm hover:bg-[#3F7223] transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            Calculate {TABS.find((t) => t.id === tab)?.label}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-5 p-4 rounded-2xl bg-[#F7FBF5] border border-[#4E8B2E]/20 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {tab === "bmi" && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#6B7580]">
                    Your BMI
                  </span>
                  <span
                    className="text-3xl font-bold"
                    style={{ color: result.category.color, fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {result.bmi}
                  </span>
                </div>
                <p
                  className="text-sm font-bold"
                  style={{ color: result.category.color }}
                >
                  {result.category.label}
                </p>
                <p className="text-[11px] text-[#6B7580]">
                  Healthy BMI Range: <strong>18.5 – 24.9 kg/m²</strong>
                </p>
                <p className="text-[11px] text-[#6B7580]">
                  Ideal Weight for your height:{" "}
                  <strong>
                    {result.idealMin} – {result.idealMax} kg
                  </strong>
                </p>
              </>
            )}

            {tab === "bmr" && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#6B7580]">
                    Basal Metabolic Rate
                  </span>
                  <span
                    className="text-3xl font-bold text-[#4E8B2E]"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {result.bmr}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7580]">
                  <strong>calories/day</strong> — This is how many calories your body
                  burns at complete rest (just to keep organs functioning). Formula:
                  Mifflin-St Jeor.
                </p>
              </>
            )}

            {tab === "tdee" && (
              <>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-white border border-[#E9EBEC]">
                    <p className="text-[10px] font-semibold text-[#6B7580]">
                      Weight Loss
                    </p>
                    <p className="text-lg font-bold text-amber-600"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {result.lose}
                    </p>
                    <p className="text-[10px] text-[#6B7580]">kcal/day</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#EEF6E9] border border-[#4E8B2E]/20">
                    <p className="text-[10px] font-semibold text-[#4E8B2E]">
                      Maintenance
                    </p>
                    <p className="text-lg font-bold text-[#4E8B2E]"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {result.tdee}
                    </p>
                    <p className="text-[10px] text-[#6B7580]">kcal/day</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#E9EBEC]">
                    <p className="text-[10px] font-semibold text-[#6B7580]">
                      Weight Gain
                    </p>
                    <p className="text-lg font-bold text-blue-600"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {result.gain}
                    </p>
                    <p className="text-[10px] text-[#6B7580]">kcal/day</p>
                  </div>
                </div>
                <p className="text-[11px] text-[#6B7580]">
                  Your BMR is <strong>{result.bmr} kcal</strong>. TDEE = BMR ×
                  Activity Factor. Uses the Mifflin-St Jeor equation.
                </p>
              </>
            )}

            {tab === "bodyfat" && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#6B7580]">
                    Body Fat Percentage
                  </span>
                  <span
                    className="text-3xl font-bold"
                    style={{ color: result.category.color, fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {result.bf}%
                  </span>
                </div>
                <p className="text-sm font-bold" style={{ color: result.category.color }}>
                  {result.category.label}
                </p>
                {result.leanMass && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-xl bg-white border border-[#E9EBEC] text-center">
                      <p className="text-[10px] font-semibold text-[#6B7580]">Lean Mass</p>
                      <p className="text-base font-bold text-[#4E8B2E]">{result.leanMass} kg</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E9EBEC] text-center">
                      <p className="text-[10px] font-semibold text-[#6B7580]">Fat Mass</p>
                      <p className="text-base font-bold text-amber-600">{result.fatMass} kg</p>
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-[#6B7580]">
                  Calculated using the <strong>U.S. Navy Body Fat Formula</strong>.
                </p>
              </>
            )}

            {tab === "idealweight" && (
              <>
                <p className="text-xs font-bold text-[#1F2937] mb-2">
                  Ideal Weight Estimates for Your Height
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Robinson (1983)", val: result.robinson },
                    { label: "Miller (1983)", val: result.miller },
                    { label: "Devine (1974)", val: result.devine },
                    { label: "Hamwi (1964)", val: result.hamwi },
                  ].map((f) => (
                    <div
                      key={f.label}
                      className="p-2.5 rounded-xl bg-white border border-[#E9EBEC]"
                    >
                      <p className="text-[10px] font-semibold text-[#6B7580]">
                        {f.label}
                      </p>
                      <p className="text-base font-bold text-[#4E8B2E]">
                        {f.val} kg
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[#6B7580] mt-1">
                  Healthy BMI Range:{" "}
                  <strong>
                    {result.bmiMin} – {result.bmiMax} kg
                  </strong>
                </p>
              </>
            )}

            {/* CTA */}
            <div className="pt-2 border-t border-[#4E8B2E]/10">
              <p className="text-[11px] text-[#6B7580] flex items-center gap-1">
                <ChevronRight className="w-3 h-3 text-[#4E8B2E]" />
                Sign up for <strong className="text-[#4E8B2E]">FitOS</strong> to track
                these metrics daily with personalized AI insights.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SEO-rich content below calculator */}
      <div className="max-w-3xl mx-auto mt-8 space-y-6 text-xs leading-relaxed text-[#6B7580]">
        <div className="p-4 rounded-2xl border border-[#E9EBEC] bg-white space-y-2">
          <h3 className="text-sm font-bold text-[#1F2937]">
            What is BMI (Body Mass Index)?
          </h3>
          <p>
            BMI is a simple screening tool that measures body fat based on your height
            and weight. The formula is: <strong>BMI = weight (kg) ÷ height² (m²)</strong>.
            A healthy BMI range is 18.5–24.9. BMI is used worldwide by doctors,
            nutritionists, and fitness professionals to assess whether a person is
            underweight, normal weight, overweight, or obese.
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-[#E9EBEC] bg-white space-y-2">
          <h3 className="text-sm font-bold text-[#1F2937]">
            What is BMR (Basal Metabolic Rate)?
          </h3>
          <p>
            BMR represents the number of calories your body burns at rest — just to keep
            your heart beating, lungs breathing, and organs functioning. FitOS uses the
            <strong> Mifflin-St Jeor equation</strong>, the gold standard recommended by
            the Academy of Nutrition and Dietetics: <strong>BMR = 10 × weight(kg) +
            6.25 × height(cm) - 5 × age - 161 (female) / + 5 (male)</strong>.
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-[#E9EBEC] bg-white space-y-2">
          <h3 className="text-sm font-bold text-[#1F2937]">
            What is TDEE (Total Daily Energy Expenditure)?
          </h3>
          <p>
            TDEE is the total number of calories you burn per day, including exercise and
            daily activity. It&apos;s calculated by multiplying your BMR by an activity
            factor. Knowing your TDEE helps you plan calorie intake for weight loss,
            maintenance, or muscle gain. Eat below TDEE to lose weight, at TDEE to
            maintain, or above TDEE to bulk.
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-[#E9EBEC] bg-white space-y-2">
          <h3 className="text-sm font-bold text-[#1F2937]">
            How is Body Fat Percentage Calculated?
          </h3>
          <p>
            FitOS uses the <strong>U.S. Navy Body Fat Formula</strong>, which estimates
            body fat percentage from neck, waist, and hip circumference measurements.
            This method is clinically validated and widely used by military and sports
            organizations. For men: measurements require neck and waist. For women: neck,
            waist, and hip measurements are needed.
          </p>
        </div>
      </div>
    </section>
  );
}
