import { SignInPanel } from "@/components/auth/auth-gate";
import { CreateGatheringForm } from "@/components/gatherings/create-gathering-form";
import { GatheringCard } from "@/components/gatherings/gathering-card";
import { PageHeader } from "@/components/layout/page-header";
import { SoftPanel } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listGatherings } from "@/server/repositories/gatherings";
import { getSessionProfile } from "@/server/repositories/profiles";

export const metadata = { title: "Eventos" };

export default async function EventosPage() {
  const session = await getSessionProfile();
  if (!session) {
    return (
      <div className="flex min-h-[70dvh] items-center py-8">
        <SignInPanel />
      </div>
    );
  }

  const [upcoming, archived] = await Promise.all([
    listGatherings({ types: ["event", "seminar"] }),
    listGatherings({ types: ["event", "seminar"], archived: true }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Agenda"
        title="Eventos"
        description="Seminarios, eventos y encuentros del clan."
        action={<CreateGatheringForm defaultType="event" role={session.role} hasAcademy={Boolean(session.academy_id)} />}
      />
      {upcoming.length === 0 ? (
        <EmptyState title="No hay eventos próximos" />
      ) : (
        <SoftPanel className="mb-8 animate-rise-delay-1">
          {upcoming.map((g) => (
            <GatheringCard key={g.id} gathering={g} />
          ))}
        </SoftPanel>
      )}
      <section className="space-y-3">
        <h2 className="px-1 text-sm font-medium text-muted">Archivo</h2>
        {archived.length === 0 ? (
          <EmptyState title="Sin archivo" />
        ) : (
          <SoftPanel>
            {archived.map((g) => (
              <GatheringCard key={g.id} gathering={g} />
            ))}
          </SoftPanel>
        )}
      </section>
    </div>
  );
}

