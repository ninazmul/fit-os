"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  Dumbbell,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  PieChart,
  ArrowRight,
  Smartphone,
  BookOpen,
  Brain,
  ScanBarcode,
  Moon,
  TrendingUp,
  Lock,
  ChevronDown,
} from "lucide-react";
import AdUnit from "@/components/shared/AdUnit";
import FitnessCalculator from "@/components/shared/FitnessCalculator";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { useI18n } from "@/components/shared/I18nProvider";
import {
  APP_NAME,
  APP_VERSION,
  APP_TAGLINE,
  APP_LOGO,
  APP_LOGO_ALT,
  APP_AUTHOR,
  APP_AUTHOR_URL,
} from "@/lib/constants";

const featureHighlights = [
  {
    icon: Brain,
    titleKey: "landing.feature.gemini.title",
    descKey: "landing.feature.gemini.desc",
    color: "from-purple-500/20 to-primary/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: Flame,
    titleKey: "landing.feature.recipe.title",
    descKey: "landing.feature.recipe.desc",
    color: "from-amber-500/20 to-primary/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: ScanBarcode,
    titleKey: "landing.feature.barcode.title",
    descKey: "landing.feature.barcode.desc",
    color: "from-blue-500/20 to-primary/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: TrendingUp,
    titleKey: "landing.feature.trajectory.title",
    descKey: "landing.feature.trajectory.desc",
    color: "from-emerald-500/20 to-primary/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Dumbbell,
    titleKey: "landing.feature.workout.title",
    descKey: "landing.feature.workout.desc",
    color: "from-rose-500/20 to-primary/20",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    icon: Moon,
    titleKey: "landing.feature.sleep.title",
    descKey: "landing.feature.sleep.desc",
    color: "from-indigo-500/20 to-primary/20",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
];

const saasPillars = [
  {
    icon: Brain,
    titleKey: "landing.pillar.gemini.title",
    descKey: "landing.pillar.gemini.desc",
  },
  {
    icon: Smartphone,
    titleKey: "landing.pillar.pwa.title",
    descKey: "landing.pillar.pwa.desc",
  },
  {
    icon: ShieldCheck,
    titleKey: "landing.pillar.privacy.title",
    descKey: "landing.pillar.privacy.desc",
  },
  {
    icon: PieChart,
    titleKey: "landing.pillar.macros.title",
    descKey: "landing.pillar.macros.desc",
  },
];

const faqKeys = [
  { q: "landing.faq.q1", a: "landing.faq.a1" },
  { q: "landing.faq.q2", a: "landing.faq.a2" },
  { q: "landing.faq.q3", a: "landing.faq.a3" },
  { q: "landing.faq.q4", a: "landing.faq.a4" },
  { q: "landing.faq.q5", a: "landing.faq.a5" },
];

const trustBadges = [
  { textKey: "landing.trust.noCreditCard", icon: Lock },
  { textKey: "landing.trust.encrypted", icon: ShieldCheck },
  { textKey: "landing.trust.pwa", icon: Smartphone },
];

// Animated Macro Ring indicator
const MacroRing = () => (
  <svg
    viewBox="0 0 120 120"
    role="img"
    aria-label="Illustrative health score ring showing 92 out of 100"
    className="h-16 w-16 shrink-0 drop-shadow-sm sm:h-20 sm:w-20"
  >
    <defs>
      <linearGradient
        id="landingRingPrimary"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="100%"
      >
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
    </defs>
    <circle
      cx="60"
      cy="60"
      r="50"
      fill="none"
      strokeWidth="10"
      className="stroke-muted"
    />
    <circle
      cx="60"
      cy="60"
      r="50"
      fill="none"
      stroke="url(#landingRingPrimary)"
      strokeWidth="10"
      strokeLinecap="round"
      strokeDasharray="314.15"
      strokeDashoffset="78.5"
      transform="rotate(-90 60 60)"
    />
    <circle
      cx="60"
      cy="60"
      r="50"
      fill="none"
      strokeWidth="10"
      strokeLinecap="round"
      strokeDasharray="314.15"
      strokeDashoffset="235.6"
      transform="rotate(60 60 60)"
      className="stroke-blue-500"
    />
    <text
      x="60"
      y="57"
      textAnchor="middle"
      fontSize="18"
      fontWeight="800"
      className="fill-foreground"
    >
      92
    </text>
    <text
      x="60"
      y="71"
      textAnchor="middle"
      fontSize="7.5"
      fontWeight="700"
      letterSpacing="0.05em"
      className="fill-emerald-500"
    >
      HEALTH AI
    </text>
  </svg>
);

interface LandingShellProps {
  children: React.ReactNode;
  calculatorLinks: readonly { path: string }[];
}

export default function LandingShell({
  children,
  calculatorLinks,
}: LandingShellProps) {
  const { t } = useI18n();

  const stats = [
    { value: t("landing.stat1.value"), label: t("landing.stat1.label") },
    { value: t("landing.stat2.value"), label: t("landing.stat2.label") },
    { value: t("landing.stat3.value"), label: t("landing.stat3.label") },
  ];

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
      {/* Top Navbar */}
      <header className="sticky top-3 z-30 mb-6 flex items-center justify-between gap-3 rounded-3xl border border-border/60 bg-background/80 px-4 py-3 shadow-lg shadow-black/5 backdrop-blur-xl sm:mb-10 sm:px-6">
        <Link href="/sign-in" className="flex min-w-0 items-center gap-3 group">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/50 bg-card p-1 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <Image
              src={APP_LOGO}
              alt={APP_LOGO_ALT}
              fill
              className="object-contain p-0.5"
              priority
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-lg font-black tracking-tight font-heading">
                {APP_NAME}
              </span>
              <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary sm:inline-flex">
                {APP_VERSION}
              </span>
              <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 sm:inline-flex">
                ✨ Gemini AI
              </span>
            </div>
            <p className="truncate text-[11px] font-medium text-muted-foreground">
              {APP_TAGLINE}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link
            href="#calc"
            className="hidden items-center gap-1.5 rounded-2xl border border-border/60 bg-muted/40 px-4 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 sm:inline-flex"
          >
            {t("nav.calculators")}{" "}
            <Zap className="h-3.5 w-3.5 text-primary" />
          </Link>
          <Link
            href="#auth"
            className="flex shrink-0 items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:scale-[1.02] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
          >
            {t("nav.getStarted")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mb-12 grid gap-6 min-w-0 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start lg:gap-8">
        <section className="space-y-6 min-w-0 rounded-[2.5rem] border border-border/60 bg-card/70 p-6 shadow-xl shadow-black/5 backdrop-blur-xl sm:p-8 lg:min-h-[calc(100vh-10rem)] lg:p-10">
          {/* Top Pill */}
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary shadow-sm">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <span>{t("landing.pill")}</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="max-w-3xl text-3xl font-black leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.85rem]">
              {t("landing.heroTitlePre")}{" "}
              <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                {t("landing.heroTitleHighlight")}
              </span>
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-7">
              {t("landing.heroDesc")}
            </p>
          </div>

          {/* Live Stats Counters */}
          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border/50 bg-muted/30 backdrop-blur-md">
            {stats.map(({ value, label }, index) => (
              <div
                key={label}
                className={`px-3 py-3.5 text-center ${
                  index > 0 ? "border-l border-border/50" : ""
                }`}
              >
                <p className="text-base font-black text-primary sm:text-xl">
                  {value}
                </p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
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
              {t("landing.ctaExplore")}{" "}
              <Zap className="h-4 w-4 text-primary" />
            </Link>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {featureHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.titleKey}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/90 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-sm`}
                    >
                      <Icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xs font-bold leading-tight">
                        {t(item.titleKey)}
                      </h2>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        {t(item.descKey)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Quick Calculator Badges */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
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

        {/* Auth Card Aside */}
        <aside id="auth" className="lg:sticky lg:top-24 min-w-0">
          <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-4 shadow-xl shadow-black/5 backdrop-blur-xl sm:p-5">
            {/* Header Box */}
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent p-3.5">
              <MacroRing />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-primary">
                  {t("landing.aside.badge")}
                </p>
                <p className="text-sm font-black text-foreground">
                  {t("landing.aside.title")}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  {t("landing.aside.desc")}
                </p>
              </div>
            </div>

            {/* Clerk Sign-in component slot */}
            <div className="flex items-center justify-center">{children}</div>
          </div>

          {/* Trust Badges */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-muted-foreground">
            {trustBadges.map(({ textKey, icon: Icon }) => (
              <div
                key={textKey}
                className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border/50 bg-card/50 px-2 py-2.5 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span>{t(textKey)}</span>
              </div>
            ))}
          </div>
        </aside>
      </main>

      {/* Feature Pillars */}
      <section className="space-y-6 py-10 sm:py-14">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <h2 className="text-2xl font-black tracking-tight sm:text-4xl">
            {t("landing.pillars.title")}
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm leading-relaxed">
            {t("landing.pillars.desc")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {saasPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.titleKey}
                className="group space-y-3 rounded-3xl border border-border/60 bg-card/60 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-sm transition-transform duration-300 group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold">{t(pillar.titleKey)}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t(pillar.descKey)}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Interactive Calculators Section */}
      <div id="calc" className="py-6">
        <FitnessCalculator />
      </div>

      {/* FAQ Section */}
      <section className="border-t border-border/60 py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="space-y-4 lg:col-span-5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3.5 py-1 text-xs font-bold text-foreground">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>{t("landing.faq.badge")}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              {t("landing.faq.title", { appName: APP_NAME })}
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {t("landing.faq.desc", { appName: APP_NAME })}
            </p>
          </div>

          <div className="space-y-3 lg:col-span-7">
            {faqKeys.map((faq, index) => (
              <details
                key={faq.q}
                open={index === 0}
                className="group rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm transition-all hover:border-primary/40 open:border-primary/40 open:bg-card/90 open:shadow-md"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold text-foreground marker:content-none sm:text-sm [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {t(faq.q)}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="mt-2.5 pl-5 text-xs leading-relaxed text-muted-foreground">
                  {t(faq.a)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

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
