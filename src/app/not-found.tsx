import type { Metadata } from "next"

import { NotFoundView } from "@/components/feedback/not-found-view"
import { PublicHeader } from "@/components/layout/public-header"

export const metadata: Metadata = {
  title: "Página não encontrada",
}

// Endereços que não correspondem a nenhuma rota (os grupos têm o próprio not-found)
export default function NotFound() {
  return (
    <>
      <PublicHeader />
      <main id="conteudo" className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4">
        <NotFoundView />
      </main>
    </>
  )
}
