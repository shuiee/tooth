/* The pop-ups' content (window.ToothPopup.CONTENT), record by record, on the template in js/popup.js: three slides
   (the key insight with the record's main chart, a further insight with a supporting chart, the correlating human
   event), and the source. Every chart is the same for every period on its line, showing only the period clicked; two
   periods compared (pick.pair) show both, with a comparison in the slide's line of text. Every number is read from the
   data files (js/*-data.js); none is typed here. Records not written yet keep the template's placeholders.

   Caries (js/caries-data.js): the main chart, every adult in the period sorted by how many of their own teeth were
   carious (CARIES_RATES sev: none, 1-2, 3-4, 5-9, 10+), from the team's c2b severity figure; the supporting chart,
   the share of adults with at least one carious tooth by age at death (CARIES_AGE), from its c1b figure. The figures'
   footnotes are left out for now. */
(function () {
  "use strict";
  const P = window.ToothPopup; if (!P) return;
  const esc = v => String(v).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
  const r0 = v => Math.round(v);
  const fx = v => (Math.round(v * 10) / 10).toString();
  const ph = (label, cls) => "<div class='pp-ph" + (cls ? " " + cls : "") + "'><span>" + label + "</span></div>";
  const EVENT = { lead: "Correlating human event", body: ph("Image") + ph("Image caption", "pp-cap") };
  // an SVG drawing at its box's own width, in pixels, so its type is the page's size at any width; drawn (and drawn
  // again whenever the box changes width) once the card is on the page: chart(draw) puts the box in a slide, and the
  // card's mount draws it
  const svg = (w, h, inner, label) => "<svg class='pp-svg' width='" + w + "' height='" + fx(h) + "' viewBox='0 0 " + w + " " + fx(h) + "' role='img' aria-label='" + esc(label) + "'>" + inner + "</svg>";
  const charts = draws => ({ body: k => "<div class='pp-chart' data-k='" + k + "'></div>",
    mount: panel => panel.querySelectorAll(".pp-chart[data-k]").forEach(el => { const f = draws[+el.dataset.k]; if (!f) return;
      const go = () => { const w = Math.floor(el.clientWidth); if (w > 40 && !(Math.abs(w - (el._w || 0)) < 6)) { el._w = w; el.innerHTML = f(w); } };
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
    return {
      slides: [{ html: lead1, body: ch.body(0) }, { html: lead2, body: ag.length ? ch.body(1) : ph("Supplemental chart") }, EVENT], mount: ch.mount,
      source: "Global History of Health Project (Europe) · adults 18–69 · n = " + rs.map(r => r.n.toLocaleString("en-GB")).join(" and "),
    };
  };
})();
