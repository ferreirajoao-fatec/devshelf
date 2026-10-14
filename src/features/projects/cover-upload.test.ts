import { describe, expect, it } from "vitest"

import { sniffImageType } from "./cover-upload"

const bytes = (...parts: (number[] | string)[]) =>
  new Uint8Array(parts.flatMap((part) => (typeof part === "string" ? [...part].map((c) => c.charCodeAt(0)) : part)))

describe("sniffImageType", () => {
  it.each([
    ["image/jpeg", bytes([0xff, 0xd8, 0xff, 0xe0, 0, 0x10])],
    ["image/png", bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0])],
    ["image/gif", bytes("GIF89a", [1, 0])],
    ["image/gif", bytes("GIF87a", [1, 0])],
    ["image/webp", bytes("RIFF", [0, 0, 0, 0], "WEBPVP8 ")],
    ["image/avif", bytes([0, 0, 0, 0x1c], "ftypavif", [0, 0])],
  ])("reconhece %s pelos bytes", (type, data) => {
    expect(sniffImageType(data)).toBe(type)
  })

  it.each([
    ["SVG (pode conter scripts)", bytes('<svg xmlns="http://www.w3.org/2000/svg"><script>')],
    ["HTML disfarçado de imagem", bytes("<!doctype html><script>alert(1)</script>")],
    ["PDF", bytes("%PDF-1.7")],
    ["RIFF que não é WebP (áudio WAV)", bytes("RIFF", [0, 0, 0, 0], "WAVEfmt ")],
    ["arquivo vazio", bytes()],
  ])("recusa %s", (_, data) => {
    expect(sniffImageType(data)).toBeNull()
  })
})
