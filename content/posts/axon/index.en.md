---
title: "Axon: a modular backplane for my robots"
slug: axon
lang: en
date: 2026-09-28
description: "A modular platform for my robots: a backplane, plug-in daughter boards and a swappable microcontroller. Overview and stages of the project."
tags:
  - Electronics
  - Robotics
  - ESP32
project: Axon
overview: true
status: in-progress
---

For my robotics projects, I almost always use off-the-shelf development boards. And with every new project, it's the same ritual: pick a board, wire up the motor drivers, the sensors, the power supplies, then start all over again on the next project because the previous board didn't have enough pins, the right connector or the right power supply.

I ended up asking myself a simple question: why not design **my own modular platform**? A backplane board that centralizes power and communication buses, into which daughter boards plug in perpendicularly: a stepper board, a servo board, a sensor board… and even the microcontroller board, so it can be swapped without redoing everything.

## The principle

Axon doesn't hand out the microcontroller's pins to the daughter boards: it sends them **commands over shared buses** (SPI, I²C, CAN). Each function relies on a bus-controlled component, for example a stepper driver that generates its own pulses. The number of boards no longer depends on the number of available pins.

The naming is inspired by the neuron:

- **Axon**: the backplane, which carries the signals.
- **Soma**: the microcontroller board, which drives all the buses.
- **Synapses**: the daughter boards, which act on or measure the outside world.
- **Nodes**: the slots they plug into.

| | |
|---|---|
| **Status** | In design, nothing has been built yet |
| **First version** | 4 Nodes and a slot for the Soma |
| **Soma** | ESP32-S3, swappable |
| **Buses** | SPI, I²C (one channel per Node), CAN |
| **Connector** | PCIe x4, with a pinout of Axon's own |

## Stages of the project

1. [Part 1: the design](/post/axon-design/). What already exists, the false good ideas, the choice of connector and the architecture I settled on.
2. Part 2: the breadboard prototype, with an ESP32-S3, a TCA9546A and a first stepper board. Coming soon.
