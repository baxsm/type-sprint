"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  type ClientMessage,
  errorReasons,
  type RaceResult,
  type RoomView,
  type ServerMessage,
  serverMessageSchema,
} from "./race-protocol";
import { loadProfile } from "./storage";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";

export type RacePhase =
  | "idle"
  | "connecting"
  | "reconnecting"
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
// socket.io handles reconnection with backoff on its own, we just react to
// its connect/reconnecting/disconnect events to keep the UI honest.
export function useRaceSocket() {
  const socketRef = useRef<Socket | null>(null);
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

  const connect = useCallback((): Promise<Socket> => {
    if (socketRef.current?.connected) {
      return Promise.resolve(socketRef.current);
    }
    return new Promise((resolve, reject) => {
      const socket = io(WS_URL, {
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 500,
        reconnectionDelayMax: 3000,
      });
      socketRef.current = socket;
      setState({ phase: "connecting" });

      socket.on("connect", () => resolve(socket));

      socket.on("connect_error", () => {
        setState({
          phase: "error",
          error: "Could not reach the race server. Is it running?",
        });
        reject(new Error("connect failed"));
      });

      socket.on("message", (raw: unknown) => {
        const result = serverMessageSchema.safeParse(raw);
        if (result.success) handleMessage(result.data);
      });

      socket.io.on("reconnect_attempt", () => {
        if (
          stateRef.current.phase === "racing" ||
          stateRef.current.phase === "countdown" ||
          stateRef.current.phase === "waiting"
        ) {
          setState({ phase: "reconnecting" });
        }
      });

      socket.io.on("reconnect_failed", () => {
        setState({
          phase: "error",
          error: "Connection to the race server dropped.",
        });
      });
    });
  }, [handleMessage, setState]);

  const send = useCallback((msg: ClientMessage) => {
    socketRef.current?.emit("message", msg);
  }, []);

  const createRace = useCallback(
    async (name: string) => {
      await connect();
      send({ type: "create", name, character: loadProfile().character });
    },
    [connect, send],
  );

  const joinRace = useCallback(
    async (code: string, name: string) => {
      await connect();
      send({ type: "join", code: code.toUpperCase(), name, character: loadProfile().character });
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
    socketRef.current?.disconnect();
    socketRef.current = null;
    stateRef.current = initialState;
    setStateRaw(initialState);
  }, []);

  // clean up the socket on unmount so a stale connection never lingers
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
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
