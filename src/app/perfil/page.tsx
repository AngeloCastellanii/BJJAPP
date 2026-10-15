import { SignInPanel } from "@/components/auth/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { AcademyBadge } from "@/components/profile/academy-badge";
import { Avatar } from "@/components/profile/avatar";
import { BeltBadge } from "@/components/profile/belt-badge";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { RoleBadge } from "@/components/profile/role-badge";
import { SignOutButton } from "@/components/profile/sign-out-button";
import { SoftPanel } from "@/components/ui/card";
import { listAcademies } from "@/server/repositories/academies";
import { getSessionProfile } from "@/server/repositories/profiles";
import { BadgeCheck } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Perfil" };

export default async function PerfilPage() {
  const session = await getSessionProfile();
  if (!session) {
    return (
      <div className="flex min-h-[70dvh] items-center py-8">
        <SignInPanel />
      </div>
    );
  }

  const academies = await listAcademies();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Cuenta"
        title="Tu perfil"
        action={<SignOutButton />}
      />

      <SoftPanel className="animate-rise-delay-1 overflow-hidden">
        <div className="bg-linear-to-b from-surface-2 to-surface px-5 pb-5 pt-8">
          <div className="flex items-end gap-4">
            <Avatar
              name={session.display_name}
              src={session.avatar_url}
              size="xl"
            />
            <div className="pb-1">
              <h2 className="font-display text-2xl tracking-tight">
                {session.display_name}
              </h2>
              <p className="text-sm text-muted">@{session.username}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 px-5 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <BeltBadge belt={session.belt} stripes={session.stripes} />
            <RoleBadge role={session.role} />
            {session.belt_verified ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-2 py-1 text-[11px] font-medium text-success">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verificado
              </span>
            ) : (
              <span className="rounded-lg bg-warning/10 px-2 py-1 text-[11px] font-medium text-warning">
                Cinturón sin verificar
              </span>
            )}
            {session.academy ? (
              <AcademyBadge
                academy={session.academy}
                href={`/escuelas/${session.academy.slug}`}
              />
            ) : null}
          </div>
          {session.bio ? (
            <p className="text-[15px] leading-relaxed text-foreground/90">
              {session.bio}
            </p>
          ) : null}
          <p className="text-sm text-muted">{session.city}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { href: "/escuelas", label: "Escuelas" },
              { href: "/partners", label: "Partners" },
              { href: "/peleas", label: "Peleas" },
              { href: `/perfil/${session.username}`, label: "Vista pública" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl bg-surface-2 px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-border"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </SoftPanel>

      <ProfileEditForm profile={session} academies={academies} />
    </div>
  );
}
