function slugify(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

export function slugifyTag(tag: string): string {
  return slugify(tag)
}

export function slugifyCategory(category: string): string {
  return slugify(category)
}

export function tagPath(tag: string, language: string): string {
  return language === "en" ? `/tag/${slugifyTag(tag)}/` : `/fr/tag/${slugifyTag(tag)}/`
}

export function categoryPath(category: string, language: string): string {
  return language === "en" ? `/category/${slugifyCategory(category)}/` : `/fr/category/${slugifyCategory(category)}/`
}
