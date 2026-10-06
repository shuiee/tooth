# Project overview

Read this first. It explains what this repository is, how the diagram works, and the rules for changing it.

## What this is

This repository starts from one diagram: the **radial timeline** (Plate II, "How far back each record reaches") of *The Tooth Untold*, a data-visualisation prototype about what teeth from European graves record over two thousand years. The prototype was built by a Harvard MDE team. Its live version is at <https://shuiee.github.io/tooth-untold-prototype/>, and its source is the private repo `shuiee/tooth-untold`.

The diagram is a 3D scene on light journal paper:
- **The hub:** a tooth model sits at the centre.
- **Five lines:** one per kind of dental evidence, each leaving the tooth in its own direction: caries, pathogens, wear and stress lines (LEH), metals in enamel, and artificial interventions (repairs).
- **Distance means time:** distance from the tooth is how long before 2009 a year is, on one square-root scale.
- **Along each line:** a circle marks each record, sized by how much was gathered. The line is darker over the years the records cover, so a gap in the record is a pale stretch.
- **The space around it:** a wire sphere, dotted time shells ("300 years ago" to "6,000 years ago") and a ring that sweeps outward through time.
- **Interaction:** the reader can orbit, zoom, and hover a circle for its years and count.

## Goal of this repository

This project uses a tooth as a visual archive of human history.

**The central question:** what can future observers still understand from a tooth after humans have changed it?

**The storyboard**, in order:

1. **The tooth as an archive.** Introduce the tooth as an object that preserves traces of a person's life.
2. **Timescales of evidence.** Reveal the different timescales the tooth records:
   - **childhood development:** traces laid down while the tooth forms, such as stress lines in the enamel and the metals taken in during childhood;
   - **years of wear and decay:** chewing wear and caries, built up over a lifetime;
   - **lifetime exposure:** pathogens, and metals in the enamel;
   - **broader historical change in dental practice:** how the treatment of teeth changed over centuries.
3. **Human intervention.** Introduce fillings, appliances and restorations, and show how dentistry can repair, cover or alter the evidence preserved in teeth.

The radial timeline is the starting point. Its five records already span these timescales:
- stress lines (LEH) and metals are childhood records;
- wear and caries build up over a lifetime;
- pathogens and metals are exposures;
- artificial interventions are the dental practice and intervention thread.

What the project adds is the storyboard around it, ending on intervention and the central question.

Useful source material in the prototype repo (`shuiee/tooth-untold`):
- **The team's events timeline** (`research/Human Correlations/timeline_events_display.csv`) tags each event by what it does to the record:
  - **instrument:** the tooth can show it;
  - **hinge:** it changed what the tooth could record, such as decayed teeth being pulled faster than they were recorded, or amalgam making repair routine;
  - **silent:** the tooth cannot show it, such as fluoride cutting decay, or fillings starting to mark the person rather than the era.

  The hinge and silent events speak directly to the central question.
- **The prototype's Artificial interventions section** has the repair data: repaired teeth per 100 people examined, from three archaeological samples and the 2009 Adult Dental Health Survey.

When a story step needs a number, it must come from a source file (see Rules). Where the record cannot answer, say so; that gap is part of the story.

## Run it

No build step and no dependencies to install. Serve the folder and open it:

```bash
python3 -m http.server 8770
```

Then go to <http://localhost:8770>. Opening `index.html` straight from disk also works.
- **Online only for:** the Lora font (Google Fonts).
- **Needs:** a browser with WebGL for the tooth model; without it, the tooth is simply absent.
- **In the Claude desktop app:** `.claude/launch.json` defines this server as "radial", so the preview can start it.

**Published:** the repository is `shuiee/tooth` (public). GitHub Pages serves `main` from the root at <https://shuiee.github.io/tooth/>, so every push to `main` updates the live page. `.nojekyll` keeps Pages from running Jekyll over the Markdown files.

## Files

| Path | What it is |
|---|---|
| `index.html` | The page: the `#radial` host, the Replay button, and the scripts in load order |
| `js/main.js` | Mounts the diagram, wires Replay and resize, and holds the `onOpen` hook (null for now) |
| `js/radial.js` | The diagram (`window.ToothRadial`). Copied from the prototype, then changed here (see Origin) |
| `js/radial-data.js` | The data (`window.RADIAL_DATA`), hand-edited, with each number's source file in its header comment. Copied unchanged |
| `data/tooth-mesh.js` | The tooth model drawn at the hub (`window.TOOTH_MESHES.UL4`) |
| `vendor/three.min.js` | three.js r128 (MIT), used only to draw the tooth |
| `css/radial.css` | Theme tokens, the page, and every radial style in its original order (see Styles) |
| `tools/overlap-audit.js` | Console snippet that reports any overlapping text |
| `docs/prompts.md` | A brief that rebuilds the diagram from scratch, and short prompts for common edits |

## How the diagram works

- **Mounting:** `ToothRadial.mount(host, opts)` returns `{ resize(), destroy() }`. The options:
  - `animate`: play the opening move (the camera swings in, names fade in last);
  - `onOpen(key)`: called when a record's name is clicked; leave it unset and the names are plain text;
  - `padTop`, `padBottom`: numbers or functions giving the page space to keep clear;
  - `teeth`: an image fallback the prototype passed when WebGL meshes were missing; unused here.
- **Drawing:** `build()` creates one SVG with every element. `frame()` runs on every animation frame: it moves the camera towards its target, projects every 3D point through a small perspective projection (`pj`), and repositions the elements. There is no scene graph and no library besides three.js.
- **The tooth:** a three.js `WebGLRenderer` on its own canvas (`.rd-tgl`), with a custom ink shader (rim light plus fine horizontal hatching), turned to match the SVG camera every frame.
- **Constants**, at the top of `radial.js`:

  | Constant | Value | What it sets |
  |---|---|---|
  | `R0` | 200 | Where the lines leave the tooth (the latest year) |
  | `RMAX` | 620 | The oldest year's distance |
  | `ELEV` | per record | Each line's elevation |
  | `COLS` | per record | Each record's colour |
  | `HOME` (in `mount`) | yaw −0.5, pitch 0.3, distance 1,480 | The home camera |

- **Interaction:**
  - drag to orbit; the mouse wheel zooms (distance 760 to 3,000); double-click resets;
  - after 4 s idle the camera drifts slowly;
  - hovering a circle shows its years and count and dims the other records;
  - the readout at the bottom left shows the year under the pointer, in that record's colour: a hovered circle's start year, or the year at that point on the nearest record line (within 14 px, read back off the square-root scale, rounded to 10 years). It is empty otherwise.
- **Reduced motion:** with `prefers-reduced-motion`, there is no opening move, no drift and no sweeping ring.

## Data

The schema is in `js/radial-data.js`. Each record has:
- `key` and `name`;
- `angle`: its direction in degrees, clockwise from pointing right, 72° apart;
- `unit`: what the counts count;
- `segs`: the stretches of time the record covers;
- `dens`: one `[from, to, count]` per record. A `null` count means the count is genuinely absent.

Years are calendar years, BCE negative. Where the counts come from (files in the prototype's `source/layer data/`):

| Record | Count | Source |
|---|---|---|
| Caries | Adults recorded per period | c2b caries severity data |
| Wear and LEH | Adults scored for stress lines per period | c6c LEH combined data |
| Pathogens | Genomes per century | c4b pathogen matrix (AncientMetagenomeDir); the 800s have no samples |
| Metals | Individuals per childhood exposure window | c3b lead timeline (Montgomery et al. 2010, Kamenov et al. 2018) |
| Artificial interventions | Individuals examined | c7 intervention data (Monaco et al. 2022, Dittmar et al. 2026, Waters-Rist et al. 2013, Adult Dental Health Survey 2009) |

Notes on the counts:
- **Caries and Wear and LEH** share six working period boundaries (`GHHP_PERIODS`), from the Global History of Health Project European module.
- **Wear and LEH:** the c6c count is adults scored for a line on any of up to four teeth. The prototype's own stress-line figures use the lower canine alone, which gives different adults and counts. For example, Early medieval is 1,995 here against 2,164 on the canine, and Pre-medieval is 531 either way but not the same 531 people. Say which is meant before reusing either.

## Rules for working here

These come from how the team has worked on the prototype; keep them unless the owner changes them.

**Data**
- **No invented data.** Every number traces to a source file. Do not interpolate, smooth or fill a gap; a gap stays a gap.
- **Counts are not prevalence.** Genomes recovered, adults scored and people examined measure how much was gathered, not how common anything was.
- **Context is not data.** Label historical events and context as context.
- **Check against the data.** Before adjusting a visual element that encodes data, check it against the data and say what you found.

**Design**
- **Type and colour:** one typeface, Lora, for everything. Keep the paper palette and the five record colours unless asked.
- **No em dashes** in visible copy.
- **No overlapping text at any width.** Check at 1440, 1024 and 760 px with `tools/overlap-audit.js`.
- **Web first:** desktop and web are the priority; keep phone fixes small and CSS-only.
- **Motion:** respect reduced motion.

**Process**
- **Drafts first:** show the owner a draft, a screenshot or a running page, before committing. Commit and push only when asked.
- **Git:** run `git fetch` before committing; never force-push.

## Checking a change

1. Serve the folder and open it at 1440, 1024 and 760 px wide. Check the console for errors.
2. Run `tools/overlap-audit.js` in the console once the opening has settled (about 4 s). It must say "no overlaps".
3. Check reduced motion: the page should open settled, with no drift.
4. For changes to the tooth shader, time the first few draws. A shader that is slow per frame can crash the browser's GPU process.

## Styles

`css/radial.css` keeps the prototype's radial rules in their original order:
- **Dark section:** the 3D scene was first styled as a dark, glowing "space" scene.
- **Paper section:** the light paper theme comes later in the file and overrides the dark one. Later rules win, so do not reorder the file. To get a dark variant, delete the paper section.
- **Pruned:** rules for classes `radial.js` no longer uses were dropped.

## Open questions

- **Licences:**
  - the tooth model comes from the team's sculpted models, and their licence is unconfirmed;
  - the repository has no code licence yet;
  - the repository has been public since 2026-10-05 with both still open; settle them soon.
- **Data terms:**
  - the caries and wear counts derive from the Global History of Health Project, whose terms for public use are unconfirmed;
  - AncientMetagenomeDir is CC-BY 4.0 and needs attribution.
- **`onOpen` is not wired:** clicking a name does nothing yet.

## Origin

- **Source:** `js/radial.js` and `js/radial-data.js` were copied unchanged from `shuiee/tooth-untold` at commit 5e341a3. The radial was last changed there in c7da21c, Ali Qureshi's 3D rewrite.
- **Changed here since (2026-10-05):** in `js/radial.js`, the bottom-left camera readout became the year readout, the "Drag to orbit" hint was removed, and the oldest circle on each line now grows to full size (it used to stay at radius 0 after the opening; the prototype still has that bug). The page has no running head. `js/radial-data.js` is still unchanged.
- **Mesh and styles:** `data/tooth-mesh.js` keeps only the mesh the radial draws, and `css/radial.css` collects its styles from the prototype's `index.html`.
