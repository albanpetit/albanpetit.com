import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

type Link = { name: string; url: string }

/** Built by toCardData() in src/lib/posts.ts */
export type PostCardData = {
  id: string
  url: string
  title: string
  /** Already formatted in the page language */
  date: string
  timeToRead: number
  description: string
  tags: Link[]
  category?: Link & { label: string }
  cover?: { src: string; srcset: string; width: number; height: number }
}

interface PostCardProps {
  post: PostCardData
  thumbnailWidth?: string
  /** h2 on listing pages (below the page h1), h3 where the list sits under an h2 */
  headingLevel?: "h2" | "h3"
}

const PostCard = ({ post, thumbnailWidth = "sm:w-48", headingLevel = "h2" }: PostCardProps) => {
  const Heading = headingLevel

  return (
    <Card className="relative overflow-hidden group border transition-all duration-200 hover:border-primary/50 hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        {post.cover && (
          <div className={`${thumbnailWidth} sm:shrink-0 overflow-hidden`}>
            <img
              src={post.cover.src}
              srcSet={post.cover.srcset}
              sizes="(min-width: 640px) 12rem, 100vw"
              width={post.cover.width}
              height={post.cover.height}
              // Decorative: the title link next to it already names the post, screen readers would read it twice
              alt=""
              loading="lazy"
              decoding="async"
              className="h-44 sm:h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex flex-col flex-1 min-w-0 p-4 gap-2">
          {/* Category + date row */}
          <div className="flex items-center justify-between gap-2">
            {post.category ? (
              <a href={post.category.url} className="relative z-10">
                <Badge variant="secondary" className="text-xs hover:bg-accent transition-colors">
                  {post.category.label}
                </Badge>
              </a>
            ) : (
              <span />
            )}
            <span className="text-xs text-muted-foreground shrink-0">
              {post.date} · {post.timeToRead} min
            </span>
          </div>

          {/* Title: its link is stretched over the whole card */}
          <Heading className="font-semibold leading-snug group-hover:text-link transition-colors line-clamp-2">
            <a
              href={post.url}
              className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring"
            >
              {post.title}
            </a>
          </Heading>

          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{post.description}</p>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {post.tags.map((tag) => (
                <a key={tag.name} href={tag.url} className="relative z-10">
                  <Badge variant="secondary" className="text-xs hover:bg-accent transition-colors">
                    {tag.name}
                  </Badge>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default PostCard
