import "server-only"

import { redirect } from "next/navigation"
import { cache } from "react"

import { auth } from "@/lib/auth"

// Verificação de sessão real (consulta o banco). O proxy faz apenas uma checagem
// otimista pelo cookie; toda página/ação privada deve chamar requireUser().
export const getCurrentUser = cache(async () => {
  const session = await auth()
  return session?.user ?? null
})

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return user
}
