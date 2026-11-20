"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  Dumbbell,
  Sparkles,
  ShieldCheck,
  Zap,
  Smartphone,
  Brain,
  TrendingUp,
  Moon,
  Lock,
  CheckCircle2,
} from "lucide-react";
import AdUnit from "@/components/shared/AdUnit";
import FitnessCalculator from "@/components/shared/FitnessCalculator";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { useI18n } from "@/components/shared/I18nProvider";
import Health3DVisuals from "./Health3DVisuals";
import {
  APP_NAME,
  APP_VERSION,
  APP_TAGLINE,
  APP_LOGO,
  APP_LOGO_ALT,
} from "@/lib/constants";

// High-converting value pillars
const serveItems = [
  { icon: Flame, key: "landing.serve.diet", badge: "100+ BD Foods" },
  { icon: Dumbbell, key: "landing.serve.workout", badge: "Smart Sets" },
  { icon: TrendingUp, key: "landing.serve.body", badge: "Body Comp" },
  { icon: Moon, key: "landing.serve.sleep", badge: "Recovery" },
  { icon: Brain, key: "landing.serve.ai", badge: "Gemini AI" },
];

const trustBadges = [
  { textKey: "landing.trust.noCreditCard", icon: Lock, sub: "100% Free" },
  { textKey: "landing.trust.encrypted", icon: ShieldCheck, sub: "Encrypted" },
  { textKey: "landing.trust.pwa", icon: Smartphone, sub: "Installable PWA" },
];

interface LandingShellProps {
  children: React.ReactNode;
  calculatorLinks: readonly { path: string }[];
}

export default function LandingShell({
  children,
  calculatorLinks,
}: LandingShellProps) {
  const { t } = useI18n();

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pb-12 pt-2 sm:pt-4">
      {/* Top Navbar */}
      <header className="sticky top-2 sm:top-3 z-30 mb-4 sm:mb-8 flex items-center justify-between gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl border border-border/60 bg-background/85 px-3.5 py-2.5 sm:px-6 sm:py-3 shadow-lg shadow-black/5 backdrop-blur-xl">
        <Link href="/sign-in" className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-card p-1 shadow-xs transition-transform duration-300 group-hover:scale-105">
            <Image
              src={APP_LOGO}
              alt={APP_LOGO_ALT}
              fill
              className="object-contain p-0.5"
              priority
            />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-base sm:text-lg font-black tracking-tight">
              {APP_NAME}
            </span>
            <p className="hidden sm:block truncate text-[10px] sm:text-[11px] font-medium text-muted-foreground">
              {APP_TAGLINE}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle />
          <Link
            href="#calc"
            className="flex shrink-0 items-center gap-1.5 rounded-xl sm:rounded-2xl border border-border/60 bg-muted/50 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
          >
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">{t("nav.calculators")}</span>
          </Link>
        </div>
      </header>

      {/* Mobile-Only Intro Banner: Gives quick 3-second context before the Sign-In card */}
      <div className="lg:hidden text-center space-y-2 mb-4 px-1">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
          <Sparkles className="h-3 w-3 shrink-0 text-primary" />
          <span>{t("landing.pill")}</span>
        </div>
        <h1 className="text-2xl font-black leading-tight tracking-tight text-foreground">
          {t("landing.heroTitlePre")}{" "}
          <span className="bg-linear-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
            {t("landing.heroTitleHighlight")}
          </span>
        </h1>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          {t("landing.heroDesc")}
        </p>
      </div>

      {/* Main Grid: Responsive 2-column on desktop, smooth natural flow on mobile */}
      <main className="mb-10 sm:mb-12 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.2fr)_420px] lg:items-start lg:gap-8">
        {/* Auth Aside Card */}
        <aside
          id="auth"
          className="min-w-0 order-1 lg:order-2 lg:sticky lg:top-24 w-full scroll-mt-24"
        >
          <div className="overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-border/70 bg-card/95 p-4 sm:p-6 shadow-xl shadow-black/5 backdrop-blur-2xl relative">
            {/* Top decorative glass shine */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-70" />

            {/* Clerk Component Slot - Clean & Seamless */}
            <div className="flex items-center justify-center w-full min-w-0 py-1">
              {children}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {trustBadges.map(({ textKey, icon: Icon, sub }) => (
              <div
                key={textKey}
                className="flex flex-col items-center justify-center gap-0.5 rounded-2xl border border-border/50 bg-card/60 px-2 py-2 transition-colors hover:border-primary/30"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-foreground font-black text-[9px] sm:text-[10px] mt-0.5 truncate w-full">
                  {t(textKey)}
                </span>
                <span className="text-[8px] text-muted-foreground font-medium truncate w-full">
                  {sub}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* Hero Section: Value Proposition & 3D Interactive Bento Showcase */}
        <section className="min-w-0 order-2 lg:order-1 space-y-4 sm:space-y-6 rounded-3xl sm:rounded-[2.5rem] border border-border/60 bg-card/70 p-4 sm:p-8 lg:p-10 shadow-xl shadow-black/5 backdrop-blur-xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          {/* Desktop Top Pill & Headline (Hidden on Mobile because shown above auth card) */}
          <div className="hidden lg:block space-y-3">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary shadow-xs">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>{t("landing.pill")}</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.12] tracking-tight text-foreground">
              {t("landing.heroTitlePre")}{" "}
              <span className="bg-linear-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                {t("landing.heroTitleHighlight")}
              </span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              {t("landing.heroDesc")}
            </p>
          </div>

          {/* Bento Vitality Visual Display */}
          <Health3DVisuals />

          {/* What you get - Clean Bento Grid */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                {t("landing.serve.title")}
              </p>
              <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 100% Free
              </span>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {serveItems.map(({ icon: Icon, key, badge }) => (
                <li
                  key={key}
                  className="flex items-start gap-2.5 sm:gap-3 rounded-2xl border border-border/50 bg-card/60 p-3 transition-all hover:border-primary/40 hover:bg-card/90"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-foreground block">
                      {t(key)}
                    </span>
                    <span className="inline-block text-[9px] font-bold text-primary/80 mt-0.5">
                      {badge}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Calculator Badges */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              {t("landing.calculatorsLabel")}
            </p>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {calculatorLinks.map((page) => (
                <Link
                  key={page.path}
                  href={page.path}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-bold text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                >
                  <Zap className="h-3 w-3 text-primary" />
                  {page.path
                    .replace("/", "")
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Interactive Calculators Section */}
      <div id="calc" className="py-4 sm:py-6 scroll-mt-24">
        <FitnessCalculator />
      </div>

      {/* Bottom Ad Unit */}
      <div className="border-t border-border/60 py-4 sm:py-6">
        <AdUnit size="auto" maxWidth="970px" />
      </div>

      {/* Production Footer */}
      <footer className="border-t border-border/60 py-8 sm:py-10">
        <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <span className="font-black text-foreground">{APP_NAME}</span>
              <span className="rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] font-black text-muted-foreground">
                {APP_VERSION}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{APP_TAGLINE}</p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold">
            <Link
              href="#calc"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("nav.calculators")}
            </Link>
            <Link
              href="#auth"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("landing.footer.signIn")}
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("landing.footer.aboutDonate")}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
