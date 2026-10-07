---
title: "Axon : un fond de panier modulaire pour mes robots"
slug: axon
lang: fr
date: 2026-09-28
lastmod: 2026-10-07
description: "Une plateforme modulaire pour mes robots : un fond de panier, des cartes filles enfichables et un microcontrôleur interchangeable. Présentation et étapes du projet."
tags:
  - Électronique
  - Robotique
  - ESP32
project: Axon
overview: true
status: in-progress
---

Pour mes projets de robotique, j'utilise presque toujours des cartes de développement du commerce. Et à chaque nouveau projet, c'est le même rituel : choisir une carte, câbler les drivers moteurs, les capteurs, les alimentations, puis tout recommencer au projet suivant parce que la carte précédente n'avait pas assez de broches, pas le bon connecteur ou pas la bonne alimentation.

J'ai fini par me poser une question simple : pourquoi ne pas concevoir **ma propre plateforme modulaire** ? Une carte de fond de panier qui centralise l'alimentation et les bus de communication, sur laquelle viennent s'enficher perpendiculairement des cartes filles : une carte stepper, une carte servos, une carte capteurs… et même la carte microcontrôleur, pour pouvoir en changer sans tout refaire.

## Le principe

Axon ne distribue pas les broches du microcontrôleur aux cartes filles : il leur envoie **des ordres sur des bus partagés** (SPI, I²C, CAN). Chaque fonction repose sur un composant pilotable par bus, par exemple un driver stepper qui génère lui-même ses impulsions. Le nombre de cartes ne dépend donc plus du nombre de broches disponibles.

La nomenclature s'inspire du neurone :

- **Axon** : le fond de panier, qui transporte les signaux.
- **Soma** : la carte microcontrôleur, qui pilote tous les bus.
- **Synapses** : les cartes filles, qui agissent sur le monde extérieur ou le mesurent.
- **Nodes** : les emplacements où elles s'enfichent.

| | |
|---|---|
| **Statut** | En conception, rien n'est encore fabriqué |
| **Première version** | 4 Nodes et un emplacement pour le Soma |
| **Soma** | ESP32-S3, interchangeable |
| **Bus** | SPI, I²C (un canal par Node), CAN FD |
| **Connecteur** | PCIe x4, avec un brochage propre à Axon |

## Les étapes du projet

1. [Partie 1 : la conception](/fr/post/axon-design/). Ce qui existe déjà, les fausses bonnes idées, le choix du connecteur et l'architecture retenue.
2. [Partie 2 : l'électronique du fond de panier](/fr/post/axon-electronics/). Alimentation 24 V, protection de chaque Node, arrêt d'urgence, supervision et bus, avec les calculs.
3. Partie 3 : le schéma et le premier prototype. À venir.
