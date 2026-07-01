import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TextProps extends ComponentPropsWithoutRef<"span"> {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  // only meaningful when as="label", allowed here so Label can render as a real <label>
  htmlFor?: string;
}

export const Display = ({ children, as: Tag = "h1", className, ...props }: TextProps) => (
  <Tag
    className={cn(
      "font-display text-5xl font-bold tracking-tight text-[var(--color-fg)] sm:text-6xl",
      className,
    )}
    {...props}
  >
    {children}
  </Tag>
);

export const Title = ({ children, as: Tag = "h2", className, ...props }: TextProps) => (
  <Tag
    className={cn("font-display text-2xl font-bold text-[var(--color-fg)] sm:text-3xl", className)}
    {...props}
  >
    {children}
  </Tag>
);

export const Subtitle = ({ children, as: Tag = "p", className, ...props }: TextProps) => (
  <Tag className={cn("text-base font-normal text-[var(--color-dim)]", className)} {...props}>
    {children}
  </Tag>
);

export const Value = ({ children, as: Tag = "span", className, ...props }: TextProps) => (
  <Tag
    className={cn(
      "font-mono text-3xl font-bold tabular-nums text-[var(--color-primary)]",
      className,
    )}
    {...props}
  >
    {children}
  </Tag>
);

export const Label = ({ children, as: Tag = "span", className, ...props }: TextProps) => (
  <Tag
    className={cn(
      "text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]",
      className,
    )}
    {...props}
  >
    {children}
  </Tag>
);

export const Body = ({ children, as: Tag = "p", className, ...props }: TextProps) => (
  <Tag className={cn("text-base leading-relaxed text-[var(--color-fg)]", className)} {...props}>
    {children}
  </Tag>
);
