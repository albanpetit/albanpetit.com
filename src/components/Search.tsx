import Fuse from "fuse.js"
import { Search as SearchIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import PostCard, { type PostCardData } from "@/components/PostCard"
import { Input } from "@/components/ui/input"
import type { Language } from "@/lib/i18n"
import { createTranslator, type Translations } from "@/lib/translate"

export type SearchablePost = PostCardData & {
  /** Longer excerpt to match against than the card shows */
  searchExcerpt: string
}

/** Client-side fuzzy search over the posts of one language; the query lives in ?q= */
const Search = ({ posts, lang, strings }: { posts: SearchablePost[]; lang: Language; strings: Translations }) => {
  const t = createTranslator(lang, strings)
  // Start empty so the first client render matches the static HTML, then read ?q= once hydrated
  const [query, setQuery] = useState("")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get("q") ?? "")
    setReady(true)
  }, [])

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: [
          { name: "title", weight: 3 },
          { name: "description", weight: 2 },
          { name: "tags.name", weight: 2 },
          { name: "category.label", weight: 1 },
          { name: "searchExcerpt", weight: 1 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [posts]
  )

  const results = useMemo(() => (query.trim() ? fuse.search(query).map((r) => r.item) : []), [query, fuse])

  useEffect(() => {
    if (!ready) return
    const current = new URLSearchParams(window.location.search).get("q") ?? ""
    if (query !== current) {
      window.history.replaceState(null, "", query ? `?q=${encodeURIComponent(query)}` : window.location.pathname)
    }
  }, [query, ready])

  return (
    <>
      <div className="relative max-w-xl">
        <SearchIcon
          className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <label htmlFor="search-input" className="sr-only">
          {t("search.title")}
        </label>
        <Input
          id="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          className="pl-12 h-12 text-base rounded-xl"
        />
      </div>

      {/* Always in the page, even empty: screen readers only announce changes to a live region they already know */}
      <p className={query.trim() ? "text-sm text-muted-foreground" : "sr-only"} aria-live="polite">
        {query.trim() && t("search.results", { count: results.length, query })}
      </p>
      {query.trim() && <div role="none" className="shrink-0 bg-border h-[1px] w-full" />}

      <div className="flex flex-col gap-4">
        {results.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {query.trim() && results.length === 0 && (
          <p className="text-muted-foreground py-8 text-center">{t("search.empty")}</p>
        )}
      </div>
    </>
  )
}

export default Search
