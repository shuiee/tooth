/* Stress lines (linear enamel hypoplasia, LEH) per period, for the molar at the centre of the radial (radial.js).
   Hand-copied: change the numbers here.

   Source: shuiee/tooth-untold, data/layers.js, morphology.eras (build_layers.py), at commit 5e341a3. It is computed from
   the Global History of Health Project, European module (ghhp_dental_decoded.csv): adults 18-69 with consistent counts
   and observed dentition, as the team's LEH file counts them (Wear and LEH/c6c_leh_combined_data.csv), whose shares it
   reproduces. A line counts on any of up to four scored teeth (upper and lower canines and incisors). These are the
   same adults as the radial's Wear and LEH circles (radial-data.js), not the lower-canine shares of the prototype's
   Section 3 figures (morphology.leh_canine), which count other adults and run lower (26.7% to 46.9%).
     p      the period (the radial's GHHP_PERIODS, in the same order)
     any    share of adults with at least one line, %
     multi  share with two or more lines on their worst tooth (Schultz stage 3), %
     n      adults scored

   How the molar draws it (radial.js): each line is a band of negative space on the side of the crown, because a stress
   line is a band of thinner enamel. Along the line, the molar's own points and the travelling particles are pushed up
   or down out of the band and packed against its edges, so the line reads as a gap, and the surface round it sinks
   towards the crown's axis, so the band constricts the tooth's outline. The first, high on the wall, edged
   with a flowing band of mid-teal streaks, reaches round the crown by `any` (all the way round = 100%); the second,
   lower down and narrower, edged with crisp dark-teal dots, by `multi`. Counts are
   shares of adults, not of the tooth: the molar stands for the period's adults, and the line's place on the crown, its
   waviness and the particles' flow are a drawing rule, not data. GHHP scores stress lines on canines and incisors, not
   on molars. */
(function () {
  "use strict";
  window.LEH_RATES = [
    { p: "Pre-medieval",   any: 34.3, multi: 10.7, n: 531 },
    { p: "Early medieval", any: 34.5, multi: 10.1, n: 1995 },
    { p: "High medieval",  any: 36.6, multi: 9.9,  n: 809 },
    { p: "Late medieval",  any: 43.9, multi: 15.7, n: 651 },
    { p: "Early modern",   any: 43.7, multi: 14.2, n: 1644 },
    { p: "Industrial",     any: 55.2, multi: 34.1, n: 455 },
  ];
})();
