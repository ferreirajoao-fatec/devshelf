import { FolderPlus, Plus } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { GitHubIcon } from "@/components/icons/github-icon"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PROJECT_STATUS_COLORS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES,
} from "@/features/projects/status"
import { requireUser } from "@/lib/session"
import { cn } from "@/lib/utils"
import { getProjectStatusCounts } from "@/services/projects"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const user = await requireUser()
  const firstName = (user.name ?? user.username ?? "").split(" ")[0]

  const counts = await getProjectStatusCounts(user.id)
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Olá, {firstName}!</h1>
          <p className="text-muted-foreground">Este é o resumo da sua estante de projetos.</p>
        </div>
        <Link href="/projetos/novo" className={buttonVariants()}>
          <Plus />
          Novo projeto
        </Link>
      </div>

      <section aria-labelledby="stats-title" className="space-y-3">
        <h2 id="stats-title" className="text-sm font-medium text-muted-foreground">
          {total} {total === 1 ? "projeto" : "projetos"} no total
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {PROJECT_STATUSES.map((status) => (
            <Link
              key={status}
              href={`/projetos?status=${status}`}
              className="rounded-xl outline-none transition-shadow hover:ring-2 hover:ring-ring/30 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Card size="sm">
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
            </Link>
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
              <Link href="/projetos/novo" className={buttonVariants()}>
                <Plus />
                Novo projeto
              </Link>
              <Link href="/projetos/importar" className={buttonVariants({ variant: "outline" })}>
                <GitHubIcon />
                Importar do GitHub
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
