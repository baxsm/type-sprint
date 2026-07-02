import CharacterShowcase from "@/components/landing/character-showcase";
import ClosingCta from "@/components/landing/closing-cta";
import FeatureSequence from "@/components/landing/feature-sequence";
import Hero from "@/components/landing/hero";
import HowItWorksSequence from "@/components/landing/how-it-works-sequence";
import LandingHeader from "@/components/landing/landing-header";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "type-sprint",
  applicationCategory: "GameApplication",
  operatingSystem: "Any (runs in a web browser)",
  url: siteUrl,
  description:
    "A typing speed game. Race code and prose, track your WPM, and challenge a friend in real time.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static structured data, no user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingHeader />
      <main>
        <Hero />
        <FeatureSequence />
        <HowItWorksSequence />
        <CharacterShowcase />
        <ClosingCta />
      </main>
    </div>
  );
}
