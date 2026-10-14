import { z } from "zod"

export const MAX_BIO_LENGTH = 300

export const profileFormSchema = z.object({
  bio: z
    .string()
    .trim()
    .max(MAX_BIO_LENGTH, `A bio deve ter no máximo ${MAX_BIO_LENGTH} caracteres`)
    .transform((value) => value || undefined)
    .optional(),
  isPublic: z.boolean(),
})

export type ProfileFormInput = z.input<typeof profileFormSchema>
export type ProfileFormData = z.output<typeof profileFormSchema>

export function profileFormDataToInput(formData: FormData): ProfileFormInput {
  const bio = formData.get("bio")
  return {
    bio: typeof bio === "string" ? bio : "",
    isPublic: formData.get("isPublic") === "on",
  }
}
