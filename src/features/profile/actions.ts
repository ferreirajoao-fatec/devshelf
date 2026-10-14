"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { requireUser } from "@/lib/session"
import { updateProfile, UsernameTakenError } from "@/services/profiles"

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

  try {
    await updateProfile(user.id, parsed.data)
  } catch (error) {
    if (!(error instanceof UsernameTakenError)) throw error
    return {
      message: "Corrija os campos destacados.",
      fieldErrors: { username: ["Este username já está em uso"] },
      values: input,
    }
  }

  // Nome e username aparecem no header de todas as páginas, e o endereço do perfil pode ter mudado
  revalidatePath("/", "layout")
  return { success: true, message: "Perfil atualizado.", values: { ...input, username: parsed.data.username } }
}
