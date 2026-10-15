import type { GatheringType, UserRole } from "./types";

export const ROLE_LABELS: Record<UserRole, string> = {
  user: "Usuario",
  coach: "Entrenador",
  master: "Master",
  owner: "Dueño",
};

export const ROLE_RANK: Record<UserRole, number> = {
  user: 1,
  coach: 2,
  master: 3,
  owner: 4,
};

export function roleAtLeast(role: UserRole, min: UserRole) {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

/** Quién puede crear cada tipo de encuentro */
export function canOrganizeType(role: UserRole, type: GatheringType) {
  if (type === "rolada") return true;
  if (type === "open_mat" || type === "event" || type === "seminar") {
    return roleAtLeast(role, "coach");
  }
  if (type === "competition" || type === "tope") {
    return roleAtLeast(role, "master");
  }
  return false;
}

export function canVerifyBelts(role: UserRole) {
  return roleAtLeast(role, "coach");
}

export function canPromoteBelts(role: UserRole) {
  return roleAtLeast(role, "master");
}

export function canManageAcademy(role: UserRole) {
  return roleAtLeast(role, "owner");
}

export function gatheringTypeLabel(type: GatheringType) {
  const map: Record<GatheringType, string> = {
    rolada: "Rolada",
    open_mat: "Open mat",
    event: "Evento",
    competition: "Competencia",
    tope: "Tope",
    seminar: "Seminario",
  };
  return map[type];
}

export function gatheringPath(type: GatheringType) {
  if (type === "rolada") return "/roladas";
  if (type === "open_mat") return "/open-mats";
  if (type === "event" || type === "seminar") return "/eventos";
  return "/competencias";
}
