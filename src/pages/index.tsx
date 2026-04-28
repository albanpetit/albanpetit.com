import React, { useState, useMemo } from "react"
import { graphql, Link, navigate } from "gatsby"
import type { HeadFC, PageProps } from "gatsby"
import { useTranslation, useI18next, Trans } from "gatsby-plugin-react-i18next"
import Layout from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Search, MapPin, Cpu, Printer } from "lucide-react"
import Seo from "@/components/seo"
import { tagPath, categoryPath } from "@/lib/tag"
import PostCard, { type PostCardData } from "@/components/PostCard"

type IndexPageData = {
  allMarkdownRemark: { nodes: PostCardData[] }
}

const IndexPage: React.FC<PageProps<IndexPageData>> = ({ data }) => {
  const { t } = useTranslation()
  const { language } = useI18next()
  const [searchQuery, setSearchQuery] = useState("")

  const posts = useMemo(
    () => data.allMarkdownRemark.nodes.filter((p) => p.frontmatter.lang === language),
    [data, language]
  )

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.frontmatter.tags ?? []))).sort(),
    [posts]
  )

  const allCategories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.frontmatter.category).filter(Boolean))).sort(),
    [posts]
  )

  const blogPath = language === "en" ? "/blog/" : "/fr/blog/"
  const aboutPath = language === "en" ? "/about/" : "/fr/about/"
  const searchPath = language === "en" ? "/search/" : "/fr/search/"

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`${searchPath}?q=${encodeURIComponent(searchQuery.trim())}`)
    else navigate(searchPath)
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative grid grid-cols-1 md:grid-cols-2 gap-12 py-12 md:py-20 items-center overflow-hidden">

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl -z-10" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-secondary/10 blur-3xl -z-10" />

        <div className="flex flex-col gap-5">

          {/* Name + accent */}
          <div className="border-l-4 border-primary pl-4">
            <h1 className="text-4xl font-bold tracking-tight">{t("home.name")}</h1>
            <p className="mt-1 text-muted-foreground">{t("home.role")}</p>
          </div>

          {/* Description */}
          <p className="text-base text-muted-foreground leading-relaxed">
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

          {/* Info card */}
          <div className="rounded-xl border bg-card p-4 flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span>{t("home.location")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cpu className="h-4 w-4 shrink-0 text-primary" />
              <a
                href="https://lamachinerie.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                {t("home.fablab")}
              </a>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-primary fill-current"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              <a
                href="https://github.com/albanpetit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                github.com/albanpetit
              </a>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Printer className="h-4 w-4 shrink-0 text-primary" />
              <a
                href="https://makerworld.com/en/@albanpetit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                makerworld.com/@albanpetit
              </a>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {(t("home.skills", { returnObjects: true }) as string[]).map((skill) => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>

          {/* Social + CTA */}
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to={blogPath}>
                {t("home.readBlog")} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={aboutPath}>{t("home.aboutMe")}</Link>
            </Button>
            <a href="https://github.com/albanpetit" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" aria-label="GitHub">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              </Button>
            </a>
            <a href="https://twitter.com/Padh_" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" aria-label="Twitter / X">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </Button>
            </a>
          </div>
        </div>

        {/* Photo */}
        <div className="flex justify-center md:justify-end pb-3 pr-3">
          <div className="relative w-64 h-80 md:w-72 md:h-96">
            {/* Decorative offset square */}
            <div className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl bg-primary/30" />
            <img
              src="https://github.com/albanpetit.png"
              alt="Alban Petit"
              className="relative w-full h-full object-cover rounded-2xl shadow-lg"
            />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10" />
          </div>
        </div>
      </section>

      {/* Main content + sidebar */}
      {posts.length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 py-8">

          {/* Latest posts — 2/3 */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">{t("home.latestPosts")}</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to={blogPath}>
                  {t("home.allPosts")} <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {posts.slice(0, 5).map((post) => (
                <PostCard key={post.id} post={post} language={language} thumbnailWidth="sm:w-40" />
              ))}
            </div>
          </div>

          {/* Sidebar — 1/3 */}
          <aside className="flex flex-col gap-6">

            {/* Search */}
            <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("search.title")}
              </h3>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search.placeholder") ?? ""}
                  className="pl-9 h-9"
                />
              </form>
            </div>

            {/* Categories */}
            {allCategories.length > 0 && (
              <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("home.categories")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((cat) => (
                    <Link key={cat} to={categoryPath(cat, language)}>
                      <Badge variant="outline" className="cursor-pointer hover:border-primary/50 transition-colors">
                        {cat}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {allTags.length > 0 && (
              <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t("home.tags")}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => (
                    <Link key={tag} to={tagPath(tag, language)}>
                      <Badge variant="secondary" className="cursor-pointer hover:bg-accent transition-colors text-xs">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </aside>
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
    canonicalPath="/"
    structuredData={{
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Alban Petit",
      url: "https://albanpetit.com",
      author: { "@type": "Person", name: "Alban Petit" },
      description: "Personal blog about electronics, web development, and the maker world.",
    }}
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
