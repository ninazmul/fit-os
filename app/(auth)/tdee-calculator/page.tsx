import CalculatorCard from "../calculator-card";
import { buildPublicPageMetadata } from "@/lib/seo";

export const metadata = buildPublicPageMetadata("/tdee-calculator");

export default function Page() {
  return (
    <CalculatorCard
      title="Free TDEE Calculator"
      description="Calculate total daily energy expenditure, maintenance calories and target calories for weight loss or muscle gain."
    />
  );
}
