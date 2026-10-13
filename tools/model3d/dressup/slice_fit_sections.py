"""切片贴合（ADR 0002）切面线图：素体 / 原衣物 / 弹性 / 非弹性 / 最终五种线。"""
from __future__ import annotations

import math
from pathlib import Path
from typing import Any, Sequence

try:
    from .slice_fit_base import (LEVEL_LABELS, LEVEL_ORDER, mm_to_mu)
except ImportError:
    from slice_fit_base import (LEVEL_LABELS, LEVEL_ORDER, mm_to_mu)  # type: ignore[no-redef]

import numpy as np  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

try:
    from .slice_fit_geometry import (section_by_plane)
except ImportError:
    from slice_fit_geometry import (section_by_plane)  # type: ignore[no-redef]
try:
    from .slice_fit_model import (BodyModel, GarmentModel)
except ImportError:
    from slice_fit_model import (BodyModel, GarmentModel)  # type: ignore[no-redef]
try:
    from .slice_fit_geometry import (limb_frame as _limb_frame)
except ImportError:
    from slice_fit_geometry import (limb_frame as _limb_frame)  # type: ignore[no-redef]
try:
    from .slice_fit_render import (_font)
except ImportError:
    from slice_fit_render import (_font)  # type: ignore[no-redef]


def _draw_polyline_sections(draw: ImageDraw.ImageDraw, segments: np.ndarray, transform, color, width: int = 2,
                            dash: bool = False) -> None:
    for index, segment in enumerate(segments):
        if dash and index % 2:
            continue
        a = transform(segment[0]); b = transform(segment[1])
        draw.line([a, b], fill=color, width=width)


SECTION_STYLE = {"body": ((60, 60, 60), 2), "aligned": ((150, 150, 150), 2), "elastic": ((40, 100, 220), 4),
                 "inelastic": ((235, 140, 20), 4), "final": ((200, 20, 20), 1)}


SECTION_LABELS = {"body": "素体截面", "aligned": "原衣物（竖直 + 水平对中后）", "elastic": "弹性切面（r=1）",
                  "inelastic": "非弹性切面（r=0）", "final": "最终（细线；r=0/1 时压在非弹性 / 弹性粗线上）"}


def render_sections_figure(path: Path, body: BodyModel, garment: GarmentModel, result: SliceFitResult, *, title: str,
                           levels: Sequence[str] | None = None, input_positions: np.ndarray | None = None,
                           panel: int = 300) -> None:
    """若干素体高度的水平切面线图（+ 袖子垂直切面 + 正中 / 冠状竖切），五种线见图例。"""
    body_levels = {name: rec["yMu"] for name, rec in body.landmarks.get("levels", {}).items()}
    span = result.positions[:, 1]
    low_y, high_y = float(span.min()), float(span.max())
    names = [name for name in (levels or LEVEL_ORDER[::-1]) if name in body_levels and low_y + 0.004 < body_levels[name] < high_y - 0.004]
    if len(names) > 6:
        keep = np.linspace(0, len(names) - 1, 6).round().astype(int)
        names = [names[i] for i in keep]
    meshes = {"aligned": result.variants["aligned"], "elastic": result.variants["elastic"],
              "inelastic": result.variants["inelastic"], "final": result.positions}
    panels: list[tuple[str, Any]] = []
    for name in names:
        panels.append((f"{LEVEL_LABELS.get(name, name)} y={body_levels[name]:.3f}", ("h", body_levels[name])))
    for part in result.parts:
        if not part.name.startswith("arm"):
            continue
        frame = part.frame
        q0 = np.asarray(frame["bodyShoulderMu"]); a_b = np.asarray(frame["bodyAxisDir"])
        length = float(part.field.coords_b.max())
        for fraction in (0.35, 0.75):
            panels.append((f"{'左' if part.name.endswith('L') else '右'}袖 {int(fraction * 100)}%", ("a", part, q0 + a_b * length * fraction, a_b)))
    level_records = body.landmarks.get("levels", {})
    center = np.asarray((level_records.get("waist") or next(iter(level_records.values()))).get("centerMu", [0.0, 0.0]))
    panels.append(("正中竖切 x = 中线（左右看前后）", ("v", np.array([1.0, 0.0, 0.0]), center[0])))
    panels.append(("冠状竖切 z = 中心（看左右）", ("v", np.array([0.0, 0.0, 1.0]), center[1])))
    columns = 4; rows_n = int(math.ceil(len(panels) / columns))
    header = 96
    canvas = Image.new("RGB", (columns * panel, header + rows_n * panel), (250, 249, 246))
    draw = ImageDraw.Draw(canvas)
    draw.text((10, 8), title, fill=(25, 25, 25), font=_font(20))
    x = 10
    for key in ("body", "aligned", "elastic", "inelastic", "final"):
        color, width = SECTION_STYLE[key]
        draw.line([(x, 52), (x + 26, 52)], fill=color, width=max(width, 2))
        draw.text((x + 30, 43), SECTION_LABELS[key], fill=(40, 40, 40), font=_font(14))
        x += 40 + int(draw.textlength(SECTION_LABELS[key], font=_font(14)))
    if input_positions is not None:
        draw.line([(10, 78), (36, 78)], fill=(180, 180, 180), width=2)
        draw.text((40, 69), "竖切里另画输入原样（浅灰）", fill=(60, 60, 60), font=_font(14))
    for index, (label, spec) in enumerate(panels):
        ox = (index % columns) * panel; oy = header + (index // columns) * panel
        draw.rectangle([ox + 2, oy + 2, ox + panel - 3, oy + panel - 3], outline=(215, 212, 205))
        curves: dict[str, np.ndarray] = {}
        if spec[0] == "h":
            y = spec[1]
            plane = ((0.0, y, 0.0), (0.0, 1.0, 0.0))
            to2 = lambda pts: pts[..., [0, 2]]  # noqa: E731
            body_faces = None; garment_faces = None
        elif spec[0] == "a":
            _, part, origin, axis = spec
            plane = (origin, axis)
            u, v = _limb_frame(axis)
            to2 = lambda pts, origin=origin, u=u, v=v: np.stack(((pts - origin) @ u, (pts - origin) @ v), axis=-1)  # noqa: E731
            body_faces = np.flatnonzero(body.arm_face_mask[part.name[-1]])
            garment_faces = np.flatnonzero(result.weights[part.name][garment.faces].mean(axis=1) >= 0.5)
        else:
            _, normal, value = spec
            origin = normal * value
            plane = (origin, normal)
            to2 = (lambda pts: pts[..., [2, 1]]) if normal[0] > 0.5 else (lambda pts: pts[..., [0, 1]])  # noqa: E731
            body_faces = None; garment_faces = None
        body_section = section_by_plane(body.positions, body.faces, body.weld, plane[0], plane[1], body_faces)
        curves["body"] = to2(body_section.points)
        for key, positions in meshes.items():
            section = section_by_plane(positions, garment.faces, garment.weld, plane[0], plane[1], garment_faces)
            curves[key] = to2(section.points)
        if spec[0] == "v" and input_positions is not None:
            section = section_by_plane(input_positions, garment.faces, garment.weld, plane[0], plane[1])
            curves["input"] = to2(section.points)
        stacked = [value.reshape(-1, 2) for value in curves.values() if len(value)]
        if not stacked:
            continue
        allpts = np.concatenate(stacked)
        lo = allpts.min(axis=0); hi = allpts.max(axis=0)
        span2 = max(float((hi - lo).max()), 1e-6) * 1.08
        mid = 0.5 * (lo + hi)
        scale = (panel - 40) / span2
        flip_y = spec[0] != "v"

        def transform(point, mid=mid, scale=scale, ox=ox, oy=oy, flip_y=flip_y):
            px = ox + panel / 2 + (point[0] - mid[0]) * scale
            py = oy + 18 + (panel - 30) / 2 + ((point[1] - mid[1]) if flip_y else -(point[1] - mid[1])) * scale
            return (float(px), float(py))

        if "input" in curves:
            _draw_polyline_sections(draw, curves["input"], transform, (195, 195, 195), 1)
        for key in ("body", "aligned", "inelastic", "elastic", "final"):
            color, width = SECTION_STYLE[key]
            _draw_polyline_sections(draw, curves[key], transform, color, width, dash=(key == "aligned"))
        bar_mm = 20.0; bar = mm_to_mu(bar_mm, body.m_per_mu) * scale
        draw.line([(ox + panel - 14 - bar, oy + panel - 14), (ox + panel - 14, oy + panel - 14)], fill=(30, 30, 30), width=2)
        draw.text((ox + panel - 14 - bar, oy + panel - 32), "2 cm", fill=(30, 30, 30), font=_font(12))
        draw.text((ox + 8, oy + 6), label, fill=(20, 20, 20), font=_font(14))
        if spec[0] == "h":
            draw.text((ox + 8, oy + panel - 22), "上：后  下：前", fill=(120, 120, 120), font=_font(11))
    path = Path(path); path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(path, quality=90)
