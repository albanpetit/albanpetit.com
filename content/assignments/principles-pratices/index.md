---
title: Principles and practices
license: CC BY-NC-ND
date: 2023-01-25
lastmod: 2023-01-25
image: "https://blog.arduino.cc/wp-content/uploads/2018/08/F2AF455JKIKCY2N.LARGE_-1024x761.jpg"
slug: principles-pratices
status: Done !
description: Week 1
weight: 5
---

After a long reflection on my final FabAcademy project. I keep two, a split-flap display and a pick and place. I still can't choose between these two projects, I will make the choice later during my FabAcademy. So here's a quick rundown of those ideas.

## Split flap display

So my first idea is to make an open source split-flap display, or sometimes simply a flap display, is a digital electromechanical display device that presents changeable alphanumeric text, and occasionally fixed graphics.

![Split flap module](splitflap-1.jpg) ![Splitflap display](splitflap-2.jpg)

Often used as a public transport timetable in airports or railway stations, as such they are often called Solari boards after Italian display manufacturer [Solari di Udine](https://www.solari.it/it/), or in Central European countries they are called Pragotron after the Czech manufacturer.

Split-flap displays were once commonly used in consumer digital clocks known as flip clocks. 

Each character position or graphic position has a collection of flaps on which the characters or graphics are painted or silkscreened. These flaps are precisely rotated to show the desired character or graphic.

### Concept

The idea of this project is to design a split-flap display module capable of displaying a character. But that it is connectable in chains and addressed to control them individually as could be addressable LEDs, for example. 

The display module would have its internal logic, with the ability to initialize (some sort of zero position), to manage its voltage levels, the rotation according to the character sent to the data bus, etc. The modules must be connectable to each other in all directions, a system for selecting the next module is necessary to allow the formation of a matrix of modules. 

![Display schematic](schema.svg)
<!-- TODO: check theme html generation to remove margin on svg markdown tag -->
A control PCB for the whole module matrix is also necessary, it will support a wifi connection to be able to select the information to be displayed from a web interface.

Here is a short video of ```Oat foundry``` split-flap display :

{{< youtube pINtnKBfqLE >}}

### Links

Here is a list of resources that is close to what I would like to achieve with this project, these are potential points of inspiration.

#### Oat Foundry

{{< image src="https://www.oatfoundry.com/wp-content/uploads/2016/05/Oat-Foundry-logo.png" position="left" width="150" right="20" >}}
[Oat foundry](https://www.oatfoundry.com/split-flap/) manufactures and sells custom split flap displays. Their displays are manufactured with the same operating principle as the original split-flap display but with a control system allowing them to display data streams such as weather, temperature, social networks, from a web interface.

![google split-flap](oatfoundry-1.jpg) ![white split-flap](oatfoundry-2.jpeg)

#### Unknown Domain

[Unknow Domain](http://unknowndomain.co.uk) is the blog by Mark Lynch a maker, who designed a split-flap display solution, the files are not open source but he writes in the different stages of the design. Some technical choices are quite interesting, other projects are also available on his blog.

Here are some pictures of his projects:

![unknow domain small display](unknowdomain-1.jpeg) ![unknow domain module](unknowdomain-2.png)

> **Hackaday blog post :** [split flaps display: if you can't find it, built it](https://hackaday.com/2014/10/04/split-flap-display-if-cant-find-it-built-it/)

#### Thingiverse projects

{{< image src="thingiverse.png" position="left" width="130" right="20" >}}
And here is the magic of Thingiverse. Thingiverse is a website dedicated to the sharing of user-created digital design files.

Several similar projects are available on Thingiverse, rarely complete, rarely finished, but they are great source of inspiration to determine valid technical solutions. 

Here is a non-exhaustive list :
- [Dead simple split flap display](https://www.thingiverse.com/thing:2369832)
- [Laser cut weather station](https://www.thingiverse.com/thing:815981)
- [Weather in one hour](https://www.thingiverse.com/thing:841058)
- [Split-flap display](https://www.thingiverse.com/thing:3402311)

## Pick and place

Surface-mount technology component placement systems, commonly called pick-and-place machines or P&Ps, are robotic machines which are used to place surface-mount devices onto a printed circuit board.

![PnP nozzles](pnp-1.jpg) ![pnp](pnp-2.jpg)

They are used for high speed, high precision placing of a broad range of electronic components, like capacitors, resistors, integrated circuits onto the PCBs which are in turn used in computers, consumer electronics as well as industrial, medical, automotive, military and telecommunications equipment. 

Similar equipment exists for through-hole components. This type of equipment is sometimes also used to package microchips using the flip chip method.

### Concept

The description of this project will be rather quick, the idea is to design a small open source automatic electronic component placement machine. Several open source projects already exist, but in general, these machines are big.

{{< image src="openpnp.png" position="left" width="120" right="20" >}}
A fairly large maker community offers hardware solutions, the [OpenPnp](https://openpnp.org) website includes most of them. OpenPnp also offers software to run an open source pick and place machine, but also existing commercial machines, giving them abilities they never had with their OEM software.

The idea would be to rely on the OpenPnp software to design a small format automatic placement solution.

### Links

Here is a list of resources that is close to what I would like to achieve with this project, these are potential points of inspiration.

#### LumenPnp

[LumenPnp](https://opulo.io/products/lumenpnp-kit) is a fully open source PNP machine designed by Stephen Hawes. He describes each stage of his design on his YouTube channel. He has been selling kits recently, to be able to mount this machine which relies on the OpenPnp solution for its control.

![PnP nozzles](lumenpnp-1.jpg) ![PnP](lumenpnp-2.jpg)

> **Github repository :** [Index pnp](https://github.com/index-machines/index)

#### LitePlacer

[LitePlacer](https://liteplacer.com/) is a machine designed by Juha Kuusama, who needed an automatic electronic component placement machine for his company to speed up the development process and to save the cost of outsourcing the assembly. This machine also relies on the OpenPnp software to work, it is even now one of the official designs of OpenPnp. 

Introduction video to LitePlacer :
{{< youtube T_v2VJKNZQ0 >}}

## Final Checklist

Here are the objectives of this assignment of the Fabacademy and the verification of the good realization of these:
- [X] Describe and sketch your final project
- [X] Describe what it will do and who will use it
