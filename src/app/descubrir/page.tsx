import { SignInPanel } from "@/components/auth/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { PersonCard } from "@/components/profile/person-card";
import { SoftPanel } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  discoverNearby,
  getSessionProfile,
} from "@/server/repositories/profiles";
import { Users } from "lucide-react";

export const metadata = { title: "Descubrir" };

export default async function DescubrirPage() {
  const session = await getSessionProfile();
  if (!session) {
    return (
      <div className="flex min-h-[70dvh] items-center py-8">
        <SignInPanel />
      </div>
    );
  }

  const people = await discoverNearby();

  return (
    <div>
      <PageHeader
        eyebrow="Cerca de ti"
        title="Descubrir"
        description="Gente de tu zona y otras academias para conocer y entrenar."
      />
      {people.length === 0 ? (
        <EmptyState
          title="Nadie nuevo cerca"
          description="Cuando haya más atletas en tu zona aparecerán aquí."
          icon={<Users className="h-5 w-5" />}
        />
      ) : (
        <SoftPanel className="animate-rise-delay-1">
          {people.map((p) => (
            <PersonCard
              key={p.id}
              profile={p}
              distanceKm={p.distance_km}
              showInvite
              showChallenge
            />
          ))}
        </SoftPanel>
      )}
    </div>
  );
}
