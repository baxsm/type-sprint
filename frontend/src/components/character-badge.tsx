"use client";

import Link from "next/link";
import CharacterAvatar from "@/components/character-avatar";
import type { Character } from "@/lib/types";
import { cn } from "@/lib/utils";

type CharacterBadgeProps = {
  character: Character;
  name: string;
  className?: string;
};

const CharacterBadge = ({ character, name, className }: CharacterBadgeProps) => (
  <Link
    href="/character"
    className={cn(
      "flex items-center gap-2 border-[2px] border-transparent px-1 py-0.5 transition-colors hover:border-[var(--color-border)]",
      className,
    )}
  >
    <CharacterAvatar character={character} sizePx={28} />
    <span className="text-sm text-[var(--color-dim)]">{name}</span>
  </Link>
);

export default CharacterBadge;
