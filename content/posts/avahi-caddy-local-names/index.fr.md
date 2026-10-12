---
title: Des noms .local pour vos services avec Avahi et Caddy
slug: avahi-caddy-local-names
lang: fr
date: 2026-10-12
description: "Ouvrir http://music.local plutôt qu'une IP et un port : Avahi publie des alias mDNS, Caddy aiguille vers le bon service. Sans serveur DNS ni réglage client."
tags:
  - Home lab
  - Linux
  - Bash
  - Raspberry Pi
category: Tutorials
image: main.jpg
---

Taper `http://music.local` plutôt que `http://192.168.1.42:8095` : c'est ce qu'on met en place ici, sans serveur DNS et sans rien configurer sur les clients.

Sur le petit serveur de nos bureaux, `server-tv`, tournent plusieurs services web : Music Assistant, l'interface des imprimantes 3D… Chacun a son port, et l'IP change dès que le DHCP du réseau redistribue les baux. Résultat : des favoris cassés et des « c'était quoi le port déjà ? ».

La solution tient en deux briques déjà présentes sur la plupart des distributions :

- **Avahi** annonce des noms en `.local` sur le réseau (mDNS), ici `music.local` et `3d-printers.local`.
- **Caddy** reçoit les requêtes sur le port 80 et les aiguille vers le bon service selon le nom demandé.

À la fin, n'importe quel Mac, iPhone ou PC Linux du réseau du bureau ouvre `http://music.local` directement.

## Comment ça marche

Tous les alias pointent vers la même IP : Avahi résout le nom, puis Caddy décide quel service répond.

<svg class="lan-diagram" viewBox="0 0 480 390" role="img" aria-labelledby="lan-diagram-title lan-diagram-desc" xmlns="http://www.w3.org/2000/svg">
  <title id="lan-diagram-title">Résolution d'un nom .local puis aiguillage par Caddy</title>
  <desc id="lan-diagram-desc">Le navigateur d'un client du LAN demande d'abord qui est music.local ; Avahi, sur server-tv, répond avec l'IP du serveur. Le navigateur envoie ensuite sa requête HTTP avec l'en-tête Host: music.local à Caddy, sur le port 80 du même serveur, qui la transmet à Music Assistant (port 8095) ou à l'interface des imprimantes 3D selon le nom.</desc>
  <style>
    .lan-diagram { display: block; width: 100%; max-width: 480px; height: auto; margin: 1.75rem auto; }
    .lan-diagram text { fill: hsl(var(--foreground)); font-family: inherit; font-size: 16px; }
    .lan-diagram .sub { fill: hsl(var(--muted-foreground)); font-size: 13.5px; }
    .lan-diagram .label { font-size: 14px; }
    .lan-diagram .name { font-weight: 600; }
    .lan-diagram .group { fill: hsl(var(--muted)); stroke: hsl(var(--muted-foreground)); stroke-dasharray: 6 4; }
    .lan-diagram .box { fill: hsl(var(--card)); stroke: hsl(var(--muted-foreground)); stroke-width: 1.2; }
    .lan-diagram .accent { stroke: hsl(var(--link)); stroke-width: 2.5; }
    .lan-diagram .edge { fill: none; stroke: hsl(var(--muted-foreground)); stroke-width: 1.5; }
    .lan-diagram .head { fill: hsl(var(--muted-foreground)); stroke: none; }
  </style>
  <defs>
    <marker id="lan-diagram-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto">
      <path class="head" d="M0,0 L10,5 L0,10 z" />
    </marker>
  </defs>
  <g fill="none" stroke="currentColor">
    <rect class="group" x="10" y="120" width="460" height="264" rx="10" />
    <rect class="box" x="150" y="10" width="180" height="56" rx="8" />
    <rect class="box" x="26" y="160" width="190" height="60" rx="8" />
    <rect class="box accent" x="264" y="160" width="190" height="60" rx="8" />
    <rect class="box" x="26" y="306" width="200" height="62" rx="8" />
    <rect class="box" x="254" y="306" width="200" height="62" rx="8" />
    <path class="edge" d="M205,66 L130,158" marker-end="url(#lan-diagram-arrow)" />
    <path class="edge" d="M275,66 L350,158" marker-end="url(#lan-diagram-arrow)" />
    <path class="edge" d="M330,222 L150,304" marker-end="url(#lan-diagram-arrow)" />
    <path class="edge" d="M359,222 L359,304" marker-end="url(#lan-diagram-arrow)" />
  </g>
  <g text-anchor="middle">
    <text x="240" y="35">Navigateur</text>
    <text class="sub" x="240" y="54">un client du LAN</text>
    <text x="121" y="186">Avahi (mDNS)</text>
    <text class="sub" x="121" y="206">répond avec l'IP</text>
    <text x="359" y="186">Caddy, port 80</text>
    <text class="sub" x="359" y="206">aiguille selon le nom</text>
    <text x="126" y="333">Music Assistant</text>
    <text class="sub" x="126" y="353">music.local, port 8095</text>
    <text x="354" y="333">Imprimantes 3D</text>
    <text class="sub" x="354" y="353">3d-printers.local</text>
  </g>
  <text class="name" x="26" y="144">server-tv</text>
  <g class="label" text-anchor="end">
    <text class="label" x="160" y="92">1. qui est</text>
    <text class="label" x="160" y="108">music.local ?</text>
  </g>
  <g class="label">
    <text class="label" x="310" y="92">2. requête HTTP</text>
    <text class="label" x="310" y="108">Host: music.local</text>
  </g>
</svg>

**mDNS, c'est du DNS sans serveur.** Quand un client cherche un nom en `.local`, il pose la question en multicast (224.0.0.251, port UDP 5353) et la machine concernée répond elle-même. Avahi en est l'implémentation sous Linux ; macOS et iOS le font nativement via Bonjour.

**Un alias, c'est un deuxième nom pour la même IP.** Avahi publie déjà `server-tv.local`. On lui demande d'annoncer en plus `music.local` et `3d-printers.local`, avec la même adresse.

**Caddy fait le tri.** Le navigateur arrive toujours sur le port 80 de la même machine, mais il envoie le nom tapé dans l'en-tête HTTP `Host`. Caddy lit cet en-tête et transmet au bon port en interne.

Pourquoi pas `/etc/avahi/hosts`, qui sert justement à publier des noms statiques ? Avahi y publie aussi l'enregistrement inverse (IP → nom), qui entre en conflit avec celui de la machine elle-même. `avahi-publish` avec l'option `-R` contourne le problème.

## Prérequis

- Un serveur Linux sous Debian, Ubuntu ou Raspberry Pi OS, avec systemd.
- Une IP fixe pour ce serveur, ou mieux un bail DHCP réservé (à demander au service informatique si vous ne gérez pas le réseau) : l'alias pointe vers une adresse précise.
- Les services déjà accessibles en local sur leur port (ici Music Assistant sur `8095`).
- Le port 80 libre sur le serveur.

On installe Avahi (souvent déjà présent) et Caddy depuis les dépôts :

```bash
sudo apt install avahi-daemon avahi-utils caddy
sudo systemctl enable --now avahi-daemon
```

`avahi-utils` fournit `avahi-publish` et `avahi-resolve`, dont on se sert plus bas. Sur Debian 12 et Ubuntu récents, le paquet `caddy` est dans les dépôts officiels ; sinon, le site de Caddy fournit un dépôt apt.

## Étape 1 : publier les alias avec Avahi

Un service systemd « modèle » publie un alias par instance : `avahi-alias@music.local`, `avahi-alias@3d-printers.local`, etc.

La commande de base est `avahi-publish -a -R <nom> <ip>`. Elle tourne tant qu'on ne l'arrête pas : le nom disparaît du réseau quand le processus s'arrête. C'est pour ça qu'on la confie à systemd.

**Le script.** Il récupère l'IP de l'interface réseau puis lance la publication. Créer `/usr/local/bin/avahi-alias` :

```bash
#!/bin/sh
# Usage : avahi-alias <nom.local> [interface]
IFACE="${2:-eth0}"
IP=$(ip -4 -o addr show dev "$IFACE" | awk '{print $4}' | cut -d/ -f1 | head -n1)
exec /usr/bin/avahi-publish -a -R "$1" "$IP"
```

```bash
sudo chmod +x /usr/local/bin/avahi-alias
```

Adaptez `eth0` au nom de votre interface (`ip -br addr` pour la trouver, souvent `enp1s0` ou `wlan0`). On évite `hostname -I`, qui peut renvoyer en premier l'IP du pont Docker (`172.17.x.x`) au lieu de celle du LAN.

**Le service modèle.** Créer `/etc/systemd/system/avahi-alias@.service` :

```ini
[Unit]
Description=Alias mDNS %i
Requires=avahi-daemon.service
After=avahi-daemon.service network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/avahi-alias %i
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

`%i` est remplacé par ce qui suit le `@`. On utilise `%i` et non `%I` : la version « décodée » transformerait le tiret de `3d-printers` en `/`.

**On active un service par nom :**

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now avahi-alias@music.local avahi-alias@3d-printers.local
```

Ajouter un alias plus tard, c'est une seule commande `enable --now` de plus.

## Étape 2 : aiguiller avec Caddy

Un bloc par nom dans le Caddyfile suffit : Caddy lit l'en-tête `Host` et transmet au port correspondant.

Remplacer le contenu de `/etc/caddy/Caddyfile` :

```text
http://music.local {
	reverse_proxy localhost:8095
}

http://3d-printers.local {
	reverse_proxy localhost:8080
}
```

Remplacez `8080` par le port de l'interface de vos imprimantes.

**Pourquoi le `http://` devant le nom ?** Sans lui, Caddy active son HTTPS automatique. Il ne peut pas obtenir de certificat public pour un nom en `.local`, donc il en signe un avec sa propre autorité locale, et le navigateur affiche un avertissement. Le préfixe `http://` désactive ce comportement pour le site concerné. Sur le réseau interne d'un bureau, c'est acceptable pour des outils sans données sensibles ; sinon, voir la conclusion.

**Les WebSockets passent tout seuls.** Music Assistant s'en sert pour son interface ; `reverse_proxy` gère la mise à niveau de connexion sans configuration supplémentaire.

**Et Docker ?** Ici Music Assistant tourne avec `network_mode: host`, donc `localhost:8095` fonctionne. Si votre conteneur est en mode bridge, pointez vers le port publié sur l'hôte.

On valide la config puis on recharge :

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## Étape 3 : tester

On vérifie dans l'ordre : le service tourne, le nom se résout, puis HTTP répond.

1. **Sur le serveur**, l'alias est-il publié ?

   ```bash
   systemctl status avahi-alias@music.local
   avahi-resolve -n music.local
   ```

   `avahi-resolve` doit renvoyer l'IP du LAN, pas celle de Docker.

2. **Depuis une autre machine**, le nom se résout-il ?

   ```bash
   ping -c 2 music.local
   # sur macOS, plus bavard :
   dns-sd -G v4 music.local
   ```

3. **Caddy répond-il ?**

   ```bash
   curl -I http://music.local
   ```

   Un `200 OK` (ou une redirection) signifie que la chaîne complète fonctionne. Il ne reste qu'à ouvrir `http://music.local` dans le navigateur.

Si le test 2 échoue alors que le 1 passe, le problème est sur le réseau ; si c'est le 3, il est dans Caddy (`journalctl -u caddy`).

## Dépannage et limites

La plupart des pannes viennent du réseau ou des clients, pas de la config.

| Symptôme | Cause probable | Correction |
| --- | --- | --- |
| Le nom ne répond plus après une coupure réseau ou un renouvellement de bail | L'IP du serveur a changé ; le script ne la lit qu'au démarrage | Réserver le bail DHCP, puis `systemctl restart avahi-alias@music.local` |
| Le service redémarre en boucle, « Local name collision » dans les logs | Une autre machine annonce déjà ce nom | Choisir un autre alias |
| Rien ne se résout depuis les autres machines | Pare-feu actif sur le serveur | `sudo ufw allow 5353/udp` et `sudo ufw allow 80/tcp` |
| Ça marche en Ethernet mais pas en Wi-Fi | Réseau invité, isolation des clients ou filtrage du multicast sur le point d'accès | Désactiver l'isolation, ou rester sur le même réseau que le serveur |
| Ça marche sur Mac et iPhone, pas sur Android | Support de `.local` variable selon la version et l'application | Garder l'IP en favori de secours |
| Résolution lente ou aléatoire sous Windows | Support mDNS natif partiel | Installer Bonjour (fourni avec iTunes ou les outils Apple) |

Une limite de fond : mDNS ne traverse pas les routeurs. Si le réseau de l'entreprise est découpé en VLAN, ce qui est fréquent, les noms ne sont visibles que dans le sous-réseau du serveur, sauf à mettre en place un réflecteur mDNS.

## Conclusion

Deux fichiers et un bloc de Caddyfile par service : chaque nouvel outil du serveur a désormais son adresse lisible en moins de cinq minutes.

Pour aller plus loin, on peut remplacer le `http://` par `tls internal` et installer le certificat racine de Caddy sur ses appareils, pour avoir du HTTPS sans avertissement. Ce sera peut-être un prochain article.
