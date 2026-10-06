---
name: article
description: Writes, imports or translates a blog post for albanpetit.com, in French and English, with its front matter, images and formatting (charts, KiCad schematics, YouTube videos, Mermaid, formulas). Use whenever the user wants to publish a post (tutorial, project post, project overview), turn a note (Bear, Obsidian…) into a post, or edit an existing post.
argument-hint: "[topic, note to import or project]"
disable-model-invocation: false
---

# Posts for albanpetit.com

User request (may be empty): $ARGUMENTS

A post lives in `content/posts/<folder>/`, with `index.fr.md`, `index.en.md` and its media next to them. It is published at `/post/<slug>/` and `/fr/post/<slug>/`. Both languages have the same structure, the same images and the same tags in the same order. The user writes in French; the English version is a faithful translation, not a summary.

## Steps

1. Identify the source:
   - a note to import (often `Name.md` + a `Name/` folder at the root of the repository);
   - a topic to write with the user;
   - an existing post to edit or translate.
2. Identify the kind: a **tutorial** (category `Tutorials`), a **project post** (`project` field, see "Project posts") or a standalone post. Existing projects: `grep -h "^project:" content/posts/*/index.fr.md | sort -u`.
3. Read one or two existing posts of the same kind to match the tone and formatting: `content/posts/paperflux/` for a project, `content/posts/raspberry-ssh-configuration/` for a tutorial.
4. Write `index.fr.md`, then translate it into `index.en.md`.
5. Handle the media (see "Media").
6. Check with `npm run lint` then `npm run build`, and fix whatever fails.
7. Summarize: title, URL, description, tags, category or linked project, and the media that were reduced or renamed. Do not commit: the user will run the `commit` skill.

## Front matter

```md
---
title: "Axon, partie 1 : concevoir un fond de panier modulaire pour mes robots"
slug: axon-design          # same in FR and EN, kebab-case; it is the URL and never changes once published
lang: fr
date: 2026-09-28           # publication date, today by default (date +%F)
lastmod: 2026-10-02        # only when editing a published post
description: "150 à 160 caractères qui donnent envie de lire : le quoi et le comment."
tags:
  - Électronique
  - PCB
  - KiCad
category: Tutorials        # tutorials only
project: Axon              # project posts only: project name, identical in FR and EN
overview: true             # project overview only
status: in-progress        # overview only: in-progress (default) or done
image: main.jpg            # cover image, in the post folder
---
```

- Quote `title` and `description` whenever they contain `:`.
- **Tags**: 3 to 5, translated, **in the same order** in FR and EN (the site pairs tag pages by position). Reuse existing tags before creating new ones: `grep -h -A6 "^tags:" content/posts/*/index.fr.md`.
- **Category**: `Tutorials` for a tutorial, nothing otherwise. A project post has no category: its `project` field marks it, and the site shows a "Project" badge instead. A new category must be translated in `categories` in `locales/en/translation.json` and `locales/fr/translation.json`; ask the user before creating one.
- **Cover**: `main.jpg` in landscape format, still readable once cropped to 16:9. It also serves as the social media preview.

## Project posts

A project is nothing more than the posts that share the same `project`: there is no project page to create. The user's logs stay in their personal notes; they are material for the posts but are not published.

- **`project: <Name>`** in both languages, written identically: the name gives the project's address (`Axon` → `/projects/axon/`, which redirects to its landing page). Reuse the exact name of an existing project; a variant (`axon`, `AXON`) creates a conflict that makes the build fail.
- **A single post**: it is displayed like any other post, and its card on `/projects/` links straight to it. If the project is finished, this post is its overview: add `overview: true` and `status: done`.
- **Several posts**: they form a series, and the project **must** have an overview, which serves as its landing page (otherwise the build fails). Each post shows the list of the series below its header. Number them in the title ("Axon, part 2: the prototype"), give a slug that names the stage (`axon-design`, `axon-prototype`), and announce what comes next at the end of the post.
- **The overview** (`overview: true`, only one per project) is the project's landing page: it is where the project list, the home page and the badges lead. It comes first in the series. It can be written from the start and expanded as parts are published; its `status` gives the project's status (`in-progress` by default, `done` once finished). It introduces the project and guides the reader to the posts in the series, with links where they help ("the connector choice is detailed in [part 1](/post/axon-design/)").
- A post written from work notes is a synthesis of them: tell the project in the logical order of how it was built, not day by day. Keep the measurements, mistakes and abandoned choices that shed light on the result.

## Writing

- **First person**, direct and concrete tone, as in existing posts: the need, what already exists, the choices, what went wrong, the result.
- No `# Title` in the body: the page renders `title` as the h1. Headings start at `##`; `##` and `###` make up the table of contents.
- French: straight apostrophes `'`, a space before `:`, `;`, `!`, `?`. No em dash (`—`): use a colon, parentheses or a new sentence.
- English: same split into sections and paragraphs, so both versions stay easy to compare.
- Every image has alt text that describes it ("Carte PaperFlux assemblée, vue de dessus" / "Assembled PaperFlux board, top view"), never "Photo 1" or an empty alt.
- Internal links are absolute and localized: `/fr/post/axon-design/` in the French version, `/post/axon-design/` in the English version.
- Do not change the substance of the user's text without saying so. Fix spelling and typography; for broader rewording, propose it.

## Importing a note (Bear, Obsidian…)

- Remove tag lines (`#projets/axon`, `#website/to-publish`…).
- The `# Title` on the first line becomes the `title`; the note often has a title without punctuation ("Axon Concevoir un fond de panier…"), restore it ("Axon : concevoir…").
- Remove layout comments (`<!-- {"width":523} -->`) and put back a blank line before and after every image, list and heading.
- Replace `’` with `'`.
- Move the images into the post folder, rename them in descriptive kebab-case (`vme-bus-chassis.png`, not `d469a6b2-….jpg` or `AC104.png.webp`) and update the links.
- An image found on the web (press photo, Wikimedia…) must credit its source and license below the image. If they are unknown, tell the user instead of publishing without them.
- Do not delete the original note: tell the user it can be deleted once the import is approved.

## Available formatting

- **Images**: `![alt](file.jpg)`. Several images on the same line, separated by a space, form a row (3 per line at most); a single image takes the full width. A clickable image `[![alt](img.jpg)](url)` works too.
- **Downloadable file** (PDF, STL…): a relative link `[ADXL335 datasheet](datasheet-adxl-335.pdf)`; the file is copied with the site.
- **Chart from a CSV**: put the CSV next to the post's images and add a ` ```chart ` block. Chart.js draws it, with the data as a table below (and in the RSS feed) plus a download link:
  ````md
  ```chart
  file: ./temperatures.csv   # required, relative to the post
  type: line                 # line (default), bar, scatter, pie, doughnut, or table for the table alone
  title: Temperature over a day
  x: hour                    # label column, the first one by default
  y: [inside, outside]       # plotted columns, every other one by default
  xLabel: Hour
  yLabel: °C
  ```
  ````
  `,`, `;` and tab delimiters and French decimals (`19,5`) are accepted; an empty cell is a gap. A typo in an option or a column name fails the build. After editing only a CSV, restart with `npm run dev -- --force` (Astro caches rendered posts).
- **Diagram**: a ` ```mermaid ` block.
- **Formulas**: `$…$` inline, `$$…$$` as a block.
- **Table**: standard Markdown. A summary table without a header (`| | |`) at the start of the post, as in PaperFlux, works well for a project.
- **Interactive KiCad schematic and PCB**:
  ```html
  <div class="kicad-embed">
    <kicanvas-embed src="https://raw.githubusercontent.com/albanpetit/<repo>/main/ecad/<name>.kicad_sch" controls="full"></kicanvas-embed>
  </div>
  ```
  Two `kicad-embed` blocks inside a `<div class="kicad-embed-pair">` are shown side by side.
- **Interactive 3D model from a STEP file** (straight from the CAD repository):
  ```html
  <div class="step-embed" data-src="https://raw.githubusercontent.com/albanpetit/<repo>/main/mcad/main/step/<name>.step" data-transparent="panel-plate">
    <a href="https://github.com/albanpetit/<repo>/blob/main/mcad/main/step/<name>.step">STEP file on GitHub</a>
  </div>
  ```
  `data-parts="macmini"` shows only the parts whose name contains that fragment; `data-transparent` draws the matching parts see-through. Both are optional, comma-separated. Write the link text in the post's language.
- **YouTube video** (never a video in the repository):
  ```html
  <div class="youtube-embed">
    <iframe src="https://www.youtube-nocookie.com/embed/<ID>" title="…" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
  </div>
  ```
  `youtube-embed youtube-embed--vertical` for a Short; two videos inside a `<div class="media-row">` are shown side by side.
- **Vertical video next to the intro text**: the embed inside `<div class="float-left">…</div>`, the paragraphs, then `<div class="clearfix"></div>`.
- **GitHub repository card**: copy the `<a class="repo-card" …>` block at the start of `content/posts/paperflux/index.fr.md` and change the repository and description.

Leave a blank line before and after every HTML block, otherwise the Markdown that follows is not parsed.

## Media

Follow the "Media" section of the `commit` skill (`.claude/skills/commit/SKILL.md`) as soon as the file is added: 2,000 px at most on the longest side, about 500 KB for a photo or a screenshot, 5 MB at most for a PDF or an STL, never a video. Shrink in place with that skill's commands, and tell the user which files you modified, with their dimensions and size before and after.
