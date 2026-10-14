import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { del } = vi.hoisted(() => ({ del: vi.fn() }))
vi.mock("@vercel/blob", () => ({ del, put: vi.fn() }))

import { deleteOwnedCover } from "./blob"

const BLOB = "https://abc123.public.blob.vercel-storage.com"

beforeEach(() => {
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", "test-token")
  del.mockReset()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("deleteOwnedCover", () => {
  it("apaga a capa do próprio usuário", async () => {
    await deleteOwnedCover(`${BLOB}/covers/user-1/capa-xyz.png`, "user-1")
    expect(del).toHaveBeenCalledWith(`${BLOB}/covers/user-1/capa-xyz.png`)
  })

  it.each([
    ["capa de outra pessoa", `${BLOB}/covers/user-2/capa.png`],
    ["pasta com prefixo parecido", `${BLOB}/covers/user-10/capa.png`],
    ["fora da pasta de capas", `${BLOB}/outra-coisa/user-1/arquivo.png`],
    ["imagem externa", "https://raw.githubusercontent.com/u/r/main/capa.png"],
    ["domínio que imita o Blob", "https://public.blob.vercel-storage.com.evil.com/covers/user-1/capa.png"],
    ["http sem TLS", "http://abc123.public.blob.vercel-storage.com/covers/user-1/capa.png"],
    ["URL inválida", "não é url"],
  ])("não apaga %s", async (_, url) => {
    await deleteOwnedCover(url, "user-1")
    expect(del).not.toHaveBeenCalled()
  })

  it("não faz nada sem capa ou sem Blob configurado", async () => {
    await deleteOwnedCover(null, "user-1")
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "")
    await deleteOwnedCover(`${BLOB}/covers/user-1/capa.png`, "user-1")
    expect(del).not.toHaveBeenCalled()
  })

  it("não deixa uma falha do Blob quebrar quem chamou", async () => {
    del.mockRejectedValueOnce(new Error("fora do ar"))
    vi.spyOn(console, "error").mockImplementation(() => {})
    await expect(deleteOwnedCover(`${BLOB}/covers/user-1/capa.png`, "user-1")).resolves.toBeUndefined()
  })
})
