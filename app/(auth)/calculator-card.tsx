import Link from "next/link";
import { ArrowRight, Calculator, CheckCircle2 } from "lucide-react";

type CalculatorCardProps = {
  title: string;
  description: string;
};

export default function CalculatorCard({
  title,
  description,
}: CalculatorCardProps) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Calculator className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-black tracking-tight text-foreground font-sans">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-5 space-y-2 text-xs font-semibold text-primary">
        {[
          "Free online fitness calculators",
          "BMI, BMR, TDEE, body fat and ideal weight",
          "Optional free account for daily tracking",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <Link
        href="/sign-up"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90"
      >
        Start Tracking Free <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href="#calc"
        className="mt-3 flex w-full items-center justify-center rounded-full border border-border/80 px-4 py-3 text-sm font-bold text-foreground transition-all hover:bg-muted"
      >
        Use Calculator
      </Link>
    </div>
  );
}
