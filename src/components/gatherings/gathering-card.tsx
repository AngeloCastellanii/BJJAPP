import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { gatheringPath, gatheringTypeLabel } from "@/lib/roles";
import type { Gathering } from "@/lib/types";
import { MapPin, Users } from "lucide-react";
import Link from "next/link";

export function GatheringCard({ gathering }: { gathering: Gathering }) {
  return (
    <Link
      href={`${gatheringPath(gathering.type)}/${gathering.id}`}
      className="block border-b border-border/80 px-4 py-4 transition last:border-b-0 hover:bg-surface-2/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg leading-snug tracking-tight">
            {gathering.title}
          </p>
          <p className="mt-1 text-sm text-muted">
            {formatDateTime(gathering.starts_at)}
          </p>
        </div>
        <Badge>{gatheringTypeLabel(gathering.type)}</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {gathering.location_name}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {gathering.participant_count ?? 0}
          {gathering.capacity ? `/${gathering.capacity}` : ""}
        </span>
        {gathering.academy ? (
          <span className="inline-flex items-center gap-1.5">
            {gathering.academy.badge_label}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
