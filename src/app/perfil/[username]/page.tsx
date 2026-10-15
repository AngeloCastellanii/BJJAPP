import { ChallengeButton } from "@/components/matches/match-actions";
import { InvitePartnerButton } from "@/components/partners/partner-actions";
import { AcademyBadge } from "@/components/profile/academy-badge";
import { Avatar } from "@/components/profile/avatar";
import { BeltBadge } from "@/components/profile/belt-badge";
import { BeltStaffActions } from "@/components/profile/belt-staff-actions";
import { RoleBadge } from "@/components/profile/role-badge";
import { SoftPanel } from "@/components/ui/card";
import {
  getProfileByUsername,
  getSessionProfile,
} from "@/server/repositories/profiles";
import { BadgeCheck } from "lucide-react";
import { notFound } from "next/navigation";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const session = await getSessionProfile();
  const isSelf = session?.id === profile.id;

  return (
    <div className="animate-rise space-y-4">
      <SoftPanel className="overflow-hidden">
        <div className="bg-linear-to-b from-surface-2 to-surface px-5 pb-5 pt-8">
          <div className="flex items-end gap-4">
            <Avatar
              name={profile.display_name}
              src={profile.avatar_url}
              size="xl"
            />
            <div className="pb-1">
              <h1 className="font-display text-3xl tracking-tight">
                {profile.display_name}
              </h1>
              <p className="text-sm text-muted">@{profile.username}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 px-5 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <BeltBadge belt={profile.belt} stripes={profile.stripes} />
            <RoleBadge role={profile.role} />
            {profile.belt_verified ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-2 py-1 text-[11px] font-medium text-success">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verificado
              </span>
            ) : null}
            {profile.academy ? (
              <AcademyBadge
                academy={profile.academy}
                href={`/escuelas/${profile.academy.slug}`}
              />
            ) : null}
          </div>
          {profile.bio ? (
            <p className="text-[15px] leading-relaxed">{profile.bio}</p>
          ) : null}
          <p className="text-sm text-muted">
            {profile.city}
            {profile.country ? `, ${profile.country}` : ""}
          </p>
          {!isSelf && session ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <InvitePartnerButton profileId={profile.id} />
              <ChallengeButton opponentId={profile.id} />
            </div>
          ) : null}
        </div>
      </SoftPanel>

      {session && !isSelf ? (
        <BeltStaffActions session={session} target={profile} />
      ) : null}
    </div>
  );
}
