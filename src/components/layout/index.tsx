import React from "react"
import { Link } from "gatsby"
import { Moon, Sun, Menu, Search, Rss } from "lucide-react"
import { useTranslation, useI18next } from "gatsby-plugin-react-i18next"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "@/context/theme"
import { localizedPath } from "@/lib/i18n"
import { GITHUB_URL, TWITTER_URL } from "@/lib/site"

// Driven by the .dark class set before first paint, so the static HTML already shows the right icon
const ThemeIcon = () => (
  <>
    <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
    <Moon className="h-4 w-4 dark:hidden" aria-hidden="true" />
  </>
)

interface LayoutProps {
  children: React.ReactNode
  /** Path of this page in the other language, without language prefix. Defaults to the current path. */
  alternatePath?: string
}

const Layout = ({ children, alternatePath }: LayoutProps) => {
  const { toggle } = useTheme()
  const { t } = useTranslation()
  const { language, originalPath } = useI18next()

  const homePath = localizedPath("/", language)
  const searchPath = localizedPath("/search/", language)
  const rssPath = localizedPath("/rss.xml", language)
  const otherLang = language === "en" ? "fr" : "en"
  // A real link: works before hydration and without JavaScript, and crawlers can follow it
  const switchPath = localizedPath(alternatePath ?? originalPath, otherLang)

  const navLinks = [
    { to: localizedPath("/blog/", language), label: t("nav.blog") },
    { to: localizedPath("/about/", language), label: t("nav.about") },
  ]

  return (
    <div className="min-h-screen font-sans antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {t("a11y.skipToContent")}
      </a>
      <div
        className="pointer-events-none fixed top-0 left-0 right-0 h-96 -z-10"
        style={{
          background: "linear-gradient(to bottom, hsl(49 93% 66% / 0.06), hsl(49 93% 66% / 0.02) 50%, transparent)",
        }}
      />

      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link to={homePath} className="flex items-center gap-2 font-bold tracking-tight">
            <img src="/logo.svg" alt="" width={28} height={28} className="h-7 w-7" />
            <span>
              albanpetit<span className="text-muted-foreground font-normal">.com</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm" aria-label={t("a11y.mainNav")}>
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className="text-muted-foreground transition-colors hover:text-foreground">
                {label}
              </Link>
            ))}
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground uppercase font-medium">
              <Link
                to={switchPath}
                lang={otherLang}
                hrefLang={otherLang}
                aria-label={otherLang === "fr" ? "Français" : "English"}
              >
                {otherLang}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to={searchPath} aria-label={t("search.title")}>
                <Search className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label={t("a11y.toggleTheme")}>
              <ThemeIcon />
            </Button>
          </nav>

          {/* Mobile nav */}
          <div className="flex items-center gap-1 md:hidden">
            <Button variant="ghost" size="icon" asChild>
              <Link to={searchPath} aria-label={t("search.title")}>
                <Search className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground uppercase font-medium text-xs">
              <Link
                to={switchPath}
                lang={otherLang}
                hrefLang={otherLang}
                aria-label={otherLang === "fr" ? "Français" : "English"}
              >
                {otherLang}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label={t("a11y.toggleTheme")}>
              <ThemeIcon />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t("a11y.openMenu")}>
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-56" closeLabel={t("a11y.close")} aria-describedby={undefined}>
                <SheetTitle className="sr-only">{t("a11y.menu")}</SheetTitle>
                <nav className="flex flex-col gap-4 pt-8 text-sm" aria-label={t("a11y.mobileNav")}>
                  {navLinks.map(({ to, label }) => (
                    <Link key={to} to={to} className="text-muted-foreground transition-colors hover:text-foreground">
                      {label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="container py-10 focus:outline-none">
        {children}
      </main>

      <Separator />
      <footer className="container flex h-14 items-center justify-center gap-1 text-sm text-muted-foreground">
        <span>{t("footer.copyright", { year: __BUILD_YEAR__ })}</span>
        <span>·</span>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          GitHub
        </a>
        <span>·</span>
        <a
          href={TWITTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Twitter
        </a>
        <span>·</span>
        <a
          href={rssPath}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-orange-500 transition-colors"
          aria-label={t("a11y.rssFeed")}
        >
          <Rss className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </footer>
    </div>
  )
}

export default Layout
