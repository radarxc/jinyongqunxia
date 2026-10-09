#!/usr/bin/env python3
"""cut_head 的无仓库写入合成回归。"""
from __future__ import annotations

import io
import json
import math
from pathlib import Path
import sys
import tempfile
import traceback

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cut_head import (_biharmonic_surface, _bone_frame, _bridge_penetration, _masked_positions,
                      _masked_surface, _penetration_skin_vertices, _vertex_normals,
                      actual_neck_section, bake_hide_mask,
                      biharmonic_residual, bridge_shape_metrics, bridge_surface_from_mesh, build_neck_bridge,
                      classify_vertices, count_old_neck_skin_triangles, cut_plane_from_bone_ratio, head_scale, measure_head,
                      process_head, select_head_faces, skin_match, transform_head)
from common import lbs
from export_skeleton import _world_mesh
from glb_io import GLBBuilder, Mesh, load_glb
from ingest import ingest
from validate import _signed_distances, _world_matrices


def _skin(builder: GLBBuilder, neck_y: float, head_y: float) -> tuple[int, list[int]]:
    neck = builder.add_node(name="mixamorig:Neck", translation=[0, neck_y, 0])
    head = builder.add_node(name="mixamorig:Head", translation=[0, head_y - neck_y, 0])
    builder.document["nodes"][neck]["children"] = [head]
    ibm = np.array([np.linalg.inv(np.array([[1, 0, 0, 0], [0, 1, 0, neck_y],
                                            [0, 0, 1, 0], [0, 0, 0, 1]])),
                    np.linalg.inv(np.array([[1, 0, 0, 0], [0, 1, 0, head_y],
                                            [0, 0, 1, 0], [0, 0, 0, 1]]))], np.float32)
    return builder.add_skin([neck, head], builder.add_accessor(ibm, type_name="MAT4")), [neck, head]


def _cylinder(rings: list[tuple[float, float]], color_uv: float = .25) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    positions, uvs = [], []
    for y, radius in rings:
        for i in range(64):
            angle = 2 * math.pi * i / 64
            positions.append([radius * math.cos(angle), y, radius * math.sin(angle)])
            uvs.append([color_uv, .5])
    faces = []
    for row in range(len(rings) - 1):
        for i in range(64):
            a, b = row * 64 + i, row * 64 + (i + 1) % 64
            c, d = a + 64, b + 64; faces += [(a, c, b), (b, c, d)]
    return np.asarray(positions, np.float32), np.asarray(faces, np.uint32), np.asarray(uvs, np.float32)


def _write_glb(path: Path, positions: np.ndarray, faces: np.ndarray, uvs: np.ndarray,
               neck_y: float, head_y: float, regions: np.ndarray | None = None) -> None:
    joints = np.zeros((len(positions), 4), np.uint16); weights = np.zeros((len(positions), 4), np.float32)
    high = positions[:, 1] >= (neck_y + head_y) / 2; joints[high, 0] = 1; weights[:, 0] = 1
    normals = positions.copy(); normals[:, 1] = 0
    normals /= np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-9)
    mesh = Mesh(positions, faces.reshape(-1), normals, uvs, joints, weights, regions,
                np.zeros(len(faces), np.int32), None, "mock")
    image = Image.new("RGB", (128, 128), (214, 176, 145))
    image.paste((45, 31, 22), (43, 0, 86, 128)); image.paste((225, 191, 166), (86, 0, 128, 128))
    buffer = io.BytesIO(); image.save(buffer, format="PNG")
    builder = GLBBuilder(); skin, nodes = _skin(builder, neck_y, head_y)
    image_id = builder.add_image(buffer.getvalue(), mime_type="image/png"); texture = builder.add_texture(image_id)
    material = builder.add_material(base_color_texture=texture); mesh_id = builder.add_mesh(mesh, material_map=[material])
    mesh_node = builder.add_node(name="mesh", mesh=mesh_id, skin=skin); builder.add_scene([nodes[0], mesh_node])
    builder.document["animations"] = [{"name": name, "samplers": [], "channels": []}
                                      for name in ("idle", "walk", "run")]
    builder.write(path)


def _template(directory: Path) -> None:
    directory.mkdir(parents=True); positions, faces, uvs = _cylinder([(0, .08), (.95, .08), (1.0, .03), (1.08, .03)])
    # 模板上下段使用不同 UV 行，避免合成贴图重叠令切除区污染保留区。
    # 用投影 UV 保持三角非退化；V 分岛避免切除区污染保留区。
    uvs[:, 0] = .25 + positions[:, 0] * .5
    uvs[:, 1] = np.repeat([.1, .35, .6, .85], 64)
    regions = np.where(positions[:, 1] > 1.03, 0, np.where(positions[:, 1] > .96, 1, 2)).astype(np.uint8)
    _write_glb(directory / "body.glb", positions, faces, uvs, 1.0, 1.1, regions)
    ring = []
    weights = {"mixamorig:Neck": .75, "mixamorig:Head": .25}
    for i in range(64):
        angle = 2 * math.pi * i / 64
        ring.append({"pos": [.03 * math.cos(angle), 1.02, .03 * math.sin(angle)],
                     "weights": weights})
    skeleton = {"schema": "tianshu-dressup-skeleton.v1", "mPerMu": 1.,
                "unit": "mu", "heightMu": 1.3, "defaultHeightM": 1.3,
                "source": {"file": str(directory / "body.glb"),
                           "sha256": __import__("hashlib").sha256((directory / "body.glb").read_bytes()).hexdigest()},
                "neckRing": {"centerMu": [0, 1.02, 0], "radiusMu": {"x": .03, "z": .03},
                             "profile": ring},
                "measures": {"headWidthMu": .12, "headTopMu": [0, 1.24, 0]},
                "skullProfile": {"file": "skull_profile.json"},
                "regions": {"ids": {"head": 0, "neck": 1, "torsoUpper": 2}},
                "joints": ["mixamorig:Neck", "mixamorig:Head"]}
    (directory / "skeleton.json").write_text(json.dumps(skeleton))
    rows = [{"yMu": y} for y in np.linspace(-.03, .09, 25)]
    (directory / "skull_profile.json").write_text(json.dumps({"rows": rows}))


def _source(path: Path, high_collar: bool) -> None:
    # 颈管 + 球头轮廓；高立领用更大半径暖黄网格包住切面。
    rings = [(.85, .035), (.95, .035), (1.02, .034), (1.08, .045), (1.14, .06),
             (1.20, .065), (1.26, .05), (1.30, .015)]
    positions, faces, uvs = _cylinder(rings)
    if high_collar:
        collar_pos, collar_faces, collar_uv = _cylinder([(.99, .055), (1.05, .055)], .85)
        offset = len(positions); positions = np.concatenate((positions, collar_pos))
        faces = np.concatenate((faces, collar_faces + offset)); uvs = np.concatenate((uvs, collar_uv))
    _write_glb(path, positions, faces, uvs, 1.0, 1.1)


def _recompute_penetration(template: Path, asset: Path) -> dict[str, object]:
    """只从写盘 GLB + L8 遮罩独立复算第 9 轮标准四项。"""
    body_glb = load_glb(template / "body.glb")
    body_mesh, _, _ = _world_mesh(body_glb)
    head_glb = load_glb(asset / "head.glb")
    head_mesh, _, _ = _world_mesh(head_glb)
    skeleton = json.loads((template / "skeleton.json").read_text())
    names = [body_glb.json["nodes"][node].get("name", "")
             for node in body_glb.skin().joints]
    slots = {name: index for index, name in enumerate(names)}
    frame = _bone_frame(body_glb, slots)
    center = np.asarray(skeleton["neckRing"]["centerMu"], dtype=np.float64)
    axis = frame["axis"]
    visible = _masked_surface(body_mesh, Image.open(asset / "hidemask.png").convert("L"))
    faces = visible["faces"]
    classes = classify_vertices(head_glb, head_mesh, head_mesh.positions, slots)
    neck_id = skeleton["regions"]["ids"]["neck"]
    bridge = np.flatnonzero(head_mesh.regions == neck_id)
    skin = _penetration_skin_vertices(head_mesh, classes["trustedSkin"], bridge)
    candidates = np.unique(np.concatenate((bridge, skin)))
    m_per_mu = float(skeleton["mPerMu"]); threshold = .001

    def evaluate(head: np.ndarray, body: np.ndarray, cut_center: np.ndarray,
                 cut_axis: np.ndarray) -> tuple[int, int, int]:
        height = (head[candidates] - cut_center) @ cut_axis
        below = height < 0; ids = candidates[below]
        normals = _vertex_normals(body, faces)
        distances = _signed_distances(head[ids], body, faces, normals) * m_per_mu
        return int(np.count_nonzero(distances < -threshold)), int(len(ids)), int(np.count_nonzero(~below))

    body_bind = _masked_positions(body_mesh.positions, visible)
    bind_count, bind_evaluated, bind_above = evaluate(
        head_mesh.positions, body_bind, center, axis)
    result: dict[str, object] = {
        "penetration": {"bindVertices": bind_count},
        "evaluated": {"bind": bind_evaluated},
        "above": {"bind": bind_above}}
    body_skin, head_skin = body_glb.skin(), head_glb.skin()
    neck_slot = slots["mixamorig:Neck"]
    for clip in ("idle", "walk", "run"):
        animation = next(item for item in body_glb.json.get("animations", [])
                         if clip in item.get("name", "").lower())
        ends = [float(np.asarray(body_glb.accessor(item["input"])).max(initial=0))
                for item in animation.get("samplers", [])]
        worst = 0.; minimum_evaluated = len(candidates); maximum_above = 0
        for at in np.linspace(0, max(ends, default=0), 24, endpoint=False):
            world = _world_matrices(body_glb, animation, float(at))
            bone_world = world[np.asarray(body_skin.joints)]
            body = lbs(body_mesh.positions, body_mesh.joints, body_mesh.weights,
                       bone_world, body_skin.inverse_bind_matrices)
            body = _masked_positions(body, visible)
            head = lbs(head_mesh.positions, head_mesh.joints, head_mesh.weights,
                       bone_world, head_skin.inverse_bind_matrices)
            deform = bone_world[neck_slot] @ body_skin.inverse_bind_matrices[neck_slot]
            cut_center = (deform @ np.append(center, 1.))[:3]
            cut_axis = deform[:3, :3] @ axis; cut_axis /= np.linalg.norm(cut_axis)
            count, evaluated, above = evaluate(head, body, cut_center, cut_axis)
            worst = max(worst, count / max(evaluated, 1))
            minimum_evaluated = min(minimum_evaluated, evaluated)
            maximum_above = max(maximum_above, above)
        result["penetration"][clip] = worst
        result["evaluated"][clip] = minimum_evaluated
        result["above"][clip] = maximum_above
    return result


def test_bone_ratio_and_bridge() -> None:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary); template = root / "templates" / "template"; _template(template)
        source_path = root / "source.glb"; _source(source_path, True)
        source, target = load_glb(source_path), load_glb(template / "body.glb")
        mesh, positions, normals = _world_mesh(source); target_mesh, _, _ = _world_mesh(target)
        source_slots = {source.json["nodes"][node].get("name", ""): i for i, node in enumerate(source.skin().joints)}
        target_slots = {target.json["nodes"][node].get("name", ""): i for i, node in enumerate(target.skin().joints)}
        skeleton = json.loads((template / "skeleton.json").read_text()); ring = np.array([x["pos"] for x in skeleton["neckRing"]["profile"]])
        cut = cut_plane_from_bone_ratio(source, source_slots, target, target_slots, ring.mean(0))
        assert abs(cut["fraction"] - .2) < 1e-6
        assert np.linalg.norm(cut["sourceCenter"] - [0, 1.02, 0]) < 1e-6
        classified = classify_vertices(source, mesh, positions, source_slots)
        measured = measure_head(positions, classified, cut["source"]); raw, scale, _ = head_scale(measured, {"earWidthMu": .12, "faceHeightMu": .06})
        assert .92 <= scale <= 1.08 and raw > 0
        transformed, _, _ = transform_head(positions, normals, cut, ring.mean(0), scale)
        bridge = build_neck_bridge(positions, mesh.uvs, classified, cut, transformed, ring,
                                   [x["weights"] for x in skeleton["neckRing"]["profile"]], target_slots)
        selected, used = select_head_faces(mesh, positions, cut, classified, bridge)
        kept_positions = positions[used]
        kept_height = (kept_positions - cut["sourceCenter"]) @ cut["source"]["axis"]
        kept_radius = np.hypot(kept_positions[:, 0], kept_positions[:, 2])
        assert not np.any((kept_height < .03) & (kept_radius > .045))
        assert len(selected) > 0
        assert bridge["rings"] >= 4 and np.max(np.linalg.norm(bridge["positions"][:64] - ring, axis=1)) < 1e-9
        np.testing.assert_allclose(bridge["weights"][:64, :2],
                                   np.tile([.75, .25], (64, 1)), atol=1e-7)
        # 颈桥新增几何，不移动原下巴；相似变换保持下巴到口部比例。
        source_distance = np.linalg.norm(positions[64 * 3] - positions[64 * 4])
        target_distance = np.linalg.norm(transformed[64 * 3] - transformed[64 * 4])
        assert abs(target_distance / source_distance - scale) < 1e-6


def test_biharmonic_g1_and_mask() -> None:
    angles = np.arange(64) * 2 * math.pi / 64
    def ring(radius: float, y: float) -> np.ndarray:
        return np.column_stack((radius * np.cos(angles), np.full(64, y), radius * np.sin(angles)))
    bottom, below = ring(.03, 0), ring(.03, -.01)
    top, above = ring(.032, .09), ring(.032, .10)
    surface = _biharmonic_surface(bottom, below, top, above, 10)
    metrics = bridge_shape_metrics(surface, below, above, np.zeros(3), np.array([0., 1, 0]))
    np.testing.assert_allclose(surface[0], bottom, atol=1e-12)
    assert metrics["tangentMaxDeg"] < 1
    assert metrics["maxLocalBulgeMm"] < 1
    assert metrics["maxRadiusTurningPoints"] <= 1
    assert metrics["localBulgesOver1Mm"] == 0
    assert biharmonic_residual(surface) < 1e-10

    positions = np.array([[-1, .1, 0], [0, .1, 0], [-1, .1, 1], [0, .1, 1],
                          [0, -.1, 0], [1, -.1, 0], [0, -.1, 1], [1, -.1, 1]], np.float32)
    uvs = np.array([[0, 0], [.35, 0], [0, 1], [.35, 1],
                    [.65, 0], [1, 0], [.65, 1], [1, 1]], np.float32)
    faces = np.array([[0, 1, 2], [1, 3, 2], [4, 5, 6], [5, 7, 6]], np.uint32)
    mesh = Mesh(positions, faces.reshape(-1), uvs=uvs, regions=np.array([0] * 4 + [1] * 4, np.uint8))
    with tempfile.TemporaryDirectory() as temporary:
        output = Path(temporary) / "mask.png"
        stats = bake_hide_mask(output, mesh, {"regions": {"ids": {"head": 0, "neck": 1}}},
                               np.array([0., 1, 0]), np.zeros(3), 64)
        pixels = np.asarray(Image.open(output))
        assert pixels[32, 16] > 250 and pixels[32, 48] < 5
        assert stats["mode"] == "L" and stats["transitionPixels"] > 0
        assert stats["aboveVisibleVertices"] == stats["aboveVisibleTriangles"] == 0
        assert stats["belowRetainedTriangles"] == 2
        probe = Image.new("L", (64, 64), 0); probe.paste(255, (0, 0, 32, 64))
        surface = _masked_surface(mesh, probe)
        assert surface["hiddenTriangles"] == 2 and len(surface["faces"]) == 2
        # 切面以下即使在颈环半径外、压进肩颈 2 mm，也必须计入。
        points = np.array([[0, -.02, 0], [.04, -.02, 0]])
        penetration = _bridge_penetration(np.array([-.002, -.002]), points, np.zeros(3),
                                          np.array([0., 1, 0]), .001)
        assert penetration.tolist() == [True, True]
        # 身体在切面以上已经开口；到颈口边缘的负距离不计。
        above = _bridge_penetration(np.array([-.002]), np.array([[0, .02, 0]]), np.zeros(3),
                                    np.array([0., 1, 0]), .001)
        assert not above[0]

        # 小于一个目标 texel 的 UV 岛也必须被保守覆盖，旁侧的环下岛仍保留。
        tiny_uv = np.array([[.2000, .2], [.2008, .2], [.2004, .2007],
                            [.7, .2], [.9, .2], [.8, .4]], np.float32)
        tiny = Mesh(np.array([[0, .1, 0], [.1, .1, 0], [0, .1, .1],
                              [0, -.1, 0], [.1, -.1, 0], [0, -.1, .1]], np.float32),
                    np.array([0, 1, 2, 3, 4, 5], np.uint32), uvs=tiny_uv,
                    regions=np.array([0, 0, 0, 1, 1, 1], np.uint8))
        tiny_path = Path(temporary) / "tiny.png"
        tiny_stats = bake_hide_mask(tiny_path, tiny,
                                    {"regions": {"ids": {"head": 0, "neck": 1}}},
                                    np.array([0., 1, 0]), np.zeros(3), 64)
        assert tiny_stats["aboveVisibleVertices"] == 0
        assert tiny_stats["aboveVisibleTriangles"] == 0
        assert tiny_stats["belowRetainedTriangles"] == 1


def test_skin_match_uses_true_means() -> None:
    source = np.asarray([[.72, .61, .55]] * 3 + [[.795, .71, .65]] * 2)
    template = np.asarray([[.77, .68, .60]] * 3 + [[.82, .73, .65]] * 2)
    positions = np.asarray([[0., .02, 0.]] * len(source))
    classified = {"skin": np.ones(len(source), dtype=bool)}
    mesh = Mesh(np.zeros((len(template), 3), np.float32), np.array([0, 1, 2], np.uint32),
                regions=np.ones(len(template), np.uint8))
    result = skin_match(source, classified, positions,
                        {"sourceCenter": np.zeros(3),
                         "source": {"axis": np.array([0., 1, 0])}},
                        template, mesh, {"regions": {"ids": {"head": 0, "neck": 1}}})
    source_mean, template_mean = source.mean(axis=0), template.mean(axis=0)
    from cut_head import _srgb_to_linear
    expected = _srgb_to_linear(source_mean) / _srgb_to_linear(template_mean)
    median_tint = _srgb_to_linear(np.median(source, axis=0)) / _srgb_to_linear(
        np.median(template, axis=0))
    np.testing.assert_allclose(result["sourceSrgb"], source_mean, atol=1e-12)
    np.testing.assert_allclose(result["templateSrgb"], template_mean, atol=1e-12)
    np.testing.assert_allclose(result["skinTint"], expected, atol=1e-12)
    assert np.linalg.norm(expected - median_tint) > .01
    assert np.all(result["skinTint"] < 1), result
    assert result["deltaE"] < result["deltaEBefore"]
    assert result["deltaE"] < 3
    # 色相差（源偏红、模板偏黄）：乘子须把 R 抬高、B 压低，反向乘子会让色差变大。
    warm = np.asarray([[.80, .62, .56]] * 4 + [[.84, .66, .60]])
    yellow = np.asarray([[.78, .70, .58]] * 4 + [[.82, .74, .62]])
    hue = skin_match(warm, classified, positions,
                     {"sourceCenter": np.zeros(3), "source": {"axis": np.array([0., 1, 0])}},
                     yellow, mesh, {"regions": {"ids": {"head": 0, "neck": 1}}})
    assert hue["skinTint"][0] > 1 > hue["skinTint"][1], hue
    assert hue["deltaE"] < hue["deltaEBefore"] and hue["deltaE"] < 3
    from cut_head import _linear_to_srgb, _srgb_to_lab, delta_e_cie2000
    inverse = _linear_to_srgb(_srgb_to_linear(yellow) / np.asarray(hue["skinTint"])).mean(axis=0)
    lab = _srgb_to_lab(np.stack((warm.mean(axis=0), inverse)))
    assert delta_e_cie2000(lab[0], lab[1]) > hue["deltaEBefore"]


def test_end_to_end() -> None:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary); template = root / "templates" / "template"; _template(template)
        source = root / "source.glb"; _source(source, False); out = root / "out"
        report = process_head(source, template, "synthetic", out)
        fit = json.loads((out / "fit.json").read_text()); result = load_glb(out / "head.glb")
        assert fit["kind"] == "head" and fit["skinTint"][0] > 0
        assert fit["diagnostics"]["color"]["averageSpace"] == "sRGB arithmetic mean"
        assert len(result.skin().joints) == len(load_glb(template / "body.glb").skin().joints)
        assert report["bridge"]["bottomSnapMaxMm"] < .01
        assert report["bridge"]["rings"] >= 8 and report["bridge"]["tangentMaxDeg"] < 5
        assert report["bridge"]["maxRadiusTurningPoints"] <= 1
        assert report["bridge"]["outerRadiusFactor"] == 1.15
        assert report["color"]["bridgeTop"]["maxDeltaE"] < 3
        assert fit["hideRegions"] == [] and fit["hideMask"] == {"file": "hidemask.png", "size": 1024}
        assert result.mesh().regions is not None and set(result.mesh().regions) == {0, 1}
        mesh = result.mesh(); faces = mesh.indices.reshape(-1, 3)
        final_surface = bridge_surface_from_mesh(mesh, 1, report["bridge"]["rings"])
        final_metrics = bridge_shape_metrics(
            final_surface, final_surface[0] - [0, .004, 0], final_surface[-1] + [0, .004, 0],
            np.asarray([0, 1.02, 0]), np.asarray([0., 1, 0]))
        assert final_metrics["maxLocalBulgeMm"] < 1
        assert final_metrics["maxRadiusTurningPoints"] <= 1
        topology, seam = fit["diagnostics"]["topology"], fit["diagnostics"]["seam"]
        assert topology["headNeckCrossTriangles"] >= 64, topology
        assert topology["stitchTriangles"] == 128, topology
        assert topology["oldNeckSkinTriangles"] == 0
        template_glb = load_glb(template / "body.glb")
        names = [template_glb.json["nodes"][node].get("name", "")
                 for node in template_glb.skin().joints]
        slots = {name: index for index, name in enumerate(names)}
        skeleton = json.loads((template / "skeleton.json").read_text())
        trusted = classify_vertices(result, mesh, mesh.positions, slots)["trustedSkin"]
        center = np.asarray(skeleton["neckRing"]["centerMu"]); frame = _bone_frame(template_glb, slots)
        assert count_old_neck_skin_triangles(mesh, trusted, skeleton["regions"]["ids"], center, frame) == 0
        injected = Mesh(np.concatenate((mesh.positions, center + [[-.01, -.01, 0], [.01, -.01, 0], [0, -.01, .01]])),
                        np.concatenate((mesh.indices, np.arange(len(mesh.positions), len(mesh.positions) + 3))),
                        regions=np.concatenate((mesh.regions, np.zeros(3, np.uint8))))
        injected_skin = np.concatenate((np.zeros(len(mesh.positions), bool), np.ones(3, bool)))
        assert count_old_neck_skin_triangles(injected, injected_skin, skeleton["regions"]["ids"], center, frame) == 1
        assert np.count_nonzero(np.any(mesh.regions[faces] == 0, axis=1) &
                                np.any(mesh.regions[faces] == 1, axis=1)) >= 64
        diagnostics = fit["diagnostics"]
        assert diagnostics["topology"]["topCutVertices"] == 64
        assert seam["ringMaxDiffMm"] < .01, seam
        assert seam["topMaxDiffMm"] < .5, seam
        assert seam["penetrationRatioNeckBridge"] == 0
        assert seam["maskBoundaryBindMaxDiffMm"] < .5, seam
        assert seam["maskBoundary72FramesMaxDiffMm"] < .5, seam
        emitted = json.loads((out / "report.json").read_text())
        independent = _recompute_penetration(template, out)
        for name in ("bindVertices", "idle", "walk", "run"):
            assert abs(independent["penetration"][name] -
                       emitted["seam"]["penetration"][name]) < 1e-8
        assert independent["evaluated"] == emitted["seam"]["penetrationEvaluatedVertices"]
        assert independent["above"] == {key: emitted["seam"]["aboveCutExcluded"][key]
                                           for key in independent["above"]}
        expected_level = "draft" if emitted["gateLevel"] == "pass" else "fail"
        assert emitted["level"] == expected_level
        assert next(item for item in emitted["checks"]
                    if item["name"] == "head.neckBridgePenetration")["pass"]
        assert emitted["stats"]["vertices"] == fit["diagnostics"]["stats"]["vertices"]
        assert emitted["stats"]["fileSize"] == (out / "head.glb").stat().st_size
        for name in ("penetration.bindVertices", "penetration.idle",
                     "penetration.walk", "penetration.run"):
            assert next(item for item in emitted["checks"] if item["name"] == name)["pass"]
        assert emitted["bridge"]["biharmonicResidualMaxMu"] < 1e-6
        import argparse
        ingested = ingest(argparse.Namespace(kind="head", id="synthetic", src=out,
                          template="template", slot="body", item=None,
                          asset_root=root / "ingested", commit=False))
        assert ingested["status"] == "draft"
        manifest = (out / "manifest.yaml").read_text()
        assert manifest.startswith("- id:")
        for field in ("category:", "fit:", "report:", "fits:", "tool:", "source:"):
            assert field in manifest
        measures = report["measurements"]
        expected = math.sqrt((measures["sourceEarWidthMu"] * measures["scaleApplied"] /
                              measures["targetEarWidthMu"]) *
                             (measures["sourceFaceHeightMu"] * measures["scaleApplied"] /
                              measures["targetFaceHeightMu"]))
        assert abs(measures["overallSizeRatioAfter"] - expected) < 1e-8
        assert measures["overallSizeGatePass"] == (abs(expected - 1) < .01 or measures["clamped"])

        # 回归：旧实现求解后把顶两圈吸到锚点，会在最终 GLB 形成 >1 mm 鼓圈。
        broken = final_surface.copy(); broken[-1, :, 0] += .02; broken[-2, :, 0] += .01
        broken_mesh = Mesh(broken.astype(np.float32).reshape(-1, 3), np.array([0, 1, 2], np.uint32),
                           regions=np.ones(broken.size // 3, np.uint8))
        reloaded_broken = bridge_surface_from_mesh(broken_mesh, 1, report["bridge"]["rings"])
        broken_metrics = bridge_shape_metrics(
            reloaded_broken, reloaded_broken[0] - [0, .004, 0],
            reloaded_broken[-1] + [0, .004, 0], np.asarray([0, 1.02, 0]), np.asarray([0., 1, 0]))
        assert broken_metrics["maxLocalBulgeMm"] > 1 or broken_metrics["maxRadiusTurningPoints"] > 1


def test_real_template_mask() -> None:
    template = Path(__file__).resolve().parents[3] / "assets/default/model3d/dressup/templates/tpl_f_medium"
    if not template.is_dir(): return
    glb = load_glb(template / "body.glb"); mesh, _, _ = _world_mesh(glb)
    skeleton = json.loads((template / "skeleton.json").read_text())
    names = [glb.json["nodes"][node].get("name", "") for node in glb.skin().joints]
    frame = _bone_frame(glb, {name: index for index, name in enumerate(names)})
    section = actual_neck_section(mesh, skeleton, frame, names)
    assert section["points"].shape == (64, 3)
    height = (section["points"] - np.asarray(skeleton["neckRing"]["centerMu"])) @ frame["axis"]
    assert np.abs(height).max() < 1e-7
    assert section["abstractMismatchMu"]["max"] > .001
    with tempfile.TemporaryDirectory() as temporary:
        path = Path(temporary) / "mask.png"
        stats = bake_hide_mask(path, mesh, skeleton, frame["axis"],
                               np.asarray(skeleton["neckRing"]["centerMu"]))
        assert stats["aboveVisibleVertices"] == 0, stats
        assert stats["aboveVisibleTriangles"] == 0, stats
        assert stats["belowRetainedTriangles"] > 0, stats
        # 最终黄蓉产物若存在，必须由写盘 GLB/遮罩复算出同一硬门。
        asset = template.parents[1] / "heads" / "npc_huangrong"
        if (asset / "head.glb").is_file():
            result = load_glb(asset / "head.glb"); result_mesh, _, _ = _world_mesh(result)
            report = json.loads((asset / "report.json").read_text())
            final = bridge_surface_from_mesh(result_mesh, skeleton["regions"]["ids"]["neck"],
                                             report["bridge"]["rings"])
            np.testing.assert_allclose(final[0], section["points"], atol=5e-7)
            assert biharmonic_residual(final) < 1e-6
            assert report["seam"]["maskBoundaryBindMaxDiffMm"] < .5
            assert report["seam"]["maskBoundary72FramesMaxDiffMm"] < .5
            independent = _recompute_penetration(template, asset)
            for name in ("bindVertices", "idle", "walk", "run"):
                assert abs(independent["penetration"][name] -
                           report["seam"]["penetration"][name]) < 1e-8
            assert independent["evaluated"] == report["seam"]["penetrationEvaluatedVertices"]
            assert independent["above"] == {key: report["seam"]["aboveCutExcluded"][key]
                                               for key in independent["above"]}


if __name__ == "__main__":
    try:
        test_bone_ratio_and_bridge(); test_biharmonic_g1_and_mask(); test_skin_match_uses_true_means()
        test_end_to_end(); test_real_template_mask()
        print("tests_head.py PASS")
    except Exception:
        traceback.print_exc(); sys.exit(1)
