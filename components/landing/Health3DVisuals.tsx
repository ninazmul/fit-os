"use client";

import { motion } from "framer-motion";
import {
  Flame,
  Sparkles,
  Droplet,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function Health3DVisuals() {
  return (
    <div className="relative w-full max-w-lg mx-auto py-2 sm:py-4 select-none overflow-hidden sm:overflow-visible [perspective:1000px]">
      {/* Ambient background glow & radial gradient */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 via-emerald-500/10 to-teal-500/5 rounded-full blur-2xl opacity-60 pointer-events-none" />

      {/* Main 3D Container with natural depth layering */}
      <div className="relative min-h-[320px] sm:min-h-[390px] flex items-center justify-center [transform-style:preserve-3d]">
        {/* CENTERPIECE: 3D Multi-Layered Vitality Hologram Ring */}
        <motion.div
          animate={{
            y: [-4, 4, -4],
            rotateZ: [0, 1, -1, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-20 flex flex-col items-center justify-center p-4 sm:p-7 rounded-full border border-primary/30 bg-card/80 backdrop-blur-2xl shadow-xl shadow-primary/15 sm:[transform:translateZ(30px)] group cursor-default"
        >
          {/* Outer Glowing Ring */}
          <div className="absolute -inset-2.5 rounded-full border border-dashed border-primary/25 animate-[spin_24s_linear_infinite]" />
          <div className="absolute -inset-5 rounded-full border border-emerald-500/15 animate-[spin_36s_linear_infinite_reverse] hidden sm:block" />

          {/* SVG Triple Macro Concentric Rings */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
            <svg
              className="w-full h-full -rotate-90 drop-shadow-sm"
              viewBox="0 0 160 160"
            >
              <defs>
                <linearGradient
                  id="ringProtein"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
                <linearGradient
                  id="ringCarbs"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
                <linearGradient id="ringFat" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>

              {/* Protein Outer Ring (Radius: 68) */}
              <circle
                cx="80"
                cy="80"
                r="68"
                className="stroke-muted/40"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="url(#ringProtein)"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="427"
                strokeDashoffset="100"
                className="transition-all duration-1000"
              />

              {/* Carbs Middle Ring (Radius: 54) */}
              <circle
                cx="80"
                cy="80"
                r="54"
                className="stroke-muted/40"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="54"
                stroke="url(#ringCarbs)"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="339"
                strokeDashoffset="95"
                className="transition-all duration-1000"
              />

              {/* Fat Inner Ring (Radius: 40) */}
              <circle
                cx="80"
                cy="80"
                r="40"
                className="stroke-muted/40"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="40"
                stroke="url(#ringFat)"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="251"
                strokeDashoffset="80"
                className="transition-all duration-1000"
              />
            </svg>

            {/* Core Score Display in Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-primary flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Vitality
              </span>
              <span className="text-xl sm:text-2xl font-black tracking-tighter text-foreground">
                94%
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-muted-foreground">
                Optimal Zone
              </span>
            </div>
          </div>

          {/* Quick Macro Pill Badges below Ring */}
          <div className="flex items-center gap-1 sm:gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] sm:text-[10px] font-bold border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              135g Protein
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] sm:text-[10px] font-bold border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              190g Carbs
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] sm:text-[10px] font-bold border border-purple-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              52g Fat
            </span>
          </div>
        </motion.div>

        {/* FLOATING CARD 1: Localized Bengali AI Food Intelligence (Top Right) */}
        <motion.div
          animate={{
            y: [4, -4, 4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
          className="absolute top-1 right-1 sm:-top-2 sm:-right-2 z-30 max-w-[190px] sm:max-w-[220px] w-full p-2.5 sm:p-3 rounded-2xl border border-primary/25 bg-card/90 backdrop-blur-xl shadow-lg sm:[transform:translateZ(40px)]"
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="p-1 rounded-lg bg-primary/10 text-primary shrink-0">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-black text-foreground truncate">
                Rui Fish & Rice
              </span>
            </div>
            <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-primary/15 text-primary shrink-0">
              AI
            </span>
          </div>
          <div className="flex items-baseline justify-between text-xs mt-0.5">
            <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium truncate">
              1 bati + 1 cup
            </span>
            <span className="font-black text-foreground text-[11px] sm:text-xs shrink-0">
              465 <span className="text-[8px] font-normal text-muted-foreground">kcal</span>
            </span>
          </div>
          <div className="w-full bg-muted/60 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-emerald-400 h-full w-[78%] rounded-full" />
          </div>
        </motion.div>

        {/* FLOATING CARD 2: Daily Habit Streak & Consistency (Bottom Left) */}
        <motion.div
          animate={{
            y: [-4, 4, -4],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8,
          }}
          className="absolute bottom-1 left-1 sm:-bottom-2 sm:-left-2 z-30 max-w-[180px] sm:max-w-[210px] w-full p-2.5 sm:p-3 rounded-2xl border border-border/60 bg-card/90 backdrop-blur-xl shadow-lg sm:[transform:translateZ(35px)]"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <Zap className="w-3.5 h-3.5 fill-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide truncate">
                Habit Streak
              </p>
              <p className="text-[11px] sm:text-xs font-black text-foreground flex items-center gap-1 truncate">
                12 Days <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
              </p>
            </div>
          </div>
        </motion.div>

        {/* FLOATING CARD 3: Hydration Pill (Desktop only) */}
        <motion.div
          animate={{
            y: [3, -3, 3],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.2,
          }}
          className="hidden sm:flex absolute bottom-5 -right-1 z-20 items-center gap-2 px-2.5 py-1.5 rounded-xl border border-cyan-500/30 bg-card/85 backdrop-blur-xl shadow-md [transform:translateZ(25px)]"
        >
          <div className="p-1 rounded-md bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
            <Droplet className="w-3 h-3" />
          </div>
          <div className="text-left">
            <p className="text-[8px] font-bold text-muted-foreground uppercase">
              Hydration
            </p>
            <p className="text-[10px] font-black text-foreground">
              2.4 / 3.0 L
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
