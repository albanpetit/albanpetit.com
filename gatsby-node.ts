import path from "path"
import type { GatsbyNode } from "gatsby"

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
        frontmatter: { slug: string }
      }[]
    }
  }>(`
    query CreatePostPages {
      allMarkdownRemark(filter: { fileAbsolutePath: { regex: "/content/posts/" } }) {
        nodes {
          id
          frontmatter {
            slug
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
    const slug = node.frontmatter.slug
    if (!slug) return
    createPage({
      path: `/post/${slug}`,
      component: postTemplate,
      context: { id: node.id },
    })
  })
}
