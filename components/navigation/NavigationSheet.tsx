"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  isNavItemActive,
  navGroups,
} from "@/components/navigation/DesktopSidebar";
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

interface NavigationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NavigationSheet({
  open,
  onOpenChange,
}: NavigationSheetProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [guideOpen, setGuideOpen] = useState(false);

  const handleNavigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="lg:hidden w-[82vw] max-w-[340px] border-r border-border bg-card/95 p-0 backdrop-blur-xl [&>button]:hidden flex flex-col h-full justify-between"
      >
        <SheetHeader className="flex-row items-center justify-between space-y-0 border-b border-border px-5 py-4 text-left shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm">
              <Image
                src={APP_LOGO}
                alt={APP_LOGO_ALT}
                fill
                className="bg-white object-contain p-0.5"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle
                  className="truncate text-lg font-bold tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {APP_NAME}
                </SheetTitle>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {APP_VERSION}
                </span>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                AI Health & Fitness
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => onOpenChange(false)}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
          <div className="space-y-6">
            {navGroups.map((group) => (
              <section key={group.label}>
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isNavItemActive(pathname, item.href);

                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => handleNavigate(item.href)}
                        className={cn(
                          "relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-all",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="navigationSheetIndicator"
                            className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          />
                        )}
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px] flex-shrink-0",
                            isActive && "text-primary",
                          )}
                        />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </nav>
        {/* Developer Footer */}
        <footer className="shrink-0 mt-auto">
          <div className="p-4 border-t border-border space-y-3">
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                setGuideOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all border border-border/60 hover:border-primary/40 group shadow-2xs"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="font-semibold text-foreground text-xs leading-tight">User Guide</span>
                <span className="text-[10px] text-muted-foreground leading-tight">Features & AI Tips</span>
              </div>
              <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">Help</span>
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
        </footer>
      </SheetContent>
    </Sheet>

    <DietUserGuideModal open={guideOpen} onOpenChange={setGuideOpen} />
  </>
  );
}
