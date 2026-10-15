"use server";

import type { Belt, BeltPromotion, Profile } from "@/lib/types";
import { canPromoteBelts, canVerifyBelts } from "@/lib/roles";
import { getStore, uid } from "../mock/store";
import { getProfile, requireSession, withAcademy } from "./helpers";

export async function verifyBelt(profileId: string): Promise<Profile> {
  const session = await requireSession();
  if (!canVerifyBelts(session.role)) {
    throw new Error("Solo entrenador o superior puede verificar cinturones");
  }

  const store = getStore();
  const target = store.profiles.find((p) => p.id === profileId);
  if (!target) throw new Error("Alumno no encontrado");
  if (!session.academy_id || target.academy_id !== session.academy_id) {
    throw new Error("Solo puedes verificar alumnos de tu escuela");
  }

  target.belt_verified = true;
  target.belt_verified_by = session.id;
  target.belt_verified_at = new Date().toISOString();
  target.updated_at = new Date().toISOString();
  return withAcademy(target);
}

export async function promoteBelt(input: {
  profile_id: string;
  belt: Belt;
  stripes: number;
  notes?: string;
}): Promise<BeltPromotion> {
  const session = await requireSession();
  if (!canPromoteBelts(session.role)) {
    throw new Error("Solo Master o Dueño puede registrar pases de grado");
  }

  const store = getStore();
  const idx = store.profiles.findIndex((p) => p.id === input.profile_id);
  if (idx < 0) throw new Error("Alumno no encontrado");

  const target = store.profiles[idx];
  if (!session.academy_id || target.academy_id !== session.academy_id) {
    throw new Error("Solo puedes promover alumnos de tu escuela");
  }

  const stripes = Math.min(4, Math.max(0, input.stripes));
  const promo: BeltPromotion = {
    id: uid("promo"),
    profile_id: target.id,
    promoted_by: session.id,
    from_belt: target.belt,
    from_stripes: target.stripes,
    to_belt: input.belt,
    to_stripes: stripes,
    notes: input.notes?.trim() || null,
    created_at: new Date().toISOString(),
  };

  store.profiles[idx] = {
    ...target,
    belt: input.belt,
    stripes,
    belt_verified: true,
    belt_verified_by: session.id,
    belt_verified_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.beltPromotions.push(promo);

  return {
    ...promo,
    profile: withAcademy(store.profiles[idx]),
    promoter: getProfile(session.id) ?? undefined,
  };
}

export async function listBeltPromotions(
  profileId?: string,
): Promise<BeltPromotion[]> {
  const store = getStore();
  return store.beltPromotions
    .filter((p) => !profileId || p.profile_id === profileId)
    .map((p) => ({
      ...p,
      profile: getProfile(p.profile_id) ?? undefined,
      promoter: getProfile(p.promoted_by) ?? undefined,
    }))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
}
