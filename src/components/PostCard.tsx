import React from "react"
import { Link, navigate } from "gatsby"
import { GatsbyImage, getImage, type IGatsbyImageData } from "gatsby-plugin-image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { tagPath, categoryPath } from "@/lib/tag"

export type PostCardData = {
  id: string
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
}

const PostCard: React.FC<PostCardProps> = ({ post, language, thumbnailWidth = "sm:w-48" }) => {
  const { frontmatter, excerpt } = post
  const coverImage = frontmatter.image
    ? getImage(frontmatter.image.childImageSharp.gatsbyImageData)
    : null
  const postUrl = language === "en"
    ? `/post/${frontmatter.slug}/`
    : `/fr/post/${frontmatter.slug}/`

  return (
    <Card
      className="overflow-hidden cursor-pointer group border transition-all duration-200 hover:border-primary/50 hover:shadow-md"
      onClick={() => navigate(postUrl)}
    >
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
              <Link
                to={categoryPath(frontmatter.category, language)}
                onClick={(e) => e.stopPropagation()}
              >
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent transition-colors">
                  {frontmatter.category}
                </Badge>
              </Link>
            ) : <span />}
            <span className="text-xs text-muted-foreground shrink-0">{frontmatter.date}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold leading-snug group-hover:text-secondary transition-colors line-clamp-2">
            {frontmatter.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
            {frontmatter.description || excerpt}
          </p>

          {/* Tags */}
          {frontmatter.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {frontmatter.tags.map((tag) => (
                <Link
                  key={tag}
                  to={tagPath(tag, language)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-accent transition-colors">
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
