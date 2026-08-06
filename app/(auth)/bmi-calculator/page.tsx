import CalculatorCard from "../calculator-card";
import { buildPublicPageMetadata } from "@/lib/seo";

export const metadata = buildPublicPageMetadata("/bmi-calculator");

export default function Page() {
  return (
    <CalculatorCard
      title="Free BMI Calculator"
      description="Enter height and weight to calculate Body Mass Index, check your BMI category and compare against a healthy BMI range."
    />
  );
}
