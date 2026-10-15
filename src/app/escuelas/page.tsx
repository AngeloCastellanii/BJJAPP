import {
  JoinAcademyButton,
  RespondMembershipButton,
} from "@/components/academies/academy-actions";
import { AssignRoleForm } from "@/components/academies/assign-role-form";
import { CreateAcademyForm } from "@/components/academies/create-academy-form";
import {
  AcademyRequestList,
  RequestAcademyForm,
} from "@/components/academies/academy-requests";
import { SignInPanel } from "@/components/auth/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { AcademyBadge } from "@/components/profile/academy-badge";
import { SoftPanel } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { canSuperadmin } from "@/lib/roles";
import {
  listAcademies,
  listAllProfiles,
  listMyMemberships,
  listPendingAcademies,
} from "@/server/repositories/academies";
import { getSessionProfile } from "@/server/repositories/profiles";
import { Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "Academia" };

export default async function EscuelasPage() {
  const session = await getSessionProfile();
  if (!session) {
    return (
      <div className="flex min-h-[70dvh] items-center py-8">
        <SignInPanel />
      </div>
    );
  }

  const isAdmin = canSuperadmin(session.role);
  const [academies, memberships, allProfiles, requests] = await Promise.all([
    listAcademies(),
    listMyMemberships(),
    isAdmin ? listAllProfiles() : Promise.resolve([]),
    isAdmin ? listPendingAcademies() : Promise.resolve([]),
  ]);
  const pending = memberships.filter((m) => m.status === "pending");
  const mine = new Set(
    memberships
      .filter((m) => m.status === "accepted")
      .map((m) => m.academy_id),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Academias"
        title="Academia"
        description="Por ahora está Nueva Era. Puedes unirte o solicitar otra academia."
        action={
          <div className="flex flex-wrap gap-2">
            <RequestAcademyForm />
            {isAdmin ? <CreateAcademyForm /> : null}
          </div>
        }
      />

      {isAdmin ? <AcademyRequestList requests={requests} /> : null}

      {isAdmin ? (
        <section className="space-y-3">
          <h2 className="px-1 text-sm font-medium text-muted">
            Administración
          </h2>
          <AssignRoleForm profiles={allProfiles} academies={academies} />
        </section>
      ) : null}

      {pending.length > 0 ? (
        <section>
          <h2 className="mb-3 px-1 text-sm font-medium text-muted">
            Solicitudes
          </h2>
          <SoftPanel>
            {pending.map((m) => (
              <div
                key={m.id}
                className="flex flex-col gap-3 border-b border-border/80 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{m.academy?.name}</p>
                  <p className="text-sm text-muted">Pendiente de respuesta</p>
                </div>
                <RespondMembershipButton membershipId={m.id} />
              </div>
            ))}
          </SoftPanel>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 px-1 text-sm font-medium text-muted">
          Todas las escuelas
        </h2>
        {academies.length === 0 ? (
          <EmptyState
            title="Sin escuelas"
            icon={<Users className="h-5 w-5" />}
          />
        ) : (
          <SoftPanel className="animate-rise-delay-1">
            {academies.map((academy) => (
              <div
                key={academy.id}
                className="flex flex-col gap-3 border-b border-border/80 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <Link
                  href={`/escuelas/${academy.slug}`}
                  className="flex min-w-0 items-center gap-3 hover:opacity-80"
                >
                  <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-surface-2">
                    {academy.logo_url ? (
                      <Image
                        src={academy.logo_url}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{academy.name}</p>
                    <p className="text-sm text-muted">
                      {academy.city} · {academy.member_count ?? 0} miembros
                    </p>
                    <div className="mt-1.5">
                      <AcademyBadge academy={academy} />
                    </div>
                  </div>
                </Link>
                {mine.has(academy.id) ? (
                  <span className="text-sm font-medium text-success">
                    Miembro
                  </span>
                ) : (
                  <JoinAcademyButton academyId={academy.id} />
                )}
              </div>
            ))}
          </SoftPanel>
        )}
      </section>
    </div>
  );
}
