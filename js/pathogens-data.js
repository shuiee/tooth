/* Pathogens in dental samples per century, for the molar at the centre of the radial (radial.js). Hand-copied.

   Source: shuiee/tooth-untold, data/layers.js (pathogens), at commit 5e341a3, built there from AncientMetagenomeDir
   (SPAAM community, CC-BY 4.0): European dental samples, 100-1800 CE; disease labels from pathogen_reference.csv.
     centuries  the start year of each century with samples (the 800s have none)
     genomes    genomes sequenced per century (the radial's pathogens line counts the same)
     sites      the sites those genomes come from, per century: counted from AncientMetagenomeDir itself (its
                ancientsinglegenome-hostassociated samples table, read 2026-10-08) with the team's selection, European
                teeth and dental calculus, century = floor((1950 - sample_age) / 100) x 100, which gives back the
                genomes above exactly. The index gives sample_age "to the closest century" before 1950 (its schema)
     taxa       each pathogen: its name as the prototype's pathogen strand gave it, its kind (bacteria, virus, parasite;
                "other" is not a disease agent), and per century [genomes it was found in, % of that century's genomes]
     colours    each kind's colour, as on the prototype ("other" in its grey)
     disease    what it causes, as the prototype's data gave it (its labels from pathogen_reference.csv)
     events     the pathogen events (label; note, its name mid-sentence) from the team's "Events To Include" list (#5, #6, #7), as the prototype's pathogen
                strand gave them (app.js, STRAND_CONTEXT): context, not data. from and to are years (the list dates the
                first pandemic 5th to 7th c.; the prototype gives it as the documented 541 to 750); taxa, the organisms
                whose record the event concerns; band, also shaded across the strand. No numbers are kept with them: the
                pop-up reads each organism's share from the counts above. img: its pictures, src, alt text and ref, the line of reference under each (null:
                a placeholder; the team's, from Ali Qureshi's pop-up galleries at d2672c3, cropped to 4:3).
                impact, impactRef: what it did to people, and its source (context, checked 2026-10-08): the first
                pandemic, Mordechai L, Eisenberg M, Newfield TP, Izdebski A, Kay JE, Poinar H (2019), The Justinianic
                Plague: an inconsequential pandemic?, PNAS 116(51):25546-25554 (its abstract and significance
                statement); the Black Death, 30% to 60% of Europe's people, as Wikipedia's Black Death article cites
                Aberth (2010, pp. 9-13) and Alchon (2003, p. 21), to be checked against the books; leprosy, Carole
                Rawcliffe, The Lost Hospitals of London: Leprosaria, Gresham College lecture, 5 March 2012 ("a bare
                minimum of 300 hospitals and refuges were set up in England" between the late 11th century and 1350).
                dating: where the record's dates and the event's part, why (from the index, above): the 19 plague
                genomes of the 400s are all listed at 1500 BP (Keller 2019, 17; Feldman 2016 and Guellil 2022, one
                each), studies of the first pandemic's burials, so the rounding places them before 541.

   How the molar draws it (radial.js, pathogenCounts()): the % is how often a pathogen turns up among the genomes
   recovered, not how common the disease was (counts are not prevalence). Each pathogen adds particles to its kind's
   stream, as many as its % of that century's genomes (one per 2.5%, at least one where it was found). Each kind (in
   its colour) has its own route: in from below the tooth to a root tip, up its own strand of the canal, to its own
   pulp horn; the particles follow one another evenly, so a denser stream is a larger share. */
(function () {
  "use strict";
  window.PATHOGENS_DATA = {
    centuries: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800],
    genomes: { 100: 3, 200: 2, 300: 3, 400: 22, 500: 5, 600: 20, 700: 11, 900: 14, 1000: 7, 1100: 10, 1200: 11, 1300: 51, 1400: 9, 1500: 54, 1600: 22, 1700: 13, 1800: 10 },
    sites: { 100: 3, 200: 2, 300: 2, 400: 9, 500: 4, 600: 8, 700: 5, 900: 12, 1000: 7, 1100: 9, 1200: 8, 1300: 27, 1400: 6, 1500: 20, 1600: 11, 1700: 7, 1800: 4 },
    taxa: [
      { taxon: "Salmonella enterica", name: "enteric fever", kind: "bacteria", total: 14, disease: "enteric fever · typhoid & paratyphoid", cells: { 100: [1, 33.33], 1100: [1, 10.0], 1300: [8, 15.69], 1800: [4, 40.0] } },
      { taxon: "Plasmodium falciparum", name: "falciparum malaria", kind: "parasite", total: 10, disease: "malaria", cells: { 100: [2, 66.67], 200: [1, 50.0], 1100: [1, 10.0], 1300: [1, 1.96], 1500: [3, 5.56], 1700: [1, 7.69], 1800: [1, 10.0] } },
      { taxon: "Tannerella forsythia", name: "gum-disease bacterium", kind: "other", total: 2, disease: "NOT an epidemic disease — gum disease", cells: { 200: [1, 50.0], 1000: [1, 14.29] } },
      { taxon: "Yersinia pestis", name: "plague", kind: "bacteria", total: 143, disease: "plague — bubonic, pneumonic, septicaemic", cells: { 300: [2, 66.67], 400: [19, 86.36], 500: [2, 40.0], 600: [12, 60.0], 1100: [1, 10.0], 1200: [3, 27.27], 1300: [35, 68.63], 1400: [3, 33.33], 1500: [39, 72.22], 1600: [17, 77.27], 1700: [10, 76.92] } },
      { taxon: "Human alphaherpesvirus 1", name: "oral herpes", kind: "virus", total: 4, disease: "oral herpes", cells: { 300: [1, 33.33], 400: [1, 4.55], 1300: [1, 1.96], 1600: [1, 4.55] } },
      { taxon: "Hepatitis B virus", name: "hepatitis B", kind: "virus", total: 14, disease: "hepatitis B", cells: { 400: [1, 4.55], 600: [2, 10.0], 700: [2, 18.18], 1000: [1, 14.29], 1100: [3, 30.0], 1200: [2, 18.18], 1300: [3, 5.88] } },
      { taxon: "Haemophilus influenzae", name: "H. influenzae", kind: "bacteria", total: 1, disease: "pneumonia, meningitis", cells: { 400: [1, 4.55] } },
      { taxon: "Mycobacterium leprae", name: "leprosy", kind: "bacteria", total: 21, disease: "leprosy", cells: { 500: [1, 20.0], 900: [1, 7.14], 1000: [3, 42.86], 1100: [2, 20.0], 1200: [6, 54.55], 1300: [3, 5.88], 1400: [4, 44.44], 1800: [1, 10.0] } },
      { taxon: "Clostridium tetani", name: "tetanus", kind: "bacteria", total: 11, disease: "tetanus", cells: { 500: [1, 20.0], 600: [3, 15.0], 700: [2, 18.18], 900: [3, 21.43], 1600: [1, 4.55], 1700: [1, 7.69] } },
      { taxon: "Plasmodium vivax", name: "vivax malaria", kind: "parasite", total: 10, disease: "malaria", cells: { 500: [1, 20.0], 1000: [1, 14.29], 1100: [2, 20.0], 1400: [1, 11.11], 1500: [3, 5.56], 1600: [1, 4.55], 1700: [1, 7.69] } },
      { taxon: "Variola virus", name: "smallpox", kind: "virus", total: 12, disease: "smallpox", cells: { 600: [2, 10.0], 700: [1, 9.09], 900: [8, 57.14], 1800: [1, 10.0] } },
      { taxon: "Methanobrevibacter oralis", name: "oral archaeon", kind: "other", total: 1, disease: "NOT a disease — oral archaeon", cells: { 600: [1, 5.0] } },
      { taxon: "Parvovirus B19", name: "parvovirus B19", kind: "virus", total: 5, disease: "fifth disease (erythema infectiosum)", cells: { 700: [1, 9.09], 900: [2, 14.29], 1000: [1, 14.29], 1400: [1, 11.11] } },
      { taxon: "Streptococcus pneumoniae", name: "pneumococcus", kind: "bacteria", total: 2, disease: "pneumonia, meningitis", cells: { 700: [2, 18.18] } },
      { taxon: "Erysipelothrix rhusiopathiae", name: "erysipeloid", kind: "bacteria", total: 2, disease: "erysipeloid — a zoonosis of animal handling", cells: { 700: [2, 18.18] } },
      { taxon: "Borrelia recurrentis", name: "relapsing fever", kind: "bacteria", total: 4, disease: "louse-borne relapsing fever", cells: { 1500: [2, 3.7], 1800: [2, 20.0] } },
      { taxon: "Plasmodium malariae", name: "quartan malaria", kind: "parasite", total: 4, disease: "malaria", cells: { 1500: [2, 3.7], 1600: [1, 4.55], 1800: [1, 10.0] } },
      { taxon: "Treponema pallidum", name: "treponemal disease", kind: "bacteria", total: 3, disease: "syphilis · yaws · bejel (by subspecies)", cells: { 1500: [2, 3.7], 1600: [1, 4.55] } },
    ],
    colours: { bacteria: "#b0362f", virus: "#2f55b0", parasite: "#16907a", other: "#8a8983" },
    events: [
      { label: "First plague pandemic", note: "the first plague pandemic", short: "Plague pandemic", from: 541, to: 750, taxa: ["Yersinia pestis"], band: true,
        impact: "Plague returned in waves around the Mediterranean and across Europe for two centuries. Older estimates put its deaths in the tens of millions, a quarter to a half of the Mediterranean's people; a 2019 review of the written, archaeological and environmental evidence found that it does not support tolls that high.",
        impactRef: "Mordechai et al. 2019, PNAS 116(51).",
        dating: "Its dates are also coarse: the index gives each sample's age to the nearest century, so the 19 plague genomes from the pandemic's burials are listed at about 450 CE, before its documented start in 541, and are counted in the 400s.",
        img: { src: "img/plague-541-engraving.jpg", alt: "A modern illustration in the style of an engraving: plague dead in a city street, 541 CE",
          ref: "Modern illustration in the style of an engraving. Source to be confirmed." } },
      { label: "Black Death", note: "the Black Death", short: "Black Death", from: 1347, to: 1351, taxa: ["Yersinia pestis"], band: true,
        impact: "Plague spread across Europe within five years and killed an estimated 30% to 60% of its people.",
        impactRef: "Estimates from Aberth 2010 and Alchon 2003.",
        img: { src: "img/black-death.jpg", alt: "An etching of the plague in Florence, 1348: a procession with a banner passes the dead and dying in the street",
          ref: "Luigi Sabatelli the elder, The plague of Florence, 1348, etching. Wellcome Collection, M0000786, public domain." } },
      { label: "Medieval leprosy", note: "the years of medieval leprosy", short: "Medieval leprosy", from: 1000, to: 1400, taxa: ["Mycobacterium leprae"],
        impact: "Communities set up hospitals and refuges for people with leprosy: between the late 11th century and 1350, at least 300 were founded in England alone.",
        impactRef: "Rawcliffe 2012, Gresham College lecture.",
        img: { src: "img/medieval-leprosy.jpg", alt: "An illuminated manuscript painting: a haloed friar and his brothers tending sick people covered in sores",
          ref: "Illuminated manuscript, 15th century. Source to be confirmed." } },
    ],
    kinds: [["bacteria", "Bacteria"], ["virus", "Viruses"], ["parasite", "Parasites"], ["other", "Not disease agents"]],
  };
})();
