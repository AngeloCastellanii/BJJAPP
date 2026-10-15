import {
  InviteAcademyMember,
  LeaveAcademyButton,
  RespondMembershipButton,
} from "@/components/academies/academy-actions";
import { AcademyBadgeEditor } from "@/components/academies/academy-badge-editor";
import { SignInPanel } from "@/components/auth/auth-gate";
import { CreateGatheringForm } from "@/components/gatherings/create-gathering-form";
import { PageHeader } from "@/components/layout/page-header";
import { AcademyBadge } from "@/components/profile/academy-badge";
import { Avatar } from "@/components/profile/avatar";
import { RoleBadge } from "@/components/profile/role-badge";
import { SoftPanel } from "@/components/ui/card";
import { canSuperadmin, roleAtLeast, roleLabel } from "@/lib/roles";
import {
  getAcademyById,
  listAcademyMembers,
  listAcademyPending,
  listInviteableProfiles,
  listMyMemberships,
} from "@/server/repositories/academies";
import { getSessionProfile } from "@/server/repositories/profiles";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EscuelaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSessionProfile();
  if (!session) {
    return (
      <div className="py-8">
        <SignInPanel />
      </div>
    );
  }

  const academy = await getAcademyById(slug);
  if (!academy) notFound();

  const [members, memberships, inviteables] = await Promise.all([
    listAcademyMembers(academy.id),
    listMyMemberships(),
    listInviteableProfiles(academy.id),
  ]);

  const myMembership = memberships.find((m) => m.academy_id === academy.id);
  const isMember = myMembership?.status === "accepted";
  const isStaff =
    isMember &&
    (academy.owner_id === session.id ||
      (roleAtLeast(session.role, "coach") &&
        session.academy_id === academy.id));

  const pendingJoins = isStaff ? await listAcademyPending(academy.id) : [];

  return (
    <div className="animate-rise space-y-6">
      <PageHeader eyebrow="Academia" title={academy.name} />

      <SoftPanel className="overflow-hidden">
        <div className="flex items-start gap-4 p-5">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-surface-2">
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
          <div className="min-w-0 space-y-2">
            <AcademyBadge academy={academy} />
            <p className="text-sm text-muted">
              {academy.city}, {academy.country} · {academy.member_count ?? 0}{" "}
              miembros
            </p>
            <p className="text-[15px] leading-relaxed text-foreground/90">
              {academy.description || "Sin descripción."}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {academy.owner_id === session.id ||
              canSuperadmin(session.role) ? (
                <AcademyBadgeEditor
                  academyId={academy.id}
                  badgeLabel={academy.badge_label}
                  badgeColor={academy.badge_color}
                />
              ) : null}
              {isMember && myMembership?.role_in_academy !== "owner" ? (
                <LeaveAcademyButton academyId={academy.id} />
              ) : null}
            </div>
          </div>
        </div>
      </SoftPanel>

      {isStaff ? (
        <section className="space-y-3">
          <h2 className="px-1 text-sm font-medium text-muted">
            Organizar desde la academia
          </h2>
          <CreateGatheringForm
            defaultType="open_mat"
            role={session.role}
            hasAcademy
          />
        </section>
      ) : null}

      {isStaff ? (
        <section className="space-y-3">
          <h2 className="px-1 text-sm font-medium text-muted">
            Invitar a la academia
          </h2>
          <SoftPanel className="p-4">
            <InviteAcademyMember
              academyId={academy.id}
              candidates={inviteables}
            />
          </SoftPanel>
        </section>
      ) : null}

      {pendingJoins.length > 0 ? (
        <section className="space-y-3">
          <h2 className="px-1 text-sm font-medium text-muted">
            Solicitudes pendientes
          </h2>
          <SoftPanel>
            {pendingJoins.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 border-b border-border/80 px-4 py-3 last:border-b-0"
              >
                <p className="text-sm font-medium">
                  {m.profile?.display_name ?? "Usuario"}
                </p>
                <RespondMembershipButton membershipId={m.id} asStaff />
              </div>
            ))}
          </SoftPanel>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 px-1 text-sm font-medium text-muted">Miembros</h2>
        <SoftPanel>
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 border-b border-border/80 px-4 py-3 last:border-b-0"
            >
              <Link
                href={`/perfil/${m.profile?.username}`}
                className="flex items-center gap-3 hover:opacity-80"
              >
                <Avatar
                  name={m.profile?.display_name ?? "?"}
                  src={m.profile?.avatar_url}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-medium">
                    {m.profile?.display_name}
                  </p>
                  <p className="text-xs text-muted">
                    {roleLabel(m.role_in_academy, m.profile_id === session.id)}
                  </p>
                </div>
              </Link>
              {m.profile ? (
                <RoleBadge
                  role={m.role_in_academy}
                  revealOwner={m.profile_id === session.id}
                />
              ) : null}
            </div>
          ))}
        </SoftPanel>
      </section>
    </div>
  );
}
