"""切片贴合（ADR 0002）P2 链：切片结果 → fit_garment --align none → 减面 → 翻边 → 压缩 → validate（链尾门）。

参数同 E2b 报告第 7 节 P2 ①（只把 ``--align joints`` 换成 ``--align none``：切片件已在素体 bind 空间）。链尾 validate 的
翻面、边长比、bind 穿透三项为门（tech/11 §6）；动画穿透 / holes 属 E2c 姿势蒙皮，只报不判。另按压紧映射把链尾件
回指原始抽取件，独立报"相对原始件"的翻面与边长（含切片这一步本身的形变），与 validate 口径并列；衣缘锚点在链尾
件上的落点（同一批衣缘点，减面后保留下来的）也只报。
切片中间件写在 ``<out-dir>/_work/<模板>/``（仓库相对路径，fit.json 的 source 即指向它），跑完删除、不入库，诊断记复现命令。
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import shlex
import shutil
import subprocess
import sys
import time
from typing import Any, Sequence

try:
    from .slice_fit_base import SliceFitError, _portable, _sha256, load_json, write_json
except ImportError:
    from slice_fit_base import SliceFitError, _portable, _sha256, load_json, write_json  # type: ignore[no-redef]

import numpy as np  # noqa: E402

try:
    from .fit_garment import load_world_mesh
    from .glb_io import load_glb
    from .slice_fit_anchors import anchor_landing, landing_arms
    from .slice_fit_model import load_garment
except ImportError:
    from fit_garment import load_world_mesh  # type: ignore[no-redef]
    from glb_io import load_glb  # type: ignore[no-redef]
    from slice_fit_anchors import anchor_landing, landing_arms  # type: ignore[no-redef]
    from slice_fit_model import load_garment  # type: ignore[no-redef]

REPO = Path(__file__).resolve().parents[3]
DRESSUP = "tools/model3d/dressup"
GATES = ("geometry.flippedTriangles", "geometry.edgeRatioInRange", "penetration.bindVertices")


def _rel(path: Path) -> str:
    path = Path(path).resolve()
    try:
        return path.relative_to(REPO).as_posix()
    except ValueError:
        return str(path)


def _run(command: list[str], log: list[dict[str, Any]], *, allowed: Sequence[int] = (0,)) -> subprocess.CompletedProcess:
    started = time.perf_counter()
    process = subprocess.run(command, cwd=REPO, capture_output=True, text=True)
    log.append({"command": shlex.join(["python3" if part == sys.executable else part for part in command]),
                "exitCode": process.returncode, "elapsedSec": time.perf_counter() - started,
                "stdoutTail": process.stdout.strip()[-300:], "stderrTail": process.stderr.strip()[-300:]})
    if process.returncode not in allowed:
        raise SliceFitError(f"P2 链步骤失败（退出码 {process.returncode}）：{log[-1]['command']}\n{process.stderr[-800:]}")
    return process


def _check(report: dict[str, Any], name: str) -> dict[str, Any] | None:
    return next((check for check in report.get("checks", []) if check.get("name") == name), None)


def similarity_against(final_glb: Path, source_positions: np.ndarray) -> dict[str, Any]:
    """链尾件（含 pack 压紧映射）回指给定源顶点序列，按 validate 同口径（Umeyama 相似后）量翻面与边长比。"""
    try:
        from . import validate as validator
    except ImportError:
        import validate as validator  # type: ignore[no-redef]
    glb = load_glb(final_glb)
    mesh = load_world_mesh(glb, skinned_only=bool(glb.json.get("skins")))
    primitive = glb.json["meshes"][0]["primitives"][0]
    accessor = primitive.get("extras", {}).get("tianshuSourceVertexAccessor")
    rows = (np.arange(len(mesh.positions)) if accessor is None
            else np.asarray(glb.accessor(int(accessor)), dtype=np.int64).reshape(-1))
    faces = mesh.indices.reshape(-1, 3).astype(np.int64)
    flipped, good, residual = validator._similarity_quality(np.asarray(source_positions, dtype=np.float64)[rows],
                                                             mesh.positions.astype(np.float64), faces)
    return {"flippedTriangles": int(flipped), "edgeRatioInRange": float(good), "maxResidualMu": float(residual),
            "triangles": int(len(faces)), "vertices": int(len(mesh.positions))}


def chain_landing(final_glb: Path, garment_path: Path, garment_landmarks: dict[str, Any], body_landmarks: dict[str, Any],
                  anchors: dict[str, Any], m_per_mu: float) -> dict[str, Any]:
    """链尾件上同一批衣缘点（经 pack 压紧映射回指，减面后保留下来的那些）的落点与目标之差，只报。"""
    glb = load_glb(final_glb)
    mesh = load_world_mesh(glb, skinned_only=bool(glb.json.get("skins")))
    accessor = glb.json["meshes"][0]["primitives"][0].get("extras", {}).get("tianshuSourceVertexAccessor")
    rows = None if accessor is None else np.asarray(glb.accessor(int(accessor)), dtype=np.int64).reshape(-1)
    garment = load_garment(garment_path, garment_landmarks)
    landed = anchor_landing(mesh.positions, garment, landing_arms(garment, body_landmarks), rows)
    out = {}
    for key, row in landed.items():
        target = anchors[key].get("targetYMu", anchors[key].get("targetTMu"))
        out[key] = {"landedMu": row["value"], "kept": row["kept"], "points": row["points"],
                    "residualMm": None if row["value"] is None else abs(row["value"] - target) * m_per_mu * 1000.0}
    return out


def run_chain(args: argparse.Namespace, argv: Sequence[str]) -> dict[str, Any]:
    """先切片（写中间件 + 诊断 + 出图），再跑 P2 链，把链尾段写回诊断；返回链尾段。"""
    try:
        from .slice_fit import TOOL, _params, fit_and_diagnose
    except ImportError:
        from slice_fit import TOOL, _params, fit_and_diagnose  # type: ignore[no-redef]
    template = REPO / "assets/default/model3d/dressup/templates" / args.template
    body, skeleton, body_landmarks = template / "body.glb", template / "skeleton.json", template / "slice_landmarks.json"
    out_dir = (REPO / args.out_dir) if not Path(args.out_dir).is_absolute() else Path(args.out_dir)
    work = out_dir / "_work" / args.template; work.mkdir(parents=True, exist_ok=True)   # 各模板独立，可并行
    stem = f"{args.id}.{args.template}"
    intermediate = work / f"{stem}.slice_fit.glb"
    command = shlex.join(["python3", TOOL, *argv])
    started = time.perf_counter()
    diagnostics = fit_and_diagnose(body, body_landmarks, args.garment, args.garment_landmarks, out_glb=intermediate,
                                   json_out=args.diagnostics, params=_params(args), elasticity=args.elasticity,
                                   clearance_mm=args.clearance_mm, thickness_max_mm=args.thickness_max_mm,
                                   compare=args.compare, shots=args.shots, shot_prefix=args.shot_prefix,
                                   title=args.title, reproduce=command, garment_id=args.id)
    log: list[dict[str, Any]] = []
    fit_dir = work / f"fit_{args.template}"
    fit_command = [sys.executable, f"{DRESSUP}/fit_garment.py", "--body", _rel(body), "--skeleton", _rel(skeleton),
                   "--garment", _rel(intermediate), "--kind", "garment", "--slot", "body", "--id", args.id,
                   "--out", _rel(fit_dir), "--align", "none", "--weight-source", "template", "--weight-smooth-rounds", "3",
                   "--push-mm", "3", "--preserve-shape", "--push-mode", "volume", "--allow-draft"]
    if args.skin_lab_mean:
        fit_command += ["--clean-skin-texture", "--skin-lab-mean", *(repr(float(v)) for v in args.skin_lab_mean)]
    _run(fit_command, log)
    fit_glb, fit_json = fit_dir / f"{args.id}.glb", fit_dir / "fit.json"
    lod, untangled = work / f"{stem}.lod.glb", work / f"{stem}.untangled.glb"
    final, fit_out, report_path = out_dir / f"{stem}.glb", out_dir / f"fit.{args.template}.json", out_dir / f"report.{args.template}.json"
    _run(["node", f"{DRESSUP}/pack_glb.mjs", _rel(fit_glb), _rel(lod), "--simplify", "0.25", "--no-meshopt"], log)
    untangle = _run([sys.executable, f"{DRESSUP}/untangle_glb.py", "--asset", _rel(lod), "--fit", _rel(fit_json),
                     "--skeleton", _rel(skeleton), "--out", _rel(untangled)], log, allowed=(0, 2))
    _run(["node", f"{DRESSUP}/pack_glb.mjs", _rel(untangled), _rel(final)], log)
    shutil.copyfile(fit_json, fit_out)
    _run([sys.executable, f"{DRESSUP}/validate.py", "--body", _rel(body), "--skeleton", _rel(skeleton),
          "--asset", _rel(final), "--fit", _rel(fit_out), "--out", _rel(report_path), "--level", "draft"],
         log, allowed=(0, 3))
    report = json.loads(report_path.read_text(encoding="utf-8"))
    gate_checks = {name: _check(report, name) for name in GATES}
    gates = {"flippedTriangles": (gate_checks[GATES[0]] or {}).get("value"),
             "edgeRatioInRange": (gate_checks[GATES[1]] or {}).get("value"),
             "bindPenetrationVertices": (gate_checks[GATES[2]] or {}).get("value"),
             "pass": all(check is not None and check.get("pass") for check in gate_checks.values())}
    report_only = {check["name"]: check.get("value") for check in report.get("checks", [])
                   if check["name"] not in GATES and (check["name"].startswith(("penetration.", "holes.", "geometry.")))}
    raw = load_world_mesh(load_glb(args.garment)).positions
    sliced = load_world_mesh(load_glb(intermediate)).positions
    fit_record = load_json(fit_out)
    chain = {
        "pipeline": "slice_fit → fit_garment --align none（P2 ①参数）→ pack_glb --simplify 0.25 --no-meshopt → untangle_glb → pack_glb → validate --level draft",
        "intermediate": {"file": _portable(intermediate), "committed": False,
                         "verify": f"按 reproduce 命令重生成；{_portable(fit_out)} 的 source.sha256 即其 SHA，validate 复跑时逐字节核对"},
        "glb": {"file": _portable(final), "sha256": _sha256(final)},
        "fit": {"file": _portable(fit_out), "sha256": _sha256(fit_out),
                "pushOut": {key: fit_record.get("pushOut", {}).get(key) for key in
                            ("residual", "insufficientMargin", "flippedTriangles", "stretchWithinRatio", "passed")}},
        "report": {"file": _portable(report_path), "sha256": _sha256(report_path), "level": report.get("level")},
        "gates": gates, "reportOnly": report_only,
        "untangle": json.loads(untangle.stdout.strip().splitlines()[-1]) if untangle.stdout.strip() else None,
        "vsRawExtract": similarity_against(final, raw),
        "vsSliceIntermediate": similarity_against(final, sliced),
        "anchorsReportOnly": chain_landing(final, args.garment, load_json(args.garment_landmarks), load_json(body_landmarks),
                                           diagnostics["anchors"], float(load_json(body_landmarks)["mPerMu"])),
        "steps": log, "elapsedSec": time.perf_counter() - started,
    }
    diagnostics["chain"] = chain
    write_json(args.diagnostics, diagnostics)
    if not args.keep_work:
        shutil.rmtree(work, ignore_errors=True)
        try:
            work.parent.rmdir()          # _work 空了才删（别的模板可能还在跑）
        except OSError:
            pass
    return chain


__all__ = ["GATES", "chain_landing", "run_chain", "similarity_against"]
