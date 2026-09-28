import { type CollectionEntry, getCollection } from "astro:content"
import { type Language, localizedPath } from "@/lib/i18n"

export type Project = CollectionEntry<"projects">
export type Log = CollectionEntry<"logs">
export type ProjectStatus = Project["data"]["status"]

/** "2026-09-28/index.fr" → "2026-09-28": the folder of a log is its date and its URL */
export const logSlug = (log: Log) => log.id.split("/")[0]

/** Day of a log, at midnight UTC like the post dates */
export function logDate(log: Log): Date {
  const slug = logSlug(log)
  const date = new Date(`${slug}T00:00:00Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slug) || Number.isNaN(date.getTime())) {
    throw new Error(`content/logs/${slug}/: log folders are named after their day, YYYY-MM-DD`)
  }
  return date
}

export const projectPath = (project: Project) => localizedPath(`/projects/${project.data.slug}/`, project.data.lang)
export const logPath = (log: Log) => localizedPath(`/logs/${logSlug(log)}/`, log.data.lang)

/** Projects of one language (all languages without argument): in progress first, then the most recently started */
export async function getProjects(language?: Language): Promise<Project[]> {
  const projects = await getCollection("projects", ({ data }) => !language || data.lang === language)
  const order: Record<ProjectStatus, number> = { "in-progress": 0, paused: 1, done: 2 }
  return projects.sort(
    (a, b) => order[a.data.status] - order[b.data.status] || b.data.started.getTime() - a.data.started.getTime()
  )
}

/**
 * Logs of one language (all languages without argument), newest first. Fails the build when a log names a
 * project that does not exist in its language: a typo would otherwise hide it from the project page.
 */
export async function getLogs(language?: Language): Promise<Log[]> {
  const [logs, projects] = await Promise.all([
    getCollection("logs", ({ data }) => !language || data.lang === language),
    getCollection("projects"),
  ])
  const known = new Set(projects.map(({ data }) => `${data.lang}:${data.slug}`))
  for (const log of logs) {
    for (const slug of log.data.projects) {
      if (!known.has(`${log.data.lang}:${slug}`)) {
        throw new Error(
          `content/logs/${log.id}.md: no project "${slug}" in ${log.data.lang} (content/projects/${slug}/index.${log.data.lang}.md)`
        )
      }
    }
  }
  return logs.sort((a, b) => logDate(b).getTime() - logDate(a).getTime())
}
