"use server";

import type { RankingEntry, RankingPeriod } from "@/lib/types";
import { getStore } from "../mock/store";
import { getProfile, requireSession } from "./helpers";

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - diff);
  return d;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getRanking(
  period: RankingPeriod,
): Promise<RankingEntry[]> {
  const store = getStore();
  const now = new Date();
  let from: Date | null = null;

  if (period === "week") from = startOfWeek(now);
  if (period === "month") from = startOfMonth(now);

  let academyId: string | null = null;
  if (period === "academy") {
    const session = await requireSession();
    academyId = session.academy_id;
    if (!academyId) return [];
  }

  const wins = new Map<string, number>();

  for (const match of store.matches) {
    if (match.status !== "completed" || !match.winner_id) continue;
    if (from && match.completed_at) {
      if (new Date(match.completed_at) < from) continue;
    }

    const winner = getProfile(match.winner_id);
    if (!winner) continue;
    if (academyId && winner.academy_id !== academyId) continue;

    wins.set(match.winner_id, (wins.get(match.winner_id) ?? 0) + 1);
  }

  return Array.from(wins.entries())
    .map(([profile_id, count]) => ({
      profile_id,
      wins: count,
      profile: getProfile(profile_id)!,
    }))
    .filter((e) => e.profile)
    .sort((a, b) => b.wins - a.wins);
}
