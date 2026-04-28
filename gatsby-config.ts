import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: "Alban Petit",
    description:
      "Personal blog of Alban Petit — electronics, web development, and the maker world.",
    siteUrl: "https://albanpetit.com",
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
            options: {
              offsetY: 80,
              className: "anchor",
            },
          },
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 800,
              quality: 80,
            },
          },
          {
            resolve: "gatsby-remark-prismjs",
            options: {
              classPrefix: "language-",
              inlineCodeMarker: null,
              showLineNumbers: false,
            },
          },
        ],
      },
    },
    "gatsby-plugin-sitemap",
    {
      resolve: "gatsby-plugin-feed",
      options: {
        query: `{
          site {
            siteMetadata { title description siteUrl }
          }
        }`,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }: any) =>
              allMarkdownRemark.nodes.map((node: any) => ({
                title: node.frontmatter.title,
                description: node.frontmatter.description || node.excerpt,
                date: node.frontmatter.date,
                url: `${site.siteMetadata.siteUrl}/post/${node.frontmatter.slug}/`,
                guid: `${site.siteMetadata.siteUrl}/post/${node.frontmatter.slug}/`,
                custom_elements: [{ "content:encoded": node.html }],
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
            title: "Alban Petit — Blog",
          },
          {
            serialize: ({ query: { site, allMarkdownRemark } }: any) =>
              allMarkdownRemark.nodes.map((node: any) => ({
                title: node.frontmatter.title,
                description: node.frontmatter.description || node.excerpt,
                date: node.frontmatter.date,
                url: `${site.siteMetadata.siteUrl}/fr/post/${node.frontmatter.slug}/`,
                guid: `${site.siteMetadata.siteUrl}/fr/post/${node.frontmatter.slug}/`,
                custom_elements: [{ "content:encoded": node.html }],
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
            title: "Alban Petit — Articles",
          },
        ],
      },
    },
    {
      resolve: "gatsby-plugin-react-i18next",
      options: {
        localeJsonSourceName: "locale",
        languages: ["en", "fr"],
        defaultLanguage: "en",
        siteUrl: "https://albanpetit.com",
        trailingSlash: "always",
        i18nextOptions: {
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
