---
title: "Mini Rack, partie 2 : un support de Mac mini imprimé en 3D"
slug: rack-10inch-mac-mini
lang: fr
date: 2026-10-03
description: "Un support 1U imprimé en 3D pour loger un Mac mini M1 dans mon rack 10 pouces, ports en façade, avec un relais de bouton d'alimentation et un passe-câble."
tags:
  - Home lab
  - Impression 3D
  - FreeCAD
project: Mini Rack
image: main.jpg
---

Le rack 10 pouces est assemblé (sa fabrication est racontée dans [la présentation du projet](/fr/post/rack-10inch/)), il reste à le remplir. La première machine à y entrer est un **Mac mini M1**. Petit, silencieux et peu gourmand, c'est un excellent serveur domestique. Mais il n'a rien d'un équipement rack : pas d'oreilles, pas de façade, et une forme carrée de 19,7 cm de côté pour 3,6 cm de haut.

Il lui faut donc un support. Celui-ci tient en **1 U**, s'imprime d'une seule pièce et règle les deux petits problèmes que pose un Mac mini en rack : appuyer sur son bouton d'alimentation, et tenir son câble secteur.

<!-- À COMPLÉTER : le rôle du Mac mini dans le home lab (services hébergés, système, etc.). -->

<a class="repo-card" href="https://github.com/albanpetit/rack-10inch" target="_blank" rel="noopener noreferrer">
  <svg class="repo-card-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
  <span class="repo-card-body">
    <span class="repo-card-name">albanpetit/rack-10inch</span>
    <span class="repo-card-desc">Modèle FreeCAD et exports STEP, STL, DXF et 3MF</span>
  </span>
  <svg class="repo-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
</a>

| | |
|---|---|
| **Format** | 1 U, façade 10 pouces |
| **Dimensions** | 255 × 205 × 44 mm |
| **Pièces** | Le support, un relais de bouton et deux demi-colliers de passe-câble |
| **Impression** | PLA blanc et bleu, sur une Bambu Lab A1, supports arborescents |
| **Conception** | FreeCAD, modèle dédié dans le dépôt du rack |

## Le principe : le Mac mini à l'envers

Sur un Mac mini, toute la connectique est à l'arrière : alimentation, Ethernet, HDMI, Thunderbolt, USB. Dans un rack, l'arrière est difficile d'accès. J'ai donc retourné le problème : le Mac mini est installé **à l'envers**, sa face arrière tournée vers l'avant du rack. La façade du support est une plaque 1U découpée à la forme de la connectique, et tous les ports restent accessibles sans rien démonter.

Derrière la façade, un bac reçoit le Mac mini. Son fond est ajouré en cercle, au droit de l'entrée d'air située sous la machine, pour ne pas l'étouffer.

Le support a son propre modèle FreeCAD, dans le [dossier `mac-m1-rack-mount`](https://github.com/albanpetit/rack-10inch/tree/main/mcad/mac-m1-rack-mount) du dépôt du rack, avec ses exports STEP, STL et 3MF. La visionneuse ci-dessous affiche son fichier STEP.

<div class="step-embed" data-src="https://raw.githubusercontent.com/albanpetit/rack-10inch/main/mcad/mac-m1-rack-mount/step/assembly.step">
  <a href="https://github.com/albanpetit/rack-10inch/blob/main/mcad/mac-m1-rack-mount/step/assembly.step">Fichier STEP du support sur GitHub</a>
</div>

## L'impression

Le support s'imprime d'une seule pièce, en PLA blanc. La façade déborde largement du bac : pendant l'impression, elle est soutenue par des supports arborescents.

![Support de Mac mini sur le plateau de la Bambu Lab A1, la façade soutenue par des supports arborescents](mount-printing.jpg) ![Support de Mac mini sorti de l'imprimante, avec le fond ajouré en cercle et les supports arborescents encore en place](mount-tree-supports.jpg)

## Le bouton d'alimentation

Le bouton d'alimentation du Mac mini est sur sa face arrière, donc en façade une fois la machine retournée. Mais il se retrouve en retrait derrière la plaque, hors de portée du doigt. Une petite pièce bleue imprimée sert de **relais** : elle coulisse dans un trou de la façade et vient appuyer sur le vrai bouton. Le point bleu visible en façade, c'est elle.

![Relais du bouton d'alimentation, petite pièce bleue imprimée](power-button-relay.jpg) ![Relais du bouton d'alimentation vu depuis l'intérieur du bac](power-button-inside.jpg)

## Le passe-câble

Le câble secteur sort par une fente de la façade. Pour éviter qu'un geste malheureux tire sur la prise du Mac mini, deux demi-colliers bleus se vissent de part et d'autre de la fente et serrent le câble.

![Les pièces bleues imprimées : relais du bouton et les deux demi-colliers du passe-câble](cable-clip-button-parts.jpg)

![Câble secteur passé dans la fente de la façade](cable-slot.jpg) ![Demi-colliers bleus refermés sur le câble](cable-clip-closed.jpg) ![Passe-câble vu depuis l'avant de la façade](cable-clip-front.jpg)

## Le montage

Le Mac mini se pose dans le bac, câble branché, puis le support se visse sur les rails du rack avec des vis M5, directement dans les écrous en T des montants.

![Mac mini posé dans son support, connectique tournée vers la façade](mac-mini-in-mount.jpg) ![Mac mini installé en bas du rack, ports accessibles en façade et passe-câble en place](mount-installed.jpg)

<!-- PHOTO À AJOUTER : gros plan sur la façade avec les câbles Ethernet et HDMI branchés. -->

## Même principe pour le chargeur USB-C

Quelques jours plus tard, le même principe m'a servi pour un chargeur USB-C six ports de 140 W : une façade 1U découpée à la forme de ses ports, et un bac qui le tient. Il trouve sa place juste au-dessus du Mac mini.

![Chargeur USB-C six ports monté dans son support 1U imprimé](usb-charger-mount.jpg) ![Rack avec le chargeur USB-C au-dessus du Mac mini](rack-mac-mini-charger.jpg)

## La suite

Le rack a maintenant sa première machine et de quoi alimenter les suivantes. La prochaine étape : y installer les services du home lab.
