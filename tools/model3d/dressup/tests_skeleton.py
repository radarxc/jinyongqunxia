#!/usr/bin/env python3
"""A2 骨架派生与规范化的无网络合成测试。"""

from __future__ import annotations

import copy
from contextlib import redirect_stderr, redirect_stdout
import io
import json
import math
from pathlib import Path
import shutil
import sys
import tempfile

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import compose_matrix, matrix_to_quaternion  # noqa: E402
from export_skeleton import (REGION_IDS, _flex_axis, _grip_point, _plane_basis, _socket, _surface_vertex,
                             derive_regions, embed_regions, find_neck_ring, fit_ellipse, main as export_main)  # noqa: E402
from glb_io import GLBBuilder, Mesh, PrimitiveRange, load_glb  # noqa: E402
from normalize_rig import facing_yaw, normalize, strip_constant_tracks  # noqa: E402


def _assert_close(actual, expected, tolerance=1e-6) -> None:
    if not np.allclose(actual, expected, atol=tolerance, rtol=0):
        raise AssertionError(f"{actual!r} != {expected!r}")


def test_region_mapping() -> None:
    mesh = Mesh(np.zeros((4, 3)), np.array([0, 1, 2, 1, 2, 3]), joints=np.array([[0, 1, 0, 0], [0, 1, 0, 0],
                     [1, 0, 0, 0], [1, 0, 0, 0]], dtype=np.uint16), weights=np.array([[.8, .2, 0, 0], [.6, .4, 0, 0],
                     [.9, .1, 0, 0], [.7, .3, 0, 0]], dtype=np.float32))
    regions, mapping, cross, triangles = derive_regions(mesh, ["mixamorig:Head", "mixamorig:Neck"])
    assert mapping["mixamorig:Head"] == "head"
    assert regions.tolist() == [REGION_IDS["head"], REGION_IDS["head"], REGION_IDS["neck"], REGION_IDS["neck"]]
    _assert_close(cross, 1.0)
    assert triangles.tolist() == [REGION_IDS["head"], REGION_IDS["neck"]]


def test_neck_ring_and_ellipse() -> None:
    angles = np.linspace(0, 2 * math.pi, 96, endpoint=False)
    axis = np.array([0.31, 0.91, -0.27]); axis, plane_u, plane_v = _plane_basis(axis)
    turn = math.radians(31); ellipse_axes = np.array([[math.cos(turn), -math.sin(turn)],
                                                       [math.sin(turn), math.cos(turn)]])
    rings, weights, primary = [], [], []
    for height, radii, dominant in ((0.008, (0.050, 0.020), False), (0.014, (0.030, 0.026), True)):
        section = np.column_stack((radii[0] * np.cos(angles), radii[1] * np.sin(angles))) @ ellipse_axes.T
        rings.append(axis * height + section[:, :1] * plane_u + section[:, 1:] * plane_v)
        weights.append(np.ones(len(angles)) * .9); primary.append(np.ones(len(angles), dtype=np.uint8) * dominant)
    points = np.concatenate(rings); result = find_neck_ring(points, np.concatenate(weights), np.concatenate(primary), axis, slice_half=.0004)
    _assert_close(result["height"], .014); _assert_close(np.sort(result["radii"]), [.026, .030], 5e-4)
    planar = np.column_stack((rings[1] @ plane_u, rings[1] @ plane_v))
    center, radii, fitted_axes = fit_ellipse(planar + [0.01, -0.02])
    _assert_close(center, [.01, -.02]); _assert_close(np.sort(radii), [.026, .030], 5e-4)
    assert abs(float(np.dot(fitted_axes[0], ellipse_axes[:, 0]))) > .99


class _SocketGLB:
    def __init__(self) -> None:
        self.skin_value = type("Skin", (), {"joints": (0,)})()
        self.json = {"nodes": [{"name": "bone"}]}
        self.transform = compose_matrix([1.2, -0.4, 2.0], matrix_to_quaternion(np.array([[0., 0., 1.], [0., 1., 0.], [-1., 0., 0.]])))
    def skin(self): return self.skin_value
    def world_matrix(self, _node): return self.transform


def test_socket_round_trip() -> None:
    glb = _SocketGLB(); local = np.array([.2, .3, -.1]); world = (glb.transform @ np.r_[local, 1])[:3]
    result = _socket(glb, "bone", world, np.array([0., 0., 1.]), np.array([1., 0., 0.]))
    _assert_close(result["pos"], local)
    _assert_close((glb.transform @ np.r_[result["pos"], 1])[:3], world)


def test_grip_surface_and_flex_axes() -> None:
    center = np.array([.1, .2, .3]); normal = np.array([0., 0., 2.])
    grip = _grip_point(center, normal)
    _assert_close(grip, center + [0, 0, .0293]); _assert_close(np.linalg.norm(grip - center), .0293)
    positions = np.array([[0, 0, 0], [1, 0, 0], [.999, .001, 0], [-1, 0, 0]], dtype=float)
    normals = np.array([[0, 1, 0], [.8, .6, 0], [.6, .8, 0], [-1, 0, 0]], dtype=float)
    point, surface_normal = _surface_vertex(positions, normals, np.arange(4), np.array([1, 0, 0]))
    _assert_close(point, [1, 0, 0]); assert surface_normal[1] > .6
    first = _flex_axis(np.array([1., 0, 0]), np.array([0., 0, 1]), np.eye(4))
    second = _flex_axis(np.array([0., 1, 0]), np.array([1., 0, 0.]), np.eye(4))
    _assert_close(np.linalg.norm(first), 1); _assert_close(np.linalg.norm(second), 1)
    assert not np.allclose(first, second)


def _make_rig(path: Path) -> None:
    builder = GLBBuilder()
    hips = builder.add_node(name="mixamorig:Hips", translation=[0, 0, 0])
    spine = builder.add_node(name="mixamorig:Spine2", translation=[0, 1, 0])
    left = builder.add_node(name="mixamorig:LeftShoulder", translation=[-1, 0, 0])
    right = builder.add_node(name="mixamorig:RightShoulder", translation=[1, 0, 0])
    builder.document["nodes"][hips]["children"] = [spine]
    builder.document["nodes"][spine]["children"] = [left, right]
    ibm = np.stack([np.linalg.inv(compose_matrix()), np.linalg.inv(compose_matrix([0, 1, 0])),
                    np.linalg.inv(compose_matrix([-1, 1, 0])), np.linalg.inv(compose_matrix([1, 1, 0]))])
    ibm_id = builder.add_accessor(ibm, component_type=5126, type_name="MAT4")
    builder.add_skin([hips, spine, left, right], ibm_id, skeleton=hips)
    times = np.array([0., 1.], dtype=np.float32); translations = np.array([[0, 0, 0], [0, 0, 0]], dtype=np.float32)
    scales = np.ones((2, 3), dtype=np.float32); rotations = np.array([[0, 0, 0, 1], [0, 0, 0, 1]], dtype=np.float32)
    builder.add_animation("idle", [{"node": hips, "path": "translation", "timesSec": times, "values": translations},
                          {"node": spine, "path": "translation", "timesSec": times, "values": translations},
                          {"node": spine, "path": "scale", "timesSec": times, "values": scales},
                          {"node": spine, "path": "rotation", "timesSec": times, "values": rotations}])
    mesh = Mesh(np.array([[-1, 0, 0], [1, 0, 0], [-1, 1, 0], [1, 1, 0]], dtype=np.float32),
                np.array([0, 1, 2, 1, 3, 2]), joints=np.array([[0, 0, 0, 0], [0, 0, 0, 0],
                [1, 0, 0, 0], [1, 0, 0, 0]], dtype=np.uint16), weights=np.array([[1, 0, 0, 0]] * 4, dtype=np.float32),
                primitives=[PrimitiveRange(0, 4, 0, 6, None)])
    mesh_node = builder.add_node(name="body", mesh=builder.add_mesh(mesh), skin=0)
    builder.add_scene([hips, mesh_node]); builder.write(path)


def test_track_strip_and_yaw() -> None:
    with tempfile.TemporaryDirectory(prefix="tianshu-a2-test-") as directory:
        path = Path(directory) / "rig.glb"; _make_rig(path); glb = load_glb(path)
        # left-right is reversed, hence cross(shoulder, spine) faces -Z and requires 180 degrees.
        yaw, facing = facing_yaw(glb); _assert_close(abs(yaw), 180.0); _assert_close(facing, [0, 0, -1])
        removed = strip_constant_tracks(glb.json, glb)
        assert removed == {"scale": 1, "translation": 1, "total": 2}
        paths = [item["target"]["path"] for item in glb.json["animations"][0]["channels"]]
        assert paths == ["translation", "rotation"]
        target = Path(directory) / "normalized.glb"; report = normalize(path, target)
        assert abs(report["yawAppliedDeg"]) == 180.0
        normalized_yaw, normalized_facing = facing_yaw(load_glb(target))
        _assert_close(normalized_yaw, 0.0); _assert_close(normalized_facing, [0, 0, 1])


def test_region_glb_attribute() -> None:
    with tempfile.TemporaryDirectory(prefix="tianshu-a2-region-") as directory:
        path = Path(directory) / "rig.glb"; _make_rig(path); original = load_glb(path)
        names = [original.json["nodes"][node]["name"] for node in original.skin().joints]
        ibm = original.skin().inverse_bind_matrices.copy(); regions = np.array([0, 1, 2, 3], dtype=np.uint8)
        assert embed_regions(path, regions); assert not embed_regions(path, regions)
        loaded = load_glb(path); _assert_close(loaded.mesh().regions, regions)
        assert [loaded.json["nodes"][node]["name"] for node in loaded.skin().joints] == names
        _assert_close(loaded.skin().inverse_bind_matrices, ibm)
        accessor = loaded.json["accessors"][loaded.json["meshes"][0]["primitives"][0]["attributes"]["_REGION"]]
        assert accessor["componentType"] == 5121 and accessor["type"] == "SCALAR"


def test_check_rejects_nested_damage() -> None:
    source = Path(__file__).resolve().parents[3] / "assets/default/model3d/dressup/templates/tpl_f_medium"
    if not (source / "skeleton.json").exists(): return
    mutations = [
        lambda data: data["bindWorld"].pop(data["joints"][0]),
        lambda data: data["measures"].pop("handLengthMu"),
        lambda data: data["neckRing"]["profile"][0].pop("pos"),
        lambda data: data["neckRing"].__setitem__("sha256", "0" * 64),
        lambda data: data["neckRing"]["profile"][0]["weights"].pop("mixamorig:Neck"),
        lambda data: data["sockets"].__setitem__("gripR", {}),
        lambda data: data["sockets"]["chest"].pop("normalLocal"),
        lambda data: data["sockets"]["waistBack"].__setitem__("bone", "mixamorig:Head"),
        lambda data: data["sockets"]["waistBack"].__setitem__("pos", data["sockets"]["waistL"]["pos"]),
        lambda data: data["fingerPose"]["fist"].pop(next(iter(data["fingerPose"]["fist"]))),
        lambda data: data["regions"]["ids"].pop("head"),
        lambda data: data["skullProfile"].__setitem__("sha256", "0" * 64),
    ]
    baseline = json.loads((source / "skeleton.json").read_text())
    with tempfile.TemporaryDirectory(prefix="tianshu-a2-check-") as directory:
        out = Path(directory); shutil.copy2(source / "regions.npy", out / "regions.npy")
        shutil.copy2(source / "skull_profile.json", out / "skull_profile.json")
        for mutate in mutations:
            damaged = copy.deepcopy(baseline); mutate(damaged)
            (out / "skeleton.json").write_text(json.dumps(damaged))
            with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
                code = export_main(["--check", "--out", str(out)])
            assert code != 0, "--check 接受了损坏的嵌套字段"


def test_real_normalize_round_trip() -> None:
    source = Path(__file__).resolve().parents[3] / "assets/default/model3d/dressup/templates/tpl_f_medium/body.glb"
    if not source.exists(): return
    with tempfile.TemporaryDirectory(prefix="tianshu-a2-real-") as directory:
        target = Path(directory) / "body.glb"; report = normalize(source, target)
        # 首次处理剥 387 条；已规范化正本重跑必须幂等（剥 0 条）。
        assert report["tracksRemoved"] in ({"scale": 195, "translation": 192, "total": 387},
                                               {"scale": 0, "translation": 0, "total": 0})
        assert report["restBindMaxDiffAfter"] < 1e-5
        assert sum(len(a["channels"]) for a in load_glb(target).json["animations"]) == 198


def main() -> int:
    tests = [test_region_mapping, test_neck_ring_and_ellipse, test_socket_round_trip, test_grip_surface_and_flex_axes,
             test_track_strip_and_yaw, test_region_glb_attribute, test_check_rejects_nested_damage, test_real_normalize_round_trip]
    for test in tests:
        test(); print(f"PASS {test.__name__}")
    print(f"{len(tests)}/{len(tests)} tests passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
