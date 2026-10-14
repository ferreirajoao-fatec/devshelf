"use client"

import { Archive, Check, Download, GitFork, Search, Star } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { ImportableRepo } from "@/services/github-import"

type Filter = "pending" | "all"

export function RepoList({ repos, updatedAtLabels }: { repos: ImportableRepo[]; updatedAtLabels: Record<string, string> }) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("pending")

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return repos.filter(
      (repo) =>
        (filter === "all" || !repo.importedProjectId) &&
        (!q || repo.name.toLowerCase().includes(q) || repo.description?.toLowerCase().includes(q))
    )
  }, [repos, query, filter])

  const pendingCount = repos.filter((repo) => !repo.importedProjectId).length

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar repositório..."
            aria-label="Buscar repositório"
            className="pl-8"
          />
        </div>
        <div role="group" aria-label="Filtrar repositórios" className="flex gap-1.5">
          {(
            [
              ["pending", `Não importados (${pendingCount})`],
              ["all", `Todos (${repos.length})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={
                filter === value
                  ? "rounded-full border border-primary bg-primary px-3 py-1 text-sm text-primary-foreground"
                  : "rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted"
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {query
              ? "Nenhum repositório corresponde à busca."
              : "Todos os seus repositórios públicos já estão na estante."}
          </CardContent>
        </Card>
      ) : (
        <ul className="divide-y rounded-xl border">
          {visible.map((repo) => (
            <li key={repo.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate font-medium hover:underline"
                  >
                    {repo.name}
                  </a>
                  {repo.fork && (
                    <Badge variant="secondary" className="gap-1">
                      <GitFork />
                      Fork
                    </Badge>
                  )}
                  {repo.archived && (
                    <Badge variant="secondary" className="gap-1">
                      <Archive />
                      Arquivado
                    </Badge>
                  )}
                </div>
                {repo.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{repo.description}</p>
                )}
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {repo.language && <span>{repo.language}</span>}
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-3" aria-hidden="true" />
                    <span className="sr-only">Estrelas:</span>
                    {repo.stars}
                  </span>
                  {updatedAtLabels[repo.id] && <span>Atualizado em {updatedAtLabels[repo.id]}</span>}
                </p>
              </div>

              {repo.importedProjectId ? (
                <Link
                  href={`/projetos/${repo.importedProjectId}/editar`}
                  className={buttonVariants({ variant: "outline", size: "sm", className: "shrink-0" })}
                >
                  <Check />
                  Já importado
                </Link>
              ) : (
                <Link
                  href={`/projetos/importar/${repo.id}`}
                  className={buttonVariants({ size: "sm", className: "shrink-0" })}
                >
                  <Download />
                  Importar
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
