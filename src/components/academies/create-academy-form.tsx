"use client";

import { Button } from "@/components/ui/button";
import { SoftPanel } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createAcademy } from "@/server/repositories/academies";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function CreateAcademyForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Nuevo gimnasio
      </Button>
    );
  }

  return (
    <SoftPanel className="mb-5 animate-rise p-4">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setError(null);
          start(async () => {
            try {
              const academy = await createAcademy({
                name: String(fd.get("name") || ""),
                city: String(fd.get("city") || ""),
                description: String(fd.get("description") || ""),
                badge_label: String(fd.get("badge_label") || ""),
                badge_color: String(fd.get("badge_color") || "#1f3a5f"),
              });
              setOpen(false);
              router.push(`/escuelas/${academy.slug}`);
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Error");
            }
          });
        }}
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-xl tracking-tight">Nuevo gimnasio</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Cerrar
          </Button>
        </div>
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" required placeholder="Nueva Era" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" name="city" required placeholder="Maracaibo" />
          </div>
          <div>
            <Label htmlFor="badge_label">Distintivo</Label>
            <Input
              id="badge_label"
              name="badge_label"
              placeholder="Nueva Era"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="badge_color">Color del badge</Label>
          <Input
            id="badge_color"
            name="badge_color"
            type="color"
            defaultValue="#14532d"
            className="h-12 max-w-28 p-1"
          />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Entrenamiento, open mats, competencia..."
          />
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button className="w-full" disabled={pending}>
          Crear gimnasio
        </Button>
      </form>
    </SoftPanel>
  );
}
