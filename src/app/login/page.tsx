import { Library } from "lucide-react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { SignInButton } from "@/features/auth/components/sign-in-button"
import { safeRedirectPath } from "@/features/auth/redirect"
import { getCurrentUser } from "@/lib/session"

export const metadata: Metadata = {
  title: "Entrar",
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { callbackUrl, error } = await searchParams
  const redirectTo = safeRedirectPath(typeof callbackUrl === "string" ? callbackUrl : null)

  if (await getCurrentUser()) redirect(redirectTo)

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="space-y-2">
          <Library className="mx-auto size-10" />
          <h1 className="text-2xl font-semibold tracking-tight">Entrar no DevShelf</h1>
          <p className="text-sm text-muted-foreground">
            Use sua conta do GitHub para organizar e apresentar seus projetos.
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Não foi possível entrar. Tente novamente.
          </p>
        )}

        <SignInButton callbackUrl={redirectTo} />
      </div>
    </main>
  )
}
