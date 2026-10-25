import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
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
import { buildPublicPageMetadata, publicSeoPages } from "@/lib/seo";
import {
  APP_NAME,
  APP_VERSION,
  APP_TAGLINE,
  APP_LOGO,
  APP_LOGO_ALT,
  APP_AUTHOR,
  APP_AUTHOR_URL,
} from "@/lib/constants";

export const metadata: Metadata = buildPublicPageMetadata("/sign-in");

const featureHighlights = [
  {
    icon: Brain,
    title: "Google Gemini AI Coach",
    desc: "Personalized Health Score (0–100), 7-day gameplans, and instant conversational AI advice.",
    badge: "AI Powered",
    color: "from-purple-500/20 to-primary/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: Flame,
    title: "AI Recipe & Macro Estimator",
    desc: "Describe home-cooked Bengali & global dishes in plain words; AI calculates exact calories & macros.",
    badge: "Natural Language",
    color: "from-amber-500/20 to-primary/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: ScanBarcode,
    title: "Barcode Scanner & Dual Scale",
    desc: "Scan packaged products or scale custom food by exact grams (e.g. 20g of a 100g database entry).",
    badge: "Fast Logging",
    color: "from-blue-500/20 to-primary/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: TrendingUp,
    title: "AI Goal Trajectory & Recomp",
    desc: "Predicts arrival date at target weight and assesses fat loss vs. muscle retention via 9-point measurements.",
    badge: "Forecasting",
    color: "from-emerald-500/20 to-primary/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Dumbbell,
    title: "Workout & Volume Tracker",
    desc: "Log exercises, sets, reps, weight lifted, and duration with weekly consistency targets.",
    badge: "Training",
    color: "from-rose-500/20 to-primary/20",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    icon: Moon,
    title: "Sleep & Recovery Index",
    desc: "Track sleep quality and duration with AI readiness indicators for maximum workout performance.",
    badge: "Recovery",
    color: "from-indigo-500/20 to-primary/20",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
];

const saasPillars = [
  {
    icon: Brain,
    title: "Gemini 1.5/2.0 Flash AI",
    desc: "State-of-the-art multimodal reasoning that understands culinary methods, oils, and physical recovery.",
  },
  {
    icon: Smartphone,
    title: "Installable PWA App",
    desc: "Add to iOS & Android home screen. Runs with lightning speed, tactile feedback, and offline fallback.",
  },
  {
    icon: ShieldCheck,
    title: "100% Private & Secure",
    desc: "Enterprise Clerk authentication. Your biometrics, weights, and logs are encrypted and never shared.",
  },
  {
    icon: PieChart,
    title: "Dynamic Macro Distribution",
    desc: "Real-time calorie & macro rings calibrated to your BMR, TDEE, and fitness target.",
  },
];

const calculatorLinks = publicSeoPages.filter((page) =>
  page.path.includes("calculator"),
);

const faqItems = [
  {
    q: "What is NutriBD (NutriBD) and how does it help with fitness tracking?",
    a: "NutriBD is a free, all-in-one personal fitness, nutrition, and health intelligence platform. Powered by Google Gemini AI, it calculates clinical biometrics (BMI, BMR, TDEE, Body Fat %, WHR, Ideal Weight), tracks meals from a 100+ Bengali & global food database, estimates custom recipes using AI, logs workouts, monitors sleep recovery, and tracks 9-point body circumferences.",
  },
  {
    q: "How does the AI Recipe Estimator work?",
    a: "Instead of manually calculating individual ingredients, you can type or describe what you cooked in natural language (e.g., '1 bowl chicken curry made with 200g chicken breast, 1 potato, and 1 tbsp mustard oil, ate half'). Gemini AI automatically extracts the raw ingredients, adjusts for cooking oil absorption, and scales the exact calories and macros to the portion you actually ate.",
  },
  {
    q: "Is NutriBD free to use?",
    a: "Yes! NutriBD is 100% free with no paywalls, subscriptions, or credit card requirements. All calculators, AI features, and tracking tools are accessible to everyone.",
  },
  {
    q: "Can I install NutriBD as an app on my phone?",
    a: "Absolutely. NutriBD is a Progressive Web App (PWA). You can tap 'Add to Home Screen' in Safari on iOS or Chrome on Android to install it as a standalone app on your device.",
  },
  {
    q: "How does NutriBD calculate my daily calories and macros?",
    a: "NutriBD uses the clinically validated Mifflin-St Jeor equation to compute your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) based on your gender, age, height, current weight, and activity level. It then customizes your daily caloric deficit/surplus and protein distribution according to your specific goal.",
  },
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: APP_NAME,
    applicationCategory: "HealthApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: APP_TAGLINE,
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  },
];

// Production animated Macro Ring indicator
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

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Background Decorative Mesh & Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/15 via-emerald-500/10 to-transparent blur-3xl" />
        <div className="absolute right-[-10%] top-[40%] h-[400px] w-[500px] rounded-full bg-gradient-to-bl from-blue-500/10 via-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[360px] w-[420px] rounded-full bg-gradient-to-tr from-emerald-500/10 via-primary/10 to-transparent blur-3xl" />
      </div>

      {/* JSON-LD Structured Data */}
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        {/* Top Navbar */}
        <header className="sticky top-3 z-30 mb-6 flex items-center justify-between gap-3 rounded-3xl border border-border/60 bg-background/80 px-4 py-3 shadow-lg shadow-black/5 backdrop-blur-xl sm:mb-10 sm:px-6">
          <Link
            href="/sign-in"
            className="flex min-w-0 items-center gap-3 group"
          >
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
                <span className="hidden sm:inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  ✨ Gemini AI
                </span>
              </div>
              <p className="truncate text-[11px] font-medium text-muted-foreground">
                {APP_TAGLINE}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="#calc"
              className="hidden items-center gap-1.5 rounded-2xl border border-border/60 bg-muted/40 px-4 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 sm:inline-flex"
            >
              Calculators <Zap className="h-3.5 w-3.5 text-primary" />
            </Link>
            <Link
              href="#auth"
              className="flex shrink-0 items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:scale-[1.02] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]"
            >
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="mb-12 grid gap-6 min-w-0 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start lg:gap-8">
          <section className="space-y-6 min-w-0 rounded-[2.5rem] border border-border/60 bg-card/70 p-6 shadow-xl shadow-black/5 backdrop-blur-xl sm:p-8 lg:min-h-[calc(100vh-10rem)] lg:p-10">
            {/* Top Pill */}
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary shadow-sm">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <span>Next-Gen AI Fitness & Nutrition OS</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-black leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.85rem]">
                Smart Health Intelligence for{" "}
                <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  Diet, Workouts & Body
                </span>
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-7">
                Calculate your exact BMI, BMR, TDEE, body fat % and ideal
                weight. Track calories from 100+ Bangladeshi & global foods, log
                workouts, measure recovery, and get real-time Google Gemini AI
                coaching.
              </p>
            </div>

            {/* Live Stats Counters */}
            <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border/50 bg-muted/30 backdrop-blur-md">
              {[
                ["Gemini AI", "Intelligence"],
                ["100+ Foods", "Bangladeshi & Global"],
                ["100% Free", "Zero Paywalls"],
              ].map(([value, label], index) => (
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
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#calc"
                className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card/80 px-6 py-3.5 text-sm font-bold text-foreground transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 active:scale-[0.99]"
              >
                Explore Calculators <Zap className="h-4 w-4 text-primary" />
              </Link>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {featureHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/90 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-sm`}
                      >
                        <Icon className={`h-5 w-5 ${item.iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-xs font-bold leading-tight">
                            {item.title}
                          </h2>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                          {item.desc}
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
                Instant Online Calculators:
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
                    AI Fitness Platform
                  </p>
                  <p className="text-sm font-black text-foreground">
                    Sign in to your Dashboard
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    Track diet, workouts, sleep and AI insights in one place.
                  </p>
                </div>
              </div>

              {/* Clerk Sign-in component slot */}
              <div className="flex items-center justify-center">{children}</div>
            </div>

            {/* Trust Badges */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-muted-foreground">
              {[
                { text: "No Credit Card", icon: Lock },
                { text: "Encrypted Data", icon: ShieldCheck },
                { text: "PWA Mobile", icon: Smartphone },
              ].map(({ text, icon: Icon }) => (
                <div
                  key={text}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border/50 bg-card/50 px-2 py-2.5 transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </aside>
        </main>

        {/* Feature Pillars */}
        <section className="space-y-6 py-10 sm:py-14">
          <div className="mx-auto max-w-2xl space-y-2 text-center">
            <h2 className="text-2xl font-black tracking-tight sm:text-4xl">
              Engineered for Complete Body Intelligence
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm leading-relaxed">
              NutriBD combines verified exercise science with multimodal Gemini
              AI to give you real, sustainable results.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {saasPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article
                  key={pillar.title}
                  className="group space-y-3 rounded-3xl border border-border/60 bg-card/60 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold">{pillar.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {pillar.desc}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Ad Unit Slot */}
        <div className="py-4">
          <AdUnit size="auto" maxWidth="970px" />
        </div>

        {/* Interactive Calculators Section */}
        <div id="calc" className="py-6">
          <FitnessCalculator />
        </div>

        {/* Ad Unit Slot */}
        <div className="py-4">
          <AdUnit size="auto" label="Sponsored" maxWidth="970px" />
        </div>

        {/* FAQ Section */}
        <section className="border-t border-border/60 py-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="space-y-4 lg:col-span-5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3.5 py-1 text-xs font-bold text-foreground">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Everything you need to know about {APP_NAME}
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Learn how {APP_NAME} combines clinical fitness algorithms,
                intelligent meal tracking, and Gemini AI coaching to help you
                reach your goals.
              </p>
            </div>

            <div className="space-y-3 lg:col-span-7">
              {faqItems.map((faq, index) => (
                <details
                  key={faq.q}
                  open={index === 0}
                  className="group rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm transition-all hover:border-primary/40 open:border-primary/40 open:bg-card/90 open:shadow-md"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold text-foreground marker:content-none sm:text-sm [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {faq.q}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <p className="mt-2.5 pl-5 text-xs leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

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
                Calculators
              </Link>
              <Link
                href="#auth"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/about"
                className="text-pink-600 transition-colors hover:text-pink-500 dark:text-pink-400"
              >
                About & Donate ❤️
              </Link>
            </nav>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-border/40 pt-5 text-xs text-muted-foreground sm:flex-row">
            <span>
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </span>
            <span>
              Crafted with ❤️ by{" "}
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
    </div>
  );
};

export default Layout;
