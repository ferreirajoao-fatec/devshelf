import "server-only"

import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export class FavoriteNotAllowedError extends Error {}

// Favorita ou desfavorita. Só projetos públicos de outras pessoas podem ser favoritados;
// desfavoritar é sempre permitido (o projeto pode ter virado privado depois).
// Retorna o novo estado e o total de favoritos do projeto.
export async function toggleFavorite(userId: string, projectId: string) {
  const where = { userId_projectId: { userId, projectId } }
  const existing = await prisma.favorite.findUnique({ where, select: { projectId: true } })

  if (existing) {
    await prisma.favorite.deleteMany({ where: { userId, projectId } })
  } else {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true, visibility: true },
    })
    if (!project || project.visibility !== "PUBLIC" || project.userId === userId) {
      throw new FavoriteNotAllowedError()
    }
    try {
      await prisma.favorite.create({ data: { userId, projectId } })
    } catch (error) {
      // Clique duplo: o favorito já foi criado pela outra requisição
      const duplicate = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
      if (!duplicate) throw error
    }
  }

  const count = await prisma.favorite.count({ where: { projectId } })
  return { favorited: !existing, count }
}

// Quais destes projetos o usuário já favoritou (para marcar os botões nas listagens).
export async function getFavoritedProjectIds(userId: string, projectIds: string[]) {
  if (projectIds.length === 0) return new Set<string>()
  const favorites = await prisma.favorite.findMany({
    where: { userId, projectId: { in: projectIds } },
    select: { projectId: true },
  })
  return new Set(favorites.map((f) => f.projectId))
}

export async function getProjectFavoriteState(projectId: string, userId: string | null) {
  const [count, mine] = await Promise.all([
    prisma.favorite.count({ where: { projectId } }),
    userId ? prisma.favorite.findUnique({ where: { userId_projectId: { userId, projectId } } }) : null,
  ])
  return { count, favorited: Boolean(mine) }
}

// Favoritos do usuário, do mais recente ao mais antigo. Projetos que viraram privados não aparecem.
export async function listFavoriteProjects(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId, project: { visibility: "PUBLIC" } },
    orderBy: { createdAt: "desc" },
    select: {
      project: {
        include: {
          technologies: {
            select: { technology: { select: { id: true, name: true, slug: true, color: true } } },
            orderBy: { technology: { name: "asc" } },
          },
          user: { select: { name: true, username: true, image: true, isPublic: true } },
        },
      },
    },
  })
  return favorites.map((f) => f.project)
}
