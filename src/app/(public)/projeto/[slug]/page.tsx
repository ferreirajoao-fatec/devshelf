import { ExternalLink, Lock, Pencil, Star } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { GitHubIcon } from "@/components/icons/github-icon"
import { Markdown } from "@/components/markdown"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CoverImage } from "@/features/projects/components/cover-image"
import { StatusBadge } from "@/features/projects/components/status-badge"
import { getCurrentUser } from "@/lib/session"
import { getViewableProjectBySlug } from "@/services/projects"
import { formatDate, formatDateOnly } from "@/utils/format"

async function loadProject(slug: string) {
  const viewer = await getCurrentUser()
  const project = await getViewableProjectBySlug(slug, viewer?.id ?? null)
  return { project, isOwner: Boolean(project && viewer?.id === project.userId) }
}

export async function generateMetadata({ params }: PageProps<"/projeto/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const { project } = await loadProject(slug)
  if (!project) return { title: "Projeto não encontrado" }

  const author = project.user.name ?? project.user.username
  const description = project.shortDescription ?? `Projeto de ${author} no DevShelf.`

  return {
    title: project.title,
    description,
    // Projeto privado nunca deve ser indexado, mesmo que o dono compartilhe o link
    robots: project.visibility === "PUBLIC" ? undefined : { index: false, follow: false },
    openGraph: {
      type: "article",
      title: project.title,
      description,
      images: project.coverImageUrl ? [project.coverImageUrl] : undefined,
    },
  }
}

export default async function ProjectPage({ params }: PageProps<"/projeto/[slug]">) {
  const { slug } = await params
  const { project, isOwner } = await loadProject(slug)
  // Inexistente ou privado de outra pessoa: 404 nos dois casos
  if (!project) notFound()

  const technologies = project.technologies.map((t) => t.technology)
  const author = project.user
  const authorName = author.name ?? author.username ?? "Autor"

  return (
    <article className="mx-auto w-full max-w-5xl space-y-8">
      {project.visibility !== "PUBLIC" && (
        <p className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          <Lock className="size-4 shrink-0" />
          Projeto privado: só você vê esta página. Torne-o público na edição para compartilhar.
        </p>
      )}

      {project.coverImageUrl && (
        <CoverImage
          src={project.coverImageUrl}
          alt={`Capa do projeto ${project.title}`}
          crop={{ x: project.coverPositionX, y: project.coverPositionY, zoom: project.coverZoom }}
        />
      )}

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={project.status} />
          {project.featured && (
            <Badge variant="secondary" className="gap-1">
              <Star />
              Destaque
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{project.title}</h1>
          {project.shortDescription && (
            <p className="text-lg text-muted-foreground">{project.shortDescription}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {project.repositoryUrl && (
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              <GitHubIcon />
              Repositório
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              <ExternalLink />
              Ver demo
            </a>
          )}
          {isOwner && (
            <Link href={`/projetos/${project.id}/editar`} className={buttonVariants()}>
              <Pencil />
              Editar
            </Link>
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
        <section aria-label="Descrição">
          {project.description ? (
            <Markdown>{project.description}</Markdown>
          ) : (
            <p className="text-muted-foreground">Este projeto ainda não tem uma descrição.</p>
          )}
        </section>

        <aside className="space-y-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Autor</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Avatar size="lg">
                {author.image && <AvatarImage src={author.image} alt="" />}
                <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{authorName}</p>
                {author.username && (
                  <p className="truncate text-sm text-muted-foreground">@{author.username}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {technologies.length > 0 && (
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Tecnologias</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-wrap gap-1.5">
                  {technologies.map((tech) => (
                    <li key={tech.id}>
                      <Badge variant="outline" className="gap-1.5">
                        <span
                          aria-hidden="true"
                          className="size-2 rounded-full border"
                          style={tech.color ? { backgroundColor: tech.color } : undefined}
                        />
                        {tech.name}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Detalhes</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                {project.startedAt && (
                  <>
                    <dt className="text-muted-foreground">Início</dt>
                    <dd>{formatDateOnly(project.startedAt)}</dd>
                  </>
                )}
                {project.completedAt && (
                  <>
                    <dt className="text-muted-foreground">Conclusão</dt>
                    <dd>{formatDateOnly(project.completedAt)}</dd>
                  </>
                )}
                <dt className="text-muted-foreground">Atualizado</dt>
                <dd>{formatDate(project.updatedAt)}</dd>
              </dl>
            </CardContent>
          </Card>
        </aside>
      </div>
    </article>
  )
}
