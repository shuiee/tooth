/* Mounts the radial timeline (js/radial.js, window.ToothRadial) on #radial: the opening animation, Replay, and a
   redraw on resize. onOpen is called with a record's key ("caries", "pathogens", "wear", "metals", "interventions")
   when its name is clicked; while it is null the names are plain text, not links. */
(function () {
  "use strict";
  const host = document.getElementById("radial"), again = document.getElementById("again");
  const onOpen = null;   // e.g. key => showRecord(key)
  let radial = null;

  function mount(animate) {
    if (radial) radial.destroy();
    radial = window.ToothRadial.mount(host, {
      animate,
      onOpen,
      padBottom: () => innerHeight - again.getBoundingClientRect().top + 8,   // clear of Replay
    });
  }

  again.addEventListener("click", () => mount(true));
  let rz;
  addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => radial && radial.resize(), 150); });
  // wait for Lora, so the names are measured in the right font
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => mount(true));
})();
