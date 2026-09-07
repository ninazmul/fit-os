"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Dumbbell,
  TrendingUp,
  User,
  BarChart3,
  Settings,
  Heart,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  APP_NAME,
  APP_VERSION,
  APP_AUTHOR,
  APP_AUTHOR_URL,
  APP_LOGO,
  APP_LOGO_ALT,
} from "@/lib/constants";

const DietUserGuideModal = dynamic(
  () => import("@/components/shared/DietUserGuideModal"),
  { ssr: false },
);

export const navGroups = [
  {
    label: "Main",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/diet", label: "Diet", icon: UtensilsCrossed },
      { href: "/workout", label: "Workout", icon: Dumbbell },
    ],
  },
  {
    label: "Tracking",
    items: [
      { href: "/progress", label: "Progress", icon: TrendingUp },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/profile", label: "Profile", icon: User },
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/about", label: "About & Donate", icon: Heart },
    ],
  },
];

export function isNavItemActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function DesktopSidebar() {
  const pathname = usePathname();
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-border bg-card/80 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white overflow-hidden shadow-sm border border-border/60">
            <Image
              src={APP_LOGO}
              alt={APP_LOGO_ALT}
              fill
              className="object-contain p-0.5 bg-white"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="truncate text-lg font-bold tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {APP_NAME}
              </span>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {APP_VERSION}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              AI Health & Fitness
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <AnimatePresence>
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = isNavItemActive(pathname, item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group",
                          isActive
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent",
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="sidebarIndicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          />
                        )}
                        <Icon
                          className={cn(
                            "w-[18px] h-[18px] flex-shrink-0",
                            isActive && "text-primary",
                          )}
                        />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </AnimatePresence>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-3">
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all border border-border/60 hover:border-primary/40 group shadow-2xs"
          >
            <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="font-semibold text-foreground text-xs leading-tight truncate">User Guide</span>
              <span className="text-[10px] text-muted-foreground leading-tight truncate">Features & AI Tips</span>
            </div>
            <span className="text-[10px] bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded-full">Help</span>
          </button>

          <p className="text-[11px] text-muted-foreground text-center">
            {APP_NAME} {APP_VERSION} &middot; By{" "}
            <a
              href={APP_AUTHOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              {APP_AUTHOR}
            </a>
          </p>
        </div>
      </aside>

      <DietUserGuideModal open={guideOpen} onOpenChange={setGuideOpen} />
    </>
  );
}
