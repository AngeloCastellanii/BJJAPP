"use server";

import { haversineKm } from "@/lib/format";
import type { Belt, Profile } from "@/lib/types";
import { DEMO_USER_ID } from "../mock/seed";
import { getStore, uid } from "../mock/store";
import {
  clearSessionCookie,
  writeSessionCookie,
} from "../session";
import {
  getProfile,
  requireSession,
  syncSessionFromCookie,
  withAcademy,
} from "./helpers";

export async function getSessionProfile(): Promise<Profile | null> {
  await syncSessionFromCookie();
  const store = getStore();
  if (!store.sessionUserId) return null;
  return getProfile(store.sessionUserId);
}

export async function signInAsDemo(): Promise<Profile> {
  const store = getStore();
  store.sessionUserId = DEMO_USER_ID;
  await writeSessionCookie(DEMO_USER_ID);
  const profile = getProfile(DEMO_USER_ID);
  if (!profile) throw new Error("Usuario demo no disponible");
  return profile;
}

export async function signOut(): Promise<void> {
  getStore().sessionUserId = null;
  await clearSessionCookie();
}

export async function getProfileByUsername(
  username: string,
): Promise<Profile | null> {
  const store = getStore();
  const profile = store.profiles.find(
    (p) => p.username.toLowerCase() === username.toLowerCase(),
  );
  return profile ? withAcademy(profile) : null;
}

export async function listAcademies() {
  return getStore().academies;
}

export async function updateProfile(input: {
  display_name?: string;
  bio?: string;
  city?: string;
  belt?: Belt;
  stripes?: number;
  academy_id?: string | null;
  username?: string;
}): Promise<Profile> {
  const session = await requireSession();
  const store = getStore();
  const idx = store.profiles.findIndex((p) => p.id === session.id);
  if (idx < 0) throw new Error("Perfil no encontrado");

  if (input.username) {
    const taken = store.profiles.some(
      (p) =>
        p.id !== session.id &&
        p.username.toLowerCase() === input.username!.toLowerCase(),
    );
    if (taken) throw new Error("Ese usuario ya existe");
  }

  const stripes =
    input.stripes !== undefined
      ? Math.min(4, Math.max(0, input.stripes))
      : store.profiles[idx].stripes;

  store.profiles[idx] = {
    ...store.profiles[idx],
    ...input,
    stripes,
    updated_at: new Date().toISOString(),
  };

  return withAcademy(store.profiles[idx]);
}

export async function discoverNearby(limit = 20): Promise<
  Array<Profile & { distance_km: number | null }>
> {
  const session = await requireSession();
  const store = getStore();
  const partnerIds = new Set(
    store.partnerships
      .filter(
        (p) =>
          p.status === "accepted" &&
          (p.requester_id === session.id || p.addressee_id === session.id),
      )
      .flatMap((p) => [p.requester_id, p.addressee_id]),
  );

  return store.profiles
    .filter((p) => p.id !== session.id && !partnerIds.has(p.id))
    .map((p) => {
      let distance_km: number | null = null;
      if (
        session.lat != null &&
        session.lng != null &&
        p.lat != null &&
        p.lng != null
      ) {
        distance_km = haversineKm(session.lat, session.lng, p.lat, p.lng);
      }
      return { ...withAcademy(p), distance_km };
    })
    .sort((a, b) => {
      if (a.distance_km == null && b.distance_km == null) return 0;
      if (a.distance_km == null) return 1;
      if (b.distance_km == null) return -1;
      return a.distance_km - b.distance_km;
    })
    .slice(0, limit);
}

export async function createDemoProfile(input: {
  display_name: string;
  username: string;
  city: string;
}): Promise<Profile> {
  const store = getStore();
  const username = input.username.trim().toLowerCase();
  if (store.profiles.some((p) => p.username === username)) {
    throw new Error("Ese usuario ya existe");
  }

  const profile: Profile = {
    id: uid("user"),
    username,
    display_name: input.display_name.trim(),
    bio: null,
    avatar_url: null,
    city: input.city.trim(),
    country: "VE",
    lat: 10.48,
    lng: -66.9,
    belt: "white",
    stripes: 0,
    academy_id: store.academies[0]?.id ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.profiles.push(profile);
  store.sessionUserId = profile.id;
  await writeSessionCookie(profile.id);
  return withAcademy(profile);
}
