import { describe, expect, it } from "vitest"

import { safeRedirectPath } from "./redirect"

describe("safeRedirectPath", () => {
  it("aceita caminhos internos", () => {
    expect(safeRedirectPath("/projetos")).toBe("/projetos")
    expect(safeRedirectPath("/projeto/meu-app?x=1")).toBe("/projeto/meu-app?x=1")
  })

  it("usa o dashboard quando não há caminho", () => {
    expect(safeRedirectPath(null)).toBe("/dashboard")
    expect(safeRedirectPath(undefined)).toBe("/dashboard")
    expect(safeRedirectPath("")).toBe("/dashboard")
  })

  it.each([
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "javascript:alert(1)",
    "evil.com/path",
  ])("bloqueia redirecionamento externo: %s", (path) => {
    expect(safeRedirectPath(path)).toBe("/dashboard")
  })
})
