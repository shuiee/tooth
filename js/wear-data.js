/* Molar wear per period and age at death, for the molar at the centre of the radial (radial.js). Hand-copied.

   Source: shuiee/tooth-untold, data/layers.js, morphology.wear (build_layers.py), at commit 5e341a3. It is computed
   from the Global History of Health Project, European module (ghhp_dental_decoded.csv) exactly as the team's figure
   script does (figure scripts/c6_wear_leh.py): rows with consistent counts and observed dentition, adults 18-69, the
   mean of molar_wear_mean per period and age band. It matches the team's c6 wear figure cell for cell.
     ages     the age bands at death
     cells    per period, per age band: [mean molar wear on the Smith (1984) scale, 1 unworn to 8, adults]
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
  };
})();
