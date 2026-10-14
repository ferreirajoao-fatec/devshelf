import { describe, expect, it } from "vitest"

import type { GitHubRepo } from "@/lib/github"

import { parseRepoId } from "./errors"
import { matchTechnologies, repoToFormDefaults } from "./mapping"

const technologies = [
  ["C", "c"],
  ["C#", "csharp"],
  ["C++", "cpp"],
  ["Next.js", "nextjs"],
  ["Node.js", "nodejs"],
  ["Spring Boot", "spring-boot"],
  [".NET", "dotnet"],
  ["Docker", "docker"],
  ["TypeScript", "typescript"],
  ["PostgreSQL", "postgresql"],
].map(([name, slug]) => ({ id: slug, name, slug }))

const repo: GitHubRepo = {
  id: 1,
  name: "devshelf",
  full_name: "user/devshelf",
  description: "  Estante de projetos  ",
  html_url: "https://github.com/user/devshelf",
  homepage: null,
  language: "TypeScript",
  private: false,
  fork: false,
  archived: false,
  stargazers_count: 0,
  created_at: "2026-09-16T10:00:00Z",
  pushed_at: null,
  owner: { id: 1, login: "user" },
}

describe("matchTechnologies", () => {
  it("não confunde C, C# e C++", () => {
    expect(matchTechnologies(["C#"], technologies)).toEqual(["csharp"])
    expect(matchTechnologies(["C++"], technologies)).toEqual(["cpp"])
    expect(matchTechnologies(["C"], technologies)).toEqual(["c"])
  })

  it("reconhece aliases e topics do GitHub, sem repetir", () => {
    expect(
      matchTechnologies(["TypeScript", "nextjs", "node", "spring-boot", "Dockerfile", "postgres", "dotnet", "typescript"], technologies)
    ).toEqual(["typescript", "nextjs", "nodejs", "spring-boot", "docker", "postgresql", "dotnet"])
  })

  it("ignora termos desconhecidos", () => {
    expect(matchTechnologies(["cobol", "awesome-list"], technologies)).toEqual([])
  })
})

describe("repoToFormDefaults", () => {
  it("preenche o formulário e sempre começa privado", () => {
    expect(repoToFormDefaults(repo, ["typescript"])).toMatchObject({
      title: "devshelf",
      shortDescription: "Estante de projetos",
      status: "IN_PROGRESS",
      visibility: "PRIVATE",
      repositoryUrl: "https://github.com/user/devshelf",
      demoUrl: "",
      startedAt: "2026-09-16",
      technologyIds: ["typescript"],
    })
  })

  it("repositório arquivado vira status Arquivado", () => {
    expect(repoToFormDefaults({ ...repo, archived: true }, []).status).toBe("ARCHIVED")
  })

  it.each([
    ["https://app.vercel.app", "https://app.vercel.app"],
    ["meusite.com", "https://meusite.com"],
    ["meusite.com/docs", "https://meusite.com/docs"],
    ["não é url", ""],
    ["javascript:alert(1)", ""],
  ])("homepage %s vira demoUrl %s", (homepage, expected) => {
    expect(repoToFormDefaults({ ...repo, homepage }, []).demoUrl).toBe(expected)
  })
})

describe("parseRepoId", () => {
  it("aceita só inteiros positivos", () => {
    expect(parseRepoId("123456")).toBe(BigInt(123456))
    expect(parseRepoId("0")).toBeNull()
    expect(parseRepoId("-1")).toBeNull()
    expect(parseRepoId("12a")).toBeNull()
    expect(parseRepoId("1".repeat(20))).toBeNull()
  })
})
