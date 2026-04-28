import React from "react"

const SITE_URL = "https://albanpetit.com"
const TWITTER_HANDLE = "@Padh_"
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`

interface SeoProps {
  title: string
  description?: string
  /** Path relative to site root — e.g. /static/abc/main.jpg — or absolute URL */
  image?: string
  type?: "website" | "article"
  publishedAt?: string
  updatedAt?: string
  canonicalPath?: string
  /** hreflang alternate paths, e.g. { en: "/blog/", fr: "/fr/blog/" } */
  alternatePaths?: { en: string; fr: string }
  lang?: string
  noindex?: boolean
  /** Single or multiple JSON-LD objects */
  structuredData?: object | object[]
}

const Seo = ({
  title,
  description,
  image,
  type = "website",
  publishedAt,
  updatedAt,
  canonicalPath,
  alternatePaths,
  lang = "en",
  noindex = false,
  structuredData,
}: SeoProps) => {
  const ogImage = image
    ? image.startsWith("http") ? image : `${SITE_URL}${image}`
    : DEFAULT_OG_IMAGE
  const canonical = canonicalPath ? `${SITE_URL}${canonicalPath}` : SITE_URL

  const schemas = structuredData
    ? Array.isArray(structuredData) ? structuredData : [structuredData]
    : []

  return (
    <>
      <html lang={lang} />
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonical} />
      <link rel="icon" href="/favicon.ico" />
      <meta name="author" content="Alban Petit" />

      {/* RSS feeds */}
      <link rel="alternate" type="application/rss+xml" title="Alban Petit — Blog" href={`${SITE_URL}/rss.xml`} />
      <link rel="alternate" type="application/rss+xml" title="Alban Petit — Articles" href={`${SITE_URL}/fr/rss.xml`} />

      {/* hreflang */}
      {alternatePaths && (
        <>
          <link rel="alternate" hrefLang="en" href={`${SITE_URL}${alternatePaths.en}`} />
          <link rel="alternate" hrefLang="fr" href={`${SITE_URL}${alternatePaths.fr}`} />
          <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${alternatePaths.en}`} />
        </>
      )}

      {/* Open Graph */}
      <meta property="og:site_name" content="Alban Petit" />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content={lang === "fr" ? "fr_FR" : "en_US"} />
      {alternatePaths && (
        <meta property="og:locale:alternate" content={lang === "fr" ? "en_US" : "fr_FR"} />
      )}
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
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </>
  )
}

export default Seo
