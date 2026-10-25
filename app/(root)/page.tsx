"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import {
  ExerciseChecklistItem,
  type ChecklistExercise,
} from "@/components/shared/ExerciseChecklistItem";
import { DashboardSkeleton } from "@/components/shared/SkeletonLoaders";
import { useI18n } from "@/components/shared/I18nProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  UtensilsCrossed,
  Trash2,
  Droplet,
  Dumbbell,
  Moon,
  Sun,
  Apple,
  Scale,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

/** Seed a checklist row from a planned exercise (defaults to fully completed). */
const toChecklistExercise = (exercise: {
  exerciseName: string;
  trackingMode?: "reps" | "time";
  sets: number;
  reps: number;
  seconds?: number;
}): ChecklistExercise => ({
  exerciseName: exercise.exerciseName,
  trackingMode: exercise.trackingMode || "reps",
  sets: exercise.sets,
  reps: exercise.reps,
  seconds: exercise.seconds || 0,
  selected: true,
  setsCompleted: exercise.sets,
});

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
  const [savingWorkout, setSavingWorkout] = useState(false);
  const [workoutCardOpen, setWorkoutCardOpen] = useState(false);
  const [workoutChecklist, setWorkoutChecklist] = useState<ChecklistExercise[]>(
    [],
  );
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMealSlot, setSearchMealSlot] = useState<MealType>("lunch");
  const [barcodeOpen, setBarcodeOpen] = useState(false);

  const [itemDeletingKey, setItemDeletingKey] = useState<string | null>(null);

  // Guard so we only re-seed the workout checklist when the day (or plan)
  // actually changes, never on background refreshes.
  const seededPlanKeyRef = useRef<string>("");

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
        // Re-seed the workout checklist only when the day or plan changes so
        // in-progress ticks survive background refreshes.
        const plan = res?.todayWorkoutPlan;
        const planKey = plan?._id
          ? `${selectedDateStr}:${plan._id}`
          : `${selectedDateStr}:none`;
        if (seededPlanKeyRef.current !== planKey) {
          seededPlanKeyRef.current = planKey;
          setWorkoutChecklist(
            plan?.exercises?.length
              ? plan.exercises.map(toChecklistExercise)
              : [],
          );
          // Expand only while the plan is still pending — keeps the dashboard
          // compact once today's session is already logged.
          setWorkoutCardOpen(
            Boolean(plan?.exercises?.length) && !res?.today?.workoutDone,
          );
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
  const resetWorkoutChecklist = () => {
    setWorkoutChecklist(
      todayWorkoutPlan?.exercises?.length
        ? todayWorkoutPlan.exercises.map(toChecklistExercise)
        : [],
    );
  };

  const updateWorkoutExercise = (
    index: number,
    patch: Partial<ChecklistExercise>,
  ) => {
    setWorkoutChecklist((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const handleSaveTodayWorkout = async () => {
    if (!todayWorkoutPlan?._id) return;

    const completed = workoutChecklist.filter(
      (exercise) => exercise.selected && exercise.setsCompleted > 0,
    );
    if (completed.length === 0) {
      toast.error(t("workout.today.selectAtLeastOne"));
      return;
    }

    try {
      setSavingWorkout(true);
      await completeWorkoutPlanDay(
        selectedDateStr,
        todayWorkoutPlan._id,
        completed.map((exercise) => ({
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
      setWorkoutCardOpen(false);
      notifyDataUpdated("workout");
      await fetchDashboard(false);
    } catch {
      toast.error(t("dashboard.toast.completeWorkoutFailed"));
    } finally {
      setSavingWorkout(false);
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

  const workoutSelectedCount = workoutChecklist.filter(
    (exercise) => exercise.selected && exercise.setsCompleted > 0,
  ).length;


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
            onClick={() => openQuickLog("sleep")}
            className="h-11 gap-1.5 rounded-2xl border-border/60 text-xs font-semibold"
          >
            <Moon className="h-4 w-4 text-indigo-500" />
            {t("dashboard.quickActions.sleep")}
          </Button>
          <Button
            variant="outline"
            onClick={() => openQuickLog("weight")}
            className="h-11 gap-1.5 rounded-2xl border-border/60 text-xs font-semibold"
          >
            <Scale className="h-4 w-4 text-rose-500" />
            {t("dashboard.quickActions.weight")}
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

      {/* ─────────────── Today's planned workout — inline checklist ─────────────── */}
      <section
        aria-label={isToday ? t("workout.today.badge") : dayLabel}
        className="glass-card space-y-4 rounded-3xl border border-border/50 p-5 sm:p-6"
      >
        {todayWorkoutPlan ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
                  <Dumbbell className="h-3 w-3" />
                  {isToday ? t("workout.today.badge") : dayLabel}
                </div>
                <h2 className="truncate font-heading text-base font-black tracking-tight sm:text-lg">
                  {todayWorkoutPlan.title}
                </h2>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {today.workoutDone ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("dashboard.habit.complete")}
                  </span>
                ) : (
                  <span className="text-xs font-bold tabular-nums text-primary">
                    {t("workout.today.progress", {
                      done: workoutSelectedCount,
                      total: workoutChecklist.length,
                    })}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setWorkoutCardOpen((prev) => !prev)}
                  aria-expanded={workoutCardOpen}
                  aria-controls="today-workout-body"
                  aria-label={
                    workoutCardOpen
                      ? t("workout.today.hideDetails")
                      : t("workout.today.showDetails")
                  }
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      workoutCardOpen && "rotate-180",
                    )}
                  />
                </button>
              </div>
            </div>

            {workoutCardOpen && (
              <div id="today-workout-body" className="space-y-4">
                <div className="space-y-2">
                  {workoutChecklist.map((exercise, index) => (
                    <ExerciseChecklistItem
                      key={`${exercise.exerciseName}-${index}`}
                      exercise={exercise}
                      t={t}
                      onChange={(patch) => updateWorkoutExercise(index, patch)}
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    onClick={handleSaveTodayWorkout}
                    disabled={savingWorkout || workoutSelectedCount === 0}
                    className="h-11 flex-1 gap-2 rounded-xl font-bold"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {savingWorkout
                      ? t("workout.actions.savingDots")
                      : t("workout.today.save")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetWorkoutChecklist}
                    disabled={savingWorkout}
                    className="h-11 gap-2 rounded-xl font-bold text-muted-foreground"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {t("workout.today.reset")}
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Dumbbell className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {t("workout.today.restTitle")}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {t("workout.today.restDescription")}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-9 gap-1.5 rounded-xl border-primary/30 font-bold text-primary hover:bg-primary/10"
              >
                <Link href="/workout">
                  <Plus className="h-3.5 w-3.5" />
                  {t("workout.today.createPlan")}
                </Link>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setQuickWorkoutOpen(true)}
                className="h-9 gap-1.5 rounded-xl font-semibold text-muted-foreground"
              >
                {t("dashboard.quickActions.workout")}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
