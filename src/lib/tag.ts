export function slugifyTag(tag: string): string {
  return tag
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

export function tagPath(tag: string, language: string): string {
  const slug = slugifyTag(tag)
  return language === "en" ? `/tag/${slug}/` : `/fr/tag/${slug}/`
}

export function slugifyCategory(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

export function categoryPath(category: string, language: string): string {
  const slug = slugifyCategory(category)
  return language === "en" ? `/category/${slug}/` : `/fr/category/${slug}/`
}
