# Prompts for the radial timeline

Prompt 1 recreates the diagram from scratch (for example, to start a variant in another stack). Prompt 2 lists short edits to make in this repository. The history at the end says where each part came from.

## Prompt 1: rebuild the diagram from scratch

Paste this into Claude (or another code model) to recreate the diagram, or to start a variant.

```text
Build one self-contained HTML page: an interactive 3D "radial timeline" showing how far back each kind of dental
evidence reaches. Plain HTML, CSS and JavaScript. Use three.js only for the tooth model; draw everything else as SVG,
re-projected every frame through a simple perspective camera. No other libraries.

DATA. Use exactly these numbers. Years are calendar years, BCE negative; the latest year, 2009, is "now". Do not
invent, interpolate or smooth anything. A gap between periods shows as a pale stretch of line.
- Caries, colour #C2611A, unit "adults recorded": 0–500 (621), 500–1000 (2,289), 1000–1250 (920),
  1250–1500 (1,025), 1500–1800 (1,841), 1800–1900 (531).
- Metals, #A67C00, "individuals measured": 4040–2525 BCE (31), 2540–825 BCE (13), 840 BCE–18 CE (10),
  3–375 (25), 360–675 (50), 660–1075 (26), 1160–1475 (26), 1860–1975 (77).
- Pathogens, #B0362F, "genomes sequenced": one record per century, 100s to 1800s, none for the 800s:
  3, 2, 3, 22, 5, 20, 11, (gap), 14, 7, 10, 11, 51, 9, 54, 22, 13, 10.
- Wear and LEH, #16907A, "adults scored": the same six periods as caries: 531, 1,995, 809, 651, 1,644, 455.
- Artificial interventions, #2F55B0, "individuals examined": 900–1200 (204), 1460–1670 (100),
  1800–1899 (450), 2009 (6,470; a single survey, drawn as a point).

GEOMETRY.
- A hub at the centre. Distance from the hub is how long before 2009 a year is, on one square-root scale for every
  line: r = 200 + sqrt(age / oldest age) × 420, so the last 2,000 years get room beside the metals record's 6,000.
- Each record leaves the hub in its own 3D direction. Azimuths are 72° apart, clockwise from pointing right:
  interventions 36°, caries 108°, metals 180°, pathogens 252°, wear 324°. Elevations: interventions 22°,
  caries 12°, metals −22°, pathogens 18°, wear −40°.
- Around it, a wire sphere (radius 1.1 × the oldest record) with meridians and parallels, an equator, a vertical
  axis with a dot at each pole, and dotted horizontal time shells at 300, 1,000, 2,000, 4,000 and 6,000 years ago,
  each labelled in italic ("300 years ago"), the labels placed where they collide least.
- Along each line: darker and thicker over the years its records cover; a circle at each record's start year, sized
  by how much was gathered, with a soft halo in the record's colour; a dashed hollow circle where the count is
  missing. Faint arrows run outward along each line.
- The record's name at the far end of its line, in its colour, letter-spaced capitals, every name the same size,
  with its year range under it ("100 – 1900 CE"), on a thin dashed leader. Names are pushed apart so they never
  overlap, and stay inside the page.
- At the hub, the 3D tooth model in the journal's ink: transparent, rim-lit, finely hatched in horizontal lines,
  turning with the camera. A small dot and slowly turning dashed rings mark the hub.
- A "reading wave": a ring that sweeps out from today to the oldest record about every 13 seconds, labelled with
  the year it has reached. Circles swell as it passes them.

LOOK. Light journal paper (#e9e8e4) with a soft radial vignette, ink #1a1a18, greys #55544f and #8a8983, and one
serif (Lora) for everything. The wireframe is very faint so the data reads first. Nearer lines and circles are
crisper and stronger; farther ones fade.

CAMERA AND INTERACTION.
- A perspective camera orbiting the hub. Home view: azimuth −29°, elevation 17°, distance 1,480. Drag to orbit,
  scroll to move in and out (760 to 3,000), double-click to reset. After 4 s without input it drifts slowly round.
- Hovering a circle shows its years and amount ("1300 – 1400 CE, 51 genomes sequenced", or "count not in the
  data") and dims the other records. Hovering a line or a name lights that record alone. Clicking a name calls
  onOpen(key), so the host page can open that record's section.
- On load the camera swings in from far away and higher up, and the names fade in last. A Replay button runs it
  again.
- A small readout bottom-left (azimuth, elevation, distance) and a hint bottom-centre ("Drag to orbit · scroll to
  travel · double-click to reset").
- With prefers-reduced-motion: no opening move, no drift, no wave.
- Leave room at the top for a running head: "The Tooth Untold / What can a tooth remember?" and
  "Plate II / How far back each record reaches".
- No text may overlap at any width from 390 px up; the web layout is the priority.
```

## Prompt 2: common edits

Use these in this repository, so the agent works on its files.

- **Change the data.** "In `js/radial-data.js`, change [record] to [new periods and counts], and update the source note in its header. Keep the square-root scale and every other record as it is. Don't invent, interpolate or smooth any value."
- **Add a record.** "Add a sixth record to `js/radial-data.js`: [name], key [key], colour [hex] (add it to `COLS` in `js/radial.js`), unit [unit], periods [list]. Respread the angles evenly (60° apart), give it an elevation in `ELEV` that keeps its name clear of the others, and check with `tools/overlap-audit.js` at 1440, 1024 and 760 px."
- **Recolour.** "Change the record colours (`COLS` in `js/radial.js`) to [list], keeping the paper background and the ink tooth. Every name must stay readable against the wireframe."
- **Dark version.** "Make a dark variant: in `css/radial.css`, remove the paper theme section, the last one, so the original dark scene rules apply. Check that the tooth's ink shader still reads on the dark ground."
- **Wire the names.** "Set `onOpen` in `js/main.js` so clicking a record's name [opens a panel with that record's periods and counts / scrolls to its section]. The names should look like links only once this works."
- **A still for Figma or print.** "Add an Export button that stops the motion at the home view and downloads an SVG of the diagram. Rasterise the tooth canvas into the SVG as an image, and keep the text as live text in Lora."

## How it came about

- **2026-10-02:** first built from the team's `tooth-archive-radial-template.html`, as a flat starburst on the journal page.
- **Elina's requests:**
  - put the hub at the exact centre of the page, with the molar on the left as on every plate;
  - make every category's name the same size, with the lines looking as if they come out of the screen from the centre, after a black-background reference image;
  - draw one line per category, with markers for the years;
  - make the teeth bigger, and keep the page on light paper to match the rest of the journal.
- **Ali Qureshi's rewrite** (2026-10-04, commit c7da21c, "Metals section and radial timeline: apply update") turned it into the current 3D scene: the orbiting camera, the wire sphere and time shells, the reading wave, and the tooth as a three.js model. The light paper styling over his original dark styling came with the same update.
- **Every count** traces to the team's CSVs in `source/layer data/`. `radial-data.js` lists which file each number comes from.
