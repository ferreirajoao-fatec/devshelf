import type { GitHubRepo } from "@/lib/github"

import { MAX_TECHNOLOGIES, type ProjectFormInput } from "../projects/schema"

type Technology = { id: string; name: string; slug: string }

// Nomes usados no GitHub (linguagens e topics) que diferem do nome/slug da tecnologia.
const ALIASES: Record<string, string> = {
  "c#": "csharp",
  "c++": "cpp",
  node: "nodejs",
  next: "nextjs",
  reactjs: "react",
  vue: "vuejs",
  angularjs: "angular",
  tailwind: "tailwindcss",
  nest: "nestjs",
  spring: "springboot",
  springframework: "springboot",
  postgres: "postgresql",
  mongo: "mongodb",
  golang: "go",
  dockerfile: "docker",
  k8s: "kubernetes",
}

// "Next.js" -> "nextjs", "spring-boot" -> "springboot"
function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function lookupKey(term: string) {
  const lower = term.trim().toLowerCase()
  // C# e C++ perderiam o símbolo na normalização e virariam "c"
  return ALIASES[lower] ?? ALIASES[normalize(lower)] ?? normalize(lower)
}

// Associa linguagens e topics do repositório às tecnologias cadastradas.
export function matchTechnologies(terms: string[], technologies: Technology[]) {
  const byKey = new Map<string, string>()
  for (const tech of technologies) {
    byKey.set(normalize(tech.slug), tech.id)
    byKey.set(lookupKey(tech.name), tech.id)
  }

  const ids = new Set<string>()
  for (const term of terms) {
    const id = byKey.get(lookupKey(term))
    if (id) ids.add(id)
    if (ids.size >= MAX_TECHNOLOGIES) break
  }
  return [...ids]
}

// GitHub aceita homepage sem protocolo ("meusite.com"); só aproveitamos URLs http(s).
function toHttpUrl(value: string | null) {
  const url = value?.trim()
  if (!url) return ""
  if (/^https?:\/\//i.test(url)) return url
  return /^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(url) ? `https://${url}` : ""
}

// Valores iniciais do formulário de importação. Nada é salvo até o usuário confirmar,
// e o projeto sempre começa privado.
export function repoToFormDefaults(repo: GitHubRepo, technologyIds: string[]): ProjectFormInput {
  return {
    title: repo.name.slice(0, 100),
    shortDescription: repo.description?.trim().slice(0, 200) ?? "",
    description: "",
    status: repo.archived ? "ARCHIVED" : "IN_PROGRESS",
    visibility: "PRIVATE",
    featured: false,
    repositoryUrl: repo.html_url,
    demoUrl: toHttpUrl(repo.homepage),
    coverImageUrl: "",
    startedAt: repo.created_at.slice(0, 10),
    completedAt: "",
    technologyIds,
  }
}
