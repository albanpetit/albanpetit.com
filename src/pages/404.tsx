import React from "react"
import type { HeadFC, PageProps } from "gatsby"
import { graphql, Link } from "gatsby"
import { useTranslation, useI18next } from "gatsby-plugin-react-i18next"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Seo from "@/components/seo"

const NotFoundPage: React.FC<PageProps> = () => {
  const { t } = useTranslation()
  const { language } = useI18next()
  const homePath = language === "en" ? "/" : "/fr/"

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center gap-8 py-24 text-center">
        <div className="relative select-none">
          <span className="text-[10rem] md:text-[14rem] font-black leading-none text-primary/20 dark:text-primary/10 tracking-tighter">
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-[10rem] md:text-[14rem] font-black leading-none text-primary/60 tracking-tighter blur-sm">
            404
          </span>
        </div>
        <div className="flex flex-col gap-3 -mt-8">
          <h1 className="text-2xl font-bold tracking-tight">{t("404.subtitle")}</h1>
          <p className="text-muted-foreground max-w-sm">{t("404.description")}</p>
        </div>
        <Button asChild size="lg">
          <Link to={homePath}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("404.backHome")}
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
