---
title: .local names for your services with Avahi and Caddy
slug: avahi-caddy-local-names
lang: en
date: 2026-10-12
description: "Open http://music.local instead of an IP and a port: Avahi publishes mDNS aliases, Caddy routes to the right service. No DNS server, no client setup."
tags:
  - Homelab
  - Linux
  - Bash
  - Raspberry Pi
category: Tutorials
image: main.jpg
---

Typing `http://music.local` rather than `http://192.168.1.42:8095`: that's what we set up here, with no DNS server and nothing to configure on the clients.

The small server in our office, `server-tv`, runs several web services: Music Assistant, the 3D printers' interface… Each has its own port, and the IP changes whenever the network's DHCP hands out leases again. The result: broken bookmarks and "what was the port again?".

The solution relies on two building blocks already available on most distributions:

- **Avahi** announces `.local` names on the network (mDNS), here `music.local` and `3d-printers.local`.
- **Caddy** receives requests on port 80 and routes them to the right service based on the requested name.

In the end, any Mac, iPhone or Linux PC on the office network opens `http://music.local` directly.

## How it works

All the aliases point to the same IP: Avahi resolves the name, then Caddy decides which service answers.

<svg class="lan-diagram" viewBox="0 0 480 390" role="img" aria-labelledby="lan-diagram-title lan-diagram-desc" xmlns="http://www.w3.org/2000/svg">
  <title id="lan-diagram-title">Resolving a .local name, then routing by Caddy</title>
  <desc id="lan-diagram-desc">A browser on a LAN client first asks who music.local is; Avahi, on server-tv, replies with the server's IP. The browser then sends its HTTP request with the Host: music.local header to Caddy, on port 80 of the same server, which forwards it to Music Assistant (port 8095) or to the 3D printers' interface depending on the name.</desc>
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
    <text x="240" y="35">Browser</text>
    <text class="sub" x="240" y="54">a client on the LAN</text>
    <text x="121" y="186">Avahi (mDNS)</text>
    <text class="sub" x="121" y="206">replies with the IP</text>
    <text x="359" y="186">Caddy, port 80</text>
    <text class="sub" x="359" y="206">routes by name</text>
    <text x="126" y="333">Music Assistant</text>
    <text class="sub" x="126" y="353">music.local, port 8095</text>
    <text x="354" y="333">3D printers</text>
    <text class="sub" x="354" y="353">3d-printers.local</text>
  </g>
  <text class="name" x="26" y="144">server-tv</text>
  <g class="label" text-anchor="end">
    <text class="label" x="160" y="92">1. who is</text>
    <text class="label" x="160" y="108">music.local?</text>
  </g>
  <g class="label">
    <text class="label" x="310" y="92">2. HTTP request</text>
    <text class="label" x="310" y="108">Host: music.local</text>
  </g>
</svg>

**mDNS is DNS without a server.** When a client looks up a `.local` name, it asks the question over multicast (224.0.0.251, UDP port 5353) and the machine concerned answers by itself. Avahi is the Linux implementation; macOS and iOS do it natively through Bonjour.

**An alias is a second name for the same IP.** Avahi already publishes `server-tv.local`. We ask it to also announce `music.local` and `3d-printers.local`, with the same address.

**Caddy does the sorting.** The browser always lands on port 80 of the same machine, but it sends the name it was given in the HTTP `Host` header. Caddy reads that header and forwards to the right port internally.

Why not `/etc/avahi/hosts`, which is meant precisely for publishing static names? Avahi also publishes the reverse record (IP → name) from it, which conflicts with the machine's own. `avahi-publish` with the `-R` option works around the problem.

## Prerequisites

- A Linux server running Debian, Ubuntu or Raspberry Pi OS, with systemd.
- A fixed IP for that server, or better a reserved DHCP lease (ask your IT department if you don't manage the network): the alias points to a specific address.
- The services already reachable locally on their port (here Music Assistant on `8095`).
- Port 80 free on the server.

Install Avahi (often already there) and Caddy from the repositories:

```bash
sudo apt install avahi-daemon avahi-utils caddy
sudo systemctl enable --now avahi-daemon
```

`avahi-utils` provides `avahi-publish` and `avahi-resolve`, which we use below. On Debian 12 and recent Ubuntu releases, the `caddy` package is in the official repositories; otherwise, the Caddy website provides an apt repository.

## Step 1: publish the aliases with Avahi

A systemd "template" service publishes one alias per instance: `avahi-alias@music.local`, `avahi-alias@3d-printers.local`, and so on.

The base command is `avahi-publish -a -R <name> <ip>`. It keeps running until it is stopped: the name disappears from the network when the process exits. That's why we hand it over to systemd.

**The script.** It gets the IP of the network interface, then starts publishing. Create `/usr/local/bin/avahi-alias`:

```bash
#!/bin/sh
# Usage: avahi-alias <name.local> [interface]
IFACE="${2:-eth0}"
IP=$(ip -4 -o addr show dev "$IFACE" | awk '{print $4}' | cut -d/ -f1 | head -n1)
exec /usr/bin/avahi-publish -a -R "$1" "$IP"
```

```bash
sudo chmod +x /usr/local/bin/avahi-alias
```

Replace `eth0` with the name of your interface (`ip -br addr` to find it, often `enp1s0` or `wlan0`). We avoid `hostname -I`, which may return the Docker bridge IP (`172.17.x.x`) first instead of the LAN one.

**The template service.** Create `/etc/systemd/system/avahi-alias@.service`:

```ini
[Unit]
Description=mDNS alias %i
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

`%i` is replaced by whatever follows the `@`. We use `%i` and not `%I`: the "unescaped" version would turn the dash in `3d-printers` into a `/`.

**Enable one service per name:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now avahi-alias@music.local avahi-alias@3d-printers.local
```

Adding an alias later takes just one more `enable --now` command.

## Step 2: route with Caddy

One block per name in the Caddyfile is enough: Caddy reads the `Host` header and forwards to the matching port.

Replace the contents of `/etc/caddy/Caddyfile`:

```text
http://music.local {
	reverse_proxy localhost:8095
}

http://3d-printers.local {
	reverse_proxy localhost:8080
}
```

Replace `8080` with the port of your printers' interface.

**Why the `http://` in front of the name?** Without it, Caddy turns on its automatic HTTPS. It can't get a public certificate for a `.local` name, so it signs one with its own local authority, and the browser shows a warning. The `http://` prefix disables this behavior for that site. On an office's internal network, that's acceptable for tools without sensitive data; otherwise, see the conclusion.

**WebSockets just work.** Music Assistant uses them for its interface; `reverse_proxy` handles the connection upgrade with no extra configuration.

**What about Docker?** Here Music Assistant runs with `network_mode: host`, so `localhost:8095` works. If your container is in bridge mode, point to the port published on the host.

Validate the config, then reload:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## Step 3: test

Check in order: the service is running, the name resolves, then HTTP answers.

1. **On the server**, is the alias published?

   ```bash
   systemctl status avahi-alias@music.local
   avahi-resolve -n music.local
   ```

   `avahi-resolve` should return the LAN IP, not the Docker one.

2. **From another machine**, does the name resolve?

   ```bash
   ping -c 2 music.local
   # on macOS, more verbose:
   dns-sd -G v4 music.local
   ```

3. **Does Caddy answer?**

   ```bash
   curl -I http://music.local
   ```

   A `200 OK` (or a redirect) means the whole chain works. All that's left is to open `http://music.local` in the browser.

If test 2 fails while test 1 passes, the problem is on the network; if it's test 3, it's in Caddy (`journalctl -u caddy`).

## Troubleshooting and limits

Most failures come from the network or the clients, not from the config.

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| The name stops answering after a network outage or a lease renewal | The server's IP changed; the script only reads it at startup | Reserve the DHCP lease, then `systemctl restart avahi-alias@music.local` |
| The service keeps restarting, "Local name collision" in the logs | Another machine already announces that name | Pick another alias |
| Nothing resolves from other machines | Firewall enabled on the server | `sudo ufw allow 5353/udp` and `sudo ufw allow 80/tcp` |
| Works over Ethernet but not over Wi-Fi | Guest network, client isolation or multicast filtering on the access point | Disable isolation, or stay on the same network as the server |
| Works on Mac and iPhone, not on Android | `.local` support varies with the version and the app | Keep the IP as a fallback bookmark |
| Slow or erratic resolution on Windows | Partial native mDNS support | Install Bonjour (shipped with iTunes or Apple's tools) |

One fundamental limit: mDNS doesn't cross routers. If the company network is split into VLANs, which is common, the names are only visible within the server's subnet, unless you set up an mDNS reflector.

## Conclusion

Two files and one Caddyfile block per service: every new tool on the server now gets a readable address in under five minutes.

To go further, you can replace the `http://` with `tls internal` and install Caddy's root certificate on your devices, to get HTTPS without warnings. That may be a future post.
