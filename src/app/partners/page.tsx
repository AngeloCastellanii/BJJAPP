import { SignInPanel } from "@/components/auth/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { ChallengeButton } from "@/components/matches/match-actions";
import {
  EndPartnershipButton,
  PartnershipRespond,
} from "@/components/partners/partner-actions";
import { Avatar } from "@/components/profile/avatar";
import { BeltBadge } from "@/components/profile/belt-badge";
import { SoftPanel } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listMyPartnerships } from "@/server/repositories/partners";
import { getSessionProfile } from "@/server/repositories/profiles";
import { Users } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Amigos" };

export default async function PartnersPage() {
  const session = await getSessionProfile();
  if (!session) {
    return (
      <div className="flex min-h-[70dvh] items-center py-8">
        <SignInPanel />
      </div>
    );
  }

  const partnerships = await listMyPartnerships();
  const pending = partnerships.filter((p) => p.status === "pending");
  const accepted = partnerships.filter((p) => p.status === "accepted");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Comunidad"
        title="Amigos"
        description="Personas con las que entrenas y compartes el tatami."
      />

      <section>
        <h2 className="mb-3 px-1 text-sm font-medium text-muted">Pendientes</h2>
        {pending.length === 0 ? (
          <EmptyState title="Sin invitaciones" />
        ) : (
          <SoftPanel>
            {pending.map((p) => {
              const other =
                p.requester_id === session.id ? p.addressee! : p.requester!;
              const role =
                p.requester_id === session.id ? "requester" : "addressee";
              return (
                <div
                  key={p.id}
                  className="flex flex-col gap-3 border-b border-border/80 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={other.display_name}
                      src={other.avatar_url}
                    />
                    <div>
                      <Link
                        href={`/perfil/${other.username}`}
                        className="font-semibold hover:opacity-70"
                      >
                        {other.display_name}
                      </Link>
                      <p className="text-sm text-muted">
                        {role === "requester"
                          ? "Invitación enviada"
                          : "Quiere conectar contigo"}
                      </p>
                    </div>
                  </div>
                  <PartnershipRespond id={p.id} role={role} />
                </div>
              );
            })}
          </SoftPanel>
        )}
      </section>

      <section>
        <h2 className="mb-3 px-1 text-sm font-medium text-muted">Tus amigos</h2>
        {accepted.length === 0 ? (
          <EmptyState
            title="Aún no tienes amigos aquí"
            description="Ve a Descubrir y conecta con gente de tu zona o academia."
            icon={<Users className="h-5 w-5" />}
          />
        ) : (
          <SoftPanel>
            {accepted.map((p) => {
              const other =
                p.requester_id === session.id ? p.addressee! : p.requester!;
              return (
                <div
                  key={p.id}
                  className="flex flex-col gap-3 border-b border-border/80 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={other.display_name}
                      src={other.avatar_url}
                    />
                    <div>
                      <Link
                        href={`/perfil/${other.username}`}
                        className="font-semibold hover:opacity-70"
                      >
                        {other.display_name}
                      </Link>
                      <div className="mt-1.5">
                        <BeltBadge belt={other.belt} stripes={other.stripes} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <ChallengeButton opponentId={other.id} />
                    <EndPartnershipButton id={p.id} />
                  </div>
                </div>
              );
            })}
          </SoftPanel>
        )}
      </section>
    </div>
  );
}
