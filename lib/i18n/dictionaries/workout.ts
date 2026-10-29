/** Workout page (app/(root)/workout/page.tsx) dictionary. */

export const workoutEn: Record<string, string> = {
  // Page header
  "workout.title": "Workout Tracker",
  "workout.subtitle":
    "Log routines, track personal records, and build muscle consistency",
  // Stat cards
  "workout.stats.prs.title": "Personal Records (PRs)",
  "workout.stats.prs.subtitle": "Unique exercises with PR records",
  "workout.stats.sessions.title": "Workouts Last 30 Days",
  "workout.stats.sessions.subtitle": "Total sessions completed",
  "workout.stats.calories.title": "Est. Calories Burned",
  "workout.stats.calories.subtitle": "Past 30 days total",
  // Actions
  "workout.actions.quickAdd": "Quick Add Workout",
  "workout.actions.addDay": "Add Day",
  "workout.actions.estimating": "Estimating...",
  "workout.actions.savePlan": "Save Plan",
  "workout.actions.saving": "Saving",
  "workout.actions.savingDots": "Saving...",
  "workout.actions.complete": "Complete",
  "workout.actions.removeDay": "Remove day",
  "workout.actions.removeExercise": "Remove exercise",
  "workout.actions.addExercise": "Add Exercise",
  "workout.actions.addSet": "Add Set",
  "workout.actions.saveCompleted": "Save Completed Workout",
  "workout.actions.saveSession": "Save Workout Session 🎉",
  "workout.actions.editPlan": "Edit Plan",
  "workout.actions.cancelEdit": "Cancel",
  "workout.actions.deleteWorkout": "Delete workout",
  // Today's workout
  "workout.today.badge": "Today's Workout",
  "workout.today.subtitle":
    "Check off what you did and adjust sets or reps. Unchecked exercises are skipped.",
  "workout.today.restTitle": "Rest Day",
  "workout.today.restDescription":
    "No workout is planned for today. Create a weekly plan to get a ready-made checklist here.",
  "workout.today.progress": "{done}/{total} done",
  "workout.today.progressLabel": "Progress",
  "workout.today.save": "Save Today's Workout",
  "workout.today.reset": "Reset",
  "workout.today.createPlan": "Create Weekly Plan",
  "workout.today.selectAtLeastOne": "Select at least one completed exercise",
  "workout.today.saved": "Today's workout saved 💪",
  "workout.today.showDetails": "Show exercises",
  "workout.today.hideDetails": "Hide exercises",
  // Plan view
  "workout.plan.heading": "Your Weekly Workout Plan",
  "workout.plan.description":
    "Your weekly training split. Tap the pencil on any day to change its exercises, sets, or reps, and drag the handle to reorder them.",
  "workout.plan.empty": "No weekly plan yet",
  "workout.plan.emptyHint":
    "Tap Add Day or pick a template to build your weekly split in a minute.",
  // Weekly builder
  "workout.builder.badge": "Weekly Workout Builder",
  "workout.builder.heading": "Create your daily workout templates",
  "workout.builder.description":
    "Pick the weekdays you train, add exercise names, sets, and reps. AI estimates calories so the dashboard can show the right workout button on the right day.",
  "workout.builder.restDay": "Rest day",
  "workout.builder.templates": "Start from a template",
  "workout.builder.templatesConfirm":
    "This replaces your current weekly plan. Continue?",
  "workout.builder.dragHint": "Drag to reorder",
  "workout.builder.nameRequired": "Workout name is required",
  // Templates
  "workout.template.fullBody3": "3-Day Full Body",
  "workout.template.upperLower4": "4-Day Upper Lower",
  "workout.template.ppl6": "6-Day PPL",
  // Workout types
  "workout.type.push": "Push Day (Chest, Shoulders, Triceps)",
  "workout.type.pull": "Pull Day (Back, Biceps)",
  "workout.type.legs": "Leg Day (Quads, Hamstrings, Calves)",
  "workout.type.upper": "Upper Body",
  "workout.type.lower": "Lower Body",
  "workout.type.fullBody": "Full Body Workout",
  "workout.type.cardio": "Cardio & Endurance",
  "workout.type.custom": "Custom Routine",
  // Weekdays
  "workout.weekday.0": "Sunday",
  "workout.weekday.1": "Monday",
  "workout.weekday.2": "Tuesday",
  "workout.weekday.3": "Wednesday",
  "workout.weekday.4": "Thursday",
  "workout.weekday.5": "Friday",
  "workout.weekday.6": "Saturday",
  "workout.weekdayShort.0": "Sun",
  "workout.weekdayShort.1": "Mon",
  "workout.weekdayShort.2": "Tue",
  "workout.weekdayShort.3": "Wed",
  "workout.weekdayShort.4": "Thu",
  "workout.weekdayShort.5": "Fri",
  "workout.weekdayShort.6": "Sat",
  // Form labels & placeholders
  "workout.form.trainingDay": "Training Day",
  "workout.form.workoutName": "Workout Name",
  "workout.form.exercise": "Exercise",
  "workout.form.mode": "Mode",
  "workout.form.workoutNamePlaceholder": "e.g. Push Day / Upper Strength",
  "workout.form.planExercisePlaceholder": "Workout name",
  "workout.form.exerciseNamePlaceholder": "Exercise Name (e.g. Squat, Plank)",
  "workout.form.reps": "Reps",
  "workout.form.time": "Time",
  "workout.form.sets": "Sets",
  "workout.form.seconds": "Seconds",
  "workout.form.minutes": "Minutes",
  "workout.form.minShort": "min",
  "workout.form.secShort": "sec",
  "workout.form.duration": "Duration",
  "workout.form.title": "Workout Title",
  "workout.form.titlePlaceholder": "e.g. Chest & Triceps Blast",
  "workout.form.routineType": "Routine Type",
  "workout.form.exercisesAndSets": "Exercises & Sets",
  "workout.form.set": "Set {number}",
  "workout.form.setsDone": "Sets done",
  "workout.form.secondsPerSet": "Seconds/set",
  "workout.form.repsPerSet": "Reps/set",
  "workout.form.weightKg": "Weight (kg)",
  "workout.form.weightShort": "kg",
  // Personal records
  "workout.prs.heading": "Top Personal Records (PRs)",
  "workout.prs.logged": "Logged: {date}",
  "workout.prs.add": "Add PR",
  "workout.prs.addTitle": "Add Personal Record",
  "workout.prs.addDescription":
    "Log a best lift manually. It is merged with records detected from your workouts.",
  "workout.prs.field.exercise": "Exercise",
  "workout.prs.field.exercisePlaceholder": "e.g. Bench Press",
  "workout.prs.field.date": "Date",
  "workout.prs.manual": "Manual",
  "workout.prs.delete": "Delete personal record",
  "workout.prs.empty":
    "No personal records yet. Complete workouts with weights, or add one manually.",
  "workout.prs.invalid": "Enter an exercise, weight, and reps",
  "workout.prs.added": "Personal record added",
  "workout.prs.addFailed": "Failed to add personal record",
  "workout.prs.deleted": "Personal record deleted",
  "workout.prs.deleteFailed": "Failed to delete personal record",
  // History
  "workout.history.heading": "Recent Workout History",
  // Empty state
  "workout.empty.title": "No Workouts Logged Yet",
  "workout.empty.description":
    "Start logging your routines to track sets, reps, and PRs.",
  "workout.empty.action": "Log Your First Workout",
  // Completion dialog
  "workout.completion.title": "Complete Template Workout",
  "workout.completion.description":
    "Select what you completed today. Calories update from the completed work only.",
  "workout.completion.planned":
    "{duration} min planned · {calories} kcal planned",
  "workout.completion.plannedSets": "Planned: {sets} sets × {detail}",
  // Quick add dialog
  "workout.quickAdd.title": "Quick Add Workout",
  "workout.quickAdd.description":
    "Add workout names, sets, and reps. Calories are estimated automatically.",
  // Toasts
  "workout.toast.planSaved": "Workout plan saved",
  "workout.toast.planSaveFailed": "Failed to save workout plan",
  "workout.toast.dayCompleted": "{title} completed",
  "workout.toast.dayCompleteFailed": "Failed to complete workout plan",
  "workout.toast.logged": "Workout logged successfully! 💪",
  "workout.toast.logFailed": "Failed to log workout",
  "workout.toast.deleted": "Workout deleted",
  "workout.toast.deleteFailed": "Failed to delete workout",
  // Ads
  "workout.ad.sponsored": "Sponsored",
};

export const workoutBn: Record<string, string> = {
  // Page header
  "workout.title": "ওয়ার্কআউট ট্র্যাকার",
  "workout.subtitle":
    "রুটিন লগ করুন, ব্যক্তিগত রেকর্ড ট্র্যাক করুন এবং নিয়মিত মাসল-বিল্ডিং বজায় রাখুন",
  // Stat cards
  "workout.stats.prs.title": "ব্যক্তিগত রেকর্ড (PR)",
  "workout.stats.prs.subtitle": "PR রেকর্ডসহ অনন্য ব্যায়াম",
  "workout.stats.sessions.title": "গত ৩০ দিনের ওয়ার্কআউট",
  "workout.stats.sessions.subtitle": "মোট সম্পন্ন সেশন",
  "workout.stats.calories.title": "আনুমানিক ক্যালোরি বার্ন",
  "workout.stats.calories.subtitle": "গত ৩০ দিনের মোট",
  // Actions
  "workout.actions.quickAdd": "দ্রুত ওয়ার্কআউট যোগ করুন",
  "workout.actions.addDay": "দিন যোগ করুন",
  "workout.actions.estimating": "হিসাব করা হচ্ছে...",
  "workout.actions.savePlan": "প্ল্যান সংরক্ষণ করুন",
  "workout.actions.saving": "সংরক্ষণ হচ্ছে",
  "workout.actions.savingDots": "সংরক্ষণ হচ্ছে...",
  "workout.actions.complete": "সম্পন্ন করুন",
  "workout.actions.removeDay": "দিন মুছুন",
  "workout.actions.removeExercise": "ব্যায়াম মুছুন",
  "workout.actions.addExercise": "ব্যায়াম যোগ করুন",
  "workout.actions.addSet": "সেট যোগ করুন",
  "workout.actions.saveCompleted": "সম্পন্ন ওয়ার্কআউট সংরক্ষণ করুন",
  "workout.actions.saveSession": "ওয়ার্কআউট সেশন সংরক্ষণ করুন 🎉",
  "workout.actions.editPlan": "প্ল্যান সম্পাদনা",
  "workout.actions.cancelEdit": "বাতিল",
  "workout.actions.deleteWorkout": "ওয়ার্কআউট মুছুন",
  // Today's workout
  "workout.today.badge": "আজকের ওয়ার্কআউট",
  "workout.today.subtitle":
    "আপনি যা করেছেন তা টিক দিন এবং সেট বা রেপ ঠিক করুন। টিক না দেওয়া ব্যায়াম বাদ যাবে।",
  "workout.today.restTitle": "বিশ্রামের দিন",
  "workout.today.restDescription":
    "আজকের জন্য কোনো ওয়ার্কআউট পরিকল্পনা নেই। এখানে রেডিমেড চেকলিস্ট পেতে একটি সাপ্তাহিক প্ল্যান তৈরি করুন।",
  "workout.today.progress": "{done}/{total} সম্পন্ন",
  "workout.today.progressLabel": "অগ্রগতি",
  "workout.today.save": "আজকের ওয়ার্কআউট সংরক্ষণ করুন",
  "workout.today.reset": "রিসেট",
  "workout.today.createPlan": "সাপ্তাহিক প্ল্যান তৈরি করুন",
  "workout.today.selectAtLeastOne":
    "কমপক্ষে একটি সম্পন্ন ব্যায়াম নির্বাচন করুন",
  "workout.today.saved": "আজকের ওয়ার্কআউট সংরক্ষিত হয়েছে 💪",
  "workout.today.showDetails": "ব্যায়াম দেখুন",
  "workout.today.hideDetails": "ব্যায়াম লুকান",
  // Plan view
  "workout.plan.heading": "আপনার সাপ্তাহিক ওয়ার্কআউট প্ল্যান",
  "workout.plan.description":
    "আপনার সাপ্তাহিক ট্রেনিং স্প্লিট। যেকোনো দিনের পেন্সিলে ট্যাপ করে ব্যায়াম, সেট বা রেপ পরিবর্তন করুন, আর হ্যান্ডেল টেনে তাদের ক্রম বদলান।",
  "workout.plan.empty": "এখনো কোনো সাপ্তাহিক প্ল্যান নেই",
  "workout.plan.emptyHint":
    "দিন যোগ করুন চেপে বা একটি টেমপ্লেট বেছে নিয়ে এক মিনিটে আপনার সাপ্তাহিক স্প্লিট তৈরি করুন।",
  // Weekly builder
  "workout.builder.badge": "সাপ্তাহিক ওয়ার্কআউট বিল্ডার",
  "workout.builder.heading": "আপনার দৈনিক ওয়ার্কআউট টেমপ্লেট তৈরি করুন",
  "workout.builder.description":
    "আপনি কোন দিনগুলোতে ট্রেনিং করেন সেগুলো বেছে নিন, তারপর ব্যায়ামের নাম, সেট ও রেপ যোগ করুন। এআই ক্যালোরি হিসাব করে, যাতে ড্যাশবোর্ড সঠিক দিনে সঠিক ওয়ার্কআউট বাটন দেখাতে পারে।",
  "workout.builder.restDay": "বিশ্রামের দিন",
  "workout.builder.templates": "টেমপ্লেট থেকে শুরু করুন",
  "workout.builder.templatesConfirm":
    "এটি আপনার বর্তমান সাপ্তাহিক প্ল্যান মুছে ফেলবে। চালিয়ে যাবেন?",
  "workout.builder.dragHint": "ক্রম পরিবর্তনে টেনে আনুন",
  "workout.builder.nameRequired": "ওয়ার্কআউটের নাম প্রয়োজন",
  // Templates
  "workout.template.fullBody3": "৩ দিনের ফুল বডি",
  "workout.template.upperLower4": "৪ দিনের আপার লোয়ার",
  "workout.template.ppl6": "৬ দিনের PPL",
  // Workout types
  "workout.type.push": "পুশ ডে (বুক, কাঁধ, ট্রাইসেপ)",
  "workout.type.pull": "পুল ডে (ব্যাক, বাইসেপ)",
  "workout.type.legs": "লেগ ডে (কোয়াডস, হ্যামস্ট্রিং, কাফ)",
  "workout.type.upper": "আপার বডি",
  "workout.type.lower": "লোয়ার বডি",
  "workout.type.fullBody": "ফুল বডি ওয়ার্কআউট",
  "workout.type.cardio": "কার্ডিও ও এন্ডুরেন্স",
  "workout.type.custom": "কাস্টম রুটিন",
  // Weekdays
  "workout.weekday.0": "রবিবার",
  "workout.weekday.1": "সোমবার",
  "workout.weekday.2": "মঙ্গলবার",
  "workout.weekday.3": "বুধবার",
  "workout.weekday.4": "বৃহস্পতিবার",
  "workout.weekday.5": "শুক্রবার",
  "workout.weekday.6": "শনিবার",
  "workout.weekdayShort.0": "রবি",
  "workout.weekdayShort.1": "সোম",
  "workout.weekdayShort.2": "মঙ্গল",
  "workout.weekdayShort.3": "বুধ",
  "workout.weekdayShort.4": "বৃহ",
  "workout.weekdayShort.5": "শুক্র",
  "workout.weekdayShort.6": "শনি",
  // Form labels & placeholders
  "workout.form.trainingDay": "ট্রেনিং ডে",
  "workout.form.workoutName": "ওয়ার্কআউটের নাম",
  "workout.form.exercise": "ব্যায়াম",
  "workout.form.mode": "ধরন",
  "workout.form.workoutNamePlaceholder": "যেমন: পুশ ডে / আপার স্ট্রেংথ",
  "workout.form.planExercisePlaceholder": "ওয়ার্কআউটের নাম",
  "workout.form.exerciseNamePlaceholder":
    "ব্যায়ামের নাম (যেমন: স্কোয়াট, প্ল্যাঙ্ক)",
  "workout.form.reps": "রেপ",
  "workout.form.time": "সময়",
  "workout.form.sets": "সেট",
  "workout.form.seconds": "সেকেন্ড",
  "workout.form.minutes": "মিনিট",
  "workout.form.minShort": "মিনিট",
  "workout.form.secShort": "সেকেন্ড",
  "workout.form.duration": "সময়কাল",
  "workout.form.title": "ওয়ার্কআউটের শিরোনাম",
  "workout.form.titlePlaceholder": "যেমন: চেস্ট ও ট্রাইসেপ ব্লাস্ট",
  "workout.form.routineType": "রুটিনের ধরন",
  "workout.form.exercisesAndSets": "ব্যায়াম ও সেট",
  "workout.form.set": "সেট {number}",
  "workout.form.setsDone": "সম্পন্ন সেট",
  "workout.form.secondsPerSet": "সেকেন্ড/সেট",
  "workout.form.repsPerSet": "রেপ/সেট",
  "workout.form.weightKg": "ওজন (কেজি)",
  "workout.form.weightShort": "কেজি",
  // Personal records
  "workout.prs.heading": "শীর্ষ ব্যক্তিগত রেকর্ড (PR)",
  "workout.prs.logged": "লগ করা: {date}",
  "workout.prs.add": "PR যোগ করুন",
  "workout.prs.addTitle": "ব্যক্তিগত রেকর্ড যোগ করুন",
  "workout.prs.addDescription":
    "সরাসরি আপনার সেরা লিফট লগ করুন। এটি ওয়ার্কআউট থেকে শনাক্ত করা রেকর্ডের সাথে মিলিয়ে দেখানো হবে।",
  "workout.prs.field.exercise": "ব্যায়াম",
  "workout.prs.field.exercisePlaceholder": "যেমন: বেঞ্চ প্রেস",
  "workout.prs.field.date": "তারিখ",
  "workout.prs.manual": "ম্যানুয়াল",
  "workout.prs.delete": "ব্যক্তিগত রেকর্ড মুছুন",
  "workout.prs.empty":
    "এখনো কোনো ব্যক্তিগত রেকর্ড নেই। ওজনসহ ওয়ার্কআউট সম্পন্ন করুন, অথবা ম্যানুয়ালি একটি যোগ করুন।",
  "workout.prs.invalid": "ব্যায়াম, ওজন ও রেপ লিখুন",
  "workout.prs.added": "ব্যক্তিগত রেকর্ড যোগ হয়েছে",
  "workout.prs.addFailed": "ব্যক্তিগত রেকর্ড যোগ করা যায়নি",
  "workout.prs.deleted": "ব্যক্তিগত রেকর্ড মুছে ফেলা হয়েছে",
  "workout.prs.deleteFailed": "ব্যক্তিগত রেকর্ড মুছে ফেলা যায়নি",
  // History
  "workout.history.heading": "সাম্প্রতিক ওয়ার্কআউট ইতিহাস",
  // Empty state
  "workout.empty.title": "এখনো কোনো ওয়ার্কআউট লগ করা হয়নি",
  "workout.empty.description":
    "সেট, রেপ ও PR ট্র্যাক করতে আপনার রুটিন লগ করা শুরু করুন।",
  "workout.empty.action": "আপনার প্রথম ওয়ার্কআউট লগ করুন",
  // Completion dialog
  "workout.completion.title": "টেমপ্লেট ওয়ার্কআউট সম্পন্ন করুন",
  "workout.completion.description":
    "আজ আপনি কী সম্পন্ন করেছেন তা নির্বাচন করুন। শুধু সম্পন্ন করা কাজ থেকেই ক্যালোরি হিসাব হবে।",
  "workout.completion.planned":
    "{duration} min পরিকল্পিত · {calories} kcal পরিকল্পিত",
  "workout.completion.plannedSets": "পরিকল্পিত: {sets} সেট × {detail}",
  // Quick add dialog
  "workout.quickAdd.title": "দ্রুত ওয়ার্কআউট যোগ করুন",
  "workout.quickAdd.description":
    "ওয়ার্কআউটের নাম, সেট ও রেপ যোগ করুন। ক্যালোরি স্বয়ংক্রিয়ভাবে হিসাব করা হয়।",
  // Toasts
  "workout.toast.planSaved":
    "ওয়ার্কআউট প্ল্যান সংরক্ষিত হয়েছে",
  "workout.toast.planSaveFailed": "ওয়ার্কআউট প্ল্যান সংরক্ষণ করা যায়নি",
  "workout.toast.dayCompleted": "{title} সম্পন্ন হয়েছে",
  "workout.toast.dayCompleteFailed": "ওয়ার্কআউট প্ল্যান সম্পন্ন করা যায়নি",
  "workout.toast.logged": "ওয়ার্কআউট সফলভাবে লগ হয়েছে! 💪",
  "workout.toast.logFailed": "ওয়ার্কআউট লগ করা যায়নি",
  "workout.toast.deleted": "ওয়ার্কআউট মুছে ফেলা হয়েছে",
  "workout.toast.deleteFailed": "ওয়ার্কআউট মুছে ফেলা যায়নি",
  // Ads
  "workout.ad.sponsored": "স্পনসর্ড",
};
