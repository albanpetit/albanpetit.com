import React, { useEffect, useState } from "react"
import { graphql, Link } from "gatsby"
import { GatsbyImage, getImage, type IGatsbyImageData } from "gatsby-plugin-image"
import type { HeadFC, PageProps } from "gatsby"
import { useTranslation, useI18next } from "gatsby-plugin-react-i18next"
import Layout from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Clock, Calendar } from "lucide-react"
import Seo from "@/components/seo"
import { tagPath, categoryPath } from "@/lib/tag"
import Giscus from "@/components/giscus"

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
      <div
        className="h-full bg-primary transition-all duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
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
      lastmod: string
      description: string
      tags: string[]
      category: string
      lang: string
      slug: string
      image: {
        publicURL: string
        childImageSharp: { gatsbyImageData: IGatsbyImageData }
      } | null
    }
  }
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
    <nav className="sticky top-20 rounded-xl border bg-card p-4 text-sm">
      <p className="font-semibold mb-3 text-foreground">{title}</p>
      <ul className="flex flex-col gap-1.5">
        {visible.map((h) => (
          <li
            key={h.id}
            style={{ paddingLeft: h.depth === 3 ? "0.75rem" : undefined }}
          >
            <a
              href={`#${h.id}`}
              className={`block leading-snug transition-colors hover:text-foreground ${
                activeId === h.id
                  ? "text-secondary font-medium"
                  : "text-muted-foreground"
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

const PostTemplate: React.FC<PageProps<PostTemplateData>> = ({ data }) => {
  const { t } = useTranslation()
  const { language } = useI18next()
  const { html, timeToRead, headings, frontmatter } = data.markdownRemark
  const coverImage = frontmatter.image ? getImage(frontmatter.image.childImageSharp.gatsbyImageData) : null
  const displayDate = new Date(frontmatter.date).toLocaleDateString(
    language === "fr" ? "fr-FR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  )

  const blogPath = language === "en" ? "/blog/" : "/fr/blog/"
  const hasToc = headings.filter((h) => h.depth <= 3).length >= 2

  return (
    <Layout>
      <ReadingProgress />
      <div className={`mx-auto ${hasToc ? "max-w-5xl" : "max-w-2xl"}`}>

        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={language === "en" ? "/" : "/fr/"}>{t("breadcrumb.home")}</Link>
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
              <BreadcrumbPage className="max-w-xs truncate">
                {frontmatter.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className={hasToc ? "grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-10 items-start" : undefined}>
          <article>
            <header className="flex flex-col gap-4 mb-8">
              {frontmatter.category && (
                <Link to={categoryPath(frontmatter.category, language)} className="w-fit">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-accent transition-colors">
                    {frontmatter.category}
                  </Badge>
                </Link>
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
                  {displayDate}
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

            <Separator className="my-12" />
            <Giscus />
          </article>

          {hasToc && (
            <TableOfContents
              headings={headings}
              title={t("post.toc")}
            />
          )}
        </div>
      </div>
    </Layout>
  )
}

export default PostTemplate

export const Head: HeadFC<PostTemplateData> = ({ data, location }) => {
  const { title, description, image, date, lastmod, lang, slug } = data.markdownRemark.frontmatter
  const canonicalPath = lang === "en" ? `/post/${slug}/` : `/fr/post/${slug}/`

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `https://albanpetit.com${lang === "en" ? "/" : "/fr/"}` },
      { "@type": "ListItem", position: 2, name: lang === "en" ? "Blog" : "Articles", item: `https://albanpetit.com${lang === "en" ? "/blog/" : "/fr/blog/"}` },
      { "@type": "ListItem", position: 3, name: title, item: `https://albanpetit.com${canonicalPath}` },
    ],
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: image?.publicURL ? `https://albanpetit.com${image.publicURL}` : undefined,
    author: {
      "@type": "Person",
      name: "Alban Petit",
      url: "https://albanpetit.com",
    },
    publisher: {
      "@type": "Person",
      name: "Alban Petit",
    },
    datePublished: date,
    dateModified: lastmod || date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://albanpetit.com${canonicalPath}`,
    },
  }

  return (
    <Seo
      title={`${title} · Alban Petit`}
      description={description}
      image={image?.publicURL}
      type="article"
      publishedAt={date}
      updatedAt={lastmod || date}
      canonicalPath={canonicalPath}
      lang={lang}
      alternatePaths={{ en: `/post/${slug}/`, fr: `/fr/post/${slug}/` }}
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
        lastmod
        description
        tags
        category
        lang
        slug
        image {
          publicURL
          childImageSharp {
            gatsbyImageData(width: 800, placeholder: BLURRED)
          }
        }
      }
    }
  }
`
