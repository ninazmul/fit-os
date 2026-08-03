"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getMealLogsForDate,
  logMeal,
  deleteMealLog,
} from "@/lib/actions/meal.actions";
import { getFoods, createCustomFood } from "@/lib/actions/food.actions";
import { getUserProfile } from "@/lib/actions/profile.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Search,
  Flame,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Apple,
} from "lucide-react";
import type { MealType, IFood, IMealItem, FoodCategory } from "@/types/fitness";
import toast from "react-hot-toast";
import { format, addDays, subDays } from "date-fns";
import AdUnit from "@/components/shared/AdUnit";

const mealTypes: { type: MealType; label: string; icon: typeof Sun }[] = [
  { type: "breakfast", label: "Breakfast", icon: Sun },
  { type: "lunch", label: "Lunch", icon: UtensilsCrossed },
  { type: "dinner", label: "Dinner", icon: Moon },
  { type: "snack", label: "Snacks", icon: Apple },
];

export default function DietPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [meals, setMeals] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [, setLoading] = useState(true);

  // Add meal modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType>("breakfast");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory] = useState<string>("all");
  const [foodCatalog, setFoodCatalog] = useState<IFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<IFood | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Custom food modal state
  const [customFoodModalOpen, setCustomFoodModalOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory] = useState<FoodCategory>("custom");
  const [customServing, setCustomServing] = useState("1 plate");
  const [customCalories, setCustomCalories] = useState<number>(200);
  const [customProtein, setCustomProtein] = useState<number>(10);
  const [customCarbs, setCustomCarbs] = useState<number>(30);
  const [customFat, setCustomFat] = useState<number>(5);
  const [customFiber, setCustomFiber] = useState<number>(2);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [mealsData, userProfile] = await Promise.all([
        getMealLogsForDate(dateStr),
        getUserProfile(),
      ]);
      setMeals(mealsData);
      setProfile(userProfile);
    } catch (err) {
      console.error("Error fetching diet data:", err);
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load foods catalog when search query or category changes
  useEffect(() => {
    if (!addModalOpen) return;
    const fetchCatalog = async () => {
      try {
        const foods = await getFoods(searchQuery, selectedCategory);
        setFoodCatalog(foods);
      } catch (err) {
        console.error("Error loading foods:", err);
      }
    };
    fetchCatalog();
  }, [addModalOpen, searchQuery, selectedCategory]);

  const handleAddFoodToMeal = async () => {
    if (!selectedFood) {
      toast.error("Please select a food item");
      return;
    }

    try {
      const newItem: IMealItem = {
        foodId: selectedFood._id,
        name: selectedFood.name,
        serving: selectedFood.servingSize,
        quantity,
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbs: selectedFood.carbs,
        fat: selectedFood.fat,
        fiber: selectedFood.fiber,
      };

      // Check if meal of this type already exists today
      const existingMeal = meals.find((m) => m.mealType === activeMealType);
      const existingItems = existingMeal ? existingMeal.items : [];
      const updatedItems = [...existingItems, newItem];

      await logMeal({
        date: dateStr,
        mealType: activeMealType,
        items: updatedItems,
      });

      toast.success(`Added ${selectedFood.name} to ${activeMealType}! 🥗`);
      setAddModalOpen(false);
      setSelectedFood(null);
      setQuantity(1);
      fetchData();
    } catch {
      toast.error("Failed to add meal");
    }
  };

  const handleCreateCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomFood({
        name: customName,
        category: customCategory,
        servingSize: customServing,
        calories: customCalories,
        protein: customProtein,
        carbs: customCarbs,
        fat: customFat,
        fiber: customFiber,
      });
      toast.success("Custom food created!");
      setCustomFoodModalOpen(false);
      // Reload catalog
      const foods = await getFoods(searchQuery, selectedCategory);
      setFoodCatalog(foods);
    } catch {
      toast.error("Failed to create food");
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await deleteMealLog(mealId);
      toast.success("Meal removed");
      fetchData();
    } catch {
      toast.error("Failed to delete meal");
    }
  };

  // Daily nutrition aggregates
  const dailyCalories = meals.reduce((s, m) => s + m.totalCalories, 0);
  const dailyProtein = meals.reduce((s, m) => s + m.totalProtein, 0);
  const dailyCarbs = meals.reduce((s, m) => s + m.totalCarbs, 0);
  const dailyFat = meals.reduce((s, m) => s + m.totalFat, 0);
  const dailyFiber = meals.reduce((s, m) => s + m.totalFiber, 0);

  const calGoal = profile?.dailyCaloriesGoal || 2000;
  const proteinGoal = profile?.dailyProteinGoal || 150;
  const carbGoal = profile?.dailyCarbGoal || 200;
  const fatGoal = profile?.dailyFatGoal || 60;
  const fiberGoal = profile?.dailyFiberGoal || 30;

  return (
    <div className="space-y-6">
      {/* Date Navigation & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Diet & Nutrition Tracker 🥗
          </h1>
          <p className="text-xs text-muted-foreground">
            Log meals, Bangladeshi dishes, and track macros
          </p>
        </div>

        {/* Date Selector Pill */}
        <div className="flex items-center gap-2 bg-card border border-border/60 p-1.5 rounded-2xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedDate((d) => subDays(d, 1))}
            className="h-8 w-8 rounded-xl"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 text-xs font-semibold">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{format(selectedDate, "EEE, MMM d, yyyy")}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedDate((d) => addDays(d, 1))}
            className="h-8 w-8 rounded-xl"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Daily Nutrition Summary Banner */}
      <div className="glass-card p-6 rounded-3xl border border-border/50 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Total Consumed
              </p>
              <h2 className="text-2xl font-bold">
                {Math.round(dailyCalories)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  / {calGoal} kcal
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="text-right">
              <p className="text-muted-foreground">Remaining</p>
              <p
                className={`text-base font-bold ${calGoal - dailyCalories < 0 ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}
              >
                {Math.max(0, calGoal - dailyCalories)} kcal
              </p>
            </div>
          </div>
        </div>

        {/* Macro Progress Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/40 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Protein
              </span>
              <span className="text-muted-foreground">
                {Math.round(dailyProtein)}g / {proteinGoal}g
              </span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{
                  width: `${Math.min(100, (dailyProtein / proteinGoal) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Carbs
              </span>
              <span className="text-muted-foreground">
                {Math.round(dailyCarbs)}g / {carbGoal}g
              </span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{
                  width: `${Math.min(100, (dailyCarbs / carbGoal) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                Fat
              </span>
              <span className="text-muted-foreground">
                {Math.round(dailyFat)}g / {fatGoal}g
              </span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{
                  width: `${Math.min(100, (dailyFat / fatGoal) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                Fiber
              </span>
              <span className="text-muted-foreground">
                {Math.round(dailyFiber)}g / {fiberGoal}g
              </span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{
                  width: `${Math.min(100, (dailyFiber / fiberGoal) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mid-page Ad */}
      <AdUnit size="auto" label="Sponsored" maxWidth="970px" />

      {/* Meal Types Sections */}
      <div className="space-y-4">
        {mealTypes.map((mType) => {
          const loggedMeal = meals.find((m) => m.mealType === mType.type);
          const Icon = mType.icon;

          return (
            <div
              key={mType.type}
              className="glass-card p-5 rounded-3xl border border-border/50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">{mType.label}</h3>
                    <p className="text-xs text-muted-foreground">
                      {loggedMeal
                        ? `${loggedMeal.totalCalories} kcal`
                        : "0 kcal logged"}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    setActiveMealType(mType.type);
                    setAddModalOpen(true);
                  }}
                  className="rounded-xl gap-1 text-xs bg-primary/10 text-primary hover:bg-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  Add Food
                </Button>
              </div>

              {/* Items List */}
              {loggedMeal && loggedMeal.items.length > 0 ? (
                <div className="space-y-2 pt-2 border-t border-border/30">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {loggedMeal.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/20 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-muted-foreground text-[11px]">
                          {item.quantity} &times; {item.serving} &middot; P:{" "}
                          {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-primary">
                          {Math.round(item.calories * item.quantity)} kcal
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMeal(loggedMeal._id)}
                          className="h-7 w-7 text-muted-foreground hover:text-red-500 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-3 italic">
                  No foods logged for {mType.label.toLowerCase()} yet.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Food Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-6 gap-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              Add Food to {activeMealType.toUpperCase()}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Search Bangladeshi & global dishes or create a custom food.
            </DialogDescription>
          </DialogHeader>

          {/* Search bar & filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search food (e.g. Polao, Kacchi, Dal)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl text-sm"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setCustomFoodModalOpen(true)}
              className="rounded-xl text-xs whitespace-nowrap border-primary text-primary"
            >
              + Custom
            </Button>
          </div>

          {/* Catalog List */}
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {foodCatalog.map((food) => (
              <div
                key={food._id}
                onClick={() => setSelectedFood(food)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer text-xs ${
                  selectedFood?._id === food._id
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border/40 hover:bg-accent/50"
                }`}
              >
                <div>
                  <p className="font-semibold text-sm flex items-center gap-1.5">
                    {food.name}
                    {food.isBangladeshi && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        BD
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    {food.servingSize} &middot; P:{food.protein}g | C:
                    {food.carbs}g | F:{food.fat}g
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-primary">
                    {food.calories}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    kcal
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quantity selector & Add Button */}
          {selectedFood && (
            <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-xs">Quantity:</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-20 rounded-xl text-center font-bold"
                />
              </div>

              <Button
                onClick={handleAddFoodToMeal}
                className="rounded-xl bg-primary hover:bg-primary/90 text-xs font-bold"
              >
                Add {Math.round(selectedFood.calories * quantity)} kcal &rarr;
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Food Creation Modal */}
      <Dialog open={customFoodModalOpen} onOpenChange={setCustomFoodModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Create Custom Food 🍳
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateCustomFood} className="space-y-3 text-xs">
            <div>
              <Label>Food Name</Label>
              <Input
                placeholder="e.g. Homemade Chicken Wrap"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
                className="rounded-xl mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Serving Size</Label>
                <Input
                  placeholder="e.g. 1 roll (200g)"
                  value={customServing}
                  onChange={(e) => setCustomServing(e.target.value)}
                  required
                  className="rounded-xl mt-1"
                />
              </div>

              <div>
                <Label>Calories (kcal)</Label>
                <Input
                  type="number"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(Number(e.target.value))}
                  required
                  className="rounded-xl mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              <div>
                <Label>Protein (g)</Label>
                <Input
                  type="number"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(Number(e.target.value))}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label>Carbs (g)</Label>
                <Input
                  type="number"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(Number(e.target.value))}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label>Fat (g)</Label>
                <Input
                  type="number"
                  value={customFat}
                  onChange={(e) => setCustomFat(Number(e.target.value))}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label>Fiber (g)</Label>
                <Input
                  type="number"
                  value={customFiber}
                  onChange={(e) => setCustomFiber(Number(e.target.value))}
                  className="rounded-xl mt-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl mt-3 bg-primary hover:bg-primary/90 font-bold"
            >
              Save Custom Food
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer Ad Slot */}
      <AdUnit size="auto" maxWidth="970px" />
    </div>
  );
}
