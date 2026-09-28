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

// Feed readers have no base URL: rewrite root-relative src/href/srcset to absolute ones
const absolutizeUrls = (html: string) =>
  html
    .replace(/(\s(?:src|href|srcset)=")\/(?!\/)/g, `$1${SITE_URL}/`)
    .replace(/(,\s*)\/_astro\//g, `$1${SITE_URL}/_astro/`)

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
        return {
          title: post.data.title,
          description: post.data.description ?? excerpt(post, 160),
          pubDate: post.data.date,
          link: `${SITE_URL}${postPath(post)}`,
          content: absolutizeUrls(await container.renderToString(Content)),
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
