#!/usr/bin/env python3
"""End-to-end tests for town_lod.py and the gait fixture shared with Node tests."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / "dressup")); sys.path.insert(0, str(HERE))
from glb_io import GLBBuilder, Mesh, PrimitiveRange, load_glb  # noqa: E402
import town_lod  # noqa: E402
import yaml  # noqa: E402


def _solid_jpeg() -> bytes:
    from io import BytesIO
    output = BytesIO(); Image.new("RGB", (16, 16), (90, 120, 150)).save(output, "JPEG")
    return output.getvalue()


def make_fixture(path: str | Path, excessive_slip: bool = False) -> None:
    """Write a tiny skin with 2 mu stature and exact 0.5/0.005 support/root HPS."""
    builder = GLBBuilder(generator="town-lod-test-fixture")
    image = builder.add_image(_solid_jpeg(), mime_type="image/jpeg")
    sampler = builder.add_sampler(); texture = builder.add_texture(image, sampler_index=sampler)
    material = builder.add_material(base_color_texture=texture)
    root = builder.add_node(name="Hips", children=[1, 3, 5])
    left = builder.add_node(name="LeftFoot", translation=[-0.2, 0, 0])
    builder.add_node(name="LeftFoot_End", translation=[0, 0.1, 0])
    right = builder.add_node(name="RightFoot", translation=[0.2, 0, 0])
    builder.add_node(name="RightFoot_End", translation=[0, 0.1, 0])
    builder.add_node(name="HeadTop_End", translation=[0, 2, 0])
    positions = np.array([[-.5, 0, 0], [.5, 0, 0], [0, 1, 0],
                          [-.5, 0, .2], [.5, 0, .2], [0, 1, .2]], dtype=np.float32)
    mesh = Mesh(positions, np.array([0, 1, 2, 3, 4, 5], dtype=np.uint16),
                uvs=np.array([[0, 0], [1, 0], [.5, 1]] * 2, dtype=np.float32),
                joints=np.zeros((6, 4), dtype=np.uint16),
                weights=np.array([[1, 0, 0, 0]] * 6, dtype=np.float32),
                primitives=[PrimitiveRange(0, 6, 0, 6, 0)])
    mesh_index = builder.add_mesh(mesh, material_map=[material])
    ibm = builder.add_accessor(np.repeat(np.eye(4, dtype=np.float32)[None], 6, axis=0),
                               component_type=5126, type_name="MAT4")
    skin = builder.add_skin([0, 1, 2, 3, 4, 5], ibm, skeleton=root)
    mesh_node = builder.add_node(name="FixtureMesh", mesh=mesh_index, skin=skin)
    times = [0, .245, .25, .255, .49, .5, .745, .75, .755, 1]
    contact_x = -.1 if excessive_slip else -.2
    builder.add_animation("walk", [
        {"node": left, "path": "translation", "timesSec": times,
         "values": [[-.2, .1, 0], [-.2, .1, -.245], [contact_x, 0, -.245],
                    [-.2, .1, -.245], [-.2, .1, -.49], [-.2, .2, -.5],
                    [-.2, .2, -.255], [-.2, .2, -.25], [-.2, .2, -.245],
                    [-.2, .2, 0]]},
        {"node": right, "path": "translation", "timesSec": times,
         "values": [[.2, .2, -.5], [.2, .2, -.255], [.2, .2, -.25],
                    [.2, .2, -.245], [.2, .2, -.01], [.2, .1, 0],
                    [.2, .1, -.245], [.2, 0, -.245], [.2, .1, -.245],
                    [.2, .1, -.5]]},
    ])
    builder.add_animation("run", [
        {"node": root, "path": "translation", "timesSec": times,
         "values": [[0, 0, .01 * time] for time in times]},
        {"node": left, "path": "translation", "timesSec": times,
         "values": [[-.2, 0, -.01 * time] for time in times]},
        {"node": right, "path": "translation", "timesSec": times,
         "values": [[.2, 0, -.01 * time] for time in times]},
    ])
    builder.add_scene([root, mesh_node], name="Fixture"); builder.write(path)


class TownLodTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory(prefix="tianshu-town-lod-test-")
        self.model = Path(self.temporary.name) / "npc_fixture"; self.model.mkdir()
        make_fixture(self.model / "model_rig.glb")
        shutil.copyfile(self.model / "model_rig.glb", self.model / "anim_idle_walk_run.glb")

    def tearDown(self) -> None: self.temporary.cleanup()

    @staticmethod
    def _hash(path: Path) -> str: return hashlib.sha256(path.read_bytes()).hexdigest()

    def _build(self) -> dict:
        saved = town_lod.MAX_SLIP_M; town_lod.MAX_SLIP_M = 0.02
        try: return town_lod.build(self.model)
        finally: town_lod.MAX_SLIP_M = saved

    def test_full_pipeline_preserves_skin_and_writes_complete_metadata(self) -> None:
        result = self._build(); metadata = json.loads((self.model / "town/town.json").read_text())
        self.assertEqual(metadata["statureMu"], 2.0)
        self.assertAlmostEqual(metadata["nativeHps"]["walk"], .5, delta=.01)
        self.assertAlmostEqual(metadata["nativeHps"]["run"], .005, delta=.0001)
        self.assertAlmostEqual(metadata["slipM"]["walk"], .0135, delta=.001)
        self.assertLessEqual(metadata["slipM"]["run"], 1e-6)
        self.assertEqual(set(metadata), {"lod", "statureMu", "nativeHps", "slipM",
                                         "source", "tool"})
        self.assertEqual([row["file"] for row in metadata["lod"]], ["lod0.glb", "lod1.glb"])
        self.assertEqual(metadata["tool"], {"version": town_lod.VERSION})
        self.assertEqual(metadata["source"]["file"], "../model_rig.glb")
        self.assertEqual(metadata["source"]["sha256"], self._hash(self.model / "model_rig.glb"))
        source = load_glb(self.model / "model_rig.glb"); source_names = town_lod._joint_names(source)
        for row, (cap, texture_cap) in zip(metadata["lod"], ((25_000, 1024), (9_000, 512)), strict=True):
            lod = load_glb(self.model / "town" / row["file"]); mesh = lod.mesh()
            self.assertEqual(set(row), {"file", "triangles", "textureSize", "bytes"})
            self.assertLessEqual(len(mesh.indices) // 3, cap)
            self.assertLessEqual(row["textureSize"], texture_cap)
            self.assertEqual(row["bytes"], (self.model / "town" / row["file"]).stat().st_size)
            if row["file"] == "lod0.glb":
                self.assertLessEqual(row["bytes"], town_lod.MAX_LOD0_BYTES)
            self.assertEqual(town_lod._joint_names(lod), source_names)
            self.assertLessEqual(float(abs(mesh.weights.sum(axis=1) - 1).max()), 1e-3)
            measured = town_lod._measure(self.model / "town" / row["file"],
                                         self.model / "anim_idle_walk_run.glb")
            self.assertLessEqual(abs(measured["statureMu"] - metadata["statureMu"]) /
                                 metadata["statureMu"], .01)
            for material in lod.json.get("materials", []):
                self.assertLessEqual(set(material.get("pbrMetallicRoughness", {})),
                                     {"baseColorFactor", "baseColorTexture"})
                self.assertTrue(all(key not in material for key in
                                    ("normalTexture", "occlusionTexture", "emissiveTexture")))
            sizes = []
            for index in range(len(lod.json.get("images", []))):
                from io import BytesIO
                with Image.open(BytesIO(lod.image(index).data)) as image: sizes.append(image.size)
            self.assertTrue(sizes); self.assertTrue(all(max(size) <= texture_cap for size in sizes))
        self.assertEqual(result["lod"], metadata["lod"])
        entries = yaml.safe_load((self.model / "town/manifest.yaml").read_text())
        for entry in entries:
            self.assertFalse(set(town_lod.MANIFEST_FIELDS) - set(entry))
            self.assertIsInstance(entry["references"], list)
            self.assertEqual(entry["references"][0]["sha256"], metadata["source"]["sha256"])
            self.assertEqual(entry["size"], f"{(self.model / 'town' / entry['file']).stat().st_size} bytes")
            self.assertTrue(entry["source_path"]); self.assertEqual(entry["status"], "candidate")

    def test_same_input_produces_identical_glbs_and_json(self) -> None:
        self._build(); first = {name: self._hash(self.model / "town" / name)
            for name in ("lod0.glb", "lod1.glb", "town.json", "manifest.yaml")}
        self._build(); second = {name: self._hash(self.model / "town" / name)
            for name in first}
        self.assertEqual(first, second)

    def test_excessive_support_slip_fails_build_and_cli_without_publishing(self) -> None:
        make_fixture(self.model / "model_rig.glb", excessive_slip=True)
        shutil.copyfile(self.model / "model_rig.glb", self.model / "anim_idle_walk_run.glb")
        with self.assertRaisesRegex(ValueError, "支撑滑移.*超过"):
            town_lod.build(self.model)
        self.assertFalse((self.model / "town").exists())
        result = subprocess.run([sys.executable, str(HERE / "town_lod.py"), str(self.model)],
                                capture_output=True, text=True, check=False)
        self.assertNotEqual(result.returncode, 0); self.assertIn("支撑滑移", result.stderr)
        self.assertFalse((self.model / "town").exists())

    def test_manifest_semantics_rejects_missing_field(self) -> None:
        self._build(); path = self.model / "town/manifest.yaml"
        entries = yaml.safe_load(path.read_text()); del entries[0]["prompt"]
        path.write_text(yaml.safe_dump(entries), encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "缺字段 prompt"): town_lod._validate_manifest(path)


if __name__ == "__main__": unittest.main()
