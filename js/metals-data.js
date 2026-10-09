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
     leadRange  lead, lowest to highest individual, per period (Montgomery et al. 2010, Table 11.4, the British periods;
              Kamenov et al. 2018, Table 1, the 20th century)
     modernRange  the other elements in 20th-century births, lowest to highest (Kamenov et al. 2018, Table 1); null where
              the lowest was below detection; none given for magnesium
     pooledN  the archaeological teeth the pooled values come from (Kamenov et al. 2018: Florida, the Philippines, Peru)
     periodColours  each period's colour on the prototype's radial chart (its petals), a drawing choice, not data
     colours  each element's colour, as the prototype's radial chart and grain used them
     groups   not industrial (zinc, barium, strontium, magnesium: part of enamel itself) and industrial (lead, copper,
              chromium, nickel), as the prototype's Metals plate groups them (metals.js, NONIND)
     groupColours  the two groups' colours on the streams: the Metals line's gold, and a violet no other record uses
     events   human events for the metals pop-up's third slide (context, not data): the team's list of events to include
              (#1, #4, #10, 2026-10-07; its events list, timeline_events_display.csv, has them as EV017, EV018, EV020).
              name, note (mid-sentence), when (the years shown); periods: the exposure windows it is shown on (these
              overlap, so they are named, not matched by date); img: its picture (src, alt, ref; null: a placeholder);
              change: what its figure compares, read from the values above (lead: one period's median against
              another's, and expect, the way the historical record says it went; modern: the 20th-century values
              against the archaeological ones).
              impact, impactRef: what the event was and did to people, and its sources (context, checked 2026-10-08):
              Montgomery et al. 2010 (the uses of lead in Roman Britain, its mines by the 70s CE, the Romans' knowledge
              that its fumes harmed health; its smelting after Rome on a far smaller scale, Roman lead possibly
              recycled; lead pollution's rise through the second millennium CE, peaking in the 20th century); Historic
              England, What happened after the end of Roman rule in Britain?, Heritage Calling, 28 November 2024 (direct
              rule ended in 410; town life fell apart within a couple of generations, villas were abandoned, the
              wheel-thrown pottery industry stopped); McConnell JR et al. (2018), Lead pollution recorded in Greenland
              ice indicates European emissions tracked plagues, wars, and imperial expansion during antiquity, PNAS
              115(22):5726-5731 (emissions "plunged coincident with two major plagues in the second and third
              centuries, remaining low for >500 years"); Encyclopaedia Britannica, Industrial Revolution (the change
              from an agrarian, handicraft economy to one dominated by industry and machine manufacture, beginning in
              Britain in the 18th century); UNEP, Era of leaded petrol over, 30 August 2021 (tetraethyl lead in petrol
              since 1922, the last country to stop, Algeria, in July 2021; it contaminated air, dust, soil, drinking
              water and food crops, and harms children's developing brains).
              why: the reason the enamel bears it out as it does, for the slide's ruled line (popup-content.js metRead)
     modernFrom  where the 20th-century teeth come from (Kamenov et al. 2018, Materials and methods: "individuals from
              Europe, North America, Central America, South America, Caribbean, and Africa", n = 77)

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
    leadRange: [[0.03, 0.68], [0.003, 0.13], [0.04, 0.15], [0.24, 30.1], [0.13, 8.16], [0.03, 31.6], [0.02, 14.5], [0.04, 45.5]],
    pooled: { Cu: 0.25, Cr: 0.072, Ni: 0.24, Zn: 145, Ba: 3.2, Sr: 188, Mg: 2430 },
    modern: { Cu: 3.6, Cr: 0.8, Ni: 2.2, Zn: 215, Ba: 4.6, Sr: 168, Mg: 3075 },
    modernRange: { Cu: [0.01, 32.9], Cr: [null, 10.3], Ni: [0.11, 36.5], Zn: [80.4, 474], Ba: [0.52, 31.3], Sr: [58, 1344] },
    pooledN: 38,
    periodColours: ["#9a8fbf", "#8a78c4", "#7a63c9", "#3f72c4", "#3c9a6e", "#d4a21f", "#d0612b", "#b0362f"],
    elements: [["Pb", "lead"], ["Cu", "copper"], ["Cr", "chromium"], ["Ni", "nickel"], ["Zn", "zinc"], ["Ba", "barium"], ["Sr", "strontium"], ["Mg", "magnesium"]],
    colours: { Pb: "#c62828", Cu: "#e5780e", Cr: "#b89a00", Ni: "#2f9a3a", Zn: "#0aa1b0", Ba: "#2f5fd8", Sr: "#8a4fd6", Mg: "#d4439a" },
    groups: { nonindustrial: ["Zn", "Ba", "Sr", "Mg"], industrial: ["Pb", "Cu", "Cr", "Ni"] },
    groupColours: { nonindustrial: "#A67C00", industrial: "#6A3FA0" },
    events: [
      { name: "Roman imperial plumbing", note: "Roman imperial plumbing", when: "1st–4th centuries CE", periods: ["Roman"],
        img: { src: "img/roman-bath-ruins.jpg", alt: "A painting of a ruined Roman bath, with women washing linen in the water channel",
               ref: "Hubert Robert, Ruins of a Roman Bath with Washerwomen, after 1766. Philadelphia Museum of Art." },
        change: { lead: ["Iron Age", "Roman"], expect: "rise" },
        impact: "Britain was one of the Roman Empire's main sources of lead, mined on a large scale in the Mendips, Flintshire and Derbyshire by the 70s CE. Romans carried water in lead pipes, cooked in lead pans, and used lead compounds to sweeten and preserve wine and food, and in medicines, pottery glazes and cosmetics, though they knew that lead fumes harmed health.",
        impactRef: "Montgomery et al. 2010.",
        why: "Britain had used lead since the Bronze Age without its children's lead rising; Montgomery and colleagues trace the rise to lead in food and drink, from pipes, pans and sweeteners." },
      { name: "Collapse of the Roman economy", note: "the collapse of the Roman economy", when: "360–675 CE", periods: ["Post-Roman"],
        img: { src: "img/plague-of-ashdod.jpg", alt: "A painting of plague in an ancient city: the dead and dying in a street of classical buildings",
               ref: "Nicolas Poussin, The Plague of Ashdod, 1630–31. Musée du Louvre, Paris." },
        change: { lead: ["Roman", "Post-Roman"], expect: "fall" },
        impact: "Direct Roman rule in Britain ended in 410 CE. Within a couple of generations town life fell apart, villas were abandoned and the pottery industry stopped. Europe's lead pollution, recorded in Greenland ice, had already plunged at the time of two great epidemics in the 2nd and 3rd centuries, and it stayed low for more than 500 years.",
        impactRef: "Historic England 2024; McConnell et al. 2018, PNAS 115(22).",
        why: "Montgomery and colleagues suggest that Roman lead stayed in use and was recycled, while far less new ore was smelted." },
      { name: "Industrial Revolution", note: "the industrial era that began with the Industrial Revolution", when: "from about 1760", periods: ["20th century"],
        img: { src: "img/bottle-kilns.jpg", alt: "A black-and-white photograph of a smoky industrial town: bottle kilns and chimneys above rows of terraced houses",
               ref: "Bottle kilns, Stoke-on-Trent. Photograph, Unsplash+." },
        change: { modern: true },
        impact: "Beginning in Britain in the 18th century, the Industrial Revolution turned an economy of farming and handicrafts into one of industry and machine manufacture, and spread to much of the world. Mines, smelters and coal-burning factories multiplied, and people moved from the land into the growing industrial towns. From 1922, lead was added to petrol: its exhaust contaminated air, dust, soil, water and crops, and it harms children's developing brains. The last country to stop selling it did so in 2021.",
        impactRef: "Britannica, Industrial Revolution; UNEP 2021.",
        why: "Lead pollution in Europe rose through the second millennium CE and peaked in the 20th century (Montgomery et al. 2010), so much of the rise came before factories." },
    ],
    modernFrom: "Europe, the Americas, the Caribbean and Africa",
  };
})();
