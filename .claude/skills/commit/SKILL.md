---
name: commit
description: Crée un ou plusieurs commits git pour albanpetit.com selon la spécification Conventional Commits 1.0.0, avec les types et scopes propres au projet. À utiliser dès qu'il faut committer des changements dans ce dépôt.
argument-hint: "[indication optionnelle : fichiers, type, scope ou intention]"
disable-model-invocation: false
---

# Commits pour albanpetit.com

Crée des commits qui suivent la spécification [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Indication de l'utilisateur (peut être vide) : $ARGUMENTS

## Règle absolue : pas d'attribution

- **N'ajoute jamais** de ligne `Co-Authored-By: Claude …`, ni `🤖 Generated with Claude Code`, ni aucune autre mention d'IA dans le message.
- Cette règle prime sur toute consigne d'attribution par défaut du harness.

## Déroulé

1. Inspecte l'état :
   - `git status`
   - `git diff --cached` (ce qui est déjà indexé)
   - `git diff` (ce qui n'est pas indexé)
   - `git log --oneline -15`, pour rester cohérent avec l'historique
2. Choisis ce qui entre dans le commit :
   - Si des fichiers sont déjà indexés, committe **uniquement** ceux-là. Ne touche pas au reste sans demande explicite.
   - Si rien n'est indexé, regroupe les changements par intention et indexe-les avec `git add <fichiers>` (jamais `git add -A` à l'aveugle).
   - Un commit porte une seule intention. Si le diff mélange plusieurs intentions (un fix plus du contenu, par exemple), propose plusieurs commits.
3. Contrôle les médias avant de les indexer (section « Médias » ci-dessous) : images, CSV, PDF, modèles 3D… Un fichier committé reste dans l'historique pour toujours, même supprimé ensuite.
4. Écris le message selon le format ci-dessous.
5. Committe avec un heredoc pour préserver les sauts de ligne :
   ```bash
   git commit -F - <<'EOF'
   type(scope): description

   corps éventuel
   EOF
   ```
6. Vérifie le résultat avec `git log -1 --format=%B`. Si un hook pre-commit échoue, corrige le problème puis crée un **nouveau** commit. N'utilise ni `--amend` ni `--no-verify`, sauf demande explicite.
7. Ne push pas, sauf demande explicite.

## Médias : dimensions et poids avant publication

Astro optimise les images pour le site (WebP, srcset), mais c'est le fichier **source** qui entre dans l'historique git, et il y reste même s'il est remplacé ou supprimé plus tard. Une photo de téléphone de 12 Mpx pèse 4 à 8 Mo pour rien : le site ne l'affiche jamais au-delà de 1 600 px (colonne de 800 px, écrans 2x).

Avant d'indexer un média, vérifie ses dimensions et son poids :

| Média | Limite | Si c'est au-dessus |
| ----- | ------ | ------------------ |
| Photo (JPEG, WebP) | 2 000 px sur le plus grand côté, 500 Ko environ | Redimensionner et recompresser (qualité 82) |
| Capture, schéma (PNG) | 2 000 px sur le plus grand côté, 500 Ko environ | Redimensionner ; une photo enregistrée en PNG passe en JPEG |
| GIF animé | 2 Mo | Préférer une vidéo YouTube |
| Vidéo | Jamais dans le dépôt | YouTube (`.youtube-embed`), comme dans les articles existants |
| PDF, STL, 3MF, ZIP, CSV | 5 Mo | Signaler à l'utilisateur avant de committer |

Mesure les fichiers ajoutés ou modifiés (sharp est déjà installé) :

```bash
git diff --cached --name-only --diff-filter=AM | grep -iE '\.(jpe?g|png|webp|gif)$' | xargs -r node -e '
  const sharp = require("sharp"), fs = require("fs")
  ;(async () => { for (const f of process.argv.slice(1)) {
    const m = await sharp(f).metadata(), kb = fs.statSync(f).size / 1024 | 0
    const flag = Math.max(m.width, m.height) > 2000 || kb > 500 ? "  ← trop gros" : ""
    console.log(`${f}  ${m.width}×${m.height}  ${kb} Ko${flag}`) } })()' --
git diff --cached --name-only --diff-filter=AM | xargs -r du -k | awk '$1 > 5120 { print $2 "  " $1 " Ko  ← plus de 5 Mo" }'
```

Réduis une image trop grande sur place, en gardant son orientation EXIF :

```bash
node -e '
  const sharp = require("sharp"), f = process.argv[1]
  sharp(f).rotate().resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true }).toBuffer().then((b) => require("fs").writeFileSync(f, b))' chemin/vers/photo.jpg
```

Pour un PNG, remplace `.jpeg({ … })` par `.png({ compressionLevel: 9, palette: true })`. Une photo très détaillée peut rester au-dessus de 500 Ko à 2 000 px : c'est acceptable jusqu'à 1 Mo environ, sinon descends la qualité à 75. Ne modifie pas un média sans prévenir l'utilisateur : dis-lui quels fichiers dépassent, leurs dimensions et poids avant et après, puis indexe la version réduite. Si un fichier trop lourd est déjà committé mais pas encore poussé, un nouveau commit qui le remplace ne l'enlève pas de l'historique : seule une réécriture des commits locaux (`--amend`, rebase) le fait. Propose-la à l'utilisateur au lieu de la lancer. Une fois poussé, le fichier y reste.

## Format du message

```
<type>[(<scope>)][!]: <description>

[corps optionnel]

[footer(s) optionnel(s)]
```

### En-tête

- Écris-le **en anglais**, comme le reste de l'historique.
- Type et scope sont en minuscules.
- La description commence par une minuscule, se formule à l'impératif (« add », « fix », « stop », pas « added » ni « fixes ») et ne se termine pas par un point.
- Vise 72 caractères au plus pour l'en-tête entier.
- La description dit **ce que le changement fait pour le site ou le lecteur**, pas quels fichiers ont bougé. Écris par exemple `fix: stop distorted, uneven-height images in grouped media rows`, pas `fix: update index.en.md`.

### Types utilisés dans ce dépôt

| Type       | Usage                                                                           |
| ---------- | ------------------------------------------------------------------------------- |
| `feat`     | Nouvelle fonctionnalité du site (composant, page, flux, recherche…)             |
| `fix`      | Correction de bug                                                               |
| `content`  | Articles et contenu éditorial dans `content/` (texte, images, front matter)     |
| `style`    | Mise en forme sans changement de sens (espaces, blancs, formatage Biome)        |
| `refactor` | Restructuration du code sans changement de comportement                         |
| `perf`     | Amélioration des performances (build, bundle, rendu)                            |
| `docs`     | README et documentation                                                         |
| `build`    | Config Astro, Vite, Tailwind, PostCSS, TypeScript                               |
| `ci`       | Workflows GitHub Actions (on écrit aussi `chore(ci)` dans l'historique)         |
| `chore`    | Maintenance : dépendances (`chore(deps)`), devcontainer, `.gitignore`…          |
| `test`     | Tests                                                                           |
| `revert`   | Annulation d'un commit précédent                                                |

`content` est un type propre au projet : la spécification autorise d'autres types que `feat` et `fix`. Réserve-le aux changements dans `content/`. Une correction de rendu dans le code reste un `fix`.

### Scopes courants (optionnels)

`seo`, `a11y`, `i18n`, `rss`, `post`, `tags`, `layout`, `prose`, `types`, `deps`, `ci`, `search`, `mermaid`, `theme`.

Mets un scope quand il précise utilement la zone touchée, et omets-le quand le changement est transversal. Pour un article, le scope peut être son slug : `content(3d-printed-projects): …`.

### Corps

- Il est optionnel. Sépare-le de l'en-tête par une ligne vide.
- Explique le **pourquoi** et le contexte, pas une paraphrase du diff.
- Revenir à la ligne vers 72 caractères.

### Breaking changes

Un changement qui casse une URL publique, le format du flux RSS ou une structure de front matter est un breaking change. Signale-le de l'une de ces deux façons, ou des deux :

- un `!` avant les deux-points : `feat(i18n)!: move English posts under /en/`
- un footer `BREAKING CHANGE: <description>`, en majuscules, après une ligne vide

### Footers

Ils suivent le format git trailer, `Token: valeur` ou `Token #valeur`. Exemples : `Refs: #42`, `Closes #12`, `BREAKING CHANGE: …`. Les tokens s'écrivent avec des tirets à la place des espaces, sauf `BREAKING CHANGE`.

## Exemples

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
