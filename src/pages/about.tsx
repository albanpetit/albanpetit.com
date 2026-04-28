import React from "react"
import { graphql } from "gatsby"
import type { HeadFC, PageProps } from "gatsby"
import { useTranslation, useI18next } from "gatsby-plugin-react-i18next"
import Layout from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Mail, MapPin, Cpu, Printer } from "lucide-react"
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

  const stats = language === "fr"
    ? [
        { value: "10+", label: "ans d'expérience en ingénierie" },
        { value: "5+", label: "articles publiés" },
        { value: "2000+", label: "heures d'impression 3D" },
      ]
    : [
        { value: "10+", label: "years of engineering experience" },
        { value: "5+", label: "posts published" },
        { value: "2000+", label: "hours of 3D printing" },
      ]

  return (
    <Layout>
      <div className="mx-auto max-w-3xl flex flex-col gap-10">

        {/* Hero */}
        <section className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center pt-4">
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/15 blur-3xl -z-10" />

          <div className="flex flex-col gap-5">
            <div className="border-l-4 border-primary pl-4">
              <h1 className="text-3xl font-bold tracking-tight">Alban Petit</h1>
              <p className="mt-1 text-muted-foreground">{t("about.role")}</p>
            </div>

            <div className="rounded-xl border bg-card p-4 flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>{t("home.location")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Cpu className="h-4 w-4 shrink-0 text-primary" />
                <a href="https://lamachinerie.org" target="_blank" rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors">
                  {t("home.fablab")}
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-primary fill-current">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <a href="https://github.com/albanpetit" target="_blank" rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors">
                  github.com/albanpetit
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Printer className="h-4 w-4 shrink-0 text-primary" />
                <a href="https://makerworld.com/en/@albanpetit" target="_blank" rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors">
                  makerworld.com/@albanpetit
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="mailto:contact@albanpetit.com">
                  <Mail className="mr-1.5 h-3.5 w-3.5" /> {t("about.email")}
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://twitter.com/Padh_" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" className="mr-1.5 h-3.5 w-3.5 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  {t("about.twitter")}
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/albanpetit" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" className="mr-1.5 h-3.5 w-3.5 fill-current">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  {t("about.github")}
                </a>
              </Button>
            </div>
          </div>

          {/* Photo */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-56 h-72 md:w-64 md:h-80">
              <div className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl bg-primary/30" />
              <img
                src="https://github.com/albanpetit.png"
                alt="Alban Petit"
                className="relative w-full h-full object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Markdown content */}
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
      frontmatter { title }
    }
    fr: markdownRemark(frontmatter: { slug: { eq: "about" }, lang: { eq: "fr" } }) {
      html
      frontmatter { title }
    }
  }
`
