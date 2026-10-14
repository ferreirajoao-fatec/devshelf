import { ExternalLink, Globe, Lock, Pencil, Star } from "lucide-react"
import Link from "next/link"

import { GitHubIcon } from "@/components/icons/github-icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FavoriteButton } from "@/features/favorites/components/favorite-button"
import { cn } from "@/lib/utils"
import type { UserProject } from "@/services/projects"
import { formatDate } from "@/utils/format"

import { CoverImage } from "./cover-image"
import { DeleteProjectButton } from "./delete-project-button"
import { StatusBadge } from "./status-badge"

const MAX_VISIBLE_TECHNOLOGIES = 4

type ProjectAuthor = { name: string | null; username: string | null; image: string | null; isPublic: boolean }

type ProjectCardProps = {
  project: UserProject
  // "owner": Meus Projetos (visibilidade, editar, excluir). "public": perfil e listagens abertas.
  variant?: "owner" | "public"
  // Quando informado (ex.: Explorar), o rodapé mostra o autor no lugar da data
  author?: ProjectAuthor
  // Quando informado, mostra o botão de favoritar (só para usuário logado e projeto de outra pessoa)
  favorite?: { favorited: boolean }
}

function AuthorLine({ author }: { author: ProjectAuthor }) {
  const name = author.name ?? author.username ?? "Autor"
  const content = (
    <>
      <Avatar size="sm">
        {author.image && <AvatarImage src={author.image} alt="" />}
        <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="truncate">{name}</span>
    </>
  )
  const className = "flex min-w-0 items-center gap-2 text-xs text-muted-foreground"

  // Link só para perfil ativo; senão levaria a um 404
  return author.isPublic && author.username ? (
    <Link href={`/u/${author.username}`} className={cn(className, "hover:text-foreground hover:underline")}>
      {content}
    </Link>
  ) : (
    <span className={className}>{content}</span>
  )
}

export function ProjectCard({ project, variant = "owner", author, favorite }: ProjectCardProps) {
  const isOwnerView = variant === "owner"
  const technologies = project.technologies.map((t) => t.technology)
  const hidden = technologies.length - MAX_VISIBLE_TECHNOLOGIES
  const isPublic = project.visibility === "PUBLIC"

  return (
    <Card className={cn("h-full", project.coverImageUrl && "pt-0")}>
      {project.coverImageUrl && (
        // Mesmo enquadramento da página do projeto, em tamanho menor.
        // Fora da ordem de tabulação: o título logo abaixo já leva à mesma página.
        <Link href={`/projeto/${project.slug}`} tabIndex={-1} aria-hidden="true">
          <CoverImage
            src={project.coverImageUrl}
            alt=""
            crop={{ x: project.coverPositionX, y: project.coverPositionY, zoom: project.coverZoom }}
            className="rounded-none border-0 border-b"
            imgProps={{ loading: "lazy" }}
          />
        </Link>
      )}
      <CardHeader>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={project.status} />
          {isOwnerView && (
            <Badge variant="secondary" className="gap-1">
              {isPublic ? <Globe /> : <Lock />}
              {isPublic ? "Público" : "Privado"}
            </Badge>
          )}
          {project.featured && (
            <Badge variant="secondary" className="gap-1">
              <Star />
              Destaque
            </Badge>
          )}
        </div>
        <CardTitle className="pt-1 text-base">
          <Link href={`/projeto/${project.slug}`} className="hover:underline">
            {project.title}
          </Link>
        </CardTitle>
        {project.shortDescription && (
          <CardDescription className="line-clamp-2">{project.shortDescription}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        {technologies.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Tecnologias">
            {technologies.slice(0, MAX_VISIBLE_TECHNOLOGIES).map((tech) => (
              <li key={tech.id}>
                <Badge variant="outline">{tech.name}</Badge>
              </li>
            ))}
            {hidden > 0 && (
              <li>
                <Badge variant="outline" title={technologies.slice(MAX_VISIBLE_TECHNOLOGIES).map((t) => t.name).join(", ")}>
                  +{hidden}
                </Badge>
              </li>
            )}
          </ul>
        )}
      </CardContent>

      <CardFooter className="justify-between gap-2 border-t pt-3">
        {author ? (
          <AuthorLine author={author} />
        ) : (
          <span className="text-xs text-muted-foreground">Atualizado em {formatDate(project.updatedAt)}</span>
        )}
        <div className="flex items-center">
          {favorite && (
            <FavoriteButton
              projectId={project.id}
              projectTitle={project.title}
              initialFavorited={favorite.favorited}
            />
          )}
          {project.repositoryUrl && (
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
              aria-label="Abrir repositório"
              title="Repositório"
            >
              <GitHubIcon />
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
              aria-label="Abrir demo"
              title="Demo"
            >
              <ExternalLink />
            </a>
          )}
          {isOwnerView && (
            <>
              <Link
                href={`/projetos/${project.id}/editar`}
                className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                aria-label={`Editar ${project.title}`}
                title="Editar"
              >
                <Pencil />
              </Link>
              <DeleteProjectButton projectId={project.id} title={project.title} />
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
