"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { GitHubError } from "@/lib/github"
import { requireUser } from "@/lib/session"
import { findImportedProject, getOwnPublicRepo } from "@/services/github-import"
import { createProject, RepoAlreadyImportedError } from "@/services/projects"

import type { ProjectFormState } from "../projects/actions"
import { projectFormDataToInput, projectFormSchema } from "../projects/schema"
import { githubErrorMessage, parseRepoId } from "./errors"

export async function importProjectAction(
  repoIdParam: string,
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const user = await requireUser()
  const input = projectFormDataToInput(formData)
  const repoId = parseRepoId(repoIdParam)
  if (!repoId) return { message: githubErrorMessage("not_found"), values: input }

  const parsed = projectFormSchema.safeParse(input)
  if (!parsed.success) {
    return {
      message: "Corrija os campos destacados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: input,
    }
  }

  const alreadyImported = { message: "Este repositório já foi importado para a sua estante.", values: input }
  if (await findImportedProject(user.id, repoId)) return alreadyImported

  try {
    // Relê o repositório no GitHub: confirma dono e visibilidade e usa o nome oficial.
    const { repo } = await getOwnPublicRepo(user.id, repoId)
    await createProject(user.id, parsed.data, { repoId, fullName: repo.full_name })
  } catch (error) {
    if (error instanceof GitHubError) return { message: githubErrorMessage(error.reason), values: input }
    if (error instanceof RepoAlreadyImportedError) return alreadyImported
    throw error
  }

  revalidatePath("/projetos")
  revalidatePath("/dashboard")
  redirect("/projetos")
}
