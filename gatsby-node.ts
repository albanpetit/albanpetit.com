import { copyFile, mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import type { GatsbyNode } from "gatsby"
import { slugifyTag, slugifyCategory } from "./src/lib/tag"

const LANGUAGES = ["en", "fr"]
const DEFAULT_LANGUAGE = "en"

// Read once, so the static HTML and the browser bundle print the same year (no hydration mismatch on January 1st)
const BUILD_YEAR = new Date().getFullYear()

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({ actions, stage, plugins }) => {
  actions.setWebpackConfig({
    plugins: [plugins.define({ __BUILD_YEAR__: JSON.stringify(BUILD_YEAR) })],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    // Do not publish source maps of the production bundles
    ...(stage === "build-javascript" ? { devtool: false } : {}),
  })
}

export const createPages: GatsbyNode["createPages"] = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  const postTemplate = path.resolve("src/templates/post.tsx")
  const tagTemplate = path.resolve("src/templates/tag.tsx")
  const categoryTemplate = path.resolve("src/templates/category.tsx")

  const result = await graphql<{
    allMarkdownRemark: {
      nodes: {
        id: string
        frontmatter: { slug: string; lang: string; tags: string[] | null; category: string | null }
      }[]
    }
  }>(`
    query CreatePages {
      allMarkdownRemark(filter: { fileAbsolutePath: { regex: "/content/posts/" } }) {
        nodes {
          id
          frontmatter {
            slug
            lang
            tags
            category
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild("Error querying posts", result.errors)
    return
  }

  const nodes = result.data?.allMarkdownRemark.nodes ?? []

  // Post pages
  const postKeys = new Set(nodes.map(({ frontmatter: { slug, lang } }) => `${slug}:${lang}`))

  nodes.forEach((node) => {
    const { slug, lang } = node.frontmatter
    if (!slug || !lang) return

    const originalPath = `/post/${slug}/`
    const pagePath = lang === DEFAULT_LANGUAGE ? originalPath : `/${lang}${originalPath}`

    createPage({
      path: pagePath,
      component: postTemplate,
      context: {
        id: node.id,
        slug,
        // A post may exist in one language only: no hreflang, and the language switch falls back to the blog
        hasTranslation: postKeys.has(`${slug}:${lang === "en" ? "fr" : "en"}`),
        language: lang,
        i18n: {
          language: lang,
          languages: LANGUAGES,
          defaultLanguage: DEFAULT_LANGUAGE,
          originalPath,
          routed: lang !== DEFAULT_LANGUAGE,
          path: pagePath,
        },
      },
    })
  })

  // Tag pages — one page per unique tag+lang combination
  const tagsByLang = new Map<string, Map<string, string>>()

  nodes.forEach((node) => {
    const { lang, tags } = node.frontmatter
    if (!lang || !tags) return
    const langTags = tagsByLang.get(lang) ?? new Map<string, string>()
    tagsByLang.set(lang, langTags)
    for (const tag of tags) langTags.set(tag, slugifyTag(tag))
  })

  // Pair tags across languages: translated posts share a slug and list their tags in the same order
  const tagsBySlug = new Map<string, Map<string, string[]>>()

  nodes.forEach((node) => {
    const { slug, lang, tags } = node.frontmatter
    if (!slug || !lang || !tags) return
    const slugTags = tagsBySlug.get(slug) ?? new Map<string, string[]>()
    tagsBySlug.set(slug, slugTags)
    slugTags.set(lang, tags)
  })

  // Key: `${lang}:${tag}` — value: slug of the same tag in the other language
  const tagCounterparts = new Map<string, string>()

  tagsBySlug.forEach((tagsForSlug, slug) => {
    const en = tagsForSlug.get("en")
    const fr = tagsForSlug.get("fr")
    if (!en || !fr) return
    if (en.length !== fr.length) {
      reporter.warn(`Post "${slug}": EN and FR tag lists differ in length, its tag pages cannot be paired`)
      return
    }
    en.forEach((tag, i) => {
      tagCounterparts.set(`en:${tag}`, slugifyTag(fr[i]))
      tagCounterparts.set(`fr:${fr[i]}`, slugifyTag(tag))
    })
  })

  tagsByLang.forEach((tags, lang) => {
    tags.forEach((tagSlug, tag) => {
      const originalPath = `/tag/${tagSlug}/`
      const pagePath = lang === DEFAULT_LANGUAGE ? originalPath : `/${lang}${originalPath}`

      createPage({
        path: pagePath,
        component: tagTemplate,
        context: {
          tag,
          tagSlug,
          alternateTagSlug: tagCounterparts.get(`${lang}:${tag}`) ?? null,
          language: lang,
          i18n: {
            language: lang,
            languages: LANGUAGES,
            defaultLanguage: DEFAULT_LANGUAGE,
            originalPath,
            routed: lang !== DEFAULT_LANGUAGE,
            path: pagePath,
          },
        },
      })
    })
  })

  // Category pages — one page per unique category+lang combination
  const categoriesByLang = new Map<string, Map<string, string>>()

  nodes.forEach((node) => {
    const { lang, category } = node.frontmatter
    if (!lang || !category) return
    const langCategories = categoriesByLang.get(lang) ?? new Map<string, string>()
    categoriesByLang.set(lang, langCategories)
    langCategories.set(category, slugifyCategory(category))
  })

  categoriesByLang.forEach((categories, lang) => {
    categories.forEach((categorySlug, category) => {
      const originalPath = `/category/${categorySlug}/`
      const pagePath = lang === DEFAULT_LANGUAGE ? originalPath : `/${lang}${originalPath}`

      createPage({
        path: pagePath,
        component: categoryTemplate,
        context: {
          category,
          categorySlug,
          // Category names are shared across languages: the page exists in the other language if a post uses it there
          hasAlternate: categoriesByLang.get(lang === "en" ? "fr" : "en")?.has(category) ?? false,
          language: lang,
          i18n: {
            language: lang,
            languages: LANGUAGES,
            defaultLanguage: DEFAULT_LANGUAGE,
            originalPath,
            routed: lang !== DEFAULT_LANGUAGE,
            path: pagePath,
          },
        },
      })
    })
  })
}

const SITE_URL = "https://albanpetit.com"

const redirectPage = (to: string) =>
  `<!doctype html><html><head><meta charset="utf-8"><title>Redirecting…</title><link rel="canonical" href="${SITE_URL}${to}"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=${to}"></head><body><a href="${to}">${SITE_URL}${to}</a></body></html>`

// The Hugo site served posts under /posts/ (its Giscus discussions still carry those paths).
// GitHub Pages has no server redirects: write meta-refresh pages so old links keep working.
export const onPostBuild: GatsbyNode["onPostBuild"] = async ({ graphql, reporter }) => {
  const result = await graphql<{ allMarkdownRemark: { nodes: { frontmatter: { slug: string; lang: string } }[] } }>(`
    query LegacyPostUrls {
      allMarkdownRemark(filter: { fileAbsolutePath: { regex: "/content/posts/" } }) {
        nodes {
          frontmatter {
            slug
            lang
          }
        }
      }
    }
  `)

  const prefix = (lang: string) => (lang === DEFAULT_LANGUAGE ? "" : `/${lang}`)
  const redirects = new Map<string, string>(
    LANGUAGES.map((lang) => [`${prefix(lang)}/posts/`, `${prefix(lang)}/blog/`])
  )
  for (const { frontmatter } of result.data?.allMarkdownRemark.nodes ?? []) {
    const { slug, lang } = frontmatter
    if (slug && lang) redirects.set(`${prefix(lang)}/posts/${slug}/`, `${prefix(lang)}/post/${slug}/`)
  }

  await Promise.all(
    [...redirects].map(async ([from, to]) => {
      const dir = path.join("public", from)
      await mkdir(dir, { recursive: true })
      await writeFile(path.join(dir, "index.html"), redirectPage(to))
    })
  )
  reporter.info(`Wrote ${redirects.size} redirects from legacy /posts/ URLs`)

  // Feed readers and search engines do not follow meta refresh: serve the Hugo feed and sitemap URLs as copies.
  // Runs after gatsby-plugin-feed and gatsby-plugin-sitemap, whose onPostBuild come first.
  const copies = [
    ["rss.xml", "index.xml"],
    ["fr/rss.xml", "fr/index.xml"],
    ["sitemap-index.xml", "sitemap.xml"],
  ]
  await Promise.all(copies.map(([from, to]) => copyFile(path.join("public", from), path.join("public", to))))
}
