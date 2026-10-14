import { describe, expect, it } from "vitest"
import { z } from "zod"

import { MAX_TECHNOLOGIES, projectFormDataToInput, projectFormSchema, type ProjectFormInput } from "./schema"

const valid: ProjectFormInput = {
  title: "DevShelf",
  status: "IN_PROGRESS",
  visibility: "PRIVATE",
  featured: false,
  technologyIds: [],
}

function errorsOf(input: ProjectFormInput) {
  const result = projectFormSchema.safeParse(input)
  return result.success ? {} : z.flattenError(result.error).fieldErrors
}

describe("projectFormSchema", () => {
  it("aceita o mínimo e normaliza campos opcionais vazios para undefined", () => {
    const data = projectFormSchema.parse({ ...valid, shortDescription: "   ", repositoryUrl: "" })
    expect(data.shortDescription).toBeUndefined()
    expect(data.repositoryUrl).toBeUndefined()
    expect(data).toMatchObject({ coverPositionX: 50, coverPositionY: 50, coverZoom: 1 })
  })

  it("exige título com pelo menos 2 caracteres", () => {
    expect(errorsOf({ ...valid, title: " a " })).toHaveProperty("title")
  })

  it("aceita só URLs http(s)", () => {
    expect(errorsOf({ ...valid, demoUrl: "https://app.vercel.app" })).toEqual({})
    expect(errorsOf({ ...valid, demoUrl: "javascript:alert(1)" })).toHaveProperty("demoUrl")
    expect(errorsOf({ ...valid, demoUrl: "ftp://x.com" })).toHaveProperty("demoUrl")
  })

  it("não aceita conclusão antes do início", () => {
    expect(errorsOf({ ...valid, startedAt: "2026-05-10", completedAt: "2026-05-01" })).toHaveProperty("completedAt")
    expect(errorsOf({ ...valid, startedAt: "2026-05-01", completedAt: "2026-05-01" })).toEqual({})
  })

  it("limita a quantidade de tecnologias", () => {
    const ids = Array.from({ length: MAX_TECHNOLOGIES + 1 }, (_, i) => `t${i}`)
    expect(errorsOf({ ...valid, technologyIds: ids })).toHaveProperty("technologyIds")
  })

  it("mantém o enquadramento da capa nos limites", () => {
    expect(errorsOf({ ...valid, coverPositionX: 101 })).toHaveProperty("coverPositionX")
    expect(errorsOf({ ...valid, coverZoom: 0.5 })).toHaveProperty("coverZoom")
    expect(errorsOf({ ...valid, coverZoom: Number.NaN })).toHaveProperty("coverZoom")
  })
})

describe("projectFormDataToInput", () => {
  it("converte o FormData e remove tecnologias repetidas", () => {
    const form = new FormData()
    form.set("title", "App")
    form.set("status", "IDEA")
    form.set("visibility", "PUBLIC")
    form.set("featured", "on")
    form.append("technologyIds", "a")
    form.append("technologyIds", "a")
    form.append("technologyIds", "b")
    form.set("coverZoom", "1.5")

    expect(projectFormDataToInput(form)).toMatchObject({
      title: "App",
      featured: true,
      technologyIds: ["a", "b"],
      coverZoom: 1.5,
      coverPositionX: undefined,
    })
  })
})
