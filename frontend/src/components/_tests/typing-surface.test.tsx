import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TypingSurface from "../typing-surface";

describe("TypingSurface", () => {
  it("renders the target text", () => {
    render(<TypingSurface text="abc" />);
    // each char is its own span; the container holds the full text
    const box = screen.getByRole("textbox");
    expect(box.textContent).toContain("a");
    expect(box.textContent).toContain("b");
    expect(box.textContent).toContain("c");
  });

  it("marks a correct keystroke", () => {
    render(<TypingSurface text="abc" />);
    fireEvent.keyDown(window, { key: "a" });
    const box = screen.getByRole("textbox");
    // the first char should now carry the correct color class
    const firstSpan = box.querySelector("span");
    expect(firstSpan?.className).toContain("color-fg");
  });

  it("marks an incorrect keystroke", () => {
    render(<TypingSurface text="abc" />);
    fireEvent.keyDown(window, { key: "z" });
    const box = screen.getByRole("textbox");
    const firstSpan = box.querySelector("span");
    expect(firstSpan?.className).toContain("color-bad");
  });

  it("calls onProgress on each keystroke", () => {
    const onProgress = vi.fn();
    render(<TypingSurface text="abc" onProgress={onProgress} />);
    fireEvent.keyDown(window, { key: "a" });
    expect(onProgress).toHaveBeenCalled();
    const [state] = onProgress.mock.calls[0] ?? [];
    expect(state.caret).toBe(1);
  });

  it("calls onFinish when the text is complete", () => {
    const onFinish = vi.fn();
    render(<TypingSurface text="ab" onFinish={onFinish} />);
    fireEvent.keyDown(window, { key: "a" });
    fireEvent.keyDown(window, { key: "b" });
    expect(onFinish).toHaveBeenCalledTimes(1);
    const [payload] = onFinish.mock.calls[0] ?? [];
    expect(payload.charCount).toBe(2);
  });

  it("ignores input when disabled", () => {
    const onProgress = vi.fn();
    render(<TypingSurface text="abc" disabled onProgress={onProgress} />);
    fireEvent.keyDown(window, { key: "a" });
    expect(onProgress).not.toHaveBeenCalled();
  });

  it("handles backspace", () => {
    const onProgress = vi.fn();
    render(<TypingSurface text="abc" onProgress={onProgress} />);
    fireEvent.keyDown(window, { key: "a" });
    fireEvent.keyDown(window, { key: "Backspace" });
    const lastCall = onProgress.mock.calls.at(-1);
    expect(lastCall?.[0].caret).toBe(0);
  });

  it("shows a locked message instead of the focus hint when disabled", () => {
    render(<TypingSurface text="abc" disabled lockedMessage="Get ready..." />);
    expect(screen.getByText("Get ready...")).toBeInTheDocument();
    expect(screen.queryByText("Click here and start typing")).not.toBeInTheDocument();
  });

  it("shows the default focus hint when enabled and not focused", () => {
    render(<TypingSurface text="abc" autoFocus={false} lockedMessage="Get ready..." />);
    expect(screen.getByText("Click here and start typing")).toBeInTheDocument();
    expect(screen.queryByText("Get ready...")).not.toBeInTheDocument();
  });
});
