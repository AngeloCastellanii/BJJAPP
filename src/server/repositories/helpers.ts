import type { Academy, Profile } from "@/lib/types";
import { getStore } from "../mock/store";
import { readSessionCookie } from "../session";

export function withAcademy(profile: Profile): Profile {
  const store = getStore();
  const academy =
    store.academies.find((a) => a.id === profile.academy_id) ?? null;
  return { ...profile, academy };
}

export function getProfile(id: string): Profile | null {
  const store = getStore();
  const profile = store.profiles.find((p) => p.id === id);
  return profile ? withAcademy(profile) : null;
}

export async function syncSessionFromCookie(): Promise<void> {
  const store = getStore();
  if (store.sessionUserId) return;
  const cookieId = await readSessionCookie();
  if (cookieId && store.profiles.some((p) => p.id === cookieId)) {
    store.sessionUserId = cookieId;
  }
}

export async function requireSession(): Promise<Profile> {
  await syncSessionFromCookie();
  const store = getStore();
  if (!store.sessionUserId) {
    throw new Error("Debes iniciar sesión");
  }
  const profile = getProfile(store.sessionUserId);
  if (!profile) throw new Error("Perfil no encontrado");
  return profile;
}

export function getAcademy(id: string | null): Academy | null {
  if (!id) return null;
  return getStore().academies.find((a) => a.id === id) ?? null;
}
