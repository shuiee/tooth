"""
Build data/molar-nerve.js: the nerve strands inside the point-cloud molar (data/molar-cloud.js), for the pathogens.

The pulp's nerves run up each root canal from the root's tip, gather in the pulp chamber under the crown and branch
out under the cusps (the pulp horns), as in a cross section of a molar. This drawing follows the cloud's own anatomy:
  1. the two roots: their centre lines, traced up from each root's tip, slab by slab, as the middle of that root's
     points (two clusters, each step following the last), up to where the roots join (the furcation);
  2. from there each canal runs on, smoothly, to its opening in the floor of the pulp chamber, near the enamel-root
     junction, either side of the root trunk's middle;
  3. the cusps: the five highest points of the crown that are each the highest within 2 mm in plan; a pulp horn sits
     under each, at about half the crown's height, drawn in towards the tooth's axis;
  4. each canal carries a few twisted strands; every strand climbs its canal, crosses the chamber to one horn and
     there branches, twice or three times, into fine twigs fanning up and out under the roof of the chamber.
It is anatomy and a drawing rule, not data (the pathogens' amounts come from js/pathogens-data.js).

Output, in the cloud's units (1 = 10 mm; crown up, the enamel-root junction at y = 0): a list of segments, each a
polyline and the index of the segment it branches from (-1 for a strand's start at a root tip). A path from a root
tip to a twig's end is a leaf segment and its parents. Deterministic. Run:  python3 tools/build_molar_nerve.py
Needs numpy and scipy.
"""
import base64, json, os
import numpy as np
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
STRANDS = 4            # strands per canal
HORN_Y = 0.29          # pulp horns' height, as a share of the crown's height above the junction (the pulp's roof
ROOF = 0.33            #   sits low in the crown; ROOF caps every branch, below the heaviest wear drawn, 38% of the crown left)
HORN_IN = 0.5          # horns drawn in towards the axis: share of the cusp's distance from it
STEP = 0.02            # spacing of a polyline's points


def load():
    s = open(os.path.join(ROOT, "data", "molar-cloud.js")).read()
    j = json.loads(s[s.index("MOLAR_CLOUD=") + 12:s.rindex(";")])
    P = np.frombuffer(base64.b64decode(j["p"]), np.int16).reshape(-1, 3) / 32767 * j["s"]
    R = np.frombuffer(base64.b64decode(j["r"]), np.uint16)
    return j, P, R


def resample(pts, step=STEP):
    pts = np.asarray(pts, float); d = np.r_[0, np.cumsum(np.linalg.norm(np.diff(pts, axis=0), axis=1))]
    n = max(2, int(np.ceil(d[-1] / step)) + 1); u = np.linspace(0, d[-1], n)
    return np.c_[[np.interp(u, d, pts[:, k]) for k in range(3)]].T


def catmull(ctrl, per=12):
    c = np.asarray(ctrl, float); c = np.vstack([2 * c[0] - c[1], c, 2 * c[-1] - c[-2]]); out = []
    for i in range(1, len(c) - 2):
        p0, p1, p2, p3 = c[i - 1], c[i], c[i + 1], c[i + 2]
        for t in np.linspace(0, 1, per, endpoint=False):
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(c[-2]); return np.array(out)


def main():
    j, P, R = load(); root = R == 65535; crown = ~root; top = j["top"]
    rng = np.random.default_rng(11)
    # 1. the roots' centre lines, from the tips up to the furcation
    lowest = P[root][np.argsort(P[root][:, 1])]
    tipA = lowest[0]; far = np.linalg.norm(lowest[:, [0, 2]] - tipA[[0, 2]], axis=1) > 0.25
    tipB = lowest[far][0]
    Cc = np.array([tipA[[0, 2]], tipB[[0, 2]]]); y0 = max(tipA[1], tipB[1]) + 0.06
    lines = [[tipA], [tipB]]; fur = None
    for y in np.arange(y0, 0, 0.05):
        Q = P[root & (np.abs(P[:, 1] - y) < 0.05)][:, [0, 2]]; prev = Cc.copy()
        for _ in range(10):
            lab = np.argmin(((Q[:, None] - Cc[None]) ** 2).sum(2), 1)
            Cc = np.array([Q[lab == k].mean(0) if (lab == k).sum() > 3 else Cc[k] for k in range(2)])
        stepv = Cc - prev; nl = np.linalg.norm(stepv, axis=1, keepdims=True); Cc = prev + stepv * np.minimum(1, 0.07 / np.maximum(nl, 1e-9))
        # the roots have joined once the gap between their points closes: few root points between the two centres
        mid = (Cc[0] + Cc[1]) / 2; gap = (np.linalg.norm(Q - mid, axis=1) < 0.06).sum()
        if gap > 6 and fur is None: fur = y; break
        for k in range(2): lines[k].append(np.array([Cc[k][0], y, Cc[k][1]]))
    fur = fur if fur is not None else -0.5
    # 2. on to the openings in the chamber's floor, either side of the trunk's middle
    trunk = P[root & (np.abs(P[:, 1] + 0.05) < 0.05)][:, [0, 2]].mean(0)
    axis = Cc[1] - Cc[0]; axis /= np.linalg.norm(axis)
    floorY, chamberY = -0.02, 0.09
    canals = []
    for k, sgn in ((0, -1), (1, 1)):
        o = trunk + sgn * 0.17 * axis
        ctrl = [p for p in lines[k][::2]] + [np.array([o[0], (fur + floorY) / 2, o[1]]), np.array([o[0], floorY, o[1]])]
        canals.append(resample(catmull(ctrl)))
    # 3. the cusps and the horns under them
    Cr = P[crown]; t2 = cKDTree(Cr[:, [0, 2]])
    cand = [i for i in range(len(Cr)) if Cr[i, 1] > 0.55 and Cr[i, 1] >= Cr[t2.query_ball_point(Cr[i, [0, 2]], 0.2), 1].max() - 1e-9]
    cusps = Cr[sorted(cand, key=lambda i: -Cr[i, 1])[:5]]
    centre = P[crown & (np.abs(P[:, 1] - 0.3) < 0.05)][:, [0, 2]].mean(0)
    horns = np.array([[centre[0] + HORN_IN * (c[0] - centre[0]), top * HORN_Y, centre[1] + HORN_IN * (c[2] - centre[1])] for c in cusps])
    # 4. strands: twisted round each canal's line, across the chamber to a horn, then branching
    segs = []   # (polyline, parent)
    def add(poly, parent): segs.append((np.round(poly, 4), parent)); return len(segs) - 1
    # each canal's strands go to the horns nearest its side first
    side = np.array([np.dot(h[[0, 2]] - trunk, axis) for h in horns])
    order = [list(np.argsort(side)), list(np.argsort(-side))]
    for k, line in enumerate(canals):
        L = len(line); s = np.linspace(0, 1, L)
        # a frame round the canal's line
        tang = np.gradient(line, axis=0); tang /= np.linalg.norm(tang, axis=1, keepdims=True)
        ref = np.array([0, 0, 1.0]); n1 = np.cross(tang, ref); n1 /= np.linalg.norm(n1, axis=1, keepdims=True); n2 = np.cross(tang, n1)
        for f in range(STRANDS):
            ph = f / STRANDS * 2 * np.pi + rng.uniform(-0.3, 0.3); turns = rng.uniform(1.2, 2.2)
            rad = (0.012 + 0.03 * s ** 0.7) * (1 + 0.25 * np.sin(s * 9 + f))          # narrow at the tip, wider up the canal
            a = ph + turns * 2 * np.pi * s
            strand = line + (np.cos(a)[:, None] * n1 + np.sin(a)[:, None] * n2) * rad[:, None]
            h = horns[order[k][f % len(horns)]] if f < len(horns) else horns[order[k][0]]
            # across the chamber: rise to the chamber's middle height, then to the horn's base
            e = strand[-1]; mid = np.array([e[0] * 0.6 + h[0] * 0.4 + rng.normal(0, 0.03), chamberY, e[2] * 0.6 + h[2] * 0.4 + rng.normal(0, 0.03)])
            base = np.array([h[0] * 0.85 + centre[0] * 0.15, h[1] - 0.06, h[2] * 0.85 + centre[1] * 0.15])
            cross = resample(catmull([strand[-3], e, mid, base]))
            si = add(np.vstack([strand, cross[1:]]), -1)
            # branching under the horn
            def grow(parent, p0, d, length, depth):
                kids = 2 if depth < 2 else rng.integers(2, 4)
                for _ in range(kids):
                    dd = d + rng.normal(0, 0.55, 3); dd[1] = abs(dd[1]) * 0.45 + 0.1; dd /= np.linalg.norm(dd)
                    ln = length * rng.uniform(0.7, 1.15)
                    p1 = p0 + dd * ln
                    # keep under the chamber's roof and inside its walls
                    p1[1] = min(p1[1], top * ROOF - abs(rng.normal(0, 0.012))); r = np.hypot(p1[0] - centre[0], p1[2] - centre[1])
                    if r > 0.36: p1[[0, 2]] = centre + (p1[[0, 2]] - centre) * 0.36 / r
                    bend = (p0 + p1) / 2 + rng.normal(0, ln * 0.18, 3)
                    ci = add(resample(catmull([p0, bend, p1], 8), STEP * 0.75), parent)
                    if depth < 3: grow(ci, p1, dd, length * 0.62, depth + 1)
            out = h[[0, 2]] - centre; out = out / (np.linalg.norm(out) + 1e-9)
            grow(si, base, np.array([out[0] * 0.7, 1.0, out[1] * 0.7]), 0.1, 1)
    # pack: every point as int16 (times s / 32767), each segment's length and parent
    pts = np.vstack([p for p, _ in segs]); s = float(np.abs(pts).max())
    # the curves between control points can overshoot: hold every point under the roof
    pts[:, 1] = np.minimum(pts[:, 1], top * ROOF)
    out = dict(n=len(segs), s=s, len=[int(len(p)) for p, _ in segs], par=[int(q) for _, q in segs],
               p=base64.b64encode(np.round(pts / s * 32767).astype(np.int16).tobytes()).decode(),
               horns=np.round(horns, 3).tolist(), fur=round(float(fur), 3), roof=round(top * ROOF, 3))
    head = ("/* The nerve strands inside the point-cloud molar, for the pathogens. Generated by tools/build_molar_nerve.py from\n"
            "   data/molar-cloud.js (the roots traced from the cloud, the pulp horns under its five cusps). Do not edit by hand.\n"
            "   Anatomy and a drawing rule, not data. Segments: len = points in each; par = the segment it branches from (-1 at a\n"
            "   root tip); p = base64 int16 x, y, z per point (times s / 32767), in the cloud's units (1 = 10 mm). */\n")
    path = os.path.join(ROOT, "data", "molar-nerve.js")
    open(path, "w").write(head + "window.MOLAR_NERVE=" + json.dumps(out, separators=(",", ":")) + ";\n")
    print(path, round(os.path.getsize(path) / 1024), "KB ·", len(segs), "segments ·", len(pts), "points · furcation at", round(float(fur), 2))
    return segs, P, R


if __name__ == "__main__":
    main()
