import "server-only"

import { cache } from "react"

import type { ProfileFormData } from "@/features/profile/schema"
import { prisma } from "@/lib/prisma"

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
    select: { username: true, bio: true, isPublic: true },
  })
}

export async function updateProfile(userId: string, data: ProfileFormData) {
  return prisma.user.update({
    where: { id: userId },
    data: { bio: data.bio ?? null, isPublic: data.isPublic },
    select: { username: true },
  })
}
