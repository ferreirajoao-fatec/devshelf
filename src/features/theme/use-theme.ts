"use client"

import { useCallback, useSyncExternalStore } from "react"

import { THEME_CHANGE_EVENT, THEME_STORAGE_KEY, THEMES, type Theme } from "./theme"

function readTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return THEMES.includes(value as Theme) ? (value as Theme) : "system"
  } catch {
    return "system"
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as Theme)

  const setTheme = useCallback((next: Theme) => {
    try {
      if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY)
      else localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // localStorage indisponível (ex.: modo privado restrito): aplica só nesta página
    }
    // O script do <head> escuta este evento e reaplica a classe .dark
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
  }, [])

  return { theme, setTheme }
}
