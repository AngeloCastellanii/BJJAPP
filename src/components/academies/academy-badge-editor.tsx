"use client";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { updateAcademyAppearance } from "@/server/repositories/academies";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function AcademyBadgeEditor({
  academyId,
  badgeLabel,
  badgeColor,
}: {
  academyId: string;
  badgeLabel: string;
  badgeColor: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [label, setLabel] = useState(badgeLabel);
  const [color, setColor] = useState(badgeColor || "#161616");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)}>
        Editar distintivo
      </Button>
    );
  }

  return (
    <form
      className="space-y-3 rounded-2xl border border-border/80 bg-surface-2/50 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          try {
            await updateAcademyAppearance({
              academy_id: academyId,
              badge_label: label,
              badge_color: color,
            });
            setOpen(false);
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Error");
          }
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <Label htmlFor="badge_label_edit">Texto</Label>
          <Input
            id="badge_label_edit"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="badge_color_edit">Color</Label>
          <Input
            id="badge_color_edit"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-11 w-16 p-1"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="inline-flex rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white"
          style={{ backgroundColor: color }}
        >
          {label || "Academia"}
        </span>
        <span className="text-xs text-muted">Vista previa</span>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          Guardar
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
