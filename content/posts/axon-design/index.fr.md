---
title: "Axon, partie 1 : concevoir un fond de panier modulaire pour mes robots"
slug: axon-design
lang: fr
date: 2026-09-28
description: "Fonds de panier industriels, modules processeurs, écosystèmes maker : ce qui existe, les fausses bonnes idées, et l'architecture retenue pour Axon."
tags:
  - Électronique
  - Robotique
  - ESP32
project: Axon
---

Pour mes projets de robotique, j'utilise presque toujours des cartes de développement du commerce. Et à chaque nouveau projet, c'est le même rituel : choisir une carte, câbler les drivers moteurs, les capteurs, les alimentations, puis tout recommencer au projet suivant parce que la carte précédente n'avait pas assez de broches, pas le bon connecteur ou pas la bonne alimentation.

J'ai fini par me poser une question simple : pourquoi ne pas concevoir **ma propre plateforme modulaire** ? Une carte de fond de panier qui centralise l'alimentation et les bus de communication, sur laquelle viennent s'enficher perpendiculairement des cartes filles : une carte stepper, une carte servos, une carte capteurs… et même la carte microcontrôleur, pour pouvoir en changer sans tout refaire.

Ce projet s'appelle **Axon**. Cet article est le premier d'une série : il raconte la phase de conception, ce qui existe déjà, les idées que j'ai explorées, celles que j'ai abandonnées, et l'architecture sur laquelle je me suis arrêté. Rien n'est encore fabriqué, c'est justement le moment où les choix structurants se prennent.

## Ce qui existe déjà

Avant d'inventer quoi que ce soit, j'ai voulu voir comment d'autres avaient résolu ce problème. Et il a été résolu de nombreuses fois, dans des mondes très différents : l'industrie, l'informatique embarquée et l'écosystème maker. Chacun a ses forces, et Axon leur emprunte beaucoup.

### Les fonds de panier industriels

L'idée d'une carte mère passive sur laquelle s'enfichent des cartes perpendiculaires est ancienne. Le **VMEbus**, introduit par Motorola au début des années 1980, en est l'exemple le plus connu : des cartes au format Eurocard, des connecteurs DIN 41612 robustes, un rack métallique avec glissières. On le trouve encore aujourd'hui dans des équipements industriels, scientifiques et militaires, preuve que l'architecture tient dans la durée.

![Châssis VMEbus en rack, avec deux rangées de connecteurs DIN 41612 sur le fond de panier et les glissières des cartes](vme-chassis.jpg)

Sa descendance directe, **CompactPCI**, reprend le même format mécanique mais transporte un bus PCI. Deux de ses principes m'ont particulièrement marqué :

- **Le « system slot »** : un emplacement unique réservé à la carte processeur, qui pilote le bus, et des emplacements périphériques pour tout le reste. C'est exactement le rôle qu'aura le Soma dans Axon.
- **L'adressage géographique** : chaque slot du fond de panier possède quelques broches câblées en dur, qui indiquent à la carte insérée sa position. C'est l'origine directe des contacts SLOT_ID d'Axon.

CompactPCI a aussi popularisé l'insertion à chaud grâce à des **contacts de longueurs différentes** : les masses et les alimentations se connectent en premier, les signaux en dernier. Je ne vise pas l'insertion à chaud pour l'instant, mais c'est une astuce facile à reprendre plus tard sur les cartes filles.

![Carte processeur CompactPCI Serial avec sa poignée d'extraction, enfichée dans un morceau de fond de panier](compactpci-serial-board.jpg)

Plus récent, **VPX** abandonne les bus parallèles au profit de liaisons série rapides et vise les environnements très sévères (vibrations, températures extrêmes). C'est surdimensionné pour mes robots, mais ça rappelle un point essentiel : **dans un système qui bouge, la mécanique compte autant que l'électronique**. Glissières, fixation des cartes, verrouillage : tout ce que les racks industriels font très bien.

![Châssis VPX en rack avec ses emplacements de cartes et deux alimentations enfichables](vpx-chassis.webp)

### Les empilements : PC/104

À l'opposé du fond de panier, **PC/104** (apparu au début des années 1990) propose d'empiler les cartes les unes sur les autres, reliées par des connecteurs traversants. Le format est compact et très robuste, ce qui l'a rendu populaire dans l'embarqué industriel et même en robotique. Ses versions successives (PC/104-Plus, PCI-104, PCIe/104) montrent aussi comment un standard peut évoluer en gardant la même mécanique. L'inconvénient pour mon usage : pour changer la carte du milieu, il faut démonter toute la pile.

![Carte PCI-104 montée sur entretoises, avec ses connecteurs d'empilement sur les bords](pc104-board.jpg)

### Les modules processeurs : COM et Compute Modules

Une autre famille sépare le processeur de tout le reste : un **module de calcul** qui s'enfiche sur une **carte porteuse** conçue pour l'application. **COM Express**, **Qseven** et **SMARC** sont les standards industriels de ce monde. SMARC, par exemple, utilise un connecteur de bord MXM à 314 contacts. Toradex a construit ses gammes Colibri et Apalis sur le même principe, respectivement sur des connecteurs SO-DIMM et MXM.

Côté maker, le **Raspberry Pi Compute Module** suit la même logique : les premières versions utilisaient un connecteur SO-DIMM de barrette mémoire, les suivantes des connecteurs carte à carte haute densité.

![Deux Raspberry Pi Compute Module 3+ enfichés dans des connecteurs SO-DIMM sur une carte porteuse](raspberry-pi-compute-modules.jpg)

Ce modèle m'a convaincu d'un point : **le processeur doit être interchangeable**. Les microcontrôleurs évoluent vite, et le fond de panier doit pouvoir leur survivre.

### Le monde maker

Les écosystèmes maker ont chacun trouvé leur réponse à la modularité :

- **mikroBUS** (MikroElektronika) normalise un socle de 16 broches qui regroupe SPI, I²C, UART, une entrée analogique, un PWM, une interruption, un reset et les alimentations. Chaque module, appelé Click board, n'utilise que ce dont il a besoin, et il en existe plus d'un millier.
- **ClickID**, ajouté par MikroE, embarque sur la carte une petite mémoire lue en 1-Wire via la ligne CS pendant que le reset est maintenu à l'état bas. Elle décrit la carte, ce qui permet à un noyau Linux de charger automatiquement le bon driver. C'est l'inspiration directe de l'EEPROM d'identification d'Axon.
- **SparkFun MicroMod** sépare lui aussi processeur et carte porteuse, en utilisant un connecteur **M.2** pour les cartes processeur. C'est le projet le plus proche de mon idée de départ, mais les cartes y sont montées à plat.
- **Arduino Portenta** place des connecteurs haute densité sous la carte pour se brancher sur des cartes porteuses, avec la même idée d'un cœur interchangeable.
- **Feather** (Adafruit) et ses **FeatherWings** misent sur un format commun et l'empilement.
- **Grove**, **Qwiic** et **STEMMA QT** choisissent au contraire le chaînage par câble : un petit connecteur I²C à 4 broches, et on relie les modules en série. Imbattable pour prototyper, beaucoup moins pour faire passer du courant.

### En robotique

Deux approches sont particulièrement intéressantes pour mon cas :

- Les **contrôleurs de vol Pixhawk** utilisés sur les drones connectent leurs périphériques (GPS, contrôleurs moteurs, capteurs) par **CAN**, avec le protocole DroneCAN. Chaque périphérique a son propre microcontrôleur et se déclare sur le bus.
- Les **servomoteurs intelligents** comme les Dynamixel se chaînent sur un bus série et reçoivent des ordres de position plutôt que des signaux PWM.

### Ce que j'en retiens

Aucune de ces solutions ne coche toutes mes cases. Les fonds de panier industriels sont trop gros et trop chers, les empilements peu pratiques à reconfigurer, les écosystèmes maker pas conçus pour faire passer plusieurs ampères vers des moteurs. Mais chacune apporte une idée que je veux garder :

| Solution | Ce qu'Axon lui emprunte |
|---|---|
| CompactPCI | Slot processeur dédié, adressage géographique des slots |
| VME, VPX | Robustesse mécanique, fixation des cartes |
| COM, Compute Module, MicroMod | Processeur interchangeable |
| mikroBUS | Brochage normalisé, bus partagés |
| ClickID | Cartes qui s'identifient elles-mêmes |
| Pixhawk, Dynamixel | Envoyer des ordres sur un bus plutôt que des signaux bruts |

Le cahier des charges d'Axon est au croisement de tout ça : des cartes perpendiculaires faciles à changer, du courant pour les moteurs, un processeur interchangeable, des cartes qui se présentent seules, et un coût compatible avec un projet maker.

## Les fausses bonnes idées

La partie la plus intéressante de cette phase de conception, c'est tout ce que j'ai écarté. Voici le cheminement, dans l'ordre.

### Relier toutes les broches du microcontrôleur à tous les connecteurs

L'idée la plus intuitive : chaque connecteur reçoit toutes les broches du µC, et chaque carte fille prend ce dont elle a besoin. En pratique, c'est le modèle des shields Arduino empilés, avec ses défauts : deux cartes qui pilotent la même broche créent un conflit électrique, chaque ligne qui part vers cinq connecteurs se charge en capacité parasite, et il faut des connecteurs énormes pour des cartes qui n'utilisent que dix broches.

### Un lot de broches dédié par connecteur

Chaque slot reçoit ses propres broches du µC, sans partage. Plus aucun conflit possible, et grâce à la matrice GPIO de l'ESP32, n'importe quel périphérique interne peut être affecté à n'importe quelle broche. Mais l'arithmétique est impitoyable : avec une dizaine de broches par slot, un ESP32 plafonne à trois slots.

### Un pool de GPIO et des multiplexeurs

Un pool de lignes génériques qui parcourt tous les slots, et sur chaque carte fille des multiplexeurs (un expandeur I²C qui pilote des 74HC4051) pour choisir quelles lignes utiliser. Ça fonctionne, c'est même assez élégant, mais chaque carte fille devient plus complexe et plus chère.

### Un FPGA de routage

La version ultime : un FPGA sur le fond de panier, qui donne à chaque slot ses propres broches et génère lui-même les signaux temps réel (impulsions de pas, PWM, lecture de codeurs), à la manière des cartes Mesa utilisées avec LinuxCNC. Très puissant, mais c'est un projet à part entière.

### Un microcontrôleur par carte fille

L'approche « cartes intelligentes », celle des périphériques Pixhawk : un petit µC sur chaque carte fille, qui reçoit ses ordres par bus. C'est très modulaire, mais ça multiplie les firmwares à écrire et à maintenir. Je l'ai écartée.

## Le déclic : partager des bus, pas des broches

La solution est finalement venue en retournant le problème. Au lieu d'envoyer des signaux temps réel aux cartes filles, je leur envoie **des ordres sur des bus partagés** : SPI, I²C, CAN. Le nombre de broches utilisées côté µC devient quasiment indépendant du nombre de slots.

La contrepartie, c'est que chaque fonction doit reposer sur un composant pilotable par bus. Heureusement, il en existe pour presque tout en robotique :

- **Steppers** : TMC5072 ou TMC5160, en SPI, avec un générateur de rampe intégré. On leur envoie une position cible, ils produisent eux-mêmes les impulsions.
- **Servos** : PCA9685, 16 sorties PWM en I²C.
- **Codeurs** : LS7366R, compteur de quadrature en SPI.
- **Analogique** : ADS1115 en I²C.
- **Entrées/sorties** : PCA9555 ou MCP23017.
- **Actionneurs intelligents externes** : directement sur le bus CAN.

## L'architecture d'Axon

La nomenclature s'inspire du neurone :

- **Axon** : le fond de panier, qui transporte les signaux.
- **Soma** : la carte microcontrôleur, le corps cellulaire où se prennent les décisions.
- **Synapses** : les cartes filles, points de connexion avec le monde extérieur. Selon leur rôle, ce sont des **Effectors** (actionneurs), des **Receptors** (capteurs) ou des **Relays** (communication).
- **Nodes** : les slots, en référence aux nœuds de Ranvier qui jalonnent un axone.

L'emplacement du Soma joue le même rôle que le « system slot » de CompactPCI : c'est lui qui pilote tous les bus, les Nodes ne font que répondre.

La première version comptera 4 Nodes et un emplacement dédié au Soma. Le fond de panier lui-même ne porte aucun microcontrôleur : il distribue les alimentations et relie l'emplacement du Soma à chaque Node. Le premier Soma sera une carte fille construite autour d'un ESP32-S3, qui pourra être remplacée plus tard par un Soma basé sur un autre microcontrôleur sans toucher au reste.

## Le connecteur : PCIe x4

J'ai comparé plusieurs formats de connecteurs :

- **PCIe x1** (36 contacts) : trop juste pour faire passer du courant tout en gardant des réserves.
- **M.2** : peu de cycles d'insertion garantis, et la carte se monte à plat.
- **SO-DIMM** : excellent verrouillage par clips, mais la carte est couchée, le pas est fin et le courant par contact faible.
- **DIN 41612**, celui des racks industriels : très robuste, mais encombrant et plus cher qu'un connecteur de bord, qui ne coûte qu'un PCB avec des doigts dorés.
- **PCIe x4** (64 contacts) : carte perpendiculaire, contacts d'environ 1 A, connecteurs faciles à trouver et bon marché, et assez de place pour la puissance, les signaux et des réserves.

C'est donc le PCIe x4 qui l'emporte, avec son détrompeur entre les contacts 11 et 12 qui sépare naturellement la **zone puissance** de la **zone signaux**. Le connecteur est mécaniquement un PCIe, mais le brochage n'a rien à voir : une vraie carte PCIe branchée dessus serait détruite. Ce sera clairement indiqué sur la sérigraphie.

![Connecteurs PCI Express de différentes largeurs et connecteur PCI sur une carte mère](pcie-slots.jpg)

### Le brochage d'un Node

| Contact | Face A | Face B |
|---|---|---|
| 1–4 | VCC | VCC |
| 5–8 | GND | GND |
| 9 | +5 V | +5 V |
| 10 | +3,3 V | +3,3 V |
| 11 | GND | GND |
| *détrompeur* | | |
| 12 | GND | SDA (canal dédié) |
| 13 | SCK | SCL (canal dédié) |
| 14 | GND | GND |
| 15 | MOSI | MISO |
| 16 | GND | CS (dédié) |
| 17 | DIO0 (dédié) | GND |
| 18 | GND | DIO1 (dédié) |
| 19 | SYNC | INT |
| 20 | RST | GND |
| 21 | CAN_H | CAN_L |
| 22 | GND | GND |
| 23 | SLOT_ID0 | SLOT_ID1 |
| 24 | SLOT_ID2 | GND |
| 25 | Réserve (RS-485 A) | Réserve (RS-485 B) |
| 26 | GND | GND |
| 27–32 | Réserves | Réserves |

**VCC** est la tension de puissance non régulée (batterie ou alimentation, typiquement 12 à 24 V), pour les moteurs ou toute autre charge. Avec 8 contacts, chaque Node peut tirer **6 à 8 A**. Des masses séparent VCC du 5 V et entourent chaque signal rapide. Les 14 réserves sont routées jusqu'à des pastilles : le connecteur est la seule chose qu'on ne peut pas changer après coup.

Le Soma utilise le même connecteur, repéré par la sérigraphie. Sa zone puissance est identique, avec les contacts VCC non connectés côté Soma : si on le branche dans un mauvais slot, rien ne fonctionne, mais rien ne grille non plus.

## Comment les bus sont gérés

**SPI.** SCK, MOSI et MISO sont partagés. Chaque Node reçoit son propre **chip select**, directement depuis le Soma. Chaque Synapse doit libérer MISO (haute impédance) quand son CS est inactif.

**I²C.** Deux cartes identiques auraient les mêmes adresses I²C. Le fond de panier embarque donc un multiplexeur **TCA9546A** qui donne à chaque Node son propre canal. Le Soma sélectionne un Node, puis parle à ses composants. Bonus : une carte défectueuse qui bloque son bus ne paralyse que son propre canal.

**CAN.** Un transceiver sur le fond de panier, avec sa terminaison, pour communiquer avec des actionneurs externes.

**INT, RST, SYNC.** Sur la version 4 Nodes, chaque Node a sa propre ligne d'interruption, en collecteur ouvert côté carte. RST remet toutes les cartes à zéro, et SYNC permet de déclencher plusieurs actions au même instant, par exemple le démarrage simultané de plusieurs moteurs.

**SLOT_ID.** Trois contacts reliés en dur à la masse ou au 3,3 V selon le Node, sur le modèle de l'adressage géographique de CompactPCI. Une Synapse peut ainsi connaître sa position.

## Les DIO : garder un peu de temps réel

Tout passer par des bus a une limite : certaines choses ont besoin d'une broche directe. Chaque Node dispose donc de **deux DIO**, reliés à des GPIO dédiés du Soma. Grâce à la matrice GPIO de l'ESP32-S3, ils peuvent devenir, au choix, une entrée ou sortie simple, un PWM, une entrée de codeur, une entrée analogique (s'ils sont reliés à des broches ADC1), une interruption rapide, ou un **UART** (DIO0 en TX, DIO1 en RX). Comme l'ESP32-S3 dispose de trois UART matériels et que sa console passe par l'USB natif, trois Nodes peuvent fonctionner en UART simultanément. De quoi brancher un GPS, un lidar, ou des TMC2209 configurés par leur fil unique.

## Chaque Synapse se présente elle-même

Inspiré de ClickID, chaque Synapse embarque une **EEPROM 24C02 à l'adresse 0x50** sur le canal I²C de son Node. Comme chaque Node a son propre canal, toutes les cartes utilisent la même adresse sans conflit. Au démarrage, le Soma parcourt les canaux : si l'EEPROM répond, une carte est présente, et son contenu indique son type, sa révision et son numéro de série. Une dizaine d'octets suffisent pour commencer, pour quelques centimes de composant et aucune broche supplémentaire.

## Le budget GPIO du Soma ESP32-S3

| Fonction | GPIO |
|---|---|
| SPI (SCK, MOSI, MISO) | 3 |
| CS directs (4 Nodes) | 4 |
| I²C vers le TCA9546A | 2 |
| CAN (TX, RX) | 2 |
| RST, SYNC | 2 |
| INT dédiées (4 Nodes) | 4 |
| DIO0 + DIO1 (4 Nodes) | 8 |
| **Total** | **25** |

Une fois retirées les broches de flash, de PSRAM, d'USB et de démarrage, un module ESP32-S3 courant laisse environ 27 GPIO utilisables. Ça rentre, avec deux broches de marge.

## Et pour 8 Nodes ?

Avec 8 Nodes, il faudrait 41 GPIO pour tout câbler, ce qui dépasse l'ESP32-S3. La règle sera donc la suivante : sur un futur fond de panier 8 Nodes, les Nodes 4 à 7 ne recevront que les bus partagés, avec une interruption commune, sauf avec un Soma plus fourni, comme un ESP32-P4 (55 GPIO, mais sans Wi-Fi ni Bluetooth intégrés). Le point important : **les Synapses restent identiques**. Seul le câblage du fond de panier change. C'est tout l'intérêt d'avoir séparé le processeur du reste.

## Quelques règles pour concevoir une Synapse

- Toutes les sorties en haute impédance au démarrage, activées seulement par le firmware.
- INT uniquement en collecteur ouvert.
- Résistances série de 100 à 330 Ω sur les sorties, pour limiter les dégâts en cas d'erreur.
- Pas de résistances de rappel I²C fortes : elles sont sur le fond de panier.
- Idéalement un seul composant SPI par carte.
- Au-delà de 6 à 8 A, un bornier de puissance séparé sur la carte.

Côté fond de panier, chaque Node aura sa propre protection (polyfusible ou eFuse) et son découplage, les cartes seront maintenues en tête par des glissières pour résister aux vibrations, et l'arrêt d'urgence coupera VCC de façon matérielle, indépendamment du firmware.

## La suite

Il reste plusieurs étapes avant de commander le premier PCB :

1. Définir le brochage du Soma.
2. Figer le format du descripteur en EEPROM.
3. Prototyper sur breadboard avec un ESP32-S3, un TCA9546A et une ou deux cartes de test, par exemple une Effector stepper à base de TMC5072 et une Effector servos à base de PCA9685.
4. Dessiner le fond de panier 4 Nodes dans KiCad.

Rendez-vous dans la partie 2 pour le prototype, les premières mesures et, sans doute, quelques mauvaises surprises.
