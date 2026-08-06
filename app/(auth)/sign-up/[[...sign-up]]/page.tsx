import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a Free FitOS Account",
  description:
    "Create your free FitOS account to track workouts, calories, macros, water, sleep, body measurements and fitness calculator results.",
  alternates: {
    canonical: "/sign-up",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  return (
    <SignUp />
  );
}
