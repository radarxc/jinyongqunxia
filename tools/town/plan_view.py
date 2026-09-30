#!/usr/bin/env python3
"""Write a north-up town plan as editable-text SVG and a matching Chinese PNG."""

from __future__ import annotations

import argparse
from collections import defaultdict
import hashlib
from html import escape
import json
import math
from pathlib import Path
import re
import sys

from PIL import Image, ImageDraw, ImageFont

try:
    from .common import (TownError, cells_from_json, geometry_masks, load_yaml,
                         point, polygon_cells, zone_winners)
except ImportError:
    from common import (TownError, cells_from_json, geometry_masks, load_yaml,
                        point, polygon_cells, zone_winners)

ZONE_COLORS = {"palace": "#e8c8be", "princely": "#e8c8be",
               "administrative": "#d3cce2", "commercial": "#f1d6a3",
               "market": "#edc9a4", "residential": "#e0ddc9",
               "religious": "#cbdcc1", "escort": "#decabc",
               "waterfront": "#c3dcd9", "gate_service": "#c4cbd0",
               "garden": "#c3d7b4"}
ZONE_NAMES = {"palace": "皇城", "princely": "王府区", "administrative": "官署区",
              "commercial": "商业区", "market": "市集区", "residential": "住宅坊巷",
              "religious": "寺观区", "escort": "镖局区", "waterfront": "河埠仓储区",
              "gate_service": "城门服务区", "garden": "园林区"}
COLORS = {"road": "#fff2ce", "water": "#82b8c7", "bridge": "#ac8563",
          "wall": "#586466", "building": "#998c75", "landmark": "#a74f3d"}
FONT_PATHS = (
    "/System/Library/Fonts/STHeiti Medium.ttc",
    "/System/Library/Fonts/PingFang.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
    "C:/Windows/Fonts/msyh.ttc",
)


def find_font(requested=None):
    """Fail clearly instead of silently substituting missing-glyph squares."""
    for path in ([str(requested)] if requested else FONT_PATHS):
        try:
            font = ImageFont.truetype(path, 16)
            if bytes(font.getmask("城")) != bytes(font.getmask("镇")):
                return str(path)
        except OSError:
            pass
    raise TownError("未找到可用中文字体；请用 --font 指定中文 TTF/OTF/TTC 文件")


def plan_point(x, z, height, cell_px=8, left=60, top=126):
    """Grid vertices: west at left, north at top; cells use x+0.5,z+0.5."""
    return left + x * cell_px, top + (height - z) * cell_px


class Canvas:
    """Each primitive is written to both backends from one coordinate source."""

    def __init__(self, width, height, font_path):
        self.image = Image.new("RGB", (width, height), "#faf8ef")
        self.draw = ImageDraw.Draw(self.image)
        self.font_path, self.fonts = font_path, {}
        self.svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" '
                    f'height="{height}" viewBox="0 0 {width} {height}">',
                    '<style>text{font-family:"Heiti SC","PingFang SC",'
                    '"Noto Sans CJK SC","Microsoft YaHei",sans-serif}</style>',
                    f'<rect width="{width}" height="{height}" fill="#faf8ef"/>']

    def rect(self, box, fill, stroke=None, width=1):
        x0, y0, x1, y1 = box
        self.draw.rectangle((x0, y0, x1 - 0.01, y1 - 0.01),
                            fill=fill, outline=stroke, width=width)
        self.svg.append(f'<rect x="{x0:g}" y="{y0:g}" width="{x1-x0:g}" '
                        f'height="{y1-y0:g}" fill="{fill or "none"}" '
                        f'stroke="{stroke or "none"}" stroke-width="{width}"/>')

    def line(self, points, fill, width=1, dashed=False):
        if dashed:
            for (x0, y0), (x1, y1) in zip(points, points[1:]):
                length = math.hypot(x1-x0, y1-y0)
                for start in range(0, math.ceil(length), 14):
                    end = min(start + 8, length)
                    self.draw.line([(x0+(x1-x0)*t/length, y0+(y1-y0)*t/length)
                                    for t in (start, end)], fill=fill, width=width)
        else:
            self.draw.line(points, fill=fill, width=width)
        coords = " ".join(f"{x:g},{y:g}" for x, y in points)
        dash = ' stroke-dasharray="8 6"' if dashed else ""
        self.svg.append(f'<polyline points="{coords}" fill="none" '
                        f'stroke="{fill}" stroke-width="{width}"{dash}/>')

    def text(self, at, text, size=16, fill="#263b3b"):
        if size not in self.fonts:
            self.fonts[size] = ImageFont.truetype(self.font_path, size)
        self.draw.text(at, text, font=self.fonts[size], fill=fill, anchor="lt")
        self.svg.append(f'<text x="{at[0]:g}" y="{at[1]:g}" '
                        f'font-size="{size}" dominant-baseline="hanging" '
                        f'fill="{fill}">{escape(text)}</text>')


def cell_runs(cells):
    """Compact row runs keep SVG small while preserving exact raster masks."""
    rows = defaultdict(list)
    for x, z in cells:
        rows[z].append(x)
    for z, xs in sorted(rows.items()):
        ordered = sorted(set(xs))
        start = previous = ordered[0]
        for x in ordered[1:]:
            if x != previous + 1:
                yield start, z, previous + 1
                start = x
            previous = x
        yield start, z, previous + 1


def display_name(record, category):
    """A label prefix in existing basis prose requires no schema extension."""
    match = re.search(r"图名[：:]\s*([^；;\n]+)", record.get("basis", ""))
    if match:
        return match.group(1).strip()
    if record.get("display_name") or record.get("name"):
        return record.get("display_name") or record["name"]
    if category == "G":
        return {"north": "北门", "south": "南门", "east": "东门",
                "west": "西门"}.get(record.get("side"), "城门") + "（名待考）"
    if category == "Z":
        return ZONE_NAMES.get(record.get("kind"), "分区")
    if category == "R":
        return {"main_axis": "主街", "secondary": "次街",
                "alley": "坊巷"}.get(record.get("class"), "街道") + "（概化）"
    return {"W": "水系（名称待考）", "B": "桥梁（名称待考）",
            "L": "固定地标（名称待考）"}[category]


def basis_tag(basis):
    """Summary warning only; these tags never certify archaeological accuracy."""
    if "待考" in basis or "待核" in basis:
        return "待"
    if "原创" in basis:
        return "综" if "src_" in basis else "创"
    if "推定" in basis or "概化" in basis:
        return "推"
    return "据" if "src_" in basis else "推"


def _middle(points):
    """Longest segment midpoint is on the line, unlike a polyline centroid."""
    pairs = list(zip(points, points[1:]))
    a, b = max(pairs, key=lambda pair: math.dist(*pair))
    return (a[0] + b[0]) / 2, (a[1] + b[1]) / 2


def label_records(spec, winners):
    labels = []
    records = {**spec, "water_bodies": [*spec.get("rivers", []), *spec.get("lakes", [])]}
    groups = (("G", "gates"), ("R", "streets"), ("W", "rivers"),
              ("B", "bridges"), ("Z", "zones"), ("L", "landmarks"))
    for category, key in groups:
        for number, record in enumerate(records.get("water_bodies" if category == "W" else key, []), 1):
            if "at" in record:
                x, z = point(record["at"])
                at = x + 0.5, z + 0.5
            elif "origin" in record:
                x, z = point(record["origin"])
                at = x + record["size"]["w"] / 2, z + record["size"]["h"] / 2
            elif "points" in record:
                at = tuple(v + 0.5 for v in _middle([point(p) for p in record["points"]]))
            else:
                if "polygon" in record:
                    cells = polygon_cells(record["polygon"]["points"],
                                          spec["grid"]["width"], spec["grid"]["height"])
                else:
                    cells = winners.get(record["id"], set())
                if not cells:
                    continue
                center = tuple(sum(p[i] for p in cells) / len(cells) for i in (0, 1))
                x, z = min(cells, key=lambda p: (math.dist(p, center), p[1], p[0]))
                at = x + 0.5, z + 0.5
            labels.append({"code": f"{category}{number:02}", "at": at,
                           "name": display_name(record, category),
                           "tag": basis_tag(record.get("basis", "")),
                           "kind": record.get("kind"),
                           "basis": record.get("basis", ""), "id": record["id"]})
    return labels


def marker_position(anchor, used, bounds):
    """Move small codes, never geometry; leader lines retain exact anchors."""
    x, y = anchor
    candidates = [(x, y)]
    for radius in range(24, 217, 24):
        candidates.extend((x + radius * math.cos(a * math.pi / 4),
                           y + radius * math.sin(a * math.pi / 4)) for a in range(8))
    for cx, cy in candidates:
        box = (cx - 18, cy - 11, cx + 18, cy + 11)
        if not (bounds[0] <= box[0] and box[2] <= bounds[2]
                and bounds[1] <= box[1] and box[3] <= bounds[3]):
            continue
        if not any(box[0] < b[2] + 3 and box[2] > b[0] - 3
                   and box[1] < b[3] + 3 and box[3] > b[1] - 3 for b in used):
            used.append(box)
            return cx, cy
    raise TownError("地图编号过密；请增大 --cell-px，保留可辨认的标签")


def render_plan(spec, layout, output_svg, *, cell_px=None, font_path=None):
    if layout["grid"] != spec["grid"]:
        raise TownError("规格和布局的网格不一致")
    if layout.get("validation", {}).get("errors", 0):
        raise TownError("布局仍含 validation.errors，请先通过 check_town.py")
    width, height = spec["grid"]["width"], spec["grid"]["height"]
    scale = 960 / max(width, height) if cell_px is None else cell_px
    if not math.isfinite(scale) or not 2 <= scale <= 24:
        raise TownError("--cell-px 必须在 2 至 24 之间")
    masks, winners = geometry_masks(spec), zone_winners(spec)
    labels = label_records(spec, winners)
    left, top = 64, 136
    map_right, map_bottom = left + width * scale, top + height * scale
    sidebar = map_right + 40
    row_count = sum(max(1, math.ceil(len(item["name"]) / 24)) for item in labels)
    canvas_w = math.ceil(sidebar + 530)
    canvas_h = math.ceil(max(map_bottom + 132, top + row_count * 24 + 280))
    if canvas_w * canvas_h > 20_000_000:
        raise TownError("平面图超过 20 MP 离线保护限额；请减小 --cell-px")
    canvas = Canvas(canvas_w, canvas_h, find_font(font_path))
    project = lambda x, z: plan_point(x, z, height, scale, left, top)
    history = "dali.md" if spec["city_id"] == "city_dali" else "linan.md"
    canvas.svg.append('<desc>' + escape(json.dumps({"city_id": spec["city_id"],
        "north_up": True, "labels": labels, "source": layout.get("source_spec", {})},
        ensure_ascii=False)) + '</desc>')
    canvas.text((left, 25), spec["display_name"] + " · 坐标布局图", 29)
    canvas.text((left, 66), "北向上｜原点在西南角；x 向东，z 向北｜矩形为建筑占地，编号见右栏", 17)
    canvas.text((left, 94), "史料与推定混合的游戏缩比布局；历史尺度及取舍见 history/" + history, 16)
    canvas.rect((left, top, map_right, map_bottom), "#eeeade", "#919a8d")

    def paint_cells(cells, color):
        for x0, z, x1 in cell_runs(cells):
            a, b = project(x0, z + 1), project(x1, z)
            canvas.rect((*a, *b), color)

    for zone in spec["zones"]:
        paint_cells(winners[zone["id"]] & masks["interior"], ZONE_COLORS[zone["kind"]])
    roads = set().union(*(cells_from_json(c) for c in layout["roads"].values()))
    paint_cells(roads, COLORS["road"])
    paint_cells(cells_from_json(layout["water_cells"]), COLORS["water"])
    paint_cells(cells_from_json(layout["bridge_cells"]), COLORS["bridge"])
    envelope = "游戏包络" in spec["wall"]["basis"]
    if envelope:
        points = [project(*point(p)) for p in spec["wall"]["polygon"]["points"]]
        canvas.line(points + points[:1], COLORS["wall"], 3, dashed=True)
        paint_cells(masks["passages"], COLORS["road"])
        paint_cells(masks["gate_footprints"] - masks["passages"], COLORS["wall"])
    else:
        paint_cells(masks["hard"], COLORS["wall"])
    for value in range(0, width + 1, 8):
        a, b = project(value, 0), project(value, height)
        canvas.line([a, b], "#c4c4b2", 1)
        if value % 16 == 0:
            canvas.text((a[0] - 8, map_bottom + 10), str(value), 13)
    for value in range(0, height + 1, 8):
        a, b = project(0, value), project(width, value)
        canvas.line([a, b], "#c4c4b2", 1)
        if value % 16 == 0:
            canvas.text((left - 38, a[1] - 7), str(value), 13)
    landmark_keys = {(point(lm["origin"]), lm["type"]) for lm in spec["landmarks"]}
    for building in layout["buildings"]:
        x, z = point(building["origin"])
        w, h = building["size"]["w"], building["size"]["h"]
        color = "landmark" if ((x, z), building["type"]) in landmark_keys else "building"
        canvas.rect((*project(x, z + h), *project(x + w, z)), COLORS[color], "#665e53")
    used = []
    for label in labels:
        anchor = project(*label["at"])
        x, y = marker_position(anchor, used, (left-20, top-20, map_right+20, map_bottom+20))
        if math.dist(anchor, (x, y)) > 1:
            canvas.line([anchor, (x, y)], "#454c43", 1)
        canvas.rect((x-18, y-11, x+18, y+11), "#fffcf1", "#697770")
        canvas.text((x-15, y-7), label["code"], 14)
    canvas.text((left + 14, top + 13), "北 ↑", 21)
    canvas.text((map_right - 47, map_bottom + 33), "东 →", 15)
    _sidebar(canvas, labels, sidebar, top)
    bar_y = map_bottom + 54
    canvas.line([(left, bar_y), (left + 16*scale, bar_y)], "#273c3c", 3)
    for value in (0, 8, 16):
        x = left + value * scale
        canvas.line([(x, bar_y-4), (x, bar_y+4)], "#273c3c", 2)
        canvas.text((x-4, bar_y+10), str(value), 13)
    canvas.text((left + 16*scale + 18, bar_y-6), "游戏格（不作历史米制尺）", 16)
    wall_note = "虚线：原创游戏包络；不代表已知历史城墙。" if envelope else "城垣为史料约束下的缩比概化线；不代表实测墙线。"
    canvas.text((left, map_bottom + 99), wall_note, 16)
    output = Path(output_svg)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(canvas.svg + ["</svg>", ""]), encoding="utf-8")
    canvas.image.save(output.with_suffix(".png"))
    return {"svg": str(output), "png": str(output.with_suffix(".png")),
            "width": canvas_w, "height": canvas_h, "labels": len(labels),
            "font": canvas.font_path, "north_up": True}


def _sidebar(canvas, labels, x, top):
    canvas.text((x, top), "索引 / 依据提示", 22)
    headings = {"G": "城门", "R": "街道", "W": "水系", "B": "桥梁",
                "Z": "分区（颜色为用途）", "L": "固定地标"}
    category_colors = {"G": COLORS["wall"], "R": COLORS["road"],
                       "W": COLORS["water"], "B": COLORS["bridge"],
                       "L": COLORS["landmark"]}
    y, last = top + 38, None
    for label in labels:
        category = label["code"][0]
        if category != last:
            canvas.text((x, y), headings[category], 17, "#52685c")
            y, last = y + 24, category
        canvas.svg.append('<g><title>' + escape(
            f'{label["id"]} @ {label["at"]}: {label["basis"]}') + '</title>')
        color = ZONE_COLORS.get(label["kind"], category_colors.get(category, "#e0ddc9"))
        canvas.rect((x, y+2, x+12, y+15), color, "#7c8377")
        canvas.text((x+20, y), label["code"], 15)
        name = label["name"]
        for offset in range(0, len(name), 24):
            canvas.text((x+62, y), name[offset:offset+24], 16)
            if offset == 0:
                canvas.text((x+473, y), "〔" + label["tag"] + "〕", 15, "#7a5d48")
            y += 24
        canvas.svg.append('</g>')
    y += 12
    for text in ("据：有来源引用；推：推定或概化；创：原创扩展。",
                 "综：来源与原创混合；待：仍含待考或待核事项。",
                 "标记只提示依据状态，不认证坐标精度。",
                 "灰褐块为生成建筑；完整证据见同目录史料文档。"):
        canvas.text((x, y), text, 15)
        y += 20


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("spec", type=Path)
    parser.add_argument("layout", type=Path)
    parser.add_argument("-o", "--output", type=Path, required=True)
    parser.add_argument("--cell-px", type=float, help="每游戏格像素，默认长边 960px")
    parser.add_argument("--font", type=Path, help="中文 TTF/OTF/TTC 字体路径")
    args = parser.parse_args(argv)
    try:
        if args.output.suffix.lower() != ".svg":
            raise TownError("输出路径须以 .svg 结尾，同时写同名 .png")
        spec, layout = load_yaml(args.spec), load_yaml(args.layout)
        actual = hashlib.sha256(args.spec.read_bytes()).hexdigest()
        if layout.get("source_spec", {}).get("sha256") != actual:
            raise TownError("source_spec.sha256 不匹配；请用当前规格重新生成布局")
        result = render_plan(spec, layout, args.output, cell_px=args.cell_px,
                             font_path=args.font)
        print(json.dumps(result, ensure_ascii=False, sort_keys=True))
        return 0
    except (TownError, ValueError, KeyError, OSError) as exc:
        print(f"TOWN_PLAN_ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
