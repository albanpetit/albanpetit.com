---
title: "Grafana Kiosk: my home server's health on a desk screen"
slug: grafana-kiosk
lang: en
date: 2026-11-19
description: "A Raspberry Pi 4 and the official 7-inch touchscreen, in a 3D printed stand, show the Grafana dashboard of my Asahi Linux home server around the clock."
tags:
  - Homelab
  - Raspberry Pi
  - Docker
  - Grafana
  - 3D Printing
project: Grafana Kiosk
overview: true
status: done
image: main.jpg
---

My home server is an **M1 Mac mini running Asahi Linux**, the one that lives in [my 10-inch rack](/post/rack-10inch-mac-mini/). It runs all my services in Docker containers: MakerStorage, the web service behind [PaperFlux](/post/paperflux/), a Ghost site and the Cloudflare tunnel that publishes them. As long as everything works, I don't think about it. And that is exactly the problem: to know whether it is healthy, I have to open a terminal or keep a tab open, which I never do.

I wanted the opposite: information that stays in sight without asking for anything. A small screen on the desk that always shows the server's state, turns off when I'm not using it and wakes up with a touch. I happened to have a Raspberry Pi 4 and the official 7-inch touchscreen in stock. All it needed was a stand and a few evenings.

| | |
|---|---|
| **Hardware** | Raspberry Pi 4, official Raspberry Pi 7" Touch Display v1 (800 × 480), 3 A USB-C power supply |
| **Stand** | Printables model printed in two colors |
| **Server** | M1 Mac mini, Fedora Asahi Remix, Docker |
| **Monitoring** | Prometheus, node_exporter, cAdvisor and Grafana in Docker Compose |
| **Kiosk** | Raspberry Pi OS Lite, labwc, Chromium, swayidle |

## The idea: the server collects, the Pi displays

All the collection runs on the Mac mini. The Pi only opens a web page full screen: it stores no data and can be reinstalled in a quarter of an hour if needed.

```mermaid
flowchart LR
    subgraph MAC["M1 Mac mini, Asahi Linux, Docker Compose"]
        NE["node_exporter<br/>machine metrics"] --> PROM
        CA["cAdvisor<br/>per-container metrics"] --> PROM
        PROM["Prometheus<br/>scrapes every 15 s<br/>keeps 30 days"] --> GRAF["Grafana<br/>anonymous read access"]
    end
    GRAF -- "HTTP :3000, local network" --> PI["Raspberry Pi 4<br/>Chromium in kiosk mode<br/>7-inch touchscreen"]
```

## The hardware and the 3D printed stand

The screen is the **official Touch Display v1**, released in 2015: 7 inches, 800 × 480 pixels, connected to the Pi through a DSI ribbon cable. That is not many pixels, and the whole dashboard is designed around this constraint.

For the stand, I printed the [Raspberry Pi 7 Inch Touchscreen Case with Rotating Stand](https://www.printables.com/model/833644-raspberry-pi-7-inch-touchscreen-case-with-rotating) model by 5iStanley (CC BY-NC license), in two colors: the screen frame and the vented back cover in black, the rotating stand and the Pi box in yellow.

![Black screen frame and vented back cover on the printer bed](print-black-frame.jpg) ![Black frame and vented back cover off the printer, on a cutting mat](black-frame-and-back-cover.jpg)

*Printing the black frame and the vented back cover.*

![Rotating stand and yellow Pi box on the printer bed](print-yellow-stand.jpg) ![Small yellow vented hatch on the printer bed](print-vent-hatch.jpg)

*Printing the rotating stand and the yellow Pi box, then a small vented hatch.*

The model is designed for the v1 screen: a Pi 4 screws onto the back of the screen with the same holes and the same DSI ribbon as a Pi 3. That works out well: my screen still had an old Pi 3 mounted on its back, which the Pi 4 replaces.

![Official Raspberry Pi 7-inch Touch Display v1 on the cutting mat](touchscreen-v1.jpg) ![Back of the 7-inch screen with the old Raspberry Pi 3 screwed onto it](touchscreen-back-old-pi3.jpg)

*The 7" v1 screen, and its back with the old Pi 3, before taking it apart.*

The wiring comes down to three things. The DSI ribbon goes into the Pi's **DISPLAY** port (not CAMERA). For power, the screen only needs two wires: the **red one (5 V) on pin 2** and the **black one (GND) on pin 6** of the GPIO header. The green and yellow wires (SDA and SCL) stay unplugged: they were only needed on the very first Pis. Only the Pi is powered, over 3 A USB-C, and it powers the screen: a single cable leaves the stand.

![Raspberry Pi 4 on the cutting mat](raspberry-pi-4.jpg) ![Raspberry Pi 4 screwed onto the back of the screen, with the DSI ribbon and the power wires](pi4-on-screen-back.jpg)

*The Pi 4, then screwed onto the back of the screen with the DSI ribbon and the wires.*

![Raspberry Pi 4 on the back of the screen, inside the printed black frame](pi4-in-black-frame.jpg) ![Raspberry Pi 4 in the yellow box, with the DSI ribbon and the red and black wires to the GPIO](pi-box-wiring.jpg)

*The Pi 4 in the black frame, and the wiring inside the box: DSI ribbon, red (5 V) and black (GND) wires to the GPIO.*

![Yellow box open on its hinge above the Pi 4](pi-box-hinge.jpg) ![Yellow box closing over the Pi 4](pi-box-closing.jpg) ![Closed back of the stand, with the yellow vented hatch](back-closed.jpg)

*The yellow box and its hinge close over the Pi, then the closed back with the vented hatch.*

![Finished stand from the front, screen off, on the yellow rotating stand](stand-front.jpg) ![Finished stand from the back, with the USB and Ethernet ports reachable on the side](stand-back.jpg)

*The finished stand, front and back: the USB and Ethernet ports stay reachable on the side.*

## Server side: the monitoring stack

On the Mac mini, four containers in a single Docker Compose file are enough:

- [**node_exporter**](https://github.com/prometheus/node_exporter) measures the machine itself: CPU, RAM, disk, network, load. It runs on the host network and reads the host file system read-only, so that it measures the Mac mini and not its own container.
- [**cAdvisor**](https://github.com/google/cadvisor), by Google, measures each container: CPU, RAM and network, with its name.
- [**Prometheus**](https://prometheus.io/) is the time series database. Every 15 seconds, it scrapes both exporters, and it keeps 30 days of history.
- [**Grafana**](https://grafana.com/oss/grafana/) draws the dashboards from Prometheus. It is the page the Pi displays.

All four are written in Go and published for ARM64: Docker picks the right image for the Apple chip on its own.

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

A few details specific to Asahi Linux, which is a Fedora with SELinux and firewalld:

- The `:z` on the volumes and node_exporter's `label=disable` take care of the SELinux labels. Without them, the containers run into "permission denied" errors.
- `extra_hosts` lets Prometheus reach node_exporter, which runs on the host network, under the name `host.docker.internal`.
- Only Grafana publishes a port. node_exporter, on the host network, listens directly on the machine's port 9100 (more on that in the security section), and Prometheus and cAdvisor can only be reached from the Docker network.
- The Asahi kernel uses 16 KB memory pages, which crashes some ARM images (often those that bundle jemalloc). These four are not affected, but it is the first suspect when a container refuses to start.

The Prometheus configuration fits in a few lines, with its two targets:

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

On the Grafana side, I didn't click anything: the Prometheus data source and the dashboard are **provisioned from files**, in the `grafana/` and `dashboards/` folders mounted into the container. When I edit the dashboard's JSON, Grafana reloads it on its own within about ten seconds.

### A dashboard designed for 800 × 480

Community dashboards are unreadable on a 7-inch screen. I made a dedicated one, readable from a meter away and without scrolling:

- **At the top, four tiles** with a colored background: CPU, RAM and disk (green, orange at 70 %, red at 90 %), and the number of running containers.
- **In the middle, two graphs over one hour**: CPU and RAM, then incoming and outgoing network throughput (without Docker's virtual interfaces).
- **At the bottom, the top 5 containers** by CPU usage, as a percentage of one core.

All in dark theme, refreshed every 30 seconds: enough for a glance, and easy on the Pi. The dashboard can be [downloaded as JSON](dashboard-bureau.json); it imports as is into Grafana, with a Prometheus data source that scrapes node_exporter and cAdvisor.

## Pi side: a minimal kiosk

On the Pi, no full desktop: **Raspberry Pi OS Lite 64-bit** (Trixie), plus the bare graphical minimum. I flashed the card with Raspberry Pi Imager, setting the hostname, user, Wi-Fi and SSH in its options (the details are in my tutorials on [SSH](/post/raspberry-ssh-config/) and [Wi-Fi](/post/raspberry-wifi-config/)).

Then, a few packages:

```bash
sudo apt install -y --no-install-recommends labwc chromium swayidle wlopm wlrctl fonts-dejavu-core
```

- [**labwc**](https://labwc.github.io/) is the Wayland compositor of Raspberry Pi OS Desktop, used here on its own, without the rest of the desktop.
- **Chromium** shows Grafana full screen.
- **swayidle** and **wlopm** handle screen blanking, **wlrctl** hides the cursor.

The Pi logs in automatically on the console (`sudo raspi-config nonint do_boot_behaviour B2`), and `~/.bash_profile` starts labwc on the physical screen:

```bash
[ "$(tty)" = "/dev/tty1" ] && exec labwc
```

Everything else lives in `~/.config/labwc/autostart`, which labwc runs when it starts:

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

- **The first line** sends the cursor to the corner of the screen so it doesn't sit in the middle of the dashboard.
- **The second one** handles blanking: after 300 seconds without a touch, the screen is turned off; a touch counts as activity and turns it back on. Chromium and Grafana keep running while the screen is off, so the dashboard is up to date as soon as it wakes up.
- **The loop** restarts Chromium if it crashes. It also reloads the page after a change to the dashboard layout: a `pkill chromium`, and the page is back three seconds later.

The kiosk URL is kept separately, in `~/.config/kiosk-url`, so it can be changed without touching the rest. It looks like this, `kiosk` hiding Grafana's menus:

```text
http://<server-ip>:3000/d/bureau/bureau?kiosk&refresh=30s
```

Once everything works, one protection remains: making the SD card read-only (`sudo raspi-config nonint do_overlayfs 0`, then a reboot). A power cut can then no longer corrupt it; in return, any change on the Pi requires turning the overlay off for the duration.

## The snags and how I solved them

On paper, it all fit in one evening. In practice, four problems kept me busy longer than planned.

### A faulty SD card

On the first boot, the screen froze after the i2c driver loaded: no ping, no SSH. The wiring and the system had nothing to do with it: it was **the SD card**, simply faulty. Switching cards solved the problem. Along the way, I learned that a green LED that is off on a Pi means "card idle", not "crashed".

### Port 9090 already taken by Cockpit

Prometheus could not publish its port 9090: it was already taken. By **Cockpit**, Fedora's web administration interface, which systemd listens for on that port (`cockpit.socket`). Rather than moving one or the other, I removed the port mapping: Grafana reaches Prometheus over the Docker network, and nobody else needs to query it. For a debugging query, I go through the container:

```bash
docker compose exec prometheus wget -qO- 'localhost:9090/api/v1/targets'
```

### cAdvisor loses the container names with Docker 29

The first display proudly announced "Conteneurs: No data" (containers, on my French dashboard). cAdvisor was running, but it saw the containers without their names, with "failed to identify the read-write layer ID" errors in its logs. The cause: **Docker 29** uses containerd's image store by default, which cAdvisor 0.49 cannot read. Support arrived with [PR #3709](https://github.com/google/cadvisor/pull/3709), and moving to **v0.57.0** fixed everything. Watch out for the registry: new cAdvisor images are published on GHCR (`ghcr.io/google/cadvisor`), no longer on `gcr.io`, where the old versions can still be found.

### Grafana switches to its mobile layout at 800 px

Second surprise of the first display: instead of my grid, the tiles were stacked on top of each other, with a scroll bar. At 800 pixels wide, Grafana thinks it is on a phone and switches to its **mobile layout**.

![First kiosk display: the CPU, RAM and disk tiles stacked at full width, and the containers tile showing No data](dashboard-mobile-layout.jpg)

*First display, before the fix: tiles stacked in mobile layout, and "Conteneurs: No data" because of cAdvisor 0.49.*

The fix is a zoom on the Chromium side: with `--force-device-scale-factor=0.8`, the page believes it has 1000 × 600 pixels and keeps its grid. The text gets a little smaller, but it stays readable.

Two finishing touches came next. The name of the MakerStorage web container, with its hash suffix, overflowed the top 5: a `label_replace` in the query strips that suffix. And the cursor stayed in the middle of the screen, hence the `wlrctl` line in the autostart.

## Security

A dashboard with anonymous access and open exporters is convenient, but only as long as it stays inside the house.

**The Cloudflare tunnel** only publishes the hostnames configured in it. The monitoring stack is therefore not visible from the Internet, and it must not become so: with anonymous access enabled, publishing Grafana would mean showing the server's state to everyone.

**On the local network**, three things were too open after the installation:

1. **Grafana's admin account** still had its default password. I changed it, and stored it in my password manager:
   ```bash
   docker exec -it monitoring-grafana grafana cli admin reset-admin-password '<new-password>'
   ```
2. **node_exporter's port 9100** was open to the whole local network, while only Prometheus, inside Docker, needs it.
3. **Grafana's port 3000** was open to every network, while only the local network needs it.

For both ports, I removed the global openings from firewalld and replaced them with rules limited to the right source:

```bash
sudo firewall-cmd --permanent --remove-port=3000/tcp --remove-port=9100/tcp
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="172.16.0.0/12" port port="9100" protocol="tcp" accept'
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="<local-network>/24" port port="3000" protocol="tcp" accept'
sudo firewall-cmd --reload
```

`172.16.0.0/12` covers the networks Docker creates by default. To check: `sudo firewall-cmd --list-ports` returns nothing anymore, `--list-rich-rules` shows both rules, and logging into Grafana's API with `admin` / `admin` returns `401`.

The rest seems reasonable to me: cAdvisor is privileged, but it exposes no port, and Prometheus can only be reached from Docker.

## The result

The kiosk runs around the clock on my desk. At a glance, I see the server's load, memory, disk, the number of containers and which one uses the most. After five minutes without a touch, the screen turns off; one finger on it, and it comes back with up-to-date data.

![First working version of the dashboard: the grid fits, but the cursor sits in the middle, an empty band remains at the bottom and a container name overflows](dashboard-first-grid.jpg) ![Final dashboard on the kiosk, on the desk: four tiles, two graphs and the top 5 containers across the full width](main.jpg)

*Before and after: the first version that fits the screen, with the cursor in the middle, an empty band at the bottom and an overly long name, then the final dashboard.*

## What's next

The project does what I wanted, but there is room to extend it:

- **Per-service status lights.** A row of green or red lights at the top of the dashboard, one per service (MakerStorage, PaperFlux, Ghost, Cloudflare tunnel). [blackbox_exporter](https://github.com/prometheus/blackbox_exporter) can call each service's URL every 15 seconds, and cloudflared exposes the tunnel's number of active connections: at 0, the sites cannot be reached from outside.
- **Several servers.** All it takes is running node_exporter on another machine and adding its target to `prometheus.yml`. On the dashboard side, a drop-down list to pick the server, or a Grafana playlist that cycles through one dashboard per machine.
- **Kubernetes.** For my k3s cluster, the `kube-prometheus-stack` installs inside the cluster; its Prometheus becomes a second data source in Grafana, or sends its metrics to it with `remote_write`. Either way, nothing changes on the Pi: it keeps showing a web page.
