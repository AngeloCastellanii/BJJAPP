import { SignInPanel } from "@/components/auth/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import {
  CompleteMatchForm,
  MatchRespondButtons,
} from "@/components/matches/match-actions";
import { Avatar } from "@/components/profile/avatar";
import { Badge } from "@/components/ui/badge";
import { SoftPanel } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime, formatRelative } from "@/lib/format";
import { listMyMatches } from "@/server/repositories/matches";
import { getSessionProfile } from "@/server/repositories/profiles";
import { Swords } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Peleas" };

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
  completed: "Completada",
};

export default async function PeleasPage() {
  const session = await getSessionProfile();
  if (!session) {
    return (
      <div className="flex min-h-[70dvh] items-center py-8">
        <SignInPanel />
      </div>
    );
  }

  const matches = await listMyMatches();
  const active = matches.filter(
    (m) => m.status === "pending" || m.status === "accepted",
  );
  const history = matches.filter(
    (m) =>
      m.status === "completed" ||
      m.status === "rejected" ||
      m.status === "cancelled",
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Competir"
        title="Peleas"
        description="Retos entre compañeros. Invita, acepta y registra el ganador."
      />

      <section>
        <h2 className="mb-3 px-1 text-sm font-medium text-muted">Activas</h2>
        {active.length === 0 ? (
          <EmptyState
            title="Sin retos activos"
            description="Retá a un partner desde Descubrir o Partners."
            icon={<Swords className="h-5 w-5" />}
          />
        ) : (
          <SoftPanel>
            {active.map((m) => {
              const other =
                m.challenger_id === session.id ? m.opponent! : m.challenger!;
              const isOpponent = m.opponent_id === session.id;
              return (
                <div
                  key={m.id}
                  className="space-y-4 border-b border-border/80 px-4 py-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={other.display_name} />
                      <div>
                        <Link
                          href={`/perfil/${other.username}`}
                          className="font-semibold hover:opacity-70"
                        >
                          vs {other.display_name}
                        </Link>
                        <p className="text-xs text-muted">
                          {m.scheduled_at
                            ? formatDateTime(m.scheduled_at)
                            : formatRelative(m.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge>{statusLabel[m.status]}</Badge>
                  </div>
                  {m.notes ? (
                    <p className="text-sm text-muted">{m.notes}</p>
                  ) : null}
                  {m.status === "pending" ? (
                    <MatchRespondButtons
                      matchId={m.id}
                      isOpponent={isOpponent}
                    />
                  ) : null}
                  {m.status === "accepted" ? (
                    <CompleteMatchForm
                      matchId={m.id}
                      challengerId={m.challenger_id}
                      opponentId={m.opponent_id}
                      challengerName={m.challenger?.display_name ?? "Retador"}
                      opponentName={m.opponent?.display_name ?? "Retado"}
                    />
                  ) : null}
                </div>
              );
            })}
          </SoftPanel>
        )}
      </section>

      <section>
        <h2 className="mb-3 px-1 text-sm font-medium text-muted">Historial</h2>
        {history.length === 0 ? (
          <EmptyState title="Sin peleas completadas" />
        ) : (
          <SoftPanel>
            {history.map((m) => {
              const other =
                m.challenger_id === session.id ? m.opponent! : m.challenger!;
              const won = m.winner_id === session.id;
              const result =
                m.status === "completed"
                  ? won
                    ? "Victoria"
                    : "Derrota"
                  : statusLabel[m.status];
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 border-b border-border/80 px-4 py-3.5 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={other.display_name} size="sm" />
                    <div>
                      <p className="font-medium">vs {other.display_name}</p>
                      <p className="text-xs text-muted">
                        {m.completed_at
                          ? formatRelative(m.completed_at)
                          : formatRelative(m.updated_at)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={
                      m.status === "completed"
                        ? won
                          ? "rounded-lg bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
                          : "rounded-lg bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger"
                        : "rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted"
                    }
                  >
                    {result}
                  </span>
                </div>
              );
            })}
          </SoftPanel>
        )}
      </section>
    </div>
  );
}
