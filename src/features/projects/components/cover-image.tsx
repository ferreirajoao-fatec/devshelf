import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

export type CoverCrop = { x: number; y: number; zoom: number }

type CoverImageProps = {
  src: string
  alt: string
  crop: CoverCrop
  className?: string
  imgProps?: Omit<ComponentProps<"img">, "src" | "alt" | "style" | "className">
}

// Quadro 16:9 com a imagem enquadrada só por CSS (a imagem original não é alterada):
// object-position alinha o ponto (x%, y%) da imagem ao mesmo ponto do quadro, e o
// scale com transform-origin nesse ponto aplica o zoom sem deixar sobrar borda vazia.
// Como tudo é em %, o recorte é o mesmo em qualquer largura de tela.
export function CoverImage({ src, alt, crop, className, imgProps }: CoverImageProps) {
  const position = `${crop.x}% ${crop.y}%`

  return (
    <div className={cn("relative aspect-video overflow-hidden rounded-xl border bg-muted", className)}>
      {/* URL externa informada pelo usuário: <img> evita liberar qualquer host no next/image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...imgProps}
        src={src}
        alt={alt}
        className="absolute inset-0 size-full object-cover"
        style={{ objectPosition: position, transformOrigin: position, transform: `scale(${crop.zoom})` }}
      />
    </div>
  )
}
