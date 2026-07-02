"use client";

import { motion } from "motion/react";
import Link from "next/link";
import CharacterAvatar from "@/components/character-avatar";
import Button from "@/components/ui/button";
import { Subtitle, Title } from "@/components/ui/typography";
import { fadeUp, fadeUpDelay } from "@/lib/motion";
import type { Character } from "@/lib/types";

const showcase: { character: Character; label: string }[] = [
  { character: { style: "adventurer", seed: "sprinter" }, label: "Adventurer" },
  { character: { style: "bottts", seed: "bolt" }, label: "Bottts" },
  { character: { style: "pixel-art", seed: "8bit" }, label: "Pixel Art" },
  { character: { style: "thumbs", seed: "quickfingers" }, label: "Thumbs" },
  { character: { style: "notionists", seed: "clacker" }, label: "Notionists" },
  { character: { style: "big-smile", seed: "champ" }, label: "Big Smile" },
];

const CharacterShowcase = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <motion.div
        className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between"
        {...fadeUp}
      >
        <div>
          <Title as="h2" className="text-3xl sm:text-4xl">
            Pick a face for your speed
          </Title>
          <Subtitle className="mt-3 max-w-lg">
            Six curated avatar styles, endless seeds. Shuffle until one feels like you.
          </Subtitle>
        </div>
        <Link href="/app/character">
          <Button variant="secondary">Try the character picker</Button>
        </Link>
      </motion.div>

      <div className="mt-10 flex flex-wrap justify-center gap-6 sm:justify-between">
        {showcase.map((item, index) => (
          <motion.div
            key={item.label}
            className="flex flex-col items-center gap-2"
            {...fadeUpDelay(index * 0.06)}
          >
            <CharacterAvatar character={item.character} sizePx={72} alt={item.label} />
            <span className="text-xs font-semibold text-[var(--color-dim)]">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CharacterShowcase;
