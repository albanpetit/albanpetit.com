import { currentTheme, onThemeChange, type Theme } from "@/scripts/theme"
import "@/scripts/mermaid"

// Reading progress bar
const bar = document.getElementById("reading-progress")
if (bar) {
  const update = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement
    const total = scrollHeight - clientHeight
    bar.style.width = `${total > 0 ? (scrollTop / total) * 100 : 0}%`
  }
  window.addEventListener("scroll", update, { passive: true })
  update()
}

// KiCanvas theme names differ from ours: "kicad" is its light scheme, "witchhazel" its dark one
const KICANVAS_THEME = { light: "kicad", dark: "witchhazel" } as const

const syncKicanvasTheme = (theme: Theme) => {
  for (const el of document.querySelectorAll("kicanvas-embed")) el.setAttribute("theme", KICANVAS_THEME[theme])
}

if (document.querySelector("kicanvas-embed")) {
  syncKicanvasTheme(currentTheme())
  onThemeChange(syncKicanvasTheme)
}
