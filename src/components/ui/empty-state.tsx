import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  className,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl bg-surface px-6 py-14 text-center shadow-sm",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-muted">
          {icon}
        </div>
      ) : null}
      <p className="font-display text-xl tracking-tight">{title}</p>
      {description ? (
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
