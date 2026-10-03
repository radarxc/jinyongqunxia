#!/usr/bin/env python3
"""Normalize a three-view rig set and maintain its tianshu-rig.v1 manifest."""
from __future__ import annotations

import argparse
import math
import re
import sys
from pathlib import Path
from typing import Any

import yaml
from PIL import Image

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from tools.item.common import BuildError, alpha_bbox, png_bytes, sha256_bytes, sha256_file
from tools.rig.templates import (
    NEAR_SIDE, PART_JOINTS, SHARED_CHILD_JOINTS, SOURCE_PARTS, VIEWS,
)


class _NoAliasDumper(yaml.SafeDumper):
    """content-registry 禁 YAML 锚点 / 别名（构建会失败）：同一对象被多处引用时也逐处展开写。"""

    def ignore_aliases(self, data):
        return True

Z_ORDER = {
    "front34": {"upper_arm_R": 0, "forearm_R": 1, "hand_R": 2,
        "thigh_shared": 3, "shin_shared": 4, "foot_shared": 5,
        "torso": 6, "pelvis_skirt": 7, "head": 8,
        "hair_or_headgear": 9, "upper_arm_L": 13, "forearm_L": 14, "hand_L": 15},
    "back34": {"forearm_R": 0, "upper_arm_R": 1, "hand_R": 2,
        "thigh_shared": 3, "shin_shared": 4, "foot_shared": 5,
        "pelvis_skirt": 6, "torso": 7, "head": 8,
        "hair_or_headgear": 12, "upper_arm_L": 13, "forearm_L": 14, "hand_L": 15},
    "side": {"upper_arm_R": 0, "forearm_R": 1, "hand_R": 2,
        "thigh_shared": 3, "shin_shared": 4, "foot_shared": 5,
        "pelvis_skirt": 6, "torso": 7, "head": 8,
        "hair_or_headgear": 9, "upper_arm_L": 13, "forearm_L": 14, "hand_L": 15},
}
TINTABLE = {"hair_or_headgear": "hair", "torso": "clothPrimary",
    "upper_arm_L": "clothPrimary", "upper_arm_R": "clothPrimary",
    "pelvis_skirt": "clothSecondary", "forearm_L": "clothSecondary",
    "forearm_R": "clothSecondary", "thigh_shared": "clothSecondary",
    "shin_shared": "clothSecondary", "foot_shared": "footwear"}
BONE_LENGTHS_M = {"torso": 0.52, "head": 0.24, "upper_arm": 0.30,
    "forearm": 0.26, "hand": 0.19, "thigh": 0.44,
    "shin": 0.40, "foot": 0.25}
SUPPORTED_SKELETONS = {"tianshu_humanoid.v1"}
ATTACHMENT_PARENTS = {
    "head", "hair_or_headgear", "torso", "pelvis_skirt",
    *(f"{part}_{side}" for part in ("upper_arm", "forearm", "hand",
                                       "thigh", "shin", "foot")
      for side in ("L", "R")),
}


def _identity_from_set(set_dir: Path) -> dict[str, str] | None:
    match = re.fullmatch(r"(npc_[a-z0-9_]+)__(ch\d\d_[a-z0-9_]+)", set_dir.name)
    sheet_l = set_dir / "sheet/sheet_L.png"
    if not match or not sheet_l.is_file():
        return None
    return {"npcId": match.group(1), "variant": match.group(2),
            "portrait": f"por_{match.group(1)}__{match.group(2)}_base",
            "sheetSha256": sha256_file(sheet_l)}


def normalize_part(path: Path, points: dict[str, list[int]] | None = None
                   ) -> tuple[Image.Image, int, tuple[int, int]]:
    with Image.open(path) as opened:
        image = opened.convert("RGBA")
    left, top, right, bottom = alpha_bbox(image)
    if points:
        for name, point in points.items():
            if not (-1 <= point[0] <= image.width and -1 <= point[1] <= image.height):
                raise BuildError(f"{path}:{name}: sidecar point lies outside source image")
        left = min(left, min(point[0] for point in points.values()))
        top = min(top, min(point[1] for point in points.values()))
        right = max(right, max(point[0] for point in points.values()) + 1)
        bottom = max(bottom, max(point[1] for point in points.values()) + 1)
    length = max(right - left, bottom - top)
    pad = max(4, int(math.ceil(0.04 * length)))
    width, height = right - left + 2 * pad, bottom - top + 2 * pad
    width += width % 2
    height += height % 2
    output = Image.new("RGBA", (width, height))
    output.alpha_composite(image.crop((left, top, right, bottom)), (pad, pad))
    return output, pad, (left - pad, top - pad)


def _point_in_bounds(point: list[int], size: tuple[int, int]) -> bool:
    return len(point) == 2 and -1 <= point[0] <= size[0] and -1 <= point[1] <= size[1]


def joint_metadata(view: str, part: str, size: tuple[int, int],
                   pad: int) -> tuple[list[int], dict[str, list[int]]]:
    width, height = size
    cx = round((width - 1) / 2)
    # Fallback silhouettes have no authored sidecar.  Keep joint centres
    # inside their overlap caps instead of pinning them to the alpha edge.
    inset = max(3, min(8, (height - 2 * pad) // 8))
    top, bottom = pad + inset, height - pad - 1 - inset
    if part in {"head", "hair_or_headgear"}:
        return [cx, bottom], {"crown": [cx, top]}
    if part == "torso":
        shoulder_left = cx if view == "side" else round(width * (0.14 if view == "back34" else 0.86))
        shoulder_right = cx if view == "side" else round(width * (0.86 if view == "back34" else 0.14))
        return [cx, bottom], {"neck": [cx, top],
            "shoulder_R": [shoulder_right, round(height * 0.20)],
            "shoulder_L": [shoulder_left, round(height * 0.20)]}
    if part == "pelvis_skirt":
        hip_left = cx if view == "side" else round(width * (0.32 if view == "back34" else 0.68))
        hip_right = cx if view == "side" else round(width * (0.68 if view == "back34" else 0.32))
        return [cx, top], {"hip_R": [hip_right, top],
            "hip_L": [hip_left, top], "hem": [cx, bottom]}
    names = {"upper_arm_L": "elbow_L", "upper_arm_R": "elbow_R",
        "forearm_L": "wrist_L", "forearm_R": "wrist_R",
        "thigh_shared": "knee", "shin_shared": "ankle"}
    if part in {"hand_L", "hand_R"}:
        name = "grip_L" if part.endswith("_L") else "grip_R"
        return [cx, top], {name: [cx, top + round(0.56 * (bottom - top))]}
    if part == "foot_shared":
        return [cx, top], {"toe": [width - pad - 1, bottom]}
    return [cx, top], {names[part]: [cx, bottom]}


def _point(value: Any, label: str) -> list[int]:
    if (not isinstance(value, (list, tuple)) or len(value) != 2
            or any(isinstance(item, bool) or not isinstance(item, (int, float))
                   or not math.isfinite(float(item)) for item in value)):
        raise BuildError(f"invalid sidecar point: {label}")
    return [round(float(value[0])), round(float(value[1]))]


def _load_joint_sidecar(set_dir: Path, view: str) -> tuple[Path | None, dict[str, list[int]], str]:
    candidates = (set_dir / view / "pivots.yaml", set_dir / view / "keypoints.yaml",
                  set_dir / f"{view}.pivots.yaml", set_dir / f"{view}.keypoints.yaml")
    path = next((item for item in candidates if item.is_file()), None)
    if path is None:
        return None, {}, "normalized"
    loaded = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(loaded, dict):
        raise BuildError(f"{path}: joint sidecar must be a mapping")
    coordinates = str(loaded.get("coordinates", "normalized"))
    if coordinates not in {"normalized", "source"}:
        raise BuildError(f"{path}: coordinates must be normalized or source")
    root = loaded.get("keypoints", loaded)
    if not isinstance(root, dict):
        raise BuildError(f"{path}: keypoints must be a mapping")
    ignored = {"coordinates"}
    return path, {str(name): _point(value.get("xy") if isinstance(value, dict) else value,
                                    f"{path}:{name}")
                  for name, value in root.items() if name not in ignored}, coordinates


def _sidecar_metadata(part: str, points: dict[str, list[int]]) -> tuple[list[int], dict[str, list[int]]] | None:
    if not points:
        return None
    pivot_name, child_name = PART_JOINTS[part]
    required = [pivot_name, child_name]
    if part == "torso":
        required.extend(("shoulder_L", "shoulder_R"))
    elif part == "pelvis_skirt":
        required.extend(("hip_L", "hip_R"))
    missing = [name for name in required if name not in points]
    if missing:
        raise BuildError(f"{part}: joint sidecar missing {', '.join(missing)}")
    children = {SHARED_CHILD_JOINTS.get(part, child_name): list(points[child_name])}
    if part == "torso":
        children.update(shoulder_L=list(points["shoulder_L"]),
                        shoulder_R=list(points["shoulder_R"]))
    elif part == "pelvis_skirt":
        children.update(hip_L=list(points["hip_L"]), hip_R=list(points["hip_R"]))
    return list(points[pivot_name]), children


def _sidecar_points_for_part(part: str, points: dict[str, list[int]]) -> dict[str, list[int]]:
    if not points:
        return {}
    pivot_name, child_name = PART_JOINTS[part]
    names = [pivot_name, child_name]
    if part == "torso":
        names.extend(("shoulder_L", "shoulder_R"))
    elif part == "pelvis_skirt":
        names.extend(("hip_L", "hip_R"))
    missing = [name for name in names if name not in points]
    if missing:
        raise BuildError(f"{part}: joint sidecar missing {', '.join(missing)}")
    return {name: points[name] for name in names}


def _part_sidecar(set_dir: Path, view: str, part: str) -> tuple[Path | None, dict[str, list[int]], str]:
    candidates = (set_dir / view / f"{part}.pivots.yaml",
                  set_dir / view / f"{part}.keypoints.yaml")
    path = next((item for item in candidates if item.is_file()), None)
    if path is None:
        return None, {}, "source"
    loaded = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(loaded, dict):
        raise BuildError(f"{path}: part sidecar must be a mapping")
    coordinates = str(loaded.get("coordinates", "source"))
    if coordinates not in {"normalized", "source"}:
        raise BuildError(f"{path}: coordinates must be normalized or source")
    root = loaded.get("keypoints", loaded)
    if not isinstance(root, dict):
        raise BuildError(f"{path}: keypoints must be a mapping")
    points = {str(name): _point(value.get("xy") if isinstance(value, dict) else value, f"{path}:{name}")
              for name, value in root.items() if name != "coordinates"}
    return path, points, coordinates


def _translate_sidecar(points: dict[str, list[int]], coordinates: str,
                       origin: tuple[int, int], previous: dict[str, Any],
                       joint_source: str, source_hash: str) -> tuple[dict[str, list[int]], list[int] | None]:
    if coordinates != "source":
        return points, None
    base = [0, 0]
    if (previous.get("jointSource") == joint_source
            and previous.get("sha256") == source_hash
            and "sourceOrigin" in previous):
        base = _point(previous["sourceOrigin"], f"manifest:{joint_source}:sourceOrigin")
    effective = [base[0] + origin[0], base[1] + origin[1]]
    translated = {name: [point[0] - effective[0], point[1] - effective[1]]
                  for name, point in points.items()}
    return translated, effective


def _crop_points(points: dict[str, list[int]], coordinates: str,
                 previous: dict[str, Any], joint_source: str | None,
                 source_hash: str) -> dict[str, list[int]]:
    if coordinates != "source":
        return {}
    origin = [0, 0]
    if (joint_source is not None and previous.get("jointSource") == joint_source
            and previous.get("sha256") == source_hash
            and "sourceOrigin" in previous):
        origin = _point(previous["sourceOrigin"], f"manifest:{joint_source}:sourceOrigin")
    return {name: [point[0] - origin[0], point[1] - origin[1]]
            for name, point in points.items()}


def _base_manifest(set_dir: Path, existing: dict[str, Any] | None, *, placeholder: bool = False) -> dict[str, Any]:
    manifest = dict(existing or {})
    set_id = str(manifest.get("set", set_dir.name))
    if not re.fullmatch(r"[a-z][a-z0-9_]*", set_id):
        raise BuildError(f"invalid rig set key: {set_id}")
    manifest.update({"schema": "tianshu-rig.v1", "set": set_id, "ppm": 256,
        "nearSide": NEAR_SIDE,
        "views": list(VIEWS), "mirrorPolicy": {"dir8": {0: "front34", 1: "front34",
            2: "side", 3: "back34", 4: "back34", 5: "back34", 6: "side", 7: "front34"},
            "mirrored": [5, 6, 7]}})
    manifest.setdefault("heightM", 1.62 if set_id.startswith("female") else 1.70)
    manifest.setdefault("palette", {"clothPrimary": "#6B5141", "clothSecondary": "#394C53",
        "skin": "#E9CFB4", "footwear": "#332B27", "hair": "#211C1A"})
    identity = _identity_from_set(set_dir)
    if identity is not None:
        manifest["kind"] = "identity"
        manifest["identity"] = identity
        manifest["skeleton"] = "tianshu_humanoid.v1"
        manifest["boneLengthsM"] = dict(BONE_LENGTHS_M)
        manifest.setdefault("attachments", [])
    if not placeholder:
        manifest.pop("placeholder", None)
        manifest.pop("notes", None)
    return manifest


def _validate_extensions(manifest: dict[str, Any], set_dir: Path) -> None:
    kind = manifest.get("kind", "standard")
    if kind not in {"standard", "identity"}:
        raise BuildError(f"{set_dir}: kind must be standard or identity")
    if manifest.get("nearSide", "L") != "L":
        raise BuildError(f"{set_dir}: nearSide must be anatomical L")
    if kind == "identity":
        identity = manifest.get("identity")
        if not isinstance(identity, dict):
            raise BuildError(f"{set_dir}: identity rig requires identity mapping")
        required = {"npcId", "variant", "portrait", "sheetSha256"}
        if required - set(identity):
            raise BuildError(f"{set_dir}: identity missing {sorted(required-set(identity))}")
        expected = f"{identity['npcId']}__{identity['variant']}"
        if manifest.get("set") != expected:
            raise BuildError(f"{set_dir}: identity set must equal {expected}")
        digest = str(identity["sheetSha256"])
        if not re.fullmatch(r"[0-9a-f]{64}", digest):
            raise BuildError(f"{set_dir}: identity.sheetSha256 must be lowercase sha256")
        sheet_l = set_dir / "sheet/sheet_L.png"
        if not sheet_l.is_file() or sha256_file(sheet_l) != digest:
            raise BuildError(f"{set_dir}: identity sheetSha256 does not match sheet_L.png")
    skeleton = manifest.get("skeleton")
    if skeleton is not None and skeleton not in SUPPORTED_SKELETONS:
        raise BuildError(f"{set_dir}: unsupported skeleton {skeleton}")
    lengths = manifest.get("boneLengthsM", {})
    if not isinstance(lengths, dict) or any(key not in BONE_LENGTHS_M for key in lengths):
        raise BuildError(f"{set_dir}: invalid boneLengthsM keys")
    for key, value in lengths.items():
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or value <= 0:
            raise BuildError(f"{set_dir}: invalid boneLengthsM.{key}")
    attachments = manifest.get("attachments", [])
    if not isinstance(attachments, list):
        raise BuildError(f"{set_dir}: attachments must be a list")
    slots: set[str] = set()
    per_view = {view: 0 for view in VIEWS}
    for item in attachments:
        if not isinstance(item, dict) or not all(key in item for key in ("slot", "parent", "view", "file", "pivot")):
            raise BuildError(f"{set_dir}: invalid attachment")
        slot = str(item["slot"]); parent = str(item["parent"])
        view = str(item["view"]); file_path = Path(str(item["file"]))
        if (not re.fullmatch(r"[a-z][A-Za-z0-9_]*", slot) or slot in slots
                or parent not in ATTACHMENT_PARENTS or view not in VIEWS
                or file_path.is_absolute() or ".." in file_path.parts
                or file_path.suffix.lower() != ".png"
                or not (set_dir / file_path).is_file()):
            raise BuildError(f"{set_dir}: unsafe or duplicate attachment {slot}")
        with Image.open(set_dir / file_path) as opened:
            size = opened.size
        pivot = _point(item["pivot"], f"attachment:{slot}:pivot")
        if not _point_in_bounds(pivot, size):
            raise BuildError(f"{set_dir}: attachment {slot} pivot outside image")
        spring = item.get("spring", {})
        if not isinstance(spring, dict) or any(
                isinstance(value, bool) or not isinstance(value, (int, float))
                or not math.isfinite(float(value)) or value < 0
                for value in spring.values()):
            raise BuildError(f"{set_dir}: invalid attachment spring {slot}")
        slots.add(slot)
        per_view[view] += 1
    if any(count > 4 for count in per_view.values()):
        raise BuildError(f"{set_dir}: attachments exceed four slots per view")


def build_manifest(set_dir: Path, *, check: bool = False, placeholder: bool | None = None) -> dict[str, Any]:
    path = set_dir / "manifest.yaml"
    existing: dict[str, Any] | None = None
    if path.exists():
        loaded = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(loaded, dict):
            raise BuildError(f"{path}: manifest must be a mapping")
        existing = loaded
    if placeholder is None:
        placeholder = bool((existing or {}).get("placeholder", False))
    manifest = _base_manifest(set_dir, existing, placeholder=placeholder)
    if placeholder:
        manifest["placeholder"] = True
        manifest["notes"] = "程序占位，不是正式美术；三视图切件入库后由 make_parts.py 覆盖。"
    old_parts = {(item.get("view"), item.get("id")): item
                 for item in (existing or {}).get("parts", []) if isinstance(item, dict)}
    records: list[dict[str, Any]] = []
    pending_images: list[tuple[Path, bytes]] = []
    for view in VIEWS:
        sidecar_path, raw_sidecar_points, sidecar_coordinates = _load_joint_sidecar(set_dir, view)
        view_dir = set_dir / view
        if not view_dir.is_dir():
            raise BuildError(f"missing rig view directory: {view_dir}")
        pngs = list(view_dir.glob("*.png"))
        actual = {item.stem for item in pngs}
        missing, unknown = set(SOURCE_PARTS) - actual, actual - set(SOURCE_PARTS)
        if missing or unknown or len(pngs) != len(actual):
            raise BuildError(f"{view}: parts mismatch missing={sorted(missing)} unknown={sorted(unknown)}")
        for part in SOURCE_PARTS:
            source = view_dir / f"{part}.png"
            previous = old_parts.get((view, part), {})
            source_hash = sha256_file(source)
            part_sidecar_path, part_points, part_coordinates = _part_sidecar(
                set_dir, view, part)
            joint_source_path = part_sidecar_path or sidecar_path
            sidecar_points = part_points if part_sidecar_path else raw_sidecar_points
            coordinates = part_coordinates if part_sidecar_path else sidecar_coordinates
            joint_source = (str(joint_source_path.relative_to(set_dir))
                            if joint_source_path is not None else None)
            sidecar_loaded = (yaml.safe_load(joint_source_path.read_text(encoding="utf-8"))
                              if joint_source_path is not None else {})
            source_note = (sidecar_loaded.get("source", {})
                           if isinstance(sidecar_loaded, dict) else {})
            selected = _sidecar_points_for_part(part, sidecar_points)
            crop_points = _crop_points(selected, coordinates, previous,
                                       joint_source, source_hash)
            normalized, pad, origin = normalize_part(source, crop_points)
            blob = png_bytes(normalized)
            normalized_hash = sha256_bytes(blob)
            if check:
                if source_hash != normalized_hash:
                    raise BuildError(f"{source}: image is not normalized")
            else:
                pending_images.append((source, blob))
            source_origin = None
            if joint_source is not None:
                sidecar_points, source_origin = _translate_sidecar(
                    sidecar_points, coordinates, origin, previous, joint_source, source_hash)
            sidecar = _sidecar_metadata(part, sidecar_points)
            pivot, child = sidecar or joint_metadata(view, part, normalized.size, pad)
            if not _point_in_bounds(pivot, normalized.size) or any(
                    not _point_in_bounds(point, normalized.size) for point in child.values()):
                raise BuildError(f"{view}/{part}: pivot or childJoint lies outside image")
            if previous:
                previous_file = Path(str(previous.get("file", "")))
                if previous_file.is_absolute() or ".." in previous_file.parts:
                    raise BuildError(f"{view}/{part}: manifest file path escapes rig set")
            default_angle = -90.0 if part.startswith("forearm_") else 0.0
            rest_angle = float(previous.get("restAngle", default_angle))
            if not math.isfinite(rest_angle) or not -180.0 <= rest_angle < 180.0:
                raise BuildError(f"{view}/{part}: invalid restAngle {rest_angle}")
            if part.startswith("forearm_") and rest_angle != -90.0:
                raise BuildError(f"{view}/{part}: v1 forearm restAngle must be -90.0")
            record = dict(previous)
            record.update({"id": part, "file": f"{view}/{part}.png", "view": view,
                "pivot": pivot, "childJoint": child, "size": list(normalized.size),
                "restAngle": rest_angle, "zOrder": Z_ORDER[view][part],
                "tintable": TINTABLE.get(part, False), "sha256": normalized_hash})
            if joint_source_path is not None:
                if isinstance(source_note, dict):
                    keys = source_note.get("keypoints", list(sidecar_points))
                    percent = float(source_note.get("inpaintedPct", 0.0))
                    if not 0.0 <= percent <= 100.0:
                        raise BuildError(f"{joint_source_path}: inpaintedPct outside 0..100")
                    record["source"] = {"keypoints": [str(item) for item in keys],
                                          "inpaintedPct": percent}
                    for key in ("reconstruction", "sourceRect"):
                        if key in source_note:
                            record["source"][key] = source_note[key]
                    if source_note.get("standardFallback"):
                        record["source"]["standardFallback"] = True
                        rejected = float(source_note.get("rejectedInpaintedPct", 0.0))
                        if not 0.0 <= rejected <= 100.0:
                            raise BuildError(
                                f"{joint_source_path}: rejectedInpaintedPct outside 0..100")
                        record["source"]["rejectedInpaintedPct"] = rejected
            if joint_source is not None:
                record["jointSource"] = joint_source
                if source_origin is not None:
                    record["sourceOrigin"] = source_origin
                else:
                    record.pop("sourceOrigin", None)
            else:
                record.pop("jointSource", None)
                record.pop("sourceOrigin", None)
            records.append(record)
    manifest["parts"] = records
    if "assets" in manifest or manifest.get("kind") == "identity":
        manifest["assets"] = [{
            "id": f"{manifest['set']}__{item['view']}__{item['id']}",
            "file": item["file"], "category": "rig/part", "style": "default",
            "subject": f"{manifest['set']} {item['view']} {item['id']} segmented rig part",
            "prompt": "Deterministic capsule segmentation from the registered three-view sheet; no generated pixels except recorded inpainting.",
            "tool": "tools/rig/segment_parts.py + tools/rig/make_parts.py",
            "model": "deterministic", "created": "2026-10-02",
            "size": f"{item['size'][0]}x{item['size'][1]}",
            "sha256": item["sha256"], "status": "candidate",
        } for item in records]
    _validate_extensions(manifest, set_dir)
    if check:
        if existing != manifest:
            raise BuildError(f"{path}: manifest differs from normalized source parts")
    else:
        for source, blob in pending_images:
            source.write_bytes(blob)
        path.write_text(yaml.dump(manifest, Dumper=_NoAliasDumper, allow_unicode=True, sort_keys=False, width=1000), encoding="utf-8")
    return manifest


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="规范化 tianshu_rig 三视图部件并写 manifest。")
    parser.add_argument("set_dir", type=Path)
    parser.add_argument("--check", action="store_true", help="核对 PNG 与 manifest，不写文件")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        manifest = build_manifest(args.set_dir.resolve(), check=args.check)
    except (BuildError, OSError, ValueError, yaml.YAMLError) as exc:
        print(f"make_parts: {exc}", file=sys.stderr)
        return 1
    print(f"{args.set_dir}: {len(manifest['parts'])} part image(s) {'checked' if args.check else 'built'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
