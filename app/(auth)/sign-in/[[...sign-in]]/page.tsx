import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignIn
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
