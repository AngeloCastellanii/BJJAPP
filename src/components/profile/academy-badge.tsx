import type { Academy } from "@/lib/types";
import Link from "next/link";

export function AcademyBadge({
  academy,
  href,
}: {
  academy: Academy;
  href?: string;
}) {
  const content = (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white"
      style={{ backgroundColor: academy.badge_color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-white/80"
        aria-hidden
      />
      {academy.badge_label}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80">
        {content}
      </Link>
    );
  }
  return content;
}
