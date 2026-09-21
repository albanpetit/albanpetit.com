import type { GatsbyConfig } from "gatsby"
import { DEFAULT_LANGUAGE, LANGUAGES, localizedPath } from "./src/lib/i18n"
import { SITE_URL } from "./src/lib/site"

type FeedNode = {
  html: string
  excerpt: string
  frontmatter: { title: string; date: string; description?: string; slug: string }
}

type FeedQuery = {
  query: {
    site: { siteMetadata: { siteUrl: string } }
    allMarkdownRemark: { nodes: FeedNode[] }
  }
}

type FeedSetup = {
  query: { site: { siteMetadata: { siteUrl: string } } }
  output: string
  language: string
}

type SitemapQuery = {
  allSitePage: { nodes: { path: string }[] }
  allMarkdownRemark: { nodes: { frontmatter: { slug: string; lang: string; date: string; lastmod: string | null } }[] }
}

// Feed readers have no base URL: rewrite root-relative src/href/srcset to absolute ones
const absolutizeUrls = (html: string, siteUrl: string) =>
  html
    .replace(/(\s(?:src|href|srcset)=")\/(?!\/)/g, `$1${siteUrl}/`)
    .replace(/(,\s*)\/static\//g, `$1${siteUrl}/static/`)

const config: GatsbyConfig = {
  siteMetadata: {
    title: "Alban Petit",
    description: "Personal blog of Alban Petit, electronics, web development, and the maker world.",
    siteUrl: SITE_URL,
    author: "Alban Petit",
  },
  graphqlTypegen: true,
  plugins: [
    "gatsby-plugin-postcss",
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "locale",
        path: `${__dirname}/locales`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "posts",
        path: `${__dirname}/content/posts`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: `${__dirname}/content/pages`,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: `${__dirname}/content/images`,
      },
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-autolink-headers",
            // No offsetY: headings get scroll-margin-top in globals.css, which the plugin already subtracts
            options: {
              className: "anchor",
            },
          },
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 800,
              quality: 80,
              withWebp: true,
            },
          },
          {
            // Linked non-image files (PDF datasheets…) are copied to /static/ and their links rewritten
            resolve: "gatsby-remark-copy-linked-files",
            options: {
              destinationDir: "static",
              ignoreFileExtensions: ["png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff"],
            },
          },
          // Must run before gatsby-remark-prismjs: it pulls mermaid fences out of the AST so
          // Prism never sees them as code to tokenize
          "gatsby-remark-mermaid-passthrough",
          {
            resolve: "gatsby-remark-prismjs",
            options: {
              classPrefix: "language-",
              inlineCodeMarker: null,
              showLineNumbers: false,
            },
          },
          {
            resolve: "gatsby-remark-katex",
            options: {
              strict: "ignore",
            },
          },
        ],
      },
    },
    {
      resolve: "gatsby-plugin-sitemap",
      options: {
        excludes: ["/search/", "/fr/search/", "/404/", "/404.html", "/fr/404/", "/fr/404.html"],
        query: `{
          site { siteMetadata { siteUrl } }
          allSitePage { nodes { path } }
          allMarkdownRemark(filter: { fileAbsolutePath: { regex: "/content/posts/" } }) {
            nodes { frontmatter { slug lang date lastmod } }
          }
        }`,
        // Post URLs get <lastmod> from front matter (lastmod, else date)
        resolvePages: ({ allSitePage, allMarkdownRemark }: SitemapQuery) => {
          const lastmodByPath = new Map(
            allMarkdownRemark.nodes.map(({ frontmatter: f }) => [
              localizedPath(`/post/${f.slug}/`, f.lang),
              f.lastmod ?? f.date,
            ])
          )
          return allSitePage.nodes.map((page) => ({ ...page, lastmod: lastmodByPath.get(page.path) }))
        },
        serialize: ({ path, lastmod }: { path: string; lastmod?: string }) => ({
          url: path,
          ...(lastmod ? { lastmod } : {}),
        }),
      },
    },
    {
      // Also adds the <link rel="alternate"> tags for both feeds to every page head
      resolve: "gatsby-plugin-feed",
      options: {
        query: `{
          site {
            siteMetadata { title description siteUrl }
          }
        }`,
        // The rss package reads site_url (channel <link>) and feed_url (atom:link self), not siteUrl
        setup: ({ query: { site }, ...feed }: FeedSetup) => ({
          ...site.siteMetadata,
          ...feed,
          site_url: `${site.siteMetadata.siteUrl}${localizedPath("/", feed.language)}`,
          feed_url: `${site.siteMetadata.siteUrl}${feed.output}`,
        }),
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }: FeedQuery) =>
              allMarkdownRemark.nodes.map((node) => ({
                title: node.frontmatter.title,
                description: node.frontmatter.description || node.excerpt,
                date: node.frontmatter.date,
                url: `${site.siteMetadata.siteUrl}/post/${node.frontmatter.slug}/`,
                guid: `${site.siteMetadata.siteUrl}/post/${node.frontmatter.slug}/`,
                custom_elements: [{ "content:encoded": absolutizeUrls(node.html, site.siteMetadata.siteUrl) }],
              })),
            query: `{
              allMarkdownRemark(
                filter: {
                  fileAbsolutePath: { regex: "/content/posts/" }
                  frontmatter: { lang: { eq: "en" } }
                }
                sort: { frontmatter: { date: DESC } }
              ) {
                nodes {
                  html
                  excerpt(pruneLength: 160)
                  frontmatter { title date description slug }
                }
              }
            }`,
            output: "/rss.xml",
            title: "Alban Petit · Blog",
            language: "en",
          },
          {
            serialize: ({ query: { site, allMarkdownRemark } }: FeedQuery) =>
              allMarkdownRemark.nodes.map((node) => ({
                title: node.frontmatter.title,
                description: node.frontmatter.description || node.excerpt,
                date: node.frontmatter.date,
                url: `${site.siteMetadata.siteUrl}/fr/post/${node.frontmatter.slug}/`,
                guid: `${site.siteMetadata.siteUrl}/fr/post/${node.frontmatter.slug}/`,
                custom_elements: [{ "content:encoded": absolutizeUrls(node.html, site.siteMetadata.siteUrl) }],
              })),
            query: `{
              allMarkdownRemark(
                filter: {
                  fileAbsolutePath: { regex: "/content/posts/" }
                  frontmatter: { lang: { eq: "fr" } }
                }
                sort: { frontmatter: { date: DESC } }
              ) {
                nodes {
                  html
                  excerpt(pruneLength: 160)
                  frontmatter { title date description slug }
                }
              }
            }`,
            output: "/fr/rss.xml",
            title: "Alban Petit · Articles",
            description: "Blog d'Alban Petit, électronique, développement web et monde maker.",
            language: "fr",
          },
        ],
      },
    },
    {
      resolve: "gatsby-plugin-react-i18next",
      options: {
        localeJsonSourceName: "locale",
        languages: LANGUAGES,
        defaultLanguage: DEFAULT_LANGUAGE,
        siteUrl: SITE_URL,
        trailingSlash: "always",
        // No automatic language redirect: it prefixed /fr to paths that have no French page
        // (translated tag slugs, 404s → /fr/fr/…). hreflang and the header switch handle language.
        redirect: false,
        i18nextOptions: {
          returnNull: false,
          interpolation: {
            escapeValue: false,
          },
          keySeparator: ".",
          nsSeparator: ":",
        },
      },
    },
  ],
}

export default config
