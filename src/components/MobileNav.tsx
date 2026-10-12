import { ArrowUpRight, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface MobileNavProps {
  links: { to: string; label: string; external?: boolean }[]
  labels: { open: string; menu: string; nav: string; close: string; newTab: string }
}

/** Slide-in menu of the mobile header; the only part of the header that needs React */
const MobileNav = ({ links, labels }: MobileNavProps) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon" aria-label={labels.open}>
        <Menu className="h-4 w-4" />
      </Button>
    </SheetTrigger>
    <SheetContent side="right" className="w-56" closeLabel={labels.close} aria-describedby={undefined}>
      <SheetTitle className="sr-only">{labels.menu}</SheetTitle>
      <nav className="flex flex-col gap-4 pt-8 text-sm" aria-label={labels.nav}>
        {links.map(({ to, label, external }) =>
          external ? (
            <a
              key={to}
              href={to}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">{labels.newTab}</span>
            </a>
          ) : (
            <a key={to} href={to} className="text-muted-foreground transition-colors hover:text-foreground">
              {label}
            </a>
          )
        )}
      </nav>
    </SheetContent>
  </Sheet>
)

export default MobileNav
