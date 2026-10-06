/* Mounts the radial timeline (js/radial.js, window.ToothRadial) on #radial: the opening animation, Replay, and a
   redraw on resize. onOpen is called with a record's key ("caries", "pathogens", "wear", "metals", "interventions")
   when its name is clicked; while it is null the names are plain text, not links. A click on a circle picks its time
   period, which opens its pop-up (js/popup.js), one at a time, over the diagram. The filter menu at the top right
   hides or shows each record (its line, circles, name and what it draws on the molar); the choice holds over Replay. */
(function () {
  "use strict";
  const host = document.getElementById("radial"), again = document.getElementById("again"), pause = document.getElementById("pause");
  const onOpen = null;   // e.g. key => showRecord(key)
  let radial = null, ctlBox = null;
  // the box round Pause and Replay, measured once per size of the page
  const controls = () => { if (ctlBox) return ctlBox; const a = pause.getBoundingClientRect(), b = again.getBoundingClientRect(), x = Math.min(a.left, b.left), y = Math.min(a.top, b.top);
    return (ctlBox = { x, y, w: Math.max(a.right, b.right) - x, h: Math.max(a.bottom, b.bottom) - y }); };
  const popup = window.ToothPopup.create({ onClose: () => radial && radial.select(null) });

  // the filter menu: a checkbox per record, in the record's colour, all ticked to begin with
  const flt = document.getElementById("filter"), fltBtn = document.getElementById("filter-btn"), fltList = document.getElementById("filter-list"), hidden = new Set();
  const COLS = (window.ToothRadial && window.ToothRadial.COLS) || {};
  (window.RADIAL_DATA || []).forEach(c => { const li = document.createElement("li"), lab = document.createElement("label"), box = document.createElement("input"), sw = document.createElement("span");
    lab.className = "flt-row"; box.type = "checkbox"; box.checked = true; box.value = c.key; sw.className = "flt-box"; sw.style.setProperty("--c", COLS[c.key] || "#55544f");
    lab.append(box, sw, document.createTextNode(c.name)); li.appendChild(lab); fltList.appendChild(li);
    box.addEventListener("change", () => { if (box.checked) hidden.delete(c.key); else hidden.add(c.key); if (radial) radial.show(c.key, box.checked); }); });
  const openMenu = on => { flt.classList.toggle("open", on); fltBtn.setAttribute("aria-expanded", on ? "true" : "false"); fltList.hidden = !on; };
  fltBtn.addEventListener("click", () => openMenu(fltList.hidden));
  document.addEventListener("pointerdown", e => { if (!fltList.hidden && !flt.contains(e.target)) openMenu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !fltList.hidden) { openMenu(false); fltBtn.focus(); } });
  // the button's box, for the diagram's names and labels to keep clear of
  const menu = () => { const r = fltBtn.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };

  function mount(animate) {
    if (radial) radial.destroy();
    radial = window.ToothRadial.mount(host, {
      animate,
      onOpen,
      onPlay: on => showPlaying(on),   // the radial pauses itself when a caries point is picked
      onSelect: pick => popup.show(pick),   // the time period clicked, or null
      cover: () => popup.cover(),   // the radial keeps its labels clear of the pop-up
      controls,   // and of Pause and Replay
      menu,   // and of the filter menu
      hidden: [...hidden],   // the records hidden with the filter
      padBottom: () => innerHeight - again.getBoundingClientRect().top + 8,   // clear of Replay
    });
  }

  // pause and play the timeline (the reading wave, and the caries it plays on the molar)
  function showPlaying(on) { pause.textContent = on ? "Pause" : "Play"; pause.setAttribute("aria-pressed", on ? "false" : "true"); }
  pause.addEventListener("click", () => { if (radial) radial.play(!radial.playing()); });
  again.addEventListener("click", () => { popup.show(null); mount(true); showPlaying(true); });
  window.__radial = () => radial;   // for checking in the console: __radial().state()
  let rz;
  addEventListener("resize", () => { ctlBox = null; clearTimeout(rz); rz = setTimeout(() => radial && radial.resize(), 150); });
  // wait for Lora, so the names are measured in the right font
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => mount(true));
})();
