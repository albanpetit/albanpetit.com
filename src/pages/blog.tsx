import React, { useState } from "react"
import { graphql, Link } from "gatsby"
import type { HeadFC, PageProps } from "gatsby"
import { useTranslation, useI18next } from "gatsby-plugin-react-i18next"
import Layout from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Seo from "@/components/seo"

type Post = {
  id: string
  frontmatter: {
    title: string
    date: string
    description: string
    tags: string[]
    category: string
    slug: string
    lang: string
  }
  excerpt: string
  timeToRead: number
}

type BlogPageData = {
  allMarkdownRemark: {
    nodes: Post[]
  }
}

const BlogPage: React.FC<PageProps<BlogPageData>> = ({ data }) => {
  const { t } = useTranslation()
  const { language } = useI18next()
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const posts = data.allMarkdownRemark.nodes.filter(
    (p) => p.frontmatter.lang === language
  )

  const postPath = (slug: string) =>
    language === "en" ? `/post/${slug}/` : `/fr/post/${slug}/`

  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.frontmatter.tags ?? []))
  ).sort()

  const filtered = activeTag
    ? posts.filter((p) => p.frontmatter.tags?.includes(activeTag))
    : posts

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("blog.title")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("blog.subtitle", { count: posts.length })}
          </p>
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveTag(null)} className="focus:outline-none">
              <Badge
                variant={activeTag === null ? "default" : "outline"}
                className="cursor-pointer"
              >
                {t("blog.all")}
              </Badge>
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className="focus:outline-none"
              >
                <Badge
                  variant={activeTag === tag ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {tag}
                </Badge>
              </button>
            ))}
          </div>
        )}

        <Separator />

        {/* Post list */}
        <div className="flex flex-col gap-4">
          {filtered.map((post) => (
            <Link key={post.id} to={postPath(post.frontmatter.slug)} className="group">
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg leading-snug group-hover:text-secondary transition-colors">
                      {post.frontmatter.title}
                    </CardTitle>
                    <CardDescription className="shrink-0 text-xs">
                      {post.frontmatter.date}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">
                    {post.frontmatter.description || post.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {post.frontmatter.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
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

export const Head: HeadFC = () => (
  <Seo title="Blog · Alban Petit" description="Blog posts by Alban Petit" />
)

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
        timeToRead
        frontmatter {
          title
          date(formatString: "MMMM DD, YYYY")
          description
          tags
          category
          slug
          lang
        }
      }
    }
  }
`
