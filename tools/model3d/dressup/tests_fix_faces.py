#!/usr/bin/env python3
"""倒置面修复的合成几何与 CLI 回归；不读取或写入真实素材。"""

from __future__ import annotations

import copy
import io
import json
from pathlib import Path
import struct
import subprocess
import sys
import tempfile
from contextlib import redirect_stdout

try:
    from .fix_inverted_faces import fix_faces, main
    from .glb_io import GLBBuilder, load_glb
except ImportError:
    from fix_inverted_faces import fix_faces, main
    from glb_io import GLBBuilder, load_glb

import numpy as np
import unittest


def _fixture(shape: str = "tetra", dtype: str = "<u2", *, multi: bool = False,
             interleaved: bool = False, index_stride: bool = False,
             shared: bool = False, transform: np.ndarray | None = None) -> GLBBuilder:
    if shape == "tetra":
        points = np.array([[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], dtype=float)
        triangles = np.array([[0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2]])
    else:
        points = np.array([[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
                           [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], dtype=float)
        triangles = np.array([[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7],
                              [0, 1, 5], [0, 5, 4], [3, 7, 6], [3, 6, 2],
                              [0, 4, 7], [0, 7, 3], [1, 2, 6], [1, 6, 5]])
    if transform is not None:
        points = points @ transform.T
    normals = points / np.linalg.norm(points, axis=1)[:, None]
    coords = points[triangles]
    inward = np.einsum("ij,ij->i", np.cross(coords[:, 1] - coords[:, 0], coords[:, 2] - coords[:, 0]),
                      coords.mean(axis=1)) < 0
    triangles[inward] = triangles[inward][:, [0, 2, 1]]
    uv = np.arange(len(points) * 2, dtype=np.float32).reshape(-1, 2) / (len(points) * 2)
    builder = GLBBuilder()
    attrs = {"POSITION": builder.add_accessor(points.astype("<f4")),
             "NORMAL": builder.add_accessor(normals.astype("<f4")),
             "TEXCOORD_0": builder.add_accessor(uv),
             "JOINTS_0": builder.add_accessor(np.zeros((len(points), 4), dtype="<u2")),
             "WEIGHTS_0": builder.add_accessor(np.tile([1., 0., 0., 0.], (len(points), 1)).astype("<f4"))}
    if interleaved:
        packed = np.column_stack([points, normals, uv]).astype("<f4").tobytes()
        view = builder._append_bytes(b"pad!" + packed, byte_stride=32)
        for name, offset in (("POSITION", 4), ("NORMAL", 16), ("TEXCOORD_0", 28)):
            builder.document["accessors"][attrs[name]].update(bufferView=view, byteOffset=offset)
    groups = np.array_split(triangles, 2) if multi else [triangles]
    primitives = []
    for group in groups:
        values = group.flatten().astype(dtype)
        index = builder.add_accessor(values)
        if index_stride:
            payload = b"pad!" + b"".join(value.tobytes() + b"s" * (8 - values.itemsize) for value in values)
            view = builder._append_bytes(payload, byte_stride=8)
            builder.document["accessors"][index].update(bufferView=view, byteOffset=4)
        primitives.append({"attributes": attrs.copy(), "indices": index})
    if shared:
        primitives.append(copy.deepcopy(primitives[0]))
    builder.document["meshes"] = [{"primitives": primitives}]
    builder.add_scene([builder.add_node(mesh=0)])
    return builder


def _flip(builder: GLBBuilder, primitive: int, faces: list[int]) -> None:
    index = builder.document["meshes"][0]["primitives"][primitive]["indices"]
    spec = builder.document["accessors"][index]
    view = builder.document["bufferViews"][spec["bufferView"]]
    width = {5121: 1, 5123: 2, 5125: 4}[spec["componentType"]]
    stride = view.get("byteStride", width)
    start = view.get("byteOffset", 0) + spec.get("byteOffset", 0)
    for face in faces:
        left = start + (3 * face + 1) * stride
        right = left + stride
        a, b = builder.binary[left:left + width], builder.binary[right:right + width]
        builder.binary[left:left + width], builder.binary[right:right + width] = b, a


class FixFacesTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(prefix="tianshu-faces-test-")
        self.addCleanup(self.temp.cleanup)
        self.body = Path(self.temp.name) / "synthetic.glb"
        self.out = Path(self.temp.name) / "fixed.glb"

    def test_tetra_and_cube_each_face_all_index_widths(self) -> None:
        for shape, count in (("tetra", 4), ("cube", 12)):
            for dtype in ("<u1", "<u2", "<u4"):
                for face in range(count):
                    with self.subTest(shape=shape, dtype=dtype, face=face):
                        builder = _fixture(shape, dtype)
                        clean = builder.to_bytes()
                        _flip(builder, 0, [face]); builder.write(self.body)
                        report = fix_faces(self.body, self.out)
                        self.assertEqual(report["faceIndices"], [face])
                        self.assertEqual(report["fixedFaces"], 1)
                        self.assertEqual(self.out.read_bytes(), clean)

    def test_all_tetra_flip_subsets_under_affine_transforms(self) -> None:
        transforms = [np.eye(3), np.diag([0.1, 2., 3.]),
                      np.array([[-1., .3, 0.], [0., 1.2, .4], [0., 0., 2.]])]
        for transform in transforms:
            for mask in range(16):
                builder = _fixture(transform=transform)
                clean = builder.to_bytes()
                faces = [i for i in range(4) if mask & (1 << i)]
                _flip(builder, 0, faces); builder.write(self.body)
                report = fix_faces(self.body, self.out)
                self.assertEqual(report["fixedFaces"], len(faces))
                self.assertEqual(self.out.read_bytes(), clean)

    def test_interleaved_multiple_primitives_and_bytes(self) -> None:
        builder = _fixture("cube", multi=True, interleaved=True, index_stride=True)
        clean = builder.to_bytes()
        _flip(builder, 0, [2]); _flip(builder, 1, [4]); builder.write(self.body)
        before = load_glb(self.body)
        result = fix_faces(self.body, self.out)
        after = load_glb(self.out)
        self.assertEqual(result["faceIndices"], [2, 10])
        self.assertEqual([(v["primitive"], v["triangle"]) for v in result["faces"]], [(0, 2), (1, 4)])
        self.assertEqual(result["centerY"]["count"], 2)
        self.assertEqual(sum(v["count"] for v in result["centerY"]["bins"]), 2)
        for index in range(5):
            self.assertEqual(before.accessor_bytes(index), after.accessor_bytes(index))
        self.assertEqual(self.out.read_bytes(), clean)

    def test_shared_indices_repaired_once(self) -> None:
        builder = _fixture(shared=True)
        clean = builder.to_bytes()
        _flip(builder, 0, [1]); builder.write(self.body)
        result = fix_faces(self.body, self.out)
        self.assertEqual(result["invertedFaces"], 2)
        self.assertEqual(result["uniqueInvertedFaces"], 1)
        self.assertEqual(self.out.read_bytes(), clean)

    def test_in_place_idempotent_and_unknown_chunk(self) -> None:
        builder = _fixture(); _flip(builder, 0, [3])
        raw = bytearray(builder.to_bytes() + struct.pack("<II", 4, 1234) + b"keep")
        struct.pack_into("<I", raw, 8, len(raw)); self.body.write_bytes(raw)
        fix_faces(self.body, self.body)
        fixed = self.body.read_bytes()
        mtime = self.body.stat().st_mtime_ns
        result = fix_faces(self.body, self.body)
        self.assertEqual(result["fixedFaces"], 0)
        self.assertEqual(result["inputSha256"], result["outputSha256"])
        self.assertEqual(self.body.read_bytes(), fixed)
        self.assertEqual(self.body.stat().st_mtime_ns, mtime)
        self.assertEqual(fixed[-4:], b"keep")

    def test_cli_check_exit_codes_and_no_writes(self) -> None:
        builder = _fixture(); _flip(builder, 0, [0]); builder.write(self.body)
        raw = self.body.read_bytes()
        cli = [sys.executable, str(Path(__file__).with_name("fix_inverted_faces.py")),
               "--body", str(self.body), "--out", str(self.out), "--check", "--json"]
        result = subprocess.run(cli, capture_output=True, text=True, check=False)
        self.assertEqual(result.returncode, 1, result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report["fixedFaces"], 0)
        self.assertEqual(report["invertedFaces"], 1)
        self.assertFalse(self.out.exists())
        self.assertEqual(self.body.read_bytes(), raw)
        self.assertEqual(report["inputSha256"], report["outputSha256"])
        fix_faces(self.body, self.body)
        with redirect_stdout(io.StringIO()) as output:
            code = main(["--body", str(self.body), "--check", "--json"])
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(output.getvalue())["invertedFaces"], 0)

    def test_zero_area_and_zero_dot_unchanged(self) -> None:
        builder = _fixture()
        primitive = builder.document["meshes"][0]["primitives"][0]
        primitive["indices"] = builder.add_accessor(np.array([0, 0, 1], dtype="<u2"))
        builder.write(self.body)
        self.assertEqual(fix_faces(self.body, self.out)["fixedFaces"], 0)
        self.assertEqual(self.body.read_bytes(), self.out.read_bytes())
        primitive["attributes"]["NORMAL"] = builder.add_accessor(np.zeros((4, 3), dtype="<f4"))
        primitive["indices"] = builder.add_accessor(np.array([0, 1, 2], dtype="<u2"))
        builder.write(self.body)
        self.assertEqual(fix_faces(self.body, self.out)["fixedFaces"], 0)

    def test_invalid_inputs_fail_without_output(self) -> None:
        for kind in ("missing-normal", "no-indices", "lines", "compressed", "sparse", "out-of-range"):
            with self.subTest(kind=kind):
                builder = _fixture()
                primitive = builder.document["meshes"][0]["primitives"][0]
                if kind == "missing-normal": del primitive["attributes"]["NORMAL"]
                if kind == "no-indices": del primitive["indices"]
                if kind == "lines": primitive["mode"] = 1
                if kind == "compressed": builder.document["extensionsUsed"] = ["EXT_meshopt_compression"]
                if kind == "sparse": builder.document["accessors"][primitive["indices"]]["sparse"] = {}
                if kind == "out-of-range":
                    primitive["indices"] = builder.add_accessor(np.array([0, 1, 99], dtype="<u2"))
                builder.write(self.body)
                with redirect_stdout(io.StringIO()) as output:
                    code = main(["--body", str(self.body), "--out", str(self.out), "--json"])
                self.assertEqual(code, 2)
                self.assertFalse(json.loads(output.getvalue())["ok"])
                self.assertFalse(self.out.exists())

    def test_aliased_non_index_accessor_rejected(self) -> None:
        builder = _fixture(); _flip(builder, 0, [0])
        index = builder.document["meshes"][0]["primitives"][0]["indices"]
        builder.document["accessors"].append(copy.deepcopy(builder.document["accessors"][index]))
        builder.write(self.body)
        with self.assertRaisesRegex(ValueError, "非索引 accessor"):
            fix_faces(self.body, self.out)
        self.assertFalse(self.out.exists())

    def test_face_list_truncated_but_distribution_complete(self) -> None:
        builder = _fixture()
        primitives = builder.document["meshes"][0]["primitives"]
        primitives.extend(copy.deepcopy(primitives[0]) for _ in range(59))
        _flip(builder, 0, [0]); builder.write(self.body)
        report = fix_faces(self.body, self.out)
        self.assertEqual(report["invertedFaces"], 60)
        self.assertEqual(len(report["faceIndices"]), 50)
        self.assertEqual(report["centerY"]["count"], 60)

    def test_index_accessor_also_used_as_attribute_rejected(self) -> None:
        builder = _fixture(); _flip(builder, 0, [0])
        primitive = builder.document["meshes"][0]["primitives"][0]
        primitive["attributes"]["_CUSTOM"] = primitive["indices"]
        builder.write(self.body)
        with self.assertRaisesRegex(ValueError, "非索引 accessor"):
            fix_faces(self.body, self.out)
        self.assertFalse(self.out.exists())

    def test_conflicting_shared_indices_rejected(self) -> None:
        builder = _fixture(shared=True); builder.write(self.body)
        primitive = builder.document["meshes"][0]["primitives"][1]
        normals = load_glb(self.body).accessor(primitive["attributes"]["NORMAL"])
        primitive["attributes"]["NORMAL"] = builder.add_accessor(-normals)
        builder.write(self.body)
        with self.assertRaisesRegex(ValueError, "法线方向冲突"):
            fix_faces(self.body, self.out)
        self.assertFalse(self.out.exists())


if __name__ == "__main__":
    unittest.main(verbosity=2)
