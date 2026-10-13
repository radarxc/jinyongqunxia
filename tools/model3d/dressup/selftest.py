#!/usr/bin/env python3
"""3D 换装离线基础库自测；不访问网络、不依赖测试框架。

覆盖 GLB 写读回环、蒙皮、几何最近点、相似变换、带符号距离与平滑。
成功退出 0；任一断言失败退出 1。
"""

from __future__ import annotations

import os
from pathlib import Path
import sys

# 同目录 inspect.py 会遮蔽标准库；NumPy 导入前先缓存标准库 inspect。
_SCRIPT_DIR = Path(__file__).resolve().parent
_removed_paths = [(index, value) for index, value in enumerate(sys.path)
                  if Path(value or os.getcwd()).resolve() == _SCRIPT_DIR]
sys.path[:] = [value for value in sys.path if Path(value or os.getcwd()).resolve() != _SCRIPT_DIR]
import inspect as _stdlib_inspect  # noqa: F401,E402
for index, value in _removed_paths:
    sys.path.insert(min(index, len(sys.path)), value)

import argparse
import json
import subprocess
import tempfile
from typing import Callable, Sequence

import numpy as np

try:
    from .common import (adjacency_list, closest_point_on_triangle, compose_matrix, connected_components,
                         decompose_matrix, edge_statistics, laplacian_smooth, lbs, matrix_to_quaternion,
                         nearest_triangle, pca, quaternion_to_matrix, signed_distance, umeyama)
    from .glb_io import GLB, GLBBuilder, ImageData, Mesh, PrimitiveRange, load_glb, write_skinned_glb
except ImportError:
    from common import (adjacency_list, closest_point_on_triangle, compose_matrix, connected_components,
                        decompose_matrix, edge_statistics, laplacian_smooth, lbs, matrix_to_quaternion,
                        nearest_triangle, pca, quaternion_to_matrix, signed_distance, umeyama)
    from glb_io import GLB, GLBBuilder, ImageData, Mesh, PrimitiveRange, load_glb, write_skinned_glb


def _assert_close(actual: np.ndarray | float, expected: np.ndarray | float, tolerance: float = 1e-6) -> None:
    if not np.allclose(actual, expected, atol=tolerance, rtol=tolerance):
        raise AssertionError(f"数值不符：actual={actual!r}, expected={expected!r}")


def _cube() -> tuple[np.ndarray, np.ndarray]:
    vertices = np.array([[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
                         [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], dtype=np.float32) * 0.1
    faces = np.array([[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4],
                      [3, 7, 6], [3, 6, 2], [0, 4, 7], [0, 7, 3], [1, 2, 6], [1, 6, 5]], dtype=np.uint16)
    return vertices, faces


def test_glb_round_trip(temp_dir: Path) -> None:
    """立方体 + 两骨 + 两帧动画写读逐字段对拍，并验证模板 skin 复制。"""
    positions, faces = _cube(); normals = positions / np.linalg.norm(positions, axis=1, keepdims=True)
    uvs = np.array([[0, 0], [1, 0], [1, 1], [0, 1]] * 2, dtype=np.float32)
    joints = np.zeros((8, 4), dtype=np.uint16); joints[4:, 0] = 1
    weights = np.zeros((8, 4), dtype=np.float32); weights[:, 0] = 1
    regions = np.arange(8, dtype=np.uint8)
    mesh = Mesh(positions, faces.reshape(-1), normals, uvs, joints, weights, regions, np.array([0]),
                [PrimitiveRange(0, 8, 0, 36, 0)], "SyntheticCube")
    builder = GLBBuilder(generator="tianshu selftest")
    image_bytes = b"selftest-image-bytes"
    image = builder.add_image(ImageData(image_bytes, "image/png", "pixel"))
    sampler = builder.add_sampler(); texture = builder.add_texture(image, sampler_index=sampler)
    material = builder.add_material(base_color_texture=texture, unlit=True, double_sided=True, name="SelftestUnlit")
    mesh_index = builder.add_mesh(mesh, material_map=[material])
    bone1 = builder.add_node(name="Bone1", translation=[0, 0.2, 0])
    bone0 = builder.add_node(name="Bone0", children=[bone1])
    ibm = np.stack([np.eye(4), np.linalg.inv(compose_matrix([0, 0.2, 0]))]).astype(np.float32)
    ibm_accessor = builder.add_accessor(ibm, component_type=5126, type_name="MAT4")
    skin_index = builder.add_skin([bone0, bone1], ibm_accessor, skeleton=bone0, name="TwoBoneSkin")
    mesh_node = builder.add_node(name="CubeNode", mesh=mesh_index, skin=skin_index)
    builder.add_scene([bone0, mesh_node], name="SelftestScene")
    builder.add_animation("two_frames", [{"node": bone1, "path": "translation",
                                             "timesSec": [0, 1], "values": [[0, 0.2, 0], [0.1, 0.2, 0]]}])
    path = temp_dir / "roundtrip.glb"; builder.write(path); loaded = load_glb(path)
    actual = loaded.mesh(0); skin = loaded.skin(0)
    for got, want in ((actual.positions, positions), (actual.normals, normals), (actual.uvs, uvs),
                      (actual.indices, faces.reshape(-1)), (actual.joints, joints), (actual.weights, weights),
                      (actual.regions, regions), (skin.inverse_bind_matrices, ibm)):
        _assert_close(got, want)
    assert actual.material_indices.tolist() == [0] and actual.primitives == [PrimitiveRange(0, 8, 0, 36, 0, 0, 0, 4,
                                                                                         ("JOINTS_0", "NORMAL", "POSITION", "TEXCOORD_0", "WEIGHTS_0", "_REGION"))]
    assert [loaded.json["nodes"][index]["name"] for index in skin.joints] == ["Bone0", "Bone1"]
    assert loaded.json["materials"][0]["doubleSided"] and "KHR_materials_unlit" in loaded.json["materials"][0]["extensions"]
    assert loaded.image(0).data == image_bytes and len(loaded.json["animations"][0]["channels"]) == 1
    inspected = subprocess.run(
        [sys.executable, str(_SCRIPT_DIR / "inspect.py"), "--json", str(path)],
        check=True, capture_output=True, text=True)
    image_info = json.loads(inspected.stdout)["images"][0]
    assert image_info["byteLengthBytes"] == len(image_bytes) and "byteLength" not in image_info
    times = loaded.accessor(loaded.json["animations"][0]["samplers"][0]["input"]); _assert_close(times, [0, 1])
    copied = temp_dir / "skin_copy.glb"
    write_skinned_glb(copied, mesh, skin, {"unlit": True, "double_sided": True, "textureImage": 0},
                      [ImageData(image_bytes, "image/png")])
    copied_glb = load_glb(copied); copied_skin = copied_glb.skin(0)
    assert copied_glb.accessor_bytes(copied_skin.inverse_bind_accessor) == loaded.accessor_bytes(skin.inverse_bind_accessor)
    assert "animations" not in copied_glb.json


def test_accessor_stride_normalized() -> None:
    """覆盖 byteStride、四种 normalized 整数与 sparse 明确拒绝。"""
    cases = [(5120, np.int8, [-128, 127], [-1, 1]), (5122, np.int16, [-32768, 32767], [-1, 1]),
             (5121, np.uint8, [0, 255], [0, 1]), (5123, np.uint16, [0, 65535], [0, 1])]
    for component, dtype, raw, expected in cases:
        item = np.dtype(dtype).itemsize; stride = item * 2
        binary = bytearray(stride * 2); binary[0:item] = np.asarray(raw[0], dtype=dtype).tobytes(); binary[stride:stride + item] = np.asarray(raw[1], dtype=dtype).tobytes()
        document = {"accessors": [{"bufferView": 0, "componentType": component, "count": 2, "type": "SCALAR", "normalized": True}],
                    "bufferViews": [{"buffer": 0, "byteOffset": 0, "byteLength": len(binary), "byteStride": stride}]}
        _assert_close(GLB("memory", document, bytes(binary)).accessor(0), expected)
    sparse = GLB("memory", {"accessors": [{"componentType": 5126, "count": 1, "type": "SCALAR", "sparse": {}}]}, b"")
    try: sparse.accessor(0)
    except NotImplementedError: pass
    else: raise AssertionError("sparse accessor 必须明确拒绝")


def test_lbs() -> None:
    """两骨手算：第一点平移 1 mu，第二点由两骨各分担一半。"""
    positions = np.array([[0, 0, 0], [0, 2, 0]], dtype=float)
    joints = np.array([[0, 1], [0, 1]]); weights = np.array([[1, 0], [0.5, 0.5]])
    worlds = np.stack([compose_matrix([1, 0, 0]), compose_matrix([0, 0, 2])]); ibm = np.repeat(np.eye(4)[None], 2, axis=0)
    _assert_close(lbs(positions, joints, weights, worlds, ibm), [[1, 0, 0], [0.5, 2, 1]])


def test_nearest_point() -> None:
    """三角面内投影、边投影及退化三角形解析解对拍。"""
    a, b, c = np.array([0, 0, 0.]), np.array([1, 0, 0.]), np.array([0, 1, 0.])
    points = np.array([[0.25, 0.25, 2], [0.75, 0.75, 0]])
    nearest, bary = closest_point_on_triangle(points, a, b, c)
    _assert_close(nearest, [[0.25, 0.25, 0], [0.5, 0.5, 0]])
    _assert_close(bary, [[0.5, 0.25, 0.25], [0, 0.5, 0.5]])
    result = nearest_triangle(points, np.stack([a, b, c]), np.array([[0, 1, 2]]), k=1)
    _assert_close(result.points, nearest); _assert_close(result.distances_mu, [2, np.sqrt(0.125)])
    degenerate, _ = closest_point_on_triangle(np.array([[1, 1, 0.]]), a, b, b)
    _assert_close(degenerate, [[1, 0, 0]])


def test_umeyama_and_transforms() -> None:
    """已知旋转/尺度/平移恢复、镜像判断、TRS 与 PCA。"""
    source = np.array([[0, 0, 0], [1, 0, 0], [0, 2, 0], [0, 0, 3.]], dtype=float)
    angle = np.radians(37); rotation = np.array([[np.cos(angle), -np.sin(angle), 0], [np.sin(angle), np.cos(angle), 0], [0, 0, 1]])
    target = 1.7 * (source @ rotation.T) + np.array([2, -3, 4])
    result = umeyama(source, target); _assert_close(result.scale, 1.7); _assert_close(result.rotation, rotation); _assert_close(result.translation, [2, -3, 4])
    assert result.residuals.max() < 1e-12 and not result.mirrored
    reflected = target.copy(); reflected[:, 0] *= -1; assert umeyama(source, reflected).mirrored
    quaternion = matrix_to_quaternion(rotation); _assert_close(quaternion_to_matrix(quaternion), rotation)
    matrix = compose_matrix([1, 2, 3], quaternion, [2, 3, 4]); translation, q2, scale = decompose_matrix(matrix)
    _assert_close(translation, [1, 2, 3]); _assert_close(quaternion_to_matrix(q2), rotation); _assert_close(scale, [2, 3, 4])
    center, values, axes = pca(np.array([[-2, 0, 0], [-1, 0, 0], [1, 0, 0], [2, 0, 0.]]))
    _assert_close(center, [0, 0, 0]); assert values[0] > values[1] and abs(axes[0, 0]) == 1


def test_signed_distance_sphere() -> None:
    """八面体球面近似：中心为内负，外点为正。"""
    vertices = np.array([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1.]], dtype=float)
    faces = np.array([[0, 2, 4], [4, 2, 1], [1, 2, 5], [5, 2, 0], [4, 3, 0], [1, 3, 4], [5, 3, 1], [0, 3, 5]])
    normals = vertices.copy(); result = signed_distance(np.array([[0, 0, 0], [2, 0, 0], [0.2, 0, 0.]]), vertices, faces, normals)
    assert result.distances_mu[0] < 0 and result.distances_mu[1] > 0 and result.distances_mu[2] < 0
    _assert_close(result.distances_mu[:2], [-1 / np.sqrt(3), 1], tolerance=1e-6)


def test_topology_and_smoothing() -> None:
    """立方体平滑应向中心收缩，并覆盖邻接、连通块及边统计。"""
    vertices, faces = _cube(); graph = adjacency_list(len(vertices), faces)
    smoothed = laplacian_smooth(vertices, adjacency=graph, iterations=1, lambda_=0.5)
    assert np.linalg.norm(smoothed, axis=1).max() < np.linalg.norm(vertices, axis=1).max()
    _assert_close(smoothed.mean(axis=0), vertices.mean(axis=0))
    volume = lambda points: abs(float(np.einsum("ij,ij->", points[faces[:, 0]], np.cross(points[faces[:, 1]], points[faces[:, 2]])))) / 6
    assert 0 < volume(smoothed) < volume(vertices)
    assert len(connected_components(len(vertices), faces)) == 1
    boundary, nonmanifold = edge_statistics(faces); assert len(boundary) == 0 and len(nonmanifold) == 0


TESTS: list[tuple[str, Callable[..., None]]] = [
    ("accessor_stride_normalized", test_accessor_stride_normalized), ("lbs", test_lbs),
    ("nearest_point", test_nearest_point), ("umeyama_transforms_pca", test_umeyama_and_transforms),
    ("signed_distance_sphere", test_signed_distance_sphere), ("topology_smoothing", test_topology_and_smoothing),
]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="运行 3D 纸娃娃离线基础库自测（坐标单位 mu）")
    parser.add_argument("--json", action="store_true", help="stdout 输出单个 JSON 结果")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    """运行全部断言，成功返回 0，失败返回 1。"""
    args = build_parser().parse_args(argv); passed: list[str] = []
    try:
        with tempfile.TemporaryDirectory(prefix="tianshu-dressup-selftest-") as directory:
            test_glb_round_trip(Path(directory)); passed.append("glb_round_trip_skin_copy_animation")
        for name, test in TESTS: test(); passed.append(name)
    except Exception as exc:  # 自测入口必须给出稳定非零退出码和具体断言。
        result = {"ok": False, "passed": passed, "error": f"{type(exc).__name__}: {exc}"}
        print(json.dumps(result, ensure_ascii=False) if args.json else f"自测失败（已通过 {len(passed)} 项）：{result['error']}", file=sys.stderr); return 1
    result = {"ok": True, "passed": passed, "count": len(passed)}
    print(json.dumps(result, ensure_ascii=False) if args.json else f"自测通过：{len(passed)} 项\n- " + "\n- ".join(passed))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
