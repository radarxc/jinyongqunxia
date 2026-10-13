#!/usr/bin/env python3
"""大地图城镇分档图集（AR-113 · docs/tech/13 §5.2）。

从 assets/default/map/kit/ 的水墨城池 / 关隘 / 寺观 / 门派 / 遗迹件确定性生成：
  assets/default/map/markers/map_markers_atlas.webp   3×3 格，每格 128×128，透明，WebP 无损
  assets/default/map/markers/atlas.json               各 marker 格位与锚点（格内像素，落在节点坐标上的点）
  assets/default/map/markers/manifest.yaml            图集一条（字段按 assets/README.md）
  .agents/coord/ART-worldmap-landmarks/qa/markers_*   样张（30 / 44 / 60 px 摆在底图同一区域）

用法：
  python3 tools/map/paint/landmarks/build_markers.py           # 生成并写盘（内容不变则不改文件）
  python3 tools/map/paint/landmarks/build_markers.py --check   # 只在内存重建，与盘上图集 / atlas.json 逐字节比对
  python3 tools/map/paint/landmarks/build_markers.py --sample  # 另出样张

选件判据（每类挑一件，缩到 30–60 px 仍可辨）：
  city_large      map_kit_dacheng_02  长方城垣 + 密集街坊 + 四隅城楼，轮廓与州府件明显不同（更宽、更密）
  city_prefecture map_kit_zhoufu_01   城垣与城门清楚、城内较疏，比大城轻
  city_county     map_kit_xianzhen_01 无城垣的屋舍簇，与有城池两级拉开
  village         map_kit_cunluo_01   三两茅舍一株大树，最轻
  pass            map_kit_guanai_01   两山夹一道城墙与门楼，关口居中
  ruin            ico_map_kit_yiji_01 断墙残殿与乱石，浅赭色调
  sect            ico_map_kit_menpai_01 方正院落 + 大门，轮廓方
  temple          ico_map_kit_simiao_01 殿宇 + 楼阁式塔，塔尖在小尺寸仍可见
  daoist          ico_map_kit_daoguan_02 竖长山门石阶通殿，轮廓竖长，与寺庙件区分
锚点（源图像素，人工在网格叠图上量取，见 README）：城池类取城垣围合中心，关隘取门洞底边，其余取主体院落地面中心。
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C  # noqa: E402

CELL = 128
PAD = 2  # 每格四边留 2 px 透明，防止 CSS 缩放取样串格
COLS = 3
SCHEMA = "tianshu.map-markers.v1"
ATLAS_ID = "map_markers_atlas"
ATLAS_FILE = "map_markers_atlas.webp"

# key, kit 件, 源图锚点 (x, y)（像素，左上原点）, 中文名, 锚点说明
MARKERS: list[tuple[str, str, tuple[float, float], str, str]] = [
    ("city_large", "map_kit_dacheng_02", (527.0, 497.0), "大城", "城垣四角（215,295）（900,400）（870,690）（135,560）平均＝城心"),
    ("city_prefecture", "map_kit_zhoufu_01", (275.0, 252.0), "州府", "八边城垣围合中心＝城心"),
    ("city_county", "map_kit_xianzhen_01", (250.0, 258.0), "县镇", "屋舍簇中央空地"),
    ("village", "map_kit_cunluo_01", (258.0, 278.0), "村落", "三处茅舍之间地面"),
    ("pass", "map_kit_guanai_01", (240.0, 290.0), "关隘", "门洞底边中点＝关口"),
    ("ruin", "ico_map_kit_yiji_01", (255.0, 285.0), "遗迹", "残殿地面中心"),
    ("sect", "ico_map_kit_menpai_01", (255.0, 262.0), "门派", "院落中心"),
    ("temple", "ico_map_kit_simiao_01", (262.0, 275.0), "寺庙", "寺院围墙内地面中心"),
    ("daoist", "ico_map_kit_daoguan_02", (252.0, 290.0), "道观", "主殿与石阶院落中心"),
]


def kit_path(kit_id: str) -> Path:
    return C.KIT / f"{kit_id}.png"


def build_cell(kit_id: str, anchor_src: tuple[float, float]) -> tuple[Image.Image, tuple[float, float]]:
    src = C.load_rgba(kit_path(kit_id))
    l, t, r, b = C.alpha_bbox(src, threshold=16)
    w, h = r - l, b - t
    box = CELL - 2 * PAD
    s = box / max(w, h)
    nw, nh = max(1, round(w * s)), max(1, round(h * s))
    crop = src.crop((l, t, r, b))
    small = C.resize_rgba(crop, (nw, nh))
    small = C.unsharp_premul(small, sigma=0.7, amount=0.55)
    cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    ox, oy = (CELL - nw) // 2, (CELL - nh) // 2
    cell.alpha_composite(small, dest=(ox, oy))
    ax = ox + (anchor_src[0] - l) * (nw / w)
    ay = oy + (anchor_src[1] - t) * (nh / h)
    return cell, (round(ax, 1), round(ay, 1))


def build() -> tuple[Image.Image, dict, list[dict]]:
    rows = (len(MARKERS) + COLS - 1) // COLS
    atlas = Image.new("RGBA", (CELL * COLS, CELL * rows), (0, 0, 0, 0))
    markers: dict[str, dict] = {}
    refs: list[dict] = []
    for i, (key, kit_id, anchor_src, label, note) in enumerate(MARKERS):
        cell, anchor = build_cell(kit_id, anchor_src)
        x, y = (i % COLS) * CELL, (i // COLS) * CELL
        atlas.alpha_composite(cell, dest=(x, y))
        markers[key] = {"x": x, "y": y, "w": CELL, "h": CELL, "anchor": [anchor[0], anchor[1]],
                        "source": kit_id, "label": label}
        refs.append({"path": C.rel(kit_path(kit_id)), "sha256": C.sha256_file(kit_path(kit_id)),
                     "use": f"{key}（{label}）：整件按 alpha≥16 包围盒等比缩入 124 px、居中；锚点 {note}"})
    arr = np.asarray(atlas).copy()
    arr[arr[..., 3] == 0, :3] = 0
    atlas = Image.fromarray(arr, "RGBA")
    doc = {"schema": SCHEMA, "cell": CELL, "image": ATLAS_FILE, "width": atlas.width, "height": atlas.height,
           "markers": markers}
    return atlas, doc, refs


def manifest_rows(webp: bytes, refs: list[dict], atlas_json: bytes, size: tuple[int, int]) -> list[dict]:
    path = C.MARKERS_DIR / "manifest.yaml"
    old = C.read_manifest(path)
    sha = C.sha256_bytes(webp)
    row = {
        "id": ATLAS_ID,
        "file": ATLAS_FILE,
        "category": "map",
        "style": "default",
        "subject": "江湖大地图城镇分档图标图集（AR-113 · tech/13 §5.2）：大城 / 州府 / 县镇 / 村落 / 关隘 / 遗迹 / 门派 / 寺庙 / 道观九件，"
                   "取自 map/kit 水墨件，3×3 格、每格 128×128 透明；格位与锚点见同目录 atlas.json。",
        "atlas": "atlas.json",
        "atlas_sha256": C.sha256_bytes(atlas_json),
        "cell": CELL,
        "markers": [m[0] for m in MARKERS],
        "prompt": "（无：程序合成，未调用出图模型）",
        "negative": "（程序只缩放、居中与轻度锐化，不增删笔墨、不加文字）",
        "references": refs,
        "tool": "python3 合成（tools/map/paint/landmarks/build_markers.py：Pillow 预乘 Lanczos 缩放 + 预乘空间 USM σ0.7×0.55，WebP 无损）",
        "model": "（无：确定性合成）",
        "effort": "n/a",
        "created": C.keep_created(old, ATLAS_ID, sha),
        "source_path": "tools/map/paint/landmarks/build_markers.py",
        "size": f"{size[0]}x{size[1]}",
        "sha256": sha,
        "status": "candidate",
        "notes": "每格四边留 2 px 透明防串格；锚点为格内像素（城池取城心、关隘取关口、其余取院落地面中心），"
                 "在源件网格叠图上人工量取后按缩放换算。样张见 .agents/coord/ART-worldmap-landmarks/qa/markers_sample.png。"
                 "复核：python3 tools/map/paint/landmarks/build_markers.py --check。",
    }
    others = [r for r in old if r.get("id") != ATLAS_ID]
    return [row] + others


def sample(atlas: Image.Image, doc: dict) -> None:
    """图集各件按 30 / 44 / 60 px 摆在底图同一区域（中原：开封—洛阳一带），另附 2× 放大与格位锚点图。"""
    base = Image.open(C.BASE_MAP).convert("RGBA")
    s = base.width / 512
    cx, cy = 318 * s, 212 * s  # 网格 (318, 212)：洛阳—开封之间
    W, H = 760, 330
    win = base.crop((int(cx - W / 2), int(cy - H / 2), int(cx + W / 2), int(cy + H / 2)))
    d = ImageDraw.Draw(win)
    f = C.font(13)
    keys = list(doc["markers"].keys())
    col_w = W / len(keys)
    for r, size in enumerate((30, 44, 60)):
        y_node = 60 + r * 95
        for i, key in enumerate(keys):
            m = doc["markers"][key]
            cell = atlas.crop((m["x"], m["y"], m["x"] + m["w"], m["y"] + m["h"]))
            k = size / CELL
            icon = cell.resize((size, size), Image.LANCZOS)
            nx = col_w * (i + 0.5)
            ax, ay = m["anchor"][0] * k, m["anchor"][1] * k
            win.alpha_composite(icon, dest=(int(round(nx - ax)), int(round(y_node - ay))))
            if r == 0:
                d.text((nx, 8), m["label"], font=f, fill=(40, 34, 26, 255), anchor="mt")
        d.text((6, y_node - 6), f"{size}px", font=C.font(11), fill=(120, 40, 30, 255))
    C.QA_DIR.mkdir(parents=True, exist_ok=True)
    win.convert("RGB").save(C.QA_DIR / "markers_sample.png")
    win.resize((W * 2, H * 2), Image.LANCZOS).convert("RGB").save(C.QA_DIR / "markers_sample_2x.png")
    # 格位与锚点核对图
    sheet = Image.new("RGBA", (atlas.width * 2, atlas.height * 2), (233, 223, 200, 255))
    big = atlas.resize((atlas.width * 2, atlas.height * 2), Image.LANCZOS)
    sheet.alpha_composite(big)
    d = ImageDraw.Draw(sheet)
    for key, m in doc["markers"].items():
        x0, y0 = m["x"] * 2, m["y"] * 2
        d.rectangle([x0, y0, x0 + m["w"] * 2 - 1, y0 + m["h"] * 2 - 1], outline=(150, 110, 90, 255))
        ax, ay = x0 + m["anchor"][0] * 2, y0 + m["anchor"][1] * 2
        d.line([(ax - 7, ay), (ax + 7, ay)], fill=(200, 20, 20, 255), width=2)
        d.line([(ax, ay - 7), (ax, ay + 7)], fill=(200, 20, 20, 255), width=2)
        d.text((x0 + 4, y0 + 4), f"{key} {m['label']}", font=C.font(12), fill=(40, 34, 26, 255))
    sheet.convert("RGB").save(C.QA_DIR / "markers_cells_anchor.png")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--sample", action="store_true")
    args = ap.parse_args()
    atlas, doc, refs = build()
    webp = C.webp_bytes(atlas, lossless=True)
    doc_bytes = C.json_bytes(doc)
    if args.check:
        ok = True
        for path, data in ((C.MARKERS_DIR / ATLAS_FILE, webp), (C.MARKERS_DIR / "atlas.json", doc_bytes)):
            same = path.exists() and path.read_bytes() == data
            ok &= same
            print(("OK   " if same else "DIFF ") + C.rel(path))
        # 二次独立构建逐字节一致
        atlas2, doc2, _ = build()
        same2 = C.webp_bytes(atlas2, lossless=True) == webp and C.json_bytes(doc2) == doc_bytes
        print(("OK   " if same2 else "DIFF ") + "两次独立构建逐字节一致")
        missing = [k for k in ("city_large", "city_prefecture", "city_county", "village", "pass", "ruin", "sect",
                               "temple", "daoist") if k not in doc["markers"]]
        print("OK   键名齐全" if not missing else f"DIFF 缺键 {missing}")
        return 0 if ok and same2 and not missing else 1
    C.write_if_changed(C.MARKERS_DIR / ATLAS_FILE, webp)
    C.write_if_changed(C.MARKERS_DIR / "atlas.json", doc_bytes)
    rows = manifest_rows(webp, refs, doc_bytes, atlas.size)
    C.write_if_changed(C.MARKERS_DIR / "manifest.yaml", C.manifest_bytes(rows))
    print(f"atlas {atlas.size} webp {len(webp)} B sha256 {C.sha256_bytes(webp)}")
    for k, m in doc["markers"].items():
        print(f"  {k:16s} cell=({m['x']},{m['y']}) anchor={m['anchor']} source={m['source']}")
    if args.sample:
        sample(atlas, doc)
        print("sample ->", C.rel(C.QA_DIR / "markers_sample.png"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
