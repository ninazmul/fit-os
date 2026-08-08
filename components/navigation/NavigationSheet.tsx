"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X } from "lucide-react";
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

  const handleNavigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="lg:hidden w-[82vw] max-w-[340px] border-r border-border bg-card/95 p-0 backdrop-blur-xl [&>button]:hidden"
      >
        <SheetHeader className="flex-row items-center justify-between space-y-0 border-b border-border px-5 py-4 text-left">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm">
              <Image
                src="/assets/images/logo.png"
                alt="FitOs Logo"
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
                  FitOS
                </SheetTitle>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  v2.1.1
                </span>
              </div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Fitness Tracker
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

        <nav className="h-[calc(100vh-120px)] flex-1 overflow-y-auto px-3 py-4">
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
        <footer className="">
          <div className="p-4 border-t border-border">
            <p className="text-[11px] text-muted-foreground text-center">
              FitOS v2.1.1 &middot; By{" "}
              <a
                href="https://www.artistycode.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                ArtistyCode Studio
              </a>
            </p>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
