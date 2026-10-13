import { Library } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/session"

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <Library className="size-12" />
      <h1 className="max-w-xl text-4xl font-semibold tracking-tight">
        Organize e apresente tudo o que você já desenvolveu.
      </h1>
      <p className="max-w-md text-lg text-muted-foreground">
        Cadastre ou importe seus repositórios do GitHub e monte sua estante de projetos.
      </p>
      <Link href={user ? "/dashboard" : "/login"} className={buttonVariants({ size: "lg" })}>
        {user ? "Ir para o dashboard" : "Começar com GitHub"}
      </Link>
    </main>
  )
}
