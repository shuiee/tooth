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

// Stress lines on the lower canine alone, for the stress-line pop-up's charts (js/popup-content.js), after the team's
// drafts C10, C9 and C8. Hand-copied from shuiee/tooth-untold, data/layers.js, morphology.leh_canine (build_layers.py),
// at commit 5e341a3: Global History of Health Project, European module, decoded for the project; adults 18-69 with a
// scorable lower canine; scoring after Schultz (1988). Other adults than LEH_RATES above (any of four teeth), so lower.
//   n, sitesMin  adults in all; cemeteries are shown with at least sitesMin scorable canines
//   mids         each age band's middle, in years (the fitted lines are drawn at them)
//   colours      each period's colour on the prototype's C9 (a drawing choice, not data)
//   eras         per period: adults n, with a line k, pct and its 95% Wilson interval ci, age-standardised std; slope,
//                the least-squares slope of the 0/1 marker on age, in points per decade, and meanAge; comp, the shares
//                with no line, one, two or more (compN, the adults); sitesAll, its cemeteries in all;
//                cells, per age band [band, adults, with a line, %, points from the period's share, the fitted line there];
//                sites, per cemetery with at least sitesMin [name, adults, % with a line, % with two or more, slope]
(function () {
  "use strict";
  window.LEH_CANINE = {
    n: 5929, sitesMin: 15,
    ages: ["18–24", "25–29", "30–34", "35–39", "40–44", "45–49", "50–59", "60+"],
    mids: [21.5, 27.5, 32.5, 37.5, 42.5, 47.5, 55, 65],
    colours: {"Pre-medieval": "#2a78d6", "Early medieval": "#eb6834", "High medieval": "#1baf7a", "Late medieval": "#eda100", "Early modern": "#e87ba4", "Industrial": "#008300"},
    eras: [
      { p: "Pre-medieval", n: 531, k: 142, pct: 26.7, ci: [23.2, 30.7], std: 26.7, slope: -1.0, meanAge: 37.8, comp: [73.3, 19.2, 7.5], compN: [389, 102, 40], sitesAll: 10,
        cells: [["18–24", 71, 20, 28.2, 1.43, 1.63], ["25–29", 74, 22, 29.7, 2.99, 1.03], ["30–34", 69, 21, 30.4, 3.69, 0.53], ["35–39", 83, 21, 25.3, -1.44, 0.03], ["40–44", 78, 21, 26.9, 0.18, -0.47], ["45–49", 61, 11, 18.0, -8.71, -0.97], ["50–59", 65, 18, 27.7, 0.95, -1.72], ["60+", 30, 8, 26.7, -0.08, -2.72]],
        sites: [
          ["Slava Rusa", 50, 24.0, 2.0, -7.18],
          ["Plinkaigalis", 152, 38.2, 7.2, -6.89],
          ["Butt Road, Colchester", 72, 27.8, 5.6, -5.83],
          ["Szoreg-Teglagyar", 29, 0.0, 0.0, 0.0],
          ["Mangalia", 78, 19.2, 9.0, 0.34],
          ["Trentholme Drive, York", 40, 12.5, 2.5, 2.31],
          ["Amiens Ilot des Boucheries", 84, 31.0, 16.7, 5.69],
          ["Graberfeld Stalden", 15, 26.7, 13.3, 15.11] ] },
      { p: "Early medieval", n: 2164, k: 672, pct: 31.1, ci: [29.1, 33.0], std: 31.2, slope: -1.28, meanAge: 41.6, comp: [68.9, 23.2, 7.9], compN: [1492, 501, 171], sitesAll: 26,
        cells: [["18–24", 217, 74, 34.1, 3.05, 2.57], ["25–29", 175, 52, 29.7, -1.34, 1.8], ["30–34", 224, 63, 28.1, -2.93, 1.16], ["35–39", 226, 76, 33.6, 2.57, 0.52], ["40–44", 309, 99, 32.0, 0.99, -0.12], ["45–49", 328, 105, 32.0, 0.96, -0.76], ["50–59", 493, 160, 32.5, 1.4, -1.72], ["60+", 192, 43, 22.4, -8.66, -3.0]],
        sites: [
          ["Pottenbrun", 69, 69.6, 27.5, -13.88],
          ["Kiev-Shchekavitsa", 28, 21.4, 10.7, -6.35],
          ["Saint Sauver", 51, 39.2, 13.7, -5.78],
          ["Istria", 39, 43.6, 15.4, -5.58],
          ["Apple Down", 75, 6.7, 1.3, -4.85],
          ["Homokmegy-Szekes", 75, 16.0, 0.0, -4.83],
          ["Etting", 25, 4.0, 0.0, -4.43],
          ["Zwolfaxing", 99, 37.4, 8.1, -3.89],
          ["Buren Oberburen", 82, 63.4, 29.3, -3.13],
          ["Sourtara", 27, 3.7, 3.7, -2.98],
          ["Lauchheim", 728, 30.9, 0.8, -2.73],
          ["BlackGate", 139, 54.7, 10.1, -1.79],
          ["Gars Thunau", 58, 56.9, 17.2, -1.31],
          ["Giecz", 88, 86.4, 45.5, -0.81],
          ["Grossmehring", 81, 0.0, 0.0, 0.0],
          ["Kiskundorozsma Daruhalom", 34, 20.6, 11.8, 0.22],
          ["Volders", 49, 2.0, 2.0, 0.25],
          ["Wenigumstadt", 104, 14.4, 5.8, 0.91],
          ["Unterigling", 138, 5.1, 0.0, 1.09],
          ["Messene", 28, 3.6, 3.6, 1.9],
          ["Les Rues des Vignes", 67, 14.9, 7.5, 3.83],
          ["Wandignies-Hamage", 44, 38.6, 25.0, 8.24] ] },
      { p: "High medieval", n: 742, k: 233, pct: 31.4, ci: [28.2, 34.8], std: 31.5, slope: -1.72, meanAge: 38.4, comp: [68.6, 24.4, 7.0], compN: [509, 181, 52], sitesAll: 12,
        cells: [["18–24", 74, 29, 39.2, 7.79, 2.91], ["25–29", 106, 34, 32.1, 0.67, 1.88], ["30–34", 105, 31, 29.5, -1.88, 1.02], ["35–39", 118, 41, 34.7, 3.34, 0.16], ["40–44", 101, 25, 24.8, -6.65, -0.7], ["45–49", 81, 24, 29.6, -1.77, -1.56], ["50–59", 131, 41, 31.3, -0.1, -2.85], ["60+", 26, 8, 30.8, -0.63, -4.57]],
        sites: [
          ["Kriveiskiskis", 66, 30.3, 7.6, -15.25],
          ["Schleswig", 86, 25.6, 0.0, -7.93],
          ["Kaldus", 186, 34.4, 5.9, -5.01],
          ["Kiev-Patorzhinskogo", 23, 78.3, 30.4, -4.46],
          ["Boksto", 17, 58.8, 5.9, -4.0],
          ["Sigtuna", 158, 12.7, 2.5, -2.96],
          ["Poznan-Srodka", 20, 60.0, 15.0, -2.79],
          ["Nagylak Hatarsav", 86, 10.5, 1.2, -0.02],
          ["Basel (Barfusserkirche?)", 95, 57.9, 18.9, 3.58] ] },
      { p: "Late medieval", n: 580, k: 213, pct: 36.7, ci: [32.9, 40.7], std: 36.6, slope: -3.09, meanAge: 39.1, comp: [63.3, 24.7, 12.1], compN: [367, 143, 70], sitesAll: 17,
        cells: [["18–24", 69, 34, 49.3, 12.55, 5.46], ["25–29", 60, 20, 33.3, -3.39, 3.6], ["30–34", 89, 42, 47.2, 10.47, 2.06], ["35–39", 74, 14, 18.9, -17.81, 0.51], ["40–44", 94, 35, 37.2, 0.51, -1.04], ["45–49", 66, 17, 25.8, -10.97, -2.59], ["50–59", 91, 38, 41.8, 5.03, -4.91], ["60+", 37, 13, 35.1, -1.59, -8.0]],
        sites: [
          ["Sao Joao de Almedina", 15, 46.7, 0.0, -14.38],
          ["Dubingiu piliaviete", 27, 22.2, 0.0, -10.41],
          ["Roquetes", 21, 66.7, 4.8, -9.69],
          ["Aguonu", 71, 32.4, 11.3, -8.32],
          ["Alytus", 18, 16.7, 5.6, -7.45],
          ["Cacela Velha", 22, 45.5, 13.6, -6.78],
          ["Kernave", 100, 21.0, 4.0, -6.74],
          ["Convento de Sao Franc.", 34, 2.9, 2.9, -6.24],
          ["Rukliai", 46, 47.8, 15.2, -3.89],
          ["Towton", 25, 68.0, 48.0, -3.61],
          ["Franciscan Friary", 30, 16.7, 3.3, -2.01],
          ["Blackfriars", 31, 80.6, 51.6, 1.91],
          ["Plonkowo", 72, 45.8, 12.5, 2.67],
          ["Latako", 40, 7.5, 5.0, 4.96],
          ["York, Fishergate House", 25, 80.0, 16.0, 5.95] ] },
      { p: "Early modern", n: 1488, k: 561, pct: 37.7, ci: [35.3, 40.2], std: 37.0, slope: -2.38, meanAge: 36.3, comp: [62.3, 26.6, 11.1], compN: [927, 396, 165], sitesAll: 28,
        cells: [["18–24", 268, 122, 45.5, 7.82, 3.53], ["25–29", 248, 92, 37.1, -0.6, 2.1], ["30–34", 222, 83, 37.4, -0.31, 0.91], ["35–39", 167, 57, 34.1, -3.57, -0.28], ["40–44", 166, 74, 44.6, 6.88, -1.47], ["45–49", 139, 32, 23.0, -14.68, -2.66], ["50–59", 199, 75, 37.7, -0.01, -4.45], ["60+", 79, 26, 32.9, -4.79, -6.83]],
        sites: [
          ["Katedra", 17, 41.2, 11.8, -19.23],
          ["Kaminonki Duze", 35, 62.9, 17.1, -13.74],
          ["Santa Clara-a-Velha", 25, 24.0, 20.0, -10.88],
          ["Altdorf", 47, 23.4, 2.1, -10.79],
          ["Convent Agustins", 28, 71.4, 17.9, -10.46],
          ["Bowling Green", 152, 46.1, 9.9, -9.32],
          ["Pasydy", 19, 26.3, 0.0, -8.4],
          ["Selpils", 75, 26.7, 9.3, -7.54],
          ["Siaures miestelis", 211, 35.5, 13.3, -6.06],
          ["Doma Laukums", 89, 18.0, 1.1, -5.89],
          ["Klaipeda", 91, 12.1, 7.7, -5.2],
          ["Mintoritenweg", 164, 32.9, 11.6, -3.81],
          ["St. Peters", 45, 26.7, 4.4, -3.37],
          ["St. Ame", 183, 57.4, 16.9, -2.84],
          ["Subaciaus", 65, 50.8, 7.7, -1.63],
          ["Stajky", 16, 50.0, 25.0, -0.83],
          ["All Saints, Fishergate", 64, 46.9, 6.2, 0.68],
          ["Convento dos Remedios", 15, 53.3, 33.3, 1.27],
          ["Leipalingis", 47, 40.4, 10.6, 2.91],
          ["Pranciskonu", 17, 11.8, 11.8, 3.84],
          ["Constancia", 21, 19.0, 14.3, 4.63],
          ["Bobald-Carei", 19, 36.8, 15.8, 5.02] ] },
      { p: "Industrial", n: 424, k: 199, pct: 46.9, ci: [42.2, 51.7], std: 46.4, slope: 2.79, meanAge: 39.3, comp: [53.1, 19.1, 27.8], compN: [225, 81, 118], sitesAll: 7,
        cells: [["18–24", 75, 34, 45.3, -1.6, -4.96], ["25–29", 34, 13, 38.2, -8.7, -3.29], ["30–34", 34, 14, 41.2, -5.76, -1.89], ["35–39", 60, 24, 40.0, -6.93, -0.5], ["40–44", 61, 31, 50.8, 3.89, 0.9], ["45–49", 46, 23, 50.0, 3.07, 2.29], ["50–59", 91, 48, 52.7, 5.81, 4.38], ["60+", 23, 12, 52.2, 5.24, 7.17]],
        sites: [
          ["St. Martins", 236, 53.4, 32.6, -4.29],
          ["Wolverhampton", 41, 26.8, 0.0, -3.81],
          ["Panevezys", 67, 19.4, 7.5, -2.99],
          ["Bern-Sidlerstrasse", 27, 59.3, 37.0, 5.14],
          ["Bern-Bundesgasse", 44, 70.5, 56.8, 5.7] ] },
    ],
  };
})();

// Human events that bear on stress lines, for the stress-line pop-up's last slide: context, not data. From the team's
// timeline (research/Human Correlations/timeline_events_display.csv): the events whose expected or measured effect
// names hypoplasia (EV014, EV022; the team's list of events to include, #7 and #12). Each event's line was dropped
// 2026-10-08 for what it was and did to people, checked:
//   impact, impactRef  its sources: DeWitte SN, Wood JW (2008), Selectivity of Black Death mortality with respect to
//                   preexisting health, PNAS 105(5):1436-1441 (30-50% of the populations it reached; at East Smithfield,
//                   London, every lesion considered, linear enamel hypoplasia on the canines among them, raised the risk
//                   of death); DeWitte SN (2014), Mortality risk and survival in the aftermath of the medieval Black
//                   Death, PLoS ONE 9(5):e96513 (better survival after it); Davenport RJ, Urbanisation and mortality in
//                   Britain (towns of 2,500 or more, 30% in 1801 to 80% by 1891; tuberculosis and crowded, poorly
//                   ventilated workplaces and homes); The National Archives, Factory Act 1833
//   why             the reasons the record bears it out as it does: the Great Famine, 1315-1322 (Jordan WC, The Great
//                   Famine, Princeton University Press), its crops failing 1315-17 (Davenport, CAMPOP 2024)
(function () {
  "use strict";
  window.LEH_EVENTS = {
    events: [
      { id: "EV014", name: "Black Death", note: "the Black Death", from: 1347, to: 1351,
        img: { src: "img/black-death.jpg", alt: "An etching of the plague in Florence, 1348: a procession with a banner passes the dead and dying in the street", ref: "Luigi Sabatelli the elder, The plague of Florence, 1348, etching. Wellcome Collection, M0000786, public domain." },
        impact: "Plague killed an estimated 30% to 50% of the people in the parts of Europe it reached. In London's East Smithfield plague cemetery, people who already carried signs of earlier ill health, stress lines on the canines among them, were more likely to die. In the generations after, Londoners lived longer than before the plague.",
        impactRef: "DeWitte and Wood 2008, PNAS 105(5); DeWitte 2014, PLoS ONE.",
        why: "The period also takes in the Great Famine of 1315 to 1322, when crops failed three years running across northern Europe. And since plague killed people already marked by stress more readily, it may have taken lines out of the record as well as adding them." },
      { id: "EV022", name: "Industrial urbanisation", note: "industrial urbanisation", from: 1750, to: 1900,
        img: { src: "img/mulberry-street.jpg", alt: "A hand-coloured photograph of a crowded market street in New York around 1900: stalls, carts and families in front of tenements", ref: "Detroit Publishing Co., Mulberry Street, New York City, about 1900. Library of Congress." },
        impact: "People left the land for industrial towns: about 30% of the English lived in towns of 2,500 or more in 1801, over half by 1851 and 80% by 1891. Crowded, poorly ventilated homes and workplaces spread tuberculosis. Children worked in the textile mills; the Factory Act of 1833 barred those under nine and held 9- to 13-year-olds to nine hours a day.",
        impactRef: "Davenport, Cambridge Group for the History of Population; The National Archives, Factory Act 1833." },
    ],
  };
})();
