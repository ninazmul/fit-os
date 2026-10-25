/** Diet page (app/(root)/diet/page.tsx) dictionary. */

export const dietEn: Record<string, string> = {
  // Header
  "diet.title": "Diet & Nutrition",
  "diet.subtitle": "Log meals, Bangladeshi dishes, saved templates & barcodes",
  "diet.guide.button": "Guide",
  "diet.guide.open": "Open User Guide",
  "diet.date.prev": "Previous day",
  "diet.date.next": "Next day",

  // Meal types
  "diet.mealType.breakfast": "Breakfast",
  "diet.mealType.lunch": "Lunch",
  "diet.mealType.dinner": "Dinner",
  "diet.mealType.snack": "Snacks",

  // Saved meal templates
  "diet.savedMeals.heading": "Saved Meal Templates ({count})",
  "diet.savedMeals.tapToLog": "Tap to log to {date}",
  "diet.savedMeals.delete": "Delete template",
  "diet.savedMeals.logBreakfast": "+ Breakfast",
  "diet.savedMeals.logLunch": "+ Lunch",

  // Nutrition summary labels
  "diet.nutrition.calories": "Calories",
  "diet.nutrition.protein": "Protein",
  "diet.nutrition.carbs": "Carbs",
  "diet.nutrition.fat": "Fat",
  "diet.nutrition.fiber": "Fiber",

  // Ads
  "diet.ad.sponsored": "Sponsored",

  // Meal sections
  "diet.meal.scanBarcode": "Scan Barcode",
  "diet.meal.itemSingular": "{count} item",
  "diet.meal.itemPlural": "{count} items",
  "diet.meal.loggedSummary": "{items} · {kcal} kcal",
  "diet.meal.noneLogged": "0 kcal logged",
  "diet.meal.saveTemplate": "Save Template",
  "diet.meal.clear": "Clear",
  "diet.meal.addFood": "Add Food",
  "diet.meal.removeItemTitle": "Remove this item",
  "diet.meal.removeItemAria": "Remove {name}",
  "diet.meal.emptyFor": "No foods logged for {meal} yet.",

  // Add food modal
  "diet.addModal.title": "Add Food to {meal}",
  "diet.addModal.description":
    "Search Bangladeshi & global dishes, shared community foods, or create custom food.",
  "diet.addModal.searchPlaceholder": "Search food (e.g. Polao, Kacchi, Dal)...",
  "diet.addModal.customButton": "+ Custom",
  "diet.addModal.badgeCommunity": "Community",
  "diet.addModal.badgeMyCustom": "My Custom",
  "diet.addModal.editTitle": "Edit my custom food",
  "diet.addModal.editAria": "Edit {name}",
  "diet.addModal.deleteTitle": "Delete my custom food",
  "diet.addModal.deleteAria": "Delete {name}",

  // Portion calculator
  "diet.portion.title": "Portion Calculator",
  "diet.portion.multiplier": "🔢 Multiplier",
  "diet.portion.grams": "⚖️ Grams",
  "diet.portion.base": "Base:",
  "diet.portion.qty": "Qty:",
  "diet.portion.xServing": "{count}x serving",
  "diet.portion.amountLabel": "Amount I ate (grams / ml):",
  "diet.portion.amountPlaceholder": "e.g. 200",
  "diet.portion.full": "Full ({grams}g)",
  "diet.portion.addTo": "Add to {meal} →",

  // Custom food modal
  "diet.customFood.titleEdit": "Edit Custom Food ✏️",
  "diet.customFood.titleCreate": "Custom Food & AI Recipe 🍳",
  "diet.customFood.description":
    "Describe your food in one field — AI will calculate macros and fill all required fields automatically.",
  "diet.customFood.tabAi": "AI Auto-Fill",
  "diet.customFood.tabManual": "Manual Entry",
  "diet.customFood.guidance":
    "Fill in what you know — the more detail, the more accurate the result. Tuned for Bangladeshi home cooking (katori/bati, thala, jhol, bhuna, bhorta).",
  "diet.customFood.quickStart": "Quick Start:",
  "diet.customFood.optional": "(optional)",

  // AI quick-start presets
  "diet.preset.chickenCurry": "🍗 Chicken Curry & Rice",
  "diet.preset.dalRiceBhorta": "🍚 Dal, Rice & Bhorta",
  "diet.preset.ilishBhapa": "🐟 Ilish Bhapa & Rice",
  "diet.preset.omeletteParatha": "🍳 Omelette & Paratha",
  "diet.preset.beefBhuna": "🥩 Beef Bhuna",

  // AI guided form fields
  "diet.ai.field1": "Dish / Recipe",
  "diet.ai.field1Placeholder":
    "e.g. Homemade chicken curry (murgir jhol) with potato, eaten with white rice",
  "diet.ai.field2": "Ingredients & Quantities",
  "diet.ai.field2Placeholder":
    "e.g. 500g chicken, 2 potatoes, 1 onion, 2 tbsp mustard oil",
  "diet.ai.field3": "Cooking Method",
  "diet.ai.field3Placeholder":
    "e.g. Pressure-cooked jhol / bhuna / deep fried / boiled",
  "diet.ai.field4": "Total Cooked",
  "diet.ai.field4Placeholder": "e.g. 750g total or 4 servings",
  "diet.ai.field5": "Portion You Ate",
  "diet.ai.field5Placeholder": "e.g. 150g / 1 katori / half / 1 of 4",
  "diet.ai.tipBefore": "Tip: Press",
  "diet.ai.tipAfter": "to analyze",
  "diet.ai.analyzing": "AI is analyzing & filling fields...",
  "diet.ai.analyzeButton": "✨ Analyze with AI & Fill Fields",
  "diet.ai.resultTitle": "Required Fields Filled Below ✨",
  "diet.ai.resultPortion": "{percent}% portion",
  "diet.ai.detected": "Detected Ingredients & Raw Values:",

  // Custom food form
  "diet.customFood.reviewLabelAi": "Review & Finalize Food Entry:",
  "diet.customFood.reviewLabelManual": "Custom Food Details:",
  "diet.customFood.foodName": "Food Name",
  "diet.customFood.foodNamePlaceholder": "e.g. Homemade Chicken Curry (150g)",
  "diet.customFood.servingSize": "Serving Size (Base)",
  "diet.customFood.servingPlaceholder": "e.g. 100g or 1 portion (150g)",
  "diet.customFood.calories": "Calories (kcal)",
  "diet.customFood.proteinG": "Protein (g)",
  "diet.customFood.carbsG": "Carbs (g)",
  "diet.customFood.fatG": "Fat (g)",
  "diet.customFood.fiberG": "Fiber (g)",
  "diet.customFood.portionTestBefore": "If eaten portion is",
  "diet.customFood.portionTestAfter": ":",
  "diet.customFood.portionResult": "{kcal} kcal · {grams} g Protein",
  "diet.customFood.submitUpdate": "Update Custom Food",
  "diet.customFood.submitCreate": "Save Custom Food 🍳",

  // Save template dialog
  "diet.saveTemplate.title": "Save Meal as Template",
  "diet.saveTemplate.nameLabel": "Template Name",
  "diet.saveTemplate.namePlaceholder": "e.g. Daily Gym Breakfast, Office Lunch",
  "diet.saveTemplate.category": "Category",
  "diet.saveTemplate.catBreakfast": "Breakfast",
  "diet.saveTemplate.catLunch": "Lunch",
  "diet.saveTemplate.catDinner": "Dinner",
  "diet.saveTemplate.catIftar": "Iftar",
  "diet.saveTemplate.catGymMeal": "Gym Meal",
  "diet.saveTemplate.catOfficeLunch": "Office Lunch",
  "diet.saveTemplate.catCheatMeal": "Cheat Meal",
  "diet.saveTemplate.catCustom": "Custom",
  "diet.saveTemplate.itemsHeading": "Items in Template ({count})",
  "diet.saveTemplate.submit": "Save Template 🔖",
  "diet.saveTemplate.defaultName": "{meal} Template",

  // Toasts
  "diet.toast.selectFood": "Please select a food item",
  "diet.toast.foodAdded": "Added {food} ({kcal} kcal) to {meal}! 🥗",
  "diet.toast.addFailed": "Failed to add meal",
  "diet.toast.onlyEditOwn": "You can only edit custom foods you created.",
  "diet.toast.onlyDeleteOwn": "You can only delete custom foods you created.",
  "diet.toast.confirmDelete":
    "Are you sure you want to delete this custom food?",
  "diet.toast.customDeleted": "Custom food deleted!",
  "diet.toast.customDeleteFailed": "Failed to delete custom food",
  "diet.toast.needDescription": "Please describe the food or recipe first.",
  "diet.toast.aiSuccess":
    "AI calculated macros & filled the required fields! ✨",
  "diet.toast.aiFailed": "Failed to calculate with AI. Please check inputs.",
  "diet.toast.customUpdated": "Custom food updated!",
  "diet.toast.customCreated": "Custom food created!",
  "diet.toast.updateFailed": "Failed to update food",
  "diet.toast.createFailed": "Failed to create food",
  "diet.toast.templateLogged": "Logged saved meal template to {meal}! ⚡",
  "diet.toast.templateLogFailed": "Failed to log saved meal template",
  "diet.toast.templateSaved": 'Saved template "{name}"! 🔖',
  "diet.toast.templateSaveFailed": "Failed to save meal template",
  "diet.toast.templateRemoved": "Saved meal template removed",
  "diet.toast.templateRemoveFailed": "Failed to remove template",
  "diet.toast.mealCleared": "Meal cleared",
  "diet.toast.mealDeleteFailed": "Failed to delete meal",
  "diet.toast.itemRemoved": "Item removed",
  "diet.toast.itemRemoveFailed": "Failed to remove item",
};

export const dietBn: Record<string, string> = {
  // Header
  "diet.title": "ডায়েট ও পুষ্টি",
  "diet.subtitle": "খাবার, বাংলাদেশি পদ, সেভ করা টেমপ্লেট ও বারকোড লগ করুন",
  "diet.guide.button": "গাইড",
  "diet.guide.open": "ব্যবহার নির্দেশিকা খুলুন",
  "diet.date.prev": "আগের দিন",
  "diet.date.next": "পরের দিন",

  // Meal types
  "diet.mealType.breakfast": "সকালের নাশতা",
  "diet.mealType.lunch": "দুপুরের খাবার",
  "diet.mealType.dinner": "রাতের খাবার",
  "diet.mealType.snack": "স্ন্যাকস",

  // Saved meal templates
  "diet.savedMeals.heading": "সেভ করা মিল টেমপ্লেট ({count})",
  "diet.savedMeals.tapToLog": "{date}-এ লগ করতে ট্যাপ করুন",
  "diet.savedMeals.delete": "টেমপ্লেট মুছুন",
  "diet.savedMeals.logBreakfast": "+ সকালের নাশতা",
  "diet.savedMeals.logLunch": "+ দুপুরের খাবার",

  // Nutrition summary labels
  "diet.nutrition.calories": "ক্যালরি",
  "diet.nutrition.protein": "প্রোটিন",
  "diet.nutrition.carbs": "কার্বস",
  "diet.nutrition.fat": "ফ্যাট",
  "diet.nutrition.fiber": "ফাইবার",

  // Ads
  "diet.ad.sponsored": "স্পনসর্ড",

  // Meal sections
  "diet.meal.scanBarcode": "বারকোড স্ক্যান করুন",
  "diet.meal.itemSingular": "{count} আইটেম",
  "diet.meal.itemPlural": "{count} আইটেম",
  "diet.meal.loggedSummary": "{items} · {kcal} kcal",
  "diet.meal.noneLogged": "০ kcal লগ করা হয়নি",
  "diet.meal.saveTemplate": "টেমপ্লেট সেভ করুন",
  "diet.meal.clear": "মুছুন",
  "diet.meal.addFood": "খাবার যোগ করুন",
  "diet.meal.removeItemTitle": "এই আইটেমটি সরান",
  "diet.meal.removeItemAria": "{name} সরান",
  "diet.meal.emptyFor": "{meal}-এর জন্য এখনো কোনো খাবার লগ করা হয়নি।",

  // Add food modal
  "diet.addModal.title": "{meal}-এ খাবার যোগ করুন",
  "diet.addModal.description":
    "বাংলাদেশি ও বৈশ্বিক পদ, কমিউনিটিতে শেয়ার করা খাবার খুঁজুন, অথবা কাস্টম খাবার তৈরি করুন।",
  "diet.addModal.searchPlaceholder":
    "খাবার খুঁজুন (যেমন পোলাও, কাচ্চি, ডাল)...",
  "diet.addModal.customButton": "+ কাস্টম",
  "diet.addModal.badgeCommunity": "কমিউনিটি",
  "diet.addModal.badgeMyCustom": "আমার কাস্টম",
  "diet.addModal.editTitle": "আমার কাস্টম খাবার সম্পাদনা করুন",
  "diet.addModal.editAria": "{name} সম্পাদনা করুন",
  "diet.addModal.deleteTitle": "আমার কাস্টম খাবার মুছুন",
  "diet.addModal.deleteAria": "{name} মুছুন",

  // Portion calculator
  "diet.portion.title": "পোর্শন ক্যালকুলেটর",
  "diet.portion.multiplier": "🔢 মাল্টিপ্লায়ার",
  "diet.portion.grams": "⚖️ গ্রাম",
  "diet.portion.base": "বেস:",
  "diet.portion.qty": "পরিমাণ:",
  "diet.portion.xServing": "{count}x সার্ভিং",
  "diet.portion.amountLabel": "যতটুকু খেয়েছি (গ্রাম / মিলি):",
  "diet.portion.amountPlaceholder": "যেমন ২০০",
  "diet.portion.full": "সম্পূর্ণ ({grams}g)",
  "diet.portion.addTo": "{meal}-এ যোগ করুন →",

  // Custom food modal
  "diet.customFood.titleEdit": "কাস্টম খাবার সম্পাদনা ✏️",
  "diet.customFood.titleCreate": "কাস্টম খাবার ও AI রেসিপি 🍳",
  "diet.customFood.description":
    "একটি ঘরে আপনার খাবার বর্ণনা করুন — AI ম্যাক্রো হিসাব করে সব প্রয়োজনীয় ঘর স্বয়ংক্রিয়ভাবে পূরণ করবে।",
  "diet.customFood.tabAi": "AI অটো-ফিল",
  "diet.customFood.tabManual": "ম্যানুয়াল এন্ট্রি",
  "diet.customFood.guidance":
    "যতটুকু জানেন তা পূরণ করুন — বিস্তারিত দিলে ফলাফল তত নির্ভুল হবে। বাংলাদেশি ঘরোয়া রান্নার (কাটরি/বাটি, থালা, ঝোল, ভুনা, ভর্তা) জন্য উপযোগী।",
  "diet.customFood.quickStart": "কুইক স্টার্ট:",
  "diet.customFood.optional": "(ঐচ্ছিক)",

  // AI quick-start presets
  "diet.preset.chickenCurry": "🍗 মুরগির ঝোল ও ভাত",
  "diet.preset.dalRiceBhorta": "🍚 ডাল, ভাত ও ভর্তা",
  "diet.preset.ilishBhapa": "🐟 ইলিশ ভাপা ও ভাত",
  "diet.preset.omeletteParatha": "🍳 অমলেট ও পরোটা",
  "diet.preset.beefBhuna": "🥩 বিফ ভুনা",

  // AI guided form fields
  "diet.ai.field1": "খাবার / রেসিপি",
  "diet.ai.field1Placeholder":
    "যেমন ঘরে তৈরি মুরগির ঝোল (আলুসহ), সাদা ভাতের সাথে খাওয়া",
  "diet.ai.field2": "উপকরণ ও পরিমাণ",
  "diet.ai.field2Placeholder":
    "যেমন ৫০০ গ্রাম মুরগি, ২টি আলু, ১টি পেঁয়াজ, ২ টেবিল চামচ সরিষার তেল",
  "diet.ai.field3": "রান্নার পদ্ধতি",
  "diet.ai.field3Placeholder":
    "যেমন প্রেসার-কুকারে ঝোল / ভুনা / ডিপ ফ্রাই / সিদ্ধ",
  "diet.ai.field4": "মোট রান্না",
  "diet.ai.field4Placeholder": "যেমন মোট ৭৫০ গ্রাম বা ৪ সার্ভিং",
  "diet.ai.field5": "যতটুকু খেয়েছেন",
  "diet.ai.field5Placeholder": "যেমন ১৫০ গ্রাম / ১ কাটরি / অর্ধেক / ৪-এর ১",
  "diet.ai.tipBefore": "টিপস: চাপুন",
  "diet.ai.tipAfter": "বিশ্লেষণ করতে",
  "diet.ai.analyzing": "AI বিশ্লেষণ করে ঘর পূরণ করছে...",
  "diet.ai.analyzeButton": "✨ AI দিয়ে বিশ্লেষণ করে ঘর পূরণ করুন",
  "diet.ai.resultTitle": "নিচে প্রয়োজনীয় ঘর পূরণ করা হয়েছে ✨",
  "diet.ai.resultPortion": "{percent}% পোর্শন",
  "diet.ai.detected": "শনাক্ত করা উপকরণ ও কাঁচা মান:",

  // Custom food form
  "diet.customFood.reviewLabelAi":
    "খাবারের এন্ট্রি পর্যালোচনা ও চূড়ান্ত করুন:",
  "diet.customFood.reviewLabelManual": "কাস্টম খাবারের বিবরণ:",
  "diet.customFood.foodName": "খাবারের নাম",
  "diet.customFood.foodNamePlaceholder": "যেমন ঘরে তৈরি মুরগির ঝোল (১৫০ গ্রাম)",
  "diet.customFood.servingSize": "সার্ভিং সাইজ (বেস)",
  "diet.customFood.servingPlaceholder":
    "যেমন ১০০ গ্রাম বা ১ পোর্শন (১৫০ গ্রাম)",
  "diet.customFood.calories": "ক্যালরি (kcal)",
  "diet.customFood.proteinG": "প্রোটিন (g)",
  "diet.customFood.carbsG": "কার্বস (g)",
  "diet.customFood.fatG": "ফ্যাট (g)",
  "diet.customFood.fiberG": "ফাইবার (g)",
  "diet.customFood.portionTestBefore": "যদি খাওয়া অংশ হয়",
  "diet.customFood.portionTestAfter": ":",
  "diet.customFood.portionResult": "{kcal} kcal · {grams} g প্রোটিন",
  "diet.customFood.submitUpdate": "কাস্টম খাবার আপডেট করুন",
  "diet.customFood.submitCreate": "কাস্টম খাবার সেভ করুন 🍳",

  // Save template dialog
  "diet.saveTemplate.title": "মিল টেমপ্লেট হিসেবে সেভ করুন",
  "diet.saveTemplate.nameLabel": "টেমপ্লেটের নাম",
  "diet.saveTemplate.namePlaceholder":
    "যেমন প্রতিদিনের জিম নাশতা, অফিসের লাঞ্চ",
  "diet.saveTemplate.category": "ক্যাটাগরি",
  "diet.saveTemplate.catBreakfast": "সকালের নাশতা",
  "diet.saveTemplate.catLunch": "দুপুরের খাবার",
  "diet.saveTemplate.catDinner": "রাতের খাবার",
  "diet.saveTemplate.catIftar": "ইফতার",
  "diet.saveTemplate.catGymMeal": "জিম মিল",
  "diet.saveTemplate.catOfficeLunch": "অফিস লাঞ্চ",
  "diet.saveTemplate.catCheatMeal": "চিট মিল",
  "diet.saveTemplate.catCustom": "কাস্টম",
  "diet.saveTemplate.itemsHeading": "টেমপ্লেটে আইটেম ({count})",
  "diet.saveTemplate.submit": "টেমপ্লেট সেভ করুন 🔖",
  "diet.saveTemplate.defaultName": "{meal} টেমপ্লেট",

  // Toasts
  "diet.toast.selectFood": "অনুগ্রহ করে একটি খাবার নির্বাচন করুন",
  "diet.toast.foodAdded": "{meal}-এ {food} ({kcal} kcal) যোগ করা হয়েছে! 🥗",
  "diet.toast.addFailed": "খাবার যোগ করা যায়নি",
  "diet.toast.onlyEditOwn":
    "আপনি শুধু আপনার তৈরি করা কাস্টম খাবার সম্পাদনা করতে পারেন।",
  "diet.toast.onlyDeleteOwn":
    "আপনি শুধু আপনার তৈরি করা কাস্টম খাবার মুছতে পারেন।",
  "diet.toast.confirmDelete": "আপনি কি নিশ্চিত এই কাস্টম খাবারটি মুছতে চান?",
  "diet.toast.customDeleted": "কাস্টম খাবার মুছে ফেলা হয়েছে!",
  "diet.toast.customDeleteFailed": "কাস্টম খাবার মুছতে ব্যর্থ হয়েছে",
  "diet.toast.needDescription": "আগে খাবার বা রেসিপি বর্ণনা করুন।",
  "diet.toast.aiSuccess":
    "AI ম্যাক্রো হিসাব করে প্রয়োজনীয় ঘরগুলো পূরণ করেছে! ✨",
  "diet.toast.aiFailed": "AI দিয়ে হিসাব করা যায়নি। ইনপুট পরীক্ষা করুন।",
  "diet.toast.customUpdated": "কাস্টম খাবার আপডেট করা হয়েছে!",
  "diet.toast.customCreated": "কাস্টম খাবার তৈরি করা হয়েছে!",
  "diet.toast.updateFailed": "খাবার আপডেট করা যায়নি",
  "diet.toast.createFailed": "খাবার তৈরি করা যায়নি",
  "diet.toast.templateLogged":
    "{meal}-এ সেভ করা মিল টেমপ্লেট লগ করা হয়েছে! ⚡",
  "diet.toast.templateLogFailed": "সেভ করা মিল টেমপ্লেট লগ করা যায়নি",
  "diet.toast.templateSaved": 'টেমপ্লেট "{name}" সেভ করা হয়েছে! 🔖',
  "diet.toast.templateSaveFailed": "মিল টেমপ্লেট সেভ করা যায়নি",
  "diet.toast.templateRemoved": "সেভ করা মিল টেমপ্লেট মুছে ফেলা হয়েছে",
  "diet.toast.templateRemoveFailed": "টেমপ্লেট মুছতে ব্যর্থ হয়েছে",
  "diet.toast.mealCleared": "খাবার মুছে ফেলা হয়েছে",
  "diet.toast.mealDeleteFailed": "খাবার মুছতে ব্যর্থ হয়েছে",
  "diet.toast.itemRemoved": "আইটেম সরানো হয়েছে",
  "diet.toast.itemRemoveFailed": "আইটেম সরাতে ব্যর্থ হয়েছে",
};
