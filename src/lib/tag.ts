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
