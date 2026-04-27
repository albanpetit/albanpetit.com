import React from "react"
import { graphql, Link } from "gatsby"
import { GatsbyImage, getImage, type IGatsbyImageData } from "gatsby-plugin-image"
import type { HeadFC, PageProps } from "gatsby"
import { useTranslation, useI18next, Trans } from "gatsby-plugin-react-i18next"
import Layout from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight } from "lucide-react"
import Seo from "@/components/seo"

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
}

type IndexPageData = {
  allMarkdownRemark: {
    nodes: Post[]
  }
}

const IndexPage: React.FC<PageProps<IndexPageData>> = ({ data }) => {
  const { t } = useTranslation()
  const { language } = useI18next()

  const posts = data.allMarkdownRemark.nodes.filter(
    (p) => p.frontmatter.lang === language
  )

  const blogPath = language === "en" ? "/blog/" : "/fr/blog/"
  const aboutPath = language === "en" ? "/about/" : "/fr/about/"
  const postPath = (slug: string) =>
    language === "en" ? `/post/${slug}/` : `/fr/post/${slug}/`

  return (
    <Layout>
      {/* Hero */}
      <section className="flex flex-col gap-6 py-12 md:py-20">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src="/logo.png" alt="Alban Petit" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
              AP
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alban Petit</h1>
            <p className="text-muted-foreground">{t("home.role")}</p>
          </div>
        </div>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          <Trans i18nKey="home.description">
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
          </Trans>
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link to={blogPath}>
              {t("home.readBlog")} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={aboutPath}>{t("home.aboutMe")}</Link>
          </Button>
        </div>
      </section>

      {/* Latest posts */}
      {posts.length > 0 && (
        <section className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">{t("home.latestPosts")}</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to={blogPath}>
                {t("home.allPosts")} <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const coverImage = post.frontmatter.image
                ? getImage(post.frontmatter.image.childImageSharp.gatsbyImageData)
                : null

              return (
                <Link key={post.id} to={postPath(post.frontmatter.slug)} className="group">
                  <Card className="h-full transition-shadow hover:shadow-md overflow-hidden flex flex-col">
                    {coverImage && (
                      <div className="aspect-video w-full overflow-hidden">
                        <GatsbyImage
                          image={coverImage}
                          alt={post.frontmatter.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <CardHeader className={coverImage ? "pt-4" : undefined}>
                      <CardTitle className="text-base leading-snug group-hover:text-secondary transition-colors">
                        {post.frontmatter.title}
                      </CardTitle>
                      <CardDescription>{post.frontmatter.date}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.frontmatter.description || post.excerpt}
                      </p>
                      {post.frontmatter.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-auto">
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
              )
            })}
          </div>
        </section>
      )}
    </Layout>
  )
}

export default IndexPage

export const Head: HeadFC = () => (
  <Seo
    title="Alban Petit"
    description="Personal blog of Alban Petit — electronics, web development, and the maker world."
  />
)

export const query = graphql`
  query HomePagePosts($language: String!) {
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
          lang
          image {
            childImageSharp {
              gatsbyImageData(width: 600, height: 340, placeholder: BLURRED)
            }
          }
        }
      }
    }
  }
`
