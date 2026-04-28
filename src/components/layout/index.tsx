import React from "react"
import { Link } from "gatsby"
import { Moon, Sun, Menu, Search, Rss } from "lucide-react"
import { useTranslation, useI18next } from "gatsby-plugin-react-i18next"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "@/context/theme"

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { theme, toggle } = useTheme()
  const { t } = useTranslation()
  const { language, changeLanguage } = useI18next()

  const homePath = language === "en" ? "/" : "/fr/"
  const searchPath = language === "en" ? "/search/" : "/fr/search/"
  const rssPath = language === "en" ? "/rss.xml" : "/fr/rss.xml"
  const otherLang = language === "en" ? "fr" : "en"

  const navLinks = [
    { to: language === "en" ? "/blog/" : "/fr/blog/", label: t("nav.blog") },
    { to: language === "en" ? "/about/" : "/fr/about/", label: t("nav.about") },
  ]

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link
            to={homePath}
            className="flex items-center gap-2 font-bold tracking-tight"
          >
            <img src="/logo.svg" alt="albanpetit.com" className="h-7 w-7" />
            <span>
              albanpetit<span className="text-muted-foreground font-normal">.com</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Main navigation">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeLanguage(otherLang)}
              className="text-muted-foreground uppercase font-medium"
            >
              {otherLang}
            </Button>
            <Link to={searchPath} aria-label={t("search.title") ?? "Search"}>
              <Button variant="ghost" size="icon" asChild>
                <span><Search className="h-4 w-4" aria-hidden="true" /></span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </nav>

          {/* Mobile nav */}
          <div className="flex items-center gap-1 md:hidden">
            <Link to={searchPath} aria-label={t("search.title") ?? "Search"}>
              <Button variant="ghost" size="icon" asChild>
                <span><Search className="h-4 w-4" aria-hidden="true" /></span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeLanguage(otherLang)}
              className="text-muted-foreground uppercase font-medium text-xs"
            >
              {otherLang}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-56" aria-label="Mobile navigation">
                <nav className="flex flex-col gap-4 pt-8 text-sm" aria-label="Mobile navigation links">
                  {navLinks.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container py-10">{children}</main>

      <Separator />
      <footer className="container flex h-14 items-center justify-center gap-1 text-sm text-muted-foreground">
        <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
        <span>·</span>
        <a
          href="https://github.com/albanpetit"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          GitHub
        </a>
        <span>·</span>
        <a
          href="https://twitter.com/Padh_"
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
          aria-label="RSS feed"
        >
          <Rss className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </footer>
    </div>
  )
}

export default Layout
