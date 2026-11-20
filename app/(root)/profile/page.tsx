"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useI18n } from "@/components/shared/I18nProvider";
import { getFullProfileHealthMetrics } from "@/lib/actions/profile.actions";
import { getBodyMeasurements } from "@/lib/actions/body-measurement.actions";
import {
  generateAIProfileAssessment,
  type AIProfileAssessmentData,
} from "@/lib/actions/ai-profile.actions";
import {
  getGoalCelebrationStats,
  getGoalHistory,
  type GoalCelebrationStats,
} from "@/lib/actions/goal-history.actions";
import { useDataUpdateListener } from "@/lib/events";

import OnboardingModal from "@/components/shared/OnboardingModal";
import BodyMeasurementModal from "@/components/shared/BodyMeasurementModal";
import GoalTargetsEditorModal from "@/components/profile/GoalTargetsEditorModal";
import GoalCelebrationModal from "@/components/profile/GoalCelebrationModal";
import ProfileBentoHero from "@/components/profile/ProfileBentoHero";
import VitalsTargetsTab from "@/components/profile/VitalsTargetsTab";
import BodyMeasurementsTab from "@/components/profile/BodyMeasurementsTab";
import AICoachMilestonesTab from "@/components/profile/AICoachMilestonesTab";
import ProgressSection from "@/components/profile/ProgressSection";
import AnalyticsSection from "@/components/profile/AnalyticsSection";

import {
  Activity,
  Ruler,
  Brain,
  TrendingUp,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import type { IGoalHistory } from "@/types/fitness";

const AdUnit = dynamic(() => import("@/components/shared/AdUnit"), {
  ssr: false,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HealthData = any;

type ProfileTab = "vitals" | "measurements" | "ai-coach" | "progress" | "analytics";

export default function ProfilePage() {
  const { locale } = useI18n();
  const { user: clerkUser } = useUser();
  const avatarUrl = clerkUser?.imageUrl;
  const [data, setData] = useState<HealthData>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("vitals");

  // Modals state
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [measurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [celebrationModalOpen, setCelebrationModalOpen] = useState(false);
  const [celebrationStats, setCelebrationStats] =
    useState<GoalCelebrationStats | null>(null);
  const [milestoneHistory, setMilestoneHistory] = useState<IGoalHistory[]>([]);
  const [aiAssessment, setAiAssessment] =
    useState<AIProfileAssessmentData | null>(null);
  const [aiAssessmentLoading, setAiAssessmentLoading] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [profileData, , aiData, goalStats, goalMilestones] =
        await Promise.all([
          getFullProfileHealthMetrics(),
          getBodyMeasurements(20),
          generateAIProfileAssessment(),
          getGoalCelebrationStats(),
          getGoalHistory(),
        ]);
      setData(profileData);
      setAiAssessment(aiData);
      setCelebrationStats(goalStats);
      setMilestoneHistory(goalMilestones);
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshAIAssessment = async () => {
    try {
      setAiAssessmentLoading(true);
      const aiData = await generateAIProfileAssessment();
      setAiAssessment(aiData);
    } catch {
      // silent fail
    } finally {
      setAiAssessmentLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useDataUpdateListener((category) => {
    if (
      category === "profile" ||
      category === "all" ||
      category === "measurement" ||
      category === "weight" ||
      category === "workout" ||
      category === "sleep"
    ) {
      fetchAll();
    }
  });

  const profile = data?.profile;
  const latest = data?.latestMeasurements;
  const isBn = locale === "bn";

  const tabsList = [
    {
      id: "vitals" as ProfileTab,
      label: isBn ? "স্বাস্থ্য ও টার্গেট" : "Vitals & Targets",
      icon: Activity,
    },
    {
      id: "measurements" as ProfileTab,
      label: isBn ? "শরীরের মাপ" : "Body Measurements",
      icon: Ruler,
      count: latest
        ? Object.keys(latest).filter(
            (k) => k !== "_id" && k !== "clerkId" && k !== "date",
          ).length
        : undefined,
    },
    {
      id: "ai-coach" as ProfileTab,
      label: isBn ? "এআই কোচ ও মাইলস্টোন" : "AI Coach & Milestones",
      icon: Brain,
      hasGemini: true,
      count: milestoneHistory.length > 0 ? milestoneHistory.length : undefined,
    },
    {
      id: "progress" as ProfileTab,
      label: isBn ? "প্রগতি ও ঘুম" : "Progress & Sleep",
      icon: TrendingUp,
    },
    {
      id: "analytics" as ProfileTab,
      label: isBn ? "বিশ্লেষণ" : "Analytics",
      icon: BarChart3,
      hasGemini: true,
    },
  ];

  if (loading && !data) {
    return (
      <div className="space-y-5 animate-pulse max-w-7xl mx-auto pb-12">
        <div className="h-8 w-48 bg-muted/60 rounded-xl" />
        <div className="h-44 rounded-3xl bg-muted/40 border border-border/40" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="h-28 rounded-2xl bg-muted/40" />
          <div className="h-28 rounded-2xl bg-muted/40" />
          <div className="h-28 rounded-2xl bg-muted/40" />
          <div className="h-28 rounded-2xl bg-muted/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-12">
      {/* Modals */}
      <OnboardingModal
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        initialData={profile}
      />
      <GoalTargetsEditorModal
        open={goalModalOpen}
        onOpenChange={setGoalModalOpen}
        profile={profile}
        recommendedMacros={data?.recommendedMacros}
        onSaved={fetchAll}
      />
      <BodyMeasurementModal
        open={measurementModalOpen}
        onOpenChange={(open) => {
          setMeasurementModalOpen(open);
          if (!open) fetchAll();
        }}
        initialData={latest}
        onSuccess={fetchAll}
      />
      {celebrationStats && (
        <GoalCelebrationModal
          open={celebrationModalOpen}
          onOpenChange={setCelebrationModalOpen}
          stats={celebrationStats}
          onCompleted={fetchAll}
        />
      )}

      {/* 1. Bento Profile Hero: Identity, Quick Actions, Weight Journey */}
      <ProfileBentoHero
        data={data}
        avatarUrl={avatarUrl}
        celebrationStats={celebrationStats}
        onOpenOnboarding={() => setOnboardingOpen(true)}
        onOpenGoalModal={() => setGoalModalOpen(true)}
        onOpenMeasurementModal={() => setMeasurementModalOpen(true)}
        onOpenCelebrationModal={() => setCelebrationModalOpen(true)}
      />

      {/* 2. Responsive Sticky Segmented Tabs Navigation */}
      <div className="sticky top-14 sm:top-16 z-30 -mx-1 px-1 py-1.5 bg-background/80 backdrop-blur-md">
        <nav
          role="tablist"
          aria-label="Profile Sections"
          className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-muted/50 border border-border/40 overflow-x-auto no-scrollbar shadow-2xs"
        >
          {tabsList.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70",
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-black leading-none",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.hasGemini && (
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.2 rounded-full font-black leading-none flex items-center gap-0.5",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-purple-500/15 text-purple-600 dark:text-purple-400",
                    )}
                  >
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. High-Signal Tab Content Views */}
      {activeTab === "vitals" && (
        <VitalsTargetsTab
          data={data}
          onOpenGoalModal={() => setGoalModalOpen(true)}
          onOpenOnboarding={() => setOnboardingOpen(true)}
        />
      )}

      {activeTab === "measurements" && (
        <BodyMeasurementsTab
          data={data}
          onOpenMeasurementModal={() => setMeasurementModalOpen(true)}
        />
      )}

      {activeTab === "ai-coach" && (
        <AICoachMilestonesTab
          data={data}
          aiAssessment={aiAssessment}
          aiAssessmentLoading={aiAssessmentLoading}
          onRefreshAIAssessment={refreshAIAssessment}
          milestoneHistory={milestoneHistory}
        />
      )}

      {activeTab === "progress" && <ProgressSection />}

      {activeTab === "analytics" && <AnalyticsSection />}

      {/* Footer Ad */}
      <div className="pt-2">
        <AdUnit size="auto" maxWidth="970px" />
      </div>
    </div>
  );
}
