import React from "react"
import { graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import type { HeadFC, PageProps } from "gatsby"
import { useTranslation, useI18next } from "gatsby-plugin-react-i18next"
import Layout from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Mail, MapPin, Cpu, Printer } from "lucide-react"
import Seo from "@/components/seo"
import { localizedPath } from "@/lib/i18n"
import { GithubIcon, XIcon } from "@/components/icons"
import { GITHUB_URL, TWITTER_URL, MAKERWORLD_URL } from "@/lib/site"

type AboutPageData = {
  en: { html: string; frontmatter: { title: string } } | null
  fr: { html: string; frontmatter: { title: string } } | null
  posts: { totalCount: number }
}

const AboutPage: React.FC<PageProps<AboutPageData>> = ({ data }) => {
  const { t } = useTranslation()
  const { language } = useI18next()

  const content = language === "fr" ? data.fr : data.en
  const html = content?.html ?? ""
  const skills: string[] = t("about.skills", { returnObjects: true }) as string[]

  const postCount = data.posts.totalCount
  const stats = [
    { value: "10+", label: t("about.stats.experience") },
    { value: String(postCount), label: t("about.stats.posts", { count: postCount }) },
    { value: "2000+", label: t("about.stats.printing") },
  ]

  return (
    <Layout>
      <div className="mx-auto max-w-3xl flex flex-col gap-10">
        {/* Hero */}
        <section className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center pt-4 overflow-hidden">
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
                <GithubIcon className="h-4 w-4 shrink-0 text-primary" />
                <a
                  href={GITHUB_URL}
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
                  href={MAKERWORLD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  makerworld.com/@albanpetit
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="mailto:contact@albanpetit.com">
                  <Mail className="mr-1.5 h-3.5 w-3.5" /> {t("about.email")}
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer">
                  <XIcon className="mr-1.5 h-3.5 w-3.5" />
                  {t("about.twitter")}
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  <GithubIcon className="mr-1.5 h-3.5 w-3.5" />
                  {t("about.github")}
                </a>
              </Button>
            </div>
          </div>

          {/* Photo */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-56 h-72 md:w-64 md:h-80">
              <div className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl bg-primary/30" />
              <StaticImage
                src="../images/avatar.jpg"
                alt="Alban Petit"
                width={368}
                aspectRatio={0.8}
                placeholder="blurred"
                className="relative w-full h-full rounded-2xl shadow-lg"
                imgClassName="rounded-2xl"
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-amber-700 dark:text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Markdown content */}
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML generated at build time from our own Markdown
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </Layout>
  )
}

export default AboutPage

export const Head: HeadFC<object, { language: string }> = ({ pageContext }) => {
  const isEN = pageContext.language !== "fr"
  return (
    <Seo
      title={isEN ? "About · Alban Petit" : "À propos · Alban Petit"}
      description={
        isEN
          ? "About Alban Petit — developer, maker, and FabManager at La Machinerie."
          : "À propos d'Alban Petit — développeur, maker et FabManager à La Machinerie."
      }
      canonicalPath={localizedPath("/about/", pageContext.language)}
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
    posts: allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/content/posts/" }, frontmatter: { lang: { eq: $language } } }
    ) {
      totalCount
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
