import {
  BookOpen,
  CalendarDays,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";

const actions = [
  { href: "/descubrir", label: "Gente", icon: Users },
  { href: "/roladas", label: "Roladas", icon: CalendarDays },
  { href: "/peleas", label: "Peleas", icon: Swords },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/tecnicas", label: "Técnicas", icon: BookOpen },
];

export function QuickActions() {
  return (
    <div className="animate-rise-delay-1 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className="flex min-w-19 flex-col items-center gap-2 rounded-2xl bg-surface px-3 py-3 shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-2 text-foreground">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="text-[11px] font-medium text-muted">
              {action.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
