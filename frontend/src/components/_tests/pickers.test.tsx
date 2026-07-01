import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DifficultyPicker, LanguagePicker } from "../pickers";

describe("LanguagePicker", () => {
  it("renders all language options", () => {
    render(<LanguagePicker value="javascript" onChange={() => {}} />);
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("Prose")).toBeInTheDocument();
  });

  it("calls onChange when a different option is clicked", () => {
    const onChange = vi.fn();
    render(<LanguagePicker value="javascript" onChange={onChange} />);
    fireEvent.click(screen.getByText("Python"));
    expect(onChange).toHaveBeenCalledWith("python");
  });
});

describe("DifficultyPicker", () => {
  it("renders all difficulty options", () => {
    render(<DifficultyPicker value="medium" onChange={() => {}} />);
    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("Hard")).toBeInTheDocument();
  });

  it("calls onChange on click", () => {
    const onChange = vi.fn();
    render(<DifficultyPicker value="medium" onChange={onChange} />);
    fireEvent.click(screen.getByText("Hard"));
    expect(onChange).toHaveBeenCalledWith("hard");
  });
});
