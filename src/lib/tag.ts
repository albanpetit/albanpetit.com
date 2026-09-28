import { localizedPath } from "./i18n"

function slugify(str: string): string {
  return (
    str
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      // Collapse any run of disallowed characters into a single separator, instead of deleting them,
      // so "Node.js" gives "node-js". Some tags still collide ("C++" and "C" both give "c"):
      // src/lib/taxonomy.ts then gives them one shared page
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

export function slugifyProject(project: string): string {
  return slugify(project)
}

export function tagPath(tag: string, language: string): string {
  return localizedPath(`/tag/${slugifyTag(tag)}/`, language)
}

export function categoryPath(category: string, language: string): string {
  return localizedPath(`/category/${slugifyCategory(category)}/`, language)
}
