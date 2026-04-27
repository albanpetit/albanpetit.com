import React from "react"
import { graphql, Link } from "gatsby"
import type { HeadFC, PageProps } from "gatsby"
import Layout from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, Calendar } from "lucide-react"

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
    }
  }
}

const PostTemplate: React.FC<PageProps<PostTemplateData>> = ({ data }) => {
  const { html, timeToRead, frontmatter } = data.markdownRemark

  return (
    <Layout>
      <article className="mx-auto max-w-2xl">
        {/* Back */}
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
          <Link to="/blog">
            <ArrowLeft className="mr-1 h-4 w-4" /> All posts
          </Link>
        </Button>

        {/* Header */}
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
                {timeToRead} min read
              </span>
            )}
          </div>
          {frontmatter.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {frontmatter.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        <Separator className="mb-8" />

        {/* Content */}
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
  <>
    <title>{data.markdownRemark.frontmatter.title} · Alban Petit</title>
    <meta name="description" content={data.markdownRemark.frontmatter.description} />
  </>
)

export const query = graphql`
  query PostTemplate($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      timeToRead
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
        tags
        category
      }
    }
  }
`
