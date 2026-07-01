import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Button from "../button";

describe("Button", () => {
  it("renders its label and handles click", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    fireEvent.click(screen.getByText("Save"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("has a press-affordance class that shifts and drops the shadow", () => {
    render(<Button>Save</Button>);
    const btn = screen.getByText("Save");
    expect(btn.className).toContain("active:translate-x-[4px]");
    expect(btn.className).toContain("active:shadow-none");
  });

  it("applies the variant color class", () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByText("Delete").className).toContain("bg-[var(--color-incorrect)]");
  });

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByText("Save")).toBeDisabled();
  });
});
