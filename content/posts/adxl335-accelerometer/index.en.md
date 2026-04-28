---
title: ADXL335 Accelerometer
slug: adxl-335-accelerometer
lang: en
date: 2024-03-02
lastmod: 2025-03-12
description: "Design and fabrication of a custom PCB around the ADXL335 MEMS accelerometer — KiCad schematics, PCB manufacturing, and implementation with a Raspberry Pi Pico."
tags:
  - Electronics
  - PCB
  - KiCad
category: Projects
image: main.jpg
---

In this article, I take you through my latest project: a custom PCB designed around a MEMS accelerometer. This project, although relatively simple in its application, highlights a fascinating electronic component, both in terms of its internal operation and its applications. This electronic board will later be used in other experiments and projects.

## MEMS Accelerometers

![MEMS accelerometer](mems.jpg)

MEMS accelerometers are compact devices that leverage microfabrication to integrate mechanical elements, sensors, and actuators onto a tiny silicon chip. At the core of these devices is a MEMS structure consisting of microstructures such as beams or cantilevers that react to external forces.

### Operating Principle

The principle is based on inertia: an object at rest tends to remain stationary, while a moving object continues in its trajectory unless subjected to an external force. The MEMS accelerometer uses this concept to measure acceleration.

Inside the structure, a mass suspended by flexible beams moves in response to accelerations. This mechanical deviation is then converted into an electrical signal by an integrated capacitive or piezoelectric sensor.

### Translating Mechanical Motion into Electrical Signals

When acceleration is applied, the mass moves, causing a change in capacitance or generating a voltage proportional to the applied force. This signal is then processed to provide usable acceleration data.

## Electronic Board Design

This PCB is compact and easy to integrate into various projects. It includes an AP2112 voltage regulator to ensure a stable 3.3V power supply, allowing compatibility with 5V devices like Arduino boards. Its dimensions are 19mm x 24mm, and it features two connectors:
- One for 5V power input
- Another for the analog acceleration data outputs on the X, Y, and Z axes

### Main Components

On this electronic board, two components are the most important: the regulator and the accelerometer.

#### AP2112K-3.3

This linear regulator in **SOT-23-5** package is extremely common, used in many hobbyist electronic boards. It appears in many designs from Adafruit or Sparkfun. It is a fixed voltage low-dropout linear regulator, available in multiple variants: 1.2V, 1.8V, 2.5V, 2.6V, and 3.3V. This project uses the 3.3V version. Key characteristics:
- Output voltage accuracy: ±1.5%
- Output current: 600 mA (minimum)
- Foldback short-circuit protection: 50 mA
- Low dropout voltage (3.3V): 250 mV (typ.) @IOUT = 600 mA
- Excellent load regulation: 0.2%/A (typ.)
- Low quiescent current: 55µA (typ.)
- Low output noise: 50µVRMS
- PSRR: 100 Hz -65 dB, 1 kHz -65 dB
- Operating temperature range: -40°C to +85°C

![AP2112 datasheet](ap2112-datasheet.png)

Additionally, it is extremely simple to implement. The datasheet contains all the necessary peripheral components required for its proper operation. Two smoothing capacitors with a value of 1uF on the input and output voltage and a 100K ohm resistor to allow constant ignition are sufficient.

#### ADXL335

The heart of the project, the Analog Devices ADXL335 accelerometer, has a vibration sensitivity of 3g. Available only in **LFCSP-16** format, it is relatively easy to implement as well, partly due to its small size (4mm x 4mm).

This component has three analog outputs, each responsible for providing acceleration information along one of the three dimensions. A 32K ohm resistor is placed on each of them. These resistors, via the addition of a capacitor, allow the creation of a low-pass filter, reducing noise on the data and the effect of aliasing from oversampling. The recommended minimum value for these capacitors is 4.7nF.

It is also interesting to note that the maximum useful frequency of each axis is different: 1600Hz for X and Y, and only 500Hz for Z.

The positioning of this component is therefore extremely important depending on its usage.

### Components List

| Designation               | Reference | Quantity | Format     | Datasheet                               |
| ------------------------- | --------- | -------- | ---------- | --------------------------------------- |
| ADXL335                   | U1        | 1        | LFCSP-16   | [ADXL335](datasheet-adxl-335.pdf)       |
| AP2112K-3.3               | U2        | 1        | SOT-23-5   | [AP2112](datasheet-ap2112.pdf)          |
| SMD Resistor 100k ohm     | R2        | 1        | 0603       | -                                       |
| SMD Resistor 160 ohm      | R1        | 1        | 0603       | -                                       |
| LED                       | D1        | 1        | 0603       | -                                       |
| SMD Capacitor 1uF         | C4,C5     | 2        | 0603       | -                                       |
| SMD Capacitor 4.7nF       | C1-C3     | 3        | 0603       | -                                       |
| Power Connector           | J1        | 1        | JST PH B2B | -                                       |
| Signal Connector          | J2        | 1        | JST PH B3B | -                                       |

### Schematic and Electronic Board

All design and manufacturing files are available on [GitHub](https://github.com/albanpetit/adxl335-accelerometer). Here is a quick description of the different sections of this printed circuit board:

![Electronic Board](kicad-pcb.png) ![Schematic](kicad-schematic.jpg)

1. A simple LED responsible for displaying the power status of the electronic board, accompanied by its resistor.
2. The power stage based on the AP2112K-3.3, with three smoothing capacitors.
3. The MEMS accelerometer ADXL335, with its three capacitors, one for each analog output.
4. The JST-PH connector with three pins, one for each analog output.
5. The power supply JST-PH connector for 5 volts.

## Electronic Board Manufacturing

<div class="float-left">

![Aisler](aisler.png)

</div>

Living in France, the usual Chinese suppliers of electronic boards can be relatively expensive due to shipping costs. I mainly order my boards from [Aisler](https://aisler.net), a German board manufacturer. Always efficient, well-documented, and affordable, they have always perfectly fulfilled my orders. They even have a plugin available on KiCad to facilitate ordering, [Aisler push for KiCad](https://github.com/AislerHQ/PushForKiCad).

Aisler offers PCBs with **ENIG** (Electroless Nickel Immersion Gold) treatment, as well as the possibility of having stencils made for solder paste.

Using a stencil provides solutions for soldering PCBs much more precisely than conventional methods with a soldering iron. The idea is to have a stencil made for each electronic circuit, allowing solder paste to be deposited on the surfaces that will later receive solder. Once all the components are placed, a hotplate or reflow oven can be used to melt the solder paste, resulting in perfectly homogeneous solder joints.

GreatScott explains and presents this method in one of his videos: [Watch on YouTube — Soldering with a stencil](https://www.youtube.com/watch?v=QarizoUnRfk)

Here are some photos of different stages of this realization:

![PCB 1](pcb-1.png) ![PCB 2](pcb-2.png) ![PCB 3](pcb-3.png)

## Implementation

### Initial Tests

Once the electronic board is operational, I performed some tests with an oscilloscope to avoid trying to interface a malfunctioning electronic board with a microcontroller for hours. Accompanied by one of my favorite tools, the Sensepeek measurement probes, the results seem perfectly consistent with the datasheet of the ADXL335.

![Sensepeek](implementation-1.jpeg) ![Oscilloscope](implementation-2.jpeg) ![Test](implementation-3.jpeg)

### Raspberry Pi Pico

![Raspberry Pi Pico](raspberry-pico.png)

The Raspberry Pi Pico is an electronic board hosting the RP2040, an ARM architecture microcontroller designed by the Raspberry Pi Foundation. Announced in January 2021, the RP2040 is the first microcontroller developed by the foundation.

This ARM architecture microcontroller has two cores clocked at 133 MHz. The Pico has 264 KB of SRAM and 2 MB of flash memory. It is equipped with 26 digital I/O pins, three of which can be used as analog inputs.

### Connection

The daughter electronic board must be powered by the **+** and **-** interfaces — the Raspberry Pico has interfaces **40** and **38** for this purpose. Then the **X**, **Y**, and **Z** outputs of our board must be respectively connected to interfaces **31**, **32**, and **34** of the **Pico**.

![Raspberry Pi Pico Pinout](raspberry-pico-pinout.png)

#### Arduino Code

First, the **Pico** is not naturally available in the **Arduino** software — an installation is required. Add this URL to the `Additional Board Manager URLs` option in Arduino preferences (*File > Preferences*):

`https://github.com/earlephilhower/arduino-pico/releases/download/global/package_rp2040_index.json`

![Arduino Settings](arduino-settings-1.png)

Then install the board via the Board Manager:

![Arduino Board Manager](arduino-settings-2.png)

Here is an example of a functional script that reads the voltage values from the analog interfaces:

```arduino
const int xInput = 26;
const int yInput = 27;
const int zInput = 28;

int RawMin = 0;
int RawMax = 1023;
const int sampleSize = 10;

void setup()
{
  Serial.begin(9600);
}

void loop()
{
  int xRaw = ReadAxis(xInput);
  int yRaw = ReadAxis(yInput);
  int zRaw = ReadAxis(zInput);

  long xScaled = map(xRaw, RawMin, RawMax, -3000, 3000);
  long yScaled = map(yRaw, RawMin, RawMax, -3000, 3000);
  long zScaled = map(zRaw, RawMin, RawMax, -3000, 3000);

  float xAccel = xScaled / 1000.0;
  float yAccel = yScaled / 1000.0;
  float zAccel = zScaled / 1000.0;

  Serial.print("X, Y, Z  :: ");
  Serial.print(xRaw);
  Serial.print(", ");
  Serial.print(yRaw);
  Serial.print(", ");
  Serial.print(zRaw);
  Serial.print(" :: ");
  Serial.print(xAccel, 0);
  Serial.print("G, ");
  Serial.print(yAccel, 0);
  Serial.print("G, ");
  Serial.print(zAccel, 0);
  Serial.println("G");

  delay(200);
}

int ReadAxis(int axisPin)
{
  long reading = 0;
  analogRead(axisPin);
  delay(1);
  for (int i = 0; i < sampleSize; i++)
  {
    reading += analogRead(axisPin);
  }
  return reading / sampleSize;
}
```

The serial interface should return values like this:

```
X, Y, Z  :: 532, 578, 625 :: 0G, 0G, 1G
X, Y, Z  :: 530, 578, 627 :: 0G, 0G, 1G
X, Y, Z  :: 531, 577, 627 :: 0G, 0G, 1G
```

---

## Conclusion

This project allowed me to explore the design and fabrication of a board integrating a MEMS sensor. The soldering phase using a stencil was an enriching experience, providing a professional-quality finish. This board will be useful for more advanced applications, and I already have some ideas for the future!

If you'd like to access the design files, they are available on my [GitHub repository](https://github.com/albanpetit/adxl335-accelerometer). Feel free to share your feedback and similar experiences!
