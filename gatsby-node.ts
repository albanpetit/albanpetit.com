import path from "path"
import type { GatsbyNode } from "gatsby"

const LANGUAGES = ["en", "fr"]
const DEFAULT_LANGUAGE = "en"

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

  const result = await graphql<{
    allMarkdownRemark: {
      nodes: {
        id: string
        frontmatter: { slug: string; lang: string }
      }[]
    }
  }>(`
    query CreatePostPages {
      allMarkdownRemark(filter: { fileAbsolutePath: { regex: "/content/posts/" } }) {
        nodes {
          id
          frontmatter {
            slug
            lang
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild("Error querying posts", result.errors)
    return
  }

  result.data?.allMarkdownRemark.nodes.forEach((node) => {
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
}
