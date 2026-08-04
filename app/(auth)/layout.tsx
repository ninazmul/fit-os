import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  Scale,
  Dumbbell,
  Droplet,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  PieChart,
  ArrowRight,
  Smartphone,
  BookOpen,
} from "lucide-react";

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

const faqItems = [
  {
    q: "What makes FitOS unique for nutrition tracking?",
    a: "FitOS includes a built-in database of traditional Bangladeshi foods (like Kacchi Biryani, Morog Polao, Ilish Fish Curry, Dal, Roti) alongside international dishes, allowing accurate local calorie and macro tracking.",
  },
  {
    q: "How does FitOS calculate my daily targets?",
    a: "FitOS uses scientifically validated equations (Mifflin-St Jeor for BMR & TDEE, and U.S. Navy standards for Body Fat %) to calculate optimal daily calories, protein, carbs, fat, and hydration goals.",
  },
  {
    q: "Is FitOS usable on mobile devices?",
    a: "Yes! FitOS is a Progressive Web App (PWA). You can install it on iOS or Android directly from your browser for a native app feel and offline compatibility.",
  },
];

// Signature element: a segmented "macro ring" echoing the dial in the
// FitOS mark — green for progress made, gray for what's left, same as the logo.
const MacroRing = () => (
  <svg viewBox="0 0 120 120" className="h-16 w-16 sm:h-20 sm:w-20 shrink-0">
    <circle cx="60" cy="60" r="52" fill="none" stroke="#E9EBEC" strokeWidth="10" />
    <circle
      cx="60" cy="60" r="52" fill="none"
      stroke="#4E8B2E" strokeWidth="10" strokeLinecap="round"
      strokeDasharray="326.7" strokeDashoffset="98"
      transform="rotate(-90 60 60)"
    />
    <circle
      cx="60" cy="60" r="52" fill="none"
      stroke="#37414A" strokeWidth="10" strokeLinecap="round"
      strokeDasharray="326.7" strokeDashoffset="245"
      transform="rotate(48 60 60)"
    />
    <text x="60" y="56" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize="20" fontWeight="700" fill="#1F2937">70%</text>
    <text x="60" y="72" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="8" fill="#6B7580">today</text>
  </svg>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{
        background: "#FFFFFF",
        color: "#1F2937",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between py-3.5 px-4 sm:px-5 rounded-2xl mb-6 sm:mb-10 gap-3 sm:gap-0 bg-white border border-[#E9EBEC] shadow-[0_1px_2px_rgba(31,41,55,0.04)]">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center overflow-hidden rounded-xl bg-white border border-[#E9EBEC]">
              <Image
                src="/assets/images/logo.png"
                alt="FitOS Logo"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-lg sm:text-xl font-bold tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  FitOS
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF6E9] text-[#4E8B2E] border border-[#4E8B2E]/20">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-[#6B7580] font-medium">
                Personal Fitness &amp; Nutrition OS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F2F3] border border-[#37414A]/15 text-xs font-semibold text-[#37414A]">
              <Zap className="w-3.5 h-3.5 fill-[#4E8B2E] text-[#4E8B2E]" />
              <span>Smart AI Insights</span>
            </div>
            <Link
              href="/sign-in"
              className="text-xs font-semibold text-[#6B7580] hover:text-[#1F2937] transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-[#4E8B2E] text-white hover:bg-[#3F7223] transition-all shadow-sm flex items-center gap-1"
            >
              Get Started <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Hero + Auth */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          <section className="lg:col-span-7 space-y-7 pt-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF6E9] border border-[#4E8B2E]/20 text-xs font-semibold text-[#4E8B2E]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Complete Health &amp; Nutrition System</span>
            </div>

            <div className="space-y-4">
              <h1
                className="text-3xl sm:text-4xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.1]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Master your fitness &amp; nutrition with{" "}
                <span className="text-[#4E8B2E]">intelligent tracking</span>.
              </h1>
              <p className="text-sm sm:text-base leading-relaxed max-w-2xl text-[#6B7580]">
                FitOS is your all-in-one personal fitness companion. Log workouts, track
                traditional Bangladeshi and global meals, calculate accurate macros, and
                monitor body metrics with smart AI guidance.
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {featureHighlights.map((item) => {
                const Icon = item.icon;
                const isGreen = item.accent === "green";
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-3.5 p-4 rounded-2xl border bg-white hover:shadow-md transition-all"
                    style={{ borderColor: "#E9EBEC" }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: isGreen ? "#EEF6E9" : "#F1F2F3",
                        color: isGreen ? "#4E8B2E" : "#37414A",
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xs sm:text-sm font-bold">{item.title}</h2>
                      <p className="text-[11px] mt-0.5 leading-snug text-[#6B7580]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats strip with the signature ring */}
            <div className="flex items-center gap-5 p-4 sm:p-5 rounded-2xl bg-white border border-[#E9EBEC]">
              <MacroRing />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 flex-1 min-w-0">
                <div>
                  <p
                    className="text-lg sm:text-2xl font-bold text-[#4E8B2E]"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    100+
                  </p>
                  <p className="text-[10px] font-medium text-[#6B7580] leading-tight">
                    Bangladeshi Foods
                  </p>
                </div>
                <div className="border-l border-[#E9EBEC] pl-3 sm:pl-4">
                  <p
                    className="text-lg sm:text-2xl font-bold text-[#37414A]"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    100%
                  </p>
                  <p className="text-[10px] font-medium text-[#6B7580] leading-tight">
                    Free &amp; PWA Ready
                  </p>
                </div>
                <div className="hidden md:block border-l border-[#E9EBEC] pl-3 sm:pl-4">
                  <p
                    className="text-lg sm:text-2xl font-bold text-[#1F2937]"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    Instant
                  </p>
                  <p className="text-[10px] font-medium text-[#6B7580] leading-tight">
                    Macro Analytics
                  </p>
                </div>
              </div>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-[#6B7580] pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#4E8B2E]" />
                No Credit Card Required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#4E8B2E]" />
                Works Offline
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#4E8B2E]" />
                Custom Food Creator
              </span>
            </div>
          </section>

          {/* Auth card */}
          <section className="lg:col-span-5 flex items-center justify-center lg:sticky lg:top-6">
            {children}
          </section>
        </main>

        {/* Pillars */}
        <section className="space-y-8 py-10 border-t border-[#E9EBEC]">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Everything you need to succeed, in one workspace
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7580]">
              Designed for fitness enthusiasts, athletes, and anyone wanting full control
              over their health, body composition, and nutrition.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {saasPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article
                  key={pillar.title}
                  className="p-5 rounded-2xl border border-[#E9EBEC] bg-white hover:border-[#4E8B2E]/30 hover:shadow-md transition-all space-y-2.5"
                >
                  <div className="h-9 w-9 rounded-xl bg-[#EEF6E9] text-[#4E8B2E] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold">{pillar.title}</h3>
                  <p className="text-xs leading-relaxed text-[#6B7580]">{pillar.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-10 border-t border-[#E9EBEC]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F2F3] text-[#37414A] text-xs font-semibold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Learn more about FitOS
              </h2>
              <p className="text-xs leading-relaxed text-[#6B7580]">
                FitOS combines advanced health metrics, localized Bangladeshi diet
                tracking, and workout routines into a single intuitive web app.
              </p>
            </div>

            <div className="lg:col-span-7 space-y-3">
              {faqItems.map((faq) => (
                <div
                  key={faq.q}
                  className="p-4 rounded-2xl border border-[#E9EBEC] bg-white space-y-1.5"
                >
                  <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-[#4E8B2E] shrink-0" />
                    {faq.q}
                  </h3>
                  <p className="text-xs leading-relaxed pl-5 text-[#6B7580]">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 border-t border-[#E9EBEC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7580]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1F2937]">FitOS v2.0</span>
            <span>&middot; Personal Fitness &amp; Nutrition Companion</span>
          </div>
          <div>
            Built with ❤️ by{" "}
            <a href="https://www.artistycode.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-[#1F2937] transition-colors"
            >
              ArtistyCode Studio
            </a>
          </div>
        </footer>
      </div >
    </div >
  );
};

export default Layout;