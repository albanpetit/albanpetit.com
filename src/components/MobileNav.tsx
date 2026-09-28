import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface MobileNavProps {
  links: { to: string; label: string }[]
  labels: { open: string; menu: string; nav: string; close: string }
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
        {links.map(({ to, label }) => (
          <a key={to} href={to} className="text-muted-foreground transition-colors hover:text-foreground">
            {label}
          </a>
        ))}
      </nav>
    </SheetContent>
  </Sheet>
)

export default MobileNav
