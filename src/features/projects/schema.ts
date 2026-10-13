import { z } from "zod"

import { ProjectStatus, ProjectVisibility } from "@/generated/prisma/enums"

export const MAX_TECHNOLOGIES = 20

// Campos opcionais chegam do formulário como "" — normalizamos para undefined.
const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} deve ter no máximo ${max} caracteres`)
    .transform((value) => value || undefined)
    .optional()

const optionalUrl = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .pipe(z.url({ protocol: /^https?$/, error: "Informe uma URL válida (http ou https)" }).optional())
  .optional()

const optionalDate = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .pipe(z.iso.date({ error: "Data inválida" }).optional())
  .optional()

export const projectFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "O título deve ter pelo menos 2 caracteres")
      .max(100, "O título deve ter no máximo 100 caracteres"),
    shortDescription: optionalText(200, "A descrição curta"),
    description: optionalText(5000, "A descrição"),
    status: z.enum(ProjectStatus, { error: "Selecione um status" }),
    visibility: z.enum(ProjectVisibility, { error: "Selecione a visibilidade" }),
    featured: z.boolean(),
    repositoryUrl: optionalUrl,
    demoUrl: optionalUrl,
    coverImageUrl: optionalUrl,
    startedAt: optionalDate,
    completedAt: optionalDate,
    technologyIds: z
      .array(z.string().min(1))
      .max(MAX_TECHNOLOGIES, `Selecione no máximo ${MAX_TECHNOLOGIES} tecnologias`),
  })
  .refine((data) => !data.startedAt || !data.completedAt || data.completedAt >= data.startedAt, {
    path: ["completedAt"],
    message: "A conclusão não pode ser antes do início",
  })

export type ProjectFormInput = z.input<typeof projectFormSchema>
export type ProjectFormData = z.output<typeof projectFormSchema>

// Converte o FormData do formulário no formato esperado pelo schema.
export function projectFormDataToInput(formData: FormData): ProjectFormInput {
  const text = (key: string) => {
    const value = formData.get(key)
    return typeof value === "string" ? value : ""
  }

  return {
    title: text("title"),
    shortDescription: text("shortDescription"),
    description: text("description"),
    status: text("status") as ProjectFormInput["status"],
    visibility: text("visibility") as ProjectFormInput["visibility"],
    featured: formData.get("featured") === "on",
    repositoryUrl: text("repositoryUrl"),
    demoUrl: text("demoUrl"),
    coverImageUrl: text("coverImageUrl"),
    startedAt: text("startedAt"),
    completedAt: text("completedAt"),
    technologyIds: [...new Set(formData.getAll("technologyIds").filter((v) => typeof v === "string"))],
  }
}
