"use client"

import { Star } from "lucide-react"
import { useOptimistic, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { toggleFavoriteAction } from "../actions"

type FavoriteButtonProps = {
  projectId: string
  projectTitle: string
  initialFavorited: boolean
  // Com contagem: botão com texto (página do projeto). Sem: só o ícone (cards).
  initialCount?: number
}

export function FavoriteButton({ projectId, projectTitle, initialFavorited, initialCount }: FavoriteButtonProps) {
  const [state, setState] = useState({ favorited: initialFavorited, count: initialCount ?? 0 })
  const [optimistic, setOptimistic] = useOptimistic(state)
  const [error, setError] = useState<string>()
  const [, startTransition] = useTransition()

  function toggle() {
    setError(undefined)
    startTransition(async () => {
      setOptimistic((s) => ({ favorited: !s.favorited, count: s.count + (s.favorited ? -1 : 1) }))
      const result = await toggleFavoriteAction(projectId)
      // Em erro o estado não muda e o otimista volta sozinho ao fim da transição
      if ("error" in result) setError(result.error)
      else setState(result)
    })
  }

  const label = optimistic.favorited ? `Remover ${projectTitle} dos favoritos` : `Favoritar ${projectTitle}`
  const icon = <Star className={cn(optimistic.favorited && "fill-amber-400 text-amber-400")} />

  if (initialCount === undefined) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={toggle}
        aria-pressed={optimistic.favorited}
        aria-label={label}
        title={error ?? (optimistic.favorited ? "Remover dos favoritos" : "Favoritar")}
      >
        {icon}
      </Button>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button type="button" variant="outline" onClick={toggle} aria-pressed={optimistic.favorited} aria-label={label}>
        {icon}
        {optimistic.favorited ? "Favoritado" : "Favoritar"}
        <span className="text-muted-foreground tabular-nums">{optimistic.count}</span>
      </Button>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
