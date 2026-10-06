# Project overview

Read this first. It explains what this repository is, how the diagram works, and the rules for changing it.

## What this is

This repository starts from one diagram: the **radial timeline** (Plate II, "How far back each record reaches") of *The Tooth Untold*, a data-visualisation prototype about what teeth from European graves record over two thousand years. The prototype was built by a Harvard MDE team. Its live version is at <https://shuiee.github.io/tooth-untold-prototype/>, and its source is the private repo `shuiee/tooth-untold`.

The diagram is a 3D scene on light journal paper:
- **The hub:** a first molar sits at the centre as a point cloud, carrying the caries of the period the timeline is reading.
- **Five lines:** one per kind of dental evidence, each leaving the tooth in its own direction: caries, pathogens, wear and stress lines (LEH), metals in enamel, and artificial interventions (repairs).
- **Distance means time:** distance from the tooth is how long before 2009 a year is, on one square-root scale.
- **Along each line:** a circle marks each record, sized by how much was gathered. The line is darker over the years the records cover, so a gap in the record is a pale stretch.
- **The space around it:** a wire sphere, dotted time shells ("300 years ago" to "6,000 years ago") and the timeline: a ring that sweeps inward, from the oldest record to today, and can be paused. A knob on the ring lets the reader drag the timeline to a year.
- **Interaction:** the reader can orbit, zoom, hover a circle for its years and count, pause the timeline, drag its knob to a year, and click a caries circle to show that period's caries on the molar.

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
| `index.html` | The page: the `#radial` host, the Pause and Replay buttons, and the scripts in load order |
| `js/main.js` | Mounts the diagram, wires Pause, Replay and resize, and holds the `onOpen` hook (null for now) |
| `js/radial.js` | The diagram (`window.ToothRadial`). Copied from the prototype, then changed here (see Origin) |
| `js/radial-data.js` | The data (`window.RADIAL_DATA`), hand-edited, with each number's source file in its header comment. Copied unchanged |
| `data/molar-cloud.js` | The molar at the hub as a point cloud (`window.MOLAR_CLOUD`), generated by `tools/build_molar_cloud.py` |
| `js/caries-data.js` | Caries per period (`window.CARIES_RATES`), for the molar, with its source and the drawing rule |
| `tools/build_molar_cloud.py` | Builds `data/molar-cloud.js` from the team's sculpted lower first molar (in the prototype's `source/teeth models/`) |
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
- **The tooth:** the first molar as a point cloud (`data/molar-cloud.js`), drawn by three.js on its own canvas (`.rd-tgl`) as `Points` with a small shader, turned to match the SVG camera every frame.
  - **The cloud:** 16,000 points sampled from the team's sculpted lower first molar, denser where the surface bends (cusps, ridges, fissures). On opening they fly in from five loose sheets around the tooth and settle, root first. Rebuild with `python3 tools/build_molar_cloud.py` (needs numpy, scipy, pillow and the prototype clone beside this one).
  - **Caries:** each crown point has a rank in a decay order (from the deepest fissures over the chewing surface, then down the sides), as a share of the crown's area. A period's caries colours the points below its share in three severities, and faint lines join neighbouring carious points, a mesh that grows and shrinks as the share changes. The share comes from `js/caries-data.js` through `cariesShares()` in `radial.js`; the order is anatomy, not data. The molar does not change height for caries (wear will do that later).
  - **The timeline:** the reading wave runs from the oldest record in to today (about 22 s a loop) and sets the caries shown: the period it is in; where it is in no period, the last period it passed (nothing before the first), with the caries line dimmed (`.rd-nodata`) until it reaches the next. Clicking a caries circle moves the wave to that period and pauses it there, without moving the camera (the circle is ringed, `.rd-mark.now`, and its readout gives the period's caries rate); Play resumes from there. The carious points swell briefly whenever the period changes, so even the three periods within a point of one another (63.7, 64.0, 64.5%) show the switch. `__radial().state()` in the console reports the period shown and the crown's carious share. Pause stops the wave (`play()` / `playing()` on the mounted radial; `opts.onPlay` tells the page). Marks are picked on pointerdown, because they are re-ordered in the page every frame, which can cancel a click.
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
  - the timeline's knob sits on the ring, at its front until it is dragged. Hovering it holds the ring still and shows the ring's year in the readout, without touching Pause. Dragging it moves it around the ring and in or out: the pointer's ray meets the ring's plane, its angle there places the knob and its distance from the hub sets the year, from 2009 out to the oldest record. That pauses the timeline there (Pause shows Play), so the molar shows that period's caries; the knob keeps its angle when the timeline plays on. The arrow keys step it in and out (Shift for bigger steps), and also pause;
  - hover on the circles and on the knob is checked against the pointer's position every frame, because the circles are re-stacked by depth every frame and that can swallow the browser's mouseleave.
- **Reduced motion:** with `prefers-reduced-motion`, there is no opening move, no fly-in, no drift and no sweeping ring; the molar shows the latest period's caries. The timeline's knob still sits at today, and dragging it shows the ring and moves the timeline.

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
- **Changed here since (2026-10-05):** in `js/radial.js`, the bottom-left camera readout became the year readout, the "Drag to orbit" hint was removed, and the oldest circle on each line now grows to full size (it used to stay at radius 0 after the opening; the prototype still has that bug). The centre tooth became the point-cloud molar with its caries, and the reading wave became the timeline: inward, from the oldest record to today, and pausable. Replay no longer leaves the previous tooth behind: `destroy()` now removes the tooth's canvas and its WebGL context (the prototype still has that bug). The timeline got a draggable knob, and a hovered circle no longer stays lit after the pointer leaves it (the prototype has that bug too). The page has no running head. `js/radial-data.js` is still unchanged.
- **Styles:** `css/radial.css` collects the radial's styles from the prototype's `index.html`.
- **The molar:** `data/molar-cloud.js` replaces the prototype's UL4 premolar mesh (`data/tooth-mesh.js`, removed). It is built from `source/teeth models/mandibular-first-molar.zip` in the prototype; the orientation steps are copied from its `build_models.py`.
- **Caries:** `js/caries-data.js` copies the prototype's `data/layers.js` caries plate (commit 5e341a3); the expanded scale is the prototype caries plate's `frac()`.
