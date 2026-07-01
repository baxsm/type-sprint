import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTheme } from "../use-theme";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  mockMatchMedia(false);
});

afterEach(() => {
  document.documentElement.classList.remove("dark");
});

describe("useTheme", () => {
  it("defaults to system preference when no stored value", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
  });

  it("defaults to light when system prefers light and nothing stored", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
  });

  it("reads a stored theme over the system preference", () => {
    localStorage.setItem("type-sprint:theme", "dark");
    mockMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
  });

  it("persists a manual choice via setTheme", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme("dark"));
    expect(result.current.theme).toBe("dark");
    expect(localStorage.getItem("type-sprint:theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggle flips the theme and persists it", () => {
    const { result } = renderHook(() => useTheme());
    const initial = result.current.theme;
    act(() => result.current.toggle());
    expect(result.current.theme).not.toBe(initial);
    expect(localStorage.getItem("type-sprint:theme")).toBe(result.current.theme);

    act(() => result.current.toggle());
    expect(result.current.theme).toBe(initial);
  });

  it("falls back to system preference when storage read throws", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    mockMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
    getItem.mockRestore();
  });

  it("does not throw when storage write fails on toggle", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("full");
    });
    const { result } = renderHook(() => useTheme());
    expect(() => act(() => result.current.toggle())).not.toThrow();
    setItem.mockRestore();
  });
});
