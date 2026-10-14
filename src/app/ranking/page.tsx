import { SignInPanel } from "@/components/auth/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/profile/avatar";
import { BeltBadge } from "@/components/profile/belt-badge";
import { SoftPanel } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import type { RankingPeriod } from "@/lib/types";
import { getSessionProfile } from "@/server/repositories/profiles";
import { getRanking } from "@/server/repositories/ranking";
import Link from "next/link";

export const metadata = { title: "Ranking" };

const tabs: { id: RankingPeriod; label: string }[] = [
  { id: "week", label: "Semana" },
  { id: "month", label: "Mes" },
  { id: "academy", label: "Academia" },
];

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await getSessionProfile();
  if (!session) {
    return (
      <div className="flex min-h-[70dvh] items-center py-8">
        <SignInPanel />
      </div>
    );
  }

  const sp = await searchParams;
  const period = (tabs.some((t) => t.id === sp.period)
    ? sp.period
    : "week") as RankingPeriod;

  const ranking = await getRanking(period);

  return (
    <div>
      <PageHeader
        eyebrow="Leaderboard"
        title="Ranking"
        description="Wins por periodo y mejor atleta de academia."
      />

      <div className="mb-5 inline-flex rounded-2xl bg-surface p-1 shadow-[var(--shadow-sm)]">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/ranking?period=${tab.id}`}
            className={cn(
              "h-10 rounded-xl px-4 text-sm font-medium leading-10 transition",
              period === tab.id
                ? "bg-accent text-accent-fg"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {period === "academy" && !session.academy_id ? (
        <EmptyState
          title="Sin academia"
          description="Asigna una academia en tu perfil para ver este ranking."
        />
      ) : ranking.length === 0 ? (
        <EmptyState title="Sin resultados todavía" />
      ) : (
        <SoftPanel className="animate-rise-delay-1">
          {ranking.map((entry, index) => (
            <div
              key={entry.profile_id}
              className="flex items-center gap-3 border-b border-border/80 px-4 py-3.5 last:border-b-0"
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl text-sm font-semibold",
                  index < 3
                    ? "bg-accent text-accent-fg"
                    : "bg-surface-2 text-muted",
                )}
              >
                {index + 1}
              </span>
              <Avatar name={entry.profile.display_name} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/perfil/${entry.profile.username}`}
                  className="font-semibold hover:opacity-70"
                >
                  {entry.profile.display_name}
                </Link>
                <div className="mt-1">
                  <BeltBadge
                    belt={entry.profile.belt}
                    stripes={entry.profile.stripes}
                    compact
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl leading-none">
                  {entry.wins}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">
                  wins
                </p>
              </div>
            </div>
          ))}
        </SoftPanel>
      )}
    </div>
  );
}
