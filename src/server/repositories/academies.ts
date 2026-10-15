"use server";

import { avatarFallback } from "@/lib/media";
import { canSuperadmin } from "@/lib/roles";
import type {
  Academy,
  AcademyMembership,
  Profile,
  UserRole,
} from "@/lib/types";
import { getStore, uid } from "../mock/store";
import { getProfile, requireSession, withAcademy } from "./helpers";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

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
    .academies.filter((a) => (a.status ?? "approved") === "approved")
    .map(enrichAcademy)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function listPendingAcademies(): Promise<Academy[]> {
  const session = await requireSession();
  if (!canSuperadmin(session.role)) return [];
  return getStore()
    .academies.filter((a) => a.status === "pending")
    .map(enrichAcademy);
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
    throw new Error("Solo staff de la academia puede responder");
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
  if (!canInvite) throw new Error("No puedes invitar a esta academia");
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
    throw new Error("El dueño no puede abandonar la academia");
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

export async function createAcademy(input: {
  name: string;
  city: string;
  description?: string;
  badge_label?: string;
  badge_color?: string;
  owner_id?: string;
}): Promise<Academy> {
  const session = await requireSession();
  if (!canSuperadmin(session.role)) {
    throw new Error("Solo el superadmin puede crear gimnasios");
  }

  const name = input.name.trim();
  if (!name) throw new Error("El nombre es obligatorio");
  const city = input.city.trim();
  if (!city) throw new Error("La ciudad es obligatoria");

  const store = getStore();
  let slug = slugify(name) || uid("gym");
  if (store.academies.some((a) => a.slug === slug)) {
    slug = `${slug}-${uid("x").slice(-4)}`;
  }

  const ownerId = input.owner_id || session.id;
  if (!getProfile(ownerId)) throw new Error("Dueño no encontrado");

  const academy: Academy = {
    id: uid("acad"),
    name,
    slug,
    city,
    country: "VE",
    description: input.description?.trim() || null,
    logo_url: avatarFallback(slug),
    badge_label: (input.badge_label?.trim() || name.slice(0, 16)) || "Academia",
    badge_color: input.badge_color?.trim() || "#161616",
    owner_id: ownerId,
    status: "approved",
    requested_by: null,
    created_at: new Date().toISOString(),
  };

  store.academies.push(academy);

  const existing = store.memberships.find(
    (m) => m.academy_id === academy.id && m.profile_id === ownerId,
  );
  if (!existing) {
    store.memberships.push({
      id: uid("mem"),
      academy_id: academy.id,
      profile_id: ownerId,
      status: "accepted",
      role_in_academy: "owner",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  const pIdx = store.profiles.findIndex((p) => p.id === ownerId);
  if (pIdx >= 0) {
    store.profiles[pIdx] = {
      ...store.profiles[pIdx],
      academy_id: academy.id,
      role: "owner",
      updated_at: new Date().toISOString(),
    };
  }

  return enrichAcademy(academy);
}

export async function requestAcademy(input: {
  name: string;
  city: string;
  description?: string;
}): Promise<Academy> {
  const session = await requireSession();
  const name = input.name.trim();
  const city = input.city.trim();
  if (!name) throw new Error("El nombre es obligatorio");
  if (!city) throw new Error("La ciudad es obligatoria");

  const store = getStore();
  const already = store.academies.find(
    (a) =>
      a.requested_by === session.id &&
      a.status === "pending" &&
      a.name.toLowerCase() === name.toLowerCase(),
  );
  if (already) throw new Error("Ya enviaste esa solicitud");

  let slug = slugify(name) || uid("gym");
  if (store.academies.some((a) => a.slug === slug)) {
    slug = `${slug}-${uid("x").slice(-4)}`;
  }

  const academy: Academy = {
    id: uid("acad"),
    name,
    slug,
    city,
    country: "VE",
    description: input.description?.trim() || null,
    logo_url: avatarFallback(slug),
    badge_label: name.slice(0, 16) || "Academia",
    badge_color: "#161616",
    owner_id: null,
    status: "pending",
    requested_by: session.id,
    created_at: new Date().toISOString(),
  };
  store.academies.push(academy);
  return enrichAcademy(academy);
}

export async function reviewAcademyRequest(
  academyId: string,
  action: "approved" | "rejected",
): Promise<void> {
  const session = await requireSession();
  if (!canSuperadmin(session.role)) {
    throw new Error("Solo el superadmin puede revisar solicitudes");
  }
  const store = getStore();
  const idx = store.academies.findIndex((a) => a.id === academyId);
  if (idx < 0) throw new Error("Solicitud no encontrada");
  const academy = store.academies[idx];
  if (academy.status !== "pending") throw new Error("Esa solicitud ya se revisó");

  if (action === "rejected") {
    store.academies[idx] = { ...academy, status: "rejected" };
    return;
  }

  const ownerId = academy.requested_by;
  store.academies[idx] = {
    ...academy,
    status: "approved",
    owner_id: ownerId,
  };
  if (!ownerId) return;

  const existing = store.memberships.find(
    (m) => m.academy_id === academy.id && m.profile_id === ownerId,
  );
  if (!existing) {
    store.memberships.push({
      id: uid("mem"),
      academy_id: academy.id,
      profile_id: ownerId,
      status: "accepted",
      role_in_academy: "owner",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  const pIdx = store.profiles.findIndex((p) => p.id === ownerId);
  if (pIdx >= 0 && !store.profiles[pIdx].academy_id) {
    store.profiles[pIdx] = {
      ...store.profiles[pIdx],
      academy_id: academy.id,
      updated_at: new Date().toISOString(),
    };
  }
}

export async function assignMemberRole(input: {
  profile_id: string;
  role: UserRole;
  academy_id?: string | null;
}): Promise<Profile> {
  const session = await requireSession();
  if (!canSuperadmin(session.role)) {
    throw new Error("Solo el superadmin puede asignar roles");
  }

  const store = getStore();
  const pIdx = store.profiles.findIndex((p) => p.id === input.profile_id);
  if (pIdx < 0) throw new Error("Persona no encontrada");
  if (input.profile_id === session.id && input.role !== "owner") {
    throw new Error("No puedes quitarte el rol de superadmin");
  }

  const academyId =
    input.academy_id === undefined
      ? store.profiles[pIdx].academy_id
      : input.academy_id;

  if (academyId) {
    const academy = store.academies.find((a) => a.id === academyId);
    if (!academy) throw new Error("Gimnasio no encontrado");

    let membership = store.memberships.find(
      (m) => m.academy_id === academyId && m.profile_id === input.profile_id,
    );
    if (!membership) {
      membership = {
        id: uid("mem"),
        academy_id: academyId,
        profile_id: input.profile_id,
        status: "accepted",
        role_in_academy: input.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.memberships.push(membership);
    } else {
      membership.status = "accepted";
      membership.role_in_academy = input.role;
      membership.updated_at = new Date().toISOString();
    }

    if (input.role === "owner") {
      academy.owner_id = input.profile_id;
    }
  }

  store.profiles[pIdx] = {
    ...store.profiles[pIdx],
    role: input.role,
    academy_id: academyId,
    updated_at: new Date().toISOString(),
  };

  return withAcademy(store.profiles[pIdx]);
}

export async function updateAcademyAppearance(input: {
  academy_id: string;
  badge_label?: string;
  badge_color?: string;
}): Promise<Academy> {
  const session = await requireSession();
  const store = getStore();
  const idx = store.academies.findIndex((a) => a.id === input.academy_id);
  if (idx < 0) throw new Error("Academia no encontrada");

  const academy = store.academies[idx];
  const isOwner = academy.owner_id === session.id;
  if (!isOwner && !canSuperadmin(session.role)) {
    throw new Error("Solo el dueño puede editar el distintivo");
  }

  store.academies[idx] = {
    ...academy,
    badge_label: input.badge_label?.trim() || academy.badge_label,
    badge_color: input.badge_color?.trim() || academy.badge_color,
  };
  return enrichAcademy(store.academies[idx]);
}

export async function listAllProfiles(): Promise<Profile[]> {
  const session = await requireSession();
  if (!canSuperadmin(session.role)) {
    throw new Error("Solo el superadmin puede listar todos los perfiles");
  }
  return getStore()
    .profiles.map(withAcademy)
    .sort((a, b) => a.display_name.localeCompare(b.display_name));
}
