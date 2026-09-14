import { localizedPath } from "./i18n"

function slugify(str: string): string {
  return (
    str
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      // Collapse any run of disallowed characters into a single separator, instead of deleting them,
      // so distinct tags like "C++" and "C" don't both reduce to "c"
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  )
}

export function slugifyTag(tag: string): string {
  return slugify(tag)
}

export function slugifyCategory(category: string): string {
  return slugify(category)
}

export function tagPath(tag: string, language: string): string {
  return localizedPath(`/tag/${slugifyTag(tag)}/`, language)
}

export function categoryPath(category: string, language: string): string {
  return localizedPath(`/category/${slugifyCategory(category)}/`, language)
}
