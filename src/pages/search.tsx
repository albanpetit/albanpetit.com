import React, { useState, useMemo, useEffect } from "react"
import { graphql, navigate } from "gatsby"
import type { HeadFC, PageProps } from "gatsby"
import { useTranslation, useI18next } from "gatsby-plugin-react-i18next"
import Fuse from "fuse.js"
import Layout from "@/components/layout"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Search } from "lucide-react"
import Seo from "@/components/seo"
import PostCard, { type PostCardData } from "@/components/PostCard"

type SearchPageData = {
  allMarkdownRemark: { nodes: PostCardData[] }
}

const SearchPage: React.FC<PageProps<SearchPageData>> = ({ data, location }) => {
  const { t } = useTranslation()
  const { language } = useI18next()

  const initialQuery = new URLSearchParams(location.search).get("q") ?? ""
  const [query, setQuery] = useState(initialQuery)

  const posts = useMemo(
    () => data.allMarkdownRemark.nodes.filter((p) => p.frontmatter.lang === language),
    [data, language]
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
    const current = new URLSearchParams(location.search).get("q") ?? ""
    if (query !== current) {
      navigate(query ? `?q=${encodeURIComponent(query)}` : location.pathname, { replace: true })
    }
  }, [query])

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("search.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("search.subtitle")}</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <label htmlFor="search-input" className="sr-only">{t("search.title")}</label>
          <Input
            id="search-input"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder") ?? ""}
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
          {results.map((post) => (
            <PostCard key={post.id} post={post} language={language} />
          ))}
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
        node { ns data language }
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
