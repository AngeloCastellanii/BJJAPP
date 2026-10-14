import { SignInPanel } from "@/components/auth/auth-gate";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/profile/avatar";
import { BeltBadge } from "@/components/profile/belt-badge";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { SignOutButton } from "@/components/profile/sign-out-button";
import { SoftPanel } from "@/components/ui/card";
import {
  getSessionProfile,
  listAcademies,
} from "@/server/repositories/profiles";
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

      <SoftPanel className="overflow-hidden animate-rise-delay-1">
        <div className="bg-linear-to-b from-surface-2 to-surface px-5 pb-5 pt-8">
          <div className="flex items-end gap-4">
            <Avatar name={session.display_name} size="xl" />
            <div className="pb-1">
              <h2 className="font-display text-2xl tracking-tight">
                {session.display_name}
              </h2>
              <p className="text-sm text-muted">@{session.username}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 px-5 py-5">
          <BeltBadge belt={session.belt} stripes={session.stripes} />
          {session.bio ? (
            <p className="text-[15px] leading-relaxed text-foreground/90">
              {session.bio}
            </p>
          ) : null}
          <div className="grid gap-2 text-sm text-muted sm:grid-cols-2">
            <p>{session.city}</p>
            <p>{session.academy?.name ?? "Sin academia"}</p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { href: "/partners", label: "Partners" },
              { href: "/peleas", label: "Peleas" },
              { href: "/tecnicas", label: "Técnicas" },
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
