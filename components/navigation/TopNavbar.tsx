"use client";

import { Show, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { useI18n } from "@/components/shared/I18nProvider";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { bn as bnLocale } from "date-fns/locale";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import NavigationSheet from "@/components/navigation/NavigationSheet";
import { APP_NAME, APP_LOGO, APP_LOGO_ALT } from "@/lib/constants";

export default function TopNavbar() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <>
      <NavigationSheet open={navigationOpen} onOpenChange={setNavigationOpen} />

      <header className="sticky top-0 z-40 w-full bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 border-b border-border/50 shadow-xs">
        <div className="flex h-14 items-center justify-between px-3 sm:px-6">
          {/* Left: Mobile Menu + Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center md:hidden">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl"
                onClick={() => setNavigationOpen(true)}
                aria-label={t("a11y.openNavigation")}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition-colors hover:bg-accent md:hidden"
              aria-label={t("a11y.goToDashboard")}
            >
              <div className="relative h-7 w-7 overflow-hidden rounded-lg border border-border/60 bg-white shadow-xs">
                <Image
                  src={APP_LOGO}
                  alt={APP_LOGO_ALT}
                  fill
                  className="bg-white object-contain p-0.5"
                  priority
                />
              </div>
              <span className="truncate text-base font-black tracking-tight font-heading">
                {APP_NAME}
              </span>
            </button>

            {/* Desktop greeting */}
            <div className="hidden md:block">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                {format(new Date(), "EEEE, MMMM d, yyyy", {
                  locale: locale === "bn" ? bnLocale : undefined,
                })}
              </p>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <LanguageToggle />
            <ThemeToggle />
            <Show when="signed-in">
              <UserButton
                afterSwitchSessionUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 sm:w-9 sm:h-9",
                  },
                }}
              />
            </Show>
          </div>
        </div>
      </header>
    </>
  );
}
