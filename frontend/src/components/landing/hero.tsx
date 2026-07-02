import Link from "next/link";
import Button from "@/components/ui/button";
import { Display, Subtitle } from "@/components/ui/typography";
import HeroTypingDemo from "./hero-typing-demo";

const Hero = () => {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-16 pb-8 sm:px-6 sm:pt-24 lg:flex-row lg:items-center">
      <div className="flex flex-1 flex-col gap-6">
        <Display as="h1">
          Type faster.
          <br />
          <span className="text-[var(--color-primary)]">Prove it.</span>
        </Display>
        <Subtitle className="max-w-lg text-lg">
          A typing game for code and prose. Track your speed and accuracy, take the daily challenge,
          and race a friend in real time.
        </Subtitle>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/app">
            <Button className="px-6 py-3 text-base">Open the app</Button>
          </Link>
          <span className="text-sm text-[var(--color-dim)]">No account needed to start.</span>
        </div>
      </div>

      <div className="flex-1">
        <HeroTypingDemo />
      </div>
    </section>
  );
};

export default Hero;
