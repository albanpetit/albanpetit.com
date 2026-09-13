import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

const STORAGE_KEY = "theme"

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
})

const readStoredTheme = (): Theme | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === "dark" || stored === "light" ? stored : null
  } catch {
    return null
  }
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light")

  const apply = (next: Theme) => {
    setTheme(next)
    document.documentElement.classList.toggle("dark", next === "dark")
  }

  useEffect(() => {
    // The class is already set by the inline script in gatsby-ssr.tsx; sync React state with it
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light")

    // Follow OS changes until the reader picks a theme explicitly
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = (event: MediaQueryListEvent) => {
      if (!readStoredTheme()) apply(event.matches ? "dark" : "light")
    }
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light"
    apply(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage unavailable (private mode): the choice lasts for this page only
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
