"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  Dumbbell,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Smartphone,
  Brain,
  TrendingUp,
  Moon,
  Lock,
  CheckCircle2,
  Users,
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
  APP_AUTHOR,
  APP_AUTHOR_URL,
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
  { textKey: "landing.trust.noCreditCard", icon: Lock, sub: "100% Free Forever" },
  { textKey: "landing.trust.encrypted", icon: ShieldCheck, sub: "Private & Secure" },
  { textKey: "landing.trust.pwa", icon: Smartphone, sub: "Installable App" },
];

interface LandingShellProps {
  children: React.ReactNode;
  calculatorLinks: readonly { path: string }[];
}

export default function LandingShell({
  children,
  calculatorLinks,
}: LandingShellProps) {
  const { t, locale } = useI18n();
  const isBn = locale === "bn";

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-3 sm:px-6 lg:px-8">
      {/* Top Navbar */}
      <header className="sticky top-3 z-30 mb-6 flex items-center justify-between gap-3 rounded-3xl border border-border/60 bg-background/80 px-4 py-3 shadow-lg shadow-black/5 backdrop-blur-xl sm:mb-8 sm:px-6">
        <Link href="/sign-in" className="group flex min-w-0 items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/50 bg-card p-1 shadow-xs transition-transform duration-300 group-hover:scale-105">
            <Image
              src={APP_LOGO}
              alt={APP_LOGO_ALT}
              fill
              className="object-contain p-0.5"
              priority
            />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-lg font-black tracking-tight font-heading">
              {APP_NAME}
            </span>
            <p className="truncate text-[11px] font-medium text-muted-foreground">
              {APP_TAGLINE}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-bold text-primary">
            <Users className="w-3.5 h-3.5" />
            <span>{isBn ? "১০,০০০+ খাবার ট্র্যাকড" : "10k+ Meals Tracked"}</span>
          </div>
          <LanguageToggle />
          <Link
            href="#auth"
            className="flex shrink-0 items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:scale-[1.02] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
          >
            {t("nav.getStarted")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero + 3D Showcase + Seamless Auth */}
      <main className="mb-12 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.15fr)_460px] lg:items-start lg:gap-8">
        {/* Left Section: Value Proposition & 3D Interactive Showcase */}
        <section className="min-w-0 space-y-6 rounded-[2.5rem] border border-border/60 bg-card/70 p-6 shadow-xl shadow-black/5 backdrop-blur-xl sm:p-8 lg:p-10 relative overflow-hidden">
          {/* Subtle Ambient Light Cone inside hero */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

          {/* Top Pill with live active status */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary shadow-xs">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <span>{t("landing.pill")}</span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isBn ? "লাইভ এআই ফিটনেস ও নিউট্রিশন ইঞ্জিন" : "Live AI Health Engine"}
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3 relative z-10">
            <h1 className="text-3xl font-black leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {t("landing.heroTitlePre")}{" "}
              <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                {t("landing.heroTitleHighlight")}
              </span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-7">
              {t("landing.heroDesc")}
            </p>
          </div>

          {/* BESPOKE 3D INTERACTIVE VISUAL DISPLAY */}
          <div className="py-2">
            <Health3DVisuals />
          </div>

          {/* What you get - High-clarity bento items */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                {t("landing.serve.title")}
              </p>
              <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {isBn ? "কোনো লুকানো ফি নেই" : "No hidden charges"}
              </span>
            </div>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {serveItems.map(({ icon: Icon, key, badge }) => (
                <li
                  key={key}
                  className="flex items-start gap-3 rounded-2xl border border-border/50 bg-card/60 p-3.5 transition-all hover:border-primary/40 hover:bg-card/90 hover:shadow-sm group"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-foreground">
                        {t(key)}
                      </span>
                    </div>
                    <span className="inline-block text-[9px] font-bold text-primary/80 mt-0.5">
                      {badge}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href="#auth"
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99]"
            >
              {t("landing.ctaCreate")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#calc"
              className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card/80 px-6 py-3.5 text-sm font-bold text-foreground transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-[0.99]"
            >
              {t("landing.ctaExplore")} <Zap className="h-4 w-4 text-primary" />
            </Link>
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
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1.5 text-xs font-bold text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
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

        {/* Auth Card Aside: Seamless, High-Converting & Distraction-Free */}
        <aside id="auth" className="min-w-0 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-[2.5rem] border border-border/70 bg-card/85 p-5 shadow-2xl shadow-black/10 backdrop-blur-2xl sm:p-7 relative">
            {/* Top decorative glass shine */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-70" />

            {/* Header Box */}
            <div className="mb-5 flex items-center gap-3.5 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent p-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 shadow-inner">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-primary">
                  {t("landing.aside.badge")}
                </p>
                <p className="text-sm font-black text-foreground">
                  {t("landing.aside.title")}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                  {t("landing.aside.desc")}
                </p>
              </div>
            </div>

            {/* Clerk Sign-in / Sign-up component slot */}
            <div className="flex items-center justify-center w-full min-w-0">{children}</div>
          </div>

          {/* Trust Badges with Micro-reassurance */}
          <div className="mt-3.5 grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-muted-foreground">
            {trustBadges.map(({ textKey, icon: Icon, sub }) => (
              <div
                key={textKey}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border/50 bg-card/60 px-2 py-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-foreground font-black text-[10px] mt-0.5">
                  {t(textKey)}
                </span>
                <span className="text-[8px] text-muted-foreground font-medium normal-case">
                  {sub}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </main>

      {/* Interactive Calculators Section */}
      <div id="calc" className="py-6">
        <FitnessCalculator />
      </div>

      {/* Bottom Ad Unit */}
      <div className="border-t border-border/60 py-6">
        <AdUnit size="auto" maxWidth="970px" />
      </div>

      {/* Production Footer */}
      <footer className="border-t border-border/60 py-10">
        <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div className="space-y-2">
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
              className="text-pink-600 transition-colors hover:text-pink-500 dark:text-pink-400"
            >
              {t("landing.footer.aboutDonate")}
            </Link>
          </nav>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-border/40 pt-5 text-xs text-muted-foreground sm:flex-row">
          <span>
            &copy; {new Date().getFullYear()} {APP_NAME}.{" "}
            {t("landing.footer.rights")}
          </span>
          <span>
            {t("landing.footer.craftedBy")}{" "}
            <a
              href={APP_AUTHOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
            >
              {APP_AUTHOR}
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
