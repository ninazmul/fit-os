import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { authAppearance } from "../../authAppearance";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Create a Free ${APP_NAME} Account`,
  description:
    `Create your free ${APP_NAME} account to track workouts, calories, macros, water, sleep, body measurements and fitness calculator results.`,
  alternates: {
    canonical: "/sign-up",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  return <SignUp appearance={authAppearance} />;
}
