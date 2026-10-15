"use client";

import { Button } from "@/components/ui/button";
import { SoftPanel } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  canOrganizeType,
  gatheringPath,
  gatheringTypeLabel,
} from "@/lib/roles";
import type { GatheringType, UserRole } from "@/lib/types";
import { createGathering } from "@/server/repositories/gatherings";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const ALL_TYPES: GatheringType[] = [
  "rolada",
  "open_mat",
  "event",
  "seminar",
  "competition",
  "tope",
];

export function CreateGatheringForm({
  defaultType,
  role,
  hasAcademy,
}: {
  defaultType: GatheringType;
  role: UserRole;
  hasAcademy?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const allowed = ALL_TYPES.filter((t) => canOrganizeType(role, t));
  const canCreate = canOrganizeType(role, defaultType);

  if (!canCreate) {
    return (
      <p className="text-xs text-muted">
        Tu rol ({role}) no puede crear {gatheringTypeLabel(defaultType).toLowerCase()}s.
      </p>
    );
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Nueva
      </Button>
    );
  }

  return (
    <SoftPanel className="mb-5 animate-rise p-4">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const fd = new FormData(form);
          setError(null);
          start(async () => {
            try {
              const type = fd.get("type") as GatheringType;
              const g = await createGathering({
                type,
                title: String(fd.get("title") || ""),
                description: String(fd.get("description") || ""),
                location_name: String(fd.get("location_name") || ""),
                city: String(fd.get("city") || ""),
                starts_at: new Date(String(fd.get("starts_at"))).toISOString(),
                capacity: Number(fd.get("capacity") || 0) || undefined,
                invite_clan: fd.get("invite_clan") === "on",
              });
              setOpen(false);
              router.push(`${gatheringPath(g.type)}/${g.id}`);
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Error");
            }
          });
        }}
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-xl tracking-tight">
            Nuevo encuentro
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Cerrar
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select id="type" name="type" defaultValue={defaultType}>
              {allowed.map((t) => (
                <option key={t} value={t}>
                  {gatheringTypeLabel(t)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="capacity">Cupo</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min={2}
              placeholder="16"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="Rolada nocturna"
          />
        </div>
        <div>
          <Label htmlFor="description">Detalle</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Rondas, gi/nogi, nivel..."
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="location_name">Lugar</Label>
            <Input id="location_name" name="location_name" required />
          </div>
          <div>
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              name="city"
              required
              defaultValue="Caracas"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="starts_at">Cuándo</Label>
          <Input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            required
          />
        </div>
        {hasAcademy ? (
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              name="invite_clan"
              className="rounded border-border"
            />
            Invitar a todo el clan / escuela
          </label>
        ) : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button className="w-full" disabled={pending}>
          Publicar
        </Button>
      </form>
    </SoftPanel>
  );
}
