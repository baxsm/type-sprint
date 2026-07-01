import { Avatar, Style } from "@dicebear/core";
import adventurer from "@dicebear/styles/adventurer.json" with { type: "json" };
import bigSmile from "@dicebear/styles/big-smile.json" with { type: "json" };
import bottts from "@dicebear/styles/bottts.json" with { type: "json" };
import notionists from "@dicebear/styles/notionists.json" with { type: "json" };
import pixelArt from "@dicebear/styles/pixel-art.json" with { type: "json" };
import thumbs from "@dicebear/styles/thumbs.json" with { type: "json" };
import type { AvatarStyle, Character } from "./types";

export const AVATAR_STYLES: { value: AvatarStyle; label: string }[] = [
  { value: "adventurer", label: "Adventurer" },
  { value: "bottts", label: "Bottts" },
  { value: "pixel-art", label: "Pixel Art" },
  { value: "thumbs", label: "Thumbs" },
  { value: "notionists", label: "Notionists" },
  { value: "big-smile", label: "Big Smile" },
];

// style JSON definitions are static, wrap each once and reuse across renders
const styleInstances: Record<AvatarStyle, Style<unknown>> = {
  adventurer: new Style(adventurer),
  bottts: new Style(bottts),
  "pixel-art": new Style(pixelArt),
  thumbs: new Style(thumbs),
  notionists: new Style(notionists),
  "big-smile": new Style(bigSmile),
};

export function renderAvatar(character: Character): string {
  const style = styleInstances[character.style];
  return new Avatar(style, { seed: character.seed }).toDataUri();
}

export function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}
