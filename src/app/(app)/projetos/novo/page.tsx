import type { Metadata } from "next"

import { createProjectAction } from "@/features/projects/actions"
import { ProjectForm } from "@/features/projects/components/project-form"
import { listTechnologies } from "@/services/projects"

export const metadata: Metadata = {
  title: "Novo projeto",
}

export default async function NewProjectPage() {
  const technologies = await listTechnologies()

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo projeto</h1>
        <p className="text-muted-foreground">
          O projeto começa privado; você decide quando torná-lo público.
        </p>
      </div>
      <ProjectForm
        action={createProjectAction}
        technologies={technologies}
        submitLabel="Criar projeto"
        defaultValues={{
          title: "",
          status: "IDEA",
          visibility: "PRIVATE",
          featured: false,
          technologyIds: [],
        }}
      />
    </div>
  )
}
