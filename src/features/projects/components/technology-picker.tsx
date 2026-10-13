"use client"

import { Check, Search } from "lucide-react"
import { useMemo, useState } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { MAX_TECHNOLOGIES } from "../schema"

type Technology = { id: string; name: string; color: string | null }

type TechnologyPickerProps = {
  technologies: Technology[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  invalid?: boolean
}

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
}

export function TechnologyPicker({ technologies, selectedIds, onChange, invalid }: TechnologyPickerProps) {
  const [query, setQuery] = useState("")
  const selected = new Set(selectedIds)
  const limitReached = selected.size >= MAX_TECHNOLOGIES

  const visible = useMemo(() => {
    const q = normalize(query.trim())
    return q ? technologies.filter((t) => normalize(t.name).includes(q)) : technologies
  }, [query, technologies])

  function toggle(id: string) {
    if (selected.has(id)) onChange(selectedIds.filter((s) => s !== id))
    else if (!limitReached) onChange([...selectedIds, id])
  }

  return (
    <div className="space-y-3">
      {/* Valores enviados no FormData */}
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="technologyIds" value={id} />
      ))}

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar tecnologia..."
          aria-label="Buscar tecnologia"
          className="pl-8"
          aria-invalid={invalid || undefined}
        />
      </div>

      <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto rounded-lg border p-2">
        {visible.length === 0 && (
          <p className="px-1 py-2 text-sm text-muted-foreground">Nenhuma tecnologia encontrada.</p>
        )}
        {visible.map((tech) => {
          const isSelected = selected.has(tech.id)
          return (
            <button
              key={tech.id}
              type="button"
              aria-pressed={isSelected}
              disabled={!isSelected && limitReached}
              onClick={() => toggle(tech.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              {isSelected ? (
                <Check className="size-3" />
              ) : (
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full border"
                  style={tech.color ? { backgroundColor: tech.color } : undefined}
                />
              )}
              {tech.name}
            </button>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        {selected.size} de {MAX_TECHNOLOGIES} selecionadas
      </p>
    </div>
  )
}
