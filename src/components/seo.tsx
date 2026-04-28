import React from "react"

const SITE_URL = "https://albanpetit.com"
const TWITTER_HANDLE = "@Padh_"
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`

interface SeoProps {
  title: string
  description?: string
  /** Absolute URL or path relative to site root (e.g. /static/abc/main.jpg) */
  image?: string
  type?: "website" | "article"
  publishedAt?: string
  updatedAt?: string
  canonicalPath?: string
  lang?: string
  structuredData?: object
}

const Seo = ({
  title,
  description,
  image,
  type = "website",
  publishedAt,
  updatedAt,
  canonicalPath,
  lang = "en",
  structuredData,
}: SeoProps) => {
  const ogImage = image
    ? image.startsWith("http") ? image : `${SITE_URL}${image}`
    : DEFAULT_OG_IMAGE
  const canonical = canonicalPath ? `${SITE_URL}${canonicalPath}` : SITE_URL

  return (
    <>
      <html lang={lang} />
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      <link rel="icon" href="/favicon.ico" />
      <meta name="author" content="Alban Petit" />

      {/* Open Graph */}
      <meta property="og:site_name" content="Alban Petit" />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content={lang === "fr" ? "fr_FR" : "en_US"} />
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {updatedAt && <meta property="article:modified_time" content={updatedAt} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </>
  )
}

export default Seo
