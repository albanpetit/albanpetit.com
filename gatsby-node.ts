import path from "path"
import type { GatsbyNode } from "gatsby"

const LANGUAGES = ["en", "fr"]
const DEFAULT_LANGUAGE = "en"

function slugifyTag(tag: string): string {
  return tag
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  })
}

export const createPages: GatsbyNode["createPages"] = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  const postTemplate = path.resolve("src/templates/post.tsx")
  const tagTemplate = path.resolve("src/templates/tag.tsx")

  const result = await graphql<{
    allMarkdownRemark: {
      nodes: {
        id: string
        frontmatter: { slug: string; lang: string; tags: string[] | null }
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
  const tagsByLang = new Map<string, Map<string, string>>() // lang -> (tag -> tagSlug)

  nodes.forEach((node) => {
    const { lang, tags } = node.frontmatter
    if (!lang || !tags) return
    if (!tagsByLang.has(lang)) tagsByLang.set(lang, new Map())
    tags.forEach((tag) => tagsByLang.get(lang)!.set(tag, slugifyTag(tag)))
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
