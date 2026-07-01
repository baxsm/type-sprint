import { useMemo } from "react";
import { renderAvatar } from "@/lib/character";
import type { Character } from "@/lib/types";
import { cn } from "@/lib/utils";

type CharacterAvatarProps = {
  character: Character;
  sizePx?: number;
  className?: string;
  // decorative by default (name is usually shown alongside as text); pass a
  // real label when the avatar is the only identifying content on screen
  alt?: string;
};

const CharacterAvatar = ({ character, sizePx = 40, className, alt = "" }: CharacterAvatarProps) => {
  const { style, seed } = character;
  const dataUri = useMemo(() => renderAvatar({ style, seed }), [style, seed]);

  return (
    // biome-ignore lint/performance/noImgElement: this is a data uri, not a remote image next/image can optimize
    <img
      src={dataUri}
      alt={alt}
      width={sizePx}
      height={sizePx}
      className={cn("shrink-0", className)}
      style={{ width: sizePx, height: sizePx }}
    />
  );
};

export default CharacterAvatar;
