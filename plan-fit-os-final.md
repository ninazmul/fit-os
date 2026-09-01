# NutriBD Product Roadmap – Final Approved Version (Product Advisor Approved)

**Plan created:** /Users/n.i.nazmul/Documents/Working Files/nutribd/.trae/documents/plan-nutribd-product-roadmap-final-2026-08-06.md

**Summary**  
Product advisor fully approved the revised roadmap with 3 strategic changes + 2 new high-priority features (Adaptive Goals, Smart Weight Prediction, Daily Score). Updated Quick Add as absolute center of the app. Dashboard keeps all 6 cards but adds hero "Today's Mission". Saved Meals prioritized over AI. Added adaptive goals, weight prediction, daily score, categorized Bangladeshi foods, barcode scanner. Vision statement added. Mobile-first only. All changes solve retention and daily decision-making.

**Current State Analysis**  
Mobile-first Next.js PWA (Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Clerk auth, MongoDB/Mongoose).  
- BottomNav: Dashboard / Diet / Workout / Progress / Profile  
- OnboardingModal: 2-step goal calculation  
- Dashboard: 6 StatCards + ProgressRing + charts + recent meals  
- Meal logging: SearchModal + diet page (basic repeat)  
- Bangladeshi foods: 20+ home-cooked items in public/foods.ts  
- PWA manifest + offline support  
- Private dashboard, no adaptive goals, no weight prediction, no daily score, no categorized food DB, no barcode scanner, no saved meal templates, no time-aware dashboard, no Quick Add FAB.

**Proposed Changes**  

**Phase 1: Immediate (Highest ROI – 2-3 weeks)**  
- **Today's Mission (Hero Section)** (⭐⭐⭐⭐⭐): Keep all 6 StatCards but add hero above them answering "What do I need to do today?" with quick actions. *How:* Update `app/(root)/page.tsx` + `lib/actions/dashboard.actions.ts` to render hero + keep cards.  
- **Quick Add as Center of the App** (⭐⭐⭐⭐⭐): Make + FAB the fastest interaction (Recent Foods / 100g / Done). *How:* New QuickAdd component in BottomNav + diet page.  
- **Saved Meals & Meal Templates** (⭐⭐⭐⭐⭐): Breakfast, Lunch, Iftar, Gym Meal, Cheat Meal, Office Lunch – one-tap log. *How:* New SavedMeals model + quick-add in diet.  
- **Smart Empty States** (⭐⭐⭐⭐): Actionable buttons when no data. *How:* Add empty-state handling.  
- **Adaptive Goals** (⭐⭐⭐⭐⭐): Recalculate calories/protein/water when weight changes (e.g. "Lost 6kg – new target 1810"). *How:* Update profile model + calculations in health-calculations.ts + dashboard.  
- **Smart Weight Prediction** (⭐⭐⭐⭐): Show current pace, estimated goal date, "You're on track!" *How:* Add to dashboard + lib/health-calculations.ts.  
- **Daily Score** (⭐⭐⭐⭐⭐): Single "Today's Score 87/100" with checkmarks + "Excellent". *How:* Add to dashboard.  
- **Categorized Bangladeshi Foods** (⭐⭐⭐⭐): Categories – Home Cooking, Fast Food, Drinks, Fruits, Street Food, Traditional, Restaurant. *How:* Update public/foods.ts + SearchModal sections.  
- **Barcode Scanner** (⭐⭐⭐⭐): Scan milk, bread, protein powder, juice, biscuits. *How:* New barcode scanner in diet page.

**Phase 2: Growth (4-6 weeks)**  
- **Personalized Daily Coach** (⭐⭐⭐⭐): One daily message.  
- **Weekly Summary** (Every Sunday).  
- **Dynamic Dashboard by Time of Day**.  
- **Better Analytics** (Weekly Health Score, Protein Consistency).

**Phase 3: Premium-Quality (2 months)**  
- AI Meal Photo Estimation.  
- AI Weekly Coaching.  
- Offline Sync Improvements.

**Phase 4: Future Vision (3+ months)**  
- Social Sharing.  
- Friend Challenges.  
- Community Features.  
- Leaderboards.

**Assumptions & Decisions**  
- Preserve current visual identity (rounded-xl, glass-card, primary colors).  
- Mobile-first only (no desktop redesign).  
- Bangladesh first, South Asia later.  
- Gamification = consistency badges only (no XP levels).  
- No social features until enough daily active users.  
- Every feature must reduce friction and encourage daily use.  
- Vision statement: "NutriBD is not a calorie tracker. NutriBD is a Personal Fitness Operating System that helps users make better health decisions every day through simple, fast, mobile-first experiences."

**Verification Steps**  
- Read this plan file first.  
- Test Quick Add <5s, onboarding <60s, adaptive goals.  
- Verify Today's Mission hero + Daily Score clarity.  
- Check Day 7 retention after Phase 1.  
- Run `npm run build` and test on mobile.

**Next Step**  
Review and approve Phase 1 implementation. This version is now final and aligned with the vision statement. Ready for code changes.