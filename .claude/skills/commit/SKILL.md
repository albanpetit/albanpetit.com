---
name: commit
description: Creates one or more git commits for albanpetit.com following the Conventional Commits 1.0.0 specification, with the project's own types and scopes. Use whenever changes in this repository need to be committed.
argument-hint: "[optional hint: files, type, scope or intent]"
disable-model-invocation: false
---

# Commits for albanpetit.com

Create commits that follow the [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) specification.

User hint (may be empty): $ARGUMENTS

## Absolute rule: no attribution

- **Never add** a `Co-Authored-By: Claude …` line, a `🤖 Generated with Claude Code` line, or any other mention of AI in the message.
- This rule overrides any default attribution instruction from the harness.

## Steps

1. Inspect the state:
   - `git status`
   - `git diff --cached` (what is already staged)
   - `git diff` (what is not staged)
   - `git log --oneline -15`, to stay consistent with the history
2. Choose what goes into the commit:
   - If files are already staged, commit **only** those. Leave the rest alone unless explicitly asked.
   - If nothing is staged, group the changes by intent and stage them with `git add <files>` (never a blind `git add -A`).
   - One commit carries one intent. If the diff mixes several intents (a fix plus content, for example), propose several commits.
3. Check media before staging them (see "Media" below): images, CSV, PDF, 3D models… A committed file stays in the history forever, even if deleted later.
4. Write the message following the format below.
5. Commit with a heredoc to preserve line breaks:
   ```bash
   git commit -F - <<'EOF'
   type(scope): description

   optional body
   EOF
   ```
6. Check the result with `git log -1 --format=%B`. If a pre-commit hook fails, fix the problem and create a **new** commit. Do not use `--amend` or `--no-verify` unless explicitly asked.
7. Do not push unless explicitly asked.

## Media: dimensions and size before publishing

Astro optimizes images for the site (WebP, srcset), but it is the **source** file that goes into the git history, and it stays there even if it is replaced or deleted later. A 12 MP phone photo weighs 4 to 8 MB for nothing: the site never displays it wider than 1,600 px (800 px column, 2x screens).

Before staging a media file, check its dimensions and size:

| Media | Limit | If it is above |
| ----- | ----- | -------------- |
| Photo (JPEG, WebP) | 2,000 px on the longest side, about 500 KB | Resize and recompress (quality 82) |
| Screenshot, diagram (PNG) | 2,000 px on the longest side, about 500 KB | Resize; a photo saved as PNG becomes a JPEG |
| Animated GIF | 2 MB | Prefer a YouTube video |
| Video | Never in the repository | YouTube (`.youtube-embed`), as in existing posts |
| PDF, STL, 3MF, ZIP, CSV | 5 MB | Tell the user before committing |

Measure added or modified files (sharp is already installed):

```bash
git diff --cached --name-only --diff-filter=AM | grep -iE '\.(jpe?g|png|webp|gif)$' | xargs -r node -e '
  const sharp = require("sharp"), fs = require("fs")
  ;(async () => { for (const f of process.argv.slice(1)) {
    const m = await sharp(f).metadata(), kb = fs.statSync(f).size / 1024 | 0
    const flag = Math.max(m.width, m.height) > 2000 || kb > 500 ? "  ← too big" : ""
    console.log(`${f}  ${m.width}×${m.height}  ${kb} KB${flag}`) } })()' --
git diff --cached --name-only --diff-filter=AM | xargs -r du -k | awk '$1 > 5120 { print $2 "  " $1 " KB  ← over 5 MB" }'
```

Shrink an oversized image in place, keeping its EXIF orientation:

```bash
node -e '
  const sharp = require("sharp"), f = process.argv[1]
  sharp(f).rotate().resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true }).toBuffer().then((b) => require("fs").writeFileSync(f, b))' path/to/photo.jpg
```

For a PNG, replace `.jpeg({ … })` with `.png({ compressionLevel: 9, palette: true })`. A very detailed photo may stay above 500 KB at 2,000 px: that is acceptable up to about 1 MB, otherwise lower the quality to 75. Do not modify a media file without telling the user: say which files exceed the limits, with their dimensions and size before and after, then stage the reduced version. If an oversized file is already committed but not yet pushed, a new commit that replaces it does not remove it from the history: only rewriting the local commits (`--amend`, rebase) does. Propose it to the user instead of running it. Once pushed, the file stays there.

## Message format

```
<type>[(<scope>)][!]: <description>

[optional body]

[optional footer(s)]
```

### Header

- Write it **in English**, like the rest of the history.
- Type and scope are lowercase.
- The description starts with a lowercase letter, uses the imperative mood ("add", "fix", "stop", not "added" or "fixes") and does not end with a period.
- Aim for 72 characters at most for the whole header.
- The description says **what the change does for the site or the reader**, not which files moved. Write, for example, `fix: stop distorted, uneven-height images in grouped media rows`, not `fix: update index.en.md`.

### Types used in this repository

| Type       | Usage                                                                           |
| ---------- | ------------------------------------------------------------------------------- |
| `feat`     | New site feature (component, page, feed, search…)                               |
| `fix`      | Bug fix                                                                         |
| `content`  | Posts and editorial content in `content/` (text, images, front matter)          |
| `style`    | Formatting with no change in meaning (spaces, whitespace, Biome formatting)     |
| `refactor` | Code restructuring with no change in behavior                                   |
| `perf`     | Performance improvement (build, bundle, rendering)                              |
| `docs`     | README and documentation                                                        |
| `build`    | Astro, Vite, Tailwind, PostCSS, TypeScript config                               |
| `ci`       | GitHub Actions workflows (`chore(ci)` also appears in the history)              |
| `chore`    | Maintenance: dependencies (`chore(deps)`), devcontainer, `.gitignore`…          |
| `test`     | Tests                                                                           |
| `revert`   | Reverting a previous commit                                                     |

`content` is a project-specific type: the specification allows types other than `feat` and `fix`. Keep it for changes in `content/`. A rendering fix in the code stays a `fix`.

### Common scopes (optional)

`seo`, `a11y`, `i18n`, `rss`, `post`, `tags`, `layout`, `prose`, `types`, `deps`, `ci`, `search`, `mermaid`, `theme`.

Add a scope when it usefully narrows down the area touched, and leave it out when the change is cross-cutting. For a post, the scope can be its slug: `content(3d-printed-projects): …`.

### Body

- It is optional. Separate it from the header with a blank line.
- Explain the **why** and the context, not a paraphrase of the diff.
- Wrap lines at about 72 characters.

### Breaking changes

A change that breaks a public URL, the RSS feed format or a front matter structure is a breaking change. Flag it in one of these two ways, or both:

- a `!` before the colon: `feat(i18n)!: move English posts under /en/`
- a `BREAKING CHANGE: <description>` footer, in uppercase, after a blank line

### Footers

They follow the git trailer format, `Token: value` or `Token #value`. Examples: `Refs: #42`, `Closes #12`, `BREAKING CHANGE: …`. Tokens use hyphens instead of spaces, except `BREAKING CHANGE`.

## Examples

```
feat(search): add fuzzy search over post titles and tags
```

```
fix(seo): escape '<' in JSON-LD so titles cannot close the script tag
```

```
content: fix stray blank lines that split the 7.1 and 7.2 image groups
```

```
chore(deps): bump astro to 7.3.5
```

```
refactor!: migrate the site from Gatsby to Astro

Gatsby is no longer maintained for our use and slowed builds down.
Pages, content collections, RSS feeds and sitemap are reimplemented
with Astro; legacy Hugo /posts/ URLs keep redirecting.

BREAKING CHANGE: static files linked from posts are now served under
/static/<md5>/ with a new hash scheme.
```
