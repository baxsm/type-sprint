import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  as?: ElementType;
  accent?: "ink" | "primary" | "correct" | "incorrect" | "opponent";
  className?: string;
}

const accentBorder: Record<NonNullable<PanelProps["accent"]>, string> = {
  ink: "border-[var(--color-border)]",
  primary: "border-[var(--color-primary)]",
  correct: "border-[var(--color-correct)]",
  incorrect: "border-[var(--color-incorrect)]",
  opponent: "border-[var(--color-opponent)]",
};

// the single "card-like" surface for the whole app. never nest a Panel inside a Panel -
// use a divider or spacing for internal separation instead.
const Panel = ({ children, as: Tag = "div", accent = "ink", className, ...props }: PanelProps) => {
  return (
    <Tag
      className={cn(
        "border-[3px] bg-[var(--color-surface)] shadow-[6px_6px_0_0_var(--color-ink)]",
        accentBorder[accent],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default Panel;
