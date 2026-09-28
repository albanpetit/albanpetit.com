import { getCollection } from "astro:content"
import { type Language, localizedPath } from "@/lib/i18n"
import { type Post, postPath } from "@/lib/posts"
import { slugifyProject } from "@/lib/tag"

export type ProjectStatus = "in-progress" | "done"

/** Posts sharing a `project` name, in one language */
export type Project = {
  name: string
  slug: string
  lang: Language
  /** Reading order: the overview first, then the other posts oldest first */
  posts: Post[]
  overview?: Post
  /** Set by the overview's `status`: in progress without one */
  status: ProjectStatus
  /** Latest publication or update among its posts */
  updated: Date
  /** Its landing page: the overview, or its only post */
  url: string
}

/** Stable address of a project, redirecting to its landing page */
export const projectPagePath = (slug: string, lang: string) => localizedPath(`/projects/${slug}/`, lang)

/**
 * Groups posts by project. Fails the build on what would silently split or hide a project: two names that share a
 * slug in one language, two overviews, an overview outside any project, a status outside an overview, several posts
 * without an overview to land on.
 */
export function projectsOf(posts: Post[]): Project[] {
  const groups = new Map<string, Post[]>()
  for (const post of posts) {
    const { project, overview, status, lang } = post.data
    if (status && !overview) throw new Error(`content/posts/${post.id}.md: "status" is for a project's overview only`)
    if (!project) {
      if (overview) throw new Error(`content/posts/${post.id}.md: "overview: true" without a project`)
      continue
    }
    const key = `${lang}:${slugifyProject(project)}`
    groups.set(key, [...(groups.get(key) ?? []), post])
  }

  const projects = [...groups.values()].map((group): Project => {
    const { project: name = "", lang } = group[0].data
    const slug = slugifyProject(name)
    const other = group.find(({ data }) => data.project !== name)
    if (other) {
      throw new Error(`content/posts/${other.id}.md: project "${other.data.project}" shares its slug with "${name}"`)
    }
    const overviews = group.filter(({ data }) => data.overview)
    if (overviews.length > 1) {
      throw new Error(`Project "${name}" (${lang}) has several overviews: ${overviews.map(({ id }) => id).join(", ")}`)
    }
    const oldestFirst = group.toSorted((a, b) => a.data.date.getTime() - b.data.date.getTime())
    const overview = overviews[0]
    if (group.length > 1 && !overview) {
      throw new Error(
        `Project "${name}" (${lang}) has several posts but no overview: add "overview: true" to the post that presents it`
      )
    }
    const ordered = overview ? [overview, ...oldestFirst.filter((post) => post !== overview)] : oldestFirst
    return {
      name,
      slug,
      lang,
      posts: ordered,
      overview,
      status: overview?.data.status ?? "in-progress",
      updated: new Date(Math.max(...group.map(({ data }) => (data.lastmod ?? data.date).getTime()))),
      url: postPath(ordered[0]),
    }
  })

  // In progress first, then the most recently updated
  return projects.sort(
    (a, b) => Number(a.status === "done") - Number(b.status === "done") || b.updated.getTime() - a.updated.getTime()
  )
}

/**
 * Projects of one language (all languages without argument). Fails the build when a project exists in one language
 * only: the site is bilingual, so that is most likely a typo in a post's `project` name ("Axom" for "Axon").
 */
export async function getProjects(language?: Language): Promise<Project[]> {
  const projects = projectsOf(await getCollection("posts"))
  const keys = new Set(projects.map(({ slug, lang }) => `${lang}:${slug}`))
  for (const { name, slug, lang, posts } of projects) {
    const other = lang === "en" ? "fr" : "en"
    if (!keys.has(`${other}:${slug}`)) {
      throw new Error(
        `Project "${name}" exists in ${lang} only (${posts.map(({ id }) => id).join(", ")}): ` +
          `no ${other} post has "project: ${name}"`
      )
    }
  }
  return language ? projects.filter(({ lang }) => lang === language) : projects
}

/** Project of a post, if it belongs to one */
export async function projectOf(post: Post): Promise<Project | undefined> {
  const { project, lang } = post.data
  if (!project) return undefined
  return (await getProjects(lang)).find(({ slug }) => slug === slugifyProject(project))
}
