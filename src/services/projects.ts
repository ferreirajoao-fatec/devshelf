import "server-only"

import type { ProjectFormData } from "@/features/projects/schema"
import { nextAvailableSlug, slugify } from "@/features/projects/slug"
import { PROJECT_STATUSES, type ProjectStatus } from "@/features/projects/status"
import { Prisma } from "@/generated/prisma/client"
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

// ---------------------------------------------------------------------------
// Leitura
// ---------------------------------------------------------------------------

const technologiesInclude = {
  technologies: {
    select: { technology: { select: { id: true, name: true, slug: true, color: true } } },
    orderBy: { technology: { name: "asc" } },
  },
} satisfies Prisma.ProjectInclude

export async function listUserProjects(userId: string, status?: ProjectStatus) {
  return prisma.project.findMany({
    where: { userId, ...(status && { status }) },
    include: technologiesInclude,
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  })
}

export type UserProject = Awaited<ReturnType<typeof listUserProjects>>[number]

// Retorna o projeto apenas se pertencer ao usuário; caso contrário, null
// (quem não é dono não consegue nem saber se o projeto existe).
export async function getOwnedProject(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, userId },
    include: technologiesInclude,
  })
}

export async function listTechnologies() {
  return prisma.technology.findMany({
    select: { id: true, name: true, color: true },
    orderBy: { name: "asc" },
  })
}

// ---------------------------------------------------------------------------
// Escrita
// ---------------------------------------------------------------------------

// Descarta ids de tecnologias que não existem (o formulário pode ter sido adulterado).
async function existingTechnologyIds(ids: string[]) {
  if (ids.length === 0) return []
  const found = await prisma.technology.findMany({ where: { id: { in: ids } }, select: { id: true } })
  return found.map((t) => t.id)
}

function toProjectFields(data: ProjectFormData) {
  return {
    title: data.title,
    shortDescription: data.shortDescription ?? null,
    description: data.description ?? null,
    status: data.status,
    visibility: data.visibility,
    featured: data.featured,
    repositoryUrl: data.repositoryUrl ?? null,
    demoUrl: data.demoUrl ?? null,
    coverImageUrl: data.coverImageUrl ?? null,
    startedAt: data.startedAt ? new Date(data.startedAt) : null,
    completedAt: data.completedAt ? new Date(data.completedAt) : null,
  }
}

async function findAvailableSlug(title: string) {
  const base = slugify(title)
  const taken = await prisma.project.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  })
  return nextAvailableSlug(
    base,
    taken.map((p) => p.slug)
  )
}

function isUniqueViolation(error: unknown, field: string) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    JSON.stringify(error.meta ?? {}).includes(field)
  )
}

export async function createProject(userId: string, data: ProjectFormData) {
  const technologyIds = await existingTechnologyIds(data.technologyIds)

  // Dois cadastros simultâneos podem escolher o mesmo slug; tenta de novo nesse caso.
  for (let attempt = 0; ; attempt++) {
    const slug = await findAvailableSlug(data.title)
    try {
      return await prisma.project.create({
        data: {
          ...toProjectFields(data),
          slug,
          userId,
          technologies: { create: technologyIds.map((technologyId) => ({ technologyId })) },
        },
      })
    } catch (error) {
      if (attempt < 3 && isUniqueViolation(error, "slug")) continue
      throw error
    }
  }
}

// O slug não muda na edição, para não quebrar links já compartilhados.
// Retorna null se o projeto não existir ou não pertencer ao usuário.
export async function updateProject(projectId: string, userId: string, data: ProjectFormData) {
  const owned = await prisma.project.findFirst({ where: { id: projectId, userId }, select: { id: true } })
  if (!owned) return null

  const technologyIds = await existingTechnologyIds(data.technologyIds)

  return prisma.project.update({
    where: { id: owned.id },
    data: {
      ...toProjectFields(data),
      technologies: {
        deleteMany: {},
        create: technologyIds.map((technologyId) => ({ technologyId })),
      },
    },
  })
}

// Retorna false se o projeto não existir ou não pertencer ao usuário.
export async function deleteProject(projectId: string, userId: string) {
  const { count } = await prisma.project.deleteMany({ where: { id: projectId, userId } })
  return count > 0
}
