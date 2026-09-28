import GiscusWidget from "@giscus/react"
import { useTheme } from "@/components/useTheme"
import type { Language } from "@/lib/i18n"
import { SITE_URL } from "@/lib/site"

// Custom themes carried over from the Hugo site (public/giscus-*.css), loaded by giscus.app from the live domain
const THEME_URL = {
  light: `${SITE_URL}/giscus-light.css`,
  dark: `${SITE_URL}/giscus-dark.css`,
}

const Giscus = ({ lang }: { lang: Language }) => {
  const theme = useTheme()

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
      lang={lang}
      loading="lazy"
    />
  )
}

export default Giscus
