"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireUser } from "@/lib/session"
import { updateProfile } from "@/services/profiles"

import { profileFormDataToInput, profileFormSchema, type ProfileFormInput } from "./schema"

export type ProfileFormState = {
  message?: string
  success?: boolean
  fieldErrors?: Partial<Record<keyof ProfileFormInput, string[]>>
  values?: ProfileFormInput
}

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await requireUser()
  const input = profileFormDataToInput(formData)
  const parsed = profileFormSchema.safeParse(input)

  if (!parsed.success) {
    return {
      message: "Corrija os campos destacados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: input,
    }
  }

  const { username } = await updateProfile(user.id, parsed.data)

  revalidatePath("/dashboard")
  if (username) revalidatePath(`/u/${username}`)
  return { success: true, message: "Perfil atualizado.", values: input }
}
