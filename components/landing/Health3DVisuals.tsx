"use client";

import { motion } from "framer-motion";
import {
  Flame,
  Dumbbell,
  Sparkles,
  Heart,
  Droplet,
  Zap,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function Health3DVisuals() {
  return (
    <div className="relative w-full max-w-xl mx-auto py-4 select-none [perspective:1200px]">
      {/* Ambient background glow & radial gradient */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 via-emerald-500/10 to-teal-500/5 rounded-full blur-3xl opacity-75 pointer-events-none" />

      {/* Main 3D Container with natural depth layering */}
      <div className="relative min-h-[380px] sm:min-h-[420px] flex items-center justify-center [transform-style:preserve-3d]">
        {/* CENTERPIECE: 3D Multi-Layered Vitality Hologram Ring */}
        <motion.div
          animate={{
            y: [-6, 6, -6],
            rotateZ: [0, 1.5, -1.5, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-20 flex flex-col items-center justify-center p-6 sm:p-8 rounded-full border border-primary/30 bg-card/70 backdrop-blur-2xl shadow-2xl shadow-primary/20 [transform:translateZ(40px)] group cursor-default"
        >
          {/* Outer Glowing Ring */}
          <div className="absolute -inset-3 rounded-full border border-dashed border-primary/25 animate-[spin_24s_linear_infinite]" />
          <div className="absolute -inset-6 rounded-full border border-emerald-500/15 animate-[spin_36s_linear_infinite_reverse]" />

          {/* SVG Triple Macro Concentric Rings */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
            <svg
              className="w-full h-full -rotate-90 drop-shadow-md"
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
              <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-primary flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Vitality
              </span>
              <span className="text-2xl sm:text-3xl font-black tracking-tighter text-foreground">
                94%
              </span>
              <span className="text-[9px] font-bold text-muted-foreground">
                Optimal Zone
              </span>
            </div>
          </div>

          {/* Quick Macro Pill Badges below Ring */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              135g Protein
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              190g Carbs
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold border border-purple-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              52g Fat
            </span>
          </div>
        </motion.div>

        {/* FLOATING CARD 1: Localized Bengali AI Food Intelligence (Top Right) */}
        <motion.div
          animate={{
            y: [5, -5, 5],
            x: [0, 4, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute -top-3 right-0 sm:-right-4 z-30 w-52 sm:w-60 p-3 sm:p-3.5 rounded-2xl border border-primary/25 bg-card/85 backdrop-blur-xl shadow-xl shadow-black/10 [transform:translateZ(60px)] transition-transform hover:scale-105"
        >
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-primary/10 text-primary">
                <Flame className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] font-black text-foreground truncate">
                Rui Fish & Rice
              </span>
            </div>
            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-primary/15 text-primary border border-primary/20">
              AI Logged
            </span>
          </div>
          <div className="flex items-baseline justify-between text-xs mt-1">
            <span className="text-[11px] text-muted-foreground font-medium">
              1 bati + 1 cup
            </span>
            <span className="font-black text-foreground text-xs">
              465 <span className="text-[9px] font-normal text-muted-foreground">kcal</span>
            </span>
          </div>
          <div className="w-full bg-muted/60 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-emerald-400 h-full w-[78%] rounded-full" />
          </div>
          <div className="flex justify-between items-center text-[9px] text-muted-foreground font-bold mt-1.5 pt-1 border-t border-border/40">
            <span className="text-emerald-600 dark:text-emerald-400">34g Protein</span>
            <span>54g Carbs</span>
            <span>12g Fat</span>
          </div>
        </motion.div>

        {/* FLOATING CARD 2: Daily Habit Streak & Consistency (Bottom Left) */}
        <motion.div
          animate={{
            y: [-6, 6, -6],
            x: [0, -3, 0],
          }}
          transition={{
            duration: 6.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-4 left-0 sm:-left-4 z-30 w-48 sm:w-56 p-3 sm:p-3.5 rounded-2xl border border-border/60 bg-card/85 backdrop-blur-xl shadow-xl shadow-black/10 [transform:translateZ(50px)] transition-transform hover:scale-105"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Zap className="w-4 h-4 fill-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                Habit Streak
              </p>
              <p className="text-xs sm:text-sm font-black text-foreground flex items-center gap-1">
                12 Days Strong <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              </p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1 mt-2.5">
            {[1, 2, 3, 4, 5].map((day) => (
              <div
                key={day}
                className="h-1.5 rounded-full bg-primary shadow-xs shadow-primary/40"
              />
            ))}
          </div>
        </motion.div>

        {/* FLOATING CARD 3: Biometric Hydration & Recovery Pill (Bottom Right) */}
        <motion.div
          animate={{
            y: [4, -4, 4],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
          className="hidden sm:flex absolute bottom-6 -right-2 z-20 items-center gap-2.5 px-3 py-2 rounded-2xl border border-cyan-500/30 bg-card/80 backdrop-blur-xl shadow-lg [transform:translateZ(30px)]"
        >
          <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
            <Droplet className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[9px] font-bold text-muted-foreground uppercase">
              Hydration
            </p>
            <p className="text-xs font-black text-foreground">
              2.4 / 3.0 L
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
