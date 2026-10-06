import { getRssString } from "@astrojs/rss"
import { render } from "astro:content"
import { experimental_AstroContainer as AstroContainer } from "astro/container"
import { type Language, localizedPath } from "@/lib/i18n"
import { excerpt, getPosts, postPath } from "@/lib/posts"
import { SITE_URL } from "@/lib/site"

const FEEDS: Record<Language, { title: string; description: string }> = {
  en: {
    title: "Alban Petit · Blog",
    description: "Personal blog of Alban Petit, electronics, web development, and the maker world.",
  },
  fr: {
    title: "Alban Petit · Articles",
    description: "Blog d'Alban Petit, électronique, développement web et monde maker.",
  },
}

// Links that replace what only renders with the site's scripts (Mermaid, KiCanvas, Chart.js, the STEP viewer)
const PLACEHOLDERS: Record<Language, { diagram: string; kicad: string; chart: string; model: string }> = {
  en: {
    diagram: "View the diagram on the site",
    kicad: "Open the interactive KiCad viewer on the site",
    chart: "View the chart on the site",
    model: "Open the 3D model on the site",
  },
  fr: {
    diagram: "Voir le diagramme sur le site",
    kicad: "Ouvrir la visionneuse KiCad interactive sur le site",
    chart: "Voir le graphique sur le site",
    model: "Ouvrir le modèle 3D sur le site",
  },
}

// Feed readers have no base URL: rewrite root-relative src/href/srcset to absolute ones
const absolutizeUrls = (html: string) =>
  html
    .replace(/(\s(?:src|href|srcset)=")\/(?!\/)/g, `$1${SITE_URL}/`)
    .replace(/(,\s*)\/_astro\//g, `$1${SITE_URL}/_astro/`)

/**
 * Fits the post HTML for feed readers, which run no script and resolve "#…" against the feed, not the post:
 * heading anchor icons go, in-page links point to the post, and diagrams, KiCad viewers, charts and 3D models become
 * links to it (a chart's data table stays, and so does a 3D model's link to its file)
 */
const forFeedReaders = (html: string, postUrl: string, lang: Language) => {
  const placeholder = (text: string) => `<p><a href="${postUrl}">${text}</a></p>`
  return html
    .replace(/<a class="anchor before"[^>]*>[\s\S]*?<\/a>/g, "")
    .replace(/(\shref=")#/g, `$1${postUrl}#`)
    .replace(/<pre class="mermaid"[^>]*>[\s\S]*?<\/pre>/g, placeholder(PLACEHOLDERS[lang].diagram))
    .replace(/<kicanvas-embed[^>]*>[\s\S]*?<\/kicanvas-embed>/g, placeholder(PLACEHOLDERS[lang].kicad))
    .replace(/<div class="chart-canvas">[\s\S]*?<\/script>/g, placeholder(PLACEHOLDERS[lang].chart))
    .replace(/<div class="step-embed"[^>]*>/g, (div) => `${placeholder(PLACEHOLDERS[lang].model)}${div}`)
}

/** RSS feed of one language, with the full post HTML in content:encoded */
async function feedXml(lang: Language) {
  const container = await AstroContainer.create()
  const posts = await getPosts(lang)
  const selfUrl = `${SITE_URL}${localizedPath("/rss.xml", lang)}`

  return getRssString({
    ...FEEDS[lang],
    site: `${SITE_URL}${localizedPath("/", lang)}`,
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: `<language>${lang}</language><atom:link href="${selfUrl}" rel="self" type="application/rss+xml"/>`,
    items: await Promise.all(
      posts.map(async (post) => {
        const { Content } = await render(post)
        const link = `${SITE_URL}${postPath(post)}`
        return {
          title: post.data.title,
          description: post.data.description ?? excerpt(post, 160),
          pubDate: post.data.date,
          link,
          content: forFeedReaders(absolutizeUrls(await container.renderToString(Content)), link, lang),
        }
      })
    ),
  })
}

// rss.xml and its legacy copy index.xml share one render per language in a build; dev always re-renders
const builtFeeds = new Map<Language, Promise<string>>()

export async function feed(lang: Language) {
  let xml = builtFeeds.get(lang)
  if (!xml) {
    xml = feedXml(lang)
    if (import.meta.env.PROD) builtFeeds.set(lang, xml)
  }
  return new Response(await xml, { headers: { "Content-Type": "application/xml" } })
}
