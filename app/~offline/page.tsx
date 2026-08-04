import Image from "next/image";
import Link from "next/link";
import { WifiOff, RefreshCw, Dumbbell } from "lucide-react";

export const dynamic = "force-static";

export const metadata = {
  title: "Offline – FitOS",
  robots: { index: false, follow: false },
};

export default function Offline() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="orb-emerald-soft absolute top-10 right-0 h-64 w-64 rounded-full blur-3xl" />
        <div className="orb-blue-soft absolute bottom-10 left-0 h-64 w-64 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-2xl shadow-[0_30px_80px_-28px_rgba(0,0,0,0.45)] p-8 text-center space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md border border-border/60">
              <Image
                src="/assets/images/logo.png"
                alt="FitOs Logo"
                fill
                className="object-contain p-0.5 bg-white"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <h1 className="text-2xl font-bold tracking-tight">FitOS</h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Fitness Tracker
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <WifiOff className="h-7 w-7 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold">You&apos;re Offline</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Looks like your internet connection dropped. FitOS will resume tracking as soon as you&apos;re back online.
            </p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10 p-4 text-left space-y-3">
            {[
              "Close and re-open the FitOS app",
              "Turn off Airplane Mode or reconnect to Wi‑Fi",
              "Swipe down and tap the refresh button below",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-bold mt-0.5">
                  {i + 1}
                </div>
                <p className="text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 py-2.5 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Reconnecting
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-border bg-background/60 hover:bg-accent text-foreground text-sm font-semibold px-4 py-2.5 transition-colors"
            >
              <Dumbbell className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
