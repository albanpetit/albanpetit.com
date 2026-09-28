import { getImage } from "astro:assets"
import { type CollectionEntry, getCollection } from "astro:content"
import type { PostCardData } from "@/components/PostCard"
import { categoryLabel } from "@/lib/category"
import { formatDate, getTranslations, type Language, localizedPath } from "@/lib/i18n"
import { projectOf } from "@/lib/projects"
import { categoryPath, tagPath } from "@/lib/tag"

export type Post = CollectionEntry<"posts">

/** Posts of one language (all languages without argument), newest first */
export async function getPosts(language?: Language): Promise<Post[]> {
  const posts = await getCollection("posts", ({ data }) => !language || data.lang === language)
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
}

export const postPath = (post: Post) => localizedPath(`/post/${post.data.slug}/`, post.data.lang)

/** Markdown source reduced to its readable text */
export const plainText = (markdown: string) =>
  markdown
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s*(#{1,6}|>|[-*+]|\d+\.|\|)\s*/gm, "")
    .replace(/[*_`~|]+/g, "")
    .replace(/\s+/g, " ")
    .trim()

/** Same estimate as Gatsby's timeToRead: 265 words per minute, at least one minute */
export const readingTime = (post: { body?: string }) =>
  Math.max(1, Math.round((plainText(post.body ?? "").match(/\S+/g)?.length ?? 0) / 265))

/** First `length` characters of the text (of a post, a log…), cut on a word boundary */
export function excerpt(post: { body?: string }, length: number) {
  const text = plainText((post.body ?? "").replace(/```[\s\S]*?```/g, " ").replace(/\$\$[\s\S]*?\$\$/g, " "))
  if (text.length <= length) return text
  const lastSpace = text.slice(0, length).lastIndexOf(" ")
  // No space to cut on (a long URL for instance): cut mid-word rather than keep the whole text
  return `${text.slice(0, lastSpace > 0 ? lastSpace : length)}…`
}

/** Everything a post card needs, serializable so React islands (search, blog filter) can receive it */
export async function toCardData(post: Post): Promise<PostCardData> {
  const { title, date, description, tags, category, image, lang } = post.data
  // The project this post belongs to, if any: its badge stands where a category would, and leads to the project's
  // overview, or to the list of projects when the project is this post alone
  const project = await projectOf(post)
  const cover = image
    ? await getImage({ src: image, width: 400, height: 300, widths: [240, 400, 640, 800], fit: "cover" })
    : undefined

  return {
    id: post.id,
    url: postPath(post),
    title,
    date: formatDate(date, lang),
    timeToRead: readingTime(post),
    description: description ?? excerpt(post, 160),
    tags: tags.map((tag) => ({ name: tag, url: tagPath(tag, lang) })),
    category: category
      ? { name: category, label: categoryLabel(category, lang), url: categoryPath(category, lang) }
      : undefined,
    project: project && {
      label: getTranslations(lang)("projects.badge"),
      url: project.posts.length > 1 ? project.url : localizedPath("/projects/", lang),
    },
    cover: cover && {
      src: cover.src,
      srcset: cover.srcSet.attribute,
      width: Number(cover.attributes.width),
      height: Number(cover.attributes.height),
    },
  }
}
