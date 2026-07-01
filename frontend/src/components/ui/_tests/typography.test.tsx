import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Body, Display, Label, Subtitle, Title, Value } from "../typography";

describe("typography roles", () => {
  it("renders each role with distinct size and color classes", () => {
    render(
      <div>
        <Display>display</Display>
        <Title>title</Title>
        <Subtitle>subtitle</Subtitle>
        <Value>42</Value>
        <Label>label</Label>
        <Body>body</Body>
      </div>,
    );

    const display = screen.getByText("display");
    const title = screen.getByText("title");
    const subtitle = screen.getByText("subtitle");
    const value = screen.getByText("42");
    const label = screen.getByText("label");
    const body = screen.getByText("body");

    const roles = [display, title, subtitle, value, label, body];
    const signatures = roles.map((el) => el.className);

    // no two roles should share the exact same class string
    expect(new Set(signatures).size).toBe(signatures.length);

    expect(display.className).toContain("text-5xl");
    expect(title.className).toContain("text-2xl");
    expect(value.className).toContain("font-mono");
    expect(value.className).toContain("tabular-nums");
    expect(label.className).toContain("uppercase");
  });
});
