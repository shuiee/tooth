/* The pop-ups' content (window.ToothPopup.CONTENT), record by record, on the template in js/popup.js: three slides
   (the key insight with the record's main chart, a further insight with a supporting chart, the correlating human
   event), and the source. Every chart is the same for every period on its line, showing only the period clicked; two
   periods compared (pick.pair) show both, with a comparison in the slide's line of text. Every number is read from the
   data files (js/*-data.js); none is typed here. Records not written yet keep the template's placeholders.

   Caries (js/caries-data.js): the main chart, every adult in the period sorted by how many of their own teeth were
   carious (CARIES_RATES sev: none, 1-2, 3-4, 5-9, 10+), from the team's c2b severity figure; the supporting chart,
   the share of adults with at least one carious tooth by age at death (CARIES_AGE), from its c1b figure. The figures'
   footnotes are left out for now. The third slide, the human events of the team's list whose years overlap the period
   (CARIES_EVENTS; context, not data), with the team's measured effect in caries per tooth. A period in no event has two
   slides.

   Pathogens (js/pathogens-data.js): the main chart, the prototype's pathogen strand (its Fig. 2.2, from the team's c4b
   matrix), cut down to the centuries around the one clicked, with its hover and its pull-out (strandChart); the
   supporting chart, every organism found in the century by its share of the century's genomes; the third slide, the
   events of the team's list the century falls in (context, not data), with their organism's share of it. A century
   in no event has two slides.

   Metals (js/metals-data.js): the main chart, the prototype's radial chart (its Plate 4.A), one petal for the period
   clicked (bloomChart; two compared, one petal morphing between them in step with the molar); the supporting chart, its
   line graph (Plate 4.B), drawn for the period clicked alone (lineChart). No events yet, so two slides. */
(function () {
  "use strict";
  const P = window.ToothPopup; if (!P) return;
  const esc = v => String(v).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
  const r0 = v => Math.round(v);
  const fx = v => (Math.round(v * 10) / 10).toString();
  const ph = (label, cls) => "<div class='pp-ph" + (cls ? " " + cls : "") + "'><span>" + label + "</span></div>";
  // an SVG drawing at its box's own width, in pixels, so its type is the page's size at any width; drawn (and drawn
  // again whenever the box changes width) once the card is on the page: chart(draw) puts the box in a slide, and the
  // card's mount draws it. A drawing is its HTML, or { html, wire(box) } for one that answers the pointer
  const svg = (w, h, inner, label, cls) => "<svg class='pp-svg" + (cls ? " " + cls : "") + "' width='" + fx(w) + "' height='" + fx(h) + "' viewBox='0 0 " + fx(w) + " " + fx(h) + "' role='img' aria-label='" + esc(label) + "'>" + inner + "</svg>";
  const charts = draws => ({ body: k => "<div class='pp-chart' data-k='" + k + "'></div>",
    mount: panel => panel.querySelectorAll(".pp-chart[data-k]").forEach(el => { const f = draws[+el.dataset.k]; if (!f) return;
      const go = () => { const w = Math.floor(el.clientWidth); if (w > 40 && !(Math.abs(w - (el._w || 0)) < 6)) { el._w = w; const d = f(w); el.innerHTML = d.html || d; if (d.wire) d.wire(el); } };
      if (window.ResizeObserver) new ResizeObserver(go).observe(el); requestAnimationFrame(go); }) });
  const T = (x, y, s, o) => { o = o || {}; return "<text x='" + fx(x) + "' y='" + fx(y) + "'" + (o.a ? " text-anchor='" + o.a + "'" : "") + " font-size='" + (o.s || 11) + "' fill='" + (o.c || "#55544f") + "'" + (o.w ? " font-weight='" + o.w + "'" : "") + (o.i ? " font-style='italic'" : "") + ">" + esc(s) + "</text>"; };
  const L = (x1, y1, x2, y2, c, w, dash) => "<line x1='" + fx(x1) + "' y1='" + fx(y1) + "' x2='" + fx(x2) + "' y2='" + fx(y2) + "' stroke='" + c + "' stroke-width='" + (w || 1) + "'" + (dash ? " stroke-dasharray='" + dash + "'" : "") + "/>";
  const low = p => p.charAt(0).toLowerCase() + p.slice(1);
  const B = v => "<b>" + v + "</b>";
  // labels in title case (short words lower, but the first)
  const title = t => t.split(" ").map((w, i) => i && /^(of|or|and|the|in|at|to|a|an|by|for|on)$/i.test(w) ? w.toLowerCase() : w.split("-").map(x => x.charAt(0).toUpperCase() + x.slice(1)).join("-")).join(" ");
  // a label's width in the page's type, for laying out keys
  let meas = null;
  const tw = (t, px) => { if (!meas) { const g = document.createElementNS("http://www.w3.org/2000/svg", "svg"); g.setAttribute("class", "pp-svg"); g.setAttribute("aria-hidden", "true");
      g.style.cssText = "position:absolute;left:-9999px;top:0;width:10px;height:10px;visibility:hidden"; meas = document.createElementNS("http://www.w3.org/2000/svg", "text"); g.appendChild(meas); document.body.appendChild(g); }
    meas.setAttribute("font-size", px); meas.textContent = t; return meas.getComputedTextLength(); };

  // ---- caries
  const CR = window.CARIES_RATES || [], CA = window.CARIES_AGE || { ages: [], periods: [] };
  // the severity bands, light to dark in the caries colour (no caries: the paper)
  const SEV = [["No Caries", "#dcdad3", "#1a1a18"], ["1–2 Teeth", "#efd3b2", "#1a1a18"], ["3–4 Teeth", "#e3a46a", "#1a1a18"], ["5–9 Teeth", "#c2611a", "#fff"], ["10+ Teeth", "#6f320b", "#fff"]];
  const five = r => r.sev[3] + r.sev[4];
  // the main chart: each period clicked as one bar of all its adults, by how many of their teeth were carious
  function sevChart(rs, W) {
    const two = rs.length > 1, x0 = two ? 112 : 0, bw = W - x0, bh = two ? 34 : 46, gap = two ? 14 : 0, G = "#8a8983";
    let s = T(0, 13, "Number of Carious Teeth", { s: 12, c: G, i: true });
    // the key, on one line, its items evenly spaced (smaller, then on two lines, only if the box is too narrow)
    const kw = px => SEV.map(([lab]) => 17 + tw(lab, px)), fits = px => kw(px).reduce((a, b) => a + b, 0) + 14 * (SEV.length - 1) <= W, ks = fits(13) ? 13 : fits(12) ? 12 : 11;
    const iws = kw(ks), sp = Math.max(14, Math.min(40, (W - iws.reduce((a, b) => a + b, 0)) / (SEV.length - 1)));
    let lx = 0, ly = 24; SEV.forEach(([lab, col], j) => { if (lx && lx + iws[j] > W + 0.5) { lx = 0; ly += 22; }
      s += "<rect x='" + fx(lx) + "' y='" + ly + "' width='12' height='12' fill='" + col + "'/>" + T(lx + 17, ly + 11, lab, { s: ks }); lx += iws[j] + sp; });
    // over the bars: the share with five or more carious teeth, bracketed over its segments at the right; for two, the
    // share with none too, bracketed over its segments at the left. On one line where both fit apart, else on two
    const tb = "Five or More Carious Teeth: " + rs.map(r => r0(five(r)) + "%").join(" → "), ta = two ? "No Caries: " + rs.map(r => r0(r.sev[0]) + "%").join(" → ") : "";
    const xb = Math.min(...rs.map(r => x0 + bw * (100 - five(r)) / 100)), xn = Math.max(...rs.map(r => x0 + bw * r.sev[0] / 100));
    const one = !two || x0 + tw(ta, 12.5) + 24 <= W - 1 - tw(tb, 12.5);
    const bracket = (x1, x2, y) => L(x1, y, x2, y, G) + L(x1, y, x1, y + 6, G) + L(x2, y, x2, y + 6, G);
    let yc = ly + 46;
    if (two) { s += T(x0, yc, ta, { s: 12.5, c: "#3b3a36" }) + bracket(x0, xn - 2, yc + 9); if (!one) yc += 34; }
    s += T(W - 1, yc, tb, { a: "end", s: 12.5, c: "#3b3a36" }) + bracket(xb, W - 1, yc + 9);
    const y0 = yc + 25;
    rs.forEach((r, k) => { const y = y0 + k * (bh + gap); let x = x0;
      if (two) s += T(x0 - 12, y + bh / 2 + 4.5, title(r.p), { a: "end", s: 12.5, c: "#1a1a18" });
      r.sev.forEach((v, j) => { const w = bw * v / 100; s += "<rect x='" + fx(x) + "' y='" + y + "' width='" + fx(Math.max(0, w - 2)) + "' height='" + bh + "' fill='" + SEV[j][1] + "'/>";
        if (w > 26) s += T(x + w / 2 - 1, y + bh / 2 + 5, r0(v) + "", { a: "middle", s: 14, c: SEV[j][2], w: 600 }); x += w; }); });
    // the x axis: the share of all adults in the period
    const ya = y0 + rs.length * bh + (rs.length - 1) * gap + 8;
    s += L(x0, ya, W - 1, ya, "rgba(26,26,24,.3)");
    [0, 20, 40, 60, 80, 100].forEach(v => { const x = x0 + bw * v / 100 - (v === 100 ? 1 : 0); s += L(x, ya, x, ya + 5, G) + T(x, ya + 20, v + "%", { a: v === 0 ? "start" : v === 100 ? "end" : "middle", s: 12, c: G }); });
    s += T(x0 + bw / 2, ya + 40, "Share of All Adults in the Period", { a: "middle", s: 12.5, c: G, i: true });
    return svg(W, ya + 46, s, "Adults by number of carious teeth, " + rs.map(r => r.p).join(" and "));
  }

  // the supporting chart: the share of adults with a carious tooth by age at death, one line per period clicked
  function ageChart(ps, cols, W) {
    const H = 220, l = 38, r = ps.length > 1 || W >= 420 ? 92 : 74, t = 14, b = 34, ages = CA.ages, lo = 20, hi = 90;
    const X = j => l + (W - l - r) * j / (ages.length - 1), Y = v => t + (H - t - b) * (hi - v) / (hi - lo);
    let s = "";
    [20, 40, 60, 80].forEach(v => { s += L(l, Y(v), W - r, Y(v), "rgba(26,26,24,.1)") + T(l - 8, Y(v) + 4, v + "%", { a: "end", s: 11, c: "#8a8983" }); });
    // the age bands under the axis (every other one where they would crowd)
    const step = (W - l - r) / (ages.length - 1) < tw("18–24", 11) + 8 ? 2 : 1;
    ages.forEach((a, j) => { if (j % step === 0 || j === ages.length - 1) s += T(X(j), H - b + 16, a, { a: "middle", s: 11, c: "#55544f" }); });
    s += T((l + W - r) / 2, H - 2, "Age at Death", { a: "middle", s: 11, c: "#8a8983", i: true });
    ps.forEach((p, k) => { const c = cols[k], pts = p.cells.map((cl, j) => [X(j), Y(cl[0])]);
      s += "<polyline points='" + pts.map(q => fx(q[0]) + "," + fx(q[1])).join(" ") + "' fill='none' stroke='" + c + "' stroke-width='" + (k ? 2.6 : 2) + "' stroke-linejoin='round'/>";
      pts.forEach(q => { s += "<circle cx='" + fx(q[0]) + "' cy='" + fx(q[1]) + "' r='3' fill='" + c + "' stroke='#f3f2ee' stroke-width='1'/>"; });
      const end = pts[pts.length - 1], v = p.cells[p.cells.length - 1][0];
      // the line's name and its last value, at its end (pushed apart if the two would meet)
      let ey = end[1] + 4; if (ps.length > 1 && k === 1) { const o = Y(ps[0].cells[ps[0].cells.length - 1][0]) + 4; if (Math.abs(ey - o) < 32) ey = o + (ey >= o ? 32 : -32); }
      s += T(end[0] + 10, ey - 6, ps.length > 1 ? title(p.p) : "", { s: 11.5, c, w: 600 }) + T(end[0] + 10, ey + 7, r0(v) + "% at 60+", { s: 11.5, c });
      // the youngest's value, at the line's start
      const up = ps.length < 2 || p.cells[0][0] >= ps[1 - k].cells[0][0];   // above the point, or below it for the lower of two
      s += T(pts[0][0] + 8, pts[0][1] + (up ? -9 : 17), r0(p.cells[0][0]) + "%", { s: 11, c, w: 600 }); });
    // two compared: the gap at 18–24, between the two first points
    if (ps.length > 1) { const a = Y(ps[0].cells[0][0]), z = Y(ps[1].cells[0][0]), x = X(0); if (Math.abs(a - z) > 30) s += L(x, Math.min(a, z) + 20, x, Math.max(a, z) - 20, "#8a8983", 1, "2 3"); }
    return svg(W, H, s, "Share of adults with at least one carious tooth by age at death, " + ps.map(p => p.p).join(" and "));
  }
  // the human events of the team's list (js/caries-data.js, CARIES_EVENTS; context, not data) whose years overlap the
  // period clicked, the narrowest first: each its picture on the left (a placeholder until it has one) and on the right
  // its name, years, what it shows and the team's measured effect, in caries per tooth
  const CE = window.CARIES_EVENTS || [];
  // an event's pictures (one, or several stacked), or a placeholder
  const evPics = e => { const a = e.img ? [].concat(e.img) : []; return a.length ? "<div class='pp-evp'>" + a.map(m => "<img src='" + esc(m.src) + "' alt='" + esc(m.alt) + "'>").join("") + "</div>" : ph("Image"); };
  const cOver = (e, q) => e.from < q.to && e.to > q.from, pt = v => v.toFixed(3);
  const cariesEventsOf = picks => CE.filter(e => picks.some(q => cOver(e, q))).sort((a, b) => (a.to - a.from) - (b.to - b.from));
  function cariesEffect(e, picks) {
    if (e.per) { const s = e.per, lo = s.reduce((m, x) => x[1] < m[1] ? x : m, s[0]), hi = s.reduce((m, x) => x[1] > m[1] ? x : m, s[0]);
      return "Caries per tooth rose from " + B(pt(s[0][1])) + " in " + s[0][0] + " to " + andList(s.slice(1).map(x => B(pt(x[1])) + " in " + x[0])) + ", " + B(fx(hi[1] / lo[1])) + " times the " + lo[0] + " low."; }
    return "";
  }
  function cariesEventsHTML(evs, picks) {
    return "<div class='pp-evs" + (evs.length > 1 ? " sc" : "") + "'>" + evs.map(e => "<figure class='pp-ev'>" +
      evPics(e) +
      "<figcaption><b>" + esc(e.name) + "</b><span class='pp-evd'>" + e.from + "–" + e.to + "</span><p>" + esc(e.line) + "</p><p>" + cariesEffect(e, picks) + "</p></figcaption></figure>").join("") +
      "<p class='pp-evn'>Events, their years and their lines are context from the team's list. Caries per tooth (carious teeth among the teeth observed) is the team's measured effect, a different measure from the share of adults on the slides before." +
      (evs.some(e => !e.img) ? " Pictures to come." : "") + "</p></div>";
  }
  function cariesLead3(evs, picks) {
    const ps = e => picks.filter(q => cOver(e, q)).map(q => low(CR[q.i].p)), nameOf = e => low(e.name) + " (" + e.from + "–" + e.to + ")";
    const groups = []; evs.forEach(e => { const k = ps(e).join("|"), g = groups.find(x => x.k === k); if (g) g.evs.push(e); else groups.push({ k, ps: ps(e), evs: [e] }); });
    return groups.map(g => "The " + andList(g.ps) + " period" + (g.ps.length > 1 ? "s overlap" : " overlaps") +
      (g.evs.length > 1 ? " " + word(g.evs.length) + " events: " + andList(g.evs.map(nameOf)) + "." : " " + nameOf(g.evs[0]) + ".")).join("<br>");
  }
  P.CONTENT.caries = pick => {
    const picks = pick.pair || [pick], rs = picks.map(q => CR[q.i]).filter(Boolean), ag = picks.map(q => CA.periods[q.i]).filter(Boolean);
    if (rs.length !== picks.length) return {};
    const COL = ["#e3a46a", "#6f320b"], ch = charts([W => sevChart(rs, W), W => ageChart(ag, rs.length > 1 ? COL : ["#c2611a"], W)]);
    let lead1, lead2;
    if (rs.length === 1) { const r = rs[0], nc = r.sev[0], all = CR.map(x => x.sev[0]);
      lead1 = (nc === Math.max(...all) ? B(r0(nc) + "%") + " of adults had no carious tooth, the most of any period."
        : nc === Math.min(...all) ? "Only " + B(r0(nc) + "%") + " of adults escaped caries, the fewest of any period."
        : B(r0(nc) + "%") + " of adults had no carious tooth.") + "<br>" + B(r0(five(r)) + "%") + " had five or more carious teeth.";
      const c = ag.length ? ag[0].cells : null; lead2 = c ? "At 18–24, " + B(r0(c[0][0]) + "%") + " already had a carious tooth.<br>By 60 and over, " + B(r0(c[c.length - 1][0]) + "%") + " did." : "";
    } else { const [a, b] = rs, ua = r0(a.sev[0]), ub = r0(b.sev[0]), fa = r0(five(a)), fb = r0(five(b));
      lead1 = "From the " + low(a.p) + " to the " + low(b.p) + " period, adults with no caries " + (ub < ua ? "fell" : ub > ua ? "rose" : "held") + " from " + B(ua + "%") + " to " + B(ub + "%") + ".<br>Those with five or more carious teeth " + (fb > fa ? "rose" : fb < fa ? "fell" : "held") + " from " + B(fa + "%") + " to " + B(fb + "%") + ".";
      if (ag.length === 2) { const ya = r0(100 - ag[0].cells[0][0]), yb = r0(100 - ag[1].cells[0][0]);
        lead2 = "At 18–24, " + B(ya + "%") + " of " + low(a.p) + " young adults " + (ya > yb ? "still " : "") + "had no caries at all.<br>" + (yb < ya ? "By the " + low(b.p) + " period, " + B((100 - yb) + "%") + " already had a carious tooth, and only " + B(yb + "%") + " had escaped."
          : "In the " + low(b.p) + " period, " + B(yb + "%") + " had escaped, and " + B((100 - yb) + "%") + " already had a carious tooth."); } }
    const evs = cariesEventsOf(picks), slides = [{ html: lead1, body: ch.body(0) }, { html: lead2, body: ag.length ? ch.body(1) : ph("Supplemental chart") }];
    if (evs.length) slides.push({ html: cariesLead3(evs, picks), body: cariesEventsHTML(evs, picks) });
    return {
      slides, mount: ch.mount,
      source: "Global History of Health Project (Europe) · adults 18–69 · n = " + rs.map(r => r.n.toLocaleString("en-GB")).join(" and "),
    };
  };

  // ---- pathogens
  const PD = window.PATHOGENS_DATA;
  const REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pc = v => Math.round(v) + "%", cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  const WORD = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"], word = n => WORD[n] || String(n);
  const andList = a => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
  const PART = { bacteria: "a bacterium", virus: "a virus", parasite: "a malaria parasite", other: "not a disease agent" };
  const KINDS = { bacteria: "bacteria", virus: "viruses", parasite: "parasites", other: "other organisms", unnamed: "unnamed organisms" };
  const colOf = l => (PD.colours || {})[l.kind] || "#8a8983";
  // "plague — bubonic, pneumonic, septicaemic" reads "plague (bubonic, pneumonic, septicaemic)"
  const diseaseOf = l => { const [a, b] = (l.disease || "").split(" — "), tidy = t => t.replace(/ · /g, ", ").replace(/^NOT /, "not "); return tidy(a) + (b ? " (" + tidy(b) + ")" : ""); };
  // the strand, built once from the counts: its lanes (each organism, by kind and then by genomes), and each century
  // (row) with the organisms found in it, its largest share (lead) and its 50 dots shared out by largest remainder
  // (every organism found keeps at least one), as on the prototype's strand
  let PS = null;
  function strandData() {
    if (PS || !PD) return PS;
    const cents = PD.centuries, lanes = [];
    PD.kinds.forEach(([k]) => PD.taxa.filter(t => t.kind === k).sort((p, q) => q.total - p.total).forEach(t => lanes.push(t)));
    // genomes a century's total counts but the index names no organism for keep a lane of their own
    const un = cents.filter(c => PD.genomes[c] != null).map(c => [c, PD.genomes[c] - PD.taxa.reduce((s2, t) => s2 + (t.cells[c] ? t.cells[c][0] : 0), 0)]).filter(u => u[1] > 0);
    if (un.length) lanes.push({ taxon: null, name: "not named", kind: "unnamed", total: un.reduce((s2, u) => s2 + u[1], 0), cells: Object.fromEntries(un.map(([c, k]) => [c, [k, k / PD.genomes[c] * 100]])) });
    const rows = cents.map((c, i) => {
      const n = PD.genomes[c] == null ? null : PD.genomes[c], cells = n == null ? [] : lanes.filter(l => l.cells[c]).map(l => ({ l, c, i, k: l.cells[c][0], v: l.cells[c][1] }));
      const max = cells.length ? Math.max(...cells.map(d => d.v)) : 0;
      if (cells.length) { const q = cells.map(d => d.v / 2), m = q.map(v => Math.max(1, Math.floor(v))), sum = () => m.reduce((s2, v) => s2 + v, 0), byRem = q.map((v, j) => j).sort((p, z) => (q[z] - m[z]) - (q[p] - m[p]));
        for (let left = 50 - sum(), j = 0; left > 0; left--, j++) m[byRem[j % byRem.length]]++;
        for (let over = sum() - 50; over > 0; over--) m[m.indexOf(Math.max(...m))]--;
        cells.forEach((d, j) => { d.px = m[j]; }); }
      return { c, i, n, cells, max, lead: cells.filter(d => Math.abs(d.v - max) < 1e-6), thin: n != null && n < 5 };
    });
    return (PS = { cents, lanes, rows, total: rows.reduce((s2, r) => s2 + (r.n || 0), 0), maxN: Math.max(...rows.map(r => r.n || 0)), sampled: rows.filter(r => r.n != null).length });
  }
  // the twist, as on the prototype: the ribbon turns over only between the rungs in TURNS (beside small or empty
  // centuries, so the 400s, 600s, 1300s, 1500s and 1600s face the reader), turning slowly while a rung faces the reader.
  // Drawing, not data
  const TURNS = [1.5, 6.5, 10.5, 16.5];
  const twist = s => { let k = TURNS.findIndex(t => s < t); if (k < 0) k = TURNS.length;
    const a = k ? TURNS[k - 1] : TURNS[0] - (TURNS[1] - TURNS[0]), b = k < TURNS.length ? TURNS[k] : TURNS[k - 1] + (TURNS[k - 1] - TURNS[k - 2]), f = (s - a) / (b - a) - 0.5;
    return Math.PI * k + Math.PI * f - 0.5 * Math.sin(2 * Math.PI * f); };
  // a smooth line through points (Catmull-Rom, as d3's curve on the prototype)
  const smooth = ps => "M" + fx(ps[0][0]) + " " + fx(ps[0][1]) + ps.slice(1).map((p, k) => { const p1 = ps[k], p0 = ps[k - 1] || p1, p3 = ps[k + 2] || p;
    return "C" + [p1[0] + (p[0] - p0[0]) / 6, p1[1] + (p[1] - p0[1]) / 6, p[0] - (p3[0] - p1[0]) / 6, p[1] - (p3[1] - p1[1]) / 6, p[0], p[1]].map(fx).join(" "); }).join("");
  // the hover note: dark, beside the pointer, as on the prototype
  let tipEl = null;
  function tip(html, ev) {
    if (!tipEl) { tipEl = document.createElement("div"); tipEl.className = "pp-tip"; tipEl.setAttribute("role", "tooltip"); tipEl.hidden = true; document.body.appendChild(tipEl); }
    if (!html) { tipEl.hidden = true; return; }
    if (tipEl.innerHTML !== html) tipEl.innerHTML = html; tipEl.hidden = false;
    const w = tipEl.offsetWidth, h = tipEl.offsetHeight; let x = ev.clientX + 14, y = ev.clientY + 14;
    if (x + w > innerWidth - 8) x = ev.clientX - w - 14; if (y + h > innerHeight - 8) y = ev.clientY - h - 14;
    tipEl.style.left = Math.max(8, x) + "px"; tipEl.style.top = Math.max(8, y) + "px";
  }
  // dots moving, each from where it is to where it goes after its delay (ms), eased in and out, in one frame loop
  function tween(items, dur, done) {
    const t0 = performance.now(); let raf = 0;
    const step = now => { let live = false;
      items.forEach(o => { let k = (now - t0 - o.d) / dur; if (k < 1) live = true; if (k <= 0 && o.k0) return; o.k0 = true; k = Math.min(1, Math.max(0, k)); const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(2 - 2 * k, 3) / 2;
        o.el.setAttribute("cx", fx(o.x0 + (o.x1 - o.x0) * e)); o.el.setAttribute("cy", fx(o.y0 + (o.y1 - o.y0) * e)); o.el.setAttribute("r", (o.r0 + (o.r1 - o.r0) * e).toFixed(2)); });
      if (live) raf = requestAnimationFrame(step); else if (done) done(); };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }
  let SBW = null;   // a thin scroll bar's width
  const sbw = () => { if (SBW == null) { const d = document.createElement("div"); d.className = "pd-sc sc"; d.style.cssText = "position:absolute;visibility:hidden;width:100px;height:40px;overflow-y:scroll"; document.body.appendChild(d); SBW = d.offsetWidth - d.clientWidth; d.remove(); } return SBW; };

  // the main chart: the prototype's pathogen strand (its Fig. 2.2: each rung a century, 50 dots shared among the
  // organisms recovered from it, one dot for each 2% of its genomes; the dark dots its largest share, named on the
  // right; the bar beside it counts its genomes), cut down to the centuries around the one clicked, three either side,
  // which always takes in a turn of the ribbon. The century clicked is shaded in the record's colour and its largest
  // share is named in bold. Two compared show the stretch from one to the other, a century beyond each; where that is
  // more than VIS centuries, it scrolls. Hovering an organism's dots names it and its share and lights it in every
  // century shown; clicking them pulls every century's dots out of the strand into a row on the right, 50 to the row,
  // the organism's first in its colour (its share against the whole century, as on the prototype); clicking again, or
  // on the row, sends them home. The events the prototype shaded across its strand are shaded here too.
  const VIS = 8;
  function strandChart(sel, col, st) {
    const D = strandData(), R = D.rows, last = R.length - 1, lo = Math.min(...sel), hi = Math.max(...sel);
    let a = lo - (sel.length > 1 ? 1 : 3), b = hi + (sel.length > 1 ? 1 : 3);
    while (b - a < 6) { a--; b++; }
    if (a < 0) { b = Math.min(last, b - a); a = 0; } if (b > last) { a = Math.max(0, a - (b - last)); b = last; }
    const scroll = b - a + 1 > VIS;
    return W => {
      const Wg = W - (scroll ? sbw() : 0), narrow = Wg < 400, pitch = 34, pad = 14, H = (b - a + 1) * pitch + 2 * pad, G = "#8a8983";
      const bars = Wg >= 330, barX = Math.ceil(tw("1800s", 12)) + 6, barW = narrow ? 16 : 24, gutW = bars ? barX + barW + Math.ceil(tw("54", 11)) + 10 : barX + 2;
      // in a narrow box, no genome bars (the hover notes keep the counts) and a thinner ribbon
      const ribW = bars ? Math.max(118, Math.min(200, Wg * 0.34)) : Math.max(84, Math.min(118, Wg * 0.36)), cx = gutW + 4 + ribW / 2, leadX = cx + ribW / 2 + 14, dotR = ribW < 160 ? 1.1 : 1.3, TILT = 0.06;
      const yRow = i => pad + (i - a + 0.5) * pitch, yYear = Y => pad + ((Y - D.cents[0]) / 100 - a) * pitch, front = z => (z + 1) / 2;
      const at = (u, s) => { const t = twist(s), z = u * Math.sin(t); return [cx + u * ribW / 2 * Math.cos(t), pad + (s - a + 0.5) * pitch + z * ribW / 2 * TILT, z]; };
      const isSel = i => sel.includes(i);
      // the pulled-out rows: 50 dots each, and the organism's share at the end (its count too where there is room)
      const pw = tw("100%", 12.5) + 8, kw = tw("  35/51", 11), showK = (Wg - leadX - pw - kw) / 50 >= 2.2, unit = Math.min(4, (Wg - leadX - pw - (showK ? kw : 0)) / 50), pxR = Math.min(unit * 0.42, dotR + 0.35);
      // the dots, nearest the reader drawn last
      const dots = [], own = new Map();
      for (let i = a; i <= b; i++) { const r = R[i]; if (!r.cells.length) continue;
        const places = 50 + r.cells.length - 1, sq = Math.max(0.6, Math.min(1, Math.abs(Math.cos(twist(i))) * 1.15)); let k = 0;   // smaller where a rung is turned away
        r.cells.forEach(d => { const m = []; own.set(d, m);
          for (let j = 0; j < d.px; j++, k++) { const p = at((-1 + 2 * (k + 0.5) / places) * 0.94, i), o = { d, j, x: p[0], y: p[1], z: p[2], r: dotR * (0.8 + 0.4 * front(p[2])) * sq }; m.push(o); dots.push(o); }
          k++; }); }
      dots.sort((p, q) => p.z - q.z);
      let s = "";
      // the events the prototype shaded across the strand, behind everything
      const evs = (PD.events || []).filter(e => e.band);
      evs.forEach(e => { const y0 = Math.max(0, yYear(e.from)), y1 = Math.min(H, Math.max(yYear(e.to + 1), yYear(e.from) + 2.5)); if (y1 > y0) s += "<rect x='" + fx(gutW - 6) + "' y='" + fx(y0) + "' width='" + fx(Wg - gutW + 6) + "' height='" + fx(y1 - y0) + "' fill='#1a1a18' fill-opacity='.05'/>"; });
      // the century clicked, in the record's colour
      sel.forEach(i => { s += "<rect x='0' y='" + fx(yRow(i) - pitch / 2) + "' width='" + fx(Wg) + "' height='" + pitch + "' fill='" + col + "' fill-opacity='.13'/>"; });
      // the ribbon's two edges, dotted, darker where they come towards the reader, fading out at the ends shown
      const s0 = a - 0.5 - pad / pitch, s1 = b + 0.5 + pad / pitch, gap = t => R.some(r => r.n == null && Math.abs(t - r.i) < 0.5);
      for (let t = s0; t <= s1 + 1e-9; t += 3.2 / pitch) { const fade = Math.min(1, (t - s0) / 0.8, (s1 - t) / 0.8); if (fade <= 0.02) continue;
        [-1, 1].forEach(u => { const p = at(u, t); s += "<circle cx='" + fx(p[0]) + "' cy='" + fx(p[1]) + "' r='" + (0.7 + 1.1 * front(p[2])).toFixed(2) + "' fill='#1a1a18' opacity='" + ((0.2 + 0.52 * front(p[2])) * (gap(t) ? 0.35 : 1) * fade).toFixed(3) + "'/>"; }); }
      for (let i = a; i <= b; i++) if (R[i].n == null) s += T(cx, yRow(i) + 4, "No Samples", { a: "middle", s: 11, c: G, i: true });
      s += "<g class='pd-lane'></g><g class='pd-dots'>" + dots.map(o => "<circle cx='" + fx(o.x) + "' cy='" + fx(o.y) + "' r='" + o.r.toFixed(2) + "'/>").join("") + "</g>";
      // the century and its genomes, on the left
      for (let i = a; i <= b; i++) { const r = R[i], y = yRow(i);
        s += T(0, y + 4, r.c + "s", { s: 12, c: isSel(i) ? "#1a1a18" : "#55544f", w: isSel(i) ? 600 : 0 });
        if (r.n == null || !bars) continue; const bw = Math.max(1, barW * r.n / D.maxN);
        s += "<rect x='" + barX + "' y='" + fx(y - 3) + "' width='" + fx(bw) + "' height='6' fill='#b9b7b0'/>" + T(barX + bw + 4, y + 4, r.n, { s: 11, c: G }); }
      // on the right, each century's largest share; the clicked one's organism in bold
      s += "<g class='pd-leads'>";
      for (let i = a; i <= b; i++) { const r = R[i]; if (!r.cells.length) continue; const on = isSel(i), c = r.thin && !on ? G : on ? "#1a1a18" : "#55544f";
        s += "<text x='" + fx(leadX) + "' y='" + fx(yRow(i) + 4) + "' font-size='" + (Wg - leadX >= 120 ? 12.5 : 11.5) + "' fill='" + c + "'><tspan font-weight='600'" + (on || r.thin ? "" : " fill='#1a1a18'") + ">" + pc(r.max) + (r.lead.length > 1 ? " each" : "") + "</tspan><tspan" + (on ? " font-weight='600'" : "") + ">  " +
          esc(r.lead.length > 1 ? cap(word(r.lead.length)) + " Tied" : title(r.lead[0].l.name)) + "</tspan></text>"; }
      // each event's name, in the right-hand column, in the gap between rungs nearest its start (going with the
      // largest shares while the dots are pulled out)
      evs.forEach(e => { const bi = Math.round((e.from - D.cents[0]) / 100); if (bi <= a || bi > b) return;
        // in full, or shorter (its short name, without its years, smaller) where the column is narrow
        const yrs = ", " + e.from + "–" + e.to, fit = [[e.label + yrs, 10.5], [e.short + yrs, 10.5], [e.short + yrs, 9.5], [e.short, 10.5], [e.short, 9.5]].find(([t, f]) => leadX + tw(title(t), f) <= Wg);
        if (fit) s += "<text x='" + fx(leadX) + "' y='" + fx(pad + (bi - a) * pitch + 4) + "' font-size='" + fit[1] + "' font-style='italic' fill='" + G + "' paint-order='stroke' stroke='#f3f2ee' stroke-width='3' stroke-linejoin='round'>" + esc(title(fit[0])) + "</text>"; });
      s += "</g><g class='pd-pull'></g><g class='pd-hit'>";
      // what the pointer finds: each organism's run of dots on a rung, and each century's labels
      for (let i = a; i <= b; i++) R[i].cells.forEach((d, j) => { const m = own.get(d), pts = m.map(o => fx(o.x) + " " + fx(o.y)); if (m.length < 2) pts.push(fx(m[0].x + 0.1) + " " + fx(m[0].y));
        s += "<path data-i='" + i + "' data-j='" + j + "' d='M" + pts.join("L") + "' fill='none' stroke='transparent' stroke-width='" + Math.min(14, pitch - 10) + "' stroke-linecap='round'/>"; });
      for (let i = a; i <= b; i++) if (R[i].n != null) [[0, gutW], [leadX - 4, Wg - leadX + 4]].forEach(([x, w]) => { s += "<rect class='pd-rung' data-i='" + i + "' x='" + fx(x) + "' y='" + fx(yRow(i) - pitch / 2 + 6) + "' width='" + fx(w) + "' height='" + (pitch - 12) + "' fill='transparent'/>"; });
      s += "</g>";
      // the column heads: the pulled-out rows' scale takes the right-hand one's place
      const hd = (bars ? T(barX, 14, "Genomes", { s: 11, c: G }) : "") + T(cx, 14, ribW + 24 >= tw("One Dot = 2% of the Century's Genomes", 11) ? "One Dot = 2% of the Century's Genomes" : "One Dot = 2%", { a: "middle", s: 11, c: G }) +
        "<g class='pd-lh'>" + T(leadX, 14, Wg - leadX >= tw("Found Most That Century", 11) ? "Found Most That Century" : "Most Found", { s: 11, c: G }) + "</g>" +
        "<g class='pd-ticks'>" + [0, 50, 100].map(v => T(leadX + v / 100 * 50 * unit, 14, v ? v + "%" : "0", { a: v ? "middle" : "start", s: 11, c: G })).join("") + "</g>";
      const label = "Pathogen genomes century by century, " + R.slice(a, b + 1).map(r => r.c + "s").join(", ");
      const html = "<div class='pd'>" + svg(W, 20, hd, "Column heads", "pd-head") + "<div class='pd-sc" + (scroll ? " sc" : "") + "'" + (scroll ? " style='max-height:" + (VIS * pitch + pad) + "px'" : "") + ">" + svg(Wg, H, s, label, "pd-body") + "</div><p class='pd-hint' aria-live='polite'></p></div>";

      const wire = el => {
        const body = el.querySelector(".pd-body"), head = el.querySelector(".pd-head"), sc = el.querySelector(".pd-sc"), hint = el.querySelector(".pd-hint");
        const laneG = body.querySelector(".pd-lane"), pullG = body.querySelector(".pd-pull"), leadsG = body.querySelector(".pd-leads"), segs = [...body.querySelectorAll(".pd-hit path")];
        const cs = body.querySelectorAll(".pd-dots circle"); dots.forEach((o, j) => { o.el = cs[j]; });
        let shown = null, stop = null;
        // the century's largest share dark, the rest grey; an organism hovered or chosen in its colour, the rest faded,
        // with its line through the middle of its dots (broken where a century holds none of it)
        const paint = (hl, out) => {
          dots.forEach(o => { const r = R[o.d.i]; o.el.setAttribute("fill", hl ? (o.d.l === hl ? colOf(hl) : "#a9a7a0") : r.lead.includes(o.d) ? "#1a1a18" : "#a9a7a0");
            o.el.setAttribute("opacity", (hl ? (o.d.l === hl ? 1 : 0.35) : r.thin ? 0.45 : 0.62 + 0.38 * front(o.z)).toFixed(3)); });
          let p = "", run = [];
          const end = () => { if (run.length > 1) p += smooth(run); run = []; };
          if (hl && !out) { for (let i = a; i <= b; i++) { const d = R[i].cells.find(x => x.l === hl); if (!d) { end(); continue; } const m = own.get(d), q = m[Math.floor(m.length / 2)]; run.push([q.x, q.y]); } end(); }
          laneG.innerHTML = p ? "<path d='" + p + "' fill='none' stroke='" + colOf(hl) + "' stroke-width='1' opacity='.55'/>" : "";
        };
        const pull = (hl, anim) => {
          if (stop) { stop(); stop = null; }
          leadsG.style.opacity = hl ? 0 : 1; head.classList.toggle("pulled", !!hl); [...segs, ...body.querySelectorAll(".pd-rung")].forEach(p => { p.style.pointerEvents = hl ? "none" : ""; });   // the strand is empty while its dots are out
          const to = new Map();
          if (hl) for (let i = a; i <= b; i++) { const r = R[i]; if (!r.cells.length) continue; let k = 0;
            r.cells.slice().sort((p, q) => (q.l === hl) - (p.l === hl) || q.v - p.v).forEach((c, ci) => own.get(c).forEach(o => { to.set(o, { x: leadX + (k++ + 0.5) * unit, y: yRow(i), mine: c.l === hl, tone: ci % 2 }); })); }
          if (hl) dots.forEach(o => { const t = to.get(o); o.el.setAttribute("fill", t.mine ? colOf(hl) : t.tone ? "#c9c6be" : "#a3a199"); o.el.setAttribute("opacity", ((R[o.d.i].thin ? 0.55 : 1) * (t.mine ? 1 : 0.85)).toFixed(2)); });
          const items = dots.map(o => { const t = to.get(o);
            return { el: o.el, x0: +o.el.getAttribute("cx"), y0: +o.el.getAttribute("cy"), r0: +o.el.getAttribute("r"), x1: t ? t.x : o.x, y1: t ? t.y : o.y, r1: t ? pxR : o.r,
              d: t ? (o.d.i - a) * 35 + (t.x - leadX) / unit * 9 : (o.d.i - a) * 15 + o.j * 3 }; });
          if (anim) stop = tween(items, hl ? 900 : 650, () => { stop = null; });
          else items.forEach(o => { o.el.setAttribute("cx", fx(o.x1)); o.el.setAttribute("cy", fx(o.y1)); o.el.setAttribute("r", o.r1.toFixed(2)); });
          // its share at each row's end, bold where it was the century's largest ("none" where it was not found),
          // and the 50% and 100% marks
          let g = "";
          if (hl) { [50, 100].forEach(v => { const x = leadX + v / 100 * 50 * unit; g += L(x, 2, x, H - 4, G, 0.6, "1 3"); });
            for (let i = a; i <= b; i++) { const r = R[i]; if (r.n == null) continue; const d = r.cells.find(x => x.l === hl), y = yRow(i);
              g += "<text class='pd-in' style='animation-delay:" + (anim ? 500 + (i - a) * 35 : 0) + "ms' x='" + fx(leadX + 50 * unit + 7) + "' y='" + fx(y + 4) + "' font-size='12.5' fill='" + (r.thin ? G : "#1a1a18") + "'>" +
                (d ? "<tspan font-weight='" + (r.lead.includes(d) ? 600 : 400) + "'>" + pc(d.v) + "</tspan>" + (showK ? "<tspan font-size='11' fill='" + G + "'>  " + d.k + "/" + r.n + "</tspan>" : "") : "<tspan font-size='11' fill='" + G + "'>none</tspan>") + "</text>" +
                "<rect class='pd-row' data-i='" + i + "' x='" + fx(leadX - 4) + "' y='" + fx(y - pitch / 2 + 3) + "' width='" + fx(Wg - leadX + 4) + "' height='" + (pitch - 6) + "' fill='transparent'/>"; } }
          pullG.innerHTML = g;
          pullG.querySelectorAll(".pd-row").forEach(e => { const r = R[+e.dataset.i], d = r.cells.find(x => x.l === hl);
            e.addEventListener("pointermove", ev => tip("<b>" + esc(cap(hl.name)) + "</b>, " + r.c + "s<br>" + (d ? d.k + " of " + r.n + " genomes, " + pc(d.v) : "none of " + r.n + " genomes"), ev));
            e.addEventListener("pointerleave", () => tip(null)); e.addEventListener("click", () => { tip(null); select(null, true); }); });
        };
        const hintOf = l => !l ? "Click an organism's dots to pull its share of each century out of the strand."
          : "<b>" + esc(cap(l.name)) + "</b>" + (l.taxon ? " <i>" + esc(l.taxon) + "</i>, " + PART[l.kind] : ", genomes the index does not name") + ": " + l.total + " of " + D.total + " genomes in the record, found in " +
            R.filter(r => r.cells.some(d => d.l === l)).length + " of " + D.sampled + " sampled centuries. <button class='pd-back' type='button'>Back to the strand</button>";
        const select = (l, anim) => { st.hl = l; shown = l; paint(l, !!l); pull(l, anim && !REDUCED); hint.innerHTML = hintOf(l); const bk = hint.querySelector("button"); if (bk) bk.addEventListener("click", () => select(null, true)); };
        const preview = l => { if (st.hl || l === shown) return; shown = l; paint(l); };
        segs.forEach(p => { const d = R[+p.dataset.i].cells[+p.dataset.j], r = R[d.i];
          const html = "<b>" + esc(cap(d.l.name)) + "</b>" + (d.l.taxon ? " <span class='m'>(" + esc(d.l.taxon) + ")</span>" : "") + "<br>" + d.c + "s: " + d.k + " of " + r.n + " genomes, " + pc(d.v) + (r.thin ? "<br><span class='m'>fewer than five genomes that century</span>" : "");
          p.addEventListener("pointerenter", () => preview(d.l)); p.addEventListener("pointermove", ev => tip(html, ev));
          p.addEventListener("pointerleave", () => { preview(null); tip(null); });
          p.addEventListener("click", () => { tip(null); select(st.hl === d.l ? null : d.l, true); }); });
        body.querySelectorAll(".pd-rung").forEach(e => { const r = R[+e.dataset.i];
          const html = "<b>" + r.c + "s</b>, " + r.n + " genomes<br>" + r.cells.slice().sort((p, q) => q.v - p.v).map(d => esc(cap(d.l.name)) + ": " + d.k + " (" + pc(d.v) + ")").join("<br>");
          e.addEventListener("pointermove", ev => { if (!st.hl) tip(html, ev); }); e.addEventListener("pointerleave", () => tip(null)); });
        el.onpointerleave = () => tip(null);
        // kept over a redraw: the organism pulled out, and where the strand was scrolled to
        if (scroll) { sc.scrollTop = st.top || 0; sc.addEventListener("scroll", () => { st.top = sc.scrollTop; tip(null); }); }
        select(st.hl || null, false);
      };
      return { html, wire };
    };
  }

  // the supporting chart: every organism found in the century, its share of the century's genomes, in its kind's
  // colour; two compared, a bar for each (the earlier lighter)
  function mixChart(rs, W) {
    const two = rs.length > 1, G = "#8a8983", ls = [];
    rs.forEach(r => r.cells.forEach(d => { if (!ls.includes(d.l)) ls.push(d.l); }));
    const cell = (r, l) => r.cells.find(x => x.l === l), val = (r, l) => (cell(r, l) || { v: 0 }).v;
    ls.sort((p, q) => Math.max(...rs.map(r => val(r, q))) - Math.max(...rs.map(r => val(r, p))));
    // the key: the kinds found; for two, the centuries (the earlier lighter)
    const kl = (PD.kinds || []).concat([["unnamed", "Not named"]]).filter(([k]) => ls.some(l => l.kind === k)).map(([k, lab]) => ({ c: (PD.colours || {})[k] || G, t: title(lab) }));
    const keys = kl.concat(two ? rs.map((r, j) => ({ c: "#55544f", t: r.c + "s", bar: j ? 1 : 0.4 })) : []);
    let s = "", x = 0, y = 4;
    keys.forEach(k => { const w = (k.bar != null ? 22 : 14) + tw(k.t, 12) + 18; if (x && x + w - 18 > W) { x = 0; y += 20; }
      s += (k.bar != null ? "<rect x='" + fx(x) + "' y='" + (y + 3) + "' width='16' height='7' fill='" + k.c + "' fill-opacity='" + k.bar + "'/>" : "<circle cx='" + fx(x + 5) + "' cy='" + (y + 6.5) + "' r='4.5' fill='" + k.c + "'/>") + T(x + (k.bar != null ? 22 : 14), y + 11, k.t, { s: 12 }); x += w; });
    const valW = tw("100%", 12.5) + tw("  35/51", 11) + 8, side = Math.min(W * 0.4, Math.max(...ls.map(l => tw(title(l.name), 12.5)))) + 12, over = W - side - valW < 150;
    const labW = over ? 0 : side, bw = W - labW - valW, bh = two ? 9 : 14, nh = over ? 17 : 0, rp = nh + (two ? 2 * bh + 3 : bh) + 12, y0 = y + 26;
    ls.forEach((l, j) => { const yy = y0 + j * rp + nh, c = colOf(l);
      s += over ? T(0, yy - 5, title(l.name), { s: 12.5, c: "#1a1a18" }) : T(labW - 12, yy + (two ? bh + 6 : bh / 2 + 4.5), title(l.name), { a: "end", s: 12.5, c: "#1a1a18" });
      rs.forEach((r, k) => { const d = cell(r, l), by = yy + k * (bh + 3), w = d ? bw * d.v / 100 : 0;
        if (d) s += "<rect x='" + fx(labW) + "' y='" + fx(by) + "' width='" + fx(Math.max(1.5, w)) + "' height='" + bh + "' fill='" + c + "'" + (two && !k ? " fill-opacity='.4'" : "") + "/>";
        s += T(labW + w + 6, by + bh / 2 + 4, d ? pc(d.v) : "none", { s: two ? 11.5 : 12.5, c: d ? "#1a1a18" : G, w: d && r.lead.includes(d) ? 600 : 0 });
        if (d && !two) s += T(labW + w + 10 + tw(pc(d.v), 12.5), by + bh / 2 + 4, d.k + "/" + r.n, { s: 11, c: G }); }); });
    const ya = y0 + ls.length * rp + 2;
    s += L(labW, ya, labW + bw, ya, "rgba(26,26,24,.3)");
    (bw < 130 ? [0, 100] : [0, 50, 100]).forEach(v => { const xx = labW + bw * v / 100; s += L(xx, ya, xx, ya + 5, G) + T(xx, ya + 19, v + "%", { a: v ? (v === 100 ? "end" : "middle") : "start", s: 11.5, c: G }); });
    const at = two ? "Share of Each Century's Genomes" : "Share of the Century's Genomes", aw = tw(at, 12), ax = Math.max(aw / 2, Math.min(W - aw / 2, labW + bw / 2));   // under the bars, kept in the box
    s += T(ax, ya + 37, at, { a: "middle", s: 12, c: G, i: true });
    return svg(W, ya + 43, s, "Organisms found in the " + rs.map(r => r.c + "s").join(" and ") + ", by share of genomes");
  }

  // the human events of the team's list (context, not data) that the century clicked falls in, each with a picture
  // (to come) on the left and on the right what it is and the share of the century's genomes its organism holds, read
  // from the counts. More than one scroll, one under the other
  const over = (e, r) => r.c < e.to && r.c + 100 > e.from;
  // those of the century's leading organism first, then by date
  function eventsOf(rs) { const lead = e => rs.some(r => r.lead.some(d => e.taxa.includes(d.l.taxon)) && over(e, r)) ? 0 : 1;
    return (PD.events || []).filter(e => rs.some(r => over(e, r))).sort((p, q) => lead(p) - lead(q) || p.from - q.from); }
  function eventsHTML(evs, rs) {
    const D = strandData();
    return "<div class='pp-evs" + (evs.length > 1 ? " sc" : "") + "'>" + (PD.eventsLine ? "<p class='pp-evi'>" + (PD.eventsHead ? "<b>" + esc(PD.eventsHead) + "</b>" : "") + esc(PD.eventsLine) + "</p>" : "") + evs.map(e => {
      const ls = e.taxa.map(t => D.lanes.find(l => l.taxon === t)).filter(Boolean), on = rs.filter(r => over(e, r));
      return "<figure class='pp-ev'>" + evPics(e) + "<figcaption>" + ls.map(l => "<span class='pp-evk'><i style='background:" + colOf(l) + "'></i>" + esc(KINDS[l.kind] ? cap(KINDS[l.kind]) : "") + "</span>").join("") +
        "<b>" + esc(title(e.label)) + "</b><span class='pp-evd'>" + e.from + "–" + e.to + "</span>" +
        ls.map(l => "<p><i>" + esc(l.taxon) + "</i>, the cause of " + esc(diseaseOf(l)) + ", made up " + andList(on.map(r => { const d = r.cells.find(x => x.l === l);
          return d ? B(pc(d.v)) + " of the " + r.c + "s' " + r.n + " genomes (" + d.k + ")" : "none of the " + r.c + "s' " + r.n + " genomes"; })) + ".</p>").join("") + "</figcaption></figure>"; }).join("") +
      "<p class='pp-evn'>Events and their dates are context from the team's list; the shares are read from the genome record." + (evs.some(e => !e.img) ? " Pictures to come." : "") + "</p></div>";
  }

  // the slides' lines of text, from the counts
  const nm = (l, first) => B(esc(first ? cap(l.name) : l.name));
  const sampledNear = (i, dir) => { const R = strandData().rows; for (let j = i + dir; j >= 0 && j < R.length; j += dir) if (R[j].n != null) return R[j]; return null; };
  const ledBy = r => r.lead.length > 1 ? andList(r.lead.map(d => nm(d.l))) + " tied at " + B(pc(r.max)) + " each" : nm(r.lead[0].l) + " led with " + B(pc(r.max));
  function pathLead1(rs) {
    if (rs.length > 1) { const same = rs[0].lead.length === 1 && rs[1].lead.length === 1 && rs[0].lead[0].l === rs[1].lead[0].l;
      return "In the " + rs[0].c + "s, " + ledBy(rs[0]) + " of " + B(rs[0].n) + " genomes.<br>In the " + rs[1].c + "s, " +
        (same ? nm(rs[1].lead[0].l) + " led again, with " + B(pc(rs[1].max)) : ledBy(rs[1])) + " of " + B(rs[1].n) + "."; }
    const r = rs[0], l = r.lead[0].l;
    const one = r.lead.length > 1 ? andList(r.lead.map((d, j) => nm(d.l, !j))) + " tied for the largest share of the " + r.c + "s' " + B(r.n) + " genomes, " + B(pc(r.max)) + " each."
      : nm(l, true) + " made up " + B(pc(r.max)) + " of the " + r.c + "s' " + B(r.n) + " genomes, the largest share of any organism.";
    let two = "";
    if (r.thin) two = "Only " + B(r.n) + " genomes were recovered from the century, so each one is " + B(pc(100 / r.n)) + " of it.";
    else { const nb = [sampledNear(r.i, -1), sampledNear(r.i, 1)].filter(Boolean);
      if (r.lead.length === 1) { const has = nb.filter(q => q.cells.some(d => d.l === l)), not = nb.filter(q => !q.cells.some(d => d.l === l));
        two = (has.length ? "Its share was " + andList(has.map(q => B(pc(q.cells.find(d => d.l === l).v)) + " in the " + q.c + "s")) : "") + (not.length ? (has.length ? ", and it was absent from " : "It was absent from ") + andList(not.map(q => "the " + q.c + "s")) : "") + "."; }
      else two = cap(nb.map(q => "in the " + q.c + "s, " + ledBy(q)).join("; ")) + "."; }
    return one + (two ? "<br>" + two : "");
  }
  const kindsOf = r => { const m = {}; r.cells.forEach(d => { m[d.l.kind] = (m[d.l.kind] || 0) + d.v; }); return m; };
  function pathLead2(rs) {
    const cnt = r => word(r.cells.length) + " organism" + (r.cells.length > 1 ? "s" : "");
    // two: each century's largest kind, or the one kind both share
    if (rs.length > 1) { const k2 = rs.map(r => Object.entries(kindsOf(r)).sort((p, q) => q[1] - p[1])[0]);
      return cap(cnt(rs[0])) + (rs[0].cells.length > 1 ? " were" : " was") + " identified among the " + rs[0].c + "s' genomes, and " + word(rs[1].cells.length) + " among the " + rs[1].c + "s'.<br>" +
        (k2[0][0] === k2[1][0] ? cap(KINDS[k2[0][0]]) + " made up " + B(pc(k2[0][1])) + " and " + B(pc(k2[1][1])) + " of them."
          : cap(rs.map((r, j) => "in the " + r.c + "s, " + KINDS[k2[j][0]] + " made up " + B(pc(k2[j][1]))).join("; ")) + "."); }
    const r = rs[0], k = Object.entries(kindsOf(r)).sort((p, q) => q[1] - p[1]);
    return cap(cnt(r)) + (r.cells.length > 1 ? " were" : " was") + " identified among the century's " + B(r.n) + " genomes.<br>" +
      (k.length === 1 ? "All were " + KINDS[k[0][0]] + "." : cap(KINDS[k[0][0]]) + " made up " + B(pc(k[0][1])) + ", " + andList(k.slice(1).map(([kk, v]) => KINDS[kk] + " " + B(pc(v)))) + ".");
  }
  function pathLead3(evs, rs) {
    const cs = e => andList(rs.filter(r => over(e, r)).map(r => "the " + r.c + "s")), nameOf = e => e.note + " (" + e.from + "–" + e.to + ")";
    const groups = []; evs.forEach(e => { const g = groups.find(x => x.cs === cs(e)); if (g) g.evs.push(e); else groups.push({ cs: cs(e), evs: [e] }); });
    return groups.map(g => cap(g.cs) + " overlap" + (g.evs.length > 1 ? " " + word(g.evs.length) + " events: " : " ") + andList(g.evs.map(nameOf)) + ".").join("<br>");
  }

  P.CONTENT.pathogens = pick => {
    const D = strandData(); if (!D) return {};
    const picks = pick.pair || [pick], sel = picks.map(q => D.cents.indexOf(q.from));
    if (sel.some(i => i < 0 || D.rows[i].n == null)) return {};
    const rs = sel.map(i => D.rows[i]), st = { hl: null }, ch = charts([strandChart(sel, pick.col || "#7a6a9a", st), W => mixChart(rs, W)]), evs = eventsOf(rs);
    const slides = [{ html: pathLead1(rs), body: ch.body(0) }, { html: pathLead2(rs), body: ch.body(1) }];
    if (evs.length) slides.push({ html: pathLead3(evs, rs), body: eventsHTML(evs, rs) });
    return { slides, mount: ch.mount, source: "AncientMetagenomeDir (SPAAM, CC-BY 4.0) · European dental samples · n = " + rs.map(r => r.n).join(" and ") + " genomes" };
  };

  // ---- metals
  const MD = window.METALS_DATA;
  const EL = MD ? MD.elements.map(([el, name]) => ({ el, name })) : [];
  const EA = EL.map((e, i) => i / EL.length * 2 * Math.PI);   // the spokes, lead at the top, clockwise
  const NONIND = new Set(MD ? MD.groups.nonindustrial : []);
  const LASTP = MD ? MD.periods.length - 1 : 0;
  const UP = "#c0392b", DOWN = "#2e8540";
  const fmtV = v => v >= 100 ? v.toLocaleString("en-GB") : String(v), ppmS = v => fmtV(v) + " ppm";
  const times = r => r >= 10 ? String(Math.round(r)) : (+r.toFixed(1)).toString();
  const pname = p => title(MD.periods[p].p);
  const phr = p => { const n = MD.periods[p].p; return "the " + (/(Age|century|Neolithic)$/.test(n) ? n : (/^Roman$/.test(n) ? n : low(n)) + " period"); };   // "the Roman period", "the late medieval period"
  // one value: its ppm; its change from the archaeological level in the same study (lead against 0.63 ppm, the others
  // against their pooled value, as on the prototype's radial chart); whether it is the pooled stand-in (no value for the
  // period itself); its statistic, range (lowest, highest) and the teeth behind it
  function mcell(el, p) {
    if (el === "Pb") return { ppm: MD.lead[p], x: MD.lead[p] / MD.leadArch, pooled: false, stat: p === LASTP ? "mean" : "median", rg: MD.leadRange[p], n: MD.periods[p].n };
    const now = p === LASTP, ppm = now ? MD.modern[el] : MD.pooled[el];
    return { ppm, x: ppm / MD.pooled[el], pooled: !now, stat: "mean", rg: now ? MD.modernRange[el] || null : null, n: now ? MD.periods[p].n : MD.pooledN };
  }
  // the hover note on a value, as the prototype's lead orbs read: the value, then its lowest and highest and the teeth
  const mtip1 = (e, p) => { const c = mcell(e.el, p);
    return c.stat + " " + ppmS(c.ppm) + " in childhood enamel<br><span class='m'>" + (c.pooled ? "no " + pname(p) + " measurement: the mean of " + c.n + " ancient teeth"
      : c.rg ? "lowest " + (c.rg[0] == null ? "too low to detect" : c.rg[0]) + ", highest " + c.rg[1] + " ppm, n = " + c.n : "n = " + c.n) + "</span>"; };
  const mtip = (e, ps) => "<b>" + esc(cap(e.name)) + (ps.length > 1 ? "" : ", " + pname(ps[0])) + "</b><br>" + ps.map(p => (ps.length > 1 ? pname(p) + ": " : "") + mtip1(e, p)).join("<br>");
  // a change in words, for the radial chart's labels: from the period before (one picked) or the earlier of two
  function change(el, p, q) {
    if (q < 0) return { dir: "first", l1: "earliest", l2: "period measured", s: "earliest" };
    const a = mcell(el, q), b = mcell(el, p);
    if (b.pooled) return { dir: "same", l1: "no value for", l2: "this period", s: "no value" };
    const r = b.ppm / a.ppm, than = a.pooled ? "ancient teeth" : pname(q);
    if (Math.abs(r - 1) < 0.005) return { dir: "same", l1: "no change", l2: "from " + than, s: "same" };
    return r > 1 ? { dir: "up", l1: "▲ " + times(r) + "× more", l2: "than " + than, s: "▲ " + times(r) + "×" } : { dir: "down", l1: "▼ " + times(1 / r) + "× less", l2: "than " + than, s: "▼ " + times(1 / r) + "×" };
  }
  const mix = (c, d, t) => { const h = s => [1, 3, 5].map(k => parseInt(s.slice(k, k + 2), 16)), a = h(c), b = h(d); return "#" + a.map((v, k) => Math.round(v + (b[k] - v) * t).toString(16).padStart(2, "0")).join(""); };
  const ease = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(2 - 2 * k, 3) / 2;
  let UID = 0;
  // the period the molar shows now, of two compared (popup.js, mark()): "metals:i"
  const markOf = panel => { const m = /^metals:(\d+)$/.exec((panel && panel.dataset.mark) || ""); return m ? +m[1] : null; };
  const onMark = (el, f) => { const panel = el.closest(".pp"); if (!panel) return; if (el._off) el._off();
    const h = ev => { const m = /^metals:(\d+)$/.exec(ev.detail || ""); if (m) f(+m[1], true); }; panel.addEventListener("pp:mark", h); el._off = () => panel.removeEventListener("pp:mark", h);
    const now = markOf(panel); if (now != null) f(now, false); };

  // the main chart: the prototype's radial chart (its Plate 4.A), one petal for the period clicked across the eight
  // element spokes, each spoke's length its element's change from the archaeological level in the same study, on a log
  // scale (×1 is no change; as on the prototype, x 0.08 to x 20); a filled dot where the period has its own value, a
  // hollow one where it shows the pooled archaeological mean (no value for the period). Each spoke's end names the
  // element, its ppm and its change from the period before. Two compared: one petal morphing between the two, in step
  // with the molar, both outlined, and each change between the two.
  const XLO = 0.08, XHI = 20;
  const radX = (x, R, r0) => r0 + (R - r0) * Math.max(0, Math.min(1, (Math.log(x) - Math.log(XLO)) / (Math.log(XHI) - Math.log(XLO))));
  const ptA = (a, r) => [Math.sin(a) * r, -Math.cos(a) * r];
  // a closed petal, as the prototype's: the spoke values joined through pinched valleys between neighbours
  function petal(radii) {
    const P = [], n = radii.length;
    for (let i = 0; i < n; i++) { const j = (i + 1) % n, a0 = EA[i], a1 = j ? EA[j] : EA[0] + 2 * Math.PI, lo = Math.min(radii[i], radii[j]), hi = Math.max(radii[i], radii[j]);
      P.push(ptA(a0, Math.max(4, radii[i]))); P.push(ptA((a0 + a1) / 2, Math.max(3.2, lo * 0.5 + hi * 0.24))); }
    const m = P.length; let d = "M" + fx(P[0][0]) + " " + fx(P[0][1]);
    for (let k = 0; k < m; k++) { const p0 = P[(k + m - 1) % m], p1 = P[k], p2 = P[(k + 1) % m], p3 = P[(k + 2) % m];
      d += "C" + [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]].map(fx).join(" "); }
    return d + "Z";
  }
  function bloomChart(ps, st) {
    const two = ps.length > 1;
    return W => {
      const G = "#8a8983", lh = s => s + 3.5;
      // each spoke's label: in full (element, ppm, change in two lines), or, in a narrow box, compact
      const blocks = EL.map(e => { const cs = ps.map(p => mcell(e.el, p)), c = two ? change(e.el, ps[1], ps[0]) : change(e.el, ps[0], ps[0] - 1), col = c.dir === "up" ? UP : c.dir === "down" ? DOWN : G;
        const v = two ? fmtV(cs[0].ppm) + " → " + fmtV(cs[1].ppm) + " ppm" : ppmS(cs[0].ppm);
        return { full: [[e.el, 15, 600, MD.colours[e.el]], [v, 12.5, 400, "#1a1a18"], [c.l1, 12, 600, col], [c.l2, 11, 400, G]],
          compact: [[e.el + "  " + (two ? fmtV(cs[0].ppm) + "→" + fmtV(cs[1].ppm) : fmtV(cs[0].ppm)), 12, 600, MD.colours[e.el]], [c.s, 11.5, 600, col]],
          tiny: [[e.el, 12, 600, MD.colours[e.el]], [c.s, 11.5, 600, col]] }; });   // the values left to the hover notes
      const fit = mode => { let R = 150; EA.forEach((a, i) => { const sn = Math.abs(Math.sin(a)), w = Math.max(...blocks[i][mode].map(([t, s, wt]) => tw(t, s) * (wt > 400 ? 1.06 : 1)));
        if (sn > 0.3) R = Math.min(R, (W / 2 - 3 - w) / sn - 12); }); return R; };
      let mode = "full", R = fit(mode); if (R < 74) { mode = "compact"; R = fit(mode); } if (R < 56) { mode = "tiny"; R = fit(mode); }
      R = Math.max(40, R); const r0 = R * 0.1;
      const pos = blocks.map((b, i) => { const a = EA[i], [x, y] = ptA(a, R + 12), c = Math.cos(a), lines = b[mode], h = lines.reduce((s2, l) => s2 + lh(l[1]), 0), w = Math.max(...lines.map(([t, sz, wt]) => tw(t, sz) * (wt > 400 ? 1.06 : 1)));
        return { x, w, top: c > 0.9 ? y - h - 2 : c < -0.9 ? y + 4 : c > 0.3 ? y - h + 12 : c < -0.3 ? y - 8 : y - h / 2, h, an: Math.abs(x) < 4 ? "middle" : x > 0 ? "start" : "end", lines }; });
      // the top and bottom labels clear of their diagonal neighbours' where they would meet
      [[0, 1, 7, -1], [4, 3, 5, 1]].forEach(([i, j, k, dir]) => { const q = pos[i], nb = [pos[j], pos[k]].filter(z => q.w / 2 + 6 > Math.abs(z.x)); if (!nb.length) return;
        if (dir < 0) q.top = Math.min(q.top, Math.min(...nb.map(z => z.top)) - q.h - 4); else q.top = Math.max(q.top, Math.max(...nb.map(z => z.top + z.h)) + 4); });
      const top = Math.min(...pos.map(q => q.top), -radX(10, R, r0) - 16), bot = Math.max(...pos.map(q => q.top + q.h)), cx = W / 2, cy = -top + 4, H = cy + bot + 30;
      const radii = p => EL.map(e => radX(mcell(e.el, p).x, R, r0)), pcol = p => (MD.periodColours || [])[p] || "#7a6a9a";
      let s = "<g transform='translate(" + fx(cx) + "," + fx(cy) + ")'>";
      // the rings (x 0.1, x 1, the archaeological level, x 10) and the spokes
      [0.1, 1, 10].forEach(v => { const r = radX(v, R, r0); s += "<circle r='" + fx(r) + "' fill='none' stroke='" + (v === 1 ? G : "#c6c4bd") + "' stroke-width='" + (v === 1 ? 0.8 : 0.8) + "'" + (v === 1 ? "" : " stroke-dasharray='2 3'") + "/>"; });
      EA.forEach(a => { const [x, y] = ptA(a, R + 4); s += L(0, 0, x, y, G, 1, "1 4") + "<circle cx='" + fx(x) + "' cy='" + fx(y) + "' r='2' fill='#1a1a18'/>"; });
      // two compared: each period's petal outlined (the earlier dashed), under the one that morphs between them
      if (two) ps.forEach((p, k) => { s += "<path d='" + petal(radii(p)) + "' fill='none' stroke='" + pcol(p) + "' stroke-width='1.1' stroke-opacity='.7'" + (k ? "" : " stroke-dasharray='3 3'") + "/>"; });
      const p0 = two ? (st.show != null ? st.show : ps[0]) : ps[0];
      s += "<path class='mb-p' d='" + petal(radii(p0)) + "' fill='" + pcol(p0) + "' fill-opacity='.3'/>";
      EL.forEach((e, i) => { const [x, y] = ptA(EA[i], radii(p0)[i]), pooled = mcell(e.el, p0).pooled;
        s += "<circle class='mb-v' data-i='" + i + "' cx='" + fx(x) + "' cy='" + fx(y) + "' r='4' fill='" + (pooled ? "#f3f2ee" : "#1a1a18") + "' stroke='#1a1a18' stroke-width='1.3'/>"; });
      [[0.1, "×0.1"], [1, R >= 100 ? "×1 Archaeological Level" : "×1"], [10, "×10"]].forEach(([v, t]) => { s += "<text x='4' y='" + fx(-radX(v, R, r0) - 3) + "' font-size='10.5' fill='" + G + "' paint-order='stroke' stroke='#f3f2ee' stroke-width='3' stroke-linejoin='round'>" + esc(t) + "</text>"; });
      // the labels
      pos.forEach(q => { let y = q.top; q.lines.forEach(([t, sz, wt, c]) => { y += lh(sz); s += T(q.x, y - 3.5, t, { a: q.an, s: sz, c, w: wt > 400 ? wt : 0 }); }); });
      s += "</g>";
      // the key: a filled dot, the period's own value; hollow, the archaeological mean shown in its place
      const k1 = "Measured This Period", k2 = "No Value for This Period", w1 = 14 + tw(k1, 11), w2 = 14 + tw(k2, 11), one = w1 + 18 + w2 <= W, Hk = H + (one ? 0 : 18);
      const key = (x, y, t, hollow) => "<circle cx='" + fx(x + 4) + "' cy='" + fx(y - 4) + "' r='3.5' fill='" + (hollow ? "#f3f2ee" : "#1a1a18") + "'" + (hollow ? " stroke='#1a1a18' stroke-width='1.2'" : "") + "/>" + T(x + 12, y, t, { s: 11, c: G });
      s += one ? key((W - w1 - 18 - w2) / 2, H - 5, k1) + key((W - w1 - 18 - w2) / 2 + w1 + 18, H - 5, k2, true) : key(0, H - 5, k1) + key(0, H + 13, k2, true);
      const html = svg(W, Hk, s, "Metals in childhood enamel, " + ps.map(pname).join(" and ") + ": each element's change from the archaeological level");

      const wire = el => {
        const sv = el.querySelector("svg"), path = sv.querySelector(".mb-p"), vs = [...sv.querySelectorAll(".mb-v")];
        vs.forEach(v => { const e = EL[+v.dataset.i]; v.addEventListener("pointermove", ev => tip(mtip(e, ps), ev)); v.addEventListener("pointerleave", () => tip(null)); });
        if (!two) return;
        // two compared: the petal morphs to the period the molar shows, as the molar changes over
        let cur = p0, rr = radii(p0), stop = null;
        const draw = (r, col, p) => { path.setAttribute("d", petal(r)); path.setAttribute("fill", col);
          vs.forEach((v, i) => { const [x, y] = ptA(EA[i], r[i]); v.setAttribute("cx", fx(x)); v.setAttribute("cy", fx(y)); v.setAttribute("fill", mcell(EL[i].el, p).pooled ? "#f3f2ee" : "#1a1a18"); }); };
        const to = (p, anim) => { if (!ps.includes(p) || p === cur) return; if (stop) stop();
          const from = rr.slice(), r1 = radii(p), c0 = pcol(cur), c1 = pcol(p), was = cur; cur = p; st.show = p;
          if (!anim || REDUCED) { rr = r1; draw(r1, c1, p); return; }
          const t0 = performance.now(); let raf = 0;
          const step = now => { const k = Math.min(1, (now - t0) / 1300), e = ease(k); rr = from.map((v, j) => v + (r1[j] - v) * e); draw(rr, mix(c0, c1, e), e < 0.5 ? was : p);
            if (k < 1) raf = requestAnimationFrame(step); else stop = null; };
          raf = requestAnimationFrame(step); stop = () => cancelAnimationFrame(raf); };
        onMark(el, to);
      };
      return { html, wire };
    };
  }

  // the supporting chart: the prototype's line graph (its Plate 4.B), every element in ppm on one log scale, drawn for
  // the period clicked alone: each element a glowing orb at its value (sized by the teeth behind it), lead with a streak
  // from its lowest to its highest child; faded where the period has no value of its own (the archaeological mean in
  // its place). Two compared: each period's column, and a line from each element's value in one to the other. Hovering
  // an element picks it out (zinc, barium, strontium and magnesium together) and reads its value.
  function lineChart(ps, st) {
    const two = ps.length > 1;
    return W => {
      const id = "ml" + (++UID), G = "#8a8983", H = 320, T0 = 12, T1 = H - 36;
      const ly = v => { const lo = Math.log(0.002), hi = Math.log(4000); return T1 - (T1 - T0) * (Math.log(Math.max(0.002, Math.min(4000, v))) - lo) / (hi - lo); };
      const axW = Math.ceil(tw("1,000 ppm", 11)) + 10, val = (e, k) => fmtV(mcell(e.el, ps[k]).ppm);
      const vtxt = e => two ? val(e, 0) + " → " + val(e, 1) : val(e, 0);
      const full = W - axW - (Math.max(...EL.map(e => tw(e.el + "  " + vtxt(e), 12))) + 34) >= (two ? 150 : 90);   // room for each value beside its name
      const labW = Math.ceil(Math.max(...EL.map(e => tw(full ? e.el + "  " + vtxt(e) : e.el, 12)))) + 34, lx = W - labW + 26;
      const xs = two ? [axW + 30, W - labW - 16] : [axW + (W - axW - labW) * 0.5];
      const rOrb = n => 3 + 0.62 * Math.sqrt(n);
      // each column's orbs, set side by side where two would overlap (their heights stay true)
      const cols = ps.map((p, k) => { const items = EL.map((e, j) => { const c = mcell(e.el, p); return { e, j, c, y: ly(c.ppm), r: rOrb(c.n), x: xs[k] }; });
        const placed = []; items.slice().sort((a, b) => a.y - b.y).forEach(q => { for (const o of [0, 1, -1, 2, -2, 3, -3]) { const x = xs[k] + o * 15;
          if (!placed.some(z => Math.hypot(z.x - x, z.y - q.y) < z.r + q.r + 1)) { q.x = x; break; } } placed.push(q); }); return items; });
      let defs = "<filter id='" + id + "g' x='-100%' y='-100%' width='300%' height='300%'><feGaussianBlur stdDeviation='5'/></filter>" +
        "<filter id='" + id + "n' x='-60%' y='-60%' width='220%' height='220%'><feTurbulence type='fractalNoise' baseFrequency='1.15' numOctaves='1' seed='7' result='t'/><feColorMatrix in='t' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.75' result='m'/><feComposite in='SourceGraphic' in2='m' operator='in'/></filter>" +
        "<filter id='" + id + "s' x='-100%' y='-100%' width='300%' height='300%'><feGaussianBlur stdDeviation='1.6'/></filter>";
      EL.forEach(e => { const c = MD.colours[e.el];
        defs += "<radialGradient id='" + id + e.el + "' cx='36%' cy='34%' r='70%'><stop offset='0' stop-color='#fff' stop-opacity='.85'/><stop offset='.28' stop-color='" + mix(c, "#ffffff", 0.3) + "'/><stop offset='.75' stop-color='" + c + "'/><stop offset='1' stop-color='" + mix(c, "#000000", 0.3) + "' stop-opacity='.85'/></radialGradient>"; });
      // the grid, in ppm, and each column's guide and period
      let s = "";
      [0.01, 0.1, 1, 10, 100, 1000].forEach(v => { s += L(axW - 4, ly(v), xs[xs.length - 1] + 26, ly(v), "#c6c4bd", 0.7, "2 3") + T(axW - 8, ly(v) + 4, fmtV(v) + " ppm", { a: "end", s: 11, c: G }); });
      // (two whose names would meet, on two lines)
      const stag = two && xs[1] - xs[0] < (tw(pname(ps[0]), 12) + tw(pname(ps[1]), 12)) / 2 * 1.06 + 10;
      ps.forEach((p, k) => { s += L(xs[k], T0, xs[k], T1, "rgba(26,26,24,.12)", 1) + "<text class='mt-era' data-p='" + p + "' x='" + fx(xs[k]) + "' y='" + (stag ? T1 + 17 + k * 15 : T1 + 24) + "' text-anchor='middle' font-size='12' fill='#55544f'>" + esc(pname(p)) + "</text>"; });
      // the names at the right, spread so none overlap, on a hairline to their orb in the last column
      const last = cols[cols.length - 1], labs = last.map(q => ({ q, y: q.y })).sort((a, b) => a.y - b.y);
      for (let k = 1; k < labs.length; k++) labs[k].y = Math.max(labs[k].y, labs[k - 1].y + 15);
      for (let k = labs.length - 1; k >= 0; k--) labs[k].y = Math.min(labs[k].y, k === labs.length - 1 ? T1 : labs[k + 1].y - 15);
      const labY = {}; labs.forEach(l => { labY[l.q.j] = l.y; });
      EL.forEach((e, j) => {
        const col = MD.colours[e.el], qs = cols.map(c => c[j]);
        let g = "<g class='mt-g' data-j='" + j + "'>";
        if (two) { const d = "M" + fx(qs[0].x) + " " + fx(qs[0].y) + "L" + fx(qs[1].x) + " " + fx(qs[1].y); g += "<path class='mt-hit' d='" + d + "'/><path class='mt-ln' d='" + d + "' stroke='" + col + "'/>"; }
        qs.forEach((q, k) => { if (!q.c.rg) return;   // the streak: lowest to highest (lead always; the others' 20th-century range while hovered)
          const a = ly(q.c.rg[1]), b = ly(q.c.rg[0] == null ? 0.002 : q.c.rg[0]), m = (q.y - a) / Math.max(1, b - a), gid = id + "t" + j + "_" + k;
          defs += "<linearGradient id='" + gid + "' gradientUnits='userSpaceOnUse' x1='0' x2='0' y1='" + fx(a) + "' y2='" + fx(b) + "'>" + [[0, 0], [Math.max(0, m - 0.25), 0.3], [m, 0.75], [Math.min(1, m + 0.25), 0.3], [1, 0]].map(([o, op]) => "<stop offset='" + o.toFixed(3) + "' stop-color='" + col + "' stop-opacity='" + op + "'/>").join("") + "</linearGradient>";
          g += "<rect class='mt-tail" + (e.el === "Pb" ? "" : " m") + "' x='" + fx(q.x - 5) + "' y='" + fx(a) + "' width='10' height='" + fx(b - a) + "' rx='5' fill='url(#" + gid + ")' filter='url(#" + id + "n)'/>"; });
        qs.forEach(q => { const r = q.r;
          g += "<g opacity='" + (q.c.pooled ? 0.45 : 1) + "'><circle cx='" + fx(q.x) + "' cy='" + fx(q.y) + "' r='" + fx(r * 1.7) + "' fill='" + col + "' opacity='.35' filter='url(#" + id + "g)'/>" +
            "<circle cx='" + fx(q.x) + "' cy='" + fx(q.y) + "' r='" + fx(r) + "' fill='url(#" + id + e.el + ")' filter='url(#" + id + "n)'/>" +
            "<circle cx='" + fx(q.x - r * 0.3) + "' cy='" + fx(q.y - r * 0.32) + "' r='" + fx(r * 0.38) + "' fill='#fff' opacity='.55' filter='url(#" + id + "s)'/></g>" +
            "<circle class='mt-dot' data-k='" + qs.indexOf(q) + "' cx='" + fx(q.x) + "' cy='" + fx(q.y) + "' r='" + fx(r + 6) + "' fill='transparent'/>"; });
        const q = qs[qs.length - 1], y = labY[j];
        g += L(q.x + q.r + 3, q.y, lx - 5, y, "#8a8983", 0.5) + "<text x='" + fx(lx) + "' y='" + fx(y + 4) + "' font-size='12'><tspan font-weight='600' fill='" + col + "'>" + e.el + "</tspan>" +
          (full ? "<tspan fill='#55544f'>  " + esc(vtxt(e)) + "</tspan>" : "") + "</text><rect x='" + fx(lx - 4) + "' y='" + fx(y - 8) + "' width='" + fx(W - lx + 4) + "' height='15' fill='transparent'/></g>";
        s += g; });
      const html = "<div class='mt'>" + svg(W, H, "<defs>" + defs + "</defs>" + s, "Metals in childhood enamel in ppm, " + ps.map(pname).join(" and "), "mt-svg") + "<p class='pd-hint mt-hint' aria-live='polite'></p></div>";

      const wire = el => {
        const sv = el.querySelector(".mt-svg"), hint = el.querySelector(".mt-hint"), gs = [...sv.querySelectorAll(".mt-g")];
        const pooled = ps.some(p => p !== LASTP);
        const rest = "Lead's streak runs from its lowest to its highest " + (ps.every(p => p === LASTP) ? "tooth" : "child") + ". " + (pooled ? "Faded: no value for this period; the mean of " + MD.pooledN + " ancient teeth stands in. " : "") + "Hover a metal to read it.";
        hint.textContent = rest;
        const k0 = (ev, j) => { if (!two) return 0; const r = sv.getBoundingClientRect(), x = (ev.clientX - r.left) * W / r.width; return Math.abs(x - cols[0][j].x) <= Math.abs(x - cols[1][j].x) ? 0 : 1; };
        gs.forEach(g => { const j = +g.dataset.j, e = EL[j], grp = NONIND.has(e.el) ? gs.filter(h => NONIND.has(EL[+h.dataset.j].el)) : [g];
          g.addEventListener("pointerenter", () => { sv.classList.add("hov"); gs.forEach(h => h.classList.toggle("on", grp.includes(h)));
            if (NONIND.has(e.el)) hint.textContent = "Zinc, barium, strontium and magnesium are part of enamel itself, not industrial."; });
          g.addEventListener("pointermove", ev => { const k = ev.target.dataset && ev.target.dataset.k != null ? +ev.target.dataset.k : k0(ev, j); tip(mtip(e, [ps[k]]), ev); });
          g.addEventListener("pointerleave", () => { sv.classList.remove("hov"); gs.forEach(h => h.classList.remove("on")); hint.textContent = rest; tip(null); }); });
        // two compared: the period the molar shows now, its name in the heavier weight
        if (two) onMark(el, p => sv.querySelectorAll(".mt-era").forEach(t => { t.setAttribute("font-weight", +t.dataset.p === p ? 600 : 400); t.setAttribute("fill", +t.dataset.p === p ? "#1a1a18" : "#55544f"); }));
      };
      return { html, wire };
    };
  }

  // the slides' lines of text, from the values
  const lvl = x => x >= 1 ? B("×" + times(x)) + " the archaeological level" : B(Math.round(x * 100) + "%") + " of the archaeological level";
  const moved = (a, b) => { const r = b / a; return Math.abs(r - 1) < 0.005 ? "no change" : r > 1 ? B("×" + times(r)) : B(times(1 / r) + "×") + " less"; };
  // the 20th century against archaeological teeth: copper, chromium and nickel, then the elements of enamel itself
  const othersNow = () => { const ind = MD.groups.industrial.filter(x => x !== "Pb"), nm = x => EL.find(e => e.el === x).name, rs = MD.groups.nonindustrial.map(x => MD.modern[x] / MD.pooled[x]);
    const span = Math.max(...rs.map(r => Math.max(r, 1 / r)));
    return cap(andList(ind.map(nm))) + " rose " + andList(ind.map(x => B("×" + times(MD.modern[x] / MD.pooled[x])))) + " from ancient teeth; " + andList(MD.groups.nonindustrial.map(nm)) + ", part of enamel itself, stayed within " + B("×" + (Math.ceil(span * 10) / 10)) + "."; };
  function metLead1(ps) {
    const Lp = MD.lead, A = MD.leadArch, st = p => p === LASTP ? "averaged " : "had a median of ";
    if (ps.length > 1) { const [a, b] = ps;
      return "Lead in childhood enamel went from " + B(ppmS(Lp[a])) + " in " + phr(a) + " to " + B(ppmS(Lp[b])) + " in " + phr(b) + ", " + moved(Lp[a], Lp[b]) + ".<br>" +
        (b === LASTP ? othersNow() : "The other metals have no value for either period, only one mean for all early teeth."); }
    const p = ps[0], one = "In " + phr(p) + ", lead in childhood enamel " + st(p) + B(ppmS(Lp[p])) + ", " + lvl(Lp[p] / A) + ".";
    if (p === LASTP) return one + "<br>" + othersNow();
    if (!p) return one + "<br>Only lead was measured period by period; the other metals show one mean for all early teeth.";
    const r = Lp[p] / Lp[p - 1];
    return one + "<br>" + (Math.abs(r - 1) < 0.005 ? "The same as " + phr(p - 1) + "'s " + ppmS(Lp[p - 1]) + "." : r > 1 ? "That is " + B("×" + times(r)) + " " + phr(p - 1) + "'s " + ppmS(Lp[p - 1]) + "."
      : "That is " + B(times(1 / r) + "×") + " less than " + phr(p - 1) + "'s " + ppmS(Lp[p - 1]) + ".");
  }
  function metLead2(ps) {
    const R = MD.leadRange, who = p => p === LASTP ? "modern teeth" : "children";
    if (ps.length > 1) { const [a, b] = ps, ha = R[a][1], hb = R[b][1], ma = MD.lead[a], mb = MD.lead[b], dir = (x, y) => y > x ? "rose" : y < x ? "fell" : "held";
      return "Lead ranged from " + B(R[a][0]) + " to " + B(ppmS(R[a][1])) + " in " + phr(a) + ", and from " + B(R[b][0]) + " to " + B(ppmS(R[b][1])) + " in " + phr(b) + ".<br>" +
        "Its highest " + dir(ha, hb) + " from " + B(fmtV(ha)) + " to " + B(ppmS(hb)) + (dir(ha, hb) === dir(ma, mb) ? ", as the median did." : ", while the median " + dir(ma, mb) + "."); }
    const p = ps[0], rg = R[p];
    return "Lead ranged from " + B(rg[0]) + " to " + B(ppmS(rg[1])) + " across the " + B(MD.periods[p].n) + " " + who(p) + ".<br>The most exposed held " + B("×" + times(rg[1] / rg[0])) + " the lead of the least.";
  }
  const metSource = ps => ps.every(p => p === LASTP) ? "Kamenov et al. 2018 · 20th-century births · n = " + MD.periods[LASTP].n
    : "Montgomery et al. 2010 (British lead) · Kamenov et al. 2018 · n = " + ps.map(p => MD.periods[p].n).join(" and ");

  P.CONTENT.metals = pick => {
    if (!MD || !MD.leadRange) return {};
    const ps = (pick.pair || [pick]).map(q => q.i).sort((a, b) => a - b);
    if (ps.some(p => !MD.periods[p])) return {};
    const st = { show: null }, ch = charts([bloomChart(ps, st), lineChart(ps, st)]);
    // no events yet for metals: two slides, as a period in no event has (the correlating human event to come)
    return { slides: [{ html: metLead1(ps), body: ch.body(0) }, { html: metLead2(ps), body: ch.body(1) }], mount: ch.mount, source: metSource(ps) };
  };
})();
