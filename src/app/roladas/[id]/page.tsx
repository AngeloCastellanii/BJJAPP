import { SignInPanel } from "@/components/auth/auth-gate";
import { GatheringDetail } from "@/components/gatherings/gathering-detail";
import { getGathering } from "@/server/repositories/gatherings";
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

  return <GatheringDetail gathering={gathering} session={session} />;
}
