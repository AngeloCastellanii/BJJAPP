import { GatheringActions } from "@/components/gatherings/gathering-actions";
import { InviteToGathering } from "@/components/gatherings/invite-to-gathering";
import { Avatar } from "@/components/profile/avatar";
import { Badge } from "@/components/ui/badge";
import { SoftPanel } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { gatheringTypeLabel } from "@/lib/roles";
import type { Gathering, Profile } from "@/lib/types";
import Link from "next/link";

export function GatheringDetail({
  gathering,
  session,
  inviteCandidates = [],
}: {
  gathering: Gathering;
  session: Profile;
  inviteCandidates?: Profile[];
}) {
  const myParticipation = gathering.participants?.find(
    (p) => p.profile_id === session.id,
  );
  const isHost = gathering.host_id === session.id;
  const isActive =
    gathering.status === "upcoming" || gathering.status === "ongoing";

  return (
    <div className="space-y-5 animate-rise">
      <div>
        <Badge className="mb-3">{gatheringTypeLabel(gathering.type)}</Badge>
        <h1 className="font-display text-[2.1rem] leading-[1.05] tracking-tight md:text-4xl">
          {gathering.title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {formatDateTime(gathering.starts_at)}
          {gathering.status === "cancelled" ? " · Cancelado" : ""}
        </p>
      </div>

      <SoftPanel className="space-y-4 p-5">
        <p className="text-[15px] leading-relaxed text-foreground/90">
          {gathering.description || "Sin descripción."}
        </p>
        <div className="grid gap-2 text-sm text-muted">
          <p>
            {gathering.location_name} · {gathering.city}
          </p>
          <p>
            Cupo {gathering.participant_count ?? 0}
            {gathering.capacity ? ` / ${gathering.capacity}` : ""}
          </p>
          {gathering.host ? (
            <p>
              Anfitrión{" "}
              <Link
                href={`/perfil/${gathering.host.username}`}
                className="font-medium text-foreground hover:opacity-70"
              >
                {gathering.host.display_name}
              </Link>
            </p>
          ) : null}
        </div>
        <GatheringActions
          gatheringId={gathering.id}
          myStatus={myParticipation?.status}
          isHost={isHost}
          isActive={isActive}
        />
      </SoftPanel>

      {isHost && isActive ? (
        <section className="space-y-3">
          <h2 className="px-1 text-sm font-medium text-muted">Invitar</h2>
          <InviteToGathering
            gatheringId={gathering.id}
            candidates={inviteCandidates}
          />
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 px-1 text-sm font-medium text-muted">
          Participantes
        </h2>
        <SoftPanel>
          {(gathering.participants ?? [])
            .filter((p) => p.status === "joined" || p.status === "invited")
            .map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 border-b border-border/80 px-4 py-3 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    name={p.profile?.display_name ?? "?"}
                    src={p.profile?.avatar_url}
                    size="sm"
                  />
                  <div>
                    <Link
                      href={`/perfil/${p.profile?.username}`}
                      className="text-sm font-medium hover:opacity-70"
                    >
                      {p.profile?.display_name}
                    </Link>
                    <p className="text-xs text-muted">
                      {p.status === "joined" ? "Confirmado" : "Invitado"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </SoftPanel>
      </section>
    </div>
  );
}
