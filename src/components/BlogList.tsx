import { useEffect, useMemo, useState } from "react"
import PostCard, { type PostCardData } from "@/components/PostCard"
import { Badge } from "@/components/ui/badge"
import { type Language, getTranslations } from "@/lib/i18n"

/** Blog post list with its tag filter, kept in ?tag= so a filtered list can be shared and survives going back */
const BlogList = ({ posts, lang }: { posts: PostCardData[]; lang: Language }) => {
  const t = getTranslations(lang)
  // Start unfiltered so the first client render matches the static HTML, then read ?tag= once hydrated
  const [activeTag, setActiveTag] = useState<string | null>(null)

  useEffect(() => {
    setActiveTag(new URLSearchParams(window.location.search).get("tag"))
  }, [])

  const selectTag = (tag: string | null) => {
    setActiveTag(tag)
    const url = tag ? `?tag=${encodeURIComponent(tag)}` : window.location.pathname
    window.history.replaceState(null, "", url)
  }

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const post of posts) for (const { name } of post.tags) counts.set(name, (counts.get(name) ?? 0) + 1)
    return counts
  }, [posts])

  const allTags = useMemo(() => [...tagCounts.keys()].sort(), [tagCounts])

  const filtered = useMemo(
    () => (activeTag ? posts.filter((p) => p.tags.some(({ name }) => name === activeTag)) : posts),
    [posts, activeTag]
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-4xl font-bold tracking-tight">{t("blog.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("blog.subtitle", { count: filtered.length })}</p>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={activeTag === null}
            onClick={() => selectTag(null)}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
          >
            <Badge variant={activeTag === null ? "default" : "outline"} className="cursor-pointer rounded-full px-3">
              {t("blog.all")}
            </Badge>
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed={activeTag === tag}
              onClick={() => selectTag(activeTag === tag ? null : tag)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
            >
              <Badge variant={activeTag === tag ? "default" : "outline"} className="cursor-pointer rounded-full px-3">
                {tag}
                <span className="ml-1.5 opacity-60 font-normal">{tagCounts.get(tag)}</span>
              </Badge>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-muted-foreground">{t("blog.empty")}</p>
            <button type="button" onClick={() => selectTag(null)} className="text-sm text-link hover:underline">
              {t("blog.all")}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogList
