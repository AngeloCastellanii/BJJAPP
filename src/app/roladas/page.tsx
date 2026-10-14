import { SignInPanel } from "@/components/auth/auth-gate";
import { CreateGatheringForm } from "@/components/gatherings/create-gathering-form";
import { GatheringCard } from "@/components/gatherings/gathering-card";
import { PageHeader } from "@/components/layout/page-header";
import { SoftPanel } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listGatherings } from "@/server/repositories/gatherings";
import { getSessionProfile } from "@/server/repositories/profiles";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Roladas" };

export default async function RoladasPage() {
  const session = await getSessionProfile();
  if (!session) {
    return (
      <div className="flex min-h-[70dvh] items-center py-8">
        <SignInPanel />
      </div>
    );
  }

  const [upcoming, archived] = await Promise.all([
    listGatherings({ type: "rolada" }),
    listGatherings({ type: "rolada", archived: true }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Encuentros"
        title="Roladas"
        description="Organiza rondas, invita y únete."
        action={<CreateGatheringForm defaultType="rolada" />}
      />

      {upcoming.length === 0 ? (
        <EmptyState
          title="Sin roladas próximas"
          description="Crea la primera y avisa a tus partners."
          icon={<CalendarDays className="h-5 w-5" />}
        />
      ) : (
        <SoftPanel className="mb-8 animate-rise-delay-1">
          {upcoming.map((g) => (
            <GatheringCard key={g.id} gathering={g} />
          ))}
        </SoftPanel>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-sm font-medium text-muted">Archivo</h2>
          <Link href="/open-mats" className="text-sm text-muted hover:text-foreground">
            Open mats
          </Link>
        </div>
        {archived.length === 0 ? (
          <EmptyState title="Sin archivo todavía" />
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
