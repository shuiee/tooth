"""
Build data/molar-cloud.js: the point cloud of the first molar drawn at the centre of the radial timeline.

Source: the team's sculpted lower first molar, mandibular-first-molar.zip (ZBrush OBJ + colour map), from
shuiee/tooth-untold, source/teeth models/. The steps:
  1. read the mesh and its colour map, and mark enamel (the white crown) against root per vertex;
  2. orient it: crown up (+y), widest horizontal axis on x, the cement-enamel junction at y = 0
     (the same steps as tooth-untold's build_models.py, whose parse_obj, enamel_mask and orient are copied here);
  3. sample the surface, denser where it bends most (how sharply the normal turns across each triangle), so the
     cusps, ridges and fissures of the crown carry more points than the smooth root;
  4. order the crown for decay: occlusal caries starts in the fissures and pits and spreads over the chewing surface,
     then down the sides of the crown. Each crown point gets its rank in that order as a share of the crown's area
     (0 = first to decay, 1 = last), so "a share F of the crown is carious" is the points with rank < F;
  5. link each crown point to its nearest crown neighbours, for the faint mesh drawn over carious points.

The decay order is anatomy and a drawing rule, not data; the share of the crown it covers is set from the data
in js/caries-data.js. Run:  python3 tools/build_molar_cloud.py [path to mandibular-first-molar.zip]
Needs numpy, scipy and pillow.
"""
import base64, io, json, os, sys, tempfile, zipfile
import numpy as np
from PIL import Image
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DEFAULT_SRC = os.path.join(ROOT, "..", "tooth-untold", "source", "teeth models", "mandibular-first-molar.zip")
LENGTH_MM, CROWN_MM = 21.5, 7.5          # typical lower first molar: total length and crown height
N_POINTS = 16000                         # points in the cloud
K_LINK = 4                               # neighbours linked per crown point
Image.MAX_IMAGE_PIXELS = None


def read_zip(path):
    """Return (obj text, colour texture) from the nested Sketchfab/ZBrush zip."""
    tmp = tempfile.mkdtemp()
    with zipfile.ZipFile(path) as z: z.extractall(tmp)
    for _ in range(3):
        for root, _, files in os.walk(tmp):
            for f in files:
                if f.lower().endswith(".zip"):
                    p = os.path.join(root, f)
                    with zipfile.ZipFile(p) as z: z.extractall(root)
                    os.remove(p)
    objs, texs = [], []
    for root, _, files in os.walk(tmp):
        for f in files:
            p = os.path.join(root, f)
            if f.lower().endswith(".obj"): objs.append(p)
            if f.lower().endswith(".png") and "NM" not in f: texs.append(p)
    return open(objs[0]).read(), Image.open(texs[0]).convert("RGB")


# ---- copied from tooth-untold build_models.py -------------------------------------------------------------------
def parse_obj(txt):
    V, VT, F, FT = [], [], [], []
    for line in txt.splitlines():
        if line.startswith("v "): V.append([float(x) for x in line.split()[1:4]])
        elif line.startswith("vt "): VT.append([float(x) for x in line.split()[1:3]])
        elif line.startswith("f "):
            parts = [t.split("/") for t in line.split()[1:]]
            vi = [int(p[0]) - 1 for p in parts]
            ti = [int(p[1]) - 1 if len(p) > 1 and p[1] else -1 for p in parts]
            for i in range(1, len(vi) - 1):
                F.append([vi[0], vi[i], vi[i + 1]]); FT.append([ti[0], ti[i], ti[i + 1]])
    return np.array(V), np.array(VT), np.array(F), np.array(FT)


def enamel_mask(V, VT, F, FT, tex):
    arr = np.asarray(tex).astype(np.float32)
    H, W = arr.shape[:2]
    acc = np.zeros(len(V)); cnt = np.zeros(len(V))
    uv = VT[FT.reshape(-1)]
    px = np.clip((uv[:, 0] % 1) * (W - 1), 0, W - 1).astype(int)
    py = np.clip((1 - uv[:, 1] % 1) * (H - 1), 0, H - 1).astype(int)
    col = arr[py, px]
    score = (col[:, 2] / np.maximum(col[:, 0], 1)) > 0.9
    np.add.at(acc, F.reshape(-1), score.astype(float)); np.add.at(cnt, F.reshape(-1), 1)
    return acc / np.maximum(cnt, 1)


def orient(V, mask, length_mm, crown_mm):
    ys = V[:, 1]
    if V[mask > 0.5, 1].mean() < ys.mean():
        V = V * np.array([1, -1, -1])
    c = V[mask > 0.5][:, [0, 2]].mean(0)
    V = V - np.array([c[0], 0, c[1]])
    xz = V[:, [0, 2]] - V[:, [0, 2]].mean(0)
    ev, evec = np.linalg.eigh(np.cov(xz.T)); a = evec[:, 1]
    ang = np.arctan2(a[1], a[0])
    R = np.array([[np.cos(ang), 0, np.sin(ang)], [0, 1, 0], [-np.sin(ang), 0, np.cos(ang)]])
    V = V @ R
    ys = V[:, 1]; edges = np.arange(ys.max(), ys.min(), -0.01)
    cej = edges[-1]
    for hi_, lo_ in zip(edges[:-1], edges[1:]):
        sel = (ys <= hi_) & (ys > lo_)
        if sel.sum() > 20 and mask[sel].mean() < 0.5: cej = hi_; break
    V[:, 1] -= cej
    s = (length_mm / 10.0) / (V[:, 1].max() - V[:, 1].min())
    return V * s
# -------------------------------------------------------------------------------------------------------------------


def main(src):
    txt, tex = read_zip(src)
    V, VT, F, FT = parse_obj(txt)
    mask = enamel_mask(V, VT, F, FT, tex)
    V = orient(V, mask, LENGTH_MM, CROWN_MM)
    # face normals, areas and vertex normals
    a, b, c = V[F[:, 0]], V[F[:, 1]], V[F[:, 2]]
    fn = np.cross(b - a, c - a); area = np.linalg.norm(fn, axis=1) / 2; fn = fn / np.maximum(np.linalg.norm(fn, axis=1, keepdims=True), 1e-12)
    vn = np.zeros_like(V); np.add.at(vn, F.reshape(-1), np.repeat(fn * area[:, None], 3, 0)); vn /= np.maximum(np.linalg.norm(vn, axis=1, keepdims=True), 1e-12)
    # how sharply the surface bends across each triangle: 1 - the smallest agreement between its corners' normals
    bend = 1 - np.minimum.reduce([np.sum(vn[F[:, 0]] * vn[F[:, 1]], 1), np.sum(vn[F[:, 1]] * vn[F[:, 2]], 1), np.sum(vn[F[:, 0]] * vn[F[:, 2]], 1)])
    bend = bend / (np.percentile(bend, 95) + 1e-9)
    dens = 0.35 + np.clip(bend, 0, 1.6)                     # points per unit area: smooth 0.35, sharpest ~2
    rng = np.random.default_rng(7)
    pw = area * dens; pw /= pw.sum()
    fi = rng.choice(len(F), N_POINTS, p=pw)
    r1, r2 = rng.random(N_POINTS), rng.random(N_POINTS); s1 = np.sqrt(r1)
    P = a[fi] * (1 - s1)[:, None] + b[fi] * (s1 * (1 - r2))[:, None] + c[fi] * (s1 * r2)[:, None]
    Nn = fn[fi]
    weight = 1 / dens[fi]                                   # the surface area each point stands for
    en = mask[F[fi]].mean(1) > 0.5
    top = P[:, 1].max(); crownH = top
    # ---- the decay order over the crown
    ci = np.nonzero(en)[0]; Pc = P[ci]
    tree = cKDTree(Pc[:, [0, 2]])
    # depth below the local cusp envelope: the highest crown point within 1.4 mm in plan, minus this point's height
    env = np.array([Pc[idx, 1].max() for idx in tree.query_ball_point(Pc[:, [0, 2]], 0.14)])
    depth = env - Pc[:, 1]
    occl = (Nn[ci, 1] > 0.25) & (Pc[:, 1] > top - 0.42 * crownH)
    rad = np.hypot(Pc[:, 0], Pc[:, 2]); rad = rad / rad.max()
    score = np.where(occl, 2.0 + depth / (np.percentile(depth[occl], 95) + 1e-9) - 0.35 * rad, Pc[:, 1] / top)
    # smooth over neighbours, so the order spreads as a front rather than speckle
    t3 = cKDTree(Pc); _, nb = t3.query(Pc, 10)
    for _ in range(3): score = score[nb].mean(1)
    order = np.argsort(-score)
    cum = np.cumsum(weight[ci][order]); cum = (cum - weight[ci][order] / 2) / cum[-1]
    rank_c = np.empty(len(ci)); rank_c[order] = cum
    rank = np.full(N_POINTS, 65535, np.uint16); rank[ci] = np.round(rank_c * 65000).astype(np.uint16)
    occl_share = float(weight[ci][occl].sum() / weight[ci].sum())   # the chewing surface's share of the crown's area
    # links between neighbouring crown points
    _, nn = t3.query(Pc, K_LINK + 1)
    pairs = set()
    for i in range(len(ci)):
        for j in nn[i, 1:]:
            pairs.add((min(ci[i], ci[j]), max(ci[i], ci[j])))
    pairs = np.array(sorted(pairs), np.uint16)
    # pack
    s = float(np.abs(P).max())
    q = np.round(P / s * 32767).astype(np.int16)
    out = dict(source="mandibular-first-molar.zip (shuiee/tooth-untold, source/teeth models)", n=int(N_POINTS), s=s,
               top=float(top), bottom=float(P[:, 1].min()), crown=int(len(ci)), occl=round(occl_share, 4),
               p=base64.b64encode(q.tobytes()).decode(), r=base64.b64encode(rank.tobytes()).decode(),
               e=base64.b64encode(pairs.tobytes()).decode())
    head = ("/* The first molar at the centre of the radial, as a point cloud. Generated by tools/build_molar_cloud.py from the team's\n"
            "   sculpted lower first molar (shuiee/tooth-untold, source/teeth models/mandibular-first-molar.zip). Do not edit by hand.\n"
            "   p = base64 int16 x, y, z per point (times s / 32767; crown up, the enamel-root junction at y = 0, 1 unit = 10 mm);\n"
            "   r = base64 uint16 per point: its rank in the decay order as a share of the crown's area (times 1 / 65000),\n"
            "       65535 for root points; e = base64 uint16 pairs of neighbouring crown points; occl = the chewing surface's share of the crown's area.\n"
            "   The model's licence is still to be confirmed (see CLAUDE.md, Open questions). */\n")
    path = os.path.join(ROOT, "data", "molar-cloud.js")
    open(path, "w").write(head + "window.MOLAR_CLOUD=" + json.dumps(out, separators=(",", ":")) + ";\n")
    print(path, round(os.path.getsize(path) / 1024), "KB ·", N_POINTS, "points ·", len(ci), "crown ·", len(pairs), "links · chewing surface", round(occl_share, 3), "of the crown")
    return P, en, rank


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC)
