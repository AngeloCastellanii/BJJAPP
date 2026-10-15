import { SignInPanel } from "@/components/auth/auth-gate";
import { CreateGatheringForm } from "@/components/gatherings/create-gathering-form";
import { GatheringCard } from "@/components/gatherings/gathering-card";
import { PageHeader } from "@/components/layout/page-header";
import { SoftPanel } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listGatherings } from "@/server/repositories/gatherings";
import { getSessionProfile } from "@/server/repositories/profiles";

export const metadata = { title: "Competencias" };

export default async function CompetenciasPage() {
  const session = await getSessionProfile();
  if (!session) {
    return (
      <div className="flex min-h-[70dvh] items-center py-8">
        <SignInPanel />
      </div>
    );
  }

  const upcoming = await listGatherings({
    types: ["competition", "tope"],
  });

  return (
    <div>
      <PageHeader
        eyebrow="Competir"
        title="Competencias y topes"
        description="Encuentros para competir y medir el nivel."
        action={
          <CreateGatheringForm
            defaultType="competition"
            role={session.role}
            hasAcademy={Boolean(session.academy_id)}
          />
        }
      />
      {upcoming.length === 0 ? (
        <EmptyState title="No hay competencias próximas" />
      ) : (
        <SoftPanel className="animate-rise-delay-1">
          {upcoming.map((g) => (
            <GatheringCard key={g.id} gathering={g} />
          ))}
        </SoftPanel>
      )}
    </div>
  );
}
