import React from "react"
import type { HeadFC, PageProps } from "gatsby"
import { graphql, Link } from "gatsby"
import { useTranslation, useI18next } from "gatsby-plugin-react-i18next"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, SearchX } from "lucide-react"
import Seo from "@/components/seo"

const NotFoundPage: React.FC<PageProps> = () => {
  const { t } = useTranslation()
  const { language } = useI18next()
  const homePath = language === "en" ? "/" : "/fr/"

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <SearchX className="h-16 w-16 text-muted-foreground" />
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">{t("404.title")}</h1>
          <p className="text-xl text-muted-foreground">{t("404.subtitle")}</p>
          <p className="text-sm text-muted-foreground max-w-sm">{t("404.description")}</p>
        </div>
        <Button asChild>
          <Link to={homePath}>
            <ArrowLeft className="mr-1 h-4 w-4" /> {t("404.backHome")}
          </Link>
        </Button>
      </div>
    </Layout>
  )
}

export default NotFoundPage

export const Head: HeadFC = () => <Seo title="404 · Alban Petit" noindex />

export const query = graphql`
  query NotFoundPage($language: String!) {
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
  }
`
