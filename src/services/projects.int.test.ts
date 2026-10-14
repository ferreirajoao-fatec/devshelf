import { describe, expect, it } from "vitest"

import type { ProjectFormData } from "@/features/projects/schema"
import { prisma } from "@/lib/prisma"
import { createProject as createProjectRow, createTechnology, createUser } from "../../test/factories"

import {
  createProject,
  deleteProject,
  getOwnedProject,
  getViewableProjectBySlug,
  listPublicProjectsOfUser,
  RepoAlreadyImportedError,
  updateProject,
} from "./projects"

const form = (data: Partial<ProjectFormData> = {}): ProjectFormData => ({
  title: "Meu App",
  status: "IDEA",
  visibility: "PRIVATE",
  featured: false,
  coverPositionX: 50,
  coverPositionY: 50,
  coverZoom: 1,
  technologyIds: [],
  ...data,
})

describe("createProject", () => {
  it("gera slugs únicos a partir do título", async () => {
    const user = await createUser()
    const a = await createProject(user.id, form({ title: "Meu App" }))
    const b = await createProject(user.id, form({ title: "Meu App" }))
    expect([a.slug, b.slug]).toEqual(["meu-app", "meu-app-2"])
  })

  it("ignora ids de tecnologias que não existem", async () => {
    const user = await createUser()
    const ts = await createTechnology("TypeScript", "typescript")
    const project = await createProject(user.id, form({ technologyIds: [ts.id, "id-inventado"] }))
    const links = await prisma.projectTechnology.findMany({ where: { projectId: project.id } })
    expect(links.map((l) => l.technologyId)).toEqual([ts.id])
  })

  it("não importa o mesmo repositório duas vezes para o mesmo usuário", async () => {
    const user = await createUser()
    const github = { repoId: BigInt(123), fullName: "user/repo" }
    await createProject(user.id, form(), github)
    await expect(createProject(user.id, form(), github)).rejects.toBeInstanceOf(RepoAlreadyImportedError)

    // Outro usuário pode ter um projeto do mesmo repositório (ex.: fork no DevShelf não existe, mas a regra é por usuário)
    const other = await createUser()
    await expect(createProject(other.id, form(), github)).resolves.toBeTruthy()
  })
})

describe("posse do projeto", () => {
  it("só o dono lê, edita e exclui", async () => {
    const owner = await createUser()
    const intruder = await createUser()
    const project = await createProjectRow(owner.id, { title: "Original" })

    expect(await getOwnedProject(project.id, intruder.id)).toBeNull()
    expect(await updateProject(project.id, intruder.id, form({ title: "Invadido" }))).toBeNull()
    expect(await deleteProject(project.id, intruder.id)).toBe(false)

    const unchanged = await prisma.project.findUniqueOrThrow({ where: { id: project.id } })
    expect(unchanged.title).toBe("Original")

    expect(await updateProject(project.id, owner.id, form({ title: "Editado" }))).toMatchObject({ title: "Editado" })
    expect(await deleteProject(project.id, owner.id)).toBe(true)
  })

  it("o slug não muda na edição", async () => {
    const owner = await createUser()
    const project = await createProject(owner.id, form({ title: "Nome Antigo" }))
    const updated = await updateProject(project.id, owner.id, form({ title: "Nome Novo" }))
    expect(updated?.slug).toBe("nome-antigo")
  })
})

describe("visibilidade", () => {
  it("projeto privado só aparece para o dono", async () => {
    const owner = await createUser()
    const visitor = await createUser()
    const project = await createProjectRow(owner.id, { visibility: "PRIVATE" })

    expect(await getViewableProjectBySlug(project.slug, null)).toBeNull()
    expect(await getViewableProjectBySlug(project.slug, visitor.id)).toBeNull()
    expect(await getViewableProjectBySlug(project.slug, owner.id)).toMatchObject({ id: project.id })
  })

  it("perfil lista só projetos públicos, destaques primeiro", async () => {
    const owner = await createUser()
    await createProjectRow(owner.id, { title: "Privado", visibility: "PRIVATE" })
    await createProjectRow(owner.id, { title: "Comum", visibility: "PUBLIC" })
    await createProjectRow(owner.id, { title: "Destaque", visibility: "PUBLIC", featured: true })

    const titles = (await listPublicProjectsOfUser(owner.id)).map((p) => p.title)
    expect(titles).toEqual(["Destaque", "Comum"])
  })
})
