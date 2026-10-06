/* The pop-up (window.ToothPopup): what the reader sees on clicking a time period, a circle on one of the radial's
   lines. radial.js calls opts.onSelect with the period clicked, or null once it is let go. One pop-up shows at a time,
   laid over the diagram at the right of the page (along the bottom on narrow pages), about a quarter of the page.

   A template of placeholders, still to be written. Only its header is filled, from the circle clicked:
     when   "Selected time: 1000 – 1250 CE", the record's name in its colour; a close button (an X)
     lead   the key datapoint, one sentence (placeholder)
     body   grey slots for a picture, figures and notes, and a line for the source (placeholders)
   To write a record's pop-up, give CONTENT[key] a function of the period clicked that returns { lead, body }: lead is
   text, body is HTML for the area under it. pick is { key, i, name, col, from, to, n, unit, range }, where i is the
   circle's index on its line (js/radial-data.js). Every number must come from a data file, never from here.

   Motion, after the team's reference (a card framed by crop marks): two hairlines draw out across the page from the
   pop-up's middle and part to its top and bottom edges, opening its paper between them, while hairlines run down its
   sides; its corners close in, small marks settle outside them, and the text resolves line by line out of a blur. The
   hairlines then fade, leaving the corners. Clicking another circle closes this pop-up as the next one opens in its
   place. With reduced motion, it fades in. */
(function () {
  "use strict";
  const REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = v => String(v).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);

  // the placeholder body: a picture and two figures, three notes under them, and the source
  const SLOTS = "<div class='pp-grid'>" +
    [["img", "Image"], ["", "Figure"], ["", "Figure"], ["", "Note"], ["", "Note"], ["", "Note"]].map(([c, t], j) =>
      "<div class='pp-slot pp-in " + c + "' style='--i:" + (2 + j) + "'><span>" + t + "</span></div>").join("") +
    "</div><p class='pp-src pp-in' style='--i:8'>Source and caption to come.</p>";
  const about = { caries: "caries", pathogens: "pathogens", wear: "wear and LEH", metals: "metals", interventions: "artificial interventions" };
  const placeholder = pick => ({ lead: "Key datapoint about " + (about[pick.key] || pick.name.toLowerCase()) + " at this time.", body: SLOTS });
  // each record's pop-up, from the period clicked: placeholders until they are written
  const CONTENT = { caries: placeholder, pathogens: placeholder, wear: placeholder, metals: placeholder, interventions: placeholder };

  function create(opts) {
    opts = opts || {};
    const box0 = document.createElement("aside"); box0.className = "pp-box"; box0.setAttribute("aria-label", "Selected time period");
    const live = document.createElement("p"); live.className = "pp-live"; live.setAttribute("aria-live", "polite");
    const guides = document.createElement("div"); guides.className = "pp-guides"; guides.setAttribute("aria-hidden", "true");
    box0.appendChild(live); document.body.append(guides, box0);
    let cur = null, box = null;   // the pop-up showing: { id, panel }; the page area it covers
    const measure = () => { if (!cur) { box = null; return; } const r = cur.panel.getBoundingClientRect();
      box = { side: getComputedStyle(box0).getPropertyValue("--side").trim() || "right", x: r.left, y: r.top, w: r.width, h: r.height }; };
    if (window.ResizeObserver) new ResizeObserver(measure).observe(box0);
    addEventListener("resize", measure);
    document.addEventListener("keydown", e => { if (e.key === "Escape" && cur && opts.onClose) opts.onClose(); });

    // the crop marks: hairlines along the pop-up's edges across the whole page, drawn once as it opens
    function marks(panel) {
      if (REDUCED) return; const r = panel.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const mk = (cls, css) => { const e = document.createElement("i"); e.className = "pp-g " + cls; for (const k in css) e.style.setProperty(k, css[k]); guides.appendChild(e); return e; };
      const ls = [mk("h", { top: cy + "px", "transform-origin": cx + "px 0", "--dy": (-r.height / 2) + "px" }), mk("h", { top: cy + "px", "transform-origin": cx + "px 0", "--dy": (r.height / 2 - 1) + "px" }),
        mk("v", { left: r.left + "px", "transform-origin": "0 " + cy + "px" }), mk("v", { left: (r.right - 1) + "px", "transform-origin": "0 " + cy + "px" })];
      setTimeout(() => ls.forEach(e => e.remove()), 2000);
    }

    function open(pick) {
      const c = (CONTENT[pick.key] || placeholder)(pick), panel = document.createElement("section");
      panel.className = "pp"; panel.style.setProperty("--c", pick.col); panel.setAttribute("aria-label", pick.name + ", " + pick.range);
      panel.innerHTML = "<div class='pp-sur'></div>" + ["tl", "tr", "bl", "br"].map(k => "<i class='pp-br " + k + "'></i><i class='pp-tk " + k + "'></i>").join("") +
        "<div class='pp-body'><p class='pp-when pp-in' style='--i:0'><span>Selected time: " + esc(pick.range) + "</span><span class='pp-rec'>" + esc(pick.name) + "</span></p>" +
        "<button class='pp-x pp-in' style='--i:0' type='button' aria-label='Close " + esc(pick.name + ", " + pick.range) + "'>&times;</button>" +
        "<p class='pp-lead pp-in' style='--i:1'>" + esc(c.lead) + "</p>" + c.body + "</div>";
      panel.querySelector(".pp-x").addEventListener("click", () => opts.onClose && opts.onClose());
      box0.appendChild(panel); live.textContent = pick.name + ", " + pick.range + ". " + c.lead;
      if (REDUCED) panel.classList.add("go"); else requestAnimationFrame(() => { marks(panel); panel.classList.add("go"); });
      return panel;
    }

    // the pop-up going: its text blurs away and its paper shuts to a line, over the next one if there is one
    function close(panel) {
      if (REDUCED) { panel.remove(); return; }
      panel.classList.add("out"); setTimeout(() => panel.remove(), 460);
    }

    return {
      // pick: the period clicked ({ key, i, name, col, from, to, n, unit, range }), or null for none
      show(pick) {
        const id = pick ? pick.key + ":" + pick.i : null; if ((cur && cur.id) === id) return;
        if (cur) close(cur.panel);
        cur = pick ? { id, panel: open(pick) } : null;
        box0.classList.toggle("on", !!cur); if (!cur) live.textContent = "";
        measure();
      },
      // the page area the pop-up covers, for the diagram's labels to keep clear of: { side: "right" | "bottom", x, y, w, h }, or null
      cover() { return box; },
    };
  }

  window.ToothPopup = { create, CONTENT };
})();
