/* Pathogens in dental samples per century, for the molar at the centre of the radial (radial.js). Hand-copied.

   Source: shuiee/tooth-untold, data/layers.js (pathogens), at commit 5e341a3, built there from AncientMetagenomeDir
   (SPAAM community, CC-BY 4.0): European dental samples, 100-1800 CE; disease labels from pathogen_reference.csv.
     centuries  the start year of each century with samples (the 800s have none)
     genomes    genomes sequenced per century (the radial's pathogens line counts the same)
     taxa       each pathogen: its name as the prototype's pathogen strand gave it, its kind (bacteria, virus, parasite;
                "other" is not a disease agent), and per century [genomes it was found in, % of that century's genomes]
     colours    each kind's colour, as on the prototype ("other" in its grey)

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
    taxa: [
      { taxon: "Salmonella enterica", name: "enteric fever", kind: "bacteria", total: 14, cells: { 100: [1, 33.33], 1100: [1, 10.0], 1300: [8, 15.69], 1800: [4, 40.0] } },
      { taxon: "Plasmodium falciparum", name: "falciparum malaria", kind: "parasite", total: 10, cells: { 100: [2, 66.67], 200: [1, 50.0], 1100: [1, 10.0], 1300: [1, 1.96], 1500: [3, 5.56], 1700: [1, 7.69], 1800: [1, 10.0] } },
      { taxon: "Tannerella forsythia", name: "gum-disease bacterium", kind: "other", total: 2, cells: { 200: [1, 50.0], 1000: [1, 14.29] } },
      { taxon: "Yersinia pestis", name: "plague", kind: "bacteria", total: 143, cells: { 300: [2, 66.67], 400: [19, 86.36], 500: [2, 40.0], 600: [12, 60.0], 1100: [1, 10.0], 1200: [3, 27.27], 1300: [35, 68.63], 1400: [3, 33.33], 1500: [39, 72.22], 1600: [17, 77.27], 1700: [10, 76.92] } },
      { taxon: "Human alphaherpesvirus 1", name: "oral herpes", kind: "virus", total: 4, cells: { 300: [1, 33.33], 400: [1, 4.55], 1300: [1, 1.96], 1600: [1, 4.55] } },
      { taxon: "Hepatitis B virus", name: "hepatitis B", kind: "virus", total: 14, cells: { 400: [1, 4.55], 600: [2, 10.0], 700: [2, 18.18], 1000: [1, 14.29], 1100: [3, 30.0], 1200: [2, 18.18], 1300: [3, 5.88] } },
      { taxon: "Haemophilus influenzae", name: "H. influenzae", kind: "bacteria", total: 1, cells: { 400: [1, 4.55] } },
      { taxon: "Mycobacterium leprae", name: "leprosy", kind: "bacteria", total: 21, cells: { 500: [1, 20.0], 900: [1, 7.14], 1000: [3, 42.86], 1100: [2, 20.0], 1200: [6, 54.55], 1300: [3, 5.88], 1400: [4, 44.44], 1800: [1, 10.0] } },
      { taxon: "Clostridium tetani", name: "tetanus", kind: "bacteria", total: 11, cells: { 500: [1, 20.0], 600: [3, 15.0], 700: [2, 18.18], 900: [3, 21.43], 1600: [1, 4.55], 1700: [1, 7.69] } },
      { taxon: "Plasmodium vivax", name: "vivax malaria", kind: "parasite", total: 10, cells: { 500: [1, 20.0], 1000: [1, 14.29], 1100: [2, 20.0], 1400: [1, 11.11], 1500: [3, 5.56], 1600: [1, 4.55], 1700: [1, 7.69] } },
      { taxon: "Variola virus", name: "smallpox", kind: "virus", total: 12, cells: { 600: [2, 10.0], 700: [1, 9.09], 900: [8, 57.14], 1800: [1, 10.0] } },
      { taxon: "Methanobrevibacter oralis", name: "oral archaeon", kind: "other", total: 1, cells: { 600: [1, 5.0] } },
      { taxon: "Parvovirus B19", name: "parvovirus B19", kind: "virus", total: 5, cells: { 700: [1, 9.09], 900: [2, 14.29], 1000: [1, 14.29], 1400: [1, 11.11] } },
      { taxon: "Streptococcus pneumoniae", name: "pneumococcus", kind: "bacteria", total: 2, cells: { 700: [2, 18.18] } },
      { taxon: "Erysipelothrix rhusiopathiae", name: "erysipeloid", kind: "bacteria", total: 2, cells: { 700: [2, 18.18] } },
      { taxon: "Borrelia recurrentis", name: "relapsing fever", kind: "bacteria", total: 4, cells: { 1500: [2, 3.7], 1800: [2, 20.0] } },
      { taxon: "Plasmodium malariae", name: "quartan malaria", kind: "parasite", total: 4, cells: { 1500: [2, 3.7], 1600: [1, 4.55], 1800: [1, 10.0] } },
      { taxon: "Treponema pallidum", name: "treponemal disease", kind: "bacteria", total: 3, cells: { 1500: [2, 3.7], 1600: [1, 4.55] } },
    ],
    colours: { bacteria: "#b0362f", virus: "#2f55b0", parasite: "#16907a", other: "#8a8983" },
    kinds: [["bacteria", "Bacteria"], ["virus", "Viruses"], ["parasite", "Parasites"], ["other", "Not disease agents"]],
  };
})();
