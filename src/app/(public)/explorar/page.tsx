import { ChevronLeft, ChevronRight, SearchX, Search, X } from "lucide-react"
import type { Metadata } from "next"
import Form from "next/form"
import Link from "next/link"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { exploreHref, MAX_QUERY_LENGTH, parseExploreParams } from "@/features/explore/params"
import { ProjectCard } from "@/features/projects/components/project-card"
import { PROJECT_STATUS_LABELS, PROJECT_STATUSES } from "@/features/projects/status"
import { cn } from "@/lib/utils"
import { listExploreTechnologies, searchPublicProjects } from "@/services/explore"

export const metadata: Metadata = {
  title: "Explorar",
  description: "Descubra projetos publicados por desenvolvedores no DevShelf.",
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
      )}
    >
      {children}
    </Link>
  )
}

export default async function ExplorePage({ searchParams }: PageProps<"/explorar">) {
  const params = parseExploreParams(await searchParams)
  const [{ projects, total, pageCount }, technologies] = await Promise.all([
    searchPublicProjects(params),
    listExploreTechnologies(),
  ])

  // Página além da última (ex.: link antigo depois de projetos saírem): vai para a última
  if (params.page > pageCount) redirect(exploreHref(params, { page: pageCount }))

  const hasFilters = Boolean(params.q || params.tech || params.status)
  const { page } = params

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Explorar</h1>
        <p className="text-muted-foreground">Projetos públicos da comunidade do DevShelf.</p>
      </div>

      {/* GET para /explorar: a busca vira ?q= na URL; tecnologia e status selecionados são mantidos */}
      <Form action="/explorar" className="flex gap-2" role="search">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            defaultValue={params.q}
            maxLength={MAX_QUERY_LENGTH}
            placeholder="Buscar por nome, descrição ou tecnologia..."
            aria-label="Buscar projetos"
            className="pl-8"
          />
        </div>
        {params.tech && <input type="hidden" name="tech" value={params.tech} />}
        {params.status && <input type="hidden" name="status" value={params.status} />}
        <Button type="submit">Buscar</Button>
      </Form>

      <div className="space-y-3">
        <nav aria-label="Filtrar por status" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <FilterChip href={exploreHref(params, { status: undefined })} active={!params.status}>
            Todos os status
          </FilterChip>
          {PROJECT_STATUSES.map((status) => (
            <FilterChip key={status} href={exploreHref(params, { status })} active={params.status === status}>
              {PROJECT_STATUS_LABELS[status]}
            </FilterChip>
          ))}
        </nav>

        {technologies.length > 0 && (
          <nav aria-label="Filtrar por tecnologia" className="flex flex-wrap gap-1.5">
            {technologies.map((tech) => {
              const active = params.tech === tech.slug
              return (
                <FilterChip
                  key={tech.id}
                  // Clicar na tecnologia ativa remove o filtro
                  href={exploreHref(params, { tech: active ? undefined : tech.slug })}
                  active={active}
                >
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full border"
                    style={tech.color ? { backgroundColor: tech.color } : undefined}
                  />
                  {tech.name}
                  <span className={cn("text-xs tabular-nums", !active && "text-muted-foreground")}>{tech.count}</span>
                </FilterChip>
              )
            })}
          </nav>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <p aria-live="polite">
          {total} {total === 1 ? "projeto encontrado" : "projetos encontrados"}
        </p>
        {hasFilters && (
          <Link href="/explorar" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <X />
            Limpar filtros
          </Link>
        )}
      </div>

      {projects.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} variant="public" author={project.user} />
            </li>
          ))}
        </ul>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="rounded-full bg-muted p-3">
              <SearchX className="size-6 text-muted-foreground" />
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              {hasFilters
                ? "Nenhum projeto corresponde aos filtros. Tente outra busca ou limpe os filtros."
                : "Ainda não há projetos públicos. Seja o primeiro a publicar um!"}
            </p>
            {hasFilters && (
              <Link href="/explorar" className={buttonVariants({ variant: "outline" })}>
                Limpar filtros
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {pageCount > 1 && (
        <nav aria-label="Paginação" className="flex items-center justify-center gap-2">
          {page > 1 ? (
            <Link href={exploreHref(params, { page: page - 1 })} className={buttonVariants({ variant: "outline" })}>
              <ChevronLeft />
              Anterior
            </Link>
          ) : (
            <Button variant="outline" disabled>
              <ChevronLeft />
              Anterior
            </Button>
          )}
          <span className="px-2 text-sm text-muted-foreground tabular-nums">
            Página {page} de {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={exploreHref(params, { page: page + 1 })} className={buttonVariants({ variant: "outline" })}>
              Próxima
              <ChevronRight />
            </Link>
          ) : (
            <Button variant="outline" disabled>
              Próxima
              <ChevronRight />
            </Button>
          )}
        </nav>
      )}
    </div>
  )
}
