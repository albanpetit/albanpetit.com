---
title: Clean Raspberry Pi shutdown on power loss
slug: raspberry-power-loss-shutdown
lang: en
date: 2026-10-12
description: "Shut a Raspberry Pi down cleanly when the power goes out: a supercapacitor UPS, power-loss detection on a GPIO and a systemd service that triggers the shutdown."
tags:
  - Bash
  - Python
  - Raspberry Pi
  - Home lab
category: Tutorials
---

A **Raspberry Pi** doesn't like having its plug pulled. When the power goes, the system may be in the middle of writing to the SD card: a log file, a database, the file system journal. In the best case, you wait for an `fsck` on the next boot. In the worst case, the SD card is corrupted and the Raspberry Pi no longer boots.

In the [Mini Rack](/post/rack-10inch/), everything is plugged into a single power strip: a power cut turns every machine off at once. For the Raspberry Pi boards running around the clock, I wanted them to have time to shut down cleanly. That takes three things:

1. **An energy reserve** that takes over for a few seconds after the outage.
2. **A signal** that tells the Raspberry Pi the mains power is gone.
3. **A program** that listens for that signal and shuts the system down before the reserve runs out.

<!-- TO COMPLETE: photo of the Raspberry Pi mounted with the UPS (image: main.jpg in the front matter). -->

## The hardware

| | |
|---|---|
| **Board** | Raspberry Pi 5 (also works with a Pi 4B or 3B) |
| **UPS** | [Geekworm UPS Scap 5V5A](https://wiki.geekworm.com/UPS_Scap_5V5A), 100 F version |
| **Power supply** | 12 V adapter with a 5.5 × 2.1 mm barrel jack (9 to 24 V accepted) or a 12 V USB-C PD charger |
| **System** | Raspberry Pi OS |

### Why supercapacitors

Most Raspberry Pi UPS boards use lithium batteries (18650 or LiPo). They give hours of runtime, but they age, heat up and need a careful charging circuit. For a server in a rack running day and night, I don't need to last for hours: I only need to **last long enough for a clean shutdown**.

That is exactly what supercapacitors do. They recharge in about fifteen minutes, handle more than 500,000 cycles and don't mind staying charged all the time. The trade-off is runtime measured in seconds or minutes. According to Geekworm, the 100 F version lasts about **9 seconds** at full load (5 V, 5 A), and up to **three and a half minutes** at 0.5 A in long-endurance mode. An idle Raspberry Pi 5 draws far less than 5 A: in practice, the margin is comfortable.

<!-- TO COMPLETE: measured idle consumption of the Pi 5 and actual runtime observed. -->

The board has two modes, selected with a solder bridge: **Performance** (P, 2.4 V cutoff) and **Long endurance** (L, 1.6 V cutoff). The latter drains the capacitors further and gives more runtime.

### Wiring

The UPS sits between the power supply and the Raspberry Pi. The power adapter plugs into the UPS input, and the Raspberry Pi is powered from the UPS USB-C output, which negotiates the Pi 5's 5 V / 5 A profile. Only one charging input should be used at a time: either the barrel jack or USB-C PD.

On top of power, the UPS connects to the Raspberry Pi GPIO header for two pieces of information:

- **GPIO26** reports mains presence: it is **high** (3.3 V) while external power is present, and goes **low** (0 V) as soon as it disappears.
- The **I2C bus** gives access to an INA219 that measures the supercapacitor voltage and the charge or discharge current.

GPIO26 is the one we care about: watching it go low is all it takes to know the power went out.

## Detecting the outage

Before writing anything, check that the signal comes through. Raspberry Pi OS ships `pinctrl`, which reads a pin's state:

```bash
pinctrl get 26
```

With mains connected, the line ends with `hi`. Unplug the UPS power supply (the Raspberry Pi keeps running on the capacitors) and run the command again: it should now show `lo`. Plug it back in right away.

## The shutdown script

The script is written in Python with [gpiozero](https://gpiozero.readthedocs.io/), installed by default on Raspberry Pi OS and compatible with the Pi 5. It waits for the outage, allows a short grace period to ignore brief dips, then shuts the system down if the power hasn't come back.

Create the file `/usr/local/bin/ups-shutdown.py`:

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

A few notes on this script:

- `pull_up=None` disables the internal resistors: the UPS sets the pin state, and there's no point fighting it. gpiozero then requires `active_state=True`, meaning high stands for "mains present".
- `wait_for_inactive()` blocks until the outage, with no busy loop eating CPU.
- The **grace period** avoids shutting the server down for a mere voltage dip. Keep it short: every second spent waiting is one less second for the shutdown.
- `systemctl poweroff` asks systemd for a normal shutdown, exactly like `sudo poweroff`: services are stopped in order and file systems unmounted.

Make the script executable:

```bash
sudo chmod +x /usr/local/bin/ups-shutdown.py
```

## The systemd service

The script must start with the Raspberry Pi and run all the time. That's the job of a **systemd** service. Create the file `/etc/systemd/system/ups-shutdown.service`:

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

The service runs as `root`, which lets it shut the system down without `sudo`. `Restart=on-failure` restarts it if the script crashes. Enable and start it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ups-shutdown.service
```

Check that it's running:

```bash
sudo systemctl status ups-shutdown.service
```

## Testing it for real

A shutdown mechanism you've never tested doesn't work. Open an SSH session (see the [SSH configuration](/post/raspberry-ssh-config/)) and follow the service messages:

```bash
journalctl -u ups-shutdown.service -f
```

Then run two tests:

1. **A brief outage**: unplug the UPS power supply for one second, then plug it back in. The log should show `Power lost`, then `Power is back, shutdown cancelled`, and the Raspberry Pi keeps running.
2. **A real outage**: unplug the power supply and leave it unplugged. After the grace period, the SSH session closes and the Raspberry Pi shuts down. The activity LED must stop blinking **before** the capacitors run dry.

On the next boot, the previous boot's journal confirms the shutdown was clean:

```bash
journalctl -b -1 -e
```

The last lines should show systemd's normal shutdown sequence, not an abrupt cut in the middle of a message.

<!-- TO COMPLETE: shutdown time measured on my Pi 5 and remaining capacitor margin. -->

## Keeping a margin

The shutdown must finish before the reserve runs out. Three settings help keep a margin:

- **Measure how long the shutdown takes.** During the test, note the time between the `shutting down` message and the LED going dark. Add the grace period: the total should stay well below the UPS runtime at your load.
- **Limit the wait on stubborn services.** By default, systemd waits up to 90 seconds for a service to agree to stop. With a few seconds of reserve, that is far too long. In `/etc/systemd/system.conf`, uncomment and lower the value:

  ```ini
  DefaultTimeoutStopSec=10s
  ```

- **Lighten the load.** USB drives and peripherals plugged into the Raspberry Pi draw from the same reserve. The fewer there are, the more time the shutdown has.

## When the power comes back

Once the Raspberry Pi is off, it needs to boot again when mains power returns. A Raspberry Pi boots when power is applied: if the capacitors drained during the outage, the power coming back is enough to restart it. If power returns while the Pi 5 is halted but still powered by the UPS, it stays off: that's what the wake-up contact Geekworm provides for the Pi 5 is for, as described on the [UPS wiki](https://wiki.geekworm.com/UPS_Scap_5V5A_Software).

<!-- TO COMPLETE: behaviour observed when power returns and wiring of the wake-up contact. -->

## Going further

- **Monitor the capacitors.** The INA219 is reachable over I2C: after enabling I2C in `sudo raspi-config`, `i2cdetect -y 1` shows its address. You can then read the capacitor voltage and send it to a dashboard.
- **Notify before shutting down.** The script can send a notification (email, ntfy, Home Assistant) when the outage starts, as long as the network is still up.
- **Without a script.** Raspberry Pi OS offers a `gpio-shutdown` overlay that turns a pin into a shutdown button. It saves writing code, but has no grace period: the slightest dip shuts the machine down.

With a few tens of euros of hardware and about thirty lines of code, the Raspberry Pi no longer suffers from power cuts: it shuts down cleanly, and the SD card survives.
