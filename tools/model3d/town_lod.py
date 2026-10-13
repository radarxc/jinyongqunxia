#!/usr/bin/env python3
"""Build validated, deterministic town LODs for skinned character GLBs."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
from typing import Any, Sequence

from PIL import Image
import yaml

ROOT = Path(__file__).resolve().parents[2]
DRESSUP = Path(__file__).with_name("dressup")
sys.path.insert(0, str(DRESSUP))
from glb_io import GLB, load_glb  # noqa: E402

VERSION = "town-lod.v3"
LOD_SPECS = (("lod0.glb", 25_000, 1024), ("lod1.glb", 9_000, 512))
MAX_LOD0_BYTES = 1_600_000
MAX_SLIP_M = 0.02
FALLBACK_CLIPS = {
    "npc_duanyu": "npc_generic_m",
    "npc_liwenxiu__ch10_youth": "npc_generic_f",
}
MANIFEST_FIELDS = ("id file category style subject prompt negative references tool model "
                   "effort created source_path size sha256 status notes").split()


def _run(command: list[str]) -> dict[str, Any]:
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, check=False)
    if result.returncode:
        detail = result.stderr.strip() or result.stdout.strip()
        raise RuntimeError(f"命令失败（exit {result.returncode}）：{' '.join(command)}\n{detail}")
    try:
        return json.loads(result.stdout.strip().splitlines()[-1])
    except (IndexError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"命令未输出 JSON：{' '.join(command)}") from exc


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""): digest.update(chunk)
    return digest.hexdigest()


def _triangles(glb: GLB) -> int:
    return sum(len(mesh.indices) // 3 for mesh in glb.meshes())


def _joint_names(glb: GLB) -> list[str]:
    if not glb.json.get("skins"): raise ValueError(f"{glb.path}: 缺 skin")
    nodes = glb.json.get("nodes", [])
    return [str(nodes[index].get("name", "")) for index in glb.skin().joints]


def _check_weights(glb: GLB) -> None:
    count = 0
    for mesh in glb.meshes():
        if mesh.joints is None or mesh.weights is None: raise ValueError(f"{glb.path}: 网格缺蒙皮权重")
        sums = mesh.weights.sum(axis=1); count += len(sums)
        if len(sums) and float(abs(sums - 1.0).max()) > 1e-3:
            raise ValueError(f"{glb.path}: 顶点权重和超出 1 ± 1e-3")
    if not count: raise ValueError(f"{glb.path}: 没有蒙皮顶点")


def _texture_size(glb: GLB) -> int:
    maximum = 0
    for index in range(len(glb.json.get("images", []))):
        from io import BytesIO
        with Image.open(BytesIO(glb.image(index).data)) as image: maximum = max(maximum, *image.size)
    return maximum


def _check_base_color_only(glb: GLB) -> None:
    allowed = {"baseColorFactor", "baseColorTexture"}
    for material in glb.json.get("materials", []):
        pbr = material.get("pbrMetallicRoughness", {})
        if set(pbr) - allowed: raise ValueError(f"{glb.path}: 材质仍含非 baseColor PBR 字段")
        if any(key in material for key in ("normalTexture", "occlusionTexture", "emissiveTexture")):
            raise ValueError(f"{glb.path}: 材质仍含非 baseColor 贴图")


def _measure(model: Path, clips: Path) -> dict[str, Any]:
    return _run(["node", str(Path(__file__).with_name("measure_gait.mjs")),
                 str(model), "--clips", str(clips)])


def _clips_for(directory: Path) -> tuple[Path, str | None]:
    own = directory / "anim_idle_walk_run.glb"
    if own.is_file(): return own, None
    source_id = FALLBACK_CLIPS.get(directory.name)
    if not source_id: raise ValueError(f"{directory}: 缺 anim_idle_walk_run.glb，且没有同性通用回退")
    path = directory.parent / source_id / "anim_idle_walk_run.glb"
    if not path.is_file(): raise ValueError(f"{directory}: 回退动画不存在：{path}")
    return path, source_id


def _build_lod(source: Path, target: Path, triangles: int, texture_size: int, work: Path) -> None:
    textured = work / f"{target.stem}.texture.glb"
    _run([sys.executable, str(DRESSUP / "textures.py"), str(source), str(textured),
          "--max", str(texture_size), "--quality", "85"] )
    source_triangles = _triangles(load_glb(textured)); ratio = min(1.0, triangles / source_triangles)
    # Locked borders can prevent an exact ratio; retry monotonically until the hard cap is met.
    for attempt in range(12):
        candidate = work / f"{target.stem}.{attempt}.glb"
        _run(["node", str(DRESSUP / "pack_glb.mjs"), str(textured), str(candidate),
              "--simplify", f"{ratio:.12g}"] )
        actual = _triangles(load_glb(candidate))
        if actual <= triangles:
            target.parent.mkdir(parents=True, exist_ok=True); target.write_bytes(candidate.read_bytes()); return
        ratio *= min(0.95, triangles / actual * 0.98)
    raise ValueError(f"{source}: 12 轮后仍无法减到 {triangles} 三角")


def _validate(output: Path, clips: Path, triangle_cap: int, texture_cap: int,
              source_joints: list[str], source_stature: float,
              violations: list[str]) -> dict[str, Any]:
    glb = load_glb(output); triangles = _triangles(glb); texture_size = _texture_size(glb)
    if triangles > triangle_cap: raise ValueError(f"{output}: {triangles} 三角超过 {triangle_cap}")
    if texture_size > texture_cap: raise ValueError(f"{output}: 贴图 {texture_size} 超过 {texture_cap}")
    if _joint_names(glb) != source_joints: raise ValueError(f"{output}: 骨骼名、数量或顺序与源不同")
    _check_weights(glb); _check_base_color_only(glb)
    measured = _measure(output, clips); lod_stature = float(measured["statureMu"])
    if abs(lod_stature - source_stature) / source_stature > 0.01:
        raise ValueError(f"{output}: statureMu 与源相差超过 1%")
    for label, value in measured["slipM"].items():
        if float(value) > MAX_SLIP_M:
            violations.append(f"{output}: {label} 支撑滑移 {value:.6f} m 超过 0.02 m")
    size = output.stat().st_size
    if output.name == "lod0.glb" and size > MAX_LOD0_BYTES:
        raise ValueError(f"{output}: {size} bytes 超过 {MAX_LOD0_BYTES}")
    return {"file": output.name, "triangles": triangles, "textureSize": texture_size, "bytes": size}


def _manifest(asset_id: str, source: Path, source_hash: str, lods: list[dict[str, Any]],
              town_dir: Path, metadata_hash: str) -> str:
    try: source_path = source.relative_to(ROOT).as_posix()
    except ValueError: source_path = source.as_posix()
    rows = []
    for index, lod in enumerate(lods):
        rows.extend([f"- id: {asset_id}__town_lod{index}", f"  file: {lod['file']}",
                     "  category: model3d", "  style: default",
                     f"  subject: {asset_id} 城镇减面 LOD{index}",
                     "  prompt: n/a（离线减面，非生成模型）",
                     "  negative: none（离线减面）", "  references:",
                     f"  - path: {source_path}", f"    sha256: {source_hash}",
                     "    use: 减面源模型",
                     f"  tool: tools/model3d/town_lod.py {VERSION}",
                     "  model: n/a", "  effort: deterministic-offline",
                     f"  source_path: {source_path}",
                     f"  source_sha256: {source_hash}", f"  sha256: {_sha256(town_dir / lod['file'])}",
                     f"  size_bytes: {lod['bytes']}", f"  triangles: {lod['triangles']}",
                     f"  texture_size: {lod['textureSize']}", f"  size: {lod['bytes']} bytes",
                     "  created: '2026-10-12'", "  status: candidate",
                     "  notes: 仅 baseColor；meshopt 压缩；保留 UV、骨骼与蒙皮权重。"] )
    rows.extend([f"- id: {asset_id}__town_metadata", "  file: town.json",
                 "  category: model3d", "  style: default",
                 f"  subject: {asset_id} 城镇 LOD 元数据",
                 "  prompt: n/a（离线量测，非生成模型）",
                 "  negative: none（离线量测）", "  references:",
                 f"  - path: {source_path}", f"    sha256: {source_hash}",
                 "    use: 身高与步态量测源模型",
                 f"  tool: tools/model3d/town_lod.py {VERSION}",
                 "  model: n/a", "  effort: deterministic-offline",
                 f"  source_path: {source_path}",
                 f"  size: {(town_dir / 'town.json').stat().st_size} bytes", "  created: '2026-10-12'",
                 f"  sha256: {metadata_hash}",
                 "  status: candidate",
                 "  notes: ActorAssetSet 构建期来源；含 LOD、statureMu、nativeHps。"] )
    return "\n".join(rows) + "\n"


def _validate_manifest(path: Path) -> None:
    entries = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(entries, list) or not entries:
        raise ValueError(f"{path}: manifest 顶层必须是非空列表")
    for index, entry in enumerate(entries):
        if not isinstance(entry, dict):
            raise ValueError(f"{path}: 第 {index + 1} 条不是映射")
        missing = [key for key in MANIFEST_FIELDS if key not in entry]
        if missing: raise ValueError(f"{path}: {entry.get('id', index)} 缺字段 {', '.join(missing)}")
        for key in MANIFEST_FIELDS:
            if key == "references":
                if not isinstance(entry[key], list) or not entry[key]:
                    raise ValueError(f"{path}: references 必须是非空列表")
                for reference in entry[key]:
                    if not isinstance(reference, dict) or not all(reference.get(item) for item in ("path", "sha256", "use")):
                        raise ValueError(f"{path}: references 条目缺 path/sha256/use")
            elif not str(entry[key]).strip(): raise ValueError(f"{path}: {entry.get('id')} 的 {key} 为空")
        if entry["status"] != "candidate": raise ValueError(f"{path}: status 必须是 candidate")
        file = path.parent / entry["file"]
        if not file.is_file() or entry["sha256"] != _sha256(file):
            raise ValueError(f"{path}: {entry['id']} 文件缺失或 sha256 不一致")
        if entry["size"] != f"{file.stat().st_size} bytes":
            raise ValueError(f"{path}: {entry['id']} size 与实际字节数不一致")


def build(directory: Path, out_subdir: str = "town") -> dict[str, Any]:
    directory = directory.resolve(); source = directory / "model_rig.glb"
    if not source.is_file(): raise ValueError(f"{directory}: 缺 model_rig.glb")
    if Path(out_subdir).is_absolute() or ".." in Path(out_subdir).parts:
        raise ValueError("--out-subdir 必须是模型目录内的相对路径")
    target = directory / out_subdir; clips, clips_from = _clips_for(directory)
    source_glb = load_glb(source); source_joints = _joint_names(source_glb); _check_weights(source_glb)
    gait = _measure(source, clips); source_stature = float(gait["statureMu"])
    violations = []
    for label, value in gait["slipM"].items():
        if float(value) > MAX_SLIP_M:
            violations.append(f"{directory.name}: {label} 支撑滑移 {value:.6f} m 超过 0.02 m")
    if violations: raise ValueError("；".join(violations))
    with tempfile.TemporaryDirectory(prefix=f".town-lod-{directory.name}-", dir=directory) as temporary:
        work = Path(temporary); staged_dir = work / "publish"; staged_dir.mkdir()
        built: list[tuple[Path, int, int]] = []
        for filename, triangles, texture_size in LOD_SPECS:
            staged = staged_dir / filename
            _build_lod(source, staged, triangles, texture_size, work)
            built.append((staged, triangles, texture_size))
        lods = [_validate(output, clips, cap, texture, source_joints, source_stature, violations)
                for output, cap, texture in built]
        source_hash = _sha256(source)
        metadata: dict[str, Any] = {
            "lod": lods, "statureMu": source_stature,
            "nativeHps": {key: float(gait["nativeHps"][key]) for key in ("walk", "run")},
            "slipM": {key: float(gait["slipM"][key]) for key in ("walk", "run")},
            "source": {"file": "../model_rig.glb", "sha256": source_hash},
            "tool": {"version": VERSION},
        }
        if clips_from: metadata["clipsFrom"] = clips_from
        metadata_path = staged_dir / "town.json"
        metadata_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        (staged_dir / "manifest.yaml").write_text(_manifest(
            directory.name, source, source_hash, lods, staged_dir, _sha256(metadata_path)), encoding="utf-8")
        _validate_manifest(staged_dir / "manifest.yaml")
        if violations: raise ValueError("；".join(violations))
        backup = work / "previous"
        if target.exists(): target.replace(backup)
        try: staged_dir.replace(target)
        except BaseException:
            if backup.exists(): backup.replace(target)
            raise
    return {"model": directory.name, **metadata}


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directories", nargs="+", type=Path, help="含 model_rig.glb 的模型目录")
    parser.add_argument("--out-subdir", default="town")
    args = parser.parse_args(argv)
    try:
        for directory in args.directories:
            print(json.dumps(build(directory, args.out_subdir), ensure_ascii=False))
        return 0
    except (OSError, ValueError, RuntimeError, KeyError, IndexError, json.JSONDecodeError, yaml.YAMLError) as exc:
        print(f"错误：{exc}", file=sys.stderr); return 2


if __name__ == "__main__":
    raise SystemExit(main())
