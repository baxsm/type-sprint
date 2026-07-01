"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import RaceCountdown from "@/components/race-countdown";
import RaceTrack, { type Lane } from "@/components/race-track";
import TypingSurface, { type FinishPayload } from "@/components/typing-surface";
import Button from "@/components/ui/button";
import Panel from "@/components/ui/panel";
import { Label, Subtitle, Title } from "@/components/ui/typography";
import { getSnippetById } from "@/lib/snippets";
import { addRun, loadProfile, saveProfile } from "@/lib/storage";
import type { Snippet } from "@/lib/types";
import { useRaceSocket } from "@/lib/use-race-socket";
import { buildRun } from "@/lib/utils";

export default function RacePage() {
  const { state, createRace, joinRace, ready, sendProgress, sendFinish, reset } = useRaceSocket();
  const [name, setName] = useState("Guest");
  const [joinCode, setJoinCode] = useState("");
  const lastSentRef = useRef(0);

  useEffect(() => {
    setName(loadProfile().name);
  }, []);

  const snippet: Snippet | null = state.snippetId ? getSnippetById(state.snippetId) : null;

  const saveName = (value: string) => {
    setName(value);
    saveProfile({ name: value || "Guest" });
  };

  // lobby view
  if (state.phase === "idle" || state.phase === "connecting" || state.phase === "error") {
    return (
      <Lobby
        name={name}
        onName={saveName}
        joinCode={joinCode}
        onJoinCode={setJoinCode}
        connecting={state.phase === "connecting"}
        error={state.error}
        onCreate={() => createRace(name || "Guest")}
        onJoin={() => joinRace(joinCode, name || "Guest")}
      />
    );
  }

  const self = state.room?.players.find((p) => p.id === state.selfId);
  const opponent = state.room?.players.find((p) => p.id !== state.selfId);

  // waiting for opponent
  if (state.phase === "waiting") {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <Title as="h1" className="text-2xl">
          Race ready
        </Title>
        {opponent ? (
          <div className="flex flex-col items-center gap-4">
            <Subtitle>{opponent.name} joined. Ready up to start.</Subtitle>
            <Button onClick={ready} disabled={self?.ready}>
              {self?.ready ? "Waiting for opponent..." : "I'm ready"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Subtitle>Share this code, or open a second window and join with it.</Subtitle>
            <Panel className="px-8 py-4 font-mono text-4xl font-bold tracking-[0.3em] text-[var(--color-primary)]">
              {state.code}
            </Panel>
            <Subtitle className="text-sm">Waiting for another player...</Subtitle>
          </div>
        )}
        <button
          type="button"
          onClick={reset}
          className="text-sm text-[var(--color-dim)] underline-offset-2 hover:underline"
        >
          Leave race
        </button>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--color-dim)]">
        Loading race...
      </div>
    );
  }

  const lanes: Lane[] = [
    {
      name: self?.name ?? "You",
      progress: self?.progress ?? 0,
      wpm: self?.wpm ?? 0,
      isSelf: true,
      finished: self?.finished ?? false,
    },
  ];
  if (opponent) {
    lanes.push({
      name: opponent.name,
      progress: state.opponentProgress,
      wpm: state.opponentWpm,
      isSelf: false,
      finished: opponent.finished,
    });
  }

  const handleProgress = (caret: number, total: number, wpm: number) => {
    const pct = total > 0 ? (caret / total) * 100 : 0;
    // update the self lane immediately for a smooth local bar
    const now = Date.now();
    if (now - lastSentRef.current >= 200) {
      lastSentRef.current = now;
      sendProgress(pct, wpm);
    }
  };

  const handleFinish = (payload: FinishPayload) => {
    sendFinish(payload.stats.wpm, payload.stats.accuracy);
    addRun(
      buildRun({
        mode: "race",
        snippet,
        stats: payload.stats,
        consistency: payload.consistency,
        charCount: payload.charCount,
        errorCount: payload.errorCount,
      }),
    );
  };

  const won = state.phase === "done" && state.results?.winnerId === state.selfId;

  return (
    <div className="flex flex-col gap-6">
      <RaceTrack lanes={lanes} />

      {state.phase === "reconnecting" && (
        <p className="text-center text-sm text-[var(--color-dim)]">
          Reconnecting to the race server...
        </p>
      )}

      {state.phase === "countdown" && state.countdown !== null && (
        <RaceCountdown value={state.countdown} />
      )}

      <TypingSurface
        text={snippet.text}
        disabled={state.phase !== "racing"}
        autoFocus={state.phase === "racing"}
        lockedMessage="Get ready..."
        onProgress={(s, stats) => handleProgress(s.caret, [...snippet.text].length, stats.wpm)}
        onFinish={handleFinish}
      />

      {state.error && state.phase !== "done" && (
        <p className="text-sm text-[var(--color-incorrect)]">{state.error}</p>
      )}

      {state.phase === "done" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Panel accent={won ? "correct" : "ink"} className="flex flex-col gap-4 p-6">
            <Title as="h2" className="text-2xl">
              {won ? (
                <span className="text-[var(--color-correct)]">You win</span>
              ) : (
                <span>Race over</span>
              )}
            </Title>
            <div className="flex flex-col gap-2">
              {state.results?.players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-[2px] border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-2"
                >
                  <span className="font-semibold">
                    {p.name}
                    {p.id === state.selfId && (
                      <span className="ml-1 text-[var(--color-dim)]">(you)</span>
                    )}
                    {p.id === state.results?.winnerId && (
                      <span className="ml-2 text-[var(--color-correct)]">winner</span>
                    )}
                  </span>
                  <span className="font-mono text-sm text-[var(--color-dim)]">
                    {p.wpm} wpm - {p.accuracy}%
                  </span>
                </div>
              ))}
            </div>
            <Button onClick={reset} className="self-start">
              Race again
            </Button>
          </Panel>
        </motion.div>
      )}
    </div>
  );
}

type LobbyProps = {
  name: string;
  onName: (v: string) => void;
  joinCode: string;
  onJoinCode: (v: string) => void;
  connecting: boolean;
  error: string | null;
  onCreate: () => void;
  onJoin: () => void;
};

const Lobby = ({
  name,
  onName,
  joinCode,
  onJoinCode,
  connecting,
  error,
  onCreate,
  onJoin,
}: LobbyProps) => (
  <div className="flex flex-col gap-8">
    <div className="flex flex-col gap-2">
      <Title as="h1" className="text-2xl">
        Race
      </Title>
      <Subtitle>
        Race a friend in real time. To try it solo, create a race, then open this page in a second
        window and join with the code.
      </Subtitle>
    </div>

    <div className="flex flex-col gap-2">
      <Label as="label" htmlFor="race-name">
        Your name
      </Label>
      <input
        id="race-name"
        value={name}
        maxLength={24}
        onChange={(e) => onName(e.target.value)}
        className="w-full max-w-xs border-[3px] border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 outline-none focus-visible:border-[var(--color-primary)]"
      />
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <Panel className="flex flex-col gap-3 p-5">
        <Title as="h2" className="text-lg">
          Create a race
        </Title>
        <Subtitle className="text-sm">Start a new race and get a code to share.</Subtitle>
        <Button onClick={onCreate} disabled={connecting} className="mt-auto">
          {connecting ? "Connecting..." : "Create race"}
        </Button>
      </Panel>

      <Panel className="flex flex-col gap-3 p-5">
        <Title as="h2" className="text-lg">
          Join a race
        </Title>
        <input
          value={joinCode}
          maxLength={4}
          placeholder="Enter code"
          onChange={(e) => onJoinCode(e.target.value.toUpperCase())}
          className="border-[3px] border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 font-mono uppercase tracking-widest outline-none focus-visible:border-[var(--color-primary)]"
        />
        <Button
          variant="secondary"
          onClick={onJoin}
          disabled={connecting || joinCode.length !== 4}
          className="mt-auto"
        >
          Join race
        </Button>
      </Panel>
    </div>

    {error && <p className="text-sm text-[var(--color-incorrect)]">{error}</p>}
  </div>
);
