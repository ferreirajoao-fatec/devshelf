import "server-only"

import { del, put } from "@vercel/blob"

import { COVER_TYPES, type CoverType } from "@/features/projects/cover-upload"

// Armazenamento das capas enviadas do computador (Vercel Blob, store público).
// Credencial: BLOB_READ_WRITE_TOKEN, ou OIDC + BLOB_STORE_ID quando o store está
// conectado ao projeto na Vercel. O SDK escolhe sozinho.

export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)
}

const coverPrefix = (userId: string) => `covers/${userId}/`

export async function uploadCover(userId: string, data: Uint8Array, type: CoverType) {
  const blob = await put(`${coverPrefix(userId)}capa.${COVER_TYPES[type]}`, Buffer.from(data), {
    access: "public",
    contentType: type, // tipo detectado pelos bytes, não o informado pelo navegador
    addRandomSuffix: true,
  })
  return blob.url
}

// Apaga a capa só se ela estiver no nosso Blob e na pasta do próprio usuário: como a
// URL da capa é livre, alguém poderia colar a URL da capa de outra pessoa no projeto.
export async function deleteOwnedCover(url: string | null | undefined, userId: string) {
  if (!url || !isBlobConfigured()) return
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return
  }
  const isOurBlob = parsed.protocol === "https:" && parsed.hostname.endsWith(".public.blob.vercel-storage.com")
  if (!isOurBlob || !parsed.pathname.startsWith(`/${coverPrefix(userId)}`)) return

  try {
    await del(url)
  } catch (error) {
    // Limpeza é secundária: uma imagem órfã não pode impedir salvar ou excluir o projeto
    console.error("Falha ao apagar capa antiga do Blob", error)
  }
}
