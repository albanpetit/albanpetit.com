import "./src/styles/globals.css"
import React from "react"
import type { GatsbyBrowser } from "gatsby"
import { ThemeProvider } from "./src/context/theme"

export const wrapRootElement: GatsbyBrowser["wrapRootElement"] = ({ element }) => (
  <ThemeProvider>{element}</ThemeProvider>
)
