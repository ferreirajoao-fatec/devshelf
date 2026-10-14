import { describe, expect, it } from "vitest"

import { profileFormSchema, usernameSchema } from "./schema"

describe("usernameSchema", () => {
  it.each(["joao", "ferreirajoao-fatec", "a1", "x", "dev-2026"])("aceita %s", (username) => {
    expect(usernameSchema.safeParse(username).success).toBe(true)
  })

  it("normaliza para minúsculas e remove espaços nas pontas", () => {
    expect(usernameSchema.parse("  JoaoTeste ")).toBe("joaoteste")
  })

  it.each(["", "-joao", "joão", "joao teste", "joao_teste", "a".repeat(40), "../admin"])("recusa %j", (username) => {
    expect(usernameSchema.safeParse(username).success).toBe(false)
  })
})

describe("profileFormSchema", () => {
  it("trata nome e bio vazios como ausentes", () => {
    expect(profileFormSchema.parse({ name: " ", username: "joao", bio: "", isPublic: true })).toEqual({
      name: undefined,
      username: "joao",
      bio: undefined,
      isPublic: true,
    })
  })

  it("limita o tamanho da bio", () => {
    expect(profileFormSchema.safeParse({ username: "joao", bio: "x".repeat(301), isPublic: false }).success).toBe(false)
  })
})
