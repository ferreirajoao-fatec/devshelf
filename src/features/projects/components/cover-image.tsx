"use client"

import { ImageOff } from "lucide-react"
import { useCallback, useState, type ComponentProps } from "react"

import { cn } from "@/lib/utils"

export type CoverCrop = { x: number; y: number; zoom: number }

type CoverImageProps = {
  src: string
  alt: string
  crop: CoverCrop
  className?: string
  imgProps?: Omit<ComponentProps<"img">, "src" | "alt" | "style" | "className" | "ref"> & {
    ref?: (img: HTMLImageElement | null) => void
  }
}

// Quadro 16:9 com a imagem enquadrada só por CSS (a imagem original não é alterada):
// object-position alinha o ponto (x%, y%) da imagem ao mesmo ponto do quadro, e o
// scale com transform-origin nesse ponto aplica o zoom sem deixar sobrar borda vazia.
// Como tudo é em %, o recorte é o mesmo em qualquer largura de tela.
export function CoverImage({ src, alt, crop, className, imgProps }: CoverImageProps) {
  // URL externa pode sair do ar: mostra um aviso em vez do ícone de imagem quebrada.
  // Guarda a URL que falhou, para uma URL nova voltar a tentar.
  const [failedSrc, setFailedSrc] = useState<string>()
  const position = `${crop.x}% ${crop.y}%`
  const outerRef = imgProps?.ref

  // Imagem que falha antes da hidratação não dispara onError no React: confere ao montar.
  // Repassa o elemento ao ref de quem usa o componente (o editor de capa mede a imagem).
  const ref = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete && img.naturalWidth === 0) setFailedSrc(src)
      outerRef?.(img)
    },
    [src, outerRef]
  )

  return (
    <div className={cn("relative aspect-video overflow-hidden rounded-xl border bg-muted", className)}>
      {failedSrc === src ? (
        <div className="flex size-full flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ImageOff className="size-5" aria-hidden="true" />
          {alt ? "Imagem indisponível" : null}
        </div>
      ) : (
        // URL externa informada pelo usuário: <img> evita liberar qualquer host no next/image
        // eslint-disable-next-line @next/next/no-img-element
        <img
          {...imgProps}
          ref={ref}
          src={src}
          alt={alt}
          className="absolute inset-0 size-full object-cover"
          style={{ objectPosition: position, transformOrigin: position, transform: `scale(${crop.zoom})` }}
          onError={(event) => {
            imgProps?.onError?.(event)
            setFailedSrc(src)
          }}
        />
      )}
    </div>
  )
}
