import React from "react"
import { graphql, Link, navigate } from "gatsby"
import { GatsbyImage, getImage, type IGatsbyImageData } from "gatsby-plugin-image"
import type { HeadFC, PageProps } from "gatsby"
import { useTranslation, useI18next } from "gatsby-plugin-react-i18next"
import Layout from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import Seo from "@/components/seo"
import { tagPath } from "@/lib/tag"

type Post = {
  id: string
  frontmatter: {
    title: string
    date: string
    description: string
    tags: string[]
    slug: string
    lang: string
    image: { childImageSharp: { gatsbyImageData: IGatsbyImageData } } | null
  }
  excerpt: string
  timeToRead: number
}

type CategoryPageData = {
  allMarkdownRemark: { nodes: Post[] }
}

type CategoryPageContext = {
  category: string
}

const CategoryPage: React.FC<PageProps<CategoryPageData, CategoryPageContext>> = ({ data, pageContext }) => {
  const { t } = useTranslation()
  const { language } = useI18next()
  const { category } = pageContext
  const posts = data.allMarkdownRemark.nodes

  const blogPath = language === "en" ? "/blog/" : "/fr/blog/"
  const postPath = (slug: string) =>
    language === "en" ? `/post/${slug}/` : `/fr/post/${slug}/`

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
            <Link to={blogPath}>
              <ArrowLeft className="mr-1 h-4 w-4" /> {t("post.backToBlog")}
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {category}
            </h1>
          </div>
          <p className="mt-2 text-muted-foreground">
            {t("tag.subtitle", { count: posts.length })}
          </p>
        </div>

        <Separator />

        <div className="flex flex-col gap-4">
          {posts.map((post) => {
            const coverImage = post.frontmatter.image
              ? getImage(post.frontmatter.image.childImageSharp.gatsbyImageData)
              : null

            return (
              <Card
                key={post.id}
                className="transition-shadow hover:shadow-md overflow-hidden cursor-pointer group"
                onClick={() => navigate(postPath(post.frontmatter.slug))}
              >
                <div className="flex flex-col sm:flex-row">
                  {coverImage && (
                    <div className="sm:w-48 sm:shrink-0">
                      <GatsbyImage
                        image={coverImage}
                        alt={post.frontmatter.title}
                        className="h-40 sm:h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
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
                          <Link key={tag} to={tagPath(tag, language)} onClick={(e) => e.stopPropagation()}>
                            <Badge variant="secondary" className="text-xs cursor-pointer">
                              {tag}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

export default CategoryPage

export const Head: HeadFC<CategoryPageData, CategoryPageContext> = ({ pageContext }) => (
  <Seo
    title={`${pageContext.category} · Alban Petit`}
    description={`Posts in category ${pageContext.category}`}
  />
)

export const query = graphql`
  query CategoryPage($category: String!, $language: String!) {
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
      filter: {
        fileAbsolutePath: { regex: "/content/posts/" }
        frontmatter: { category: { eq: $category }, lang: { eq: $language } }
      }
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
