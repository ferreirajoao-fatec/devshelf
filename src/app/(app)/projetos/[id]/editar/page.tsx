import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { updateProjectAction } from "@/features/projects/actions"
import { ProjectForm } from "@/features/projects/components/project-form"
import { requireUser } from "@/lib/session"
import { getOwnedProject, listTechnologies } from "@/services/projects"
import { toDateInputValue } from "@/utils/format"

export const metadata: Metadata = {
  title: "Editar projeto",
}

export default async function EditProjectPage({ params }: PageProps<"/projetos/[id]/editar">) {
  const { id } = await params
  const user = await requireUser()

  const [project, technologies] = await Promise.all([getOwnedProject(id, user.id), listTechnologies()])
  // Projeto inexistente ou de outro usuário: 404 nos dois casos
  if (!project) notFound()

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar projeto</h1>
        <p className="text-muted-foreground">{project.title}</p>
      </div>
      <ProjectForm
        action={updateProjectAction.bind(null, project.id)}
        technologies={technologies}
        submitLabel="Salvar alterações"
        defaultValues={{
          title: project.title,
          shortDescription: project.shortDescription ?? "",
          description: project.description ?? "",
          status: project.status,
          visibility: project.visibility,
          featured: project.featured,
          repositoryUrl: project.repositoryUrl ?? "",
          demoUrl: project.demoUrl ?? "",
          coverImageUrl: project.coverImageUrl ?? "",
          coverPositionX: project.coverPositionX,
          coverPositionY: project.coverPositionY,
          coverZoom: project.coverZoom,
          startedAt: toDateInputValue(project.startedAt),
          completedAt: toDateInputValue(project.completedAt),
          technologyIds: project.technologies.map((t) => t.technology.id),
        }}
      />
    </div>
  )
}
