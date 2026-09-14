# albanpetit.com

<p align="center">
  <img src="docs/screenshot.png" alt="albanpetit.com home page" width="auto" />
</p>

<p align="center">
  A bilingual personal blog covering electronics, embedded systems, web development, and maker projects.<br/>
  Built as a fully static site with Gatsby, deployed on GitHub Pages, and designed for fast reading and strong SEO.
</p>

<p align="center">
  <a href="https://albanpetit.com">albanpetit.com</a> &nbsp;·&nbsp;
  <a href="https://albanpetit.com/blog/">Blog</a> &nbsp;·&nbsp;
  <a href="https://albanpetit.com/about/">About</a>
</p>

> This repository is the source of my personal site, not a starter template. It's shared for transparency and so anyone spotting a bug, typo, or accessibility issue can send a fix — not to be forked into someone else's blog.

---

## Stack

| Tool                                                                                     | Role                                        |
| ---------------------------------------------------------------------------------------- | -------------------------------------------- |
| [Gatsby 5](https://www.gatsbyjs.com/)                                                    | Static site generator (React + GraphQL)     |
| [shadcn/ui](https://ui.shadcn.com/)                                                      | Component library (Radix UI + Tailwind CSS) |
| [Tailwind CSS](https://tailwindcss.com/)                                                 | Utility-first styling                       |
| [TypeScript](https://www.typescriptlang.org/)                                            | Type safety throughout                      |
| [gatsby-transformer-remark](https://www.gatsbyjs.com/plugins/gatsby-transformer-remark/) | Markdown → HTML processing                  |
| [gatsby-plugin-image](https://www.gatsbyjs.com/plugins/gatsby-plugin-image/)             | Responsive lazy-loaded images               |
| [gatsby-plugin-react-i18next](https://github.com/microapps/gatsby-plugin-react-i18next)  | EN / FR bilingual support                   |
| [Fuse.js](https://fusejs.io/)                                                            | Client-side fuzzy search                    |
| [Giscus](https://giscus.app/)                                                            | GitHub Discussions-powered comments         |
| [Biome](https://biomejs.dev/)                                                            | Linting and formatting                      |

---

## Getting started

**Requirements:** Node.js 22 (see `.nvmrc`)

The devcontainer keeps `node_modules` in a named Docker volume (reading it through the host file share makes builds crawl). After pulling changes to `package-lock.json`, run `npm ci`.

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
npm run lint           # Biome lint + formatting check (run in CI)
npm run format         # apply Biome formatting
```

---

## Contributing

Not a template to build on, but fixes and small improvements (bugs, typos, accessibility, broken links…) are genuinely welcome:

1. Fork the repository
2. Create a branch: `git checkout -b fix/my-fix`
3. Run `npm run lint` and `npm run type-check`, then commit following the convention below
4. Open a Pull Request

### Commit convention

Format: `type(scope): short description`

| Type       | Usage                                       |
| ---------- | ------------------------------------------- |
| `feat`     | New feature                                 |
| `fix`      | Bug fix                                     |
| `style`    | Visual / CSS changes only                   |
| `refactor` | Code restructuring without behaviour change |
| `perf`     | Performance improvement                     |
| `chore`    | Config, tooling, maintenance                |
| `docs`     | Documentation only                          |
| `content`  | Add or update a post / content              |

Common scopes: `ui` · `prose` · `seo` · `post` · `home` · `layout` · `i18n` · `ux` · `comments` · `tags` · `categories` · `search` · `content`

```
feat(post): add reading progress bar
fix(ui): change logo to yellow
refactor: extract PostCard as shared component
chore: add .gitkeep to empty content/images directory
docs: rewrite README for Gatsby stack
content: add adxl335 accelerometer post
```

---

## Feedback

Found a bug or have a suggestion? [Open an issue](https://github.com/albanpetit/albanpetit.com/issues).
