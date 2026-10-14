import { FolderOpen, Lock, Settings } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { GitHubIcon } from "@/components/icons/github-icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProjectCard } from "@/features/projects/components/project-card"
import { getCurrentUser } from "@/lib/session"
import { getFavoritedProjectIds } from "@/services/favorites"
import { getViewableProfile } from "@/services/profiles"
import { listPublicProjectsOfUser } from "@/services/projects"
import { formatDate } from "@/utils/format"

async function loadProfile(username: string) {
  const viewer = await getCurrentUser()
  const profile = await getViewableProfile(username, viewer?.id ?? null)
  return { profile, viewer, isOwner: Boolean(profile && viewer?.id === profile.id) }
}

export async function generateMetadata({ params }: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params
  const { profile } = await loadProfile(username)
  if (!profile) return { title: "Perfil não encontrado" }

  const name = profile.name ?? profile.username
  const description = profile.bio ?? `Projetos de ${name} no DevShelf.`

  return {
    title: `${name} (@${profile.username})`,
    description,
    // Perfil desativado só é visto pelo dono e nunca deve ser indexado
    robots: profile.isPublic ? undefined : { index: false, follow: false },
    openGraph: {
      type: "profile",
      title: `${name} no DevShelf`,
      description,
      images: profile.image ? [profile.image] : undefined,
    },
  }
}

export default async function ProfilePage({ params }: PageProps<"/u/[username]">) {
  const { username } = await params
  const { profile, viewer, isOwner } = await loadProfile(username)
  // Inexistente ou desativado (para quem não é o dono): 404 nos dois casos
  if (!profile) notFound()

  // Mesmo para o dono, só projetos públicos: a página mostra o que os visitantes veem
  const projects = await listPublicProjectsOfUser(profile.id)
  // Botão de favoritar só para visitantes logados (ninguém favorita o próprio projeto)
  const favoritedIds =
    viewer && !isOwner ? await getFavoritedProjectIds(viewer.id, projects.map((p) => p.id)) : null
  const name = profile.name ?? profile.username ?? "Usuário"

  return (
    <div className="space-y-8">
      {!profile.isPublic && (
        <p className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          <Lock className="size-4 shrink-0" />
          Seu perfil está desativado: só você vê esta página. Ative-o no dashboard para compartilhar.
        </p>
      )}

      <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <Avatar className="size-24 text-2xl">
          {profile.image && <AvatarImage src={profile.image} alt="" />}
          <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>
          {profile.bio && <p className="max-w-2xl whitespace-pre-line">{profile.bio}</p>}
          <p className="text-sm text-muted-foreground">
            {projects.length} {projects.length === 1 ? "projeto público" : "projetos públicos"} · No
            DevShelf desde {formatDate(profile.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`https://github.com/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            <GitHubIcon />
            GitHub
          </a>
          {isOwner && (
            <Link href="/dashboard#perfil" className={buttonVariants()}>
              <Settings />
              Editar perfil
            </Link>
          )}
        </div>
      </header>

      <section aria-labelledby="projects-title" className="space-y-4">
        <h2 id="projects-title" className="text-xl font-semibold tracking-tight">
          Projetos
        </h2>
        {projects.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <li key={project.id}>
                <ProjectCard
                  project={project}
                  variant="public"
                  favorite={favoritedIds ? { favorited: favoritedIds.has(project.id) } : undefined}
                />
              </li>
            ))}
          </ul>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="rounded-full bg-muted p-3">
                <FolderOpen className="size-6 text-muted-foreground" />
              </div>
              <p className="max-w-sm text-sm text-muted-foreground">
                {isOwner
                  ? "Nenhum projeto público ainda. Torne um projeto público na edição para ele aparecer aqui."
                  : "Ainda não há projetos públicos por aqui."}
              </p>
              {isOwner && (
                <Link href="/projetos" className={buttonVariants({ variant: "outline" })}>
                  Ir para Meus Projetos
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
