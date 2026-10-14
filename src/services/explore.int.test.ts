import { describe, expect, it } from "vitest"

import { EXPLORE_PAGE_SIZE } from "@/features/explore/params"
import { prisma } from "@/lib/prisma"
import { createProject, createTechnology, createUser } from "../../test/factories"

import { listExploreTechnologies, searchPublicProjects } from "./explore"

async function linkTechnology(projectId: string, technologyId: string) {
  await prisma.projectTechnology.create({ data: { projectId, technologyId } })
}

describe("searchPublicProjects", () => {
  it("nunca mostra projetos privados", async () => {
    const user = await createUser()
    await createProject(user.id, { title: "Público", visibility: "PUBLIC" })
    await createProject(user.id, { title: "Secreto", visibility: "PRIVATE" })

    const { projects, total } = await searchPublicProjects({ page: 1 })
    expect(projects.map((p) => p.title)).toEqual(["Público"])
    expect(total).toBe(1)
    expect(await searchPublicProjects({ q: "secreto", page: 1 })).toMatchObject({ total: 0 })
  })

  it("busca por título, descrição ou tecnologia, sem diferenciar maiúsculas", async () => {
    const user = await createUser()
    const ts = await createTechnology("TypeScript", "typescript")
    await createProject(user.id, { title: "Estante", visibility: "PUBLIC" })
    await createProject(user.id, { title: "Outro", shortDescription: "Uma ESTANTE digital", visibility: "PUBLIC" })
    const withTech = await createProject(user.id, { title: "Terceiro", visibility: "PUBLIC" })
    await linkTechnology(withTech.id, ts.id)

    expect((await searchPublicProjects({ q: "estante", page: 1 })).total).toBe(2)
    const byTech = await searchPublicProjects({ q: "typescript", page: 1 })
    expect(byTech.projects.map((p) => p.id)).toEqual([withTech.id])
  })

  it("filtra por tecnologia e status", async () => {
    const user = await createUser()
    const react = await createTechnology("React", "react")
    const done = await createProject(user.id, { status: "COMPLETED", visibility: "PUBLIC" })
    const doing = await createProject(user.id, { status: "IN_PROGRESS", visibility: "PUBLIC" })
    await linkTechnology(done.id, react.id)
    await linkTechnology(doing.id, react.id)

    const result = await searchPublicProjects({ tech: "react", status: "COMPLETED", page: 1 })
    expect(result.projects.map((p) => p.id)).toEqual([done.id])
  })

  it("pagina os resultados", async () => {
    const user = await createUser()
    for (let i = 0; i < EXPLORE_PAGE_SIZE + 1; i++) await createProject(user.id, { visibility: "PUBLIC" })

    const first = await searchPublicProjects({ page: 1 })
    const second = await searchPublicProjects({ page: 2 })
    expect(first).toMatchObject({ total: EXPLORE_PAGE_SIZE + 1, pageCount: 2 })
    expect(first.projects).toHaveLength(EXPLORE_PAGE_SIZE)
    expect(second.projects).toHaveLength(1)
    expect(first.projects.map((p) => p.id)).not.toContain(second.projects[0].id)
  })
})

describe("listExploreTechnologies", () => {
  it("lista só tecnologias de projetos públicos, com a contagem, da mais usada para a menos usada", async () => {
    const user = await createUser()
    const go = await createTechnology("Go", "go")
    const rust = await createTechnology("Rust", "rust")
    const java = await createTechnology("Java", "java")
    const p1 = await createProject(user.id, { visibility: "PUBLIC" })
    const p2 = await createProject(user.id, { visibility: "PUBLIC" })
    const hidden = await createProject(user.id, { visibility: "PRIVATE" })
    await linkTechnology(p1.id, go.id)
    await linkTechnology(p2.id, go.id)
    await linkTechnology(p1.id, rust.id)
    await linkTechnology(hidden.id, java.id)

    expect((await listExploreTechnologies()).map((t) => [t.slug, t.count])).toEqual([
      ["go", 2],
      ["rust", 1],
    ])
  })
})
