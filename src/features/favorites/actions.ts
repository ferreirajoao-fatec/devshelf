"use server"

import { revalidatePath } from "next/cache"

import { requireUser } from "@/lib/session"
import { FavoriteNotAllowedError, toggleFavorite } from "@/services/favorites"

export type ToggleFavoriteResult = { favorited: boolean; count: number } | { error: string }

export async function toggleFavoriteAction(projectId: string): Promise<ToggleFavoriteResult> {
  const user = await requireUser()

  try {
    const result = await toggleFavorite(user.id, projectId)
    revalidatePath("/favoritos")
    return result
  } catch (error) {
    if (error instanceof FavoriteNotAllowedError) return { error: "Não é possível favoritar este projeto." }
    throw error
  }
}
