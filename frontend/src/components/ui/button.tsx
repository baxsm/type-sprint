import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[var(--color-primary)] text-[var(--color-primary-fg)]",
  secondary: "bg-[var(--color-surface-raised)] text-[var(--color-fg)]",
  danger: "bg-[var(--color-incorrect)] text-[var(--color-primary-fg)]",
};

const Button = ({ variant = "primary", className, ...props }: ButtonProps) => {
  return (
    <button
      type="button"
      className={cn(
        "border-[3px] border-[var(--color-border)] px-4 py-2 font-bold shadow-[4px_4px_0_0_var(--color-ink)] transition-transform active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
};

export default Button;
