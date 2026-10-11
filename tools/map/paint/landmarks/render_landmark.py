#!/usr/bin/env python3
"""名城按年代布局小景渲染器（AR-113 · docs/tech/13 §5.3）。

把 specs/<city>__<era>.json 的史料版式（城墙、城门、中轴、宫城 / 皇城、坊巷、水系、标志建筑）画成透明底水墨小景：
  - 程序画墨线：城墙（顶面 + 迎面墙身 + 雉堞）、城门楼 / 角楼 / 瓮城、街道、坊墙、胡同、水面与岸线、坛墙；
  - 建筑全部取仓库按年代套件 assets/default/building-map/<kit>/（规格里点名的地标件 + 坊内填充件），
    树取 assets/default/tile/<kit>/ 的树丛件，山取 assets/default/map/kit/ 的丘陵件；
  - 统一水墨处理：去色、墨分浓淡（暖墨—赭—纸三段色阶）、纸纹、外圈淡墨晕边，与底图同一调子。
视角北上、略带俯斜（地面南北压缩 K=0.62，高度向上抬），与 map/kit 大城件一致。固定种子，同输入逐字节同输出。

用法：
  python3 tools/map/paint/landmarks/render_landmark.py specs/city_beijing__ming.json [...]   # 渲染并写交付
  python3 tools/map/paint/landmarks/render_landmark.py --all                                  # 全部规格
  python3 tools/map/paint/landmarks/render_landmark.py --all --check                          # 重渲染逐字节比对交付
坐标约定见 README.md：规格坐标单位 km，以城心为原点，x 向东、y 向北。
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import sys
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter, zoom

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C  # noqa: E402

HERE = Path(__file__).resolve().parent
SPECS = HERE / "specs"
MASTER_DIR = C.COORD / "master"
W = 768          # 交付边长
SS = 3           # 超采样倍数
WS = W * SS
K = 0.68         # 地面南北压缩（俯斜）
HF = 0.85        # 高度抬升系数

# ---- 色阶（取自底图采样：纸 230,212,182；淡墨 142,134,119；浓墨 85,79,67；水 160,173,170）----
PAPER = (231, 216, 188)
GROUND = (222, 207, 176)
GROUND_PALACE = (228, 219, 199)
GROUND_ALTAR = (206, 203, 174)
ROAD = (238, 229, 207)
ROAD_EDGE = (196, 181, 150)
WARD = (210, 192, 156)
WARD_EDGE = (128, 112, 86)
WATER = (163, 177, 173)
WATER_EDGE = (104, 117, 114)
WATER_LIGHT = (196, 205, 200)
INK = (52, 47, 39)
INK_MID = (112, 102, 86)
RUIN = (176, 160, 130)

WALL_STYLES = {
    # role: (顶面, 迎面墙身, 内侧墙身, 墨线)
    "city_brick": ((211, 202, 182), (150, 141, 124), (170, 160, 142), (64, 58, 48)),
    "city_earth": ((214, 196, 160), (168, 146, 110), (184, 164, 128), (78, 66, 50)),
    "imperial": ((214, 182, 158), (168, 120, 100), (182, 140, 120), (84, 58, 48)),
    "palace": ((206, 170, 146), (150, 96, 78), (170, 118, 100), (78, 50, 40)),
    "palace_earth": ((212, 190, 156), (164, 136, 104), (180, 156, 124), (78, 64, 50)),
    "altar": ((214, 206, 184), (166, 154, 128), (182, 172, 148), (82, 74, 60)),
    "ruin": ((206, 192, 162), (176, 160, 130), (186, 172, 142), (120, 108, 88)),
}

INK_RAMP = (np.array([46, 41, 34], float), np.array([136, 124, 103], float), np.array([236, 224, 198], float))

# ---- 调墨配置（AR-113 第二轮，ink-v2）：城墙 / 城楼 / 宫城 / 塔寺加深到 map/kit 城池件同一深浅；
#      民居改「少而大的墨团」（每团 2–4 件 + 团下淡墨晕），坊格与胡同变淡，整体再提一次对比。
#      目标色阶取自 kit 大城 / 州府件：平均亮度 136–146，最暗 10% ≈ 65–77，亮度 <90 约占 18–22%。
INK_CFG = {
    "version": "ink-v2",
    "wall_top_mul": 0.86, "wall_face_mul": 0.72, "wall_inner_mul": 0.8,
    "wall_line": (32, 28, 23), "wall_line_px": 1.7, "wall_inner_line_px": 0.9, "crenel_px": 1.0,
    "tower_body": (176, 158, 128), "tower_line": (34, 30, 25), "roof": (24, 22, 19),
    "imperial_roof_mul": 0.82,
    "tints": {  # 名称: (饱和保留, 原色保留, 对比, 暗部改色, 改色强度, 整体压暗)
        "ink": (0.38, 0.4, 1.3, None, 0.0, 0.99),
        "landmark": (0.4, 0.32, 1.55, None, 0.0, 0.86),
        "tree": (0.55, 0.5, 1.3, None, 0.0, 0.88),
        "imperial": (0.5, 0.45, 1.45, (150, 112, 58), 0.62, 0.86),
        "white": (0.3, 0.55, 1.18, None, 0.0, 0.98),
        "ruin": (0.25, 0.4, 1.0, None, 0.0, 0.92),
    },
    "clump": {"spacing_mul": 2.4, "n": [3, 4], "size_px": [13.0, 17.0], "spread": 0.33, "tree_p": 0.5,
              "wash_alpha": 0.28, "wash_color": (100, 90, 72), "wash_blur_px": 2.6, "wash_scale": 0.78},
    "ward_fill": (215, 199, 167), "ward_edge": (150, 134, 106), "ward_edge_alpha": 140,
    "hutong_alpha_mul": 0.55,
    "contrast": 1.1, "pivot": 150.0, "gamma": 1.03,
}


# ============================================================ 几何
def poly_area(poly):
    a = 0.0
    for i in range(len(poly)):
        x1, y1 = poly[i]
        x2, y2 = poly[(i + 1) % len(poly)]
        a += x1 * y2 - x2 * y1
    return a / 2.0


def poly_centroid(poly):
    a = poly_area(poly)
    cx = cy = 0.0
    for i in range(len(poly)):
        x1, y1 = poly[i]
        x2, y2 = poly[(i + 1) % len(poly)]
        f = x1 * y2 - x2 * y1
        cx += (x1 + x2) * f
        cy += (y1 + y2) * f
    return cx / (6 * a), cy / (6 * a)


def offset_poly(poly, d):
    """斜接偏移：d>0 向外。"""
    n = len(poly)
    ccw = poly_area(poly) > 0
    lines = []
    for i in range(n):
        x1, y1 = poly[i]
        x2, y2 = poly[(i + 1) % n]
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy) or 1e-9
        nx, ny = (dy / L, -dx / L) if ccw else (-dy / L, dx / L)
        lines.append(((x1 + nx * d, y1 + ny * d), (x2 + nx * d, y2 + ny * d)))
    out = []
    for i in range(n):
        (a1, a2), (b1, b2) = lines[i - 1], lines[i]
        p = _intersect(a1, a2, b1, b2)
        if p is None or math.hypot(p[0] - poly[i][0], p[1] - poly[i][1]) > 4 * abs(d) + 1e-9:
            p = ((a2[0] + b1[0]) / 2, (a2[1] + b1[1]) / 2)
        out.append(p)
    return out


def _intersect(p1, p2, p3, p4):
    x1, y1 = p1
    x2, y2 = p2
    x3, y3 = p3
    x4, y4 = p4
    den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(den) < 1e-12:
        return None
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
    return (x1 + t * (x2 - x1), y1 + t * (y2 - y1))


def outward_normal(poly, i):
    x1, y1 = poly[i]
    x2, y2 = poly[(i + 1) % len(poly)]
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy) or 1e-9
    if poly_area(poly) > 0:
        return dy / L, -dx / L
    return -dy / L, dx / L


def chaikin(pts, iters=3, closed=True):
    pts = [tuple(p) for p in pts]
    for _ in range(iters):
        out = []
        n = len(pts)
        rng = range(n) if closed else range(n - 1)
        if not closed:
            out.append(pts[0])
        for i in rng:
            p, q = pts[i], pts[(i + 1) % n]
            out.append((0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]))
            out.append((0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]))
        if not closed:
            out.append(pts[-1])
        pts = out
    return pts


def rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


# ============================================================ 投影
class Proj:
    def __init__(self, view, top_px=0.0, margin=0.07):
        (x0, x1), (y0, y1) = view["x"], view["y"]
        avail_w = WS * (1 - 2 * margin)
        avail_h = WS * (1 - 2 * margin) - top_px * SS
        self.S = min(avail_w / (x1 - x0), avail_h / ((y1 - y0) * K))
        self.ox = WS / 2 - (x0 + x1) / 2 * self.S
        self.oy = WS / 2 + (y0 + y1) / 2 * self.S * K + top_px * SS / 2

    def g(self, x, y, z=0.0):
        return (self.ox + x * self.S, self.oy - y * self.S * K - z * self.S * HF)

    def gs(self, pts, z=0.0):
        return [self.g(x, y, z) for x, y in pts]

    def inv(self, X, Y):
        return ((X - self.ox) / self.S, (self.oy - Y) / (self.S * K))


# ============================================================ 套件件
def kit_sprite_path(kit: str, name: str) -> Path:
    if name.startswith("tile:"):
        return C.ASSETS / "tile" / kit / f"{name[5:]}.png"
    if name.startswith("map:"):
        return C.KIT / f"{name[4:]}.png"
    if name.startswith("baseline:"):
        return C.ASSETS / "baseline" / "building-map" / f"{name[9:]}.png"
    if name.startswith("bld:"):
        kit, name = name[4:].split("/", 1)
    p = C.ASSETS / "building-map" / kit / f"bld_kit_{kit}_{name}.png"
    if not p.exists():  # 南宋 / 大理套件只在作者已审基线目录
        p = C.ASSETS / "baseline" / "building-map" / f"bld_kit_{kit}_{name}.png"
    return p


@lru_cache(maxsize=None)
def kit_anchor(path_str: str):
    """建筑件取 manifest building.anchor（地面中心）；其余取 alpha 包围盒底边中点。"""
    path = Path(path_str)
    man = path.parent / "manifest.yaml"
    if man.exists():
        for row in C.read_manifest(man) or []:
            if isinstance(row, dict) and row.get("file") == path.name:
                b = row.get("building") or {}
                if b.get("anchor"):
                    return float(b["anchor"][0]), float(b["anchor"][1])
    im = C.load_rgba(path)
    l, t, r, b = C.alpha_bbox(im, 32)
    return (l + r) / 2.0, b - 1.0


@lru_cache(maxsize=None)
def _load_src(path_str: str) -> Image.Image:
    return C.load_rgba(Path(path_str))


# 墨化色调参数见 INK_CFG["tints"]


def inkify(im: Image.Image, tint: str = "ink") -> Image.Image:
    sat, keep, contrast, dark_col, dark_k, darken = INK_CFG["tints"][tint]
    a = np.asarray(im.convert("RGBA")).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3:4]
    lum = 0.30 * rgb[..., 0] + 0.59 * rgb[..., 1] + 0.11 * rgb[..., 2]
    l01 = np.clip((lum / 255.0 - 0.5) * contrast + 0.52, 0, 1)[..., None]
    ink, mid, paper = INK_RAMP
    a1 = np.clip(l01 / 0.55, 0, 1)
    b1 = np.clip((l01 - 0.55) / 0.45, 0, 1)
    ramp = np.where(l01 < 0.55, ink * (1 - a1) + mid * a1, mid * (1 - b1) + paper * b1)
    gray = lum[..., None]
    desat = gray + (rgb - gray) * sat
    out = ramp * (1 - keep) + desat * keep
    if dark_col is not None:
        w = np.clip((0.5 - l01) / 0.35, 0, 1) * dark_k
        dc = np.array(dark_col, np.float32) * (0.55 + 0.9 * l01)
        out = out * (1 - w) + dc * w
    if tint == "ruin":
        out = out * 0.55 + np.array(RUIN, np.float32) * 0.45
    out = out * darken
    out = np.concatenate([np.clip(out, 0, 255), al], -1).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


@lru_cache(maxsize=None)
def sprite(path_str: str, width_ss: int, flip: bool, squash: float = 1.0, ink: bool = True, tint: str = "ink",
           crop_top: float = 0.0):
    """返回 (RGBA 已墨化并缩放到 width_ss 宽, 锚点 (ax, ay) 像素)。width 指 alpha 包围盒宽。"""
    src = _load_src(path_str)
    ax, ay = kit_anchor(path_str)
    l, t, r, b = C.alpha_bbox(src, 16)
    if crop_top:
        t = int(t + (b - t) * crop_top)
    crop = src.crop((l, t, r, b))
    sc = width_ss / max(1, (r - l))
    nw = max(1, round((r - l) * sc))
    nh = max(1, round((b - t) * sc * squash))
    im = inkify(crop, tint) if ink else crop
    im = C.resize_rgba(im, (nw, nh))
    axs = (ax - l) * sc
    ays = (ay - t) * sc * squash
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
        axs = nw - axs
    return im, (axs, ays)


# ============================================================ 渲染上下文
class Ctx:
    def __init__(self, spec: dict):
        self.spec = spec
        self.kit = spec["kit"]
        self.tile_kit = spec.get("tile_kit", self.kit)
        self.proj = Proj(spec["view"], spec.get("top_px", 40))
        self.img = Image.new("RGB", (WS, WS), PAPER)
        self.dr = ImageDraw.Draw(self.img, "RGBA")
        self.cov = Image.new("L", (WS, WS), 0)
        self.dcov = ImageDraw.Draw(self.cov)
        self.foot = Image.new("L", (WS, WS), 0)      # 晕边所依据的地面占地
        self.dfoot = ImageDraw.Draw(self.foot)
        self.rng = np.random.default_rng(int(spec.get("seed", 1)))
        self.items: list[tuple[float, float, int, object]] = []
        self.walls = {w["id"]: w for w in spec.get("walls", [])}
        self.masks: dict[str, Image.Image] = {}
        self.block = Image.new("L", (WS, WS), 0)     # 不放填充件的地面（水、街、地标）
        self.dblock = ImageDraw.Draw(self.block)
        self.used: set[str] = set()
        self._n = 0

    # ---- 工具
    def px(self, km):
        return km * self.proj.S

    def k(self, obj: dict, key: str, default_px: float) -> float:
        """尺寸取值：优先 key_px（交付图像素，与城市大小无关的视觉粗细），其次 key（km），否则默认像素。"""
        if obj is not None and f"{key}_px" in obj:
            return float(obj[f"{key}_px"]) * SS / self.proj.S
        if obj is not None and key in obj:
            return float(obj[key])
        return float(default_px) * SS / self.proj.S

    def add(self, depth_y, depth_x, fn):
        self._n += 1
        self.items.append((-depth_y, depth_x, self._n, fn))

    def region_mask(self, rid: str) -> Image.Image:
        if rid in self.masks:
            return self.masks[rid]
        m = Image.new("L", (WS, WS), 0)
        d = ImageDraw.Draw(m)
        if rid in self.walls:
            d.polygon(self.proj.gs(self.walls[rid]["polygon"]), fill=255)
        else:
            for p in self.spec.get("regions", []):
                if p["id"] == rid:
                    d.polygon(self.proj.gs(p["polygon"]), fill=255)
        self.masks[rid] = m
        return m

    def poly(self, rid):
        if rid in self.walls:
            return self.walls[rid]["polygon"]
        for p in self.spec.get("regions", []):
            if p["id"] == rid:
                return p["polygon"]
        raise KeyError(rid)

    def foot_poly(self, pts_plan, grow_km=0.0):
        pts = offset_poly(pts_plan, grow_km) if grow_km else pts_plan
        self.dfoot.polygon(self.proj.gs(pts), fill=255)


# ============================================================ 地面层
def draw_ground(cx: Ctx):
    sp = cx.spec
    P = cx.proj
    # 按规格顺序逐道城：护城河 → 河岸（纸色）→ 城内地面；后画的城盖住先画城的外扩部分
    for w in sp.get("walls", []):
        m = w.get("moat")
        if m:
            mg, mw = cx.k(m, "gap", 3), cx.k(m, "width", 6)
            outer = offset_poly(w["polygon"], mg + mw)
            inner = offset_poly(w["polygon"], mg)
            cx.dr.polygon(P.gs(outer), fill=WATER_EDGE + (255,))
            cx.dr.polygon(P.gs(offset_poly(w["polygon"], mg + mw * 0.80)), fill=WATER + (255,))
            cx.dr.polygon(P.gs(inner), fill=m.get("bank", PAPER) + (255,) if isinstance(m.get("bank"), tuple) else PAPER + (255,))
            cx.foot_poly(outer, 0.0)
            ring = Image.new("L", (WS, WS), 0)
            dd = ImageDraw.Draw(ring)
            dd.polygon(P.gs(outer), fill=255)
            dd.polygon(P.gs(inner), fill=0)
            cx.block.paste(255, (0, 0), ring)
        if w.get("ground", w.get("role", "").startswith("city")):
            col = {"palace": GROUND_PALACE, "altar": GROUND_ALTAR, "ruin": RUIN}.get(w.get("ground_tone", ""), GROUND)
            cx.dr.polygon(P.gs(w["polygon"]), fill=col + (255,))
            cx.dblock.polygon(P.gs(w["polygon"]), fill=0)
            cx.foot_poly(w["polygon"], 0.0)
    for r in sp.get("regions", []):
        tone = r.get("tone")
        if tone:
            col = {"palace": GROUND_PALACE, "altar": GROUND_ALTAR, "ground": GROUND, "ruin": RUIN,
                   "field": (214, 204, 168)}.get(tone, GROUND)
            cx.dr.polygon(P.gs(r["polygon"]), fill=col + (int(r.get("alpha", 1.0) * 255),))
        if r.get("foot"):
            cx.foot_poly(r["polygon"], 0.0)
    for w in sp.get("walls", []):
        if w.get("ground_tone") and not w.get("role", "").startswith("city"):
            col = {"palace": GROUND_PALACE, "altar": GROUND_ALTAR, "ruin": RUIN}.get(w["ground_tone"], GROUND)
            cx.dr.polygon(P.gs(w["polygon"]), fill=col + (255,))


def draw_bridges(cx: Ctx):
    """桥：石桥 / 堤为亮带加墨边；浮桥为一串小舟加木板细线。"""
    P = cx.proj
    rng = np.random.default_rng(int(cx.spec.get("seed", 1)) + 31)
    for b in cx.spec.get("bridges", []):
        pts = P.gs(b["points"])
        w = max(SS, cx.px(cx.k(b, "width", 3.0)))
        kind = b.get("kind", "stone")
        if kind == "pontoon":
            cx.dr.line(pts, fill=(120, 100, 70, 255), width=max(1, round(SS * 0.9)))
            (x0, y0), (x1, y1) = pts[0], pts[-1]
            L = math.hypot(x1 - x0, y1 - y0)
            n = max(3, int(L / (SS * 4.5)))
            for i in range(n + 1):
                u = i / n
                X, Y = x0 + (x1 - x0) * u, y0 + (y1 - y0) * u
                bw, bh = SS * 3.2, SS * 1.3
                cx.dr.ellipse([X - bw, Y - bh, X + bw, Y + bh], fill=(78, 66, 50, 255))
        else:
            col = (206, 214, 186) if kind == "causeway" else (226, 216, 194)
            cx.dr.line(pts, fill=tuple(INK_CFG["wall_line"]) + (230,), width=round(w + SS * 1.6), joint="curve")
            cx.dr.line(pts, fill=col + (255,), width=round(w), joint="curve")
        cx.dblock.line(pts, fill=255, width=round(w + SS * 2))
        if b.get("foot", True):
            cx.dfoot.line(pts, fill=255, width=round(w + SS * 8))


def draw_wards(cx: Ctx):
    """唐坊：坊块（略深）+ 坊墙细线 + 十字街淡线；坊间即大街（地面色更亮）。"""
    P = cx.proj
    for wg in cx.spec.get("wards", []):
        xs, ys = wg["cols"], wg["rows"]
        skip = {tuple(s) for s in wg.get("skip", [])}
        for i in range(len(xs)):
            for j in range(len(ys)):
                if (i, j) in skip:
                    continue
                x0, x1 = xs[i]
                y0, y1 = ys[j]
                pts = P.gs(rect(x0, y0, x1, y1))
                cx.dr.polygon(pts, fill=tuple(INK_CFG["ward_fill"]) + (255,))
                cx.dr.line(pts + [pts[0]], fill=tuple(INK_CFG["ward_edge"]) + (INK_CFG["ward_edge_alpha"],), width=max(1, round(SS * 0.8)))
                if wg.get("cross", True) and (x1 - x0) > 0.35:
                    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
                    cx.dr.line([P.g(x0, my), P.g(x1, my)], fill=ROAD + (200,), width=max(1, round(SS * 0.9)))
                    if (x1 - x0) > 0.75:
                        cx.dr.line([P.g(mx, y0), P.g(mx, y1)], fill=ROAD + (200,), width=max(1, round(SS * 0.9)))


def draw_streets(cx: Ctx):
    P = cx.proj
    for st in cx.spec.get("streets", []):
        pts = P.gs(st["points"])
        w = max(SS, cx.px(cx.k(st, "width", 3)))
        cls = st.get("class", "main")
        if cls == "lane":
            cx.dr.line(pts, fill=ROAD_EDGE + (120,), width=max(1, round(SS * 0.8)))
            continue
        cx.dr.line(pts, fill=ROAD_EDGE + (255,), width=round(w + SS * 1.4), joint="curve")
        cx.dr.line(pts, fill=ROAD + (255,), width=round(w), joint="curve")
        cx.dblock.line(pts, fill=255, width=round(w + SS * 2))
        if st.get("foot"):
            cx.dfoot.line(pts, fill=255, width=round(w + SS * 10))


def draw_hutongs(cx: Ctx):
    """胡同 / 街巷网格：在区域内画淡墨细线（东西向为主），排除宫城、湖面等。"""
    P = cx.proj
    for hg in cx.spec.get("grids", []):
        lay = Image.new("L", (WS, WS), 0)
        d = ImageDraw.Draw(lay)
        x0, x1, y0, y1 = hg["bbox"]
        sp_ = cx.k(hg, "spacing", 8)
        lw = max(1, round(SS * hg.get("line", 0.7)))
        if hg.get("dir", "ew") in ("ew", "both"):
            y = y0 + sp_ / 2
            while y < y1:
                d.line([P.g(x0, y), P.g(x1, y)], fill=255, width=lw)
                y += sp_
        if hg.get("dir", "ew") in ("ns", "both"):
            sx = cx.k(hg, "spacing_x", sp_ * cx.proj.S / SS)
            x = x0 + sx / 2
            while x < x1:
                d.line([P.g(x, y0), P.g(x, y1)], fill=255, width=lw)
                x += sx
        m = np.asarray(lay, np.float32) / 255.0
        m *= np.asarray(cx.region_mask(hg["clip"]), np.float32) / 255.0
        for ex in hg.get("exclude", []):
            m *= 1.0 - np.asarray(cx.region_mask(ex), np.float32) / 255.0
        m *= np.asarray(1.0 - np.asarray(cx.block, np.float32) / 255.0)
        alpha = hg.get("alpha", 0.45) * INK_CFG["hutong_alpha_mul"]
        col = np.array(hg.get("color", ROAD_EDGE), np.float32)
        base = np.asarray(cx.img, np.float32)
        a = (m * alpha)[..., None]
        out = base * (1 - a) + col * a
        cx.img.paste(Image.fromarray(out.astype(np.uint8), "RGB"))
        cx.dr = ImageDraw.Draw(cx.img, "RGBA")


def draw_water(cx: Ctx):
    P = cx.proj
    rng = np.random.default_rng(int(cx.spec.get("seed", 1)) + 7)
    for wt in cx.spec.get("water", []):
        kind = wt.get("kind", "lake")
        if kind == "lake":
            pts = chaikin(wt["polygon"], 3) if wt.get("smooth", True) else wt["polygon"]
            sp = P.gs(pts)
            cx.dr.polygon(sp, fill=WATER_EDGE + (255,))
            inner = P.gs(offset_poly(pts, -cx.k(None, "edge", 1.1)))
            cx.dr.polygon(inner, fill=WATER + (255,))
            cx.foot_poly(pts, cx.k(None, "halo", 5))
            core = offset_poly(pts, -cx.k(None, "core", 4))
            if abs(poly_area(core)) > 0.02 and poly_area(core) * poly_area(pts) > 0:
                cx.dr.polygon(P.gs(core), fill=WATER_LIGHT + (110,))
            cx.dblock.polygon(sp, fill=255)
            # 水纹：少量横向短笔
            xs = [p[0] for p in pts]
            ys = [p[1] for p in pts]
            area = abs(poly_area(pts))
            n = int(min(40, area * 30 * wt.get("ripples", 1.0)))
            mask = Image.new("L", (WS, WS), 0)
            ImageDraw.Draw(mask).polygon(inner, fill=255)
            mk = np.asarray(mask)
            for _ in range(n):
                x = rng.uniform(min(xs), max(xs))
                y = rng.uniform(min(ys), max(ys))
                X, Y = P.g(x, y)
                L = cx.px(rng.uniform(0.05, 0.12))
                if 0 <= int(Y) < WS and 0 <= int(X - L) and int(X + L) < WS and mk[int(Y), int(X - L)] and mk[int(Y), int(X + L)]:
                    cx.dr.line([(X - L, Y), (X + L, Y)], fill=WATER_LIGHT + (170,), width=max(1, SS))
            for isl in wt.get("islands", []):
                ip = chaikin(isl["polygon"], 3)
                cx.dr.polygon(P.gs(ip), fill=WATER_EDGE + (255,))
                cx.dr.polygon(P.gs(offset_poly(ip, -cx.k(None, "edge", 1.0))), fill=GROUND_PALACE + (255,))
        elif kind == "dry":
            pts = chaikin(wt["points"], 2, closed=False) if wt.get("smooth", True) else wt["points"]
            sp = P.gs(pts)
            w = max(SS * 1.5, cx.px(cx.k(wt, "width", 2.5)))
            cx.dr.line(sp, fill=(176, 160, 128, 200), width=round(w + SS * 1.2), joint="curve")
            cx.dr.line(sp, fill=(214, 198, 160, 255), width=round(w), joint="curve")
        elif kind == "river":
            pts = chaikin(wt["points"], 2, closed=False) if wt.get("smooth", True) else wt["points"]
            sp = P.gs(pts)
            w = max(SS * 1.5, cx.px(cx.k(wt, "width", 2.5)))
            cx.dr.line(sp, fill=WATER_EDGE + (255,), width=round(w + SS * 1.6), joint="curve")
            cx.dr.line(sp, fill=WATER + (255,), width=round(w), joint="curve")
            cx.dblock.line(sp, fill=255, width=round(w + SS * 2))
            if wt.get("foot"):
                d = cx.dfoot
                d.line(sp, fill=255, width=round(w + cx.px(0.3)))


# ============================================================ 立体件（画家算法）
def wall_items(cx: Ctx):
    P = cx.proj
    for w in cx.spec.get("walls", []):
        if not w.get("draw", True):
            continue
        style = WALL_STYLES[w.get("style", "city_brick")]
        poly = w["polygon"]
        t = cx.k(w, "thickness", 5)
        h = cx.k(w, "height", 8)
        crenel = w.get("crenel", True)
        broken = w.get("broken", 0.0)
        seg_len = cx.k(w, "seg", 16)
        n = len(poly)
        skip_edges = set(w.get("open_edges", []))
        rng = np.random.default_rng(int(cx.spec.get("seed", 1)) + hash_str(w["id"]) % 997)
        for i in range(n):
            if i in skip_edges:
                continue
            a = poly[i]
            b = poly[(i + 1) % n]
            nx, ny = outward_normal(poly, i)
            L = math.hypot(b[0] - a[0], b[1] - a[1])
            m = max(1, int(math.ceil(L / seg_len)))
            for k in range(m):
                if broken and rng.random() < broken:
                    continue
                t0, t1 = k / m, (k + 1) / m
                p0 = (a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0)
                p1 = (a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1)
                hh = h * (rng.uniform(0.35, 0.8) if broken else 1.0)
                cy_ = (p0[1] + p1[1]) / 2 - ny * t / 2
                cx_ = (p0[0] + p1[0]) / 2
                j = rng.uniform(-7, 7)
                muls = (INK_CFG["wall_top_mul"], INK_CFG["wall_face_mul"], INK_CFG["wall_inner_mul"])
                st = tuple(tuple(int(max(0, min(255, c * muls[q] + j))) for c in col) for q, col in enumerate(style[:3]))
                st = st + (tuple(INK_CFG["wall_line"]) if w.get("style") != "ruin" else style[3],)
                cx.add(cy_, cx_, _wall_seg_fn(cx, p0, p1, (nx, ny), t, hh, st, crenel and not broken))
        # 角楼
        for ci in w.get("corner_towers", []):
            x, y = poly[ci]
            cx.add(y - 0.001, x, _tower_fn(cx, x, y, h, cx.k(w, "corner_size", 12), "corner", style,
                                          eaves=w.get("corner_eaves", 1), roof_col=tuple(w.get("roof", INK))))


def hash_str(s: str) -> int:
    return int(hashlib.sha256(s.encode()).hexdigest()[:8], 16)


def _wall_seg_fn(cx, p0, p1, n, t, h, style, crenel):
    def fn():
        P = cx.proj
        top_c, face_c, inner_c, line_c = style
        nx, ny = n
        i0 = (p0[0] - nx * t, p0[1] - ny * t)
        i1 = (p1[0] - nx * t, p1[1] - ny * t)
        # 迎面墙身：南向外墙的外侧面、北墙的内侧面
        if ny < -0.3:
            face = [P.g(*p0), P.g(*p1), P.g(*p1, h), P.g(*p0, h)]
            cx.dr.polygon(face, fill=face_c + (255,))
            cx.dr.line([P.g(*p0), P.g(*p1)], fill=line_c + (235,), width=max(1, round(SS * INK_CFG["wall_line_px"] * 0.8)))
        elif ny > 0.3:
            face = [P.g(*i0), P.g(*i1), P.g(*i1, h), P.g(*i0, h)]
            cx.dr.polygon(face, fill=inner_c + (255,))
            cx.dr.line([P.g(*i0), P.g(*i1)], fill=line_c + (150,), width=max(1, round(SS * 0.7)))
        else:
            # 东西墙：以一条窄面暗示墙高（东面受光弱）
            side = (p0, p1) if nx > 0 else (i0, i1)
            q0, q1 = side
            face = [P.g(*q0), P.g(*q1), P.g(*q1, h * 0.999), P.g(*q0, h * 0.999)]
            cx.dr.polygon(face, fill=face_c + (110,))
        top = [P.g(*p0, h), P.g(*p1, h), P.g(*i1, h), P.g(*i0, h)]
        cx.dr.polygon(top, fill=top_c + (255,))
        cx.dr.line([P.g(*p0, h), P.g(*p1, h)], fill=line_c + (255,), width=max(1, round(SS * INK_CFG["wall_line_px"])))
        cx.dr.line([P.g(*i0, h), P.g(*i1, h)], fill=line_c + (190,), width=max(1, round(SS * INK_CFG["wall_inner_line_px"])))
        if crenel:
            X0, Y0 = P.g(*p0, h)
            X1, Y1 = P.g(*p1, h)
            Ls = math.hypot(X1 - X0, Y1 - Y0)
            step = SS * 3.2
            k = int(Ls // step)
            for j in range(k):
                u = (j + 0.5) / max(1, k)
                X = X0 + (X1 - X0) * u
                Y = Y0 + (Y1 - Y0) * u
                cx.dr.line([(X, Y), (X, Y - SS * 1.4)], fill=line_c + (220,), width=max(1, round(SS * INK_CFG["crenel_px"])))
        for poly in (top,):
            cx.dcov.polygon(poly, fill=255)
    return fn


def roof(cx, Xc, Yb, w, hr, col=INK, flare=0.12, ridge=0.55, outline=None):
    col = tuple(col)
    """画一层屋顶：檐口在 Yb，宽 w；两端起翘。"""
    d = cx.dr
    L = Xc - w / 2
    R = Xc + w / 2
    pts = [(L - w * 0.02, Yb - hr * flare * 2.2), (Xc - w * ridge / 2, Yb - hr), (Xc + w * ridge / 2, Yb - hr),
           (R + w * 0.02, Yb - hr * flare * 2.2), (R - w * 0.04, Yb), (L + w * 0.04, Yb)]
    d.polygon(pts, fill=col + (255,))
    d.line([(Xc - w * ridge / 2, Yb - hr), (Xc + w * ridge / 2, Yb - hr)], fill=(18, 16, 13, 255),
           width=max(1, round(SS * 0.9)))
    d.line([(L + w * 0.04, Yb), (R - w * 0.04, Yb)], fill=(122, 112, 94, 200), width=max(1, round(SS * 0.6)))
    cx.dcov.polygon(pts, fill=255)


def _tower_fn(cx, x, y, wall_h, size, kind, style, eaves=1, side="S", body_col=None, roof_col=None):
    body_col = tuple(INK_CFG["tower_body"]) if body_col is None else tuple(body_col)
    if roof_col is None or tuple(roof_col) == tuple(INK):
        roof_col = tuple(INK_CFG["roof"])
    else:
        roof_col = tuple(int(c * INK_CFG["imperial_roof_mul"]) for c in roof_col)
    style = tuple(style[:3]) + (tuple(INK_CFG["tower_line"]),)

    def fn():
        P = cx.proj
        X, Yb = P.g(x, y, wall_h)
        w = cx.px(size) * (0.6 if side in ("E", "W") else 1.0)
        hb = cx.px(size) * 0.34
        hr = cx.px(size) * 0.30
        # 台身
        cx.dr.rectangle([X - w * 0.42, Yb - hb, X + w * 0.42, Yb], fill=body_col + (255,),
                        outline=style[3] + (220,), width=max(1, round(SS * 0.6)))
        cx.dcov.rectangle([X - w * 0.42, Yb - hb, X + w * 0.42, Yb], fill=255)
        if eaves >= 2:
            roof(cx, X, Yb - hb * 0.55, w * 1.05, hr * 0.55, col=roof_col, flare=0.1, ridge=0.8)
            cx.dr.rectangle([X - w * 0.32, Yb - hb * 1.45, X + w * 0.32, Yb - hb * 0.75], fill=body_col + (255,))
            roof(cx, X, Yb - hb * 1.4, w * 0.92, hr, col=roof_col)
        else:
            roof(cx, X, Yb - hb, w, hr, col=roof_col)
    return fn


def gate_items(cx: Ctx):
    for g in cx.spec.get("gates", []):
        w = cx.walls.get(g.get("wall"))
        h = cx.k(w or {}, "height", 8)
        style = WALL_STYLES[(w or {}).get("style", "city_brick")]
        x, y = g["at"]
        side = g.get("side", "S")
        size = cx.k(g, "size", 18)
        # 瓮城
        bb = g.get("barbican")
        if bb:
            bw = cx.k(bb, "w", size * cx.proj.S / SS * 1.2)
            bd = cx.k(bb, "d", size * cx.proj.S / SS * 0.8)
            dx, dy = {"S": (0, -1), "N": (0, 1), "E": (1, 0), "W": (-1, 0)}[side]
            t = cx.k(w or {}, "thickness", 5)
            if side in ("S", "N"):
                y0 = y + dy * (t * 0.0)
                y1 = y + dy * (bd + t * 0.2)
                poly = rect(x - bw / 2, min(y0, y1), x + bw / 2, max(y0, y1))
            else:
                x0 = x
                x1 = x + dx * (bd + t * 0.2)
                poly = rect(min(x0, x1), y - bw / 2, max(x0, x1), y + bw / 2)
            if poly_area(poly) < 0:
                poly = poly[::-1]
            spec_w = {"id": g["id"] + "_barbican", "polygon": poly, "thickness": t * 0.8, "height": h * 0.9,
                      "style": (w or {}).get("style", "city_brick"), "crenel": True, "seg": 0.2}
            _barbican_walls(cx, spec_w, side)
            if bb.get("arrow_tower", True):
                ax_, ay_ = (x, y1) if side in ("S", "N") else (x1, y)
                cx.add(ay_ - 0.0005, ax_, _tower_fn(cx, ax_, ay_, h * 0.9, size * 0.8, "arrow", style, eaves=1,
                                                     side=side, body_col=tuple(int(c * 1.05) for c in INK_CFG["tower_body"])))
        rc = tuple(g.get("roof", (w or {}).get("roof", INK)))
        cx.add(y - 0.0008, x, _tower_fn(cx, x, y, h, size, "gate", style, eaves=g.get("eaves", 1), side=side, roof_col=rc))
        cx.dblock.ellipse(_bbox_px(cx, x, y, size * 0.6), fill=255)
        cx.foot_poly(rect(x - size * 0.7, y - size * 0.7, x + size * 0.7, y + size * 0.7), 0.0)


def _barbican_walls(cx, spec_w, side):
    """瓮城：三面墙（贴城墙一侧不画）。"""
    poly = spec_w["polygon"]
    style = WALL_STYLES[spec_w["style"]]
    # 找到贴城墙的边：S 门为北边（y 最大），N 门为南边，E 门为西边，W 门为东边
    n = len(poly)
    best = None
    for i in range(n):
        a, b = poly[i], poly[(i + 1) % n]
        mid = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
        key = {"S": mid[1], "N": -mid[1], "E": -mid[0], "W": mid[0]}[side]
        if best is None or key > best[0]:
            best = (key, i)
    for i in range(n):
        if i == best[1]:
            continue
        a, b = poly[i], poly[(i + 1) % n]
        nn = outward_normal(poly, i)
        cyy = (a[1] + b[1]) / 2 - nn[1] * spec_w["thickness"] / 2
        cx.add(cyy, (a[0] + b[0]) / 2, _wall_seg_fn(cx, a, b, nn, spec_w["thickness"], spec_w["height"], style, True))


def _bbox_px(cx, x, y, r):
    X, Y = cx.proj.g(x, y)
    R = cx.px(r)
    return [X - R, Y - R * K, X + R, Y + R * K]


def sprite_item(cx: Ctx, name: str, x: float, y: float, width_px: float, flip=False, squash=1.0, kit=None,
                ink=True, alpha=1.0, z=0.0, tint=None, crop_top=0.0):
    path = kit_sprite_path(kit or cx.kit, name)
    width_ss = max(2, int(round(width_px * SS)))
    cx.used.add(str(path))

    def fn():
        tt = tint or ("tree" if "tree_cluster" in path.name else "ink")
        im, (axs, ays) = sprite(str(path), width_ss, bool(flip), float(squash), bool(ink), tt, float(crop_top))
        X, Y = cx.proj.g(x, y, z)
        ox, oy = int(round(X - axs)), int(round(Y - ays))
        if alpha < 1.0:
            a = im.getchannel("A").point(lambda v: int(v * alpha))
            im = im.copy()
            im.putalpha(a)
        cx.img.paste(im.convert("RGB"), (ox, oy), im.getchannel("A"))
        cx.cov.paste(255, (ox, oy), im.getchannel("A"))
    cx.add(y, x, fn)


# ============================================================ 程序地标
def round_hall_fn(cx, x, y, size_px):
    """祈年殿 / 大享殿：三层圆台 + 圆殿 + 三重檐圆顶（套件无圆形殿，程序墨线画）。"""
    def fn():
        X, Y = cx.proj.g(x, y)
        s = size_px * SS
        d = cx.dr
        for i, (rw, hh) in enumerate([(1.0, 0.08), (0.84, 0.07), (0.68, 0.06)]):
            yy = Y - s * 0.07 * i
            d.ellipse([X - s * rw / 2, yy - s * rw * 0.16, X + s * rw / 2, yy + s * rw * 0.16],
                      fill=(232, 226, 210, 255), outline=(96, 88, 72, 255), width=max(1, round(SS * 0.7)))
        base = Y - s * 0.2
        d.rectangle([X - s * 0.2, base - s * 0.18, X + s * 0.2, base], fill=(176, 120, 96, 255))
        for i, (rw, hh) in enumerate([(0.56, 0.16), (0.44, 0.15), (0.32, 0.17)]):
            yb = base - s * 0.18 - s * 0.2 * i
            pts = [(X - s * rw / 2, yb), (X - s * rw * 0.18, yb - s * hh), (X + s * rw * 0.18, yb - s * hh),
                   (X + s * rw / 2, yb)]
            d.polygon(pts, fill=(58, 66, 74, 255))
            d.ellipse([X - s * rw / 2, yb - s * rw * 0.06, X + s * rw / 2, yb + s * rw * 0.06], fill=(44, 50, 56, 255))
            if i < 2:
                d.rectangle([X - s * rw * 0.3, yb - s * hh - s * 0.05, X + s * rw * 0.3, yb - s * hh],
                            fill=(176, 120, 96, 255))
        tip = base - s * 0.18 - s * 0.2 * 2 - s * 0.17
        d.ellipse([X - s * 0.03, tip - s * 0.07, X + s * 0.03, tip], fill=(150, 130, 70, 255))
        cx.cov.paste(255, (int(X - s / 2), int(tip - s * 0.08), int(X + s / 2), int(Y + s * 0.2)))
    return fn


def round_altar_fn(cx, x, y, size_px):
    def fn():
        X, Y = cx.proj.g(x, y)
        s = size_px * SS
        d = cx.dr
        for i, rw in enumerate([1.0, 0.72, 0.46]):
            yy = Y - s * 0.05 * i
            d.ellipse([X - s * rw / 2, yy - s * rw * 0.2, X + s * rw / 2, yy + s * rw * 0.2],
                      fill=(236, 232, 220, 255), outline=(100, 92, 76, 255), width=max(1, round(SS * 0.7)))
    return fn


def mingtang_fn(cx, x, y, size_px):
    """武周明堂（通天宫）：方台、下层方殿、中层多边形重檐、上层圆顶加火珠（套件无此形制，程序墨线画）。"""
    def fn():
        X, Y = cx.proj.g(x, y)
        s = size_px * SS
        d = cx.dr
        ink = tuple(INK_CFG["roof"])
        line = tuple(INK_CFG["tower_line"])
        d.polygon([(X - s * 0.5, Y), (X, Y + s * 0.17), (X + s * 0.5, Y), (X, Y - s * 0.17)], fill=(214, 204, 182, 255), outline=line + (255,))
        d.rectangle([X - s * 0.36, Y - s * 0.26, X + s * 0.36, Y - s * 0.02], fill=(176, 126, 98, 255), outline=line + (255,))
        roof(cx, X, Y - s * 0.26, s * 0.9, s * 0.16, col=ink, flare=0.12, ridge=0.75)
        d.rectangle([X - s * 0.27, Y - s * 0.52, X + s * 0.27, Y - s * 0.36], fill=(176, 126, 98, 255), outline=line + (255,))
        roof(cx, X, Y - s * 0.52, s * 0.7, s * 0.14, col=ink, flare=0.12, ridge=0.6)
        d.rectangle([X - s * 0.17, Y - s * 0.74, X + s * 0.17, Y - s * 0.62], fill=(176, 126, 98, 255), outline=line + (255,))
        d.pieslice([X - s * 0.3, Y - s * 0.98, X + s * 0.3, Y - s * 0.6], 180, 360, fill=ink + (255,))
        d.ellipse([X - s * 0.05, Y - s * 1.1, X + s * 0.05, Y - s * 0.98], fill=(176, 140, 64, 255), outline=line + (255,))
        cx.cov.paste(255, (int(X - s * 0.52), int(Y - s * 1.12), int(X + s * 0.52), int(Y + s * 0.18)))
    return fn


def pillar_fn(cx, x, y, size_px):
    """武周天枢：八棱铜柱立于铁山之上，顶承云盖与火珠（程序墨线画）。size_px 为柱高。"""
    def fn():
        X, Y = cx.proj.g(x, y)
        h = size_px * SS
        w = h * 0.07
        d = cx.dr
        line = tuple(INK_CFG["tower_line"])
        d.ellipse([X - h * 0.2, Y - h * 0.08, X + h * 0.2, Y + h * 0.06], fill=(70, 64, 56, 255), outline=line + (255,))
        d.rectangle([X - w, Y - h, X + w, Y - h * 0.02], fill=(96, 84, 62, 255), outline=line + (255,))
        d.ellipse([X - h * 0.16, Y - h * 1.06, X + h * 0.16, Y - h * 0.97], fill=(88, 78, 60, 255), outline=line + (255,))
        d.ellipse([X - h * 0.05, Y - h * 1.17, X + h * 0.05, Y - h * 1.06], fill=(176, 140, 64, 255), outline=line + (255,))
        cx.cov.paste(255, (int(X - h * 0.21), int(Y - h * 1.18), int(X + h * 0.21), int(Y + h * 0.07)))
    return fn


PROCS = {"round_hall": round_hall_fn, "round_altar": round_altar_fn, "mingtang": mingtang_fn, "pillar": pillar_fn}


def landmark_items(cx: Ctx):
    for lm in cx.spec.get("landmarks", []):
        x, y = lm["at"]
        if lm.get("proc"):
            cx.add(y, x, PROCS[lm["proc"]](cx, x, y, lm["size_px"]))
        else:
            sprite_item(cx, lm["sprite"], x, y, lm["size_px"], flip=lm.get("flip", False),
                        squash=lm.get("squash", 1.0), kit=lm.get("kit"), alpha=lm.get("alpha", 1.0), tint=lm.get("tint") or "landmark",
                        crop_top=lm.get("crop_top", 0.0))
        r = lm.get("clear", 0.0)
        if r:
            cx.dblock.ellipse(_bbox_px(cx, x, y, r), fill=255)
        if lm.get("foot", True):
            fr = max(r * 1.4, 10 * SS / cx.proj.S)
            cx.dfoot.ellipse(_bbox_px(cx, x, y, fr), fill=255)
    for hl in cx.spec.get("hills", []):
        x, y = hl["at"]
        sprite_item(cx, "map:" + hl["sprite"], x, y, hl["size_px"], flip=hl.get("flip", False), ink=False,
                    alpha=hl.get("alpha", 1.0))
        cx.dblock.ellipse(_bbox_px(cx, x, y, hl.get("clear", 0.15)), fill=255)


def fill_items(cx: Ctx):
    """坊内 / 胡同间填充（调墨 v2：墨团）：按年代套件的民居、合院、店铺与树，每团 2–4 件紧挨着摆，
    团下垫一块淡墨晕，团与团之间留出亮的街巷；避开水、街、宫城与地标。抖动网格、固定种子。"""
    P = cx.proj
    cfg = INK_CFG["clump"]
    blk = np.asarray(cx.block)
    wash = Image.new("L", (WS, WS), 0)
    dw = ImageDraw.Draw(wash)
    allow = np.zeros((WS, WS), np.float32)
    for f in cx.spec.get("fill", []):
        rng = np.random.default_rng(int(cx.spec.get("seed", 1)) + hash_str(f["id"]) % 9973)
        clip = np.asarray(cx.region_mask(f["clip"]))
        excl = [np.asarray(cx.region_mask(e)) for e in f.get("exclude", [])]
        ok_mask = (clip > 0)
        for e in excl:
            ok_mask &= ~(e > 0)
        allow = np.maximum(allow, ok_mask.astype(np.float32))
        x0, x1, y0, y1 = f["bbox"]
        if "spacing_px" in f:
            sx, sy = (v * SS / cx.proj.S * cfg["spacing_mul"] for v in f["spacing_px"])
        else:
            sx, sy = (v * cfg["spacing_mul"] for v in f["spacing"])
        names = [s_[0] for s_ in f["sprites"]]
        weights = np.array([s_[1] for s_ in f["sprites"]], float)
        bld = [i for i, n in enumerate(names) if not n.startswith("tree:")]
        trees = [n for n in names if n.startswith("tree:")]
        bw = weights[bld] / weights[bld].sum() if bld else None
        scale = f.get("size_px", 10) / 10.0
        dens = f.get("density", 1.0)
        n_lo, n_hi = f.get("clump_n", cfg["n"])
        tree_p = cfg["tree_p"] * (2.0 if not bld else 1.0)

        def free(px_, py_):
            X, Y = P.g(px_, py_)
            if not (0 <= int(X) < WS and 0 <= int(Y) < WS):
                return False
            return bool(clip[int(Y), int(X)]) and not blk[int(Y), int(X)] and not any(e[int(Y), int(X)] for e in excl)

        y = y1 - sy / 2
        row = 0
        while y > y0:
            x = x0 + sx / 2 + (sx / 2 if row % 2 else 0)
            while x < x1:
                jit = f.get("jitter", 0.3) * 0.8
                cxp = x + rng.uniform(-jit, jit) * sx
                cyp = y + rng.uniform(-jit, jit) * sy
                if free(cxp, cyp) and rng.random() < dens:
                    X, Y = P.g(cxp, cyp)
                    rx, ry = sx * cx.proj.S * cfg["wash_scale"] / 2, sy * cx.proj.S * K * cfg["wash_scale"] / 2
                    if bld:
                        dw.ellipse([X - rx, Y - ry, X + rx, Y + ry], fill=255)
                    n = int(rng.integers(n_lo, n_hi + 1)) if bld else 0
                    for _ in range(n):
                        ox, oy = rng.uniform(-cfg["spread"], cfg["spread"]) * sx, rng.uniform(-cfg["spread"], cfg["spread"]) * sy
                        if not free(cxp + ox, cyp + oy):
                            continue
                        name = names[bld[int(rng.choice(len(bld), p=bw))]]
                        size = rng.uniform(*cfg["size_px"]) * scale
                        sprite_item(cx, name, cxp + ox, cyp + oy, size, flip=bool(rng.random() < 0.5))
                    if trees and rng.random() < tree_p:
                        ox, oy = rng.uniform(-0.45, 0.45) * sx, rng.uniform(-0.45, 0.45) * sy
                        if free(cxp + ox, cyp + oy):
                            name = trees[int(rng.integers(len(trees)))]
                            sprite_item(cx, f"tile:tex_town_{cx.tile_kit}_{name[5:]}", cxp + ox, cyp + oy,
                                        rng.uniform(11.0, 14.0) * scale, kit=cx.tile_kit, flip=bool(rng.random() < 0.5))
                x += sx
            y -= sy
            row += 1
    # 团下淡墨晕：模糊后只留在可填区域内、街巷处减半
    m = np.asarray(wash.filter(ImageFilter.GaussianBlur(cfg["wash_blur_px"] * SS)), np.float32) / 255.0
    m *= allow * (1.0 - 0.6 * (blk > 0))
    a = (m * cfg["wash_alpha"])[..., None]
    base = np.asarray(cx.img, np.float32)
    out = base * (1 - a) + np.array(cfg["wash_color"], np.float32) * a
    cx.img.paste(Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGB"))
    cx.dr = ImageDraw.Draw(cx.img, "RGBA")


def tree_items(cx: Ctx):
    P = cx.proj
    for g in cx.spec.get("groves", []):
        rng = np.random.default_rng(int(cx.spec.get("seed", 1)) + hash_str(g["id"]) % 9973)
        mask = Image.new("L", (WS, WS), 0)
        dm = ImageDraw.Draw(mask)
        if g.get("ring"):
            rg = g["ring"]
            base_poly = cx.poly(rg["wall"])
            r_from, r_to = cx.k(rg, "from", 12), cx.k(rg, "to", 30)
            poly = offset_poly(base_poly, r_to)
            dm.polygon(P.gs(poly), fill=255)
            dm.polygon(P.gs(offset_poly(base_poly, r_from)), fill=0)
            for ex in rg.get("exclude", []):
                dm.polygon(P.gs(offset_poly(cx.poly(ex), cx.k(rg, "exclude_grow", r_from * cx.proj.S / SS))), fill=0)
            area_km2 = abs(poly_area(poly)) - abs(poly_area(offset_poly(base_poly, r_from)))
        else:
            poly = g["polygon"]
            dm.polygon(P.gs(poly), fill=255)
            area_km2 = abs(poly_area(poly))
        mk = np.asarray(mask)
        blk = np.asarray(cx.block)
        xs = [p[0] for p in poly]
        ys = [p[1] for p in poly]
        if "spacing_px" in g:
            spk = g["spacing_px"] * SS / cx.proj.S
            n = int(area_km2 / (spk * spk))
        else:
            n = int(area_km2 * g.get("per_km2", 40))
        trees = g.get("trees", [])
        names = g.get("sprites")
        placed = 0
        tries = 0
        while placed < n and tries < n * 6:
            tries += 1
            x = rng.uniform(min(xs), max(xs))
            y = rng.uniform(min(ys), max(ys))
            X, Y = P.g(x, y)
            if not (0 <= int(X) < WS and 0 <= int(Y) < WS) or not mk[int(Y), int(X)]:
                continue
            if g.get("avoid_block", True) and blk[int(Y), int(X)]:
                continue
            if names:
                name = names[int(rng.integers(len(names)))]
                sprite_item(cx, name, x, y, g.get("size_px", 9) * rng.uniform(0.75, 1.1), kit=g.get("kit"),
                            flip=bool(rng.random() < 0.5), alpha=g.get("alpha", 1.0), tint=g.get("tint"))
            else:
                name = trees[int(rng.integers(len(trees)))]
                sprite_item(cx, "tile:" + name, x, y, g.get("size_px", 9) * rng.uniform(0.75, 1.1), kit=g.get("kit", cx.tile_kit),
                            flip=bool(rng.random() < 0.5), alpha=g.get("alpha", 1.0))
            placed += 1
        if g.get("foot", True) and not g.get("ring"):
            cx.foot_poly(poly, 0.0)


# ============================================================ 收尾：晕边、纸纹、缩放
def value_noise(shape, scale, seed):
    rng = np.random.default_rng(seed)
    gh, gw = max(2, int(shape[0] / scale) + 2), max(2, int(shape[1] / scale) + 2)
    g = rng.random((gh, gw)).astype(np.float32)
    z = zoom(g, (shape[0] / (gh - 1), shape[1] / (gw - 1)), order=3)
    return z[: shape[0], : shape[1]]


def finish(cx: Ctx) -> Image.Image:
    sp = cx.spec
    # 晕边：地面占地外扩后高斯模糊 + 噪声扰动边缘
    small = 4
    foot = np.asarray(cx.foot.resize((WS // small, WS // small), Image.BILINEAR), np.float32) / 255.0
    grow = (sp["halo_px"] * SS if "halo_px" in sp else sp.get("halo_km", 0.35) * cx.proj.S) / small
    from scipy.ndimage import distance_transform_edt
    dist = distance_transform_edt(foot < 0.5)
    noise = value_noise(dist.shape, 24, int(sp.get("seed", 1)) + 3) * 0.6 + value_noise(dist.shape, 7, int(sp.get("seed", 1)) + 5) * 0.4
    d = dist / max(1.0, grow) + (noise - 0.5) * 0.55
    halo = np.clip(1.0 - d, 0, 1) ** 1.6
    halo = gaussian_filter(halo, 2.0)
    halo_full = np.asarray(Image.fromarray((halo * 255).astype(np.uint8)).resize((WS, WS), Image.BILINEAR), np.float32) / 255.0
    cov = np.asarray(cx.cov, np.float32) / 255.0
    alpha = np.maximum(halo_full * sp.get("halo_alpha", 0.92), cov)
    # 外圈淡墨：晕边带上加一点暖灰
    rgb = np.asarray(cx.img, np.float32)
    ring = np.clip(halo_full * (1 - halo_full) * 4, 0, 1)[..., None]
    rgb = rgb * (1 - ring * 0.10) + np.array([150, 138, 115], np.float32) * ring * 0.10
    # 整体对比（调墨 v2）：围绕 pivot 拉伸，再以 gamma 压一点中间调
    rgb = INK_CFG["pivot"] + (rgb - INK_CFG["pivot"]) * INK_CFG["contrast"]
    rgb = 255.0 * (np.clip(rgb, 0, 255) / 255.0) ** INK_CFG["gamma"]
    # 纸纹
    grain = value_noise((WS, WS), 3, int(sp.get("seed", 1)) + 11) - 0.5
    grain2 = value_noise((WS, WS), 40, int(sp.get("seed", 1)) + 13) - 0.5
    mott = value_noise((WS, WS), 260, int(sp.get("seed", 1)) + 17) - 0.5
    rgb = rgb * (1 + grain[..., None] * 0.06 + grain2[..., None] * 0.04 + mott[..., None] * 0.09)
    out = np.concatenate([np.clip(rgb, 0, 255), alpha[..., None] * 255], -1).astype(np.uint8)
    im = Image.fromarray(out, "RGBA")
    im = C.resize_rgba(im, (W, W))
    im = C.unsharp_premul(im, sigma=0.6, amount=0.35)
    return im


# ============================================================ 主流程
def render(spec: dict) -> tuple[Image.Image, tuple[float, float], dict]:
    cx = Ctx(spec)
    draw_ground(cx)
    draw_water(cx)
    draw_bridges(cx)
    draw_wards(cx)
    draw_streets(cx)
    draw_hutongs(cx)
    wall_items(cx)
    gate_items(cx)
    landmark_items(cx)
    tree_items(cx)
    fill_items(cx)
    for _, _, _, fn in sorted(cx.items, key=lambda it: (it[0], it[1], it[2])):
        fn()
    im = finish(cx)
    ax, ay = cx.proj.g(0.0, 0.0)
    ax, ay = ax / SS, ay / SS
    # 交付图裁到内容（alpha>8 包围盒外留 6 px），名字可紧贴小景下沿；锚点随之平移
    a = np.asarray(im.getchannel("A"))
    ys, xs = np.nonzero(a > 8)
    pad = 6
    x0, y0 = max(0, int(xs.min()) - pad), max(0, int(ys.min()) - pad)
    x1, y1 = min(W, int(xs.max()) + 1 + pad), min(W, int(ys.max()) + 1 + pad)
    im = im.crop((x0, y0, x1, y1))
    used = {C.rel(Path(p)): C.sha256_file(Path(p)) for p in sorted(cx.used)}
    return im, (round(ax - x0, 1), round(ay - y0, 1)), used


def load_spec(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def deliver(spec_path: Path, check=False) -> dict:
    spec = load_spec(spec_path)
    im, anchor, used = render(spec)
    webp = C.webp_bytes(im, lossless=False, quality=90)
    out = C.LANDMARK_DIR / f"{spec['id']}.webp"
    if check:
        same = out.exists() and out.read_bytes() == webp
        return {"id": spec["id"], "ok": same}
    C.write_if_changed(out, webp)
    MASTER_DIR.mkdir(parents=True, exist_ok=True)
    im.save(MASTER_DIR / f"{spec['id']}.png")
    return {"id": spec["id"], "file": out.name, "anchor": list(anchor), "size": f"{im.width}x{im.height}",
            "sha256": C.sha256_bytes(webp), "bytes": len(webp), "used": used, "spec": C.rel(spec_path)}


NODE_NAMES = {"city_beijing": "北京", "city_xian": "长安 / 西安", "city_kaifeng": "开封", "city_hangzhou": "杭州", "city_luoyang": "洛阳",
              "city_nanjing": "南京", "city_dali": "大理", "city_xiangyang": "襄阳"}


def layout_basis(spec: dict) -> dict:
    parts = []
    for w in spec.get("walls", []):
        if w.get("basis"):
            parts.append(f"{w.get('name', w['id'])}：{w['basis']}")
    for key in ("streets", "water", "landmarks"):
        for o in spec.get(key, []):
            if o.get("basis"):
                parts.append(f"{o.get('name', o['id'])}：{o['basis']}")
    srcs = [{"key": k, **v} for k, v in sorted(spec.get("sources", {}).items())]
    return {"summary": "；".join(parts), "sources": srcs}


def manifest_rows(results: list[dict]) -> list[dict]:
    old = C.read_manifest(C.LANDMARK_DIR / "manifest.yaml")
    rows = []
    for r in results:
        spec = load_spec(C.ROOT / r["spec"])
        refs = []
        for path, sha in sorted(r["used"].items()):
            use = "建筑 / 地标件（墨化后摆放）"
            if "/tile/" in path:
                use = "树丛 / 城门楼件（钟鼓楼代用）" if "city_gate" in path else "树丛件（城外林带、坛庙柏林）"
            elif "/map/kit/" in path:
                use = "地图 kit 件（丘陵 / 遗迹）"
            elif "/baseline/" in path:
                use = "作者已审基线方形砖塔件（大雁塔压缩变换 / 小雁塔原比例）"
            refs.append({"path": path, "sha256": sha, "use": use})
        lms = [lm.get("name", lm["id"]) for lm in spec.get("landmarks", [])]
        rows.append({
            "id": spec["id"],
            "file": r["file"],
            "category": "map",
            "style": "default",
            "subject": f"{NODE_NAMES.get(spec['node'], spec['node'])}·{spec['title']}：按年代布局小景（北上略俯斜水墨，透明底，AR-113）。标志：{'、'.join(lms)}",
            "node": spec["node"],
            "era": spec["era"],
            "chapters": spec["chapters"],
            "years": spec.get("years"),
            "anchor": r["anchor"],
            "footprint_grid": spec["footprint_grid"],
            "layout_basis": layout_basis(spec),
            "spec": r["spec"],
            "prompt": "（无：程序按版式规格合成，未调用出图模型）",
            "negative": "（程序不生成文字、印章、题跋）",
            "references": refs,
            "tool": f"python3 程序合成（tools/map/paint/landmarks/render_landmark.py，调墨 {INK_CFG['version']}：3× 超采样画墙 / 门 / 街 / 坊 / 水，按年代套件件墨化成墨团摆放，纸纹与淡墨晕边；WebP q90）",
            "model": "（无：确定性合成，固定种子）",
            "effort": "n/a",
            "created": C.keep_created(old, spec["id"], r["sha256"]),
            "source_path": f"{r['spec']}（母版 PNG：.agents/coord/ART-worldmap-landmarks/master/{spec['id']}.png，不入库）",
            "size": r["size"],
            "sha256": r["sha256"],
            "status": "candidate",
            "notes": "；".join(spec.get("notes", [])) + f"；调墨 {INK_CFG['version']}；未出单体建筑图（建筑全部用仓库套件件；圆殿 / 圜丘 / 明堂 / 天枢为程序墨线）。",
        })
    return rows


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("specs", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    paths = sorted(SPECS.glob("*.json")) if args.all else [Path(p) if Path(p).is_absolute() else (HERE / p if (HERE / p).exists() else Path(p)) for p in args.specs]
    results = []
    for p in paths:
        r = deliver(p, check=args.check)
        results.append(r)
        print(json.dumps({k: v for k, v in r.items() if k != "used"}, ensure_ascii=False))
    if args.check:
        return 0 if all(r["ok"] for r in results) else 1
    (C.COORD / "render_results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    if args.all:
        rows = manifest_rows(results)
        C.write_if_changed(C.LANDMARK_DIR / "manifest.yaml", C.manifest_bytes(rows))
        print(f"manifest: {len(rows)} 条 -> {C.rel(C.LANDMARK_DIR / 'manifest.yaml')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
