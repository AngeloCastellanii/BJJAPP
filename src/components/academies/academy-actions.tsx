"use client";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import {
  inviteToAcademy,
  leaveAcademy,
  requestJoinAcademy,
  respondAcademyInvite,
} from "@/server/repositories/academies";
import type { Profile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function JoinAcademyButton({ academyId }: { academyId: string }) {
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
              await requestJoinAcademy(academyId);
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Error");
            }
          });
        }}
      >
        Solicitar unirme
      </Button>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function RespondMembershipButton({
  membershipId,
  asStaff,
}: {
  membershipId: string;
  asStaff?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: "accepted" | "rejected" | "cancelled") => {
    setError(null);
    start(async () => {
      try {
        await respondAcademyInvite(membershipId, action);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  };

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2">
        {asStaff ? (
          <>
            <Button size="sm" disabled={pending} onClick={() => run("accepted")}>
              Aprobar
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() => run("rejected")}
            >
              Rechazar
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => run("cancelled")}
          >
            Cancelar solicitud
          </Button>
        )}
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function LeaveAcademyButton({ academyId }: { academyId: string }) {
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
              await leaveAcademy(academyId);
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Error");
            }
          });
        }}
      >
        Abandonar academia
      </Button>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function InviteAcademyMember({
  academyId,
  candidates,
}: {
  academyId: string;
  candidates: Profile[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [profileId, setProfileId] = useState(candidates[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  if (candidates.length === 0) {
    return <p className="text-sm text-muted">No hay candidatos para invitar.</p>;
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Select
        value={profileId}
        onChange={(e) => setProfileId(e.target.value)}
        className="sm:flex-1"
      >
        {candidates.map((p) => (
          <option key={p.id} value={p.id}>
            {p.display_name}
          </option>
        ))}
      </Select>
      <Button
        size="sm"
        disabled={pending || !profileId}
        onClick={() => {
          setError(null);
          start(async () => {
            try {
              await inviteToAcademy(academyId, profileId);
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Error");
            }
          });
        }}
      >
        Invitar a la academia
      </Button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
