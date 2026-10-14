import "server-only"

import { EXPLORE_PAGE_SIZE, type ExploreParams } from "@/features/explore/params"
import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"

// Só projetos públicos aparecem no Explorar (independe de o perfil do autor estar ativo).
export async function searchPublicProjects({ q, tech, status, page }: ExploreParams) {
  const where: Prisma.ProjectWhereInput = {
    visibility: "PUBLIC",
    ...(status && { status }),
    ...(tech && { technologies: { some: { technology: { slug: tech } } } }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        { technologies: { some: { technology: { name: { contains: q, mode: "insensitive" } } } } },
      ],
    }),
  }

  const [total, projects] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      include: {
        technologies: {
          select: { technology: { select: { id: true, name: true, slug: true, color: true } } },
          orderBy: { technology: { name: "asc" } },
        },
        user: { select: { name: true, username: true, image: true, isPublic: true } },
      },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * EXPLORE_PAGE_SIZE,
      take: EXPLORE_PAGE_SIZE,
    }),
  ])

  return { projects, total, pageCount: Math.max(1, Math.ceil(total / EXPLORE_PAGE_SIZE)) }
}

export type ExploreProject = Awaited<ReturnType<typeof searchPublicProjects>>["projects"][number]

// Tecnologias usadas em pelo menos um projeto público, com a quantidade, para os filtros.
export async function listExploreTechnologies() {
  const technologies = await prisma.technology.findMany({
    where: { projects: { some: { project: { visibility: "PUBLIC" } } } },
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      _count: { select: { projects: { where: { project: { visibility: "PUBLIC" } } } } },
    },
  })

  return technologies
    .map(({ _count, ...tech }) => ({ ...tech, count: _count.projects }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "pt-BR"))
}
