import { execSync } from "node:child_process"

import { testDatabaseUrl } from "./database-url"

// Roda uma vez antes dos testes de integração: cria o banco de testes (se preciso)
// e aplica as migrations, deixando o schema igual ao da aplicação.
export default function setup() {
  execSync("pnpm exec prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl() },
    stdio: "inherit",
  })
}
