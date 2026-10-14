"use client";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import {
  challengeMatch,
  completeMatch,
  respondMatch,
} from "@/server/repositories/matches";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function ChallengeButton({
  opponentId,
  label = "Retar a pelea",
}: {
  opponentId: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        size="sm"
        variant="soft"
        disabled={pending}
        onClick={() => {
          setError(null);
          start(async () => {
            try {
              await challengeMatch({ opponent_id: opponentId });
              router.push("/peleas");
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Error");
            }
          });
        }}
      >
        {label}
      </Button>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function MatchRespondButtons({
  matchId,
  isOpponent,
}: {
  matchId: string;
  isOpponent: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: "accepted" | "rejected" | "cancelled") => {
    setError(null);
    start(async () => {
      try {
        await respondMatch(matchId, action);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {isOpponent ? (
          <>
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
          </>
        ) : null}
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => run("cancelled")}
        >
          Cancelar
        </Button>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function CompleteMatchForm({
  matchId,
  challengerId,
  opponentId,
  challengerName,
  opponentName,
}: {
  matchId: string;
  challengerId: string;
  opponentId: string;
  challengerName: string;
  opponentName: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [winnerId, setWinnerId] = useState(challengerId);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={winnerId}
          onChange={(e) => setWinnerId(e.target.value)}
          className="w-auto min-w-40"
        >
          <option value={challengerId}>{challengerName}</option>
          <option value={opponentId}>{opponentName}</option>
        </Select>
        <Button
          size="sm"
          disabled={pending}
          onClick={() => {
            setError(null);
            start(async () => {
              try {
                await completeMatch(matchId, winnerId);
                router.refresh();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Error");
              }
            });
          }}
        >
          Registrar ganador
        </Button>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
