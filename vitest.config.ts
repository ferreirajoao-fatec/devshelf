import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

import { testDatabaseUrl } from "./test/database-url"

const src = fileURLToPath(new URL("./src", import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      "@": src,
      // "server-only" lança erro fora do Next; nos testes os módulos de servidor rodam direto no Node
      "server-only": fileURLToPath(new URL("./test/server-only-stub.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.int.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["src/**/*.int.test.ts"],
          globalSetup: ["test/global-setup.ts"],
          setupFiles: ["test/setup-integration.ts"],
          // Todos os arquivos usam o mesmo banco e limpam as tabelas entre testes
          fileParallelism: false,
          env: { DATABASE_URL: testDatabaseUrl() },
        },
      },
    ],
  },
})
