import type { Metadata } from "next";
import LandingShell from "@/components/landing/LandingShell";
import { buildPublicPageMetadata, publicSeoPages } from "@/lib/seo";
import { dictionaries } from "@/lib/i18n";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = buildPublicPageMetadata("/sign-in");

const calculatorLinks = publicSeoPages.filter((page) =>
  page.path.includes("calculator"),
);

// FAQ structured data uses the canonical (English) dictionary copy for SEO.
const en = dictionaries.en;
const faqItems = [1, 2, 3, 4, 5].map((n) => ({
  q: en[`landing.faq.q${n}`],
  a: en[`landing.faq.a${n}`],
}));

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: APP_NAME,
    applicationCategory: "HealthApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: APP_TAGLINE,
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Background Decorative Mesh & Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/15 via-emerald-500/10 to-transparent blur-3xl" />
        <div className="absolute right-[-10%] top-[40%] h-[400px] w-[500px] rounded-full bg-gradient-to-bl from-blue-500/10 via-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[360px] w-[420px] rounded-full bg-gradient-to-tr from-emerald-500/10 via-primary/10 to-transparent blur-3xl" />
      </div>

      {/* JSON-LD Structured Data */}
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      <LandingShell calculatorLinks={calculatorLinks}>{children}</LandingShell>
    </div>
  );
};

export default Layout;
