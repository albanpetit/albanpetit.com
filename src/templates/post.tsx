import React, { useEffect, useState } from "react"
import { graphql, Link } from "gatsby"
import "katex/dist/katex.min.css"
import { GatsbyImage, getImage, getSrc, type IGatsbyImageData } from "gatsby-plugin-image"
import type { HeadFC, PageProps } from "gatsby"
import { useTranslation, useI18next } from "gatsby-plugin-react-i18next"
import Layout from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Clock, Calendar } from "lucide-react"
import Seo from "@/components/seo"
import { tagPath, categoryPath } from "@/lib/tag"
import { categoryLabel } from "@/lib/category"
import Giscus from "@/components/giscus"
import { localizedPath } from "@/lib/i18n"
import { SITE_URL } from "@/lib/site"
import { useTheme } from "@/context/theme"

// KiCanvas theme names differ from ours: "kicad" is its light scheme, "witchhazel" its dark one
const KICANVAS_THEME = { light: "kicad", dark: "witchhazel" } as const

const KicadEmbedThemeSync = () => {
  const { theme } = useTheme()

  useEffect(() => {
    for (const el of document.querySelectorAll("kicanvas-embed")) {
      el.setAttribute("theme", KICANVAS_THEME[theme])
    }
  }, [theme])

  return null
}

const MERMAID_CDN_URL = "https://cdn.jsdelivr.net/npm/mermaid@12/dist/mermaid.esm.min.mjs"

// The original source is stashed on each element before mermaid.js replaces its content with
// rendered SVG, so a later theme change can restore it and re-run the render from scratch
// (mermaid has no supported way to re-theme an already-rendered diagram in place).
const MermaidRenderer = () => {
  const { theme } = useTheme()

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("pre.mermaid"))
    if (elements.length === 0) return

    let cancelled = false

    for (const el of elements) {
      if (el.dataset.mermaidSource === undefined) el.dataset.mermaidSource = el.textContent ?? ""
      el.removeAttribute("data-processed")
      el.textContent = el.dataset.mermaidSource ?? ""
    }

    import(/* webpackIgnore: true */ MERMAID_CDN_URL).then(({ default: mermaid }) => {
      if (cancelled) return
      mermaid.initialize({ startOnLoad: false, theme: theme === "dark" ? "dark" : "default" })
      mermaid.run({ nodes: elements })
    })

    return () => {
      cancelled = true
    }
  }, [theme])

  return null
}

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const total = scrollHeight - clientHeight
      setProgress(total > 0 ? (scrollTop / total) * 100 : 0)
    }
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent">
      <div className="h-full bg-primary transition-all duration-75 ease-out" style={{ width: `${progress}%` }} />
    </div>
  )
}

type Heading = { value: string; depth: number; id: string }

type PostTemplateData = {
  markdownRemark: {
    html: string
    timeToRead: number
    headings: Heading[]
    frontmatter: {
      title: string
      date: string
      displayDate: string
      lastmod: string | null
      description: string | null
      tags: string[] | null
      category: string | null
      lang: string
      slug: string
      image: {
        childImageSharp: { gatsbyImageData: IGatsbyImageData; og: IGatsbyImageData }
      } | null
    }
  }
}

type PostPageContext = {
  hasTranslation: boolean
}

const TableOfContents = ({ headings, title }: { headings: Heading[]; title: string }) => {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: "-80px 0% -70% 0%" }
    )
    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  const visible = headings.filter((h) => h.depth <= 3)
  if (visible.length < 2) return null

  return (
    <nav className="sticky top-20 rounded-xl border bg-card p-4 text-sm" aria-label={title}>
      <p className="font-semibold mb-3 text-foreground">{title}</p>
      <ul className="flex flex-col gap-1.5">
        {visible.map((h) => (
          <li key={h.id} style={{ paddingLeft: h.depth === 3 ? "0.75rem" : undefined }}>
            <a
              href={`#${h.id}`}
              className={`block leading-snug transition-colors hover:text-foreground ${
                activeId === h.id ? "text-link font-medium" : "text-muted-foreground"
              }`}
            >
              {h.value}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

const PostTemplate: React.FC<PageProps<PostTemplateData, PostPageContext>> = ({ data, pageContext }) => {
  const { t } = useTranslation()
  const { language } = useI18next()
  const { html, timeToRead, headings, frontmatter } = data.markdownRemark
  const coverImage = frontmatter.image ? getImage(frontmatter.image.childImageSharp.gatsbyImageData) : null

  const blogPath = localizedPath("/blog/", language)
  const hasToc = headings.filter((h) => h.depth <= 3).length >= 2
  const hasKicadEmbed = html.includes("<kicanvas-embed")
  const hasMermaid = html.includes('class="mermaid"')
  const content = html
    // Code blocks scroll horizontally on small screens: make them reachable with the keyboard
    .replace(/<pre class="/g, '<pre tabindex="0" class="')
    // Paragraphs with several images are laid out as a grid (globals.css): ask for thumbnail-sized sources
    .split("</p>")
    .map((chunk) =>
      (chunk.match(/gatsby-resp-image-wrapper/g) ?? []).length > 1
        ? chunk.replace(/sizes="\(max-width: 800px\) 100vw, 800px"/g, 'sizes="(max-width: 640px) 100vw, 380px"')
        : chunk
    )
    .join("</p>")

  return (
    <Layout alternatePath={pageContext.hasTranslation ? undefined : "/blog/"}>
      <ReadingProgress />
      <div className={`mx-auto ${hasToc ? "max-w-5xl" : "max-w-2xl"}`}>
        <Breadcrumb className="mb-6" aria-label={t("a11y.breadcrumb")}>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={localizedPath("/", language)}>{t("breadcrumb.home")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={blogPath}>{t("nav.blog")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-xs truncate">{frontmatter.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className={hasToc ? "grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-10 items-start" : undefined}>
          {hasToc && (
            // Sidebar on large screens only: in the single-column layout it pushed the title ~400px down
            <div className="hidden lg:block lg:order-2">
              <TableOfContents headings={headings} title={t("post.toc")} />
            </div>
          )}
          <article className={hasToc ? "lg:order-1" : undefined}>
            <header className="flex flex-col gap-5 mb-10">
              <div className="flex items-center gap-2 flex-wrap">
                {frontmatter.category && (
                  <Link to={categoryPath(frontmatter.category, language)}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-accent transition-colors">
                      {categoryLabel(frontmatter.category, language)}
                    </Badge>
                  </Link>
                )}
                <div className="flex items-center gap-3 text-sm text-muted-foreground ml-auto">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {frontmatter.displayDate}
                  </span>
                  {timeToRead && (
                    <>
                      <span className="text-border">·</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {t("post.minRead", { count: timeToRead })}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight">{frontmatter.title}</h1>

              {frontmatter.description && (
                <p className="text-lg text-muted-foreground leading-relaxed border-l-2 border-primary pl-4">
                  {frontmatter.description}
                </p>
              )}

              {frontmatter.tags && frontmatter.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {frontmatter.tags.map((tag) => (
                    <Link key={tag} to={tagPath(tag, language)}>
                      <Badge
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-accent transition-colors rounded-full"
                      >
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </header>

            {coverImage && (
              <div className="mb-8 overflow-hidden rounded-lg">
                <GatsbyImage image={coverImage} alt={frontmatter.title} className="w-full aspect-video object-cover" />
              </div>
            )}

            <Separator className="mb-8" />

            <div
              className="prose prose-neutral dark:prose-invert max-w-none"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML generated at build time from our own Markdown
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {hasKicadEmbed && (
              <>
                <script type="module" src="https://kicanvas.org/kicanvas/kicanvas.js" />
                <KicadEmbedThemeSync />
              </>
            )}
            {hasMermaid && <MermaidRenderer />}

            <Separator className="my-12" />
            <Giscus />
          </article>
        </div>
      </div>
    </Layout>
  )
}

export default PostTemplate

export const Head: HeadFC<PostTemplateData, PostPageContext> = ({ data, pageContext }) => {
  const { title, description, image, date, lastmod, lang, slug } = data.markdownRemark.frontmatter
  const canonicalPath = localizedPath(`/post/${slug}/`, lang)
  const ogImage = image ? getSrc(image.childImageSharp.og) : undefined

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: lang === "en" ? "Home" : "Accueil",
        item: `${SITE_URL}${localizedPath("/", lang)}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: lang === "en" ? "Blog" : "Articles",
        item: `${SITE_URL}${localizedPath("/blog/", lang)}`,
      },
      { "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}${canonicalPath}` },
    ],
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: ogImage ? `${SITE_URL}${ogImage}` : undefined,
    author: {
      "@type": "Person",
      name: "Alban Petit",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: "Alban Petit",
    },
    datePublished: date,
    dateModified: lastmod || date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${canonicalPath}`,
    },
  }

  return (
    <Seo
      title={`${title} · Alban Petit`}
      description={description ?? undefined}
      image={ogImage}
      type="article"
      publishedAt={date}
      updatedAt={lastmod || date}
      canonicalPath={canonicalPath}
      lang={lang}
      alternatePaths={pageContext.hasTranslation ? { en: `/post/${slug}/`, fr: `/fr/post/${slug}/` } : undefined}
      structuredData={[breadcrumbData, structuredData]}
    />
  )
}

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
      headings {
        value
        depth
        id
      }
      frontmatter {
        title
        date
        displayDate: date(formatString: "LL", locale: $language)
        lastmod
        description
        tags
        category
        lang
        slug
        image {
          childImageSharp {
            gatsbyImageData(width: 800, placeholder: BLURRED)
            og: gatsbyImageData(width: 1200, height: 630, layout: FIXED, formats: [JPG], placeholder: NONE)
          }
        }
      }
    }
  }
`
