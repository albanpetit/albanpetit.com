import "./src/styles/globals.css"
import React from "react"
import type { GatsbySSR } from "gatsby"
import { ThemeProvider } from "./src/context/theme"

// Runs before the page is painted so dark-mode readers never see a light flash
const themeScript = `(function(){try{var s=localStorage.getItem("theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`

export const onRenderBody: GatsbySSR["onRenderBody"] = ({ setPreBodyComponents }) => {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: constant script defined in this file
  setPreBodyComponents([<script key="theme" dangerouslySetInnerHTML={{ __html: themeScript }} />])
}

export const wrapRootElement: GatsbySSR["wrapRootElement"] = ({ element }) => <ThemeProvider>{element}</ThemeProvider>
