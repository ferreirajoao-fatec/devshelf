import { describe, expect, it } from "vitest"

import { nextAvailableSlug, slugify } from "./slug"

describe("slugify", () => {
  it("remove acentos, pontuação e espaços", () => {
    expect(slugify("Meu App de Café!")).toBe("meu-app-de-cafe")
    expect(slugify("  Next.js + Prisma  ")).toBe("next-js-prisma")
  })

  it("usa 'projeto' quando não sobra nenhum caractere válido", () => {
    expect(slugify("!!!")).toBe("projeto")
    expect(slugify("日本語")).toBe("projeto")
  })

  it("limita o tamanho sem terminar em hífen", () => {
    const slug = slugify(`${"a".repeat(59)} bcd`)
    expect(slug.length).toBeLessThanOrEqual(60)
    expect(slug.endsWith("-")).toBe(false)
  })
})

describe("nextAvailableSlug", () => {
  it("devolve a base quando está livre", () => {
    expect(nextAvailableSlug("app", [])).toBe("app")
    expect(nextAvailableSlug("app", ["app-2"])).toBe("app")
  })

  it("acrescenta o primeiro sufixo livre", () => {
    expect(nextAvailableSlug("app", ["app"])).toBe("app-2")
    expect(nextAvailableSlug("app", ["app", "app-2", "app-3"])).toBe("app-4")
    expect(nextAvailableSlug("app", ["app", "app-3"])).toBe("app-2")
  })
})
