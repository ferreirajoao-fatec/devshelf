import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS, type ProjectStatus } from "../status"

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span aria-hidden="true" className={cn("size-2 rounded-full", PROJECT_STATUS_COLORS[status])} />
      {PROJECT_STATUS_LABELS[status]}
    </Badge>
  )
}
