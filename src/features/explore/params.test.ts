import { describe, expect, it } from "vitest"

import { exploreHref, MAX_QUERY_LENGTH, parseExploreParams } from "./params"

describe("parseExploreParams", () => {
  it("lê os filtros válidos", () => {
    expect(parseExploreParams({ q: "  next  ", tech: "nextjs", status: "IN_PROGRESS", page: "2" })).toEqual({
      q: "next",
      tech: "nextjs",
      status: "IN_PROGRESS",
      page: 2,
    })
  })

  it("descarta valores inválidos em vez de falhar", () => {
    expect(parseExploreParams({ tech: "Next.JS!", status: "NOPE", page: "-3" })).toEqual({ page: 1 })
    expect(parseExploreParams({ page: "abc" })).toEqual({ page: 1 })
    expect(parseExploreParams({ page: "5000" })).toEqual({ page: 1 })
  })

  it("usa o primeiro valor quando o parâmetro se repete", () => {
    expect(parseExploreParams({ q: ["a", "b"] }).q).toBe("a")
  })

  it("trata busca vazia como sem busca e corta buscas longas", () => {
    expect(parseExploreParams({ q: "   " }).q).toBeUndefined()
    expect(parseExploreParams({ q: "x".repeat(300) }).q).toHaveLength(MAX_QUERY_LENGTH)
  })
})

describe("exploreHref", () => {
  const current = { q: "react", tech: "react", page: 3 }

  it("volta para a página 1 ao trocar um filtro", () => {
    expect(exploreHref(current, { status: "COMPLETED" })).toBe("/explorar?q=react&tech=react&status=COMPLETED")
  })

  it("mantém os filtros ao trocar de página", () => {
    expect(exploreHref(current, { page: 4 })).toBe("/explorar?q=react&tech=react&page=4")
  })

  it("remove filtros passados como undefined", () => {
    expect(exploreHref(current, { q: undefined, tech: undefined })).toBe("/explorar")
  })

  it("codifica caracteres especiais da busca", () => {
    expect(exploreHref({ page: 1 }, { q: "c# & .net" })).toBe("/explorar?q=c%23+%26+.net")
  })
})
