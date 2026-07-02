"use client";

import { Flame, Keyboard, LineChart, Swords } from "lucide-react";
import { motion } from "motion/react";
import { Subtitle, Title } from "@/components/ui/typography";
import { fadeUp, fadeUpDelay } from "@/lib/motion";

const features = [
  {
    icon: Keyboard,
    title: "Solo practice",
    description:
      "Pick a language and difficulty, type at your own pace. Code snippets and prose, easy through hard.",
  },
  {
    icon: Flame,
    title: "Daily challenge",
    description:
      "The same snippet for everyone, once a day. Build a streak, see your history on a calendar.",
  },
  {
    icon: Swords,
    title: "Real-time race",
    description:
      "Open a room, share the code, race a friend live. Watch both cursors move across the same text.",
  },
  {
    icon: LineChart,
    title: "Stats that mean something",
    description:
      "WPM over time, accuracy, per-language breakdown. Hover any point for the real detail behind it.",
  },
];

const FeatureSequence = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <motion.div className="max-w-xl" {...fadeUp}>
        <Title as="h2" className="text-3xl sm:text-4xl">
          Everything you need to get faster
        </Title>
        <Subtitle className="mt-3">Four modes, one typing engine underneath all of them.</Subtitle>
      </motion.div>

      <ol className="mt-12">
        {features.map((feature, index) => (
          <motion.li
            key={feature.title}
            className="relative grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 border-t-[3px] border-[var(--color-border)] py-8 first:border-t-0 sm:grid-cols-[4rem_1fr] sm:gap-x-8"
            {...fadeUpDelay(index * 0.08)}
          >
            <div className="flex items-start justify-center sm:justify-start">
              <feature.icon className="h-8 w-8 text-[var(--color-primary)]" aria-hidden="true" />
            </div>
            <div>
              <Title as="h3" className="text-xl">
                {feature.title}
              </Title>
              <Subtitle className="mt-2 max-w-xl text-sm">{feature.description}</Subtitle>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
};

export default FeatureSequence;
