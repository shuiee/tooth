/* The pop-up (window.ToothPopup): what the reader sees on clicking a time period, a circle on one of the radial's
   lines. radial.js calls opts.onSelect with the period clicked, or null once it is let go. One pop-up shows at a time,
   laid over the diagram at the right of the page (along the bottom on narrow pages), about a quarter of the page.

   Its header, from the circle clicked: the record's name in its colour, then "Selected Time: High Medieval Era,
   1000 – 1250 CE" (era()), and a close
   button (an X). Under it, three slides, stepped through with the arrows either side or the dots under them (and the
   arrow keys): the key data insight for this period with the record's main chart, the period's part of it
   highlighted; a further insight with a supplemental chart; and the human event this period correlates with, a
   picture and its caption. Under them, the source. Placeholders for now, the same for every record (SLIDES).
   To write a record's pop-up, give CONTENT[key] a function of the period clicked that returns { slides, source, mount }:
   slides, each { lead, body } (a line of text, or html for one with markup, and HTML for its box); source, a line; mount(panel) sets the card up once
   it is built. pick is { key, i, name, col, from, to, n, unit, range }, where i is the
   circle's index on its line (js/radial-data.js). Every number must come from a data file, never from here.

   Motion, after the team's reference (a card framed by crop marks): two hairlines draw out across the page from the
   pop-up's middle and part to its top and bottom edges, opening its paper between them, while hairlines run down its
   sides; its corners close in, small marks settle outside them, and the text resolves line by line out of a blur. The
   hairlines then fade, leaving the corners. Clicking another circle closes this pop-up as the next one opens in its
   place. With reduced motion, it fades in.

   Two periods picked on one line, to compare them, show one card for both (pick.pair, the earlier first): its header
   names both periods, the one the molar shows now (mark()) in the heavier weight, and its slides show both periods'
   data. Its X, or Escape, lets them both go. */
(function () {
  "use strict";
  const REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = v => String(v).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);

  const ph = (label, cls) => "<div class='pp-ph" + (cls ? " " + cls : "") + "'><span>" + label + "</span></div>";
  const SLIDES = [
    { lead: "Key data insight from this selected time point on the axis.", body: ph("Main chart") },
    { lead: "Additional key data insight from this selected time point on the axis.", body: ph("Supplemental chart") },
    { lead: "Correlating human event", body: ph("Image") + ph("Image caption", "pp-cap") } ];
  const placeholder = () => ({ slides: SLIDES, source: "Source" });
  // a period's era, for the header: the caries and wear periods' own names (the GHHP periods), the metals periods' own
  // names, and for any other record the GHHP period of its middle year (Modern from 1900); in title case, "Era" added
  // where the name is not an age or a century
  const title = t => t.split(" ").map((w, i) => i && /^(of|or|and|the|in|at|to|a|an|by|for|on)$/i.test(w) ? w.toLowerCase() : w.split("-").map(x => x.charAt(0).toUpperCase() + x.slice(1)).join("-")).join(" ");
  function era(pick) {
    const CR = window.CARIES_RATES || [], MD = window.METALS_DATA || {}, cl = (window.RADIAL_DATA || []).find(c => c.key === "caries");
    let n = null;
    if (pick.key === "metals" && MD.periods && MD.periods[pick.i]) n = MD.periods[pick.i].p;
    else if ((pick.key === "caries" || pick.key === "wear") && CR[pick.i]) n = CR[pick.i].p;
    else if (cl) { const y = (pick.from + pick.to) / 2; cl.dens.forEach((d, j) => { if (y >= d[0] && CR[j]) n = CR[j].p; }); if (y >= cl.dens[cl.dens.length - 1][1]) n = "Modern"; }
    if (!n) return ""; n = title(n); return /(Age|Century)$/.test(n) ? n : n + " Era";
  }
  // form 0: "Industrial Era, 1800 – 1900 CE"; 1: without the CE (not where BCE is); 2: without "Era" either
  const when = (q, f) => { let e = era(q), r = q.range; if (f >= 1 && !/BCE/.test(r)) r = r.replace(/ CE$/, ""); if (f >= 2) e = e.replace(/ Era$/, ""); return (e ? esc(e) + ", " : "") + esc(r); };
  const pairLine = (pick, f) => pick.pair.map(q => "<span class='pp-tm' data-id='" + q.key + ":" + q.i + "'>" + when(q, f) + "</span>").join(" / ");
  const CHEV = d => "<svg viewBox='0 0 12 22' aria-hidden='true'><path d='" + d + "'/></svg>";
  // each record's pop-up, from the period clicked: the template's placeholders for now
  const CONTENT = { caries: placeholder, pathogens: placeholder, wear: placeholder, leh: placeholder, metals: placeholder, interventions: placeholder };
  // the Wear and LEH line opens two cards for one period (or two compared), stacked: molar wear and stress lines (sub)
  const SUBS = { wear: [["wear", "Molar Wear"], ["leh", "Stress Lines (LEH)"]] };
  // records whose single card scrolls on its own, as the stacked ones do: its body under its header, wherever the card
  // is taller than the pop-up's room, so nothing runs past the card's edge (the interventions' samples chart is tall)
  const SCROLL = new Set(["interventions"]);

  function create(opts) {
    opts = opts || {};
    const box0 = document.createElement("aside"); box0.className = "pp-box"; box0.setAttribute("aria-label", "Selected time period");
    const live = document.createElement("p"); live.className = "pp-live"; live.setAttribute("aria-live", "polite");
    const guides = document.createElement("div"); guides.className = "pp-guides"; guides.setAttribute("aria-hidden", "true");
    box0.appendChild(live); document.body.append(guides, box0);
    let cur = [], box = null;   // the cards showing, earliest period first: [{ id, panel }]; the page area they cover
    const measure = () => { if (!cur.length) { box = null; return; } const r = box0.getBoundingClientRect();
      box = { side: getComputedStyle(box0).getPropertyValue("--side").trim() || "right", x: r.left, y: r.top, w: r.width, h: r.height }; };
    if (window.ResizeObserver) new ResizeObserver(measure).observe(box0);
    addEventListener("resize", measure);
    document.addEventListener("keydown", e => { if (e.key === "Escape" && cur.length && opts.onClose) opts.onClose(null); });

    // the crop marks: hairlines along the pop-up's edges across the whole page, drawn once as it opens
    function marks(panel) {
      if (REDUCED) return; const r = panel.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const mk = (cls, css) => { const e = document.createElement("i"); e.className = "pp-g " + cls; for (const k in css) e.style.setProperty(k, css[k]); guides.appendChild(e); return e; };
      const ls = [mk("h", { top: cy + "px", "transform-origin": cx + "px 0", "--dy": (-r.height / 2) + "px" }), mk("h", { top: cy + "px", "transform-origin": cx + "px 0", "--dy": (r.height / 2 - 1) + "px" }),
        mk("v", { left: r.left + "px", "transform-origin": "0 " + cy + "px" }), mk("v", { left: (r.right - 1) + "px", "transform-origin": "0 " + cy + "px" })];
      setTimeout(() => ls.forEach(e => e.remove()), 2000);
    }

    function open(pick) {
      const c = (CONTENT[pick.sub || pick.key] || placeholder)(pick), sl = c.slides && c.slides.length ? c.slides : SLIDES, panel = document.createElement("section");
      const own = !!pick.sub || SCROLL.has(pick.key);   // a card whose body scrolls under its header
      panel.className = "pp" + (SCROLL.has(pick.key) ? " pp-sc" : ""); panel.style.setProperty("--c", pick.col); panel.setAttribute("aria-label", pick.name + ", " + pick.range);
      const head = "<p class='pp-when pp-in" + (pick.pair ? " pair" : "") + "' style='--i:0'><span class='pp-rec'>" + esc(pick.name) + "</span><span>" + (pick.pair ? "Selected Times:</span><span class='pp-pl'>" + pairLine(pick, 0) : "Selected Time: " + when(pick, 0)) + "</span></p>";
      panel.innerHTML = "<div class='pp-sur'></div>" + ["tl", "tr", "bl", "br"].map(k => "<i class='pp-br " + k + "'></i><i class='pp-tk " + k + "'></i>").join("") +
        // the X on the card itself, not in its body (which scrolls, and clips, on narrow pages)
        "<button class='pp-x pp-in' style='--i:0' type='button' aria-label='Close " + esc(pick.name + ", " + pick.range) + "'>&times;</button>" +
        // of two stacked cards, a button to fold this one to its header, or open it again
        (pick.sub ? "<button class='pp-fold pp-in' style='--i:0' type='button' aria-expanded='true' aria-label='Fold " + esc(pick.name) + "'><svg viewBox='0 0 14 9' aria-hidden='true'><path d='M1 8l6-6 6 6'/></svg></button>" : "") +
        // the header: of a card whose body scrolls (two stacked, or SCROLL's), above the body, so it stays put and the
        // scroll bar starts below the X
        (own ? head : "") + "<div class='pp-body'>" + (own ? "" : head) +
        "<div class='pp-car pp-in' style='--i:1'><div class='pp-leads'>" + sl.map((x, j) => "<p class='pp-lead" + (j ? "" : " on") + "'>" + (x.html || esc(x.lead)) + "</p>").join("") + "</div>" +
        "<div class='pp-stage'><button class='pp-arw prev' type='button' aria-label='Previous'>" + CHEV("M10 1 1 11l9 10") + "</button>" +
        "<div class='pp-views'>" + sl.map((x, j) => "<div class='pp-view" + (j ? "" : " on") + "'>" + (x.body || "") + "</div>").join("") + "</div>" +
        "<button class='pp-arw next' type='button' aria-label='Next'>" + CHEV("M2 1l9 10-9 10") + "</button></div>" +
        (sl.length > 1 ? "<div class='pp-dots'>" + sl.map((x, j) => "<button class='pp-dot" + (j ? "" : " on") + "' type='button' aria-label='" + (j + 1) + " of " + sl.length + "'></button>").join("") + "</div>" : "") + "</div>" +
        (c.source ? "<p class='pp-src pp-in' style='--i:2'>" + esc(c.source) + "</p>" : "") + "</div>";
      // the slides: one at a time, each in the same place (the card keeps the height of the tallest)
      { const q = sel => [...panel.querySelectorAll(sel)], leads = q(".pp-lead"), views = q(".pp-view"), dots = q(".pp-dot"), prev = panel.querySelector(".pp-arw.prev"), next = panel.querySelector(".pp-arw.next");
        const go = k => { k = Math.max(0, Math.min(sl.length - 1, k)); panel._slide = k; [leads, views, dots].forEach(a => a.forEach((e, j) => { e.classList.toggle("on", j === k); if (e.tagName !== "BUTTON") e.setAttribute("aria-hidden", j === k ? "false" : "true"); }));
          prev.disabled = k === 0; next.disabled = k === sl.length - 1; prev.parentNode.classList.toggle("pv", k > 0); prev.parentNode.classList.toggle("nx", k < sl.length - 1); };
        prev.addEventListener("click", () => go(panel._slide - 1)); next.addEventListener("click", () => go(panel._slide + 1)); dots.forEach((d, j) => d.addEventListener("click", () => go(j)));
        panel.addEventListener("keydown", e => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); go(panel._slide + (e.key === "ArrowLeft" ? -1 : 1)); } });
        go(0); }
      // two compared: the record's name and "Selected Times:" on the first line, the periods on the next, in the fullest
      // form that fits the card's width (the shortest form a little smaller, down to the record name's own size); in a card
      // too narrow even for that, the periods wrap
      if (pick.pair) { const fit = () => { const w = panel.querySelector(".pp-when"), line = w.querySelector(".pp-pl"); if (!w.clientWidth || !line) return;
          const ok = () => line.scrollWidth <= w.clientWidth;
          line.style.fontSize = ""; line.style.whiteSpace = "nowrap";
          for (let f = 0; f <= 2; f++) { line.innerHTML = pairLine(pick, f); if (ok()) return; }
          for (let px = 11.5; px >= 10.5; px -= 0.5) { line.style.fontSize = px + "px"; if (ok()) return; }
          line.style.fontSize = ""; line.style.whiteSpace = ""; };
        if (window.ResizeObserver) new ResizeObserver(fit).observe(panel); requestAnimationFrame(fit); }
      if (c.mount) c.mount(panel);
      panel.querySelector(".pp-x").addEventListener("click", () => opts.onClose && opts.onClose(pick.pair ? null : pick));   // this card's period (or both)
      box0.appendChild(panel); live.textContent = pick.name + ", " + pick.range + ". " + (sl[0].lead || sl[0].html.replace(/<[^>]+>/g, " "));
      if (REDUCED) panel.classList.add("go"); else requestAnimationFrame(() => { marks(panel); panel.classList.add("go"); });
      return panel;
    }

    // the pop-up going: its text blurs away and its paper shuts to a line, over the next one if there is one
    function close(panel) {
      if (REDUCED) { panel.remove(); return; }
      panel.style.top = panel.offsetTop + "px"; panel.classList.add("out"); setTimeout(() => panel.remove(), 460);
    }

    // Two stacked cards (the Wear and LEH line): both open as they appear, sharing the pop-up's height, each scrolling
    // inside its own frame where its content is taller than its share (css/popup.css, .pp-box.two). A fold button
    // beside each X folds that card to its header, or opens it again; so does a click on a folded card's header.
    const setMin = (c, on) => { c.panel.classList.toggle("min", on); const b = c.panel.querySelector(".pp-fold"); if (b) { b.setAttribute("aria-expanded", on ? "false" : "true"); b.setAttribute("aria-label", (on ? "Open " : "Fold ") + c.panel.getAttribute("aria-label").split(",")[0]); } measure(); };
    function wireFold(c) {
      c.panel.querySelector(".pp-fold").addEventListener("click", () => setMin(c, !c.panel.classList.contains("min")));
      c.panel.querySelector(".pp-when").addEventListener("click", () => { if (c.panel.classList.contains("min")) setMin(c, false); });
    }

    return {
      // picks: the periods clicked ({ key, i, name, col, from, to, n, unit, range }), one or two (or a single pick), or null
      show(picks) {
        const want = (picks ? [].concat(picks) : []).slice().sort((p1, p2) => p1.from - p2.from);
        // two compared: one card for both; the Wear and LEH line: a card for each of its two records, stacked
        const cards = (want.length === 2 ? [Object.assign({}, want[0], { pair: want, range: want[0].range + " and " + want[1].range })] : want)
          .flatMap(p2 => SUBS[p2.key] ? SUBS[p2.key].map(([sub, name]) => Object.assign({}, p2, { sub, name })) : [p2]);
        const ids = cards.map(p2 => (p2.pair ? p2.pair.map(q => q.key + ":" + q.i).join("+") : p2.key + ":" + p2.i) + (p2.sub ? "/" + p2.sub : ""));
        if (ids.join("|") === cur.map(c => c.id).join("|")) return;
        cur.filter(c => !ids.includes(c.id)).forEach(c => close(c.panel));
        cur = cards.map((p2, k) => cur.find(c => c.id === ids[k]) || { id: ids[k], panel: open(p2) });
        cur.forEach(c => box0.appendChild(c.panel));   // in order, earliest on top
        box0.classList.toggle("on", cur.length > 0); box0.classList.toggle("two", cur.length > 1); if (!cur.length) live.textContent = "";
        cur.forEach(c => { if (!c.wired && c.panel.querySelector(".pp-fold")) { c.wired = true; wireFold(c); } });
        measure();
      },
      // the width the diagram leaves it (px), or null for its usual width; its cards stretch, their margins stay
      width(px) { box0.style.width = px ? px + "px" : ""; measure(); },
      // of two compared, the period the molar shows now ("key:i"), or null: its years in the header, heavier
      // (kept on the card, and told to its charts as a "pp:mark" event, for those that follow the molar)
      mark(id) { cur.forEach(c => { c.panel.querySelectorAll(".pp-tm").forEach(e => e.classList.toggle("now", e.dataset.id === id)); c.panel.dataset.mark = id || "";
        c.panel.dispatchEvent(new CustomEvent("pp:mark", { detail: id })); }); },
      // the page area the pop-up covers, for the diagram's labels to keep clear of: { side: "right" | "bottom", x, y, w, h }, or null
      cover() { return box; },
    };
  }

  window.ToothPopup = { create, CONTENT };
})();
