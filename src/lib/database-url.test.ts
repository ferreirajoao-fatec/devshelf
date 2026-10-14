import { afterEach, describe, expect, it, vi } from "vitest"

import { migrationDatabaseUrl, runtimeDatabaseUrl } from "./database-url"

const LOCAL = "postgresql://devshelf:devshelf@localhost:5432/devshelf"
const POOLED = "postgres://user:pass@pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
const DIRECT = "postgres://user:pass@db.supabase.co:5432/postgres?sslmode=require"

function setEnv(env: Record<string, string | undefined>) {
  for (const key of ["DATABASE_URL", "POSTGRES_URL", "POSTGRES_URL_NON_POOLING"]) vi.stubEnv(key, env[key] ?? "")
  // stubEnv com "" deixa a variável vazia; removemos para simular "não definida"
  for (const [key, value] of Object.entries(env)) if (value === undefined) delete process.env[key]
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("URLs do banco", () => {
  it("usa DATABASE_URL para tudo quando definida (local, testes, CI)", () => {
    setEnv({ DATABASE_URL: LOCAL, POSTGRES_URL: POOLED, POSTGRES_URL_NON_POOLING: DIRECT })
    expect(runtimeDatabaseUrl()).toBe(LOCAL)
    expect(migrationDatabaseUrl()).toBe(LOCAL)
  })

  it("na Vercel com Supabase, usa o pooler no app e a conexão direta nas migrations", () => {
    setEnv({ DATABASE_URL: undefined, POSTGRES_URL: POOLED, POSTGRES_URL_NON_POOLING: DIRECT })
    expect(runtimeDatabaseUrl()).toContain("pooler.supabase.com:6543")
    expect(migrationDatabaseUrl()).toContain("db.supabase.co:5432")
  })

  it("ativa a compatibilidade com libpq quando sslmode=require", () => {
    setEnv({ DATABASE_URL: undefined, POSTGRES_URL: POOLED, POSTGRES_URL_NON_POOLING: DIRECT })
    const url = new URL(runtimeDatabaseUrl()!)
    expect(url.searchParams.get("sslmode")).toBe("require")
    expect(url.searchParams.get("uselibpqcompat")).toBe("true")
    expect(url.searchParams.get("supa")).toBe("base-pooler.x")
  })

  it("não mexe em URLs sem sslmode=require", () => {
    setEnv({ DATABASE_URL: LOCAL })
    expect(runtimeDatabaseUrl()).toBe(LOCAL)
  })
})
