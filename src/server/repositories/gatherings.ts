"use server";

import type {
  Gathering,
  GatheringParticipant,
  GatheringType,
} from "@/lib/types";
import { getStore, uid } from "../mock/store";
import { getAcademy, getProfile, requireSession } from "./helpers";

function enrich(g: Gathering): Gathering {
  const store = getStore();
  const participants = store.gatheringParticipants
    .filter((p) => p.gathering_id === g.id)
    .map((p) => ({
      ...p,
      profile: getProfile(p.profile_id) ?? undefined,
    }));

  return {
    ...g,
    host: getProfile(g.host_id) ?? undefined,
    academy: getAcademy(g.academy_id),
    participant_count: participants.filter((p) => p.status === "joined").length,
    participants,
  };
}

export async function listGatherings(options?: {
  type?: GatheringType;
  archived?: boolean;
}): Promise<Gathering[]> {
  const store = getStore();
  return store.gatherings
    .filter((g) => {
      if (options?.type && g.type !== options.type) return false;
      if (options?.archived) return g.status === "archived";
      return g.status === "upcoming" || g.status === "ongoing";
    })
    .map(enrich)
    .sort(
      (a, b) =>
        new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    );
}

export async function getGathering(id: string): Promise<Gathering | null> {
  const g = getStore().gatherings.find((item) => item.id === id);
  return g ? enrich(g) : null;
}

export async function createGathering(input: {
  type: GatheringType;
  title: string;
  description?: string;
  location_name: string;
  city: string;
  starts_at: string;
  ends_at?: string;
  capacity?: number;
}): Promise<Gathering> {
  const session = requireSession();
  const store = getStore();

  const gathering: Gathering = {
    id: uid("gath"),
    type: input.type,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    location_name: input.location_name.trim(),
    city: input.city.trim(),
    starts_at: input.starts_at,
    ends_at: input.ends_at || null,
    capacity: input.capacity ?? null,
    host_id: session.id,
    academy_id: session.academy_id,
    status: "upcoming",
    created_at: new Date().toISOString(),
  };

  store.gatherings.push(gathering);
  store.gatheringParticipants.push({
    id: uid("gp"),
    gathering_id: gathering.id,
    profile_id: session.id,
    status: "joined",
    created_at: new Date().toISOString(),
  });

  return enrich(gathering);
}

export async function joinGathering(id: string): Promise<Gathering> {
  const session = requireSession();
  const store = getStore();
  const gathering = store.gatherings.find((g) => g.id === id);
  if (!gathering) throw new Error("Encuentro no encontrado");
  if (gathering.status === "archived" || gathering.status === "cancelled") {
    throw new Error("Este encuentro ya no acepta participantes");
  }

  const joined = store.gatheringParticipants.filter(
    (p) => p.gathering_id === id && p.status === "joined",
  );
  if (gathering.capacity && joined.length >= gathering.capacity) {
    throw new Error("Cupo completo");
  }

  const existing = store.gatheringParticipants.find(
    (p) => p.gathering_id === id && p.profile_id === session.id,
  );

  if (existing) {
    existing.status = "joined";
  } else {
    store.gatheringParticipants.push({
      id: uid("gp"),
      gathering_id: id,
      profile_id: session.id,
      status: "joined",
      created_at: new Date().toISOString(),
    });
  }

  return enrich(gathering);
}

export async function leaveGathering(id: string): Promise<Gathering> {
  const session = requireSession();
  const store = getStore();
  const gathering = store.gatherings.find((g) => g.id === id);
  if (!gathering) throw new Error("Encuentro no encontrado");
  if (gathering.host_id === session.id) {
    throw new Error("El anfitrión no puede abandonar. Cancela el encuentro.");
  }

  const participant = store.gatheringParticipants.find(
    (p) => p.gathering_id === id && p.profile_id === session.id,
  );
  if (participant) participant.status = "cancelled";

  return enrich(gathering);
}

export async function inviteToGathering(
  gatheringId: string,
  profileId: string,
): Promise<GatheringParticipant> {
  const session = requireSession();
  const store = getStore();
  const gathering = store.gatherings.find((g) => g.id === gatheringId);
  if (!gathering) throw new Error("Encuentro no encontrado");
  if (gathering.host_id !== session.id) {
    throw new Error("Solo el anfitrión puede invitar");
  }
  if (!getProfile(profileId)) throw new Error("Usuario no encontrado");

  const existing = store.gatheringParticipants.find(
    (p) => p.gathering_id === gatheringId && p.profile_id === profileId,
  );
  if (existing) {
    if (existing.status === "joined") throw new Error("Ya está unido");
    existing.status = "invited";
    return { ...existing, profile: getProfile(profileId) ?? undefined };
  }

  const participant: GatheringParticipant = {
    id: uid("gp"),
    gathering_id: gatheringId,
    profile_id: profileId,
    status: "invited",
    created_at: new Date().toISOString(),
  };
  store.gatheringParticipants.push(participant);
  return { ...participant, profile: getProfile(profileId) ?? undefined };
}

export async function respondGatheringInvite(
  gatheringId: string,
  action: "joined" | "declined",
): Promise<Gathering> {
  const session = requireSession();
  const store = getStore();
  const participant = store.gatheringParticipants.find(
    (p) => p.gathering_id === gatheringId && p.profile_id === session.id,
  );
  if (!participant || participant.status !== "invited") {
    throw new Error("No tienes una invitación pendiente");
  }

  if (action === "joined") {
    const gathering = store.gatherings.find((g) => g.id === gatheringId);
    if (!gathering) throw new Error("Encuentro no encontrado");
    const joined = store.gatheringParticipants.filter(
      (p) => p.gathering_id === gatheringId && p.status === "joined",
    );
    if (gathering.capacity && joined.length >= gathering.capacity) {
      throw new Error("Cupo completo");
    }
  }

  participant.status = action;
  const gathering = store.gatherings.find((g) => g.id === gatheringId);
  if (!gathering) throw new Error("Encuentro no encontrado");
  return enrich(gathering);
}
