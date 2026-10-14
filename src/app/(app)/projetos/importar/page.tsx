import type { Metadata } from "next"
import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { GitHubErrorCard } from "@/features/github-import/components/github-error"
import { RepoList } from "@/features/github-import/components/repo-list"
import { GitHubError } from "@/lib/github"
import { requireUser } from "@/lib/session"
import { listImportableRepos, type ImportableRepo } from "@/services/github-import"
import { formatDate } from "@/utils/format"

export const metadata: Metadata = {
  title: "Importar do GitHub",
}

export default async function ImportPage() {
  const user = await requireUser()

  let repos: ImportableRepo[]
  try {
    repos = await listImportableRepos(user.id)
  } catch (error) {
    if (!(error instanceof GitHubError)) throw error
    return (
      <ImportLayout>
        <GitHubErrorCard reason={error.reason} backHref="/projetos" />
      </ImportLayout>
    )
  }

  // Datas formatadas no servidor para não divergir na hidratação
  const updatedAtLabels = Object.fromEntries(
    repos.filter((r) => r.pushedAt).map((r) => [r.id, formatDate(new Date(r.pushedAt!))])
  )

  return (
    <ImportLayout>
      {repos.length > 0 ? (
        <RepoList repos={repos} updatedAtLabels={updatedAtLabels} />
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhum repositório público encontrado na sua conta do GitHub.
          </CardContent>
        </Card>
      )}
    </ImportLayout>
  )
}

function ImportLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Importar do GitHub</h1>
        <p className="text-muted-foreground">
          Escolha um repositório público. Você revisa os dados antes de salvar, e o projeto começa
          privado.
        </p>
      </div>
      {children}
    </div>
  )
}
