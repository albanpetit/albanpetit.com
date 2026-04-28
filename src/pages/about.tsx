import React from "react"
import { graphql } from "gatsby"
import type { HeadFC, PageProps } from "gatsby"
import { useTranslation, useI18next } from "gatsby-plugin-react-i18next"
import Layout from "@/components/layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Twitter, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import Seo from "@/components/seo"

type AboutPageData = {
  en: { html: string; frontmatter: { title: string } } | null
  fr: { html: string; frontmatter: { title: string } } | null
}

const AboutPage: React.FC<PageProps<AboutPageData>> = ({ data }) => {
  const { t } = useTranslation()
  const { language } = useI18next()

  const content = language === "fr" ? data.fr : data.en
  const html = content?.html ?? ""

  const skills: string[] = t("about.skills", { returnObjects: true }) as string[]

  return (
    <Layout>
      <div className="mx-auto max-w-2xl flex flex-col gap-8">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar className="h-24 w-24 border-2 border-primary shrink-0">
            <AvatarImage src="/logo.png" alt="Alban Petit" />
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
              AP
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Alban Petit</h1>
              <p className="text-muted-foreground">{t("about.role")}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {skills.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="mailto:contact@albanpetit.com">
                  <Mail className="mr-1.5 h-3.5 w-3.5" /> {t("about.email")}
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://twitter.com/Padh_" target="_blank" rel="noopener noreferrer">
                  <Twitter className="mr-1.5 h-3.5 w-3.5" /> {t("about.twitter")}
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/albanpetit" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-1.5 h-3.5 w-3.5" /> {t("about.github")}
                </a>
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </Layout>
  )
}

export default AboutPage

export const Head: HeadFC<{}, { language: string }> = ({ pageContext }) => {
  const isEN = pageContext.language !== "fr"
  return (
    <Seo
      title={isEN ? "About · Alban Petit" : "À propos · Alban Petit"}
      description={isEN
        ? "About Alban Petit — developer, maker, and FabManager at La Machinerie."
        : "À propos d'Alban Petit — développeur, maker et FabManager à La Machinerie."}
      canonicalPath={isEN ? "/about/" : "/fr/about/"}
      lang={pageContext.language}
      alternatePaths={{ en: "/about/", fr: "/fr/about/" }}
    />
  )
}

export const query = graphql`
  query AboutPage($language: String!) {
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
    en: markdownRemark(frontmatter: { slug: { eq: "about" }, lang: { eq: "en" } }) {
      html
      frontmatter {
        title
      }
    }
    fr: markdownRemark(frontmatter: { slug: { eq: "about" }, lang: { eq: "fr" } }) {
      html
      frontmatter {
        title
      }
    }
  }
`
