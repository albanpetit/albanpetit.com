import React from "react"
import { graphql, Link } from "gatsby"
import { GatsbyImage, getImage, type IGatsbyImageData } from "gatsby-plugin-image"
import type { HeadFC, PageProps } from "gatsby"
import { useTranslation, useI18next } from "gatsby-plugin-react-i18next"
import Layout from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Calendar } from "lucide-react"
import Seo from "@/components/seo"
import { tagPath } from "@/lib/tag"

type PostTemplateData = {
  markdownRemark: {
    html: string
    timeToRead: number
    frontmatter: {
      title: string
      date: string
      description: string
      tags: string[]
      category: string
      lang: string
      image: { childImageSharp: { gatsbyImageData: IGatsbyImageData } } | null
    }
  }
}

const PostTemplate: React.FC<PageProps<PostTemplateData>> = ({ data }) => {
  const { t } = useTranslation()
  const { language } = useI18next()
  const { html, timeToRead, frontmatter } = data.markdownRemark
  const coverImage = frontmatter.image ? getImage(frontmatter.image.childImageSharp.gatsbyImageData) : null

  const blogPath = language === "en" ? "/blog/" : "/fr/blog/"

  return (
    <Layout>
      <article className="mx-auto max-w-2xl">
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
          <Link to={blogPath}>
            <ArrowLeft className="mr-1 h-4 w-4" /> {t("post.backToBlog")}
          </Link>
        </Button>

        <header className="flex flex-col gap-4 mb-8">
          {frontmatter.category && (
            <Badge variant="secondary" className="w-fit">
              {frontmatter.category}
            </Badge>
          )}
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            {frontmatter.title}
          </h1>
          {frontmatter.description && (
            <p className="text-lg text-muted-foreground">{frontmatter.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {frontmatter.date}
            </span>
            {timeToRead && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {t("post.minRead", { count: timeToRead })}
              </span>
            )}
          </div>
          {frontmatter.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {frontmatter.tags.map((tag) => (
                <Link key={tag} to={tagPath(tag, language)}>
                  <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent transition-colors">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </header>

        {coverImage && (
          <div className="mb-8 overflow-hidden rounded-lg">
            <GatsbyImage
              image={coverImage}
              alt={frontmatter.title}
              className="w-full aspect-video object-cover"
            />
          </div>
        )}

        <Separator className="mb-8" />

        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </Layout>
  )
}

export default PostTemplate

export const Head: HeadFC<PostTemplateData> = ({ data }) => (
  <Seo
    title={`${data.markdownRemark.frontmatter.title} · Alban Petit`}
    description={data.markdownRemark.frontmatter.description}
  />
)

export const query = graphql`
  query PostTemplate($id: String!, $language: String!) {
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
    markdownRemark(id: { eq: $id }) {
      html
      timeToRead
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
        tags
        category
        lang
        image {
          childImageSharp {
            gatsbyImageData(width: 800, placeholder: BLURRED)
          }
        }
      }
    }
  }
`
