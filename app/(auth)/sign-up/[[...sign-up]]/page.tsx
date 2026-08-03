import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignUp
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
        elements: {
          rootBox: "w-full",
          card: "w-full shadow-none !border-none !bg-transparent",
        },
      }}
    />
  );
}
