import { COVER_TYPES, MAX_COVER_BYTES, sniffImageType } from "@/features/projects/cover-upload"
import { isBlobConfigured, uploadCover } from "@/lib/blob"
import { getCurrentUser } from "@/lib/session"

const error = (status: number, message: string) => Response.json({ error: message }, { status })

// Recebe a capa enviada do computador (multipart, campo "file"), valida e grava no Blob.
// Responde { url } — a URL entra no formulário como se tivesse sido colada.
// O projeto só é alterado quando o usuário salva o formulário.
export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return error(401, "Entre na sua conta para enviar imagens.")
  if (!isBlobConfigured()) return error(503, "O envio de imagens não está configurado neste ambiente.")

  // Recusa cedo pelo tamanho declarado, antes de ler o corpo
  const declared = Number(request.headers.get("content-length") ?? 0)
  if (declared > MAX_COVER_BYTES + 64 * 1024) return error(413, "A imagem deve ter no máximo 4 MB.")

  let file: FormDataEntryValue | null
  try {
    file = (await request.formData()).get("file")
  } catch {
    return error(400, "Envio inválido.")
  }
  if (!(file instanceof File) || file.size === 0) return error(400, "Escolha um arquivo de imagem.")
  if (file.size > MAX_COVER_BYTES) return error(413, "A imagem deve ter no máximo 4 MB.")

  const bytes = new Uint8Array(await file.arrayBuffer())
  const type = sniffImageType(bytes)
  if (!type || !(type in COVER_TYPES)) return error(415, "Formato não aceito. Use JPG, PNG, WebP, GIF ou AVIF.")

  try {
    return Response.json({ url: await uploadCover(user.id, bytes, type) })
  } catch (cause) {
    console.error("Falha no upload da capa", cause)
    return error(502, "Não foi possível enviar a imagem agora. Tente de novo.")
  }
}
