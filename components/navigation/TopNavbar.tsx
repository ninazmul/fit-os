"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import NavigationSheet from "@/components/navigation/NavigationSheet";

export default function TopNavbar() {
  const router = useRouter();
  const [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <>
      <NavigationSheet
        open={navigationOpen}
        onOpenChange={setNavigationOpen}
      />

      <header className="sticky top-0 z-40 w-full glass-card border-b border-border/50">
        <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-4 md:flex md:justify-between md:px-6">
          {/* Mobile navigation */}
          <div className="flex items-center justify-start md:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => setNavigationOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile logo */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 justify-self-center rounded-xl px-2 py-1 transition-colors hover:bg-accent md:hidden"
            aria-label="Go to dashboard"
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-border/60 bg-white shadow-sm">
              <Image
                src="/assets/images/logo.png"
                alt="FitOs Logo"
                fill
                className="bg-white object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex items-center gap-2">
              <span
                className="truncate text-lg font-bold tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                FitOS
              </span>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                v2.1.0
              </span>
            </div>
          </button>

          {/* Desktop greeting */}
          <div className="hidden md:block">
            <p className="text-sm text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>

          {/* Right side actions */}
          <div className="flex items-center justify-end gap-2">
            <ThemeToggle />
            <SignedIn>
              <UserButton
                afterSwitchSessionUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </header>
    </>
  );
}
