"use client";

import { useState, useEffect } from "react";
import { generateInsights } from "@/lib/actions/insights.actions";
import { getUserProfile } from "@/lib/actions/profile.actions";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const AdUnit = dynamic(() => import("@/components/shared/AdUnit"), {
  ssr: false,
});
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import type { AIInsight } from "@/types/fitness";
import Link from "next/link";

export default function AnalyticsPage() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [aiResults, userProf] = await Promise.all([
          generateInsights(),
          getUserProfile(),
        ]);
        setInsights(aiResults);
        setProfile(userProf);
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const insightIcons = {
    warning: AlertTriangle,
    success: CheckCircle2,
    info: Info,
    tip: Lightbulb,
  };

  const insightStyles = {
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200",
    info: "border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-200",
    tip: "border-purple-500/30 bg-purple-500/10 text-purple-900 dark:text-purple-200",
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI Fitness & Nutrition Insights 🤖
        </h1>
        <p className="text-xs text-muted-foreground">Personalized health intelligence evaluated from your recent activity logs</p>
      </div>

      {/* Mid-page Ad */}
      <AdUnit size="auto" label="Sponsored" maxWidth="970px" />

      {/* AI Recommendations List */}
      <div className="space-y-3">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Automated Smart Health Advice
        </h2>

        {insights.length === 0 && !loading && (
          <div className="glass-card p-8 text-center rounded-3xl border border-border/50 text-xs text-muted-foreground">
            No specific insights detected yet. Keep logging your daily meals, workouts, and weight to generate custom AI advice!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((item) => {
            const Icon = insightIcons[item.type] || Info;
            const style = insightStyles[item.type];

            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl border ${style} space-y-2 relative overflow-hidden`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-background/60 backdrop-blur-sm flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{item.title}</h3>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">{item.description}</p>
                    {item.actionableText && (
                      <Link href="/diet">
                        <Button size="sm" variant="ghost" className="mt-3 text-xs font-bold gap-1 px-0 hover:bg-transparent">
                          {item.actionableText} <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Targets Overview */}
      <div className="glass-card p-6 rounded-3xl border border-border/50 space-y-4">
        <h2 className="text-base font-bold">Active Daily Targets Baseline</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30">
            <p className="text-muted-foreground">Calorie Goal</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{profile?.dailyCaloriesGoal || 2000} kcal</p>
          </div>
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30">
            <p className="text-muted-foreground">Protein Goal</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{profile?.dailyProteinGoal || 150} g</p>
          </div>
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30">
            <p className="text-muted-foreground">Water Goal</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{profile?.waterGoalMl || 3000} ml</p>
          </div>
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30">
            <p className="text-muted-foreground">Workout Frequency</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{profile?.workoutDaysPerWeek || 4} days/wk</p>
          </div>
        </div>
      </div>

      {/* Footer Ad Slot */}
      <AdUnit size="auto" maxWidth="970px" />
    </div>
  );
}
