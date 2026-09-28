import type { Language } from "@/lib/i18n"
import type { Post } from "@/lib/posts"
import { slugifyCategory, slugifyTag } from "@/lib/tag"

export type TaxonomyPage = {
  lang: Language
  /** Names as written in the front matter that share this slug ("C" and "C++" both give "c") */
  names: string[]
  slug: string
}

const warned = new Set<string>()
const warn = (message: string) => {
  if (warned.has(message)) return
  warned.add(message)
  console.warn(`[taxonomy] ${message}`)
}

// Groups names by slug in `map`. Names that share a slug share a page: every link built with
// tagPath/categoryPath points there, so that page must list the posts of all of them
function addName(map: Map<string, string[]>, name: string, slug: string, kind: string, lang: string) {
  const names = map.get(slug) ?? []
  if (names.includes(name)) return
  if (names.length > 0) warn(`${kind} "${names[0]}" and "${name}" (${lang}) share the slug "${slug}" and its page`)
  names.push(name)
  map.set(slug, names)
}

/** One page per tag slug and language, with the slug of the same tag in the other language when it can be paired */
export function tagPages(posts: Post[]): (TaxonomyPage & { alternateSlug: string | null })[] {
  const tagsByLang = new Map<Language, Map<string, string[]>>()
  for (const { data } of posts) {
    const langTags = tagsByLang.get(data.lang) ?? new Map<string, string[]>()
    tagsByLang.set(data.lang, langTags)
    for (const tag of data.tags) addName(langTags, tag, slugifyTag(tag), "Tag", data.lang)
  }

  // Pair tags across languages: translated posts share a slug and list their tags in the same order
  const tagsBySlug = new Map<string, Map<Language, string[]>>()
  for (const { data } of posts) {
    const slugTags = tagsBySlug.get(data.slug) ?? new Map<Language, string[]>()
    tagsBySlug.set(data.slug, slugTags)
    slugTags.set(data.lang, data.tags)
  }

  // Key: `${lang}:${tag slug}`, value: slug of the same tag in the other language
  const counterparts = new Map<string, string>()
  // Keys whose pairing disagrees across posts: order-based pairing can't be trusted for them
  const conflicting = new Set<string>()

  tagsBySlug.forEach((tagsForSlug, slug) => {
    const en = tagsForSlug.get("en")
    const fr = tagsForSlug.get("fr")
    if (!en || !fr) return
    if (en.length !== fr.length) {
      warn(`Post "${slug}": EN and FR tag lists differ in length, its tag pages cannot be paired`)
      return
    }
    en.forEach((tag, i) => {
      const enSlug = slugifyTag(tag)
      const frSlug = slugifyTag(fr[i])
      const enKey = `en:${enSlug}`
      const frKey = `fr:${frSlug}`

      if (counterparts.has(enKey) && counterparts.get(enKey) !== frSlug) conflicting.add(enKey)
      else counterparts.set(enKey, frSlug)

      if (counterparts.has(frKey) && counterparts.get(frKey) !== enSlug) conflicting.add(frKey)
      else counterparts.set(frKey, enSlug)
    })
  })

  conflicting.forEach((key) => {
    warn(
      `Tag "${key}" pairs with different translations depending on the post; its tag pages won't link to a translation ` +
        "(translated posts must list matching tags in the same order)"
    )
    counterparts.delete(key)
  })

  return [...tagsByLang].flatMap(([lang, tags]) =>
    [...tags].map(([slug, names]) => ({
      lang,
      names,
      slug,
      alternateSlug: counterparts.get(`${lang}:${slug}`) ?? null,
    }))
  )
}

/** One page per category slug and language; category names are shared across languages */
export function categoryPages(posts: Post[]): (TaxonomyPage & { hasAlternate: boolean })[] {
  const categoriesByLang = new Map<Language, Map<string, string[]>>()
  for (const { data } of posts) {
    if (!data.category) continue
    const langCategories = categoriesByLang.get(data.lang) ?? new Map<string, string[]>()
    categoriesByLang.set(data.lang, langCategories)
    addName(langCategories, data.category, slugifyCategory(data.category), "Category", data.lang)
  }

  return [...categoriesByLang].flatMap(([lang, categories]) =>
    [...categories].map(([slug, names]) => ({
      lang,
      names,
      slug,
      // The page exists in the other language if a post uses the category there
      hasAlternate: categoriesByLang.get(lang === "en" ? "fr" : "en")?.has(slug) ?? false,
    }))
  )
}
