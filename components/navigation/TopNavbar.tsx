"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import Image from "next/image";
import { format } from "date-fns";

export default function TopNavbar() {
  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-border/50">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="relative h-8 w-8 rounded-lg bg-card overflow-hidden border border-border/60 shadow-sm">
            <Image
              src="/assets/images/logo.png"
              alt="FitOs Logo"
              fill
              className="object-contain dark:bg-white"
              priority
            />
          </div>
          <span className="text-base font-bold">FitOS</span>
        </div>

        {/* Desktop greeting */}
        <div className="hidden md:block">
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
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
  );
}
