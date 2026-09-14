import React from "react"
import { Link } from "gatsby"
import { GatsbyImage, getImage, type IGatsbyImageData } from "gatsby-plugin-image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { tagPath, categoryPath } from "@/lib/tag"
import { categoryLabel } from "@/lib/category"

export type PostCardData = {
  id: string
  timeToRead?: number
  frontmatter: {
    title: string
    date: string
    description?: string
    tags: string[]
    category: string
    slug: string
    lang: string
    image: { childImageSharp: { gatsbyImageData: IGatsbyImageData } } | null
  }
  excerpt?: string
}

interface PostCardProps {
  post: PostCardData
  language: string
  thumbnailWidth?: string
  /** h2 on listing pages (below the page h1), h3 where the list sits under an h2 */
  headingLevel?: "h2" | "h3"
}

const PostCard: React.FC<PostCardProps> = ({ post, language, thumbnailWidth = "sm:w-48", headingLevel = "h2" }) => {
  const Heading = headingLevel
  const { frontmatter, excerpt, timeToRead } = post
  const coverImage = frontmatter.image ? getImage(frontmatter.image.childImageSharp.gatsbyImageData) : null
  const postUrl = language === "en" ? `/post/${frontmatter.slug}/` : `/fr/post/${frontmatter.slug}/`

  return (
    <Card className="relative overflow-hidden group border transition-all duration-200 hover:border-primary/50 hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        {coverImage && (
          <div className={`${thumbnailWidth} sm:shrink-0 overflow-hidden`}>
            <GatsbyImage
              image={coverImage}
              alt={frontmatter.title}
              className="h-44 sm:h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex flex-col flex-1 min-w-0 p-4 gap-2">
          {/* Category + date row */}
          <div className="flex items-center justify-between gap-2">
            {frontmatter.category ? (
              <Link to={categoryPath(frontmatter.category, language)} className="relative z-10">
                <Badge variant="secondary" className="text-xs hover:bg-accent transition-colors">
                  {categoryLabel(frontmatter.category, language)}
                </Badge>
              </Link>
            ) : (
              <span />
            )}
            <span className="text-xs text-muted-foreground shrink-0">
              {frontmatter.date}
              {timeToRead ? ` · ${timeToRead} min` : ""}
            </span>
          </div>

          {/* Title — its link is stretched over the whole card */}
          <Heading className="font-semibold leading-snug group-hover:text-link transition-colors line-clamp-2">
            <Link
              to={postUrl}
              className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring"
            >
              {frontmatter.title}
            </Link>
          </Heading>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{frontmatter.description || excerpt}</p>

          {/* Tags */}
          {frontmatter.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {frontmatter.tags.map((tag) => (
                <Link key={tag} to={tagPath(tag, language)} className="relative z-10">
                  <Badge variant="secondary" className="text-xs hover:bg-accent transition-colors">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default PostCard
