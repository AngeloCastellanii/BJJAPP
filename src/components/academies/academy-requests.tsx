"use client";

import { Button } from "@/components/ui/button";
import { SoftPanel } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  requestAcademy,
  reviewAcademyRequest,
} from "@/server/repositories/academies";
import type { Academy } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function RequestAcademyForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!open) {
    return (
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        Solicitar academia
      </Button>
    );
  }

  return (
    <SoftPanel className="mb-5 p-4">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setError(null);
          start(async () => {
            try {
              await requestAcademy({
                name: String(fd.get("name") || ""),
                city: String(fd.get("city") || ""),
                description: String(fd.get("description") || ""),
              });
              setSent(true);
              setOpen(false);
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Error");
            }
          });
        }}
      >
        <p className="font-display text-xl tracking-tight">Solicitar academia</p>
        <p className="text-sm text-muted">
          La revisamos antes de publicarla.
        </p>
        <div>
          <Label htmlFor="req_name">Nombre</Label>
          <Input id="req_name" name="name" required />
        </div>
        <div>
          <Label htmlFor="req_city">Ciudad</Label>
          <Input id="req_city" name="city" required />
        </div>
        <div>
          <Label htmlFor="req_description">Descripción</Label>
          <Textarea id="req_description" name="description" />
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {sent ? <p className="text-sm text-success">Solicitud enviada</p> : null}
        <div className="flex gap-2">
          <Button size="sm" disabled={pending}>
            Enviar solicitud
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
    </SoftPanel>
  );
}

export function AcademyRequestList({ requests }: { requests: Academy[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  if (requests.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="px-1 text-sm font-medium text-muted">
        Academias por aprobar
      </h2>
      <SoftPanel>
        {requests.map((academy) => (
          <div
            key={academy.id}
            className="flex flex-col gap-3 border-b border-border/80 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{academy.name}</p>
              <p className="text-sm text-muted">
                {academy.city}
                {academy.description ? ` · ${academy.description}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await reviewAcademyRequest(academy.id, "approved");
                    router.refresh();
                  })
                }
              >
                Aprobar
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await reviewAcademyRequest(academy.id, "rejected");
                    router.refresh();
                  })
                }
              >
                Rechazar
              </Button>
            </div>
          </div>
        ))}
      </SoftPanel>
    </section>
  );
}
