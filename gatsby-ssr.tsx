import "./src/styles/globals.css"
import React from "react"
import type { GatsbySSR } from "gatsby"
import { ThemeProvider } from "./src/context/theme"

export const wrapRootElement: GatsbySSR["wrapRootElement"] = ({ element }) => (
  <ThemeProvider>{element}</ThemeProvider>
)
