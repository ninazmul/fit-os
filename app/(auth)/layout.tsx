import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Flame,
  Scale,
  Dumbbell,
  Droplet,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  PieChart,
  ArrowRight,
  Smartphone,
  BookOpen,
} from "lucide-react";
import AdUnit from "@/components/shared/AdUnit";
import FitnessCalculator from "@/components/shared/FitnessCalculator";
import {
  buildPublicPageMetadata,
  publicSeoPages,
  SEO_KEYWORDS,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = buildPublicPageMetadata("/sign-in");

const featureHighlights = [
  {
    icon: Dumbbell,
    title: "Workout Routine Manager",
    desc: "Log exercises, sets, reps, weights, and personal records seamlessly.",
    accent: "green",
  },
  {
    icon: Flame,
    title: "Bangladeshi & Global Diet",
    desc: "100+ Bengali dishes (Polao, Kacchi, Dal, Fish) with full macro profiles.",
    accent: "gray",
  },
  {
    icon: Scale,
    title: "Smart Body Metrics",
    desc: "Auto-calculate BMI, BMR, TDEE, Body Fat %, and ideal weight range.",
    accent: "green",
  },
  {
    icon: Droplet,
    title: "Hydration & Habits",
    desc: "Quick-log water intake, set daily targets, and build healthy streaks.",
    accent: "gray",
  },
];

const saasPillars = [
  {
    icon: Sparkles,
    title: "AI Caloric & Macro Engine",
    desc: "Mifflin-St Jeor equation customized for your age, weight, height, and goal.",
  },
  {
    icon: Smartphone,
    title: "Installable PWA App",
    desc: "Add to iOS & Android home screen. Runs lightning fast with offline fallback.",
  },
  {
    icon: ShieldCheck,
    title: "100% Private & Secure",
    desc: "Your health metrics and progress logs are protected with enterprise Clerk auth.",
  },
  {
    icon: PieChart,
    title: "Macro Split Analytics",
    desc: "Visual distribution bars for Protein, Carbs, Fat, and Fiber targets.",
  },
];

const calculatorLinks = publicSeoPages.filter((page) =>
  page.path.includes("calculator"),
);

const faqItems = [
  {
    q: "What is FitOS and how does it help with fitness tracking?",
    a: "FitOS is a free, all-in-one personal fitness and nutrition tracking app. It helps you calculate BMI, BMR, TDEE, and body fat percentage, log workouts, track calories from 100+ Bangladeshi and international foods, monitor water intake, and analyze body measurements — all with AI-powered insights.",
  },
  {
    q: "How do I calculate my BMI online for free?",
    a: "Use the free BMI calculator on this page. Enter your height in centimeters and weight in kilograms, and FitOS instantly calculates your Body Mass Index using the standard formula: BMI = weight(kg) ÷ height²(m²). It also shows your BMI category and ideal weight range.",
  },
  {
    q: "What makes FitOS unique for Bangladeshi food nutrition tracking?",
    a: "FitOS includes a built-in database of traditional Bangladeshi foods (like Kacchi Biryani, Morog Polao, Ilish Fish Curry, Dal, Roti, Bhuna Khichuri) alongside international dishes, allowing accurate local calorie and macro tracking that other fitness apps don't offer.",
  },
  {
    q: "How does FitOS calculate my daily calorie and macro targets?",
    a: "FitOS uses the Mifflin-St Jeor formula for BMR and TDEE, and U.S. Navy standards for Body Fat %. Based on your age, gender, weight, height, activity level, and fitness goal, it calculates optimal daily calories, protein, carbs, fat, fiber, and water targets.",
  },
  {
    q: "What is the difference between BMR and TDEE?",
    a: "BMR (Basal Metabolic Rate) is the calories your body burns at rest. TDEE (Total Daily Energy Expenditure) is your BMR multiplied by an activity factor — total calories burned per day including exercise. Use TDEE for meal planning: eat below TDEE to lose weight, at TDEE to maintain, or above to gain.",
  },
  {
    q: "Can I use FitOS on my phone like a native app?",
    a: "Yes! FitOS is a Progressive Web App (PWA). Install it on iOS or Android directly from your browser for a native app feel with offline compatibility. No app store download needed.",
  },
  {
    q: "Is FitOS really free?",
    a: "FitOS is 100% free with no hidden fees or premium plans. All features — calculators, food database, workout logging, body metrics, and AI insights — are available to every user. The app is supported by non-intrusive advertisements.",
  },
];

// JSON-LD structured data for rich Google snippets
const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/assets/images/logo.png`,
  sameAs: ["https://www.artistycode.studio/"],
};

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: ["fitOs", "Fit OS"],
  url: SITE_URL,
  inLanguage: "en",
  description:
    "Free fitness tracker and online fitness calculators for BMI, BMR, TDEE, body fat percentage, ideal weight, calories, macros, workouts and Bangladeshi food nutrition.",
  keywords: SEO_KEYWORDS.join(", "),
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/assets/images/logo.png`,
    },
  },
};

const jsonLdWebApp = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  alternateName: ["fitOs", "Fit OS fitness tracker"],
  url: SITE_URL,
  applicationCategory: "HealthApplication",
  operatingSystem: "All",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "Free online fitness tracker with BMI calculator, BMR calculator, TDEE calculator, body fat percentage calculator, calorie counter, and 100+ Bangladeshi food nutrition database.",
  featureList: [
    "BMI Calculator",
    "BMR Calculator",
    "TDEE Calculator",
    "Body Fat Percentage Calculator",
    "Ideal Weight Calculator",
    "Calorie & Macro Tracker",
    "100+ Bangladeshi Food Database",
    "Workout Logger",
    "Water Intake Tracker",
    "Body Measurement Tracker",
    "Progressive Web App (PWA)",
    "AI-Powered Insights",
  ],
  author: {
    "@type": "Organization",
    name: "ArtistyCode Studio",
    url: "https://www.artistycode.studio/",
  },
};

const jsonLdCalculatorList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "FitOS Free Fitness Calculators",
  itemListElement: publicSeoPages
    .filter((page) => page.path.includes("calculator"))
    .map((page, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}${page.path}`,
      name: page.title.replace(" | FitOS", ""),
      description: page.description,
    })),
};

const jsonLdFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const structuredData = [
  jsonLdOrganization,
  jsonLdWebsite,
  jsonLdWebApp,
  jsonLdCalculatorList,
  jsonLdFAQ,
];

// Signature macro ring — same as app logo style
const MacroRing = () => (
  <svg viewBox="0 0 120 120" className="h-16 w-16 sm:h-20 sm:w-20 shrink-0">
    <circle
      cx="60"
      cy="60"
      r="52"
      fill="none"
      stroke="#E9EBEC"
      strokeWidth="10"
    />
    <circle
      cx="60"
      cy="60"
      r="52"
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth="10"
      strokeLinecap="round"
      strokeDasharray="326.7"
      strokeDashoffset="98"
      transform="rotate(-90 60 60)"
    />
    <circle
      cx="60"
      cy="60"
      r="52"
      fill="none"
      stroke="#37414A"
      strokeWidth="10"
      strokeLinecap="round"
      strokeDasharray="326.7"
      strokeDashoffset="245"
      transform="rotate(48 60 60)"
    />
    <text
      x="60"
      y="56"
      textAnchor="middle"
      fontFamily="'IBM Plex Mono', monospace"
      fontSize="20"
      fontWeight="700"
      fill="#1F2937"
    >
      70%
    </text>
    <text
      x="60"
      y="72"
      textAnchor="middle"
      fontFamily="Inter, sans-serif"
      fontSize="8"
      fill="#6B7580"
    >
      today
    </text>
  </svg>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-white"
      style={{
        color: "#1F2937",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* JSON-LD Structured Data for Google rich snippets */}
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <header className="sticky top-3 z-30 mb-5 flex items-center justify-between gap-3 rounded-2xl border border-[#E1E7DD] bg-white/95 px-3 py-3 shadow-sm backdrop-blur sm:mb-8 sm:px-4">
          <Link href="/sign-in" className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E1E7DD] bg-white">
              <Image
                src="/assets/images/logo.png"
                alt="FitOS Logo – Free BMI Calculator & Fitness Tracker"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="truncate text-lg font-bold tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  FitOS
                </span>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  v2.0
                </span>
              </div>
              <p className="truncate text-[11px] font-medium text-[#6B7580]">
                Free BMI Calculator &amp; Fitness Tracker
              </p>
            </div>
          </Link>

          <Link
            href="#auth"
            className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:px-4"
          >
            Start <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </header>

        <main className="mb-10 grid gap-5 min-w-0 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-start lg:gap-8">
          <section className="space-y-5 min-w-0 rounded-[2rem] border border-[#E1E7DD] bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-7 lg:min-h-[calc(100vh-8rem)] lg:px-8 lg:py-9">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>Free calculators plus daily fitness tracking</span>
            </div>

            <div className="space-y-3">
              <h1
                className="max-w-3xl text-[2.35rem] font-bold leading-[1.04] tracking-tight text-[#172018] sm:text-5xl lg:text-[4rem]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                FitOS is your free{" "}
                <span className="text-primary">fitness tracker</span> for
                food, workouts and body metrics.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-[#5F6C61] sm:text-base sm:leading-7">
                Calculate BMI, BMR, TDEE, body fat percentage and ideal weight.
                Then track calories from Bangladeshi and global foods, workouts,
                water, sleep and measurements from one private dashboard.
              </p>
            </div>

            <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-[#E1E7DD] bg-[#F7F9F6]">
              {[
                ["100+", "Foods"],
                ["5-in-1", "Calculators"],
                ["Free", "PWA"],
              ].map(([value, label], index) => (
                <div
                  key={label}
                  className={`px-3 py-3 text-center ${index > 0 ? "border-l border-[#E1E7DD]" : ""
                    }`}
                >
                  <p
                    className="text-lg font-bold text-primary sm:text-2xl"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {value}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7580]">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {featureHighlights.map((item) => {
                const Icon = item.icon;
                const isGreen = item.accent === "green";
                return (
                  <article
                    key={item.title}
                    className="flex items-start gap-3 rounded-2xl border border-[#E1E7DD] bg-white p-3.5"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: isGreen
                          ? "hsl(var(--primary) / 0.1)"
                          : "#F1F2F3",
                        color: isGreen ? "hsl(var(--primary))" : "#37414A",
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold leading-tight">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-xs leading-5 text-[#6B7580]">
                        {item.desc}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {calculatorLinks.map((page) => (
                <Link
                  key={page.path}
                  href={page.path}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-[#DDE6D9] bg-primary/5 px-3.5 py-2 text-xs font-bold text-[#37414A] transition-colors hover:border-primary/40 hover:bg-primary/10"
                >
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  {page.path
                    .replace("/", "")
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="#auth"
                className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Start Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#calc"
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#DDE6D9] bg-white px-5 py-3 text-sm font-bold text-[#37414A] transition-colors hover:bg-[#F1F2F3]"
              >
                Use Calculators <Zap className="h-4 w-4 text-primary" />
              </Link>
            </div>
          </section>

          <aside id="auth" className="lg:sticky lg:top-24 min-w-0">
            <div className="overflow-hidden rounded-xl border border-[#E1E7DD] bg-white p-3 shadow-sm sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl bg-primary/5 p-3">
                <div className="flex items-center gap-3">
                  <MacroRing />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                      Personal OS
                    </p>
                    <p className="text-sm font-bold text-[#1F2937]">
                      Sign in to your tracker
                    </p>
                    <p className="text-xs text-[#6B7580]">
                      Calories, workouts and progress in one place.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">{children}</div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B7580]">
              {["No card", "Private", "PWA ready"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#E1E7DD] bg-white px-2 py-2"
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </main>

        <section className="space-y-5 py-8 sm:space-y-7 sm:py-10">
          <div className="mx-auto max-w-2xl space-y-2 text-center">
            <h2
              className="text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Built for daily tracking, not one-time guessing
            </h2>
            <p className="text-sm leading-6 text-[#6B7580]">
              FitOS connects calculator results with real nutrition, workout,
              water, sleep and measurement logs.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {saasPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article
                  key={pillar.title}
                  className="space-y-2.5 rounded-2xl border border-[#E1E7DD] bg-white p-4 shadow-sm transition-colors hover:border-primary/30 sm:p-5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold">{pillar.title}</h3>
                  <p className="text-xs leading-5 text-[#6B7580]">
                    {pillar.desc}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <div className="py-4">
          <AdUnit size="auto" maxWidth="970px" />
        </div>

        <div id="calc">
          <FitnessCalculator />
        </div>

        <div className="py-4">
          <AdUnit size="auto" label="Sponsored" maxWidth="970px" />
        </div>

        <section className="border-t border-[#E1E7DD] py-8 sm:py-10">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            <div className="space-y-3 lg:col-span-5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#37414A] ring-1 ring-[#E1E7DD]">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2
                className="text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                BMI calculator, calorie counter and fitness tracking answers
              </h2>
              <p className="text-sm leading-6 text-[#6B7580]">
                FitOS combines free fitness calculators (BMI, BMR, TDEE, Body
                Fat %, Ideal Weight), a 100+ Bangladeshi food database, workout
                tracking, and AI-powered health insights into a single intuitive
                web app.
              </p>
            </div>

            <div className="space-y-3 lg:col-span-7">
              {faqItems.map((faq) => (
                <div
                  key={faq.q}
                  className="space-y-1.5 rounded-2xl border border-[#E1E7DD] bg-white p-4 shadow-sm"
                >
                  <h3 className="flex items-center gap-2 text-sm font-bold">
                    <Activity className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {faq.q}
                  </h3>
                  <p className="pl-5 text-xs leading-5 text-[#6B7580]">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-[#E1E7DD] py-6 text-center text-xs text-[#6B7580] sm:flex-row sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="font-bold text-[#1F2937]">FitOS v2.0</span>
            <span>&middot; Free BMI Calculator &amp; Fitness Tracker</span>
          </div>
          <div>
            Built with ❤️ by{" "}
            <a
              href="https://www.artistycode.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-[#1F2937] transition-colors"
            >
              ArtistyCode Studio
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
