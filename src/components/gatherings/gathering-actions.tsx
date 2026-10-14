"use client";

import { Button } from "@/components/ui/button";
import {
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
}: {
  gatheringId: string;
  myStatus?: string;
  isHost: boolean;
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
          <p className="self-center text-sm text-muted">Eres el anfitrión</p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
