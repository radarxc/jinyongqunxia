#!/usr/bin/env python3
"""检查待生成衣图与模板板的 2D 姿态、脸形和比例（AR-104）。"""
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

try:
    from .make_template_plate import (DEFAULT_BG_THRESHOLD, PlateError,
                                      foreground_mask, measure_mask)
except ImportError:  # 直接执行脚本时没有包上下文。
    from make_template_plate import (DEFAULT_BG_THRESHOLD, PlateError,
                                     foreground_mask, measure_mask)

EXIT_FAILED = 3
EXIT_INPUT_ERROR = 2


def _check(value: float, threshold: float, operator: str) -> dict[str, Any]:
    if operator == "<":
        passed = value < threshold
    elif operator == "<=":
        passed = value <= threshold
    elif operator == ">=":
        passed = value >= threshold
    else:
        raise ValueError(f"未知比较运算符：{operator}")
    return {"value": round(float(value), 6), "operator": operator,
            "threshold": threshold, "pass": bool(passed)}


def _face_mask(mask: np.ndarray, measurement: dict[str, Any]) -> np.ndarray:
    result = np.zeros_like(mask)
    top = int(measurement["head_top_y"])
    chin = int(measurement["chin_y"])
    result[top:chin + 1] = mask[top:chin + 1]
    return result


def _iou(first: np.ndarray, second: np.ndarray) -> float:
    union = np.logical_or(first, second).sum()
    return float(np.logical_and(first, second).sum() / union) if union else 1.0


def _theoretical_span_ratio(plate: dict[str, Any], target_angle: float) -> float:
    """保持板的肩宽和臂长，将板的横向臂投影换算到目标上臂角。"""
    plate_angle = (plate["left_arm_angle_deg"] + plate["right_arm_angle_deg"]) / 2
    lateral_arm = max(0.0, plate["arm_span_ratio"] - plate["shoulder_ratio"])
    denominator = math.sin(math.radians(plate_angle))
    if abs(denominator) < 1e-6:
        raise PlateError("底图手臂角太小，不能换算理论跨度")
    arm_length_ratio = lateral_arm / denominator
    return float(plate["shoulder_ratio"] + arm_length_ratio * math.sin(math.radians(target_angle)))


def compare_images(plate_image: Image.Image, candidate_image: Image.Image,
                   arm_angle_deg: float | None = None, arm_tol_deg: float = 3.0,
                   bg_threshold: float = DEFAULT_BG_THRESHOLD) -> tuple[dict[str, Any], np.ndarray, np.ndarray]:
    """返回门禁报告以及底图、待检图前景掩码。"""
    if plate_image.size != candidate_image.size:
        raise PlateError(f"底图与待检图画布必须相同：{plate_image.size} != {candidate_image.size}")
    plate_mask, plate_background = foreground_mask(plate_image, bg_threshold)
    image_mask, image_background = foreground_mask(candidate_image, bg_threshold)
    plate = measure_mask(plate_mask, plate_background)
    image = measure_mask(image_mask, image_background)
    reference_height = float(plate["height_px"])
    checks: dict[str, dict[str, Any]] = {
        "head_top_delta_ratio": _check(abs(image["head_top_y"] - plate["head_top_y"]) / reference_height,
                                       0.02, "<"),
        "feet_bottom_delta_ratio": _check(abs(image["feet_bottom_y"] - plate["feet_bottom_y"]) / reference_height,
                                          0.02, "<"),
        "face_iou": _check(_iou(_face_mask(plate_mask, plate), _face_mask(image_mask, image)), 0.9, ">="),
        "hips_ratio_delta": _check(abs(image["hips_ratio"] - plate["hips_ratio"]), 0.02, "<"),
    }
    if arm_angle_deg is None:
        expected_span = float(plate["arm_span_ratio"])
        span_reference = "plate"
    else:
        expected_span = _theoretical_span_ratio(plate, arm_angle_deg)
        span_reference = "target_angle_projection"
        checks["left_arm_angle_deg"] = _check(abs(image["left_arm_angle_deg"] - arm_angle_deg), arm_tol_deg, "<=")
        checks["right_arm_angle_deg"] = _check(abs(image["right_arm_angle_deg"] - arm_angle_deg), arm_tol_deg, "<=")
        checks["left_arm_angle_deg"].update(measured=image["left_arm_angle_deg"], target=arm_angle_deg)
        checks["right_arm_angle_deg"].update(measured=image["right_arm_angle_deg"], target=arm_angle_deg)
    checks["arm_span_ratio_delta"] = _check(abs(image["arm_span_ratio"] - expected_span), 0.03, "<")
    checks["arm_span_ratio_delta"].update(measured=image["arm_span_ratio"], expected=round(expected_span, 6),
                                          reference=span_reference)
    return ({"plate": plate, "image": image, "checks": checks,
             "pass": all(item["pass"] for item in checks.values())}, plate_mask, image_mask)


def make_overlay(plate_mask: np.ndarray, image_mask: np.ndarray) -> Image.Image:
    """画白底轮廓叠加：底图红、待检图蓝，重合处紫。"""
    plate_contour = plate_mask & ~ndimage.binary_erosion(plate_mask)
    image_contour = image_mask & ~ndimage.binary_erosion(image_mask)
    canvas = np.full((*plate_mask.shape, 3), 255, dtype=np.uint8)
    canvas[plate_contour] = (235, 55, 55)
    canvas[image_contour] = (45, 95, 235)
    canvas[plate_contour & image_contour] = (160, 45, 180)
    return Image.fromarray(canvas, "RGB")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="检查待检衣图是否保持模板板的姿态、脸形和人体比例。")
    parser.add_argument("--plate", type=Path, required=True, help="模板底图 PNG/JPG")
    parser.add_argument("--image", type=Path, required=True, help="待检图 PNG/JPG")
    parser.add_argument("--arm-angle-deg", type=float,
                        help="绝对上臂目标角；给出时左右臂都须命中，跨度按该角换算")
    parser.add_argument("--arm-tol-deg", type=float, default=3.0,
                        help="绝对上臂角容差（默认 3°，含边界）")
    parser.add_argument("--bg-threshold", type=float, default=DEFAULT_BG_THRESHOLD,
                        help="近背景 RGB 最大通道差（默认 10）")
    parser.add_argument("--overlay", type=Path, help="输出轮廓叠加 PNG（底图红、待检图蓝）")
    parser.add_argument("--json", action="store_true", help="输出单行 JSON")
    return parser


def _print_report(report: dict[str, Any], as_json: bool) -> None:
    if as_json:
        print(json.dumps(report, ensure_ascii=False, sort_keys=True))
        return
    for name, check in report["checks"].items():
        mark = "通过" if check["pass"] else "不通过"
        print(f"{name}: value={check['value']} {check['operator']} {check['threshold']} [{mark}]")
    print(f"总结果: {'通过' if report['pass'] else '不通过'}")


def main(argv: Sequence[str] | None = None) -> int:
    """命令行入口；通过 0、门禁不通过 3、输入错误 2。"""
    args = build_parser().parse_args(argv)
    try:
        if args.arm_tol_deg <= 0:
            raise PlateError("--arm-tol-deg 必须大于 0")
        with Image.open(args.plate) as plate_source, Image.open(args.image) as image_source:
            report, plate_mask, image_mask = compare_images(
                plate_source.convert("RGB"), image_source.convert("RGB"), args.arm_angle_deg,
                args.arm_tol_deg, args.bg_threshold)
        if args.overlay:
            args.overlay.parent.mkdir(parents=True, exist_ok=True)
            make_overlay(plate_mask, image_mask).save(args.overlay, format="PNG", optimize=True)
        _print_report(report, args.json)
        return 0 if report["pass"] else EXIT_FAILED
    except (OSError, PlateError, ValueError) as error:
        print(f"输入错误：{error}", file=sys.stderr)
        return EXIT_INPUT_ERROR


if __name__ == "__main__":
    raise SystemExit(main())
