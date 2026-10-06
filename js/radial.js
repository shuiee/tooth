/* The Tooth Untold: the radial timeline (window.ToothRadial).

   Five lines leave the centre of the page, one for each kind of record: caries, pathogens, wear and LEH, metals,
   artificial interventions. The centre point sits in the gap between a first molar (left, as on every other plate)
   and a canine (right). Along each line a hollow circle marks the year each record begins, and the line is darker
   over the years its records cover, so a gap in the record is a pale stretch.
   Every name is the same size, at the far end of its line.

   Drawn in perspective: the teeth and the centre sit deep in the page and the lines come out towards the viewer,
   so the further back a record reaches, the wider the line and the larger its circle. Distance from the centre is
   how long before the latest record a year is, on one square-root scale for every line. Inside the teeth the lines
   are soft and blurred; outside, crisp.

   The molar at the centre is a point cloud (data/molar-cloud.js) drawn with three.js. The reading wave is the
   timeline: it runs from the oldest record in to today (pausable, see play()), and the molar shows the caries of
   the period it is in; clicking a caries point moves the wave to that period and pauses it (js/caries-data.js, cariesShares()).
   A knob on the wave can be dragged around it and in or out to a year, which also pauses it there.
   Clicking a circle picks its time period for the pop-up (opts.onSelect, js/popup.js): one at a time, ringed on its
   line and labelled with its years; the labels keep clear of the pop-up (opts.cover) and the buttons (opts.controls).

   Hand-built SVG, no libraries. The teeth arrive as pictures from the page's own renderer (app.js, radialTeeth()),
   each with a white and a black silhouette for the blur and the mask. Styles are the .rd-* rules in index.html. */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  // R0: where the records leave the teeth (the latest year); RMAX: the oldest year. Square-root time scale.
  const R0 = 200, RMAX = 620;
  const DATA = window.RADIAL_DATA || [];
  const NOW = Math.max(...DATA.map(c => c.segs[c.segs.length - 1][1]));
  const MAX_AGE = NOW - Math.min(...DATA.map(c => c.segs[0][0]));
  const rAge = a => R0 + Math.sqrt(Math.max(0, a) / MAX_AGE) * (RMAX - R0);
  const rYear = y => rAge(NOW - y);
  const TOOTH_H = { canine: 230, molar: 300 }, GAP = 26, RS = RMAX * 1.1;
  // each record leaves the teeth in its own direction in space: azimuth from the data, elevation here
  const ELEV = { caries: 12, metals: -22, pathogens: 18, wear: -40, interventions: 22 };
  const COLS = { caries: "#C2611A", metals: "#A67C00", pathogens: "#B0362F", wear: "#16907A", interventions: "#2F55B0" };
  const REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  const yr = v => v < 0 ? Math.abs(v) + " BCE" : v + " CE";
  function range(a, b) { if (a === b) return yr(a); if (a < 0 && b < 0) return Math.abs(a) + " – " + Math.abs(b) + " BCE"; if (a >= 0 && b >= 0) return a + " – " + b + " CE"; return yr(a) + " – " + yr(b); }
  const amount = (c, d) => d[2] == null ? "count not in the data" : d[2].toLocaleString("en-GB") + " " + c.unit;
  const press = f => ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); f(); } };
  const ease = t => 1 - Math.pow(1 - t, 3), cl = (v, a, b) => Math.max(a, Math.min(b, v)), fx = v => v.toFixed(1);
  const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

  // a period's caries as shares of the crown: any decay on the prototype's expanded scale, then the cavitated and the
  // core shares from the period's own severity mix (see js/caries-data.js)
  const CR = window.CARIES_RATES || [], LR = window.LEH_RATES || [];   // caries and stress lines per period, for the molar
  const frac = r => Math.max(0.03, Math.min(0.86, 0.08 + 0.72 * (r - 51) / (77 - 51)));
  function cariesShares(i) {
    const R = CR[i]; if (!R) return { out: 0, mid: 0, inn: 0 };
    // frac() is a share of the chewing surface, as on the prototype's plate; the decay order covers the chewing
    // surface first, so as a share of the whole crown it is that times the chewing surface's share of the crown
    const any = 100 - R.sev[0], F = frac(R.std) * ((window.MOLAR_CLOUD && window.MOLAR_CLOUD.occl) || 1);
    return { out: F, mid: F * (R.sev[2] + R.sev[3] + R.sev[4]) / any, inn: F * (R.sev[3] + R.sev[4]) / any };
  }

  // a period's wear as the share of the crown's height worn away: its lifetime of wear (the age bands in order, each at
  // least the band before; the last band's value), on an expanded Smith-stage scale (see js/wear-data.js)
  const WD = window.WEAR_DATA || { ages: [], periods: [] };
  function wearOf(i) {
    const P = WD.periods[i]; if (!P) return null; let run = 1;
    WD.ages.forEach(a => { if (P.cells[a]) run = Math.max(run, P.cells[a][0]); });
    return run;
  }
  const wearShare = i => { const st = wearOf(i); return st == null ? 0 : Math.max(0.05, Math.min(0.62, 0.12 + 0.48 * (st - 3.5) / 2.5)); };

  // a period's metals: each element's change from the archaeological level, as a radius on the prototype radial chart's
  // log scale (x 0.08 to x 20), 0 to 1 (see js/metals-data.js)
  const MD = window.METALS_DATA || { periods: [], elements: [] };
  const metChange = (el, i) => { const last = MD.periods.length - 1;
    if (el === "Pb") return MD.lead[i] / MD.leadArch;
    return i === last ? MD.modern[el] / MD.pooled[el] : 1; };
  const metRadius = x => Math.max(0, Math.min(1, (Math.log(Math.max(1e-6, x)) - Math.log(0.08)) / (Math.log(20) - Math.log(0.08))));
  const metalValues = i => MD.periods[i] ? MD.elements.map(([el]) => metRadius(metChange(el, i))) : null;
  // each group's presence in a period, not industrial then industrial: the mean of its elements' values
  const metalGroups = i => { const v = metalValues(i); if (!v || !MD.groups) return null;
    return ["nonindustrial", "industrial"].map(gk => { const els = MD.groups[gk], vs = MD.elements.map(([el], j) => els.includes(el) ? v[j] : null).filter(x => x != null); return vs.reduce((a, b) => a + b, 0) / (vs.length || 1); }); };

  // a period's pathogens: for each taxon, how many particles climb the nerve, one per 2.5% of that century's genomes it
  // was found in (at least one where it was found) (see js/pathogens-data.js). i is the index into the radial's
  // pathogens line, whose periods are the centuries with genomes.
  const PD = window.PATHOGENS_DATA || { taxa: [] };
  const PLINE = (DATA.find(c => c.key === "pathogens") || { dens: [] }).dens;
  const pathogenPcts = i => { const d = PLINE[i]; if (!d) return null; return PD.taxa.map(t => (t.cells[d[0]] || [0, 0])[1]); };
  // the readout's note for a century: the pathogen found in the most of its genomes
  const topPathogen = i => { const p = pathogenPcts(i); if (!p) return ""; let b = -1; p.forEach((v, j) => { if (v > 0 && (b < 0 || v > p[b])) b = j; });
    return b < 0 ? "" : " · " + PD.taxa[b].name + " in " + Math.round(p[b]) + "%"; };
  const pathogenCounts = i => { const p = pathogenPcts(i); return p ? p.map(v => v > 0 ? Math.max(1, Math.round(v / 2.5)) : 0) : null; };

  function mount(host, opts) {
    let svg = null, raf = 0, S = null, dragging = false, px = 0, py = 0, lastInput = -1e9, stars = null;
    let playing = true, waveU = REDUCED ? 1 : 0;   // the timeline: the reading wave's place, 0 at the oldest record, 1 today; paused or playing
    const setPlaying = on => { playing = !!on; if (opts.onPlay) opts.onPlay(playing); };
    const seekYear = y => { waveU = cl((RMAX - rYear(y)) / (RMAX - R0), 0, 1); };
    const ptr = { x: 0, y: 0, in: false };   // the pointer over the diagram, for the year readout
    // the timeline's handle, a knob on the reading wave: a is its angle once dragged (until then it rides at the front of
    // the ring); touched once the reader has moved it, which also brings the ring out under reduced motion
    const ring = { a: 0, moved: false, touched: false, hover: false };
    let ringDrag = false;
    // the time period the reader has clicked, as [record key, index on its line], or null: it opens the pop-up
    // (opts.onSelect, js/popup.js) and is ringed on its line and labelled with its years. Clicking another circle moves
    // it there; clicking it again lets it go, as do the pop-up's Close and Escape (select()).
    let sel = null;
    const pickOf = (k, i) => { const c = DATA.find(c2 => c2.key === k), d = c && c.dens[i]; return d ? { key: k, i, name: c.name, col: COLS[k], from: d[0], to: d[1], n: d[2], unit: c.unit, range: range(d[0], d[1]) } : null; };
    const setSel = next => { sel = next; if (opts.onSelect) opts.onSelect(sel ? pickOf(sel[0], sel[1]) : null); };
    const choose = (k, i) => { const same = !!sel && sel[0] === k && sel[1] === i; setSel(same ? null : [k, i]); return !same; };
    const HOME = { yaw: -0.5, pitch: 0.3, dist: 1480 };
    const intro = !!opts.animate && !REDUCED;
    const cam = { yaw: HOME.yaw - (intro ? 1.1 : 0), pitch: intro ? 0.9 : HOME.pitch, dist: intro ? 2300 : HOME.dist, tYaw: HOME.yaw, tPitch: HOME.pitch, tDist: HOME.dist };
    const sky = document.createElement("canvas"); sky.className = "rd-sky"; host.prepend(sky);
    // bottom left: the year under the pointer (a hovered circle's start year, or the year at that point on a record line)
    const hud = document.createElement("div"); hud.className = "rd-hud"; hud.setAttribute("aria-hidden", "true"); host.appendChild(hud);
    // The first molar at the centre as a point cloud (data/molar-cloud.js, from the team's sculpted model), turning
    // with the camera. Its points are denser where the surface bends, so the cusps and fissures read. On opening they
    // fly in from loose sheets around it and settle, root first. The crown carries the caries of the period the
    // timeline is reading (or the caries point the reader picked): its points take the caries colours in three
    // severities, and faint lines join neighbouring carious points, a mesh over the decay that grows and shrinks.
    let GLT = null;
    const MC = window.MOLAR_CLOUD;
    if (window.THREE && MC) try {
      const TH = THREE, tcv = document.createElement("canvas"); tcv.className = "rd-tgl"; host.insertBefore(tcv, sky.nextSibling);
      const rd = new TH.WebGLRenderer({ canvas: tcv, alpha: true, antialias: true }); rd.setPixelRatio(Math.min(2, devicePixelRatio || 1)); rd.setClearColor(0, 0);
      const sc = new TH.Scene(), tc = new TH.PerspectiveCamera(30, 1, 1, 20000);
      const b64 = (str, T) => { const bin = atob(str), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return new T(u8.buffer); };
      const P16 = b64(MC.p, Int16Array), RK = b64(MC.r, Uint16Array), EP = b64(MC.e, Uint16Array), n = MC.n;
      const k = 300 / (MC.top - MC.bottom), yMid = (MC.top + MC.bottom) / 2;
      const pos = new Float32Array(n * 3), start = new Float32Array(n * 3), rank = new Float32Array(n), delay = new Float32Array(n);
      let sd = 5; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < n; i++) {
        const x = P16[3 * i] / 32767 * MC.s * k, y = (P16[3 * i + 1] / 32767 * MC.s - yMid) * k, z = P16[3 * i + 2] / 32767 * MC.s * k;
        pos.set([x, y, z], 3 * i); rank[i] = RK[i] === 65535 ? 2 : RK[i] / 65000;
        // where it starts: one of five loose, wavy sheets stacked around the tooth
        const sheet = Math.floor(rnd() * 5), ang = rnd() * Math.PI * 2, rr = 220 + rnd() * 460;
        start.set([Math.cos(ang) * rr * 1.5, (sheet - 2) * 120 + Math.sin(ang * 3 + sheet * 1.7) * 34 + (rnd() - 0.5) * 22, Math.sin(ang) * rr * 0.45], 3 * i);
        delay[i] = 0.2 + (y + 150) / 300 * 0.9 + rnd() * 0.55;
      }
      const ink = new TH.Color("#2b2a27"), cA = new TH.Color("#E3A46A"), cB = new TH.Color("#C2611A"), cC = new TH.Color("#6F320B");
      // the crown's top and the enamel-root junction, in the drawing's units; the wear plane starts above the crown
      const Ytop = (MC.top - yMid) * k, Ycej = -yMid * k;
      const U = { uWearY: { value: Ytop + 2 }, uPulse: { value: 0 }, uT: { value: 0 }, uOut: { value: 0 }, uMid: { value: 0 }, uInn: { value: 0 }, uPx: { value: Math.min(2, devicePixelRatio || 1) },
        cInk: { value: ink }, cA: { value: cA }, cB: { value: cB }, cC: { value: cC } };
      const FLY = "float fly(float d){ float e = clamp((uT - d) / 1.5, 0.0, 1.0); return 1.0 - pow(1.0 - e, 3.0); }";
      // Stress lines as bands of negative space: within a line's reach round the crown, crown points near the line are
      // pushed up or down out of it and packed against its edges (none are lost: the enamel is displaced, thinner in the
      // band), so the line reads as a gap. The line's place and waves match the particles' (GLT.leh below, lehLine());
      // tint says how far a point was moved, for colouring the gap's edges. Off (uLehOn 0) until the stress lines are set up.
      Object.assign(U, { uLehOn: { value: 0 }, uCx: { value: 0 }, uCz: { value: 0 }, uY0: { value: 0 }, uYt: { value: 1 }, uA0: { value: 0 }, uExt0: { value: 0 }, uExt1: { value: 0 },
        uLT: { value: 0 }, uLW: { value: new TH.Vector2(0.14, 0.09) }, uLR: { value: new TH.Vector2(0.3, 0.17) }, uLD: { value: new TH.Vector2(0, 0) }, uCShow: { value: 0 }, cL0: { value: new TH.Color(COLS.wear) }, cL1: { value: new TH.Color("#0A4A3F") } });
      const LEHGL = " uniform float uLehOn, uCx, uCz, uY0, uYt, uA0, uExt0, uExt1, uLT; uniform vec2 uLW, uLR, uLD; uniform vec3 cL0, cL1;" +
        " float lehLine(float lane, float s){ float m = lane < 0.5 ? 0.72 : 0.2, a = lane < 0.5 ? 1.0 : 0.55;" +
        " return m + a * (0.055 * sin(6.2832 * 3.0 * s + 1.7 * lane + 0.22 * uLT) + 0.028 * sin(6.2832 * 7.0 * s + 0.6 + 2.1 * lane - 0.31 * uLT) + 0.012 * sin(6.2832 * 13.0 * s + 4.1 + 0.4 * uLT)); }" +
        // how far the surface sinks towards the crown's axis at a point of the band (hb) at s round the crown
        " float lehDent(float hb, float s){ float v = 0.0; for (int l = 0; l < 2; l++) { float e = l == 0 ? uExt0 : uExt1; if (e < 0.002 || s > e) continue;" +
        " float tw = min(0.05, e * 0.3), tap = min(1.0, s / tw) * min(1.0, (e - s) / tw), d = (hb - lehLine(float(l), s)) / (1.6 * (l == 0 ? uLW.x : uLW.y));" +
        " v += (l == 0 ? uLD.x : uLD.y) * tap * exp(-d * d); } return v; }" +
        " vec3 lehSink(vec3 p, float dn){ vec2 q = p.xz - vec2(uCx, uCz); float r = length(q); p.xz = vec2(uCx, uCz) + q * max(0.0, r - dn) / max(r, 0.001); return p; }" +
        " vec3 lehPush(vec3 p, float rank, out vec3 tc, out float tn){ tn = 0.0; tc = cL0; if (uLehOn < 0.5 || rank > 1.5) return p;" +
        " float hb = (p.y - uY0) / (uYt - uY0); if (hb < -0.3 || hb > 1.3) return p; float s = fract((atan(p.z - uCz, p.x - uCx) - uA0) / 6.2832);" +
        " for (int l = 0; l < 2; l++) { float e = l == 0 ? uExt0 : uExt1; if (e < 0.002 || s > e) continue;" +
        " float tw = min(0.05, e * 0.3), tap = min(1.0, s / tw) * min(1.0, (e - s) / tw), w = (l == 0 ? uLW.x : uLW.y) * tap, R = l == 0 ? uLR.x : uLR.y;" +
        " float d = hb - lehLine(float(l), s); if (abs(d) >= R || w < 0.0001) continue; float nd = sign(d) * (w + abs(d) / R * (R - w));" +
        " hb += nd - d; float mv = clamp(abs(nd - d) / w, 0.0, 1.0) * tap; if (mv > tn) { tn = mv; tc = l == 0 ? cL0 : cL1; } }" +
        " p.y = uY0 + hb * (uYt - uY0); return lehSink(p, lehDent(hb, s)); }";
      const pg = new TH.BufferGeometry(); pg.setAttribute("position", new TH.BufferAttribute(pos, 3)); pg.setAttribute("aStart", new TH.BufferAttribute(start, 3));
      pg.setAttribute("aRank", new TH.BufferAttribute(rank, 1)); pg.setAttribute("aDelay", new TH.BufferAttribute(delay, 1));
      const pts = new TH.Points(pg, new TH.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false,
        vertexShader: "attribute vec3 aStart; attribute float aRank, aDelay; uniform float uT, uOut, uMid, uInn, uPx, uPulse, uWearY; uniform vec3 cInk, cA, cB, cC; varying vec3 vC; varying float vA; " + FLY + LEHGL +
          " void main(){ float e = fly(aDelay); vec3 w = position; if (w.y > uWearY) w.y = uWearY; vec3 tc; float tn; w = lehPush(w, aRank, tc, tn); vec3 p = mix(aStart, w, e); vec4 mv = modelViewMatrix * vec4(p, 1.0);" +
          " float a = 1.0 - smoothstep(uOut - 0.012, uOut, aRank), b = 1.0 - smoothstep(uMid - 0.012, uMid, aRank), c = 1.0 - smoothstep(uInn - 0.012, uInn, aRank);" +
          " vC = mix(mix(mix(cInk, cA, a), cB, b), cC, c); float car = max(a, 0.0); vC = mix(vC, tc, 0.75 * tn * (1.0 - car));" +
          " gl_PointSize = uPx * (0.95 + (0.75 + 1.1 * uPulse) * car) * 1480.0 / max(200.0, -mv.z); vA = (0.15 + 0.85 * e) * (aRank > 1.5 ? 0.34 : 0.5 + 0.45 * car) * (1.0 + 0.4 * tn); gl_Position = projectionMatrix * mv; }",
        fragmentShader: "varying vec3 vC; varying float vA; void main(){ vec2 q = gl_PointCoord - 0.5; float d = dot(q, q); if (d > 0.25) discard; gl_FragColor = vec4(vC, vA * (1.0 - smoothstep(0.12, 0.25, d))); }" }));
      // the mesh over the decay: a line between each pair of neighbouring crown points, shown once both are carious
      const m = EP.length, lpos = new Float32Array(m * 3), lst = new Float32Array(m * 3), lseg = new Float32Array(m), ldel = new Float32Array(m);
      for (let j = 0; j < m; j += 2) { const i0 = EP[j], i1 = EP[j + 1], r = Math.max(rank[i0], rank[i1]);
        [i0, i1].forEach((i, h) => { lpos.set(pos.subarray(3 * i, 3 * i + 3), 3 * (j + h)); lst.set(start.subarray(3 * i, 3 * i + 3), 3 * (j + h)); lseg[j + h] = r; ldel[j + h] = delay[i] + 0.6; }); }
      const lg = new TH.BufferGeometry(); lg.setAttribute("position", new TH.BufferAttribute(lpos, 3)); lg.setAttribute("aStart", new TH.BufferAttribute(lst, 3));
      lg.setAttribute("aRank", new TH.BufferAttribute(lseg, 1)); lg.setAttribute("aDelay", new TH.BufferAttribute(ldel, 1));
      const lines = new TH.LineSegments(lg, new TH.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false,
        vertexShader: "attribute vec3 aStart; attribute float aRank, aDelay; uniform float uT, uOut, uWearY; varying float vA; " + FLY + LEHGL +
          " void main(){ float e = fly(aDelay); vec3 w = position; if (w.y > uWearY) w.y = uWearY; vec3 tc; float tn; w = lehPush(w, aRank, tc, tn); vA = (1.0 - smoothstep(uOut - 0.02, uOut, aRank)) * e * 0.3; gl_Position = projectionMatrix * modelViewMatrix * vec4(mix(aStart, w, e), 1.0); }",
        fragmentShader: "uniform vec3 cB; varying float vA; void main(){ if (vA < 0.01) discard; gl_FragColor = vec4(cB, vA); }" }));
      // The worn-away crown: every crown point above the wear plane also rises, a few at a time, in the tooth's own ink, to hover above the tooth
      // as a separate cloud, at its own place lifted by LIFT, so the cloud is the lost cap and grows as the molar wears.
      // aLift (0 on the tooth, 1 in the cloud) is stepped on the CPU (wearStep()), each point at its own pace.
      const LIFT = (Ytop - Ycej) * 0.62 + 46, lift = new Float32Array(n), pace = new Float32Array(n);
      for (let i = 0; i < n; i++) pace[i] = 0.7 + rnd() * 0.9;
      const wg = new TH.BufferGeometry(); wg.setAttribute("position", new TH.BufferAttribute(pos, 3)); wg.setAttribute("aDelay", new TH.BufferAttribute(delay, 1));
      wg.setAttribute("aPace", new TH.BufferAttribute(pace, 1)); const aLift = new TH.BufferAttribute(lift, 1); aLift.setUsage(TH.DynamicDrawUsage); wg.setAttribute("aLift", aLift);
      U.uLift = { value: LIFT };
      const lost = new TH.Points(wg, new TH.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false,
        vertexShader: "attribute float aDelay, aPace, aLift; uniform float uT, uWearY, uLift, uPx; varying float vA; " + FLY +
          " void main(){ if (aLift < 0.004) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; vA = 0.0; return; }" +
          " float u = aLift * aLift * (3.0 - 2.0 * aLift); vec3 a = vec3(position.x, min(position.y, uWearY), position.z);" +
          " vec3 b = position + vec3(0.0, uLift, 0.0) + vec3(sin(uT * 0.7 + aPace * 9.0), sin(uT * 0.9 + aPace * 5.0), cos(uT * 0.6 + aPace * 7.0)) * 2.5;" +
          " vec3 p = mix(a, b, u) + vec3(position.x, 0.0, position.z) * 0.35 * sin(3.14159 * u);" +
          " vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = uPx * 1.25 * 1480.0 / max(200.0, -mv.z); vA = u * 0.55 * fly(aDelay); gl_Position = projectionMatrix * mv; }",
        fragmentShader: "uniform vec3 cInk; varying float vA; void main(){ vec2 q = gl_PointCoord - 0.5; float d = dot(q, q); if (d > 0.25 || vA < 0.01) discard; gl_FragColor = vec4(cInk, vA * (1.0 - smoothstep(0.12, 0.25, d))); }" }));
      const molar = new TH.Group(); molar.add(lines); molar.add(pts); molar.add(lost); sc.add(molar);
      // a point rises when the wear plane passes below it and settles back when the plane passes above it
      const wearStep = (plane, dt) => { let moved = false;
        for (let i = 0; i < n; i++) { const tgt = pos[3 * i + 1] > plane ? 1 : 0, v = lift[i]; if (v === tgt) continue;
          lift[i] = tgt ? Math.min(1, v + dt * pace[i] / 1.1) : Math.max(0, v - dt * pace[i] / 0.9); moved = true; }
        if (moved) aLift.needsUpdate = true; };
      // The nerve and the pathogens. The pulp's nerve strands (data/molar-nerve.js: up each root canal from the root's tip,
      // across the pulp chamber and branching under the cusps) are dense branches of points in the tooth's ink. The
      // pathogens of the period travel up them as glowing particles with fading trails, in their kind's colour, from the
      // root tips into the crown; at a strand's end each fades out, then sets off again from a root tip. How many fly is
      // each pathogen's % of that century's genomes (pathogenCounts()); when the period changes, the extra ones finish
      // their climb and stop, and new ones set off. The nerve and the particles stay below the worn surface.
      const NV = window.MOLAR_NERVE, PD = window.PATHOGENS_DATA;
      let pathStep = () => {}, pat = null;
      if (NV && PD) {
        const Q16 = b64(NV.p, Int16Array), segs = []; let o = 0;
        NV.len.forEach(L => { const a = new Float32Array(L * 3);
          for (let i = 0; i < L; i++) { a[3 * i] = Q16[3 * (o + i)] / 32767 * NV.s * k; a[3 * i + 1] = (Q16[3 * (o + i) + 1] / 32767 * NV.s - yMid) * k; a[3 * i + 2] = Q16[3 * (o + i) + 2] / 32767 * NV.s * k; }
          segs.push(a); o += L; });
        // the nerve as points: every point of every strand, and two more scattered about it, so the branches read dense
        const nvN = segs.reduce((a, g) => a + g.length / 3, 0) * 3, nvP = new Float32Array(nvN * 3), nvR = new Float32Array(nvN); let q = 0;
        segs.forEach((g, gi) => { const tw = NV.par[gi] >= 0 && NV.len[gi] < 40;   // twigs: finer
          for (let i = 0; i < g.length; i += 3) for (let c = 0; c < 3; c++) { const j = c ? (tw ? 0.5 : 1.1) : 0;
            nvP[3 * q] = g[i] + (rnd() - 0.5) * 2 * j; nvP[3 * q + 1] = g[i + 1] + (rnd() - 0.5) * 2 * j; nvP[3 * q + 2] = g[i + 2] + (rnd() - 0.5) * 2 * j; nvR[q] = rnd(); q++; } });
        const ng = new TH.BufferGeometry(); ng.setAttribute("position", new TH.BufferAttribute(nvP, 3)); ng.setAttribute("aR", new TH.BufferAttribute(nvR, 1));
        U.uNv = { value: 0 };
        const nervePts = new TH.Points(ng, new TH.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false,
          vertexShader: "attribute float aR; uniform float uWearY, uPx, uNv; varying float vA; void main(){ vec3 p = position; p.y = min(p.y, uWearY - 6.0); vec4 mv = modelViewMatrix * vec4(p, 1.0);" +
            " gl_PointSize = uPx * (0.8 + 0.4 * aR) * 1480.0 / max(200.0, -mv.z); vA = uNv * (0.3 + 0.25 * aR); gl_Position = projectionMatrix * mv; }",
          fragmentShader: "uniform vec3 cInk; varying float vA; void main(){ vec2 q = gl_PointCoord - 0.5; float d = dot(q, q); if (d > 0.25 || vA < 0.01) discard; gl_FragColor = vec4(cInk, vA * (1.0 - smoothstep(0.12, 0.25, d))); }" }));
        molar.add(nervePts);
        // Each kind of pathogen has its own route, so its volume reads as one stream: it comes in from outside, below the
        // tooth, to a root tip, climbs its own strand of that root's canal and crosses the chamber to its own pulp horn,
        // where it splits into two twigs (one route for a single particle). Bacteria and parasites take the one root,
        // viruses and the rest the other; no two kinds share a strand or a horn. The particles of a kind follow one
        // another at even spacing, so a denser stream is a larger share of the century's genomes.
        const isPar = new Set(NV.par), roots = NV.par.map((q2, gi) => q2 < 0 ? gi : -1).filter(gi => gi >= 0), perCanal = roots.length / 2;
        const chainOf = gi => { const c2 = []; for (let c = gi; c >= 0; c = NV.par[c]) c2.unshift(c); return c2; };
        const leaves = NV.len.map((_, gi) => gi).filter(gi => !isPar.has(gi)).map(chainOf);
        const KINDS = (PD.kinds || []).map(kk => kk[0]), cols = PD.colours || {};
        const ROUTE = { bacteria: [0, 0, -1], parasite: [0, 2, 1], virus: [1, 0, 1], other: [1, 1, -1] };   // [canal, strand, side of entry]
        const routes = KINDS.map(kind => { const [cn, sn, sd] = ROUTE[kind] || [0, 0, 1], root = roots[Math.min(roots.length - 1, cn * perCanal + sn)];
          // two twigs from different first branches under the horn, each the deepest of its branch
          const mine = leaves.filter(ch => ch[0] === root), groups = {}; mine.forEach(ch => { const g = ch[1]; if (!groups[g] || ch.length > groups[g].length) groups[g] = ch; });
          const picks = Object.values(groups).slice(0, 2);
          const s0 = segs[root], apex = [s0[0], s0[1], s0[2]], rr = Math.hypot(apex[0], apex[2]) || 1, a0 = Math.atan2(apex[2], apex[0]) + sd * 0.75;
          const out = [Math.cos(a0), 0, Math.sin(a0)], st = [apex[0] + out[0] * 95, apex[1] - 120, apex[2] + out[2] * 95], cp = [apex[0] + out[0] * 15, apex[1] - 70, apex[2] + out[2] * 15];
          const lead = []; for (let i = 0; i < 24; i++) { const u = i / 24, w0 = (1 - u) * (1 - u), w1 = 2 * u * (1 - u), w2 = u * u; for (let a2 = 0; a2 < 3; a2++) lead.push(w0 * st[a2] + w1 * cp[a2] + w2 * apex[a2]); }
          return picks.map(ch => { const pts = lead.slice(); ch.forEach(c => { const g = segs[c]; for (let i = 0; i < g.length; i += 3) pts.push(g[i], g[i + 1], g[i + 2]); });
            const P3 = new Float32Array(pts), cum = new Float32Array(P3.length / 3);
            for (let i = 1; i < cum.length; i++) cum[i] = cum[i - 1] + Math.hypot(P3[3 * i] - P3[3 * i - 3], P3[3 * i + 1] - P3[3 * i - 2], P3[3 * i + 2] - P3[3 * i - 1]);
            return { P: P3, cum, len: cum[cum.length - 1], lead: cum[23] }; }); });
        const at = (pa, d, out, oi) => { const c = pa.cum; d = Math.max(0, Math.min(pa.len, d)); let lo = 0, hi = c.length - 1;
          while (hi - lo > 1) { const m = (lo + hi) >> 1; if (c[m] <= d) lo = m; else hi = m; }
          const f = (d - c[lo]) / Math.max(1e-6, c[hi] - c[lo]); for (let a2 = 0; a2 < 3; a2++) out[oi + a2] = pa.P[3 * lo + a2] + (pa.P[3 * hi + a2] - pa.P[3 * lo + a2]) * f; };
        // the way in from outside: faint dots in the kind's colour, shown while that kind is present
        const GN = 60, gp = new Float32Array(KINDS.length * GN * 3), gc = new Float32Array(KINDS.length * GN * 3), ga = new Float32Array(KINDS.length * GN), gaB = new Float32Array(KINDS.length * GN);
        routes.forEach((rs, kI) => { const r0 = rs[0], col = new TH.Color(cols[KINDS[kI]] || "#8a8983"); if (!r0) return;
          for (let i = 0; i < GN; i++) { const q = kI * GN + i; at(r0, r0.lead * (i / GN), gp, 3 * q); gc[3 * q] = col.r; gc[3 * q + 1] = col.g; gc[3 * q + 2] = col.b; } });
        const gg = new TH.BufferGeometry(), aGA = new TH.BufferAttribute(ga, 1); aGA.setUsage(TH.DynamicDrawUsage); gg.setAttribute("position", new TH.BufferAttribute(gp, 3)); gg.setAttribute("aC", new TH.BufferAttribute(gc, 3)); gg.setAttribute("aA", aGA);
        const gS = new Float32Array(KINDS.length * GN).fill(2.4); gg.setAttribute("aS", new TH.BufferAttribute(gS, 1));
        // the particles: a head (a soft glowing point) and a trail behind it, of dots and a fine line, fading
        const MAXP = 240, TL = 18, TRAIL = 46, TD = 14, HN = MAXP * (1 + TD), V = 125, GAP = 30;   // GAP: the closest spacing in a stream
        const hp = new Float32Array(HN * 3), hc = new Float32Array(HN * 3), ha = new Float32Array(HN), hs = new Float32Array(HN);
        const tp = new Float32Array(MAXP * TL * 2 * 3), tcol = new Float32Array(MAXP * TL * 2 * 3), ta = new Float32Array(MAXP * TL * 2);
        const hg = new TH.BufferGeometry(), aHP = new TH.BufferAttribute(hp, 3), aHA = new TH.BufferAttribute(ha, 1), aHS = new TH.BufferAttribute(hs, 1), aHC = new TH.BufferAttribute(hc, 3);
        [aHP, aHA, aHS, aHC].forEach(a2 => a2.setUsage(TH.DynamicDrawUsage)); hg.setAttribute("position", aHP); hg.setAttribute("aA", aHA); hg.setAttribute("aS", aHS); hg.setAttribute("aC", aHC);
        const glowMat = new TH.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false,
          vertexShader: "attribute float aA, aS; attribute vec3 aC; uniform float uPx; varying float vA; varying vec3 vC; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vA = aA; vC = aC;" +
            " gl_PointSize = aA < 0.004 ? 0.0 : uPx * aS * 1480.0 / max(200.0, -mv.z); gl_Position = projectionMatrix * mv; }",
          fragmentShader: "varying float vA; varying vec3 vC; void main(){ vec2 q = gl_PointCoord - 0.5; float d = length(q) * 2.0; if (d > 1.0) discard;" +
            " float core = 1.0 - smoothstep(0.18, 0.34, d), glow = exp(-d * d * 4.0); vec3 c = mix(vC * 1.12, vC * 0.7, core); gl_FragColor = vec4(c, vA * clamp(core + glow * 0.42, 0.0, 1.0)); }" });
        const heads = new TH.Points(hg, glowMat), guides = new TH.Points(gg, glowMat);
        const tg = new TH.BufferGeometry(), aTP = new TH.BufferAttribute(tp, 3), aTA = new TH.BufferAttribute(ta, 1), aTC = new TH.BufferAttribute(tcol, 3);
        [aTP, aTA, aTC].forEach(a2 => a2.setUsage(TH.DynamicDrawUsage)); tg.setAttribute("position", aTP); tg.setAttribute("aA", aTA); tg.setAttribute("aC", aTC);
        const trails = new TH.LineSegments(tg, new TH.ShaderMaterial({ transparent: true, depthWrite: false,
          vertexShader: "attribute float aA; attribute vec3 aC; varying float vA; varying vec3 vC; void main(){ vA = aA; vC = aC; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
          fragmentShader: "varying float vA; varying vec3 vC; void main(){ if (vA < 0.004) discard; gl_FragColor = vec4(vC, vA); }" }));
        heads.frustumCulled = trails.frustumCulled = guides.frustumCulled = false; guides.renderOrder = 10; heads.renderOrder = 12; trails.renderOrder = 11;
        molar.add(guides); molar.add(trails); molar.add(heads);
        // each particle: its kind (-1 idle), its route, and its distance along it (negative: waiting its turn)
        const P = Array.from({ length: MAXP }, () => ({ k: -1, r: 0, d: 0, retire: false }));
        const period = (kI, r) => { const ro = routes[kI][r], n = P.filter(pp => pp.k === kI && pp.r === r && !pp.retire).length; return Math.max(ro.len + TRAIL, n * GAP); };
        pat = { routes, P, kinds: KINDS };
        pathStep = (want, dt, wearY, appear) => {
          // the period's particles per kind (want: per taxon): split between the kind's routes; extras finish their
          // climb and stop (or go at once if still waiting), new ones join the back of the stream
          if (want !== pat.wantRef) { pat.wantRef = want; const w = KINDS.map(() => 0); (want || []).forEach((c, ti) => { const kI = KINDS.indexOf(PD.taxa[ti].kind); if (kI >= 0) w[kI] += c; }); pat.byKind = w;
            KINDS.forEach((_, kI) => { const nr = routes[kI].length; if (!nr) return;
              for (let r = 0; r < nr; r++) { const need = Math.floor(w[kI] / nr) + (r < w[kI] % nr ? 1 : 0), mine = P.filter(pp => pp.k === kI && pp.r === r && !pp.retire).sort((p1, p2) => p2.d - p1.d);
                mine.slice(need).forEach(pp => { if (pp.d < 0) pp.k = -1; else pp.retire = true; });
                const ro = routes[kI][r], L = Math.max(ro.len + TRAIL, need * GAP), sp = L / Math.max(1, need);
                let back = mine.length && need ? Math.min(0, mine[Math.min(need, mine.length) - 1].d) : (REDUCED ? ro.len : 0) + sp * rnd() * 0.5;
                for (let c = mine.length; c < need; c++) { const pp = P.find(x => x.k < 0); if (!pp) break; back -= sp; pp.k = kI; pp.r = r; pp.retire = false; pp.d = back; if (REDUCED) pp.d = ((back % L) + L) % L; } } });
            gaB.fill(0); KINDS.forEach((_, kI) => { if (w[kI]) for (let i = 0; i < GN; i++) gaB[kI * GN + i] = 0.32 * (0.35 + 0.65 * i / GN); }); }
          for (let i = 0; i < ga.length; i++) ga[i] = gaB[i] * appear; aGA.needsUpdate = true;
          const yMax = wearY - 6;
          P.forEach((pp, i) => {
            const t0 = i * TL * 2, h0 = i * (1 + TD), hide = () => { for (let j = 0; j <= TD; j++) ha[h0 + j] = 0; for (let j = 0; j < TL * 2; j++) ta[t0 + j] = 0; };
            if (pp.k < 0) { hide(); return; }
            const pa = routes[pp.k][pp.r]; pp.d += V * dt;
            if (pp.d > pa.len + TRAIL) { if (pp.retire) { pp.k = -1; pp.retire = false; hide(); return; } pp.d -= period(pp.k, pp.r); }
            const cc = new TH.Color(cols[KINDS[pp.k]] || "#8a8983"), d = pp.d;
            // the head: swelling and fading as it dissipates past the twig's end; the trail's dots behind it
            const past = Math.max(0, (d - pa.len) / TRAIL), on = d < 0 ? 0 : 1;
            for (let j = 0; j <= TD; j++) { const q = h0 + j, dj = d - j * TRAIL / TD * 0.9, f = j / TD;
              at(pa, dj, hp, 3 * q); hp[3 * q + 1] = Math.min(yMax, hp[3 * q + 1]);
              hc[3 * q] = cc.r; hc[3 * q + 1] = cc.g; hc[3 * q + 2] = cc.b;
              if (!j) { ha[q] = on * appear * Math.max(0, 1 - past * 1.6) * Math.min(1, d / 30 + 0.2); hs[q] = 11 + 14 * past; }
              else { ha[q] = dj >= 0 && dj <= pa.len ? appear * 0.75 * Math.pow(1 - f, 1.3) : 0; hs[q] = 8 * (1 - f * 0.65); } }
            for (let j = 0; j < TL; j++) {
              const d0 = d - j * TRAIL / TL, d1 = d - (j + 1) * TRAIL / TL, v0 = (t0 + 2 * j) * 3, a0 = 1 - j / TL, a1 = 1 - (j + 1) / TL;
              at(pa, d0, tp, v0); at(pa, d1, tp, v0 + 3);
              for (let h = 0; h < 2; h++) { tp[v0 + 3 * h + 1] = Math.min(yMax, tp[v0 + 3 * h + 1]); tcol[v0 + 3 * h] = cc.r; tcol[v0 + 3 * h + 1] = cc.g; tcol[v0 + 3 * h + 2] = cc.b; }
              const ok = d0 >= 0 && d0 <= pa.len && d1 >= 0 && d1 <= pa.len;
              ta[t0 + 2 * j] = ok ? appear * 0.8 * a0 * a0 : 0; ta[t0 + 2 * j + 1] = ok ? appear * 0.8 * a1 * a1 : 0;
            }
          });
          aHP.needsUpdate = aHA.needsUpdate = aHS.needsUpdate = aHC.needsUpdate = aTP.needsUpdate = aTA.needsUpdate = aTC.needsUpdate = true;
          pat.active = P.filter(pp => pp.k >= 0 && !pp.retire).length; pat.flyingByKind = KINDS.map((_, kI) => P.filter(pp => pp.k === kI && !pp.retire).length); pat.leaving = P.filter(pp => pp.k >= 0 && pp.retire).length;
        };
      }
      // The metals, as the pathogens' reflection: particles in two streams, not industrial and industrial (the
      // prototype's grouping, js/metals-data.js), flowing down from above the worn-away cloud towards the tooth along
      // smooth gliding curves, and dissipating before they reach it, so the molar itself stays clear. The groups keep to
      // either side of the tooth, not industrial on the left and industrial on the right (they turn with the camera, not
      // with the molar, so the sides hold as the reader orbits), each in three nested lanes that stay wide of the
      // worn-away cloud and glide in beside the crown. A group's particles follow one another at even spacing, so a
      // denser stream is a greater presence (metalGroups(): the group's mean value on the prototype chart's log scale).
      let metalsStep = () => {}, met = null;
      if (MD.elements.length && MD.groups) {
        const GK = ["nonindustrial", "industrial"], LANES = 3, MAXM = 160, TLm = 12, TRm = 34, VM = 62, GAPM = 14, NMAX = 48;
        // the crown's radius near its top, round its axis: the lanes keep wide of it (and of the cloud above, the same width)
        let mcx = 0, mcz = 0, mc = 0; for (let i = 0; i < n; i++) if (rank[i] < 1.5) { mcx += pos[3 * i]; mcz += pos[3 * i + 2]; mc++; } mcx /= mc; mcz /= mc;
        let rTop = 0, rc = 0; for (let i = 0; i < n; i++) if (rank[i] < 1.5 && pos[3 * i + 1] > Ytop - 0.3 * (Ytop - Ycej)) { rTop = Math.max(rTop, Math.hypot(pos[3 * i] - mcx, pos[3 * i + 2] - mcz)); rc++; }
        // each lane: a cubic curve in the plane facing the reader (with a little depth), falling from high above on its
        // group's side, wide of the hovering cloud, then gliding in to beside the crown's upper part, where the particles
        // have faded; a group's three lanes are nested (the inner one, nearest the tooth, starts highest, each further one
        // lower, so the stream's top slopes down away from the tooth; the outer ones end further out), so they never cross
        const yS = Ytop + LIFT + 70, yE = Ytop - 0.12 * (Ytop - Ycej);
        const lanes = []; GK.forEach((gk, g) => { const side = g ? 1 : -1; for (let l = 0; l < LANES; l++) {
          const r0 = rTop * (1.85 + 0.35 * l), r1 = rTop * (1.3 + 0.15 * l), y0 = yS + 45 - 38 * l, y1 = yE + 10 * l, zl = (l - 1) * rTop * 0.3;
          const C = [[r0, y0, zl], [r0, y0 - (y0 - y1) * 0.5, zl], [r1 + (r0 - r1) * 0.35, y1 + (y0 - y1) * 0.1, zl * 0.6], [r1, y1, zl * 0.4]];
          const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60, w = [(1 - u) ** 3, 3 * u * (1 - u) ** 2, 3 * u * u * (1 - u), u ** 3];
            const sum = j2 => w.reduce((acc, wi, j) => acc + wi * C[j][j2], 0); pts.push(side * sum(0), sum(1), sum(2)); }
          const P3 = new Float32Array(pts), cum = new Float32Array(61);
          for (let i = 1; i <= 60; i++) cum[i] = cum[i - 1] + Math.hypot(P3[3 * i] - P3[3 * i - 3], P3[3 * i + 1] - P3[3 * i - 2], P3[3 * i + 2] - P3[3 * i - 1]);
          lanes.push({ g, P: P3, cum, len: cum[60] }); } });
        const atM = (pa, d, out, oi) => { const c = pa.cum; d = Math.max(0, Math.min(pa.len, d)); let lo = 0, hi = c.length - 1;
          while (hi - lo > 1) { const m2 = (lo + hi) >> 1; if (c[m2] <= d) lo = m2; else hi = m2; }
          const f = (d - c[lo]) / Math.max(1e-6, c[hi] - c[lo]); for (let a2 = 0; a2 < 3; a2++) out[oi + a2] = pa.P[3 * lo + a2] + (pa.P[3 * hi + a2] - pa.P[3 * lo + a2]) * f; };
        // a particle's look along its lane: it gathers out of nothing at the top and dissipates over the last stretch
        const fadeAt = (pa, d) => d < 0 || d > pa.len ? 0 : Math.min(1, d / (pa.len * 0.14)) * Math.min(1, (pa.len - d) / (pa.len * 0.3));
        const gcol = GK.map(gk => new TH.Color((MD.groupColours || {})[gk] || "#888888"));
        const HNm = MAXM * (1 + TLm), mp = new Float32Array(HNm * 3), mcol = new Float32Array(HNm * 3), ma = new Float32Array(HNm), ms = new Float32Array(HNm);
        const mg = new TH.BufferGeometry(), aMP = new TH.BufferAttribute(mp, 3), aMA = new TH.BufferAttribute(ma, 1), aMS = new TH.BufferAttribute(ms, 1), aMC = new TH.BufferAttribute(mcol, 3);
        [aMP, aMA, aMS, aMC].forEach(a2 => a2.setUsage(TH.DynamicDrawUsage)); mg.setAttribute("position", aMP); mg.setAttribute("aA", aMA); mg.setAttribute("aS", aMS); mg.setAttribute("aC", aMC);
        const mpts = new TH.Points(mg, new TH.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false,
          vertexShader: "attribute float aA, aS; attribute vec3 aC; uniform float uPx; varying float vA; varying vec3 vC; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vA = aA; vC = aC;" +
            " gl_PointSize = aA < 0.004 ? 0.0 : uPx * aS * 1480.0 / max(200.0, -mv.z); gl_Position = projectionMatrix * mv; }",
          fragmentShader: "varying float vA; varying vec3 vC; void main(){ vec2 q = gl_PointCoord - 0.5; float d = length(q) * 2.0; if (d > 1.0) discard;" +
            " float core = 1.0 - smoothstep(0.18, 0.34, d), glow = exp(-d * d * 4.0); vec3 c = mix(vC * 1.12, vC * 0.75, core); gl_FragColor = vec4(c, vA * clamp(core + glow * 0.42, 0.0, 1.0)); }" }));
        // in a frame of their own that turns with the camera (not the molar), so the sides stay the reader's left and right
        const mgrp = new TH.Group(); mgrp.add(mpts); sc.add(mgrp); mpts.frustumCulled = false; mpts.renderOrder = 13;
        // each particle: its lane (-1 idle), its distance along it (negative: waiting its turn), a small sideways offset
        const M = Array.from({ length: MAXM }, () => ({ l: -1, d: 0, retire: false, off: [0, 0, 0] }));
        met = { lanes, M, groups: GK, mgrp };
        metalsStep = (want, t, dt, wearY, appear) => {
          mgrp.rotation.y = Math.atan2(tc.position.x, tc.position.z); mgrp.position.y = molar.position.y;
          if (want !== met.wantRef) { met.wantRef = want; met.want = GK.map((_, g) => want ? Math.max(1, Math.round(want[g] * NMAX)) : 0);
            lanes.forEach((pa, li) => { const need = Math.floor(met.want[pa.g] / LANES) + (li % LANES < met.want[pa.g] % LANES ? 1 : 0);
              const mine = M.filter(pp => pp.l === li && !pp.retire).sort((p1, p2) => p2.d - p1.d);
              mine.slice(need).forEach(pp => { if (pp.d < 0) pp.l = -1; else pp.retire = true; });
              const L = Math.max(pa.len + TRm, need * GAPM), sp = L / Math.max(1, need);
              let back = mine.length && need ? Math.min(0, mine[Math.min(need, mine.length) - 1].d) : (REDUCED ? pa.len : 0) + sp * rnd() * 0.5;
              for (let c = mine.length; c < need; c++) { const pp = M.find(x => x.l < 0); if (!pp) break; back -= sp; pp.l = li; pp.retire = false; pp.d = REDUCED ? ((back % L) + L) % L : back;
                pp.off = [(rnd() - 0.5) * 6, (rnd() - 0.5) * 4, (rnd() - 0.5) * 6]; } }); }
          M.forEach((pp, i) => {
            const h0 = i * (1 + TLm), hide = () => { for (let j = 0; j <= TLm; j++) ma[h0 + j] = 0; };
            if (pp.l < 0) { hide(); return; }
            const pa = lanes[pp.l]; pp.d += VM * dt;
            if (pp.d > pa.len + TRm) { if (pp.retire) { pp.l = -1; pp.retire = false; hide(); return; }
              const n2 = M.filter(x => x.l === pp.l && !x.retire).length; pp.d -= Math.max(pa.len + TRm, n2 * GAPM); }
            const c = gcol[pa.g];
            for (let j = 0; j <= TLm; j++) { const q = h0 + j, dj = pp.d - j * TRm / TLm, f = j / TLm, fa = fadeAt(pa, dj);
              atM(pa, dj, mp, 3 * q); mp[3 * q] += pp.off[0]; mp[3 * q + 1] += pp.off[1]; mp[3 * q + 2] += pp.off[2];
              mcol[3 * q] = c.r; mcol[3 * q + 1] = c.g; mcol[3 * q + 2] = c.b;
              ma[q] = appear * fa * (j ? 0.6 * Math.pow(1 - f, 1.4) : 1); ms[q] = j ? 6.5 * (1 - f * 0.65) : 9 + 6 * (1 - Math.min(1, fa * 1.5)); }
          });
          aMP.needsUpdate = aMA.needsUpdate = aMS.needsUpdate = aMC.needsUpdate = true;
          met.flying = GK.map((_, g) => M.filter(pp => pp.l >= 0 && !pp.retire && lanes[pp.l].g === g).length);
        };
      }
      GLT = { rd, sc, tc, tcv, molar, U, Ytop, Ycej, wearStep, lift, pathStep, pat, metalsStep, met };
      // Stress lines (js/leh-data.js), as a current over the side of the crown rather than grooves cut into it: particles
      // stream round the crown and gather into two wavy lines. The first reaches round by the period's share of adults
      // with any line, the second, fainter, by the share with two or more (all the way round = 100%). The band's place,
      // its waves and the flow are a drawing rule, not data. Each particle is a short streak, brightest at its head.
      if (window.LEH_RATES) {
        // the crown's side wall as a radius map, angle round the crown's axis by height, from the cloud's own crown
        // points (model units: the enamel-root junction at y = 0; the wall runs to about 0.46, the chewing surface above).
        // The stress lines' band is Y0 to Y1 on it.
        const Y0 = 0.08, Y1 = 0.40, YM0 = 0.0, YM1 = 0.46, NA = 96, NY = 12, bins = Array.from({ length: NA * NY }, () => []), wall = [];
        for (let i = 0; i < n; i++) { if (RK[i] === 65535) continue; const y = P16[3 * i + 1] / 32767 * MC.s; if (y > YM0 - 0.02 && y < YM1 + 0.02) wall.push([P16[3 * i] / 32767 * MC.s, y, P16[3 * i + 2] / 32767 * MC.s]); }
        const cx = wall.reduce((a, p) => a + p[0], 0) / wall.length, cz = wall.reduce((a, p) => a + p[2], 0) / wall.length;
        wall.forEach(([x, y, z]) => { const a = Math.floor(((Math.atan2(z - cz, x - cx) / (2 * Math.PI) + 1) % 1) * NA) % NA, b = Math.round(cl((y - YM0) / (YM1 - YM0), 0, 1) * (NY - 1)); bins[b * NA + a].push(Math.hypot(x - cx, z - cz)); });
        const R = new Float32Array(NA * NY);
        for (let b = 0; b < NY; b++) {
          const row = []; for (let a = 0; a < NA; a++) { const v = bins[b * NA + a].sort((p, q) => p - q); row.push(v.length ? v[Math.floor(v.length * 0.7)] : null); }
          const got = row.map((v, a) => v == null ? null : a).filter(a => a != null);   // gaps: from the nearest bins either side, round the circle
          if (!got.length) { R.set(b ? R.subarray((b - 1) * NA, b * NA) : new Float32Array(NA).fill(0.6), b * NA); continue; }
          for (let a = 0; a < NA; a++) if (row[a] == null) { const L0 = got.reduce((m, g) => ((a - g + NA) % NA) < ((a - m + NA) % NA) ? g : m, got[0]), R0b = got.reduce((m, g) => ((g - a + NA) % NA) < ((m - a + NA) % NA) ? g : m, got[0]);
            const dl = (a - L0 + NA) % NA, dr = (R0b - a + NA) % NA; row[a] = (row[L0] * dr + row[R0b] * dl) / ((dl + dr) || 1); }
          for (let pass = 0; pass < 2; pass++) { const c = row.slice(); for (let a = 0; a < NA; a++) row[a] = (c[(a + NA - 1) % NA] + 2 * c[a] + c[(a + 1) % NA]) / 4; }
          R.set(row, b * NA);
        }
        const rho = (s, y) => { const fa = (((s % 1) + 1) % 1) * NA, a0 = Math.floor(fa) % NA, a1 = (a0 + 1) % NA, ta = fa - Math.floor(fa), fb = cl((y - YM0) / (YM1 - YM0), 0, 1) * (NY - 1), b0 = Math.floor(fb), b1 = Math.min(NY - 1, b0 + 1), tb = fb - b0;
          return (R[b0 * NA + a0] * (1 - ta) + R[b0 * NA + a1] * ta) * (1 - tb) + (R[b1 * NA + a0] * (1 - ta) + R[b1 * NA + a1] * ta) * tb; };
        // the particles, in two lanes told apart by look, place and pace: lane 0, any stress line, high on the wall, a
        // flowing band of mid-teal streaks (about half tight on the line, the rest a haze above and below it); lane 1, two
        // or more lines, lower down, a crisp beaded line of dark-teal dots, without streaks or haze, travelling slower. A
        // clear gap is kept between them. Each travels round the crown, seen only short of its lane's reach
        const NL = [4400, 2400], NP = NL[0] + NL[1], ps = new Float32Array(NP), ph = new Float32Array(NP), po = new Float32Array(NP), pv = new Float32Array(NP), pq = new Float32Array(NP), pl = new Uint8Array(NP);
        for (let i = 0; i < NP; i++) { const lane = i < NL[0] ? 0 : 1, tight = rnd() < (lane ? 0.85 : 0.45); pl[i] = lane; ps[i] = rnd(); ph[i] = 0.5; pq[i] = rnd() * 6.283;
          po[i] = (rnd() - 0.5) * (lane ? (tight ? 0.012 : 0.05) : (tight ? 0.035 : 0.44)); pv[i] = lane ? 0.011 + rnd() * 0.005 : 0.022 + rnd() * 0.022; }
        const MID = [0.72, 0.2], AMP = [1, 0.55], line = (lane, s, t) => MID[lane] + AMP[lane] * (0.055 * Math.sin(6.2832 * 3 * s + 1.7 * lane + 0.22 * t) + 0.028 * Math.sin(6.2832 * 7 * s + 0.6 + 2.1 * lane - 0.31 * t) + 0.012 * Math.sin(6.2832 * 13 * s + 4.1 + 0.4 * t));
        const vpos = new Float32Array(NP * 6), vnrm = new Float32Array(NP * 6), valp = new Float32Array(NP * 2), vlan = new Float32Array(NP * 2);
        for (let i = 0; i < NP; i++) { vlan[2 * i] = vlan[2 * i + 1] = pl[i]; ph[i] = line(pl[i], ps[i], 0) + po[i]; }
        const sg = new TH.BufferGeometry(); sg.setAttribute("position", new TH.BufferAttribute(vpos, 3)); sg.setAttribute("aN", new TH.BufferAttribute(vnrm, 3));
        sg.setAttribute("aA", new TH.BufferAttribute(valp, 1)); sg.setAttribute("aLane", new TH.BufferAttribute(vlan, 1));
        const UL = { uShow: { value: 0 }, c0: { value: new TH.Color(COLS.wear) }, c1: { value: new TH.Color("#0A4A3F") } };
        const streaks = new TH.LineSegments(sg, new TH.ShaderMaterial({ uniforms: UL, transparent: true, depthWrite: false,
          vertexShader: "attribute vec3 aN; attribute float aA, aLane; uniform float uShow; uniform vec3 c0, c1; varying vec3 vC; varying float vA;" +
            " void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); float face = dot(normalize(normalMatrix * aN), normalize(-mv.xyz));" +
            " vC = mix(c0, c1, aLane); vA = aA * uShow * mix(0.16, 1.0, smoothstep(-0.15, 0.35, face)); gl_Position = projectionMatrix * mv; }",
          fragmentShader: "varying vec3 vC; varying float vA; void main(){ if (vA < 0.01) discard; gl_FragColor = vec4(vC, vA); }" }));
        // and a dot at each streak's head (lines are a single pixel wide in WebGL): the same buffers, read every other vertex
        const ib = (arr, w) => new TH.InterleavedBuffer(arr, w), bPos = ib(vpos, 6), bNrm = ib(vnrm, 6), bAlp = ib(valp, 2), bLan = ib(vlan, 2), hg = new TH.BufferGeometry();
        hg.setAttribute("position", new TH.InterleavedBufferAttribute(bPos, 3, 0)); hg.setAttribute("aN", new TH.InterleavedBufferAttribute(bNrm, 3, 0));
        hg.setAttribute("aA", new TH.InterleavedBufferAttribute(bAlp, 1, 0)); hg.setAttribute("aLane", new TH.InterleavedBufferAttribute(bLan, 1, 0));
        UL.uPx = { value: Math.min(2, devicePixelRatio || 1) };
        const heads = new TH.Points(hg, new TH.ShaderMaterial({ uniforms: UL, transparent: true, depthWrite: false,
          vertexShader: "attribute vec3 aN; attribute float aA, aLane; uniform float uShow, uPx; uniform vec3 c0, c1; varying vec3 vC; varying float vA;" +
            " void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); float face = dot(normalize(normalMatrix * aN), normalize(-mv.xyz));" +
            " vC = mix(c0, c1, aLane); vA = aA * uShow * mix(0.12, 1.0, smoothstep(-0.15, 0.35, face)); gl_PointSize = uPx * (aLane > 0.5 ? 1.9 : 1.55) * 1480.0 / max(200.0, -mv.z); gl_Position = projectionMatrix * mv; }",
          fragmentShader: "varying vec3 vC; varying float vA; void main(){ vec2 q = gl_PointCoord - 0.5; float d = dot(q, q); if (d > 0.25 || vA < 0.01) discard; gl_FragColor = vec4(vC, vA * (1.0 - smoothstep(0.1, 0.25, d))); }" }));
        molar.add(streaks); molar.add(heads);
        // each lane's reach round the crown (eased); the angle the lines start from; the band's top, which stays a little
        // under the wear plane (U.uWearY), so on a worn crown the band closes down onto the wall that is left
        const ext = [0, 0], A0 = 0.6; let Yt = Y1;
        // the bands' outline: the side wall sampled finely (from the radius map), drawn in ink only where a band sinks the
        // surface and the surface turns away from the reader, so as the tooth turns the notch of each band shows crisply
        // in profile, fading with the band's ends; plain wall gets no outline
        const NA2 = 300, NB2 = 64, cpos = new Float32Array(NA2 * NB2 * 3), cnrm = new Float32Array(NA2 * NB2 * 3);
        for (let a = 0, q = 0; a < NA2; a++) for (let b = 0; b < NB2; b++, q += 3) { const s = (a + (b % 2) * 0.5) / NA2, y = 0.02 + (b / (NB2 - 1)) * 0.42, th = A0 + 6.2832 * s, c = Math.cos(th), sn = Math.sin(th), r = rho(s, y) * 1.01;
          cpos.set([(cx + r * c) * k, (y - yMid) * k, (cz + r * sn) * k], q); cnrm.set([c, 0, sn], q); }
        const cg = new TH.BufferGeometry(); cg.setAttribute("position", new TH.BufferAttribute(cpos, 3)); cg.setAttribute("aN", new TH.BufferAttribute(cnrm, 3));
        molar.add(new TH.Points(cg, new TH.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false,
          vertexShader: "attribute vec3 aN; uniform float uWearY, uPx, uCShow; varying float vA; " + LEHGL +
            " void main(){ vec3 p = position; float hb = (p.y - uY0) / (uYt - uY0), s = fract((atan(p.z - uCz, p.x - uCx) - uA0) / 6.2832);" +
            " float dn = uLehOn > 0.5 ? lehDent(hb, s) : 0.0; p = lehSink(p, dn); vec4 mv = modelViewMatrix * vec4(p, 1.0); float face = dot(normalize(normalMatrix * aN), normalize(-mv.xyz));" +
            " vA = (1.0 - smoothstep(0.03, 0.2, abs(face))) * (position.y > uWearY - 1.0 ? 0.0 : 1.0) * smoothstep(0.12, 0.45, dn / max(uLD.x, 0.001)) * uCShow * 0.55; gl_PointSize = uPx * 1.05 * 1480.0 / max(200.0, -mv.z); gl_Position = projectionMatrix * mv; }",
          fragmentShader: "uniform vec3 cInk; varying float vA; void main(){ vec2 q = gl_PointCoord - 0.5; float d = dot(q, q); if (d > 0.25 || vA < 0.01) discard; gl_FragColor = vec4(cInk, vA * (1.0 - smoothstep(0.1, 0.25, d))); }" })));
        const place = (s, h, out, o) => { const y = Y0 + cl(h, 0, 1) * (Yt - Y0), r = rho(s, y) * 1.02 - dent(s, h), th = A0 + 6.2832 * s, c = Math.cos(th), sn = Math.sin(th);
          out[o] = (cx + r * c) * k; out[o + 1] = (y - yMid) * k; out[o + 2] = (cz + r * sn) * k; return [c, sn]; };
        let tt = 0;
        const advect = dt => { tt += dt; for (let i = 0; i < NP; i++) {
          ps[i] = (ps[i] + pv[i] * dt) % 1;
          const tgt = line(pl[i], ps[i], tt) + po[i], turb = (pl[i] ? 0.012 : 0.07) * Math.sin(6.2832 * (5 * ps[i] + 9 * ph[i]) + 0.8 * tt + pq[i]);
          ph[i] += (tgt - ph[i]) * Math.min(1, dt * (pl[i] ? 3 : 1.6)) + turb * dt; } };
        if (REDUCED) for (let j = 0; j < 240; j++) advect(1 / 30);   // with reduced motion: settled once, then still
        // the bands of negative space (LEHGL above): switched on, with the crown's axis and the band's foot; the particles
        // get the same push, so they crowd the gaps' edges rather than fill them
        U.uLehOn.value = 1; U.uCx.value = cx * k; U.uCz.value = cz * k; U.uY0.value = (Y0 - yMid) * k; U.uA0.value = A0;
        const LW = [U.uLW.value.x, U.uLW.value.y], LRd = [U.uLR.value.x, U.uLR.value.y];
        const push = (lane, s, h) => { const e = ext[lane]; if (e < 0.002 || s < 0 || s > e) return h; const tw = Math.min(0.05, e * 0.3), tap = Math.min(1, s / tw) * Math.min(1, (e - s) / tw), w = LW[lane] * tap, R = LRd[lane];
          const d = h - line(lane, s, tt); if (Math.abs(d) >= R || w < 1e-4) return h; return h - d + Math.sign(d) * (w + Math.abs(d) / R * (R - w)); };
        // and each line sinks the surface round it towards the crown's axis, deepest on the line (LD, model units), so
        // the band constricts the tooth: seen edge-on, the outline is notched (lehDent() in LEHGL, the same)
        const LD = [0.075, 0.05];
        const dent = (s, h) => { let v = 0; for (let l = 0; l < 2; l++) { const e = ext[l]; if (e < 0.002 || s < 0 || s > e) continue; const tw = Math.min(0.05, e * 0.3), tap = Math.min(1, s / tw) * Math.min(1, (e - s) / tw), d = (h - line(l, s, tt)) / (1.6 * LW[l]);
          v += LD[l] * tap * Math.exp(-d * d); } return v; };
        U.uLD.value.set(LD[0] * k, LD[1] * k);
        GLT.leh = { update(dt, era, show, pulse) {
          const rate = era >= 0 && window.LEH_RATES[era], tgt = rate ? [rate.any / 100, rate.multi / 100] : [0, 0];
          for (let l = 0; l < 2; l++) ext[l] += (tgt[l] - ext[l]) * (REDUCED ? 1 : Math.min(1, dt * 2.5));
          if (!REDUCED && dt > 0) advect(dt);
          Yt = cl(U.uWearY.value / k + yMid - 0.03, Y0 + 0.1, Y1);
          U.uExt0.value = ext[0]; U.uExt1.value = ext[1]; U.uYt.value = (Yt - yMid) * k; U.uLT.value = tt;
          UL.uShow.value = show * (1 + 0.5 * pulse); U.uCShow.value = show;
          for (let i = 0; i < NP; i++) {
            const e = ext[pl[i]], s = ps[i], tw = Math.min(0.05, e * 0.3), a = e < 0.002 || s > e ? 0 : Math.min(1, s / tw) * Math.min(1, (e - s) / tw), len = pl[i] ? 0 : 0.007 + 0.009 * ((i * 0.618) % 1);   // lane 1: dots only
            const h0 = push(pl[i], s, ph[i]), n0 = place(s, h0, vpos, 6 * i), n1 = place(s - len, push(pl[i], s - len, ph[i] - (line(pl[i], s, tt) - line(pl[i], s - len, tt))), vpos, 6 * i + 3);
            vnrm[6 * i] = n0[0]; vnrm[6 * i + 2] = n0[1]; vnrm[6 * i + 3] = n1[0]; vnrm[6 * i + 5] = n1[1];
            const hz = pl[i] ? 1 : cl((h0 - 0.42) / 0.08, 0, 1) * cl((1 - h0) / 0.06, 0, 1);   // lane 0's haze fades out short of lane 1 and of the band's top
            valp[2 * i] = a * hz * (pl[i] ? 0.95 : 0.85); valp[2 * i + 1] = 0; }
          sg.attributes.position.needsUpdate = sg.attributes.aN.needsUpdate = sg.attributes.aA.needsUpdate = true; bPos.needsUpdate = bNrm.needsUpdate = bAlp.needsUpdate = true; },
          reach() { return ext.map(v => +v.toFixed(3)); } };
      }
    } catch (e) { GLT = null; }

    function build(animate) {
      if (svg) svg.remove();
      const W = Math.max(280, host.clientWidth), H = Math.max(320, host.clientHeight), val = v => typeof v === "function" ? v() : v;
      let pt = Math.max(24, val(opts.padTop) || 0), pb = Math.max(24, val(opts.padBottom) || 0); if (H - pt - pb < H * 0.4) pt = pb = 24;
      const C = [W / 2, pt + (H - pt - pb) * 0.5], F = Math.min(W * 1.1, (H - pt - pb - 60) * 1.95);
      svg = el("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, class: "rd rd3", role: "group",
        "aria-label": "Three-dimensional radial timeline: " + DATA.map(c => c.name.toLowerCase()).join(", ") + " leave the teeth in different directions; distance is how long ago, dot size is how much was gathered. Drag to orbit, scroll to move." }, host);
      const defs = el("defs", {}, svg);
      [["rd-b1", 1.4], ["rd-b2", 3.2], ["rd-b3", 6]].forEach(([id, sd]) => el("feGaussianBlur", { stdDeviation: sd }, el("filter", { id, x: "-100%", y: "-100%", width: "300%", height: "300%" }, defs)));
      const gl = el("filter", { id: "rd-glow", x: "-100%", y: "-100%", width: "300%", height: "300%" }, defs); el("feGaussianBlur", { in: "SourceGraphic", stdDeviation: 3, result: "b" }, gl); const mg = el("feMerge", {}, gl); el("feMergeNode", { in: "b" }, mg); el("feMergeNode", { in: "SourceGraphic" }, mg);
      const hg = el("radialGradient", { id: "rd-halo" }, defs); el("stop", { offset: 0, "stop-color": "#8a6d47", "stop-opacity": .12 }, hg); el("stop", { offset: 1, "stop-color": "#2348D8", "stop-opacity": 0 }, hg);
      const mk = el("marker", { id: "rd-arrow", viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, markerUnits: "userSpaceOnUse", orient: "auto" }, defs); el("path", { d: "M0 1 L9 5 L0 9 z", fill: "#8a8983" }, mk);
      const gHalo = el("circle", { fill: "url(#rd-halo)" }, svg);
      const gSphere = el("g", { class: "rd-sphere", "aria-hidden": "true" }, svg);
      const sph = [];
      [-60, -30, 30, 60].forEach(lat => sph.push({ kind: "lat", v: lat * Math.PI / 180, el: el("polyline", { class: "rd-wire" }, gSphere) }));
      for (let m = 0; m < 180; m += 20) sph.push({ kind: "lon", v: m * Math.PI / 180, el: el("polyline", { class: "rd-wire" }, gSphere) });
      const equator = el("polyline", { class: "rd-equator" }, gSphere), axis = el("line", { class: "rd-axis" }, gSphere), poleA = el("circle", { class: "rd-pole" }, gSphere), poleB = el("circle", { class: "rd-pole" }, gSphere);
      const AGES = [300, 1000, 2000, 4000, 6000].filter(a => a <= MAX_AGE * 1.02);
      const shells = AGES.map((a, i) => ({ w: rAge(a), a, el: el("polyline", { class: "rd-shell", style: "animation-delay:" + (-i * 1.1) + "s" }, gSphere), lab: el("text", { class: "rd-slab" }, gSphere) }));
      shells.forEach(r => r.lab.textContent = r.a.toLocaleString("en-GB") + " years ago");
      // the timeline's ring, drawn as a soft, blurred band so it reads apart from the records' crisp lines: the same ring
      // stroked five times over, widest faintest (stacked strokes, not a blur filter, which would be redrawn every frame)
      const wave = el("g", { class: "rd-wave" }, gSphere), waveLab = el("text", { class: "rd-wlab" }, gSphere),
        waveL = [[14, 0.06], [9, 0.09], [6, 0.13], [3.5, 0.2], [1.6, 0.3]].map(([sw, so]) => el("polyline", { "stroke-width": sw, "stroke-opacity": so }, wave));
      const gAmb = el("g", { "aria-hidden": "true" }, svg), gLines = el("g", {}, svg), gArrows = el("g", { "aria-hidden": "true" }, svg), gBack = el("g", {}, svg), gTeeth = el("g", { class: "rd-teeth", "aria-hidden": "true" }, svg), gHub = el("g", { "aria-hidden": "true" }, svg), gFront = el("g", {}, svg), gCards = el("g", {}, svg), gRead = el("g", { class: "rd-read", "aria-hidden": "true" }, svg);
      // a legend for the colours a record draws on the molar, shown beside its name while the name is hovered or
      // focused, styled as the circles' pop-up: the pathogens' kinds, the metals' two groups
      const LEG = {
        pathogens: PD.colours && { title: "Pathogens on the molar, by kind", rows: [["bacteria", "Bacteria", "red"], ["virus", "Viruses", "blue"], ["parasite", "Parasites", "teal"], ["other", "Not disease agents", "grey"]].map(([k, t, w]) => [PD.colours[k], t, w]) },
        metals: MD.groupColours && { title: "Metals around the molar", rows: [[MD.groupColours.nonindustrial, "Non-industrial", "gold", "zinc, barium, strontium, magnesium"], [MD.groupColours.industrial, "Industrial", "violet", "lead, copper, chromium, nickel"]] } };
      const gLeg = el("g", { class: "rd-read rd-leg", "aria-hidden": "true" }, svg), lgLine = el("line", {}, gLeg), lgBg = el("rect", { class: "rd-rbg", rx: 3 }, gLeg), lgT = el("text", { class: "rd-yr" }, gLeg), lgRows = el("g", {}, gLeg);
      const hubR1 = el("circle", { class: "rd-hubr r1" }, gHub), hubR2 = el("circle", { class: "rd-hubr r2" }, gHub), hubR3 = el("circle", { class: "rd-hubr r3" }, gHub);
      const opens = typeof opts.onOpen === "function";
      const lines = DATA.map((c, ci) => {
        const A = c.angle * Math.PI / 180, E = (ELEV[c.key] != null ? ELEV[c.key] : (ci * 23 % 60) - 30) * Math.PI / 180, col = COLS[c.key] || "#5CCBFF";
        const d = [Math.cos(E) * Math.cos(A), Math.sin(E), Math.cos(E) * Math.sin(A)], n1 = norm(cross(d, Math.abs(d[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0])), n2 = cross(d, n1);
        const marks = c.dens.map(dd => ({ d: dd, w: rYear(dd[0]) })), wEnd = Math.max(...marks.map(m => m.w)), mx = Math.max(1, ...c.dens.map(dd => dd[2] || 0));
        const g = el("g", { "data-cat": c.key, style: "--c:" + col }, gLines), base = el("line", { class: "rd-ray", "marker-end": "url(#rd-arrow)" }, g);
        const spans = c.segs.map(sg => ({ a: rYear(sg[1]), b: rYear(sg[0]), el: el("line", { class: "rd-beam" }, g) }));
        const ms = marks.map((m, mi) => {
          const mgp = el("g", { class: "rd-mark", style: "--c:" + col }), halo = el("circle", { class: "rd-bokeh" }, mgp), dot = el("circle", { class: "rd-core" + (m.d[2] == null ? " nocount" : "") }, mgp),
            hit = el("circle", { class: "rd-hit", tabindex: 0, role: "button", "aria-label": c.name + ", " + range(m.d[0], m.d[1]) + ", " + amount(c, m.d) }, mgp);
          const arrow = el("line", { class: "rd-arw", "data-cat": c.key, style: "--c:" + col }, gArrows); const o = { c, m, mi, ci, arrow, mg: mgp, halo, dot, hit, col, ph: mi * 1.9 + ci, sz: m.d[2] == null ? 0.35 : 0.3 + 0.7 * Math.sqrt(m.d[2] / mx), blur: -1 };
          const on = () => { mgp.classList.add("on"); S.read = o; lit(ci, true); }, off = () => { mgp.classList.remove("on"); if (S.read === o) S.read = null; lit(ci, false); }; o.off = off;
          hit.addEventListener("mouseenter", () => { o.byPtr = true; on(); }); hit.addEventListener("mouseleave", off); hit.addEventListener("focus", () => { o.byPtr = false; on(); }); hit.addEventListener("blur", off);
          const fly = () => { const yaw = Math.atan2(d[0], d[2]), k = Math.round((cam.yaw - yaw) / (2 * Math.PI)); cam.tYaw = yaw + (k - 1) * 2 * Math.PI; cam.tPitch = cl(Math.asin(d[1]) + 0.15, -1.2, 1.35); cam.tDist = cl(o.m.w + 620, 780, 3000); lastInput = performance.now() + 5000; on(); };
          // picked on the press, not on "click": the marks are re-ordered in the page every frame (to draw them by depth),
          // which can cancel a click between press and release. The press picks the period for the pop-up, or lets it go
          // if it was picked. A caries point also moves the timeline to its period and pauses it there, so the molar shows
          // that period's caries.
          const pick = () => { if (!choose(c.key, mi)) return; if (c.key !== "caries" && c.key !== "wear" && c.key !== "metals" && c.key !== "pathogens") { fly(); return; }
            on(); lastInput = performance.now() + 5000; seekYear((o.m.d[0] + o.m.d[1]) / 2); setPlaying(false); };   // the view stays put
          hit.addEventListener("pointerdown", e => { e.stopPropagation(); pick(); }); hit.addEventListener("keydown", press(pick));
          return o;
        });
        const leg = LEG[c.key];
        const card = el("g", { class: "rd-card" + (opens ? " go" : ""), style: "--c:" + col, tabindex: opens || leg ? 0 : null, role: opens ? "link" : null,
          "aria-label": opens ? c.name + ": open this section" : leg ? c.name + ". Colours on the molar: " + leg.rows.map(r => r[2] + ", " + r[1] + (r[3] ? " (" + r[3] + ")" : "")).join("; ") : null }, gCards);
        const sub = range(c.segs[0][0], c.segs[c.segs.length - 1][1]), cw = Math.max(c.name.length * 10.2, sub.length * 6.9) + 6;
        const lead = el("line", { class: "rd-lead" }, gCards), rect = el("rect", { width: cw, height: 46, class: "rd-cbox" }, card);   // no box drawn: an invisible hit area for the name
        const t1 = el("text", { class: "rd-cname", x: 0, y: 19 }, card), t2 = el("text", { class: "rd-csub", x: 0, y: 36 }, card); t1.textContent = c.name.toUpperCase(); t2.textContent = sub;
        if (opens) { const go = () => opts.onOpen(c.key); card.addEventListener("click", go); card.addEventListener("keydown", press(go)); }
        card.addEventListener("mouseenter", () => lit(ci, true)); card.addEventListener("mouseleave", () => lit(ci, false));
        if (leg) { const on2 = () => { if (S) S.leg = c.key; }, off2 = () => { if (S && S.leg === c.key) S.leg = null; };
          card.addEventListener("mouseenter", on2); card.addEventListener("mouseleave", off2); card.addEventListener("focus", on2); card.addEventListener("blur", off2); }
        g.addEventListener("mouseenter", () => lit(ci, true)); g.addEventListener("mouseleave", () => lit(ci, false));
        return { c, ci, g, base, spans, ms, wEnd, d, n1, n2, col, card, lead, cw };
      });
      function lit(ci, on) { svg.classList.toggle("rd-dim", on); lines.forEach(L => { const y = on && L.ci === ci; [L.g, L.card].forEach(e => e.classList.toggle("lit", y)); L.ms.forEach(o => { o.mg.classList.toggle("lit", y); o.arrow.classList.toggle("lit", y); }); }); }
      let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      const amb = Array.from({ length: 0 }, (_, i) => { const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, r = R0 * 1.25 + rnd() * (RS * 0.95 - R0 * 1.25), q = Math.sqrt(1 - u * u);
        const o = { p: [r * q * Math.cos(a), r * u * 0.8, r * q * Math.sin(a)], s: 0.5 + rnd(), ph: rnd() * 6.28, blur: -1, c: el("circle", { class: "rd-amb" }, gAmb) };
        if (i % 8 === 3) { o.t = el("text", { class: "rd-albl" }, gAmb); o.t.textContent = String(i).padStart(2, "0") + " · " + "NSEWBFD"[i % 7]; } return o; });
      const T = opts.teeth, teeth = [];
      if (!GLT && T && T.canine && T.molar) [["molar", 0]].forEach(([key, side]) => teeth.push({ key, side, t: T[key], el: el("image", { href: T[key].art, preserveAspectRatio: "none" }, gTeeth) }));
      const rLine = el("line", {}, gRead), rBg = el("rect", { class: "rd-rbg", rx: 3 }, gRead), rYr = el("text", { class: "rd-yr" }, gRead), rCt = el("text", { class: "rd-ct" }, gRead),
        rLh = el("text", { class: "rd-ct rd-lh" }, gRead), rLa = el("tspan", { class: "a" }, rLh), rLb = el("tspan", { class: "b" }, rLh);   // a Wear and LEH point's two stress lines, coloured as on the molar
      // the timeline's handle: drag it around the ring, or in and out to a year (which pauses the timeline there); the
      // arrow keys step it in and out
      const grip = el("g", { class: "rd-grip", tabindex: 0, role: "slider", "aria-label": "Timeline: drag to choose a year", "aria-valuemin": 0, "aria-valuemax": MAX_AGE }); svg.insertBefore(grip, gRead);
      const kHalo = el("circle", { class: "rd-khalo", r: 16 }, grip), knob = el("g", { class: "rd-knob" }, grip), kHit = el("circle", { class: "rd-khit", r: 16 }, grip);
      // the clicked period's years, in a box beside its circle
      const gPin = el("g", { class: "rd-pin", "aria-hidden": "true" }); svg.insertBefore(gPin, grip);
      const pin = { g: gPin, ln: el("line", {}, gPin), bx: el("rect", { height: 26 }, gPin), t: el("text", {}, gPin), o: null, w: 0 };
      el("path", { class: "rd-kbody", d: "M-10 0L0 -7L10 0L0 7Z" }, knob); el("path", { class: "rd-kfacet", d: "M-4.5 0L0 -3.2L4.5 0L0 3.2Z" }, knob);   // a diamond lying along the ring, with a small facet
      grip.addEventListener("pointerdown", e => { ringDrag = true; ring.touched = true; if (!ring.moved) { ring.moved = true; ring.a = S.ringA; } setPlaying(false);
        try { host.setPointerCapture(e.pointerId); } catch (_) {} host.classList.add("ringgrab"); lastInput = performance.now(); });
      grip.addEventListener("keydown", e => { const k = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key]; if (!k) return; e.preventDefault();   // up: further back
        ring.touched = true; waveU = cl(waveU - k * (e.shiftKey ? 0.1 : 0.02), 0, 1); setPlaying(false); lastInput = performance.now(); });
      const dpr = Math.min(2, window.devicePixelRatio || 1); sky.width = W * dpr; sky.height = H * dpr;
      if (!stars) stars = Array.from({ length: 260 }, () => { const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = 1800 + Math.random() * 2200, s = Math.sqrt(1 - u * u); return [r * s * Math.cos(a), r * u, r * s * Math.sin(a), Math.random()]; });
      S = { car: { out: 0, mid: 0, inn: 0, era: null }, wear: { share: 0, era: null }, met: { era: null, cEra: undefined, groups: null }, pat: { era: null, cEra: undefined, counts: null }, W, H, C, F, pt, dpr, pin, amb, wave, waveL, waveLab, sph, equator, axis, poleA, poleB, shells, lines, teeth, gHalo, hubR1, hubR2, hubR3, gBack, gFront, gRead, rLine, rBg, rYr, rCt, rLh, rLa, rLb, gLeg, lgLine, lgBg, lgT, lgRows, LEG, leg: null, grip, kHalo, knob, kHit, read: null, born: performance.now(), anim: animate, last: 0 };
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      const s = S; if (!s) return;
      const dt = Math.min(0.05, s.last ? (now - s.last) / 1000 : 0); s.last = now; const t = (now - s.born) / 1000;
      if (!REDUCED && !dragging && now - lastInput > 4000 && (!s.anim || t > 3)) cam.tYaw += dt * 0.02;
      const kc = Math.min(1, dt * (dragging ? 9 : s.anim && t < 3.2 ? 1.3 : 3.5));
      cam.yaw += (cam.tYaw - cam.yaw) * kc; cam.pitch += (cam.tPitch - cam.pitch) * kc; cam.dist += (cam.tDist - cam.dist) * kc;
      const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch), D = cam.dist;
      const pos = [D * cp * sy, D * sp, D * cp * cy], fw = [-pos[0] / D, -pos[1] / D, -pos[2] / D], rt = [cy, 0, -sy], up = cross(rt, fw);
      // the pop-up, laid over the diagram (opts.cover(): the box it covers, at the right of the page or, on narrow pages,
      // along the bottom): the names, the time labels, the timeline's year and the readouts keep clear of it
      const cv = opts.cover ? opts.cover() : null, inCv = (x, y, w, h) => !!cv && x < cv.x + cv.w + 6 && cv.x - 6 < x + w && y < cv.y + cv.h + 6 && cv.y - 6 < y + h;
      const ctl = opts.controls ? opts.controls() : null;   // the page's own buttons (Pause, Replay), which the names keep clear of too
      const { C, F } = s, U = F / D; s.cb = { pos, fw, rt, up };   // the camera, kept for dragging the timeline's handle
      const pj = (x, y, z) => { const d0 = x - pos[0], d1 = y - pos[1], d2 = z - pos[2], zc = d0 * fw[0] + d1 * fw[1] + d2 * fw[2], q = F / Math.max(30, zc);
        return [C[0] + (d0 * rt[0] + d1 * rt[1] + d2 * rt[2]) * q, C[1] - (d0 * up[0] + d1 * up[1] + d2 * up[2]) * q, q, zc]; };
      const seg = (e, p, q) => { if (p[3] < 60 || q[3] < 60) { e.setAttribute("visibility", "hidden"); return false; } e.removeAttribute("visibility"); e.setAttribute("x1", fx(p[0])); e.setAttribute("y1", fx(p[1])); e.setAttribute("x2", fx(q[0])); e.setAttribute("y2", fx(q[1])); return true; };
      const poly = (e, fn, n) => { const pts = []; for (let i = 0; i <= n; i++) { const p = fn(i / n * Math.PI * 2); if (p[3] > 60) pts.push(fx(p[0]) + "," + fx(p[1])); } e.setAttribute("points", pts.join(" ")); };
      const appear = s.anim ? cl(t / 1.4, 0, 1) : 1;
      if (GLT) { const { rd, tc } = GLT; if (GLT.w !== s.W || GLT.h !== s.H) { rd.setSize(s.W, s.H, false); GLT.w = s.W; GLT.h = s.H; }
        tc.fov = 2 * Math.atan(s.H / 2 / F) * 180 / Math.PI; tc.aspect = s.W / s.H; tc.setViewOffset(s.W, s.H, s.W / 2 - C[0], s.H / 2 - C[1], s.W, s.H); tc.updateProjectionMatrix();
        tc.position.set(pos[0], pos[1], pos[2]); tc.up.set(up[0], up[1], up[2]); tc.lookAt(0, 0, 0);
        const sw = REDUCED ? 0 : Math.sin(t * 0.45) * 0.35; GLT.molar.rotation.y = 0.5 + sw + t * 0.12;
        GLT.molar.position.y = REDUCED ? 0 : Math.sin(t * 0.7) * 6;
        const ku = Math.min(1, dt * 3), U2 = GLT.U; U2.uT.value = REDUCED || !s.anim ? 99 : t;
        U2.uPulse.value = REDUCED ? 0 : Math.max(0, 1 - (now - (s.car.at || -1e9)) / 900);   // the swell after a change of period
        const plane = s.wear.share > 0 ? GLT.Ycej + (GLT.Ytop - GLT.Ycej) * (1 - s.wear.share) : GLT.Ytop + 2;
        U2.uWearY.value += (plane - U2.uWearY.value) * (REDUCED ? 1 : Math.min(1, dt * 2.2)); GLT.wearStep(plane, REDUCED ? 99 : dt);
        if (s.met.era !== s.met.cEra) { s.met.cEra = s.met.era; s.met.groups = s.met.era >= 0 ? metalGroups(s.met.era) : null; }
        GLT.metalsStep(s.met.groups, t, REDUCED ? 0 : Math.min(0.05, dt), U2.uWearY.value, appear * (REDUCED || !s.anim ? 1 : cl((t - 2.6) / 1.2, 0, 1)));
        { const pa = REDUCED || !s.anim ? 1 : cl((t - 2.6) / 1.2, 0, 1); U2.uNv && (U2.uNv.value = appear * pa);
          if (s.pat.era !== s.pat.cEra) { s.pat.cEra = s.pat.era; s.pat.counts = s.pat.era >= 0 ? pathogenCounts(s.pat.era) : null; }
          GLT.pathStep(s.pat.counts, REDUCED ? 0 : Math.min(0.05, dt), U2.uWearY.value, appear * pa); }
        U2.uOut.value += (s.car.out - U2.uOut.value) * (REDUCED ? 1 : ku); U2.uMid.value += (s.car.mid - U2.uMid.value) * (REDUCED ? 1 : ku); U2.uInn.value += (s.car.inn - U2.uInn.value) * (REDUCED ? 1 : ku);
        // the stress lines follow the same period as the caries, and show once the molar has mostly settled
        if (GLT.leh) GLT.leh.update(dt, s.car.era == null ? -1 : s.car.era, REDUCED || !s.anim ? 1 : cl((t - 2.4) / 1, 0, 1), U2.uPulse.value);
        GLT.tcv.style.opacity = appear; rd.render(GLT.sc, tc); }
      // sky
      const ctx = sky.getContext("2d"); ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0); ctx.clearRect(0, 0, s.W, s.H);
      if (false) stars.forEach(st => { const p = pj(st[0], st[1], st[2]); if (p[3] < 60) return; const tw = 0.35 + 0.35 * Math.sin(t * (0.6 + st[3]) + st[3] * 9); ctx.fillStyle = "rgba(190,210,255," + (tw * appear).toFixed(2) + ")"; ctx.fillRect(p[0], p[1], 1 + st[3] * 1.2, 1 + st[3] * 1.2); });
      // wire sphere, equator, axis, time shells
      s.sph.forEach(o => poly(o.el, o.kind === "lat" ? a => pj(RS * Math.cos(o.v) * Math.cos(a), RS * Math.sin(o.v), RS * Math.cos(o.v) * Math.sin(a)) : a => pj(RS * Math.cos(a) * Math.cos(o.v), RS * Math.sin(a), RS * Math.cos(a) * Math.sin(o.v)), 64));
      poly(s.equator, a => pj(RS * Math.cos(a), 0, RS * Math.sin(a)), 96);
      const pa = pj(0, RS * 1.08, 0), pb2 = pj(0, -RS * 1.08, 0); seg(s.axis, pa, pb2);
      [[s.poleA, pa], [s.poleB, pb2]].forEach(([e, p]) => { e.setAttribute("cx", fx(p[0])); e.setAttribute("cy", fx(p[1])); e.setAttribute("r", fx(cl(7 * p[2] / U, 3, 10))); });
      const LA = s.lines.map(L => L.c.angle * Math.PI / 180), dA = (x, y) => Math.abs(Math.atan2(Math.sin(x - y), Math.cos(x - y))), Ab = Math.atan2(cy, sy);
      let A0 = Ab + 0.5; for (let n = 0; n < 40; n++) { const c = Ab + 0.5 + (n % 2 ? 1 : -1) * Math.ceil(n / 2) * 0.16; if (LA.every(x => dA(c, x) > 0.42)) { A0 = c; break; } }
      let lastP = null;
      s.shells.forEach(r => { poly(r.el, a => pj(r.w * Math.cos(a), 0, r.w * Math.sin(a)), 96); r.el.style.opacity = appear;
        const p = pj(r.w * Math.cos(A0), 0, r.w * Math.sin(A0)); r.lab.setAttribute("x", fx(p[0] + 6)); r.lab.setAttribute("y", fx(p[1] - 6)); const ok = p[3] > 60 && (lastP == null || Math.abs(p[0] - lastP[0]) > 90 || Math.abs(p[1] - lastP[1]) > 15); if (ok) lastP = p; r.lab.style.opacity = ok ? appear * 0.85 : 0; });
      // hub
      const hb = pj(0, 0, 0), hubZ = hb[3], hr = cl(46 * hb[2] / U, 26, 80);
      s.gHalo.setAttribute("cx", fx(hb[0])); s.gHalo.setAttribute("cy", fx(hb[1])); s.gHalo.setAttribute("r", fx(hr * 5.5));
      [[s.hubR1, 1.9], [s.hubR2, 2.5], [s.hubR3, 3.3]].forEach(([e, m]) => { e.setAttribute("cx", fx(hb[0])); e.setAttribute("cy", fx(hb[1])); e.setAttribute("r", fx(hr * m)); });
      const tc = pj(0, 0, 0), sc = tc[2];
      s.teeth.forEach(o => { const h = TOOTH_H[o.key] * sc, w = h * o.t.w / o.t.h, x = o.side === 0 ? tc[0] - w / 2 : o.side < 0 ? tc[0] - GAP / 2 * sc - w : tc[0] + GAP / 2 * sc;
        o.el.setAttribute("x", fx(x)); o.el.setAttribute("y", fx(tc[1] - h / 2)); o.el.setAttribute("width", fx(w)); o.el.setAttribute("height", fx(h)); o.el.style.opacity = appear; });
      // the timeline: the reading wave runs inwards, from the oldest record to today, so the records play forward in time;
      // marks swell as it passes their year, and it can be paused. Where it is sets the caries the molar shows (a picked
      // caries point moves it there and pauses it). Its knob holds it while hovered; dragging the knob, or the arrow keys,
      // move it to a year and pause it there. With reduced motion it does not run, and stays hidden at today until the
      // reader moves the knob.
      { const hold = ring.hover || ringDrag, shown = !REDUCED || ring.touched;
        if (playing && !hold && !REDUCED && (!s.anim || t > 2.4)) waveU = (waveU + dt * 0.045) % 1;
        const u = waveU, w = RMAX - u * (RMAX - R0); poly(s.waveL[0], a => pj(w * Math.cos(a), 0, w * Math.sin(a)), 96);
        { const pts = s.waveL[0].getAttribute("points"); for (let i = 1; i < s.waveL.length; i++) s.waveL[i].setAttribute("points", pts); }
        const op = shown ? appear * (playing && !hold ? Math.max(0.25, Math.sin(Math.PI * u)) : 1) * 0.9 : 0; s.wave.style.opacity = op.toFixed(2);
        const age = Math.pow((w - R0) / (RMAX - R0), 2) * MAX_AGE, y0 = Math.round(NOW - age); s.ringY = y0 < 0 ? Math.round(y0 / 10) * 10 : y0; s.waveYear = y0;
        // the knob on the ring; its year is placed once the names are (below)
        const A = ring.moved ? ring.a : Ab; s.ringA = A;
        const q = pj(w * Math.cos(A), 0, w * Math.sin(A)), vis = q[3] > 60, ox = q[0] - hb[0], oy = q[1] - hb[1], ol = Math.hypot(ox, oy) || 1;
        s.waveLab.textContent = yr(s.ringY); s.wl = { q, nx: ox / ol, ny: oy / ol, op: vis ? op : 0 };
        const hot = hold || s.grip.matches(":focus-visible"); s.grip.classList.toggle("on", hot);
        [s.kHalo, s.kHit].forEach(e => { e.setAttribute("cx", fx(q[0])); e.setAttribute("cy", fx(q[1])); });
        { const q2 = pj(w * Math.cos(A + 0.02), 0, w * Math.sin(A + 0.02)); let ang = Math.atan2(q2[1] - q[1], q2[0] - q[0]) * 57.2958; if (ang > 90) ang -= 180; else if (ang < -90) ang += 180;   // along the ring, never upside down
          s.knob.setAttribute("transform", "translate(" + fx(q[0]) + "," + fx(q[1]) + ") rotate(" + ang.toFixed(1) + ") scale(" + (hot ? 1.18 : 1) + ")"); }
        s.grip.style.opacity = vis ? Math.max(op, 0.65 * appear).toFixed(2) : 0; s.grip.style.pointerEvents = vis && appear > 0.5 ? "" : "none";
        if (s.grip._y !== s.ringY) { s.grip._y = s.ringY; s.grip.setAttribute("aria-valuenow", Math.round(age)); s.grip.setAttribute("aria-valuetext", yr(s.ringY)); }
        // hover is set when the pointer moves onto the knob (pointermove below), and cleared here once they part, so a
        // knob that sweeps or drifts under a resting pointer neither holds the ring nor stays lit
        s.kxy = vis ? q : null; if (ring.hover && (!ptr.in || !vis || Math.hypot(ptr.x - q[0], ptr.y - q[1]) > 16)) ring.hover = false; }
      // the caries on the molar: the picked caries point's period, else the period the wave is in. Where the wave is
      // in no period the molar keeps the last period it passed (nothing before the first), and the caries line dims
      // until the wave reaches the next record.
      // The same for wear, on the Wear and LEH line: the molar's height is the period's wear.
      ["caries", "wear", "metals", "pathogens"].forEach(key => { const L = s.lines.find(L2 => L2.c.key === key); if (!L) return;
        const D = L.c.dens, y = s.waveYear;
        let at = D.findIndex((d, i) => y >= d[0] && (y < d[1] || (i === D.length - 1 && y <= d[1])));
        const inData = at >= 0;
        if (!inData) { at = -1; D.forEach((d, i) => { if (d[1] <= y) at = i; }); }
        const era = at;
        if (key === "caries" && era !== s.car.era) { s.car.era = era; s.car.at = now; Object.assign(s.car, era >= 0 ? cariesShares(era) : { out: 0, mid: 0, inn: 0 }); }
        if (key === "wear" && era !== s.wear.era) { s.wear.era = era; s.wear.share = era >= 0 ? wearShare(era) : 0; }
        if (key === "metals") s.met.era = era;
        if (key === "pathogens") s.pat.era = era;
        L.g.classList.toggle("rd-nodata", !inData && !REDUCED); });   // with reduced motion there is no wave: the latest period, undimmed
      // ambient field: grey bodies drifting in the volume, focus-blurred by depth
      const ay = REDUCED ? 0 : t * 0.025;
      s.amb.forEach(o => { const ca = Math.cos(ay), sa = Math.sin(ay), x = o.p[0] * ca - o.p[2] * sa, z = o.p[0] * sa + o.p[2] * ca, y = o.p[1] + (REDUCED ? 0 : Math.sin(t * 0.4 + o.ph) * 10);
        const p = pj(x, y, z); if (p[3] < 60) { o.c.setAttribute("visibility", "hidden"); if (o.t) o.t.setAttribute("visibility", "hidden"); return; }
        o.c.removeAttribute("visibility"); const r = cl(7 * o.s * p[2] / U, 1.4, 16); o.c.setAttribute("cx", fx(p[0])); o.c.setAttribute("cy", fx(p[1])); o.c.setAttribute("r", fx(r));
        const dz = Math.abs(p[3] - D * 0.92), bl = dz < 160 ? 0 : dz < 340 ? 1 : dz < 560 ? 2 : 3; if (bl !== o.blur) { o.blur = bl; if (bl) o.c.setAttribute("filter", "url(#rd-b" + bl + ")"); else o.c.removeAttribute("filter"); }
        o.c.style.opacity = (appear * cl(1.2 - (p[3] - D) / (RMAX * 1.8), 0.25, 0.9)).toFixed(2);
        if (o.t) { o.t.removeAttribute("visibility"); o.t.setAttribute("x", fx(p[0] + r + 6)); o.t.setAttribute("y", fx(p[1] + 3)); o.t.style.opacity = (appear * 0.8).toFixed(2); } });
      // records
      const all = [], so = sel && (s.lines.find(L2 => L2.c.key === sel[0]) || { ms: [] }).ms[sel[1]];   // the clicked circle
      s.lines.forEach(L => {
        // the line grows out to its oldest record; its front runs 60 further, so the oldest circle swells to full size too
        const g = s.anim ? ease(cl((t - 0.7 - L.ci * 0.18) / 1.6, 0, 1)) : 1, wFront = R0 + (L.wEnd + 60 - R0) * g, wNow = Math.min(L.wEnd, wFront), at = w => pj(L.d[0] * w, L.d[1] * w, L.d[2] * w);
        const p0 = at(R0 * 0.6), pe = at(wNow); seg(L.base, p0, pe); L._s = p0[3] > 60 && pe[3] > 60 ? [p0, pe] : null; L._w = wNow;
        L.spans.forEach(spn => { const a = Math.min(spn.a, wNow), b = Math.min(spn.b, wNow); if (b - a < 0.5) { spn.el.setAttribute("visibility", "hidden"); return; }
          const p = at(a), q = at(b); if (seg(spn.el, p, q)) spn.el.setAttribute("stroke-width", fx(cl(3.6 * (p[2] + q[2]) / 2 / U, 2, 6.5))); });
        L.ms.forEach(o => { o.arrow.setAttribute("visibility", "hidden"); if (o.m.w > wNow + 0.5) { o.mg.setAttribute("visibility", "hidden"); o.top = null; return; }
          const pop = s.anim ? ease(cl((wFront - o.m.w) / 60, 0, 1)) : 1, ph = o.ph, hrx = 0;
          const x = L.d[0] * o.m.w + (L.n1[0] * Math.cos(ph) + L.n2[0] * Math.sin(ph)) * hrx, y = L.d[1] * o.m.w + (L.n1[1] * Math.cos(ph) + L.n2[1] * Math.sin(ph)) * hrx, z = L.d[2] * o.m.w + (L.n1[2] * Math.cos(ph) + L.n2[2] * Math.sin(ph)) * hrx;
          const p = pj(x, y, z); if (p[3] < 60) { o.mg.setAttribute("visibility", "hidden"); o.top = null; return; } o.mg.removeAttribute("visibility");
          // a circle lights up only while the reader hovers a time period that it covers (s.hotP, set by the readout below)
          const hp = s.hotP, d0 = o.m.d[0], d1 = o.m.d[1], want = hp && ((d0 < hp[1] && d1 > hp[0]) || (d0 === d1 && d0 >= hp[0] && d0 <= hp[1]) || (hp[0] === hp[1] && d0 <= hp[0] && hp[0] <= d1)) ? 1 : 0;
          o.hz = (o.hz || 0) + (want - (o.hz || 0)) * (REDUCED ? 1 : Math.min(1, dt * 9)); if ((o.hz > 0.5) !== !!o.hot) { o.hot = o.hz > 0.5; o.mg.classList.toggle("hot", o.hot); }
          const isSel = so === o; if (isSel !== !!o.sel) { o.sel = isSel; o.mg.classList.toggle("sel", isSel); }   // a picked circle: ringed in ink, a little larger
          const r = cl((1.8 + 3.4 * o.sz) * p[2] / U, 1.5, 6.5) * pop * (1 + 0.45 * o.hz) * (o.sel ? 1.3 : 1); o.top = p; o.r = r; o.z = p[3];
          [o.halo, o.dot, o.hit].forEach((e, j) => { e.setAttribute("cx", fx(p[0])); e.setAttribute("cy", fx(p[1])); e.setAttribute("r", fx(j === 0 ? r * 2.6 : j === 2 ? r + 6 : r)); });
          const bl = 0;
          if (bl !== o.blur) { o.blur = bl; if (bl) o.mg.setAttribute("filter", "url(#rd-b" + bl + ")"); else o.mg.removeAttribute("filter"); }
          o.mg.style.setProperty("--fog", cl(1.25 - (p[3] - D) / (RMAX * 1.8), 0.35, 1).toFixed(2)); all.push(o);
          { const k0 = R0 * 0.36 / (Math.hypot(x, y, z) || 1), ps = pj(x * k0, y * k0, z * k0); if (ps[3] > 60) { const vx = p[0] - ps[0], vy = p[1] - ps[1], len = Math.hypot(vx, vy), L2 = len - r - 6;
            if (L2 > 10) { const ux = vx / len, uy = vy / len, ph2 = (t * 0.16 + o.ph * 0.173) % 1, gg = REDUCED ? pop : ease(Math.min(1, ph2 / 0.4)) * pop;
              o.arrow.removeAttribute("visibility"); o.arrow.setAttribute("x1", fx(ps[0])); o.arrow.setAttribute("y1", fx(ps[1])); o.arrow.setAttribute("x2", fx(ps[0] + ux * L2 * gg)); o.arrow.setAttribute("y2", fx(ps[1] + uy * L2 * gg));
              o.arrow.style.opacity = (REDUCED ? 0.3 : ph2 < 0.8 ? 0.34 : 0.34 * (1 - (ph2 - 0.8) / 0.2)).toFixed(2); } } }
        });
        // card at the far end of each record
        const ne = at(L.wEnd * 1.04), ux0 = ne[0] - hb[0], uy0 = ne[1] - hb[1], dl = Math.hypot(ux0, uy0) || 1, ux = ux0 / dl, uy = uy0 / dl;
        L._b = { L, x: ne[0] + ux * 30 - (ux < 0 ? L.cw : 0), y: ne[1] + uy * 30 - 23, w: L.cw, ux, uy, ne, vis: ne[3] > 60,
          op: (s.anim ? cl((t - 2 - L.ci * 0.18) / 0.6, 0, 1) : 1) * cl(1.3 - (ne[3] - D) / (RMAX * 2), 0.45, 1) };
      });
      // cards: keep inside the safe area (clear of the page edges, the pop-up and the year readout) and push overlapping ones apart
      const cards = s.lines.map(L => L._b).filter(b => b.vis), yMin = s.pt + 6, yMax = s.H - 60;
      cards.forEach(b => { const bb = b.L._bb; if (bb) b.w = Math.max(b.w, bb.x + bb.width); });   // a name's measured width, once known (its letter-spaced capitals run past the estimate)
      const keep = b => { b.x = cl(b.x, 16, s.W - b.w - 16); b.y = cl(b.y, yMin, yMax - 46);
        if (inCv(b.x, b.y, b.w, 46)) { if (cv.side === "right") b.x = Math.max(16, cv.x - b.w - 16); else b.y = cv.y - 52; }
        if (ctl && b.x < ctl.x + ctl.w + 8 && ctl.x - 8 < b.x + b.w && b.y + 46 > ctl.y - 6) b.y = ctl.y - 52; };
      // the teeth at the centre: a circle around the hub, roughly the height of the molar on screen
      const tTop = pj(0, 170, 0), tR = Math.max(60, Math.hypot(tTop[0] - hb[0], tTop[1] - hb[1]) * 1.15);
      const onTooth = b => { const nx = cl(hb[0], b.x - 6, b.x + b.w + 6), ny = cl(hb[1], b.y - 6, b.y + 52); return Math.hypot(nx - hb[0], ny - hb[1]) < tR; };
      // re-anchor each name beside its own line's far end, on the outside, before resolving collisions
      cards.forEach(b => { b.x = b.ne[0] + b.ux * 18 - (b.ux < 0 ? b.w : 0); b.y = b.ne[1] + b.uy * 18 - 23; });
      for (let it = 0; it < 24; it++) {
        cards.forEach(keep);
        cards.sort((a, b) => a.y - b.y);
        for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) { const a = cards[i], c = cards[j];
          if (a.x < c.x + c.w + 10 && c.x < a.x + a.w + 10 && a.y < c.y + 54 && c.y < a.y + 54) { const push = (a.y + 54 - c.y) / 2 + 0.5; a.y -= push; c.y += push; } }
        // keep cards off the other records' lines and marks
        cards.forEach(b => { const hits = s.lines.some(L2 => { if (L2 === b.L || !L2._s) return false; const [a1, a2] = L2._s; for (let k = 0; k <= 16; k++) { const qx = a1[0] + (a2[0] - a1[0]) * k / 16, qy = a1[1] + (a2[1] - a1[1]) * k / 16; if (qx > b.x - 6 && qx < b.x + b.w + 6 && qy > b.y - 6 && qy < b.y + 52) return true; } return false; })
          || all.some(o => o.c !== b.L.c && o.top && o.top[0] > b.x - 8 && o.top[0] < b.x + b.w + 8 && o.top[1] > b.y - 8 && o.top[1] < b.y + 54);
          if (hits || onTooth(b)) { b.x += b.ux * 14; b.y += b.uy * 14; }
          // its own line: a name pushed back against the page edge can land on it; step sideways, off the line
          const own = b.L._s; if (own) { const [a1, a2] = own; let on = false;
            for (let k = 0; k <= 20; k++) { const qx = a1[0] + (a2[0] - a1[0]) * k / 20, qy = a1[1] + (a2[1] - a1[1]) * k / 20; if (qx > b.x - 6 && qx < b.x + b.w + 6 && qy > b.y - 4 && qy < b.y + 44) { on = true; break; } }
            if (on) { let nx = -b.uy, ny = b.ux; if (ny * (b.uy >= 0 ? 1 : -1) < 0) { nx = -nx; ny = -ny; } b.x += nx * 14; b.y += ny * 14; } }
          // the year readout at the bottom left of the page
          if (b.y + 46 > s.H - 84 && b.x < 230) b.x += 14;
        });
      }
      cards.forEach(keep);   // the last pushes, too, stay on the page and clear of the pop-up
      s.lines.forEach(L => { const b = L._b;
        if (!b.vis) { L.card.style.opacity = 0; L.lead.setAttribute("visibility", "hidden"); return; }
        L.card.setAttribute("transform", "translate(" + fx(b.x) + "," + fx(b.y) + ")"); L.card.style.opacity = b.op.toFixed(2);
        seg(L.lead, b.ne, [b.ux < 0 ? b.x + b.w : b.x, b.y + 23, 1, b.ne[3]]); L.lead.style.opacity = L.card.style.opacity; });
      // the clicked period's years, in a box beside its circle: right of it, else left, below or above, whichever is first
      // clear of the names, the pop-up, the buttons, the timeline's handle and the page's edges; hidden if none is, or while its circle is hovered (the
      // readout says the same) or under the pop-up
      const pinB = [], P = s.pin, o0 = so; let pinAt = null;
      if (o0 && o0.top && s.read !== o0 && !inCv(o0.top[0] - o0.r, o0.top[1] - o0.r, 2 * o0.r, 2 * o0.r)) {
        if (P.o !== o0) { P.o = o0; P.t.textContent = range(o0.m.d[0], o0.m.d[1]); P.w = (P.t.getComputedTextLength() || 90) + 20; }
        const q = o0.top, r = o0.r, w = P.w, names = cards.map(b => { const bb = b.L._bb || (b.L._bb = b.L.card.getBBox()); return [b.x + bb.x, b.y + bb.y, bb.width, bb.height]; });
        pinAt = [[q[0] + r + 12, q[1] - 13, q[0] + r, q[1]], [q[0] - r - 12 - w, q[1] - 13, q[0] - r, q[1]], [q[0] - w / 2, q[1] + r + 10, q[0], q[1] + r], [q[0] - w / 2, q[1] - r - 36, q[0], q[1] - r]]
          .find(([x, y]) => x > 8 && x + w < s.W - 8 && y > 8 && y + 26 < s.H - 8 && !inCv(x, y, w, 26) && !(ctl && x - 6 < ctl.x + ctl.w && ctl.x < x + w + 6 && y - 6 < ctl.y + ctl.h && ctl.y < y + 32) && !(s.kxy && x - 14 < s.kxy[0] && s.kxy[0] < x + w + 14 && y - 12 < s.kxy[1] && s.kxy[1] < y + 38) && !names.some(n => x - 6 < n[0] + n[2] && n[0] < x + w + 6 && y - 4 < n[1] + n[3] && n[1] < y + 30)) || null; }
      if (!pinAt) P.g.classList.remove("on");
      else { const [x, y, ax, ay] = pinAt; pinB.push({ x, y, w: P.w, h: 26 });
        P.bx.setAttribute("x", fx(x)); P.bx.setAttribute("y", fx(y)); P.bx.setAttribute("width", fx(P.w)); P.t.setAttribute("x", fx(x + 10)); P.t.setAttribute("y", fx(y + 17.5));
        seg(P.ln, [ax, ay, 1, 999], [cl(ax, x, x + P.w), cl(ay, y, y + 26), 1, 999]); P.g.classList.add("on"); }
      { // shell labels: pick the ray, in screen space, that keeps them clear of every record line and mark; hide any that still collide
        const segs = s.lines.map(L => L._s).filter(Boolean), dts = all.map(o => o.top), cards2 = cards;
        const dseg = (q, a, b) => { const vx = b[0] - a[0], vy = b[1] - a[1], l2 = vx * vx + vy * vy || 1, u = cl(((q[0] - a[0]) * vx + (q[1] - a[1]) * vy) / l2, 0, 1); return Math.hypot(q[0] - a[0] - u * vx, q[1] - a[1] - u * vy); };
        const bad = q => { const c = [q[0] + 46, q[1] - 9]; return segs.some(sg => dseg(c, sg[0], sg[1]) < 24 || dseg([q[0] + 6, c[1]], sg[0], sg[1]) < 12 || dseg([q[0] + 86, c[1]], sg[0], sg[1]) < 12) || dts.some(d => Math.abs(d[0] - c[0]) < 56 && Math.abs(d[1] - c[1]) < 20) || cards2.some(b => c[0] + 52 > b.x && c[0] - 52 < b.x + b.w && c[1] + 12 > b.y && c[1] - 12 < b.y + 46)
          || c[0] - 44 < 4 || c[0] + 46 > s.W - 4 || inCv(c[0] - 52, c[1] - 12, 104, 24) || pinB.some(b => c[0] + 52 > b.x && c[0] - 52 < b.x + b.w && c[1] + 12 > b.y && c[1] - 12 < b.y + b.h); };
        let bestA = A0, bestN = 1e9;
        for (let n = 0; n < 36; n++) { const A = Ab + 0.5 + n / 36 * Math.PI * 2; let c = 0; s.shells.forEach(r => { const q = pj(r.w * Math.cos(A), 0, r.w * Math.sin(A)); if (q[3] > 60 && bad(q)) c++; }); if (c < bestN) { bestN = c; bestA = A; if (!c) break; } }
        let lp = null;
        s.shells.forEach(r => { const q = pj(r.w * Math.cos(bestA), 0, r.w * Math.sin(bestA)); r.lab.setAttribute("x", fx(q[0] + 6)); r.lab.setAttribute("y", fx(q[1] - 6));
          const ok = q[3] > 60 && !bad(q) && (lp == null || Math.abs(q[0] - lp[0]) > 90 || Math.abs(q[1] - lp[1]) > 15); if (ok) lp = q; r.lab.style.opacity = ok ? (appear * 0.85).toFixed(2) : 0; });
      }
      { // the timeline's year: just outside its knob, else the first other side of it (inside, below, above) that is clear of
        // the record names, the time-shell labels and the page's edges, since the reader can leave the knob anywhere; hidden if none is
        const L = s.wl, lab = s.waveLab;
        if (L) { if (lab._t !== lab.textContent) { lab._t = lab.textContent; lab._w = lab.getComputedTextLength() || 60; }
          // each name's real extent (its letter-spaced capitals can run past the estimated width), measured once per build
          const tw = lab._w, boxes = cards.map(b => { const bb = b.L._bb || (b.L._bb = b.L.card.getBBox()); return [b.x + bb.x, b.y + bb.y, bb.width, bb.height]; }).concat(s.shells.filter(r => +r.lab.style.opacity > 0.05).map(r => [+r.lab.getAttribute("x"), +r.lab.getAttribute("y") - 11, 92, 14])).concat(pinB.map(b => [b.x, b.y, b.w, b.h])).concat(cv ? [[cv.x, cv.y, cv.w, cv.h]] : []);
          const pick = [[L.nx, L.ny], [-L.nx, -L.ny], [0, 1], [0, -1]].map(([dx, dy]) => {
            const x = L.q[0] + dx * 20, y = L.q[1] + dy * 20 + 4 + (dy > 0.35 ? 6 : 0), anchor = dx > 0.35 ? "start" : dx < -0.35 ? "end" : "middle", x0 = anchor === "start" ? x : anchor === "end" ? x - tw : x - tw / 2;
            return { x, y, anchor, clear: x0 > 4 && x0 + tw < s.W - 4 && y > 16 && y < s.H - 6 && !boxes.some(b => x0 - 4 < b[0] + b[2] && b[0] < x0 + tw + 4 && y - 15 < b[1] + b[3] && b[1] < y + 5) }; }).find(c => c.clear);
          if (pick) { lab.setAttribute("x", fx(pick.x)); lab.setAttribute("y", fx(pick.y)); lab.setAttribute("text-anchor", pick.anchor); }
          lab.style.opacity = pick ? L.op.toFixed(2) : 0; }
      }
      { // the legend beside a hovered (or focused) name, in empty space: never over the molar and what hangs about it (the
        // worn-away cloud above, the pathogens' ways in below, the metals), the record lines, their circles, the names and
        // labels, the metals' streams, the timeline's knob and year, the pop-up, or the page's readout and buttons; it may lie over the sphere's rings. It
        // keeps its place beside its name while that stays clear, and moves only when the tooth or the camera brings
        // something under it: then to the nearest clear place, trying rings of places further and further from the name.
        const key = s.leg, L = key && s.lines.find(L2 => L2.c.key === key), b = L && L._b, lg = key && s.LEG[key];
        if (lg && b && b.vis) {
          if (s.legKey !== key) { s.legKey = key; s.legRel = null; s.lgT.textContent = lg.title; while (s.lgRows.firstChild) s.lgRows.firstChild.remove();
            lg.rows.forEach(([col, txt, , sub]) => { const rg = el("g", {}, s.lgRows); el("circle", { class: "rd-lsw", r: 5, style: "fill:" + col }, rg); el("text", { class: "rd-ct rd-lrow" }, rg).textContent = txt;
              if (sub) el("text", { class: "rd-ct rd-lsub" }, rg).textContent = sub; });
            s.lgW = Math.max(s.lgT.getComputedTextLength(), ...[...s.lgRows.querySelectorAll("text")].map(t => t.getComputedTextLength() + 16)) + 20;
            s.lgH = 30 + lg.rows.reduce((a2, r) => a2 + (r[3] ? 35 : 19), 0); }
          const bb = L._bb || (L._bb = L.card.getBBox()), cx0 = b.x + bb.x, cy0 = b.y + bb.y, cw = bb.width, ch = bb.height, h = s.lgH, w = s.lgW;
          // what it keeps clear of, as screen rectangles [x0, y0, x1, y1], points with a radius, and segments
          // (boxes carry a weight: the molar and the streams count most if the legend must cover something; hard boxes it never covers)
          const boxes = [], hard = [], dots = [], segs2 = s.lines.map(L2 => L2._s).filter(Boolean);
          // the molar and what hangs about it: bands round its axis, from the pathogens' ways in to the top of the cloud
          const RINGS = [[-295, 220], [-150, 215], [0, 135], [150, 135], [300, 145]], ring = (y, r) => Array.from({ length: 12 }, (_, i) => pj(r * Math.cos(i * Math.PI / 6), y, r * Math.sin(i * Math.PI / 6)));
          const rp = RINGS.map(([y, r]) => ring(y, r));
          for (let i = 0; i < rp.length - 1; i++) { const q = rp[i].concat(rp[i + 1]).filter(v => v[3] > 60); if (!q.length) continue;
            boxes.push([Math.min(...q.map(v => v[0])), Math.min(...q.map(v => v[1])), Math.max(...q.map(v => v[0])), Math.max(...q.map(v => v[1])), 4]); }
          // the metals' two streams beside the tooth, while they flow: each side's lanes, through the camera-facing frame they turn in
          if (GLT && GLT.met && GLT.met.want && GLT.met.want.some(v => v > 0)) { const mg2 = GLT.met.mgrp, cy2 = Math.cos(mg2.rotation.y), sy2 = Math.sin(mg2.rotation.y);
            [0, 1].forEach(g2 => { const q = []; GLT.met.lanes.forEach(pa => { if (pa.g !== g2) return; for (let i = 0; i < pa.P.length / 3; i += 4) { const lx = pa.P[3 * i], ly = pa.P[3 * i + 1], lz = pa.P[3 * i + 2];
              const v = pj(lx * cy2 + lz * sy2, ly + mg2.position.y, -lx * sy2 + lz * cy2); if (v[3] > 60) q.push(v); } });
              if (q.length) boxes.push([Math.min(...q.map(v => v[0])) - 8, Math.min(...q.map(v => v[1])) - 8, Math.max(...q.map(v => v[0])) + 8, Math.max(...q.map(v => v[1])) + 8, 4]); }); }
          cards.forEach(b2 => { if (!b2.vis) return; const k2 = b2.L._bb || (b2.L._bb = b2.L.card.getBBox()); boxes.push([b2.x + k2.x, b2.y + k2.y, b2.x + k2.x + k2.width, b2.y + k2.y + k2.height]); });
          s.shells.forEach(r => { if (+r.lab.style.opacity > 0.05) { const x = +r.lab.getAttribute("x"), y = +r.lab.getAttribute("y"); boxes.push([x, y - 12, x + 96, y + 3]); } });
          if (+s.waveLab.style.opacity > 0.05) { const k2 = s.waveLab.getBBox(); boxes.push([k2.x, k2.y, k2.x + k2.width, k2.y + k2.height]); }
          if (s.kxy) dots.push([s.kxy[0], s.kxy[1], 18]);
          all.forEach(o => { if (o.top && o.mg.getAttribute("visibility") !== "hidden") dots.push([o.top[0], o.top[1], (o.r || 3) + 5]); });
          hard.push([0, s.H - 58, 170, s.H]);   // the year readout
          if (ctl) hard.push([ctl.x, ctl.y, ctl.x + ctl.w, ctl.y + ctl.h]); else hard.push([s.W - 160, s.H - 120, s.W, s.H]);   // Pause and Replay
          if (cv) hard.push([cv.x, cv.y, cv.x + cv.w, cv.y + cv.h]);   // the time period's pop-up, while it is open
          // what a place would cover: 0 when clear; never off the page or over a hard box
          const M = 6, cost = (x, y) => { if (x < 8 || y < 8 || x + w > s.W - 8 || y + h > s.H - 8) return Infinity; const X0 = x - M, Y0 = y - M, X1 = x + w + M, Y1 = y + h + M;
            if (hard.some(q => q[0] < X1 && X0 < q[2] && q[1] < Y1 && Y0 < q[3])) return Infinity;
            let c = 0; boxes.forEach(q => { const ox = Math.min(X1, q[2]) - Math.max(X0, q[0]), oy = Math.min(Y1, q[3]) - Math.max(Y0, q[1]); if (ox > 0 && oy > 0) c += ox * oy * (q[4] || 1); });
            dots.forEach(d => { const nx = cl(d[0], X0, X1), ny = cl(d[1], Y0, Y1); if (Math.hypot(nx - d[0], ny - d[1]) < d[2]) c += 150; });
            segs2.forEach(([a1, a2]) => { for (let k = 0; k <= 24; k++) { const qx = a1[0] + (a2[0] - a1[0]) * k / 24, qy = a1[1] + (a2[1] - a1[1]) * k / 24; if (qx > X0 && qx < X1 && qy > Y0 && qy < Y1) c += 40; } });
            return c; }, clear = (x, y) => cost(x, y) === 0;
          // keep the last place, relative to the name, while it is clear (or, where nothing was, no worse); else search outwards
          const kept = s.legRel ? cost(cx0 + s.legRel[0], cy0 + s.legRel[1]) : Infinity;
          let pos = kept <= (s.legCost || 0) * 1.25 ? [cx0 + s.legRel[0], cy0 + s.legRel[1]] : null;
          if (!pos) { s.legCost = 0;
            const mx = cx0 + cw / 2, my = cy0 + ch / 2;
            search: for (const d of [16, 44, 80, 125, 180, 240, 310, 390]) {
              const cand = [[cx0 + cw + d, my - h / 2], [cx0 - d - w, my - h / 2], [cx0 + cw + d, cy0 - 4], [cx0 - d - w, cy0 - 4], [cx0 + cw + d, cy0 + ch - h + 4], [cx0 - d - w, cy0 + ch - h + 4],
                [mx - w / 2, cy0 + ch + d], [mx - w / 2, cy0 - d - h], [cx0, cy0 + ch + d], [cx0, cy0 - d - h], [cx0 + cw - w, cy0 + ch + d], [cx0 + cw - w, cy0 - d - h],
                [cx0 + cw + d * 0.7, cy0 + ch + d * 0.7], [cx0 + cw + d * 0.7, cy0 - h - d * 0.7], [cx0 - w - d * 0.7, cy0 + ch + d * 0.7], [cx0 - w - d * 0.7, cy0 - h - d * 0.7]];
              for (const [x, y] of cand) if (clear(x, y)) { pos = [x, y]; break search; } }
            // none of those clear: the clear place on the whole page nearest the name
            if (!pos) { let best = 1e9; for (let gy = 8; gy <= s.H - h - 8; gy += 18) for (let gx = 8; gx <= s.W - w - 8; gx += 18) {
              const dd = Math.hypot(gx + w / 2 - mx, gy + h / 2 - my); if (dd < best && clear(gx, gy)) { best = dd; pos = [gx, gy]; } } }
            // nowhere clear at all (zoomed far in, or the pop-up open on a small page): the place on the page that covers least,
            // the molar and the streams counting most, never the pop-up or the buttons
            if (!pos) { let best = Infinity; for (let gy = 8; gy <= s.H - h - 8; gy += 18) for (let gx = 8; gx <= s.W - w - 8; gx += 18) {
              const c = cost(gx, gy); if (c === Infinity) continue; const sc3 = c + 0.5 * Math.hypot(gx + w / 2 - mx, gy + h / 2 - my); if (sc3 < best) { best = sc3; pos = [gx, gy]; s.legCost = c; } } }
            if (!pos) pos = [cl(cx0 + cw + 16, 8, s.W - 8 - w), cl(my - h / 2, 8, s.H - 8 - h)];
            s.legRel = [pos[0] - cx0, pos[1] - cy0];
          }
          const [x, y] = pos;
          s.lgBg.setAttribute("x", fx(x)); s.lgBg.setAttribute("y", fx(y)); s.lgBg.setAttribute("width", fx(w)); s.lgBg.setAttribute("height", fx(h));
          s.lgT.setAttribute("x", fx(x + 10)); s.lgT.setAttribute("y", fx(y + 20));
          { let ry = y + 20; [...s.lgRows.children].forEach(rg => { ry += 19; const [c0, t0, t1] = rg.children;
            c0.setAttribute("cx", fx(x + 15)); c0.setAttribute("cy", fx(ry - 4)); t0.setAttribute("x", fx(x + 26)); t0.setAttribute("y", fx(ry));
            if (t1) { ry += 16; t1.setAttribute("x", fx(x + 26)); t1.setAttribute("y", fx(ry)); } }); }
          // the leader: from the name's box to the legend's, between their nearest points
          const lx = cl(x + w / 2, cx0, cx0 + cw), ly = cl(y + h / 2, cy0, cy0 + ch), gx = cl(lx, x, x + w), gy = cl(ly, y, y + h);
          // drawn only while the legend is close to its name: a long leader would cross the drawing it keeps clear of
          s.lgLine.setAttribute("x1", fx(lx)); s.lgLine.setAttribute("y1", fx(ly)); s.lgLine.setAttribute("x2", fx(gx)); s.lgLine.setAttribute("y2", fx(gy)); s.lgLine.style.opacity = Math.hypot(gx - lx, gy - ly) < 56 ? 1 : 0;
          s.gLeg.classList.add("on");
        } else { s.gLeg.classList.remove("on"); s.legRel = null; } }
      all.sort((a, b) => b.z - a.z).forEach(o => (o.z > hubZ ? s.gBack : s.gFront).appendChild(o.mg));
      // a circle hovered by the pointer is let go once the pointer is off it: the circles are re-stacked by depth every frame
      // (above), and moving a hovered node can swallow the browser's mouseleave, leaving its tooltip up and the rest dimmed
      if (s.read && s.read.byPtr && (!ptr.in || !s.read.top || Math.hypot(ptr.x - s.read.top[0], ptr.y - s.read.top[1]) > s.read.r + 6)) s.read.off();
      const o = s.read;
      if (o && o.top) {
        s.rYr.textContent = range(o.m.d[0], o.m.d[1]); s.rCt.textContent = amount(o.c, o.m.d) + (o.c.key === "caries" && CR[o.mi] ? " · " + CR[o.mi].std.toFixed(1) + "% with caries" : "") + (o.c.key === "wear" && wearOf(o.mi) != null ? " · wear to Smith stage " + wearOf(o.mi).toFixed(1) : "") + (o.c.key === "metals" && MD.lead && MD.lead[o.mi] != null ? " · lead " + MD.lead[o.mi] + " ppm" : "") + (o.c.key === "pathogens" ? topPathogen(o.mi) : "");
        const lh = o.c.key === "wear" && LR[o.mi]; s.rLa.textContent = lh ? LR[o.mi].any.toFixed(1) + "% with a stress line" : ""; s.rLb.textContent = lh ? " · " + LR[o.mi].multi.toFixed(1) + "% with two or more" : "";
        // the side with room for the text, measured (the caries and wear readouts run long); if neither side has room,
        // the right, pulled back inside the page
        const tw = Math.max(s.rYr.getComputedTextLength(), s.rCt.getComputedTextLength(), lh ? s.rLh.getComputedTextLength() : 0) + 22, room = cv && cv.side === "right" && o.top[1] > cv.y - 70 && o.top[1] < cv.y + cv.h + 20 ? cv.x - 8 : s.W - 8, xr = o.top[0] + o.r + 14, xl = o.top[0] - o.r - 14;
        const left = xr + tw > room && xl - tw >= 8, x = left ? xl : Math.min(xr, room - tw), y = o.top[1] - o.r - 10;
        s.rLine.setAttribute("x1", fx(o.top[0] + (left ? -o.r : o.r))); s.rLine.setAttribute("y1", fx(o.top[1])); s.rLine.setAttribute("x2", fx(x)); s.rLine.setAttribute("y2", fx(y));
        [[s.rYr, 0], [s.rCt, 17], [s.rLh, 34]].forEach(([e, d]) => { e.setAttribute("x", fx(x + (left ? -4 : 4))); e.setAttribute("y", fx(y + d)); e.setAttribute("text-anchor", left ? "end" : "start"); });
        { const b1 = s.rYr.getBBox(), b2 = s.rCt.getBBox(), x0 = Math.min(b1.x, b2.x) - 9, y0 = b1.y - 6, b3 = lh ? s.rLh.getBBox() : b2, x1 = Math.max(b1.x + b1.width, b2.x + b2.width, b3.x + b3.width) + 9, y1 = b3.y + b3.height + 6; s.rBg.setAttribute("x", fx(x0)); s.rBg.setAttribute("y", fx(y0)); s.rBg.setAttribute("width", fx(x1 - x0)); s.rBg.setAttribute("height", fx(y1 - y0)); }
        s.gRead.classList.add("on"); } else s.gRead.classList.remove("on");
      // year readout: a hovered circle gives its start year; otherwise the nearest record line within 14 px gives the
      // year at that point, read back off the square-root scale and rounded to 10 years (never past the line's own span)
      let hy = null, hc = null;
      if (ring.hover || ringDrag) { hy = s.ringY; hc = "var(--dentine-ink)"; }   // the timeline's knob: the ring's year
      else if (s.read) { hy = s.read.m.d[0]; hc = s.read.col; }
      else if (ptr.in && !dragging) { let best = 14;
        s.lines.forEach(L => { const wN = L._w || R0, N = 60; if (wN - R0 < 1) return; let q0 = null, w0 = R0;
          for (let k = 0; k <= N; k++) { const w = R0 + (wN - R0) * k / N, q = pj(L.d[0] * w, L.d[1] * w, L.d[2] * w); if (q[3] < 60) { q0 = null; continue; }
            if (q0) { const vx = q[0] - q0[0], vy = q[1] - q0[1], u = cl(((ptr.x - q0[0]) * vx + (ptr.y - q0[1]) * vy) / (vx * vx + vy * vy || 1), 0, 1), dd = Math.hypot(ptr.x - q0[0] - u * vx, ptr.y - q0[1] - u * vy);
              if (dd < best) { best = dd; const age = Math.pow((w0 + u * (w - w0) - R0) / (RMAX - R0), 2) * MAX_AGE; hy = cl(Math.round((NOW - age) / 10) * 10, L.c.segs[0][0], NOW); hc = L.col; } }
            q0 = q; w0 = w; } }); }
      if (hy == null) hud.style.opacity = 0; else { hud.textContent = yr(hy); hud.style.color = hc; hud.style.opacity = 1; }
      // the time period the reader is hovering, which lights the circles that cover it on every line (in the next frame):
      // a hovered circle's own years, or the single year under the pointer on a line or at the timeline's knob
      s.hotP = s.read && !(ring.hover || ringDrag) ? [s.read.m.d[0], s.read.m.d[1]] : hy == null ? null : [hy, hy];
    }

    // dragging the timeline's knob: the pointer's ray meets the ring's plane (y = 0); its angle there places the knob and
    // its distance from the hub the year. Above the horizon, the ray's own direction sets the angle at the oldest year.
    function toRing(e) {
      const s = S; if (!s || !s.cb) return; const hr = host.getBoundingClientRect(), { pos, fw, rt, up } = s.cb;
      const kx = (e.clientX - hr.left - s.C[0]) / s.F, ky = -(e.clientY - hr.top - s.C[1]) / s.F, d = [0, 1, 2].map(i => fw[i] + rt[i] * kx + up[i] * ky), k = -pos[1] / d[1];
      const hit = k > 0 && isFinite(k), x = hit ? pos[0] + d[0] * k : d[0], z = hit ? pos[2] + d[2] * k : d[2];
      ring.a = Math.atan2(z, x); ring.moved = ring.touched = true; waveU = hit ? 1 - cl((Math.hypot(x, z) - R0) / (RMAX - R0), 0, 1) : 0;
    }
    host.addEventListener("pointerdown", e => { if (e.target.closest && e.target.closest(".rd-card,.rd-hit,.rd-grip")) return; dragging = true; px = e.clientX; py = e.clientY; try { host.setPointerCapture(e.pointerId); } catch (_) {} host.classList.add("grab"); lastInput = performance.now(); });
    host.addEventListener("pointermove", e => { const hr = host.getBoundingClientRect(); ptr.x = e.clientX - hr.left; ptr.y = e.clientY - hr.top; ptr.in = true; if (ringDrag) { toRing(e); lastInput = performance.now(); return; }
      if (!dragging) { ring.hover = !!(S && S.kxy) && Math.hypot(ptr.x - S.kxy[0], ptr.y - S.kxy[1]) < 16; return; } const dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY; cam.tYaw -= dx * 0.006; cam.tPitch = cl(cam.tPitch + dy * 0.005, -1.2, 1.35); lastInput = performance.now(); });
    const endDrag = () => { dragging = false; ringDrag = false; host.classList.remove("grab", "ringgrab"); };
    host.addEventListener("pointerup", endDrag); host.addEventListener("pointercancel", endDrag); host.addEventListener("pointerleave", () => { ptr.in = false; });
    host.addEventListener("wheel", e => { e.preventDefault(); cam.tDist = cl(cam.tDist * Math.exp(e.deltaY * 0.0011), 760, 3000); lastInput = performance.now(); }, { passive: false });
    host.addEventListener("dblclick", () => { cam.tYaw = HOME.yaw + Math.round((cam.yaw - HOME.yaw) / (Math.PI * 2)) * Math.PI * 2; cam.tPitch = HOME.pitch; cam.tDist = HOME.dist; lastInput = performance.now(); });

    build(!!opts.animate);
    raf = requestAnimationFrame(frame);
    return {
      resize() { const b = S ? S.born : 0, a = S && S.anim; build(a); if (S) S.born = b; },
      play(on) { setPlaying(on); },
      // the clicked period: select({ key, i }) sets it, select(null) lets it go; either way opts.onSelect hears
      select(q) { setSel(q ? [q.key, q.i] : null); },
      playing() { return playing; },
      state() { if (!S || !GLT) return null; let up = 0; for (let i = 0; i < GLT.lift.length; i++) up += GLT.lift[i] > 0.99 ? 1 : 0;
        return { era: S.car.era, period: CR[S.car.era] ? CR[S.car.era].p : null, share: +GLT.U.uOut.value.toFixed(3), target: +S.car.out.toFixed(3),
          wear: { era: S.wear.era, stage: wearOf(S.wear.era), lost: +S.wear.share.toFixed(3), plane: +GLT.U.uWearY.value.toFixed(1), top: +GLT.Ytop.toFixed(1), lifted: up }, leh: GLT.leh ? GLT.leh.reach() : null,
          metals: { era: S.met.era, period: MD.periods[S.met.era] ? MD.periods[S.met.era].p : null, values: (metalValues(S.met.era) || []).map(v => +v.toFixed(3)),
            groups: S.met.groups ? { nonindustrial: +S.met.groups[0].toFixed(3), industrial: +S.met.groups[1].toFixed(3) } : null,
            particles: GLT.met && GLT.met.want ? { nonindustrial: GLT.met.want[0], industrial: GLT.met.want[1] } : null, flying: GLT.met ? GLT.met.flying : null },
          pathogens: { era: S.pat.era, century: PLINE[S.pat.era] ? PLINE[S.pat.era][0] : null, flying: GLT.pat ? GLT.pat.active : 0, leaving: GLT.pat ? GLT.pat.leaving : 0,
            counts: Object.fromEntries((S.pat.counts || []).map((c, j) => [PD.taxa[j].name, c]).filter(e => e[1] > 0)),
            flyingByKind: GLT.pat ? GLT.pat.flyingByKind : null, byKind: GLT.pat && GLT.pat.byKind ? Object.fromEntries(GLT.pat.kinds.map((kk, j) => [kk, GLT.pat.byKind[j]])) : null } }; },
      // Replay mounts a fresh diagram: take the molar's canvas and its WebGL context with this one, or the old molar
      // stays behind as a frozen second tooth
      destroy() { cancelAnimationFrame(raf); if (svg) svg.remove(); svg = null; S = null; hud.remove(); sky.remove();
        if (GLT) { try { GLT.rd.dispose(); GLT.rd.forceContextLoss(); } catch (_) { /* ignore */ } GLT.tcv.remove(); GLT = null; } },
    };
  }

  window.ToothRadial = { mount, R0, RMAX, NOW };
})();
