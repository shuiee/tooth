/* Text-overlap audit. Paste into the browser console (or evaluate from a test runner) on a rendered page; it returns
   "no overlaps" or a list of the text that collides, plus any text running off the page's sides.
   Rule for this repo: no text may overlap at any width. Run it at 1440, 1024 and 760 px wide (and 390 for phones). */
(() => {
  // visible: not display:none, not hidden, not near-transparent, not clipped screen-reader-only text
  const vis = el => {
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const c = getComputedStyle(e);
      if (c.display === "none" || c.visibility === "hidden" || +c.opacity < 0.05 || e.hidden ||
        (c.clipPath && c.clipPath !== "none" && e.getBoundingClientRect().width <= 1)) return false;
    }
    return true;
  };
  const boxes = [];
  const add = (r, t, el) => { if (r.width >= 1 && r.height >= 1) boxes.push({ x: r.left, y: r.top, w: r.width, h: r.height, t: t.trim().slice(0, 28), el }); };
  // SVG text, per tspan where it has them
  document.querySelectorAll("svg text").forEach(n => {
    if (!vis(n) || !n.textContent.trim()) return;
    const sp = n.querySelectorAll("tspan");
    if (sp.length) sp.forEach(s => add(s.getBoundingClientRect(), s.textContent, n)); else add(n.getBoundingClientRect(), n.textContent, n);
  });
  // HTML text: each text node's own box
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement; if (!el || el.closest("svg, script, style") || !n.textContent.trim() || !vis(el)) continue;
    const range = document.createRange(); range.selectNodeContents(n);
    [...range.getClientRects()].forEach(r => add(r, n.textContent, el));
  }
  const out = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
    const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    if (ox > 1.5 && oy > 2) out.push(`"${a.t}" × "${b.t}" @${Math.round(a.x)},${Math.round(a.y)}`);
  }
  const off = boxes.filter(b => b.x < -1 || b.x + b.w > innerWidth + 1).map(b => `"${b.t}"`);
  return (out.length ? out.length + " overlaps: " + out.slice(0, 14).join(" | ") : "no overlaps") + (off.length ? " || off-canvas: " + off.slice(0, 6).join(", ") : "");
})();
