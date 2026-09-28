import { getRssString } from "@astrojs/rss"
import { render } from "astro:content"
import { experimental_AstroContainer as AstroContainer } from "astro/container"
import { formatDate, getTranslations, type Language, localizedPath } from "@/lib/i18n"
import { excerpt, getPosts, postPath } from "@/lib/posts"
import { getLogs, logDate, logPath } from "@/lib/projects"
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

// Links that replace what only renders with the site's scripts (Mermaid, KiCanvas, Chart.js)
const PLACEHOLDERS: Record<Language, { diagram: string; kicad: string; chart: string }> = {
  en: {
    diagram: "View the diagram on the site",
    kicad: "Open the interactive KiCad viewer on the site",
    chart: "View the chart on the site",
  },
  fr: {
    diagram: "Voir le diagramme sur le site",
    kicad: "Ouvrir la visionneuse KiCad interactive sur le site",
    chart: "Voir le graphique sur le site",
  },
}

// Feed readers have no base URL: rewrite root-relative src/href/srcset to absolute ones
const absolutizeUrls = (html: string) =>
  html
    .replace(/(\s(?:src|href|srcset)=")\/(?!\/)/g, `$1${SITE_URL}/`)
    .replace(/(,\s*)\/_astro\//g, `$1${SITE_URL}/_astro/`)

/**
 * Fits the post HTML for feed readers, which run no script and resolve "#…" against the feed, not the post:
 * heading anchor icons go, in-page links point to the post, and diagrams, KiCad viewers and charts become links
 * to it (a chart's data table stays)
 */
const forFeedReaders = (html: string, postUrl: string, lang: Language) => {
  const placeholder = (text: string) => `<p><a href="${postUrl}">${text}</a></p>`
  return html
    .replace(/<a class="anchor before"[^>]*>[\s\S]*?<\/a>/g, "")
    .replace(/(\shref=")#/g, `$1${postUrl}#`)
    .replace(/<pre class="mermaid"[^>]*>[\s\S]*?<\/pre>/g, placeholder(PLACEHOLDERS[lang].diagram))
    .replace(/<kicanvas-embed[^>]*>[\s\S]*?<\/kicanvas-embed>/g, placeholder(PLACEHOLDERS[lang].kicad))
    .replace(/<div class="chart-canvas">[\s\S]*?<\/script>/g, placeholder(PLACEHOLDERS[lang].chart))
}

type Kind = "posts" | "logs"

/** Title, date and path of every entry of a feed, newest first */
async function entries(kind: Kind, lang: Language) {
  if (kind === "posts") {
    return (await getPosts(lang)).map((post) => ({
      entry: post,
      title: post.data.title,
      description: post.data.description ?? excerpt(post, 160),
      pubDate: post.data.date,
      path: postPath(post),
    }))
  }
  return (await getLogs(lang)).map((log) => ({
    entry: log,
    title: log.data.title ?? formatDate(logDate(log), lang),
    description: excerpt(log, 160),
    pubDate: logDate(log),
    path: logPath(log),
  }))
}

/** RSS feed of the posts or the logs of one language, with the full HTML in content:encoded */
async function feedXml(kind: Kind, lang: Language) {
  const container = await AstroContainer.create()
  const t = getTranslations(lang)
  const channel =
    kind === "posts" ? FEEDS[lang] : { title: t("logs.feedTitle"), description: t("logs.feedDescription") }
  const selfUrl = `${SITE_URL}${localizedPath(kind === "posts" ? "/rss.xml" : "/logs/rss.xml", lang)}`

  return getRssString({
    ...channel,
    site: `${SITE_URL}${localizedPath(kind === "posts" ? "/" : "/logs/", lang)}`,
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: `<language>${lang}</language><atom:link href="${selfUrl}" rel="self" type="application/rss+xml"/>`,
    items: await Promise.all(
      (await entries(kind, lang)).map(async ({ entry, path, ...item }) => {
        const { Content } = await render(entry)
        const link = `${SITE_URL}${path}`
        return {
          ...item,
          link,
          content: forFeedReaders(absolutizeUrls(await container.renderToString(Content)), link, lang),
        }
      })
    ),
  })
}

// rss.xml and its legacy copy index.xml share one render per language in a build; dev always re-renders
const builtFeeds = new Map<string, Promise<string>>()

async function respond(kind: Kind, lang: Language) {
  const key = `${kind}:${lang}`
  let xml = builtFeeds.get(key)
  if (!xml) {
    xml = feedXml(kind, lang)
    if (import.meta.env.PROD) builtFeeds.set(key, xml)
  }
  return new Response(await xml, { headers: { "Content-Type": "application/xml" } })
}

/** Feed of the posts */
export const feed = (lang: Language) => respond("posts", lang)

/** Feed of the daily logs */
export const logsFeed = (lang: Language) => respond("logs", lang)
