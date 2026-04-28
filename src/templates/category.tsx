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

type CategoryPageData = {
  allMarkdownRemark: { nodes: PostCardData[] }
}

type CategoryPageContext = {
  category: string
  categorySlug: string
  language: string
}

const CategoryPage: React.FC<PageProps<CategoryPageData, CategoryPageContext>> = ({ data, pageContext }) => {
  const { t } = useTranslation()
  const { language } = useI18next()
  const { category } = pageContext
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
                <BreadcrumbPage>{category}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-bold tracking-tight">{category}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("category.subtitle", { count: posts.length })}
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

export default CategoryPage

export const Head: HeadFC<CategoryPageData, CategoryPageContext> = ({ pageContext }) => {
  const { category, categorySlug, language } = pageContext
  const isEN = language !== "fr"
  const canonical = isEN ? `/category/${categorySlug}/` : `/fr/category/${categorySlug}/`
  return (
    <Seo
      title={`${category} · Alban Petit`}
      description={isEN ? `Posts in category ${category}` : `Articles de la catégorie ${category}`}
      canonicalPath={canonical}
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
