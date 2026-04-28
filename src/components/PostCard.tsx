import React from "react"
import { Link, navigate } from "gatsby"
import { GatsbyImage, getImage, type IGatsbyImageData } from "gatsby-plugin-image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  /** Tailwind width class for the thumbnail — default "sm:w-48" */
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
      className="transition-shadow hover:shadow-md overflow-hidden cursor-pointer group"
      onClick={() => navigate(postUrl)}
    >
      <div className="flex flex-col sm:flex-row">
        {coverImage && (
          <div className={`${thumbnailWidth} sm:shrink-0`}>
            <GatsbyImage
              image={coverImage}
              alt={frontmatter.title}
              className="h-40 sm:h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex flex-col flex-1 min-w-0">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-lg leading-snug group-hover:text-secondary transition-colors">
                {frontmatter.title}
              </CardTitle>
              <CardDescription className="shrink-0 text-xs">
                {frontmatter.date}
              </CardDescription>
            </div>
            {frontmatter.category && (
              <Link
                to={categoryPath(frontmatter.category, language)}
                onClick={(e) => e.stopPropagation()}
              >
                <Badge variant="outline" className="text-xs w-fit cursor-pointer hover:bg-accent transition-colors">
                  {frontmatter.category}
                </Badge>
              </Link>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {frontmatter.description || excerpt}
            </p>
            <div className="flex flex-wrap gap-1">
              {frontmatter.tags?.map((tag) => (
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
          </CardContent>
        </div>
      </div>
    </Card>
  )
}

export default PostCard
