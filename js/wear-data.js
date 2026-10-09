/* Molar wear per period and age at death, for the molar at the centre of the radial (radial.js). Hand-copied.

   Source: shuiee/tooth-untold, data/layers.js, morphology.wear (build_layers.py), at commit 5e341a3. It is computed
   from the Global History of Health Project, European module (ghhp_dental_decoded.csv) exactly as the team's figure
   script does (figure scripts/c6_wear_leh.py): rows with consistent counts and observed dentition, adults 18-69, the
   mean of molar_wear_mean per period and age band. It matches the team's c6 wear figure cell for cell.
     ages     the age bands at death
     cells    per period, per age band: [mean molar wear on the Smith (1984) scale, 1 unworn to 8, adults]
     pooled   per period, over every age: [mean molar wear, adults] (morphology.eras: wear, wear_n)
     smith    the eight stages of the Smith (1984) scale as the GHHP codebook words them ("Codes for molar wear",
              after Smith 1984, Figure 7), for the pop-up's diagram (js/popup-content.js)
   The six periods are the radial's GHHP_PERIODS, in the same order.

   How the molar draws it (radial.js, wearShare()), as on the prototype's Wear and LEH plate:
     a period's wear is the lifetime of wear its adults reached: the age bands in order, each at least the band
     before (wear cannot be undone), the last band's value (the prototype's strataOf()). The molar loses that
     much of its crown's height on an expanded scale, 17% at Smith stage 3.8 to 57% at 5.8 (0.12 + 0.48 x
     (stage - 3.5) / 2.5 of the crown's height), because the six periods sit between 3.78 and 5.84; the scale
     magnifies every difference about 2.4 times against the prototype's (stage - 1) / 7 x 55%. The crown above that
     height is drawn as lost: its points rise above the tooth as a separate cloud, the worn-away volume. */
(function () {
  "use strict";
  window.WEAR_DATA = {
    ages: ["18–24", "25–29", "30–34", "35–39", "40–44", "45–49", "50–59", "60+"],
    periods: [
      { p: "Pre-medieval",   cells: { "18–24": [3.063, 65], "25–29": [3.394, 76], "30–34": [4.075, 82], "35–39": [4.189, 92], "40–44": [4.501, 74], "45–49": [5.061, 78], "50–59": [5.063, 77], "60+": [5.583, 28] } },
      { p: "Early medieval", cells: { "18–24": [3.03, 198], "25–29": [3.427, 157], "30–34": [3.956, 193], "35–39": [4.507, 236], "40–44": [5.133, 286], "45–49": [5.247, 273], "50–59": [5.474, 412], "60+": [5.633, 170] } },
      { p: "High medieval",  cells: { "18–24": [2.819, 79], "25–29": [3.451, 121], "30–34": [3.925, 126], "35–39": [4.492, 134], "40–44": [4.679, 123], "45–49": [4.753, 90], "50–59": [5.564, 145], "60+": [5.843, 29] } },
      { p: "Late medieval",  cells: { "18–24": [2.834, 102], "25–29": [3.368, 86], "30–34": [3.989, 132], "35–39": [4.238, 111], "40–44": [4.664, 130], "45–49": [4.442, 113], "50–59": [4.7, 140], "60+": [4.696, 74] } },
      { p: "Early modern",   cells: { "18–24": [2.526, 277], "25–29": [2.885, 276], "30–34": [3.289, 247], "35–39": [3.667, 181], "40–44": [4.128, 196], "45–49": [4.339, 155], "50–59": [4.638, 227], "60+": [4.982, 80] } },
      { p: "Industrial",     cells: { "18–24": [2.191, 49], "25–29": [2.09, 30], "30–34": [2.676, 25], "35–39": [3.063, 36], "40–44": [3.268, 26], "45–49": [3.23, 16], "50–59": [3.776, 37], "60+": [3.509, 9] } },
    ],
    pooled: [   // in the periods' order
      [4.28, 572],
      [4.72, 1925],
      [4.39, 847],
      [4.15, 888],
      [3.6, 1639],
      [2.87, 228],
    ],
    smith: [
      "Unworn to polished or small facets (no dentin exposure)",
      "Blunting of cusps; may show pinpoint exposures on cusps",
      "Full cusp removal with some dentin exposure",
      "Several large dentin exposures but no coalescence of dentin patches",
      "Two dentinal patches have coalesced",
      "Three or four dentinal patches have coalesced with an island of enamel",
      "Dentin exposure on entire occlusal surface, but with enamel rim retained intact or nearly so",
      "Severe loss of crown height, incomplete enamel rim, crown surface shape similar to root shape",
    ],
  };
})();

// Human events that bear on molar wear, for the wear pop-up's last slide (js/popup-content.js): context, not data. Each
// is from the team's list of events to include (#11 roller mills, #12 industrial urbanisation; 2026-10-07) and its
// timeline (shuiee/tooth-untold, research/Human Correlations/timeline_events_display.csv: EV005, EV022). The timeline's
// water mills, Domesday watermills and windmills (EV002 to EV004) are not on the list. Its heading and line, and each
// event's line, were dropped 2026-10-08 for what the event was and did to people, checked: the timeline's mechanism for
// EV005 (millstones shedding grit into flour) could not be confirmed and is not shown.
//   id, name, from, to  the event and its years; a wear period whose years overlap them shows it
//   note                its name mid-sentence
//   impact, impactRef   what it was and did to people, and its sources (checked 2026-10-08): Davenport RJ, Urbanisation
//                       and mortality in Britain, c.1800-1850 (Cambridge Group for the History of Population and Social
//                       Structure; towns of 2,500 or more: 30% of the English in 1801, over half by 1851, 80% by 1891);
//                       The National Archives, Factory Act 1833 (education resource: no children under nine in textile
//                       mills, nine hours a day at 9 to 13); Mintz SW, Time, Sugar, and Sweetness (tea imports, 167,000
//                       to 23 million pounds over the 18th century); Pallant, The rise and fall of sourdough, Gresham
//                       College 2017 (steel rollers, a Hungarian invention of the 1870s, made fine white flour); Rollinson
//                       2016, Notes and Records of the Royal Society 70:63 (fashion for white flour moved mills to rollers);
//                       Tann J, Jones RG 1996, Technology and Culture 37 (radical change in British milling, 1875-1900)
//   img                 its picture (src, alt, ref), or null for a placeholder
(function () {
  "use strict";
  window.WEAR_EVENTS = {
    events: [
      { id: "EV022", name: "Industrial urbanisation", note: "industrial urbanisation", from: 1750, to: 1900,
        img: { src: "img/mulberry-street.jpg", alt: "A hand-coloured photograph of a crowded market street in New York around 1900: stalls, carts and families in front of tenements", ref: "Detroit Publishing Co., Mulberry Street, New York City, about 1900. Library of Congress." },
        impact: "People left the land for industrial towns: about 30% of the English lived in towns of 2,500 or more in 1801, over half by 1851 and 80% by 1891. Children worked in the textile mills; the Factory Act of 1833 barred those under nine and held 9- to 13-year-olds to nine hours a day. Tea and sugar became everyday food: England's tea imports rose from 167,000 pounds to 23 million over the 18th century.",
        impactRef: "Davenport, Cambridge Group for the History of Population; The National Archives, Factory Act 1833; Mintz." },
      { id: "EV005", name: "Roller mills", note: "roller mills", from: 1870, to: 1890,
        img: { src: "img/cotton-spinner.jpg", alt: "A black-and-white photograph of a young girl at a spinning machine in a cotton mill", ref: "Lewis Hine, a child spinner in a cotton mill, about 1908. Library of Congress." },
        impact: "Steel roller mills, a Hungarian invention of the 1870s, replaced millstones and made fine white flour. The fashion for white flour moved British mills to rollers, and between 1875 and 1900 the country's grain milling changed radically.",
        impactRef: "Pallant 2017, Gresham College; Rollinson 2016; Tann and Jones 1996." },
    ],
  };
})();
