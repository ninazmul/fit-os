/** Calculator pages & components dictionary. */

export const calculatorsEn: Record<string, string> = {
  // Header
  "calculator.header.badge": "Free Fitness Calculators",
  "calculator.header.title": "Calculate Your BMI, BMR, TDEE & Body Fat",
  "calculator.header.description":
    "Use our free online fitness calculators to find your Body Mass Index (BMI), Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE), Body Fat Percentage, and Ideal Weight — powered by scientifically validated formulas.",

  // Tabs
  "calculator.tab.bmi": "BMI",
  "calculator.tab.bmr": "BMR",
  "calculator.tab.tdee": "TDEE",
  "calculator.tab.bodyfat": "Body Fat %",
  "calculator.tab.idealweight": "Ideal Weight",

  // Form labels
  "calculator.form.gender": "Gender",
  "calculator.form.age": "Age (years)",
  "calculator.form.height": "Height (cm)",
  "calculator.form.weight": "Weight (kg)",
  "calculator.form.neck": "Neck (cm)",
  "calculator.form.waist": "Waist (cm)",
  "calculator.form.hip": "Hip (cm)",
  "calculator.form.activity": "Activity Level",

  // Gender options
  "calculator.gender.male": "♂ Male",
  "calculator.gender.female": "♀ Female",

  // Placeholders
  "calculator.placeholder.age": "e.g. 25",
  "calculator.placeholder.height": "e.g. 170",
  "calculator.placeholder.weight": "e.g. 70",
  "calculator.placeholder.neck": "e.g. 38",
  "calculator.placeholder.waist": "e.g. 82",
  "calculator.placeholder.hip": "e.g. 96",

  // Activity levels
  "calculator.activity.sedentary": "Sedentary (office job, little exercise)",
  "calculator.activity.light": "Lightly Active (1-3 days/week)",
  "calculator.activity.moderate": "Moderately Active (3-5 days/week)",
  "calculator.activity.very": "Very Active (6-7 days/week)",
  "calculator.activity.extra": "Extra Active (athlete / physical job)",

  // Actions
  "calculator.button.calculate": "Calculate {name}",

  // Units
  "calculator.unit.caloriesPerDay": "calories/day",
  "calculator.unit.kcalPerDay": "kcal/day",

  // BMI result
  "calculator.bmi.result.yourBmi": "Your BMI",
  "calculator.bmi.result.healthyRange": "Healthy BMI Range:",
  "calculator.bmi.result.idealWeight": "Ideal Weight for your height:",

  // BMI categories
  "calculator.bmi.category.severeThinness": "Severe Thinness",
  "calculator.bmi.category.moderateThinness": "Moderate Thinness",
  "calculator.bmi.category.mildThinness": "Mild Thinness",
  "calculator.bmi.category.normal": "Normal Weight ✅",
  "calculator.bmi.category.overweight": "Overweight",
  "calculator.bmi.category.obese1": "Obese Class I",
  "calculator.bmi.category.obese2": "Obese Class II",
  "calculator.bmi.category.obese3": "Obese Class III",

  // BMR result
  "calculator.bmr.result.label": "Basal Metabolic Rate",
  "calculator.bmr.result.description":
    "— This is how many calories your body burns at complete rest (just to keep organs functioning). Formula: Mifflin-St Jeor.",

  // TDEE result
  "calculator.tdee.weightLoss": "Weight Loss",
  "calculator.tdee.maintenance": "Maintenance",
  "calculator.tdee.weightGain": "Weight Gain",
  "calculator.tdee.result.bmrPrefix": "Your BMR is",
  "calculator.tdee.result.bmrSuffix":
    ". TDEE = BMR × Activity Factor. Uses the Mifflin-St Jeor equation.",

  // Body fat result
  "calculator.bodyfat.result.label": "Body Fat Percentage",
  "calculator.bodyfat.result.leanMass": "Lean Mass",
  "calculator.bodyfat.result.fatMass": "Fat Mass",
  "calculator.bodyfat.result.descriptionPrefix": "Calculated using the",
  "calculator.bodyfat.result.formula": "U.S. Navy Body Fat Formula",
  "calculator.bodyfat.result.descriptionSuffix": ".",

  // Body fat categories
  "calculator.bodyfat.category.essentialFat": "Essential Fat",
  "calculator.bodyfat.category.athletic": "Athletic",
  "calculator.bodyfat.category.fitness": "Fitness",
  "calculator.bodyfat.category.average": "Average",
  "calculator.bodyfat.category.aboveAverage": "Above Average",

  // Ideal weight result
  "calculator.idealweight.result.title":
    "Ideal Weight Estimates for Your Height",

  // CTA
  "calculator.cta.prefix": "Sign up for",
  "calculator.cta.suffix":
    "to track these metrics daily with personalized AI insights.",

  // SEO content — BMI
  "calculator.seo.bmi.title": "What is BMI (Body Mass Index)?",
  "calculator.seo.bmi.body1":
    "BMI is a simple screening tool that measures body fat based on your height and weight. The formula is:",
  "calculator.seo.bmi.formula": "BMI = weight (kg) ÷ height² (m²)",
  "calculator.seo.bmi.body2":
    ". A healthy BMI range is 18.5–24.9. BMI is used worldwide by doctors, nutritionists, and fitness professionals to assess whether a person is underweight, normal weight, overweight, or obese.",

  // SEO content — BMR
  "calculator.seo.bmr.title": "What is BMR (Basal Metabolic Rate)?",
  "calculator.seo.bmr.body1":
    "BMR represents the number of calories your body burns at rest — just to keep your heart beating, lungs breathing, and organs functioning. NutriBD uses the",
  "calculator.seo.bmr.formula1": "Mifflin-St Jeor equation",
  "calculator.seo.bmr.body2":
    ", the gold standard recommended by the Academy of Nutrition and Dietetics:",
  "calculator.seo.bmr.formula2":
    "BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161 (female) / + 5 (male)",
  "calculator.seo.bmr.bodySuffix": ".",

  // SEO content — TDEE
  "calculator.seo.tdee.title": "What is TDEE (Total Daily Energy Expenditure)?",
  "calculator.seo.tdee.body":
    "TDEE is the total number of calories you burn per day, including exercise and daily activity. It's calculated by multiplying your BMR by an activity factor. Knowing your TDEE helps you plan calorie intake for weight loss, maintenance, or muscle gain. Eat below TDEE to lose weight, at TDEE to maintain, or above TDEE to bulk.",

  // SEO content — Body Fat
  "calculator.seo.bodyfat.title": "How is Body Fat Percentage Calculated?",
  "calculator.seo.bodyfat.body1": "NutriBD uses the",
  "calculator.seo.bodyfat.formula": "U.S. Navy Body Fat Formula",
  "calculator.seo.bodyfat.body2":
    ", which estimates body fat percentage from neck, waist, and hip circumference measurements. This method is clinically validated and widely used by military and sports organizations. For men: measurements require neck and waist. For women: neck, waist, and hip measurements are needed.",
  "calculator.seo.bodyfat.bodySuffix": ".",
};

export const calculatorsBn: Record<string, string> = {
  // Header
  "calculator.header.badge": "ফ্রি ফিটনেস ক্যালকুলেটর",
  "calculator.header.title": "আপনার BMI, BMR, TDEE ও বডি ফ্যাট গণনা করুন",
  "calculator.header.description":
    "আমাদের ফ্রি অনলাইন ফিটনেস ক্যালকুলেটর দিয়ে আপনার বডি মাস ইনডেক্স (BMI), বেসাল মেটাবলিক রেট (BMR), টোটাল ডেইলি এনার্জি এক্সপেন্ডিচার (TDEE), বডি ফ্যাট পার্সেন্টেজ এবং আদর্শ ওজন জানুন — বিজ্ঞানসম্মতভাবে যাচাইকৃত ফর্মুলার ভিত্তিতে।",

  // Tabs
  "calculator.tab.bmi": "BMI",
  "calculator.tab.bmr": "BMR",
  "calculator.tab.tdee": "TDEE",
  "calculator.tab.bodyfat": "বডি ফ্যাট %",
  "calculator.tab.idealweight": "আদর্শ ওজন",

  // Form labels
  "calculator.form.gender": "লিঙ্গ",
  "calculator.form.age": "বয়স (years)",
  "calculator.form.height": "উচ্চতা (cm)",
  "calculator.form.weight": "ওজন (kg)",
  "calculator.form.neck": "গলা (cm)",
  "calculator.form.waist": "কোমর (cm)",
  "calculator.form.hip": "নিতম্ব (cm)",
  "calculator.form.activity": "অ্যাক্টিভিটি লেভেল",

  // Gender options
  "calculator.gender.male": "♂ পুরুষ",
  "calculator.gender.female": "♀ মহিলা",

  // Placeholders
  "calculator.placeholder.age": "যেমন 25",
  "calculator.placeholder.height": "যেমন 170",
  "calculator.placeholder.weight": "যেমন 70",
  "calculator.placeholder.neck": "যেমন 38",
  "calculator.placeholder.waist": "যেমন 82",
  "calculator.placeholder.hip": "যেমন 96",

  // Activity levels
  "calculator.activity.sedentary": "সেডেন্টারি (অফিসের কাজ, সামান্য ব্যায়াম)",
  "calculator.activity.light": "সামান্য সক্রিয় (সপ্তাহে ১-৩ দিন)",
  "calculator.activity.moderate": "মাঝারি সক্রিয় (সপ্তাহে ৩-৫ দিন)",
  "calculator.activity.very": "খুব সক্রিয় (সপ্তাহে ৬-৭ দিন)",
  "calculator.activity.extra":
    "অতিরিক্ত সক্রিয় (অ্যাথলিট / শারীরিক পরিশ্রমের কাজ)",

  // Actions
  "calculator.button.calculate": "{name} গণনা করুন",

  // Units
  "calculator.unit.caloriesPerDay": "ক্যালোরি/দিন",
  "calculator.unit.kcalPerDay": "কিলোক্যালরি/দিন",

  // BMI result
  "calculator.bmi.result.yourBmi": "আপনার BMI",
  "calculator.bmi.result.healthyRange": "স্বাস্থ্যকর BMI রেঞ্জ:",
  "calculator.bmi.result.idealWeight": "আপনার উচ্চতার জন্য আদর্শ ওজন:",

  // BMI categories
  "calculator.bmi.category.severeThinness": "অতি তীব্র কম ওজন",
  "calculator.bmi.category.moderateThinness": "মাঝারি কম ওজন",
  "calculator.bmi.category.mildThinness": "সামান্য কম ওজন",
  "calculator.bmi.category.normal": "স্বাভাবিক ওজন ✅",
  "calculator.bmi.category.overweight": "অতিরিক্ত ওজন",
  "calculator.bmi.category.obese1": "স্থূলতা শ্রেণি I",
  "calculator.bmi.category.obese2": "স্থূলতা শ্রেণি II",
  "calculator.bmi.category.obese3": "স্থূলতা শ্রেণি III",

  // BMR result
  "calculator.bmr.result.label": "বেসাল মেটাবলিক রেট",
  "calculator.bmr.result.description":
    "— সম্পূর্ণ বিশ্রামে থাকাকালীন আপনার শরীর ঠিক কত ক্যালোরি পোড়ায় (শুধু অঙ্গ-প্রত্যঙ্গ সচল রাখতে)। ফর্মুলা: Mifflin-St Jeor।",

  // TDEE result
  "calculator.tdee.weightLoss": "ওজন কমানো",
  "calculator.tdee.maintenance": "ওজন ধরে রাখা",
  "calculator.tdee.weightGain": "ওজন বাড়ানো",
  "calculator.tdee.result.bmrPrefix": "আপনার BMR হল",
  "calculator.tdee.result.bmrSuffix":
    "। TDEE = BMR × অ্যাক্টিভিটি ফ্যাক্টর। এটি Mifflin-St Jeor সমীকরণ ব্যবহার করে।",

  // Body fat result
  "calculator.bodyfat.result.label": "বডি ফ্যাট পার্সেন্টেজ",
  "calculator.bodyfat.result.leanMass": "লিন মাস",
  "calculator.bodyfat.result.fatMass": "ফ্যাট মাস",
  "calculator.bodyfat.result.descriptionPrefix": "গণনা করা হয়েছে",
  "calculator.bodyfat.result.formula": "ইউএস নেভি বডি ফ্যাট ফর্মুলা",
  "calculator.bodyfat.result.descriptionSuffix": " দিয়ে।",

  // Body fat categories
  "calculator.bodyfat.category.essentialFat": "অত্যাবশ্যক চর্বি",
  "calculator.bodyfat.category.athletic": "অ্যাথলেটিক",
  "calculator.bodyfat.category.fitness": "ফিটনেস",
  "calculator.bodyfat.category.average": "গড়",
  "calculator.bodyfat.category.aboveAverage": "গড়ের উপরে",

  // Ideal weight result
  "calculator.idealweight.result.title":
    "আপনার উচ্চতার জন্য আদর্শ ওজনের অনুমান",

  // CTA
  "calculator.cta.prefix": "সাইন আপ করুন",
  "calculator.cta.suffix":
    "-এ এই মেট্রিকগুলো প্রতিদিন ট্র্যাক করতে এবং ব্যক্তিগতকৃত এআই ইনসাইট পেতে।",

  // SEO content — BMI
  "calculator.seo.bmi.title": "BMI (বডি মাস ইনডেক্স) কী?",
  "calculator.seo.bmi.body1":
    "BMI হল একটি সহজ স্ক্রিনিং টুল যা আপনার উচ্চতা ও ওজনের ভিত্তিতে শরীরের চর্বি পরিমাপ করে। ফর্মুলাটি হল:",
  "calculator.seo.bmi.formula": "BMI = ওজন (kg) ÷ উচ্চতা² (m²)",
  "calculator.seo.bmi.body2":
    "। স্বাস্থ্যকর BMI রেঞ্জ 18.5–24.9। সারা বিশ্বে ডাক্তার, পুষ্টিবিদ এবং ফিটনেস বিশেষজ্ঞরা BMI ব্যবহার করেন যাতে বোঝা যায় একজন ব্যক্তি কম ওজন, স্বাভাবিক ওজন, অতিরিক্ত ওজন, নাকি স্থূল।",

  // SEO content — BMR
  "calculator.seo.bmr.title": "BMR (বেসাল মেটাবলিক রেট) কী?",
  "calculator.seo.bmr.body1":
    "BMR হল বিশ্রামে থাকাকালীন আপনার শরীর যে পরিমাণ ক্যালোরি পোড়ায় — শুধু হৃদস্পন্দন, শ্বাস-প্রশ্বাস ও অঙ্গ-প্রত্যঙ্গ সচল রাখতে। NutriBD ব্যবহার করে",
  "calculator.seo.bmr.formula1": "Mifflin-St Jeor সমীকরণ",
  "calculator.seo.bmr.body2":
    ", যা অ্যাকাডেমি অফ নিউট্রিশন অ্যান্ড ডায়েটেটিকস কর্তৃক সুপারিশকৃত গোল্ড স্ট্যান্ডার্ড:",
  "calculator.seo.bmr.formula2":
    "BMR = 10 × ওজন(kg) + 6.25 × উচ্চতা(cm) - 5 × বয়স - 161 (মহিলা) / + 5 (পুরুষ)",
  "calculator.seo.bmr.bodySuffix": "।",

  // SEO content — TDEE
  "calculator.seo.tdee.title": "TDEE (টোটাল ডেইলি এনার্জি এক্সপেন্ডিচার) কী?",
  "calculator.seo.tdee.body":
    "TDEE হল প্রতিদিন আপনি যে মোট ক্যালোরি পোড়ান, যার মধ্যে ব্যায়াম ও দৈনন্দিন কার্যক্রমও অন্তর্ভুক্ত। এটি আপনার BMR-কে একটি অ্যাক্টিভিটি ফ্যাক্টর দিয়ে গুণ করে হিসাব করা হয়। আপনার TDEE জানলে ওজন কমানো, ধরে রাখা বা পেশি বাড়ানোর জন্য ক্যালোরি পরিকল্পনা করা সহজ হয়। ওজন কমাতে TDEE-এর নিচে খান, ধরে রাখতে TDEE-এর সমান, আর ওজন বাড়াতে TDEE-এর উপরে খান।",

  // SEO content — Body Fat
  "calculator.seo.bodyfat.title": "বডি ফ্যাট পার্সেন্টেজ কীভাবে হিসাব করা হয়?",
  "calculator.seo.bodyfat.body1": "NutriBD ব্যবহার করে",
  "calculator.seo.bodyfat.formula": "ইউএস নেভি বডি ফ্যাট ফর্মুলা",
  "calculator.seo.bodyfat.body2":
    ", যা গলা, কোমর ও নিতম্বের পরিমাপ থেকে বডি ফ্যাট পার্সেন্টেজ নির্ণয় করে। এই পদ্ধতিটি ক্লিনিক্যালি যাচাইকৃত এবং সামরিক ও ক্রীড়া সংস্থাগুলোতে বহুল ব্যবহৃত। পুরুষদের জন্য: গলা ও কোমরের পরিমাপ প্রয়োজন। মহিলাদের জন্য: গলা, কোমর ও নিতম্বের পরিমাপ প্রয়োজন।",
  "calculator.seo.bodyfat.bodySuffix": "।",
};
