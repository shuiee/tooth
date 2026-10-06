/* Mounts the radial timeline (js/radial.js, window.ToothRadial) on #radial: the opening animation, Replay, and a
   redraw on resize. onOpen is called with a record's key ("caries", "pathogens", "wear", "metals", "interventions")
   when its name is clicked; while it is null the names are plain text, not links. A click on a circle picks its time
   period, which opens its pop-up (js/popup.js), one at a time, over the diagram. The filter menu at the top right
   hides or shows each record (its line, circles, name and what it draws on the molar); the choice holds over Replay.
   The filter menu sits at the top left; Play/Pause and Replay, as icons, at the foot of the page. */
(function () {
  "use strict";
  const host = document.getElementById("radial"), again = document.getElementById("again"), pause = document.getElementById("pause");
  const onOpen = null;   // e.g. key => showRecord(key)
  let radial = null, ctlBox = null;
  // the box round Pause and Replay, measured once per size of the page
  const controls = () => { if (ctlBox) return ctlBox; const a = pause.getBoundingClientRect(), b = again.getBoundingClientRect(), x = Math.min(a.left, b.left), y = Math.min(a.top, b.top);
    return (ctlBox = { x, y, w: Math.max(a.right, b.right) - x, h: Math.max(a.bottom, b.bottom) - y }); };
  // a card's X lets its own period go (pick), Escape lets them all go (null)
  const popup = window.ToothPopup.create({ onClose: pick => radial && (pick ? radial.unpick(pick) : radial.select(null)) });

  // the filter menu (top left): a checkbox per record, in the record's colour, all ticked to begin with
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
      onSelect: picks => popup.show(picks),   // the time periods clicked (one, or two compared), or null
      onCompare: id => popup.mark(id),   // of two compared, the one the molar shows now
      onRoom: w => popup.width(w),   // the pop-up widens into the room the diagram leaves it, so the page's margins match
      cover: () => popup.cover(),   // the radial keeps its labels clear of the pop-up
      controls,   // and of Pause and Replay
      menu,   // and of the filter menu
      hidden: [...hidden],   // the records hidden with the filter
      padBottom: () => innerHeight - again.getBoundingClientRect().top + 8,   // clear of Replay
    });
  }

  // pause and play the timeline (the reading wave, and the caries it plays on the molar): the button shows what a click
  // will do, as on video players, two bars to pause while it plays and a triangle to play while it is paused
  const ICON = { pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6L19 12z"/></svg>' };
  function showPlaying(on) { pause.innerHTML = on ? ICON.pause : ICON.play; pause.setAttribute("aria-label", on ? "Pause" : "Play"); pause.title = on ? "Pause" : "Play"; pause.setAttribute("aria-pressed", on ? "false" : "true"); }
  showPlaying(true); again.title = "Replay";
  pause.addEventListener("click", () => { if (radial) radial.play(!radial.playing()); });
  again.addEventListener("click", () => { popup.show(null); mount(true); showPlaying(true); });
  window.__radial = () => radial;   // for checking in the console: __radial().state()
  let rz;
  addEventListener("resize", () => { ctlBox = null; clearTimeout(rz); rz = setTimeout(() => radial && radial.resize(), 150); });
  // wait for Lora, so the names are measured in the right font
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => mount(true));
})();
