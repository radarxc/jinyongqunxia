#!/usr/bin/env python3
"""衣物 / 盔甲"竖直切片"贴合（作者 2026-10-10 方案，ADR ``docs/adr/0002-dressup-slice-fit.md``）——命令行与对外函数。

本仓库 glTF 为 Y 轴向上；作者所说"Z 轴"即 +Y。坐标与距离为模型单位 mu；JSON 数值字段一律带 ``Mu`` / ``Mm`` /
``M`` / ``Deg``（时间 ``Sec``）后缀，比例、计数等无量纲量除外。流程（各步在 ``slice_fit_*.py``）：

1. 竖直分段对齐（``slice_fit_anchors``）：领口 / 下摆锚点从衣物几何量出（后中扇区上 / 下包络中位），按设计体选目标面，
   锚点必经；弹性件另取锚点之间的设计体标注面作中间对应，单调 PCHIP；刚体件（r = 0）一段线性。袖口锚点同理沿臂轴。
2. 水平对中、按部件切片（``slice_fit_parts``）：躯干水平切，袖沿素体臂骨弦垂直切；分开的连通块整块归一个部件。
3. 切面（``slice_fit_radial``）：素体截面取凸包，衣物按角度取最内层；弹性 = 最内层到"凸包 + 法向间隙"、其余层同移；
   非弹性 = 绕中心统一缩放的最小 ratio（沿高度 Lipschitz 上包络，r = 0 为常数）；ρ' = r·弹性 + (1 − r)·非弹性。
4. 重建与复核（``slice_fit_solve``）：位移场上包络平滑（褶皱尺度 foldMm）、逐顶点插值；3D 残余外推（只推不拉，
   刚体件改整件放大）与折角邻域位移平滑。拓扑、UV、贴图逐字节不变。

本原型只接受单 mesh / 单 primitive / 单材质的衣物 GLB（现有 Tripo 抽取件与测试甲都是），其他输入报错（退出码 2）。
子命令：``fit``（贴合 + 诊断 + 出图）、``chain``（切片后接 P2 链：fit_garment --align none → 减面 → 翻边 → 压缩 →
validate，链尾件入 ``garments/<id>/slice_fit/``）、``body-landmarks`` / ``garment-landmarks``（标注）、``armor-fixture``。
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path
import shlex
import sys
from typing import Any, Sequence

# 同目录 inspect.py 会遮蔽标准库 inspect；NumPy / SciPy 导入前先缓存标准库模块。
_SCRIPT_DIR = Path(__file__).resolve().parent
_removed = [(i, value) for i, value in enumerate(sys.path)
            if Path(value or os.getcwd()).resolve() == _SCRIPT_DIR]
sys.path[:] = [value for value in sys.path
               if Path(value or os.getcwd()).resolve() != _SCRIPT_DIR]
import inspect as _stdlib_inspect  # noqa: F401,E402
for _index, _value in _removed:
    sys.path.insert(min(_index, len(sys.path)), _value)
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.append(str(_SCRIPT_DIR))

import numpy as np  # noqa: E402

from slice_fit_base import (ARM_POINTS, ELASTICITY_TABLE, FIT_SCHEMA, LANDMARK_SCHEMA, LEVEL_LABELS,  # noqa: E402
                            LEVEL_ORDER, SliceFitError, _portable, _sha256, load_json, mm_to_mu, mu_to_mm,
                            weld_ids, welded_normals, write_json)
from slice_fit_geometry import (AxisMap, convex_hull_2d, hull_rays, lipschitz_envelope, ray_hits_2d,  # noqa: E402
                                section_by_plane, upper_envelope)
from slice_fit_model import BodyModel, GarmentModel, load_body, load_garment, write_static_glb  # noqa: E402
from slice_fit_landmarks import derive_body_landmarks, derive_garment_landmarks  # noqa: E402
from slice_fit_anchors import (ANCHOR_RULE, anchor_landing, axial_anchor, choose_target, edge_anchor,  # noqa: E402
                               garment_anchors, resolve_target, vertical_map)
from slice_fit_radial import SliceParams, build_radial_field  # noqa: E402
from slice_fit_solve import clearance_stats, slice_fit  # noqa: E402
from slice_fit_metrics import distortion_stats, inward_thickness, surface_distance_mm, thickness_stats  # noqa: E402
from slice_fit_render import render_landmark_overlay, render_views_figure  # noqa: E402
from slice_fit_sections import render_sections_figure  # noqa: E402
from slice_fit_fixtures import ARMOR_KINDS, make_armor_fixture  # noqa: E402
from fit_garment import load_world_mesh  # noqa: E402
from glb_io import load_glb  # noqa: E402

TOOL = "tools/model3d/dressup/slice_fit.py"


def fit_and_diagnose(body_path: Path, body_landmarks_path: Path, garment_path: Path, garment_landmarks_path: Path, *,
                     out_glb: Path | None, json_out: Path, params: SliceParams, elasticity: float | None = None,
                     clearance_mm: float | None = None, thickness_max_mm: float = 12.0, compare: Path | None = None,
                     shots: Path | None = None, shot_prefix: str | None = None, title: str | None = None,
                     reproduce: str | None = None, garment_id: str = "garment") -> dict[str, Any]:
    """贴合 + 全部诊断 + 可选出图；out_glb 为 None 时不写 GLB。返回诊断（已写 json_out）。"""
    body_landmarks = load_json(body_landmarks_path); garment_landmarks = load_json(garment_landmarks_path)
    body = load_body(body_path, body_landmarks, body_landmarks.get("mPerMu"))
    garment = load_garment(garment_path, garment_landmarks)
    result = slice_fit(body, garment, params=params, elasticity=elasticity, clearance_mm=clearance_mm)
    diagnostics = result.diagnostics; m_per_mu = body.m_per_mu
    thick_max = mm_to_mu(thickness_max_mm, m_per_mu)
    before_t = inward_thickness(garment.positions, garment.faces, garment.weld, thick_max)
    diagnostics["thickness"] = {
        "sliced": thickness_stats(before_t, inward_thickness(result.sliced, garment.faces, garment.weld, thick_max), m_per_mu),
        "final": thickness_stats(before_t, inward_thickness(result.positions, garment.faces, garment.weld, thick_max), m_per_mu)}
    diagnostics["distortion"] = {"sliced": distortion_stats(garment.positions, result.sliced, garment.faces, garment.weld),
                                 "final": distortion_stats(garment.positions, result.positions, garment.faces, garment.weld)}
    moved = mu_to_mm(np.linalg.norm(result.positions - garment.positions, axis=1), m_per_mu)
    diagnostics["displacement"] = {"p50Mm": float(np.quantile(moved, 0.5)), "p90Mm": float(np.quantile(moved, 0.9)),
                                   "maxMm": float(moved.max())}
    if compare:
        compare_glb = load_glb(compare)
        compare_mesh = load_world_mesh(compare_glb, skinned_only=bool(compare_glb.json.get("skins")))
        cpos = compare_mesh.positions.astype(np.float64); cfaces = compare_mesh.indices.reshape(-1, 3).astype(np.int64)
        diagnostics["compare"] = {
            "file": _portable(compare), "sha256": _sha256(compare),
            "sliceToCompare": surface_distance_mm(result.positions, cpos, cfaces, m_per_mu),
            "compareToSlice": surface_distance_mm(cpos, result.positions, garment.faces, m_per_mu),
            "inputToCompare": surface_distance_mm(garment.positions, cpos, cfaces, m_per_mu),
            "compareClearance": clearance_stats(body, cpos, mm_to_mu(diagnostics["clearanceMm"], m_per_mu))[0]}
    diagnostics["inputs"] = {"body": _portable(body_path), "bodySha256": _sha256(body_path),
                             "bodyLandmarks": _portable(body_landmarks_path), "bodyLandmarksSha256": _sha256(body_landmarks_path),
                             "garment": _portable(garment_path), "garmentSha256": _sha256(garment_path),
                             "garmentLandmarks": _portable(garment_landmarks_path),
                             "garmentLandmarksSha256": _sha256(garment_landmarks_path)}
    diagnostics["topology"] = {"vertices": int(len(garment.positions)), "triangles": int(len(garment.faces)),
                               "uvPreserved": garment.uvs is not None, "indicesPreserved": True,
                               "meshes": 1, "primitives": 1}
    # 切片中间件不入库：不记输出文件与 SHA，只记复现命令与输入 SHA（协调者 22:20 裁定 3）。
    diagnostics["reproduce"] = {"command": reproduce, "deterministic": True,
                                "note": "切片 GLB 为中间件，不入库；按此命令复现（同输入同代码逐字节一致）"}
    if out_glb is not None:
        write_static_glb(out_glb, garment, result.positions, name=garment_id)
    if shots:
        prefix = shot_prefix or f"slice_fit.{Path(body_path).parent.name}"
        r = diagnostics["elasticity"]; final = diagnostics["clearance"]["final"]; sliced = diagnostics["clearance"]["sliced"]
        anchors = diagnostics["anchors"]
        subtitle = (f"r = {r:g}，间隙 {diagnostics['clearanceMm']:g} mm；切片后穿入 {sliced['insideCount']} 点、最小间隙 "
                    f"{sliced['minMm']:.2f} mm；残余外推后穿入 {final['insideCount']} 点、最小 {final['minMm']:.2f} mm；"
                    f"衣缘落点残差 领口 {anchors['collar']['landingResidualMm']:.2f} / 下摆 {anchors['hem']['landingResidualMm']:.2f} mm")
        marks = [{"label": f"{name}目标：{target_label(anchors[key]['target'])}", "sourceYMu": anchors[key]["sourceYMu"],
                  "targetYMu": anchors[key]["targetYMu"]} for key, name in (("collar", "领口"), ("hem", "下摆"))]
        before = garment.positions
        render_views_figure(Path(shots) / f"{prefix}.views.jpg", body, garment, before, result.positions, result.signed_final,
                            title=title or f"{garment.name} → {Path(body_path).parent.name}", subtitle=subtitle,
                            crop_y=(min(before[:, 1].min(), result.positions[:, 1].min()) - 0.06,
                                    max(before[:, 1].max(), result.positions[:, 1].max()) + 0.06), marks=marks)
        render_sections_figure(Path(shots) / f"{prefix}.sections.jpg", body, garment, result,
                               title=f"{title or garment.name}：切面（素体 / 原 / 弹性 / 非弹性 / 最终）", input_positions=before)
        diagnostics["shots"] = [_portable(Path(shots) / f"{prefix}.views.jpg"),
                                _portable(Path(shots) / f"{prefix}.sections.jpg")]
    write_json(json_out, diagnostics)
    return diagnostics


def target_label(target: dict[str, Any]) -> str:
    if "level" in target:
        return LEVEL_LABELS.get(target["level"], target["level"])
    low, high = target["between"]
    return f"{LEVEL_LABELS.get(low, low)}–{LEVEL_LABELS.get(high, high)} 间 {target['t']:.2f}"


def _params(args: argparse.Namespace) -> SliceParams:
    return SliceParams(slice_mm=args.slice_mm, angles=args.angles, residual_push=not args.no_residual_push,
                       fold_mm=args.fold_mm)


def run_fit(args: argparse.Namespace, argv: Sequence[str]) -> dict[str, Any]:
    output = Path(args.out)
    glb_path = output if output.suffix == ".glb" else output / f"{args.id}.slice_fit.glb"
    json_path = Path(args.json_out) if args.json_out else glb_path.with_suffix(".json")
    return fit_and_diagnose(args.body, args.body_landmarks, args.garment, args.garment_landmarks,
                            out_glb=None if args.no_glb else glb_path, json_out=json_path, params=_params(args),
                            elasticity=args.elasticity, clearance_mm=args.clearance_mm,
                            thickness_max_mm=args.thickness_max_mm, compare=args.compare, shots=args.shots,
                            shot_prefix=args.shot_prefix, title=args.title, garment_id=args.id,
                            reproduce=shlex.join(["python3", TOOL, *argv]))


def _add_fit_options(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--garment", type=Path, required=True, help="衣物 / 盔甲 GLB（单 mesh / 单 primitive / 单材质）")
    parser.add_argument("--garment-landmarks", type=Path, required=True, help="衣物 slice_landmarks.json")
    parser.add_argument("--id", default="garment", help="输出名")
    parser.add_argument("--elasticity", type=float, help="覆盖标注里的弹性系数 r（0 不弹 … 1 紧绷）")
    parser.add_argument("--clearance-mm", type=float, help="覆盖标注里的法向间隙（默认 1 mm）")
    parser.add_argument("--fold-mm", type=float, help="覆盖标注里的褶皱保留尺度 foldMm（0 = 字面完全贴身）")
    parser.add_argument("--slice-mm", type=float, default=SliceParams.slice_mm, help="切片间距 mm")
    parser.add_argument("--angles", type=int, default=SliceParams.angles, help="每片角度数")
    parser.add_argument("--no-residual-push", action="store_true", help="关闭 3D 残余外推（只看切片本身）")
    parser.add_argument("--thickness-max-mm", type=float, default=12.0, help="厚度 / 层距射线最远距离")
    parser.add_argument("--compare", type=Path, help="对照件 GLB（例：现行 E2b 交付件），报表面距离")
    parser.add_argument("--shots", type=Path, help="出图目录（三视图 + 切面线图）")
    parser.add_argument("--shot-prefix", help="图文件名前缀，默认 slice_fit.<模板目录名>")
    parser.add_argument("--title", help="图标题")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="衣物 / 盔甲竖直切片贴合（ADR 0002）：标注、测试件、贴合、P2 链与出图。")
    sub = parser.add_subparsers(dest="command", required=True)
    fit = sub.add_parser("fit", help="对 素体 + 衣物 + 两份标注 执行切片贴合，写 GLB 与诊断 JSON")
    fit.add_argument("--body", type=Path, required=True, help="素体 GLB（bind 空间）")
    fit.add_argument("--body-landmarks", type=Path, required=True, help="素体 slice_landmarks.json")
    fit.add_argument("--out", type=Path, required=True, help="输出目录或 .glb 路径")
    fit.add_argument("--json-out", type=Path, help="诊断 JSON 路径（默认与 GLB 同名）")
    fit.add_argument("--no-glb", action="store_true", help="只写诊断与图")
    _add_fit_options(fit)
    chain = sub.add_parser("chain", help="切片后接 P2 链（fit_garment --align none → 减面 → 翻边 → 压缩 → validate）")
    chain.add_argument("--template", required=True, help="模板目录名（templates/<名>/ 下取 body / skeleton / 标注）")
    chain.add_argument("--out-dir", type=Path, required=True, help="链尾 GLB / fit / report 输出目录")
    chain.add_argument("--diagnostics", type=Path, required=True, help="切片诊断 JSON（写入链尾段）")
    chain.add_argument("--skin-lab-mean", nargs=3, type=float, metavar=("L", "A", "B"),
                       help="fit_garment --clean-skin-texture 的源皮肤 Lab（省略则不清理贴图肤色）")
    chain.add_argument("--keep-work", action="store_true", help="保留 _work 中间件（默认链尾跑完删除）")
    _add_fit_options(chain)
    body_cmd = sub.add_parser("body-landmarks", help="从骨骼与网格自动求素体标注（叠图人工确认后落盘）")
    body_cmd.add_argument("--body", type=Path, required=True); body_cmd.add_argument("--skeleton", type=Path, required=True)
    body_cmd.add_argument("--out", type=Path, required=True); body_cmd.add_argument("--overlay", type=Path)
    body_cmd.add_argument("--confirmed-by", help="确认人 / 方式，写入 confirmed 字段")
    garment_cmd = sub.add_parser("garment-landmarks", help="为在模板板上生成的衣物写标注（设计面 = 模板标注）")
    garment_cmd.add_argument("--garment", type=Path, required=True)
    garment_cmd.add_argument("--design-landmarks", type=Path, required=True, help="设计素体（生成时模板）标注")
    garment_cmd.add_argument("--id", required=True); garment_cmd.add_argument("--class", dest="garment_class", default="cloth")
    garment_cmd.add_argument("--elasticity", type=float, required=True); garment_cmd.add_argument("--clearance-mm", type=float, default=1.0)
    garment_cmd.add_argument("--expect-hem", choices=LEVEL_ORDER, help="核对：下摆锚点选中的设计体目标面应是它（不符即报错）")
    garment_cmd.add_argument("--expect-collar", choices=LEVEL_ORDER, help="核对：领口锚点选中的设计体目标面应是它")
    garment_cmd.add_argument("--fold-mm", type=float, default=0.0, help="褶皱保留尺度（Tripo 件约 75；光顺件 0）")
    garment_cmd.add_argument("--note"); garment_cmd.add_argument("--out", type=Path, required=True)
    armor = sub.add_parser("armor-fixture", help="程序生成盔甲测试件（另一体型制作）")
    armor.add_argument("--kind", choices=sorted(ARMOR_KINDS), required=True)
    armor.add_argument("--body", type=Path, required=True); armor.add_argument("--body-landmarks", type=Path, required=True)
    armor.add_argument("--out", type=Path, required=True)
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    args = build_parser().parse_args(argv)
    try:
        if args.command == "fit":
            diagnostics = run_fit(args, argv)
            final = diagnostics["clearance"]["final"]
            print(f"切片贴合完成：r={diagnostics['elasticity']:g}，最终穿入 {final['insideCount']} 点，最小间隙 "
                  f"{final['minMm']:.3f} mm，耗时 {diagnostics['elapsedSec']:.1f}s")
        elif args.command == "chain":
            from slice_fit_chain import run_chain
            chain = run_chain(args, argv)
            print(f"P2 链完成：{chain['report']['file']} level={chain['report']['level']}，链尾三项门 "
                  f"{'通过' if chain['gates']['pass'] else '不通过'}")
            return 0 if chain["gates"]["pass"] else 3
        elif args.command == "body-landmarks":
            skeleton = load_json(args.skeleton)
            body = load_body(args.body, {}, float(skeleton["mPerMu"]))
            landmarks = derive_body_landmarks(body, skeleton, template=Path(args.body).parent.name)
            landmarks["source"]["skeleton"] = _portable(args.skeleton)
            landmarks["source"]["skeletonSha256"] = _sha256(args.skeleton)
            if args.confirmed_by:
                landmarks["confirmed"] = args.confirmed_by
            write_json(args.out, landmarks)
            if args.overlay:
                render_landmark_overlay(args.overlay, body, landmarks, title=f"{landmarks['template']} 标注确认")
            print(f"已写 {args.out}")
        elif args.command == "garment-landmarks":
            design = load_json(args.design_landmarks)
            expect = {key: level for key, level in (("collar", args.expect_collar), ("hem", args.expect_hem)) if level}
            landmarks = derive_garment_landmarks(args.garment, design, garment_id=args.id,
                                                 garment_class=args.garment_class, elasticity=args.elasticity,
                                                 clearance_mm=args.clearance_mm, note=args.note, fold_mm=args.fold_mm,
                                                 expect=expect)
            write_json(args.out, landmarks)
            for key in ("collar", "hem"):
                entry = landmarks[key]
                print(f"{key}：锚点 {entry['anchor']['yMu']:.4f} mu → 目标 {entry['target']}"
                      f"（与设计体目标差 {entry['anchorMinusDesignTargetMm']:+.1f} mm）")
            print(f"已写 {args.out}")
        else:
            body_landmarks = load_json(args.body_landmarks)
            body = load_body(args.body, body_landmarks, body_landmarks.get("mPerMu"))
            landmarks = make_armor_fixture(args.kind, body, args.out)
            print(f"已写 {args.out}（{landmarks['stats']['vertices']} 顶点）")
    except SliceFitError as error:
        print(f"输入错误：{error}", file=sys.stderr)
        return 2
    except (OSError, ValueError, KeyError, RuntimeError) as error:
        print(f"输入错误：{type(error).__name__}: {error}", file=sys.stderr)
        return 2
    return 0


__all__ = ["ANCHOR_RULE", "ARM_POINTS", "ARMOR_KINDS", "AxisMap", "BodyModel", "ELASTICITY_TABLE", "FIT_SCHEMA",
           "GarmentModel", "LANDMARK_SCHEMA", "LEVEL_LABELS", "LEVEL_ORDER", "SliceFitError", "SliceParams",
           "anchor_landing", "axial_anchor", "build_radial_field", "choose_target", "clearance_stats", "convex_hull_2d",
           "derive_body_landmarks", "derive_garment_landmarks", "distortion_stats", "edge_anchor", "fit_and_diagnose",
           "garment_anchors", "hull_rays", "inward_thickness", "lipschitz_envelope", "load_body", "load_garment",
           "load_json", "make_armor_fixture", "mm_to_mu", "ray_hits_2d", "resolve_target", "section_by_plane",
           "slice_fit", "target_label", "upper_envelope", "vertical_map", "weld_ids", "welded_normals", "write_json",
           "write_static_glb"]


if __name__ == "__main__":
    raise SystemExit(main())
