"use client";

import { Button } from "@/components/ui/button";
import { SoftPanel } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import type { GatheringType } from "@/lib/types";
import { createGathering } from "@/server/repositories/gatherings";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function CreateGatheringForm({
  defaultType,
}: {
  defaultType: GatheringType;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const label =
    defaultType === "rolada"
      ? "rolada"
      : defaultType === "open_mat"
        ? "open mat"
        : "evento";

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Nueva
      </Button>
    );
  }

  return (
    <SoftPanel className="mb-5 p-4 animate-rise">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setError(null);
          start(async () => {
            try {
              const g = await createGathering({
                type: fd.get("type") as GatheringType,
                title: String(fd.get("title") || ""),
                description: String(fd.get("description") || ""),
                location_name: String(fd.get("location_name") || ""),
                city: String(fd.get("city") || ""),
                starts_at: new Date(String(fd.get("starts_at"))).toISOString(),
                capacity: Number(fd.get("capacity") || 0) || undefined,
              });
              setOpen(false);
              const base =
                g.type === "rolada"
                  ? "/roladas"
                  : g.type === "open_mat"
                    ? "/open-mats"
                    : "/eventos";
              router.push(`${base}/${g.id}`);
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Error");
            }
          });
        }}
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-xl tracking-tight">Nueva {label}</p>
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select id="type" name="type" defaultValue={defaultType}>
              <option value="rolada">Rolada</option>
              <option value="open_mat">Open mat</option>
              <option value="event">Evento</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="capacity">Cupo</Label>
            <Input id="capacity" name="capacity" type="number" min={2} placeholder="16" />
          </div>
        </div>
        <div>
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" required placeholder="Rolada nocturna" />
        </div>
        <div>
          <Label htmlFor="description">Detalle</Label>
          <Textarea id="description" name="description" placeholder="Rondas, gi/nogi, nivel..." />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="location_name">Lugar</Label>
            <Input id="location_name" name="location_name" required />
          </div>
          <div>
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" name="city" required defaultValue="Caracas" />
          </div>
        </div>
        <div>
          <Label htmlFor="starts_at">Cuándo</Label>
          <Input id="starts_at" name="starts_at" type="datetime-local" required />
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button className="w-full" disabled={pending}>
          Publicar {label}
        </Button>
      </form>
    </SoftPanel>
  );
}
