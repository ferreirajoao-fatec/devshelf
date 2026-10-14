import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"

// Fábricas de dados para os testes de integração: valores mínimos válidos,
// com sobrescrita do que cada teste precisar.
let sequence = 0
const next = () => ++sequence

export async function createUser(data: Partial<Prisma.UserCreateInput> = {}) {
  const n = next()
  return prisma.user.create({ data: { name: `Usuário ${n}`, username: `usuario-${n}`, ...data } })
}

export async function createProject(userId: string, data: Partial<Prisma.ProjectUncheckedCreateInput> = {}) {
  const n = next()
  return prisma.project.create({ data: { userId, title: `Projeto ${n}`, slug: `projeto-${n}`, ...data } })
}

export async function createTechnology(name: string, slug: string) {
  return prisma.technology.create({ data: { name, slug } })
}
