import { z } from "zod"

export const MAX_BIO_LENGTH = 300
export const MAX_NAME_LENGTH = 60
export const MAX_USERNAME_LENGTH = 39 // mesmo limite do GitHub

// Mesmas regras de um login do GitHub (de onde vem o username inicial): letras, números
// e hífens, começando por letra ou número. Guardado sempre em minúsculas.
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Informe um username")
  .max(MAX_USERNAME_LENGTH, `O username deve ter no máximo ${MAX_USERNAME_LENGTH} caracteres`)
  .regex(USERNAME_PATTERN, "Use apenas letras, números e hífens, começando por letra ou número")

export const profileFormSchema = z.object({
  // Vazio = usa o username no lugar do nome
  name: z
    .string()
    .trim()
    .max(MAX_NAME_LENGTH, `O nome deve ter no máximo ${MAX_NAME_LENGTH} caracteres`)
    .transform((value) => value || undefined)
    .optional(),
  username: usernameSchema,
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
  const text = (key: string) => {
    const value = formData.get(key)
    return typeof value === "string" ? value : ""
  }
  return {
    name: text("name"),
    username: text("username"),
    bio: text("bio"),
    isPublic: formData.get("isPublic") === "on",
  }
}
