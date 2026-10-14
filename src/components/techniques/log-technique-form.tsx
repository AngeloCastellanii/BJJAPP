"use client";

import { Button } from "@/components/ui/button";
import { SoftPanel } from "@/components/ui/card";
import { Label, Select, Textarea } from "@/components/ui/input";
import type { Technique } from "@/lib/types";
import { logTechnique } from "@/server/repositories/techniques";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LogTechniqueForm({ techniques }: { techniques: Technique[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <SoftPanel className="animate-rise-delay-1 p-4">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const fd = new FormData(form);
          setError(null);
          start(async () => {
            try {
              await logTechnique({
                technique_id: String(fd.get("technique_id")),
                notes: String(fd.get("notes") || ""),
              });
              form.reset();
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Error");
            }
          });
        }}
      >
        <p className="font-display text-xl tracking-tight">Registrar práctica</p>
        <div>
          <Label htmlFor="technique_id">Técnica</Label>
          <Select id="technique_id" name="technique_id" required>
            {techniques.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {t.category}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="notes">Notas</Label>
          <Textarea id="notes" name="notes" placeholder="Qué salió bien o mal" />
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button className="w-full" disabled={pending}>
          Guardar
        </Button>
      </form>
    </SoftPanel>
  );
}
