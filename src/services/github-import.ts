import "server-only"

import { matchTechnologies, repoToFormDefaults } from "@/features/github-import/mapping"
import { GitHubError, getGitHubAccount, getRepo, getRepoLanguages, listOwnPublicRepos } from "@/lib/github"
import { prisma } from "@/lib/prisma"

// Repositórios públicos do usuário, marcando os que já viraram projeto.
export async function listImportableRepos(userId: string) {
  const { accessToken } = await getGitHubAccount(userId)
  const [repos, imported] = await Promise.all([
    listOwnPublicRepos(accessToken),
    prisma.project.findMany({
      where: { userId, githubRepoId: { not: null } },
      select: { id: true, githubRepoId: true },
    }),
  ])

  const projectIdByRepo = new Map(imported.map((p) => [String(p.githubRepoId), p.id]))

  return repos.map((repo) => ({
    id: String(repo.id),
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    fork: repo.fork,
    archived: repo.archived,
    pushedAt: repo.pushed_at,
    importedProjectId: projectIdByRepo.get(String(repo.id)) ?? null,
  }))
}

export type ImportableRepo = Awaited<ReturnType<typeof listImportableRepos>>[number]

// Busca o repositório no GitHub e confirma que é público e do próprio usuário.
// Nunca confiamos em dados do repositório vindos do navegador: sempre relemos da API.
export async function getOwnPublicRepo(userId: string, repoId: bigint) {
  const { accessToken, githubUserId } = await getGitHubAccount(userId)
  const repo = await getRepo(repoId, accessToken)
  if (repo.private || String(repo.owner.id) !== githubUserId) throw new GitHubError("not_found")
  return { repo, accessToken }
}

export async function findImportedProject(userId: string, repoId: bigint) {
  return prisma.project.findFirst({
    where: { userId, githubRepoId: repoId },
    select: { id: true, title: true },
  })
}

// Dados do repositório já convertidos em valores iniciais do formulário.
export async function getImportFormDefaults(userId: string, repoId: bigint) {
  const { repo, accessToken } = await getOwnPublicRepo(userId, repoId)
  const [languages, technologies] = await Promise.all([
    // Linguagens são um complemento: se a chamada falhar, seguimos só com a principal.
    getRepoLanguages(repo.full_name, accessToken).catch(() => (repo.language ? [repo.language] : [])),
    prisma.technology.findMany({ select: { id: true, name: true, slug: true } }),
  ])

  const technologyIds = matchTechnologies([...languages, ...(repo.topics ?? [])], technologies)
  return { repo, defaults: repoToFormDefaults(repo, technologyIds) }
}
