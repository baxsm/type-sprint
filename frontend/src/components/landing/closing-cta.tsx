"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Button from "@/components/ui/button";
import { Subtitle, Title } from "@/components/ui/typography";
import { fadeUp } from "@/lib/motion";

const ClosingCta = () => {
  return (
    <section className="border-t-[3px] border-[var(--color-border)] px-4 py-20 sm:px-6 sm:py-28">
      <motion.div
        className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center"
        {...fadeUp}
      >
        <Title as="h2" className="text-3xl sm:text-4xl">
          Ready to see your number?
        </Title>
        <Subtitle className="max-w-md">
          Pick a snippet, start typing, and find out how fast you actually are.
        </Subtitle>
        <Link href="/app">
          <Button className="px-8 py-3 text-base">Open the app</Button>
        </Link>
      </motion.div>
    </section>
  );
};

export default ClosingCta;
