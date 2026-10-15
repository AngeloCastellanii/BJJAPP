import { ChallengeButton } from "@/components/matches/match-actions";
import { InvitePartnerButton } from "@/components/partners/partner-actions";
import { Avatar } from "@/components/profile/avatar";
import { BeltBadge } from "@/components/profile/belt-badge";
import type { Profile } from "@/lib/types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function PersonCard({
  profile,
  distanceKm,
  showInvite = true,
  showChallenge = false,
}: {
  profile: Profile;
  distanceKm?: number | null;
  showInvite?: boolean;
  showChallenge?: boolean;
}) {
  return (
    <div className="border-b border-border/80 px-4 py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <Link href={`/perfil/${profile.username}`}>
          <Avatar name={profile.display_name} src={profile.avatar_url} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/perfil/${profile.username}`}
                className="flex items-center gap-1 font-semibold hover:opacity-70"
              >
                <span className="truncate">{profile.display_name}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
              </Link>
              <p className="mt-0.5 truncate text-sm text-muted">
                @{profile.username}
                {profile.academy ? ` · ${profile.academy.name}` : ""}
                {distanceKm != null ? ` · ${distanceKm.toFixed(1)} km` : ""}
              </p>
            </div>
            <BeltBadge
              belt={profile.belt}
              stripes={profile.stripes}
              compact
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {showInvite ? <InvitePartnerButton profileId={profile.id} /> : null}
            {showChallenge ? (
              <ChallengeButton opponentId={profile.id} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
