import Image from "next/image";
import { Flame, Scale, Dumbbell, Droplet, TrendingUp } from "lucide-react";

const featureHighlights = [
  {
    icon: Dumbbell,
    label: "Workout Tracking",
    desc: "Log sessions & PRs",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Flame,
    label: "Nutrition Logger",
    desc: "Calories & macros",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Scale,
    label: "Weight Progress",
    desc: "Trends & goals",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Droplet,
    label: "Habits & Water",
    desc: "Daily streak tracking",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-2 py-2 sm:px-4 sm:py-4 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb-emerald absolute -top-24 right-[-5rem] h-72 w-72 rounded-full blur-3xl sm:right-[-2rem] sm:h-80 sm:w-80" />
        <div className="orb-blue absolute -bottom-20 left-[-5rem] h-80 w-80 rounded-full blur-3xl sm:left-[-2rem]" />
        <div className="orb-orange absolute top-1/3 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full blur-3xl" />
      </div>

      <div className="relative isolate mx-auto flex w-full max-w-6xl flex-col overflow-visible rounded-3xl border border-border/60 bg-card/70 shadow-[0_30px_80px_-28px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:min-h-[680px] lg:flex-row lg:overflow-hidden">
        <aside className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center border-r border-border/60 p-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="orb-primary absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl" />
            <div className="orb-blue absolute -bottom-20 -left-10 h-64 w-64 rounded-full blur-3xl" />
          </div>

          <div className="relative flex w-full max-w-sm flex-col items-center space-y-8">
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-card shadow-lg border border-border/60">
                  <Image
                    src="/assets/images/logo.png"
                    alt="FitOs Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    FitOs
                  </h1>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Fitness Tracker
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Welcome Back
              </div>
              <p className="max-w-xs text-center text-sm text-muted-foreground">
                Personal Fitness &amp; Nutrition Tracker
              </p>
            </div>

            <div className="grid w-full grid-cols-2 gap-3">
              {featureHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-2xl border border-border/50 bg-background/50 p-3 backdrop-blur-sm transition-transform hover:scale-[1.02]"
                  >
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${item.bg}`}
                    >
                      <Icon className={`h-[18px] w-[18px] ${item.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="w-full rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10 p-4 text-center">
              <p className="text-xs font-medium text-foreground">
                💪 <span className="font-bold">Stay consistent.</span>
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Track every rep, log every meal, conquer your goals.
              </p>
            </div>
          </div>
        </aside>

        <main className="relative flex w-full flex-1 flex-col items-center justify-center overflow-y-auto p-3 sm:p-5 md:p-8">
          <div className="flex w-full flex-col items-center lg:hidden">
            <div className="mb-5 w-full flex-shrink-0 flex flex-col items-center">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-card shadow-md border border-border/60">
                  <Image
                    src="/assets/images/logo.png"
                    alt="FitOs Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    FitOs
                  </h1>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Fitness Tracker
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-primary" />
                Welcome Back
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Personal Fitness &amp; Nutrition Tracker
              </p>
            </div>

            <div className="mx-auto w-full min-w-0 max-w-sm flex-shrink-0">
              {children}
            </div>
          </div>

          <div className="mx-auto hidden w-full min-w-0 max-w-md lg:block">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
