export const authAppearance = {
  variables: {
    colorPrimary: "hsl(var(--primary))",
    colorText: "hsl(var(--foreground))",
    colorTextSecondary: "hsl(var(--muted-foreground))",
    colorBackground: "transparent",
    colorInputBackground: "hsl(var(--background))",
    colorInputText: "hsl(var(--foreground))",
    borderRadius: "1rem",
  },
  elements: {
    rootBox: "w-full max-w-full",
    cardBox: "shadow-none border-0 w-full max-w-full bg-transparent p-0",
    card: "shadow-none border-0 w-full max-w-full bg-transparent p-0",
    headerTitle: "text-foreground font-black text-xl tracking-tight",
    headerSubtitle: "text-muted-foreground text-xs leading-relaxed",
    socialButtonsBlockButton:
      "rounded-2xl border border-border/70 bg-card/60 text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all font-semibold text-xs py-2.5 shadow-xs",
    socialButtonsBlockButtonText: "text-foreground font-semibold text-xs",
    formFieldLabel: "text-foreground text-xs font-bold",
    formFieldInput:
      "rounded-2xl border border-border/80 bg-background/80 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs py-2.5 transition-all shadow-2xs",
    formButtonPrimary:
      "rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs py-3 shadow-md shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.99]",
    footerActionLink: "text-primary hover:text-primary/80 font-bold transition-colors",
    identityPreviewEditButton: "text-primary hover:text-primary/80 transition-colors",
    formFieldAction: "text-primary hover:text-primary/80 transition-colors text-xs font-semibold",
    otpCodeFieldInput:
      "rounded-2xl border border-border/80 bg-background/80 text-foreground focus:border-primary focus:ring-primary text-base font-bold",
    dividerLine: "bg-border/60",
    dividerText: "text-muted-foreground text-[11px] font-bold uppercase tracking-wider",
    footer: "bg-transparent text-muted-foreground text-xs",
  },
};
