"use client";

import { Button } from "@/components/ui/button";
import {
  endPartnership,
  invitePartner,
  respondPartnership,
} from "@/server/repositories/partners";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function InvitePartnerButton({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        size="sm"
        disabled={pending}
        onClick={() => {
          setError(null);
          start(async () => {
            try {
              await invitePartner(profileId);
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Error");
            }
          });
        }}
      >
        Invitar
      </Button>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function PartnershipRespond({
  id,
  role,
}: {
  id: string;
  role: "requester" | "addressee";
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: "accepted" | "rejected" | "cancelled") => {
    setError(null);
    start(async () => {
      try {
        await respondPartnership(id, action);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  };

  if (role === "addressee") {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button size="sm" disabled={pending} onClick={() => run("accepted")}>
            Aceptar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() => run("rejected")}
          >
            Rechazar
          </Button>
        </div>
        {error ? <p className="text-xs text-danger">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => run("cancelled")}
      >
        Cancelar
      </Button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function EndPartnershipButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => {
          setError(null);
          start(async () => {
            try {
              await endPartnership(id);
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Error");
            }
          });
        }}
      >
        Terminar
      </Button>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
