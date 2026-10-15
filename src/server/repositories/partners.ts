"use server";

import type { Partnership } from "@/lib/types";
import { getStore, uid } from "../mock/store";
import { getProfile, requireSession } from "./helpers";

function enrich(p: Partnership): Partnership {
  return {
    ...p,
    requester: getProfile(p.requester_id) ?? undefined,
    addressee: getProfile(p.addressee_id) ?? undefined,
  };
}

export async function listMyPartnerships(): Promise<Partnership[]> {
  const session = await requireSession();
  const store = getStore();
  return store.partnerships
    .filter(
      (p) =>
        p.requester_id === session.id || p.addressee_id === session.id,
    )
    .map(enrich)
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
}

export async function invitePartner(addresseeId: string): Promise<Partnership> {
  const session = await requireSession();
  if (addresseeId === session.id) {
    throw new Error("No puedes invitarte a ti mismo");
  }

  const store = getStore();
  if (!getProfile(addresseeId)) throw new Error("Usuario no encontrado");

  const existing = store.partnerships.find(
    (p) =>
      (p.requester_id === session.id && p.addressee_id === addresseeId) ||
      (p.requester_id === addresseeId && p.addressee_id === session.id),
  );

  if (existing && (existing.status === "pending" || existing.status === "accepted")) {
    throw new Error("Ya son amigos o hay una invitación pendiente");
  }

  const partnership: Partnership = {
    id: uid("part"),
    requester_id: session.id,
    addressee_id: addresseeId,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.partnerships.push(partnership);
  return enrich(partnership);
}

export async function respondPartnership(
  id: string,
  action: "accepted" | "rejected" | "cancelled",
): Promise<Partnership> {
  const session = await requireSession();
  const store = getStore();
  const idx = store.partnerships.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error("Invitación no encontrada");

  const item = store.partnerships[idx];

  if (action === "cancelled") {
    if (item.requester_id !== session.id) {
      throw new Error("Solo quien invita puede cancelar");
    }
  } else if (item.addressee_id !== session.id) {
    throw new Error("Solo el destinatario puede responder");
  }

  store.partnerships[idx] = {
    ...item,
    status: action,
    updated_at: new Date().toISOString(),
  };

  return enrich(store.partnerships[idx]);
}

export async function listAcceptedPartners() {
  const session = await requireSession();
  const items = await listMyPartnerships();
  return items
    .filter((p) => p.status === "accepted")
    .map((p) =>
      p.requester_id === session.id ? p.addressee! : p.requester!,
    );
}

export async function endPartnership(id: string): Promise<Partnership> {
  const session = await requireSession();
  const store = getStore();
  const idx = store.partnerships.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error("Relación no encontrada");

  const item = store.partnerships[idx];
  if (item.requester_id !== session.id && item.addressee_id !== session.id) {
    throw new Error("No autorizado");
  }
  if (item.status !== "accepted") {
    throw new Error("Solo puedes terminar una amistad activa");
  }

  store.partnerships[idx] = {
    ...item,
    status: "cancelled",
    updated_at: new Date().toISOString(),
  };

  return enrich(store.partnerships[idx]);
}
