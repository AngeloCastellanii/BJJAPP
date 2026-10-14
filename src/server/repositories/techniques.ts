"use server";

import type { Technique, TechniqueLog } from "@/lib/types";
import { getStore, uid } from "../mock/store";
import { requireSession } from "./helpers";

export async function listTechniques(): Promise<Technique[]> {
  return [...getStore().techniques].sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  );
}

export async function listMyTechniqueLogs(): Promise<TechniqueLog[]> {
  const session = requireSession();
  const store = getStore();
  return store.techniqueLogs
    .filter((l) => l.profile_id === session.id)
    .map((l) => ({
      ...l,
      technique: store.techniques.find((t) => t.id === l.technique_id),
    }))
    .sort(
      (a, b) =>
        new Date(b.practiced_at).getTime() - new Date(a.practiced_at).getTime(),
    );
}

export async function logTechnique(input: {
  technique_id: string;
  notes?: string;
  practiced_at?: string;
}): Promise<TechniqueLog> {
  const session = requireSession();
  const store = getStore();
  const technique = store.techniques.find((t) => t.id === input.technique_id);
  if (!technique) throw new Error("Técnica no encontrada");

  const log: TechniqueLog = {
    id: uid("tlog"),
    profile_id: session.id,
    technique_id: input.technique_id,
    notes: input.notes?.trim() || null,
    practiced_at: input.practiced_at || new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  store.techniqueLogs.push(log);
  return { ...log, technique };
}
