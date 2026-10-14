"use client"

import { ImageOff, Move, RotateCcw, ZoomIn } from "lucide-react"
import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { MAX_COVER_ZOOM } from "../schema"
import { CoverImage, type CoverCrop } from "./cover-image"

const DEFAULT_CROP: CoverCrop = { x: 50, y: 50, zoom: 1 }
const KEY_STEP = 2 // % por tecla de seta

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const round = (value: number) => Math.round(value * 100) / 100

type CoverImageFieldProps = {
  defaultUrl: string
  defaultCrop: CoverCrop
  invalid?: boolean
  errorId?: string
}

export function CoverImageField({ defaultUrl, defaultCrop, invalid, errorId }: CoverImageFieldProps) {
  const [url, setUrl] = useState(defaultUrl)
  const [crop, setCrop] = useState(defaultCrop)
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null)
  const [failed, setFailed] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ pointerX: number; pointerY: number; crop: CoverCrop } | null>(null)

  // Guarda o tamanho original da imagem; ignora atualizações iguais para não re-renderizar à toa.
  const measure = useCallback((img: HTMLImageElement | null) => {
    if (!img?.complete || !img.naturalWidth) return
    const { naturalWidth: width, naturalHeight: height } = img
    setNatural((prev) => (prev?.width === width && prev.height === height ? prev : { width, height }))
  }, [])

  const previewUrl = /^https?:\/\/\S+$/i.test(url.trim()) ? url.trim() : ""

  function changeUrl(value: string) {
    setUrl(value)
    // Imagem nova: volta ao enquadramento padrão
    setCrop(DEFAULT_CROP)
    setNatural(null)
    setFailed(false)
  }

  // Quantos pixels a imagem passa do quadro em cada eixo, com o zoom atual.
  function overflow(zoom: number) {
    const frame = frameRef.current?.getBoundingClientRect()
    if (!frame || !natural) return null
    const coverScale = Math.max(frame.width / natural.width, frame.height / natural.height)
    return {
      x: natural.width * coverScale * zoom - frame.width,
      y: natural.height * coverScale * zoom - frame.height,
    }
  }

  // Arrastar a imagem para a direita mostra mais do lado esquerdo dela (o ponto focal diminui).
  function moveBy(dx: number, dy: number, from: CoverCrop) {
    const extra = overflow(from.zoom)
    if (!extra) return
    setCrop({
      ...from,
      x: extra.x > 0 ? clamp(from.x - (dx / extra.x) * 100, 0, 100) : from.x,
      y: extra.y > 0 ? clamp(from.y - (dy / extra.y) * 100, 0, 100) : from.y,
    })
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { pointerX: event.clientX, pointerY: event.clientY, crop }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag) return
    moveBy(event.clientX - drag.pointerX, event.clientY - drag.pointerY, drag.crop)
  }

  function onPointerUp() {
    dragRef.current = null
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    }
    const step = delta[event.key]
    if (!step) return
    event.preventDefault()
    setCrop((c) => ({ ...c, x: clamp(c.x + step[0], 0, 100), y: clamp(c.y + step[1], 0, 100) }))
  }

  const ready = Boolean(previewUrl && natural && !failed)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="coverImageUrl">Imagem de capa (URL)</Label>
        <Input
          id="coverImageUrl"
          name="coverImageUrl"
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => changeUrl(e.target.value)}
          placeholder="https://..."
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
        />
      </div>

      {/* Enquadramento enviado no FormData */}
      <input type="hidden" name="coverPositionX" value={round(crop.x)} />
      <input type="hidden" name="coverPositionY" value={round(crop.y)} />
      <input type="hidden" name="coverZoom" value={round(crop.zoom)} />

      {previewUrl && (
        <div className="space-y-3">
          {failed ? (
            <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted text-sm text-muted-foreground">
              <ImageOff className="size-6" />
              Não foi possível carregar a imagem dessa URL.
            </div>
          ) : (
            <div
              ref={frameRef}
              role="application"
              aria-label="Enquadramento da capa: arraste ou use as setas para posicionar"
              tabIndex={0}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKeyDown}
              className="cursor-grab touch-none rounded-xl outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
            >
              <CoverImage
                src={previewUrl}
                alt="Prévia da capa"
                crop={crop}
                imgProps={{
                  draggable: false,
                  // Imagem em cache pode terminar de carregar antes da hidratação, sem disparar onLoad;
                  // por isso medimos também no ref (callback estável, chamada só ao montar).
                  ref: measure,
                  onLoad: (e) => measure(e.currentTarget),
                  onError: () => setFailed(true),
                }}
              />
            </div>
          )}

          {ready && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Move className="size-3.5" />
                Arraste a imagem para escolher a parte que aparece.
              </p>
              <label className="flex flex-1 items-center gap-2 text-sm sm:justify-end">
                <ZoomIn className="size-4 text-muted-foreground" />
                <span className="sr-only">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={MAX_COVER_ZOOM}
                  step={0.01}
                  value={crop.zoom}
                  onChange={(e) => setCrop((c) => ({ ...c, zoom: Number(e.target.value) }))}
                  className="w-full accent-primary sm:w-40"
                />
              </label>
              <Button type="button" variant="outline" size="sm" onClick={() => setCrop(DEFAULT_CROP)}>
                <RotateCcw />
                Centralizar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
