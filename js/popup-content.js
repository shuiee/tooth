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
   line graph (Plate 4.B), drawn for the period clicked alone (lineChart). No events yet, so two slides. 
   Wear and LEH (js/wear-data.js, js/leh-data.js): two cards for one period (popup.js, SUBS). Molar wear: the prototype's
   wear landscape with the period clicked raised (wearChart), its peaks opening Smith's stage diagram (smithHTML), and
   the team's milling events. Stress lines, on the lower canine: the share with a line (lehBar), by age with each
   cemetery's slope (lehAge), by severity with each cemetery's share (lehSev), and the team's events on childhood
   stress. */
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
      // redrawn on the next frame, not inside the observer's callback, where the new drawing's height would be a resize of its own
      if (window.ResizeObserver) new ResizeObserver(() => requestAnimationFrame(go)).observe(el); requestAnimationFrame(go); }) });
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
  // how a stretch of years (one period or several, each { from, to }) stands to an event: it includes an event inside
  // it, falls within one that spans it, and otherwise overlaps it (pl: the plural verb)
  const evVerb = (e, qs, pl) => { const lo = Math.min(...qs.map(q => q.from)), hi = Math.max(...qs.map(q => q.to));
    return e.from >= lo && e.to <= hi ? (pl ? "include" : "includes") : e.from <= lo && e.to >= hi ? (pl ? "fall within" : "falls within") : (pl ? "overlap" : "overlaps"); };
  // an event's pictures (one, or several stacked), each with its line of reference under it, or a placeholder
  const evPics = e => { const a = e.img ? [].concat(e.img) : []; return a.length ? "<div class='pp-evp'>" + a.map(m => "<img src='" + esc(m.src) + "' alt='" + esc(m.alt) + "'>" + (m.ref ? "<span class='pp-ref'>" + esc(m.ref) + "</span>" : "")).join("") + "</div>" : ph("Image"); };
  const cOver = (e, q) => e.from < q.to && e.to > q.from, pt = v => v.toFixed(3);
  const cariesEventsOf = picks => CE.filter(e => picks.some(q => cOver(e, q))).sort((a, b) => (a.to - a.from) - (b.to - b.from));
  function cariesEffect(e, picks) {
    if (e.per) { const s = e.per, lo = s.reduce((m, x) => x[1] < m[1] ? x : m, s[0]), hi = s.reduce((m, x) => x[1] > m[1] ? x : m, s[0]);
      return "Caries per tooth rose from " + B(pt(lo[1])) + " in " + lo[0] + " to " + B(pt(hi[1])) + " in " + hi[0] + ", a " + B(fx(hi[1] / lo[1]) + "-fold") + " increase."; }
    return "";
  }
  function cariesEventsHTML(evs, picks) {
    return "<div class='pp-evs" + (evs.length > 1 ? " sc" : "") + "'>" + evs.map(e => "<figure class='pp-ev'>" +
      evPics(e) +
      "<figcaption><b>" + esc(e.name) + "</b><span class='pp-evd'>" + e.from + "–" + e.to + "</span><p>" + esc(e.line) + "</p><p>" + cariesEffect(e, picks) + "</p></figcaption></figure>").join("") +
      "<p class='pp-evn'>Event dates are historical context. Caries per tooth is the number of decayed teeth divided by the number of teeth examined, which is a different measure from the share of adults on the earlier slides." +
      (evs.some(e => !e.img) ? " Pictures to come." : "") + "</p></div>";
  }
  function cariesLead3(evs, picks) {
    const on = e => picks.filter(q => cOver(e, q)), groups = [];
    evs.forEach(e => { const k = on(e).map(q => q.i).join("|"), g = groups.find(x => x.k === k); if (g) g.evs.push(e); else groups.push({ k, qs: on(e), evs: [e] }); });
    return groups.map(g => "The " + andList(g.qs.map(q => low(CR[q.i].p))) + " period" + (g.qs.length > 1 ? "s " : " ") +
      andList(g.evs.map(e => evVerb(e, g.qs, g.qs.length > 1) + " " + (e.note || low(e.name)) + " (" + e.from + "–" + e.to + ")")) + ".").join("<br>");
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
      "<p class='pp-evn'>Event dates are historical context. Percentages are shares of the genomes recovered from each century." + (evs.some(e => !e.img) ? " Pictures to come." : "") + "</p></div>";
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
    const on = e => rs.filter(r => over(e, r)), groups = [];
    evs.forEach(e => { const k = on(e).map(r => r.c).join("|"), g = groups.find(x => x.k === k); if (g) g.evs.push(e); else groups.push({ k, rs: on(e), evs: [e] }); });
    return groups.map(g => cap(andList(g.rs.map(r => "the " + r.c + "s"))) + " " +
      andList(g.evs.map(e => evVerb(e, g.rs.map(r => ({ from: r.c, to: r.c + 100 })), true) + " " + e.note + " (" + e.from + "–" + e.to + ")")) + ".").join("<br>");
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

  // ---- metals events: what each figure compares, read from METALS_DATA (js/metals-data.js)
  const ppm = v => (v < 1 ? v.toFixed(2) : String(Math.round(v * 100) / 100)) + " ppm";
  function metChange(e) {
    const c = e.change || {};
    if (c.lead) { const [a, b] = c.lead.map(n => MD.periods.findIndex(p => p.p === n)); if (a < 0 || b < 0) return "";
      const pn = n => /^(Post-|Early |Late )/.test(n) ? low(n) : n, va = MD.lead[a], vb = MD.lead[b], la = pn(MD.periods[a].p), lb = pn(MD.periods[b].p);
      return vb > va ? "Median lead in childhood enamel rose from " + B(ppm(va)) + " in the " + la + " window to " + B(ppm(vb)) + " in the " + lb + " window, about " + B(Math.round(vb / va) + " times") + " higher."
        : "Median lead in childhood enamel fell from " + B(ppm(va)) + " in the " + la + " window to " + B(ppm(vb)) + " in the " + lb + " window, " + B(Math.round(100 * (1 - vb / va)) + "%") + " lower."; }
    if (c.modern) { const last = MD.lead.length - 1, x = k => k === "Pb" ? MD.lead[last] / MD.leadArch : MD.modern[k] / MD.pooled[k];
      const ind = MD.groups.industrial.map(x), name = k => (MD.elements.find(el => el[0] === k) || [k, k])[1], ctl = ["Zn", "Ba"].map(k => name(k));
      return "In 20th-century enamel, " + andList(MD.groups.industrial.map(name)) + " were " + B(Math.floor(Math.min(...ind)) + " to " + Math.round(Math.max(...ind)) + " times") + " their levels in archaeological enamel. " +
        cap(andList(ctl)) + ", which are part of enamel itself, rose by less than half, and strontium fell from " + B(ppm(MD.pooled.Sr)) + " to " + B(ppm(MD.modern.Sr)) + "."; }
    return "";
  }
  function metLead3(evs, ps) {
    const yr = v => v < 0 ? -v + " BCE" : v + " CE", w = p => { const [a, b] = MD.periods[p].y; return a < 0 && b < 0 ? -a + "–" + -b + " BCE" : a >= 0 ? a + "–" + b + " CE" : yr(a) + "–" + yr(b); };
    return evs.map(e => { const on = ps.filter(p => e.periods.includes(MD.periods[p].p));
      return "The exposure window" + (on.length > 1 ? "s " : " ") + andList(on.map(w)) + (on.length > 1 ? " coincide" : " coincides") + " with " + e.note + " (" + e.when + ")."; }).join("<br>");
  }
  function metEventsHTML(evs) {
    return "<div class='pp-evs" + (evs.length > 1 ? " sc" : "") + "'>" + (MD.eventsLine ? "<p class='pp-evi'>" + (MD.eventsHead ? "<b>" + esc(MD.eventsHead) + "</b>" : "") + esc(MD.eventsLine) + "</p>" : "") +
      evs.map(e => "<figure class='pp-ev'>" + evPics(e) + "<figcaption><b>" + esc(e.name) + "</b><span class='pp-evd'>" + esc(e.when) + "</span><p>" + metChange(e) + "</p></figcaption></figure>").join("") +
      "<p class='pp-evn'>Event dates are historical context. Lead is the median in childhood enamel, in parts per million; 20th-century values are compared with archaeological enamel from the same study." +
      (evs.some(e => !e.img) ? " Pictures to come." : "") + "</p></div>";
  }
  P.CONTENT.metals = pick => {
    if (!MD || !MD.leadRange) return {};
    const ps = (pick.pair || [pick]).map(q => q.i).sort((a, b) => a - b);
    if (ps.some(p => !MD.periods[p])) return {};
    const st = { show: null }, ch = charts([bloomChart(ps, st), lineChart(ps, st)]);
    // the third slide: the events named for the period clicked (MD.events); a period in none has two slides
    const evs = (MD.events || []).filter(e => ps.some(p => e.periods.includes(MD.periods[p].p)));
    const slides = [{ html: metLead1(ps), body: ch.body(0) }, { html: metLead2(ps), body: ch.body(1) }];
    if (evs.length) slides.push({ html: metLead3(evs, ps), body: metEventsHTML(evs) });
    return { slides, mount: ch.mount, source: metSource(ps) };
  };
  // ---- wear (the Wear and LEH line's first card)
  const WD = window.WEAR_DATA, WE = window.WEAR_EVENTS || { events: [] };
  // colours mixed in Lab, as the prototype's d3.interpolateLab
  const toLab = h => { const c = [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    const x = (c[0] * 0.4124 + c[1] * 0.3576 + c[2] * 0.1805) / 0.95047, y = c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722, z = (c[0] * 0.0193 + c[1] * 0.1192 + c[2] * 0.9505) / 1.08883;
    const f = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]; };
  const fromLab = ([l, a, b]) => { const fy = (l + 16) / 116, fa = a / 500 + fy, fb = fy - b / 200, g = t => t * t * t > 0.008856 ? t * t * t : (t - 16 / 116) / 7.787;
    const X = g(fa) * 0.95047, Y = g(fy), Z = g(fb) * 1.08883;
    return "#" + [X * 3.2406 - Y * 1.5372 - Z * 0.4986, -X * 0.9689 + Y * 1.8758 + Z * 0.0415, X * 0.0557 - Y * 0.2040 + Z * 1.0570]
      .map(v => v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055).map(v => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0")).join(""); };
  const labMix = (c1, c2, t) => { const a = toLab(c1), b = toLab(c2); return fromLab(a.map((v, k) => v + (b[k] - v) * t)); };
  // as on the prototype's landscape: each age band's colour, blue at 18–24 to orange at 60+, greyed towards little wear
  const AGE0 = "#2f66d0", AGE1 = "#e8841f";
  const ageCol = j => labMix(AGE0, AGE1, j / 7);
  const wearCol = (v, j) => labMix("#cfcdc6", ageCol(j), 0.3 + 0.7 * Math.max(0, Math.min(1, (v - 2) / 3.9)));
  // the prototype's crown: a lower first molar's chewing surface as a height field over its footprint (u, w from -1 to 1),
  // a low dome, five cusps, the central fissure and its grooves, and a light crenellation (a drawing, not data)
  const CUSPS = [[-0.5, 0.42, 1], [0.06, 0.5, 0.95], [0.58, 0.22, 0.8], [-0.42, -0.42, 0.96], [0.36, -0.44, 0.9]];
  const rip = (x, z) => 0.5 * Math.sin(x * 9.1 + z * 3.7) + 0.5 * Math.sin(x * 4.3 - z * 7.9);
  function crown(u, w, off) {
    const r = Math.cbrt(Math.abs(u / 0.98) ** 3 + Math.abs(w / 0.88) ** 3); if (r >= 1) return 0;
    let h = 0.42 * Math.sqrt(1 - r);
    for (const c of CUSPS) h += 0.44 * c[2] * Math.exp(-((u - c[0]) ** 2 + (w - c[1]) ** 2) / (2 * 0.25 * 0.25));
    h -= 0.17 * Math.exp(-(w * w) / (2 * 0.055 * 0.055)) * (1 - 0.5 * Math.abs(u));
    h -= 0.11 * Math.exp(-((u + 0.2) ** 2) / (2 * 0.05 * 0.05)) * Math.exp(-(w * w) / 0.45);
    h -= 0.09 * Math.exp(-((u - 0.34) ** 2) / (2 * 0.05 * 0.05)) * Math.exp(-(w * w) / 0.45);
    h += 0.07 * rip(u * 0.45 + off[0], w * 0.45 + off[1]);
    return Math.max(0, h * Math.min(1, (1 - r) / 0.14));
  }
  // each cell's mesh, worked out once: six lines each way across the cell, each 31 points of [along the periods, along
  // the ages, height 0 to 1], and the crown's top
  let MESH = null;
  function meshes() {
    if (MESH || !WD) return MESH; MESH = {};
    const fp = 0.43, N = 6, S = 30, G = 30;
    WD.periods.forEach((P, i) => WD.ages.forEach((a, j) => { if (!P.cells[a]) return;
      const off = [i * 0.37 + j * 0.11, j * 0.53 - i * 0.07]; let max = 0, top = [0.5, 0.5];
      for (let b = 0; b < G; b++) for (let c = 0; c < G; c++) { const h = crown(c / (G - 1) * 2 - 1, b / (G - 1) * 2 - 1, off); if (h > max) { max = h; top = [0.5 + (b / (G - 1) * 2 - 1) * fp, 0.5 + (c / (G - 1) * 2 - 1) * fp]; } }
      const hAt = (su, sv) => crown((su - 0.5) / fp, (sv - 0.5) / fp, off) / max, lines = [];
      for (let k = 0; k <= N; k++) { const q = k / N, lu = [], lv = [];
        for (let m = 0; m <= S; m++) { const r = m / S; lu.push([q, r, hAt(r, q)]); lv.push([r, q, hAt(q, r)]); }
        lines.push(lu, lv); }
      MESH[i + ":" + j] = { lines, top }; }));
    return MESH;
  }
  // a convex hull (Andrew's monotone chain), for the light fill over each crown's silhouette
  function hull(pts) {
    if (pts.length < 3) return null; const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = []; p.forEach(q => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
    for (let k = p.length - 1; k >= 0; k--) { const q = p[k]; while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  const stageTxt = v => v.toFixed(1);

  // The main chart: the prototype's wear landscape (its Fig. 3.2), mean molar wear (Smith 1984 stage, 1 unworn to 8) by
  // period and age at death on isometric axes, each cell a peak shaped like a molar's crown, as tall as its stage above
  // 1. The period clicked is drawn at full height and colour; the other periods flatter and fainter, their stages still
  // shown, dimmer. As the card opens, the clicked period's peaks rise one by one from the youngest age to the oldest
  // (two compared: both rows together). Clicking a peak picks it, up to two (a third replaces the older), and opens the
  // Smith diagram under the chart with the stages its mean falls between; a click anywhere else lets them go.
  function wearChart(sel, st) {
    const M = meshes(), P = WD.periods, A = WD.ages, nI = P.length, nJ = A.length, cos = Math.cos(Math.PI / 6);
    return W => {
      const G = "#8a8983";
      // the margins, no wider than the text needs: on the left, room for each period's name where it sits (each row's
      // further right, down the edge); on the right, room for the last age, set out from the edge. Both move with the
      // cells' size, and that with them, so they are settled in a few rounds
      const vOf = c => Math.max(0.5, Math.max(15, 15 + (20 - c) * 1.1) / c), tl = tw(A[nJ - 1], 11);
      let labL = Math.ceil(Math.max(...P.map(q => tw(title(q.p), 11.5) * 1.06))) + 12, padR = Math.ceil(tl / 2) + 22, c = 0;
      for (let k = 0; k < 4; k++) { c = (W - labL - padR) / (cos * (nI + nJ)); const v = vOf(c), nl = Math.hypot(cos, v), nx = v / nl, ny = cos / nl;
        labL = Math.ceil(Math.max(...P.map((q, i) => tw(title(q.p), 11.5) * (sel.includes(i) ? 1.1 : 1.04) + 10 - cos * (i + 0.5) * c))) + 2;
        padR = Math.ceil(Math.max(8, nx * Math.max(14, (tl / 2 + 2) * nx + 8 * ny + 3) + 0.55 * tl + 4 - 0.5 * cos * c)); }
      c = (W - labL - padR) / (cos * (nI + nJ));
      const hs = c * 0.42, hsDim = hs * 0.26;
      const vmax = Math.max(...P.map(q => Math.max(...A.map(a => q.cells[a] ? q.cells[a][0] : 0))));
      // isometric where the cells are big enough; in a narrow box the floor tilts steeper (each step down a row or along the
      // ages drops further), so every label still has a line to itself
      const v = vOf(c), ox = labL, oy = 24 + (vmax - 1) * hs + v * nJ * c, X = (i, j) => ox + (cos * i + cos * j) * c, Y = (i, j) => oy + (v * i - v * j) * c;
      const on = i => sel.includes(i), hOf = (i, v, k) => (v - 1) * (on(i) ? hs : hsDim) * (k == null ? 1 : k);
      // a cell's mesh and fill at a share k of its height
      const draw = (i, j, k) => { const v = P[i].cells[A[j]][0], h = hOf(i, v, k), m = M[i + ":" + j], pts = [];
        const d = m.lines.map(l => "M" + l.map(([gi, gj, z]) => { const x = X(i + gi, j + gj), y = Y(i + gi, j + gj) - z * h; if (z > 0.004) pts.push([x, y]); return fx(x) + "," + fx(y); }).join("L")).join("");
        const hl = hull(pts); return { d, b: hl ? "M" + hl.map(q => fx(q[0]) + "," + fx(q[1])).join("L") + "Z" : "" }; };
      const topAt = (i, j, k) => { const m = M[i + ":" + j], v = P[i].cells[A[j]][0]; return [X(i + m.top[0], j + m.top[1]), Y(i + m.top[0], j + m.top[1]) - hOf(i, v, k) - 6]; };
      // the text placed so far, so nothing is set over anything else
      const boxes = [], boxOf = (x, y, t, px, an) => { const w = tw(t, px) * 1.1 + 3, x0 = an === "end" ? x - w : an === "middle" ? x - w / 2 : x; return [x0, y - px * 1.02 - 1, x0 + w, y + px * 0.34 + 1]; };
      const hits = b => b[1] < 0 || b[0] < 0 || b[2] > W || boxes.some(q => q[0] < b[2] && b[0] < q[2] && q[1] < b[3] && b[1] < q[3]);
      let s = "<path d='M" + [[0, 0], [0, nJ], [nI, nJ], [nI, 0]].map(q => fx(X(q[0], q[1])) + "," + fx(Y(q[0], q[1]))).join("L") + "Z' fill='rgba(26,26,24,.025)' stroke='#1a1a18' stroke-width='1'/>";
      // every period named down the left edge, at least a line apart: the one clicked in ink, the others dimmer
      let py = -1e9;
      P.forEach((q, i) => { const t = title(q.p), x = X(i + 0.5, 0) - 8, y = Math.max(Y(i + 0.5, 0) + 4, py + 13.5); py = y; boxes.push(boxOf(x, y, t, 11.5, "end"));
        s += "<text x='" + fx(x) + "' y='" + fx(y) + "' text-anchor='end' font-size='11.5' fill='" + (on(i) ? "#1a1a18" : "#8a8983") + "'" + (on(i) ? " font-weight='600'" : "") + ">" + esc(t) + "</text>"; });
      // the ages under the front-right edge, each centred on a line parallel to it (every other where the cells are too
      // small for all eight to stand apart); the axis's name beyond them, centred on the edge
      const nl = Math.hypot(cos, v), nx = v / nl, ny = cos / nl, gapA = 14, aw = Math.max(...A.map(a => tw(a, 11))) + 4;
      const stepA = [1, 2, 3, 4].find(k => k * v * c >= 15 || k * cos * c >= aw) || 4;
      let bottom = Y(nI, 0) + 6;
      // both ends shown, the rest a step apart, each set out far enough that its own width clears the edge
      A.forEach((a, j) => { const last = nJ - 1; if ((j % stepA && j !== last) || (j !== last && j && last - j < stepA)) return;
        const d = Math.max(gapA, (tw(a, 11) / 2 + 2) * nx + 8 * ny + 3), x = X(nI, j + 0.5) + nx * d, y = Y(nI, j + 0.5) + ny * d + 4, b = boxOf(x, y, a, 11, "middle"); boxes.push(b); bottom = Math.max(bottom, b[3]);
        s += T(x, y, a, { a: "middle", s: 11, c: ageCol(j) }); });
      // the axis's name out from the middle of the edge, just beyond the ages: the nearest spot clear of them (in a box
      // too narrow to have one, under them)
      { const t = "Age at Death", half = tw(t, 11) * 0.55 + 2, at = d => [Math.max(half, Math.min(W - half, X(nI, nJ / 2) + nx * d)), Y(nI, nJ / 2) + ny * d + 4];
        let d = Math.max(gapA + 6, half * nx + 12 * ny + 4); while (d < 120 && hits(boxOf(...at(d), t, 11, "middle"))) d += 2;
        const [x, y] = d < 120 ? at(d) : [at(0)[0], bottom + 13], b = boxOf(x, y, t, 11, "middle"); boxes.push(b); bottom = Math.max(bottom, b[3]); s += T(x, y, t, { a: "middle", s: 11, c: G, i: true }); }
      const H = bottom + 6;
      // every peak's stage: the clicked period's on its peak, in ink; the others dimmer, on their flatter peaks, or where
      // that would meet other text, elsewhere in their own cell
      const spots = [], fv = c < 12 ? 10.5 : 11.5;   // the clicked period's stages a size smaller where the cells are smallest
      sel.forEach(i => A.forEach((a, j) => { if (!P[i].cells[a]) return; const [x, y] = topAt(i, j, 1), t = stageTxt(P[i].cells[a][0]); boxes.push(boxOf(x, y, t, fv, "middle")); spots.push({ i, j, x, y, t, on: true }); }));
      for (let i = nI - 1; i >= 0; i--) for (let j = 0; j < nJ; j++) { if (on(i) || !P[i].cells[A[j]]) continue; const t = stageTxt(P[i].cells[A[j]][0]), h = hOf(i, P[i].cells[A[j]][0], 1);
        // over the cell's middle, raised by its (low) peak; else a little above or below that; else elsewhere on its floor;
        // else all of these a size smaller, then smaller again
        const cx = X(i + 0.5, j + 0.5), cy = Y(i + 0.5, j + 0.5), cands = [[cx, cy - h + 2], [cx, cy - h - 7], [cx, cy + 9]]
          .concat([[0.86, 0.5], [0.5, 0.9], [0.5, 0.1], [0.14, 0.5], [0.86, 0.85], [0.86, 0.15], [0.14, 0.85], [0.14, 0.15]].map(([gi, gj]) => [X(i + gi, j + gj), Y(i + gi, j + gj) + 3.5]))
          .concat([0.3, 0.7].flatMap(gi => [0.3, 0.7].map(gj => [X(i + gi, j + gj), Y(i + gi, j + gj) + 3.5])), [-0.3, 0.3].map(d => [cx + d * cos * c, cy - h - 2]), [[cx, cy - h - 15], [cx, cy + 18], [cx, cy - h - 26], [cx - 0.9 * cos * c, cy - h - 10], [cx + 0.9 * cos * c, cy - h - 10]]);
        let px = 9.5, at = cands.find(([x, y]) => !hits(boxOf(x, y, t, 9.5, "middle")));
        if (!at) { px = 8.5; at = cands.find(([x, y]) => !hits(boxOf(x, y, t, 8.5, "middle"))); }
        if (!at) { px = 7.5; at = cands.find(([x, y]) => !hits(boxOf(x, y, t, 7.5, "middle"))); }
        if (!at) { px = 7.5; const ov = b => boxes.reduce((n, q) => n + Math.max(0, Math.min(q[2], b[2]) - Math.max(q[0], b[0])) * Math.max(0, Math.min(q[3], b[3]) - Math.max(q[1], b[1])), 0);
          at = cands.map(q => [q, ov(boxOf(q[0], q[1], t, 7.5, "middle"))]).sort((a, b) => a[1] - b[1])[0][0]; }   // no spot free: the one that meets the least
        boxes.push(boxOf(at[0], at[1], t, px, "middle")); spots.push({ i, j, x: at[0], y: at[1], t, on: false, px }); }
      let peaks = "", labs = "";
      for (let i = 0; i < nI; i++) for (let j = nJ - 1; j >= 0; j--) { const cell = P[i].cells[A[j]]; if (!cell) continue;
        const k0 = on(i) && !st.risen ? 0 : 1, g = draw(i, j, k0), col = wearCol(cell[0], j);
        peaks += "<g class='wp-peak" + (on(i) ? " on" : "") + "' data-i='" + i + "' data-j='" + j + "' opacity='" + (on(i) ? 1 : 0.42) + "'><path class='wp-body' d='" + g.b + "' fill='" + col + "'/><path class='wp-mesh' d='" + g.d + "' stroke='" + col + "'/></g>"; }
      spots.forEach(q => { labs += q.on ? "<text class='wp-v on' data-i='" + q.i + "' data-j='" + q.j + "' x='" + fx(q.x) + "' y='" + fx(q.y) + "' text-anchor='middle' font-size='" + fv + "' font-weight='600' fill='#1a1a18'" + (st.risen ? "" : " opacity='0'") + ">" + q.t + "</text>"
        : "<text class='wp-v' data-i='" + q.i + "' data-j='" + q.j + "' x='" + fx(q.x) + "' y='" + fx(q.y) + "' text-anchor='middle' font-size='" + q.px + "' fill='#8a8983'>" + q.t + "</text>"; });
      const html = "<div class='wp'>" + svg(W, H, s + "<g class='wp-peaks'>" + peaks + "</g><g class='wp-labs'>" + labs + "</g>", "Mean molar wear by period and age at death, " + sel.map(i => P[i].p).join(" and ") + " picked out", "wp-svg") +
        "<div class='wp-smith' aria-live='polite'></div></div>";

      const wire = el => {
        const sv = el.querySelector(".wp-svg"), box = el.querySelector(".wp-smith"), cells = {};
        sv.querySelectorAll(".wp-peak").forEach(g => { cells[g.dataset.i + ":" + g.dataset.j] = { g, body: g.querySelector(".wp-body"), mesh: g.querySelector(".wp-mesh") }; });
        sv.querySelectorAll(".wp-v").forEach(t => { const c = cells[t.dataset.i + ":" + t.dataset.j]; if (c) c.t = t; });
        // the picks: each peak's look, and the Smith diagram under the chart
        const show = () => { Object.values(cells).forEach(c => c.g.classList.remove("sel")); sv.querySelectorAll(".wp-v.sel").forEach(t => t.classList.remove("sel"));
          st.picks.forEach(p => { const c = cells[p.i + ":" + p.j]; if (c) { c.g.classList.add("sel"); if (c.t) c.t.classList.add("sel"); } });
          box.innerHTML = smithHTML(st.picks, el.clientWidth); };
        Object.entries(cells).forEach(([id, c]) => { const [i, j] = id.split(":").map(Number), cell = P[i].cells[A[j]]; if (!on(i)) return;   // the other periods' peaks are context, not picked
          const html = "<b>" + esc(title(P[i].p)) + ", died " + A[j] + "</b><br>mean wear stage " + stageTxt(cell[0]) + ", n = " + cell[1];
          c.g.addEventListener("pointermove", ev => tip(html, ev)); c.g.addEventListener("pointerleave", () => tip(null));
          c.g.addEventListener("click", ev => { ev.stopPropagation(); tip(null); const k = st.picks.findIndex(p => p.i === i && p.j === j);
            if (k >= 0) st.picks.splice(k, 1); else { st.picks.push({ i, j }); if (st.picks.length > 2) st.picks.shift(); } show(); }); });
        // a click anywhere else on the card lets the picks go
        const panel = el.closest(".pp"); if (panel) { if (el._clr) panel.removeEventListener("click", el._clr);
          el._clr = ev => { if (!st.picks.length || ev.target.closest(".wp-peak,.wp-smith")) return; st.picks = []; show(); }; panel.addEventListener("click", el._clr); }
        show();
        // the clicked period's peaks rise from flat, one by one, youngest first (two compared: both rows together)
        if (!st.risen) { st.risen = true;
          const DUR = 520, GAP = 240, T0 = performance.now() + 450, todo = [];
          sel.forEach(i => A.forEach((a, j) => { const c = cells[i + ":" + j]; if (c) todo.push({ i, j, c, d: j * GAP }); }));
          if (REDUCED) todo.forEach(o => { const g = draw(o.i, o.j, 1); o.c.mesh.setAttribute("d", g.d); o.c.body.setAttribute("d", g.b); if (o.c.t) o.c.t.removeAttribute("opacity"); });
          else { const step = now => { let live = false;
              todo.forEach(o => { if (o.done) return; const k = Math.max(0, Math.min(1, (now - T0 - o.d) / DUR)); if (k < 1) live = true; if (k <= 0) return;
                const e = 1 - Math.pow(1 - k, 3), g = draw(o.i, o.j, e); o.c.mesh.setAttribute("d", g.d); o.c.body.setAttribute("d", g.b);
                if (o.c.t) o.c.t.setAttribute("opacity", Math.max(0, (k - 0.6) / 0.4).toFixed(2)); if (k >= 1) o.done = true; });
              if (live && sv.isConnected) requestAnimationFrame(step); };
            requestAnimationFrame(step); } }
      };
      return { html, wire };
    };
  }

  // Smith's (1984) molar wear stages as the GHHP codebook draws them (its Figure 14, after Smith 1984, Figure 7): a
  // crown's chewing surface at each stage, with its common variants, redrawn. Dentin (black) spreads as enamel wears
  // through: none at 1 and 2, pinpoints at 3, separate patches at 4, two joined at 5, an island of enamel left at 6, a
  // rim of enamel round an all-dentin surface at 7, no rim at 8.
  const SMV = [1, 2, 3, 3, 3, 3, 3, 3];   // variants drawn for each stage
  function smithIcon(st, v, cx, cy, s, ink) {
    const R = s / 2, seed = st * 7 + v * 3, jit = k => Math.sin(seed * 12.9898 + k * 78.233) * 0.5;
    const closed = (pts) => { const m = pts.length; let d = "M" + fx(pts[0][0]) + " " + fx(pts[0][1]);
      for (let k = 0; k < m; k++) { const p0 = pts[(k + m - 1) % m], p1 = pts[k], p2 = pts[(k + 1) % m], p3 = pts[(k + 2) % m];
        d += "C" + [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]].map(fx).join(" "); } return d + "Z"; };
    // the crown's outline: rounded, with the lobes of its cusps; at stage 8 it pinches in at the middle, like a root
    const outline = (sc, pinch) => { const P2 = []; for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2, lobe = 1 + 0.07 * Math.cos(5 * a + seed) + 0.03 * jit(k);
        const sx = Math.cos(a) * R * 0.96 * lobe * sc, sy = Math.sin(a) * R * 0.86 * lobe * sc * (1 - pinch * Math.exp(-Math.pow(Math.cos(a) * 2.2, 2)));
        P2.push([cx + sx, cy + sy]); } return closed(P2); };
    const blob = (x, y, r, k) => { const P2 = []; for (let q = 0; q < 8; q++) { const a = q / 8 * Math.PI * 2, rr = r * (1 + 0.28 * jit(k * 9 + q)); P2.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } return closed(P2); };
    const line = d => "<path d='" + d + "' fill='none' stroke='" + ink + "' stroke-width='1' stroke-linecap='round'/>";
    const fill = (d, c) => "<path d='" + d + "' fill='" + (c || ink) + "'/>";
    let g = "";
    if (st <= 7) g += "<path d='" + outline(1, 0) + "' fill='#f3f2ee' stroke='" + ink + "' stroke-width='1.3'/>";
    const fiss = (n) => { let d = "M" + fx(cx - R * 0.5) + " " + fx(cy + jit(1) * R * 0.3) + "L" + fx(cx) + " " + fx(cy) + "L" + fx(cx + R * 0.5) + " " + fx(cy + jit(2) * R * 0.3) +
      "M" + fx(cx) + " " + fx(cy) + "L" + fx(cx + jit(3) * R * 0.3) + " " + fx(cy - R * 0.55) + "M" + fx(cx) + " " + fx(cy) + "L" + fx(cx + jit(4) * R * 0.4) + " " + fx(cy + R * 0.55);
      if (n > 1) d += "M" + fx(cx - R * 0.5) + " " + fx(cy) + "L" + fx(cx - R * 0.7) + " " + fx(cy - R * 0.35) + "M" + fx(cx + R * 0.5) + " " + fx(cy) + "L" + fx(cx + R * 0.66) + " " + fx(cy + R * 0.38) +
        "M" + fx(cx - R * 0.25) + " " + fx(cy + R * 0.42) + "q" + fx(R * 0.1) + " " + fx(R * 0.16) + " " + fx(R * 0.28) + " " + fx(R * 0.1) + "M" + fx(cx + R * 0.2) + " " + fx(cy - R * 0.45) + "q" + fx(R * 0.12) + " " + fx(-R * 0.1) + " " + fx(R * 0.26) + " 0";
      return line(d); };
    if (st === 1) g += fiss(2);
    else if (st === 2) g += fiss(v === 0 ? 1 : 2);
    else if (st === 3) { g += fiss(1); for (let k = 0; k < v + 1; k++) g += fill(blob(cx + Math.cos(k * 2.1 + seed) * R * 0.55, cy + Math.sin(k * 2.1 + seed) * R * 0.5, R * 0.09, k)); }
    else if (st === 4) { const n = 3 + v; for (let k = 0; k < n; k++) g += fill(blob(cx + Math.cos(k / n * 6.28 + seed) * R * 0.5, cy + Math.sin(k / n * 6.28 + seed) * R * 0.45, R * (0.13 + 0.04 * jit(k)), k)); }
    else if (st === 5) { g += fill(blob(cx - R * 0.05, cy - R * 0.2, R * 0.38, 1)) + fill(blob(cx + R * 0.15, cy - R * 0.18, R * 0.3, 2)); for (let k = 0; k < 2; k++) g += fill(blob(cx + (k ? 0.45 : -0.45) * R, cy + R * 0.4, R * 0.12, k + 5)); }
    else if (st === 6) { g += fill(outline(0.8, 0)); g += v === 1 ? fill(blob(cx, cy, R * 0.18, 3), "#f3f2ee") : fill(blob(cx + (v ? R * 0.3 : -R * 0.32), cy + R * 0.32, R * 0.16, 4), "#f3f2ee"); }
    else if (st === 7) g += fill(outline(0.8, v === 2 ? 0.12 : 0));
    else g += fill(outline(v === 0 ? 0.92 : 0.86, 0.25 + v * 0.15));
    return g;
  }
  // the diagram for the peaks picked: every stage, the ones each mean falls between in ink (the others grey), with
  // their words and what a mean stage means
  function smithHTML(picks, W) {
    if (!picks.length) return "<p class='pd-hint'>Click one of the highlighted peaks to see the stage of wear it stands for. Click a second to compare them.</p>";
    const P = WD.periods, A = WD.ages, w = Math.max(220, Math.min(W, 520)), cw = w / 8, s = Math.min(26, cw * 0.62), G = "#b9b7b0";
    const span = v => { const lo = Math.max(1, Math.floor(v + 1e-6)), hi = Math.min(8, Math.ceil(v - 1e-6)); return lo === hi ? [lo] : [lo, hi]; };
    const ps = picks.map(p => ({ p, v: P[p.i].cells[A[p.j]][0], n: P[p.i].cells[A[p.j]][1], col: ageCol(p.j) })), hiSet = new Set(ps.flatMap(q => span(q.v)));
    let g = "", H = 0;
    for (let st = 1; st <= 8; st++) { const x = cw * (st - 0.5), ink = hiSet.has(st) ? "#1a1a18" : G;
      g += T(x, 13, String(st), { a: "middle", s: 12.5, c: hiSet.has(st) ? "#1a1a18" : "#8a8983", w: hiSet.has(st) ? 600 : 0 });
      ps.forEach((q, k) => { if (span(q.v).includes(st)) g += "<circle cx='" + fx(x + (ps.length > 1 ? (k ? 5 : -5) : 0)) + "' cy='19.5' r='2.6' fill='" + q.col + "'/>"; });
      for (let v = 0; v < SMV[st - 1]; v++) { const y = 26 + s / 2 + v * (s + 12); if (v) g += L(x, y - s / 2 - 10, x, y - s / 2 - 3, ink, 1); g += smithIcon(st, v, x, y, s, ink); H = Math.max(H, y + s / 2 + 4); } }
    const words = [...hiSet].sort((a, b) => a - b).map(st => "<li><b>" + st + "</b>" + esc(WD.smith[st - 1]) + "</li>").join("");
    const said = ps.map(q => { const sp = span(q.v);
      return "<p><i class='pp-kd' style='background:" + q.col + "'></i><b>" + esc(title(P[q.p.i].p)) + ", died " + A[q.p.j] + "</b>: mean stage <b>" + stageTxt(q.v) + "</b>, n = " + q.n + (sp.length > 1 ? ", between stages " + sp[0] + " and " + sp[1] : ", stage " + sp[0]) + ".</p>"; }).join("");
    const diff = ps.length > 1 ? "<p>The second is " + B(Math.abs(ps[1].v - ps[0].v).toFixed(1)) + " stage" + (Math.abs(ps[1].v - ps[0].v) >= 1.05 ? "s" : "") + " " + (ps[1].v < ps[0].v ? "less" : "more") + " worn.</p>" : "";
    return "<div class='wp-sm'>" + svg(w, H, g, "Smith molar wear stages 1 to 8, with " + [...hiSet].join(" and ") + " picked out") + "</div><ul class='wp-words'>" + words + "</ul>" + said + diff +
      "<p class='wp-note'>Molar wear is scored in whole stages, from 1 (unworn) to 8. A mean such as " + stageTxt(ps[0].v) + " is the average of " + ps[0].n + " adults' scores, not a stage itself: on average, their molars were worn " + (span(ps[0].v).length > 1 ? "between stages " + span(ps[0].v).join(" and ") : "to stage " + span(ps[0].v)[0]) + ".</p>";
  }

  // the wear card's lines of text, from the grid
  function wearLead(sel) {
    const P = WD.periods, A = WD.ages, pooled = WD.pooled || [], first = i => A.find(a => P[i].cells[a]), last = i => A.slice().reverse().find(a => P[i].cells[a]), at = (i, a) => P[i].cells[a][0];
    const ph2 = i => "the " + low(P[i].p) + " period";
    if (sel.length > 1) { const [a, b] = sel, la = last(a), lb = last(b);
      return "Pooled over every age, molar wear " + (pooled[b][0] < pooled[a][0] ? "fell" : "rose") + " from stage " + B(pooled[a][0].toFixed(2)) + " in " + ph2(a) + " to " + B(pooled[b][0].toFixed(2)) + " in " + ph2(b) + ".<br>" +
        (la === lb ? "At " + la + ", molars were worn to " + B(stageTxt(at(a, la))) + " and " + B(stageTxt(at(b, lb))) + "." : "The oldest were worn to " + B(stageTxt(at(a, la))) + " (" + la + ") and " + B(stageTxt(at(b, lb))) + " (" + lb + ")."); }
    const i = sel[0], f = first(i), l = last(i), all = pooled.map(q => q[0]);
    return "In " + ph2(i) + ", molar wear built from stage " + B(stageTxt(at(i, f))) + " at " + f + " to " + B(stageTxt(at(i, l))) + " at " + (l === "60+" ? "60 and over" : l) + ".<br>" +
      "Over every age it averaged " + B(pooled[i][0].toFixed(2)) + (pooled[i][0] === Math.max(...all) ? ", the most of any period." : pooled[i][0] === Math.min(...all) ? ", the least of any period." : ".");
  }
  // the events of a period (or two), as the other records' last slides
  const overlapsY = (e, y0, y1) => e.from < y1 && e.to >= y0;
  const ghhpSpan = i => { const cl = (window.RADIAL_DATA || []).find(c => c.key === "wear"); return cl ? [cl.dens[i][0], cl.dens[i][1]] : [0, 0]; };
  function evsFor(list, sel) { return list.filter(e => sel.some(i => { const [a, b] = ghhpSpan(i); return overlapsY(e, a, b); })).sort((p, q) => p.from - q.from); }
  const evWhen = e => e.from === e.to ? String(e.from) : e.from + "–" + e.to;
  function wlEventsHTML(E, evs, effect, note) {
    return "<div class='pp-evs" + (evs.length > 1 ? " sc" : "") + "'>" + (E.line ? "<p class='pp-evi'>" + (E.head ? "<b>" + esc(E.head) + "</b>" : "") + esc(E.line) + "</p>" : "") +
      evs.map(e => "<figure class='pp-ev'>" + evPics(e) + "<figcaption><b>" + esc(e.name) + "</b><span class='pp-evd'>" + evWhen(e) + "</span><p>" + esc(e.line) + "</p>" + (effect ? "<p>" + effect(e) + "</p>" : "") + "</figcaption></figure>").join("") +
      "<p class='pp-evn'>" + note + (evs.some(e => !e.img) ? " Pictures to come." : "") + "</p></div>";
  }
  const evLeadFor = (evs, sel, nm) => { const cs = e => andList(sel.filter(i => { const [a, b] = ghhpSpan(i); return overlapsY(e, a, b); }).map(i => "the " + low(nm(i)) + " period"));
    const groups = []; evs.forEach(e => { const g = groups.find(x => x.cs === cs(e)); if (g) g.evs.push(e); else groups.push({ cs: cs(e), evs: [e] }); });
    return groups.map(g => cap(g.cs) + " overlap" + (g.cs.indexOf(" and ") < 0 ? "s " : " ") + andList(g.evs.map(e => (e.note || e.name) + " (" + evWhen(e) + ")")) + ".").join("<br>"); };

  P.CONTENT.wear = pick => {
    if (!WD || !WD.periods) return {};
    const sel = (pick.pair || [pick]).map(q => q.i).sort((a, b) => a - b); if (sel.some(i => !WD.periods[i])) return {};
    const st = { picks: [], risen: false }, ch = charts([wearChart(sel, st)]), evs = evsFor(WE.events || [], sel), pooled = WD.pooled || [];
    const slides = [{ html: wearLead(sel), body: ch.body(0) }];
    if (evs.length) slides.push({ html: evLeadFor(evs, sel, i => WD.periods[i].p), body: wlEventsHTML(WE, evs, e => sel.filter(i => { const [a, b] = ghhpSpan(i); return overlapsY(e, a, b); }).map(i =>
      "Mean molar wear in the " + low(WD.periods[i].p) + " period: stage " + B(pooled[i][0].toFixed(2)) + (i ? ", " + (pooled[i][0] < pooled[i - 1][0] ? "down" : "up") + " from " + pooled[i - 1][0].toFixed(2) + " in the " + low(WD.periods[i - 1].p) : "") + ".").join(" "),
      "Event dates are historical context. Wear is the mean Smith stage of adults' molars, from 1 (unworn) to 8.") });
    return { slides, mount: ch.mount, source: "Global History of Health Project (Europe) · adults 18–69 · Smith (1984) stages · n = " + sel.map(i => pooled[i] ? pooled[i][1].toLocaleString("en-GB") : "").join(" and ") };
  };

  // ---- stress lines (the Wear and LEH line's second card): the lower canine, after the team's C10, C9 and C8
  const LC = window.LEH_CANINE, LE = window.LEH_EVENTS || { events: [] };
  // a label broken into lines no wider than w (at its size), and those lines drawn one under another from y
  const wrapLines = (t, px, w) => { const out = []; let cur = ""; t.split(" ").forEach(word => { const nx = cur ? cur + " " + word : word; if (cur && tw(nx, px) > w) { out.push(cur); cur = word; } else cur = nx; }); if (cur) out.push(cur); return out; };
  const TW = (x, y, t, o, w) => { const ls = wrapLines(t, o.s, w); return { svg: ls.map((l, k) => T(x, y + k * (o.s + 3), l, o)).join(""), n: ls.length, h: ls.length * (o.s + 3) }; };
  const sgn = (v, d) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d == null ? 1 : d);
  // in the Wear and LEH line's own colour (the ink); two compared, the earlier in a grey of it
  const lehCols = (sel, col) => { const c = /^#[0-9a-f]{6}$/i.test(col || "") ? col.toLowerCase() : "#1a1a18"; return sel.length > 1 ? [mix(c, "#ffffff", 0.5), c] : [c]; };
  const tint = (c, t) => mix(c, "#ffffff", t);

  // the main chart: the share of adults with at least one line on the lower canine, a bar for the period clicked (two
  // compared: one each, the earlier lighter), with its 95% interval and its count
  function lehBar(sel, cols, W) {
    const E = LC.eras, two = sel.length > 1, G = "#8a8983", x0 = two ? Math.ceil(Math.max(...sel.map(i => tw(title(E[i].p), 12.5)))) + 14 : 0;
    const X = v => x0 + (W - x0) * v / 100, bh = two ? 28 : 36, gap = 16, y0 = 6;
    let s = "";
    const TK = W - x0 < 170 ? [0, 50, 100] : [0, 25, 50, 75, 100];
    TK.forEach(v => { s += L(X(v) - (v === 100 ? 1 : 0), y0 - 2, X(v) - (v === 100 ? 1 : 0), y0 + sel.length * bh + (sel.length - 1) * gap + 4, "rgba(26,26,24,.08)"); });
    sel.forEach((i, k) => { const e = E[i], y = y0 + k * (bh + gap), m = y + bh / 2;
      if (two) s += T(x0 - 12, m + 4.5, title(e.p), { a: "end", s: 12.5, c: "#1a1a18" });
      s += "<rect class='lb-bar' data-i='" + i + "' x='" + fx(X(0)) + "' y='" + y + "' width='" + fx(X(e.pct) - X(0)) + "' height='" + bh + "' fill='" + cols[k] + "'/>";
      s += L(X(e.ci[0]), m, X(e.ci[1]), m, "#1a1a18", 1.2) + L(X(e.ci[0]), m - 6, X(e.ci[0]), m + 6, "#1a1a18", 1.2) + L(X(e.ci[1]), m - 6, X(e.ci[1]), m + 6, "#1a1a18", 1.2);
      const lx = X(e.ci[1]) + 10, cnt = e.k.toLocaleString("en-GB") + " of " + e.n.toLocaleString("en-GB") + " adults";
      s += T(lx, m - 1, e.pct.toFixed(1) + "%", { s: 13.5, c: "#1a1a18", w: 600 }) + T(lx, m + 13, lx + tw(cnt, 11) <= W ? cnt : e.k + "/" + e.n, { s: 11, c: G }); });
    const ya = y0 + sel.length * bh + (sel.length - 1) * gap + 8;
    s += L(x0, ya, W - 1, ya, "rgba(26,26,24,.3)");
    TK.forEach(v => { const x = X(v) - (v === 100 ? 1 : 0); s += L(x, ya, x, ya + 5, G) + T(x, ya + 20, v + "%", { a: v ? v === 100 ? "end" : "middle" : "start", s: 12, c: G }); });
    const at = TW(W / 2, ya + 40, "Share of Adults with a Line on the Lower Canine", { a: "middle", s: 12.5, c: G, i: true }, W - 4);
    const nt = TW(0, ya + 42 + at.h, "The whisker is the 95% interval.", { s: 11, c: G }, W);
    s += at.svg + nt.svg;
    const html = svg(W, ya + 46 + at.h + nt.h, s, "Share of adults with a stress line on the lower canine, " + sel.map(i => E[i].p).join(" and "));
    const wire = el => el.querySelectorAll(".lb-bar").forEach(b => { const e = E[+b.dataset.i];
      const h = "<b>" + esc(title(e.p)) + "</b><br>" + e.k + " of " + e.n + " adults, " + e.pct.toFixed(1) + "%<br><span class='m'>95% interval " + e.ci[0] + "–" + e.ci[1] + "%; age-standardised " + e.std.toFixed(1) + "%</span>";
      b.addEventListener("pointermove", ev => tip(h, ev)); b.addEventListener("pointerleave", () => tip(null)); });
    return { html, wire };
  }

  // the supporting chart by age (the team's C9): a line forms in childhood, so the share with one should not change with
  // age at death. Above, each age band's share as points from the period's own (a dot, filled where it rests on at least
  // 40 adults), and the fitted line through them; below, the slope in each of the period's cemeteries, a row each.
  // Hovering a cemetery draws its own slope over the line graph; two compared, hovering a period's line shows its cemeteries.
  function lehAge(sel, cols, st) {
    const E = LC.eras, A = LC.ages, two = sel.length > 1;
    return W => {
      const G = "#8a8983", m = { l: 42, r: 8, t: 34, b: 38 }, lim0 = Math.max(...sel.map(i => Math.max(...E[i].cells.map(c => Math.max(Math.abs(c[4]), Math.abs(c[5]))))));
      const lim = Math.ceil((lim0 + 1) / 5) * 5, step = lim > 20 ? 10 : 5, Y = v => m.t + (H - m.t - m.b) * (lim - v) / (2 * lim);
      const X = j => m.l + 10 + (W - m.l - m.r - 20) * j / (A.length - 1), every = (W - m.l - m.r) / (A.length - 1) < tw("18–24", 11) + 8 ? 2 : 1;
      let s = "";
      // the key: each period's colour, name and slope
      let kx = 0, ky = 11; sel.forEach((i, k) => { const t = title(E[i].p) + ": " + sgn(E[i].slope, 2) + " per decade", w = 19 + tw(t, 11.5); if (kx && kx + w > W) { kx = 0; ky += 17; }
        s += "<rect x='" + fx(kx) + "' y='" + (ky - 5) + "' width='14' height='3' fill='" + cols[k] + "'/>" + T(kx + 19, ky, t, { s: 11.5, c: "#1a1a18" }); kx += w + 18; });
      m.t = ky + 23; const H = m.t + 196;
      for (let v = -lim; v <= lim; v += step) s += L(m.l, Y(v), W - m.r, Y(v), v ? "rgba(26,26,24,.08)" : "rgba(26,26,24,.45)", v ? 1 : 1.1) + T(m.l - 6, Y(v) + 4, (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v), { a: "end", s: 11, c: G });
      A.forEach((a, j) => { const lastJ = A.length - 1; if ((j % every === 0 && !(every > 1 && j === lastJ - 1)) || j === lastJ) s += T(X(j), H - m.b + 17, a, { a: "middle", s: 11, c: "#55544f" }); });
      s += T((m.l + W - m.r) / 2, H - 4, "Age at Death", { a: "middle", s: 12, c: G, i: true });
      s += "<text x='11' y='" + fx((m.t + H - m.b) / 2) + "' text-anchor='middle' font-size='11' font-style='italic' fill='" + G + "' transform='rotate(-90 11 " + fx((m.t + H - m.b) / 2) + ")'>" + (H - m.t - m.b >= tw("Points from the Period's Share", 11) ? "Points from the Period's Share" : "Points from Share") + "</text>";
      s += "<g class='lc-site'></g>";
      sel.forEach((i, k) => { const e = E[i], c = cols[k], pts = e.cells.map((q, j) => [X(j), Y(q[4])]), fit = e.cells.map((q, j) => [X(j), Y(q[5])]);
        s += "<g class='lc-p' data-i='" + i + "'><polyline points='" + pts.map(p => fx(p[0]) + "," + fx(p[1])).join(" ") + "' fill='none' stroke='" + c + "' stroke-width='1' stroke-opacity='.6'/>" +
          "<polyline points='" + fit.map(p => fx(p[0]) + "," + fx(p[1])).join(" ") + "' fill='none' stroke='" + c + "' stroke-width='2.6' stroke-linecap='round'/>" +
          e.cells.map((q, j) => "<circle class='lc-dot' data-i='" + i + "' data-j='" + j + "' cx='" + fx(pts[j][0]) + "' cy='" + fx(pts[j][1]) + "' r='3.2' fill='" + (q[1] >= 40 ? c : "#f3f2ee") + "' stroke='" + c + "' stroke-width='1.3'/>").join("") +
          "<polyline class='lc-hit' points='" + fit.map(p => fx(p[0]) + "," + fx(p[1])).join(" ") + "'/></g>"; });
      const html = "<div class='lc'>" + svg(W, H, s, "Stress lines by age at death, as points from the period's share, " + sel.map(i => E[i].p).join(" and "), "lc-a") + "<div class='lc-b'></div>" +
        "<p class='pd-hint'>Filled dots: 40 adults or more. Hover a cemetery to draw its slope above" + (two ? ", or a period's line to see its cemeteries." : ".") + "</p></div>";

      const wire = el => {
        const sa = el.querySelector(".lc-a"), bx = el.querySelector(".lc-b"), over = sa.querySelector(".lc-site"), lines = [...sa.querySelectorAll(".lc-p")];
        // the slope in each cemetery of one period (the team's C9B), a row each: its name, a bar from zero to its slope,
        // the slope; the period's own at the foot. Two compared: the later period's first, the other's while the pointer
        // is on its line
        if (st.focus == null || !sel.includes(st.focus)) st.focus = sel[sel.length - 1];
        const drawB = i => { const e = E[i], c = cols[sel.indexOf(i)], rows = e.sites.filter(q => q[4] != null).map(q => ({ name: q[0], n: q[1], pct: q[2], slope: q[4] })).concat([{ name: "All Cemeteries", n: e.n, pct: e.pct, slope: e.slope, all: true }]);
          const rh = 21, lw = Math.min(W * 0.36, Math.max(...rows.map(r => tw(r.name, 11.5))) + 10), vw = tw("+15.11", 11.5) * 1.06 + 8, xl = Math.max(4, Math.ceil(Math.max(...rows.map(r => Math.abs(r.slope))) * 1.1 + 0.5));
          const h1 = TW(0, 13, title(e.p) + ": Slope in Each Cemetery", { s: 12.5, c: "#1a1a18", w: 600 }, W * 0.92), h2 = TW(0, 13 + h1.h + 1, "Cemeteries with at least " + LC.sitesMin + " scorable canines (" + (rows.length - 1) + " of " + e.sitesAll + ")", { s: 11, c: G }, W);
          const XB = v => lw + (W - lw - vw - 8) * (v + xl) / (2 * xl), top = 22 + h1.h + h2.h, HB = top + rows.length * rh + 40;
          const fitName = t => { if (tw(t, 11.5) <= lw - 10) return t; let u = t; while (u.length > 3 && tw(u + "…", 11.5) > lw - 10) u = u.slice(0, -1); return u.trim() + "…"; };
          const unit = (W - lw - vw - 8) / (2 * xl), tk = [1, 2, 4, 5, 10, 20].find(q => q * unit >= 28) || 20;
          let b = h1.svg + h2.svg + "<rect x='" + fx(XB(-xl)) + "' y='" + (top - 4) + "' width='" + fx(XB(0) - XB(-xl)) + "' height='" + (rows.length * rh + 4) + "' fill='rgba(26,26,24,.035)'/>";
          for (let v = -Math.floor(xl / tk) * tk; v <= xl; v += tk) { const x = XB(v); b += L(x, top - 4, x, top + rows.length * rh, v ? "rgba(26,26,24,.08)" : "rgba(26,26,24,.45)") + T(x, top + rows.length * rh + 14, (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v), { a: "middle", s: 11, c: G }); }
          b += T((XB(-xl) + XB(xl)) / 2, HB - 6, "Slope, Points per Decade of Age", { a: "middle", s: 12, c: G, i: true }) + T(W, top - 6, "Slope", { a: "end", s: 11, c: G });
          rows.forEach((r, q) => { const y = top + q * rh + rh / 2, x = XB(r.slope);
            b += "<g class='lc-row" + (r.all ? " all" : "") + "' data-q='" + q + "'><rect x='0' y='" + fx(y - rh / 2) + "' width='" + fx(W) + "' height='" + rh + "' fill='transparent'/>" +
              T(lw - 8, y + 4, fitName(r.name), { a: "end", s: 11.5, c: "#1a1a18", w: r.all ? 600 : 0 }) + L(XB(0), y, x, y, c, r.all ? 4 : 3) +
              "<circle cx='" + fx(x) + "' cy='" + fx(y) + "' r='" + (r.all ? 5 : 4) + "' fill='" + c + "' stroke='#f3f2ee' stroke-width='1.2'/>" +
              T(W, y + 4, sgn(r.slope, 2), { a: "end", s: 11.5, c: "#1a1a18", w: r.all ? 600 : 0 }) + "</g>"; });
          bx.innerHTML = svg(W, HB, b, "Slope of stress lines on age at death in each cemetery of the " + e.p + " period", "lc-bs");
          // a cemetery under the pointer: its own slope drawn over the line graph, through the period's mean age
          bx.querySelectorAll(".lc-row").forEach(g => { const r = rows[+g.dataset.q];
            g.addEventListener("pointerenter", () => { g.classList.add("on"); const pts = LC.mids.map((a, j) => [X(j), Y(r.slope * (a - e.meanAge) / 10)]);
              over.innerHTML = "<polyline points='" + pts.map(p2 => fx(p2[0]) + "," + fx(p2[1])).join(" ") + "' fill='none' stroke='" + c + "' stroke-width='2' stroke-dasharray='5 4'/>" + T(X(A.length - 1) - 2, Y(r.slope * (LC.mids[A.length - 1] - e.meanAge) / 10) - 7, r.name, { a: "end", s: 11, c: "#1a1a18" });
              lines.forEach(l => l.classList.toggle("dim", +l.dataset.i !== i)); });
            g.addEventListener("pointermove", ev => tip("<b>" + esc(r.name) + "</b><br>" + sgn(r.slope, 2) + " points per decade of age<br><span class='m'>" + r.n.toLocaleString("en-GB") + " scorable canines, " + r.pct + "% with a line</span>", ev));
            g.addEventListener("pointerleave", () => { g.classList.remove("on"); over.innerHTML = ""; lines.forEach(l => l.classList.remove("dim")); tip(null); }); }); };
        drawB(st.focus);
        lines.forEach(l => { const i = +l.dataset.i;
          l.addEventListener("pointerenter", () => { if (two && st.focus !== i) { st.focus = i; drawB(i); } lines.forEach(z => z.classList.toggle("dim", z !== l)); });
          l.addEventListener("pointerleave", () => lines.forEach(z => z.classList.remove("dim"))); });
        sa.querySelectorAll(".lc-dot").forEach(d => { const e = E[+d.dataset.i], q = e.cells[+d.dataset.j];
          d.addEventListener("pointermove", ev => tip("<b>" + esc(title(e.p)) + ", died " + q[0] + "</b><br>" + q[2] + " of " + q[1] + " adults, " + q[3] + "% (" + sgn(q[4], 1) + " points from " + e.pct + "%)" + (q[1] < 40 ? "<br><span class='m'>fewer than 40 adults</span>" : ""), ev));
          d.addEventListener("pointerleave", () => tip(null)); });
      };
      return { html, wire };
    };
  }

  // the supporting chart by severity (the team's C8): adults by how many lines the canine carries, and each cemetery's
  // share with two or more, sized by its adults, against the period's own; two compared, hovering one period picks it
  // out in both
  function lehSev(sel, cols) {
    const E = LC.eras, two = sel.length > 1;
    return W => {
      const G = "#8a8983", segC = k => ["#dcdad3", tint(cols[k], 0.55), cols[k]], names = ["No Line", "One Line", "Two or More Lines"];
      const x0 = two ? Math.ceil(Math.max(...sel.map(i => tw(title(E[i].p), 12.5)))) + 14 : 0, X = v => x0 + (W - x0) * v / 100, bh = two ? 26 : 34, gap = 12;
      let s = "", lx = 0, ly = 2;
      names.forEach((t, q) => { const w = 17 + tw(t, 12); if (lx && lx + w > W) { lx = 0; ly += 19; } s += "<rect x='" + fx(lx) + "' y='" + ly + "' width='12' height='12' fill='" + segC(sel.length - 1)[q] + "'/>" + T(lx + 17, ly + 10.5, t, { s: 12 }); lx += w + 16; });
      const y0 = ly + 24;
      sel.forEach((i, k) => { const e = E[i], y = y0 + k * (bh + gap); let a = 0;
        s += "<g class='ls-row' data-i='" + i + "'>" + (two ? T(x0 - 12, y + bh / 2 + 4.5, title(e.p), { a: "end", s: 12.5, c: "#1a1a18" }) : "");
        e.comp.forEach((v, q) => { const x = X(a), w = X(a + v) - x; s += "<rect class='ls-seg' data-q='" + q + "' x='" + fx(x) + "' y='" + y + "' width='" + fx(Math.max(0, w - (q < 2 ? 2 : 0))) + "' height='" + bh + "' fill='" + segC(k)[q] + "'/>";
          if (w > 28) s += T(x + w / 2 - 1, y + bh / 2 + 5, Math.round(v) + "", { a: "middle", s: 13, c: q === 2 ? "#fff" : "#1a1a18", w: 600 }); a += v; });
        s += "</g>"; });
      const ya = y0 + sel.length * bh + (sel.length - 1) * gap + 8;
      s += L(x0, ya, W - 1, ya, "rgba(26,26,24,.3)");
      (W - x0 < 170 ? [0, 50, 100] : [0, 25, 50, 75, 100]).forEach(v => { const x = X(v) - (v === 100 ? 1 : 0); s += L(x, ya, x, ya + 5, G) + T(x, ya + 20, v + "%", { a: v ? v === 100 ? "end" : "middle" : "start", s: 12, c: G }); });
      const at = TW(W / 2, ya + 40, "Share of Adults with a Scorable Lower Canine", { a: "middle", s: 12.5, c: G, i: true }, W - 4); s += at.svg;
      const HA = ya + 32 + at.h;
      // each cemetery's share with two or more lines, a column per period
      const b1 = TW(0, 13, "Each Cemetery's Share with Two or More Lines", { s: 12.5, c: "#1a1a18", w: 600 }, W * 0.92), b2 = TW(0, 13 + b1.h + 1, "Sized by its adults; the bar is the period's own share", { s: 11, c: G }, W);
      const top = 22 + b1.h + b2.h, HB = top + 150, yMax = Math.max(40, Math.ceil(Math.max(...sel.map(i => Math.max(E[i].comp[2], ...E[i].sites.map(q => q[3])))) / 10) * 10);
      const YB = v => top + (HB - top - 40) * (yMax - v) / yMax, cw = (W - 40) / sel.length, nMax = Math.max(...sel.flatMap(i => E[i].sites.map(q => q[1])));
      let b = b1.svg + b2.svg;
      for (let v = 0; v <= yMax; v += yMax > 40 ? 20 : 10) b += L(36, YB(v), W, YB(v), "rgba(26,26,24,.08)") + T(30, YB(v) + 4, v + "%", { a: "end", s: 11, c: G });
      sel.forEach((i, k) => { const e = E[i], cx = 40 + cw * (k + 0.5);
        b += "<g class='ls-col' data-i='" + i + "'><rect x='" + fx(cx - cw / 2) + "' y='" + top + "' width='" + fx(cw) + "' height='" + (HB - top) + "' fill='transparent'/>" +
          L(cx - cw * 0.3, YB(e.comp[2]), cx + cw * 0.3, YB(e.comp[2]), "#1a1a18", 1.6) + (cx + cw * 0.3 + 6 + tw(e.comp[2].toFixed(1) + "%", 11) * 1.06 <= W ? T(cx + cw * 0.3 + 4, YB(e.comp[2]) + 4, e.comp[2].toFixed(1) + "%", { s: 11, c: "#1a1a18", w: 600 })
            : T(cx - cw * 0.3 - 4, YB(e.comp[2]) + 4, e.comp[2].toFixed(1) + "%", { a: "end", s: 11, c: "#1a1a18", w: 600 })) +
          T(cx, HB - 20, title(e.p), { a: "middle", s: 12, c: "#1a1a18" }) + T(cx, HB - 5, e.sites.length + " cemeteries", { a: "middle", s: 11, c: G });
        e.sites.forEach((q, z) => { const jx = cx + (((z * 0.618) % 1) - 0.5) * cw * 0.5, r = Math.max(2.6, 9 * Math.sqrt(q[1] / nMax));
          b += "<circle class='ls-dot' data-i='" + i + "' data-z='" + z + "' cx='" + fx(jx) + "' cy='" + fx(YB(q[3])) + "' r='" + fx(r) + "' fill='" + cols[k] + "' fill-opacity='.7' stroke='#f3f2ee' stroke-width='.8'/>"; });
        b += "</g>"; });
      const html = "<div class='ls'>" + svg(W, HA, s, "Adults by how many stress lines the lower canine carries, " + sel.map(i => E[i].p).join(" and "), "ls-a") + svg(W, HB, b, "Each cemetery's share with two or more lines", "ls-b") + "</div>";
      const wire = el => {
        const rows = [...el.querySelectorAll(".ls-row")], colsB = [...el.querySelectorAll(".ls-col")];
        const focus = i => { rows.concat(colsB).forEach(g => g.classList.toggle("dim", i != null && +g.dataset.i !== i)); };
        if (two) rows.concat(colsB).forEach(g => { g.addEventListener("pointerenter", () => focus(+g.dataset.i)); g.addEventListener("pointerleave", () => focus(null)); });
        el.querySelectorAll(".ls-seg").forEach(r => { const e = E[+r.closest(".ls-row").dataset.i], q = +r.dataset.q;
          r.addEventListener("pointermove", ev => tip("<b>" + esc(title(e.p)) + "</b><br>" + names[q].toLowerCase() + ": " + e.compN[q] + " of " + e.n + " adults, " + e.comp[q] + "%", ev)); r.addEventListener("pointerleave", () => tip(null)); });
        el.querySelectorAll(".ls-dot").forEach(d => { const e = E[+d.dataset.i], q = e.sites[+d.dataset.z];
          d.addEventListener("pointermove", ev => tip("<b>" + esc(q[0]) + "</b>, " + esc(low(e.p)) + "<br>" + q[3] + "% with two or more lines<br><span class='m'>" + q[1] + " scorable canines</span>", ev)); d.addEventListener("pointerleave", () => tip(null)); });
      };
      return { html, wire };
    };
  }

  // the stress-line card's lines of text, from the counts
  const lphr = i => "the " + low(LC.eras[i].p) + " period";
  function lehLead(sel, n) {
    const E = LC.eras, two = sel.length > 1;
    if (n === 0) { if (two) { const [a, b] = sel.map(i => E[i]), ov = Math.min(a.ci[1], b.ci[1]) >= Math.max(a.ci[0], b.ci[0]);
        return "From " + lphr(sel[0]) + " to " + lphr(sel[1]) + ", the share with a line on the lower canine " + (b.pct > a.pct ? "rose" : b.pct < a.pct ? "fell" : "held") + " from " + B(a.pct.toFixed(1) + "%") + " to " + B(b.pct.toFixed(1) + "%") + ".<br>" +
          (ov ? "Their 95% intervals overlap, so the difference may be chance." : "Their 95% intervals (" + a.ci[0] + "–" + a.ci[1] + "% and " + b.ci[0] + "–" + b.ci[1] + "%) do not overlap."); }
      const i = sel[0], e = E[i], pv = E[i - 1];
      return B(e.pct.toFixed(1) + "%") + " of adults had at least one stress line on the lower canine (" + e.k.toLocaleString("en-GB") + " of " + e.n.toLocaleString("en-GB") + ").<br>" +
        (pv ? (e.pct > pv.pct ? "Up" : e.pct < pv.pct ? "Down" : "The same as") + " from " + B(pv.pct.toFixed(1) + "%") + " in " + lphr(i - 1) + "." : "A line forms in childhood, before about age six, and stays for life."); }
    if (n === 1) { const one = "A line forms in childhood, so the share with one should not change with age at death.<br>";
      if (two) return one + "It shifts by " + B(sgn(E[sel[0]].slope)) + " points per decade of age in " + lphr(sel[0]) + " and " + B(sgn(E[sel[1]].slope)) + " in " + lphr(sel[1]) + ".";
      const e = E[sel[0]], down = e.sites.filter(q => q[4] < 0).length;
      return one + "In " + lphr(sel[0]) + " it shifts by " + B(sgn(e.slope)) + " points per decade of age, and " + B(down) + " of its " + B(e.sites.length) + " cemeteries slope down."; }
    if (two) { const [a, b] = sel.map(i => E[i]);
      return "Two or more lines: " + B(a.comp[2].toFixed(1) + "%") + " in " + lphr(sel[0]) + " and " + B(b.comp[2].toFixed(1) + "%") + " in " + lphr(sel[1]) + ".<br>One line: " + B(a.comp[1].toFixed(1) + "%") + " and " + B(b.comp[1].toFixed(1) + "%") + "."; }
    const e = E[sel[0]], ss = e.sites.slice().sort((p, q) => p[3] - q[3]), lo = ss[0], hi = ss[ss.length - 1];
    return B(e.comp[2].toFixed(1) + "%") + " had two or more lines, and " + B(e.comp[1].toFixed(1) + "%") + " had one.<br>" +
      (lo && hi && lo !== hi ? "Across its cemeteries, two or more ranged from " + B(lo[3] + "%") + " (" + esc(lo[0]) + ") to " + B(hi[3] + "%") + " (" + esc(hi[0]) + ")." : "");
  }

  P.CONTENT.leh = pick => {
    if (!LC || !LC.eras) return {};
    const sel = (pick.pair || [pick]).map(q => q.i).sort((a, b) => a - b); if (sel.some(i => !LC.eras[i])) return {};
    const cols = lehCols(sel, pick.col), st = {}, ch = charts([W => lehBar(sel, cols, W), lehAge(sel, cols, st), lehSev(sel, cols)]), evs = evsFor(LE.events || [], sel);
    const slides = [0, 1, 2].map(n => ({ html: lehLead(sel, n), body: ch.body(n) }));
    if (evs.length) slides.push({ html: evLeadFor(evs, sel, i => LC.eras[i].p), body: wlEventsHTML(LE, evs, e => sel.filter(i => { const [a, b] = ghhpSpan(i); return overlapsY(e, a, b); }).map(i => { const c = LC.eras[i], pv = LC.eras[i - 1];
      return "In the " + low(c.p) + " period, " + B(c.pct.toFixed(1) + "%") + " of adults had a line on the lower canine" + (pv ? ", " + (c.pct >= pv.pct ? "up" : "down") + " from " + pv.pct.toFixed(1) + "% in the " + low(pv.p) : "") + "."; }).join(" "),
      "Event dates are historical context. Shares are of adults 18–69 with a scorable lower canine.") });
    return { slides, mount: ch.mount, source: "Global History of Health Project (Europe) · adults 18–69, scorable lower canine · Schultz (1988) · n = " + sel.map(i => LC.eras[i].n.toLocaleString("en-GB")).join(" and ") };
  };
})();
