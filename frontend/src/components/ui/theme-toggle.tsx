"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/lib/use-theme";
import { cn } from "@/lib/utils";

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.35 14.5A8.5 8.5 0 0 1 9.5 3.65a.75.75 0 0 0-.94-.94A10 10 0 1 0 21.29 15.44a.75.75 0 0 0-.94-.94z" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 3a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1zm0 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm9-6a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1zM5 12a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1zm13.36-6.36a1 1 0 0 1 0 1.42l-.71.7a1 1 0 1 1-1.41-1.41l.7-.71a1 1 0 0 1 1.42 0zM7.76 17.9a1 1 0 0 1 0 1.41l-.7.71a1 1 0 0 1-1.42-1.42l.71-.7a1 1 0 0 1 1.41 0zM12 20a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zM5.64 5.64a1 1 0 0 1 1.42 0l.7.71a1 1 0 1 1-1.41 1.41l-.71-.7a1 1 0 0 1 0-1.42zm12.72 12.72a1 1 0 0 1 1.42 0l.7.7a1 1 0 1 1-1.41 1.42l-.71-.71a1 1 0 0 1 0-1.41z" />
  </svg>
);

const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, toggle } = useTheme();
  // this component only ever renders meaningfully on the client (the real theme is
  // unknown at SSR time), so it stays blank until mount instead of guessing and
  // causing a hydration mismatch on the icon/aria-label.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted ? (isDark ? "Switch to light theme" : "Switch to dark theme") : "Toggle theme"}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center border-[3px] border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)] shadow-[3px_3px_0_0_var(--color-ink)] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        className,
      )}
    >
      {mounted ? isDark ? <MoonIcon /> : <SunIcon /> : null}
    </button>
  );
};

export default ThemeToggle;
