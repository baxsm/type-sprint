"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import RaceTrack, { type Lane } from "@/components/race-track";
import TypingSurface, { type FinishPayload } from "@/components/typing-surface";
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
        <h1 className="text-2xl font-bold">Race ready</h1>
        {opponent ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-[var(--color-dim)]">{opponent.name} joined. Ready up to start.</p>
            <button
              type="button"
              onClick={ready}
              disabled={self?.ready}
              className="rounded-lg bg-[var(--color-accent)] px-6 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {self?.ready ? "Waiting for opponent..." : "I'm ready"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-[var(--color-dim)]">
              Share this code, or open a second window and join with it.
            </p>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-4 font-mono text-4xl font-bold tracking-[0.3em] text-[var(--color-accent)]">
              {state.code}
            </div>
            <p className="text-sm text-[var(--color-dim)]">Waiting for another player...</p>
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

      {state.phase === "countdown" && state.countdown !== null && (
        <div className="flex items-center justify-center py-6">
          <motion.span
            key={state.countdown}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-mono text-6xl font-bold text-[var(--color-accent)]"
          >
            {state.countdown > 0 ? state.countdown : "Go"}
          </motion.span>
        </div>
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
        <p className="text-sm text-[var(--color-bad)]">{state.error}</p>
      )}

      {state.phase === "done" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        >
          <h2 className="text-2xl font-bold">
            {won ? (
              <span className="text-[var(--color-good)]">You win</span>
            ) : (
              <span>Race over</span>
            )}
          </h2>
          <div className="flex flex-col gap-2">
            {state.results?.players.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg bg-[var(--color-surface-raised)] px-4 py-2"
              >
                <span className="font-medium">
                  {p.name}
                  {p.id === state.selfId && (
                    <span className="ml-1 text-[var(--color-dim)]">(you)</span>
                  )}
                  {p.id === state.results?.winnerId && (
                    <span className="ml-2 text-[var(--color-good)]">winner</span>
                  )}
                </span>
                <span className="font-mono text-sm text-[var(--color-dim)]">
                  {p.wpm} wpm - {p.accuracy}%
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={reset}
            className="self-start rounded-lg bg-[var(--color-accent)] px-5 py-2 font-medium text-white transition-opacity hover:opacity-90"
          >
            Race again
          </button>
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
      <h1 className="text-2xl font-bold">Race</h1>
      <p className="text-[var(--color-dim)]">
        Race a friend in real time. To try it solo, create a race, then open this page in a second
        window and join with the code.
      </p>
    </div>

    <div className="flex flex-col gap-2">
      <label
        htmlFor="race-name"
        className="text-xs uppercase tracking-wide text-[var(--color-dim)]"
      >
        Your name
      </label>
      <input
        id="race-name"
        value={name}
        maxLength={24}
        onChange={(e) => onName(e.target.value)}
        className="w-full max-w-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 outline-none focus-visible:border-[var(--color-accent)]"
      />
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-semibold">Create a race</h2>
        <p className="text-sm text-[var(--color-dim)]">Start a new race and get a code to share.</p>
        <button
          type="button"
          onClick={onCreate}
          disabled={connecting}
          className="mt-auto rounded-lg bg-[var(--color-accent)] px-5 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {connecting ? "Connecting..." : "Create race"}
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-semibold">Join a race</h2>
        <input
          value={joinCode}
          maxLength={4}
          placeholder="Enter code"
          onChange={(e) => onJoinCode(e.target.value.toUpperCase())}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 font-mono uppercase tracking-widest outline-none focus-visible:border-[var(--color-accent)]"
        />
        <button
          type="button"
          onClick={onJoin}
          disabled={connecting || joinCode.length !== 4}
          className="mt-auto rounded-lg border border-[var(--color-border)] px-5 py-2 font-medium transition-colors hover:border-[var(--color-dim)] disabled:opacity-50"
        >
          Join race
        </button>
      </div>
    </div>

    {error && <p className="text-sm text-[var(--color-bad)]">{error}</p>}
  </div>
);
