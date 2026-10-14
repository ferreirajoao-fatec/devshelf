import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { GitHubIcon } from "@/components/icons/github-icon"
import { importProjectAction } from "@/features/github-import/actions"
import { GitHubErrorCard } from "@/features/github-import/components/github-error"
import { parseRepoId } from "@/features/github-import/errors"
import { ProjectForm } from "@/features/projects/components/project-form"
import { GitHubError } from "@/lib/github"
import { requireUser } from "@/lib/session"
import { findImportedProject, getImportFormDefaults } from "@/services/github-import"
import { listTechnologies } from "@/services/projects"

export const metadata: Metadata = {
  title: "Importar repositório",
}

export default async function ImportRepoPage({ params }: PageProps<"/projetos/importar/[repoId]">) {
  const { repoId: repoIdParam } = await params
  const repoId = parseRepoId(repoIdParam)
  if (!repoId) notFound()

  const user = await requireUser()

  // Repositório já importado: leva direto para a edição do projeto existente
  const existing = await findImportedProject(user.id, repoId)
  if (existing) redirect(`/projetos/${existing.id}/editar`)

  let data: Awaited<ReturnType<typeof getImportFormDefaults>>
  try {
    data = await getImportFormDefaults(user.id, repoId)
  } catch (error) {
    if (!(error instanceof GitHubError)) throw error
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Importar repositório</h1>
        <GitHubErrorCard reason={error.reason} backHref="/projetos/importar" />
      </div>
    )
  }

  const technologies = await listTechnologies()
  const { repo, defaults } = data

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Importar repositório</h1>
        <p className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
          <GitHubIcon className="size-4" />
          <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {repo.full_name}
          </a>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Preenchemos os campos com os dados do repositório. Revise, ajuste o que quiser e confirme;
          nada é salvo antes disso.
        </p>
      </div>
      <ProjectForm
        action={importProjectAction.bind(null, repoIdParam)}
        technologies={technologies}
        submitLabel="Importar projeto"
        cancelHref="/projetos/importar"
        defaultValues={defaults}
      />
    </div>
  )
}
