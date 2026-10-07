---
title: "Mini Rack: building a 10-inch rack for my home lab"
slug: rack-10inch
lang: en
date: 2026-10-03
lastmod: 2026-10-07
description: "A homemade 10-inch rack to host my home lab: 20x20 aluminium extrusions, 3D printed parts, laser-cut panels and a complete FreeCAD model."
tags:
  - Homelab
  - 3D Printing
  - CAD
  - FreeCAD
project: Mini Rack
overview: true
status: in-progress
image: main.jpg
---

For a long time, I had wanted a real **home lab**: a place to run my personal services, but also public servers, without relying on a hosting provider for everything. The problem is space. A standard 19-inch rack is made for a server room, not for a corner of a desk, and my machines (a Mac mini, small PCs, Raspberry Pi boards) would be lost in it.

The answer came from [Jeff Geerling](https://www.youtube.com/@JeffGeerling)'s videos and his [Project MINI RACK](https://mini-rack.jeffgeerling.com/), which collects home labs built in **10-inch racks**: the same principle as a datacenter rack, at half the width. Rather than buying a ready-made rack, I wanted to design my own, from aluminium extrusions, 3D printed parts and laser-cut panels.

<a class="repo-card" href="https://github.com/albanpetit/rack-10inch" target="_blank" rel="noopener noreferrer">
  <svg class="repo-card-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
  <span class="repo-card-body">
    <span class="repo-card-name">albanpetit/rack-10inch</span>
    <span class="repo-card-desc">FreeCAD model and STEP, STL, DXF and 3MF exports</span>
  </span>
  <svg class="repo-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
</a>

| | |
|---|---|
| **Period** | December 2024 to July 2025 |
| **Format** | 10-inch rack, 10U |
| **Frame** | 262 × 310 × 486 mm, 20x20 aluminium extrusions |
| **Enclosure** | Clear laser-cut panels, magnetic sides |
| **Printed parts** | PLA, on a Bambu Lab A1 |
| **Tools** | FreeCAD, Bambu Studio |

This post covers building the rack. The rest of the project, starting with the Mac mini mount, gets posts of its own (see [the project steps](#project-steps)).

## Why a 10-inch rack

A 10-inch rack keeps everything that makes 19-inch racks so popular: equipment stacked in rack units (1U = 44.45 mm), screwed onto rails drilled at the standard pitch, with power and cabling grouped together. Only the width changes: a 254 mm front instead of 483 mm. That is exactly the size of the machines in a modern home lab: mini PCs, Mac minis, Raspberry Pis, small switches.

My requirements:

- **Compact**: the rack has to fit on a piece of furniture, not in a utility closet.
- **Ventilated**: machines running around the clock need airflow, not a closed box.
- **A single plug**: a built-in power strip, so only one cable leaves the rack.
- **Accessible**: the side panels must come off without tools, and the inside must stay visible.
- **Portable**: handles on top, to move it in one piece.

## Designing it in FreeCAD

The whole rack is modelled in FreeCAD, with the Assembly workbench: the extrusions, the printed parts, the panels, but also the parts I bought (fans, power strip, screws, T-nuts). Modelling off-the-shelf components takes time, but it is what lets me check clearances and holes before cutting anything.

The complete model can be explored below, straight from the STEP file in the repository. The panels are shown see-through to reveal the inside.

<div class="step-embed" data-src="https://raw.githubusercontent.com/albanpetit/rack-10inch/main/mcad/main/step/assembly.step" data-transparent="panel-plate">
  <a href="https://github.com/albanpetit/rack-10inch/blob/main/mcad/main/step/assembly.step">STEP file of the assembly on GitHub</a>
</div>

The repository also holds every export needed to build it again: the [STL](https://github.com/albanpetit/rack-10inch/tree/main/mcad/main/stl) files of the printed parts, the 3MF print project with its plates, and the [DXF](https://github.com/albanpetit/rack-10inch/tree/main/mcad/main/dxf) files of the panels for laser cutting.

## The frame in 20x20 extrusions

The structure is made of 20x20 aluminium extrusions with a 6 mm slot: twelve bars, four of each length. The **222 mm** ones set the inner width, the **270 mm** ones the depth and the **476 mm** ones the height. Delivered as long bars, the extrusions were cut at the FabLab, on a sliding mitre saw.

![20x20 aluminium extrusion bars still in their protective film](extrusions-delivered.jpg) ![Sliding mitre saw on its mobile workbench at the FabLab](fablab-miter-saw.jpg) ![Cutting an aluminium extrusion with the mitre saw](cutting-extrusion.jpg)

Once cut, all the bars of the same length are compared side by side. The slightest difference in length ends up as a frame that is out of square.

![Cut extrusions lined up along a steel rule to check their length](cut-extrusions-measured.jpg) ![The twelve cut extrusions on the workbench, sorted by length](cut-extrusions.jpg)

The corners are joined with three-way brackets, which tie together the three extrusions of a corner at once. I first build two rectangles, the top and the bottom, then join them with the four uprights.

![Three-way aluminium corner bracket](corner-connector.jpg) ![Extrusion fitted with a three-way bracket at each end](extrusion-corner-connector.jpg)

![First rectangle of the frame assembled on the cutting mat](frame-first-rectangle.jpg) ![Complete aluminium extrusion frame, before the panels go on](frame-assembled.jpg)

## The rails: T-nuts at rack pitch

In a standard rack, equipment screws onto rails drilled at the standard pitch. Rather than buying rails, I use the front uprights directly: each rack hole is an **M5 T-nut** slid into the slot of the extrusion. Between two nuts, a spacer printed in blue holds them at the right pitch, which gives 10 usable units on each upright. Equipment then mounts with plain M5 screws, at any height.

![Bag of M5 T-nuts for a 6 mm slot](t-nuts.jpg) ![Two uprights with their T-nuts slid into the slot](front-rails-t-nuts.jpg)

## The printed parts

The printed parts tie the frame and the panels together. They are all PLA, printed on my Bambu Lab A1: matte white for the structure, blue for the parts you handle or need to spot (handles, spacers, power strip brackets). The 3MF project in the repository holds the five plates, with 0.16 mm layers and 15% infill.

The very first part, printed in December 2024, is a prototype of the top handle. Then come the **corner supports**, sixteen in total, which hold the panels in the frame. They take brass heat-set threaded inserts, so the screws never bear directly on the plastic.

![Handle prototype printed in grey on the printer bed](handle-prototype.jpg) ![Corner supports printed in white, still on the bed](corner-supports-printed.jpg) ![Corner supports fitted with their brass threaded inserts](corner-supports-inserts.jpg)

## The panels and the airflow

The rear, side and bottom panels are laser cut from clear sheets, using the DXF files exported from FreeCAD. The corner cutouts and the holes land right on the printed supports, since everything comes from the same model.

The video below shows the panels being laser cut.

<div class="youtube-embed">
  <iframe src="https://www.youtube-nocookie.com/embed/SossH15z6b4" title="Laser cutting the panels of the 10-inch rack" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>

The rear panel carries two 120 mm **Corsair LL120** fans, mounted in a two-part printed support that clamps the panel. They keep the air moving inside the rack.

![Laser-cut panel, still covered by its protective film](laser-cut-panel.jpg) ![Corsair LL120 fan mounted in its printed support, lying on the panel](fan-support.jpg)

## Magnetic side panels

I wanted to open the sides without a screwdriver. Each side panel carries four corner supports and a central handle. Facing them, four connectors are screwed onto the frame with T-nuts. Supports and connectors each hold a **neodymium magnet**: the panel snaps into place, and a pull on the handle is all it takes to remove it.

![Printed parts for the side panels, loose on the mat](side-parts-printed.jpg) ![Corner support and connector with their neodymium magnets](side-parts-magnets.jpg)

![Corner connectors with their magnet and the screw that fixes them to the frame](side-connectors.jpg) ![Clear side panel fitted with its four corner supports and its handle](side-panel-supports.jpg)

## A built-in power strip

So that only one cable leaves the rack, a four-socket Digitus power strip is mounted at the rear, between the two fans. It comes with brackets to screw onto the front of a rack. I needed to mount it differently: I opened it to replace its end caps with brackets printed in blue, which screw onto the rear uprights.

![Four-socket Digitus rack power strip, as delivered](power-strip-original.jpg) ![Power strip opened, end caps removed](power-strip-opened.jpg) ![Power strip reassembled with its blue printed brackets](power-strip-brackets.jpg)

If you do the same: power strip unplugged, and no electrical connection gets touched, only the end caps.

## The result

By early June 2025, the rack is assembled: frame, panels, fans, power strip and top handles. All that is left is to fill it.

![Assembled, empty 10-inch rack, with its clear panels, its fans and its blue handles](rack-assembled-empty.jpg) ![Finished rack seen from the side, with the Mac mini and the USB-C charger installed](rack-finished-side.jpg) ![Front of the rack with the Mac mini in its 1U mount](rack-front-mac-mini.jpg)

## Project steps

1. **Building the rack**: this post.
2. [Part 2: a 3D printed Mac mini mount](/post/rack-10inch-mac-mini/). The first machine in the rack, in a 1U mount with a relay for the power button and a cable clamp.
