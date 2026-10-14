// Onde o banco está, em cada ambiente:
// - Local, testes e CI: DATABASE_URL (docker compose ou Postgres do CI).
// - Vercel com a integração Supabase: POSTGRES_URL (via pooler, para o app) e
//   POSTGRES_URL_NON_POOLING (conexão direta, para as migrations).
// DATABASE_URL tem prioridade: assim um `vercel env pull` na máquina local nunca faz
// as migrations ou os testes apontarem para o banco de produção por engano.

// Conexão usada pelo app em tempo de execução.
export function runtimeDatabaseUrl() {
  return withSslCompat(process.env.DATABASE_URL ?? process.env.POSTGRES_URL)
}

// Conexão usada pelo Prisma CLI (migrate) e pelo seed: direta, sem pooler.
export function migrationDatabaseUrl() {
  return withSslCompat(process.env.DATABASE_URL ?? process.env.POSTGRES_URL_NON_POOLING)
}

// O pg 8 trata sslmode=require como verify-full, e o certificado do Supabase é
// assinado pela CA própria do Supabase, o que derruba a conexão. uselibpqcompat=true
// devolve a semântica do libpq/psql: conexão criptografada, sem validar a CA.
function withSslCompat(url: string | undefined) {
  if (!url) return url
  try {
    const parsed = new URL(url)
    if (parsed.searchParams.get("sslmode") === "require" && !parsed.searchParams.has("uselibpqcompat")) {
      parsed.searchParams.set("uselibpqcompat", "true")
    }
    return parsed.toString()
  } catch {
    return url
  }
}
