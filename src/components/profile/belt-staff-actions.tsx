"use client";

import { Button } from "@/components/ui/button";
import { SoftPanel } from "@/components/ui/card";
import { Label, Select, Textarea } from "@/components/ui/input";
import { BELTS, BELT_LABELS } from "@/lib/belts";
import { canPromoteBelts, canVerifyBelts } from "@/lib/roles";
import type { Belt, Profile } from "@/lib/types";
import { promoteBelt, verifyBelt } from "@/server/repositories/belts";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function BeltStaffActions({
  session,
  target,
}: {
  session: Profile;
  target: Profile;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const sameAcademy =
    !!session.academy_id && session.academy_id === target.academy_id;
  const showVerify = canVerifyBelts(session.role) && sameAcademy && !target.belt_verified;
  const showPromote = canPromoteBelts(session.role) && sameAcademy;

  if (session.id === target.id || (!showVerify && !showPromote)) return null;

  return (
    <SoftPanel className="space-y-3 p-4">
      <p className="text-sm font-medium">Staff · cinturón y grados</p>
      {showVerify ? (
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => {
            setError(null);
            setOk(null);
            start(async () => {
              try {
                await verifyBelt(target.id);
                setOk("Cinturón verificado");
                router.refresh();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Error");
              }
            });
          }}
        >
          Verificar cinturón
        </Button>
      ) : null}
      {showPromote ? (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setError(null);
            setOk(null);
            start(async () => {
              try {
                await promoteBelt({
                  profile_id: target.id,
                  belt: fd.get("belt") as Belt,
                  stripes: Number(fd.get("stripes")),
                  notes: String(fd.get("notes") || ""),
                });
                setOk("Pase de grado registrado");
                router.refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Error");
              }
            });
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="belt">Nuevo cinturón</Label>
              <Select id="belt" name="belt" defaultValue={target.belt}>
                {BELTS.map((b) => (
                  <option key={b} value={b}>
                    {BELT_LABELS[b]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="stripes">Grados</Label>
              <Select
                id="stripes"
                name="stripes"
                defaultValue={String(target.stripes)}
              >
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Textarea name="notes" placeholder="Notas del pase (opcional)" />
          <Button size="sm" disabled={pending}>
            Registrar pase de grado
          </Button>
        </form>
      ) : null}
      {ok ? <p className="text-xs text-success">{ok}</p> : null}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </SoftPanel>
  );
}
