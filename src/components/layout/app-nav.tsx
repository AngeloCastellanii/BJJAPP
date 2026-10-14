"use client";

import { cn } from "@/lib/cn";
import {
  CalendarDays,
  Home,
  Swords,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/descubrir", label: "Gente", icon: Users },
  { href: "/roladas", label: "Mat", icon: CalendarDays },
  { href: "/ranking", label: "Rank", icon: Trophy },
  { href: "/perfil", label: "Yo", icon: UserRound },
];

const more = [
  { href: "/peleas", label: "Peleas", icon: Swords },
  { href: "/open-mats", label: "Open mats" },
  { href: "/eventos", label: "Eventos" },
  { href: "/partners", label: "Partners" },
  { href: "/tecnicas", label: "Técnicas" },
  { href: "/blog", label: "Blog" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-70 border-r border-border/80 bg-surface/90 px-4 py-6 backdrop-blur-xl md:flex md:flex-col">
        <Link href="/" className="mb-10 px-3">
          <span className="font-display text-[1.75rem] tracking-tight">
            MatLink
          </span>
          <span className="mt-1 block text-[13px] text-muted">
            Tu vida en el tatami
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5">
          {items.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition",
                  active
                    ? "bg-accent text-accent-fg shadow-sm"
                    : "text-muted hover:bg-surface-2 hover:text-foreground",
                )}
              >
                <Icon className="size-4.5" strokeWidth={active ? 2.25 : 1.75} />
                {item.label === "Gente"
                  ? "Descubrir"
                  : item.label === "Mat"
                    ? "Roladas"
                    : item.label === "Rank"
                      ? "Ranking"
                      : item.label === "Yo"
                        ? "Perfil"
                        : item.label}
              </Link>
            );
          })}
          <div className="my-4 px-3">
            <div className="h-px bg-border" />
          </div>
          <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Más
          </p>
          {more.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center rounded-2xl px-3 text-sm transition",
                  active
                    ? "bg-accent-soft font-medium text-foreground"
                    : "text-muted hover:bg-surface-2 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-safe md:hidden">
        <div className="mx-auto mb-2 max-w-xl rounded-4xl border border-border/80 bg-surface/90 px-2 py-2 shadow-md backdrop-blur-xl">
          <ul className="grid grid-cols-5">
            {items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-medium transition",
                      active
                        ? "bg-accent-soft text-foreground"
                        : "text-muted",
                    )}
                  >
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={active ? 2.25 : 1.75}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
