import CalculatorCard from "../calculator-card";
import { buildPublicPageMetadata } from "@/lib/seo";
import { APP_NAME } from "@/lib/constants";

export const metadata = buildPublicPageMetadata("/fitness-calculator");

export default function Page() {
  return (
    <CalculatorCard
      title="Free Fitness Calculator"
      description={`Calculate BMI, BMR, TDEE, body fat percentage and ideal weight, then use ${APP_NAME} to track calories, macros, workouts and body progress.`}
    />
  );
}
