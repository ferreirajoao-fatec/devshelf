// Regras do upload de capa, compartilhadas entre o formulário (aviso imediato) e o
// servidor (validação de verdade).

// A Vercel limita o corpo das requisições a 4,5 MB; 4 MB deixa folga para o multipart.
export const MAX_COVER_BYTES = 4 * 1024 * 1024

// SVG fica de fora de propósito: pode conter scripts.
export const COVER_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
} as const

export type CoverType = keyof typeof COVER_TYPES

export const COVER_ACCEPT = Object.keys(COVER_TYPES).join(",")

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((byte, i) => bytes[offset + i] === byte)

const ascii = (text: string) => [...text].map((c) => c.charCodeAt(0))

// Descobre o formato pelos primeiros bytes do arquivo ("assinatura"), sem confiar na
// extensão nem no tipo informado pelo navegador. Retorna null se não for um formato aceito.
export function sniffImageType(bytes: Uint8Array): CoverType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg"
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png"
  if (startsWith(bytes, ascii("GIF87a")) || startsWith(bytes, ascii("GIF89a"))) return "image/gif"
  if (startsWith(bytes, ascii("RIFF")) && startsWith(bytes, ascii("WEBP"), 8)) return "image/webp"
  // AVIF: caixa "ftyp" no byte 4, com a marca "avif" ou "avis"
  if (startsWith(bytes, ascii("ftyp"), 4) && (startsWith(bytes, ascii("avif"), 8) || startsWith(bytes, ascii("avis"), 8))) {
    return "image/avif"
  }
  return null
}
