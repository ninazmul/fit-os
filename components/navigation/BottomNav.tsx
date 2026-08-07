"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Dumbbell,
  TrendingUp,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const QuickAddSheet = dynamic(
  () => import("@/components/shared/QuickAddSheet"),
  { ssr: false }
);

export default function BottomNav() {
  const pathname = usePathname();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <>
      <QuickAddSheet open={quickAddOpen} onOpenChange={setQuickAddOpen} />

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1 relative">
          {/* Item 1: Dashboard */}
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors relative min-w-[50px]",
              pathname === "/"
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {pathname === "/" && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">Dashboard</span>
          </Link>

          {/* Item 2: Diet */}
          <Link
            href="/diet"
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors relative min-w-[50px]",
              pathname.startsWith("/diet")
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {pathname.startsWith("/diet") && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <UtensilsCrossed className="w-5 h-5" />
            <span className="text-[10px]">Diet</span>
          </Link>

          {/* Item 3: FAB Center Button */}
          <div className="relative -top-4">
            <button
              type="button"
              onClick={() => setQuickAddOpen(true)}
              className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all fab-pulse"
              aria-label="Quick Add Log"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Item 4: Workout */}
          <Link
            href="/workout"
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors relative min-w-[50px]",
              pathname.startsWith("/workout")
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {pathname.startsWith("/workout") && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <Dumbbell className="w-5 h-5" />
            <span className="text-[10px]">Workout</span>
          </Link>

          {/* Item 5: Progress */}
          <Link
            href="/progress"
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors relative min-w-[50px]",
              pathname.startsWith("/progress")
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {pathname.startsWith("/progress") && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px]">Progress</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

