#!/usr/bin/env python3
"""测量并拉伸白底全身 A 字模板板（AR-102 / AR-104）。

公开函数 measure_image 与 stretch_image 可由测试或其他离线工具导入。
前景定义为：不是“与画布边角连通的近背景色像素”的主体最大连通域。
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path
from typing import Any, Sequence

import numpy as np
from PIL import Image
from scipy import ndimage

DEFAULT_BG_THRESHOLD = 10.0


class PlateError(ValueError):
    """输入图不能可靠测量时抛出。"""


def _edge_pixels(rgb: np.ndarray) -> np.ndarray:
    band = max(1, min(rgb.shape[:2]) // 256)
    return np.concatenate((rgb[:band].reshape(-1, 3), rgb[-band:].reshape(-1, 3),
                           rgb[:, :band].reshape(-1, 3), rgb[:, -band:].reshape(-1, 3)))


def foreground_mask(image: Image.Image, bg_threshold: float = DEFAULT_BG_THRESHOLD) -> tuple[np.ndarray, tuple[int, int, int]]:
    """以边缘中位色为背景色，返回最大前景连通域及背景 RGB。"""
    rgb = np.asarray(image.convert("RGB"), dtype=np.int16)
    if min(rgb.shape[:2]) < 32:
        raise PlateError("图像过小；宽高都须至少 32 px")
    edge = _edge_pixels(rgb)
    background = np.median(edge, axis=0)
    distance = np.max(np.abs(rgb - background), axis=2)
    near_background = distance <= float(bg_threshold)
    seeds = np.zeros(near_background.shape, dtype=bool)
    seeds[0] = near_background[0]
    seeds[-1] = near_background[-1]
    seeds[:, 0] = near_background[:, 0]
    seeds[:, -1] = near_background[:, -1]
    connected_background = ndimage.binary_propagation(seeds, mask=near_background)
    labels, count = ndimage.label(~connected_background)
    if count == 0:
        raise PlateError("没有检测到前景；请降低 --bg-threshold")
    sizes = np.bincount(labels.ravel())
    sizes[0] = 0
    largest = int(np.argmax(sizes))
    mask = ndimage.binary_fill_holes(labels == largest)
    if int(mask.sum()) < 64:
        raise PlateError("前景过小；请降低 --bg-threshold 或检查输入背景")
    return mask.astype(bool), tuple(int(round(value)) for value in background)


def _runs(row: np.ndarray, minimum: int = 1) -> list[np.ndarray]:
    indices = np.flatnonzero(row)
    if not len(indices):
        return []
    return [part for part in np.split(indices, np.flatnonzero(np.diff(indices) > 1) + 1)
            if len(part) >= minimum]


def _subject_bounds(mask: np.ndarray) -> tuple[int, int, int, int]:
    ys, xs = np.nonzero(mask)
    if not len(xs):
        raise PlateError("前景掩码为空")
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def _body_center(mask: np.ndarray, top: int, height: int) -> float:
    y0 = top + round(0.25 * height)
    y1 = min(mask.shape[0], top + round(0.50 * height))
    ys, xs = np.nonzero(mask[y0:y1])
    return float(np.median(xs)) if len(xs) else (mask.shape[1] - 1) / 2


def _neck_and_chin(mask: np.ndarray, top: int, height: int, center: float) -> tuple[int, int]:
    """由上半身中央连通段宽度的颈部谷值估计下巴与颈线。"""
    start = top + max(2, round(0.06 * height))
    stop = min(mask.shape[0] - 1, top + round(0.24 * height))
    samples: list[tuple[int, int]] = []
    for y in range(start, stop + 1):
        central = [run for run in _runs(mask[y]) if run[0] <= center <= run[-1]]
        if central:
            samples.append((y, len(central[0])))
    if len(samples) < 5:
        raise PlateError("无法在头部下方定位颈部")
    smooth = ndimage.median_filter(np.array([width for _, width in samples], dtype=float), size=5)
    upper = max(1, round(len(samples) * 0.72))
    neck_index = int(np.argmin(smooth[:upper]))
    # 规格把“颈部最窄处上沿”作为下巴；离散掩码以谷值中心行作稳定近似。
    return int(samples[neck_index][0]), int(samples[neck_index][0])


def _torso_run(mask: np.ndarray, y: int, center: float) -> np.ndarray | None:
    candidates = [run for run in _runs(mask[y]) if run[0] <= center <= run[-1]]
    return max(candidates, key=len) if candidates else None


def _arm_points(mask: np.ndarray, top: int, height: int, center: float, side: int) -> tuple[np.ndarray, np.ndarray]:
    """取肩与肘：跟踪躯干外的上臂横截面中轴，再拟合近肩 55%。"""
    minimum = max(3, round(0.004 * height))
    points: list[tuple[float, float]] = []
    start = top + round(0.14 * height)
    stop = min(mask.shape[0], top + round(0.58 * height))
    for y in range(start, stop):
        torso = _torso_run(mask, y, center)
        if torso is None:
            continue
        candidates = [run for run in _runs(mask[y], minimum)
                      if (side < 0 and run[-1] < torso[0]) or (side > 0 and run[0] > torso[-1])]
        if candidates:
            arm = max(candidates, key=len)
            points.append((float((arm[0] + arm[-1]) / 2), float(y)))
    groups: list[list[tuple[float, float]]] = []
    for point in points:
        if not groups or point[1] > groups[-1][-1][1] + 1:
            groups.append([point])
        else:
            groups[-1].append(point)
    groups = [group for group in groups if len(group) >= max(8, round(0.06 * height))]
    if not groups:
        raise PlateError(f"无法分离{'左' if side < 0 else '右'}臂；须为正面 A 字全身图")
    arm_points = np.asarray(max(groups, key=len), dtype=float)
    fit_count = max(8, round(len(arm_points) * 0.55))
    upper = arm_points[:fit_count]
    slope, intercept = np.polyfit(upper[:, 1], upper[:, 0], 1)
    shoulder_y = float(upper[0, 1])
    elbow_y = float(upper[-1, 1])
    shoulder = np.array([slope * shoulder_y + intercept, shoulder_y])
    elbow = np.array([slope * elbow_y + intercept, elbow_y])
    return shoulder, elbow


def _crotch_y(mask: np.ndarray, top: int, bottom: int, height: int,
               center: float) -> tuple[int, str]:
    """返回裆部开叉的第一行；遮挡时返回带方法标记的代理行。"""
    start = top + round(0.42 * height)
    stop = min(bottom, top + round(0.72 * height))
    radius = max(1, round(0.004 * height))
    for y in range(start, stop + 1):
        left = max(0, round(center) - radius)
        right = min(mask.shape[1], round(center) + radius + 1)
        if not mask[y, left:right].any():
            return y, "visible_gap"
    # 长袍遮挡时无法从像素恢复真裆点；用全身 54% 行作有标记的保守代理值。
    return min(bottom, top + round(0.54 * height)), "silhouette_fallback"


def measure_mask(mask: np.ndarray, background: tuple[int, int, int] | None = None) -> dict[str, Any]:
    """从已分割前景测人体几何；像素坐标原点在左上。"""
    left, top, right, bottom = _subject_bounds(mask)
    height = bottom - top + 1
    if height < 24:
        raise PlateError("人物高度过小")
    center = _body_center(mask, top, height)
    neck_y, chin_y = _neck_and_chin(mask, top, height, center)
    left_shoulder, left_elbow = _arm_points(mask, top, height, center, -1)
    right_shoulder, right_elbow = _arm_points(mask, top, height, center, 1)
    left_angle = math.degrees(math.atan2(abs(left_elbow[0] - left_shoulder[0]),
                                         abs(left_elbow[1] - left_shoulder[1])))
    right_angle = math.degrees(math.atan2(abs(right_elbow[0] - right_shoulder[0]),
                                          abs(right_elbow[1] - right_shoulder[1])))
    crotch_y, crotch_method = _crotch_y(mask, top, bottom, height, center)
    shoulder_width = abs(right_shoulder[0] - left_shoulder[0])
    head_height = chin_y - top + 1
    result: dict[str, Any] = {
        "head_top_y": top,
        "feet_bottom_y": bottom,
        "height_px": height,
        "left_arm_angle_deg": round(left_angle, 3),
        "right_arm_angle_deg": round(right_angle, 3),
        "arm_span_px": right - left + 1,
        "arm_span_ratio": round((right - left + 1) / height, 6),
        "crotch_y": crotch_y,
        "crotch_method": crotch_method,
        "hips_ratio": round((bottom - crotch_y + 1) / height, 6),
        "shoulder_width_px": round(shoulder_width, 3),
        "shoulder_ratio": round(shoulder_width / height, 6),
        "chin_y": chin_y,
        "neck_y": neck_y,
        "head_height_px": head_height,
        "head_to_body_ratio": round(height / head_height, 6),
        "left_shoulder": [round(float(v), 3) for v in left_shoulder],
        "left_elbow": [round(float(v), 3) for v in left_elbow],
        "right_shoulder": [round(float(v), 3) for v in right_shoulder],
        "right_elbow": [round(float(v), 3) for v in right_elbow],
    }
    if background is not None:
        result["background_rgb"] = list(background)
    return result


def measure_image(image_or_path: Image.Image | str | Path,
                  bg_threshold: float = DEFAULT_BG_THRESHOLD) -> dict[str, Any]:
    """载入图片并返回模板板测量字典。"""
    image = image_or_path if isinstance(image_or_path, Image.Image) else Image.open(image_or_path)
    mask, background = foreground_mask(image, bg_threshold)
    result = measure_mask(mask, background)
    result["image_size"] = list(image.size)
    return result


def _remap_rows(image: Image.Image, top: int, chin: int, crotch: int, bottom: int,
                target_hips_ratio: float) -> Image.Image:
    """固定头部，把下巴至裆、裆至脚分别线性重采样到目标比例。"""
    height = bottom - top + 1
    target_leg = target_hips_ratio * height
    target_crotch = bottom - target_leg + 1
    source = np.asarray(image.convert("RGB"), dtype=np.uint8)
    rows = np.arange(source.shape[0], dtype=float)
    mapped = rows.copy()
    torso = (rows > chin) & (rows <= target_crotch)
    legs = (rows > target_crotch) & (rows <= bottom)
    if target_crotch <= chin + 2 or crotch <= chin + 2:
        raise PlateError("目标髋高使躯干长度无效")
    mapped[torso] = chin + (rows[torso] - chin) * (crotch - chin) / (target_crotch - chin)
    mapped[legs] = crotch + (rows[legs] - target_crotch) * (bottom - crotch) / (bottom - target_crotch)
    mapped[(rows > bottom)] += 0
    mapped = np.clip(mapped, 0, source.shape[0] - 1)
    lo = np.floor(mapped).astype(int)
    hi = np.minimum(lo + 1, source.shape[0] - 1)
    weight = (mapped - lo)[:, None, None]
    output = source[lo] * (1.0 - weight) + source[hi] * weight
    return Image.fromarray(np.clip(np.rint(output), 0, 255).astype(np.uint8), "RGB")


def _remap_shoulders(image: Image.Image, center: float, shoulder_y: float, height: int,
                     source_ratio: float, target_ratio: float) -> Image.Image:
    """在肩带处横向缩放，向头与髋平滑衰减为 1，保持画布和人物中心。"""
    if target_ratio <= 0:
        raise PlateError("--shoulder-ratio 必须大于 0")
    source = np.asarray(image.convert("RGB"), dtype=np.uint8)
    output = np.empty_like(source)
    scale_peak = target_ratio / source_ratio
    radius = max(2.0, 0.20 * height)
    x_out = np.arange(source.shape[1], dtype=float)
    for y in range(source.shape[0]):
        distance = abs(y - shoulder_y) / radius
        blend = max(0.0, 1.0 - distance)
        blend = blend * blend * (3.0 - 2.0 * blend)
        scale = 1.0 + (scale_peak - 1.0) * blend
        x_src = center + (x_out - center) / scale
        x_src = np.clip(x_src, 0, source.shape[1] - 1)
        lo = np.floor(x_src).astype(int)
        hi = np.minimum(lo + 1, source.shape[1] - 1)
        weight = (x_src - lo)[:, None]
        output[y] = np.rint(source[y, lo] * (1.0 - weight) + source[y, hi] * weight)
    return Image.fromarray(output, "RGB")


def _center_with_margin(image: Image.Image, bg_threshold: float, margin_ratio: float = 0.04) -> Image.Image:
    """必要时等比缩小并平移主体，保证画布四边留白且人物 bbox 居中。"""
    mask, background = foreground_mask(image, bg_threshold)
    left, top, right, bottom = _subject_bounds(mask)
    width, height = image.size
    margin_x = math.ceil(width * margin_ratio)
    margin_y = math.ceil(height * margin_ratio)
    subject_width = right - left + 1
    subject_height = bottom - top + 1
    scale = min(1.0, (width - 2 * margin_x) / subject_width,
                (height - 2 * margin_y) / subject_height)
    crop = image.crop((left, top, right + 1, bottom + 1))
    if scale < 1.0:
        crop = crop.resize((max(1, round(crop.width * scale)), max(1, round(crop.height * scale))),
                           Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", image.size, background)
    x = round((width - crop.width) / 2)
    y = round((height - crop.height) / 2)
    canvas.paste(crop, (x, y))
    return canvas


def stretch_image(image_or_path: Image.Image | str | Path, hips_ratio: float,
                  shoulder_ratio: float | None = None,
                  bg_threshold: float = DEFAULT_BG_THRESHOLD) -> tuple[Image.Image, dict[str, Any], dict[str, Any]]:
    """在原画布内重采样并返回 (输出图, 变换前测量, 变换后测量)。"""
    if not 0.2 < hips_ratio < 0.8:
        raise PlateError("--hips-ratio 应在 0.2 与 0.8 之间")
    image = (image_or_path.copy() if isinstance(image_or_path, Image.Image)
             else Image.open(image_or_path).convert("RGB"))
    before = measure_image(image, bg_threshold)
    output = _remap_rows(image, before["head_top_y"], before["chin_y"], before["crotch_y"],
                         before["feet_bottom_y"], hips_ratio)
    if shoulder_ratio is not None:
        # 轮廓抗锯齿会让一次缩放略欠量；最多三次反馈校正到 0.2% 身高内。
        for _ in range(3):
            intermediate = measure_image(output, bg_threshold)
            if abs(intermediate["shoulder_ratio"] - shoulder_ratio) <= 0.002:
                break
            shoulder_y = (intermediate["left_shoulder"][1] + intermediate["right_shoulder"][1]) / 2
            center = (intermediate["left_shoulder"][0] + intermediate["right_shoulder"][0]) / 2
            output = _remap_shoulders(output, center, shoulder_y, intermediate["height_px"],
                                      intermediate["shoulder_ratio"], shoulder_ratio)
    output = _center_with_margin(output, bg_threshold)
    after = measure_image(output, bg_threshold)
    return output, before, after


def _print_measurement(result: dict[str, Any], as_json: bool) -> None:
    if as_json:
        print(json.dumps(result, ensure_ascii=False, sort_keys=True))
        return
    labels = {
        "head_top_y": "头顶 y", "feet_bottom_y": "脚底 y", "height_px": "身高 px",
        "left_arm_angle_deg": "左上臂角 °", "right_arm_angle_deg": "右上臂角 °",
        "arm_span_ratio": "手臂跨度/身高", "hips_ratio": "髋高/身高",
        "shoulder_ratio": "肩宽/身高", "head_height_px": "头高 px",
        "head_to_body_ratio": "头身比",
    }
    for key, label in labels.items():
        print(f"{label}: {result[key]}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="测量或拉伸白底全身 A 字模板板。")
    subparsers = parser.add_subparsers(dest="command", required=True)
    measure_parser = subparsers.add_parser("measure", help="分割人物并测量比例和左右上臂角")
    measure_parser.add_argument("image", type=Path, help="输入 PNG/JPG")
    measure_parser.add_argument("--bg-threshold", type=float, default=DEFAULT_BG_THRESHOLD,
                                help="近背景 RGB 最大通道差（默认 10）")
    measure_parser.add_argument("--json", action="store_true", help="输出单行 JSON")
    stretch_parser = subparsers.add_parser("stretch", help="在原画布内调整髋高与可选肩宽")
    stretch_parser.add_argument("image", type=Path, help="输入 PNG/JPG")
    stretch_parser.add_argument("--out", type=Path, required=True, help="输出 PNG")
    stretch_parser.add_argument("--hips-ratio", type=float, required=True, help="目标髋高/身高")
    stretch_parser.add_argument("--shoulder-ratio", type=float, help="目标肩宽/身高")
    stretch_parser.add_argument("--bg-threshold", type=float, default=DEFAULT_BG_THRESHOLD,
                                help="近背景 RGB 最大通道差（默认 10）")
    stretch_parser.add_argument("--json", action="store_true", help="输出前后测量 JSON")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    """命令行入口；成功为 0，输入/测量错误为 2。"""
    args = build_parser().parse_args(argv)
    try:
        if args.command == "measure":
            _print_measurement(measure_image(args.image, args.bg_threshold), args.json)
        else:
            output, before, after = stretch_image(args.image, args.hips_ratio,
                                                   args.shoulder_ratio, args.bg_threshold)
            args.out.parent.mkdir(parents=True, exist_ok=True)
            output.save(args.out, format="PNG", optimize=True)
            report = {"out": str(args.out), "before": before, "after": after}
            if args.json:
                print(json.dumps(report, ensure_ascii=False, sort_keys=True))
            else:
                print("变换前：")
                _print_measurement(before, False)
                print("变换后：")
                _print_measurement(after, False)
        return 0
    except (OSError, PlateError, ValueError) as error:
        print(f"输入错误：{error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
