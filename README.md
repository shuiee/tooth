**[Open the visualisation →](https://shuiee.github.io/tooth/)**

# The Tooth Untold

By Lily Liu, Elina Lee and Ali Qureshi.

A 3D radial timeline of dental evidence (Harvard MDE). A first molar sits at the centre as a point cloud, and five records leave it as lines: caries, pathogens, wear and stress lines, metals in enamel, and artificial interventions. The further a circle sits from the tooth, the longer ago its period; as the timeline plays, the molar shows each period's evidence.

## Run

```bash
python3 -m http.server 8770
```

Open <http://localhost:8770>. There is no build step and nothing to install. Drag to orbit, scroll to zoom, and click a circle to open its time period: pictures, charts and figures for that period. A second circle on the same line compares the two on the molar; the menu at the top left hides or shows records. **Fast forward** (bottom right) opens the look ahead: the molar divides in two, the repair projected on the right, with the storyboard's text (Play/Pause and Replay work there too); **Rewind** (bottom left) goes back.

The live page (`main`) is one self-contained file, `index.html`, with its code, images and fonts packed inside it. This branch keeps the prototype as separate files:

```text
index.html               the page
css/radial.css           theme tokens and the diagram's styles
css/popup.css            the pop-up's styles and motion
js/main.js               mounts the diagram; Pause, Replay, Fast forward and Rewind, resize, the pop-up, the onOpen hook
js/popup.js              the pop-up for a clicked time period
js/popup-content.js      each record's pop-up: key datapoint, pictures, charts and figures
img/                     the pop-ups' pictures
js/radial.js             the diagram (window.ToothRadial)
js/radial-data.js        the data (window.RADIAL_DATA), with its sources
js/*-data.js             caries, wear, stress lines, metals, pathogens and repairs per period, for the molar
data/molar-cloud.js      the molar at the centre, as a point cloud (tools/build_molar_cloud.py)
data/molar-nerve.js      the nerve strands inside the molar (tools/build_molar_nerve.py)
vendor/three.min.js      three.js r128, for the tooth only
tools/overlap-audit.js   checks that no text overlaps
docs/prompts.md          prompts to rebuild or edit the diagram
CLAUDE.md                project overview and working rules, for people and agents
```

## Credits

Data from the Global History of Health Project (European module); AncientMetagenomeDir (SPAAM community, CC-BY 4.0); Montgomery et al. 2010 and Kamenov et al. 2018; Monaco et al. 2022, Dittmar et al. 2026, Waters-Rist et al. 2013 and the Adult Dental Health Survey 2009. Sources, the file structure and the working rules are in `CLAUDE.md`.
