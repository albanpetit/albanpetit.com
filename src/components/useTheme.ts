import { useEffect, useState } from "react"
import { currentTheme, onThemeChange, type Theme } from "@/scripts/theme"

/**
 * Current theme for React islands, following the .dark class on <html>.
 * Server-rendered islands start from "light"; client:only ones get the right theme on first render.
 */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(() => (typeof document === "undefined" ? "light" : currentTheme()))

  useEffect(() => {
    setTheme(currentTheme())
    return onThemeChange(setTheme)
  }, [])

  return theme
}
