/** Progress page (app/(root)/progress/page.tsx) dictionary. */

export const progressEn: Record<string, string> = {
  // Page header
  "progress.title": "Progress & Body Analytics",
  "progress.subtitle":
    "AI-powered weight trajectory, body recomposition, and sleep recovery analysis",
  "progress.actions.analysing": "Analysing…",
  "progress.actions.refreshAudit": "✨ Refresh AI Audit",
  "progress.actions.logWeight": "Log Weight",
  "progress.actions.logMeasurements": "Log Measurements",
  "progress.actions.addSleep": "Add Sleep Session",

  // Goal trajectory card
  "progress.trajectory.title": "Goal Trajectory",
  "progress.trajectory.plateauRisk": "{risk} Plateau Risk",
  "progress.trajectory.perWeek": "/week",
  "progress.trajectory.estimatedGoal": "Est. goal in",
  "progress.trajectory.daysUnit": "days",
  "progress.trajectory.confidence": "Gemini AI · {pct}% confidence",

  // Body recomposition card
  "progress.recomposition.title": "Body Recomposition",
  "progress.recomposition.waist": "Waist",
  "progress.recomposition.chest": "Chest",
  "progress.recomposition.hip": "Hip",
  "progress.recomposition.muscleRetention": "Muscle Retention Score",

  // Recovery index card
  "progress.recovery.title": "Recovery Index",
  "progress.recovery.scoreLabel": "Recovery Score",

  // Milestones
  "progress.milestones.title": "Goal Milestones",
  "progress.milestones.now": "Now: {value}",
  "progress.milestones.target": "Target: {value}",
  "progress.milestones.est": "Est: {value}",

  // Top stat cards
  "progress.stats.currentWeight": "Current Weight",
  "progress.stats.goal": "Goal: {weight} kg",
  "progress.stats.bmi": "BMI",
  "progress.stats.weeklyChange": "Weekly Change",
  "progress.stats.past7": "Past 7 days",
  "progress.stats.monthlyChange": "Monthly Change",
  "progress.stats.past30": "Past 30 days",

  // BMI categories
  "progress.bmi.underweight": "Underweight",
  "progress.bmi.normal": "Normal Weight ✅",
  "progress.bmi.overweight": "Overweight",

  // Tabs
  "progress.tabs.weight": "Weight Trend",
  "progress.tabs.body": "Body Measurements",
  "progress.tabs.sleep": "Sleep Log",

  // Weight tab
  "progress.weight.journeyTitle": "Weight Journey",
  "progress.weight.chartTitle": "Weight over time (kg)",
  "progress.weight.chartTarget": "Target {weight} kg",
  "progress.weight.chartSeriesLabel": "Weight",
  "progress.weight.areaName": "Weight (kg)",
  "progress.weight.historyTitle": "Log History",
  "progress.weight.entries": "{count} entries",

  // Progress-to-goal card
  "progress.goal.progressTitle": "Progress to Goal",
  "progress.goal.reached": "🎉 Goal Reached!",
  "progress.goal.complete": "{pct}% complete",
  "progress.goal.start": "Start",
  "progress.goal.now": "Now",
  "progress.goal.target": "Target",
  "progress.goal.lost": "Lost {value} kg",
  "progress.goal.gained": "Gained {value} kg",
  "progress.goal.toLose": "to lose",
  "progress.goal.toGain": "to gain",
  "progress.goal.milestone": "{pct}% milestone",

  // History table
  "progress.table.date": "Date",
  "progress.table.weight": "Weight",
  "progress.table.change": "Change",
  "progress.table.vsTarget": "vs Target",
  "progress.table.notes": "Notes",
  "progress.table.same": "same",
  "progress.table.start": "start",
  "progress.table.onTarget": "✓ On target",

  // Body measurements tab
  "progress.body.title": "Body Circumferences",
  "progress.measure.waist": "Waist",
  "progress.measure.chest": "Chest",
  "progress.measure.hip": "Hip",
  "progress.measure.arm": "Arm",
  "progress.measure.thigh": "Thigh",

  // Sleep tab
  "progress.sleep.title": "Sleep Tracker History",
  "progress.sleep.barName": "Sleep (hours)",
  "progress.sleep.empty":
    "No sleep logs yet. Add a sleep session to start tracking! 🌙",
  "progress.sleep.totalHours": "{hours}h total",
  "progress.sleep.sessionsSingular": "{count} session",
  "progress.sleep.sessionsPlural": "{count} sessions",
  "progress.sleep.avgQuality": "· Avg quality {value}/5",
  "progress.sleep.removeTitle": "Remove this session",

  // Weight dialog
  "progress.weightDialog.title": "Log Today's Weight ⚖️",
  "progress.weightDialog.weightLabel": "Weight (kg)",
  "progress.weightDialog.weightPlaceholder": "e.g. 72.5",
  "progress.weightDialog.notesPlaceholder": "e.g. After morning workout",
  "progress.weightDialog.save": "Save Weight",

  // Sleep dialog
  "progress.sleepDialog.title": "Add Sleep Session 🌙",
  "progress.sleepDialog.description":
    "Log overnight sleep, naps, or any rest period. Multiple sessions per day supported.",
  "progress.sleepDialog.sleepTime": "Sleep Time",
  "progress.sleepDialog.wakeTime": "Wake Time",
  "progress.sleepDialog.totalHours": "Total Hours (auto-calculated)",
  "progress.sleepDialog.quality": "Quality Rating (1-5)",
  "progress.sleepDialog.notesPlaceholder":
    "e.g. Nap, deep sleep, woke up tired...",
  "progress.sleepDialog.save": "Save Sleep Session",

  // Shared field label
  "progress.notesOptional": "Notes (optional)",

  // Ads
  "progress.ad.sponsored": "Sponsored",

  // Toasts
  "progress.toast.weightLogged": "Weight logged!",
  "progress.toast.weightLogFailed": "Failed to log weight",
  "progress.toast.sleepLogged": "Sleep session logged! 🌙",
  "progress.toast.sleepSaveFailed": "Failed to save sleep session",
  "progress.toast.sessionRemoved": "Sleep session removed",
  "progress.toast.sessionRemoveFailed": "Failed to remove session",
};

export const progressBn: Record<string, string> = {
  // Page header
  "progress.title": "প্রগ্রেস ও বডি অ্যানালিটিক্স",
  "progress.subtitle":
    "AI-চালিত ওজন পরিবর্তন, বডি রিকম্পোজিশন ও ঘুম রিকভারি বিশ্লেষণ",
  "progress.actions.analysing": "বিশ্লেষণ চলছে…",
  "progress.actions.refreshAudit": "✨ AI অডিট রিফ্রেশ",
  "progress.actions.logWeight": "ওজন লগ করুন",
  "progress.actions.logMeasurements": "মাপ লগ করুন",
  "progress.actions.addSleep": "ঘুমের সেশন যোগ করুন",

  // Goal trajectory card
  "progress.trajectory.title": "লক্ষ্যের গতিপথ",
  "progress.trajectory.plateauRisk": "{risk} প্লেটো ঝুঁকি",
  "progress.trajectory.perWeek": "/সপ্তাহ",
  "progress.trajectory.estimatedGoal": "লক্ষ্যে পৌঁছানোর আনুমানিক সময়",
  "progress.trajectory.daysUnit": "দিন",
  "progress.trajectory.confidence": "Gemini AI · {pct}% নিশ্চয়তা",

  // Body recomposition card
  "progress.recomposition.title": "বডি রিকম্পোজিশন",
  "progress.recomposition.waist": "কোমর",
  "progress.recomposition.chest": "বুক",
  "progress.recomposition.hip": "নিতম্ব",
  "progress.recomposition.muscleRetention": "মাসল রিটেনশন স্কোর",

  // Recovery index card
  "progress.recovery.title": "রিকভারি ইনডেক্স",
  "progress.recovery.scoreLabel": "রিকভারি স্কোর",

  // Milestones
  "progress.milestones.title": "লক্ষ্যের মাইলস্টোন",
  "progress.milestones.now": "এখন: {value}",
  "progress.milestones.target": "লক্ষ্য: {value}",
  "progress.milestones.est": "আনুমানিক: {value}",

  // Top stat cards
  "progress.stats.currentWeight": "বর্তমান ওজন",
  "progress.stats.goal": "লক্ষ্য: {weight} kg",
  "progress.stats.bmi": "BMI",
  "progress.stats.weeklyChange": "সাপ্তাহিক পরিবর্তন",
  "progress.stats.past7": "গত ৭ দিন",
  "progress.stats.monthlyChange": "মাসিক পরিবর্তন",
  "progress.stats.past30": "গত ৩০ দিন",

  // BMI categories
  "progress.bmi.underweight": "কম ওজন",
  "progress.bmi.normal": "স্বাভাবিক ওজন ✅",
  "progress.bmi.overweight": "অতিরিক্ত ওজন",

  // Tabs
  "progress.tabs.weight": "ওজনের ধারা",
  "progress.tabs.body": "শরীরের মাপ",
  "progress.tabs.sleep": "ঘুমের লগ",

  // Weight tab
  "progress.weight.journeyTitle": "ওজন যাত্রা",
  "progress.weight.chartTitle": "সময়ের সাথে ওজন (kg)",
  "progress.weight.chartTarget": "লক্ষ্য {weight} kg",
  "progress.weight.chartSeriesLabel": "ওজন",
  "progress.weight.areaName": "ওজন (kg)",
  "progress.weight.historyTitle": "লগ ইতিহাস",
  "progress.weight.entries": "{count}টি এন্ট্রি",

  // Progress-to-goal card
  "progress.goal.progressTitle": "লক্ষ্যের অগ্রগতি",
  "progress.goal.reached": "🎉 লক্ষ্য অর্জিত!",
  "progress.goal.complete": "{pct}% সম্পন্ন",
  "progress.goal.start": "শুরু",
  "progress.goal.now": "এখন",
  "progress.goal.target": "লক্ষ্য",
  "progress.goal.lost": "{value} kg কমেছে",
  "progress.goal.gained": "{value} kg বেড়েছে",
  "progress.goal.toLose": "কমাতে হবে",
  "progress.goal.toGain": "বাড়াতে হবে",
  "progress.goal.milestone": "{pct}% মাইলস্টোন",

  // History table
  "progress.table.date": "তারিখ",
  "progress.table.weight": "ওজন",
  "progress.table.change": "পরিবর্তন",
  "progress.table.vsTarget": "লক্ষ্যের তুলনায়",
  "progress.table.notes": "নোট",
  "progress.table.same": "একই",
  "progress.table.start": "শুরু",
  "progress.table.onTarget": "✓ লক্ষ্যে",

  // Body measurements tab
  "progress.body.title": "শরীরের পরিধি",
  "progress.measure.waist": "কোমর",
  "progress.measure.chest": "বুক",
  "progress.measure.hip": "নিতম্ব",
  "progress.measure.arm": "বাহু",
  "progress.measure.thigh": "উরু",

  // Sleep tab
  "progress.sleep.title": "ঘুম ট্র্যাকার ইতিহাস",
  "progress.sleep.barName": "ঘুম (ঘণ্টা)",
  "progress.sleep.empty":
    "এখনও কোনো ঘুমের লগ নেই। ট্র্যাকিং শুরু করতে একটি ঘুমের সেশন যোগ করুন! 🌙",
  "progress.sleep.totalHours": "{hours}h মোট",
  "progress.sleep.sessionsSingular": "{count} সেশন",
  "progress.sleep.sessionsPlural": "{count} সেশন",
  "progress.sleep.avgQuality": "· গড় গুণমান {value}/5",
  "progress.sleep.removeTitle": "এই সেশনটি মুছুন",

  // Weight dialog
  "progress.weightDialog.title": "আজকের ওজন লগ করুন ⚖️",
  "progress.weightDialog.weightLabel": "ওজন (kg)",
  "progress.weightDialog.weightPlaceholder": "যেমন 72.5",
  "progress.weightDialog.notesPlaceholder": "যেমন সকালের ওয়ার্কআউটের পরে",
  "progress.weightDialog.save": "ওজন সংরক্ষণ",

  // Sleep dialog
  "progress.sleepDialog.title": "ঘুমের সেশন যোগ করুন 🌙",
  "progress.sleepDialog.description":
    "রাতের ঘুম, ঝিমুনি বা যেকোনো বিশ্রামের সময় লগ করুন। দিনে একাধিক সেশন সমর্থিত।",
  "progress.sleepDialog.sleepTime": "ঘুমানোর সময়",
  "progress.sleepDialog.wakeTime": "ঘুম থেকে ওঠার সময়",
  "progress.sleepDialog.totalHours": "মোট ঘণ্টা (স্বয়ংক্রিয় হিসাব)",
  "progress.sleepDialog.quality": "গুণমান রেটিং (১-৫)",
  "progress.sleepDialog.notesPlaceholder":
    "যেমন ঝিমুনি, গভীর ঘুম, ক্লান্তি নিয়ে উঠেছি...",
  "progress.sleepDialog.save": "ঘুমের সেশন সংরক্ষণ",

  // Shared field label
  "progress.notesOptional": "নোট (ঐচ্ছিক)",

  // Ads
  "progress.ad.sponsored": "স্পনসরড",

  // Toasts
  "progress.toast.weightLogged": "ওজন লগ হয়েছে!",
  "progress.toast.weightLogFailed": "ওজন লগ করা যায়নি",
  "progress.toast.sleepLogged": "ঘুমের সেশন লগ হয়েছে! 🌙",
  "progress.toast.sleepSaveFailed": "ঘুমের সেশন সংরক্ষণ করা যায়নি",
  "progress.toast.sessionRemoved": "ঘুমের সেশন মুছে ফেলা হয়েছে",
  "progress.toast.sessionRemoveFailed": "সেশন মুছে ফেলা যায়নি",
};
