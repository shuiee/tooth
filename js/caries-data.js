/* Caries per period, for the molar at the centre of the radial (radial.js). Hand-copied: change the numbers here.

   Source: shuiee/tooth-untold, data/layers.js, caries.plate (build_layers.py), at commit 5e341a3. It is computed from
   the Global History of Health Project, European module (ghhp_dental_decoded.csv): adults 18-69 with a consistent
   caries count, the same rows as the team's severity figure (Caries Viz/c2b_caries_severity_data.csv), whose shares
   it reproduces. The six periods are the radial's GHHP_PERIODS, in the same order; n is the radial's caries count.
     p     the period
     std   share of adults with at least one carious tooth, age-standardised to the pooled age distribution, %
     sev   adults by how many of their own teeth were carious: none, 1-2, 3-4, 5-9, 10+ (% of the period's adults)
     n     adults

   How the molar draws it (radial.js, cariesShares()), as on the prototype's caries plate:
     the carious share of the chewing surface is std on an expanded scale (8% at a rate of 51%, 80% at 77%),
     because the whole record sits between 52.4% and 76.1%; the scale magnifies every difference about 2.8 times;
     within it, the cavitated share is that share times the affected adults' share with 3 or more carious teeth,
     and the core is that share times their share with 5 or more. The spread over the crown (from the fissures out)
     is anatomy and a drawing rule (tools/build_molar_cloud.py), not data. */
(function () {
  "use strict";
  window.CARIES_RATES = [
    { p: "Pre-medieval",   std: 63.7, sev: [36.1, 32.5, 18.0, 10.5, 2.9], n: 621 },
    { p: "Early medieval", std: 54.3, sev: [44.5, 32.2, 14.4, 7.9, 1.0],  n: 2289 },
    { p: "High medieval",  std: 52.4, sev: [47.2, 28.8, 13.3, 10.2, 0.5], n: 920 },
    { p: "Late medieval",  std: 64.5, sev: [35.5, 32.4, 16.8, 13.3, 2.0], n: 1025 },
    { p: "Early modern",   std: 64.0, sev: [36.3, 25.8, 14.7, 17.9, 5.3], n: 1841 },
    { p: "Industrial",     std: 76.1, sev: [24.1, 29.0, 18.5, 19.8, 8.7], n: 531 },
  ];
})();
