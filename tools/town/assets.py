"""Town manifest lookup; missing variants remain explicit preview diagnostics."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_TILES = ROOT / "assets/default/baseline/tile/manifest.yaml"
DEFAULT_BUILDINGS = ROOT / "assets/default/baseline/building-map/manifest.yaml"


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
        self.placeholders_only = placeholders_only
        self._images: dict[Path, Image.Image] = {}
        if not self.path.exists():
            self.warnings.add(f"manifest 不存在：{self.path}")
            return
        try:
            entries = _entries(yaml.safe_load(self.path.read_text(encoding="utf-8")))
        except (OSError, ValueError, yaml.YAMLError) as exc:
            self.warnings.add(f"manifest 读取失败：{self.path}：{exc}")
            return
        for index, entry in enumerate(entries):
            try:
                if not isinstance(entry, dict):
                    raise ValueError("资产记录必须为映射")
                asset_id = entry.get("asset_id", entry.get("id"))
                if not isinstance(asset_id, str):
                    raise ValueError("资产记录缺 id/asset_id")
                merged = dict(entry)
                base = self.path.parent
                metadata = entry.get("metadata", entry.get("meta", entry.get("meta_file")))
                if isinstance(metadata, str):
                    meta_path = _file(base, metadata)
                    meta = yaml.safe_load(meta_path.read_text(encoding="utf-8"))
                    if not isinstance(meta, dict):
                        raise ValueError(f"{meta_path} 不是元数据映射")
                    merged = dict(entry, **meta)
                    base = meta_path.parent
                elif isinstance(metadata, dict):
                    merged.update(metadata)
                merged["_base"] = base
                self.records.setdefault(asset_id, []).append(merged)
            except (OSError, ValueError, TypeError, yaml.YAMLError) as exc:
                self.warnings.add(f"manifest 记录[{index}]读取失败：{self.path}：{exc}")

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
                variants = [dict(v if isinstance(v, dict) else {"file": v}, rotation_deg=int(k))
                            for k, v in views.items()]
            if isinstance(variants, dict):
                variants = [dict(v if isinstance(v, dict) else {"file": v}, key=k)
                            for k, v in variants.items()]
            if variants:
                for variant in variants:
                    if isinstance(variant, str):
                        variant = {"file": variant}
                    candidates.append(dict(record, **variant))
            else:
                candidates.append(record)
        return candidates

    def resolve(self, asset_id: str, *, variant_index: int = 0, mask: int | None = None,
                rotation_deg: int | None = None, width_cells: int | None = None
                ) -> tuple[Image.Image, dict] | None:
        """Select an exact mask/view; never rotate a flat PNG into another 3D view."""
        label = asset_id
        filters = {"mask": mask, "rotation_deg": rotation_deg, "width_cells": width_cells}
        label += "".join(f"/{k}={v}" for k, v in filters.items() if v is not None)
        try:
            candidates = self._candidates(asset_id)
        except (AttributeError, TypeError, ValueError) as exc:
            self.warnings.add(f"素材变体元数据无效：{asset_id}：{exc}")
            self.missing.add(label + "/metadata")
            return None
        for key, value in filters.items():
            if value is None:
                continue
            # A single-view record is only valid for its native zero-degree view.
            if key == "rotation_deg":
                candidates = [c for c in candidates if c.get(key, 0) == value]
            else:
                candidates = [c for c in candidates if c.get(key) == value]
        candidates = [c for c in candidates if c.get("status") != "rejected"]
        if not candidates:
            self.missing.add(label)
            return None
        chosen = candidates[variant_index % len(candidates)]
        if self.placeholders_only:
            self.missing.add(label + "/forced-placeholder")
            return None
        file_name = chosen.get("file", chosen.get("png"))
        if not isinstance(file_name, str):
            self.missing.add(label + "/file")
            return None
        path = _file(chosen["_base"], file_name)
        try:
            if path not in self._images:
                with Image.open(path) as image:
                    if image.mode != "RGBA":
                        raise ValueError("贴片 / 建筑必须为 RGBA 图像")
                    self._images[path] = image.copy()
            return self._images[path], chosen
        except (OSError, ValueError) as exc:
            self.missing.add(label + "/file")
            self.warnings.add(f"{path}：{exc}")
            return None
