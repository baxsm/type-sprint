import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { addRun } from "@/lib/storage";
import HeroTypingDemo from "../hero-typing-demo";

vi.mock("@/lib/storage", () => ({
  addRun: vi.fn(),
}));

describe("HeroTypingDemo", () => {
  it("renders without needing a real onFinish or scoring path", () => {
    render(<HeroTypingDemo />);
    expect(screen.getByTestId("hero-typing-demo")).toBeInTheDocument();
  });

  it("never calls addRun or touches storage, it is a demo not a real run", () => {
    render(<HeroTypingDemo />);
    expect(addRun).not.toHaveBeenCalled();
  });
});
