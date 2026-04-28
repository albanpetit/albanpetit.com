import React from "react"
import { Moon, Sun, Menu, Search, Rss } from "lucide-react"
import { useTranslation } from "gatsby-plugin-react-i18next"
import { useI18next } from "gatsby-plugin-react-i18next"
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

  const navLinks = [
    { href: language === "en" ? "/blog/" : "/fr/blog/", label: t("nav.blog") },
    { href: language === "en" ? "/about/" : "/fr/about/", label: t("nav.about") },
  ]

  const otherLang = language === "en" ? "fr" : "en"

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <a
            href={language === "en" ? "/" : "/fr/"}
            className="flex items-center gap-2 font-bold tracking-tight"
          >
            <img src="/logo.svg" alt="albanpetit.com" className="h-7 w-7" />
            <span>
              albanpetit<span className="text-muted-foreground font-normal">.com</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeLanguage(otherLang)}
              className="text-muted-foreground uppercase font-medium"
            >
              {otherLang}
            </Button>
            <a href={language === "en" ? "/search/" : "/fr/search/"} aria-label="Search">
              <Button variant="ghost" size="icon" asChild>
                <span><Search className="h-4 w-4" /></span>
              </Button>
            </a>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </nav>

          {/* Mobile nav */}
          <div className="flex items-center gap-1 md:hidden">
            <a href={language === "en" ? "/search/" : "/fr/search/"} aria-label="Search">
              <Button variant="ghost" size="icon" asChild>
                <span><Search className="h-4 w-4" /></span>
              </Button>
            </a>
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
              <SheetContent side="right" className="w-56">
                <nav className="flex flex-col gap-4 pt-8 text-sm">
                  {navLinks.map(({ href, label }) => (
                    <a
                      key={href}
                      href={href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </a>
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
          href={language === "en" ? "/rss.xml" : "/fr/rss.xml"}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-orange-500 transition-colors"
          aria-label="RSS feed"
        >
          <Rss className="h-3.5 w-3.5" />
        </a>
      </footer>
    </div>
  )
}

export default Layout
