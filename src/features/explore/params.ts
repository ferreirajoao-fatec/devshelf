import { z } from "zod"

import { ProjectStatus } from "@/generated/prisma/enums"

export const EXPLORE_PAGE_SIZE = 24
export const MAX_QUERY_LENGTH = 100

// Filtros do Explorar ficam na URL (?q=&tech=&status=&page=): dá para compartilhar
// uma busca e o botão voltar funciona. Valor inválido é descartado, não vira erro.
const first = (value: unknown) => (Array.isArray(value) ? value[0] : value)

const exploreParamsSchema = z.object({
  q: z.preprocess(
    first,
    z
      .string()
      .transform((value) => value.trim().slice(0, MAX_QUERY_LENGTH))
      .optional()
      .catch(undefined)
  ),
  tech: z.preprocess(
    first,
    z.string().regex(/^[a-z0-9-]{1,60}$/).optional().catch(undefined)
  ),
  status: z.preprocess(first, z.enum(ProjectStatus).optional().catch(undefined)),
  page: z.preprocess(first, z.coerce.number().int().min(1).max(1000).catch(1)),
})

export type ExploreParams = {
  q?: string
  tech?: string
  status?: ProjectStatus
  page: number
}

export function parseExploreParams(searchParams: Record<string, string | string[] | undefined>): ExploreParams {
  const parsed = exploreParamsSchema.parse(searchParams)
  return { ...parsed, q: parsed.q || undefined }
}

// Monta a URL do Explorar trocando alguns filtros. Mudar filtro volta para a página 1.
export function exploreHref(current: ExploreParams, changes: Partial<ExploreParams>) {
  const next = { ...current, page: 1, ...changes }
  const params = new URLSearchParams()
  if (next.q) params.set("q", next.q)
  if (next.tech) params.set("tech", next.tech)
  if (next.status) params.set("status", next.status)
  if (next.page > 1) params.set("page", String(next.page))
  const query = params.toString()
  return query ? `/explorar?${query}` : "/explorar"
}
