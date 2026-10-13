import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

// Renderiza Markdown escrito pelo usuário. HTML bruto NÃO é interpretado
// (react-markdown o ignora por padrão, sem rehype-raw) e URLs perigosas como
// javascript: são removidas pelo urlTransform padrão.
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose prose-neutral max-w-none dark:prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // `node` (AST) é descartado para não ir parar como atributo no DOM
          a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer nofollow" />,
          // Títulos do usuário ficam abaixo do h1 da página
          h1: ({ node, ...props }) => <h2 {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
