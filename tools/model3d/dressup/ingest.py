#!/usr/bin/env python3
"""把已通过 validate 的换装产物写入 dressup 资产目录；默认不提交。"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import time
from typing import Any, Sequence

import yaml

REPO = Path(__file__).resolve().parents[3]
ROOT = REPO / "assets/default/model3d/dressup"
KINDS = {"template": "templates", "head": "heads", "garment": "garments",
         "hair": "hair", "prop": "props"}
KIND_NAMES = {name: f"dressup-{name}" for name in KINDS}
STATUS = {"approved": "candidate", "draft": "draft"}
COMMON_CHECKS = {"fit.kind", "regions.u8Scalar", "budget.triangles",
    "budget.textureMaxDimension", "material.unlit",
    "material.onlyBaseColorTexture", "asset.meshNodeCount",
    "asset.materialReferences", "binding.skeletonSchema",
    "binding.skeletonRequired", "binding.skeletonBodySha",
    "binding.skeletonUnits", "binding.fitSchema", "binding.fitRequired",
    "binding.fitBodySha", "binding.fitTemplate", "binding.fitMPerMu"}
SKIN_CHECKS = {"skeleton.skinCount", "skeleton.joints", "skeleton.ibmMaxAbs",
    "weights.onlySet0", "weights.jointsAllowedPresent", "weights.finite", "weights.sumMaxError",
    "weights.maxBones", "weights.jointIndices", "weights.jointsAllowed",
    "penetration.bindVertices", "penetration.idle", "penetration.walk",
    "penetration.run", "mask.knownRegions", "mask.neverHide", "mask.forbidden"}
GEOMETRY_CHECKS = {"geometry.flippedTriangles", "geometry.edgeRatioInRange",
                   "geometry.maxResidualMu"}
PROP_CHECKS = {"prop.noSkin", "prop.noNodeTransform", "prop.anchorEvidence",
    "prop.anchorMu", "prop.mainAxisY", "prop.semanticDirection",
    "prop.realSizeEvidence", "prop.declaredLengthMu", "prop.realSizeError"}


def _required_checks(kind: str) -> set[str]:
    required = set(COMMON_CHECKS)
    if kind in ("template", "head", "garment", "hair"): required |= SKIN_CHECKS
    if kind in ("garment", "hair"):
        required |= GEOMETRY_CHECKS | {"geometry.closeFitP90DeltaMm", "material.doubleSided"}
    if kind == "prop": required |= PROP_CHECKS | GEOMETRY_CHECKS
    return required


def _sha(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""): digest.update(chunk)
    return digest.hexdigest()


def _kind(value: str) -> str:
    cleaned = value.rstrip("s")
    if cleaned not in KINDS: raise argparse.ArgumentTypeError("kind 必须是 template/head/garment/hair/prop")
    return cleaned


def _asset_id(value: str) -> str:
    if (not value or value in (".", "..") or Path(value).is_absolute() or
            "/" in value or "\\" in value or
            re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", value) is None):
        raise argparse.ArgumentTypeError("id 必须是非空的单个安全路径段")
    return value


def _source_glb(source: Path, kind: str, asset_id: str) -> Path:
    preferred = {"template": "body.glb", "head": "head.glb"}.get(kind, f"{asset_id}.glb")
    target = source / preferred
    if target.is_file(): return target
    choices = sorted(source.glob("*.glb"))
    if len(choices) == 1: return choices[0]
    raise ValueError(f"{source}: 找不到唯一 GLB（期望 {preferred}）")


def _report(source: Path, kind: str, asset_id: str, template: str, glb: Path, fit: Path | None
            ) -> tuple[Path, dict[str, Any]]:
    path = source / "report.json"
    if not path.is_file(): raise ValueError(f"缺 validate 产物：{path}")
    report = json.loads(path.read_text(encoding="utf-8"))
    if report.get("schema") != "tianshu-dressup-report.v1": raise ValueError("report.schema 不支持")
    if report.get("level") not in STATUS: raise ValueError("report.level=fail/未知，不得入库")
    checks = report.get("checks")
    if not isinstance(checks, list) or not checks:
        raise ValueError("report.checks 缺失或为空")
    if any(not isinstance(check, dict) or check.get("pass") is not True for check in checks):
        raise ValueError("report 含缺失 pass:true 或失败检查项")
    names = [check.get("name") for check in checks]
    missing = sorted(_required_checks(kind) - set(names))
    if missing or len(names) != len(set(names)):
        raise ValueError(f"report.checks 不完整或重名：missing={missing}")
    if report.get("subject") != {"kind": kind, "id": asset_id}:
        raise ValueError("report.subject 与 kind/id 不一致")
    if fit is None:
        raise ValueError("缺 fit.json，无法核验模板身份")
    fit_data = json.loads(fit.read_text(encoding="utf-8"))
    identities = {"argument": template, "fit": fit_data.get("template"),
                  "report": report.get("template")}
    if any(value != template for value in identities.values()):
        raise ValueError(f"模板身份缺失或不一致：{identities}")
    inputs = report.get("inputs", {})
    expected = {"asset": {"sha256": _sha(glb), "sizeBytes": glb.stat().st_size}}
    if fit is not None:
        expected["fit"] = {"sha256": _sha(fit), "sizeBytes": fit.stat().st_size}
    if inputs != expected: raise ValueError("report.inputs 与待入库 GLB/fit 摘要不一致")
    return path, report


def _stats(report: dict[str, Any], name: str, default: Any = None) -> Any:
    match = next((check for check in report.get("checks", []) if check.get("name") == name), None)
    return default if match is None else match.get("value", default)


def _manifest(kind: str, asset_id: str, glb: Path, fit_name: str | None,
              report: dict[str, Any], args: argparse.Namespace) -> dict[str, Any]:
    status = STATUS[report["level"]]; file_name = glb.name
    row: dict[str, Any] = {
        "id": f"dressup__{kind}__{asset_id}", "file": file_name, "category": "model3d",
        "kind": KIND_NAMES[kind], "template": args.template, "sha256": _sha(glb),
        "size_bytes": glb.stat().st_size, "triangles": _stats(report, "budget.triangles", 0),
        "report": "report.json", "status": status,
        "tool": "tools/model3d/dressup/ingest.py v1",
        "created": dt.datetime.now().astimezone().isoformat(timespec="seconds"),
    }
    if kind not in ("template", "head"): row["slot"] = args.slot
    if args.item: row["item"] = args.item
    if fit_name: row["fit"] = fit_name
    row["fits"] = {args.template: {"file": file_name, "fit": fit_name,
                                    "report": "report.json", "status": status}}
    try: source_directory = str(args.src.resolve().relative_to(REPO))
    except ValueError: source_directory = "external-workdir"
    row["source"] = {"directory": source_directory, "references": []}
    row["notes"] = f"validate level={report['level']}；status 按 tech/11 §6 映射。"
    return row


def _existing_manifest(path: Path, kind: str, asset_id: str) -> dict[str, Any] | None:
    if not path.is_file(): return None
    rows = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(rows, list) or len(rows) != 1 or not isinstance(rows[0], dict):
        raise ValueError("已有 manifest 必须恰含一条映射记录")
    row = rows[0]
    if row.get("id") != f"dressup__{kind}__{asset_id}" or row.get("kind") != KIND_NAMES[kind]:
        raise ValueError("已有 manifest 的 id/kind 与本次入库不一致")
    if not isinstance(row.get("fits"), dict):
        raise ValueError("已有 manifest.fits 缺失或不是映射")
    return row


def _variant_names(kind: str, asset_id: str, template: str, first: bool) -> tuple[str, str, str]:
    stem = {"template": "body", "head": "head"}.get(kind, asset_id)
    if first: return f"{stem}.glb", "fit.json", "report.json"
    return f"{stem}.{template}.glb", f"fit.{template}.json", f"report.{template}.json"


def _commit(directory: Path, asset_id: str) -> str:
    relative = directory.relative_to(REPO)
    for attempt in range(10):
        add = subprocess.run(["git", "add", "--", str(relative)], cwd=REPO, capture_output=True, text=True)
        if add.returncode == 0:
            result = subprocess.run(["git", "commit", "-m", f"assets(dressup): ingest {asset_id}",
                                     "--", str(relative)], cwd=REPO, capture_output=True, text=True)
            if result.returncode == 0:
                return subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=REPO,
                                      capture_output=True, text=True, check=True).stdout.strip()
        detail = (add.stderr if add.returncode else result.stderr).lower()
        if "index.lock" not in detail: raise RuntimeError(detail.strip() or "git commit 失败")
        time.sleep(min(1 + attempt, 5))
    raise RuntimeError("git index.lock 连续 10 次冲突")


def ingest(args: argparse.Namespace) -> dict[str, Any]:
    source = args.src.resolve()
    if not source.is_dir(): raise ValueError(f"源目录不存在：{source}")
    fit_source = source / "fit.json"; fit_name = "fit.json" if fit_source.is_file() else None
    if fit_name is None: raise ValueError(f"缺 fit.json：{source}")
    glb = _source_glb(source, args.kind, args.id)
    report_path, report = _report(source, args.kind, args.id, args.template, glb,
                                  fit_source if fit_name else None)
    kind_root = (ROOT / KINDS[args.kind]).resolve()
    destination = (kind_root / args.id).resolve()
    if destination.parent != kind_root:
        raise ValueError("目标目录越过 kind 根目录")
    destination.mkdir(parents=True, exist_ok=True)
    manifest_path = destination / "manifest.yaml"
    existing = _existing_manifest(manifest_path, args.kind, args.id)
    if existing is not None and args.template in existing["fits"]:
        raise ValueError(f"模板变体已存在，拒绝覆盖：{args.template}")
    output_name, fit_output_name, report_output_name = _variant_names(
        args.kind, args.id, args.template, existing is None)
    for name in (output_name, fit_output_name, report_output_name):
        if existing is not None and (destination / name).exists():
            raise ValueError(f"变体目标文件已存在，拒绝覆盖：{name}")
    output_glb = destination / output_name; shutil.copy2(glb, output_glb)
    shutil.copy2(fit_source, destination / fit_output_name)
    shutil.copy2(report_path, destination / report_output_name)
    if existing is None:
        row = _manifest(args.kind, args.id, output_glb, fit_output_name, report, args)
        row["file"] = output_name; row["report"] = report_output_name
    else:
        row = existing
    row["fits"][args.template] = {
        "file": output_name, "fit": fit_output_name, "report": report_output_name,
        "status": STATUS[report["level"]]}
    manifest_path.write_text(
        yaml.safe_dump([row], allow_unicode=True, sort_keys=False, width=120), encoding="utf-8")
    result = {"directory": str(destination.relative_to(REPO)), "status": STATUS[report["level"]],
              "files": sorted(path.name for path in destination.iterdir())}
    if args.commit: result["commit"] = _commit(destination, args.id)
    return result


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("kind", type=_kind, help="template/head/garment/hair/prop")
    parser.add_argument("id", type=_asset_id, help="模板、NPC 或物品 ID（单个安全路径段）")
    parser.add_argument("--src", required=True, type=Path, help="含 GLB、fit.json、report.json 的源目录")
    parser.add_argument("--template", default="tpl_f_medium", help="制作所用模板（默认 tpl_f_medium）")
    parser.add_argument("--slot", default="body", help="装备槽（默认 body）")
    parser.add_argument("--item", help="关联 eq_xxx 物品 ID")
    parser.add_argument("--commit", action="store_true", help="仅提交该资产目录（index.lock 时重试）")
    args = parser.parse_args(argv)
    try:
        print(json.dumps(ingest(args), ensure_ascii=False)); return 0
    except (OSError, ValueError, KeyError, RuntimeError, json.JSONDecodeError, yaml.YAMLError) as exc:
        print(f"错误：{exc}", file=sys.stderr); return 2


if __name__ == "__main__":
    raise SystemExit(main())
