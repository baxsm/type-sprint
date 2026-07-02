"use client";

import { useEffect, useState } from "react";
import CharacterAvatar from "@/components/character-avatar";
import Button from "@/components/ui/button";
import Panel from "@/components/ui/panel";
import { Label, Subtitle, Title } from "@/components/ui/typography";
import { AVATAR_STYLES, randomSeed } from "@/lib/character";
import { loadProfile, saveProfile } from "@/lib/storage";
import type { AvatarStyle, Character } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function CharacterPage() {
  const [character, setCharacter] = useState<Character>({ style: "adventurer", seed: "guest" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCharacter(loadProfile().character);
  }, []);

  const selectStyle = (style: AvatarStyle) => {
    setCharacter((c) => ({ ...c, style }));
    setSaved(false);
  };

  const setSeed = (seed: string) => {
    setCharacter((c) => ({ ...c, seed: seed.length > 0 ? seed : c.seed }));
    setSaved(false);
  };

  const shuffle = () => {
    setCharacter((c) => ({ ...c, seed: randomSeed() }));
    setSaved(false);
  };

  const save = () => {
    saveProfile({ character });
    setSaved(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Title as="h1" className="text-2xl">
          Character
        </Title>
        <Subtitle>
          Pick a style, then shuffle or type your own seed for a variation within it. This is the
          character shown next to your name and in race lanes.
        </Subtitle>
      </div>

      <section className="flex flex-col gap-3">
        <Label>Style</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {AVATAR_STYLES.map((s) => {
            const active = character.style === s.value;
            return (
              <button key={s.value} type="button" onClick={() => selectStyle(s.value)}>
                <Panel
                  accent={active ? "primary" : "ink"}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 transition-transform",
                    active ? "-translate-y-0.5" : "",
                  )}
                >
                  <CharacterAvatar
                    character={{ style: s.value, seed: character.seed }}
                    sizePx={56}
                    alt={s.label}
                  />
                  <span className="text-sm font-semibold">{s.label}</span>
                </Panel>
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Label as="label" htmlFor="character-seed">
            Seed
          </Label>
          <div className="flex gap-2">
            <input
              id="character-seed"
              value={character.seed}
              maxLength={40}
              onChange={(e) => setSeed(e.target.value)}
              className="w-full max-w-xs border-[3px] border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 outline-none focus-visible:border-[var(--color-primary)]"
            />
            <Button variant="secondary" onClick={shuffle}>
              Shuffle
            </Button>
          </div>
        </div>

        <Panel className="flex flex-col items-center gap-2 p-5">
          <Label>Preview</Label>
          <CharacterAvatar character={character} sizePx={96} />
        </Panel>
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={save}>Save</Button>
        {saved && <span className="text-sm text-[var(--color-correct)]">Saved.</span>}
      </div>
    </div>
  );
}
