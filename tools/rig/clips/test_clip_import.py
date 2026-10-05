from __future__ import annotations

import base64
import json
import struct
import tempfile
import unittest
from unittest import mock
from pathlib import Path

import jsonschema

from tools.rig.clips.clip_import import (BONE_DEFS, GltfDocument, RIGIFY53_MAPPING, Skeleton,
                                         bake_clip, canonical_json,
                                         quantize_unit, round_half_away)
from tools.rig.clips.clip_metrics import analyze_clip, render_strip, unpack_i16

ROOT = Path(__file__).resolve().parents[3]
SCHEMA = ROOT / "assets/default/rig/clips/clip.schema.json"


def synthetic_glb(path: Path) -> None:
    names = {
        "root": None, "pelvis": "root", "spine_03": "pelvis",
        "neck_01": "spine_03", "head": "neck_01",
        "upperarm_l": "neck_01", "lowerarm_l": "upperarm_l",
        "hand_l": "lowerarm_l", "middle_01_l": "hand_l",
        "upperarm_r": "neck_01", "lowerarm_r": "upperarm_r",
        "hand_r": "lowerarm_r", "middle_01_r": "hand_r",
        "thigh_l": "pelvis", "calf_l": "thigh_l",
        "foot_l": "calf_l", "ball_l": "foot_l",
        "thigh_r": "pelvis", "calf_r": "thigh_r",
        "foot_r": "calf_r", "ball_r": "foot_r",
    }
    translation = {
        "pelvis": (0, 1, 0), "spine_03": (0, .4, 0), "neck_01": (0, .2, 0),
        "head": (0, .2, 0), "upperarm_l": (.2, 0, 0), "lowerarm_l": (.3, 0, 0),
        "hand_l": (.3, 0, 0), "middle_01_l": (.1, 0, 0),
        "upperarm_r": (-.2, 0, 0), "lowerarm_r": (-.3, 0, 0),
        "hand_r": (-.3, 0, 0), "middle_01_r": (-.1, 0, 0),
        "thigh_l": (.1, 0, 0), "calf_l": (0, -.4, 0), "foot_l": (0, -.4, 0),
        "ball_l": (0, -.1, .2), "thigh_r": (-.1, 0, 0),
        "calf_r": (0, -.4, 0), "foot_r": (0, -.4, 0), "ball_r": (0, -.1, .2),
    }
    order = list(names); index = {name: i for i, name in enumerate(order)}
    nodes = [{"name": name, "translation": list(translation.get(name, (0, 0, 0)))} for name in order]
    for child, parent in names.items():
        if parent is not None:
            nodes[index[parent]].setdefault("children", []).append(index[child])
    times = struct.pack("<2f", 0.0, 1.0)
    values = struct.pack("<6f", 0, 1, 0, 0.1, 1, 0.2)
    binary = times + values
    doc = {"asset": {"version": "2.0"}, "nodes": nodes,
           "buffers": [{"byteLength": len(binary)}],
           "bufferViews": [{"buffer": 0, "byteOffset": 0, "byteLength": len(times)},
                           {"buffer": 0, "byteOffset": len(times), "byteLength": len(values)}],
           "accessors": [{"bufferView": 0, "componentType": 5126, "count": 2,
                          "type": "SCALAR", "min": [0], "max": [1]},
                         {"bufferView": 1, "componentType": 5126, "count": 2, "type": "VEC3"}],
           "animations": [{"name": "Test", "samplers": [{"input": 0, "output": 1}],
                           "channels": [{"sampler": 0,
                                         "target": {"node": index["pelvis"], "path": "translation"}}]}]}
    encoded = json.dumps(doc, separators=(",", ":")).encode(); encoded += b" " * (-len(encoded) % 4)
    binary += b"\0" * (-len(binary) % 4)
    total = 12 + 8 + len(encoded) + 8 + len(binary)
    path.write_bytes(struct.pack("<4sII", b"glTF", 2, total) +
                     struct.pack("<I4s", len(encoded), b"JSON") + encoded +
                     struct.pack("<I4s", len(binary), b"BIN\0") + binary)


class ClipImportTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.source = Path(self.temp.name) / "synthetic.glb"
        synthetic_glb(self.source)

    def tearDown(self) -> None:
        self.temp.cleanup()

    def test_glb_parse_and_ue_mapping(self) -> None:
        skeleton = Skeleton(GltfDocument(self.source))
        mapping, missing = skeleton.resolve_mapping("ue66")
        self.assertEqual([], missing)
        self.assertEqual("pelvis", skeleton.names[mapping["pelvis"]])
        self.assertAlmostEqual(1.0, skeleton.duration("Test"))
        points, _, _ = skeleton.sample("Test", 0.5)
        for actual, expected in zip(points[mapping["pelvis"]], (0.05, 1.0, 0.1)):
            self.assertAlmostEqual(expected, actual, places=6)

    def test_rigify53_mapping_table_covers_target_joints(self) -> None:
        skeleton = object.__new__(Skeleton)
        names = [aliases[0] for aliases in RIGIFY53_MAPPING.values()]
        skeleton.names = names
        skeleton.by_name = {name: index for index, name in enumerate(names)}
        mapping, missing = skeleton.resolve_mapping("rigify53")
        self.assertEqual([], missing)
        self.assertEqual(set(RIGIFY53_MAPPING), set(mapping))

    def test_integer_rounding_contract(self) -> None:
        self.assertEqual(1, round_half_away(0.5))
        self.assertEqual(-1, round_half_away(-0.5))
        self.assertEqual(16384, quantize_unit(0.5))
        self.assertEqual(-16384, quantize_unit(-0.5))
        self.assertEqual(32767, quantize_unit(2.0))

    def test_bake_is_byte_deterministic_and_schema_valid(self) -> None:
        kwargs = dict(fps=12, mapping_kind="ue66", source_url="https://example.invalid/synthetic.glb",
                      loop=False, hit_time=0.5, main_hand="R")
        first = bake_clip(self.source, "Test", "clip_test", **kwargs)
        second = bake_clip(self.source, "Test", "clip_test", **kwargs)
        self.assertEqual(canonical_json(first), canonical_json(second))
        jsonschema.Draft202012Validator(json.loads(SCHEMA.read_text())).validate(first)
        self.assertEqual(13, first["frameCount"]); self.assertEqual(16, len(BONE_DEFS))
        self.assertEqual(13 * 16 * 3, len(unpack_i16(first["tracks"]["directionI16"])))
        self.assertEqual([{"frame": 6, "type": "hit"}, {"frame": 12, "type": "end"}], first["events"])

    def test_metrics_are_deterministic_and_clamp_projection(self) -> None:
        clip = bake_clip(self.source, "Test", "clip_test", fps=30, mapping_kind="ue66",
                         source_url="https://example.invalid/synthetic.glb")
        first, _ = analyze_clip(clip); second, _ = analyze_clip(clip)
        self.assertEqual(first, second)
        self.assertTrue(all(row["renderMinLimbScale"] >= 0.45 for row in first["directions"].values()))

    def test_rejects_non_allowlisted_license_and_missing_joint(self) -> None:
        with self.assertRaisesRegex(ValueError, "license not allowlisted"):
            bake_clip(self.source, "Test", "clip_test", mapping_kind="ue66",
                      license_id="proprietary", source_url="https://example.invalid/source.glb")
        with mock.patch.object(Skeleton, "resolve_mapping", return_value=({}, ["neck"])):
            with self.assertRaisesRegex(ValueError, "unmapped required joints: neck"):
                bake_clip(self.source, "Test", "clip_test", mapping_kind="ue66",
                          source_url="https://example.invalid/source.glb")

    def test_metrics_png_is_deterministic(self) -> None:
        clip = bake_clip(self.source, "Test", "clip_test", fps=30, mapping_kind="ue66",
                         source_url="https://example.invalid/source.glb")
        _, frames = analyze_clip(clip)
        first, second = Path(self.temp.name) / "a.png", Path(self.temp.name) / "b.png"
        render_strip(frames, first, frame_index=3); render_strip(frames, second, frame_index=3)
        self.assertEqual(first.read_bytes(), second.read_bytes())


if __name__ == "__main__":
    unittest.main()
