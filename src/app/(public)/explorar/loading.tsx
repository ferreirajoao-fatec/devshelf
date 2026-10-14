import { PageSkeleton } from "@/components/feedback/page-skeleton"

// Só o Explorar tem esqueleto no grupo público: com loading.tsx a resposta começa a ser
// enviada antes do notFound(), e /projeto/[slug] e /u/[username] passariam a responder
// 200 em vez de 404.

export default function Loading() {
  return <PageSkeleton />
}
