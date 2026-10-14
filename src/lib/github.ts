import "server-only"

import { prisma } from "@/lib/prisma"

// Cliente mínimo da GitHub REST API. Usa o token OAuth salvo pelo Auth.js na
// tabela Account; ele só é lido aqui no servidor e nunca vai para o navegador.
// Os escopos do login (read:user, user:email) dão acesso apenas a repositórios públicos.

const API_URL = "https://api.github.com"
const MAX_PAGES = 3 // até 300 repositórios

export type GitHubRepo = {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  topics?: string[]
  private: boolean
  fork: boolean
  archived: boolean
  stargazers_count: number
  created_at: string
  pushed_at: string | null
  owner: { id: number; login: string }
}

export type GitHubErrorReason = "unauthorized" | "rate_limited" | "not_found" | "unavailable"

export class GitHubError extends Error {
  constructor(readonly reason: GitHubErrorReason) {
    super(`GitHub API: ${reason}`)
  }
}

export type GitHubAccount = { accessToken: string; githubUserId: string }

// Conta GitHub vinculada ao usuário (sem token = precisa entrar de novo).
export async function getGitHubAccount(userId: string): Promise<GitHubAccount> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
    select: { access_token: true, providerAccountId: true },
  })
  if (!account?.access_token) throw new GitHubError("unauthorized")
  return { accessToken: account.access_token, githubUserId: account.providerAccountId }
}

async function request<T>(path: string, accessToken: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    })
  } catch {
    throw new GitHubError("unavailable")
  }

  if (response.ok) return (await response.json()) as T
  if (response.status === 401) throw new GitHubError("unauthorized")
  if (response.status === 404) throw new GitHubError("not_found")
  if (response.status === 429 || (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0")) {
    throw new GitHubError("rate_limited")
  }
  throw new GitHubError("unavailable")
}

// Repositórios públicos dos quais o usuário é dono, do mais recente ao mais antigo.
export async function listOwnPublicRepos(accessToken: string) {
  const repos: GitHubRepo[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await request<GitHubRepo[]>(
      `/user/repos?visibility=public&affiliation=owner&sort=pushed&per_page=100&page=${page}`,
      accessToken
    )
    repos.push(...batch)
    if (batch.length < 100) break
  }
  return repos
}

export async function getRepo(repoId: bigint, accessToken: string) {
  return request<GitHubRepo>(`/repositories/${repoId}`, accessToken)
}

// Linguagens do repositório, da mais usada para a menos usada.
export async function getRepoLanguages(fullName: string, accessToken: string) {
  const bytesByLanguage = await request<Record<string, number>>(`/repos/${fullName}/languages`, accessToken)
  return Object.entries(bytesByLanguage)
    .sort(([, a], [, b]) => b - a)
    .map(([language]) => language)
}
