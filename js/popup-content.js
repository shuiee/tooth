/* The pop-ups' content (window.ToothPopup.CONTENT), one function per record, of the period clicked.
   Each returns { lead, body, mount }: a one-line key datapoint, a gallery of tiles (a picture or chart, a chart,
   three KPIs, a source line) and mount(panel), which makes every tile open to the card's full size, with Back and
   arrows to step through the tiles. Every number is read from the data files (js/*-data.js); none is typed here.
   Pictures: img/, each with a one-line caption and source. */
(function () {
  "use strict";
  const P = window.ToothPopup; if (!P) return;
  const esc = v => String(v).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
  const r1 = v => (Math.round(v * 10) / 10).toLocaleString("en-GB");
  const r0 = v => Math.round(v).toLocaleString("en-GB");
  const GREY = "#bdb9b0";

  const IMG = {
    bath: ["img/roman-bath.jpg", "Roman bath ruins with washerwomen", "Hubert Robert, 18th c."],
    ruins: ["img/roman-ruins.jpg", "Roman ruins with the Colosseum", "Hubert Robert, 18th c."],
    ashdod: ["img/plague-ashdod.jpg", "The Plague of Ashdod, painted as plague swept Italy", "Nicolas Poussin, 1630, Louvre"],
    justP: ["img/justinian-painting.jpg", "The Plague of Justinian, Constantinople, 541 CE", "Modern painting"],
    justE: ["img/justinian-engraving.jpg", "Plague dead in the streets, 541 CE", "Engraving-style illustration"],
    sick: ["img/medieval-sick.jpg", "Friars tending the sick in a medieval hospital", "Illuminated manuscript, 15th c."],
    feast: ["img/banquet-still-life.jpg", "A banquet table of sugared sweets", "Flemish still life, early 17th c."],
    sugar: ["img/rock-sugar.jpg", "Refined sugar, cheap and everywhere by the 1800s", "Photograph"],
    kilns: ["img/bottle-kilns.jpg", "Bottle kilns and smoke, Stoke-on-Trent", "Photograph, Unsplash+"],
    mill: ["img/mill-girl.jpg", "A child spinner in a cotton mill", "Lewis Hine, c. 1908, Library of Congress"],
    surgeons: ["img/surgeons-1890s.jpg", "Surgeons and nurses at an operation, 1890s", "Photograph"],
    tap: ["img/tap-water.jpg", "Fluoridated tap water, a public-health intervention", "Photograph"],
    tools: ["img/dental-tools.jpg", "The modern dental drill and handpieces", "Photograph"],
    amalgam: ["img/amalgam.jpg", "Amalgam fillings in two molars", "Clinical photograph"],
    anatomy: ["img/anatomy-1871.jpg", "Teeth anatomy, the upper arch from below", "Anatomical plate, 1871"],
    jaws: ["img/jaw-engraving.jpg", "The teeth in their jaws, side and front", "Copperplate engraving, 18th c."],
    plumb: ["img/roman-plumbing.jpg", "Under the Colosseum: Rome's channels and supply works", "Photograph"],
    dent: ["img/roman-dentistry.jpg", "Loose teeth bound with gold wire: ancient dentistry", "Archaeological find, photograph"],
    doctor: ["img/plague-doctor.jpg", "The plague doctor's beaked mask", "Painting"],
    skull: ["img/child-skull.jpg", "A child's skull, the adult teeth still forming in the jaw", "Engraving, 19th c."],
    yard: ["img/churchyard.jpg", "A churchyard, its graves and tombs", "Wood engraving, 19th c."],
    amClin: ["img/amalgam-clinical.jpg", "Amalgam fillings: metal packed into the tooth itself", "Clinical photograph"],
    am3d: ["img/amalgam-3d.jpg", "Amalgam in the molars' chewing surfaces", "Illustration"],
    pat1: ["img/pathogen-1.jpg", "Image of pathogen", "micrograph"],
    pat2: ["img/pathogen-2.jpg", "Image of pathogen", "micrograph"],
    pat3: ["img/pathogen-3.jpg", "Image of pathogen", "micrograph"],
    pat4: ["img/pathogen-4.jpg", "Image of pathogen", "illustration"],
    pat5: ["img/pathogen-5.jpg", "Image of pathogen", "micrograph"],
    pat6: ["img/pathogen-6.jpg", "Image of pathogen", "micrograph"],
    amTool: ["img/amalgam-placing.jpg", "Packing amalgam into a prepared cavity", "Illustration"],
    mask: ["img/anaesthesia-mask.jpg", "A patient under gas in the dentist's chair, 1950s", "Photograph"],
    gas: ["img/anaesthesia-1950s.jpg", "A patient under dental anaesthetic, 1950s", "Photograph"],
  };

  /* ---- charts (SVG at the size it is shown, so 11px type stays 11px) ---- */
  /* ---- the basic charts, in the plate style of an old science paper: muted inks on warm paper, hairline guides,
     circles sized by value on a ruled timeline, rays fanned from a hub, branching dendrograms, flowing streams ---- */
  const INK = ["#b5523b", "#2f6f73", "#c9902e", "#7a6a9a", "#6f8f5e", "#4a5a7a"];
  // a ruled timeline of circles, one per period, its area the value; the period clicked in its colour
  function bars(o) {
    const big = o.big, n = o.vals.length, W = big ? 540 : 340, H = big ? 250 : 170, L = 14, R = 14, TOP = big ? 34 : 28, B = big ? 40 : 30, sp = (W - L - R) / n;
    const mx = o.max || Math.max(...o.vals), mn = o.min || 0.01, f0 = v => o.log ? Math.max(.04, (Math.log10(v) - Math.log10(mn)) / (Math.log10(mx) - Math.log10(mn))) : v / mx;
    const rMax = Math.min(sp * (n > 10 ? .62 : .55), (H - TOP - B) / 2), cy = TOP + (H - TOP - B) / 2, X = k => L + (k + .5) * sp;
    let s = "<svg class='pp-c2' viewBox='0 0 " + W + " " + H + "' role='img' aria-label='" + esc(o.aria || "") + "'>";
    s += "<line x1='" + L + "' x2='" + (W - R) + "' y1='" + cy + "' y2='" + cy + "' stroke='#8a7f6a' stroke-width='.7' stroke-dasharray='1 3'/>";
    o.vals.forEach((v, k) => { const x = X(k), on = k === o.cur, r = Math.max(2, rMax * Math.sqrt(f0(v)));
      s += "<line x1='" + x.toFixed(1) + "' x2='" + x.toFixed(1) + "' y1='" + (TOP - 6) + "' y2='" + (H - B + 4) + "' stroke='#cfc5b0' stroke-width='.6' stroke-dasharray='2 3'/>";
      s += "<g class='pp-circ' style='--d:" + k + "'><circle cx='" + x.toFixed(1) + "' cy='" + cy + "' r='" + r.toFixed(1) + "' fill='" + (on ? o.col : "#b9a888") + "' fill-opacity='" + (on ? .55 : .32) + "' stroke='" + (on ? o.col : "#8a7f6a") + "' stroke-width='" + (on ? 1.4 : .7) + "'/>" +
        (on ? "<circle cx='" + x.toFixed(1) + "' cy='" + cy + "' r='" + (r + 5).toFixed(1) + "' fill='none' stroke='" + o.col + "' stroke-width='.8' stroke-dasharray='2 2'/>" : "") +
        "<circle cx='" + x.toFixed(1) + "' cy='" + cy + "' r='1.6' fill='#1a1a18'/></g>";
      const fs = big ? (n > 10 ? 12 : 14) : (n > 10 ? 13 : 15);
      if (on || (big && n <= 10)) s += T(x, Math.max(14, cy - r - 8), esc(o.fmt(v)), " font-size='" + fs + "' text-anchor='middle'" + (on ? " font-weight='700' style='fill:#1a1a18'" : ""));
      if (on || (big && (n <= 10 || k % 2 === 0)) || (!big && n <= 8)) s += T(x, H - 10, esc(o.labels[k]), " font-size='" + fs + "' text-anchor='middle' font-style='italic'" + (on ? " font-weight='700' style='fill:#1a1a18'" : ""));
    });
    return s + "</svg>";
  }
  // rows: [{ name, v, col, txt }]. Full size: rays fanned from a hub, fading in from it, each labelled at its tip.
  // In a small tile: hairline tracks with the share inked over them
  function hbars(rows, o) {
    const big = o.big, mx = Math.max(...rows.map(r => r.v)) || 1;
    if (!big) { const W = 130, rh = 27, H = rows.length * rh + 2; let s = "<svg class='pp-ch' viewBox='0 0 " + W + " " + H + "' role='img'>";
      rows.forEach((r, k) => { const y = k * rh, w = Math.max(2, W * r.v / mx);
        s += "<text class='pp-l on' x='0' y='" + (y + 11) + "'>" + esc(r.name) + "</text><text class='pp-v on' x='" + W + "' y='" + (y + 11) + "' text-anchor='end'>" + esc(r.txt) + "</text>";
        s += "<line x1='0' x2='" + W + "' y1='" + (y + 18.5) + "' y2='" + (y + 18.5) + "' stroke='#cfc5b0' stroke-width='.7' stroke-dasharray='1 2'/><line class='pp-draw' pathLength='1' x1='0' x2='" + w.toFixed(1) + "' y1='" + (y + 18.5) + "' y2='" + (y + 18.5) + "' stroke='" + (r.col || o.col) + "' stroke-width='4' stroke-linecap='round'/>"; });
      return s + "</svg>"; }
    // one row per item, so no two labels can meet; rays fan from a hub at the left to each item's row, the length its
    // value (log scale for ratios, so ×0.3 and ×14 both read), solid ink, the value and name at the tip
    const n = rows.length, W = o.w || 520, rh = o.rh || 34, top = 14, H = top * 2 + n * rh, hx = 16, hy = H / 2, lab = W > 400 ? 175 : 125, Lm = W - hx - lab - 12;
    const lg = o.log || Math.min(...rows.map(r => r.v)) < mx / 20, lo = Math.min(...rows.map(r => r.v)) * .6;
    const fr = v => lg ? (Math.log10(v) - Math.log10(lo)) / (Math.log10(mx) - Math.log10(lo)) : v / mx;
    let s = "<svg class='pp-c2' viewBox='0 0 " + W + " " + H + "' role='img'>";
    if (o.ref) { const x = hx + 18 + (Lm - 18) * fr(o.ref); s += "<line x1='" + x.toFixed(1) + "' x2='" + x.toFixed(1) + "' y1='4' y2='" + (H - 4) + "' stroke='#8a7f6a' stroke-width='.8' stroke-dasharray='2 3'/>" + T(x + 4, H - 4, "×1, no change", " font-size='11.5' font-style='italic'"); }
    s += "<circle cx='" + hx + "' cy='" + hy + "' r='3.2' fill='#1a1a18'/>";
    rows.forEach((r, k) => { const y = top + (k + .5) * rh, x2 = hx + 18 + (Lm - 18) * Math.max(0, fr(r.v)), c = r.col || o.col, mx2 = (hx + x2) / 2;
      s += "<path class='pp-draw' pathLength='1' style='animation-delay:" + (.3 + k * .07).toFixed(2) + "s' d='M" + hx + " " + hy + "C" + mx2.toFixed(1) + " " + hy + " " + mx2.toFixed(1) + " " + y.toFixed(1) + " " + x2.toFixed(1) + " " + y.toFixed(1) + "' fill='none' stroke='" + c + "' stroke-width='3.4' stroke-linecap='round' stroke-opacity='.85'/>";
      s += "<circle cx='" + x2.toFixed(1) + "' cy='" + y.toFixed(1) + "' r='4' fill='" + c + "'/>";
      s += "<text x='" + (x2 + 10).toFixed(1) + "' y='" + (y + 5).toFixed(1) + "' font-size='15' style='fill:#1a1a18'><tspan font-weight='700'>" + esc(r.txt) + "</tspan> <tspan font-style='italic' style='fill:#5c5548'>" + esc(r.name) + "</tspan></text>"; });
    return s + "</svg>";
  }
  // wear with age at death: every period in grey, the one clicked in its colour
  function wearLines(cur, col, big) {
    const D = window.WEAR_DATA, W = big ? 520 : 130, H = big === "wide" ? 160 : big ? 230 : 130, L = big ? 30 : 4, R = big ? 70 : 4, T = 14, B = big ? 34 : 20, lo = 2, hi = 6;
    const X = j => L + j * (W - L - R) / (D.ages.length - 1), Y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
    let s = "<svg class='pp-ch' viewBox='0 0 " + W + " " + H + "' role='img'>";
    if (big) [2, 3, 4, 5, 6].forEach(v => s += "<line class='pp-gr' x1='" + L + "' x2='" + (W - R) + "' y1='" + Y(v) + "' y2='" + Y(v) + "'/><text class='pp-l' x='" + (L - 6) + "' y='" + (Y(v) + 4) + "' text-anchor='end'>" + v + "</text>");
    const path = p => D.ages.map((a, j) => (j ? "L" : "M") + X(j).toFixed(1) + " " + Y(p.cells[a][0]).toFixed(1)).join("");
    D.periods.forEach((p, k) => { if (k !== cur) s += "<path d='" + path(p) + "' fill='none' stroke='" + GREY + "' stroke-width='1.2'/>"; });
    const p = D.periods[cur], last = p.cells[D.ages[D.ages.length - 1]][0];
    s += "<path class='pp-draw' d='" + path(p) + "' fill='none' stroke='" + col + "' stroke-width='" + (big ? 3 : 2.4) + "' pathLength='1'/>";
    s += "<circle cx='" + X(D.ages.length - 1) + "' cy='" + Y(last) + "' r='3.5' fill='" + col + "'/>";
    s += "<text class='pp-v on' x='" + (big ? X(D.ages.length - 1) + 8 : X(D.ages.length - 1) - 6) + "' y='" + (Y(last) + (big ? 4 : -8)) + "' text-anchor='" + (big ? "start" : "end") + "'>" + r1(last) + "</text>";
    s += "<text class='pp-l' x='" + L + "' y='" + (H - 4) + "'>age " + D.ages[0] + "</text><text class='pp-l' x='" + (W - R) + "' y='" + (H - 4) + "' text-anchor='end'>" + D.ages[D.ages.length - 1] + "</text>";
    return s + "</svg>";
  }
  // ten teeth, one per tenth of adults: filled = the share
  const TOOTH = "M4.5 1.5C2 1.5 1 4 1.6 7.2c.5 2.4 1.7 4 2.1 6.6.4 2.7.8 6.7 2.4 6.7 1.7 0 1.6-5 3.1-5h1.6c1.5 0 1.4 5 3.1 5 1.6 0 2-4 2.4-6.7.4-2.6 1.6-4.2 2.1-6.6C19 4 18 1.5 15.5 1.5c-2 0-3.3 1.3-5.5 1.3S6.5 1.5 4.5 1.5z";
  function picto(share, col, big) {
    const k = Math.round(share / 10), sz = big ? 40 : 11, g = big ? 10 : 1.5, W = 10 * sz + 9 * g;
    let s = "<svg class='pp-pic' viewBox='0 0 " + W + " " + (sz * 1.1) + "' role='img' aria-label='" + k + " in 10'>";
    for (let j = 0; j < 10; j++) s += "<g transform='translate(" + (j * (sz + g)) + " 0) scale(" + (sz / 20) + ")' style='--d:" + j + "' class='pp-tooth'><path d='" + TOOTH + "' fill='" + (j < k ? col : "none") + "' stroke='" + (j < k ? col : "#8f8b82") + "' stroke-width='1.3'/></g>";
    return s + "</svg>";
  }


  /* ---- the primary charts, after Statistical Tooth v2: caries' six-era stacked bars, the pathogen strand (a section
     of it around the century clicked), the molar-wear peaks and the metals star with lead's orbs ---- */
  let UID = 0;
  const lerpC = (a, b, t) => { const h = s => [1, 3, 5].map(j => parseInt(s.slice(j, j + 2), 16)), A = h(a), B = h(b); return "rgb(" + A.map((v, j) => Math.round(v + (B[j] - v) * t)).join(",") + ")"; };
  const T = (x, y, s, o) => "<text x='" + (+x).toFixed(1) + "' y='" + (+y).toFixed(1) + "'" + (o || "") + ">" + s + "</text>";
  const CRT = { ink: "#1a1a18", mid: "#6b6862", pale: "#a9a7a0" };

  function stackEras(D, cur, big) {
    const W = big ? 460 : 340, rh = 34, lx = big ? 104 : 112, rx = W - (big ? 54 : 62), top = big ? 26 : 8, H = top + D.length * rh + (big ? 34 : 4);
    const SH = ["#e3e1da", "#bdb8af", "#8f8b83", "#625e58", "#2a2926"];
    let s = "<svg class='pp-c2' viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Adults by number of decayed teeth, six periods'>";
    if (big) s += T(0, top - 10, "ALL SIX ERAS", " font-size='10.5' letter-spacing='1.2'");
    D.forEach((r, k) => {
      const y = top + k * rh, on = k === cur, tot = r.sev.reduce((a, b) => a + b, 0); let x = lx;
      s += T(lx - 10, y + rh / 2 + 6, esc(big ? r.p : GHs[k]), " text-anchor='end' font-size='" + (big ? 14 : 18) + "'" + (on ? " style='fill:" + CRT.ink + ";font-weight:700'" : ""));
      r.sev.forEach((v, j) => { const w = (rx - lx) * v / tot; s += "<rect class='pp-barx' style='--d:" + (k + j * .4) + "' x='" + x.toFixed(1) + "' y='" + (y + 4) + "' width='" + w.toFixed(1) + "' height='" + (rh - 10) + "' fill='" + SH[j] + "'/>"; x += w; });
      s += "<rect x='" + lx + "' y='" + (y + 4) + "' width='" + (rx - lx) + "' height='" + (rh - 10) + "' fill='none' stroke='" + CRT.ink + "' stroke-width='" + (on ? 1.8 : 1) + "'/>";
      s += T(rx + 8, y + rh / 2 + 6, r.std.toFixed(1) + "%", " font-size='" + (big ? 14 : 18) + "'" + (on ? " style='fill:" + CRT.ink + ";font-weight:700'" : ""));
    });
    if (big) { const y = top + D.length * rh + 14; let x = lx; ["none", "1–2", "3–4", "5–9", "10+ teeth"].forEach((n, j) => { s += "<rect x='" + x + "' y='" + (y - 9) + "' width='12' height='10' fill='" + SH[j] + "' stroke='" + CRT.ink + "' stroke-width='.6'/>" + T(x + 17, y, n, " font-size='12'"); x += 17 + n.length * 7 + 18; }); }
    return s + "</svg>";
  }

  function helix(D, c, win, big) {
    const cents = []; for (let y = 100; y <= 1800; y += 100) cents.push(y);
    const ci = Math.max(0, cents.indexOf(c)), i0 = Math.max(0, Math.min(ci - Math.floor(win / 2), cents.length - win)), i1 = i0 + win - 1;
    const nar = !big, fz = nar ? 1.25 : 1, W = nar ? 340 : 470, pitch = 34, top = 24, ribW = nar ? 140 : 176, barX = 48, cx = (nar ? 58 : 122) + ribW / 2, leadX = cx + ribW / 2 + 16, TILT = 0.06, PX = 50;
    const TURNS = [1.5, 6.5, 10.5, 16.5];
    const twist = s => { let k = TURNS.findIndex(t => s < t); if (k < 0) k = TURNS.length;
      const a = k ? TURNS[k - 1] : TURNS[0] - (TURNS[1] - TURNS[0]), b = k < TURNS.length ? TURNS[k] : TURNS[k - 1] + (TURNS[k - 1] - TURNS[k - 2]), q = (s - a) / (b - a) - 0.5;
      return Math.PI * k + Math.PI * q - 0.5 * Math.sin(2 * Math.PI * q); };
    const at = (u, s) => { const a = twist(s), z = u * Math.sin(a); return [cx + u * ribW / 2 * Math.cos(a), top + (s + 0.5) * pitch + z * ribW / 2 * TILT, z]; };
    const fr = z => (z + 1) / 2, maxN = Math.max(...cents.map(k => D.genomes[k] || 0));
    const rows = cents.map((k, i) => { const n = D.genomes[k] == null ? null : D.genomes[k], cells = n == null ? [] : D.taxa.filter(t => t.cells[k]).map(t => ({ t, v: t.cells[k][1] }));
      const mx = Math.max(0, ...cells.map(d => d.v)); return { k, i, n, cells, mx, lead: cells.filter(d => Math.abs(d.v - mx) < 1e-6) }; });
    const Y0 = i0 * pitch, H = top + win * pitch + 6;
    let s = "<svg class='pp-c2' viewBox='0 " + Y0 + " " + W + " " + H + "' role='img' aria-label='Pathogen genomes by century, one dot = 2%' style='overflow:hidden'>";
    s += "<rect x='0' y='" + (top + ci * pitch) + "' width='" + W + "' height='" + pitch + "' fill='rgba(26,26,24,.07)'/>";
    if (big) s += T(barX, Y0 + top - 9, "genomes", " font-size='11'") + T(cx, Y0 + top - 9, "one dot = 2%", " font-size='11' text-anchor='middle'") + T(leadX, Y0 + top - 9, "most found", " font-size='11'");
    for (let q = i0 - 0.5; q <= i1 + 0.5 + 1e-9; q += 3.2 / pitch) { const gap = rows.some(r => r.n == null && Math.abs(q - r.i) < 0.5); [-1, 1].forEach(u => { const p = at(u, q);
      s += "<circle cx='" + p[0].toFixed(1) + "' cy='" + p[1].toFixed(1) + "' r='" + (0.7 + 1.1 * fr(p[2])).toFixed(2) + "' fill='" + CRT.ink + "' opacity='" + ((0.2 + 0.52 * fr(p[2])) * (gap ? .35 : 1)).toFixed(2) + "'/>"; }); }
    const dots = [];
    rows.slice(i0, i1 + 1).forEach(r => { if (!r.cells.length) return;
      const q = r.cells.map(d => d.v / 100 * PX), n = q.map(v => Math.max(1, Math.floor(v)));
      const by = q.map((_, j) => j).sort((a, b) => (q[b] - n[b]) - (q[a] - n[a]));
      for (let left = PX - n.reduce((a, b) => a + b, 0), j = 0; left > 0; left--, j++) n[by[j % by.length]]++;
      for (let over = n.reduce((a, b) => a + b, 0) - PX; over > 0; over--) n[n.indexOf(Math.max(...n))]--;
      const places = PX + r.cells.length - 1, sq = Math.min(1, Math.max(.6, Math.abs(Math.cos(twist(r.i))) * 1.15)); let k = 0;
      r.cells.forEach((d, j) => { for (let m = 0; m < n[j]; m++, k++) { const u = -1 + 2 * (k + 0.5) / places, p = at(u * 0.94, r.i); dots.push({ p, sq, dark: r.lead.includes(d), d: (r.i - i0) * 3 + k * .12 }); } k++; });
    });
    dots.sort((a, b) => a.p[2] - b.p[2]).forEach(o => s += "<circle class='pp-dt' style='--d:" + o.d.toFixed(2) + "' cx='" + o.p[0].toFixed(1) + "' cy='" + o.p[1].toFixed(1) + "' r='" + (1.35 * (0.8 + 0.4 * fr(o.p[2])) * o.sq).toFixed(2) + "' fill='" + (o.dark ? CRT.ink : CRT.pale) + "'/>");
    rows.slice(i0, i1 + 1).forEach(r => { const y = top + (r.i + 0.5) * pitch + 4, on = r.i === ci, st = on ? " style='fill:" + CRT.ink + ";font-weight:700'" : "";
      s += T(0, y + 2, r.k + "s", " font-size='" + 13 * fz + "'" + st);
      if (r.n == null) { s += T(cx, y, "no samples", " font-size='12' font-style='italic' text-anchor='middle'"); return; }
      if (!nar) s += "<rect x='" + barX + "' y='" + (y - 9) + "' width='" + Math.max(2, 28 * r.n / maxN).toFixed(1) + "' height='9' fill='#bdb9b0'/>" + T(barX + 33, y + 2, r.n, " font-size='" + 12.5 * fz + "'");
      const nm0 = r.lead.length > 1 ? (nar ? r.lead.length + " tied" : "each, " + r.lead.length + " tied") : r.lead[0].t.name, nm = esc(nar && nm0.length > 11 ? nm0.split(" ").slice(-1)[0] : nm0);
      s += "<text x='" + leadX + "' y='" + (y + 2) + "' font-size='" + 13.5 * fz + "'" + (on ? " style='fill:" + CRT.ink + "'" : "") + "><tspan font-weight='700'>" + r0(r.mx) + "%</tspan> " + nm + "</text>";
    });
    return s + "</svg>";
  }

  // molar wear as Statistical Tooth v2 draws it (WearLEH.peaks): the wear grid (period × age at death) on isometric
  // axes, each cell a peak shaped like a lower first molar's crown (low dome, five cusps, central fissure and grooves),
  // drawn as a wire mesh, as tall as its Smith stage above 1. The period clicked in colour (blue 18–24 to orange 60+,
  // saturation by stage), the others in grey
  const W_CUSPS = [[-0.5, 0.42, 1], [0.06, 0.5, 0.95], [0.58, 0.22, 0.8], [-0.42, -0.42, 0.96], [0.36, -0.44, 0.9]];
  function wCrown(u, w) {
    const r = Math.cbrt(Math.abs(u / 0.98) ** 3 + Math.abs(w / 0.88) ** 3); if (r >= 1) return 0;
    let h = 0.42 * Math.sqrt(1 - r);
    for (const c of W_CUSPS) h += 0.44 * c[2] * Math.exp(-((u - c[0]) ** 2 + (w - c[1]) ** 2) / (2 * 0.25 * 0.25));
    h -= 0.17 * Math.exp(-(w * w) / (2 * 0.055 * 0.055)) * (1 - 0.5 * Math.abs(u));
    h -= 0.11 * Math.exp(-((u + 0.2) ** 2) / (2 * 0.05 * 0.05)) * Math.exp(-(w * w) / 0.45);
    h -= 0.09 * Math.exp(-((u - 0.34) ** 2) / (2 * 0.05 * 0.05)) * Math.exp(-(w * w) / 0.45);
    return Math.max(0, h * Math.min(1, (1 - r) / 0.14));
  }
  let W_MAX = 0; for (let b = 0; b < 30; b++) for (let a = 0; a < 30; a++) W_MAX = Math.max(W_MAX, wCrown(a / 29 * 2 - 1, b / 29 * 2 - 1));
  const hull = pts => { pts = pts.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    for (const p of pts) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let k = pts.length - 1; k >= 0; k--) { const p = pts[k]; while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1)); };
  function ridge(Wd, cur, big) {
    const A = Wd.ages, nJ = A.length, nI = Wd.periods.length, W = 540, labL = 104, padR = 10;
    const vmax = Math.max(...Wd.periods.flatMap(p => A.map(a => p.cells[a] ? p.cells[a][0] : 0)));
    const cs = Math.cos(Math.PI / 6), EA = [cs, -0.5], EP = [cs, 0.5], c = (W - labL - padR) / (cs * (nI + nJ)), HS = c * 0.2;
    const ox = labL, oy = (vmax - 1) * HS + 24 + 0.5 * nJ * c;
    const X = (i, j) => ox + (EP[0] * i + EA[0] * j) * c, Y = (i, j) => oy + (EP[1] * i + EA[1] * j) * c, H = Y(nI, 0) + 50;
    const ageCol = j => lerpC("#2f66d0", "#e8841f", j / (nJ - 1)), colOf = (v, j) => lerpC("#cfcdc6", ageCol(j).replace(/rgb\((\d+),(\d+),(\d+)\)/, (m, r, g, b2) => "#" + [r, g, b2].map(x => (+x).toString(16).padStart(2, "0")).join("")), 0.3 + 0.7 * Math.max(0, Math.min(1, (v - 2) / 3.9)));
    const vb = big ? "0 0 " + W + " " + H.toFixed(0) : (ox - 74) + " " + (oy - 0.5 * nJ * c - (vmax - 1) * HS - 14).toFixed(0) + " " + (W - ox + 74) + " " + (0.5 * (nI + nJ) * c + (vmax - 1) * HS + 34).toFixed(0);
    let s = "", ext = [1e9, 1e9, -1e9, -1e9]; const grow = (x, y) => { ext[0] = Math.min(ext[0], x); ext[1] = Math.min(ext[1], y); ext[2] = Math.max(ext[2], x); ext[3] = Math.max(ext[3], y); };
    [[0, 0], [0, nJ], [nI, nJ], [nI, 0]].forEach(q => grow(X(q[0], q[1]), Y(q[0], q[1])));
    s += "<path d='M" + [[0, 0], [0, nJ], [nI, nJ], [nI, 0]].map(q => X(q[0], q[1]).toFixed(1) + " " + Y(q[0], q[1]).toFixed(1)).join("L") + "Z' fill='none' stroke='#1a1a18' stroke-width='.9'/>";
    s += "<path d='M" + X(cur, 0).toFixed(1) + " " + Y(cur, 0).toFixed(1) + "L" + X(cur, nJ).toFixed(1) + " " + Y(cur, nJ).toFixed(1) + "L" + X(cur + 1, nJ).toFixed(1) + " " + Y(cur + 1, nJ).toFixed(1) + "L" + X(cur + 1, 0).toFixed(1) + " " + Y(cur + 1, 0).toFixed(1) + "Z' fill='rgba(47,102,208,.06)' stroke='rgba(47,102,208,.45)' stroke-width='.8'/>";
    Wd.periods.forEach((p, i) => { if (!big && i !== cur) return; grow(X(i + 0.5, 0) - 10 - GH[i].length * 8.2, Y(i + 0.5, 0) + 8); s += T(X(i + 0.5, 0) - 10, Y(i + 0.5, 0) + 8, esc(GH[i]), " font-size='" + (big ? 12.5 : 15) + "' text-anchor='end'" + (i === cur ? " style='fill:#1a1a18;font-weight:700'" : "")); });
    if (big) A.forEach((ag, j) => { s += T(X(nI, j + 0.5) + 4, Y(nI, j + 0.5) + 16, esc(ag), " font-size='12' style='fill:" + ageCol(j) + "'"); });
    const labs = [], fp = 0.43, N = 6, Sm = 24;
    for (let i = 0; i < nI; i++) for (let j = nJ - 1; j >= 0; j--) {
      const cell = Wd.periods[i].cells[A[j]]; if (!cell) continue; const v = cell[0], h = (v - 1) * HS * (big ? 1 : 1.5), on = i === cur, col = on ? colOf(v, j) : "#c9c6bf";
      const hAt = (su, sv) => wCrown((su - 0.5) / fp, (sv - 0.5) / fp) / W_MAX, at = (su, sv) => [X(i + sv, j + su), Y(i + sv, j + su) - hAt(su, sv) * h];
      let du = "", dv = ""; const all = [];
      for (let k = 0; k <= N; k++) { const q = k / N; let lu = "", lv = "";
        for (let m = 0; m <= Sm; m++) { const r = m / Sm, P1 = at(r, q), P2 = at(q, r); if (hAt(r, q) > 0.004) { all.push(P1); grow(P1[0], P1[1]); } if (hAt(q, r) > 0.004) { all.push(P2); grow(P2[0], P2[1]); }
          lu += (m ? "L" : "M") + P1[0].toFixed(1) + " " + P1[1].toFixed(1); lv += (m ? "L" : "M") + P2[0].toFixed(1) + " " + P2[1].toFixed(1); }
        du += lu; dv += lv; }
      const hl = all.length > 2 ? hull(all) : null;
      s += "<g" + (on ? " class='pp-rise' style='--d:" + j + "'" : "") + ">";
      if (hl) s += "<path d='M" + hl.map(q => q[0].toFixed(1) + " " + q[1].toFixed(1)).join("L") + "Z' fill='" + (on ? col : "#f3f1ec") + "' fill-opacity='" + (on ? .22 : .85) + "'/>";
      s += "<path d='" + du + dv + "' fill='none' stroke='" + col + "' stroke-width='" + (on ? .9 : .55) + "' stroke-opacity='" + (on ? 1 : .8) + "'/></g>";
      if (on) { const tp = [X(i + .5, j + .5), Y(i + .5, j + .5) - h]; grow(tp[0], tp[1] - 24); labs.push(T(tp[0], tp[1] - 7, v.toFixed(1), " font-size='" + (big ? 12.5 : 16) + "' font-weight='700' text-anchor='middle' style='fill:#1a1a18;paint-order:stroke;stroke:#f6f1e4;stroke-width:3px'")); }
    }
    s += labs.join("");
    if (big) s += T(X(nI, nJ - 2.5) + 26, Y(nI, nJ - 2.5) + 44, "age at death ↗", " font-size='12' font-style='italic'");
    const view = big ? vb : (ext[0] - 8).toFixed(0) + " " + (ext[1] - 8).toFixed(0) + " " + (ext[2] - ext[0] + 16).toFixed(0) + " " + (ext[3] - ext[1] + 16).toFixed(0);
    return "<svg class='pp-c2' viewBox='" + view + "' role='img' aria-label='Molar wear by age at death, period by period'>" + s + "</svg>";
  }


  const fppm = v => v >= 100 ? r0(v) : v >= 10 ? r1(v) : v >= 1 ? v.toFixed(2).replace(/0$/, "") : v >= .1 ? v.toFixed(2) : v.toFixed(3).replace(/0$/, "");
  function radar(D, i, col, big) {
    const W = 560, H = 430, cx = 280, cy = 222, R = 112, LR = 158, last = D.periods.length - 1;
    const XLO = .08, XHI = 20, rad = v => R * Math.max(.02, Math.min(1, (Math.log(v) - Math.log(XLO)) / (Math.log(XHI) - Math.log(XLO))));
    const els = D.elements.slice(), pb = els.findIndex(e => e[0] === "Pb"); if (pb > 0) els.unshift(els.splice(pb, 1)[0]);
    const n = els.length, ang = k => -Math.PI / 2 + k * 2 * Math.PI / n;
    const val = k => k === "Pb" ? D.lead[i] : i === last ? D.modern[k] : D.pooled[k];
    const xs = els.map(([k]) => k === "Pb" ? D.lead[i] / D.leadArch : i === last ? D.modern[k] / D.pooled[k] : 1), rs = xs.map(rad);
    let s = "<svg class='pp-c2' viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Eight metals against their archaeological level'>";
    [[.1, "×0.1"], [1, "×1 archaeological level"], [10, "×10"]].forEach(([v, l]) => { s += "<circle cx='" + cx + "' cy='" + cy + "' r='" + rad(v).toFixed(1) + "' fill='none' stroke='" + (v === 1 ? "#8f8b83" : "#bdb9b0") + "' stroke-width='" + (v === 1 ? 1 : .8) + "'" + (v === 1 ? "" : " stroke-dasharray='1.5 3'") + "/>";
      if (big) s += T(cx + Math.cos(-0.3) * rad(v) + 4, cy + Math.sin(-0.3) * rad(v) - 4, l, " font-size='11' style='paint-order:stroke;stroke:#f3f2ee;stroke-width:3px'"); });
    els.forEach(([k], j) => { const a = ang(j), x2 = cx + Math.cos(a) * (LR - 18), y2 = cy + Math.sin(a) * (LR - 18);
      s += "<line x1='" + cx + "' y1='" + cy + "' x2='" + x2.toFixed(1) + "' y2='" + y2.toFixed(1) + "' stroke='#a9a7a0' stroke-width='.8' stroke-dasharray='1 3'/><circle cx='" + x2.toFixed(1) + "' cy='" + y2.toFixed(1) + "' r='2.2' fill='" + CRT.ink + "'/>"; });
    let d = ""; for (let m = 0; m <= 240; m++) { const th = -Math.PI / 2 + m / 240 * 2 * Math.PI; let sw = 0, sr = 0, mw = 0;
      els.forEach((_, j) => { let dd = Math.abs(th - ang(j)) % (2 * Math.PI); if (dd > Math.PI) dd = 2 * Math.PI - dd; const w = Math.exp(-Math.pow(dd / .26, 2)); sw += w; sr += w * rs[j]; mw = Math.max(mw, w); });
      const r = sr / sw * (1 - .13 * (1 - mw)); d += (m ? "L" : "M") + (cx + Math.cos(th) * r).toFixed(1) + " " + (cy + Math.sin(th) * r).toFixed(1); }
    s += "<path class='pp-grow' style='transform-origin:" + cx + "px " + cy + "px' d='" + d + "Z' fill='" + col + "' fill-opacity='.42' stroke='" + col + "' stroke-width='1.2'/>";
    els.forEach((_, j) => { const a = ang(j), x = cx + Math.cos(a) * rs[j], y = cy + Math.sin(a) * rs[j]; s += "<circle cx='" + x.toFixed(1) + "' cy='" + y.toFixed(1) + "' r='" + (j ? 4 : 5) + "' fill='" + (j ? "#fff" : CRT.ink) + "' stroke='" + CRT.ink + "' stroke-width='1.1'/>"; });
    els.forEach(([k], j) => { const a = ang(j), ca = Math.cos(a), sa = Math.sin(a), x = cx + ca * LR, y = cy + sa * LR, an = Math.abs(ca) < .3 ? "middle" : ca > 0 ? "start" : "end";
      const col2 = D.colours[k] || CRT.ink, v = val(k), xr = xs[j];
      const sub = k === "Pb" ? (i > 0 ? (D.lead[i] >= D.lead[i - 1] ? "▲ " : "▼ ") + r1(Math.max(D.lead[i] / D.lead[i - 1], D.lead[i - 1] / D.lead[i])) + "× " + (D.lead[i] >= D.lead[i - 1] ? "more" : "less") : "×" + r1(xr) + " archaeological") : i === last ? "×" + r1(xr) + " the past" : "pooled sample";
      const yy = sa < -.3 ? y - (big ? 34 : 30) : sa > .3 ? y + (big ? 16 : 26) : y + (big ? -6 : 10), fs = big ? 20 : 36;
      s += T(x, yy, k, " font-size='" + fs + "' font-weight='700' text-anchor='" + an + "' style='fill:" + col2 + "'");
      if (big) s += T(x, yy + (big ? 17 : 22), fppm(v) + " ppm", " font-size='" + (big ? 13 : 17) + "' font-weight='600' text-anchor='" + an + "' style='fill:" + CRT.ink + "'");
      if (big) s += T(x, yy + 32, sub, " font-size='11.5' text-anchor='" + an + "'" + (k === "Pb" && i > 0 ? " style='fill:" + (D.lead[i] >= D.lead[i - 1] ? "#c0392b" : "#3d7a5a") + "'" : ""));
    });
    return s + "</svg>";
  }

  function orbs(D, i, big) {
    const id = "ppo" + (++UID), lab = big ? ["Neol.", "Bronze", "Iron", "Roman", "Post-R.", "E. med.", "L. med.", "20th c."] : ["", "", "", "", "", "", "", ""];
    const W = big ? 560 : 260, H = big ? 270 : 330, L = big ? 70 : 14, R = big ? 30 : 14, T0 = big ? 18 : 70, B = big ? 38 : 20, n = D.lead.length, X = k => L + (k + .5) * (W - L - R) / n, Y = v => T0 + (H - T0 - B) * (1 - (Math.log10(v) + 2) / 3);
    let s = "<svg class='pp-c2' viewBox='0 0 " + W + " " + H + "' role='img' aria-label='Lead in childhood enamel, era by era'><defs>" +
      "<radialGradient id='" + id + "a' cx='35%' cy='32%' r='70%'><stop offset='0' stop-color='#fbfaff'/><stop offset='.55' stop-color='#d9d3f3'/><stop offset='1' stop-color='#b3aadb'/></radialGradient>" +
      "<radialGradient id='" + id + "b' cx='35%' cy='32%' r='70%'><stop offset='0' stop-color='#e6e0ff'/><stop offset='.5' stop-color='#8f7cf0'/><stop offset='1' stop-color='#5a45cf'/></radialGradient>" +
      "<filter id='" + id + "g' x='-1' y='-1' width='3' height='3'><feGaussianBlur stdDeviation='7'/></filter></defs>";
    [.01, .1, 1, 10].forEach(v => s += "<line x1='" + L + "' x2='" + (W - R) + "' y1='" + Y(v).toFixed(1) + "' y2='" + Y(v).toFixed(1) + "' stroke='#c9c6bf' stroke-width='.8' stroke-dasharray='3 3'/>" + (big ? T(L - 8, Y(v) + 4, v + " ppm", " font-size='11.5' text-anchor='end'") : ""));
    s += "<path d='" + D.lead.slice(0, i + 1).map((v, k) => (k ? "L" : "M") + X(k).toFixed(1) + " " + Y(v).toFixed(1)).join("") + "' fill='none' stroke='#8f8b83' stroke-width='1' stroke-dasharray='1 3'/>";
    D.lead.forEach((v, k) => { if (k > i) return; const on = k === i, r = (on ? 15 : 12) * (big ? 1 : 1.25), x = X(k), y = Y(v);
      s += "<g class='pp-orb' style='--d:" + k + ";transform-origin:" + x.toFixed(1) + "px " + y.toFixed(1) + "px'><circle cx='" + x.toFixed(1) + "' cy='" + y.toFixed(1) + "' r='" + (r + 6) + "' fill='" + (on ? "#8f7cf0" : "#cfc8ee") + "' opacity='" + (on ? .55 : .4) + "' filter='url(#" + id + "g)'/>" +
        "<circle cx='" + x.toFixed(1) + "' cy='" + y.toFixed(1) + "' r='" + r + "' fill='url(#" + id + (on ? "b" : "a") + ")'/></g>";
      if (on) s += T(x + (big ? r + 8 : 0), y + (big ? 5 : -r - 10), fppm(v), " font-size='" + (big ? 14 : 34) + "' font-weight='700'" + (big ? "" : " text-anchor='middle'") + " style='fill:" + CRT.ink + "'"); });
    lab.forEach((l, k) => s += T(X(k), H - 12, l, " font-size='" + (big ? 12 : 11.5) + "' text-anchor='middle'" + (k === i ? " style='fill:" + CRT.ink + ";font-weight:700'" : k > i ? " style='fill:#c9c6bf'" : "")));
    return s + "</svg>";
  }
  const tKpiH = (numHTML, label, more) => ({ kind: "kpi", title: label, tile: numHTML + "<span class='pp-kl'>" + esc(label) + "</span>",
    det: numHTML.replace("pp-num", "pp-num big") + "<p class='pp-kl big'>" + esc(label) + "</p>" + more.map(n => "<p class='pp-dp'>" + n + "</p>").join("") });


  // a tile's size in the six-column gallery: c columns by r rows; wide = show the chart's full version in the tile
  const S = (t, c, r, wide) => { t.span = [c, r]; if (wide && t.bigTile) t.tile = t.bigTile; return t; };
  // a dendrogram of shares: a hub, one branch per kind, then one leaf per 2% — fifty leaves in all; the key at the right
  function donut(rows, mid, sub, big) {
    const W = 400, H = 260, cx = 128, cy = 128, R1 = 52, R2 = 112, tot = rows.reduce((a, b) => a + b.v, 0) || 1, PX = 50;
    const q = rows.map(r => r.v / tot * PX), nn = q.map(v => Math.floor(v)), by = q.map((_, j) => j).sort((a, b) => (q[b] - nn[b]) - (q[a] - nn[a]));
    for (let left = PX - nn.reduce((a, b) => a + b, 0), j = 0; left > 0; left--, j++) nn[by[j % by.length]]++;
    const A0 = -Math.PI / 2 + .35, A1 = 1.5 * Math.PI - .35, gap = .06, span = A1 - A0 - gap * (rows.length - 1); let a = A0, leaf = 0;
    let s = "<svg class='pp-c2' viewBox='0 0 " + W + " " + H + "' role='img'>";
    rows.forEach((r, k) => { const n = nn[k]; if (!n) return; const w = span * n / PX, am = a + w / 2, nx = cx + Math.cos(am) * R1, ny = cy + Math.sin(am) * R1;
      s += "<path class='pp-draw' pathLength='1' d='M" + cx + " " + cy + "Q" + (cx + Math.cos(am) * R1 * .5).toFixed(1) + " " + (cy + Math.sin(am) * R1 * .5).toFixed(1) + " " + nx.toFixed(1) + " " + ny.toFixed(1) + "' fill='none' stroke='#2b3a3a' stroke-width='1.6'/>";
      for (let j = 0; j < n; j++) { const al = a + w * (j + .5) / n, lx = cx + Math.cos(al) * R2, ly = cy + Math.sin(al) * R2, c1x = cx + Math.cos(am) * (R1 + 30), c1y = cy + Math.sin(am) * (R1 + 30);
        s += "<path class='pp-draw' pathLength='1' style='animation-delay:" + (.5 + leaf * .012).toFixed(2) + "s' d='M" + nx.toFixed(1) + " " + ny.toFixed(1) + "Q" + c1x.toFixed(1) + " " + c1y.toFixed(1) + " " + lx.toFixed(1) + " " + ly.toFixed(1) + "' fill='none' stroke='#2b4f52' stroke-width='.7' stroke-opacity='.8'/>";
        s += "<circle class='pp-dt' style='--d:" + (10 + leaf * .5).toFixed(1) + "' cx='" + lx.toFixed(1) + "' cy='" + ly.toFixed(1) + "' r='3.6' fill='" + r.col + "'/>"; leaf++; }
      s += "<circle cx='" + nx.toFixed(1) + "' cy='" + ny.toFixed(1) + "' r='" + (5 + Math.sqrt(n) * 1.6).toFixed(1) + "' fill='" + r.col + "' stroke='#f6f1e4' stroke-width='1.2'/>";
      a += w + gap; });
    s += "<circle cx='" + cx + "' cy='" + cy + "' r='24' fill='#2a2926'/>" + T(cx, cy + 6, mid, " font-size='17' font-weight='700' text-anchor='middle' style='fill:#f6f1e4'") + T(cx, H - 6, sub + " · one leaf = 2%", " font-size='12' font-style='italic' text-anchor='middle'");
    rows.forEach((r, k) => { const y = cy - (rows.length - 1) * 16 + k * 32; s += "<circle cx='262' cy='" + (y - 5) + "' r='6' fill='" + r.col + "'/>" + T(274, y, esc(r.name), " font-size='15' font-style='italic'") + T(W - 2, y, r1(r.v / tot * 100) + "%", " font-size='15' font-weight='700' text-anchor='end' style='fill:#1a1a18'"); });
    return s + "</svg>";
  }
  // a stream: each series a ribbon whose thickness is its value, stacked about a centre line and flowing through time,
  // like a plate in an old atlas of ideas; the period clicked ruled through and its value written above
  function areaLine(vals, labels, cur, col, big, fmt, more, name) {
    const series = [{ vals, col, name: name || "" }].concat(more || []), n = vals.length;
    const ms = series.length > 1 ? 22 : 0, W = big ? 540 : 470, H = (big ? 250 : 150) + ms, L = 8, R = 8, T0 = (big ? 44 : 34) + ms, B = big ? 30 : 24, cy = T0 + (H - T0 - B) / 2;   // a key row above the value when there are several series
    const tot = k => series.reduce((a, se) => a + (se.vals[k] || 0), 0), mxT = Math.max(...vals.map((_, k) => tot(k))) || 1, sc = (H - T0 - B) * .96 / mxT;
    const X = k => L + k * (W - L - R) / (n - 1);
    const mono = pts => { const m = pts.length, dx = [], sl = [], t = []; for (let j = 0; j < m - 1; j++) { dx[j] = pts[j + 1][0] - pts[j][0]; sl[j] = (pts[j + 1][1] - pts[j][1]) / dx[j]; }
      t[0] = sl[0]; t[m - 1] = sl[m - 2]; for (let j = 1; j < m - 1; j++) t[j] = sl[j - 1] * sl[j] <= 0 ? 0 : 3 * (dx[j - 1] + dx[j]) / ((2 * dx[j] + dx[j - 1]) / sl[j - 1] + (dx[j] + 2 * dx[j - 1]) / sl[j]);
      let d = ""; for (let j = 0; j < m - 1; j++) { const h = dx[j] / 3; d += "C" + (pts[j][0] + h).toFixed(1) + " " + (pts[j][1] + t[j] * h).toFixed(1) + " " + (pts[j + 1][0] - h).toFixed(1) + " " + (pts[j + 1][1] - t[j + 1] * h).toFixed(1) + " " + pts[j + 1][0].toFixed(1) + " " + pts[j + 1][1].toFixed(1); } return d; };
    let s = "<svg class='pp-c2' viewBox='0 0 " + W + " " + H + "' role='img'><g class='pp-sweep'>";
    const every = Math.max(1, Math.ceil(n / (big ? 9 : 7)));
    labels.forEach((l, k) => { const x = X(k), on = k === cur; s += "<line x1='" + x.toFixed(1) + "' x2='" + x.toFixed(1) + "' y1='" + (T0 - 4) + "' y2='" + (H - B + 2) + "' stroke='#cfc5b0' stroke-width='.6' stroke-dasharray='1 3'/>";
      if (on || (k % every === 0 && Math.abs(k - cur) >= every * .6)) s += T(x, H - 7, esc(l), " font-size='13' text-anchor='" + (k === 0 ? "start" : k === n - 1 ? "end" : "middle") + "' font-style='italic'" + (on ? " font-weight='700' style='fill:#1a1a18'" : "")); });
    s += "<line x1='" + L + "' x2='" + (W - R) + "' y1='" + cy + "' y2='" + cy + "' stroke='#8a7f6a' stroke-width='.6'/>";
    const base = vals.map((_, k) => cy - tot(k) * sc / 2), acc = vals.map(() => 0);
    series.forEach((se, si) => { const top = [], bot = [];
      se.vals.forEach((v, k) => { const y0 = base[k] + acc[k] * sc, y1 = y0 + (v || 0) * sc; top.push([X(k), y0]); bot.push([X(k), y1]); acc[k] += v || 0; });
      const rb = bot.slice().reverse(), c = se.col, light = si === 0 ? .62 : .5;
      s += "<path d='M" + top[0][0].toFixed(1) + " " + top[0][1].toFixed(1) + mono(top) + "L" + rb[0][0].toFixed(1) + " " + rb[0][1].toFixed(1) + mono(rb) + "Z' fill='" + c + "' fill-opacity='" + light + "' stroke='" + c + "' stroke-width='.9'/>"; });
    s += "</g>";
    vals.forEach((v, k) => { if (v == null) s += T(X(k), cy + 4, "·", " font-size='14' text-anchor='middle'"); });
    const v = vals[cur], vx = X(cur);
    s += "<line x1='" + vx.toFixed(1) + "' x2='" + vx.toFixed(1) + "' y1='" + (T0 - 6) + "' y2='" + (H - B + 2) + "' stroke='#1a1a18' stroke-width='.9'/>";
    if (v != null) { const an = cur < n * .15 ? "start" : cur > n * .85 ? "end" : "middle"; s += T(vx + (an === "start" ? 4 : an === "end" ? -4 : 0), T0 - 12, (series.length > 1 && name ? esc(name) + " " : "") + fmt(v), " font-size='16' font-weight='700' text-anchor='" + an + "' style='fill:#1a1a18'"); }
    if (series.length > 1) { let x = L; series.forEach(se => { s += "<rect x='" + x + "' y='4' width='14' height='9' fill='" + se.col + "' fill-opacity='.62'/>" + T(x + 19, 13, esc(se.name), " font-size='13' font-style='italic'"); x += 19 + se.name.length * 7 + 18; }); }
    return s + "</svg>";
  }
  // every century as a dandelion seed round a hub, time running clockwise: the stalk's length and the seed's size are
  // the century's genomes, the seed's colour the kind of pathogen found most; the century clicked inked in
  function dandelion(D, c, big) {
    const cents = []; for (let y = 100; y <= 1800; y += 100) cents.push(y);
    const W = 520, H = 440, cx = W / 2, cy = H / 2 + 6, maxN = Math.max(...cents.map(k => D.genomes[k] || 0)), A0 = -Math.PI / 2 - 2.6, A1 = -Math.PI / 2 + 2.6;
    let s = "<svg class='pp-c2' viewBox='" + (big ? "0 0 " + W + " " + H : "-30 8 " + (W + 60) + " " + (H - 4)) + "' role='img' aria-label='Genomes per century, as seeds round a hub'>";
    s += "<circle cx='" + cx + "' cy='" + cy + "' r='176' fill='none' stroke='#cfc5b0' stroke-width='.7' stroke-dasharray='1 4'/><circle cx='" + cx + "' cy='" + cy + "' r='60' fill='none' stroke='#cfc5b0' stroke-width='.7' stroke-dasharray='1 4'/>";
    cents.forEach((k, j) => { const n = D.genomes[k] || 0, a = A0 + (A1 - A0) * j / (cents.length - 1), on = k === c, fr = Math.sqrt(n / maxN);
      const L = n ? 66 + 110 * fr : 52, ex = cx + Math.cos(a) * L, ey = cy + Math.sin(a) * L, bx = cx + Math.cos(a + .18) * L * .5, by = cy + Math.sin(a + .18) * L * .5;
      const top = n ? D.taxa.filter(t => t.cells[k] && t.kind !== "other").sort((p, q) => q.cells[k][0] - p.cells[k][0])[0] : null, col = top ? (D.colours[top.kind] || "#8a7f6a") : "#cfc5b0", r = n ? 5 + 13 * fr : 2.5;
      s += "<path class='pp-draw' pathLength='1' style='animation-delay:" + (.3 + j * .05).toFixed(2) + "s' d='M" + cx + " " + cy + "Q" + bx.toFixed(1) + " " + by.toFixed(1) + " " + ex.toFixed(1) + " " + ey.toFixed(1) + "' fill='none' stroke='" + (on ? "#1a1a18" : "#2b4f52") + "' stroke-width='" + (on ? 1.6 : .8) + "' stroke-opacity='" + (n ? .85 : .35) + "'/>";
      if (n) { s += "<g class='pp-circ' style='--d:" + (j + 4) + "'>";
        for (let m = 0; m < 14; m++) { const b = m / 14 * 2 * Math.PI; s += "<line x1='" + ex.toFixed(1) + "' y1='" + ey.toFixed(1) + "' x2='" + (ex + Math.cos(b) * (r + 5)).toFixed(1) + "' y2='" + (ey + Math.sin(b) * (r + 5)).toFixed(1) + "' stroke='" + col + "' stroke-width='.6' stroke-opacity='.7'/>"; }
        s += "<circle cx='" + ex.toFixed(1) + "' cy='" + ey.toFixed(1) + "' r='" + r.toFixed(1) + "' fill='" + col + "' fill-opacity='" + (on ? .75 : .38) + "' stroke='" + (on ? "#1a1a18" : col) + "' stroke-width='" + (on ? 1.4 : .7) + "'/></g>"; }
      const lr = L + r + 14, lx = cx + Math.cos(a) * lr, ly = cy + Math.sin(a) * lr + 4, an = Math.abs(Math.cos(a)) < .25 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
      s += T(lx, ly, k + "s" + (on && n ? " · " + n : ""), " font-size='" + (big ? (on ? 15 : 12.5) : (on ? 19 : 16)) + "' text-anchor='" + an + "' font-style='italic'" + (on ? " font-weight='700' style='fill:#1a1a18'" : "")); });
    s += "<circle cx='" + cx + "' cy='" + cy + "' r='7' fill='#2a2926'/>" + T(cx, cy + 26, "100s → 1800s", " font-size='" + (big ? 12 : 15) + "' font-style='italic' text-anchor='middle'");
    let lx = 10; Object.keys(D.colours).filter(k => k !== "other").forEach(k => { s += "<circle cx='" + (lx + 5) + "' cy='" + (H - 12) + "' r='5' fill='" + D.colours[k] + "' fill-opacity='.6'/>" + T(lx + 14, H - 8, k === "virus" ? "viruses" : k === "bacteria" ? "bacteria" : k + "s", " font-size='" + (big ? 12.5 : 16) + "' font-style='italic'"); lx += big ? 96 : 116; });
    return s + "</svg>";
  }
  // a hundred people as dots; the first n stand for repaired teeth per 100 people
  function dotGrid(n, col) {
    const k = Math.min(100, Math.round(n)), W = 10 * 22, H = 10 * 22; let s = "<svg class='pp-c2' viewBox='-4 -4 " + (W + 8) + " " + (H + 8) + "' role='img' aria-label='" + k + " in 100'>";
    for (let j = 0; j < 100; j++) s += "<circle class='pp-dt' style='--d:" + (j * .35).toFixed(2) + "' cx='" + ((j % 10) * 22 + 11) + "' cy='" + (Math.floor(j / 10) * 22 + 11) + "' r='" + (j < k ? 8 : 4) + "' fill='" + (j < k ? col : "#cfccc4") + "'/>";
    return s + "</svg>";
  }

  /* ---- tiles ---- */
  const IMGT = "<im" + "g src='";   // split so bundlers don't read it as a real tag
  const tImg = (key, extra) => { const m0 = IMG[key], rs = window.__resources && window.__resources["img_" + key], m = rs ? [rs, m0[1], m0[2]] : m0; /* the standalone file gives each picture as a blob URL */ return { kind: "img", title: m[1], tile: IMGT + m[0] + "' alt='" + esc(m[1]) + "' loading='lazy'><span class='pp-cap'>" + esc(m[1]) + "</span>",
    det: "<figure class='pp-fig'>" + IMGT + m[0] + "' alt='" + esc(m[1]) + "'><figcaption>" + esc(m[1]) + " · <i>" + esc(m[2]) + "</i></figcaption></figure>" + (extra ? "<p class='pp-dp'>" + extra + "</p>" : ""), cite: m[1] + ", " + m[2] }; };
  const tChart = (title, small, big, notes) => ({ kind: "chart", title, tile: "<span class='pp-tt'>" + esc(title) + "</span>" + small, bigTile: "<span class='pp-tt'>" + esc(title) + "</span>" + big, det: "<h4 class='pp-dh'>" + esc(title) + "</h4>" + big + notes.map(n => "<p class='pp-dp'>" + n + "</p>").join("") });
  const tKpi = (num, label, more, picHTML, bigPic) => ({ kind: "kpi", title: label, tile: "<b class='pp-num'>" + esc(num) + "</b><span class='pp-kl'>" + esc(label) + "</span>",
    det: "<b class='pp-num big'>" + esc(num) + "</b><p class='pp-kl big'>" + esc(label) + "</p>" + (bigPic || "") + more.map(n => "<p class='pp-dp'>" + n + "</p>").join("") });
  const ARROW = "<svg viewBox='0 0 16 16' width='14' height='14' aria-hidden='true'><path d='M10.5 3 5.5 8l5 5' fill='none' stroke='currentColor' stroke-width='1.6'/></svg>";

  function gallery(pick, lead, tiles, data) {
    const cites = tiles.filter(t => t.cite).map(t => t.cite), open = tiles.filter(t => t.kind !== "kpi");
    const body = "<div class='pp-gal'>" + tiles.map((t, j) =>
      (t.kind === "kpi" ? "<div" : "<button type='button'") + " class='pp-t pp-in " + t.kind + ((t.span || [2, 1])[0] <= 2 && (t.span || [2, 1])[1] <= 1 ? " tiny" : "") + ((t.span || [2, 1])[1] <= 1 ? " r1" : "") + "' style='--i:" + (2 + j) + ";grid-column:span " + (t.span || [2, 1])[0] + ";grid-row:span " + (t.span || [2, 1])[1] + "'" + (t.kind === "kpi" ? "" : " data-t='" + open.indexOf(t) + "' aria-label='Open: " + esc(t.title) + "'") + ">" + t.tile + (t.kind === "kpi" ? "</div>" : "</button>")).join("") + "</div>" +
      "<div class='pp-det' hidden><div class='pp-dbar'><button type='button' class='pp-back'>" + ARROW + "<span>Back</span></button><span class='pp-cnt'></span>" +
      "<button type='button' class='pp-step' data-s='-1' aria-label='Previous'>" + ARROW + "</button><button type='button' class='pp-step nx' data-s='1' aria-label='Next'>" + ARROW + "</button></div><div class='pp-dv'></div></div>" +
      "<p class='pp-src pp-in' style='--i:8'>" + (cites.length ? "Image: " + esc(cites.join("; ")) + ". " : "") + "Data: " + esc(data) + ".</p>";
    return { lead, body, mount: panel => mount(panel, open) };
  }
  function mount(panel, tiles) {
    const gal = panel.querySelector(".pp-gal"), det = panel.querySelector(".pp-det"), dv = det.querySelector(".pp-dv"), cnt = det.querySelector(".pp-cnt");
    let at = -1;
    const show = j => {
      at = (j + tiles.length) % tiles.length;
      if (det.hidden) { gal.hidden = true; det.hidden = false; panel.querySelector(".pp-body").scrollTop = 0; }   // the open view is as tall as its own content
      dv.classList.remove("in"); void dv.offsetWidth;
      dv.innerHTML = tiles[at].det; dv.className = "pp-dv in " + tiles[at].kind; cnt.textContent = (at + 1) + " / " + tiles.length + " · " + tiles[at].title;
    };
    const back = () => { const k = at; at = -1; det.hidden = true; gal.hidden = false; const b = gal.querySelector("[data-t='" + k + "']"); if (b) b.focus({ preventScroll: true }); };
    gal.addEventListener("click", e => { const b = e.target.closest("[data-t]"); if (b) { show(+b.dataset.t); det.querySelector(".pp-back").focus({ preventScroll: true }); } });
    det.querySelector(".pp-back").addEventListener("click", back);
    det.querySelectorAll(".pp-step").forEach(b => b.addEventListener("click", () => show(at + +b.dataset.s)));
    panel.addEventListener("keydown", e => {
      if (at < 0) return;
      if (e.key === "ArrowRight") { show(at + 1); e.preventDefault(); } else if (e.key === "ArrowLeft") { show(at - 1); e.preventDefault(); }
      else if (e.key === "Backspace") { back(); e.preventDefault(); }
    });
  }



  /* ---- the records: each period has its own layout and its own mix of charts, so no chart repeats more than twice
     along a line, and each pop-up brings up the data points that matter at that time ---- */
  const GH = ["Pre-medieval", "Early medieval", "High medieval", "Late medieval", "Early modern", "Industrial"];
  const GHs = ["Pre-med.", "Early med.", "High med.", "Late med.", "Early mod.", "Indust."];
  const GHHP = "Global History of Health Project, European module, adults 18–69";
  const SEVC = ["#d9cfb8", "#c9902e", "#b5523b", "#7a3b2e", "#2a2926"], SEVN = ["no decay", "1–2 teeth", "3–4 teeth", "5–9 teeth", "10 or more"];

  P.CONTENT.caries = pick => {
    const D = window.CARIES_RATES, i = Math.min(pick.i, D.length - 1), r = D[i], prev = D[i - 1], col = pick.col;
    const severe = r.sev[3] + r.sev[4], tens = Math.round(r.std / 10), low = D.reduce((m, d) => d.std < m.std ? d : m, D[0]);
    const LEADS = [
      tens + " in 10 adults already had a decayed tooth before the medieval era.",
      "Decay eased: just over half of early medieval adults had a cavity.",
      "The low point of the record: " + r0(r.std) + "% of adults had decay.",
      "Decay climbs back: " + r0(r.std) + "% of late medieval adults.",
      "Sugar reaches the table: " + r0(severe) + "% of adults now had five or more decayed teeth.",
      "Three in four industrial adults had decay; " + r1(r.sev[4]) + "% had ten or more.",
    ];
    const stack = () => tChart("Decayed teeth, all six eras", stackEras(D, i, false), stackEras(D, i, true), ["Each bar is all adults of a period, split by how many of their own teeth were decayed, lightest none to darkest ten or more. The figure on the right is the share with any decay, age-standardised."]);
    const sevRows = big => SEVN.map((n, k) => ({ name: n, v: r.sev[k], txt: r1(r.sev[k]) + "%", col: k ? col : GREY }));
    const sev = () => tChart("How many teeth decayed, " + GH[i].toLowerCase(), hbars(sevRows().slice(1), { col, max: 40 }), hbars(sevRows(), { col, big: true, max: 50 }), ["Adults of the period by how many of their own teeth were carious."]);
    const share = () => tChart("Adults with decay, by period", bars({ vals: D.map(d => d.std), labels: GHs, cur: i, col, fmt: v => r0(v) + "%" }), bars({ vals: D.map(d => d.std), labels: GHs, cur: i, col, fmt: v => r1(v) + "%", big: true }), ["Share of adults with at least one carious tooth, age-standardised so periods with older skeletons don't look worse."]);
    const sevM = () => tChart("How many teeth decayed", hbars(sevRows().slice(1), { col }), hbars(sevRows(), { col, big: true, w: 300, lx: 92 }), ["Adults of the period by how many of their own teeth were carious."]);
    const ring = () => tChart("Every adult of the period", donut(SEVN.map((n, k) => ({ name: n, v: r.sev[k], col: SEVC[k] })), r0(r.std) + "%", "with decay", false), donut(SEVN.map((n, k) => ({ name: n, v: r.sev[k], col: SEVC[k] })), r0(r.std) + "%", "with decay", true), ["All adults of the period, by how many decayed teeth they had."]);
    const trend = () => tChart("The line of decay", areaLine(D.map(d => d.std), GHs, i, col, false, v => r1(v) + "%"), areaLine(D.map(d => d.std), GHs, i, col, true, v => r1(v) + "%"), ["Share of adults with any decay, six periods."]);
    const kStd = () => tKpi(r0(r.std) + "%", "adults with decay", ["About " + tens + " in every 10 adults."], picto(r.std, col), picto(r.std, col, true));
    const kSev = () => tKpi(r0(severe) + "%", "with five or more decayed teeth", ["5–9 teeth: " + r1(r.sev[3]) + "%. Ten or more: " + r1(r.sev[4]) + "%."]);
    const kDelta = () => tKpi((r.std - prev.std > 0 ? "+" : "") + r1(r.std - prev.std), "points vs the " + GH[i - 1].toLowerCase() + " period", [r1(prev.std) + "% then, " + r1(r.std) + "% now."]);
    const kN = () => tKpi(r0(r.n), "adults recorded", ["Skeletons with a consistent caries count, adults 18–69."]);
    const kTen = () => tKpi(r1(r.sev[4]) + "%", "with ten or more decayed teeth", ["Against " + r1(D[0].sev[4]) + "% before the medieval era."]);
    const L = [
      () => [S(tImg("bath", "Bread, porridge and fruit kept decay common long before sugar."), 4, 3), S(kStd(), 2, 1), S(tImg("ruins"), 2, 2), S(sev(), 6, 2, true)],
      () => [S(share(), 6, 3, true), S(kDelta(), 3, 1), S(kN(), 3, 1)],
      () => [S(ring(), 4, 3, true), S(tKpi(r0(r.std) + "%", "the lowest share in the record", []), 2, 1), S(kSev(), 2, 1), S(kDelta(), 2, 1), S(trend(), 6, 2)],
      () => [S(stack(), 6, 3, true), S(kSev(), 3, 1), S(kDelta(), 3, 1)],
      () => [S(tImg("feast", "Imported cane sugar became a luxury of the rich table, then of everyone's."), 3, 3), S(sevM(), 3, 3, true), S(kSev(), 3, 1), S(kDelta(), 3, 1)],
      () => [S(tImg("sugar", "Industrial refining made sugar cheap; decay in the record peaks."), 2, 3), S(stack(), 4, 3), S(tImg("anatomy", "By the 1800s teeth were drawn, studied and repaired: the century of the anatomy plate."), 2, 2), S(kTen(), 2, 1), S(kDelta(), 2, 1), S(kSev(), 4, 1)],
    ];
    return gallery(pick, LEADS[i], L[i](), GHHP + " (n = " + r0(r.n) + ")");
  };

  P.CONTENT.wear = pick => {
    const Lr = window.LEH_RATES, W = window.WEAR_DATA, i = Math.min(pick.i, Lr.length - 1), r = Lr[i], col = pick.col, prev = Lr[i - 1];
    const ageL = W.ages[W.ages.length - 1], old = W.periods[i].cells[ageL][0], peakV = Math.max(...W.periods.map(p => p.cells[ageL][0])), young = W.periods[i].cells[W.ages[0]][0];
    const LEADS = [
      "A third of adults carry stress lines from a hard childhood.",
      "Stress lines hold at " + r0(r.any) + "%, while gritty bread grinds molars down.",
      "The most worn teeth in the record: stage " + r1(old) + " of 8 by age 60.",
      "Stress lines jump to " + r0(r.any) + "%, through famine and the Black Death.",
      "Softer food: molars wear " + r1(peakV - old) + " stages less by 60 than at the peak.",
      "More than half of industrial adults bear stress lines; a third bear two or more.",
    ];
    const peaks = () => tChart("Molar wear by age at death, period by period", ridge(W, i, false), ridge(W, i, true), ["Each peak is the mean molar wear (Smith scale, 1 unworn to 8) of adults who died at that age; this period in colour, blue for the young to orange for the old."]);
    const lines = (wd) => tChart("Wear with age", wd ? wearLines(i, col, "wide") : wearLines(i, col), wearLines(i, col, true), ["Mean molar wear by age at death; this period in colour, the others in grey."]);
    const leh = () => tChart("Adults with stress lines", bars({ vals: Lr.map(d => d.any), labels: GHs, cur: i, col, fmt: v => r0(v) + "%" }), bars({ vals: Lr.map(d => d.any), labels: GHs, cur: i, col, fmt: v => r1(v) + "%", big: true }), ["Linear enamel hypoplasia: a band of thin enamel laid down when a child under about six was starved or sick. Enamel never remodels, so the line stays for life."]);
    const ringR = [{ name: "no line", v: 100 - r.any, col: "#d9d6ce" }, { name: "one line", v: r.any - r.multi, col: lerpC("#ffffff", col.length === 7 ? col : "#3d8a8a", .55) }, { name: "two or more", v: r.multi, col }];
    const ring = () => tChart("Every adult of the period", donut(ringR, r0(r.any) + "%", "with a line", false), donut(ringR, r0(r.any) + "%", "with a line", true), ["Adults by stress lines on the worst-affected tooth."]);
    const trend = () => tChart("Stress lines, period by period", areaLine(Lr.map(d => d.any), GHs, i, col, false, v => r1(v) + "%"), areaLine(Lr.map(d => d.any), GHs, i, col, true, v => r1(v) + "%"), ["Share of adults with at least one stress line."]);
    const kAny = () => tKpi(r0(r.any) + "%", "adults with stress lines", ["About " + Math.round(r.any / 10) + " in every 10 adults; " + r0(r.n) + " scored."], picto(r.any, col), picto(r.any, col, true));
    const kMulti = () => tKpi(r0(r.multi) + "%", "with two or more lines", ["Repeated episodes of childhood stress."]);
    const kOld = () => tKpi(r1(old) + " / 8", "molar wear by age 60", ["Smith (1984) scale."]);
    const kYoung = () => tKpi(r1(young) + " → " + r1(old), "wear from " + W.ages[0] + " to " + ageL, ["A lifetime of chewing on one molar."]);
    const kDrop = () => tKpi("−" + r1(peakV - old), "stages less wear than the peak", ["Peak: " + r1(peakV) + " by age 60."]);
    const kDelta = () => tKpi((r.any - prev.any > 0 ? "+" : "") + r1(r.any - prev.any), "points vs " + GHs[i - 1], [r1(prev.any) + "% then."]);
    const L = [
      () => [S(tImg("ruins", "Coarse, stone-ground grain wore molars flat."), 4, 3), S(kAny(), 2, 1), S(tImg("bath"), 2, 2), S(lines(true), 6, 2)],
      () => [S(leh(), 6, 3, true), S(kAny(), 3, 1), S(kMulti(), 3, 1)],
      () => [S(peaks(), 6, 3, true), S(kOld(), 3, 1), S(kYoung(), 3, 1)],
      () => [S(ring(), 4, 3, true), S(kDelta(), 2, 1), S(tImg("skull", "Stress lines are laid down while a child's teeth form, here still inside the jaw. Late medieval children lived through famine and the Black Death."), 2, 2), S(trend(), 6, 2)],
      () => [S(lines(true), 6, 3), S(tImg("jaws", "An 18th-century engraving of the teeth in their jaws."), 2, 3), S(kDrop(), 4, 1), S(kMulti(), 4, 1), S(kDelta(), 4, 1)],
      () => [S(tImg("mill", "Child labour, crowding and hunger: stress lines peak in the industrial record."), 2, 3), S(peaks(), 4, 3), S(kAny(), 3, 1), S(kMulti(), 3, 1)],
    ];
    return gallery(pick, LEADS[i], L[i](), GHHP + " (n = " + r0(r.n) + ")");
  };

  P.CONTENT.metals = pick => {
    const D = window.METALS_DATA, i = Math.min(pick.i, D.periods.length - 1), p = D.periods[i], pb = D.lead[i], col = pick.col;
    const ppm = v => fppm(v) + " ppm", iron = D.lead[2], ratio = pb / D.leadArch, yr = y => y < 0 ? -y + " BCE" : y + " CE";
    const lab = ["Neol.", "Bronze", "Iron", "Roman", "Post-R.", "E. med.", "L. med.", "20th c."];
    const LEADS = [
      "Almost no lead: " + ppm(pb) + " in Neolithic children's enamel.",
      "The cleanest childhoods in the record: " + ppm(pb) + ".",
      "Still pristine before Rome: " + ppm(pb) + ".",
      "Rome's pipes and pewter: enamel lead jumps " + r0(pb / iron) + "-fold, to " + ppm(pb) + ".",
      "With Rome gone, lead falls back to " + ppm(pb) + ".",
      "Lead returns: " + ppm(pb) + ", " + r0(pb / D.lead[4]) + " times post-Roman levels.",
      ppm(pb) + ": glazed pots, pewter and lead roofs.",
      "Leaded petrol and smokestacks: " + ppm(pb) + ", over " + Math.floor(pb / iron / 10) * 10 + " times the Iron Age.",
    ];
    const star = () => tChart("Eight metals against the archaeological level", radar(D, i, col, false), radar(D, i, col, true), ["Each spoke is one metal in childhood enamel against its pooled archaeological level (Kamenov et al. 2018), log scale: the solid ring is ×1, no change. Only lead is measured era by era."]);
    const orb = () => tChart("Lead in childhood enamel, era by era", orbs(D, i, false), orbs(D, i, true), ["Median lead (ppm) in childhood enamel. Log scale: each line up is ten times more."]);
    const logb = () => tChart("Lead, all eight periods", bars({ vals: D.lead, labels: lab, cur: i, col, log: true, min: .03, max: 8, fmt: ppm }), bars({ vals: D.lead, labels: lab, cur: i, col, log: true, min: .03, max: 8, fmt: v => fppm(v), big: true }), ["Median lead (ppm), log scale."]);
    const trend = () => tChart("Lead across the eras", areaLine(D.lead, lab, i, col, false, ppm), areaLine(D.lead, lab, i, col, true, ppm), ["Median lead (ppm) on a straight scale: before 1900 almost nothing, then the 20th century."]);
    const els = D.elements.map(([k, n]) => ({ name: n, v: D.modern[k] / D.pooled[k], txt: "×" + r1(D.modern[k] / D.pooled[k]), col: D.colours[k] })).filter(e => e.name !== "lead").sort((a, b) => b.v - a.v);
    const other = () => tChart("Other metals vs the past", hbars(els, { col, big: true, log: true, ref: 1, w: 320, rh: 30 }), hbars(els, { col, big: true, log: true, ref: 1 }), ["20th-century enamel against archaeological enamel in the same study. Copper, chromium and nickel are industrial; zinc, strontium and magnesium belong to enamel itself."]);
    const kp = () => tKpiH("<b class='pp-num ink'>" + fppm(pb) + "<small>ppm</small></b>", "median lead in childhood enamel", [p.p + ": childhood " + yr(p.y[0]) + " – " + yr(p.y[1]) + " · n = " + r0(p.n) + "."]);
    const kr = () => tKpiH("<b class='pp-num red'>×" + (ratio < 1 ? r1(ratio) : r0(ratio)) + "</b>", "the archaeological average", ["Against pooled archaeological enamel (Kamenov et al. 2018)."]);
    const kn = () => tKpi(r0(p.n), "children measured", [p.p + "."]);
    const kStep = () => { const q = D.lead[i - 1], x = pb / q; return tKpi((x >= 1 ? "×" + r1(x) : "÷" + r1(1 / x)), "vs the " + D.periods[i - 1].p + " period", [ppm(q) + " then, " + ppm(pb) + " now."]); };
    const L = [
      () => [S(orb(), 6, 3, true), S(kp(), 3, 1), S(kn(), 3, 1)],
      () => [S(logb(), 6, 3, true), S(kp(), 3, 1), S(kr(), 3, 1)],
      () => [S(star(), 4, 3), S(kp(), 2, 1), S(kStep(), 2, 1), S(kr(), 2, 1)],
      () => [S(tImg("plumb", "Rome's water ran through lead pipes; plumbing is named for plumbum, lead."), 3, 3), S(orb(), 3, 3), S(kp(), 3, 1), S(kStep(), 3, 1)],
      () => [S(logb(), 6, 3, true), S(kp(), 3, 1), S(kStep(), 3, 1)],
      () => [S(star(), 6, 3), S(tImg("am3d", "Today metal goes into teeth on purpose: amalgam mixes mercury with silver, tin and copper."), 3, 3), S(kp(), 3, 1), S(kr(), 3, 1), S(kn(), 3, 1)],
      () => [S(trend(), 6, 3, true), S(tImg("amClin", "A filling puts metal straight into the enamel, and the tooth's own record of metals is overwritten."), 3, 3), S(kp(), 3, 1), S(kStep(), 3, 1), S(kr(), 3, 1)],
      () => [S(tImg("kilns", "Coal smoke, smelting and leaded petrol put metals into 20th-century children."), 2, 3), S(other(), 4, 3), S(kp(), 3, 1), S(kr(), 3, 1), S(tImg("mask", "The 20th-century dentist's chair: anaesthetic, the drill, then a metal filling."), 2, 3), S(tImg("amTool", "Amalgam is packed into the drilled cavity and carved to the tooth's shape."), 2, 3), S(tImg("amClin"), 2, 3)],
    ];
    return gallery(pick, LEADS[i], L[i](), i === 7 ? "Kamenov et al. 2018 (n = 77)" : "Montgomery et al. 2010; Kamenov et al. 2018");
  };

  P.CONTENT.pathogens = pick => {
    const D = window.PATHOGENS_DATA, c = pick.from, g = D.genomes[c] || 0, col = pick.col;
    const cents = []; for (let y = 100; y <= 1800; y += 100) cents.push(y);
    const ci = Math.max(0, cents.indexOf(c));
    const found = D.taxa.filter(t => t.cells[c] && t.kind !== "other").sort((a, b) => b.cells[c][0] - a.cells[c][0]);
    const top = found[0], plague = D.taxa.find(t => t.taxon === "Yersinia pestis"), pl = plague && plague.cells[c];
    const LEADS = {
      500: "The Plague of Justinian: plague DNA in teeth from the 500s.",
      600: "Justinian's plague returns in waves: " + (pl ? pl[0] + " of " + g : "") + " genomes.",
      900: "Smallpox in " + ((D.taxa.find(t => t.name === "smallpox") || { cells: {} }).cells[900] || [0])[0] + " of " + g + " genomes from the 900s.",
      1300: "The Black Death: plague in " + (pl ? pl[0] : 0) + " of " + g + " genomes from the 1300s.",
      1500: "Plague again: " + (pl ? pl[0] : 0) + " of " + g + " genomes, the record's busiest century.",
      1600: "Plague in " + (pl ? pl[0] : 0) + " of " + g + " genomes as epidemics swept Europe.",
    };
    const lead = LEADS[c] || (top ? top.name[0].toUpperCase() + top.name.slice(1) + " in " + r0(top.cells[c][1]) + "% of the " + g + " genomes from the " + c + "s." : g + " genomes recovered from the " + c + "s.");
    const full = () => tChart("The whole pathogen strand, 100s–1800s", helix(D, c, 18, false), helix(D, c, 18, true), ["Every century of the record, one rung each: one dot = 2% of the century's genomes, the darkest the pathogen found most."]);
    const strand = () => tChart("Pathogen DNA, century by century", helix(D, c, 5, false), helix(D, c, 9, true), ["A section of the pathogen strand: each rung is one century's genomes from European teeth, one dot = 2%. The darkest dots are the pathogen found most; the band marks the century clicked."]);
    const rows = found.map(t => ({ name: t.name, v: t.cells[c][1], txt: r0(t.cells[c][1]) + "%", col: D.colours[t.kind] }));
    const which = () => tChart("Pathogens in the " + c + "s", hbars(rows.slice(0, 4), { col }), hbars(rows, { col, big: true, w: 460, lx: 170 }), ["Share of the century's genomes each pathogen was found in. Bacteria red, viruses blue, parasites green."]);
    const kinds = {}; found.forEach(t => kinds[t.kind] = (kinds[t.kind] || 0) + t.cells[c][0]);
    const kr = Object.keys(kinds).map(k => ({ name: k === "virus" ? "viruses" : k === "bacteria" ? "bacteria" : k + "s", v: kinds[k], col: D.colours[k] || GREY }));
    const ring = () => tChart("Bacteria, viruses, parasites", donut(kr, r0(g), "genomes", false), donut(kr, r0(g), "genomes", true), ["The century's genomes by kind of pathogen."]);
    const perC = () => tChart("Genomes per century", bars({ vals: cents.map(k => D.genomes[k] || 0), labels: cents.map(k => k + "s"), cur: ci, col, fmt: v => r0(v) }), bars({ vals: cents.map(k => D.genomes[k] || 0), labels: cents.map(k => k + "s"), cur: ci, col, fmt: v => r0(v), big: true }), ["Pathogen genomes recovered from European dental samples. Counts reflect where researchers looked, not how common the diseases were."]);
    const plg = cents.map(k => D.genomes[k] ? ((plague && plague.cells[k]) ? plague.cells[k][1] : 0) : null);
    const sh = nm => { const t = D.taxa.find(x => x.name === nm); return cents.map(k => D.genomes[k] ? (t && t.cells[k] ? t.cells[k][1] : 0) : null); };
    const MS = [{ vals: sh("leprosy"), col: "#2f6f73", name: "leprosy" }, { vals: sh("smallpox"), col: "#7a6a9a", name: "smallpox" }];
    const plT = () => tChart("Plague, leprosy and smallpox, century by century", areaLine(plg, cents.map(k => k + "s"), ci, col, false, v => r0(v) + "%", MS, "plague"), areaLine(plg, cents.map(k => k + "s"), ci, col, true, v => r0(v) + "%", MS, "plague"), ["Share of each century's genomes in which each disease was found. Gaps: centuries with no samples."]);
    const dand = () => tChart("Every century, one seed", dandelion(D, c, false), dandelion(D, c, true), ["Each seed is one century of the record, clockwise from the 100s to the 1800s. Its stalk and size grow with the genomes recovered; its colour is the kind of pathogen found most (bacteria red, viruses blue, parasites green). The century clicked is inked in."]);
    const kG = () => tKpi(r0(g), "genomes from the " + c + "s", ["Each genome is a pathogen's DNA read from a tooth's pulp chamber."]);
    const kTop = () => top ? tKpi(r0(top.cells[c][1]) + "%", top.name, [top.taxon + ": found in " + top.cells[c][0] + " of " + g + " genomes."]) : tKpi("—", "no disease agent identified", []);
    const kF = () => tKpi(r0(found.length), "different diseases found", [found.map(t => t.name).join(", ") + "."]);
    const IMGS = { 500: () => [S(tImg("justP", "Constantinople, 541: the first recorded pandemic of plague."), 4, 3), S(tImg("justE"), 2, 3), S(plT(), 6, 3, true)],
      1300: () => [S(tImg("sick", "The Black Death, 1347–1351."), 3, 3), S(strand(), 3, 3), S(kG(), 3, 1), S(kTop(), 3, 1), S(tImg("doctor", "The beaked plague doctor became the figure of plague in Europe."), 2, 3), S(tImg("yard", "Plague's dead filled the churchyards; their teeth still hold its DNA."), 4, 3)],
      1600: () => [S(tImg("ashdod", "Poussin's plague, painted in a century of plague."), 4, 3), S(kTop(), 2, 1), S(kG(), 2, 1), S(kF(), 2, 1), S(perC(), 6, 2)],
      100: () => [S(full(), 4, 6, true), S(kG(), 2, 1), S(kTop(), 2, 1), S(kF(), 2, 1), S(which(), 2, 3)] };
    const CYC = [
      () => [S(strand(), 6, 3, true), S(kG(), 3, 1), S(kTop(), 3, 1)],
      () => [S(which(), 6, 3, true), S(kF(), 3, 1), S(kG(), 3, 1), S(dand(), 6, 5), S(kTop(), 6, 1)],
      () => [S(strand(), 4, 3), S(kTop(), 2, 1), S(kG(), 2, 1), S(kF(), 2, 1), S(perC(), 6, 2)],
      () => [S(ring(), 4, 3, true), S(kTop(), 2, 1), S(kG(), 2, 1), S(kF(), 2, 1), S(plT(), 6, 2)],
    ];
    const tiles = (IMGS[c] || CYC[ci % 4])(), PIMG = { 100: "pat6", 200: "pat1", 400: "pat2", 700: "pat3", 900: "pat4", 1100: "pat5" };
    // the 400s, 900s and 1100s open on their picture; the 200s and 700s keep it under everything else
    if (PIMG[c]) { const t = S(tImg(PIMG[c]), 6, 3); if (c === 100 || c === 400 || c === 900 || c === 1100) tiles.unshift(t); else tiles.push(t); }
    return gallery(pick, lead, tiles, "AncientMetagenomeDir (SPAAM), European dental samples");
  };

  P.CONTENT.interventions = pick => {
    const D = window.INTERVENTIONS_DATA, i = Math.min(pick.i, D.periods.length - 1), r = D.periods[i], col = pick.col;
    const lab = ["900–1200", "1460–1670", "1800s", "2009"];
    const LEADS = [
      "Repair was rare: " + r.teeth + " grooved teeth among " + r0(r.people) + " people.",
      "Teeth tied in with wire, one replaced: " + r1(r.per100) + " repairs per 100 people.",
      "Dentures arrive: " + r1(r.per100) + " repaired teeth per 100 people.",
      r0(r.per100) + " repaired teeth per 100 people, nearly " + Math.round(r.per100 / D.periods[2].per100 / 10) * 10 + " times the 1800s.",
    ];
    const rate = () => tChart("Repaired teeth per 100 people", bars({ vals: D.periods.map(p => p.per100), labels: lab, cur: i, col, log: true, min: .3, max: 1000, fmt: v => r1(v) }), bars({ vals: D.periods.map(p => p.per100), labels: lab, cur: i, col, log: true, min: .3, max: 1000, fmt: v => r1(v), big: true }), ["Log scale. The same quantity on both sides of 1850; extractions excluded."]);
    const dots = () => tChart("A hundred people, " + lab[i], dotGrid(r.per100, col), dotGrid(r.per100, col), ["Each dot is one person; the filled ones count repaired teeth per 100 people (" + r1(r.per100) + ")."]);
    const kRate = () => tKpi(r1(r.per100), "repaired teeth per 100 people", [r.detail + "."]);
    const kPeople = () => tKpi(r0(r.people), "individuals examined", [r.p + "."]);
    const kTeeth = () => tKpi(r.teeth + "", "teeth repaired", [r.detail + "."]);
    const L = [
      () => [S(tImg("dent", "Long before fillings, loose teeth were bound to their neighbours with gold wire."), 3, 3), S(rate(), 3, 3), S(kTeeth(), 3, 1), S(kPeople(), 3, 1)],
      () => [S(dots(), 3, 3), S(kRate(), 3, 1), S(kPeople(), 3, 1), S(kTeeth(), 3, 1)],
      () => [S(tImg("surgeons", "Anaesthesia and antisepsis turned the extraction chair into a surgery."), 4, 3), S(kRate(), 2, 1), S(tImg("tools"), 2, 2), S(rate(), 6, 2)],
      () => [S(tImg("amalgam", "Every filling erases the decay a tooth recorded."), 3, 3), S(tImg("tap", "Fluoride, fillings and crowns: the record of a mouth is now the record of its dentist."), 3, 3), S(kRate(), 3, 1), S(tKpi(r0(r.people), "individuals examined", []), 3, 1)],
    ];
    return gallery(pick, LEADS[i], L[i](), r.cite);
  };
})();
