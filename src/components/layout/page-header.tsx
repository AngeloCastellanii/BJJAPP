import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
  className,
  eyebrow,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  eyebrow?: string;
}) {
  return (
    <header
      className={cn(
        "mb-6 flex items-start justify-between gap-4 animate-rise",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-[2rem] leading-[1.05] tracking-tight md:text-[2.35rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pt-1">{action}</div> : null}
    </header>
  );
}
