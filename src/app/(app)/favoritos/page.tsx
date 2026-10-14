import { Compass, Star } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProjectCard } from "@/features/projects/components/project-card"
import { requireUser } from "@/lib/session"
import { listFavoriteProjects } from "@/services/favorites"

export const metadata: Metadata = {
  title: "Favoritos",
}

export default async function FavoritesPage() {
  const user = await requireUser()
  const projects = await listFavoriteProjects(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Favoritos</h1>
        <p className="text-muted-foreground">Projetos de outras pessoas que você salvou, do mais recente ao mais antigo.</p>
      </div>

      {projects.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              {/* Desfavoritar aqui revalida a página e o card sai da lista */}
              <ProjectCard project={project} variant="public" author={project.user} favorite={{ favorited: true }} />
            </li>
          ))}
        </ul>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="rounded-full bg-muted p-3">
              <Star className="size-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Nenhum favorito ainda</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Use a estrela nos projetos do Explorar ou nos perfis para guardá-los aqui.
              </p>
            </div>
            <Link href="/explorar" className={buttonVariants()}>
              <Compass />
              Explorar projetos
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
