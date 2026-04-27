import React from "react"
import { graphql } from "gatsby"
import type { HeadFC, PageProps } from "gatsby"
import Layout from "@/components/layout"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Twitter, Github } from "lucide-react"
import { Button } from "@/components/ui/button"

type AboutPageData = {
  markdownRemark: {
    html: string
    frontmatter: {
      title: string
    }
  }
}

const AboutPage: React.FC<PageProps<AboutPageData>> = ({ data }) => {
  const { html } = data.markdownRemark

  return (
    <Layout>
      <div className="mx-auto max-w-2xl flex flex-col gap-8">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar className="h-24 w-24 border-2 border-primary shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
              AP
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Alban Petit</h1>
              <p className="text-muted-foreground">Developer · Maker · FabManager</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {["Web Development", "Electronics", "Maker", "Open Source"].map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="mailto:contact@albanpetit.com">
                  <Mail className="mr-1.5 h-3.5 w-3.5" /> Email
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://twitter.com/Padh_"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="mr-1.5 h-3.5 w-3.5" /> Twitter
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://github.com/albanpetit"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-1.5 h-3.5 w-3.5" /> GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bio content from markdown */}
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </Layout>
  )
}

export default AboutPage

export const Head: HeadFC = () => (
  <>
    <title>About · Alban Petit</title>
    <meta
      name="description"
      content="About Alban Petit — developer, maker, and FabManager at La Machinerie."
    />
  </>
)

export const query = graphql`
  query AboutPage {
    markdownRemark(frontmatter: { slug: { eq: "about" } }) {
      html
      frontmatter {
        title
      }
    }
  }
`
