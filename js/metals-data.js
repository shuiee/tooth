/* Metals in childhood enamel per period, for the molar at the centre of the radial (radial.js). Hand-copied.

   Source: shuiee/tooth-untold, metals.js (the prototype's Metals section), at commit 5e341a3; every value traces to
   its source/layer data/Metals Viz files.
     periods  the childhood exposure windows of the British lead series (Montgomery et al. 2010) and 20th-century
              births (Kamenov et al. 2018): exposure_early / exposure_late in c3b_lead_timeline_data.csv, and the
              number of individuals. They are the radial's metals line, in the same order.
     lead     ppm per period: the British medians (Montgomery et al. 2010, Table 11.4), then the 20th-century mean
     leadArch lead in archaeological enamel in the same study as the modern values (Kamenov et al. 2018): 0.63 ppm
     pooled   the other elements in archaeological enamel, one pooled value (Kamenov et al. 2018, Table 1; Florida,
              the Philippines and Peru, n = 38): there is no per-period measurement before 1900
     modern   the same elements in 20th-century births (Kamenov et al. 2018, Table 1, n = 77)
     colours  each element's colour, as the prototype's radial chart and grain used them
     groups   not industrial (zinc, barium, strontium, magnesium: part of enamel itself) and industrial (lead, copper,
              chromium, nickel), as the prototype's Metals plate groups them (metals.js, NONIND)
     groupColours  the two groups' colours on the streams: the Metals line's gold, and a violet no other record uses

   How the molar draws it (radial.js, metalGroups()): each element's change from the archaeological level in the
   same study (lead: ppm / 0.63; the others: 1 until the 20th century, then modern / pooled), placed on the prototype
   radial chart's log scale (x 0.08 to x 20) as a value from 0 to 1; a group's presence is the mean of its elements'
   values. Each group is a stream of particles flowing down towards the molar from above, on its own side of the
   tooth, as many as its presence times 48 (at least one), so a denser stream is a greater presence; they fade before
   they reach the tooth. */
(function () {
  "use strict";
  window.METALS_DATA = {
    periods: [
      { p: "Neolithic",      y: [-4040, -2525], n: 31 },
      { p: "Bronze Age",     y: [-2540, -825],  n: 13 },
      { p: "Iron Age",       y: [-840, 18],     n: 10 },
      { p: "Roman",          y: [3, 375],       n: 25 },
      { p: "Post-Roman",     y: [360, 675],     n: 50 },
      { p: "Early medieval", y: [660, 1075],    n: 26 },
      { p: "Late medieval",  y: [1160, 1475],   n: 26 },
      { p: "20th century",   y: [1860, 1975],   n: 77 },
    ],
    lead: [0.1, 0.06, 0.06, 1.21, 0.39, 1.93, 4.69, 6.55],
    leadArch: 0.63,
    pooled: { Cu: 0.25, Cr: 0.072, Ni: 0.24, Zn: 145, Ba: 3.2, Sr: 188, Mg: 2430 },
    modern: { Cu: 3.6, Cr: 0.8, Ni: 2.2, Zn: 215, Ba: 4.6, Sr: 168, Mg: 3075 },
    elements: [["Pb", "lead"], ["Cu", "copper"], ["Cr", "chromium"], ["Ni", "nickel"], ["Zn", "zinc"], ["Ba", "barium"], ["Sr", "strontium"], ["Mg", "magnesium"]],
    colours: { Pb: "#c62828", Cu: "#e5780e", Cr: "#b89a00", Ni: "#2f9a3a", Zn: "#0aa1b0", Ba: "#2f5fd8", Sr: "#8a4fd6", Mg: "#d4439a" },
    groups: { nonindustrial: ["Zn", "Ba", "Sr", "Mg"], industrial: ["Pb", "Cu", "Cr", "Ni"] },
    groupColours: { nonindustrial: "#A67C00", industrial: "#6A3FA0" },
  };
})();
