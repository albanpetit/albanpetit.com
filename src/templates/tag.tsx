import React from "react"
import { graphql, Link } from "gatsby"
import type { HeadFC, PageProps } from "gatsby"
import { useTranslation, useI18next } from "gatsby-plugin-react-i18next"
import Layout from "@/components/layout"
import { Separator } from "@/components/ui/separator"
import Seo from "@/components/seo"
import PostCard, { type PostCardData } from "@/components/PostCard"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type TagPageData = {
  allMarkdownRemark: { nodes: PostCardData[] }
}

type TagPageContext = {
  tag: string
  tagSlug: string
  language: string
}

const TagPage: React.FC<PageProps<TagPageData, TagPageContext>> = ({ data, pageContext }) => {
  const { t } = useTranslation()
  const { language } = useI18next()
  const { tag } = pageContext
  const posts = data.allMarkdownRemark.nodes

  const blogPath = language === "en" ? "/blog/" : "/fr/blog/"
  const homePath = language === "en" ? "/" : "/fr/"

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div>
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={homePath}>{t("breadcrumb.home")}</Link>
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
                <BreadcrumbPage>{t("tag.title", { tag })}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-bold tracking-tight">{t("tag.title", { tag })}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("tag.subtitle", { count: posts.length })}
          </p>
        </div>

        <Separator />

        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} language={language} />
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default TagPage

export const Head: HeadFC<TagPageData, TagPageContext> = ({ pageContext }) => {
  const { tag, tagSlug, language } = pageContext
  const isEN = language !== "fr"
  const canonical = isEN ? `/tag/${tagSlug}/` : `/fr/tag/${tagSlug}/`
  return (
    <Seo
      title={`#${tag} · Alban Petit`}
      description={isEN ? `Posts tagged with ${tag}` : `Articles tagués ${tag}`}
      canonicalPath={canonical}
      lang={language}
    />
  )
}

export const query = graphql`
  query TagPage($tag: String!, $language: String!) {
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node { ns data language }
      }
    }
    allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "/content/posts/" }
        frontmatter: { tags: { in: [$tag] }, lang: { eq: $language } }
      }
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
