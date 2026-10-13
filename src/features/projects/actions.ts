"use server"

import { revalidatePath } from "next/cache"
import { notFound, redirect } from "next/navigation"
import { z } from "zod"

import { requireUser } from "@/lib/session"
import { createProject, deleteProject, updateProject } from "@/services/projects"

import { projectFormDataToInput, projectFormSchema, type ProjectFormInput } from "./schema"

export type ProjectFormState = {
  message?: string
  fieldErrors?: Partial<Record<keyof ProjectFormInput, string[]>>
  // Valores enviados, para o formulário não perder o que foi digitado quando há erro
  values?: ProjectFormInput
}

function revalidateProjectPages() {
  revalidatePath("/projetos")
  revalidatePath("/dashboard")
}

export async function createProjectAction(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const user = await requireUser()
  const input = projectFormDataToInput(formData)
  const parsed = projectFormSchema.safeParse(input)

  if (!parsed.success) {
    return {
      message: "Corrija os campos destacados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: input,
    }
  }

  await createProject(user.id, parsed.data)
  revalidateProjectPages()
  redirect("/projetos")
}

export async function updateProjectAction(
  projectId: string,
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const user = await requireUser()
  const input = projectFormDataToInput(formData)
  const parsed = projectFormSchema.safeParse(input)

  if (!parsed.success) {
    return {
      message: "Corrija os campos destacados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: input,
    }
  }

  const updated = await updateProject(projectId, user.id, parsed.data)
  if (!updated) notFound()

  revalidateProjectPages()
  redirect("/projetos")
}

export async function deleteProjectAction(projectId: string): Promise<{ error?: string }> {
  const user = await requireUser()
  const deleted = await deleteProject(projectId, user.id)
  if (!deleted) return { error: "Projeto não encontrado." }

  revalidateProjectPages()
  return {}
}
