import { Compass, FileQuestion, Home } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

// 404 em português, usado pelos not-found.tsx da raiz e dos grupos de rotas.
// Projeto privado, perfil desativado e endereço inexistente caem todos aqui, de propósito:
// a página não revela se o recurso existe.
export function NotFoundView() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="rounded-full bg-muted p-4">
        <FileQuestion className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Erro 404</p>
        <h1 className="text-2xl font-semibold tracking-tight">Página não encontrada</h1>
        <p className="max-w-md text-muted-foreground">
          O endereço pode estar errado, ou o conteúdo foi removido ou não é público.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href="/" className={buttonVariants()}>
          <Home />
          Página inicial
        </Link>
        <Link href="/explorar" className={buttonVariants({ variant: "outline" })}>
          <Compass />
          Explorar projetos
        </Link>
      </div>
    </div>
  )
}
