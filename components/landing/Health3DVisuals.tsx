"use client";

import { motion } from "framer-motion";
import {
  Flame,
  Sparkles,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function Health3DVisuals() {
  return (
    <div className="w-full max-w-full my-2 sm:my-4 select-none">
      {/* Sleek Bento Vitality Showcase Container */}
      <div className="relative rounded-3xl border border-primary/20 bg-linear-to-b from-primary/5 via-card/70 to-card/90 p-3.5 sm:p-5 backdrop-blur-xl shadow-lg shadow-black/5 overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-5">

          {/* Concentric Macro Rings */}
          <motion.div
            animate={{
              y: [-3, 3, -3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex flex-col items-center justify-center shrink-0"
          >
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
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
                  <linearGradient
                    id="ringFat"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>

                {/* Protein Ring (Radius: 68) */}
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
                />

                {/* Carbs Ring (Radius: 54) */}
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
                />

                {/* Fat Ring (Radius: 40) */}
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
                />
              </svg>

              {/* Core Vitality Score */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-black tracking-widest uppercase text-primary flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Vitality
                </span>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  94%
                </span>
                <span className="text-[8px] font-bold text-muted-foreground">
                  Daily Balance
                </span>
              </div>
            </div>

            {/* Macro Labels */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                135g Protein
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                190g Carbs
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                52g Fat
              </span>
            </div>
          </motion.div>

          {/* Right Bento Cards: Localized AI + Habit Streak */}
          <div className="flex-1 w-full space-y-2.5 min-w-0">
            {/* Bento Card 1: Bangladeshi Food Recognition */}
            <div className="p-3 rounded-2xl border border-primary/25 bg-card/90 shadow-xs">
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="p-1 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Flame className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-black text-foreground truncate">
                    Rui Fish Bhuna & Brown Rice
                  </span>
                </div>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-primary/15 text-primary shrink-0">
                  AI Logged
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs mt-1">
                <span className="text-[10px] text-muted-foreground font-medium">
                  1 bati + 1 cup rice
                </span>
                <span className="font-black text-foreground text-xs">
                  465 <span className="text-[9px] font-normal text-muted-foreground">kcal</span>
                </span>
              </div>
              <div className="w-full bg-muted/60 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-linear-to-r from-primary to-emerald-400 h-full w-[78%] rounded-full" />
              </div>
              <div className="flex justify-between items-center text-[9px] text-muted-foreground font-bold mt-1.5 pt-1 border-t border-border/30">
                <span className="text-emerald-600 dark:text-emerald-400">34g Protein</span>
                <span>54g Carbs</span>
                <span>12g Fat</span>
              </div>
            </div>

            {/* Bento Card 2: Streak & Consistency */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl border border-border/60 bg-card/80 shadow-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                  <Zap className="w-4 h-4 fill-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    Consistency Streak
                  </p>
                  <p className="text-xs font-black text-foreground flex items-center gap-1 truncate">
                    12 Days Strong <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  </p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                {[1, 2, 3, 4, 5].map((d) => (
                  <div
                    key={d}
                    className="w-2 h-4 rounded-full bg-primary/90"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
