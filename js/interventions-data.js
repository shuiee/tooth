/* Tooth repair per period, for the molar at the centre of the radial (radial.js) and the Artificial interventions
   pop-up (js/popup-content.js). Hand-copied.

   Source: the team's Artificial interventions data, c7_intervention_continuous_data.csv (the observed rows M01 to
   M04): teeth somebody repaired, per 100 individuals examined, the same quantity on both sides of 1850; extraction is
   excluded at both ends. The rows are the radial's Artificial interventions circles, in the same order.
     p        the period's name (the radial's readout)
     site, place, when   the sample's site (or survey), where, and its dates, for the pop-up's lines and labels
     y        its years (x_date_early, x_date_late); x, the year the chart plots it at (x_year, the range's middle)
     per100   repaired teeth per 100 individuals examined (y_repaired_teeth_per_100)
     lo, hi   its exact 95% Poisson interval on the count, per 100 (ci_low_per_100, ci_high_per_100); none for the
              survey, whose standard error is negligible at this scale
     teeth    repaired teeth counted (for the 2009 survey, the mean per person, so per100 is that times 100)
     people   individuals examined
     withWork individuals with any dental work (the archaeological samples), and withPct, the share of adults with one
              or more fillings (the 2009 survey): from the team's events timeline, research/Human Correlations/
              timeline_events_display.csv in the prototype, EV031 (1/204, 1/100, 2/450) and EV034 (84%, n = 6,470;
              ADHS 2009 Table 4.1.1). Not the same measure at both ends: buried people screened for any dental work,
              living adults examined for fillings
     detail   what was counted
     cite, short   the source, in full and short
   missRates: the csv's assumed miss rates for its shaded what-if bars (M05 to M10): each archaeological rate as if 90%
   or 99% of repairs had gone unseen, per100 / (1 - rate), so x10 and x100. Arithmetic, not data and not an estimate;
   the pop-up draws them as pale bars and says so. Its break-even row (M12, 1 - archaeological mean / 670) is derived,
   and worked out in the pop-up. The archaeological points do not differ significantly from one another (overlapping
   Poisson intervals); three assemblages across eight hundred years is a thin record. The 2009 value is a floor: it
   excludes restored teeth that are also decayed, and crowns, bridges, implants, dentures and extractions.

   How the molar draws it (radial.js, repShare()): a period's repair rate as a share of the 2009 rate (linear, no
   exaggeration), and that share of the decay the molar shows (its caries points, earliest decay first, in the deepest
   fissures) turns from the caries colour to the interventions colour: repair against decay. At 2009 the decay shown is
   all repaired; in the 1800s about one point in two hundred is. */
(function () {
  "use strict";
  window.INTERVENTIONS_DATA = {
    periods: [
      { p: "Pieve di Pava, Tuscany, 10th to 12th c.", site: "Pieve di Pava", place: "Tuscany", when: "10th to 12th c.", y: [900, 1200], x: 1050,
        per100: 0.98, lo: 0.119, hi: 3.542, teeth: 2, people: 204, withWork: 1, detail: "two grooved maxillary incisors",
        cite: "Monaco M, Riccomi G, Minozzi S, Campana S, Giuffra V (2022). Arch Oral Biol 140:105449", short: "Monaco et al. 2022" },
      { p: "Aberdeen, 1460 to 1670", site: "Aberdeen", place: "Scotland", when: "1460 to 1670", y: [1460, 1670], x: 1565,
        per100: 3.0, lo: 0.619, hi: 8.767, teeth: 3, people: 100, withWork: 1, detail: "two ligatured incisors, one replaced",
        cite: "Dittmar JM, Crozier R, Cameron A, Mann B, Oxenham MF (2026). Br Dent J 240(8):555-559", short: "Dittmar et al. 2026" },
      { p: "Middenbeemster, Netherlands, 1800s", site: "Middenbeemster", place: "the Netherlands", when: "1800s", y: [1800, 1899], x: 1850,
        per100: 3.556, lo: 2.032, hi: 5.774, teeth: 16, people: 450, withWork: 2, detail: "two denture wearers, about 16 teeth spanned or braced",
        cite: "Waters-Rist AL, Braekmans D, Hoogland MLP (2013). BABAO 15th Annual Conference, York (conference poster)", short: "Waters-Rist et al. 2013 (poster)" },
      { p: "England, 2009", site: "England", place: "England", when: "2009", y: [2009, 2009], x: 2009,
        per100: 670, lo: null, hi: null, teeth: 6.7, people: 6470, withPct: 84, detail: "mean restored, otherwise sound teeth per person, all ages, unadjusted",
        cite: "Adult Dental Health Survey 2009 published tables, NHS Digital / NatCen (Table 4.3.1)", short: "Adult Dental Health Survey 2009" },
    ],
    modern: 670,
    missRates: [0.9, 0.99],
  };
})();

// Human events that bear on tooth repair, for the pop-up's last slide: context, not data. From the team's timeline
// (research/Human Correlations/timeline_events_display.csv in the prototype): the events whose layer is Artificial
// interventions and whose years overlap one of its periods (EV031, EV033, EV034; EV025 and EV026, before 900, overlap
// none). Each line is put plainly from the timeline's label and expected effect; each effect from its measured column.
//   id, name, from, to  the event and its years; note, its name mid-sentence
//   line                what it was
//   effect              what the record shows of it
//   img                 its picture (src, alt, ref), or null for a placeholder
(function () {
  "use strict";
  window.INTERVENTIONS_EVENTS = {
    events: [
      { id: "EV031", name: "Amalgam makes tooth repair routine", note: "amalgam making tooth repair routine", from: 1826, to: 1900, img: null,
        line: "Amalgam fillings made the repair of decayed teeth routine. Once a cavity is filled, the decay it held can no longer be read from the tooth.",
        effect: "Before 1850 no sample here reaches 1% of people with dental work: 1 of 204 at Pieve di Pava, 1 of 100 at Aberdeen and 2 of 450 at Middenbeemster." },
      { id: "EV033", name: "Fillings come to follow a person's age", note: "fillings coming to follow a person's age", from: 1978, to: 2009, img: null,
        line: "As decay fell among the young, the number of a person's fillings came to follow their age more than the years they lived in.",
        effect: "Mean filled teeth per adult fell from 8.1 to 6.8 across all ages and from 7.8 to 1.7 at 16 to 24, and rose from 4.9 to 10.2 at 55 to 64." },
      { id: "EV034", name: "Repair becomes near-universal", note: "repair becoming near-universal", from: 2009, to: 2009, img: null,
        line: "By 2009 most adults in England had at least one filled tooth.",
        effect: "84% of the 6,470 adults examined, against 0.49%, 1.00% and 0.44% of people with any dental work in the three archaeological samples. Not the same measure: buried people screened for any dental work, living adults examined for fillings." },
    ],
  };
})();
