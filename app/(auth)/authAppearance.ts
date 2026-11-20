export const authAppearance = {
  variables: {
    colorPrimary: "#15bf59",
    colorText: "#1F2937",
    colorTextSecondary: "#6B7280",
    borderRadius: "1rem",
    fontFamily: "inherit",
  },
  elements: {
    rootBox: "w-full max-w-full flex justify-center",
    cardBox: "!w-full !max-w-full !shadow-none !border-0 !bg-transparent",
    card: "!w-full !max-w-full !shadow-none !border-0 !bg-transparent !p-0",
    header: "text-center pb-2",
    headerTitle: "text-xl sm:text-2xl font-black tracking-tight text-foreground",
    headerSubtitle: "text-xs text-muted-foreground mt-1 leading-relaxed",
    socialButtonsBlockButton:
      "rounded-2xl border border-border/70 bg-card hover:bg-muted text-foreground font-bold text-xs py-2.5 transition-all shadow-xs",
    socialButtonsBlockButtonText: "text-foreground font-bold text-xs",
    formFieldLabel: "text-foreground text-xs font-bold mb-1",
    formFieldInput:
      "rounded-2xl border border-border/80 bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs py-2.5 px-3 transition-all",
    formButtonPrimary:
      "rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-black text-xs py-3 shadow-md shadow-primary/25 transition-all active:scale-[0.99]",
    footerActionLink: "text-primary hover:text-primary/80 font-bold transition-colors",
    identityPreviewEditButton: "text-primary hover:text-primary/80 transition-colors font-bold",
    formFieldAction: "text-primary hover:text-primary/80 transition-colors text-xs font-bold",
    otpCodeFieldInput:
      "rounded-2xl border border-border/80 bg-background text-foreground focus:border-primary focus:ring-primary text-base font-bold",
    dividerLine: "bg-border/60",
    dividerText: "text-muted-foreground text-[10px] font-black uppercase tracking-wider",
    footer: "!bg-transparent text-muted-foreground text-xs",
  },
};

