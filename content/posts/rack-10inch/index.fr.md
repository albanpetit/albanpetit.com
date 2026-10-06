---
title: "Mini Rack : fabriquer un rack 10 pouces pour mon home lab"
slug: rack-10inch
lang: fr
date: 2026-10-03
description: "Un rack 10 pouces fait maison pour héberger mon home lab : profilés aluminium 20x20, pièces imprimées en 3D, panneaux découpés au laser et modèle FreeCAD."
tags:
  - Home lab
  - Impression 3D
  - CAO
  - FreeCAD
project: Mini Rack
overview: true
status: in-progress
image: main.jpg
---

Depuis longtemps, je voulais un vrai **home lab** à la maison : un endroit où faire tourner mes services personnels, mais aussi des serveurs publics, sans dépendre d'un hébergeur pour tout. Le problème, c'est la place. Une baie 19 pouces classique est faite pour une salle serveur, pas pour un coin de bureau, et mes machines (un Mac mini, de petits PC, des cartes Raspberry Pi) y flotteraient.

La solution m'est venue des vidéos de [Jeff Geerling](https://www.youtube.com/@JeffGeerling) et de son [Project MINI RACK](https://mini-rack.jeffgeerling.com/), qui recense des home labs construits dans des **racks 10 pouces** : le même principe qu'une baie de datacenter, en deux fois plus étroit. Plutôt que d'acheter un rack tout fait, j'ai voulu concevoir le mien, à partir de profilés aluminium, de pièces imprimées en 3D et de panneaux découpés au laser.

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
| **Période** | Décembre 2024 à juillet 2025 |
| **Format** | Rack 10 pouces, 10 U |
| **Cadre** | 262 × 310 × 486 mm, profilés aluminium 20x20 |
| **Fermeture** | Panneaux transparents découpés au laser, côtés aimantés |
| **Pièces imprimées** | PLA, sur une Bambu Lab A1 |
| **Outils** | FreeCAD, Bambu Studio |

Cet article raconte la fabrication du rack. La suite du projet, à commencer par le support du Mac mini, fait l'objet d'articles dédiés (voir [les étapes du projet](#les-étapes-du-projet)).

## Pourquoi un rack 10 pouces

Un rack 10 pouces reprend tout ce qui fait le succès des baies 19 pouces : des équipements empilés en unités de hauteur (1 U = 44,45 mm), vissés sur des rails percés au pas standard, avec l'alimentation et le câblage regroupés. Seule la largeur change : 254 mm de façade au lieu de 483 mm. C'est exactement la taille des machines d'un home lab moderne : mini PC, Mac mini, Raspberry Pi, petits switchs.

Mon cahier des charges :

- **Compact** : le rack doit tenir sur un meuble, pas dans un placard technique.
- **Ventilé** : des machines qui tournent en continu ont besoin d'un flux d'air, pas d'une boîte fermée.
- **Une seule prise** : une multiprise intégrée, pour qu'un seul câble sorte du rack.
- **Accessible** : les panneaux latéraux doivent s'enlever sans outil, et l'intérieur rester visible.
- **Transportable** : des poignées sur le dessus, pour le déplacer d'un bloc.

<!-- À COMPLÉTER : la liste des services personnels et des serveurs publics que le rack héberge ou hébergera. -->

## La conception dans FreeCAD

Tout le rack est modélisé dans FreeCAD, avec l'atelier Assembly : les profilés, les pièces imprimées, les panneaux, mais aussi les pièces achetées (ventilateurs, multiprise, vis, écrous en T). Modéliser les composants du commerce prend du temps, mais c'est ce qui permet de vérifier les jeux et les perçages avant de couper quoi que ce soit.

Le modèle complet est consultable ci-dessous, directement depuis le fichier STEP du dépôt. Les panneaux sont affichés en transparence pour laisser voir l'intérieur.

<div class="step-embed" data-src="https://raw.githubusercontent.com/albanpetit/rack-10inch/main/mcad/main/step/assembly.step" data-transparent="panel-plate">
  <a href="https://github.com/albanpetit/rack-10inch/blob/main/mcad/main/step/assembly.step">Fichier STEP de l'assemblage sur GitHub</a>
</div>

Le dépôt contient aussi tous les exports nécessaires pour le refaire : les [STL](https://github.com/albanpetit/rack-10inch/tree/main/mcad/main/stl) des pièces imprimées, le projet d'impression 3MF avec ses plateaux, et les [DXF](https://github.com/albanpetit/rack-10inch/tree/main/mcad/main/dxf) des panneaux pour la découpe laser.

## Le cadre en profilés 20x20

La structure repose sur des profilés aluminium 20x20 à rainure de 6 mm : douze barres, quatre de chaque longueur. Les **222 mm** donnent la largeur intérieure, les **270 mm** la profondeur et les **476 mm** la hauteur. Livrés en barres longues, les profilés ont été coupés au FabLab, sur une scie à onglet radiale.

![Barres de profilés aluminium 20x20 encore dans leur film de protection](extrusions-delivered.jpg) ![Scie à onglet radiale sur son établi mobile au FabLab](fablab-miter-saw.jpg) ![Coupe d'un profilé aluminium à la scie à onglet](cutting-extrusion.jpg)

Une fois coupées, toutes les barres d'une même longueur sont comparées côte à côte. Le moindre écart de longueur se retrouve ensuite en défaut d'équerrage du cadre.

![Profilés coupés alignés le long d'un réglet pour vérifier leur longueur](cut-extrusions-measured.jpg) ![Les douze profilés coupés posés sur l'établi, rangés par longueur](cut-extrusions.jpg)

Les angles sont assemblés par des équerres trois voies, qui relient d'un coup les trois profilés d'un coin. Je monte d'abord deux rectangles, le haut et le bas, puis je les relie par les quatre montants.

![Équerre d'angle trois voies en aluminium](corner-connector.jpg) ![Profilé équipé d'une équerre trois voies à chaque extrémité](extrusion-corner-connector.jpg)

![Premier rectangle du cadre assemblé sur le tapis de découpe](frame-first-rectangle.jpg) ![Cadre complet en profilés aluminium, avant la pose des panneaux](frame-assembled.jpg)

## Les rails : des écrous en T au pas du rack

Dans une baie classique, les équipements se vissent sur des rails percés au pas standard. Plutôt que d'acheter des rails, j'utilise directement les montants avant : chaque trou du rack correspond à un **écrou en T M5** glissé dans la rainure du profilé. Entre deux écrous, une entretoise imprimée en bleu les maintient au bon pas, ce qui donne 10 U utilisables sur chaque montant. Un équipement se fixe alors avec de simples vis M5, à n'importe quelle hauteur.

![Sachet d'écrous en T M5 pour rainure de 6 mm](t-nuts.jpg) ![Deux montants avec leurs écrous en T glissés dans la rainure](front-rails-t-nuts.jpg)

<!-- PHOTO À AJOUTER : gros plan sur un rail avant terminé, avec les écrous en T et les entretoises bleues. -->

## Les pièces imprimées

Les pièces imprimées font le lien entre le cadre et les panneaux. Elles sont toutes en PLA, imprimées sur ma Bambu Lab A1 : blanc mat pour la structure, bleu pour les pièces qu'on manipule ou qu'on doit repérer (poignées, entretoises, supports de la multiprise). Le projet 3MF du dépôt regroupe les cinq plateaux, en couches de 0,16 mm avec 15 % de remplissage.

La toute première pièce, imprimée en décembre 2024, est un prototype de la poignée du dessus. Viennent ensuite les **supports d'angle**, seize au total, qui maintiennent les panneaux dans le cadre. Ils reçoivent des inserts filetés en laiton, posés à chaud, pour que les vis ne s'appuient jamais directement sur le plastique.

![Prototype de poignée imprimé en gris sur le plateau de l'imprimante](handle-prototype.jpg) ![Supports d'angle imprimés en blanc, encore sur le plateau](corner-supports-printed.jpg) ![Supports d'angle équipés de leurs inserts filetés en laiton](corner-supports-inserts.jpg)

## Les panneaux et la ventilation

Les panneaux arrière, latéraux et du bas sont découpés au laser dans des plaques transparentes, à partir des DXF exportés de FreeCAD. Les découpes d'angle et les perçages tombent pile sur les supports imprimés, puisque tout vient du même modèle.

<!-- À COMPLÉTER : le matériau et l'épaisseur des plaques, et où elles ont été découpées. -->

<!-- PHOTO À AJOUTER : la découpe laser d'un panneau. -->

Le panneau arrière porte deux ventilateurs **Corsair LL120** de 120 mm, montés dans un support imprimé en deux parties qui pincent le panneau. Ils renouvellent l'air à l'intérieur du rack.

![Panneau découpé au laser, encore protégé par son film](laser-cut-panel.jpg) ![Ventilateur Corsair LL120 monté dans son support imprimé, posé sur le panneau](fan-support.jpg)

<!-- À COMPLÉTER : comment les ventilateurs sont alimentés et pilotés. -->

## Des panneaux latéraux aimantés

Je voulais pouvoir ouvrir les côtés sans tournevis. Chaque panneau latéral porte quatre supports d'angle et une poignée centrale. En face, quatre connecteurs sont vissés sur le cadre par des écrous en T. Supports et connecteurs contiennent chacun un **aimant néodyme** : le panneau se clipse en place, et il suffit de tirer sur la poignée pour l'enlever.

![Pièces imprimées pour les panneaux latéraux, en vrac sur le tapis](side-parts-printed.jpg) ![Support et connecteur d'angle avec leurs aimants néodyme](side-parts-magnets.jpg)

![Connecteurs d'angle avec leur aimant et leur vis de fixation au cadre](side-connectors.jpg) ![Panneau latéral transparent équipé de ses quatre supports d'angle et de sa poignée](side-panel-supports.jpg)

## Une multiprise intégrée

Pour qu'un seul câble sorte du rack, une multiprise quatre prises Digitus est fixée à l'arrière, entre les deux ventilateurs. Elle est vendue avec des équerres pour se visser en façade d'un rack. J'avais besoin de la fixer autrement : je l'ai ouverte pour remplacer ses embouts par des supports imprimés en bleu, qui se vissent sur les montants arrière.

![Multiprise rack Digitus quatre prises, dans sa version d'origine](power-strip-original.jpg) ![Multiprise ouverte, embouts retirés](power-strip-opened.jpg) ![Multiprise remontée avec ses supports imprimés en bleu](power-strip-brackets.jpg)

Si vous faites la même chose : multiprise débranchée, et on ne touche à aucune connexion électrique, seulement aux embouts.

## Le résultat

Début juin 2025, le rack est assemblé : cadre, panneaux, ventilateurs, multiprise et poignées du dessus. Il ne reste plus qu'à le remplir.

![Rack 10 pouces assemblé et vide, avec ses panneaux transparents, ses ventilateurs et ses poignées bleues](rack-assembled-empty.jpg) ![Rack terminé vu de côté, avec le Mac mini et le chargeur USB-C installés](rack-finished-side.jpg) ![Face avant du rack avec le Mac mini dans son support 1U](rack-front-mac-mini.jpg)

## Les étapes du projet

1. **La fabrication du rack** : cet article.
2. [Partie 2 : un support de Mac mini imprimé en 3D](/fr/post/rack-10inch-mac-mini/). La première machine du rack, montée dans un support 1U avec un relais pour le bouton d'alimentation et un passe-câble.
