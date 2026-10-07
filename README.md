**[Open the visualisation →](https://shuiee.github.io/tooth/)**

# The Tooth Untold

By Lily Liu, Elina Lee and Ali Qureshi.

A 3D radial timeline of dental evidence (Harvard MDE). A first molar sits at the centre as a point cloud, and five records leave it as lines: caries, pathogens, wear and stress lines, metals in enamel, and artificial interventions. The further a circle sits from the tooth, the longer ago its period; as the timeline plays, the molar shows each period's evidence.

## Run

```bash
python3 -m http.server 8770
```

Open <http://localhost:8770>. There is no build step and nothing to install. Drag to orbit, scroll to zoom, and click a circle to open its time period: pictures, charts and figures for that period. A second circle on the same line compares the two on the molar; the menu at the top left hides or shows records, and Fast forward (bottom right) opens the look ahead.

The code is in separate files (`js/`, `css/`, `data/`, `img/`, `fonts/`), and everything it needs is in the repository, so it also works offline. A pack script that builds one self-contained `index.html` from them is still to come.

## Credits

Data from the Global History of Health Project (European module); AncientMetagenomeDir (SPAAM community, CC-BY 4.0); Montgomery et al. 2010 and Kamenov et al. 2018; Monaco et al. 2022, Dittmar et al. 2026, Waters-Rist et al. 2013 and the Adult Dental Health Survey 2009. Sources, the file structure and the working rules are in `CLAUDE.md`.
