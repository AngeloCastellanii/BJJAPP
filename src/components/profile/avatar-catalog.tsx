"use client";

import { cn } from "@/lib/cn";
import {
  AVATAR_CATALOG_SEEDS,
  DICEBEAR_STYLES,
  dicebearUrl,
  parseDicebearUrl,
  type DicebearStyle,
} from "@/lib/media";
import { Shuffle } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

export function AvatarCatalog({
  value,
  onChange,
  preferredSeed,
}: {
  value: string | null;
  onChange: (url: string) => void;
  preferredSeed?: string;
}) {
  const parsed = parseDicebearUrl(value);
  const [style, setStyle] = useState<DicebearStyle>(
    parsed?.style ?? "notionists",
  );
  const [page, setPage] = useState(0);
  const [customSeed, setCustomSeed] = useState(parsed?.seed ?? "");

  const seeds = useMemo(() => {
    const base: string[] = [...AVATAR_CATALOG_SEEDS];
    if (preferredSeed && !base.includes(preferredSeed)) {
      base.unshift(preferredSeed);
    }
    const offset = page * 12;
    return Array.from({ length: 24 }, (_, i) => {
      const idx = (i + offset) % base.length;
      return page === 0 ? base[idx] : `${base[idx]}-p${page}-${i}`;
    });
  }, [page, preferredSeed]);

  return (
    <div className="space-y-3 rounded-2xl border border-border/80 bg-surface-2/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Elige un avatar</p>
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted transition hover:bg-surface hover:text-foreground"
        >
          <Shuffle className="h-3.5 w-3.5" />
          Más opciones
        </button>
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none">
        {DICEBEAR_STYLES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setStyle(item.id)}
            className={cn(
              "shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition",
              style === item.id
                ? "bg-surface text-foreground shadow-soft"
                : "text-muted hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {seeds.map((seed) => {
          const url = dicebearUrl(style, seed);
          const selected = value === url;
          return (
            <button
              key={`${style}-${seed}`}
              type="button"
              onClick={() => {
                onChange(url);
                setCustomSeed(seed);
              }}
              aria-label={`Elegir avatar ${seed}`}
              aria-pressed={selected}
              className={cn(
                "relative aspect-square overflow-hidden rounded-2xl ring-2 transition",
                selected
                  ? "ring-foreground"
                  : "ring-transparent hover:ring-border",
              )}
            >
              <Image
                src={url}
                alt=""
                fill
                unoptimized
                className="object-cover"
                sizes="80px"
              />
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1 text-[13px] font-medium text-muted">
          Seed personalizado
          <input
            value={customSeed}
            onChange={(e) => setCustomSeed(e.target.value)}
            placeholder="escribe tu nombre o cualquier texto"
            className="mt-1.5 h-11 w-full rounded-2xl border border-border bg-surface px-3 text-[15px] text-foreground outline-none focus:border-foreground/20"
          />
        </label>
        <button
          type="button"
          disabled={!customSeed.trim()}
          onClick={() => onChange(dicebearUrl(style, customSeed.trim()))}
          className="h-11 rounded-2xl bg-surface px-4 text-sm font-medium shadow-soft transition hover:bg-border/40 disabled:opacity-40"
        >
          Usar seed
        </button>
      </div>
    </div>
  );
}
