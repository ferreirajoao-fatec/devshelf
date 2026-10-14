import "server-only"

import { cache } from "react"

import type { ProfileFormData } from "@/features/profile/schema"
import { nextAvailableSlug } from "@/features/projects/slug"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export class UsernameTakenError extends Error {}

// Perfil para a página /u/[username].
// Perfil público: visível para todos. Privado: só o dono vê (para os demais, null = 404).
export const getViewableProfile = cache(async (username: string, viewerId: string | null) => {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true, name: true, username: true, image: true, bio: true, isPublic: true, createdAt: true },
  })

  if (!user) return null
  if (!user.isPublic && user.id !== viewerId) return null
  return user
})

export async function getProfileSettings(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, username: true, bio: true, isPublic: true },
  })
}

// Lança UsernameTakenError se o username já pertencer a outra pessoa.
export async function updateProfile(userId: string, data: ProfileFormData) {
  const taken = await prisma.user.findFirst({
    where: { username: data.username, id: { not: userId } },
    select: { id: true },
  })
  if (taken) throw new UsernameTakenError()

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name: data.name ?? null, username: data.username, bio: data.bio ?? null, isPublic: data.isPublic },
    })
  } catch (error) {
    // Outra pessoa pegou o mesmo username entre a checagem e a gravação
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new UsernameTakenError()
    }
    throw error
  }
}

// Username para um usuário novo: o login do GitHub, ou login-2, login-3... se alguém
// já tiver adotado esse username no DevShelf.
export async function findAvailableUsername(login: string) {
  const base = login.toLowerCase()
  const taken = await prisma.user.findMany({
    where: { username: { startsWith: base } },
    select: { username: true },
  })
  return nextAvailableSlug(
    base,
    taken.flatMap((u) => (u.username ? [u.username] : []))
  )
}
