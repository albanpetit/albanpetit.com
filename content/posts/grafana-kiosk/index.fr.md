---
title: "Grafana Kiosk : l'état de mon serveur maison sur un écran de bureau"
slug: grafana-kiosk
lang: fr
date: 2026-11-19
description: "Un Raspberry Pi 4 et l'écran 7 pouces officiel, dans un stand imprimé en 3D, affichent en continu le dashboard Grafana de mon serveur maison sous Asahi Linux."
tags:
  - Home lab
  - Raspberry Pi
  - Docker
  - Grafana
  - Impression 3D
project: Grafana Kiosk
overview: true
status: done
image: main.jpg
---

Mon serveur maison est un **Mac mini M1 sous Asahi Linux**, celui qui loge dans [mon rack 10 pouces](/fr/post/rack-10inch-mac-mini/). Il fait tourner tous mes services en conteneurs Docker : MakerStorage, le service web de [PaperFlux](/fr/post/paperflux/), un site Ghost et le tunnel Cloudflare qui les publie. Tant que tout va bien, je n'y pense pas. Et c'est bien le problème : pour savoir s'il va bien, il faut ouvrir un terminal ou garder un onglet ouvert, ce que je ne fais jamais.

Je voulais l'inverse : une information qui reste sous les yeux sans rien demander. Un petit écran posé sur le bureau, qui affiche en permanence l'état du serveur, s'éteint quand je ne m'en sers pas et se rallume d'un toucher. J'avais justement en stock un Raspberry Pi 4 et l'écran tactile officiel 7 pouces. Il ne manquait qu'un stand et quelques soirées.

| | |
|---|---|
| **Matériel** | Raspberry Pi 4, écran tactile officiel Raspberry Pi 7" v1 (800 × 480), alimentation USB-C 3 A |
| **Stand** | Modèle Printables imprimé en deux couleurs |
| **Serveur** | Mac mini M1, Fedora Asahi Remix, Docker |
| **Monitoring** | Prometheus, node_exporter, cAdvisor et Grafana en Docker Compose |
| **Kiosque** | Raspberry Pi OS Lite, labwc, Chromium, swayidle |

## Le principe : le serveur collecte, le Pi affiche

Toute la collecte tourne sur le Mac mini. Le Pi ne fait qu'ouvrir une page web en plein écran : il ne stocke aucune donnée et se réinstalle en un quart d'heure s'il le faut.

```mermaid
flowchart LR
    subgraph MAC["Mac mini M1, Asahi Linux, Docker Compose"]
        NE["node_exporter<br/>métriques de la machine"] --> PROM
        CA["cAdvisor<br/>métriques par conteneur"] --> PROM
        PROM["Prometheus<br/>collecte toutes les 15 s<br/>garde 30 jours"] --> GRAF["Grafana<br/>lecture anonyme"]
    end
    GRAF -- "HTTP :3000, réseau local" --> PI["Raspberry Pi 4<br/>Chromium en kiosque<br/>écran tactile 7 pouces"]
```

## Le matériel et le stand imprimé en 3D

L'écran est le **Touch Display officiel v1**, sorti en 2015 : 7 pouces, 800 × 480 pixels, relié au Pi par une nappe DSI. C'est peu de pixels, et tout le dashboard est pensé pour cette contrainte.

Pour le stand, j'ai imprimé le modèle [Raspberry Pi 7 Inch Touchscreen Case with Rotating Stand](https://www.printables.com/model/833644-raspberry-pi-7-inch-touchscreen-case-with-rotating) de 5iStanley (licence CC BY-NC), en deux couleurs : le cadre de l'écran et le capot arrière ajouré en noir, le pied rotatif et le boîtier du Pi en jaune.

![Cadre noir de l'écran et capot arrière ajouré sur le plateau de l'imprimante](print-black-frame.jpg) ![Cadre noir et capot arrière ajouré sortis de l'imprimante, posés sur un tapis de découpe](black-frame-and-back-cover.jpg)

*Impression du cadre noir et du capot arrière ajouré.*

![Pied rotatif et boîtier jaune du Pi sur le plateau de l'imprimante](print-yellow-stand.jpg) ![Petite trappe ajourée jaune sur le plateau de l'imprimante](print-vent-hatch.jpg)

*Impression du pied rotatif et du boîtier jaune du Pi, puis d'une petite trappe ajourée.*

Le modèle est prévu pour l'écran v1 : un Pi 4 se visse au dos de l'écran avec les mêmes trous et la même nappe DSI qu'un Pi 3. Ça tombe bien : mon écran avait encore un ancien Pi 3 monté au dos, que le Pi 4 remplace.

![Écran tactile officiel Raspberry Pi 7 pouces v1 posé sur le tapis de découpe](touchscreen-v1.jpg) ![Dos de l'écran 7 pouces avec l'ancien Raspberry Pi 3 vissé dessus](touchscreen-back-old-pi3.jpg)

*L'écran 7" v1, et son dos avec l'ancien Pi 3, avant démontage.*

Le câblage tient en trois éléments. La nappe DSI va sur le port **DISPLAY** du Pi (pas CAMERA). Pour l'alimentation, l'écran n'a besoin que de deux fils : le **rouge (5 V) sur la broche 2** et le **noir (GND) sur la broche 6** du GPIO. Les fils vert et jaune (SDA et SCL) ne se branchent pas : ils ne servaient qu'aux tout premiers Pi. Seul le Pi est alimenté, en USB-C 3 A, et il alimente l'écran : un seul câble sort du stand.

![Raspberry Pi 4 posé sur le tapis de découpe](raspberry-pi-4.jpg) ![Raspberry Pi 4 vissé au dos de l'écran, avec la nappe DSI et les fils d'alimentation](pi4-on-screen-back.jpg)

*Le Pi 4, puis vissé au dos de l'écran avec la nappe DSI et les fils.*

![Raspberry Pi 4 au dos de l'écran, dans le cadre noir imprimé](pi4-in-black-frame.jpg) ![Raspberry Pi 4 dans le boîtier jaune, avec la nappe DSI et les fils rouge et noir vers le GPIO](pi-box-wiring.jpg)

*Le Pi 4 dans le cadre noir, et le câblage dans le boîtier : nappe DSI, fils rouge (5 V) et noir (GND) vers le GPIO.*

![Boîtier jaune ouvert sur sa charnière au-dessus du Pi 4](pi-box-hinge.jpg) ![Boîtier jaune en train de se refermer sur le Pi 4](pi-box-closing.jpg) ![Dos du stand fermé, avec la trappe ajourée jaune](back-closed.jpg)

*Le boîtier jaune et sa charnière se referment sur le Pi, puis le dos fermé avec la trappe ajourée.*

![Stand terminé vu de face, écran éteint, sur le pied rotatif jaune](stand-front.jpg) ![Stand terminé vu de dos, avec les ports USB et Ethernet accessibles sur le côté](stand-back.jpg)

*Le stand terminé, de face et de dos : les ports USB et Ethernet restent accessibles sur le côté.*

## Côté serveur : la stack de monitoring

Sur le Mac mini, quatre conteneurs dans un seul fichier Docker Compose suffisent :

- [**node_exporter**](https://github.com/prometheus/node_exporter) mesure la machine elle-même : CPU, RAM, disque, réseau, charge. Il tourne en réseau hôte et lit le système de fichiers de l'hôte en lecture seule, pour mesurer le Mac mini et non son propre conteneur.
- [**cAdvisor**](https://github.com/google/cadvisor), de Google, mesure chaque conteneur : CPU, RAM et réseau, avec son nom.
- [**Prometheus**](https://prometheus.io/) est la base de données de séries temporelles. Toutes les 15 secondes, il interroge les deux exporters et garde 30 jours d'historique.
- [**Grafana**](https://grafana.com/oss/grafana/) dessine les dashboards à partir de Prometheus. C'est la page qu'affiche le Pi.

Les quatre sont écrits en Go et publiés pour ARM64 : Docker prend tout seul la bonne image pour la puce Apple.

```yaml
services:
  node-exporter:
    container_name: monitoring-node-exporter
    image: prom/node-exporter:v1.9.1
    command: ["--path.rootfs=/host"]
    network_mode: host
    pid: host
    security_opt: ["label=disable"]
    volumes:
      - /:/host:ro,rslave
    restart: unless-stopped
  cadvisor:
    container_name: monitoring-cadvisor
    image: ghcr.io/google/cadvisor:v0.57.0
    privileged: true
    devices: ["/dev/kmsg"]
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    restart: unless-stopped
  prometheus:
    container_name: monitoring-prometheus
    image: prom/prometheus:v3.5.0
    command:
      - --config.file=/etc/prometheus/prometheus.yml
      - --storage.tsdb.retention.time=30d
    extra_hosts: ["host.docker.internal:host-gateway"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro,z
      - prom-data:/prometheus
    restart: unless-stopped
  grafana:
    container_name: monitoring-grafana
    image: grafana/grafana:12.1.0
    environment:
      GF_AUTH_ANONYMOUS_ENABLED: "true"
      GF_AUTH_ANONYMOUS_ORG_ROLE: Viewer
      GF_USERS_DEFAULT_THEME: dark
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana:/etc/grafana/provisioning/datasources:ro,z
      - ./dashboards:/etc/grafana/provisioning/dashboards:ro,z
    ports: ["3000:3000"]
    restart: unless-stopped
volumes:
  prom-data:
  grafana-data:
```

Quelques détails propres à Asahi Linux, qui est une Fedora avec SELinux et firewalld :

- Le `:z` sur les volumes et le `label=disable` de node_exporter règlent les étiquettes SELinux. Sans eux, les conteneurs tombent sur des « permission denied ».
- `extra_hosts` permet à Prometheus de joindre node_exporter, qui tourne sur le réseau de l'hôte, par le nom `host.docker.internal`.
- Seul Grafana publie un port. node_exporter, en réseau hôte, écoute directement sur le port 9100 de la machine (j'y reviens dans la partie sécurité), et Prometheus et cAdvisor ne sont joignables que depuis le réseau Docker.
- Le noyau Asahi utilise des pages mémoire de 16 Ko, ce qui fait planter certaines images ARM (souvent celles qui embarquent jemalloc). Ces quatre-là ne sont pas concernées, mais c'est le premier suspect si un conteneur refuse de démarrer.

La configuration de Prometheus tient en quelques lignes, avec ses deux cibles :

```yaml
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: macmini
    static_configs:
      - targets: ["host.docker.internal:9100"]
  - job_name: cadvisor
    static_configs:
      - targets: ["cadvisor:8080"]
```

Côté Grafana, je n'ai rien cliqué : la source Prometheus et le dashboard sont **provisionnés par fichiers**, dans les dossiers `grafana/` et `dashboards/` montés dans le conteneur. Quand je modifie le JSON du dashboard, Grafana le recharge tout seul en une dizaine de secondes.

### Un dashboard pensé pour 800 × 480

Les dashboards communautaires sont illisibles sur un écran de 7 pouces. J'en ai fait un dédié, lisible à un mètre et sans défilement :

- **En haut, quatre tuiles** à fond coloré : CPU, RAM et disque (vert, orange à 70 %, rouge à 90 %), et le nombre de conteneurs en marche.
- **Au milieu, deux graphes sur une heure** : CPU et RAM, puis le débit réseau entrant et sortant (sans les interfaces virtuelles de Docker).
- **En bas, le top 5 des conteneurs** les plus gourmands en CPU, en pourcentage d'un cœur.

Le tout en thème sombre, rafraîchi toutes les 30 secondes : c'est assez pour un coup d'œil, et ça ménage le Pi. Le dashboard est [téléchargeable en JSON](dashboard-bureau.json) ; il s'importe tel quel dans Grafana, avec une source Prometheus qui collecte node_exporter et cAdvisor.

## Côté Pi : un kiosque minimal

Sur le Pi, pas de bureau complet : **Raspberry Pi OS Lite 64 bits** (Trixie), plus le strict minimum graphique. J'ai flashé la carte avec Raspberry Pi Imager, en réglant dans ses options le nom d'hôte, l'utilisateur, le Wi-Fi et SSH (les détails sont dans mes tutoriels sur [SSH](/fr/post/raspberry-ssh-config/) et le [Wi-Fi](/fr/post/raspberry-wifi-config/)).

Ensuite, quelques paquets :

```bash
sudo apt install -y --no-install-recommends labwc chromium swayidle wlopm wlrctl fonts-dejavu-core
```

- [**labwc**](https://labwc.github.io/) est le compositeur Wayland de Raspberry Pi OS Desktop, utilisé ici seul, sans le reste du bureau.
- **Chromium** affiche Grafana en plein écran.
- **swayidle** et **wlopm** gèrent la mise en veille de l'écran, **wlrctl** sert à cacher le curseur.

Le Pi se connecte automatiquement en console (`sudo raspi-config nonint do_boot_behaviour B2`), et `~/.bash_profile` lance labwc sur l'écran physique :

```bash
[ "$(tty)" = "/dev/tty1" ] && exec labwc
```

Tout le reste est dans `~/.config/labwc/autostart`, que labwc exécute à son démarrage :

```bash
wlrctl pointer move 5000 5000 &
swayidle -w timeout 300 'wlopm --off \*' resume 'wlopm --on \*' &
while true; do
  chromium --kiosk --force-device-scale-factor=0.8 --noerrdialogs --disable-infobars --incognito \
    --ozone-platform=wayland --touch-events=enabled \
    --password-store=basic --check-for-update-interval=31536000 \
    "$(cat ~/.config/kiosk-url)"
  sleep 3
done &
```

- **La première ligne** envoie le curseur dans le coin de l'écran pour qu'il ne reste pas au milieu du dashboard.
- **La deuxième** gère la veille : après 300 secondes sans toucher, l'écran est coupé ; un toucher compte comme une activité et le rallume. Chromium et Grafana continuent de tourner pendant la veille, donc le dashboard est à jour dès le réveil.
- **La boucle** relance Chromium s'il plante. Elle sert aussi à recharger la page après une modification de la mise en page du dashboard : un `pkill chromium`, et la page revient trois secondes plus tard.

L'URL du kiosque est rangée à part, dans `~/.config/kiosk-url`, pour la changer sans toucher au reste. Elle a cette forme, `kiosk` masquant les menus de Grafana :

```text
http://<ip-du-serveur>:3000/d/bureau/bureau?kiosk&refresh=30s
```

Une fois que tout fonctionne, il reste une protection à prévoir : passer la carte SD en lecture seule (`sudo raspi-config nonint do_overlayfs 0`, puis un redémarrage). Une coupure de courant ne peut alors plus la corrompre ; en contrepartie, toute modification sur le Pi demande de désactiver l'overlay le temps de l'intervention.

## Les galères et leurs solutions

Sur le papier, tout tenait en une soirée. En pratique, quatre problèmes m'ont occupé plus longtemps que prévu.

### Une carte SD défectueuse

Au premier démarrage, l'écran s'est figé après le chargement du pilote i2c : pas de ping, pas de SSH. Le câblage et le système n'y étaient pour rien : c'était **la carte SD**, tout simplement défectueuse. Changer de carte a réglé le problème. Au passage, j'ai appris qu'une LED verte éteinte sur un Pi veut dire « carte au repos », pas « planté ».

### Le port 9090 déjà occupé par Cockpit

Prometheus ne pouvait pas publier son port 9090 : il était déjà pris. Par **Cockpit**, l'interface d'administration web de Fedora, que systemd écoute sur ce port (`cockpit.socket`). Plutôt que de déplacer l'un ou l'autre, j'ai retiré la publication du port : Grafana joint Prometheus par le réseau Docker, et personne d'autre n'a besoin de l'interroger. Pour une requête de débogage, je passe par le conteneur :

```bash
docker compose exec prometheus wget -qO- 'localhost:9090/api/v1/targets'
```

### cAdvisor ne voit plus les noms des conteneurs avec Docker 29

Le premier affichage annonçait fièrement « Conteneurs : No data ». cAdvisor tournait, mais il voyait les conteneurs sans leur nom, avec des erreurs « failed to identify the read-write layer ID » dans ses journaux. La cause : **Docker 29** utilise par défaut le stockage d'images de containerd, que cAdvisor 0.49 ne sait pas lire. Le support est arrivé avec la [PR #3709](https://github.com/google/cadvisor/pull/3709), et passer à la **v0.57.0** a tout réglé. Attention au registre : les nouvelles images de cAdvisor sont publiées sur GHCR (`ghcr.io/google/cadvisor`), plus sur `gcr.io`, où l'on trouve encore les anciennes versions.

### Grafana passe en affichage mobile à 800 px

Deuxième surprise du premier affichage : au lieu de ma grille, les tuiles s'empilaient les unes sous les autres, avec une barre de défilement. À 800 pixels de large, Grafana considère qu'il est sur un téléphone et bascule en **mise en page mobile**.

![Premier affichage du kiosque : les tuiles CPU, RAM et disque empilées en pleine largeur, et la tuile Conteneurs qui affiche No data](dashboard-mobile-layout.jpg)

*Premier affichage, avant correction : tuiles empilées en mode mobile, et « Conteneurs : No data » à cause de cAdvisor 0.49.*

La solution est un zoom côté Chromium : avec `--force-device-scale-factor=0.8`, la page croit disposer de 1000 × 600 pixels et garde sa grille. Le texte rapetisse un peu, mais il reste lisible.

Deux finitions sont venues ensuite. Le nom du conteneur web de MakerStorage, avec son suffixe en hash, débordait du top 5 : un `label_replace` dans la requête retire ce suffixe. Et le curseur restait au milieu de l'écran, d'où la ligne `wlrctl` de l'autostart.

## Sécurité

Un dashboard en accès anonyme et des exporters ouverts, c'est pratique, mais à condition que ça ne sorte pas de la maison.

**Le tunnel Cloudflare** ne publie que les noms d'hôte qui y sont configurés. La stack de monitoring n'est donc pas visible depuis Internet, et elle ne doit pas le devenir : avec l'accès anonyme activé, publier Grafana reviendrait à montrer l'état du serveur à tout le monde.

**Sur le réseau local**, trois points étaient trop ouverts après l'installation :

1. **Le compte admin de Grafana** avait encore son mot de passe par défaut. Je l'ai changé, et rangé dans mon gestionnaire de mots de passe :
   ```bash
   docker exec -it monitoring-grafana grafana cli admin reset-admin-password '<nouveau-mot-de-passe>'
   ```
2. **Le port 9100 de node_exporter** était ouvert à tout le réseau local, alors que seul Prometheus, dans Docker, en a besoin.
3. **Le port 3000 de Grafana** était ouvert à tous les réseaux, alors que seul le réseau local en a besoin.

Pour les deux ports, j'ai retiré les ouvertures globales de firewalld et je les ai remplacées par des règles limitées à la bonne source :

```bash
sudo firewall-cmd --permanent --remove-port=3000/tcp --remove-port=9100/tcp
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="172.16.0.0/12" port port="9100" protocol="tcp" accept'
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="<réseau-local>/24" port port="3000" protocol="tcp" accept'
sudo firewall-cmd --reload
```

`172.16.0.0/12` couvre les réseaux que Docker crée par défaut. Pour vérifier : `sudo firewall-cmd --list-ports` ne renvoie plus rien, `--list-rich-rules` affiche les deux règles, et une connexion à l'API de Grafana avec `admin` / `admin` répond `401`.

Le reste me paraît raisonnable : cAdvisor est privilégié, mais il n'expose aucun port, et Prometheus n'est joignable que depuis Docker.

## Le résultat

Le kiosque tourne en continu sur mon bureau. D'un coup d'œil, je vois la charge du serveur, la mémoire, le disque, le nombre de conteneurs et celui qui consomme le plus. Après cinq minutes sans toucher, l'écran s'éteint ; un doigt dessus, et il revient avec des données à jour.

![Première version fonctionnelle du dashboard : la grille tient, mais le curseur est au milieu, une bande vide reste en bas et le nom d'un conteneur déborde](dashboard-first-grid.jpg) ![Dashboard final sur le kiosque, posé sur le bureau : quatre tuiles, deux graphes et le top 5 des conteneurs sur toute la largeur](main.jpg)

*Avant et après : la première version qui tient sur l'écran, avec le curseur au milieu, une bande vide en bas et un nom à rallonge, puis le dashboard final.*

## Pour la suite

Le projet fait ce que je voulais, mais il y a de quoi l'étendre :

- **Des voyants par service.** Une rangée de voyants verts ou rouges en haut du dashboard, un par service (MakerStorage, PaperFlux, Ghost, tunnel Cloudflare). [blackbox_exporter](https://github.com/prometheus/blackbox_exporter) peut appeler l'URL de chaque service toutes les 15 secondes, et cloudflared expose le nombre de connexions actives du tunnel : à 0, les sites sont injoignables de l'extérieur.
- **Plusieurs serveurs.** Il suffit de lancer node_exporter sur une autre machine et d'ajouter sa cible dans `prometheus.yml`. Côté dashboard, une liste déroulante pour choisir le serveur, ou une playlist Grafana qui fait défiler un dashboard par machine.
- **Kubernetes.** Pour mon cluster k3s, la stack `kube-prometheus-stack` s'installe dans le cluster ; son Prometheus devient une seconde source dans Grafana, ou lui envoie ses métriques en `remote_write`. Dans les deux cas, rien ne change sur le Pi : il continue d'afficher une page web.
