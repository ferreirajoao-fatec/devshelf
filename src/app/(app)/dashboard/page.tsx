import { FolderPlus, Plus } from "lucide-react"
import type { Metadata } from "next"

import { GitHubIcon } from "@/components/icons/github-icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PROJECT_STATUS_COLORS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES,
  type ProjectStatus,
} from "@/features/projects/status"
import { requireUser } from "@/lib/session"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const user = await requireUser()
  const firstName = (user.name ?? user.username ?? "").split(" ")[0]

  // Os projetos chegam na Etapa 4; até lá os contadores ficam zerados.
  const counts: Record<ProjectStatus, number> = Object.fromEntries(
    PROJECT_STATUSES.map((status) => [status, 0])
  ) as Record<ProjectStatus, number>
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Olá, {firstName}!</h1>
          <p className="text-muted-foreground">Este é o resumo da sua estante de projetos.</p>
        </div>
        <Button disabled>
          <Plus />
          Novo projeto
        </Button>
      </div>

      <section aria-labelledby="stats-title" className="space-y-3">
        <h2 id="stats-title" className="text-sm font-medium text-muted-foreground">
          {total} {total === 1 ? "projeto" : "projetos"} no total
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {PROJECT_STATUSES.map((status) => (
            <Card key={status} size="sm">
              <CardHeader>
                <CardDescription className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn("size-2 rounded-full", PROJECT_STATUS_COLORS[status])}
                  />
                  {PROJECT_STATUS_LABELS[status]}
                </CardDescription>
                <CardTitle className="text-2xl tabular-nums">{counts[status]}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {total === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="rounded-full bg-muted p-3">
              <FolderPlus className="size-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Sua estante está vazia</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Cadastre seu primeiro projeto manualmente ou importe direto de um repositório do
                GitHub.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button disabled>
                <Plus />
                Novo projeto
              </Button>
              <Button variant="outline" disabled>
                <GitHubIcon />
                Importar do GitHub
              </Button>
            </div>
            <Badge variant="secondary">Cadastro e importação chegam nas próximas etapas</Badge>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
