"use client";

import { useState, useEffect, useCallback } from "react";
import { getDashboardData } from "@/lib/actions/dashboard.actions";
import { removeMealItem } from "@/lib/actions/meal.actions";
import { completeWorkoutPlanDay } from "@/lib/actions/workout.actions";
import { getLocalDateString } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { notifyDataUpdated, useDataUpdateListener } from "@/lib/events";
import type { MealType } from "@/types/fitness";
import dynamic from "next/dynamic";
import PageHeader from "@/components/shared/PageHeader";
import NutritionSummary from "@/components/shared/NutritionSummary";
import EmptyState from "@/components/shared/EmptyState";
import { DashboardSkeleton } from "@/components/shared/SkeletonLoaders";
import { useI18n } from "@/components/shared/I18nProvider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  UtensilsCrossed,
  Trash2,
  Droplet,
  Dumbbell,
  Moon,
  Sun,
  Apple,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type DashboardCompletionExercise = {
  exerciseName: string;
  trackingMode: "reps" | "time";
  sets: number;
  reps: number;
  seconds: number;
  selected: boolean;
  setsCompleted: number;
};

const QuickActionModal = dynamic(
  () => import("@/components/shared/QuickActionModal"),
  { ssr: false },
);
const QuickWorkoutModal = dynamic(
  () => import("@/components/shared/QuickWorkoutModal"),
  { ssr: false },
);
const OnboardingModal = dynamic(
  () => import("@/components/shared/OnboardingModal"),
  { ssr: false },
);
const SearchModal = dynamic(() => import("@/components/shared/SearchModal"), {
  ssr: false,
});
const BarcodeScanner = dynamic(
  () => import("@/components/shared/BarcodeScanner"),
  { ssr: false },
);

const MEAL_SLOTS: {
  type: MealType;
  labelKey: string;
  icon: typeof Sun;
  color: string;
}[] = [
  {
    type: "breakfast",
    labelKey: "dashboard.meal.breakfast",
    icon: Sun,
    color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  },
  {
    type: "lunch",
    labelKey: "dashboard.meal.lunch",
    icon: UtensilsCrossed,
    color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    type: "dinner",
    labelKey: "dashboard.meal.dinner",
    icon: Moon,
    color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    type: "snack",
    labelKey: "dashboard.meal.snacks",
    icon: Apple,
    color: "text-purple-600 bg-purple-500/10 border-purple-500/20",
  },
];

export default function DashboardPage() {
  const { t } = useI18n();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateStr, setSelectedDateStr] =
    useState<string>(getLocalDateString());

  // Modal state
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [quickLogAction, setQuickLogAction] = useState<
    "meal" | "weight" | "water" | "workout" | "sleep"
  >("water");
  const [quickWorkoutOpen, setQuickWorkoutOpen] = useState(false);
  const [planCompleting, setPlanCompleting] = useState(false);
  const [planCompletionOpen, setPlanCompletionOpen] = useState(false);
  const [planCompletionExercises, setPlanCompletionExercises] = useState<
    DashboardCompletionExercise[]
  >([]);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMealSlot, setSearchMealSlot] = useState<MealType>("lunch");
  const [barcodeOpen, setBarcodeOpen] = useState(false);

  const [itemDeletingKey, setItemDeletingKey] = useState<string | null>(null);

  const isToday = selectedDateStr === getLocalDateString();

  // Fetch only the selected date's data directly from the DB
  const fetchDashboard = useCallback(
    async (showLoadingSpinner = false) => {
      try {
        if (showLoadingSpinner) setLoading(true);
        const res = await getDashboardData(selectedDateStr);
        setData(res);
        if (res?.needsOnboarding) {
          setOnboardingOpen(true);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (showLoadingSpinner) setLoading(false);
      }
    },
    [selectedDateStr],
  );

  // Initial load on date change
  useEffect(() => {
    fetchDashboard(true);
  }, [fetchDashboard]);

  // Reactive listener: refresh seamlessly when a modal or action changes data
  useDataUpdateListener(() => {
    fetchDashboard(false);
  });

  // Date navigation
  const handlePrevDay = () => {
    const d = new Date(selectedDateStr);
    d.setDate(d.getDate() - 1);
    setSelectedDateStr(getLocalDateString(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDateStr);
    d.setDate(d.getDate() + 1);
    setSelectedDateStr(getLocalDateString(d));
  };

  const handleToday = () => {
    setSelectedDateStr(getLocalDateString());
  };

  // ──────────────────────────── Meal Handlers ────────────────────────────
  const handleRemoveMealItem = async (mealId: string, itemIdx: number) => {
    const key = `${mealId}_${itemIdx}`;
    try {
      setItemDeletingKey(key);
      await removeMealItem(mealId, itemIdx);
      toast.success(t("dashboard.toast.itemRemoved"));
      notifyDataUpdated("meal");
      await fetchDashboard(false);
    } catch {
      toast.error(t("dashboard.toast.removeItemFailed"));
    } finally {
      setItemDeletingKey(null);
    }
  };

  // ──────────────────────────── Workout Handlers ────────────────────────────
  const openPlanCompletionDialog = () => {
    if (!todayWorkoutPlan?._id) return;

    setPlanCompletionExercises(
      todayWorkoutPlan.exercises.map(
        (exercise: {
          exerciseName: string;
          trackingMode?: "reps" | "time";
          sets: number;
          reps: number;
          seconds?: number;
        }) => ({
          exerciseName: exercise.exerciseName,
          trackingMode: exercise.trackingMode || "reps",
          sets: exercise.sets,
          reps: exercise.reps,
          seconds: exercise.seconds || 0,
          selected: true,
          setsCompleted: exercise.sets,
        }),
      ),
    );
    setPlanCompletionOpen(true);
  };

  const handleCompleteWorkoutPlan = async () => {
    if (!todayWorkoutPlan?._id) return;

    try {
      setPlanCompleting(true);
      await completeWorkoutPlanDay(
        selectedDateStr,
        todayWorkoutPlan._id,
        planCompletionExercises
          .filter((exercise) => exercise.selected && exercise.setsCompleted > 0)
          .map((exercise) => ({
            exerciseName: exercise.exerciseName,
            trackingMode: exercise.trackingMode,
            setsCompleted: exercise.setsCompleted,
            reps: exercise.trackingMode === "time" ? 0 : exercise.reps,
            seconds: exercise.trackingMode === "time" ? exercise.seconds : 0,
          })),
      );
      toast.success(
        t("dashboard.toast.workoutPlanCompleted", {
          title: todayWorkoutPlan.title,
        }),
      );
      notifyDataUpdated("workout");
      setPlanCompletionOpen(false);
      await fetchDashboard(false);
    } catch {
      toast.error(t("dashboard.toast.completeWorkoutFailed"));
    } finally {
      setPlanCompleting(false);
    }
  };

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  if (data.needsOnboarding) {
    return (
      <div className="text-center py-20">
        <OnboardingModal
          open={onboardingOpen}
          onOpenChange={setOnboardingOpen}
        />
        <h2 className="text-xl font-bold">
          {t("dashboard.onboarding.welcome", { app: APP_NAME })}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("dashboard.onboarding.description")}
        </p>
        <Button
          onClick={() => setOnboardingOpen(true)}
          className="mt-4 rounded-xl font-bold"
        >
          {t("dashboard.onboarding.start")}
        </Button>
      </div>
    );
  }

  const {
    profile,
    today,
    meals: todayMeals,
    todaysMission,
    todayWorkoutPlan,
  } = data;

  const waterGoalMl = profile.waterGoalMl || 2500;
  const waterPct = Math.min(
    100,
    Math.round((today.waterMl / waterGoalMl) * 100),
  );
  const waterLitres = (today.waterMl / 1000).toFixed(1);
  const waterGoalLitres = (waterGoalMl / 1000).toFixed(1);

  // Determine the meal slot most likely to be logged right now
  const currentHour = new Date().getHours();
  let currentSuggestedSlot: MealType = "lunch";
  if (currentHour >= 5 && currentHour < 11) currentSuggestedSlot = "breakfast";
  else if (currentHour >= 11 && currentHour < 16)
    currentSuggestedSlot = "lunch";
  else if (currentHour >= 16 && currentHour < 22)
    currentSuggestedSlot = "dinner";
  else currentSuggestedSlot = "snack";

  const dayLabel = new Date(`${selectedDateStr}T12:00:00`).toLocaleDateString(
    "en-US",
    { weekday: "long", month: "short", day: "numeric" },
  );

  const openAddFood = (slot?: MealType) => {
    setSearchMealSlot(slot ?? currentSuggestedSlot);
    setSearchOpen(true);
  };

  const openQuickLog = (
    action: "meal" | "weight" | "water" | "workout" | "sleep",
  ) => {
    setQuickLogAction(action);
    setQuickLogOpen(true);
  };

  const hasFoodLogged = (today.mealCount || 0) > 0;

  const habitTiles = [
    {
      key: "water",
      label: t("dashboard.habit.water"),
      icon: Droplet,
      value: `${waterLitres} / ${waterGoalLitres} L`,
      pct: waterPct,
      barClass: "bg-sky-500",
      iconClass: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
      onClick: () => openQuickLog("water"),
      actionLabel: t("dashboard.habit.logWater"),
    },
    {
      key: "workout",
      label: t("dashboard.habit.workout"),
      icon: Dumbbell,
      value: today.workoutDone
        ? t("dashboard.habit.workoutCountLogged", { n: today.workoutCount })
        : todayWorkoutPlan
          ? t("dashboard.habit.planned")
          : t("dashboard.habit.notLogged"),
      pct: today.workoutDone ? 100 : 0,
      barClass: "bg-amber-500",
      iconClass: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
      onClick: () =>
        todayWorkoutPlan && !today.workoutDone
          ? openPlanCompletionDialog()
          : setQuickWorkoutOpen(true),
      actionLabel:
        todayWorkoutPlan && !today.workoutDone
          ? t("dashboard.habit.complete")
          : t("dashboard.habit.logWorkout"),
    },
    {
      key: "sleep",
      label: t("dashboard.habit.sleep"),
      icon: Moon,
      value:
        today.sleepHours !== null
          ? `${today.sleepHours} h`
          : t("dashboard.habit.notLogged"),
      pct:
        today.sleepHours !== null
          ? Math.min(100, Math.round((today.sleepHours / 8) * 100))
          : 0,
      barClass: "bg-indigo-500",
      iconClass: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
      onClick: () => openQuickLog("sleep"),
      actionLabel: t("dashboard.habit.logSleep"),
    },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Modals */}
      <OnboardingModal
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        initialData={profile}
      />
      <QuickActionModal
        open={quickLogOpen}
        onOpenChange={setQuickLogOpen}
        defaultAction={quickLogAction}
        dateStr={selectedDateStr}
        onCompleted={() => fetchDashboard(false)}
      />
      <QuickWorkoutModal
        open={quickWorkoutOpen}
        onOpenChange={setQuickWorkoutOpen}
        dateStr={selectedDateStr}
        onCompleted={() => fetchDashboard(false)}
      />
      <SearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        defaultMealSlot={searchMealSlot}
        dateStr={selectedDateStr}
        onCompleted={() => fetchDashboard(false)}
      />
      <BarcodeScanner
        open={barcodeOpen}
        onOpenChange={setBarcodeOpen}
        dateStr={selectedDateStr}
        defaultMealType={currentSuggestedSlot}
        onLogged={async () => {
          notifyDataUpdated("meal");
          await fetchDashboard(false);
        }}
      />
      <Dialog open={planCompletionOpen} onOpenChange={setPlanCompletionOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {t("dashboard.planDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t("dashboard.planDialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3">
              <p className="text-sm font-black">{todayWorkoutPlan?.title}</p>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.planDialog.plannedSummary", {
                  min: todayWorkoutPlan?.estimatedDurationMinutes || 0,
                  kcal: todayWorkoutPlan?.estimatedCaloriesBurned || 0,
                })}
              </p>
            </div>

            {planCompletionExercises.map((exercise, index) => (
              <div
                key={`${exercise.exerciseName}-${index}`}
                className="rounded-2xl border border-border/60 bg-card p-3 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={exercise.selected}
                    onCheckedChange={(checked) =>
                      setPlanCompletionExercises(
                        planCompletionExercises.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, selected: Boolean(checked) }
                            : item,
                        ),
                      )
                    }
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">
                      {exercise.exerciseName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {exercise.trackingMode === "time"
                        ? t("dashboard.planDialog.plannedTime", {
                            sets: exercise.sets,
                            time: exercise.seconds,
                          })
                        : t("dashboard.planDialog.plannedReps", {
                            sets: exercise.sets,
                            reps: exercise.reps,
                          })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px]">
                      {t("dashboard.planDialog.setsDone")}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={exercise.sets}
                      value={exercise.setsCompleted}
                      disabled={!exercise.selected}
                      onChange={(e) =>
                        setPlanCompletionExercises(
                          planCompletionExercises.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  setsCompleted: Math.min(
                                    item.sets,
                                    Number(e.target.value) || 0,
                                  ),
                                }
                              : item,
                          ),
                        )
                      }
                      className="rounded-xl bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">
                      {exercise.trackingMode === "time"
                        ? t("dashboard.planDialog.secondsPerSet")
                        : t("dashboard.planDialog.repsPerSet")}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={
                        exercise.trackingMode === "time"
                          ? exercise.seconds
                          : exercise.reps
                      }
                      disabled={!exercise.selected}
                      onChange={(e) =>
                        setPlanCompletionExercises(
                          planCompletionExercises.map((item, itemIndex) => {
                            if (itemIndex !== index) return item;
                            return item.trackingMode === "time"
                              ? {
                                  ...item,
                                  seconds: Number(e.target.value) || 0,
                                }
                              : { ...item, reps: Number(e.target.value) || 0 };
                          }),
                        )
                      }
                      className="rounded-xl bg-background"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              onClick={handleCompleteWorkoutPlan}
              disabled={planCompleting}
              className="w-full rounded-xl bg-primary hover:bg-primary/90 font-bold"
            >
              {planCompleting
                ? t("dashboard.planDialog.saving")
                : t("dashboard.planDialog.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─────────────── Section A — Compact page header ─────────────── */}
      <PageHeader
        icon={CalendarCheck}
        title={
          isToday
            ? t("dashboard.header.titleToday")
            : t("dashboard.header.titleOther", { day: dayLabel })
        }
        subtitle={`${todaysMission.greetingTime}, ${profile.name}`}
      >
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/50 bg-background/60 p-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevDay}
            className="h-8 w-8 rounded-xl"
            aria-label={t("dashboard.header.prevDay")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <button
            type="button"
            onClick={handleToday}
            className="flex-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            {isToday ? t("dashboard.header.today") : dayLabel}
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextDay}
            className="h-8 w-8 rounded-xl"
            aria-label={t("dashboard.header.nextDay")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </PageHeader>

      {/* ─────────────── Section B — Today's nutrition summary ─────────────── */}
      {hasFoodLogged ? (
        <NutritionSummary
          calories={{
            key: "calories",
            label: t("dashboard.nutrition.calories"),
            consumed: today.calories,
            target: profile.dailyCaloriesGoal,
            unit: "kcal",
          }}
          macros={[
            {
              key: "protein",
              label: t("dashboard.nutrition.protein"),
              consumed: today.protein,
              target: profile.dailyProteinGoal,
              unit: "g",
            },
            {
              key: "carbs",
              label: t("dashboard.nutrition.carbs"),
              consumed: today.carbs,
              target: profile.dailyCarbGoal,
              unit: "g",
            },
            {
              key: "fat",
              label: t("dashboard.nutrition.fat"),
              consumed: today.fat,
              target: profile.dailyFatGoal,
              unit: "g",
            },
            {
              key: "fiber",
              label: t("dashboard.nutrition.fiber"),
              consumed: today.fiber,
              target: profile.dailyFiberGoal,
              unit: "g",
            },
          ]}
        />
      ) : (
        <EmptyState
          icon={UtensilsCrossed}
          title={
            isToday
              ? t("dashboard.empty.noFoodToday")
              : t("dashboard.empty.noFoodDay")
          }
          description={t("dashboard.empty.description")}
          actionText={t("dashboard.empty.addFirstFood")}
          onAction={() => openAddFood()}
        />
      )}

      {/* ─────────────── Section C — Quick actions ─────────────── */}
      <section
        aria-label={t("dashboard.quickActions.aria")}
        className="space-y-2.5"
      >
        <Button
          onClick={() => openAddFood()}
          className="h-12 w-full gap-2 rounded-2xl text-sm font-bold"
        >
          <Plus className="h-4 w-4" />
          {t("dashboard.quickActions.addFood")}
        </Button>

        <div className="grid grid-cols-3 gap-2.5">
          <Button
            variant="outline"
            onClick={() => openQuickLog("water")}
            className="h-11 gap-1.5 rounded-2xl border-border/60 text-xs font-semibold"
          >
            <Droplet className="h-4 w-4 text-sky-500" />
            {t("dashboard.quickActions.addWater")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setQuickWorkoutOpen(true)}
            className="h-11 gap-1.5 rounded-2xl border-border/60 text-xs font-semibold"
          >
            <Dumbbell className="h-4 w-4 text-amber-500" />
            {t("dashboard.quickActions.workout")}
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 gap-1.5 rounded-2xl border-border/60 text-xs font-semibold"
          >
            <Link href="/diet">
              <UtensilsCrossed className="h-4 w-4 text-emerald-500" />
              {t("dashboard.quickActions.foodDiary")}
            </Link>
          </Button>
        </div>
      </section>

      {/* ─────────────── Section D — Today's meals ─────────────── */}
      {hasFoodLogged && (
        <section
          aria-label={t("dashboard.meals.aria")}
          className="glass-card space-y-2 rounded-3xl border border-border/50 p-5 sm:p-6"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-heading flex items-center gap-2 text-base font-black sm:text-lg">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              {isToday
                ? t("dashboard.meals.titleToday")
                : t("dashboard.meals.title")}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openAddFood()}
              className="h-8 gap-1 rounded-xl text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("dashboard.meals.add")}
            </Button>
          </div>

          <div className="divide-y divide-border/50">
            {MEAL_SLOTS.map((slot) => {
              const meal = todayMeals[slot.type] || {
                items: [],
                calories: 0,
              };
              const Icon = slot.icon;

              return (
                <div key={slot.type} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                          slot.color,
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate text-sm font-bold">
                        {t(slot.labelKey)}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                        {Math.round(meal.calories || 0)} kcal
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openAddFood(slot.type)}
                        className="h-7 w-7 rounded-lg"
                        aria-label={t("dashboard.meals.addFoodTo", {
                          slot: t(slot.labelKey),
                        })}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {meal.items.length === 0 ? (
                    <p className="ml-9 mt-1.5 text-xs text-muted-foreground">
                      {t("dashboard.meals.nothingLogged")}
                    </p>
                  ) : (
                    <ul className="ml-9 mt-2 space-y-1.5">
                      {meal.items.map(
                        (
                          item: {
                            name: string;
                            serving?: string;
                            quantity?: number;
                            calories: number;
                            protein: number;
                            carbs: number;
                            fat: number;
                          },
                          idx: number,
                        ) => (
                          <li
                            key={`${item.name}-${idx}`}
                            className="flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm">{item.name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {item.serving ||
                                  t("dashboard.meals.defaultServing")}
                                {item.quantity && item.quantity !== 1
                                  ? ` × ${item.quantity}`
                                  : ""}{" "}
                                &middot; {Math.round(item.calories || 0)} kcal
                                &middot;{" "}
                                {t("dashboard.meals.macroInline", {
                                  protein: item.protein,
                                  carbs: item.carbs,
                                  fat: item.fat,
                                })}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                meal._id && handleRemoveMealItem(meal._id, idx)
                              }
                              disabled={
                                !meal._id ||
                                itemDeletingKey === `${meal._id}_${idx}`
                              }
                              className="h-7 w-7 shrink-0 rounded-lg text-muted-foreground hover:text-destructive"
                              aria-label={t("dashboard.meals.removeItem", {
                                name: item.name,
                              })}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </li>
                        ),
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─────────────── Section E — Compact daily habits (water/workout/sleep) ─────────────── */}
      <section
        aria-label={t("dashboard.habits.aria")}
        className="grid grid-cols-3 gap-2.5"
      >
        {habitTiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.key}
              type="button"
              onClick={tile.onClick}
              className="glass-card rounded-2xl border border-border/50 p-3 text-left transition-all hover:border-primary/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              aria-label={`${tile.label}: ${tile.value}. ${tile.actionLabel}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                    tile.iconClass,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="truncate text-xs font-bold">{tile.label}</span>
              </div>
              <p className="mt-2 truncate text-xs font-semibold text-muted-foreground tabular-nums">
                {tile.value}
              </p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    tile.barClass,
                  )}
                  style={{ width: `${tile.pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </section>
    </div>
  );
}
