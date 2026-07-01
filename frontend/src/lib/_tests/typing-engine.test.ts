import { describe, expect, it } from "vitest";
import { createTypingSession } from "../typing-engine";

describe("createTypingSession", () => {
  it("advances caret on correct keystroke", () => {
    const s = createTypingSession("abc");
    s.onKey("a");
    const state = s.state();
    expect(state.caret).toBe(1);
    expect(state.states[0]).toBe("correct");
    expect(state.states[1]).toBe("current");
  });

  it("marks incorrect keystroke", () => {
    const s = createTypingSession("abc");
    s.onKey("x");
    const state = s.state();
    expect(state.states[0]).toBe("incorrect");
    expect(state.caret).toBe(1);
  });

  it("handles backspace", () => {
    const s = createTypingSession("abc");
    s.onKey("a");
    s.onKey("b");
    expect(s.state().caret).toBe(2);
    s.backspace();
    expect(s.state().caret).toBe(1);
    expect(s.state().states[1]).toBe("current");
  });

  it("detects completion", () => {
    const s = createTypingSession("ab");
    s.onKey("a");
    expect(s.state().done).toBe(false);
    s.onKey("b");
    expect(s.state().done).toBe(true);
  });

  it("ignores input after completion", () => {
    const s = createTypingSession("a");
    s.onKey("a");
    s.onKey("b");
    expect(s.state().caret).toBe(1);
  });

  it("produces a correct state map for a mixed sequence", () => {
    const s = createTypingSession("hello");
    s.onKey("h");
    s.onKey("e");
    s.onKey("x"); // wrong for l
    s.onKey("l");
    const states = s.state().states;
    expect(states[0]).toBe("correct");
    expect(states[1]).toBe("correct");
    expect(states[2]).toBe("incorrect");
    expect(states[3]).toBe("correct");
    expect(states[4]).toBe("current");
  });

  it("does not advance caret below zero on backspace", () => {
    const s = createTypingSession("abc");
    s.backspace();
    expect(s.state().caret).toBe(0);
  });

  it("reports accuracy in stats", () => {
    const s = createTypingSession("abcd");
    s.onKey("a");
    s.onKey("x"); // wrong
    s.onKey("c");
    s.onKey("d");
    // 3 of 4 correct = 75
    expect(s.stats().accuracy).toBe(75);
  });

  it("resets to a clean state", () => {
    const s = createTypingSession("abc");
    s.onKey("a");
    s.reset();
    expect(s.state().caret).toBe(0);
    expect(s.state().done).toBe(false);
  });
});
