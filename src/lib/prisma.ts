import "server-only"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "@/generated/prisma/client"
import { runtimeDatabaseUrl } from "@/lib/database-url"

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: runtimeDatabaseUrl() })
  return new PrismaClient({ adapter })
}

// Reaproveita a instância entre os hot reloads do `next dev`,
// evitando abrir uma nova conexão com o banco a cada alteração.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
