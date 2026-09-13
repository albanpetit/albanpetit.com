import React from "react"
import { graphql, Link } from "gatsby"
import type { HeadFC, PageProps } from "gatsby"
import { useTranslation, useI18next } from "gatsby-plugin-react-i18next"
import Layout from "@/components/layout"
import { Separator } from "@/components/ui/separator"
import Seo from "@/components/seo"
import PostCard, { type PostCardData } from "@/components/PostCard"
import { categoryLabel } from "@/lib/category"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type CategoryPageData = {
  allMarkdownRemark: { nodes: PostCardData[] }
}

type CategoryPageContext = {
  category: string
  categorySlug: string
  hasAlternate: boolean
  language: string
}

const CategoryPage: React.FC<PageProps<CategoryPageData, CategoryPageContext>> = ({ data, pageContext }) => {
  const { t } = useTranslation()
  const { language } = useI18next()
  const { category, hasAlternate } = pageContext
  const label = categoryLabel(category, language)
  const posts = data.allMarkdownRemark.nodes

  const blogPath = language === "en" ? "/blog/" : "/fr/blog/"
  const homePath = language === "en" ? "/" : "/fr/"

  return (
    <Layout alternatePath={hasAlternate ? undefined : "/blog/"}>
      <div className="flex flex-col gap-8">
        <div>
          <Breadcrumb className="mb-4" aria-label={t("a11y.breadcrumb")}>
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
                <BreadcrumbPage>{label}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-bold tracking-tight">{label}</h1>
          <p className="mt-2 text-muted-foreground">{t("category.subtitle", { count: posts.length })}</p>
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

export default CategoryPage

export const Head: HeadFC<CategoryPageData, CategoryPageContext> = ({ pageContext }) => {
  const { category, categorySlug, hasAlternate, language } = pageContext
  const isEN = language !== "fr"
  const label = categoryLabel(category, language)
  const canonical = isEN ? `/category/${categorySlug}/` : `/fr/category/${categorySlug}/`
  return (
    <Seo
      title={`${label} · Alban Petit`}
      description={isEN ? `Posts in category ${label}` : `Articles de la catégorie ${label}`}
      canonicalPath={canonical}
      alternatePaths={
        hasAlternate ? { en: `/category/${categorySlug}/`, fr: `/fr/category/${categorySlug}/` } : undefined
      }
      lang={language}
    />
  )
}

export const query = graphql`
  query CategoryPage($category: String!, $language: String!) {
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node { ns data language }
      }
    }
    allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "/content/posts/" }
        frontmatter: { category: { eq: $category }, lang: { eq: $language } }
      }
      sort: { frontmatter: { date: DESC } }
    ) {
      nodes {
        id
        timeToRead
        excerpt(pruneLength: 160)
        frontmatter {
          title
          date(formatString: "LL", locale: $language)
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
