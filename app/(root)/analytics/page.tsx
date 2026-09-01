"use client";

import { useState, useEffect, useRef } from "react";
import { generateInsights } from "@/lib/actions/insights.actions";
import { getUserProfile } from "@/lib/actions/profile.actions";
import {
  generateDeepAIAnalytics,
  askAICoach,
  type AIAnalyticsData,
} from "@/lib/actions/ai-analytics.actions";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lightbulb,
  ArrowRight,
  Brain,
  MessageSquare,
  Send,
  RefreshCw,
  Trophy,
  TrendingUp,
  Utensils,
  Dumbbell,
  Moon,
  Zap,
  Heart,
  Target,
  BarChart2,
  ChevronRight,
  Star,
  ShieldCheck,
} from "lucide-react";
import type { AIInsight } from "@/types/fitness";
import Link from "next/link";

const AdUnit = dynamic(() => import("@/components/shared/AdUnit"), {
  ssr: false,
});

const CATEGORY_FILTERS = ["all", "nutrition", "training", "recovery", "longevity", "habits"] as const;
type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

const PROMPT_PILLS = [
  "Why is my weight plateauing?",
  "Best high-protein meals for my goal?",
  "How can I improve my sleep quality?",
  "Optimal workout split for my fitness level?",
  "How to break a fat loss plateau?",
  "What should I eat pre and post workout?",
];

const categoryIcons: Record<string, React.ElementType> = {
  nutrition: Utensils,
  training: Dumbbell,
  recovery: Moon,
  longevity: Heart,
  habits: Zap,
  all: Sparkles,
};

const insightTypeStyles: Record<string, string> = {
  critical: "border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-200",
  optimization: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200",
  achievement: "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200",
  milestone: "border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-200",
  // legacy
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200",
  info: "border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-200",
  tip: "border-purple-500/30 bg-purple-500/10 text-purple-900 dark:text-purple-200",
};

const insightTypeIcons: Record<string, React.ElementType> = {
  critical: AlertTriangle,
  optimization: Lightbulb,
  achievement: CheckCircle2,
  milestone: Trophy,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
  tip: Lightbulb,
};

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="38" fill="none" strokeWidth="8" className="stroke-muted/40" />
          <circle
            cx="50" cy="50" r="38" fill="none" strokeWidth="8"
            stroke={color} strokeDasharray={circumference}
            strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-black">{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground text-center">{label}</span>
    </div>
  );
}

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  pills?: string[];
}

export default function AnalyticsPage() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [aiData, setAiData] = useState<AIAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      content: "👋 Hi! I'm your FitOS AI Coach. Ask me anything about your nutrition, training, recovery, or goals — I'll give you personalised, data-backed answers.",
      pills: PROMPT_PILLS.slice(0, 3),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [aiResults, userProf, deepAI] = await Promise.all([
          generateInsights(),
          getUserProfile(),
          generateDeepAIAnalytics(),
        ]);
        setInsights(aiResults);
        setProfile(userProf);
        setAiData(deepAI);
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const refreshAI = async () => {
    try {
      setAiLoading(true);
      const [deepAI, legacyInsights] = await Promise.all([generateDeepAIAnalytics(), generateInsights()]);
      setAiData(deepAI);
      setInsights(legacyInsights);
      toast.success("AI analysis refreshed!");
    } catch {
      toast.error("Failed to refresh AI analysis.");
    } finally {
      setAiLoading(false);
    }
  };

  const sendMessage = async (q?: string) => {
    const query = q || chatInput.trim();
    if (!query) return;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: query }]);
    setChatLoading(true);
    try {
      const { answer, suggestedPills } = await askAICoach(query);
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", content: answer, pills: suggestedPills },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", content: "Sorry, I couldn't process that right now. Please try again!" },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const filteredInsights = [
    ...(aiData?.categorizedInsights || []).filter(
      (i) => activeFilter === "all" || i.category === activeFilter
    ),
    ...insights.filter(
      () => activeFilter === "all"
    ),
  ];

  const scoreGradeColor = (s: number) =>
    s >= 85 ? "hsl(142, 76%, 45%)" : s >= 70 ? "hsl(48, 96%, 53%)" : "hsl(0, 84%, 60%)";

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI Health Intelligence
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Personalised health analysis powered by Gemini AI · Updated from your real activity data
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setChatOpen((v) => !v)}
            size="sm"
            variant="outline"
            className="rounded-xl gap-1.5 text-xs font-bold border-primary/40 text-primary hover:bg-primary/10"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Ask AI Coach
          </Button>
          <Button
            onClick={refreshAI}
            size="sm"
            disabled={aiLoading}
            className="rounded-xl gap-1.5 text-xs font-bold bg-primary hover:bg-primary/90"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? "animate-spin" : ""}`} />
            {aiLoading ? "Analysing…" : "Refresh"}
          </Button>
        </div>
      </div>

      <AdUnit size="auto" label="Sponsored" maxWidth="970px" />

      {/* Health Score Banner */}
      {loading ? (
        <div className="glass-card rounded-3xl border border-border/50 p-6 animate-pulse h-48" />
      ) : aiData ? (
        <div className="glass-card rounded-3xl border border-primary/20 overflow-hidden">
          <div className="bg-gradient-to-br from-primary/15 via-transparent to-purple-500/10 p-6">
            <div className="flex flex-wrap items-center gap-6">
              {/* Big Score Ring */}
              <div className="relative">
                <div className="w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" strokeWidth="10" className="stroke-muted/30" />
                    <circle
                      cx="50" cy="50" r="40" fill="none" strokeWidth="10"
                      stroke={scoreGradeColor(aiData.healthScore)}
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={(2 * Math.PI * 40) * (1 - aiData.healthScore / 100)}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black leading-none">{aiData.healthScore}</span>
                    <span className="text-[9px] text-muted-foreground font-semibold tracking-wide">SCORE</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-black">{aiData.healthGrade}</span>
                  {aiData.isAIGenerated && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Gemini AI
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {aiData.executiveSummary}
                </p>
              </div>

              {/* Component scores */}
              <div className="flex gap-4 flex-wrap">
                <ScoreRing score={aiData.scoreBreakdown.nutrition} label="Nutrition" color="#10b981" />
                <ScoreRing score={aiData.scoreBreakdown.workouts} label="Workouts" color="#6366f1" />
                <ScoreRing score={aiData.scoreBreakdown.recovery} label="Recovery" color="#8b5cf6" />
                <ScoreRing score={aiData.scoreBreakdown.hydration} label="Hydration" color="#3b82f6" />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Ask AI Coach Chat Panel */}
      {chatOpen && (
        <div className="glass-card rounded-3xl border border-primary/20 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 px-5 py-3 border-b border-border/40 flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm">FitOS AI Coach</span>
            <span className="text-[10px] text-muted-foreground ml-auto">Context-aware · Personalised</span>
          </div>

          <div className="h-72 overflow-y-auto p-4 space-y-3 scroll-smooth">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted/60 border border-border/40 rounded-bl-sm"
                }`}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                  {msg.pills && msg.pills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {msg.pills.map((pill, pi) => (
                        <button
                          key={pi}
                          onClick={() => sendMessage(pill)}
                          className="px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[10px] font-semibold border border-primary/30 hover:bg-primary/25 transition-colors"
                        >
                          {pill}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-muted/60 border border-border/40 rounded-2xl rounded-bl-sm px-4 py-2.5 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="px-4 py-3 border-t border-border/40 space-y-2">
            {/* Quick Pills */}
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_PILLS.slice(0, 3).map((pill, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(pill)}
                  className="px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground text-[10px] font-medium border border-border/40 hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {pill}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 text-xs bg-muted/40 border border-border/40 rounded-xl px-3 py-2 outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground"
                placeholder="Ask your AI Coach anything…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={chatLoading}
              />
              <Button
                size="sm"
                onClick={() => sendMessage()}
                disabled={chatLoading || !chatInput.trim()}
                className="rounded-xl bg-primary hover:bg-primary/90 px-3"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Strengths & Growth Areas */}
      {aiData && (aiData.keyStrengths.length > 0 || aiData.growthAreas.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-5 rounded-3xl border border-emerald-500/20 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Key Strengths
            </h3>
            <ul className="space-y-2">
              {aiData.keyStrengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs leading-relaxed">
                  <Star className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-5 rounded-3xl border border-amber-500/20 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <TrendingUp className="w-4 h-4" /> Growth Areas
            </h3>
            <ul className="space-y-2">
              {aiData.growthAreas.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-xs leading-relaxed">
                  <ChevronRight className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 7-Day Action Plan */}
      {aiData && aiData.actionPlan.length > 0 && (
        <div className="glass-card p-5 rounded-3xl border border-border/50 space-y-4">
          <h2 className="font-bold text-base flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Your 7-Day AI Gameplan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiData.actionPlan.map((step) => (
              <div key={step.step} className="p-4 rounded-2xl bg-muted/40 border border-border/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-muted-foreground">STEP {step.step}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    step.impact === "High" ? "bg-primary/15 text-primary" :
                    step.impact === "Quick Win" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                    "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  }`}>
                    {step.impact}
                  </span>
                </div>
                <p className="text-xs font-bold">{step.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insight Filter Tabs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            Health Insights
          </h2>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {CATEGORY_FILTERS.map((filter) => {
            const Icon = categoryIcons[filter] || Sparkles;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 text-muted-foreground border-border/40 hover:border-primary/40 hover:text-primary"
                }`}
              >
                <Icon className="w-3 h-3" />
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            );
          })}
        </div>

        {filteredInsights.length === 0 && !loading && (
          <div className="glass-card p-8 text-center rounded-3xl border border-border/50 text-xs text-muted-foreground">
            No insights in this category yet. Keep logging daily meals, workouts, and weight to generate personalised AI advice!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AI Categorized Insights */}
          {(aiData?.categorizedInsights || [])
            .filter((i) => activeFilter === "all" || i.category === activeFilter)
            .map((item) => {
              const Icon = insightTypeIcons[item.type] || Info;
              const style = insightTypeStyles[item.type];
              return (
                <div key={item.id} className={`p-5 rounded-3xl border ${style} space-y-2 relative overflow-hidden`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-background/60 backdrop-blur-sm flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-sm">{item.title}</h3>
                        {item.metric && (
                          <span className="text-[10px] font-black bg-background/60 px-2 py-0.5 rounded-full flex-shrink-0">
                            {item.metric}
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-1 leading-relaxed opacity-90">{item.description}</p>
                      {item.recommendation && (
                        <p className="text-[11px] mt-1.5 opacity-75 italic leading-relaxed">
                          💡 {item.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Legacy Rule-Based Insights (shown only in "all" tab) */}
          {activeFilter === "all" &&
            insights.map((item) => {
              const Icon = insightTypeIcons[item.type] || Info;
              const style = insightTypeStyles[item.type];
              return (
                <div key={item.id} className={`p-5 rounded-3xl border ${style} space-y-2 relative overflow-hidden`}>
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

      {/* Correlation Observations */}
      {aiData && aiData.correlations.length > 0 && (
        <div className="glass-card p-5 rounded-3xl border border-border/50 space-y-4">
          <h2 className="font-bold text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            AI-Detected Correlations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiData.correlations.map((cor, i) => (
              <div key={i} className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-purple-700 dark:text-purple-300">{cor.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cor.confidence === "High"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  }`}>
                    {cor.confidence} Confidence
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{cor.observation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Targets Overview */}
      <div className="glass-card p-6 rounded-3xl border border-border/50 space-y-4">
        <h2 className="text-base font-bold">Active Daily Targets</h2>
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

      <AdUnit size="auto" maxWidth="970px" />
    </div>
  );
}
