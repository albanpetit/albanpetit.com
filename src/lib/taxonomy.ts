import type { Language } from "@/lib/i18n"
import type { Post } from "@/lib/posts"
import { slugifyCategory, slugifyTag } from "@/lib/tag"

export type TaxonomyPage = {
  lang: Language
  /** Name as written in the front matter */
  name: string
  slug: string
}

const warned = new Set<string>()
const warn = (message: string) => {
  if (warned.has(message)) return
  warned.add(message)
  console.warn(`[taxonomy] ${message}`)
}

// Records `name -> slug` in `map`, warning instead of silently overwriting when a different name
// already claimed that slug (its page would otherwise vanish under the newer name)
function addSlug(map: Map<string, string>, name: string, slug: string, kind: string, lang: string) {
  if (map.has(name)) return
  for (const [existingName, existingSlug] of map) {
    if (existingSlug === slug && existingName !== name) {
      warn(
        `${kind} "${existingName}" and "${name}" (${lang}) both produce the slug "${slug}"; ` +
          `only "${existingName}" will get a page, "${name}" has none`
      )
      return
    }
  }
  map.set(name, slug)
}

/** One page per tag and language, with the slug of the same tag in the other language when it can be paired */
export function tagPages(posts: Post[]): (TaxonomyPage & { alternateSlug: string | null })[] {
  const tagsByLang = new Map<Language, Map<string, string>>()
  for (const { data } of posts) {
    const langTags = tagsByLang.get(data.lang) ?? new Map<string, string>()
    tagsByLang.set(data.lang, langTags)
    for (const tag of data.tags) addSlug(langTags, tag, slugifyTag(tag), "Tag", data.lang)
  }

  // Pair tags across languages: translated posts share a slug and list their tags in the same order
  const tagsBySlug = new Map<string, Map<Language, string[]>>()
  for (const { data } of posts) {
    const slugTags = tagsBySlug.get(data.slug) ?? new Map<Language, string[]>()
    tagsBySlug.set(data.slug, slugTags)
    slugTags.set(data.lang, data.tags)
  }

  // Key: `${lang}:${tag}`, value: slug of the same tag in the other language
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
      const enKey = `en:${tag}`
      const frKey = `fr:${fr[i]}`
      const enSlug = slugifyTag(tag)
      const frSlug = slugifyTag(fr[i])

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
    [...tags].map(([name, slug]) => ({ lang, name, slug, alternateSlug: counterparts.get(`${lang}:${name}`) ?? null }))
  )
}

/** One page per category and language; category names are shared across languages */
export function categoryPages(posts: Post[]): (TaxonomyPage & { hasAlternate: boolean })[] {
  const categoriesByLang = new Map<Language, Map<string, string>>()
  for (const { data } of posts) {
    if (!data.category) continue
    const langCategories = categoriesByLang.get(data.lang) ?? new Map<string, string>()
    categoriesByLang.set(data.lang, langCategories)
    addSlug(langCategories, data.category, slugifyCategory(data.category), "Category", data.lang)
  }

  return [...categoriesByLang].flatMap(([lang, categories]) =>
    [...categories].map(([name, slug]) => ({
      lang,
      name,
      slug,
      // The page exists in the other language if a post uses the category there
      hasAlternate: categoriesByLang.get(lang === "en" ? "fr" : "en")?.has(name) ?? false,
    }))
  )
}
