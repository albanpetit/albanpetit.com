import React, { useState, useMemo, useEffect } from "react"
import { graphql, Link, navigate } from "gatsby"
import { GatsbyImage, getImage, type IGatsbyImageData } from "gatsby-plugin-image"
import type { HeadFC, PageProps } from "gatsby"
import { useTranslation, useI18next } from "gatsby-plugin-react-i18next"
import Fuse from "fuse.js"
import Layout from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Search } from "lucide-react"
import Seo from "@/components/seo"
import { tagPath, categoryPath } from "@/lib/tag"

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
    image: { childImageSharp: { gatsbyImageData: IGatsbyImageData } } | null
  }
  excerpt: string
}

type SearchPageData = {
  allMarkdownRemark: { nodes: Post[] }
}

const SearchPage: React.FC<PageProps<SearchPageData>> = ({ data, location }) => {
  const { t } = useTranslation()
  const { language } = useI18next()

  const initialQuery = new URLSearchParams(location.search).get("q") ?? ""
  const [query, setQuery] = useState(initialQuery)

  const posts = data.allMarkdownRemark.nodes.filter(
    (p) => p.frontmatter.lang === language
  )

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: [
          { name: "frontmatter.title", weight: 3 },
          { name: "frontmatter.description", weight: 2 },
          { name: "frontmatter.tags", weight: 2 },
          { name: "frontmatter.category", weight: 1 },
          { name: "excerpt", weight: 1 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [posts]
  )

  const results = useMemo(
    () => (query.trim() ? fuse.search(query).map((r) => r.item) : []),
    [query, fuse]
  )

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const current = params.get("q") ?? ""
    if (query !== current) {
      const next = query ? `?q=${encodeURIComponent(query)}` : location.pathname
      navigate(next, { replace: true })
    }
  }, [query])

  const postPath = (slug: string) =>
    language === "en" ? `/post/${slug}/` : `/fr/post/${slug}/`

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("search.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("search.subtitle")}</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="pl-9 text-base"
          />
        </div>

        {query.trim() && (
          <>
            <p className="text-sm text-muted-foreground">
              {t("search.results", { count: results.length, query })}
            </p>
            <Separator />
          </>
        )}

        <div className="flex flex-col gap-4">
          {results.map((post) => {
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
                      {post.frontmatter.category && (
                        <Link to={categoryPath(post.frontmatter.category, language)} onClick={(e) => e.stopPropagation()}>
                          <Badge variant="outline" className="text-xs w-fit cursor-pointer hover:bg-accent transition-colors">
                            {post.frontmatter.category}
                          </Badge>
                        </Link>
                      )}
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.frontmatter.description || post.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {post.frontmatter.tags?.map((tag) => (
                          <Link key={tag} to={tagPath(tag, language)} onClick={(e) => e.stopPropagation()}>
                            <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-accent transition-colors">
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

          {query.trim() && results.length === 0 && (
            <p className="text-muted-foreground py-8 text-center">{t("search.empty")}</p>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default SearchPage

export const Head: HeadFC<{}, { language: string }> = ({ pageContext }) => {
  const isEN = pageContext.language !== "fr"
  return (
    <Seo
      title={isEN ? "Search · Alban Petit" : "Recherche · Alban Petit"}
      description={isEN ? "Search posts on albanpetit.com" : "Rechercher des articles sur albanpetit.com"}
      noindex
    />
  )
}

export const query = graphql`
  query SearchPage($language: String!) {
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
        excerpt(pruneLength: 200)
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
