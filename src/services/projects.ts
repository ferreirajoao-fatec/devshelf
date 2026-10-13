import "server-only"

import { PROJECT_STATUSES, type ProjectStatus } from "@/features/projects/status"
import { prisma } from "@/lib/prisma"

export type ProjectStatusCounts = Record<ProjectStatus, number>

// Quantidade de projetos do usuário em cada status (status sem projetos vêm com 0).
export async function getProjectStatusCounts(userId: string): Promise<ProjectStatusCounts> {
  const groups = await prisma.project.groupBy({
    by: ["status"],
    where: { userId },
    _count: { _all: true },
  })

  const counts = Object.fromEntries(PROJECT_STATUSES.map((status) => [status, 0])) as ProjectStatusCounts
  for (const group of groups) counts[group.status] = group._count._all
  return counts
}
