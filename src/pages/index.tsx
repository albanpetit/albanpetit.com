import React from "react"
import { graphql, Link } from "gatsby"
import type { HeadFC, PageProps } from "gatsby"
import Layout from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowRight } from "lucide-react"

type Post = {
  id: string
  frontmatter: {
    title: string
    date: string
    description: string
    tags: string[]
    slug: string
  }
  excerpt: string
}

type IndexPageData = {
  allMarkdownRemark: {
    nodes: Post[]
  }
}

const IndexPage: React.FC<PageProps<IndexPageData>> = ({ data }) => {
  const posts = data.allMarkdownRemark.nodes

  return (
    <Layout>
      {/* Hero */}
      <section className="flex flex-col gap-6 py-12 md:py-20">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
              AP
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alban Petit</h1>
            <p className="text-muted-foreground">Developer · Maker · FabManager</p>
          </div>
        </div>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          I write about electronics, web development, and all things related to the maker world —
          tutorials, experiments, and projects built at{" "}
          <a
            href="https://lamachinerie.org"
            className="text-secondary underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            La Machinerie
          </a>{" "}
          and in my workshop.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/blog">Read the blog <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/about">About me</Link>
          </Button>
        </div>
      </section>

      {/* Latest posts */}
      {posts.length > 0 && (
        <section className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Latest posts</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/blog">All posts <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} to={`/post/${post.frontmatter.slug}`} className="group">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base leading-snug group-hover:text-secondary transition-colors">
                      {post.frontmatter.title}
                    </CardTitle>
                    <CardDescription>{post.frontmatter.date}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.frontmatter.description || post.excerpt}
                    </p>
                    {post.frontmatter.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.frontmatter.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Layout>
  )
}

export default IndexPage

export const Head: HeadFC = () => (
  <>
    <title>Alban Petit</title>
    <meta
      name="description"
      content="Personal blog of Alban Petit — electronics, web development, and the maker world."
    />
  </>
)

export const query = graphql`
  query HomePagePosts {
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/content/posts/" } }
      sort: { frontmatter: { date: DESC } }
      limit: 6
    ) {
      nodes {
        id
        excerpt(pruneLength: 160)
        frontmatter {
          title
          date(formatString: "MMMM DD, YYYY")
          description
          tags
          slug
        }
      }
    }
  }
`
