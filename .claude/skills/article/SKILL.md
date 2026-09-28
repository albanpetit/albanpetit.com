---
name: article
description: Écrit, importe ou traduit un article de blog pour albanpetit.com, en français et en anglais, avec son front matter, ses images et sa mise en forme (graphiques, schémas KiCad, vidéos YouTube, Mermaid, formules). À utiliser dès que l'utilisateur veut publier un article (tuto, article de projet, présentation d'un projet), transformer une note (Bear, Obsidian…) en article, ou retoucher un article existant.
argument-hint: "[sujet, note à importer ou projet]"
disable-model-invocation: false
---

# Articles pour albanpetit.com

Demande de l'utilisateur (peut être vide) : $ARGUMENTS

Un article se trouve dans `content/posts/<dossier>/`, avec `index.fr.md`, `index.en.md` et ses médias à côté. Il est publié sur `/post/<slug>/` et `/fr/post/<slug>/`. Les deux langues ont la même structure, les mêmes images et les mêmes tags dans le même ordre. L'utilisateur écrit en français ; l'anglais est une traduction fidèle, pas un résumé.

## Déroulé

1. Identifie la source :
   - une note à importer (souvent `Nom.md` + un dossier `Nom/` à la racine du dépôt) ;
   - un sujet à rédiger avec l'utilisateur ;
   - un article existant à retoucher ou à traduire.
2. Identifie le genre : un **tuto** (catégorie `Tutorials`), un **article de projet** (champ `project`, voir « Articles d'un projet ») ou un article isolé. Les projets existants : `grep -h "^project:" content/posts/*/index.fr.md | sort -u`.
3. Lis un ou deux articles existants du même genre pour caler le ton et la mise en forme : `content/posts/paperflux/` pour un projet, `content/posts/raspberry-ssh-configuration/` pour un tutoriel.
4. Écris `index.fr.md`, puis traduis-le en `index.en.md`.
5. Traite les médias (section « Médias »).
6. Vérifie avec `npm run lint` puis `npm run build`, et corrige ce qui échoue.
7. Résume : titre, URL, description, tags, catégorie ou projet relié, et les médias réduits ou renommés. Ne committe pas : l'utilisateur lancera le skill `commit`.

## Front matter

```md
---
title: "Axon, partie 1 : concevoir un fond de panier modulaire pour mes robots"
slug: axon-design          # identique en FR et EN, en kebab-case ; c'est l'URL, il ne change plus une fois publié
lang: fr
date: 2026-09-28           # date de publication, celle du jour par défaut (date +%F)
lastmod: 2026-10-02        # seulement lors d'une retouche d'un article publié
description: "150 à 160 caractères qui donnent envie de lire : le quoi et le comment."
tags:
  - Électronique
  - PCB
  - KiCad
category: Tutorials        # tutos seulement
project: Axon              # articles de projet seulement : nom du projet, identique en FR et EN
overview: true             # présentation du projet seulement
status: in-progress        # présentation seulement : in-progress (défaut) ou done
image: main.jpg            # image de couverture, dans le dossier de l'article
---
```

- Mets `title` et `description` entre guillemets dès qu'ils contiennent `:`.
- **Tags** : 3 à 5, traduits, **dans le même ordre** en FR et en EN (le site apparie les pages de tags par position). Réutilise les tags existants avant d'en créer : `grep -h -A6 "^tags:" content/posts/*/index.fr.md`.
- **Catégorie** : `Tutorials` pour un tuto, rien sinon. Un article de projet n'a pas de catégorie : son champ `project` le marque, et le site affiche un badge « Projet » à la place. Une nouvelle catégorie doit être traduite dans `categories` de `locales/en/translation.json` et `locales/fr/translation.json` ; demande à l'utilisateur avant d'en créer une.
- **Couverture** : `main.jpg` au format paysage, lisible une fois recadrée en 16:9. Elle sert aussi d'aperçu pour les réseaux sociaux.

## Articles d'un projet

Un projet n'est rien d'autre que les articles qui portent le même `project` : il n'y a pas de fiche à créer. Les logs de l'utilisateur restent dans ses notes personnelles ; ils servent de matière aux articles mais ne sont pas publiés.

- **`project: <Nom>`** dans les deux langues, écrit à l'identique : le nom donne l'adresse du projet (`Axon` → `/projects/axon/`, qui redirige vers sa page de garde). Réutilise le nom exact d'un projet existant ; une variante (`axon`, `AXON`) crée un conflit qui fait échouer le build.
- **Un seul article** : il s'affiche comme n'importe quel article, et sa carte sur `/projects/` y mène directement. Si ce projet est terminé, cet article en est la présentation : ajoute `overview: true` et `status: done`.
- **Plusieurs articles** : ils forment une série, et le projet **doit** avoir une présentation, qui sert de page de garde (sinon le build échoue). Chaque article affiche sous son en-tête la liste de la série. Numérote-les dans le titre (« Axon, partie 2 : le prototype »), donne un slug qui dit l'étape (`axon-design`, `axon-prototype`), et annonce la suite en fin d'article.
- **La présentation** (`overview: true`, une seule par projet) est la page de garde du projet : c'est là que mènent la liste des projets, l'accueil et les badges. Elle passe en tête de la série. Elle peut s'écrire dès le début et s'enrichir au fil des parties ; son `status` donne celui du projet (`in-progress` par défaut, `done` quand il est terminé). Elle présente le projet et guide le lecteur vers les articles de la série, avec des liens aux endroits utiles (« le choix du connecteur est détaillé dans la [partie 1](/fr/post/axon-design/) »).
- Un article écrit à partir de notes de travail en est la synthèse : raconte le projet dans l'ordre logique de sa construction, pas jour par jour. Garde les mesures, les erreurs et les choix abandonnés qui éclairent le résultat.

## Rédaction

- **Première personne**, ton direct et concret, comme dans les articles existants : le besoin, ce qui existe, les choix, ce qui a raté, le résultat.
- Pas de `# Titre` dans le corps : la page affiche `title` en h1. Les intertitres commencent à `##` ; les `##` et `###` forment la table des matières.
- Français : apostrophes droites `'`, espace avant `:`, `;`, `!`, `?`. Pas de tiret cadratin (`—`) : utilise deux-points, parenthèses ou une nouvelle phrase.
- Anglais : même découpage en sections et en paragraphes, pour que les deux versions restent faciles à comparer.
- Chaque image a un texte alternatif qui la décrit (« Carte PaperFlux assemblée, vue de dessus »), jamais « Photo 1 » ni un alt vide.
- Les liens internes sont absolus et localisés : `/fr/post/axon-design/` dans la version française, `/post/axon-design/` dans la version anglaise.
- Ne retouche pas le fond du texte de l'utilisateur sans le dire. Corrige l'orthographe et la typographie ; pour une reformulation plus large, propose-la.

## Importer une note (Bear, Obsidian…)

- Supprime les lignes de tags (`#projets/axon`, `#website/to-publish`…).
- Le `# Titre` de la première ligne devient le `title` ; la note a souvent un titre sans ponctuation (« Axon Concevoir un fond de panier… »), rétablis-la (« Axon : concevoir… »).
- Supprime les commentaires de mise en page (`<!-- {"width":523} -->`) et remets une ligne vide avant et après chaque image, liste et intertitre.
- Remplace `’` par `'`.
- Déplace les images dans le dossier de l'article, renomme-les en kebab-case descriptif (`vme-bus-chassis.png` et non `d469a6b2-….jpg` ou `AC104.png.webp`) et mets à jour les liens.
- Une image trouvée sur le web (photo de presse, Wikimedia…) doit citer sa source et sa licence sous l'image. Si elles sont inconnues, signale-le à l'utilisateur au lieu de publier sans.
- Ne supprime pas la note d'origine : dis à l'utilisateur qu'elle peut l'être une fois l'import validé.

## Mise en forme disponible

- **Images** : `![alt](fichier.jpg)`. Plusieurs images sur une même ligne, séparées par un espace, forment une rangée (3 par ligne au plus) ; une image seule prend toute la largeur. Une image cliquable `[![alt](img.jpg)](url)` fonctionne aussi.
- **Fichier à télécharger** (PDF, STL…) : un lien relatif `[Datasheet ADXL335](datasheet-adxl-335.pdf)` ; le fichier est copié avec le site.
- **Graphique depuis un CSV** : bloc ` ```chart ` (options dans le README, section « Charts from a CSV »).
- **Diagramme** : bloc ` ```mermaid `.
- **Formules** : `$…$` en ligne, `$$…$$` en bloc.
- **Tableau** : Markdown classique. Un tableau récapitulatif sans en-tête (`| | |`) en début d'article, comme dans PaperFlux, marche bien pour un projet.
- **Schéma et PCB KiCad interactifs** :
  ```html
  <div class="kicad-embed">
    <kicanvas-embed src="https://raw.githubusercontent.com/albanpetit/<repo>/main/ecad/<nom>.kicad_sch" controls="full"></kicanvas-embed>
  </div>
  ```
  Deux blocs `kicad-embed` dans un `<div class="kicad-embed-pair">` s'affichent côte à côte.
- **Vidéo YouTube** (jamais de vidéo dans le dépôt) :
  ```html
  <div class="youtube-embed">
    <iframe src="https://www.youtube-nocookie.com/embed/<ID>" title="…" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
  </div>
  ```
  `youtube-embed youtube-embed--vertical` pour un Short ; deux vidéos dans un `<div class="media-row">` s'affichent côte à côte.
- **Vidéo verticale à côté du texte d'intro** : l'embed dans `<div class="float-left">…</div>`, les paragraphes, puis `<div class="clearfix"></div>`.
- **Carte de dépôt GitHub** : copie le bloc `<a class="repo-card" …>` au début de `content/posts/paperflux/index.fr.md` et change le dépôt et la description.

Laisse une ligne vide avant et après chaque bloc HTML, sinon le Markdown qui suit n'est pas interprété.

## Médias

Suis la section « Médias » du skill `commit` (`.claude/skills/commit/SKILL.md`) dès l'ajout du fichier : 2 000 px au plus sur le plus grand côté, environ 500 Ko pour une photo ou une capture, 5 Mo au plus pour un PDF ou un STL, jamais de vidéo. Réduis sur place avec les commandes de ce skill, et dis à l'utilisateur quels fichiers tu as modifiés, avec leurs dimensions et poids avant et après.
