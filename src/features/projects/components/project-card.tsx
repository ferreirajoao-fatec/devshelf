import { ExternalLink, Globe, Lock, Pencil, Star } from "lucide-react"
import Link from "next/link"

import { GitHubIcon } from "@/components/icons/github-icon"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserProject } from "@/services/projects"
import { formatDate } from "@/utils/format"

import { DeleteProjectButton } from "./delete-project-button"
import { StatusBadge } from "./status-badge"

const MAX_VISIBLE_TECHNOLOGIES = 4

export function ProjectCard({ project }: { project: UserProject }) {
  const technologies = project.technologies.map((t) => t.technology)
  const hidden = technologies.length - MAX_VISIBLE_TECHNOLOGIES
  const isPublic = project.visibility === "PUBLIC"

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={project.status} />
          <Badge variant="secondary" className="gap-1">
            {isPublic ? <Globe /> : <Lock />}
            {isPublic ? "Público" : "Privado"}
          </Badge>
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
        <span className="text-xs text-muted-foreground">Atualizado em {formatDate(project.updatedAt)}</span>
        <div className="flex items-center">
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
          <Link
            href={`/projetos/${project.id}/editar`}
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            aria-label={`Editar ${project.title}`}
            title="Editar"
          >
            <Pencil />
          </Link>
          <DeleteProjectButton projectId={project.id} title={project.title} />
        </div>
      </CardFooter>
    </Card>
  )
}
