import CalculatorCard from "../calculator-card";
import { buildPublicPageMetadata } from "@/lib/seo";

export const metadata = buildPublicPageMetadata("/body-fat-calculator");

export default function Page() {
  return (
    <CalculatorCard
      title="Free Body Fat Calculator"
      description="Estimate body fat percentage from neck, waist and hip measurements using the U.S. Navy body fat formula."
    />
  );
}
