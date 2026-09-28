import { useEffect, useState } from "react"

export type Heading = { text: string; depth: number; slug: string }

/** Sticky post outline that highlights the section being read */
const TableOfContents = ({ headings, title }: { headings: Heading[]; title: string }) => {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: "-80px 0% -70% 0%" }
    )
    for (const { slug } of headings) {
      const el = document.getElementById(slug)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [headings])

  return (
    <nav className="sticky top-20 rounded-xl border bg-card p-4 text-sm" aria-label={title}>
      <p className="font-semibold mb-3 text-foreground">{title}</p>
      <ul className="flex flex-col gap-1.5">
        {headings.map((h) => (
          <li key={h.slug} style={{ paddingLeft: h.depth === 3 ? "0.75rem" : undefined }}>
            <a
              href={`#${h.slug}`}
              aria-current={activeId === h.slug ? "location" : undefined}
              className={`block leading-snug transition-colors hover:text-foreground ${
                activeId === h.slug ? "text-link font-medium" : "text-muted-foreground"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default TableOfContents
