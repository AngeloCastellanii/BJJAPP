import { ChallengeButton } from "@/components/matches/match-actions";
import { InvitePartnerButton } from "@/components/partners/partner-actions";
import { Avatar } from "@/components/profile/avatar";
import { BeltBadge } from "@/components/profile/belt-badge";
import { SoftPanel } from "@/components/ui/card";
import {
  getProfileByUsername,
  getSessionProfile,
} from "@/server/repositories/profiles";
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
    <div className="animate-rise">
      <SoftPanel className="overflow-hidden">
        <div className="bg-linear-to-b from-surface-2 to-surface px-5 pb-5 pt-8">
          <div className="flex items-end gap-4">
            <Avatar name={profile.display_name} size="xl" />
            <div className="pb-1">
              <h1 className="font-display text-3xl tracking-tight">
                {profile.display_name}
              </h1>
              <p className="text-sm text-muted">@{profile.username}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 px-5 py-5">
          <BeltBadge belt={profile.belt} stripes={profile.stripes} />
          {profile.bio ? (
            <p className="text-[15px] leading-relaxed">{profile.bio}</p>
          ) : null}
          <div className="grid gap-2 text-sm text-muted sm:grid-cols-2">
            <p>
              {profile.city}
              {profile.country ? `, ${profile.country}` : ""}
            </p>
            <p>{profile.academy?.name ?? "Sin academia"}</p>
          </div>
          {!isSelf && session ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <InvitePartnerButton profileId={profile.id} />
              <ChallengeButton opponentId={profile.id} />
            </div>
          ) : null}
        </div>
      </SoftPanel>
    </div>
  );
}
