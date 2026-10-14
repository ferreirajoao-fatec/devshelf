"use client"

import "./globals.css"

import { ErrorView } from "@/components/feedback/error-view"
import { themeScript } from "@/features/theme/theme"

// Erro no próprio layout raiz: substitui o documento inteiro, então precisa de <html>,
// estilos e do script de tema (sem ele a página ignoraria o tema escolhido).
export default function GlobalError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>Algo deu errado | DevShelf</title>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4">
          <ErrorView {...props} />
        </main>
      </body>
    </html>
  )
}
