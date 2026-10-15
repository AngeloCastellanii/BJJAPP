"use client";

import { cn } from "@/lib/cn";
import {
  BookOpen,
  CalendarDays,
  Home,
  Menu,
  Newspaper,
  Swords,
  Trophy,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const items = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/descubrir", label: "Gente", icon: Users },
  { href: "/roladas", label: "Mat", icon: CalendarDays },
  { href: "/perfil", label: "Yo", icon: UserRound },
];

const more = [
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/peleas", label: "Peleas", icon: Swords },
  { href: "/competencias", label: "Competencias", icon: Trophy },
  { href: "/escuelas", label: "Academia", icon: Users },
  { href: "/open-mats", label: "Open mats", icon: CalendarDays },
  { href: "/partners", label: "Amigos", icon: Users },
  { href: "/tecnicas", label: "Técnicas", icon: BookOpen },
  { href: "/blog", label: "Blog", icon: Newspaper },
];

function labelFor(item: (typeof items)[number]) {
  if (item.label === "Gente") return "Descubrir";
  if (item.label === "Mat") return "Roladas";
  if (item.label === "Yo") return "Perfil";
  return item.label;
}

export function AppNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = more.some((item) => pathname.startsWith(item.href));
  const closeMore = () => setMoreOpen(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-70 border-r border-border/80 bg-surface/90 px-4 py-6 backdrop-blur-xl md:flex md:flex-col">
        <Link href="/" className="mb-10 px-3">
          <span className="font-display text-[1.75rem] tracking-tight">
            BJJApp
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
                    ? "bg-surface-2 text-foreground"
                    : "text-muted hover:bg-surface-2 hover:text-foreground",
                )}
              >
                <Icon className="size-4.5" strokeWidth={active ? 2.25 : 1.75} />
                {labelFor(item)}
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

      {moreOpen ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-45 bg-foreground/20 backdrop-blur-[2px] md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      ) : null}

      {moreOpen ? (
        <div className="fixed inset-x-0 bottom-23 z-50 px-3 md:hidden">
          <div className="mx-auto max-w-xl rounded-4xl border border-border/80 bg-surface p-3 shadow-lift">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-sm font-medium">Más módulos</p>
              <button
                type="button"
                className="rounded-xl p-2 text-muted hover:bg-surface-2 hover:text-foreground"
                onClick={() => setMoreOpen(false)}
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {more.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMore}
                    className={cn(
                      "flex items-center gap-2 rounded-2xl px-3 py-3 text-sm transition",
                      active
                        ? "bg-surface-2 text-foreground"
                        : "text-foreground hover:bg-surface-2",
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-safe md:hidden">
        <div className="mx-auto mb-2 max-w-xl rounded-4xl border border-border/80 bg-surface/90 px-2 py-2 shadow-lift backdrop-blur-xl">
          <ul className="grid grid-cols-5">
            {items.slice(0, 3).map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMore}
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
            <li>
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className={cn(
                  "flex h-14 w-full flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-medium transition",
                  moreOpen || moreActive
                    ? "bg-accent-soft text-foreground"
                    : "text-muted",
                )}
              >
                <Menu
                  className="h-5 w-5"
                  strokeWidth={moreOpen || moreActive ? 2.25 : 1.75}
                />
                Más
              </button>
            </li>
            {items.slice(3).map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMore}
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
