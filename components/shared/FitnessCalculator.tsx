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
import { useI18n } from "@/components/shared/I18nProvider";

type CalcTab = "bmi" | "bmr" | "tdee" | "bodyfat" | "idealweight";

const TABS: { id: CalcTab; labelKey: string; icon: typeof Calculator }[] = [
  { id: "bmi", labelKey: "calculator.tab.bmi", icon: Scale },
  { id: "bmr", labelKey: "calculator.tab.bmr", icon: Flame },
  { id: "tdee", labelKey: "calculator.tab.tdee", icon: Activity },
  { id: "bodyfat", labelKey: "calculator.tab.bodyfat", icon: Heart },
  { id: "idealweight", labelKey: "calculator.tab.idealweight", icon: Target },
];

function getBmiCategory(bmi: number) {
  if (bmi < 16) return { labelKey: "calculator.bmi.category.severeThinness", color: "#EF4444" };
  if (bmi < 17) return { labelKey: "calculator.bmi.category.moderateThinness", color: "#F59E0B" };
  if (bmi < 18.5) return { labelKey: "calculator.bmi.category.mildThinness", color: "#F59E0B" };
  if (bmi < 25) return { labelKey: "calculator.bmi.category.normal", color: "#4E8B2E" };
  if (bmi < 30) return { labelKey: "calculator.bmi.category.overweight", color: "#F59E0B" };
  if (bmi < 35) return { labelKey: "calculator.bmi.category.obese1", color: "#EF4444" };
  if (bmi < 40) return { labelKey: "calculator.bmi.category.obese2", color: "#EF4444" };
  return { labelKey: "calculator.bmi.category.obese3", color: "#DC2626" };
}

function getBodyFatCategory(bf: number, gender: string) {
  if (gender === "male") {
    if (bf < 6) return { labelKey: "calculator.bodyfat.category.essentialFat", color: "#F59E0B" };
    if (bf < 14) return { labelKey: "calculator.bodyfat.category.athletic", color: "#4E8B2E" };
    if (bf < 18) return { labelKey: "calculator.bodyfat.category.fitness", color: "#4E8B2E" };
    if (bf < 25) return { labelKey: "calculator.bodyfat.category.average", color: "#6B7580" };
    return { labelKey: "calculator.bodyfat.category.aboveAverage", color: "#EF4444" };
  }
  if (bf < 14) return { labelKey: "calculator.bodyfat.category.essentialFat", color: "#F59E0B" };
  if (bf < 21) return { labelKey: "calculator.bodyfat.category.athletic", color: "#4E8B2E" };
  if (bf < 25) return { labelKey: "calculator.bodyfat.category.fitness", color: "#4E8B2E" };
  if (bf < 32) return { labelKey: "calculator.bodyfat.category.average", color: "#6B7580" };
  return { labelKey: "calculator.bodyfat.category.aboveAverage", color: "#EF4444" };
}

export default function FitnessCalculator() {
  const { t } = useI18n();
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

  const activeTab = TABS.find((item) => item.id === tab);

  const inputClass =
    "w-full rounded-xl border border-primary/50 bg-white px-3 py-2.5 text-sm font-medium text-[#1F2937] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-[#6B7580]/60";
  const labelClass = "text-[11px] font-semibold text-[#6B7580] mb-1 block";

  return (
    <section id="fitness-calculator" className="py-10 border-t border-primary/50">
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Calculator className="w-3.5 h-3.5" />
          <span>{t("calculator.header.badge")}</span>
        </div>
        <h2
          className="text-2xl sm:text-3xl font-bold tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {t("calculator.header.title")}
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7580]">
          {t("calculator.header.description")}
        </p>
      </div>

      <div className="max-w-3xl mx-auto p-5 sm:p-6 rounded-3xl border border-primary/50 bg-white shadow-sm">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  reset();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${active
                  ? "bg-primary text-white shadow-sm"
                  : "bg-[#F1F2F3] text-[#37414A] hover:bg-primary/50"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t(item.labelKey)}
              </button>
            );
          })}
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          {/* Gender selector */}
          <div>
            <label className={labelClass}>{t("calculator.form.gender")}</label>
            <div className="flex gap-2">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGender(g);
                    reset();
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all border ${gender === g
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-primary/50 bg-white text-[#6B7580] hover:bg-[#F1F2F3]"
                    }`}
                >
                  {g === "male" ? t("calculator.gender.male") : t("calculator.gender.female")}
                </button>
              ))}
            </div>
          </div>

          {/* Age — needed for BMR, TDEE */}
          {(tab === "bmr" || tab === "tdee") && (
            <div>
              <label className={labelClass}>{t("calculator.form.age")}</label>
              <input
                type="number"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  reset();
                }}
                placeholder={t("calculator.placeholder.age")}
                className={inputClass}
                min={1}
                max={120}
              />
            </div>
          )}

          {/* Height — always needed */}
          <div>
            <label className={labelClass}>{t("calculator.form.height")}</label>
            <input
              type="number"
              value={height}
              onChange={(e) => {
                setHeight(e.target.value);
                reset();
              }}
              placeholder={t("calculator.placeholder.height")}
              className={inputClass}
              min={50}
              max={300}
            />
          </div>

          {/* Weight — BMI, BMR, TDEE, BodyFat */}
          {tab !== "idealweight" && (
            <div>
              <label className={labelClass}>{t("calculator.form.weight")}</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  reset();
                }}
                placeholder={t("calculator.placeholder.weight")}
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
                  <label className={labelClass}>{t("calculator.form.neck")}</label>
                  <input
                    type="number"
                    value={neck}
                    onChange={(e) => {
                      setNeck(e.target.value);
                      reset();
                    }}
                    placeholder={t("calculator.placeholder.neck")}
                    className={inputClass}
                    min={10}
                    max={80}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("calculator.form.waist")}</label>
                  <input
                    type="number"
                    value={waist}
                    onChange={(e) => {
                      setWaist(e.target.value);
                      reset();
                    }}
                    placeholder={t("calculator.placeholder.waist")}
                    className={inputClass}
                    min={30}
                    max={200}
                  />
                </div>
              </div>
              {gender === "female" && (
                <div>
                  <label className={labelClass}>{t("calculator.form.hip")}</label>
                  <input
                    type="number"
                    value={hip}
                    onChange={(e) => {
                      setHip(e.target.value);
                      reset();
                    }}
                    placeholder={t("calculator.placeholder.hip")}
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
              <label className={labelClass}>{t("calculator.form.activity")}</label>
              <select
                value={activityLevel}
                onChange={(e) => {
                  setActivityLevel(e.target.value);
                  reset();
                }}
                className={inputClass}
              >
                <option value="1.2">{t("calculator.activity.sedentary")}</option>
                <option value="1.375">{t("calculator.activity.light")}</option>
                <option value="1.55">{t("calculator.activity.moderate")}</option>
                <option value="1.725">{t("calculator.activity.very")}</option>
                <option value="1.9">{t("calculator.activity.extra")}</option>
              </select>
            </div>
          )}

          {/* Calculate button */}
          <button
            onClick={handleCalc}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/80 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            {t("calculator.button.calculate", { name: activeTab ? t(activeTab.labelKey) : "" })}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-5 p-4 rounded-2xl bg-[#F7FBF5] border border-primary/20 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {tab === "bmi" && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#6B7580]">
                    {t("calculator.bmi.result.yourBmi")}
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
                  {t(result.category.labelKey)}
                </p>
                <p className="text-[11px] text-[#6B7580]">
                  {t("calculator.bmi.result.healthyRange")} <strong>18.5 – 24.9 kg/m²</strong>
                </p>
                <p className="text-[11px] text-[#6B7580]">
                  {t("calculator.bmi.result.idealWeight")}{" "}
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
                    {t("calculator.bmr.result.label")}
                  </span>
                  <span
                    className="text-3xl font-bold text-primary"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {result.bmr}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7580]">
                  <strong>{t("calculator.unit.caloriesPerDay")}</strong>{" "}
                  {t("calculator.bmr.result.description")}
                </p>
              </>
            )}

            {tab === "tdee" && (
              <>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-white border border-primary/50">
                    <p className="text-[10px] font-semibold text-[#6B7580]">
                      {t("calculator.tdee.weightLoss")}
                    </p>
                    <p className="text-lg font-bold text-amber-600"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {result.lose}
                    </p>
                    <p className="text-[10px] text-[#6B7580]">{t("calculator.unit.kcalPerDay")}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-[10px] font-semibold text-primary">
                      {t("calculator.tdee.maintenance")}
                    </p>
                    <p className="text-lg font-bold text-primary"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {result.tdee}
                    </p>
                    <p className="text-[10px] text-[#6B7580]">{t("calculator.unit.kcalPerDay")}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-primary/50">
                    <p className="text-[10px] font-semibold text-[#6B7580]">
                      {t("calculator.tdee.weightGain")}
                    </p>
                    <p className="text-lg font-bold text-blue-600"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {result.gain}
                    </p>
                    <p className="text-[10px] text-[#6B7580]">{t("calculator.unit.kcalPerDay")}</p>
                  </div>
                </div>
                <p className="text-[11px] text-[#6B7580]">
                  {t("calculator.tdee.result.bmrPrefix")} <strong>{result.bmr} kcal</strong>
                  {t("calculator.tdee.result.bmrSuffix")}
                </p>
              </>
            )}

            {tab === "bodyfat" && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#6B7580]">
                    {t("calculator.bodyfat.result.label")}
                  </span>
                  <span
                    className="text-3xl font-bold"
                    style={{ color: result.category.color, fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {result.bf}%
                  </span>
                </div>
                <p className="text-sm font-bold" style={{ color: result.category.color }}>
                  {t(result.category.labelKey)}
                </p>
                {result.leanMass && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-xl bg-white border border-primary/50 text-center">
                      <p className="text-[10px] font-semibold text-[#6B7580]">{t("calculator.bodyfat.result.leanMass")}</p>
                      <p className="text-base font-bold text-primary">{result.leanMass} kg</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-primary/50 text-center">
                      <p className="text-[10px] font-semibold text-[#6B7580]">{t("calculator.bodyfat.result.fatMass")}</p>
                      <p className="text-base font-bold text-amber-600">{result.fatMass} kg</p>
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-[#6B7580]">
                  {t("calculator.bodyfat.result.descriptionPrefix")}{" "}
                  <strong>{t("calculator.bodyfat.result.formula")}</strong>
                  {t("calculator.bodyfat.result.descriptionSuffix")}
                </p>
              </>
            )}

            {tab === "idealweight" && (
              <>
                <p className="text-xs font-bold text-[#1F2937] mb-2">
                  {t("calculator.idealweight.result.title")}
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
                      className="p-2.5 rounded-xl bg-white border border-primary/50"
                    >
                      <p className="text-[10px] font-semibold text-[#6B7580]">
                        {f.label}
                      </p>
                      <p className="text-base font-bold text-primary">
                        {f.val} kg
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[#6B7580] mt-1">
                  {t("calculator.bmi.result.healthyRange")}{" "}
                  <strong>
                    {result.bmiMin} – {result.bmiMax} kg
                  </strong>
                </p>
              </>
            )}

            {/* CTA */}
            <div className="pt-2 border-t border-primary/10">
              <p className="text-[11px] text-[#6B7580] flex items-center gap-1">
                <ChevronRight className="w-3 h-3 text-primary" />
                {t("calculator.cta.prefix")}{" "}
                <strong className="text-primary">NutriBD</strong> {t("calculator.cta.suffix")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SEO-rich content below calculator */}
      <div className="max-w-3xl mx-auto mt-8 space-y-6 text-xs leading-relaxed text-[#6B7580]">
        <div className="p-4 rounded-2xl border border-primary/50 bg-white space-y-2">
          <h3 className="text-sm font-bold text-[#1F2937]">
            {t("calculator.seo.bmi.title")}
          </h3>
          <p>
            {t("calculator.seo.bmi.body1")}{" "}
            <strong>{t("calculator.seo.bmi.formula")}</strong>
            {t("calculator.seo.bmi.body2")}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-primary/50 bg-white space-y-2">
          <h3 className="text-sm font-bold text-[#1F2937]">
            {t("calculator.seo.bmr.title")}
          </h3>
          <p>
            {t("calculator.seo.bmr.body1")}{" "}
            <strong>{t("calculator.seo.bmr.formula1")}</strong>
            {t("calculator.seo.bmr.body2")}{" "}
            <strong>{t("calculator.seo.bmr.formula2")}</strong>
            {t("calculator.seo.bmr.bodySuffix")}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-primary/50 bg-white space-y-2">
          <h3 className="text-sm font-bold text-[#1F2937]">
            {t("calculator.seo.tdee.title")}
          </h3>
          <p>{t("calculator.seo.tdee.body")}</p>
        </div>
        <div className="p-4 rounded-2xl border border-primary/50 bg-white space-y-2">
          <h3 className="text-sm font-bold text-[#1F2937]">
            {t("calculator.seo.bodyfat.title")}
          </h3>
          <p>
            {t("calculator.seo.bodyfat.body1")}{" "}
            <strong>{t("calculator.seo.bodyfat.formula")}</strong>
            {t("calculator.seo.bodyfat.body2")}
            {t("calculator.seo.bodyfat.bodySuffix")}
          </p>
        </div>
      </div>
    </section>
  );
}
