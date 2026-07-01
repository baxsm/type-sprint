"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadProfile } from "@/lib/storage";
import { cn } from "@/lib/utils";

const links = [
  { href: "/practice", label: "Practice" },
  { href: "/daily", label: "Daily" },
  { href: "/race", label: "Race" },
  { href: "/stats", label: "Stats" },
];

const Topbar = () => {
  const pathname = usePathname();
  const [name, setName] = useState("Guest");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setName(loadProfile().name);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-mono text-lg font-bold tracking-tight"
        >
          <span className="text-[var(--color-accent)]">type</span>
          <span className="-ml-2">sprint</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-fg)]"
                    : "text-[var(--color-dim)] hover:text-[var(--color-fg)]",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <span className="text-sm text-[var(--color-dim)]">{name}</span>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="rounded-md p-2 text-[var(--color-dim)] sm:hidden"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-[var(--color-border)] px-4 py-2 sm:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "rounded-md px-3 py-2 text-sm",
                pathname === link.href
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-fg)]"
                  : "text-[var(--color-dim)]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Topbar;
