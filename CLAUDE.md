# Project overview

Read this first. It explains what this repository is, how the diagram works, and the rules for changing it.

## What this is

This repository starts from one diagram: the **radial timeline** (Plate II, "How far back each record reaches") of *The Tooth Untold*, a data-visualisation prototype about what teeth from European graves record over two thousand years. The prototype was built by a Harvard MDE team. Its live version is at <https://shuiee.github.io/tooth-untold-prototype/>, and its source is the private repo `shuiee/tooth-untold`.

The diagram is a 3D scene on light journal paper:
- **The hub:** a first molar sits at the centre as a point cloud, carrying the caries, the wear, the metals and the pathogens of the period the timeline is reading; the crown worn away hovers above it as a separate cloud.
- **Five lines:** one per kind of dental evidence, each leaving the tooth in its own direction: caries, pathogens, wear and stress lines (LEH), metals in enamel, and artificial interventions (repairs).
- **Distance means time:** distance from the tooth is how long before 2009 a year is, on one square-root scale.
- **Along each line:** a circle marks each record, sized by how much was gathered. The line is darker over the years the records cover, so a gap in the record is a pale stretch.
- **The space around it:** a wire sphere, dotted time shells ("300 years ago" to "6,000 years ago") and the timeline: a ring that sweeps inward, from the oldest record to today, and can be paused, drawn as a soft, blurred band (the ring stroked five times over, widest faintest) so it reads apart from the records' crisp lines. A diamond handle on it lets the reader drag the timeline to a year.
- **Interaction:** the reader can orbit, zoom, hover a circle for its years and count, pause the timeline, drag its knob to a year, click a circle to open that time period's pop-up (one at a time, over the diagram), on a caries, pathogens, wear or metals circle also showing that period on the molar, click a second circle on the same line to compare the two on the molar, and hide or show records with the filter menu at the top left.

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
| `index.html` | The page: the `#radial` host, the filter menu, the Play/Pause and Replay buttons (icons, centred at the foot of the page), and the scripts in load order |
| `js/main.js` | Mounts the diagram, wires Pause, Replay, resize and the pop-up, and holds the `onOpen` hook (null for now) |
| `js/popup.js` | The pop-up for a clicked time period (`window.ToothPopup`): a template of placeholders, its motion, and `CONTENT` to fill per record |
| `css/popup.css` | The pop-up's styles and motion |
| `js/radial.js` | The diagram (`window.ToothRadial`). Copied from the prototype, then changed here (see Origin) |
| `js/radial-data.js` | The data (`window.RADIAL_DATA`), hand-edited, with each number's source file in its header comment. Copied unchanged |
| `data/molar-cloud.js` | The molar at the hub as a point cloud (`window.MOLAR_CLOUD`), generated by `tools/build_molar_cloud.py` |
| `js/caries-data.js` | Caries per period (`window.CARIES_RATES`), for the molar, with its source and the drawing rule |
| `js/wear-data.js` | Molar wear per period and age at death (`window.WEAR_DATA`), for the molar's height, with its source and the drawing rule |
| `js/metals-data.js` | Metals in childhood enamel per period (`window.METALS_DATA`), for the two streams of particles above the molar, with its sources and the drawing rule |
| `js/interventions-data.js` | Tooth repair per period (`window.INTERVENTIONS_DATA`), for the repaired share of the molar's decay, with its sources and the drawing rule |
| `js/pathogens-data.js` | Pathogens per century (`window.PATHOGENS_DATA`), for the particles on the molar's nerve, with its source and the drawing rule |
| `data/molar-nerve.js` | The nerve strands inside the molar (`window.MOLAR_NERVE`), generated by `tools/build_molar_nerve.py` |
| `tools/build_molar_nerve.py` | Builds `data/molar-nerve.js` from `data/molar-cloud.js` (needs numpy and scipy) |
| `js/leh-data.js` | Stress lines (LEH) per period (`window.LEH_RATES`), for the molar, with its source and the drawing rule |
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
  - `onSelect(pick)`: called with the time period clicked (`{ key, i, name, col, from, to, n, unit, range }`) or null once it is let go; `select({ key, i } | null)` sets it from outside;
  - `cover()`, `controls()`: functions giving the boxes of the pop-up and of Pause and Replay (`{ x, y, w, h }`, the pop-up's with `side`), which the names, time labels, the timeline's year and the readouts keep clear of;
  - `teeth`: an image fallback the prototype passed when WebGL meshes were missing; unused here.
- **Drawing:** `build()` creates one SVG with every element. `frame()` runs on every animation frame: it moves the camera towards its target, projects every 3D point through a small perspective projection (`pj`), and repositions the elements. There is no scene graph and no library besides three.js.
- **The tooth:** the first molar as a point cloud (`data/molar-cloud.js`), drawn by three.js on its own canvas (`.rd-tgl`) as `Points` with a small shader, turned to match the SVG camera every frame.
  - **The cloud:** 16,000 points sampled from the team's sculpted lower first molar, denser where the surface bends (cusps, ridges, fissures). The model is stood upright before sampling (its long axis, the main axis of its vertices, turned vertical), so the roots hang straight under the crown. On opening they fly in from five loose sheets around the tooth and settle, root first. Rebuild with `python3 tools/build_molar_cloud.py` (needs numpy, scipy, pillow and the prototype clone beside this one).
  - **Caries:** each crown point has a rank in a decay order (from the deepest fissures over the chewing surface, then down the sides), as a share of the crown's area. A period's caries colours the points below its share in three severities, and faint lines join neighbouring carious points, a mesh that grows and shrinks as the share changes. The share comes from `js/caries-data.js` through `cariesShares()` in `radial.js`; the order is anatomy, not data. The molar does not change height for caries.
  - **Wear:** the molar's height is the period's wear (`js/wear-data.js`, `wearShare()`): its lifetime of wear in Smith stages (the age bands in order, each at least the one before), on an expanded scale (17% of the crown's height at stage 3.8 to 57% at 5.8). Crown points above that plane are drawn on it, a flat worn surface (the caries carry onto it), and each also rises, at its own pace, into a separate cloud, in the tooth's own ink, hovering above the tooth (`lost`, `wearStep()`): the lost cap, which grows as the molar wears and settles back when the next period wore less.
  - **Stress lines (LEH):** bands of negative space on the crown's side wall, because a stress line is a band of thinner enamel, edged by a current of particles in the Wear and LEH colour, black (the record's colour; both lanes black) (the prototype's Section 3 cut a groove into its canine, which read as a carved defect). Within a line's reach, the molar's own crown points near it are pushed up or down out of it and packed against its edges (none are removed; `lehPush()` in the points' shader, from `LEHGL`), the caries mesh follows them, and the moved points are tinted in the line's colour by how far they moved; the travelling particles get the same push in JS (`push()`), so they crowd the gap's edges. The gaps are 0.28 and 0.18 of the band's height wide (`uLW`, half-widths), the push reaches 0.3 and 0.17 (`uLR`), and the ends taper shut. Each band also constricts the tooth: the surface round it sinks towards the crown's axis, deepest on the line (0.075 and 0.05 model units, about 0.75 and 0.5 mm, exaggerated to read at this scale; `LD`/`uLD`, `lehDent()`), for the molar's points, the caries mesh and the particles alike. To show the constriction as the tooth turns, the side wall (0.02 to 0.44 above the junction) is also sampled finely from the radius map (300 by 64 points) and drawn in ink only where a band sinks the surface and the surface turns away from the reader, so each band's notch shows crisply in profile and fades with the band's ends; plain wall gets no outline. The particles stream round the crown and gather into two wavy lines: the first reaches round by the period's share of adults with any line, the second by the share with two or more (all the way round = 100%), from `js/leh-data.js`. The two are told apart by look, place and pace: the first, high on the wall, is a flowing band of mid-teal (#16907A) streaks with a haze round it; the second, lower down, is a crisp beaded line of dark-teal (#0A4A3F) dots, without streaks or haze, travelling slower; the haze fades out before the gap between them, and their waves are kept small so they never cross. A Wear and LEH point's readout gives both shares on a third line, each in its line's colour. They follow the same period as the caries, so they move with the timeline and its knob, and ease to each new reach. The wall is mapped at load from the cloud's own crown points (a radius by angle and height, between 0.08 and 0.40 above the enamel-root junction), so nothing in `tools/build_molar_cloud.py` changes. Each particle is a short streak with a dot at its head, fainter on the far side. The band's place, its waves and the flow are a drawing rule; GHHP scores lines on canines and incisors, not molars. The bands follow the Wear and LEH line's period (its six periods are the caries line's too, so this only matters when the two differ, as when two caries periods are compared). `__radial().state().leh` reports both reaches. The look follows the team's flow-field reference: fine particles gathering into bright filaments.
  - **Metals:** a reflection of the pathogens: two streams of glowing particles flow down towards the molar from above, on either side of the worn-away cloud, along smooth gliding curves, and fade out before they reach the tooth, so the molar itself stays clear. The streams are the prototype's two groups (`js/metals-data.js`, `groups`): not industrial (zinc, barium, strontium, magnesium, part of enamel itself), in the Metals line's gold, and industrial (lead, copper, chromium, nickel), in violet; neither colour is a pathogen's. A group's presence (`metalGroups()`) is the mean of its elements' changes from the archaeological level, each as a value on the prototype radial chart's log scale (x 0.08 to x 20); it sends that times 48 particles (at least one), evenly spaced, so a denser stream is a greater presence. The groups never mix: not industrial keeps to the reader's left of the tooth and industrial to the right, each in three nested lanes that fall wide of the worn-away cloud and glide in beside the crown's upper part. The streams turn with the camera, not with the molar, so the sides hold as the reader orbits. Before the 20th century only lead is measured period by period (the others have one pooled archaeological value), so the industrial stream changes with lead alone until the 20th century. When the period changes, the extra particles finish their glide and stop, and new ones join the back of the stream (`metalsStep()`).
  - **Artificial interventions (repair against decay):** caries and repair are drawn as opposing forces. A period's tooth repair (`js/interventions-data.js`: teeth somebody repaired, per 100 individuals examined, extraction excluded at both ends; 0.98, 3.0 and 3.56 in three archaeological assemblages, 670 in England in 2009) as a share of the 2009 rate (`repShare()`, linear, no exaggeration) turns that share of the decay the molar shows from the caries colours to the interventions colour, earliest decay first (the deepest fissures, as a filling would be), a little larger so even a few points show (`uRep`, `cR` in the points' and the decay mesh's shaders). The points turn one by one as the share eases. At 2009 all the decay shown is repaired; in the 1800s about one point in two hundred, a handful of points, is: there is almost nothing to count before modern dentistry. Repair covers the period's decay even with caries hidden (`s.car.base`). The 2009 value is a floor (it excludes restored teeth that are also decayed, crowns, bridges, implants, dentures, extractions); the archaeological points do not differ significantly from one another. The team's what-if multipliers (x10, x100) are arithmetic, not data, and are not drawn. How interventions bear on wear and stress lines is still to be decided.
  - **Pathogens:** the pulp's nerve (`data/molar-nerve.js`, built by `tools/build_molar_nerve.py` from the cloud) is drawn as dense branches of points in the tooth's ink: strands up each root canal from the root's tip (the roots traced from the cloud), across the pulp chamber and branching under the five cusps. It stays in the pulp's space, its roof at 33% of the crown's height, below the heaviest wear drawn (38% of the crown left). The century's pathogens (`js/pathogens-data.js`, `pathogenCounts()`) climb it as glowing particles with trails of fading dots, in their kind's colour (bacteria, viruses, parasites, and grey for those that are not disease agents). Each kind has its own route, so its volume reads as one stream: it comes in from outside, below the tooth (a faint dotted way in, shown while the kind is present), to a root tip, climbs its own strand of that root's canal, crosses the chamber to its own pulp horn and splits into two twigs, where each particle swells and fades, then rejoins the back of the stream. Bacteria and parasites take one root, viruses and the rest the other; no two kinds share a strand or a horn (`ROUTE` in `radial.js`). A kind's particles follow one another at even spacing, so a denser stream is more particles: each pathogen adds one per 2.5% of that century's genomes it was found in (at least one), summed over the kind. That is how often it turns up among the genomes recovered, not how common the disease was. When the century changes, the extra particles finish their climb and stop, and new ones join the back of the stream. `state().pathogens` gives the particles per kind wanted (`byKind`) and flying (`flyingByKind`). The nerve is anatomy and a drawing rule, not data.
  - **The timeline:** the reading wave runs from the oldest record in to today (about 22 s a loop) and sets the caries shown: the period it is in; where it is in no period, the last period it passed (nothing before the first), with the caries line dimmed (`.rd-nodata`) until it reaches the next. Clicking a caries, pathogens, wear or metals circle moves the wave to that period and pauses it there (its readout gives the period's caries rate, the Smith stage its wear reached, its lead in ppm, or the pathogen found in most of its genomes); Play resumes from there. The carious points swell briefly whenever the period changes, so even the three periods within a point of one another (63.7, 64.0, 64.5%) show the switch. `__radial().state()` in the console reports the period shown, the crown's carious share, the wear (stage, share of the height lost, the plane, points lifted), the metals (the period, each element's value, each group's presence, the particles wanted and flying), and the pathogens (the century, the particles per pathogen, how many are flying and how many are finishing their climb). Pause stops the wave (`play()` / `playing()` on the mounted radial; `opts.onPlay` tells the page). Marks are picked on pointerdown, because they are re-ordered in the page every frame, which can cancel a click.
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
  - hovering (or tabbing to) the Pathogens or Metals name shows a legend beside it, styled as the circles' pop-up, for the colours that record draws on the molar: the pathogens' kinds, in two columns (red bacteria and blue viruses; teal parasites and grey not disease agents), and the metals' two groups, the streams beside it (gold non-industrial, violet industrial), each on one line with its elements by symbol ("Non-industrial: Zn, Ba, Sr, Mg", "Industrial: Pb, Cu, Cr, Ni"; the names in full for screen readers). Text in these legends and in the circles' readouts has no halo behind it (the record names on the diagram keep theirs). The legend goes in empty space, never over the molar and what hangs about it (the worn-away cloud, the pathogens' ways in, measured as bands round the tooth's axis through the current camera), the record lines, their circles, the names, the time labels, the timeline's knob and year, or the readout and buttons; it may lie over the sphere's rings. It never covers the time period's pop-up or the buttons. It keeps its place beside its name while that stays clear and moves to the nearest clear place (beside the name first, then anywhere on the page) when the turning tooth or the camera brings something under it; where nothing is clear (zoomed far in, or the pop-up open on a small page) it takes the place that covers least, the molar and the streams counting most; its leader line shows only while it is close to the name. The legends are `LEG` in `build()`; each name carries the same text as its `aria-label`;
  - a circle lights up only while it is the one hovered (or focused): one at a time, never on its own (the timeline does not swell circles as it passes), and none once the pointer leaves (`.rd-mark.hot`, which stays bright when the other records dim);
  - the readout at the bottom left shows the year under the pointer, in that record's colour: a hovered circle's start year, or the year at that point on the nearest record line (within 14 px, read back off the square-root scale, rounded to 10 years). It is empty otherwise.
  - the timeline's knob, a diamond lying along the ring (not a circle, which would read as a record's point), sits at the ring's front until it is dragged. Hovering it holds the ring still and shows the ring's year in the readout, without touching Pause. Dragging it moves it around the ring and in or out: the pointer's ray meets the ring's plane, its angle there places the knob and its distance from the hub sets the year, from 2009 out to the oldest record. That pauses the timeline there (Pause shows Play), so the molar shows that period's caries; the knob keeps its angle when the timeline plays on. The arrow keys step it in and out (Shift for bigger steps), and also pause;
  - clicking a circle picks its time period: it is ringed in ink, its years sit in a box beside it (wherever is clear of the names, the pop-up and the buttons; hidden if nowhere is), and its pop-up opens at the right of the page, about a quarter of it, over the diagram (along the bottom below 900 px). Up to two circles on one line can be picked at once, to compare them: both are ringed and labelled, the pop-up shows the last clicked, and on a record the molar shows (caries, wear and LEH, metals, pathogens) the molar loops between the two periods for that record (`cmp`; caries and wear swap every 2.4 s, the particle streams every 5 s, since they take a few seconds to thicken or thin). Both picked circles are highlighted alike (white, ink-ringed, `.rd-mark.sel`); the years label of the period the molar shows now is the stronger one (`.rd-pin.cur`). While comparing, every other record fades and greys, on the molar (its caries, worn-away cloud, stress lines, nerve and pathogens, metal streams: `s.dim`, `uCd`, `uWd`) and on the diagram (its line, circles and name, `.rd-fade`), and follows the same years: each shows its own period at the middle of the compared period on show. While the pop-up is open the diagram eases over and shrinks into the space beside it (left of it, or above it on narrow pages), so no circle lies under the pop-up and a second one can always be picked. At the right, the diagram's content (names, lines, circles) is moved to keep the same margin from the page's left edge as the pop-up keeps from its right (`s.shiftX`; names are held at that margin), shrinking if it must so the pop-up keeps at least 360 px; once it settles, the pop-up widens leftwards to the same gap from the content (`opts.onRoom`, `width()` in `js/popup.js`; up to 680 px), its cards stretching and their margins unchanged. A picked circle's line seen nearly end-on (running towards or away from the reader, so it lies over the tooth) makes the camera turn the least it can, left or right, until the line is seen at least about 63 degrees off the line of sight; its height and distance stay, and a line already seen well enough leaves the camera alone (`showLine()`; it replaced a camera fly that spun a full turn). A third circle on the same line lets the older go; clicking a picked circle lets it go; a circle on another line starts afresh. A click on empty space (a press and release without a drag), the pop-up's close (an X) or Escape lets them all go and stops the loop. The pop-up's content is placeholders for now (`CONTENT` in `js/popup.js`). It opens like a card between crop marks, after the team's reference: hairlines draw out across the page and part to its edges, its paper opens between them, its corners close in and its text resolves out of a blur; with reduced motion it fades in; The pop-up's cards have a faint outline all round (opening with the paper; the small triangles stay at the corners) and a large X in the top right corner, on the card itself, not in its body (which scrolls and clips on narrow pages). With two periods compared, both cards show, stacked, the earlier on top, each as tall as its content; each card's X lets its own period go (`unpick()`), Escape lets both go, and the card for the period the molar shows now has the stronger outline (`opts.onCompare`, `mark()`).
  - Play/Pause and Replay are icons in wide, low buttons, side by side at the foot of the page (white on black when hovered): two bars while the timeline plays (a click pauses it), a triangle while it is paused (a click plays it), as on video players, and a curved arrow for Replay; each has its label for screen readers;
  - the filter menu at the top left (`js/main.js`, "Filter by record") lists the five records with a checkbox each in its colour, all ticked to begin with except Artificial interventions, which shows only once ticked. Unticking one hides its line, circles and name and everything it draws on the molar: no caries; no wear, worn-away cloud or stress lines; no metal streams; no nerve or pathogens (they fade at once). Unticking Artificial interventions removes the repair (blue) from the molar's decay. The choice holds over Replay (`opts.hidden`, `show(key, on)`), and the names, labels and legends keep clear of the menu's button (`opts.menu`);
  - hover on the circles and on the knob is checked against the pointer's position every frame, because the circles are re-stacked by depth every frame and that can swallow the browser's mouseleave.
- **Reduced motion:** with `prefers-reduced-motion`, there is no opening move, no fly-in, no drift and no sweeping ring; the molar shows the latest period's caries and stress lines, the particles held still. The timeline's knob still sits at today, and dragging it shows the ring and moves the timeline.

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
- **The pop-ups are placeholders:** the header (the period clicked) is real; the key datapoint, picture, figures and notes are to be written, per record, in `CONTENT` in `js/popup.js`, every number from a data file.

## Origin

- **Source:** `js/radial.js` and `js/radial-data.js` were copied unchanged from `shuiee/tooth-untold` at commit 5e341a3. The radial was last changed there in c7da21c, Ali Qureshi's 3D rewrite.
- **Changed here since (2026-10-05):** in `js/radial.js`, the bottom-left camera readout became the year readout, the "Drag to orbit" hint was removed, and the oldest circle on each line now grows to full size (it used to stay at radius 0 after the opening; the prototype still has that bug). The centre tooth became the point-cloud molar with its caries, and the reading wave became the timeline: inward, from the oldest record to today, and pausable. Replay no longer leaves the previous tooth behind: `destroy()` now removes the tooth's canvas and its WebGL context (the prototype still has that bug). The timeline got a draggable knob, and a hovered circle no longer stays lit after the pointer leaves it (the prototype has that bug too). The page has no running head. `js/radial-data.js` is still unchanged.
- **Styles:** `css/radial.css` collects the radial's styles from the prototype's `index.html`.
- **The molar:** `data/molar-cloud.js` replaces the prototype's UL4 premolar mesh (`data/tooth-mesh.js`, removed). It is built from `source/teeth models/mandibular-first-molar.zip` in the prototype; the orientation steps are copied from its `build_models.py`.
- **Caries:** `js/caries-data.js` copies the prototype's `data/layers.js` caries plate (commit 5e341a3); the expanded scale is the prototype caries plate's `frac()`.
- **Wear:** `js/wear-data.js` copies the prototype's `data/layers.js` morphology.wear (commit 5e341a3), the c6 wear grid; the lifetime rule is the prototype Wear and LEH plate's `strataOf()`, and the scale is expanded here (the prototype's was (stage - 1) / 7 x 55% of the crown).
- **Pathogens:** `js/pathogens-data.js` copies the prototype's `data/layers.js` pathogens (commit 5e341a3), from AncientMetagenomeDir; the names are its pathogen strand's, the colours its kinds'.
- **Stress lines:** `js/leh-data.js` copies the prototype's `data/layers.js` `morphology.eras` (commit 5e341a3): the share with a line on any of up to four teeth, as the team's c6c file counts it, the same adults as the radial's Wear and LEH circles; not the lower-canine shares of the prototype's Section 3 figures.
- **Metals:** `js/metals-data.js` copies the prototype's `metals.js` (commit 5e341a3): the periods, lead series and pooled and modern values; the values follow its radial chart's log scale, and the two groups are its Metals plate's (`NONIND`).
- **Interventions:** `js/interventions-data.js` copies the observed rows (M01 to M04) of the team's `c7_intervention_continuous_data.csv`; the shaded x10 / x100 rows are not copied (arithmetic, not data).
