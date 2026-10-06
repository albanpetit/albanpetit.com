# albanpetit.com

<p align="center">
  <img src="docs/screenshot.png" alt="albanpetit.com home page" width="auto" />
</p>

<p align="center">
  A bilingual personal blog covering electronics, embedded systems, web development, and maker projects.
</p>

<p align="center">
  <a href="https://albanpetit.com">albanpetit.com</a> &nbsp;·&nbsp;
  <a href="https://albanpetit.com/blog/">Blog</a> &nbsp;·&nbsp;
  <a href="https://albanpetit.com/about/">About</a>
</p>

> This repository is the source of my personal site, not a starter template. It's shared for transparency and so anyone spotting a bug, typo, or accessibility issue can send a fix, not to be forked into someone else's blog.

---

## Contributing

Fixes and small improvements (bugs, typos, accessibility, broken links…) are welcome.

**Requirements:** Node.js 22 (see `.nvmrc`)

```bash
npm install
npm run dev            # dev server at http://localhost:4321
```

1. Fork the repository
2. Create a branch: `git checkout -b fix/my-fix`
3. Run `npm run lint` and `npm run type-check`, then commit following the convention below
4. Open a Pull Request

### Commit convention

Messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), in English: `type(scope): short description`, in the imperative mood.

| Type       | Usage                                            |
| ---------- | ------------------------------------------------ |
| `feat`     | New feature                                      |
| `fix`      | Bug fix                                          |
| `content`  | Add or update a post                             |
| `style`    | Formatting only, no change in meaning            |
| `refactor` | Code restructuring without behaviour change      |
| `perf`     | Performance improvement                          |
| `docs`     | Documentation only                               |
| `chore`    | Dependencies, config, tooling, maintenance       |

```
fix(seo): escape '<' in JSON-LD so titles cannot close the script tag
content: add adxl335 accelerometer post
```

---

## Feedback

Found a bug or have a suggestion? [Open an issue](https://github.com/albanpetit/albanpetit.com/issues).
