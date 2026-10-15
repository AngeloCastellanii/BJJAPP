import { SignInPanel } from "@/components/auth/auth-gate";
import { GatheringDetail } from "@/components/gatherings/gathering-detail";
import {
  getGathering,
  listGatheringInviteCandidates,
} from "@/server/repositories/gatherings";
import { getSessionProfile } from "@/server/repositories/profiles";
import { notFound } from "next/navigation";

export default async function RoladaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionProfile();
  if (!session) {
    return (
      <div className="py-8">
        <SignInPanel />
      </div>
    );
  }

  const gathering = await getGathering(id);
  if (!gathering || gathering.type !== "rolada") notFound();

  const inviteCandidates =
    gathering.host_id === session.id
      ? await listGatheringInviteCandidates(id)
      : [];

  return (
    <GatheringDetail
      gathering={gathering}
      session={session}
      inviteCandidates={inviteCandidates}
    />
  );
}
