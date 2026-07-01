import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "correct" | "incorrect" | "opponent" | "info";
  className?: string;
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  primary: "bg-[var(--color-accent-soft)] text-[var(--color-primary)]",
  correct: "bg-[var(--color-correct)] text-[var(--color-primary-fg)]",
  incorrect: "bg-[var(--color-incorrect)] text-[var(--color-primary-fg)]",
  opponent: "bg-[var(--color-opponent)] text-[var(--color-primary-fg)]",
  info: "bg-[var(--color-info)] text-[var(--color-ink)]",
};

const Badge = ({ children, variant = "primary", className }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-2 border-[var(--color-border)] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
