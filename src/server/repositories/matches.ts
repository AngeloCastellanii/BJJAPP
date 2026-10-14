"use server";

import type { Match } from "@/lib/types";
import { getStore, uid } from "../mock/store";
import { getProfile, requireSession } from "./helpers";

function enrich(m: Match): Match {
  return {
    ...m,
    challenger: getProfile(m.challenger_id) ?? undefined,
    opponent: getProfile(m.opponent_id) ?? undefined,
    winner: m.winner_id ? getProfile(m.winner_id) : null,
  };
}

export async function listMyMatches(): Promise<Match[]> {
  const session = requireSession();
  return getStore()
    .matches.filter(
      (m) =>
        m.challenger_id === session.id || m.opponent_id === session.id,
    )
    .map(enrich)
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
}

export async function challengeMatch(input: {
  opponent_id: string;
  scheduled_at?: string;
  notes?: string;
  gathering_id?: string;
}): Promise<Match> {
  const session = requireSession();
  if (input.opponent_id === session.id) {
    throw new Error("No puedes retarte a ti mismo");
  }
  if (!getProfile(input.opponent_id)) {
    throw new Error("Oponente no encontrado");
  }

  const match: Match = {
    id: uid("match"),
    challenger_id: session.id,
    opponent_id: input.opponent_id,
    status: "pending",
    winner_id: null,
    notes: input.notes?.trim() || null,
    scheduled_at: input.scheduled_at || null,
    completed_at: null,
    gathering_id: input.gathering_id || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  getStore().matches.push(match);
  return enrich(match);
}

export async function respondMatch(
  id: string,
  action: "accepted" | "rejected" | "cancelled",
): Promise<Match> {
  const session = requireSession();
  const store = getStore();
  const idx = store.matches.findIndex((m) => m.id === id);
  if (idx < 0) throw new Error("Pelea no encontrada");

  const match = store.matches[idx];

  if (action === "cancelled") {
    if (match.challenger_id !== session.id && match.opponent_id !== session.id) {
      throw new Error("No autorizado");
    }
  } else if (match.opponent_id !== session.id) {
    throw new Error("Solo el retado puede aceptar o rechazar");
  }

  if (match.status === "completed") {
    throw new Error("La pelea ya está registrada");
  }

  store.matches[idx] = {
    ...match,
    status: action,
    updated_at: new Date().toISOString(),
  };

  return enrich(store.matches[idx]);
}

export async function completeMatch(
  id: string,
  winnerId: string,
  notes?: string,
): Promise<Match> {
  const session = requireSession();
  const store = getStore();
  const idx = store.matches.findIndex((m) => m.id === id);
  if (idx < 0) throw new Error("Pelea no encontrada");

  const match = store.matches[idx];
  if (match.challenger_id !== session.id && match.opponent_id !== session.id) {
    throw new Error("No autorizado");
  }
  if (match.status !== "accepted" && match.status !== "pending") {
    throw new Error("Estado inválido para registrar resultado");
  }
  if (winnerId !== match.challenger_id && winnerId !== match.opponent_id) {
    throw new Error("El ganador debe ser uno de los dos");
  }

  store.matches[idx] = {
    ...match,
    status: "completed",
    winner_id: winnerId,
    notes: notes?.trim() || match.notes,
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return enrich(store.matches[idx]);
}
