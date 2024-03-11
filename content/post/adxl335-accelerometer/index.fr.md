---
title: Accéléromètre ADXL335
date: 2024-03-02
tags:
  - Electronique
  - PCB
  - KiCad
type: post
image: main.jpg
slug: /adxl335-accelerometer
status: WIP !
categories:
  - Projects
resources:
  - title: Github repository
    website: https://github.com/albanpetit/adxl335-accelerometer
    image: https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg
links:
  - title: Aisler
    description: Aisler fabrique vos projets électroniques en deux jours a des prix abordable avec une expedition a travers le monde entier.
    image: aisler.png
  - title: KiCad
    description: KiCad est une suite logicielle libre de conception pour l'électronique pour le dessin de schémas électroniques et la conception de circuits imprimés. KiCad est publié sous licence GNU GPL.
    website: https://www.kicad.org
    image: kicad.png
---

Dans cet article, nous plongeons au cœur de mon dernier projet un PCB personnalisé conçu autour d'un accéléromètre MEMS. Ce projet est relativement simple dans son application, mails il utilise un composant électronique extrêmement interessant par son fonctionnement interne, un accerometre MEMS.
Cette carte électronique sera utilise plus tard au sein d'autres projets.

## Accéléromètres MEMS

{{< image src="/projects/adxl335-accelerometer/mems.jpg" position="left" width="200" right="10" >}}

Les accéléromètres MEMS sont des dispositifs compacts qui exploitent la technologie de microfabrication pour intégrer des éléments mécaniques, des capteurs, des actionneurs et de l'électronique sur une minuscule puce en silicium. Au cœur de ces dispositifs se trouve une structure MEMS, souvent composée de microstructures telles que des poutres ou des porte-à-faux, qui répondent aux forces externes.

### Principe de fonctionnement

Le principe de fonctionnement des accéléromètres MEMS repose sur le concept d'inertie. Selon la deuxième loi du mouvement de Newton, un objet au repos a tendance à rester au repos, et un objet en mouvement a tendance à rester en mouvement sauf s'il est soumis à une force externe. Les accéléromètres MEMS capitalisent sur ce principe pour mesurer l'accélération.

Au sein de la structure MEMS, il existe généralement une masse suspendue par des poutres flexibles. Lorsque le dispositif subit une accélération, la masse résiste à ce changement en raison de l'inertie, provoquant une déviation dans les poutres. Cette déviation est ensuite convertie en un signal électrique par un capteur, tel qu'un capteur capacitif ou piézoélectrique, intégré dans la structure MEMS.

### Traduire le mouvement mécanique en signaux électriques

Au fur et à mesure que l'accéléromètre rencontre une accélération, le mouvement de la masse induit une variation de capacité ou génère une tension proportionnelle à la force appliquée. Ce signal électrique est ensuite traité et traduit en données significatives, nous permettant de quantifier l'accélération subie par le dispositif.

## Carte électronique

Ce PCB est relativement simple, de petites dimensions il s'intègre sans aucun problèmes dans n'importe quel projet. La presence d'un régulateur de tension AP2112 permet la regulation de la tension d'entree a 3.3V et donc l'utilisation de cette carte électronique avec proposant du 5V comme tension par défaut, comme les Arduino par exemple.
Elle présente ainsi des dimensions de 19mm x 24mm avec deux connecteurs, le premier pour l'alimentation en 5V, le second pour les données analogiques de l'acceleration sur les trois axes: x, y, z.

### Liste des composants

| Denomination          | Reference | Quantité | Format     | Datasheet                         |
| --------------------- | --------- | -------- | ---------- | --------------------------------- |
| ADXL335               | U1        | 1        | LFCSP-16   | [ADXL335](datasheet-adxl-335.pdf) |
| AP2112K-3.3           | U2        | 1        | SOT-23-5   | [AP2112](datasheet-ap2112.pdf)    |
| 100k ohm SMD resistor | R2        | 1        | 0603       | -                                 |
| 62 ohm SMD resistor   | R1        | 1        | 0603       | -                                 |
| LED                   | D1        | 1        | 0603       | -                                 |
| 1uF SMD capacitor     | C4,C5     | 2        | 0603       | -                                 |
| 4,7nF SMD capacitor   | C1-C3     | 3        | 0603       | -                                 |
| Power connector       | J1        | 1        | JST PH B2B | -                                 |
| Signal connector      | J2        | 1        | JST PH B3B | -                                 |

### Schéma et carte électronique

L'ensemble des fichiers de conception et de fabrication sont disponibles dans ce repertoire **GitHub** : [ADXL-335](). Voici tout de meme un rapide descriptif des différentes sections de ce circuit imprime :

![carte électronique](pcb.png) ![carte électronique](pcb.png)
