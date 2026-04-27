import React from "react"

interface SeoProps {
  title: string
  description?: string
}

const Seo = ({ title, description }: SeoProps) => (
  <>
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    <link rel="icon" href="/favicon.ico" />
    <meta name="author" content="Alban Petit" />
  </>
)

export default Seo
