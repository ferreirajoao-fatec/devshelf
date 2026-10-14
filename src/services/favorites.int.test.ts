import { describe, expect, it } from "vitest"

import { prisma } from "@/lib/prisma"
import { createProject, createUser } from "../../test/factories"

import {
  FavoriteNotAllowedError,
  getFavoritedProjectIds,
  getProjectFavoriteState,
  listFavoriteProjects,
  toggleFavorite,
} from "./favorites"

describe("toggleFavorite", () => {
  it("favorita e desfavorita projeto público de outra pessoa, devolvendo a contagem", async () => {
    const author = await createUser()
    const fan = await createUser()
    const project = await createProject(author.id, { visibility: "PUBLIC" })

    expect(await toggleFavorite(fan.id, project.id)).toEqual({ favorited: true, count: 1 })
    expect(await getProjectFavoriteState(project.id, fan.id)).toEqual({ favorited: true, count: 1 })
    expect(await toggleFavorite(fan.id, project.id)).toEqual({ favorited: false, count: 0 })
  })

  it("não deixa favoritar o próprio projeto", async () => {
    const author = await createUser()
    const project = await createProject(author.id, { visibility: "PUBLIC" })
    await expect(toggleFavorite(author.id, project.id)).rejects.toBeInstanceOf(FavoriteNotAllowedError)
  })

  it("não deixa favoritar projeto privado nem inexistente", async () => {
    const author = await createUser()
    const fan = await createUser()
    const project = await createProject(author.id, { visibility: "PRIVATE" })
    await expect(toggleFavorite(fan.id, project.id)).rejects.toBeInstanceOf(FavoriteNotAllowedError)
    await expect(toggleFavorite(fan.id, "nao-existe")).rejects.toBeInstanceOf(FavoriteNotAllowedError)
  })

  it("permite desfavoritar um projeto que virou privado", async () => {
    const author = await createUser()
    const fan = await createUser()
    const project = await createProject(author.id, { visibility: "PUBLIC" })
    await toggleFavorite(fan.id, project.id)
    await prisma.project.update({ where: { id: project.id }, data: { visibility: "PRIVATE" } })

    expect(await toggleFavorite(fan.id, project.id)).toEqual({ favorited: false, count: 0 })
  })
})

describe("listas de favoritos", () => {
  it("lista só projetos ainda públicos, do favorito mais recente ao mais antigo", async () => {
    const author = await createUser()
    const fan = await createUser()
    const first = await createProject(author.id, { title: "Primeiro", visibility: "PUBLIC" })
    const second = await createProject(author.id, { title: "Segundo", visibility: "PUBLIC" })
    const hidden = await createProject(author.id, { title: "Ficou privado", visibility: "PUBLIC" })
    for (const p of [first, second, hidden]) await toggleFavorite(fan.id, p.id)
    await prisma.project.update({ where: { id: hidden.id }, data: { visibility: "PRIVATE" } })

    const titles = (await listFavoriteProjects(fan.id)).map((p) => p.title)
    expect(titles).toEqual(["Segundo", "Primeiro"])
  })

  it("marca só os projetos favoritados pelo usuário", async () => {
    const author = await createUser()
    const fan = await createUser()
    const other = await createUser()
    const a = await createProject(author.id, { visibility: "PUBLIC" })
    const b = await createProject(author.id, { visibility: "PUBLIC" })
    await toggleFavorite(fan.id, a.id)
    await toggleFavorite(other.id, b.id)

    expect(await getFavoritedProjectIds(fan.id, [a.id, b.id])).toEqual(new Set([a.id]))
    expect(await getFavoritedProjectIds(fan.id, [])).toEqual(new Set())
  })
})
