"use server";

import type { Academy, AcademyMembership, Profile } from "@/lib/types";
import { getStore, uid } from "../mock/store";
import { getProfile, requireSession, withAcademy } from "./helpers";

function enrichAcademy(a: Academy): Academy {
  const store = getStore();
  const member_count = store.memberships.filter(
    (m) => m.academy_id === a.id && m.status === "accepted",
  ).length;
  return { ...a, member_count };
}

function enrichMembership(m: AcademyMembership): AcademyMembership {
  return {
    ...m,
    academy: getStore().academies.find((a) => a.id === m.academy_id),
    profile: getProfile(m.profile_id) ?? undefined,
  };
}

export async function listAcademies(): Promise<Academy[]> {
  return getStore()
    .academies.map(enrichAcademy)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAcademyById(id: string): Promise<Academy | null> {
  const a = getStore().academies.find((x) => x.id === id || x.slug === id);
  return a ? enrichAcademy(a) : null;
}

export async function listAcademyMembers(
  academyId: string,
): Promise<AcademyMembership[]> {
  return getStore()
    .memberships.filter(
      (m) => m.academy_id === academyId && m.status === "accepted",
    )
    .map(enrichMembership)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function listAcademyPending(
  academyId: string,
): Promise<AcademyMembership[]> {
  return getStore()
    .memberships.filter(
      (m) => m.academy_id === academyId && m.status === "pending",
    )
    .map(enrichMembership);
}

export async function listMyMemberships(): Promise<AcademyMembership[]> {
  const session = await requireSession();
  return getStore()
    .memberships.filter((m) => m.profile_id === session.id)
    .map(enrichMembership)
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
}

export async function requestJoinAcademy(
  academyId: string,
): Promise<AcademyMembership> {
  const session = await requireSession();
  const store = getStore();
  const academy = store.academies.find((a) => a.id === academyId);
  if (!academy) throw new Error("Escuela no encontrada");

  const existing = store.memberships.find(
    (m) => m.academy_id === academyId && m.profile_id === session.id,
  );
  if (existing?.status === "accepted") {
    throw new Error("Ya perteneces a esta escuela");
  }
  if (existing?.status === "pending") {
    throw new Error("Ya tienes una solicitud pendiente");
  }

  if (existing) {
    existing.status = "pending";
    existing.updated_at = new Date().toISOString();
    return enrichMembership(existing);
  }

  const membership: AcademyMembership = {
    id: uid("mem"),
    academy_id: academyId,
    profile_id: session.id,
    status: "pending",
    role_in_academy: "user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.memberships.push(membership);
  return enrichMembership(membership);
}

export async function respondAcademyInvite(
  membershipId: string,
  action: "accepted" | "rejected" | "cancelled",
): Promise<AcademyMembership> {
  const session = await requireSession();
  const store = getStore();
  const idx = store.memberships.findIndex((m) => m.id === membershipId);
  if (idx < 0) throw new Error("Invitación no encontrada");

  const item = store.memberships[idx];
  const academy = store.academies.find((a) => a.id === item.academy_id);
  if (!academy) throw new Error("Escuela no encontrada");

  const isOwnerOrStaff =
    academy.owner_id === session.id ||
    (session.academy_id === academy.id &&
      (session.role === "owner" ||
        session.role === "master" ||
        session.role === "coach"));

  if (action === "cancelled") {
    if (item.profile_id !== session.id && !isOwnerOrStaff) {
      throw new Error("No autorizado");
    }
  } else if (item.profile_id === session.id) {
    // user accepting own invite / join request approval is staff-only for accepted from pending join
    if (action === "accepted" && !isOwnerOrStaff) {
      // user can accept if they were invited (staff created pending for them) — allow member to accept
    }
  } else if (!isOwnerOrStaff) {
    throw new Error("Solo staff del clan puede responder");
  }

  store.memberships[idx] = {
    ...item,
    status: action,
    updated_at: new Date().toISOString(),
  };

  if (action === "accepted") {
    const pIdx = store.profiles.findIndex((p) => p.id === item.profile_id);
    if (pIdx >= 0) {
      store.profiles[pIdx] = {
        ...store.profiles[pIdx],
        academy_id: item.academy_id,
        updated_at: new Date().toISOString(),
      };
    }
  }

  return enrichMembership(store.memberships[idx]);
}

export async function inviteToAcademy(
  academyId: string,
  profileId: string,
): Promise<AcademyMembership> {
  const session = await requireSession();
  const store = getStore();
  const academy = store.academies.find((a) => a.id === academyId);
  if (!academy) throw new Error("Escuela no encontrada");

  const canInvite =
    academy.owner_id === session.id ||
    (session.academy_id === academyId &&
      (session.role === "owner" ||
        session.role === "master" ||
        session.role === "coach"));
  if (!canInvite) throw new Error("No puedes invitar a este clan");
  if (!getProfile(profileId)) throw new Error("Usuario no encontrado");

  const existing = store.memberships.find(
    (m) => m.academy_id === academyId && m.profile_id === profileId,
  );
  if (existing?.status === "accepted") {
    throw new Error("Ya es miembro");
  }
  if (existing) {
    existing.status = "pending";
    existing.updated_at = new Date().toISOString();
    return enrichMembership(existing);
  }

  const membership: AcademyMembership = {
    id: uid("mem"),
    academy_id: academyId,
    profile_id: profileId,
    status: "pending",
    role_in_academy: "user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.memberships.push(membership);
  return enrichMembership(membership);
}

export async function leaveAcademy(academyId: string): Promise<void> {
  const session = await requireSession();
  const store = getStore();
  const membership = store.memberships.find(
    (m) =>
      m.academy_id === academyId &&
      m.profile_id === session.id &&
      m.status === "accepted",
  );
  if (!membership) throw new Error("No perteneces a esta escuela");
  if (membership.role_in_academy === "owner") {
    throw new Error("El dueño no puede abandonar el clan");
  }
  membership.status = "cancelled";
  membership.updated_at = new Date().toISOString();

  const pIdx = store.profiles.findIndex((p) => p.id === session.id);
  if (pIdx >= 0 && store.profiles[pIdx].academy_id === academyId) {
    store.profiles[pIdx] = {
      ...store.profiles[pIdx],
      academy_id: null,
      updated_at: new Date().toISOString(),
    };
  }
}

export async function listInviteableProfiles(
  academyId: string,
): Promise<Profile[]> {
  await requireSession();
  const store = getStore();
  const memberIds = new Set(
    store.memberships
      .filter(
        (m) =>
          m.academy_id === academyId &&
          (m.status === "accepted" || m.status === "pending"),
      )
      .map((m) => m.profile_id),
  );
  return store.profiles
    .filter((p) => !memberIds.has(p.id))
    .map(withAcademy)
    .slice(0, 20);
}
