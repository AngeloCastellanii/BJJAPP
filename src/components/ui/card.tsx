import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export function SoftPanel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-border/70 bg-surface shadow-soft",
        className,
      )}
      {...props}
    />
  );
}
