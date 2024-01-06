---
title: ADXL335 Accelerometer
date: 2023-08-07
tags:
    - Electronique
    - PCB
    - KiCad
type: project
image: main.jpg
slug: /adxl335-accelerometer
status: WIP !
resources:
  - title: Github repository
    website: https://github.com/albanpetit/adxl335-accelerometer
    image: https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg
links:
  - title: Aisler
    description: Aisler fabrique vos projets électroniques en deux jours a des prix abordable avec une expedition a travers le monde entier.
    image: https://avatars.githubusercontent.com/u/8618457?s=200&v=4
  - title: KiCad
    description: KiCad est une suite logicielle libre de conception pour l'électronique pour le dessin de schémas électroniques et la conception de circuits imprimés. KiCad est publié sous licence GNU GPL.
    website: https://www.kicad.org
    image: kicad.png
---

## Introduction

Pour cette premiere publication on va commencer par un projet simple, une toute petite carte électronique supportant un accéléromètre trois axes.
Elle permet une alimentation en 5 volts et fournie trois sorties analogiques pour les informations des trois axes via des connecteurs JST PH. En finissant par une led d'alimentation pour faciliter l'utilisation et le debug des circuits l'utilisant.

Avec cette carte je veux apprehender ces composants particulier, les accéléromètres MEMS. Ils sont au coeur de tous nos appareils actuels et peuvent presenter un gros intérêt dans mes futurs développements en robotique.

### Microsystème électromécanique

{{< image src="/projects/adxl335-accelerometer/mems.jpg" position="left" width="200" right="10" >}}

Un microsystème électromécanique est un microsystème fabriqué à partir de matériaux semi-conducteurs. Il comprend un ou plusieurs éléments mécaniques et utilise l’électricité comme source d’énergie, en vue de réaliser une fonction de capteur ou d’actionneur, avec au moins une structure présentant des dimensions micrométriques ; la fonction du système étant en partie assurée par la forme de cette structure. Le terme, systèmes microélectromécaniques, est la version française de l’acronyme anglais MEMS (Microelectromechanical systems). 

## Composants

{{< pdf-double src="/projects/adxl335-accelerometer/datasheet-adxl-335.pdf" src2="/projects/adxl335-accelerometer/datasheet-adxl-335.pdf">}}