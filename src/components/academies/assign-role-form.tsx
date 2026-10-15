"use client";

import { Button } from "@/components/ui/button";
import { SoftPanel } from "@/components/ui/card";
import { Label, Select } from "@/components/ui/input";
import { ROLE_LABELS } from "@/lib/roles";
import type { Academy, Profile, UserRole } from "@/lib/types";
import { assignMemberRole } from "@/server/repositories/academies";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const ROLES: UserRole[] = ["user", "coach", "master", "owner"];

export function AssignRoleForm({
  profiles,
  academies,
}: {
  profiles: Profile[];
  academies: Academy[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  return (
    <SoftPanel className="space-y-3 p-4">
      <div>
        <p className="font-medium">Asignar rol / puesto</p>
        <p className="mt-0.5 text-sm text-muted">
          Define academia y cargo de cada persona.
        </p>
      </div>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setError(null);
          setOk(null);
          start(async () => {
            try {
              const updated = await assignMemberRole({
                profile_id: String(fd.get("profile_id")),
                role: fd.get("role") as UserRole,
                academy_id: String(fd.get("academy_id") || "") || null,
              });
              setOk(
                `${updated.display_name} → ${ROLE_LABELS[updated.role]}${
                  updated.academy ? ` · ${updated.academy.name}` : ""
                }`,
              );
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Error");
            }
          });
        }}
      >
        <div>
          <Label htmlFor="profile_id">Persona</Label>
          <Select id="profile_id" name="profile_id" required>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display_name} · {ROLE_LABELS[p.role]}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="role">Rol</Label>
            <Select id="role" name="role" defaultValue="user" required>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="academy_id">Gimnasio</Label>
            <Select id="academy_id" name="academy_id">
              <option value="">Sin gimnasio</option>
              {academies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {a.city}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {ok ? <p className="text-sm text-success">{ok}</p> : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button size="sm" disabled={pending}>
          Guardar asignación
        </Button>
      </form>
    </SoftPanel>
  );
}
