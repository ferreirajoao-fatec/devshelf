import { FolderPlus, Plus } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { GitHubIcon } from "@/components/icons/github-icon"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProjectCard } from "@/features/projects/components/project-card"
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES,
  type ProjectStatus,
} from "@/features/projects/status"
import { requireUser } from "@/lib/session"
import { cn } from "@/lib/utils"
import { listUserProjects } from "@/services/projects"

export const metadata: Metadata = {
  title: "Meus Projetos",
}

function parseStatus(value: string | string[] | undefined): ProjectStatus | undefined {
  return PROJECT_STATUSES.find((s) => s === value)
}

export default async function ProjectsPage({ searchParams }: PageProps<"/projetos">) {
  const user = await requireUser()
  const status = parseStatus((await searchParams).status)
  const projects = await listUserProjects(user.id, status)

  const filters: { label: string; href: string; active: boolean }[] = [
    { label: "Todos", href: "/projetos", active: !status },
    ...PROJECT_STATUSES.map((s) => ({
      label: PROJECT_STATUS_LABELS[s],
      href: `/projetos?status=${s}`,
      active: status === s,
    })),
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meus Projetos</h1>
          <p className="text-muted-foreground">Cadastre, organize e edite os projetos da sua estante.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/projetos/importar" className={buttonVariants({ variant: "outline" })}>
            <GitHubIcon />
            Importar do GitHub
          </Link>
          <Link href="/projetos/novo" className={buttonVariants()}>
            <Plus />
            Novo projeto
          </Link>
        </div>
      </div>

      <nav aria-label="Filtrar por status" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {filters.map((filter) => (
          <Link
            key={filter.href}
            href={filter.href}
            aria-current={filter.active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-sm transition-colors",
              filter.active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            {filter.label}
          </Link>
        ))}
      </nav>

      {projects.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="rounded-full bg-muted p-3">
              <FolderPlus className="size-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">
                {status ? `Nenhum projeto em "${PROJECT_STATUS_LABELS[status]}"` : "Nenhum projeto ainda"}
              </h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                {status
                  ? "Escolha outro filtro ou cadastre um novo projeto."
                  : "Cadastre seu primeiro projeto para começar a montar sua estante."}
              </p>
            </div>
            <Link href="/projetos/novo" className={buttonVariants()}>
              <Plus />
              Novo projeto
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
