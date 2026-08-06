import CalculatorCard from "../calculator-card";
import { buildPublicPageMetadata } from "@/lib/seo";

export const metadata = buildPublicPageMetadata("/fitness-calculator");

export default function Page() {
  return (
    <CalculatorCard
      title="Free Fitness Calculator"
      description="Calculate BMI, BMR, TDEE, body fat percentage and ideal weight, then use FitOS to track calories, macros, workouts and body progress."
    />
  );
}
