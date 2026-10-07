/* Tooth repair per period, for the molar at the centre of the radial (radial.js). Hand-copied.

   Source: the team's Artificial interventions data, c7_intervention_continuous_data.csv (the observed rows M01 to
   M04): teeth somebody repaired, per 100 individuals examined, the same quantity on both sides of 1850; extraction is
   excluded at both ends. The rows are the radial's Artificial interventions circles, in the same order.
     per100   repaired teeth per 100 individuals examined (the csv's y_repaired_teeth_per_100)
     teeth    repaired teeth counted (for the 2009 survey, the mean per person, so per100 is that times 100)
     people   individuals examined
     detail   what was counted
     cite     the source
   Not copied: the csv's shaded "x10 / x100" rows (M05 to M10) are arithmetic what-ifs, not data, and its break-even
   row (M12) is derived. The archaeological points do not differ significantly from one another (overlapping Poisson
   intervals); three assemblages across eight hundred years is a thin record. The 2009 value is a floor: it excludes
   restored teeth that are also decayed, and crowns, bridges, implants, dentures and extractions.

   How the molar draws it (radial.js, repShare()): a period's repair rate as a share of the 2009 rate (linear, no
   exaggeration), and that share of the decay the molar shows (its caries points, earliest decay first, in the deepest
   fissures) turns from the caries colour to the interventions colour: repair against decay. At 2009 the decay shown is
   all repaired; in the 1800s about one point in two hundred is. */
(function () {
  "use strict";
  window.INTERVENTIONS_DATA = {
    periods: [
      { p: "Pieve di Pava, Tuscany, 10th to 12th c.", y: [900, 1200], per100: 0.98, teeth: 2, people: 204, detail: "two grooved maxillary incisors",
        cite: "Monaco M, Riccomi G, Minozzi S, Campana S, Giuffra V (2022). Arch Oral Biol 140:105449" },
      { p: "Aberdeen, 1460 to 1670", y: [1460, 1670], per100: 3.0, teeth: 3, people: 100, detail: "two ligatured incisors, one replaced",
        cite: "Dittmar JM, Crozier R, Cameron A, Mann B, Oxenham MF (2026). Br Dent J 240(8):555-559" },
      { p: "Middenbeemster, Netherlands, 1800s", y: [1800, 1899], per100: 3.556, teeth: 16, people: 450, detail: "two denture wearers, about 16 teeth spanned or braced",
        cite: "Waters-Rist AL, Braekmans D, Hoogland MLP (2013). BABAO 15th Annual Conference, York (conference poster)" },
      { p: "England, 2009", y: [2009, 2009], per100: 670, teeth: 6.7, people: 6470, detail: "mean restored, otherwise sound teeth per person, all ages, unadjusted",
        cite: "Adult Dental Health Survey 2009 published tables, NHS Digital / NatCen (Table 4.3.1)" },
    ],
    modern: 670,
  };
})();
