import CharacterShowcase from "@/components/landing/character-showcase";
import ClosingCta from "@/components/landing/closing-cta";
import FeatureSequence from "@/components/landing/feature-sequence";
import Hero from "@/components/landing/hero";
import HowItWorksSequence from "@/components/landing/how-it-works-sequence";
import LandingHeader from "@/components/landing/landing-header";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
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
