#!/usr/bin/env python3
"""Generate high-resolution GIS Eurasia geographical texture for world map.
Transforms Natural Earth vector GIS data, terrain layers, and the classical
Chinese ink-wash painting into a magnificent, seamless, authentic continental map texture.
"""

import json
import math
import os
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]

# World coordinate bounds for the Eurasia geographic texture
# X in [-32.0, 20.0] (width 52.0), Z in [-22.0, 18.0] (height 40.0)
X_MIN = -32.0
X_MAX = 20.0
Z_MIN = -22.0
Z_MAX = 18.0

TEX_W = 3120
TEX_H = 2400

class Albers:
    phi1 = math.radians(25.0)
    phi2 = math.radians(47.0)
    lambda0 = math.radians(105.0)
    phi0 = math.radians(35.0)

    @property
    def n(self):
        return 0.5 * (math.sin(self.phi1) + math.sin(self.phi2))

    @property
    def c(self):
        return math.cos(self.phi1) ** 2 + 2.0 * self.n * math.sin(self.phi1)

    @property
    def rho0(self):
        return math.sqrt(self.c - 2.0 * self.n * math.sin(self.phi0)) / self.n

    def raw(self, lon: float, lat: float):
        lam, phi = math.radians(lon), math.radians(lat)
        theta = self.n * (lam - self.lambda0)
        rho = math.sqrt(max(0.0, self.c - 2.0 * self.n * math.sin(phi))) / self.n
        return rho * math.sin(theta), self.rho0 - rho * math.cos(theta)

alb = Albers()

def lonlat_to_world(lon: float, lat: float):
    rx, ry = alb.raw(lon, lat)
    px = 457.63326 * rx + 264.42872
    py = -460.37936 * ry + 212.67883
    wx = (px * 20.0) / 512.0 - 10.0
    wz = (py * 20.0) / 512.0 - 7.5
    return wx, wz

def canvas_to_world(cx: float, cy: float):
    SCALE = 3653.6497951142555
    OFFSET_X = 2107.2258240874107
    OFFSET_Y = 1699.920898071533
    rx = (cx - OFFSET_X) / SCALE
    ry = (OFFSET_Y - cy) / SCALE
    wx = 17.8763 * rx + 0.329
    wz = -17.9835 * ry + 0.807
    return wx, wz

def world_to_tex(wx: float, wz: float):
    tx = (wx - X_MIN) / (X_MAX - X_MIN) * TEX_W
    ty = (wz - Z_MIN) / (Z_MAX - Z_MIN) * TEX_H
    return tx, ty

def lonlat_to_tex(lon: float, lat: float):
    wx, wz = lonlat_to_world(lon, lat)
    return world_to_tex(wx, wz)

def canvas_to_tex(cx: float, cy: float):
    wx, wz = canvas_to_world(cx, cy)
    return world_to_tex(wx, wz)

def make_stamp(img_crop, bg_color=(226, 212, 189), threshold=10.0):
    """Extract an isolated semi-transparent mountain brush stamp from the master painting."""
    arr = np.array(img_crop.convert('RGB'), dtype=np.float32)
    h, w, _ = arr.shape
    bg = np.array(bg_color, dtype=np.float32)
    diff = np.linalg.norm(arr - bg, axis=2)
    alpha = np.clip((diff - threshold) / 28.0, 0.0, 1.0)
    
    # Smooth elliptical vignette
    yy, xx = np.mgrid[0:h, 0:w]
    nx = (xx - w / 2.0) / (w / 2.0)
    ny = (yy - h / 2.0) / (h / 2.0)
    dist_r = np.sqrt(nx**2 + ny**2)
    vignette = np.clip(1.0 - (dist_r - 0.55) / 0.4, 0.0, 1.0)
    alpha *= vignette
    
    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[:, :, :3] = arr.astype(np.uint8)
    out[:, :, 3] = (alpha * 255.0).astype(np.uint8)
    return Image.fromarray(out)

def stamp_mountains(target_img, stamp, coords, spacing=48, base_scale=0.9, seed=42):
    """Stamp classical ink-wash mountains along given coordinates."""
    pts = [lonlat_to_tex(lon, lat) for lon, lat in coords]
    if len(pts) < 2:
        return
    rng = np.random.RandomState(seed)
    
    samples = []
    for i in range(len(pts) - 1):
        p0, p1 = pts[i], pts[i + 1]
        dist = math.hypot(p1[0] - p0[0], p1[1] - p0[1])
        steps = max(2, int(dist / spacing))
        for s in range(steps):
            t = (s + 0.4 * rng.rand()) / steps
            x = p0[0] + (p1[0] - p0[0]) * t
            y = p0[1] + (p1[1] - p0[1]) * t
            # Lateral jitter
            dx = (p1[1] - p0[1]) / (dist + 1e-4) * (rng.rand() - 0.5) * 16.0
            dy = -(p1[0] - p0[0]) / (dist + 1e-4) * (rng.rand() - 0.5) * 16.0
            sc = base_scale * (0.8 + rng.rand() * 0.4)
            flip = rng.rand() > 0.5
            samples.append((x + dx, y + dy, sc, flip))
            
    # Sort roughly north-to-south
    samples.sort(key=lambda s: s[1])
    
    sw, sh = stamp.size
    for x, y, sc, flip in samples:
        cur_w = int(sw * sc)
        cur_h = int(sh * sc)
        resized = stamp.resize((cur_w, cur_h), Image.Resampling.LANCZOS)
        if flip:
            resized = resized.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        px = int(x - cur_w / 2)
        py = int(y - cur_h / 2)
        target_img.alpha_composite(resized, (px, py))

def draw_ink_river(draw, coords, base_width=3, color=(68, 102, 118, 230)):
    """Draw organic ink-wash river with slight line width progression."""
    pts = [lonlat_to_tex(lon, lat) for lon, lat in coords]
    if len(pts) < 2:
        return
    for i in range(len(pts) - 1):
        p0, p1 = pts[i], pts[i + 1]
        progress = i / max(1, len(pts) - 2)
        w = max(1, int(base_width * (0.8 + progress * 0.5)))
        draw.line([p0, p1], fill=color, width=w, joint="curve")

def main():
    print(f"Generating master GIS Eurasia geographic texture: {TEX_W}x{TEX_H}...")
    
    # 1. Base Transparent Layer (Ocean is transparent to reveal ocean wave skirt)
    img = Image.new("RGBA", (TEX_W, TEX_H), (0, 0, 0, 0))

    # 2. Load GIS land polygons from regions.yaml
    regions_path = ROOT / "docs" / "design" / "map" / "regions.yaml"
    with open(regions_path, "r", encoding="utf-8") as f:
        reg_data = json.load(f)
    
    raw_polys = reg_data.get("land_polygons", [])
    island_masks = reg_data.get("island_masks", [])
    
    # Clean Poly 0 to remove African sub-loop (indices 2428 to 3119)
    if raw_polys:
        p0 = raw_polys[0]
        eurasia_poly = p0[:2428] + p0[3120:]
        land_polys = [eurasia_poly] + raw_polys[1:]
    else:
        land_polys = []
    
    # Create Land Mask
    land_mask = Image.new("L", (TEX_W, TEX_H), 0)
    mask_draw = ImageDraw.Draw(land_mask)
    
    # Coastal shallow water glow into ocean
    glow_img = Image.new("RGBA", (TEX_W, TEX_H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    for poly in land_polys:
        pts = [lonlat_to_tex(p[0], p[1]) for p in poly]
        if len(pts) >= 3:
            mask_draw.polygon(pts, fill=255)
            glow_draw.polygon(pts, fill=(205, 226, 234, 180))
            glow_draw.line(pts + [pts[0]], fill=(205, 226, 234, 180), width=28)
            
    for mask in island_masks:
        lon, lat, r = mask[0], mask[1], mask[2]
        tx, ty = lonlat_to_tex(lon, lat)
        tr = max(2.5, (r * 18.0 / 512.0 * 20.0) / (X_MAX - X_MIN) * TEX_W * 1.5)
        mask_draw.ellipse([tx - tr, ty - tr * 0.75, tx + tr, ty + tr * 0.75], fill=255)
        glow_draw.ellipse([tx - tr * 2.0, ty - tr * 1.5, tx + tr * 2.0, ty + tr * 1.5], fill=(205, 226, 234, 180))
    
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(12))
    img.alpha_composite(glow_img)

    # 3. Land Surface Base Layer
    # Base antique parchment tone: #e2d4bd (226, 212, 189) precisely matching the core painting border
    land_surface = Image.new("RGBA", (TEX_W, TEX_H), (226, 212, 189, 255))
    
    # Add authentic paper grain & fibers to land
    rng = np.random.RandomState(888)
    paper_noise = rng.randint(-5, 6, (TEX_H, TEX_W, 3), dtype=np.int16)
    land_arr = np.array(land_surface.convert("RGB"), dtype=np.int16)
    land_arr[:, :, :3] += paper_noise
    np.clip(land_arr, 0, 255, out=land_arr)
    land_surface = Image.fromarray(land_arr.astype(np.uint8)).convert("RGBA")
    land_draw = ImageDraw.Draw(land_surface)

    # 4. Load Real GIS Topography Layers from tools/map/terrain/layers/
    terrain_dir = ROOT / "tools" / "map" / "terrain" / "layers"
    
    # Basins & Plains: soft fertile mineral wash #dbe2cc
    plain_wash = Image.new("RGBA", (TEX_W, TEX_H), (0, 0, 0, 0))
    plain_draw = ImageDraw.Draw(plain_wash)
    basins_path = terrain_dir / "basins_plains.json"
    if basins_path.exists():
        with open(basins_path, "r", encoding="utf-8") as f:
            basins = json.load(f)
        for feat in basins.get("features", []):
            coords = feat["geometry"]["coordinates"]
            for ring in coords:
                pts = [canvas_to_tex(p[0], p[1]) for p in ring]
                if len(pts) >= 3:
                    plain_draw.polygon(pts, fill=(216, 224, 202, 110))
    plain_wash = plain_wash.filter(ImageFilter.GaussianBlur(16))
    land_surface.alpha_composite(plain_wash)

    # Plateaus & Highlands: soft muted stone ochre wash #d0c5ab
    plat_wash = Image.new("RGBA", (TEX_W, TEX_H), (0, 0, 0, 0))
    plat_draw = ImageDraw.Draw(plat_wash)
    plat_path = terrain_dir / "plateaus.json"
    if plat_path.exists():
        with open(plat_path, "r", encoding="utf-8") as f:
            plats = json.load(f)
        for feat in plats.get("features", []):
            coords = feat["geometry"]["coordinates"]
            for ring in coords:
                pts = [canvas_to_tex(p[0], p[1]) for p in ring]
                if len(pts) >= 3:
                    plat_draw.polygon(pts, fill=(206, 196, 172, 120))
    plat_wash = plat_wash.filter(ImageFilter.GaussianBlur(18))
    land_surface.alpha_composite(plat_wash)

    # Hills: delicate mineral hill shading #c2b59b
    hill_wash = Image.new("RGBA", (TEX_W, TEX_H), (0, 0, 0, 0))
    hill_draw = ImageDraw.Draw(hill_wash)
    hills_path = terrain_dir / "hills.json"
    if hills_path.exists():
        with open(hills_path, "r", encoding="utf-8") as f:
            hills = json.load(f)
        for feat in hills.get("features", []):
            coords = feat["geometry"]["coordinates"]
            for ring in coords:
                pts = [canvas_to_tex(p[0], p[1]) for p in ring]
                if len(pts) >= 3:
                    hill_draw.polygon(pts, fill=(194, 182, 156, 90))
    hill_wash = hill_wash.filter(ImageFilter.GaussianBlur(14))
    land_surface.alpha_composite(hill_wash)

    # 5. Major Inland Water Bodies (Seas and Lakes) across Eurasia
    inland_waters = [
        # Caspian Sea (里海)
        [(50.5, 47.0), (51.5, 45.0), (53.0, 42.5), (54.0, 40.0), (53.5, 38.0), (52.0, 36.8), (49.5, 37.5), (49.0, 40.5), (48.0, 43.0), (47.0, 46.5), (50.5, 47.0)],
        # Black Sea (黑海)
        [(28.0, 42.0), (30.5, 46.2), (35.0, 46.8), (38.5, 45.5), (41.5, 42.0), (39.0, 41.0), (33.0, 42.0), (29.0, 41.2), (28.0, 42.0)],
        # Aral Sea (咸海)
        [(58.0, 46.5), (61.0, 46.5), (61.5, 44.0), (59.0, 43.5), (58.0, 45.0), (58.0, 46.5)],
        # Lake Baikal (贝加尔湖)
        [(103.5, 51.5), (105.0, 52.5), (107.5, 54.0), (109.5, 55.8), (108.5, 55.5), (106.0, 53.5), (104.0, 52.0), (103.5, 51.5)],
        # Lake Balkhash (巴尔喀什湖)
        [(74.0, 45.5), (76.5, 46.5), (79.0, 46.8), (79.2, 46.0), (76.5, 45.8), (74.0, 45.5)],
    ]
    for lake in inland_waters:
        pts = [lonlat_to_tex(lon, lat) for lon, lat in lake]
        land_draw.polygon(pts, fill=(152, 180, 192, 240))
        land_draw.line(pts, fill=(58, 90, 104, 220), width=2, joint="curve")

    # 6. Major River Systems across Eurasia
    eurasia_rivers = [
        # Indus (印度河)
        [(81.0, 31.5), (78.0, 33.5), (75.0, 35.5), (72.5, 34.0), (71.0, 31.0), (69.5, 27.5), (68.0, 24.0)],
        # Ganges & Brahmaputra (恒河与布拉马普特拉河)
        [(79.0, 30.5), (82.0, 26.5), (86.0, 25.5), (89.5, 24.5), (90.5, 22.0)],
        [(94.0, 29.5), (92.5, 26.0), (89.8, 25.0)],
        # Mekong (澜沧江 - 湄公河)
        [(94.5, 33.0), (98.5, 29.0), (100.5, 22.0), (102.5, 18.0), (105.0, 15.0), (106.0, 10.5)],
        # Salween (怒江 - 萨尔温江)
        [(92.0, 32.0), (98.0, 27.0), (98.5, 20.0), (97.5, 16.5)],
        # Irrawaddy (伊洛瓦底江)
        [(97.5, 27.5), (96.0, 24.0), (95.0, 21.0), (95.5, 16.0)],
        # Ob & Irtysh (鄂毕河、额尔齐斯河)
        [(87.0, 48.0), (83.0, 50.0), (76.0, 55.0), (69.0, 61.0), (67.0, 66.5)],
        [(87.0, 51.0), (83.0, 55.0), (76.0, 59.0), (69.0, 61.0)],
        # Yenisey & Angara (叶尼塞河、安加拉河)
        [(97.0, 51.5), (92.0, 54.0), (90.0, 60.0), (86.0, 68.0)],
        [(104.0, 52.0), (101.0, 56.5), (93.0, 58.5)],
        # Lena (勒拿河)
        [(106.0, 54.0), (115.0, 60.0), (124.0, 63.5), (127.0, 68.0), (126.0, 72.0)],
        # Volga (伏尔加河)
        [(33.0, 57.0), (38.0, 57.5), (44.0, 56.5), (49.0, 55.5), (48.0, 50.0), (46.0, 48.0), (48.0, 45.5)],
        # Danube (多瑙河)
        [(9.0, 48.0), (14.0, 48.2), (19.0, 47.5), (22.0, 44.5), (28.0, 45.0)],
        # Tigris & Euphrates (底格里斯河、幼发拉底河)
        [(39.0, 38.5), (41.0, 36.5), (44.5, 33.0), (47.5, 31.0)],
        [(38.0, 39.5), (38.5, 36.0), (41.5, 34.0), (46.5, 31.5)],
        # Amu Darya & Syr Darya (阿姆河、锡尔河)
        [(72.0, 37.0), (67.0, 39.0), (62.0, 41.5), (59.0, 43.5)],
        [(74.0, 41.0), (69.0, 42.5), (65.0, 44.5), (61.5, 46.0)],
        # Heilongjiang / Amur (黑龙江)
        [(120.0, 53.0), (124.0, 53.5), (127.0, 50.5), (132.0, 48.0), (138.0, 52.0), (140.5, 53.0)],
    ]
    for r_coords in eurasia_rivers:
        draw_ink_river(land_draw, r_coords, base_width=3)

    # 7. Extract Authentic Ink-Wash Mountain Stamps from the Master Chinese Painting
    core_img_path = ROOT / "apps" / "game" / "public" / "assets" / "default" / "baseline" / "map" / "ref_map_jianghu__ch01_base01.png"
    if core_img_path.exists():
        raw_core = Image.open(core_img_path)
        stamp_snow = make_stamp(raw_core.crop((70, 500, 230, 640)))
        stamp_rock = make_stamp(raw_core.crop((620, 360, 780, 500)))
        stamp_hill = make_stamp(raw_core.crop((220, 220, 380, 350)))

        # 8. Stamp authentic mountain ranges OUTSIDE China, bridging right up to the border!
        mountain_routes = [
            # Hindu Kush & Pamir West (阿富汗、兴都库什、帕米尔西延)
            {"stamp": stamp_snow, "coords": [(64.0, 34.0), (67.0, 35.0), (70.0, 36.0), (72.5, 37.2)], "sp": 42, "sc": 0.85, "seed": 101},
            # Tian Shan West (天山山脉西段 - 哈萨克斯坦/吉尔吉斯斯坦)
            {"stamp": stamp_snow, "coords": [(69.0, 41.5), (71.5, 42.0), (73.5, 42.5)], "sp": 40, "sc": 0.85, "seed": 102},
            # Himalayas West (喀喇昆仑与喜马拉雅西段 - 巴基斯坦/克什米尔)
            {"stamp": stamp_snow, "coords": [(71.5, 35.5), (74.0, 34.0), (76.5, 32.5)], "sp": 45, "sc": 0.90, "seed": 103},
            # Alps (阿尔卑斯山脉)
            {"stamp": stamp_snow, "coords": [(6.5, 45.0), (8.5, 46.0), (11.0, 46.8), (14.0, 46.5)], "sp": 42, "sc": 0.82, "seed": 104},
            # Caucasus (高加索山脉)
            {"stamp": stamp_snow, "coords": [(40.0, 43.8), (43.0, 43.0), (46.0, 42.0), (48.5, 41.0)], "sp": 42, "sc": 0.85, "seed": 105},
            # Ural Mountains (乌拉尔山脉)
            {"stamp": stamp_rock, "coords": [(59.0, 67.0), (60.0, 63.0), (59.5, 59.0), (58.5, 55.0), (57.5, 51.5)], "sp": 44, "sc": 0.85, "seed": 106},
            # Zagros Mountains (扎格罗斯山脉)
            {"stamp": stamp_rock, "coords": [(46.0, 36.5), (48.5, 33.5), (51.5, 31.0), (55.0, 28.5)], "sp": 46, "sc": 0.85, "seed": 107},
            # Elburz & Kopet Dag (厄尔布尔士与科佩特山脉 - 伊朗北部到土库曼)
            {"stamp": stamp_rock, "coords": [(49.0, 36.8), (52.5, 36.2), (56.0, 37.0), (59.0, 38.0), (62.0, 37.0)], "sp": 42, "sc": 0.80, "seed": 108},
            # Altai Northwest (阿尔泰山俄罗斯/蒙古段)
            {"stamp": stamp_rock, "coords": [(82.0, 51.5), (85.5, 50.0), (89.0, 48.5)], "sp": 42, "sc": 0.85, "seed": 109},
            # Sayan Mountains (萨彦岭)
            {"stamp": stamp_rock, "coords": [(89.0, 53.5), (94.0, 52.8), (99.0, 52.0), (103.0, 51.5)], "sp": 44, "sc": 0.85, "seed": 110},
            # Carpathians (喀尔巴阡山脉)
            {"stamp": stamp_hill, "coords": [(19.0, 49.5), (23.5, 48.5), (25.5, 46.5), (24.0, 45.3)], "sp": 40, "sc": 0.80, "seed": 111},
            # Kazakh Uplands (哈萨克丘陵)
            {"stamp": stamp_hill, "coords": [(66.0, 50.5), (70.0, 49.8), (74.0, 49.5), (78.0, 49.0)], "sp": 46, "sc": 0.78, "seed": 112},
            # Western Ghats (印度西高止山)
            {"stamp": stamp_hill, "coords": [(73.5, 20.5), (74.5, 16.0), (76.5, 11.5)], "sp": 40, "sc": 0.75, "seed": 113},
            # Eastern Ghats (印度东高止山)
            {"stamp": stamp_hill, "coords": [(84.5, 19.5), (82.0, 16.5), (79.5, 13.5)], "sp": 40, "sc": 0.75, "seed": 114},
            # Annamite Range (中南半岛安南山脉)
            {"stamp": stamp_hill, "coords": [(102.5, 21.0), (104.5, 18.5), (106.5, 15.5), (107.5, 12.5)], "sp": 42, "sc": 0.80, "seed": 115},
            # Japan Central Alps (日本本州脊梁)
            {"stamp": stamp_rock, "coords": [(136.5, 35.0), (138.0, 36.5), (140.5, 39.0)], "sp": 40, "sc": 0.80, "seed": 116},
            # Korea Taebaek Mountains (朝鲜半岛太白山)
            {"stamp": stamp_hill, "coords": [(127.5, 39.5), (128.5, 37.5), (129.0, 35.5)], "sp": 38, "sc": 0.75, "seed": 117},
        ]
        for m in mountain_routes:
            stamp_mountains(land_surface, m["stamp"], m["coords"], spacing=m["sp"], base_scale=m["sc"], seed=m["seed"])

        # 9. Seamlessly Embed Master Chinese Painting (ref_map_jianghu__ch01_base01.png)
        print(f"Embedding master Chinese ink-wash painting into Eurasia center: {core_img_path}")
        core_img = raw_core.convert("RGBA")
        
        # Exact world coordinates: X in [-10.0, 10.0], Z in [-7.5, 7.5]
        # In texture: X in [1320, 2520] (width 1200), Y in [870, 1770] (height 900)
        core_w, core_h = 1200, 900
        core_resized = core_img.resize((core_w, core_h), Image.Resampling.LANCZOS)
        
        # Ultra-smooth cosine edge feathering mask
        MARGIN_X = 96
        MARGIN_Y = 80
        f_arr = np.ones((core_h, core_w), dtype=np.float32)
        for y in range(core_h):
            dist_y = min(y, core_h - 1 - y)
            factor_y = min(1.0, dist_y / MARGIN_Y)
            alpha_y = 0.5 - 0.5 * math.cos(factor_y * math.pi)
            f_arr[y, :] *= alpha_y
        for x in range(core_w):
            dist_x = min(x, core_w - 1 - x)
            factor_x = min(1.0, dist_x / MARGIN_X)
            alpha_x = 0.5 - 0.5 * math.cos(factor_x * math.pi)
            f_arr[:, x] *= alpha_x
            
        feather_mask = Image.fromarray((f_arr * 255.0).astype(np.uint8))
        core_resized.putalpha(feather_mask)
        
        # Alpha composite the painting directly onto the land surface at (1320, 870)
        land_surface.alpha_composite(core_resized, (1320, 870))

    # 10. Crisp Ink Coastline Contour
    for poly in land_polys:
        pts = [lonlat_to_tex(p[0], p[1]) for p in poly]
        if len(pts) >= 3:
            land_draw.line(pts + [pts[0]], fill=(52, 44, 34, 255), width=2, joint="curve")
    
    for mask in island_masks:
        lon, lat, r = mask[0], mask[1], mask[2]
        tx, ty = lonlat_to_tex(lon, lat)
        tr = max(2.5, (r * 18.0 / 512.0 * 20.0) / (X_MAX - X_MIN) * TEX_W * 1.5)
        land_draw.ellipse([tx - tr, ty - tr * 0.75, tx + tr, ty + tr * 0.75], outline=(52, 44, 34, 255), width=1)

    # 11. Composite Land Surface onto master img using Land Mask
    # The ocean remains completely transparent (alpha=0)!
    land_surface.putalpha(land_mask)
    img.alpha_composite(land_surface)

    # 12. Save output texture
    out_dir = ROOT / "apps" / "game" / "public" / "img"
    out_path = out_dir / "tex_map_eurasia.png"
    img.save(out_path, format="PNG", optimize=True)
    print(f"Successfully generated {out_path} ({out_path.stat().st_size} bytes)")

    # Save artifact preview on ocean background for inspection
    ocean_bg = Image.new("RGBA", (TEX_W, TEX_H), (150, 178, 190, 255))
    preview_composite = Image.alpha_composite(ocean_bg, img)
    artifact_path = Path("/Users/bytedance/.gemini/antigravity/brain/266def8a-da55-4552-901d-55eb01b559d0/preview_eurasia_seamless.png")
    preview_composite.save(artifact_path, format="PNG")
    print(f"Saved artifact preview to {artifact_path}")

if __name__ == "__main__":
    main()
