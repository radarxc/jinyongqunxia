"""切片贴合（ADR 0002）出图：正交 z-buffer、三视图对比、标注叠图（纯 NumPy + Pillow）。"""
from __future__ import annotations

from pathlib import Path
from typing import Any, Sequence

try:
    from .slice_fit_base import (ARM_POINTS, LEVEL_LABELS, _unit, mu_to_mm, welded_normals)
except ImportError:
    from slice_fit_base import (ARM_POINTS, LEVEL_LABELS, _unit, mu_to_mm, welded_normals)  # type: ignore[no-redef]

import numpy as np  # noqa: E402
from PIL import Image, ImageDraw, ImageFont  # noqa: E402

try:
    from .slice_fit_model import (BodyModel, GarmentModel)
except ImportError:
    from slice_fit_model import (BodyModel, GarmentModel)  # type: ignore[no-redef]


_FONT_CANDIDATES = ("/System/Library/Fonts/Hiragino Sans GB.ttc", "/System/Library/Fonts/STHeiti Medium.ttc",
                    "/System/Library/Fonts/PingFang.ttc", "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc")


def _font(size: int) -> ImageFont.ImageFont:
    for candidate in _FONT_CANDIDATES:
        if Path(candidate).exists():
            try:
                return ImageFont.truetype(candidate, size)
            except OSError:
                continue
    return ImageFont.load_default()


VIEWS = {"front": (np.array([1.0, 0.0, 0.0]), np.array([0.0, 0.0, 1.0])),
         "side": (np.array([0.0, 0.0, -1.0]), np.array([1.0, 0.0, 0.0])),
         "back": (np.array([-1.0, 0.0, 0.0]), np.array([0.0, 0.0, -1.0]))}


VIEW_LABELS = {"front": "正面", "side": "左侧", "back": "背面"}


def rasterize(positions: np.ndarray, faces: np.ndarray, right: np.ndarray, toward: np.ndarray,
              low: np.ndarray, scale: float, width: int, height: int):
    """正交投影 z-buffer：返回每像素深度（朝相机为大）、三角号与重心。"""
    up = np.array([0.0, 1.0, 0.0])
    sx = (positions @ right - low[0]) * scale
    sy = (low[1] - positions @ up) * scale + (height - 1)   # 行向下
    depth_v = positions @ toward
    screen = np.column_stack((sx, sy))
    depth = np.full(width * height, -np.inf); face_buf = np.full(width * height, -1, dtype=np.int64)
    bary_buf = np.zeros((width * height, 3), dtype=np.float32)
    for begin in range(0, len(faces), 16384):
        ids = np.arange(begin, min(begin + 16384, len(faces)))
        tri = screen[faces[ids]]
        lo = np.maximum(0, np.ceil(tri.min(axis=1)).astype(np.int64))
        hi = np.minimum([width - 1, height - 1], np.floor(tri.max(axis=1)).astype(np.int64))
        w = np.maximum(0, hi[:, 0] - lo[:, 0] + 1); h = np.maximum(0, hi[:, 1] - lo[:, 1] + 1)
        counts = w * h
        if not counts.sum():
            continue
        owner = np.repeat(np.arange(len(ids)), counts)
        offset = np.arange(int(counts.sum())) - np.repeat(np.cumsum(counts) - counts, counts)
        xx = lo[owner, 0] + offset % w[owner]; yy = lo[owner, 1] + offset // w[owner]
        t = tri[owner]
        denom = (t[:, 1, 1] - t[:, 2, 1]) * (t[:, 0, 0] - t[:, 2, 0]) + (t[:, 2, 0] - t[:, 1, 0]) * (t[:, 0, 1] - t[:, 2, 1])
        ok = np.abs(denom) > 1e-12
        safe = np.where(ok, denom, 1.0)
        w0 = ((t[:, 1, 1] - t[:, 2, 1]) * (xx - t[:, 2, 0]) + (t[:, 2, 0] - t[:, 1, 0]) * (yy - t[:, 2, 1])) / safe
        w1 = ((t[:, 2, 1] - t[:, 0, 1]) * (xx - t[:, 2, 0]) + (t[:, 0, 0] - t[:, 2, 0]) * (yy - t[:, 2, 1])) / safe
        w2 = 1.0 - w0 - w1
        inside = ok & (w0 >= -1e-6) & (w1 >= -1e-6) & (w2 >= -1e-6)
        if not inside.any():
            continue
        face_ids = ids[owner[inside]]
        bary = np.column_stack((w0[inside], w1[inside], w2[inside]))
        z = np.einsum("ij,ij->i", bary, depth_v[faces[face_ids]])
        pixel = yy[inside] * width + xx[inside]
        order = np.argsort(z, kind="stable")
        pixel, z, face_ids, bary = pixel[order], z[order], face_ids[order], bary[order]
        last = np.ones(len(pixel), dtype=bool)
        _, first_from_end = np.unique(pixel[::-1], return_index=True)
        keep = len(pixel) - 1 - first_from_end
        last[:] = False; last[keep] = True
        pixel, z, face_ids, bary = pixel[last], z[last], face_ids[last], bary[last]
        better = z > depth[pixel]
        depth[pixel[better]] = z[better]; face_buf[pixel[better]] = face_ids[better]
        bary_buf[pixel[better]] = bary[better]
    return depth.reshape(height, width), face_buf.reshape(height, width), bary_buf.reshape(height, width, 3)


def _sample_texture(texture: np.ndarray | None, uv: np.ndarray, fallback: Sequence[float]) -> np.ndarray:
    if texture is None or uv is None:
        return np.tile(np.asarray(fallback, dtype=np.float64)[None, :], (len(uv) if uv is not None else 0, 1))
    h, w = texture.shape[:2]
    u = np.mod(uv[:, 0], 1.0); v = np.mod(uv[:, 1], 1.0)
    cols = np.clip((u * (w - 1)).round().astype(np.int64), 0, w - 1)
    rows = np.clip((v * (h - 1)).round().astype(np.int64), 0, h - 1)
    return texture[rows, cols].astype(np.float64) / 255.0


def _heat_color(gap_mm: np.ndarray) -> np.ndarray:
    """间隙色带：< 0 红，0–1 mm 橙，1–5 mm 黄 → 绿，5–20 mm 绿 → 青，> 20 mm 蓝。"""
    stops = np.array([-2.0, 0.0, 1.0, 5.0, 20.0, 40.0])
    colors = np.array([[0.80, 0.05, 0.05], [0.95, 0.35, 0.05], [0.98, 0.80, 0.15], [0.30, 0.75, 0.30],
                       [0.20, 0.70, 0.85], [0.20, 0.30, 0.85]])
    g = np.clip(gap_mm, stops[0], stops[-1])
    out = np.column_stack([np.interp(g, stops, colors[:, c]) for c in range(3)])
    out[gap_mm < 0] = colors[0]
    return out


def render_scene(body: BodyModel, layers: Sequence[dict[str, Any]], view: str, low: np.ndarray, scale: float,
                 width: int, height: int, *, body_outline: float = 0.0, body_buffers=None) -> np.ndarray:
    """素体 + 若干层（衣物）合成一张 RGB（0..1）。layer：positions / faces / normals 与 uvs+texture 或 colors。

    body_outline > 0 时把被衣物挡住的素体外轮廓按该不透明度描在衣物上（"半透明素体"，看间隙用）。"""
    right, toward = VIEWS[view]
    background = np.array([0.965, 0.957, 0.937])
    image = np.tile(background, (height, width, 1))
    if body_buffers is None:
        body_buffers = rasterize(body.positions, body.faces, right, toward, low, scale, width, height)
    body_depth, body_face, body_bary = body_buffers
    layer_buffers = [rasterize(layer["positions"], layer["faces"], right, toward, low, scale, width, height)
                     for layer in layers]
    top_depth = body_depth.copy(); owner = np.where(np.isfinite(body_depth), 0, -1)
    for index, (depth, _, _) in enumerate(layer_buffers):
        better = depth > top_depth
        top_depth[better] = depth[better]; owner[better] = index + 1

    def shade(normals: np.ndarray) -> np.ndarray:
        return 0.62 + 0.38 * np.abs(normals @ toward)

    mask = owner == 0
    if mask.any():
        faces = body.faces[body_face[mask]]; bary = body_bary[mask].astype(np.float64)
        normal = _unit(np.einsum("ni,nij->nj", bary, body.normals[faces]))
        if body.uvs is not None and body.texture is not None:
            uv = np.einsum("ni,nij->nj", bary, body.uvs[faces])
            color = _sample_texture(body.texture, uv, (0.86, 0.74, 0.66))
        else:
            color = np.tile([0.86, 0.74, 0.66], (len(normal), 1))
        color = color * 0.85 + 0.15 * np.array([0.9, 0.9, 0.9])
        image[mask] = np.clip(color * shade(normal)[:, None], 0, 1)
    for index, layer in enumerate(layers):
        mask = owner == index + 1
        if not mask.any():
            continue
        _, face_buf, bary_buf = layer_buffers[index]
        faces = layer["faces"][face_buf[mask]]; bary = bary_buf[mask].astype(np.float64)
        normal = _unit(np.einsum("ni,nij->nj", bary, layer["normals"][faces]))
        if layer.get("colors") is not None:
            color = np.einsum("ni,nij->nj", bary, layer["colors"][faces])
        elif layer.get("uvs") is not None and layer.get("texture") is not None:
            uv = np.einsum("ni,nij->nj", bary, layer["uvs"][faces])
            color = _sample_texture(layer["texture"], uv, (0.3, 0.4, 0.6))
            color = color * np.asarray(layer.get("factor", [1, 1, 1, 1])[:3], dtype=np.float64)
        else:
            color = np.tile(np.asarray(layer.get("flat", (0.35, 0.45, 0.65))), (len(normal), 1))
        image[mask] = np.clip(color * shade(normal)[:, None], 0, 1)
    if body_outline > 0.0:
        filled = np.isfinite(body_depth)
        edge = np.zeros_like(filled)
        edge[1:-1, 1:-1] = filled[1:-1, 1:-1] & ~(filled[:-2, 1:-1] & filled[2:, 1:-1]
                                                  & filled[1:-1, :-2] & filled[1:-1, 2:])
        hidden = edge & (owner > 0)
        image[hidden] = image[hidden] * (1 - body_outline) + np.array([0.45, 0.18, 0.15]) * body_outline
    return image


def _frame_for(points: Sequence[np.ndarray], view: str, width: int, height: int, pad: float = 0.04):
    right, _ = VIEWS[view]
    allpoints = np.concatenate([np.asarray(p, dtype=np.float64) for p in points], axis=0)
    xs = allpoints @ right; ys = allpoints[:, 1]
    span_x = np.ptp(xs) * (1 + 2 * pad); span_y = np.ptp(ys) * (1 + 2 * pad)
    scale = min((width - 1) / max(span_x, 1e-9), (height - 1) / max(span_y, 1e-9))
    cx = 0.5 * (xs.min() + xs.max()); cy = 0.5 * (ys.min() + ys.max())
    low = np.array([cx - 0.5 * (width - 1) / scale, cy - 0.5 * (height - 1) / scale])
    return low, scale


def _to_image(array: np.ndarray) -> Image.Image:
    return Image.fromarray((np.clip(array, 0, 1) * 255).astype(np.uint8))


MARK_COLORS = ((20, 110, 200), (190, 40, 150), (40, 140, 60))


def _mark_line(draw: ImageDraw.ImageDraw, x0: int, x1: int, y: int, color, dashed: bool) -> None:
    if dashed:
        for x in range(x0, x1, 14):
            draw.line([(x, y), (min(x + 7, x1), y)], fill=color, width=2)
    else:
        draw.line([(x0, y), (x1, y)], fill=color, width=1)


def render_views_figure(path: Path, body: BodyModel, garment: GarmentModel, before: np.ndarray, after: np.ndarray,
                        signed_after: np.ndarray, *, title: str, subtitle: str = "", panel: tuple[int, int] = (420, 620),
                        crop_y: tuple[float, float] | None = None, marks: Sequence[dict[str, Any]] = ()) -> None:
    """三行三列：贴合前（输入原样放到素体上）/ 切片贴合后 / 贴合后间隙色（素体轮廓细线），正 · 左侧 · 背。

    marks：衣缘锚点 {label, sourceYMu, targetYMu}——首行虚线画衣物自身锚点高度、细实线画素体目标高度，后两行只画目标。"""
    width, height = panel
    normals_before = welded_normals(before, garment.faces, garment.weld)
    normals_after = welded_normals(after, garment.faces, garment.weld)
    region = [before, after]
    if crop_y is not None:
        body_points = body.positions[(body.positions[:, 1] >= crop_y[0]) & (body.positions[:, 1] <= crop_y[1])]
        region = [before, after, body_points]
    gap_colors = _heat_color(mu_to_mm(signed_after, body.m_per_mu))
    textured = {"faces": garment.faces, "uvs": garment.uvs, "texture": garment.texture,
                "factor": garment.base_color_factor}
    rows = [("贴合前（输入原样放在素体上）", [{**textured, "positions": before, "normals": normals_before}], 0.0),
            ("切片贴合后", [{**textured, "positions": after, "normals": normals_after}], 0.0),
            ("贴合后间隙（红 <0 / 橙 0–1 / 黄绿 1–5 / 青 5–20 / 蓝 >20 mm；深红细线 = 衣下素体轮廓）",
             [{"positions": after, "faces": garment.faces, "colors": gap_colors, "normals": normals_after}], 0.85)]
    header = 70; label_h = 30
    canvas = Image.new("RGB", (width * 3, header + (height + label_h) * len(rows)), (246, 244, 239))
    draw = ImageDraw.Draw(canvas)
    draw.text((12, 10), title, fill=(25, 25, 25), font=_font(22))
    if subtitle:
        draw.text((12, 40), subtitle, fill=(70, 70, 70), font=_font(15))
    for column, view in enumerate(("front", "side", "back")):
        low, scale = _frame_for(region, view, width, height)
        right, toward = VIEWS[view]
        buffers = rasterize(body.positions, body.faces, right, toward, low, scale, width, height)
        for row_index, (label, layers, outline) in enumerate(rows):
            top = header + row_index * (height + label_h)
            if column == 0:
                draw.text((12, top + 5), label, fill=(30, 30, 30), font=_font(17))
            array = render_scene(body, layers, view, low, scale, width, height, body_outline=outline,
                                 body_buffers=buffers)
            canvas.paste(_to_image(array), (column * width, top + label_h))
            draw.text((column * width + 8, top + label_h + 6), VIEW_LABELS[view], fill=(60, 60, 60), font=_font(15))
            for index, mark in enumerate(marks):
                color = MARK_COLORS[index % len(MARK_COLORS)]
                heights = [(mark["targetYMu"], False)] + ([(mark["sourceYMu"], True)] if row_index == 0 else [])
                for y_mu, dashed in heights:
                    row = top + label_h + int(round((low[1] - y_mu) * scale + height - 1))
                    if top + label_h <= row < top + label_h + height:
                        _mark_line(draw, column * width + 4, (column + 1) * width - 4, row, color, dashed)
                        if column == 2 and not dashed:
                            draw.text(((column + 1) * width - 150, row - 18), mark["label"], fill=color, font=_font(13))
    path = Path(path); path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(path, quality=88)


def render_landmark_overlay(path: Path, body: BodyModel, landmarks: dict[str, Any], *, title: str,
                            panel: tuple[int, int] = (460, 900)) -> None:
    """素体正 / 侧视 + 各标注面水平线（人工确认用）。"""
    width, height = panel
    canvas = Image.new("RGB", (width * 2, height + 50), (246, 244, 239))
    draw = ImageDraw.Draw(canvas)
    draw.text((10, 10), title, fill=(20, 20, 20), font=_font(20))
    for column, view in enumerate(("front", "side")):
        low, scale = _frame_for([body.positions], view, width, height)
        array = render_scene(body, [], view, low, scale, width, height)
        image = _to_image(array); sub = ImageDraw.Draw(image)
        for name, record in landmarks.get("levels", {}).items():
            row = (low[1] - record["yMu"]) * scale + (height - 1)
            sub.line([(0, row), (width, row)], fill=(200, 40, 40), width=1)
            sub.text((4 if column == 0 else width - 120, row - 15), f"{LEVEL_LABELS.get(name, name)} {record['yMu']:.3f}",
                     fill=(150, 20, 20), font=_font(13))
        for limb in ("armL", "armR"):
            points = landmarks.get("limbs", {}).get(limb)
            if not points or view != "front":
                continue
            right, _ = VIEWS[view]
            xy = [((np.asarray(points[f"{n}Mu"]) @ right - low[0]) * scale,
                   (low[1] - points[f"{n}Mu"][1]) * scale + (height - 1)) for n in ARM_POINTS if f"{n}Mu" in points]
            sub.line(xy, fill=(30, 90, 200), width=2)
        canvas.paste(image, (column * width, 50))
    path = Path(path); path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(path, quality=88)
