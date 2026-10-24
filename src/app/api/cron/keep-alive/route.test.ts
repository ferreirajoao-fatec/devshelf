import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ queryRaw: vi.fn() }))
vi.mock("@/lib/prisma", () => ({ prisma: { $queryRaw: mocks.queryRaw } }))

import { GET } from "./route"

function request(authorization?: string) {
  const headers = authorization ? { authorization } : undefined
  return new Request("http://localhost/api/cron/keep-alive", { headers })
}

beforeEach(() => {
  vi.stubEnv("CRON_SECRET", "segredo")
  mocks.queryRaw.mockReset().mockResolvedValue([{ "?column?": 1 }])
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("GET /api/cron/keep-alive", () => {
  it("consulta o banco quando o segredo confere", async () => {
    const response = await GET(request("Bearer segredo"))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(mocks.queryRaw).toHaveBeenCalledOnce()
  })

  it("recusa chamadas sem o segredo certo", async () => {
    expect((await GET(request())).status).toBe(401)
    expect((await GET(request("Bearer outro"))).status).toBe(401)
    expect(mocks.queryRaw).not.toHaveBeenCalled()
  })

  it("não roda sem CRON_SECRET configurado", async () => {
    vi.stubEnv("CRON_SECRET", "")
    expect((await GET(request("Bearer "))).status).toBe(503)
    expect(mocks.queryRaw).not.toHaveBeenCalled()
  })

  it("responde 503 quando o banco falha", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    mocks.queryRaw.mockRejectedValue(new Error("connection refused"))
    expect((await GET(request("Bearer segredo"))).status).toBe(503)
  })
})
