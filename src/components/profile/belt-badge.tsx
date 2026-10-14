import { BELT_COLORS, formatBelt } from "@/lib/belts";
import { cn } from "@/lib/cn";
import type { Belt } from "@/lib/types";

export function BeltBadge({
  belt,
  stripes,
  className,
  compact = false,
}: {
  belt: Belt;
  stripes: number;
  className?: string;
  compact?: boolean;
}) {
  const color = BELT_COLORS[belt];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-xl bg-surface-2 px-2.5 py-1 text-xs font-medium text-foreground/80",
        className,
      )}
    >
      <span
        className="relative h-2 w-7 overflow-hidden rounded-[3px] ring-1 ring-black/10"
        style={{ backgroundColor: color }}
        aria-hidden
      >
        {stripes > 0 ? (
          <span className="absolute inset-y-0 right-0.5 flex items-center gap-0.5">
            {Array.from({ length: stripes }).map((_, i) => (
              <span key={i} className="h-1.5 w-0.5 rounded-sm bg-black/70" />
            ))}
          </span>
        ) : null}
      </span>
      {!compact ? <span>{formatBelt(belt, stripes)}</span> : null}
    </span>
  );
}
