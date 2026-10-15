import { ROLE_LABELS } from "@/lib/roles";
import type { UserRole } from "@/lib/types";

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-surface-2 px-2 py-1 text-[11px] font-medium text-muted">
      {ROLE_LABELS[role]}
    </span>
  );
}
