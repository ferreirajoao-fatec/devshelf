"use client"

import { cn } from "@/lib/utils"

import { THEME_OPTIONS } from "./theme-toggle"
import { useTheme } from "./use-theme"

// Escolha de tema em formato de cartões, para a página de configurações.
// A preferência fica neste navegador (mesma do botão de tema do header).
export function ThemeSettings() {
  const { theme, setTheme } = useTheme()

  return (
    <div role="radiogroup" aria-label="Tema" className="grid grid-cols-3 gap-2 sm:max-w-md">
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
        const selected = theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border p-3 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              selected ? "border-primary bg-primary/5 font-medium" : "hover:bg-muted"
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
