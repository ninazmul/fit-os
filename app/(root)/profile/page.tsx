"use client";

import { useState, useEffect } from "react";
import { getUserProfile } from "@/lib/actions/profile.actions";
import OnboardingModal from "@/components/shared/OnboardingModal";
import StatCard from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import {
  Settings2,
  Scale,
  Target,
  Flame,
  Droplet,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

export default function ProfilePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getUserProfile();
      setProfile(res);
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="space-y-6">
      <OnboardingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={profile}
      />

      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
            {profile?.name ? profile.name[0].toUpperCase() : "F"}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {profile?.name || "User Profile"}
            </h1>
            <p className="text-xs text-muted-foreground capitalize">
              {profile?.gender} &middot; {profile?.age} yrs &middot;{" "}
              {profile?.height} cm
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              Developed by{" "}
              <a
                href="https://www.artistycode.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                ArtistyCode Studio
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="rounded-xl gap-2 bg-primary hover:bg-primary/90 font-bold"
        >
          <Settings2 className="w-4 h-4" />
          Edit Profile & Goals
        </Button>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Current Weight"
          value={profile?.currentWeight || "--"}
          unit="kg"
          subtitle={`Target: ${profile?.targetWeight || "--"} kg`}
          icon={Scale}
          variant="purple"
        />

        <StatCard
          title="Daily Calorie Goal"
          value={profile?.dailyCaloriesGoal || 2000}
          unit="kcal"
          subtitle={`Goal: ${profile?.goal?.replace("_", " ")}`}
          icon={Flame}
          variant="orange"
        />

        <StatCard
          title="Daily Protein"
          value={profile?.dailyProteinGoal || 150}
          unit="g"
          subtitle="Target intake"
          icon={Target}
          variant="green"
        />

        <StatCard
          title="Daily Water"
          value={profile?.waterGoalMl || 3000}
          unit="ml"
          subtitle="Hydration target"
          icon={Droplet}
          variant="blue"
        />
      </div>

      {/* Detailed Macro & Goal Breakdown Card */}
      <div className="glass-card p-6 rounded-3xl border border-border/50 space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Configured Daily Nutrition Targets
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30">
            <p className="text-muted-foreground font-medium">Protein Target</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {profile?.dailyProteinGoal} g
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30">
            <p className="text-muted-foreground font-medium">Carbs Target</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
              {profile?.dailyCarbGoal} g
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30">
            <p className="text-muted-foreground font-medium">Fat Target</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">
              {profile?.dailyFatGoal} g
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/30">
            <p className="text-muted-foreground font-medium">Fiber Target</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
              {profile?.dailyFiberGoal} g
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
