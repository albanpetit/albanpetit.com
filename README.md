# albanpetit.com

Personal blog of Alban Petit — electronics, web development, and the maker world.

🔗 **Website:** [albanpetit.com](https://albanpetit.com)

---

## Stack

- **[Gatsby 5](https://www.gatsbyjs.com/)** — static site generator with React
- **[shadcn/ui](https://ui.shadcn.com/)** — component library built on Radix UI + Tailwind CSS
- **[Tailwind CSS](https://tailwindcss.com/)** — utility-first styling
- **[TypeScript](https://www.typescriptlang.org/)** — type safety throughout
- **[gatsby-transformer-remark](https://www.gatsbyjs.com/plugins/gatsby-transformer-remark/)** — Markdown processing
- **[gatsby-plugin-react-i18next](https://github.com/microapps/gatsby-plugin-react-i18next)** — EN/FR bilingual support
- **[Fuse.js](https://fusejs.io/)** — client-side fuzzy search
- **[Giscus](https://giscus.app/)** — GitHub Discussions-powered comments

## Features

- Bilingual content (English / French) with automatic URL routing (`/` and `/fr/`)
- Dark / light mode
- Tag pages, category pages, search page
- Post table of contents with active heading highlight
- Reading progress bar
- Cover images with responsive lazy loading
- Multi-image gallery layout in posts
- Text-wrapped float image utility (`float-left` / `float-right`)
- RSS feeds (`/rss.xml` and `/fr/rss.xml`)
- Sitemap (`/sitemap-index.xml`)
- Full SEO: Open Graph, Twitter Card, JSON-LD (Article + BreadcrumbList), hreflang, canonical URLs
- GitHub Actions deployment to GitHub Pages

---

## Getting started

**Requirements:** Node.js 20+

```bash
npm install
npm run develop        # dev server at http://localhost:8000
```

Available scripts:

```bash
npm run build          # production build → public/
npm run serve          # serve the production build locally
npm run clean          # clear .cache and public/
npm run type-check     # TypeScript check without emitting
```

---

## Project structure

```
content/
  posts/              # Blog posts — each post has index.en.md + index.fr.md
  pages/              # Static pages (about.en.md, about.fr.md)
locales/
  en/translation.json
  fr/translation.json
src/
  components/         # Layout, PostCard, PcbBackground, Giscus, Seo, shadcn/ui
  context/            # ThemeProvider
  lib/                # tag.ts — slugify helpers
  pages/              # index, blog, about, search, 404
  styles/globals.css
  templates/          # post, tag, category
static/               # favicon, logo, robots.txt, CNAME, RSS CSS
gatsby-config.ts
gatsby-node.ts        # Page creation (posts, tags, categories)
```

---

## Writing posts

Create a directory under `content/posts/<slug>/` with two files:

```
content/posts/my-post/
  index.en.md
  index.fr.md
  cover-image.jpg
  other-assets...
```

Required frontmatter:

```yaml
---
title: My Post Title
slug: my-post
lang: en           # or fr
date: 2025-01-01
lastmod: 2025-01-15
description: "Short description for SEO and cards."
tags:
  - Electronics
  - Web
category: Projects  # or Tutorials, Web, etc.
image: cover-image.jpg
---
```

### Image layout helpers

Float an image with text wrapping (wrap with blank lines inside the div):

```markdown
<div class="float-left">

![Alt text](image.jpg)

</div>

Text wraps here...

<div class="clearfix" />
```

Multiple images on the same line automatically render as a responsive gallery grid.

---

## Deployment

The site deploys automatically to GitHub Pages via GitHub Actions on every push to `main`.

To trigger manually: **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**.

DNS configuration (A records pointing to GitHub Pages):
```
A  @  185.199.108.153
A  @  185.199.109.153
A  @  185.199.110.153
A  @  185.199.111.153
CNAME  www  albanpetit.github.io
```

---

## Contribution

1. Fork the repository
2. Create a branch: `git checkout -b feat/my-feature`
3. Commit following [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add new feature
   fix: correct a bug
   style: visual/CSS changes
   content: add or update a post
   chore: tooling or config changes
   ```
4. Open a Pull Request

---

## Feedback

Found a bug or have a suggestion? [Open an issue](https://github.com/albanpetit/albanpetit.com/issues).
