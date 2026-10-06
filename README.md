**[Open the visualisation →](https://shuiee.github.io/tooth/)**

# Radial timeline

A 3D radial timeline of dental evidence: how far back each kind of record reaches. A first molar sits at the centre as a point cloud, showing each period's caries, wear, metals and pathogens as the timeline plays (the worn-away crown hovers above it); five lines leave it, one each for caries, pathogens, wear and stress lines, metals in enamel, and artificial interventions. Distance from the tooth is how long ago a year is, and each record is a circle sized by how much was gathered.

It is the baseline for a project that uses a tooth as a visual archive of human history. The story moves from what a tooth preserves (childhood development, years of wear and decay, lifetime exposure to pathogens and metals, and broader change in dental practice) to human intervention: fillings, appliances and restorations that repair, cover or alter that evidence. It asks: what can future observers still understand from a tooth after humans have changed it?

The diagram starts from Plate II of *The Tooth Untold* (live prototype: <https://shuiee.github.io/tooth-untold-prototype/>). `CLAUDE.md` has the full storyboard.

## Run

```bash
python3 -m http.server 8770
```

Open <http://localhost:8770>. There is no build step and nothing to install. Drag to orbit, scroll to zoom, double-click to reset; **Play/Pause** (the icons at the foot of the page) holds the timeline, a click on a circle opens that time period's pop-up (and, on a caries, pathogens, wear or metals circle, shows that period on the molar), a second click on the same line compares the two on the molar, a click on empty space lets them go; the menu at the top right hides or shows records; **Replay** (the curved arrow) runs the opening again.

## Structure

```text
index.html            the page
css/radial.css        theme tokens and the diagram's styles
css/popup.css         the pop-up's styles and motion
js/main.js            mounts the diagram; Pause, Replay, resize, the pop-up, the onOpen hook
js/popup.js           the pop-up for a clicked time period (placeholders for now)
js/caries-data.js     caries per period, for the molar
js/wear-data.js       molar wear per period and age, for the molar's height
js/metals-data.js     metals in childhood enamel per period, for the particles flowing down to the molar
js/interventions-data.js  tooth repair per period, for the repaired share of the molar's decay
js/pathogens-data.js  pathogens per century, for the particles climbing the molar's nerve
js/leh-data.js        stress lines per period, for the molar
js/radial.js          the diagram (window.ToothRadial)
js/radial-data.js     the data (window.RADIAL_DATA), with its sources
data/molar-cloud.js   the molar at the centre, as a point cloud
tools/build_molar_cloud.py  builds it from the team's sculpted molar
data/molar-nerve.js   the nerve strands inside the molar (tools/build_molar_nerve.py)
vendor/three.min.js   three.js r128, for the tooth only
tools/overlap-audit.js  checks that no text overlaps
docs/prompts.md       prompts to rebuild or edit the diagram
CLAUDE.md             project overview and working rules, for people and agents
```

## Data and credits

Every count traces to a published or team-prepared dataset. The details are in `js/radial-data.js` and `CLAUDE.md`. The sources are:
- the Global History of Health Project (European module);
- AncientMetagenomeDir (SPAAM community, CC-BY 4.0);
- Montgomery et al. 2010 and Kamenov et al. 2018 (metals);
- Monaco et al. 2022, Dittmar et al. 2026, Waters-Rist et al. 2013 and the Adult Dental Health Survey 2009 (repairs).

The diagram comes from *The Tooth Untold* (Harvard MDE); its 3D version is by Ali Qureshi. three.js is MIT-licensed.

Licences for the tooth model and for this code, and the data terms for public use, are still to be settled. See `CLAUDE.md`.
