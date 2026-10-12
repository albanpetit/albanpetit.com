---
title: Arrêt propre d'un Raspberry sur coupure de courant
slug: raspberry-power-loss-shutdown
lang: fr
date: 2026-10-12
description: "Éteindre proprement un Raspberry Pi quand le courant saute : un UPS à supercondensateurs, la coupure détectée sur un GPIO et un service systemd pour l'arrêt."
tags:
  - Bash
  - Python
  - Raspberry Pi
  - Home lab
category: Tutorials
---

Un **Raspberry Pi** n'aime pas qu'on lui retire la prise. Au moment de la coupure, le système peut être en train d'écrire sur la carte SD : un fichier de log, une base de données, le journal du système de fichiers. Dans le meilleur des cas, il faut attendre un `fsck` au démarrage suivant. Dans le pire, la carte SD est corrompue et le Raspberry ne redémarre plus.

Dans le [Mini Rack](/fr/post/rack-10inch/), tout est branché sur une seule multiprise : une coupure de courant éteint toutes les machines d'un coup. Pour les cartes Raspberry Pi qui tournent en continu, je voulais qu'elles aient le temps de s'éteindre proprement. Il faut pour cela trois choses :

1. **Une réserve d'énergie** qui prend le relais quelques secondes après la coupure.
2. **Un signal** qui prévient le Raspberry que le secteur a disparu.
3. **Un programme** qui écoute ce signal et lance l'arrêt du système avant que la réserve ne soit vide.

<!-- À COMPLÉTER : photo du Raspberry Pi monté avec l'UPS (image: main.jpg dans le front matter). -->

## Le matériel

| | |
|---|---|
| **Carte** | Raspberry Pi 5 (fonctionne aussi avec un Pi 4B ou 3B) |
| **UPS** | [Geekworm UPS Scap 5V5A](https://wiki.geekworm.com/UPS_Scap_5V5A), version 100 F |
| **Alimentation** | Bloc 12 V en jack 5,5 × 2,1 mm (9 à 24 V acceptés) ou chargeur USB-C PD 12 V |
| **Système** | Raspberry Pi OS |

### Pourquoi des supercondensateurs

La plupart des UPS pour Raspberry Pi utilisent des batteries lithium (18650 ou LiPo). Elles offrent des heures d'autonomie, mais elles vieillissent, chauffent et demandent un circuit de charge soigné. Pour un serveur dans un rack qui tourne jour et nuit, je n'ai pas besoin de tenir des heures : j'ai seulement besoin de **tenir le temps d'un arrêt propre**.

C'est exactement ce que font les supercondensateurs. Ils se rechargent en une quinzaine de minutes, supportent plus de 500 000 cycles et ne craignent pas de rester chargés en permanence. En contrepartie, leur autonomie se compte en secondes ou en minutes. D'après Geekworm, la version 100 F tient environ **9 secondes** à pleine charge (5 V, 5 A), et jusqu'à **3 minutes et demie** à 0,5 A en mode longue endurance. Un Raspberry Pi 5 au repos consomme bien moins que 5 A : en pratique, la marge est confortable.

<!-- À COMPLÉTER : consommation mesurée du Pi 5 au repos et autonomie réelle observée. -->

La carte propose deux modes, choisis par un pont de soudure : **Performance** (P, coupure à 2,4 V) et **Longue endurance** (L, coupure à 1,6 V). Le second exploite plus profondément les condensateurs et donne plus d'autonomie.

### Le branchement

L'UPS s'intercale entre l'alimentation et le Raspberry Pi. Le bloc secteur se branche sur l'entrée de l'UPS, et le Raspberry Pi est alimenté par la sortie USB-C de l'UPS, qui négocie le profil 5 V / 5 A du Pi 5. Une seule entrée de charge doit être utilisée à la fois : soit le jack, soit l'USB-C PD.

En plus de l'alimentation, l'UPS est relié au connecteur GPIO du Raspberry Pi pour deux informations :

- **GPIO26** indique la présence du secteur : il est à l'**état haut** (3,3 V) tant que l'alimentation externe est présente, et passe à l'**état bas** (0 V) dès qu'elle disparaît.
- Le **bus I2C** donne accès à un INA219 qui mesure la tension des supercondensateurs et le courant de charge ou de décharge.

C'est GPIO26 qui nous intéresse : il suffit de surveiller son passage à l'état bas pour savoir que le courant a sauté.

## Détecter la coupure

Avant d'écrire quoi que ce soit, on vérifie que le signal arrive bien. Raspberry Pi OS fournit `pinctrl`, qui lit l'état d'une broche :

```bash
pinctrl get 26
```

Avec le secteur branché, la ligne se termine par `hi`. Débranchez l'alimentation de l'UPS (le Raspberry Pi continue de tourner sur les condensateurs) et relancez la commande : elle doit maintenant afficher `lo`. Rebranchez aussitôt.

## Le script d'arrêt

Le script est écrit en Python avec [gpiozero](https://gpiozero.readthedocs.io/), installée par défaut sur Raspberry Pi OS et compatible avec le Pi 5. Il attend la coupure, laisse un court délai de grâce pour ignorer les micro-coupures, puis lance l'arrêt du système si le courant n'est pas revenu.

Créez le fichier `/usr/local/bin/ups-shutdown.py` :

```bash
sudo nano /usr/local/bin/ups-shutdown.py
```

```python
#!/usr/bin/env python3
"""Shut the Raspberry Pi down cleanly when the UPS reports a power loss."""
import subprocess
import syslog

from gpiozero import DigitalInputDevice

POWER_GPIO = 26      # High while external power is present
GRACE_SECONDS = 2.0  # Outages shorter than this are ignored

# The UPS drives the pin itself: no internal pull-up or pull-down
power = DigitalInputDevice(POWER_GPIO, pull_up=None, active_state=True)

while True:
    power.wait_for_inactive()
    syslog.syslog(syslog.LOG_WARNING, f"Power lost, waiting {GRACE_SECONDS:.0f} s")

    if power.wait_for_active(timeout=GRACE_SECONDS):
        syslog.syslog(syslog.LOG_NOTICE, "Power is back, shutdown cancelled")
        continue

    syslog.syslog(syslog.LOG_CRIT, "Power still off, shutting down")
    subprocess.run(["systemctl", "poweroff"], check=False)
    break
```

Quelques points sur ce script :

- `pull_up=None` désactive les résistances internes : c'est l'UPS qui fixe l'état de la broche, il ne faut pas lutter contre lui. gpiozero demande alors de préciser `active_state=True`, c'est-à-dire que l'état haut signifie « secteur présent ».
- `wait_for_inactive()` bloque jusqu'à la coupure, sans boucle d'attente active qui consommerait du processeur.
- Le **délai de grâce** évite d'éteindre le serveur pour un simple creux de tension. Il doit rester court : chaque seconde passée à attendre est une seconde de moins pour l'arrêt.
- `systemctl poweroff` demande un arrêt normal à systemd, exactement comme la commande `sudo poweroff` : les services sont arrêtés dans l'ordre, les systèmes de fichiers démontés.

Rendez le script exécutable :

```bash
sudo chmod +x /usr/local/bin/ups-shutdown.py
```

## Le service systemd

Le script doit démarrer avec le Raspberry Pi et tourner en permanence. C'est le rôle d'un service **systemd**. Créez le fichier `/etc/systemd/system/ups-shutdown.service` :

```bash
sudo nano /etc/systemd/system/ups-shutdown.service
```

```ini
[Unit]
Description=Clean shutdown on power loss (UPS Scap)
After=multi-user.target

[Service]
Type=simple
ExecStart=/usr/bin/python3 /usr/local/bin/ups-shutdown.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Le service tourne en `root`, ce qui lui permet d'arrêter le système sans `sudo`. `Restart=on-failure` le relance si le script plante. Activez-le et démarrez-le :

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ups-shutdown.service
```

Vérifiez qu'il tourne :

```bash
sudo systemctl status ups-shutdown.service
```

## Tester pour de vrai

Un mécanisme d'arrêt qu'on n'a jamais testé ne fonctionne pas. Ouvrez une session SSH (voir la [configuration SSH](/fr/post/raspberry-ssh-config/)) et suivez les messages du service :

```bash
journalctl -u ups-shutdown.service -f
```

Faites ensuite deux essais :

1. **Une micro-coupure** : débranchez l'alimentation de l'UPS une seconde, puis rebranchez-la. Le journal doit afficher `Power lost`, puis `Power is back, shutdown cancelled`, et le Raspberry Pi continue de tourner.
2. **Une vraie coupure** : débranchez l'alimentation et laissez-la débranchée. Après le délai de grâce, la session SSH se ferme et le Raspberry Pi s'éteint. La LED d'activité doit cesser de clignoter **avant** que les condensateurs ne soient vides.

Au redémarrage suivant, le journal du démarrage précédent confirme que l'arrêt s'est fait proprement :

```bash
journalctl -b -1 -e
```

Les dernières lignes doivent montrer la séquence d'arrêt normale de systemd, et non une coupure brutale au milieu d'un message.

<!-- À COMPLÉTER : durée d'arrêt mesurée sur mon Pi 5 et marge restante sur les condensateurs. -->

## Garder de la marge

L'arrêt doit se terminer avant la fin de la réserve. Trois réglages aident à garder de la marge :

- **Mesurer la durée de l'arrêt.** Lors du test, notez le temps entre le message `shutting down` et l'extinction de la LED. Ajoutez le délai de grâce : le total doit rester nettement sous l'autonomie de l'UPS avec votre charge.
- **Limiter l'attente des services récalcitrants.** Par défaut, systemd attend jusqu'à 90 secondes qu'un service accepte de s'arrêter. Avec quelques secondes de réserve, c'est beaucoup trop. Dans `/etc/systemd/system.conf`, décommentez et réduisez la valeur :

  ```ini
  DefaultTimeoutStopSec=10s
  ```

- **Alléger la charge.** Les disques USB et les périphériques branchés sur le Raspberry Pi puisent dans la même réserve. Moins il y en a, plus l'arrêt a de temps.

## Le retour du courant

Une fois le Raspberry Pi arrêté, il faut qu'il redémarre quand le secteur revient. Sur un Raspberry Pi classique, le démarrage se fait à la mise sous tension : si les condensateurs se sont vidés pendant la coupure, le retour du courant suffit à le relancer. Si le courant revient alors que le Pi 5 est arrêté mais encore alimenté par l'UPS, il reste éteint : c'est le rôle du contact de réveil prévu par Geekworm pour le Pi 5, décrit sur le [wiki de l'UPS](https://wiki.geekworm.com/UPS_Scap_5V5A_Software).

<!-- À COMPLÉTER : comportement observé au retour du courant et câblage du contact de réveil. -->

## Pour aller plus loin

- **Surveiller les condensateurs.** L'INA219 est accessible en I2C : après avoir activé l'I2C dans `sudo raspi-config`, la commande `i2cdetect -y 1` affiche son adresse. On peut alors lire la tension des condensateurs et l'envoyer dans un tableau de bord.
- **Prévenir avant d'éteindre.** Le script peut envoyer une notification (e-mail, ntfy, Home Assistant) au moment de la coupure, à condition que le réseau tienne encore.
- **Sans script.** Raspberry Pi OS propose un overlay `gpio-shutdown` qui transforme une broche en bouton d'arrêt. Il évite d'écrire du code, mais n'offre pas de délai de grâce : la moindre micro-coupure éteint la machine.

Avec quelques dizaines d'euros de matériel et une trentaine de lignes de code, le Raspberry Pi ne subit plus les coupures de courant : il s'éteint proprement, et la carte SD survit.
