export const authAppearance = {
  variables: {
    colorPrimary: "hsl(var(--primary))",
    colorText: "#1F2937",
    colorTextSecondary: "#6B7580",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#1F2937",
    borderRadius: "0.75rem",
  },
  elements: {
    cardBox: "shadow-none border border-[#E1E7DD] rounded-xl",
    card: "shadow-none rounded-xl",
    headerTitle: "text-[#1F2937]",
    headerSubtitle: "text-[#6B7580]",
    socialButtonsBlockButton:
      "border-[#DDE6D9] text-[#37414A] hover:border-primary/40 hover:bg-primary/5",
    formFieldInput:
      "rounded-xl border-[#DDE6D9] focus:border-primary focus:ring-primary",
    formButtonPrimary:
      "rounded-xl bg-primary text-primary-foreground hover:bg-primary/90",
    footerActionLink: "text-primary hover:text-primary/90",
    identityPreviewEditButton: "text-primary hover:text-primary/90",
    formFieldAction: "text-primary hover:text-primary/90",
    otpCodeFieldInput:
      "rounded-xl border-[#DDE6D9] focus:border-primary focus:ring-primary",
    dividerLine: "bg-[#E1E7DD]",
    dividerText: "text-[#6B7580]",
  },
};
