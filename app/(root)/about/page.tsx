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
import { useI18n } from "@/components/shared/I18nProvider";
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
    titleKey: "about.pillar.gemini.title",
    descKey: "about.pillar.gemini.desc",
    color: "from-purple-500/20 to-primary/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: UtensilsCrossed,
    titleKey: "about.pillar.foods.title",
    descKey: "about.pillar.foods.desc",
    color: "from-amber-500/20 to-primary/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: Scale,
    titleKey: "about.pillar.biometric.title",
    descKey: "about.pillar.biometric.desc",
    color: "from-emerald-500/20 to-primary/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: ShieldCheck,
    titleKey: "about.pillar.free.title",
    descKey: "about.pillar.free.desc",
    color: "from-blue-500/20 to-primary/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
];

export default function AboutPage() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopyBkash = () => {
    navigator.clipboard.writeText(BKASH_NUMBER);
    setCopied(true);
    toast.success(t("about.toast.copied"));
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
            <span>{t("about.hero.badge")}</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-2">
          {t("about.hero.desc", { appName: APP_NAME })}
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
                {t("about.donate.kicker")}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              {t("about.donate.title", { appName: APP_NAME })}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t("about.donate.desc", { appName: APP_NAME })}
            </p>
          </div>
        </div>

        {/* bKash Payment Box */}
        <div className="p-5 sm:p-6 rounded-2xl bg-background/80 border border-pink-500/20 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                {t("about.donate.bkashLabel")}
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
                  <Check className="w-4 h-4" /> {t("about.donate.copied")}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> {t("about.donate.copy")}
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
                {t("about.donate.step1")}{" "}
                <strong>{t("about.donate.step1Bold")}</strong>
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-pink-600 font-bold text-[10px]">
                2
              </span>
              <p className="text-[11px] leading-tight">
                {t("about.donate.step2Pre")} <strong>{BKASH_NUMBER}</strong>{" "}
                {t("about.donate.step2Post")}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-pink-600 font-bold text-[10px]">
                3
              </span>
              <p className="text-[11px] leading-tight">
                {t("about.donate.step3Pre")}{" "}
                <strong className="text-foreground">{APP_NAME}</strong>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground font-medium">
          {t("about.donate.footer")}
        </p>
      </div>

      {/* Core Platform Pillars */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          {t("about.pillars.title", { appName: APP_NAME })}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.titleKey}
                className="p-5 rounded-3xl border border-border/50 bg-card/60 space-y-2.5 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${pillar.color}`}
                >
                  <Icon className={`h-5 w-5 ${pillar.iconColor}`} />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {t(pillar.titleKey)}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(pillar.descKey)}
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
              {t("about.creator.kicker")}
            </span>
            <h3 className="text-base font-bold text-foreground">
              {t("about.creator.title", { author: APP_AUTHOR })}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("about.creator.desc")}
            </p>
          </div>

          <a
            href={APP_AUTHOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-xs font-bold text-foreground border border-border/40 transition-colors shrink-0"
          >
            <span>{t("about.creator.visit")}</span>
            <ExternalLink className="w-3.5 h-3.5 text-primary" />
          </a>
        </div>
      </div>

      {/* Action Links Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Link href="/">
          <Button
            variant="outline"
            className="rounded-xl text-xs font-bold gap-1.5 border-border"
          >
            {t("about.back")}
          </Button>
        </Link>

        <Link href="/fitness-calculator">
          <Button className="rounded-xl text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-white shadow-sm">
            {t("about.explore")} <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Footer Ad Slot */}
      <AdUnit size="auto" maxWidth="970px" />
    </div>
  );
}
