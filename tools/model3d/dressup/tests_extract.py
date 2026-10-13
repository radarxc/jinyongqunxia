#!/usr/bin/env python3
"""extract_garment 的无框架合成端到端测试。"""
from __future__ import annotations

from io import BytesIO
import json
import math
from pathlib import Path
import sys
import tempfile
import traceback

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
from extract_garment import (ExtractError, boundary_loops, clean_opening_edges, clean_triangle_mask,
                             compact_indexed_mesh, extract_file, require_four_openings,
                             sample_base_color, smooth_opening_edges, triangle_adjacency)  # noqa: E402
from fit_garment import load_world_mesh  # noqa: E402
from glb_io import GLB, GLBBuilder, ImageData, Mesh, PrimitiveRange, Skin, load_glb, write_skinned_glb  # noqa: E402


REGION_NAMES = ("head", "neck", "torsoUpper", "torsoLower", "hips",
                "upperArmL", "upperArmR", "forearmL", "forearmR",
                "handL", "handR", "thighL", "thighR", "shinL",
                "shinR", "footL", "footR")
BONES = ("Hips", "Spine", "Spine1", "Spine2", "Neck",
         "LeftArm", "RightArm", "LeftUpLeg", "RightUpLeg",
         "LeftHand", "RightHand", "LeftFoot", "RightFoot")


def tube(start: np.ndarray, end: np.ndarray, radius: float, *, sides: int = 20,
         cap_start: bool = False, cap_end: bool = False) -> tuple[np.ndarray, np.ndarray]:
    axis = np.asarray(end, dtype=float) - np.asarray(start, dtype=float); axis /= np.linalg.norm(axis)
    helper = np.asarray([0.0, 0.0, 1.0]) if abs(axis[2]) < .9 else np.asarray([0.0, 1.0, 0.0])
    left = np.cross(axis, helper); left /= np.linalg.norm(left); forward = np.cross(axis, left)
    vertices = []
    for point in (start, end):
        vertices.extend(point + radius * (math.cos(2 * math.pi * i / sides) * left
                                           + math.sin(2 * math.pi * i / sides) * forward)
                        for i in range(sides))
    faces = []
    for i in range(sides):
        j = (i + 1) % sides; faces.extend(((i, sides + i, j), (j, sides + i, sides + j)))
    for at_start, enabled in ((True, cap_start), (False, cap_end)):
        if not enabled:
            continue
        center = len(vertices); vertices.append(np.asarray(start if at_start else end, dtype=float))
        offset = 0 if at_start else sides
        for i in range(sides):
            j = (i + 1) % sides
            faces.append((center, offset + (j if at_start else i), offset + (i if at_start else j)))
    return np.asarray(vertices, dtype=np.float32), np.asarray(faces, dtype=np.uint32)


def four_opening_shell(*, sides: int = 20, rows: int = 7) -> tuple[np.ndarray, np.ndarray]:
    """带领/下摆和左右袖口四个边界环的连通合成衣壳。"""
    ys = np.linspace(.38, .82, rows); vertices = np.asarray([
        [.155 * math.cos(2 * math.pi * i / sides), y, .155 * math.sin(2 * math.pi * i / sides)]
        for y in ys for i in range(sides)], dtype=np.float32)
    faces = []
    holes = {(rows // 2, 0), (rows // 2, sides // 2)}
    for row in range(rows - 1):
        for i in range(sides):
            if (row, i) in holes:
                continue
            a = row * sides + i; b = row * sides + (i + 1) % sides
            c = (row + 1) * sides + i; d = (row + 1) * sides + (i + 1) % sides
            faces.extend(((a, c, b), (b, c, d)))
    return vertices, np.asarray(faces, dtype=np.uint32)


def combine(parts: list[tuple[np.ndarray, np.ndarray, str]]) -> tuple[Mesh, np.ndarray]:
    positions = []; indices = []; regions = []; offset = 0
    region_ids = {name: index for index, name in enumerate(REGION_NAMES)}
    for vertices, faces, region in parts:
        positions.append(vertices); indices.append(faces + offset)
        regions.extend([region_ids[region]] * len(vertices)); offset += len(vertices)
    points = np.concatenate(positions); faces = np.concatenate(indices)
    normals = np.zeros_like(points)
    tri = points[faces]; face_normals = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    for column in range(3):
        np.add.at(normals, faces[:, column], face_normals)
    normals /= np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-12)
    mesh = Mesh(points, faces.reshape(-1), normals, regions=np.asarray(regions, dtype=np.uint8),
                material_indices=np.asarray([0]),
                primitives=[PrimitiveRange(0, len(points), 0, faces.size, 0)], name="SyntheticBody")
    return mesh, np.asarray(regions, dtype=np.uint8)


def add_skin(mesh: Mesh, joint: int = 0) -> None:
    mesh.joints = np.full((len(mesh.positions), 4), joint, dtype=np.uint16)
    mesh.weights = np.zeros((len(mesh.positions), 4), dtype=np.float32); mesh.weights[:, 0] = 1.0


def skeleton_data(regions_file: str) -> dict:
    names = [f"mixamorig:{name}" for name in BONES]; worlds = {}; parents = [-1] + [0] * (len(names) - 1)
    points = {"Hips": [0, .45, 0], "Spine": [0, .55, 0], "Spine1": [0, .65, 0],
              "Spine2": [0, .75, 0], "Neck": [0, .85, 0],
              "LeftArm": [.18, .72, 0], "RightArm": [-.18, .72, 0],
              "LeftUpLeg": [.07, .4, 0], "RightUpLeg": [-.07, .4, 0],
              "LeftHand": [.55, .55, 0], "RightHand": [-.55, .55, 0],
              "LeftFoot": [.08, .02, 0], "RightFoot": [-.08, .02, 0]}
    for name in BONES:
        matrix = np.eye(4); matrix[:3, 3] = points[name]; worlds[f"mixamorig:{name}"] = matrix.T.reshape(-1).tolist()
    return {"schema": "tianshu-dressup-skeleton.v1", "unit": "mu", "heightMu": 1.0,
            "defaultHeightM": 1.0, "mPerMu": 1.0, "joints": names, "parents": parents,
            "bindWorld": worlds, "neckRing": {"centerMu": [0, .85, 0]},
            "regions": {"ids": {name: index for index, name in enumerate(REGION_NAMES)},
                        "file": regions_file}}


def write_body(path: Path, mesh: Mesh, skeleton: dict) -> None:
    builder = GLBBuilder(); material = builder.add_material(base_color_factor=(.8, .65, .55, 1), unlit=True)
    mesh_id = builder.add_mesh(mesh, material_map=[material]); node_ids = []
    for name in skeleton["joints"]:
        node_ids.append(builder.add_node(name=name, matrix=np.asarray(skeleton["bindWorld"][name]).reshape(4, 4).T))
    ibm = np.asarray([np.linalg.inv(np.asarray(skeleton["bindWorld"][name]).reshape(4, 4).T)
                      for name in skeleton["joints"]])
    accessor = builder.add_accessor(ibm, component_type=5126, type_name="MAT4")
    skin = builder.add_skin(node_ids, accessor, skeleton=node_ids[0])
    mesh_node = builder.add_node(name="Body", mesh=mesh_id, skin=skin)
    builder.add_scene([*node_ids, mesh_node]); builder.write(path)


def texture_image() -> ImageData:
    image = Image.new("RGB", (64, 64), (218, 180, 155)); draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 31, 31), fill=(45, 65, 90))
    draw.rectangle((0, 32, 31, 63), fill=(210, 45, 80))
    output = BytesIO(); image.save(output, format="PNG")
    return ImageData(output.getvalue(), "image/png", "synthetic-color")


def write_dressed(path: Path, body: Mesh, skeleton: dict) -> tuple[np.ndarray, np.ndarray]:
    torso_v, torso_f = four_opening_shell()
    garment, _ = combine([(torso_v, torso_f, "torsoUpper")])
    # 整身包含身体（皮肤 UV 右半）与外衣（深色 UV 左半）。
    positions = np.concatenate((body.positions, garment.positions)); offset = len(body.positions)
    indices = np.concatenate((body.indices, garment.indices + offset))
    normals = np.concatenate((body.normals, garment.normals))
    uvs = np.zeros((len(positions), 2), dtype=np.float32); uvs[:offset] = (.75, .5); uvs[offset:] = (.25, .25)
    joints = np.zeros((len(positions), 4), dtype=np.uint16); weights = np.zeros((len(positions), 4), dtype=np.float32)
    weights[:, 0] = 1.0
    mesh = Mesh(positions, indices, normals, uvs, joints, weights, None, np.asarray([0]),
                [PrimitiveRange(0, len(positions), 0, len(indices), 0)], "SyntheticDressed")
    # 复用 body 的骨节点/IBM，确保 align_joints 路径真实执行。
    fake = path.with_name("body.glb"); source = load_glb(fake); skin = source.skin()
    write_skinned_glb(path, mesh, skin, {"unlit": True, "double_sided": True,
                                        "textureImage": 0}, [texture_image()])
    return garment.positions.copy(), garment.indices.copy()


def test_topology_cleanup_and_openings() -> None:
    vertices, faces = tube(np.asarray([0, 0, 0]), np.asarray([0, 1, 0]), 1.0, sides=12)
    adjacency = [np.asarray([1, 2, 3]), np.asarray([0, 2, 3]),
                 np.asarray([0, 1, 3]), np.asarray([0, 1, 2])]
    mask = np.asarray([False, True, True, True])
    cleaned, stats = clean_triangle_mask(mask, adjacency, majority_rounds=1, island_min=2, hole_max=2)
    assert cleaned.all()
    loops = boundary_loops(vertices, faces)
    assert loops["count"] == 2 and loops["openChains"] == 0


def test_fifth_real_hole_fails_gate() -> None:
    vertices, faces = four_opening_shell(sides=20, rows=7)
    # 再删一个不接触既有四环的三角，形成第五个真实孔洞。
    fifth = np.delete(faces, 3 * 20 + 5, axis=0)
    openings = boundary_loops(vertices, fifth)
    assert openings["count"] == 5 and openings["openChains"] == 0
    assert len(openings["semanticOpenings"]) == 4
    try:
        require_four_openings(openings)
    except ExtractError:
        pass
    else:
        raise AssertionError("第五个真实孔洞不得被 semanticOpenings 掩盖")


def test_edge_cleanup_and_smoothing() -> None:
    """齿片应删除；环向平滑需限幅且保持顶点/面对应。"""
    positions = np.asarray([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
                            [.5, .5, 0], [1.15, .5, 0]], dtype=np.float32)
    faces = np.asarray([[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4],
                        [1, 5, 2]], dtype=np.uint32)
    selected, stats = clean_opening_edges(
        np.ones(5, dtype=bool), faces, positions, np.zeros((6, 3)))
    assert selected.tolist() == [True, True, True, True, False]
    assert stats["twoBoundaryEdgeTriangles"] == 1 and stats["removedTriangles"] == 1

    vertices, shell_faces = four_opening_shell(sides=20, rows=7)
    normals = np.zeros_like(vertices); normals[:, 2] = 1
    shell = Mesh(vertices, shell_faces.reshape(-1), normals, material_indices=np.asarray([0]),
                 primitives=[PrimitiveRange(0, len(vertices), 0, shell_faces.size, 0)])
    smoothed, smoothing = smooth_opening_edges(shell, 1.0, maximum_mm=2.0)
    assert len(smoothed.positions) == len(shell.positions)
    assert np.array_equal(smoothed.indices, shell.indices)
    assert 0 < smoothing["sourceVerticesMoved"]
    assert smoothing["maxDisplacementMm"] <= 2.00001

    add_skin(shell); compact = compact_indexed_mesh(shell, shell_faces[:10].reshape(-1))
    assert len(compact.positions) < len(shell.positions)
    assert np.array_equal(compact.positions, shell.positions[np.unique(shell_faces[:10])])
    assert compact.joints is not None and compact.weights is not None


def test_extract_synthetic_end_to_end() -> None:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary); body_path = root / "body.glb"; dressed_path = root / "dressed.glb"
        torso = tube(np.asarray([0, .32, 0]), np.asarray([0, .84, 0]), .13, cap_start=True, cap_end=True)
        head = tube(np.asarray([0, .84, 0]), np.asarray([0, .98, 0]), .09, cap_start=True, cap_end=True)
        hand_l = tube(np.asarray([.48, .55, 0]), np.asarray([.58, .49, 0]), .045, cap_start=True, cap_end=True)
        hand_r = tube(np.asarray([-.48, .55, 0]), np.asarray([-.58, .49, 0]), .045, cap_start=True, cap_end=True)
        foot_l = tube(np.asarray([.07, .02, 0]), np.asarray([.07, .16, 0]), .05, cap_start=True, cap_end=True)
        foot_r = tube(np.asarray([-.07, .02, 0]), np.asarray([-.07, .16, 0]), .05, cap_start=True, cap_end=True)
        body, regions = combine([(torso[0], torso[1], "torsoUpper"), (head[0], head[1], "head"),
                                 (hand_l[0], hand_l[1], "handL"), (hand_r[0], hand_r[1], "handR"),
                                 (foot_l[0], foot_l[1], "footL"), (foot_r[0], foot_r[1], "footR")])
        add_skin(body); skeleton = skeleton_data("regions.npy")
        write_body(body_path, body, skeleton); np.save(root / "regions.npy", regions)
        skeleton_path = root / "skeleton.json"; skeleton_path.write_text(json.dumps(skeleton), encoding="utf-8")
        source_garment_positions, _ = write_dressed(dressed_path, body, skeleton)
        dressed_glb = load_glb(dressed_path); dressed_mesh = load_world_mesh(dressed_glb, skinned_only=True)
        sampled = sample_base_color(dressed_glb, dressed_mesh)
        # v=.25 必须落在 Pillow 上半部蓝色；若错误执行 1-v 会读到下半部红色。
        assert np.allclose(sampled[-len(source_garment_positions):].mean(axis=0), [45, 65, 90])
        out = root / "out"; result = extract_file(dressed_path, body_path, skeleton_path, "body",
                                                     "eq_synthetic", out)
        assert result["topology"]["openings"]["count"] == 4, result["topology"]["openings"]
        assert result["topology"]["openings"]["openChains"] == 0
        assert len(result["topology"]["openings"]["semanticOpenings"]) == 4
        assert not (set(result["segmentation"]["keepRegions"]) & {"head", "handL", "handR", "footL", "footR"})
        raw_glb = load_glb(out / "eq_synthetic_raw_skinned.glb")
        aligned_glb = load_glb(out / "eq_synthetic_raw_aligned.glb")
        raw = load_world_mesh(raw_glb, skinned_only=True); aligned = load_world_mesh(aligned_glb)
        assert len(raw_glb.json.get("skins", [])) == 1 and not aligned_glb.json.get("skins")
        assert len(raw.positions) == len(source_garment_positions)
        assert np.array_equal(raw.positions, source_garment_positions), np.max(np.abs(raw.positions - source_garment_positions))
        assert len(aligned.positions) == len(source_garment_positions)
        assert np.max(np.abs(aligned.positions - source_garment_positions)) <= .00201
        assert (out / "extract_front.png").is_file() and (out / "extract_back.png").is_file()
        assert (out / "extract_color_check_front.png").is_file()
        assert (out / "extract_edges_detail.png").is_file()


def main() -> int:
    tests = [test_topology_cleanup_and_openings, test_fifth_real_hole_fails_gate,
             test_edge_cleanup_and_smoothing,
             test_extract_synthetic_end_to_end]
    failed = 0
    for test in tests:
        try:
            test(); print(f"PASS {test.__name__}")
        except Exception:
            failed += 1; print(f"FAIL {test.__name__}"); traceback.print_exc()
    print(f"{len(tests) - failed}/{len(tests)} tests passed")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
