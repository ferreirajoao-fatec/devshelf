"use client"

import { AlertTriangle, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

import { Button, buttonVariants } from "@/components/ui/button"

type ErrorViewProps = {
  error: Error & { digest?: string }
  retry: () => void
}

// Tela de erro inesperado, usada pelos error.tsx. Não mostra a mensagem técnica:
// em produção o Next a substitui por um texto genérico, e o digest liga ao log do servidor.
export function ErrorView({ error, retry }: ErrorViewProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="size-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Algo deu errado</h1>
        <p className="max-w-md text-muted-foreground">
          Não foi possível carregar esta página. Tente de novo; se o problema continuar, volte mais tarde.
        </p>
        {error.digest && <p className="text-xs text-muted-foreground">Código do erro: {error.digest}</p>}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={() => retry()}>
          <RotateCcw />
          Tentar de novo
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Página inicial
        </Link>
      </div>
    </div>
  )
}
