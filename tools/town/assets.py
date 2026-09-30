"""Town manifest lookup; missing variants remain explicit preview diagnostics."""

from __future__ import annotations

from pathlib import Path
import re
from typing import Any

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_TILES = ROOT / "assets/default/baseline/tile/manifest.yaml"
DEFAULT_BUILDINGS = ROOT / "assets/default/baseline/building-map/manifest.yaml"

# The 60-piece delivery shares these materials between the two town kits.
# This finite map is deliberate: an unknown suffix remains a missing asset.
SHARED_TILE_OWNER = {"rammed_earth": "song_dali", "dirt_road": "song_dali",
                     "grass": "song_dali", "grey_brick": "song_southern",
                     "stone_slab": "song_southern", "water": "song_southern",
                     "riverbank": "song_dali", "road_edge": "song_southern",
                     "shadow_soft": "song_dali"}


def _normalize(record: dict) -> dict:
    """Expose renderer geometry without changing the original provenance fields."""
    record = dict(record)
    shape = record.get("building", record.get("tile", {}))
    if not isinstance(shape, dict):
        raise ValueError("building/tile 元数据必须为映射")
    footprint = shape.get("footprint", record.get("footprint_m"))
    if isinstance(footprint, (list, tuple)) and len(footprint) == 2:
        record.setdefault("footprint_cells", dict(w=footprint[0], h=footprint[1]))
        record.setdefault("footprint_m", list(footprint))
        record.setdefault("footprint_width_px", 32 * sum(footprint))
    contract = record.get("projection_contract", {})
    record.setdefault("tile_px", contract.get("tile_px", [64, 32]))
    if "ground_width_px" in contract:
        record["footprint_width_px"] = contract["ground_width_px"]
    if "anchor" in shape:
        record.setdefault("anchor_px", shape["anchor"])
    if "tile" in record:
        record.setdefault("kind", shape.get("kind"))
        variant = shape.get("variant", "")
        record.setdefault("variant_key", variant)
        if shape.get("autotile_mask") is not None:
            record.setdefault("mask", shape["autotile_mask"])
        if match := re.search(r"(?:^|_)r(\d{3})(?:_|$)", variant):
            record.setdefault("rotation_deg", int(match[1]))
        if match := re.match(r"(?:k|w)(\d+)_", variant):
            record.setdefault("width_cells", int(match[1]))
        if match := re.search(r"_l(\d+)_", variant):
            record.setdefault("length_cells", int(match[1]))
        if shape.get("kind") in set(SHARED_TILE_OWNER) - {"shadow_soft"}:
            record.setdefault("anchor_px", [32, 16])
    record.setdefault("source_ids", [record.get("id", record.get("asset_id"))])
    return record


def _entries(value: Any) -> list[dict]:
    if isinstance(value, list):
        return value
    if isinstance(value, dict):
        for key in ("assets", "entries", "items"):
            if key in value:
                return _entries(value[key])
        if "id" in value or "asset_id" in value:
            return [value]
        return [dict(item, id=key) for key, item in value.items()
                if isinstance(item, dict)]
    raise ValueError("manifest 必须为资产列表或 assets 映射")


def _file(base: Path, value: str) -> Path:
    candidate = Path(value)
    if candidate.is_absolute():
        return candidate
    local = base / candidate
    return local if local.exists() else ROOT / candidate


class AssetLibrary:
    """Load provenance records, per-asset metadata and explicit manifest aliases."""

    def __init__(self, manifest: str | Path, placeholders_only: bool = False):
        self.path = Path(manifest)
        self.records: dict[str, list[dict]] = {}
        self.missing: set[str] = set()
        self.warnings: set[str] = set()
        self.used_ids: set[str] = set()
        self.substitutions: set[tuple[str, str, str]] = set()
        self.placeholders_only = placeholders_only
        self._images: dict[Path, Image.Image] = {}
        self._composites: dict[tuple[str, int], tuple[Image.Image, dict]] = {}
        self._load(self.path)
        props = self.path.parent / "props/manifest.yaml"
        if props.exists():
            self._load(props)

    def _load(self, path: Path) -> None:
        if not path.exists():
            self.warnings.add(f"manifest 不存在：{path}")
            return
        try:
            entries = _entries(yaml.safe_load(path.read_text(encoding="utf-8")))
        except (OSError, ValueError, yaml.YAMLError) as exc:
            self.warnings.add(f"manifest 读取失败：{path}：{exc}")
            return
        for index, entry in enumerate(entries):
            try:
                if not isinstance(entry, dict):
                    raise ValueError("资产记录必须为映射")
                asset_id = entry.get("asset_id", entry.get("id"))
                if not isinstance(asset_id, str):
                    raise ValueError("资产记录缺 id/asset_id")
                merged = dict(entry)
                base = path.parent
                bases = [base]
                metadata = entry.get("metadata", entry.get("meta", entry.get("meta_file")))
                if isinstance(metadata, str):
                    meta_path = _file(base, metadata)
                    meta = yaml.safe_load(meta_path.read_text(encoding="utf-8"))
                    if not isinstance(meta, dict):
                        raise ValueError(f"{meta_path} 不是元数据映射")
                    merged = dict(entry, **meta)
                    bases.append(meta_path.parent)
                    # Manifest records own their individual IDs and native files;
                    # shared prop metadata also lists all sibling variants.
                    for key in ("id", "file", "variant_key"):
                        if key in entry:
                            merged[key] = entry[key]
                    if "variant_key" in entry:
                        merged.pop("variants", None)
                elif isinstance(metadata, dict):
                    merged.update(metadata)
                merged["_base"] = base
                merged["_bases"] = bases
                merged = _normalize(merged)
                self.records.setdefault(asset_id, []).append(merged)
                if "tile" in merged and "__" in asset_id:
                    self.records.setdefault(asset_id.split("__", 1)[0], []).append(merged)
            except (OSError, ValueError, TypeError, yaml.YAMLError) as exc:
                self.warnings.add(f"manifest 记录[{index}]读取失败：{path}：{exc}")

    def _candidates(self, asset_id: str, seen: frozenset[str] = frozenset()) -> list[dict]:
        if asset_id in seen:
            self.warnings.add(f"manifest alias 成环：{asset_id}")
            return []
        seen = seen | {asset_id}
        candidates = []
        for record in self.records.get(asset_id, []):
            if isinstance(record.get("alias"), str):
                candidates.extend(self._candidates(record["alias"], seen))
                continue
            variants = record.get("variants")
            masks = record.get("masks", record.get("autotile", {}).get("masks")
                               if isinstance(record.get("autotile"), dict) else None)
            views = record.get("views")
            if masks:
                variants = [dict(v if isinstance(v, dict) else {"file": v}, mask=int(k))
                            for k, v in masks.items()]
            elif views:
                variants = ([dict(v if isinstance(v, dict) else {"file": v}, rotation_deg=int(k))
                             for k, v in views.items()] if isinstance(views, dict) else views)
            if isinstance(variants, dict):
                variants = [dict(v if isinstance(v, dict) else {"file": v}, key=k)
                            for k, v in variants.items()]
            if variants:
                for variant in variants:
                    if isinstance(variant, str):
                        variant = {"file": variant}
                    candidates.append(_normalize(dict(record, **variant)))
            else:
                candidates.append(record)
        return candidates

    def _shared(self, asset_id: str) -> tuple[list[dict], list[str]]:
        candidates = self._candidates(asset_id)
        if candidates:
            return candidates, []
        match = re.fullmatch(r"tex_town_(song_dali|song_southern)_(.+)", asset_id)
        if match and match[2] in SHARED_TILE_OWNER:
            owner = SHARED_TILE_OWNER[match[2]]
            target = f"tex_town_{owner}_{match[2]}"
            candidates = self._candidates(target)
            if candidates:
                return candidates, [f"shared-material:{asset_id}->{target}"]
        return [], []

    def _read(self, chosen: dict, label: str) -> Image.Image | None:
        file_name = chosen.get("file", chosen.get("png"))
        if not isinstance(file_name, str):
            self.missing.add(label + "/file")
            return None
        paths = [base / file_name for base in chosen.get("_bases", [chosen["_base"]])]
        path = next((p for p in paths if p.exists()), _file(chosen["_base"], file_name))
        try:
            if path not in self._images:
                with Image.open(path) as image:
                    if image.mode != "RGBA":
                        raise ValueError("贴片 / 建筑必须为 RGBA 图像")
                    self._images[path] = image.copy()
            return self._images[path]
        except (OSError, ValueError) as exc:
            self.missing.add(label + "/file")
            self.warnings.add(f"{path}：{exc}")
            return None

    def _finish(self, image: Image.Image, chosen: dict, asset_id: str,
                adaptations: list[str], rotation: int | None) -> tuple[Image.Image, dict]:
        meta = dict(chosen, requested_id=asset_id, adaptations=adaptations)
        if rotation is not None:
            meta["requested_rotation_deg"] = rotation
        self.used_ids.update(meta["source_ids"])
        for reason in adaptations:
            for source in meta["source_ids"]:
                self.substitutions.add((asset_id, source, reason))
        return image, meta

    def _compose_edges(self, asset_id: str, mask: int, candidates: list[dict]
                       ) -> tuple[Image.Image, dict] | None:
        """Combine registered side pieces; trim corner pieces for concave joins."""
        if not isinstance(mask, int) or not 0 <= mask <= 255:
            return None
        key = (asset_id, mask)
        if key in self._composites:
            return self._composites[key]
        sides = {c.get("variant_key"): c for c in candidates if c.get("status") != "rejected"}
        if not {"n", "e", "s", "w", "ne", "se", "sw", "nw"} <= sides.keys():
            return None
        pieces, covered = [], set()
        # Pair missing cardinal sides into a delivered convex corner.
        corners = (("ne", 1, 4, 2, (48, 0, 64, 32)),
                   ("se", 4, 16, 8, (0, 24, 64, 32)),
                   ("sw", 16, 64, 32, (0, 0, 16, 32)),
                   ("nw", 64, 1, 128, (0, 0, 64, 8)))
        for name, first, second, diagonal, crop in corners:
            if not mask & first and not mask & second and not ({first, second} & covered):
                pieces.append((name, None))
                covered.update((first, second))
        for name, bit in (("n", 1), ("e", 4), ("s", 16), ("w", 64)):
            if not mask & bit and bit not in covered:
                pieces.append((name, None))
        # A diagonal-only opposite neighbor is an inner corner, not two
        # exposed sides. Use just the native corner tip to avoid water spurs.
        tips = {"ne": (60, 14, 64, 18), "se": (30, 30, 34, 32),
                "sw": (0, 14, 4, 18), "nw": (30, 0, 34, 2)}
        for name, first, second, diagonal, _ in corners:
            if mask & first and mask & second and not mask & diagonal:
                pieces.append((name, tips[name]))
        canvas, ids, statuses = Image.new("RGBA", (64, 32)), [], []
        for name, crop in pieces:
            record = sides[name]
            image = self._read(record, f"{asset_id}/mask={mask}/{name}")
            if image is None:
                return None
            if image.size != (64, 32):
                self.warnings.add(f"边件必须为64×32：{record['id']}")
                return None
            if crop:
                canvas.alpha_composite(image.crop(crop), (crop[0], crop[1]))
            else:
                canvas.alpha_composite(image)
            ids.extend(record["source_ids"])
            statuses.append(record.get("status"))
        meta = dict(id=asset_id, source_ids=sorted(set(ids)), mask=mask,
                    status="approved" if statuses and all(s == "approved" for s in statuses) else "candidate",
                    anchor_px=[32, 16], footprint_cells=dict(w=1, h=1),
                    footprint_width_px=64, tile_px=[64, 32], composition="eight-direction-edges")
        self._composites[key] = canvas, meta
        return canvas, meta

    def resolve(self, asset_id: str, *, variant_index: int = 0, mask: int | None = None,
                rotation_deg: int | None = None, width_cells: int | None = None
                ) -> tuple[Image.Image, dict] | None:
        """Select native imagery; finite candidate substitutions stay auditable."""
        label = asset_id
        filters = {"mask": mask, "rotation_deg": rotation_deg, "width_cells": width_cells}
        label += "".join(f"/{k}={v}" for k, v in filters.items() if v is not None)
        if self.placeholders_only:
            self.missing.add(label + "/forced-placeholder")
            return None
        try:
            candidates, adaptations = self._shared(asset_id)
        except (AttributeError, TypeError, ValueError) as exc:
            self.warnings.add(f"素材变体元数据无效：{asset_id}：{exc}")
            self.missing.add(label + "/metadata")
            return None
        candidates = [c for c in candidates if c.get("status") != "rejected"]
        if mask is not None:
            exact = [c for c in candidates if c.get("mask") == mask]
            if not exact and re.fullmatch(r"tex_town_song_(dali|southern)_(riverbank|road_edge)", asset_id):
                if composed := self._compose_edges(asset_id, mask, candidates):
                    return self._finish(*composed, asset_id, adaptations, rotation_deg)
            candidates = exact
        if rotation_deg is not None:
            exact = [c for c in candidates if c.get("rotation_deg", 0) == rotation_deg]
            bridge = re.fullmatch(r"tex_town_(song_dali|song_southern)_(bridge_deck|bridge_rail)", asset_id)
            if not exact and bridge and rotation_deg in (0, 90):
                owner = "song_dali" if rotation_deg == 0 else "song_southern"
                target = f"tex_town_{owner}_{bridge[2]}"
                exact = [c for c in self._candidates(target)
                         if c.get("rotation_deg", 0) == rotation_deg and c.get("status") != "rejected"]
                if exact:
                    adaptations.append(f"shared-bridge-view:{asset_id}->{target}")
            if not exact and rotation_deg in (0, 90, 180, 270):
                # Buildings require their actual requested camera view: reusing
                # 0 degrees changes both entrances and nonsquare footprints.
                native = [c for c in candidates
                          if c.get("kind") in ("wall", "wall_corner")
                          and not isinstance(c.get("building"), dict)]
                if native:
                    exact = native
                    adaptations.append(f"native-view:requested={rotation_deg},source={native[0].get('rotation_deg', 0)}")
            candidates = exact
        if width_cells is not None:
            exact = [c for c in candidates if c.get("width_cells") == width_cells]
            if not exact:
                gates = [c for c in candidates if c.get("kind") == "city_gate"
                         and isinstance(c.get("width_cells"), (int, float))]
                if gates:
                    distance = min(abs(c["width_cells"] - width_cells) for c in gates)
                    exact = [c for c in gates if abs(c["width_cells"] - width_cells) == distance]
                    adaptations.append(f"gate-width:requested={width_cells},source={exact[0]['width_cells']}")
            candidates = exact
        if not candidates:
            self.missing.add(label)
            return None
        chosen = candidates[variant_index % len(candidates)]
        image = self._read(chosen, label)
        return None if image is None else self._finish(image, chosen, asset_id, adaptations, rotation_deg)
