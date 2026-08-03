import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignIn
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
          logoPlacement: "none",
          socialButtonsVariant: "blockButton",
        },
        variables: {
          colorPrimary: "hsl(152 58% 42%)",
          colorText: "hsl(var(--foreground) / <alpha-value>)",
          colorTextSecondary: "hsl(var(--muted-foreground) / <alpha-value>)",
          colorBackground: "transparent",
          colorInputBackground: "hsl(var(--background) / <alpha-value>)",
          colorInputText: "hsl(var(--foreground) / <alpha-value>)",
          colorBorder: "hsl(var(--border) / <alpha-value>)",
          colorNeutral: "hsl(var(--muted) / <alpha-value>)",
          borderRadius: "0.85rem",
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: "0.92rem",
        },
        elements: {
          rootBox: "w-full",
          card: "w-full !shadow-none !border-none !bg-transparent !p-0 md:!p-0",
          headerTitle: "!text-xl md:!text-2xl",
          socialButtonsBlockButton:
            "!rounded-xl !border !transition-colors !min-h-[2.75rem]",
          formButtonPrimary:
            "!rounded-xl !min-h-[2.75rem] !font-semibold !text-sm",
          formFieldInput: "!rounded-xl !min-h-[2.75rem]",
          footer: "!pt-4",
          main: "!px-0 !pt-0",
        },
      }}
    />
  );
}
