import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-fg shadow-soft hover:bg-foreground disabled:opacity-40",
  secondary:
    "bg-surface text-foreground border border-border shadow-soft hover:bg-surface-2 disabled:opacity-40",
  soft: "bg-accent-soft text-foreground hover:bg-border/70 disabled:opacity-40",
  ghost: "bg-transparent text-muted hover:bg-surface-2 hover:text-foreground disabled:opacity-40",
  danger:
    "bg-transparent text-danger border border-danger/20 hover:bg-danger/5 disabled:opacity-40",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-[15px]",
  icon: "h-10 w-10",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition duration-150 active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
