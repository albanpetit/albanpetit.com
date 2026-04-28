import React, { useState, useMemo } from "react"
import { graphql } from "gatsby"
import type { HeadFC, PageProps } from "gatsby"
import { useTranslation, useI18next } from "gatsby-plugin-react-i18next"
import Layout from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Seo from "@/components/seo"
import PostCard, { type PostCardData } from "@/components/PostCard"

type BlogPageData = {
  allMarkdownRemark: {
    nodes: PostCardData[]
  }
}

const BlogPage: React.FC<PageProps<BlogPageData>> = ({ data }) => {
  const { t } = useTranslation()
  const { language } = useI18next()
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const posts = useMemo(
    () => data.allMarkdownRemark.nodes.filter((p) => p.frontmatter.lang === language),
    [data, language]
  )

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.frontmatter.tags ?? []))).sort(),
    [posts]
  )

  const filtered = useMemo(
    () => activeTag ? posts.filter((p) => p.frontmatter.tags?.includes(activeTag)) : posts,
    [posts, activeTag]
  )

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("blog.title")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("blog.subtitle", { count: filtered.length })}
          </p>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setActiveTag(null)} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
              <Badge variant={activeTag === null ? "default" : "outline"} className="cursor-pointer">
                {t("blog.all")}
              </Badge>
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                <Badge variant={activeTag === tag ? "default" : "outline"} className="cursor-pointer">
                  {tag}
                </Badge>
              </button>
            ))}
          </div>
        )}

        <Separator />

        <div className="flex flex-col gap-4">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} language={language} />
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground py-8 text-center">{t("blog.empty")}</p>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default BlogPage

export const Head: HeadFC<BlogPageData, { language: string }> = ({ pageContext }) => {
  const isEN = pageContext.language !== "fr"
  return (
    <Seo
      title={isEN ? "Blog · Alban Petit" : "Articles · Alban Petit"}
      description={isEN
        ? "Posts on electronics, web development, and maker projects."
        : "Articles sur l'électronique, le développement web et les projets makers."}
      canonicalPath={isEN ? "/blog/" : "/fr/blog/"}
      lang={pageContext.language}
      alternatePaths={{ en: "/blog/", fr: "/fr/blog/" }}
    />
  )
}

export const query = graphql`
  query BlogPage($language: String!) {
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/content/posts/" } }
      sort: { frontmatter: { date: DESC } }
    ) {
      nodes {
        id
        excerpt(pruneLength: 160)
        frontmatter {
          title
          date(formatString: "MMMM DD, YYYY")
          description
          tags
          category
          slug
          lang
          image {
            childImageSharp {
              gatsbyImageData(width: 400, height: 300, placeholder: BLURRED)
            }
          }
        }
      }
    }
  }
`
