/** Dashboard page (app/(root)/page.tsx) dictionary. */

export const dashboardEn: Record<string, string> = {
  // Onboarding gate
  "dashboard.onboarding.welcome": "Welcome to {app}",
  "dashboard.onboarding.description":
    "Please complete your profile onboarding to access your dashboard.",
  "dashboard.onboarding.start": "Start Onboarding",
  // Page header
  "dashboard.header.titleToday": "Today's Nutrition",
  "dashboard.header.titleOther": "Nutrition · {day}",
  "dashboard.header.prevDay": "Previous day",
  "dashboard.header.nextDay": "Next day",
  "dashboard.header.today": "Today",
  // Nutrition summary
  "dashboard.nutrition.calories": "Calories",
  "dashboard.nutrition.protein": "Protein",
  "dashboard.nutrition.carbs": "Carbs",
  "dashboard.nutrition.fat": "Fat",
  "dashboard.nutrition.fiber": "Fiber",
  // Meal slots
  "dashboard.meal.breakfast": "Breakfast",
  "dashboard.meal.lunch": "Lunch",
  "dashboard.meal.dinner": "Dinner",
  "dashboard.meal.snacks": "Snacks",
  // Empty state
  "dashboard.empty.noFoodToday": "You haven't logged any food today",
  "dashboard.empty.noFoodDay": "No food logged on this day",
  "dashboard.empty.description":
    "Start tracking your meals to understand your daily nutrition.",
  "dashboard.empty.addFirstFood": "+ Add Your First Food",
  // Quick actions
  "dashboard.quickActions.aria": "Quick actions",
  "dashboard.quickActions.addFood": "Add Food",
  "dashboard.quickActions.addWater": "Add Water",
  "dashboard.quickActions.workout": "Workout",
  "dashboard.quickActions.foodDiary": "Food Diary",
  // Meals section
  "dashboard.meals.aria": "Today's meals",
  "dashboard.meals.titleToday": "Today's Meals",
  "dashboard.meals.title": "Meals",
  "dashboard.meals.add": "Add",
  "dashboard.meals.nothingLogged": "Nothing logged yet.",
  "dashboard.meals.addFoodTo": "Add food to {slot}",
  "dashboard.meals.defaultServing": "1 serving",
  "dashboard.meals.macroInline": "P{protein}g C{carbs}g F{fat}g",
  "dashboard.meals.removeItem": "Remove {name}",
  // Daily habit tiles
  "dashboard.habits.aria": "Daily habits",
  "dashboard.habit.water": "Water",
  "dashboard.habit.workout": "Workout",
  "dashboard.habit.sleep": "Sleep",
  "dashboard.habit.workoutCountLogged": "{n} logged",
  "dashboard.habit.planned": "Planned",
  "dashboard.habit.notLogged": "Not logged",
  "dashboard.habit.complete": "Complete",
  "dashboard.habit.logWorkout": "Log workout",
  "dashboard.habit.logSleep": "Log sleep",
  "dashboard.habit.logWater": "Log water",
  // Workout plan completion dialog
  "dashboard.planDialog.title": "Complete Workout Plan",
  "dashboard.planDialog.description":
    "Select the exercises and set counts you finished today.",
  "dashboard.planDialog.plannedSummary":
    "{min} min planned · {kcal} kcal planned",
  "dashboard.planDialog.plannedTime": "Planned: {sets} sets × {time}s",
  "dashboard.planDialog.plannedReps": "Planned: {sets} sets × {reps} reps",
  "dashboard.planDialog.setsDone": "Sets done",
  "dashboard.planDialog.secondsPerSet": "Seconds/set",
  "dashboard.planDialog.repsPerSet": "Reps/set",
  "dashboard.planDialog.saving": "Saving...",
  "dashboard.planDialog.save": "Save Completed Workout",
  // Toasts
  "dashboard.toast.itemRemoved": "Item removed",
  "dashboard.toast.removeItemFailed": "Failed to remove item",
  "dashboard.toast.workoutPlanCompleted": "{title} completed",
  "dashboard.toast.completeWorkoutFailed": "Failed to complete workout plan",
};

export const dashboardBn: Record<string, string> = {
  // Onboarding gate
  "dashboard.onboarding.welcome": "{app}-এ স্বাগতম",
  "dashboard.onboarding.description":
    "আপনার ড্যাশবোর্ড ব্যবহার করতে অনুগ্রহ করে প্রোফাইল অনবোর্ডিং সম্পন্ন করুন।",
  "dashboard.onboarding.start": "অনবোর্ডিং শুরু করুন",
  // Page header
  "dashboard.header.titleToday": "আজকের পুষ্টি",
  "dashboard.header.titleOther": "পুষ্টি · {day}",
  "dashboard.header.prevDay": "আগের দিন",
  "dashboard.header.nextDay": "পরের দিন",
  "dashboard.header.today": "আজ",
  // Nutrition summary
  "dashboard.nutrition.calories": "ক্যালোরি",
  "dashboard.nutrition.protein": "প্রোটিন",
  "dashboard.nutrition.carbs": "কার্বস",
  "dashboard.nutrition.fat": "ফ্যাট",
  "dashboard.nutrition.fiber": "ফাইবার",
  // Meal slots
  "dashboard.meal.breakfast": "সকালের নাশতা",
  "dashboard.meal.lunch": "দুপুরের খাবার",
  "dashboard.meal.dinner": "রাতের খাবার",
  "dashboard.meal.snacks": "স্ন্যাকস",
  // Empty state
  "dashboard.empty.noFoodToday": "আপনি আজ কোনো খাবার লগ করেননি",
  "dashboard.empty.noFoodDay": "এই দিনে কোনো খাবার লগ করা হয়নি",
  "dashboard.empty.description":
    "আপনার দৈনিক পুষ্টি বুঝতে খাবার ট্র্যাক করা শুরু করুন।",
  "dashboard.empty.addFirstFood": "+ প্রথম খাবার যোগ করুন",
  // Quick actions
  "dashboard.quickActions.aria": "দ্রুত কাজ",
  "dashboard.quickActions.addFood": "খাবার যোগ করুন",
  "dashboard.quickActions.addWater": "পানি যোগ করুন",
  "dashboard.quickActions.workout": "ওয়ার্কআউট",
  "dashboard.quickActions.foodDiary": "খাবারের ডায়েরি",
  // Meals section
  "dashboard.meals.aria": "আজকের খাবার",
  "dashboard.meals.titleToday": "আজকের খাবার",
  "dashboard.meals.title": "খাবার",
  "dashboard.meals.add": "যোগ করুন",
  "dashboard.meals.nothingLogged": "এখনো কিছু লগ করা হয়নি।",
  "dashboard.meals.addFoodTo": "{slot}-এ খাবার যোগ করুন",
  "dashboard.meals.defaultServing": "১ সার্ভিং",
  "dashboard.meals.macroInline": "প্রো{protein}g কার্ব{carbs}g চর্বি{fat}g",
  "dashboard.meals.removeItem": "{name} মুছুন",
  // Daily habit tiles
  "dashboard.habits.aria": "দৈনিক অভ্যাস",
  "dashboard.habit.water": "পানি",
  "dashboard.habit.workout": "ওয়ার্কআউট",
  "dashboard.habit.sleep": "ঘুম",
  "dashboard.habit.workoutCountLogged": "{n} টি লগ করা হয়েছে",
  "dashboard.habit.planned": "পরিকল্পিত",
  "dashboard.habit.notLogged": "লগ করা হয়নি",
  "dashboard.habit.complete": "সম্পন্ন করুন",
  "dashboard.habit.logWorkout": "ওয়ার্কআউট লগ করুন",
  "dashboard.habit.logSleep": "ঘুম লগ করুন",
  "dashboard.habit.logWater": "পানি লগ করুন",
  // Workout plan completion dialog
  "dashboard.planDialog.title": "ওয়ার্কআউট প্ল্যান সম্পন্ন করুন",
  "dashboard.planDialog.description":
    "আজ আপনি যে ব্যায়ামগুলো ও কত সেট শেষ করেছেন তা নির্বাচন করুন।",
  "dashboard.planDialog.plannedSummary":
    "{min} মিনিট পরিকল্পিত · {kcal} কিলোক্যালরি পরিকল্পিত",
  "dashboard.planDialog.plannedTime": "পরিকল্পিত: {sets} সেট × {time} সেকেন্ড",
  "dashboard.planDialog.plannedReps": "পরিকল্পিত: {sets} সেট × {reps} রেপ",
  "dashboard.planDialog.setsDone": "সম্পন্ন সেট",
  "dashboard.planDialog.secondsPerSet": "সেকেন্ড/সেট",
  "dashboard.planDialog.repsPerSet": "রেপ/সেট",
  "dashboard.planDialog.saving": "সংরক্ষণ হচ্ছে...",
  "dashboard.planDialog.save": "সম্পন্ন ওয়ার্কআউট সংরক্ষণ করুন",
  // Toasts
  "dashboard.toast.itemRemoved": "আইটেম মুছে ফেলা হয়েছে",
  "dashboard.toast.removeItemFailed": "আইটেম মুছতে ব্যর্থ হয়েছে",
  "dashboard.toast.workoutPlanCompleted": "{title} সম্পন্ন হয়েছে",
  "dashboard.toast.completeWorkoutFailed":
    "ওয়ার্কআউট প্ল্যান সম্পন্ন করতে ব্যর্থ হয়েছে",
};
