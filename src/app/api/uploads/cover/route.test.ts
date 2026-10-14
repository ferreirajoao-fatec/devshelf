import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  isBlobConfigured: vi.fn(),
  uploadCover: vi.fn(),
}))
vi.mock("@/lib/session", () => ({ getCurrentUser: mocks.getCurrentUser }))
vi.mock("@/lib/blob", () => ({ isBlobConfigured: mocks.isBlobConfigured, uploadCover: mocks.uploadCover }))

import { MAX_COVER_BYTES } from "@/features/projects/cover-upload"

import { POST } from "./route"

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])

function request(content: Uint8Array<ArrayBuffer> | string, type = "image/png") {
  const body = new FormData()
  body.set("file", new File([content], "capa.png", { type }))
  return new Request("http://localhost/api/uploads/cover", { method: "POST", body })
}

beforeEach(() => {
  mocks.getCurrentUser.mockResolvedValue({ id: "user-1" })
  mocks.isBlobConfigured.mockReturnValue(true)
  mocks.uploadCover.mockReset().mockResolvedValue("https://abc.public.blob.vercel-storage.com/covers/user-1/capa-x.png")
})

describe("POST /api/uploads/cover", () => {
  it("envia a imagem e devolve a URL", async () => {
    const response = await POST(request(PNG))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ url: expect.stringContaining("/covers/user-1/") })
    expect(mocks.uploadCover).toHaveBeenCalledWith("user-1", expect.any(Uint8Array), "image/png")
  })

  it("exige login", async () => {
    mocks.getCurrentUser.mockResolvedValue(null)
    expect((await POST(request(PNG))).status).toBe(401)
    expect(mocks.uploadCover).not.toHaveBeenCalled()
  })

  it("avisa quando o Blob não está configurado", async () => {
    mocks.isBlobConfigured.mockReturnValue(false)
    expect((await POST(request(PNG))).status).toBe(503)
  })

  it("recusa arquivo que diz ser PNG mas não é (ex.: HTML ou SVG)", async () => {
    const response = await POST(request("<svg><script>alert(1)</script></svg>", "image/png"))
    expect(response.status).toBe(415)
    expect(mocks.uploadCover).not.toHaveBeenCalled()
  })

  it("recusa imagens acima de 4 MB", async () => {
    const big = new Uint8Array(MAX_COVER_BYTES + 1)
    big.set(PNG)
    expect((await POST(request(big))).status).toBe(413)
  })

  it("recusa envio sem arquivo", async () => {
    const response = await POST(new Request("http://localhost/api/uploads/cover", { method: "POST", body: new FormData() }))
    expect(response.status).toBe(400)
  })
})
