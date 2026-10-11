#!/usr/bin/env python3
"""名城小景质检（AR-113）：把小景按 manifest 的 anchor / footprint_grid 放到底图节点上，
按默认缩放（底图像素 × 0.75）与最大缩放（× 1.875）各截一张；并出首批总览（年代标注）。

  python3 tools/map/paint/landmarks/qa_landmarks.py              # 读 assets/default/map/landmark/manifest.yaml 全部条目
  python3 tools/map/paint/landmarks/qa_landmarks.py --ids a b    # 只出指定条目
输出：.agents/coord/ART-worldmap-landmarks/qa/<id>__z075.png、<id>__z1875.png、overview.png
节点坐标取该条目首个适用章节的 content/world/chNN/map.yaml（只读）。
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C  # noqa: E402

GRID_W = 512
ZOOMS = {"z075": 0.75, "z1875": 1.875}
WIN = (900, 600)  # 截图窗口（屏幕像素）


def chapter_nodes(ch: str) -> dict:
    p = C.ROOT / "content" / "world" / ch / "map.yaml"
    d = json.loads(p.read_text(encoding="utf-8"))
    m = d["actions"][0]["map"]
    return {n["id"]: n for n in m["nodes"]}


def place(base: Image.Image, row: dict, node_pt, s: float, win_center):
    """返回 (截图 RGB, 小景屏幕框)。s = 屏幕像素 / 底图像素。"""
    bpx = base.width / GRID_W
    cx, cy = node_pt[0] * bpx, node_pt[1] * bpx
    ww, wh = WIN
    # 底图窗口（底图像素）
    bw, bh = ww / s, wh / s
    x0, y0 = win_center[0] * bpx - bw / 2, win_center[1] * bpx - bh / 2
    crop = base.crop((int(x0), int(y0), int(x0 + bw), int(y0 + bh))).resize((ww, wh), Image.LANCZOS).convert("RGBA")
    im = C.load_rgba(C.LANDMARK_DIR / row["file"])
    disp_w = row["footprint_grid"] * bpx * s
    disp_w = max(disp_w, 56.0)
    k = disp_w / im.width
    lm = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    sx, sy = (cx - x0) * s, (cy - y0) * s
    ax, ay = row["anchor"][0] * k, row["anchor"][1] * k
    crop.alpha_composite(lm, dest=(int(round(sx - ax)), int(round(sy - ay))))
    return crop, (sx, sy, lm.width, lm.height, sx - ax, sy - ay)


def shot(row: dict, base: Image.Image, nodes: dict, zoom_key: str) -> Image.Image:
    s = ZOOMS[zoom_key]
    node = nodes[row["node"]]
    im, (sx, sy, lw, lh, lx, ly) = place(base, row, node["point"], s, node["point"])
    d = ImageDraw.Draw(im)
    bpx = base.width / GRID_W
    x0 = node["point"][0] * bpx - WIN[0] / s / 2
    y0 = node["point"][1] * bpx - WIN[1] / s / 2
    f12, f14, f17 = C.font(12), C.font(14), C.font(17)
    for nid, n in nodes.items():
        if not n.get("open", True) and nid != row["node"]:
            continue
        px, py = (n["point"][0] * bpx - x0) * s, (n["point"][1] * bpx - y0) * s
        if not (-20 < px < WIN[0] + 20 and -20 < py < WIN[1] + 20):
            continue
        if nid == row["node"]:
            d.text((px, ly + lh + 2), n["name"], font=f17, fill=(40, 30, 22, 255), anchor="mt", stroke_width=2,
                   stroke_fill=(240, 230, 208, 255))
            d.ellipse([px - 3, py - 3, px + 3, py + 3], outline=(200, 30, 30, 255), width=2)
        else:
            d.ellipse([px - 4, py - 4, px + 4, py + 4], fill=(120, 90, 60, 255))
            d.text((px, py + 6), n["name"], font=f12, fill=(50, 40, 30, 255), anchor="mt", stroke_width=2,
                   stroke_fill=(240, 230, 208, 255))
    d.rectangle([0, 0, WIN[0] - 1, 26], fill=(250, 246, 236, 220))
    zl = {"z075": "默认缩放 ×0.75", "z1875": "最大缩放 ×1.875"}[zoom_key]
    d.text((8, 5), f"{row['id']} · {zl}（小景宽 {lw}px，footprint {row['footprint_grid']}）· 章节 {','.join(row['chapters'])}",
           font=f14, fill=(40, 30, 22, 255))
    return im.convert("RGB")


CITY_CN = {"city_beijing": "北京", "city_xian": "长安 / 西安", "city_kaifeng": "开封", "city_hangzhou": "杭州", "city_luoyang": "洛阳",
           "city_nanjing": "南京", "city_dali": "大理", "city_xiangyang": "襄阳"}
NODE_ORDER = ["city_beijing", "city_xian", "city_kaifeng", "city_luoyang", "city_hangzhou", "city_nanjing", "city_dali", "city_xiangyang"]


def overview(rows: list[dict], src_dir: Path = None, title: str = "") -> Image.Image:
    src_dir = src_dir or C.LANDMARK_DIR
    rows = sorted(rows, key=lambda r: (NODE_ORDER.index(r["node"]) if r["node"] in NODE_ORDER else 99, (r.get("years") or [0])[0]))
    cell_w, cell_h = 300, 225
    cols = 4
    by_node: dict[str, list[dict]] = {}
    for r in rows:
        by_node.setdefault(r["node"], []).append(r)
    nrows = sum((len(v) + cols - 1) // cols for v in by_node.values())
    sheet = Image.new("RGB", (cell_w * cols, 46 + nrows * (cell_h + 52) + 34 * len(by_node)), (233, 223, 200))
    d = ImageDraw.Draw(sheet)
    d.text((10, 12), title or "名城按年代布局小景 · 按年代排列 · 底色为纸色（非底图）", font=C.font(18), fill=(40, 30, 22))
    y = 46
    for node, items in by_node.items():
        d.text((10, y + 4), CITY_CN.get(node, node), font=C.font(20), fill=(120, 40, 30))
        y += 34
        for i, r in enumerate(items):
            if i and i % cols == 0:
                y += cell_h + 52
            im = C.load_rgba(src_dir / r["file"])
            im.thumbnail((cell_w - 14, cell_h - 10), Image.LANCZOS)
            x = (i % cols) * cell_w
            sheet.paste(im.convert("RGB"), (x + (cell_w - im.width) // 2, y + (cell_h - im.height) // 2), im.getchannel("A"))
            title_ = r["subject"].split("：")[0].split("·", 1)[-1]
            head = title_.split("（")[0]
            sub = title_[len(head):].strip("（）")
            d.text((x + cell_w / 2, y + cell_h + 2), head, font=C.font(15), fill=(40, 30, 22), anchor="mt")
            d.text((x + cell_w / 2, y + cell_h + 21), (sub[:22] + "…") if len(sub) > 22 else sub, font=C.font(11), fill=(90, 70, 50), anchor="mt")
            d.text((x + cell_w / 2, y + cell_h + 36), "章节 " + "、".join(r["chapters"]), font=C.font(11), fill=(120, 60, 40), anchor="mt")
        y += cell_h + 52
    return sheet


def ink_compare(ids: list[str], before_dir: Path, base: Image.Image) -> Image.Image:
    """kit 大城 / 州府件与调墨前后小景在 60 / 90 / 150 px 下并排（底为底图平原区）。"""
    def fit(im, w):
        a = np.asarray(im.getchannel("A"))
        ys, xs = np.nonzero(a > 16)
        im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
        return im.resize((w, max(1, round(im.height * w / im.width))), Image.LANCZOS)
    rowh = 120
    bg = Image.new("RGBA", (1180, len(ids) * 2 * rowh + 50), (230, 214, 184, 255))  # 底图平原纸色（采样中位数），不拉伸底图
    d = ImageDraw.Draw(bg)
    d.text((10, 8), "调墨前后对照：左 kit 大城 / 州府件（60 / 90 px），右小景（60 / 90 / 150 px）", font=C.font(15), fill=(40, 30, 22, 255))
    kit = [C.load_rgba(C.KIT / "map_kit_dacheng_02.png"), C.load_rgba(C.KIT / "map_kit_zhoufu_01.png")]
    row = 0
    for i in ids:
        for tag, src in (("调墨前", before_dir / f"{i}.webp"), ("调墨后", C.LANDMARK_DIR / f"{i}.webp")):
            if not src.exists():
                continue
            y = 40 + row * rowh
            x = 10
            for k in kit:
                for w in (60, 90):
                    t = fit(k, w)
                    bg.alpha_composite(t, (x, y + rowh // 2 - t.height // 2))
                    x += w + 10
            x += 24
            im = C.load_rgba(src)
            for w in (60, 90, 150):
                t = fit(im, w)
                bg.alpha_composite(t, (x, y + rowh // 2 - t.height // 2))
                x += w + 14
            d.text((x + 6, y + rowh // 2 - 8), f"{i.replace('map_landmark_', '')} {tag}", font=C.font(13), fill=(120, 30, 20, 255))
            row += 1
    return bg.convert("RGB")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--ids", nargs="*")
    args = ap.parse_args()
    rows = C.read_manifest(C.LANDMARK_DIR / "manifest.yaml")
    if args.ids:
        rows = [r for r in rows if r["id"] in args.ids]
    base = Image.open(C.BASE_MAP).convert("RGB")
    C.QA_DIR.mkdir(parents=True, exist_ok=True)
    cache: dict[str, dict] = {}
    for r in rows:
        ch = r["chapters"][0]
        if ch not in cache:
            cache[ch] = chapter_nodes(ch)
        for zk in ZOOMS:
            shot(r, base, cache[ch], zk).save(C.QA_DIR / f"{r['id']}__{zk}.png")
        print("qa", r["id"])
    if not args.ids:
        overview(rows, title="名城按年代布局小景（调墨 v2 后）· 按年代排列 · 底色为纸色（非底图）").save(C.QA_DIR / "overview.png")
        print("overview ->", C.rel(C.QA_DIR / "overview.png"))
        before = C.COORD / "before_ink"
        if (before / "manifest.yaml").exists():
            brows = C.read_manifest(before / "manifest.yaml")
            overview(brows, src_dir=before, title="首批 13 张 · 调墨前（2026-10-11 首批交付版，已提交 4f66ad895）").save(C.QA_DIR / "overview_before_ink.png")
            ink_compare([r["id"] for r in sorted(brows, key=lambda r: r["id"])], before, base).save(C.QA_DIR / "ink_compare.png")
            print("before/after ->", C.rel(C.QA_DIR / "overview_before_ink.png"), C.rel(C.QA_DIR / "ink_compare.png"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
