#!/usr/bin/env python3
"""Export the authored VFX binding YAML and template metadata as stable runtime JSON."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

import yaml

ROOT = Path(__file__).resolve().parents[2]
BINDINGS_SOURCE = ROOT / "assets/default/vfx/bindings.yaml"
BINDINGS_OUTPUT = ROOT / "content/vfx/bindings.json"
CATALOG_OUTPUT = ROOT / "content/vfx/catalog.json"
VFX_ROOT = ROOT / "assets/default/vfx"
PALETTE = ROOT / "docs/design/vfx/palette.yaml"
MODES = {"qi_projection", "afterimage", "plain_strike"}
CONTENT_CHAPTER = "ch00_yuenv"


def content_envelope(identifier: str, event: str, action_id: str, payload: object) -> dict:
    """Keep generated runtime JSON valid under the repository content gate."""
    return {
        "schemaVersion": "event.v1",
        "id": identifier,
        "chapterId": CONTENT_CHAPTER,
        "event": event,
        "once": False,
        "actions": [{"id": action_id, "op": "vfx/loadRuntimeData", "payload": payload}],
    }


def load_yaml(path: Path) -> object:
    with path.open(encoding="utf-8") as stream:
        return yaml.safe_load(stream)


def bindings_payload() -> list[dict]:
    value = load_yaml(BINDINGS_SOURCE)
    if not isinstance(value, list):
        raise ValueError("bindings.yaml must contain a list")
    seen: set[str] = set()
    for number, row in enumerate(value, 1):
        if not isinstance(row, dict) or not isinstance(row.get("move"), str):
            raise ValueError(f"binding {number} has no move ID")
        move = row["move"]
        if move in seen:
            raise ValueError(f"duplicate move binding: {move}")
        seen.add(move)
        if row.get("mode") == "template" and row.get("template") not in MODES:
            raise ValueError(f"unknown template for {move}")
    return value


def catalog_payload() -> dict:
    effects: dict[str, dict] = {}
    for path in sorted((VFX_ROOT / "templates").glob("*/*/effect.yaml")):
        relative = path.parent.relative_to(VFX_ROOT).as_posix()
        effects["/".join(path.relative_to(VFX_ROOT / "templates").parts[:2])] = {
            "baseUrl": f"/assets/default/vfx/{relative}/", "effect": load_yaml(path),
        }
    emitters: dict[str, dict] = {}
    for path in sorted((VFX_ROOT / "emitters").glob("*/emitter-plate.yaml")):
        name = path.parent.name
        emitters[name] = {"baseUrl": f"/assets/default/vfx/emitters/{name}/",
                          "emitter": load_yaml(path)}
    palette = load_yaml(PALETTE)
    if not isinstance(palette, dict) or not isinstance(palette.get("colors"), dict):
        raise ValueError("palette.yaml has no colors map")
    return {"schema": "tianshu-vfx-catalog.v1", "palette": palette["colors"],
            "effects": effects, "emitters": emitters}


def _runtime_files() -> set[Path]:
    files: set[Path] = {BINDINGS_OUTPUT, CATALOG_OUTPUT}
    compositions = sorted(VFX_ROOT.glob("sk_*/moves/*/composition.json"))
    compositions += sorted((ROOT / "assets/default/baseline/vfx").glob("*/composition.json"))
    for composition in compositions:
        files.add(composition)
        value = json.loads(composition.read_text(encoding="utf-8"))
        effect = value.get("effect") or {}
        for source in (effect.get("source") or {}).get("files", []):
            files.add(_asset_file(composition, value.get("effect_set"), source))
        emitter = value.get("emitter") or {}
        if emitter.get("file"):
            files.add(_asset_file(composition, value.get("emitter_plate"), emitter["file"]))
    for part in catalog_payload()["effects"].values():
        effect = part["effect"]
        base = ROOT / part["baseUrl"].lstrip("/")
        for source in (effect.get("source") or {}).get("files", []):
            files.add((base / source).resolve())
    for part in catalog_payload()["emitters"].values():
        emitter = part["emitter"]
        source = (ROOT / part["baseUrl"].lstrip("/") / emitter["file"]).resolve()
        if not source.is_relative_to(VFX_ROOT.resolve()) or not source.is_file():
            raise ValueError(f"runtime VFX emitter is invalid: {source}")
        files.add(source)
    return files


def _asset_file(composition: Path, metadata_ref: str | None, name: str) -> Path:
    if not metadata_ref:
        raise ValueError(f"{composition}: missing effect_set")
    path = (composition.parent / metadata_ref).resolve().parent / name
    allowed = (ROOT / "assets/default").resolve()
    if not path.is_relative_to(allowed) or not path.is_file():
        raise ValueError(f"runtime VFX asset is invalid: {path}")
    return path


def write_manifest(check: bool) -> bool:
    output = ROOT / "content/vfx/runtime-files.json"
    paths = []
    for path in sorted(_runtime_files()):
        relative = path.resolve().relative_to(ROOT).as_posix()
        paths.append(relative)
    payload = {"schema": "tianshu-vfx-runtime.v1", "files": paths}
    document = content_envelope("ev_vfx_runtime_files", "vfx/runtimeFiles", "vfx_runtime_files", payload)
    return sync(output, encoded(document), check)


def encoded(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2, sort_keys=False) + "\n"


def sync(path: Path, expected: str, check: bool) -> bool:
    actual = path.read_text(encoding="utf-8") if path.is_file() else None
    if check:
        if actual != expected:
            print(f"不同步：{path.relative_to(ROOT)}；运行 python3 tools/vfx/export_bindings.py", file=sys.stderr)
            return False
        return True
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(expected, encoding="utf-8")
    print(path.relative_to(ROOT))
    return True


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="只检查生成物，不写文件")
    args = parser.parse_args(argv)
    bindings = {"schema": "tianshu-vfx-bindings.v1", "bindings": bindings_payload()}
    bindings_doc = content_envelope("ev_vfx_runtime_bindings", "vfx/runtimeBindings",
                                    "vfx_runtime_bindings", bindings)
    catalog_doc = content_envelope("ev_vfx_runtime_catalog", "vfx/runtimeCatalog",
                                   "vfx_runtime_catalog", catalog_payload())
    ok = sync(BINDINGS_OUTPUT, encoded(bindings_doc), args.check)
    ok = sync(CATALOG_OUTPUT, encoded(catalog_doc), args.check) and ok
    ok = write_manifest(args.check) and ok
    return int(not ok)


if __name__ == "__main__":
    raise SystemExit(main())
