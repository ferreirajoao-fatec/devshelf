"use client"

import { ErrorView } from "@/components/feedback/error-view"

// Erro nas páginas fora dos grupos (home, login)
export default function Error(props: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main id="conteudo" className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4">
      <ErrorView {...props} />
    </main>
  )
}
