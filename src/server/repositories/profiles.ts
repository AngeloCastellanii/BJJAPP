"use server";

import { getAuthCredentials } from "@/lib/auth-config";
import { haversineKm } from "@/lib/format";
import { avatarFallback } from "@/lib/media";
import type { Belt, Profile } from "@/lib/types";
import { DEMO_USER_ID } from "../mock/seed";
import { getStore, uid } from "../mock/store";
import { clearSessionCookie, writeSessionCookie } from "../session";
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

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ ok: true; profile: Profile } | { ok: false; error: string }> {
  const creds = getAuthCredentials();
  if (!creds.configured) {
    return {
      ok: false,
      error: "El acceso no está configurado en el servidor.",
    };
  }

  const normalized = email.trim().toLowerCase();
  if (normalized !== creds.email || password !== creds.password) {
    return { ok: false, error: "Correo o contraseña incorrectos" };
  }

  const store = getStore();
  let profile = store.profiles.find(
    (p) => p.id === DEMO_USER_ID || p.email?.toLowerCase() === normalized,
  );

  if (!profile) {
    profile = {
      id: DEMO_USER_ID,
      username: "pending",
      display_name: "",
      email: normalized,
      bio: null,
      avatar_url: null,
      city: "",
      country: "VE",
      lat: null,
      lng: null,
      belt: "white",
      stripes: 0,
      belt_verified: false,
      belt_verified_by: null,
      belt_verified_at: null,
      role: "owner",
      academy_id: null,
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.profiles.unshift(profile);
  } else {
    const idx = store.profiles.findIndex((p) => p.id === profile!.id);
    store.profiles[idx] = {
      ...store.profiles[idx],
      email: normalized,
      updated_at: new Date().toISOString(),
    };
    profile = store.profiles[idx];
  }

  store.sessionUserId = profile.id;
  await writeSessionCookie(profile.id);
  return { ok: true, profile: withAcademy(profile) };
}

export async function completeOnboarding(input: {
  display_name: string;
  username: string;
  city: string;
  belt: Belt;
  stripes: number;
  academy_id: string | null;
  avatar_url?: string | null;
  bio?: string;
}): Promise<Profile> {
  const session = await requireSession();
  const store = getStore();
  const idx = store.profiles.findIndex((p) => p.id === session.id);
  if (idx < 0) throw new Error("Perfil no encontrado");

  const display_name = input.display_name.trim();
  const username = input.username.trim().toLowerCase().replace(/\s+/g, ".");
  const city = input.city.trim();

  if (!display_name) throw new Error("El nombre es obligatorio");
  if (!username || username.length < 3) {
    throw new Error("El usuario debe tener al menos 3 caracteres");
  }
  if (!city) throw new Error("La ciudad es obligatoria");

  const taken = store.profiles.some(
    (p) => p.id !== session.id && p.username.toLowerCase() === username,
  );
  if (taken) throw new Error("Ese usuario ya existe");

  if (input.academy_id) {
    const academy = store.academies.find((a) => a.id === input.academy_id);
    if (!academy) throw new Error("Academia no encontrada");
  }

  const stripes = Math.min(4, Math.max(0, Number(input.stripes) || 0));

  store.profiles[idx] = {
    ...store.profiles[idx],
    display_name,
    username,
    city,
    belt: input.belt,
    stripes,
    academy_id: input.academy_id,
    avatar_url: input.avatar_url?.trim() || avatarFallback(username),
    bio: input.bio?.trim() || null,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  };

  if (input.academy_id) {
    const memIdx = store.memberships.findIndex(
      (m) =>
        m.profile_id === session.id &&
        m.academy_id === input.academy_id &&
        m.status === "accepted",
    );
    if (memIdx < 0) {
      store.memberships.push({
        id: uid("mem"),
        academy_id: input.academy_id,
        profile_id: session.id,
        status: "accepted",
        role_in_academy: store.profiles[idx].role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  return withAcademy(store.profiles[idx]);
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

export async function updateProfile(input: {
  display_name?: string;
  bio?: string;
  city?: string;
  belt?: Belt;
  stripes?: number;
  academy_id?: string | null;
  username?: string;
  avatar_url?: string | null;
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

  const beltChanged =
    (input.belt !== undefined && input.belt !== store.profiles[idx].belt) ||
    (input.stripes !== undefined &&
      input.stripes !== store.profiles[idx].stripes);

  store.profiles[idx] = {
    ...store.profiles[idx],
    ...input,
    stripes,
    ...(beltChanged
      ? {
          belt_verified: false,
          belt_verified_by: null,
          belt_verified_at: null,
        }
      : {}),
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
    .filter(
      (p) =>
        p.id !== session.id &&
        !partnerIds.has(p.id) &&
        p.onboarding_completed &&
        p.username !== "pending",
    )
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
