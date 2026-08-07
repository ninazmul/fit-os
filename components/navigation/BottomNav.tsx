"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { isNavItemActive, navGroups } from "@/components/navigation/DesktopSidebar";

const QuickAddSheet = dynamic(
  () => import("@/components/shared/QuickAddSheet"),
  { ssr: false }
);

export default function BottomNav() {
  const pathname = usePathname();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const mobileNavItems = navGroups.flatMap((group) => group.items).slice(0, 4);
  const leadingItems = mobileNavItems.slice(0, 2);
  const trailingItems = mobileNavItems.slice(2);

  return (
    <>
      <QuickAddSheet open={quickAddOpen} onOpenChange={setQuickAddOpen} />

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1 relative">
          {leadingItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors relative min-w-[50px]",
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}

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

          {trailingItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors relative min-w-[50px]",
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
