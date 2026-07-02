"use client";

import { motion } from "motion/react";
import { Subtitle, Title } from "@/components/ui/typography";
import { fadeUp, fadeUpDelay } from "@/lib/motion";
import TypingIllustration from "./typing-illustration";

const steps = [
  {
    number: "01",
    title: "Pick a mode",
    description: "Practice solo, take today's daily challenge, or open a race room.",
  },
  {
    number: "02",
    title: "Type the snippet",
    description: "Code or prose, your choice of language and difficulty.",
  },
  {
    number: "03",
    title: "See your stats",
    description: "WPM, accuracy, and consistency, tracked over every run you complete.",
  },
  {
    number: "04",
    title: "Race a friend",
    description: "Share a room code, race live, watch both cursors move in real time.",
  },
];

const HowItWorksSequence = () => {
  return (
    <section className="border-t-[3px] border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
        <div>
          <motion.div className="max-w-xl" {...fadeUp}>
            <Title as="h2" className="text-3xl sm:text-4xl">
              How it works
            </Title>
            <Subtitle className="mt-3">Four steps. No setup.</Subtitle>
          </motion.div>

          <ol className="mt-12">
            {steps.map((step, index) => (
              <motion.li
                key={step.number}
                className="grid grid-cols-[3rem_1fr] gap-x-5 border-t-[3px] border-[var(--color-border)] py-6 first:border-t-0"
                {...fadeUpDelay(index * 0.08)}
              >
                <span className="font-mono text-3xl font-bold text-[var(--color-primary)] tabular-nums">
                  {step.number}
                </span>
                <div>
                  <Title as="h3" className="text-lg">
                    {step.title}
                  </Title>
                  <Subtitle className="mt-1 text-sm">{step.description}</Subtitle>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

        <motion.div className="hidden lg:block" {...fadeUpDelay(0.15)}>
          <TypingIllustration className="w-full" />
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSequence;
