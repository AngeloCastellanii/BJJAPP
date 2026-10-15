"use client";

import { Button } from "@/components/ui/button";
import {
  cancelGathering,
  joinGathering,
  leaveGathering,
  respondGatheringInvite,
} from "@/server/repositories/gatherings";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function GatheringActions({
  gatheringId,
  myStatus,
  isHost,
  isActive = true,
}: {
  gatheringId: string;
  myStatus?: string;
  isHost: boolean;
  isActive?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<unknown>) => {
    setError(null);
    start(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  };

  if (!isActive) {
    return <p className="text-sm text-muted">Este encuentro ya no está activo.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {myStatus === "invited" ? (
          <>
            <Button
              disabled={pending}
              onClick={() =>
                run(() => respondGatheringInvite(gatheringId, "joined"))
              }
            >
              Aceptar invitación
            </Button>
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() =>
                run(() => respondGatheringInvite(gatheringId, "declined"))
              }
            >
              Rechazar
            </Button>
          </>
        ) : null}
        {myStatus === "joined" && !isHost ? (
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => leaveGathering(gatheringId))}
          >
            Abandonar
          </Button>
        ) : null}
        {!myStatus || myStatus === "cancelled" || myStatus === "declined" ? (
          <Button
            disabled={pending}
            onClick={() => run(() => joinGathering(gatheringId))}
          >
            Unirme
          </Button>
        ) : null}
        {isHost ? (
          <Button
            variant="danger"
            disabled={pending}
            onClick={() => run(() => cancelGathering(gatheringId))}
          >
            Cancelar encuentro
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
