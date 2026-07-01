import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "type-sprint:theme";

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function readStoredTheme(): Theme | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "light" || raw === "dark" ? raw : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function getInitialTheme(): Theme {
  return readStoredTheme() ?? systemTheme();
}

export function useTheme() {
  // lazy initializer reads the real theme on the client's first render, matching what the
  // inline no-flash script in layout.tsx already applied to <html> before paint. this
  // intentionally differs from the server-rendered markup - consumers that render
  // theme-dependent output (e.g. ThemeToggle's icon) need suppressHydrationWarning.
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    if (!hasStorage()) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage full or unavailable (private mode). fail quietly.
    }
  }, []);

  const toggle = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      if (hasStorage()) {
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // storage full or unavailable (private mode). fail quietly.
        }
      }
      return next;
    });
  }, []);

  return { theme, setTheme, toggle };
}
