import React from "react"
import GiscusWidget from "@giscus/react"
import { useTheme } from "@/context/theme"
import { useI18next } from "gatsby-plugin-react-i18next"

// Custom themes carried over from the Hugo site (static/giscus-*.css), loaded by giscus.app from the live domain
const THEME_URL = {
  light: "https://albanpetit.com/giscus-light.css",
  dark: "https://albanpetit.com/giscus-dark.css",
}

const Giscus = () => {
  const { theme } = useTheme()
  const { language } = useI18next()

  return (
    <GiscusWidget
      repo="albanpetit/albanpetit.com"
      repoId="MDEwOlJlcG9zaXRvcnkzOTY5MDM1OTc="
      category="Website comments"
      categoryId="DIC_kwDOF6hErc4CeFTI"
      mapping="pathname"
      // Exact pathname match: fuzzy search attached EN pages to FR discussions
      strict="1"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme={THEME_URL[theme]}
      lang={language}
      loading="lazy"
    />
  )
}

export default Giscus
