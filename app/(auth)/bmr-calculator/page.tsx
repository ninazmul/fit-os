import CalculatorCard from "../calculator-card";
import { buildPublicPageMetadata } from "@/lib/seo";

export const metadata = buildPublicPageMetadata("/bmr-calculator");

export default function Page() {
  return (
    <CalculatorCard
      title="Free BMR Calculator"
      description="Estimate your basal metabolic rate using age, gender, height and weight, then plan daily calories and macros in FitOS."
    />
  );
}
