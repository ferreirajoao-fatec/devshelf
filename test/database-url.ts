// URL do banco dos testes de integração. Padrão: banco "devshelf_test" no mesmo
// Postgres do docker-compose. Pode ser trocada com TEST_DATABASE_URL (ex.: no CI).
const DEFAULT_URL = "postgresql://devshelf:devshelf@localhost:5432/devshelf_test"

export function testDatabaseUrl() {
  const url = process.env.TEST_DATABASE_URL || DEFAULT_URL
  const name = new URL(url).pathname.slice(1)
  // Os testes apagam todas as tabelas: nunca rodar contra o banco de desenvolvimento
  if (!name.endsWith("_test")) {
    throw new Error(`Banco de testes precisa terminar em "_test" (recebido: "${name}")`)
  }
  return url
}
