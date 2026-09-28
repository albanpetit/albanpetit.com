// The .dark class on <html> is the source of truth: set before first paint by the inline script in
// Layout.astro, toggled here, and watched by everything that needs to follow it (Giscus, Mermaid, KiCanvas)

export type Theme = "light" | "dark"

const STORAGE_KEY = "theme"

export const currentTheme = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light")

const readStoredTheme = (): Theme | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === "dark" || stored === "light" ? stored : null
  } catch {
    return null
  }
}

const applyTheme = (theme: Theme) => document.documentElement.classList.toggle("dark", theme === "dark")

/** Calls `callback` with the new theme each time it changes; returns the unsubscribe function */
export function onThemeChange(callback: (theme: Theme) => void) {
  let theme = currentTheme()
  const observer = new MutationObserver(() => {
    if (currentTheme() === theme) return
    theme = currentTheme()
    callback(theme)
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => observer.disconnect()
}

/** Wires the [data-theme-toggle] buttons, and follows OS changes until the reader picks a theme explicitly */
export function initThemeToggle() {
  for (const button of document.querySelectorAll("[data-theme-toggle]")) {
    button.addEventListener("click", () => {
      const next: Theme = currentTheme() === "light" ? "dark" : "light"
      applyTheme(next)
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // Storage unavailable (private mode): the choice lasts for this page only
      }
    })
  }

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    if (!readStoredTheme()) applyTheme(event.matches ? "dark" : "light")
  })
}
