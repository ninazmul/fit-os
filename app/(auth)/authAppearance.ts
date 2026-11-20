export const authAppearance = {
  variables: {
    colorPrimary: "hsl(152, 58%, 42%)",
    colorDanger: "hsl(0, 84%, 60%)",
    colorWarning: "hsl(38, 92%, 50%)",
    colorSuccess: "hsl(152, 58%, 42%)",
    borderRadius: "1rem",
    fontFamily: "inherit",
    fontSize: "0.875rem",
  },
  elements: {
    // ── Structure: make Clerk's card transparent so it blends into our glass container ──
    rootBox: "w-full max-w-full",
    cardBox: "w-full max-w-full shadow-none border-none bg-transparent",
    card: "w-full max-w-full shadow-none border-none bg-transparent",

    // ── Header ──
    headerTitle: "text-xl font-black tracking-tight",
    headerSubtitle: "text-sm mt-1 leading-relaxed opacity-70",

    // ── Social login buttons ──
    socialButtonsBlockButton:
      "rounded-2xl border py-2.5 font-semibold text-sm transition-all",
    socialButtonsBlockButtonText: "font-semibold text-sm",

    // ── Form fields ──
    formFieldLabel: "text-xs font-semibold mb-1",
    formFieldInput: "rounded-xl text-sm py-2.5 px-3 transition-all",

    // ── Primary CTA ──
    formButtonPrimary:
      "rounded-2xl font-bold text-sm py-3 shadow-md transition-all active:scale-[0.99]",

    // ── Links & actions ──
    footerActionLink: "font-semibold transition-colors",
    identityPreviewEditButton: "font-semibold transition-colors",
    formFieldAction: "text-xs font-semibold transition-colors",

    // ── OTP ──
    otpCodeFieldInput: "rounded-xl text-base font-bold",

    // ── Divider ──
    dividerLine: "opacity-40",
    dividerText: "text-[10px] font-black uppercase tracking-wider opacity-60",

    // ── Footer ──
    footer: "bg-transparent opacity-70 text-xs",
  },
};
