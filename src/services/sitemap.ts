import "server-only"

import { prisma } from "@/lib/prisma"

// Limite de URLs por sitemap definido pelo protocolo é 50.000; ficamos bem abaixo.
const MAX_ENTRIES = 10_000

// Só o que é público: projetos públicos e perfis ativos.
export async function listSitemapEntries() {
  const [projects, profiles] = await Promise.all([
    prisma.project.findMany({
      where: { visibility: "PUBLIC" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: MAX_ENTRIES,
    }),
    prisma.user.findMany({
      where: { isPublic: true, username: { not: null } },
      select: { username: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: MAX_ENTRIES,
    }),
  ])
  return { projects, profiles: profiles.filter((u): u is typeof u & { username: string } => Boolean(u.username)) }
}
