"use client";

import { Button } from "@/components/ui/button";
import { SoftPanel } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import type { Profile } from "@/lib/types";
import { inviteToGathering } from "@/server/repositories/gatherings";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function InviteToGathering({
  gatheringId,
  candidates,
}: {
  gatheringId: string;
  candidates: Profile[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [profileId, setProfileId] = useState(candidates[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  if (candidates.length === 0) {
    return (
      <SoftPanel className="p-4">
        <p className="text-sm text-muted">
          No hay personas disponibles para invitar. Ve a Descubrir o Partners.
        </p>
      </SoftPanel>
    );
  }

  return (
    <SoftPanel className="space-y-3 p-4">
      <p className="text-sm font-medium">Invitar a alguien</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select
          value={profileId}
          onChange={(e) => {
            setProfileId(e.target.value);
            setOk(false);
          }}
          className="sm:flex-1"
        >
          {candidates.map((p) => (
            <option key={p.id} value={p.id}>
              {p.display_name} · @{p.username}
            </option>
          ))}
        </Select>
        <Button
          disabled={pending || !profileId}
          onClick={() => {
            setError(null);
            setOk(false);
            start(async () => {
              try {
                await inviteToGathering(gatheringId, profileId);
                setOk(true);
                router.refresh();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Error");
              }
            });
          }}
        >
          Invitar
        </Button>
      </div>
      {ok ? <p className="text-xs text-success">Invitación enviada</p> : null}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </SoftPanel>
  );
}
