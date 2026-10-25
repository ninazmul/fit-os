"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useI18n } from "@/components/shared/I18nProvider";
import {
  type GoalCelebrationStats,
  completeAndArchiveGoal,
} from "@/lib/actions/goal-history.actions";
import { APP_NAME, APP_SITE_URL, APP_TAGLINE, APP_LOGO } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Download,
  ArrowRight,
  Sparkles,
  Scale,
  Dumbbell,
  Utensils,
  Ruler,
  X,
  Loader2,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { notifyDataUpdated } from "@/lib/events";
import type { PrimaryGoal } from "@/types/fitness";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface GoalCelebrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: GoalCelebrationStats;
  onCompleted?: () => void;
}

// ────────────────────────────────────────────────────────────
// Confetti Particle System (lightweight, zero deps)
// ────────────────────────────────────────────────────────────

function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = (canvas.width = canvas.offsetWidth * 2);
    const H = (canvas.height = canvas.offsetHeight * 2);

    const colors = [
      "#FFD700",
      "#FF6B6B",
      "#4ECDC4",
      "#A855F7",
      "#FF9F1C",
      "#2ECC71",
      "#E74C3C",
      "#3498DB",
    ];

    interface Particle {
      x: number;
      y: number;
      w: number;
      h: number;
      vx: number;
      vy: number;
      color: string;
      rot: number;
      rv: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * -H,
        w: 6 + Math.random() * 10,
        h: 4 + Math.random() * 6,
        vx: (Math.random() - 0.5) * 6,
        vy: 2 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        rv: (Math.random() - 0.5) * 0.2,
        opacity: 0.7 + Math.random() * 0.3,
      });
    }

    let raf: number;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rv;
        p.vy += 0.05;
        p.opacity -= 0.002;
        if (p.opacity <= 0 || p.y > H) continue;
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(raf);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-50"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

// ────────────────────────────────────────────────────────────
// Canvas PNG Card Generator
// ────────────────────────────────────────────────────────────

function generateCelebrationCardPNG(
  stats: GoalCelebrationStats,
  t: (key: string, vars?: Record<string, string | number>) => string,
): Promise<string> {
  return new Promise((resolve) => {
    const dpr = 2; // retina
    const W = 1080 * dpr;
    const H = 1080 * dpr;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Scale for retina
    ctx.scale(dpr, dpr);
    const w = 1080;
    const h = 1080;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#0f172a");
    bg.addColorStop(0.5, "#1e1b4b");
    bg.addColorStop(1, "#0f172a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Glassmorphism border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(30, 30, w - 60, h - 60, 40);
    ctx.stroke();

    // Inner subtle glow
    const glow = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, w / 2);
    glow.addColorStop(0, "rgba(168, 85, 247, 0.08)");
    glow.addColorStop(0.5, "rgba(59, 130, 246, 0.04)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Golden badge / achievement banner
    const badgeGrad = ctx.createLinearGradient(w / 2 - 200, 100, w / 2 + 200, 100);
    badgeGrad.addColorStop(0, "#f59e0b");
    badgeGrad.addColorStop(0.5, "#fbbf24");
    badgeGrad.addColorStop(1, "#f59e0b");
    ctx.fillStyle = badgeGrad;
    ctx.beginPath();
    ctx.roundRect(w / 2 - 220, 85, 440, 55, 28);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 24px 'Inter', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(t("profile.celebration.cardGoalCrushed"), w / 2, 120);

    // User name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px 'Inter', 'Segoe UI', sans-serif";
    ctx.fillText(stats.userName, w / 2, 200);

    // Headline
    ctx.fillStyle = "#a78bfa";
    ctx.font = "600 22px 'Inter', 'Segoe UI', sans-serif";
    ctx.fillText(stats.headline, w / 2, 245);

    // Date range
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "500 16px 'Inter', 'Segoe UI', sans-serif";
    ctx.fillText(
      `${stats.startDate}  →  ${new Date().toISOString().slice(0, 10)}`,
      w / 2,
      280,
    );

    // ──── Large stats callout ────
    const statsY = 360;

    // Start weight
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.beginPath();
    ctx.roundRect(60, statsY - 60, 290, 160, 24);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "600 14px 'Inter', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(t("profile.celebration.cardStartWeight"), 205, statsY - 25);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 56px 'Inter', 'Segoe UI', sans-serif";
    ctx.fillText(`${stats.startWeight}`, 205, statsY + 35);
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.font = "600 20px 'Inter', 'Segoe UI', sans-serif";
    ctx.fillText("kg", 205, statsY + 70);

    // Arrow
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 48px 'Inter', 'Segoe UI', sans-serif";
    ctx.fillText("→", w / 2, statsY + 30);

    // Achieved weight
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.beginPath();
    ctx.roundRect(w - 350, statsY - 60, 290, 160, 24);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "600 14px 'Inter', 'Segoe UI', sans-serif";
    ctx.fillText(t("profile.celebration.cardFinalWeight"), w - 205, statsY - 25);
    ctx.fillStyle = "#22c55e";
    ctx.font = "bold 56px 'Inter', 'Segoe UI', sans-serif";
    ctx.fillText(`${stats.currentWeight}`, w - 205, statsY + 35);
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.font = "600 20px 'Inter', 'Segoe UI', sans-serif";
    ctx.fillText("kg", w - 205, statsY + 70);

    // Net Change
    const changeSign = stats.weightChange > 0 ? "+" : "";
    const changeStr = `${changeSign}${stats.weightChange} kg`;
    const changeColor = stats.goal === "lose_weight" ? "#22c55e" : "#3b82f6";
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.beginPath();
    ctx.roundRect(60, statsY + 130, w - 120, 80, 20);
    ctx.fill();

    ctx.fillStyle = changeColor;
    ctx.font = "bold 36px 'Inter', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(changeStr, w / 2, statsY + 182);

    // ──── Stats grid ────
    const gridY = statsY + 250;
    const statsItems = [
      {
        label: t("profile.celebration.cardDays"),
        value: `${stats.daysActive}`,
        emoji: "📅",
      },
      {
        label: t("profile.celebration.cardWorkouts"),
        value: `${stats.totalWorkoutsLogged}`,
        emoji: "🏋️",
      },
      {
        label: t("profile.celebration.cardMeals"),
        value: `${stats.totalMealsLogged}`,
        emoji: "🍽️",
      },
    ];

    const gridCellW = (w - 120 - 40) / 3;
    statsItems.forEach((item, i) => {
      const cx = 60 + i * (gridCellW + 20) + gridCellW / 2;
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.beginPath();
      ctx.roundRect(60 + i * (gridCellW + 20), gridY, gridCellW, 100, 16);
      ctx.fill();

      ctx.font = "28px sans-serif";
      ctx.fillText(item.emoji, cx, gridY + 35);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px 'Inter', 'Segoe UI', sans-serif";
      ctx.fillText(item.value, cx, gridY + 68);
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "500 12px 'Inter', 'Segoe UI', sans-serif";
      ctx.fillText(item.label, cx, gridY + 88);
    });

    // Body measurement changes
    const measY = gridY + 130;
    const hasMeasurements =
      stats.measurementsSummary.waistChange != null ||
      stats.measurementsSummary.chestChange != null ||
      stats.measurementsSummary.hipChange != null;

    if (hasMeasurements) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.beginPath();
      ctx.roundRect(60, measY, w - 120, 60, 16);
      ctx.fill();

      ctx.font = "500 14px 'Inter', 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      let measText = "";
      if (stats.measurementsSummary.waistChange != null) {
        const s = stats.measurementsSummary.waistChange > 0 ? "+" : "";
        measText += `${t("profile.celebration.cardWaist")}: ${s}${stats.measurementsSummary.waistChange} cm   `;
      }
      if (stats.measurementsSummary.chestChange != null) {
        const s = stats.measurementsSummary.chestChange > 0 ? "+" : "";
        measText += `${t("profile.celebration.cardChest")}: ${s}${stats.measurementsSummary.chestChange} cm   `;
      }
      if (stats.measurementsSummary.hipChange != null) {
        const s = stats.measurementsSummary.hipChange > 0 ? "+" : "";
        measText += `${t("profile.celebration.cardHip")}: ${s}${stats.measurementsSummary.hipChange} cm`;
      }
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fillText(measText, w / 2, measY + 38);
    }

    // ──── Branding footer ────
    const footerY = h - 80;

    // Logo load + render
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.onload = function finalize() {
      // Draw logo
      const logoSize = 40;
      ctx.drawImage(logo, w / 2 - 150, footerY - 10, logoSize, logoSize);

      // App name next to logo
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px 'Inter', 'Segoe UI', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(APP_NAME, w / 2 - 100, footerY + 18);

      // Tagline
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.font = "400 12px 'Inter', 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(APP_TAGLINE, w / 2, footerY + 45);

      // URL watermark
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.font = "500 14px 'Inter', 'Segoe UI', sans-serif";
      ctx.fillText(
        APP_SITE_URL.replace(/^https?:\/\//, ""),
        w / 2,
        footerY + 65,
      );

      resolve(canvas.toDataURL("image/png"));
    };
    logo.onerror = function fallbackFinalize() {
      // Fallback without logo
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px 'Inter', 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(APP_NAME, w / 2, footerY + 18);

      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.font = "400 12px 'Inter', 'Segoe UI', sans-serif";
      ctx.fillText(APP_TAGLINE, w / 2, footerY + 45);

      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.font = "500 14px 'Inter', 'Segoe UI', sans-serif";
      ctx.fillText(
        APP_SITE_URL.replace(/^https?:\/\//, ""),
        w / 2,
        footerY + 65,
      );

      resolve(canvas.toDataURL("image/png"));
    };
    logo.src = APP_LOGO;
  });
}

// ────────────────────────────────────────────────────────────
// Next Goal Selector
// ────────────────────────────────────────────────────────────

const GOAL_OPTIONS: {
  id: PrimaryGoal;
  labelKey: string;
  descKey: string;
  icon: typeof Scale;
  color: string;
}[] = [
  {
    id: "maintain",
    labelKey: "profile.celebration.nextMaintain",
    descKey: "profile.celebration.nextMaintainDesc",
    icon: Scale,
    color: "text-blue-500",
  },
  {
    id: "gain_muscle",
    labelKey: "profile.celebration.nextGain",
    descKey: "profile.celebration.nextGainDesc",
    icon: Dumbbell,
    color: "text-purple-500",
  },
  {
    id: "lose_weight",
    labelKey: "profile.celebration.nextLose",
    descKey: "profile.celebration.nextLoseDesc",
    icon: Target,
    color: "text-orange-500",
  },
];

// ────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────

export default function GoalCelebrationModal({
  open,
  onOpenChange,
  stats,
  onCompleted,
}: GoalCelebrationModalProps) {
  const { t } = useI18n();
  const [step, setStep] = useState<"celebrate" | "next-goal">("celebrate");
  const [nextGoal, setNextGoal] = useState<PrimaryGoal>("maintain");
  const [nextTargetWeight, setNextTargetWeight] = useState(
    stats.currentWeight,
  );
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset when opening
  useEffect(() => {
    if (open) {
      setStep("celebrate");
      setNextGoal("maintain");
      setNextTargetWeight(stats.currentWeight);
    }
  }, [open, stats.currentWeight]);

  const handleDownloadPNG = useCallback(async () => {
    setDownloading(true);
    try {
      const dataUrl = await generateCelebrationCardPNG(stats, t);
      const link = document.createElement("a");
      link.download = `NutriBD-Milestone-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
      toast.success(t("profile.celebration.downloadSuccess"));
    } catch {
      toast.error(t("profile.celebration.downloadFailed"));
    } finally {
      setDownloading(false);
    }
  }, [stats, t]);

  const handleCompleteGoal = useCallback(async () => {
    setSubmitting(true);
    try {
      await completeAndArchiveGoal(stats, {
        nextGoal,
        nextTargetWeight,
      });
      toast.success(t("profile.celebration.goalArchived"));
      notifyDataUpdated("all");
      onOpenChange(false);
      onCompleted?.();
    } catch {
      toast.error(t("profile.celebration.archiveFailed"));
    } finally {
      setSubmitting(false);
    }
  }, [stats, nextGoal, nextTargetWeight, t, onOpenChange, onCompleted]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <ConfettiCanvas active={step === "celebrate"} />

      <div
        ref={modalRef}
        className="relative z-[101] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border/50 bg-background shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground z-10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {step === "celebrate" ? (
          /* ──── Step 1: Celebration ──── */
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="text-center space-y-3 pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <Trophy className="w-5 h-5" />
                {stats.achievementBadge}
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                {t("profile.celebration.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {stats.headline}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/30 text-center">
                <Scale className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {stats.startWeight} → {stats.currentWeight}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium mt-1">
                  {t("profile.celebration.weightJourney")} (kg)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/30 text-center">
                <Sparkles className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                <p
                  className={cn(
                    "text-2xl font-black",
                    stats.weightChange < 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : stats.weightChange > 0
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-foreground",
                  )}
                >
                  {stats.weightChange > 0 ? "+" : ""}
                  {stats.weightChange} kg
                </p>
                <p className="text-[10px] text-muted-foreground font-medium mt-1">
                  {t("profile.celebration.netChange")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-center">
                <p className="text-lg font-black text-purple-600 dark:text-purple-400">
                  {stats.daysActive}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {t("profile.celebration.daysLabel")}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-center">
                <Dumbbell className="w-4 h-4 mx-auto text-blue-500 mb-0.5" />
                <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                  {stats.totalWorkoutsLogged}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {t("profile.celebration.workoutsLabel")}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                <Utensils className="w-4 h-4 mx-auto text-emerald-500 mb-0.5" />
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {stats.totalMealsLogged}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {t("profile.celebration.mealsLabel")}
                </p>
              </div>
            </div>

            {/* Measurement Changes */}
            {(stats.measurementsSummary.waistChange != null ||
              stats.measurementsSummary.chestChange != null ||
              stats.measurementsSummary.hipChange != null) && (
              <div className="p-3 rounded-xl bg-muted/40 border border-border/30">
                <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5" />
                  {t("profile.celebration.bodyChanges")}
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  {stats.measurementsSummary.waistChange != null && (
                    <span>
                      {t("profile.celebration.cardWaist")}:{" "}
                      <strong
                        className={
                          stats.measurementsSummary.waistChange < 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                        }
                      >
                        {stats.measurementsSummary.waistChange > 0 ? "+" : ""}
                        {stats.measurementsSummary.waistChange} cm
                      </strong>
                    </span>
                  )}
                  {stats.measurementsSummary.chestChange != null && (
                    <span>
                      {t("profile.celebration.cardChest")}:{" "}
                      <strong className="text-blue-600 dark:text-blue-400">
                        {stats.measurementsSummary.chestChange > 0 ? "+" : ""}
                        {stats.measurementsSummary.chestChange} cm
                      </strong>
                    </span>
                  )}
                  {stats.measurementsSummary.hipChange != null && (
                    <span>
                      {t("profile.celebration.cardHip")}:{" "}
                      <strong className="text-purple-600 dark:text-purple-400">
                        {stats.measurementsSummary.hipChange > 0 ? "+" : ""}
                        {stats.measurementsSummary.hipChange} cm
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={handleDownloadPNG}
                disabled={downloading}
                className="w-full rounded-xl gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold h-12 text-sm shadow-lg"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {t("profile.celebration.downloadCard")}
              </Button>
              <Button
                onClick={() => setStep("next-goal")}
                className="w-full rounded-xl gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 text-sm"
              >
                {t("profile.celebration.completeAndNext")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* ──── Step 2: Next Goal ──── */
          <div className="p-6 space-y-5">
            <div className="text-center space-y-2 pt-2">
              <h2 className="text-xl font-black tracking-tight">
                {t("profile.celebration.nextGoalTitle")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("profile.celebration.nextGoalDesc")}
              </p>
            </div>

            {/* Cleanup notice */}
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              ⚠️ {t("profile.celebration.cleanupNotice")}
            </div>

            {/* Goal options */}
            <div className="space-y-2">
              {GOAL_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = nextGoal === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setNextGoal(opt.id);
                      if (opt.id === "maintain") {
                        setNextTargetWeight(stats.currentWeight);
                      } else if (opt.id === "lose_weight") {
                        setNextTargetWeight(
                          Math.max(40, stats.currentWeight - 5),
                        );
                      } else {
                        setNextTargetWeight(stats.currentWeight + 5);
                      }
                    }}
                    className={cn(
                      "w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all",
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border/50 bg-muted/30 hover:bg-muted/50",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 mt-0.5 flex-shrink-0",
                        selected ? "text-primary" : opt.color,
                      )}
                    />
                    <div>
                      <p className="text-sm font-bold">{t(opt.labelKey)}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {t(opt.descKey)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Target weight input */}
            {nextGoal !== "maintain" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">
                  {t("profile.celebration.newTargetWeight")}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min={30}
                    max={300}
                    value={nextTargetWeight}
                    onChange={(e) =>
                      setNextTargetWeight(parseFloat(e.target.value) || stats.currentWeight)
                    }
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border/50 bg-muted/30 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm font-bold text-muted-foreground">
                    kg
                  </span>
                </div>
              </div>
            )}

            {/* Complete button */}
            <Button
              onClick={handleCompleteGoal}
              disabled={submitting}
              className="w-full rounded-xl gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold h-12 text-sm shadow-lg"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trophy className="w-4 h-4" />
              )}
              {submitting
                ? t("profile.celebration.archiving")
                : t("profile.celebration.completeButton")}
            </Button>

            <button
              onClick={() => setStep("celebrate")}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1"
            >
              ← {t("profile.celebration.backToStats")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
