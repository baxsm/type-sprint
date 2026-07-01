"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type ClientMessage,
  errorReasons,
  type RaceResult,
  type RoomView,
  type ServerMessage,
  serverMessageSchema,
} from "./race-protocol";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001";

export type RacePhase =
  | "idle"
  | "connecting"
  | "waiting"
  | "countdown"
  | "racing"
  | "done"
  | "error";

export type RaceState = {
  phase: RacePhase;
  code: string | null;
  snippetId: string | null;
  selfId: string | null;
  room: RoomView | null;
  countdown: number | null;
  startAt: number | null;
  opponentProgress: number;
  opponentWpm: number;
  results: RaceResult | null;
  error: string | null;
};

const initialState: RaceState = {
  phase: "idle",
  code: null,
  snippetId: null,
  selfId: null,
  room: null,
  countdown: null,
  startAt: null,
  opponentProgress: 0,
  opponentWpm: 0,
  results: null,
  error: null,
};

// all message handling reads and writes through refs, never stale closures.
export function useRaceSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const stateRef = useRef<RaceState>(initialState);
  const [state, setStateRaw] = useState<RaceState>(initialState);

  const setState = useCallback((patch: Partial<RaceState>) => {
    const next = { ...stateRef.current, ...patch };
    stateRef.current = next;
    setStateRaw(next);
  }, []);

  const handleMessage = useCallback(
    (msg: ServerMessage) => {
      switch (msg.type) {
        case "created":
          setState({
            phase: "waiting",
            code: msg.code,
            snippetId: msg.snippetId,
            selfId: msg.selfId,
          });
          break;
        case "joined":
          setState({
            phase: "waiting",
            code: msg.code,
            snippetId: msg.snippetId,
            selfId: msg.selfId,
          });
          break;
        case "state": {
          const room = msg.room;
          // do not override a terminal phase with a plain state update
          const phase = stateRef.current.phase === "done" ? "done" : phaseFrom(room.status);
          setState({ room, phase });
          break;
        }
        case "countdown":
          setState({ phase: "countdown", countdown: msg.seconds });
          break;
        case "start":
          setState({
            phase: "racing",
            startAt: msg.startAt,
            countdown: null,
          });
          break;
        case "opponentProgress":
          setState({
            opponentProgress: msg.progress,
            opponentWpm: msg.wpm,
          });
          break;
        case "done":
          setState({ phase: "done", results: msg.results });
          break;
        case "error":
          setState({
            phase: stateRef.current.code ? stateRef.current.phase : "error",
            error: errorReasons[msg.reason] ?? "Something went wrong.",
          });
          break;
      }
    },
    [setState],
  );

  const connect = useCallback((): Promise<WebSocket> => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return Promise.resolve(socketRef.current);
    }
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;
      setState({ phase: "connecting" });

      ws.onopen = () => resolve(ws);
      ws.onerror = () => {
        setState({
          phase: "error",
          error: "Could not reach the race server. Is it running?",
        });
        reject(new Error("connect failed"));
      };
      ws.onmessage = (event) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(event.data as string);
        } catch {
          return;
        }
        const result = serverMessageSchema.safeParse(parsed);
        if (result.success) handleMessage(result.data);
      };
      ws.onclose = () => {
        // if a race was in progress and not done, surface a dropped connection
        if (stateRef.current.phase === "racing" || stateRef.current.phase === "countdown") {
          setState({
            error: "Connection to the race server dropped.",
          });
        }
      };
    });
  }, [handleMessage, setState]);

  const send = useCallback((msg: ClientMessage) => {
    const ws = socketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }, []);

  const createRace = useCallback(
    async (name: string) => {
      await connect();
      send({ type: "create", name });
    },
    [connect, send],
  );

  const joinRace = useCallback(
    async (code: string, name: string) => {
      await connect();
      send({ type: "join", code: code.toUpperCase(), name });
    },
    [connect, send],
  );

  const ready = useCallback(() => send({ type: "ready" }), [send]);

  const sendProgress = useCallback(
    (progress: number, wpm: number) => send({ type: "progress", progress, wpm }),
    [send],
  );

  const sendFinish = useCallback(
    (wpm: number, accuracy: number) => send({ type: "finish", wpm, accuracy }),
    [send],
  );

  const reset = useCallback(() => {
    const ws = socketRef.current;
    if (ws) {
      try {
        ws.close();
      } catch {
        // ignore
      }
    }
    socketRef.current = null;
    stateRef.current = initialState;
    setStateRaw(initialState);
  }, []);

  // clean up the socket on unmount so a stale connection never lingers
  useEffect(() => {
    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  return {
    state,
    createRace,
    joinRace,
    ready,
    sendProgress,
    sendFinish,
    reset,
  };
}

function phaseFrom(status: RoomView["status"]): RacePhase {
  switch (status) {
    case "waiting":
      return "waiting";
    case "countdown":
      return "countdown";
    case "racing":
      return "racing";
    case "done":
      return "done";
  }
}
