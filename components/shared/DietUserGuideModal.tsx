"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/shared/I18nProvider";
import { cn } from "@/lib/utils";
import {
  Activity,
  Apple,
  Bookmark,
  BookOpen,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Copy,
  Check,
  Droplet,
  Dumbbell,
  Flame,
  HelpCircle,
  Info,
  Languages,
  LayoutDashboard,
  LayoutGrid,
  ListOrdered,
  Moon,
  PlusCircle,
  Ruler,
  Scale,
  ScanBarcode,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from "lucide-react";

interface DietUserGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSamplePrompt?: (prompt: string) => void;
}

type GuideTabId =
  | "overview"
  | "dashboard"
  | "diet"
  | "ai"
  | "community"
  | "training"
  | "progress"
  | "settings";

type GuideTone = "primary" | "emerald" | "blue" | "amber" | "purple" | "sky";

const TONE_STYLES: Record<GuideTone, { box: string; title: string }> = {
  primary: { box: "bg-primary/10 border-primary/20", title: "text-primary" },
  emerald: {
    box: "bg-emerald-500/10 border-emerald-500/20",
    title: "text-emerald-600 dark:text-emerald-400",
  },
  blue: {
    box: "bg-blue-500/10 border-blue-500/20",
    title: "text-blue-600 dark:text-blue-400",
  },
  amber: {
    box: "bg-amber-500/10 border-amber-500/20",
    title: "text-amber-600 dark:text-amber-400",
  },
  purple: {
    box: "bg-purple-500/10 border-purple-500/20",
    title: "text-purple-600 dark:text-purple-400",
  },
  sky: {
    box: "bg-sky-500/10 border-sky-500/20",
    title: "text-sky-600 dark:text-sky-400",
  },
};

interface GuideItem {
  icon: LucideIcon;
  titleKey: string;
  bodyKey: string;
}

interface GuideStep {
  titleKey: string;
  bodyKey: string;
}

interface GuideBadge {
  labelKey: string;
  pillClass: string;
  titleKey: string;
  bodyKey: string;
}

interface GuideTab {
  id: GuideTabId;
  icon: LucideIcon;
  tone: GuideTone;
  labelKey: string;
  shortKey: string;
  introTitleKey: string;
  introBodyKey: string;
  stepsHeadingKey?: string;
  steps?: GuideStep[];
  itemsHeadingKey?: string;
  items?: GuideItem[];
  badgesHeadingKey?: string;
  badges?: GuideBadge[];
  note?: { icon: LucideIcon; titleKey: string; bodyKey: string };
  showSamples?: boolean;
}

/** Sample dish descriptions that can be pushed straight into the AI estimator. */
const SAMPLE_PROMPTS = [
  {
    titleKey: "guide.sample.1.title",
    prompt:
      "500g chicken curry cooked with 2 tbsp mustard oil, onions, garlic and spices. Eaten portion 150g with 250g rice",
  },
  {
    titleKey: "guide.sample.2.title",
    prompt:
      "Beef kala bhuna braised with fried onions, dark roasted spices and ghee. Ate 120g",
  },
  {
    titleKey: "guide.sample.3.title",
    prompt:
      "2 eggs fried in 1 tsp oil with 1 handmade atta paratha",
  },
  {
    titleKey: "guide.sample.4.title",
    prompt:
      "200g cooked basmati rice with 150g grilled chicken breast and 50g steamed broccoli",
  },
];

const GUIDE_TABS: GuideTab[] = [
  {
    id: "overview",
    icon: UtensilsCrossed,
    tone: "primary",
    labelKey: "guide.tab.overview",
    shortKey: "guide.tab.overview.short",
    introTitleKey: "guide.overview.introTitle",
    introBodyKey: "guide.overview.introBody",
    itemsHeadingKey: "guide.overview.cardsHeading",
    items: [
      {
        icon: Target,
        titleKey: "guide.overview.c1.title",
        bodyKey: "guide.overview.c1.body",
      },
      {
        icon: Zap,
        titleKey: "guide.overview.c2.title",
        bodyKey: "guide.overview.c2.body",
      },
      {
        icon: UtensilsCrossed,
        titleKey: "guide.overview.c3.title",
        bodyKey: "guide.overview.c3.body",
      },
      {
        icon: Languages,
        titleKey: "guide.overview.c4.title",
        bodyKey: "guide.overview.c4.body",
      },
    ],
    stepsHeadingKey: "guide.overview.stepsHeading",
    steps: [
      {
        titleKey: "guide.overview.s1.title",
        bodyKey: "guide.overview.s1.body",
      },
      {
        titleKey: "guide.overview.s2.title",
        bodyKey: "guide.overview.s2.body",
      },
      {
        titleKey: "guide.overview.s3.title",
        bodyKey: "guide.overview.s3.body",
      },
      {
        titleKey: "guide.overview.s4.title",
        bodyKey: "guide.overview.s4.body",
      },
    ],
  },
  {
    id: "dashboard",
    icon: LayoutDashboard,
    tone: "emerald",
    labelKey: "guide.tab.dashboard",
    shortKey: "guide.tab.dashboard.short",
    introTitleKey: "guide.dashboard.introTitle",
    introBodyKey: "guide.dashboard.introBody",
    itemsHeadingKey: "guide.dashboard.itemsHeading",
    items: [
      {
        icon: Calendar,
        titleKey: "guide.dashboard.i1.title",
        bodyKey: "guide.dashboard.i1.body",
      },
      {
        icon: Flame,
        titleKey: "guide.dashboard.i2.title",
        bodyKey: "guide.dashboard.i2.body",
      },
      {
        icon: Zap,
        titleKey: "guide.dashboard.i3.title",
        bodyKey: "guide.dashboard.i3.body",
      },
      {
        icon: Droplet,
        titleKey: "guide.dashboard.i4.title",
        bodyKey: "guide.dashboard.i4.body",
      },
      {
        icon: Moon,
        titleKey: "guide.dashboard.i5.title",
        bodyKey: "guide.dashboard.i5.body",
      },
      {
        icon: Scale,
        titleKey: "guide.dashboard.i6.title",
        bodyKey: "guide.dashboard.i6.body",
      },
      {
        icon: UtensilsCrossed,
        titleKey: "guide.dashboard.i7.title",
        bodyKey: "guide.dashboard.i7.body",
      },
      {
        icon: Activity,
        titleKey: "guide.dashboard.i8.title",
        bodyKey: "guide.dashboard.i8.body",
      },
    ],
  },
  {
    id: "diet",
    icon: Apple,
    tone: "emerald",
    labelKey: "guide.tab.diet",
    shortKey: "guide.tab.diet.short",
    introTitleKey: "guide.diet.introTitle",
    introBodyKey: "guide.diet.introBody",
    itemsHeadingKey: "guide.diet.itemsHeading",
    items: [
      {
        icon: Search,
        titleKey: "guide.diet.i1.title",
        bodyKey: "guide.diet.i1.body",
      },
      {
        icon: UtensilsCrossed,
        titleKey: "guide.diet.i2.title",
        bodyKey: "guide.diet.i2.body",
      },
      {
        icon: Scale,
        titleKey: "guide.diet.i3.title",
        bodyKey: "guide.diet.i3.body",
      },
      {
        icon: Users,
        titleKey: "guide.diet.i4.title",
        bodyKey: "guide.diet.i4.body",
      },
      {
        icon: PlusCircle,
        titleKey: "guide.diet.i5.title",
        bodyKey: "guide.diet.i5.body",
      },
      {
        icon: ScanBarcode,
        titleKey: "guide.diet.i6.title",
        bodyKey: "guide.diet.i6.body",
      },
      {
        icon: Bookmark,
        titleKey: "guide.diet.i7.title",
        bodyKey: "guide.diet.i7.body",
      },
    ],
  },
  {
    id: "ai",
    icon: Sparkles,
    tone: "primary",
    labelKey: "guide.tab.ai",
    shortKey: "guide.tab.ai.short",
    introTitleKey: "guide.ai.introTitle",
    introBodyKey: "guide.ai.introBody",
    stepsHeadingKey: "guide.ai.numberedHeading",
    steps: [
      { titleKey: "guide.ai.n1.title", bodyKey: "guide.ai.n1.body" },
      { titleKey: "guide.ai.n2.title", bodyKey: "guide.ai.n2.body" },
      { titleKey: "guide.ai.n3.title", bodyKey: "guide.ai.n3.body" },
      { titleKey: "guide.ai.n4.title", bodyKey: "guide.ai.n4.body" },
      { titleKey: "guide.ai.n5.title", bodyKey: "guide.ai.n5.body" },
    ],
    note: {
      icon: Info,
      titleKey: "guide.ai.noteTitle",
      bodyKey: "guide.ai.noteBody",
    },
    itemsHeadingKey: "guide.ai.itemsHeading",
    items: [
      {
        icon: Sparkles,
        titleKey: "guide.ai.i1.title",
        bodyKey: "guide.ai.i1.body",
      },
      {
        icon: BrainCircuit,
        titleKey: "guide.ai.i2.title",
        bodyKey: "guide.ai.i2.body",
      },
      {
        icon: ShieldCheck,
        titleKey: "guide.ai.i3.title",
        bodyKey: "guide.ai.i3.body",
      },
      {
        icon: CheckCircle2,
        titleKey: "guide.ai.i4.title",
        bodyKey: "guide.ai.i4.body",
      },
    ],
    showSamples: true,
  },
  {
    id: "community",
    icon: Users,
    tone: "blue",
    labelKey: "guide.tab.community",
    shortKey: "guide.tab.community.short",
    introTitleKey: "guide.community.introTitle",
    introBodyKey: "guide.community.introBody",
    badgesHeadingKey: "guide.community.badgesHeading",
    badges: [
      {
        labelKey: "diet.addModal.badgeMyCustom",
        pillClass:
          "bg-purple-500/15 text-purple-700 dark:text-purple-300",
        titleKey: "guide.community.b1.title",
        bodyKey: "guide.community.b1.body",
      },
      {
        labelKey: "diet.addModal.badgeCommunity",
        pillClass: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
        titleKey: "guide.community.b2.title",
        bodyKey: "guide.community.b2.body",
      },
      {
        labelKey: "diet.addModal.badgeBd",
        pillClass:
          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        titleKey: "guide.community.b3.title",
        bodyKey: "guide.community.b3.body",
      },
    ],
    note: {
      icon: ShieldCheck,
      titleKey: "guide.community.noteTitle",
      bodyKey: "guide.community.noteBody",
    },
    stepsHeadingKey: "guide.community.numberedHeading",
    steps: [
      {
        titleKey: "guide.community.n1.title",
        bodyKey: "guide.community.n1.body",
      },
      {
        titleKey: "guide.community.n2.title",
        bodyKey: "guide.community.n2.body",
      },
      {
        titleKey: "guide.community.n3.title",
        bodyKey: "guide.community.n3.body",
      },
    ],
  },
  {
    id: "training",
    icon: Dumbbell,
    tone: "amber",
    labelKey: "guide.tab.training",
    shortKey: "guide.tab.training.short",
    introTitleKey: "guide.training.introTitle",
    introBodyKey: "guide.training.introBody",
    itemsHeadingKey: "guide.training.itemsHeading",
    items: [
      {
        icon: Calendar,
        titleKey: "guide.training.i1.title",
        bodyKey: "guide.training.i1.body",
      },
      {
        icon: LayoutGrid,
        titleKey: "guide.training.i2.title",
        bodyKey: "guide.training.i2.body",
      },
      {
        icon: Dumbbell,
        titleKey: "guide.training.i3.title",
        bodyKey: "guide.training.i3.body",
      },
      {
        icon: PlusCircle,
        titleKey: "guide.training.i4.title",
        bodyKey: "guide.training.i4.body",
      },
      {
        icon: CheckCircle2,
        titleKey: "guide.training.i5.title",
        bodyKey: "guide.training.i5.body",
      },
      {
        icon: Trophy,
        titleKey: "guide.training.i6.title",
        bodyKey: "guide.training.i6.body",
      },
      {
        icon: Activity,
        titleKey: "guide.training.i7.title",
        bodyKey: "guide.training.i7.body",
      },
      {
        icon: BrainCircuit,
        titleKey: "guide.training.i8.title",
        bodyKey: "guide.training.i8.body",
      },
      {
        icon: ListOrdered,
        titleKey: "guide.training.i9.title",
        bodyKey: "guide.training.i9.body",
      },
    ],
  },
  {
    id: "progress",
    icon: TrendingUp,
    tone: "purple",
    labelKey: "guide.tab.progress",
    shortKey: "guide.tab.progress.short",
    introTitleKey: "guide.progress.introTitle",
    introBodyKey: "guide.progress.introBody",
    itemsHeadingKey: "guide.progress.itemsHeading",
    items: [
      {
        icon: TrendingUp,
        titleKey: "guide.progress.i1.title",
        bodyKey: "guide.progress.i1.body",
      },
      {
        icon: ListOrdered,
        titleKey: "guide.progress.i2.title",
        bodyKey: "guide.progress.i2.body",
      },
      {
        icon: Activity,
        titleKey: "guide.progress.i3.title",
        bodyKey: "guide.progress.i3.body",
      },
      {
        icon: Ruler,
        titleKey: "guide.progress.i4.title",
        bodyKey: "guide.progress.i4.body",
      },
      {
        icon: Moon,
        titleKey: "guide.progress.i5.title",
        bodyKey: "guide.progress.i5.body",
      },
      {
        icon: BrainCircuit,
        titleKey: "guide.progress.i6.title",
        bodyKey: "guide.progress.i6.body",
      },
      {
        icon: Trophy,
        titleKey: "guide.progress.i7.title",
        bodyKey: "guide.progress.i7.body",
      },
    ],
  },
  {
    id: "settings",
    icon: Settings2,
    tone: "sky",
    labelKey: "guide.tab.settings",
    shortKey: "guide.tab.settings.short",
    introTitleKey: "guide.settings.introTitle",
    introBodyKey: "guide.settings.introBody",
    itemsHeadingKey: "guide.settings.itemsHeading",
    items: [
      {
        icon: ClipboardList,
        titleKey: "guide.settings.i1.title",
        bodyKey: "guide.settings.i1.body",
      },
      {
        icon: Activity,
        titleKey: "guide.settings.i2.title",
        bodyKey: "guide.settings.i2.body",
      },
      {
        icon: Target,
        titleKey: "guide.settings.i3.title",
        bodyKey: "guide.settings.i3.body",
      },
      {
        icon: BrainCircuit,
        titleKey: "guide.settings.i4.title",
        bodyKey: "guide.settings.i4.body",
      },
      {
        icon: Ruler,
        titleKey: "guide.settings.i5.title",
        bodyKey: "guide.settings.i5.body",
      },
      {
        icon: Settings2,
        titleKey: "guide.settings.i6.title",
        bodyKey: "guide.settings.i6.body",
      },
      {
        icon: Languages,
        titleKey: "guide.settings.i7.title",
        bodyKey: "guide.settings.i7.body",
      },
      {
        icon: HelpCircle,
        titleKey: "guide.settings.i8.title",
        bodyKey: "guide.settings.i8.body",
      },
    ],
  },
];

export default function DietUserGuideModal({
  open,
  onOpenChange,
  onSelectSamplePrompt,
}: DietUserGuideModalProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<GuideTabId>("overview");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const active = GUIDE_TABS.find((tab) => tab.id === activeTab) ?? GUIDE_TABS[0];
  const tone = TONE_STYLES[active.tone];
  const ActiveIcon = active.icon;
  const NoteIcon = active.note?.icon;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:w-full sm:max-w-2xl rounded-3xl p-0 h-[88dvh] sm:h-auto max-h-[90dvh] sm:max-h-[85vh] flex flex-col gap-0 overflow-hidden border bg-background shadow-2xl box-border min-w-0">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-border/40 shrink-0 pr-10 sm:pr-12 text-left">
          <div className="flex items-center gap-1.5 text-primary font-bold text-[11px] sm:text-xs uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>{t("guide.badge")}</span>
          </div>
          <DialogTitle className="text-base sm:text-xl font-bold leading-snug">
            {t("guide.title")}
          </DialogTitle>
          <DialogDescription className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 sm:line-clamp-none mt-0.5">
            {t("guide.subtitle")}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation Pill Bar */}
        <div className="px-3 sm:px-5 py-2.5 bg-muted/20 border-b border-border/30 shrink-0">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs font-semibold [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {GUIDE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl whitespace-nowrap transition-all text-xs shrink-0 ${
                    isActive
                      ? "bg-primary text-white font-bold shadow-xs"
                      : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="sm:hidden">{t(tab.shortKey)}</span>
                  <span className="hidden sm:inline">{t(tab.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 space-y-4 overscroll-contain pb-6 text-xs text-muted-foreground no-scrollbar">
          {/* Intro callout */}
          <div
            className={cn(
              "p-3.5 rounded-2xl border text-foreground space-y-1.5",
              tone.box,
            )}
          >
            <h3
              className={cn(
                "font-bold text-sm flex items-center gap-1.5",
                tone.title,
              )}
            >
              <ActiveIcon className="w-4 h-4 shrink-0" />
              {t(active.introTitleKey)}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t(active.introBodyKey)}
            </p>
          </div>

          {/* Numbered steps / fields */}
          {active.steps && active.steps.length > 0 && (
            <div className="space-y-2.5">
              {active.stepsHeadingKey && (
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                  {t(active.stepsHeadingKey)}
                </h4>
              )}
              <div className="space-y-3">
                {active.steps.map((step, idx) => (
                  <div
                    key={step.titleKey}
                    className="p-3 rounded-2xl bg-card border border-border/50 space-y-1.5"
                  >
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span>{t(step.titleKey)}</span>
                    </div>
                    <p className="text-muted-foreground pl-7">
                      {t(step.bodyKey)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badge explanations */}
          {active.badges && active.badges.length > 0 && (
            <div className="space-y-2.5">
              {active.badgesHeadingKey && (
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                  {t(active.badgesHeadingKey)}
                </h4>
              )}
              <div className="space-y-2.5">
                {active.badges.map((badge) => (
                  <div
                    key={badge.labelKey}
                    className="p-3 rounded-2xl bg-card border border-border/50 flex items-start gap-3"
                  >
                    <span
                      className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0 mt-0.5",
                        badge.pillClass,
                      )}
                    >
                      {t(badge.labelKey)}
                    </span>
                    <div>
                      <strong className="text-foreground">
                        {t(badge.titleKey)}:
                      </strong>
                      <p className="text-muted-foreground mt-0.5">
                        {t(badge.bodyKey)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feature cards */}
          {active.items && active.items.length > 0 && (
            <div className="space-y-2.5">
              {active.itemsHeadingKey && (
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                  {t(active.itemsHeadingKey)}
                </h4>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {active.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.titleKey}
                      className="p-3 rounded-2xl bg-card border border-border/50 space-y-1.5"
                    >
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        <span
                          className={cn(
                            "p-1.5 rounded-lg shrink-0",
                            tone.box,
                            tone.title,
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        <span>{t(item.titleKey)}</span>
                      </div>
                      <p className="text-muted-foreground">
                        {t(item.bodyKey)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Callout note */}
          {active.note && NoteIcon && (
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 flex items-start gap-2.5">
              <NoteIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">
                  {t(active.note.titleKey)}:
                </strong>
                <p className="text-muted-foreground mt-0.5">
                  {t(active.note.bodyKey)}
                </p>
              </div>
            </div>
          )}

          {/* Sample AI descriptions */}
          {active.showSamples && (
            <div className="space-y-2 pt-1">
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center justify-between">
                <span>{t("guide.samplesHeading")}</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  {t("guide.samplesHint")}
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_PROMPTS.map((sp, idx) => (
                  <div
                    key={sp.titleKey}
                    className="p-3 rounded-2xl bg-muted/40 border border-border/50 flex flex-col justify-between gap-2.5 hover:border-primary/40 transition-all"
                  >
                    <div>
                      <p className="font-bold text-foreground text-xs">
                        {t(sp.titleKey)}
                      </p>
                      <p className="text-[11px] text-muted-foreground italic mt-1 leading-relaxed">
                        &ldquo;{sp.prompt}&rdquo;
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(sp.prompt, idx)}
                        className="h-7 text-[11px] px-2.5 rounded-lg gap-1 border-border/60 shrink-0"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                            {t("guide.copied")}
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 shrink-0" />
                            {t("guide.copy")}
                          </>
                        )}
                      </Button>
                      {onSelectSamplePrompt && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            onSelectSamplePrompt(sp.prompt);
                            onOpenChange(false);
                          }}
                          className="h-7 text-[11px] px-2.5 rounded-lg bg-primary text-white font-semibold flex-1 sm:flex-initial"
                        >
                          {t("guide.useInAi")}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-border/40 bg-muted/20 flex items-center justify-between gap-2 shrink-0">
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            {t("guide.footerHint")}
          </p>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs px-5 w-full sm:w-auto h-9 sm:h-10 shadow-xs"
          >
            {t("guide.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
