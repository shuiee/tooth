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

// Human events that bear on tooth repair, for the pop-up's last slide: context, not data. The team's list of events to
// include (2026-10-07: #13, #15, #16, #17), with their years from the team's timeline (research/Human Correlations/
// timeline_events_display.csv in the prototype: EV031, EV032, EV033, EV034), placed on the periods they apply to. An
// event shows on a period its years overlap; fluoride (1945 to 1975) is placed on the 2009 survey by name (sites), since
// it shaped the decay of the adults examined then and overlaps no sample's years. #3 (Etruscan gold teeth, EV025, 700
// to 200 BCE) and #2 (Roman dentistry, EV026, 1 to 200 CE) come before every sample here and are not shown. Each
// event's line (the team's framing) was dropped 2026-10-08 for what it was and did to people, checked; each effect is
// from the timeline's measured column, or, where it has none, read from the sample's own counts above.
//   id, name, from, to  the event and its years; note, its name mid-sentence
//   sites               for an event placed by name: the samples (site) it shows on
//   impact, impactRef   what it was and did to people, and its sources (checked 2026-10-08): Bharti R et al. (2010),
//                       Dental amalgam: an update, J Conserv Dent 13(4):204-208 (Taveau's silver paste, 1826; the
//                       Crawcours in America, 1833; the American Society of Dental Surgeons, 1845: its use "considered as
//                       a malpractice"); Hyson JM (2006), J Calif Dent Assoc 34(3) (gold foil "the ultimate restorative
//                       material"); London Museum, Testy teeth: dental interventions in 19th-century London (extraction
//                       the only treatment for the poor, "if affordable"); Museum of English Rural Life, tooth extractor
//                       ("proper dentistry only started to become widely available to the poor from the late 19th
//                       century"); CDC, Timeline for community water fluoridation (Grand Rapids, 1945); Hansard, 26 November
//                       1962 (British trials from 1955); Public Health England, Water fluoridation health monitoring report
//                       for England 2014 (Birmingham, 1964, the first substantive scheme); Goodwin M et al. (2016), BMC
//                       Oral Health 16:8 (fluoride toothpaste from the 1970s); Delivering better oral health, chapter 9
//                       (the fall in decay "largely attributed to the daily use of fluoride toothpaste"); Adult Dental
//                       Health Survey 2009, executive summary (HSCIC 2011: 97% of dentate adults 45 to 54 with a filled
//                       tooth, 9.1 on average; under 45s less likely to have any; no natural teeth, England, 28% in 1978 to
//                       6% in 2009; England, Wales and Northern Ireland); The National Archives, The foundation of the NHS
//                       (the 1948 leaflet: all dental care, "no charges"); Nuffield Trust, NHS reform timeline (1951
//                       charges, chiefly dentures); Hansard, 27 March 1952 (a charge for treatment)
//   effect              what the record shows of it (the timeline's measured column); none: the sample's counts
//   read                how the record bears it out: k (yes agrees, part partly agrees, no contradicts the historical
//                       record) and text (the reasons): Middenbeemster a rural, agricultural
//                       village (Waters-Rist AL, Hoogland MLP 2013, Int J Paleopathol 3), centred on cattle farming
//                       (Vikatou I et al. 2017), its excavated burials of about 1829 to the 1860s (Leiden University);
//                       the survey's figures as above; the samples' rates from INTERVENTIONS_DATA
//   img                 its picture (src, alt, ref), or null for a placeholder; from the team's earlier galleries (d2672c3)
(function () {
  "use strict";
  window.INTERVENTIONS_EVENTS = {
    events: [
      { id: "EV031", name: "Dental amalgam", note: "the spread of dental amalgam", from: 1826, to: 1900,
        img: { src: "img/amalgam-fillings.jpg", alt: "Two molars with large amalgam fillings", ref: "Clinical photograph. Source to be confirmed." },
        impact: "Silver amalgam, filings of silver coin mixed with mercury, was described in France in 1826 and sold in America from 1833. It was cheaper and easier to use than gold foil, the finest filling of the day, but dentists fought over it: in 1845 the American Society of Dental Surgeons called its use malpractice. For most poor people a rotten tooth could only be pulled, if they could pay for that; proper dentistry reached them from the late 19th century.",
        impactRef: "Bharti et al. 2010, J Conserv Dent; Hyson 2006; London Museum; Museum of English Rural Life.",
        read: { k: "no",
          text: "Amalgam was spreading through these years, yet none of Middenbeemster's people had a filling. It was a rural village that lived by cattle farming, and its excavated burials date from about 1829 to the 1860s, before proper dentistry reached most poor and rural people." } },
      { id: "EV032", name: "Fluoride", note: "the spread of fluoride", from: 1945, to: 1975, sites: ["England"],
        img: { src: "img/tap-water.jpg", alt: "A glass being filled with tap water", ref: "Photograph. Source to be confirmed." },
        impact: "In 1945 Grand Rapids, Michigan, became the first city to add fluoride to its water. Britain trialled it from 1955 and began its first full scheme, in Birmingham, in 1964. Fluoride toothpaste spread from the 1970s, and the fall in tooth decay since is largely put down to it.",
        impactRef: "CDC; Hansard 1962; Public Health England 2014; Goodwin et al. 2016; Delivering better oral health.",
        effect: "In the 2009 survey, adults under 45, who grew up after fluoride toothpaste spread, were less likely to have any fillings, and those who had them had fewer.",
        read: { k: "part",
          text: "Fluoride leaves no mark of its own on a tooth: it shows only as decay that did not happen, so the survey cannot see it directly. Fewer fillings among the young are what it would predict, but better diet and dental care would do the same." } },
      { id: "EV033", name: "The cohort effect", note: "the cohort effect in fillings", from: 1978, to: 2009,
        img: { src: "img/schoolchildren.jpg", alt: "Schoolchildren with backpacks and face masks walking with an adult", ref: "Photograph. Source to be confirmed." },
        impact: "People who grew up when decay was common carry it for life as fillings: in 2009, 97% of adults aged 45 to 54 with teeth had a filled tooth, 9.1 on average, while adults under 45 were less likely to have any. People also kept their teeth: in England the share of adults with no natural teeth fell from 28% in 1978 to 6% in 2009.",
        impactRef: "Adult Dental Health Survey 2009.",
        effect: "Mean filled teeth per adult fell from 8.1 to 6.8 across all ages and from 7.8 to 1.7 at 16 to 24, and rose from 4.9 to 10.2 at 55 to 64.",
        read: { k: "yes",
          text: "Between 1978 and 2009 fillings fell among young adults and rose among older ones, so a mouth's fillings in 2009 say when its owner grew up, and the dental care of those years." } },
      { id: "EV034", name: "Intervention becomes near-universal", note: "intervention becoming near-universal", from: 2009, to: 2009,
        img: { src: "img/amalgam-molars.jpg", alt: "Illustration of a row of molars with amalgam fillings", ref: "Illustration. Source to be confirmed." },
        impact: "Dental care was free for everyone when the NHS began in 1948; charges followed for dentures in 1951 and for treatment in 1952. By 2009 most adults had had at least one tooth filled.",
        impactRef: "The National Archives, The foundation of the NHS; Nuffield Trust; Hansard 1952.",
        effect: "84% of the 6,470 adults examined had fillings, against 0.49%, 1.00% and 0.44% of people with any dental work in the three archaeological samples. Not the same measure: buried people screened for any dental work, living adults examined for fillings.",
        read: { k: "yes",
          text: "Repair went from almost no one to most people: 670 repaired teeth per 100 people, against at most 3.6 in the archaeological samples. Even if 99% of old repairs had gone unseen, the archaeological rates would stay below 2009's." } },
    ],
  };
})();
