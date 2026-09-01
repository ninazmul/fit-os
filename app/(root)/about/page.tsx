"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  Brain,
  UtensilsCrossed,
  Scale,
  ExternalLink,
  Flame,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import {
  APP_NAME,
  APP_VERSION,
  APP_TAGLINE,
  APP_AUTHOR,
  APP_AUTHOR_URL,
  APP_LOGO,
  APP_LOGO_ALT,
} from "@/lib/constants";

const AdUnit = dynamic(() => import("@/components/shared/AdUnit"), {
  ssr: false,
});

const BKASH_NUMBER = "+8801580845746";

const pillars = [
  {
    icon: Brain,
    title: "Google Gemini AI Intelligence",
    desc: "Personalized Health Score (0–100), natural language recipe estimation, and real-time interactive AI coaching based on your unique metabolic data.",
    color: "from-purple-500/20 to-primary/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: UtensilsCrossed,
    title: "100+ Bangladeshi & Global Foods",
    desc: "Built specifically for Bengali culture and home cooking. Track calories and macros for Polao, Biriyani, Dal, Bhuna, Fish, and street food with dual gram/multiplier scales.",
    color: "from-amber-500/20 to-primary/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: Scale,
    title: "Clinical Biometric Precision",
    desc: "Clinically validated Mifflin-St Jeor BMR/TDEE calculations, US Navy Body Fat % estimation, and 9-point circumference body recomposition analysis.",
    color: "from-emerald-500/20 to-primary/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: ShieldCheck,
    title: "100% Free & Privacy-First",
    desc: "No locked paywalls, subscriptions, or credit card requirements. Your health metrics, logs, and biometrics remain private and secure.",
    color: "from-blue-500/20 to-primary/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
];

export default function AboutPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyBkash = () => {
    navigator.clipboard.writeText(BKASH_NUMBER);
    setCopied(true);
    toast.success("bKash number copied to clipboard! ❤️");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-8">
      {/* Hero Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-emerald-500/5 relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-white shadow-md">
              <Image
                src={APP_LOGO}
                alt={APP_LOGO_ALT}
                fill
                className="object-contain p-1 bg-white"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
                  {APP_NAME}
                </h1>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-black text-primary">
                  {APP_VERSION}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
                {APP_TAGLINE}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for Bangladesh & Beyond</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-2">
          {APP_NAME} is an all-in-one AI-powered health, fitness, and nutrition intelligence platform. 
          We believe that world-class nutrition tracking, clinical body analytics, and smart AI health coaching should be accessible to everyone — completely free and without costly subscription paywalls.
        </p>
      </div>

      {/* 💖 Donation & Support Section (bKash) */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border-2 border-pink-500/30 bg-gradient-to-br from-pink-500/10 via-card to-primary/10 space-y-6 shadow-lg shadow-pink-500/5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-pink-500/15 text-pink-600 dark:text-pink-400 shrink-0">
            <Heart className="w-7 h-7 fill-current animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-pink-600 dark:text-pink-400">
                Support The Developer & Platform
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              Help Keep {APP_NAME} Free & Growing! ☕
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {APP_NAME} is an independent passion project. We cover server hosting, database clusters, domain renewals, and Google Gemini AI API costs out of pocket so you can use every feature for free.
            </p>
          </div>
        </div>

        {/* bKash Payment Box */}
        <div className="p-5 sm:p-6 rounded-2xl bg-background/80 border border-pink-500/20 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                bKash Personal (Send Money)
              </span>
              <p className="text-xl sm:text-2xl font-black text-foreground font-mono tracking-tight">
                {BKASH_NUMBER}
              </p>
            </div>

            <Button
              type="button"
              onClick={handleCopyBkash}
              className={`rounded-2xl px-5 py-5 text-xs font-bold gap-2 shadow-sm transition-all ${
                copied
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-pink-600 hover:bg-pink-700 text-white"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy bKash Number
                </>
              )}
            </Button>
          </div>

          <div className="pt-3 border-t border-border/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-pink-600 font-bold text-[10px]">
                1
              </span>
              <p className="text-[11px] leading-tight">
                Open bKash App & select <strong>Send Money</strong>
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-pink-600 font-bold text-[10px]">
                2
              </span>
              <p className="text-[11px] leading-tight">
                Enter <strong>{BKASH_NUMBER}</strong> & any amount you wish to contribute
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-pink-600 font-bold text-[10px]">
                3
              </span>
              <p className="text-[11px] leading-tight">
                Add Reference: <strong className="text-foreground">{APP_NAME}</strong>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground font-medium">
          Every small donation fuels more features, faster AI servers, and database expansion. Thank you for your kindness! 🙏
        </p>
      </div>

      {/* Core Platform Pillars */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          What Powers {APP_NAME}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-5 rounded-3xl border border-border/50 bg-card/60 space-y-2.5 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${pillar.color}`}
                >
                  <Icon className={`h-5 w-5 ${pillar.iconColor}`} />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {pillar.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* About The Creator Card */}
      <div className="glass-card p-6 rounded-3xl border border-border/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
              Creator & Engineering
            </span>
            <h3 className="text-base font-bold text-foreground">
              Crafted by {APP_AUTHOR}
            </h3>
            <p className="text-xs text-muted-foreground">
              Dedicated to building clean, powerful, and accessible digital tools for Bangladesh and the global tech community.
            </p>
          </div>

          <a
            href={APP_AUTHOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-xs font-bold text-foreground border border-border/40 transition-colors shrink-0"
          >
            <span>Visit Studio</span>
            <ExternalLink className="w-3.5 h-3.5 text-primary" />
          </a>
        </div>
      </div>

      {/* Action Links Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Link href="/">
          <Button variant="outline" className="rounded-xl text-xs font-bold gap-1.5 border-border">
            &larr; Back to Dashboard
          </Button>
        </Link>

        <Link href="/fitness-calculator">
          <Button className="rounded-xl text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-white shadow-sm">
            Explore Free Calculators <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Footer Ad Slot */}
      <AdUnit size="auto" maxWidth="970px" />
    </div>
  );
}
