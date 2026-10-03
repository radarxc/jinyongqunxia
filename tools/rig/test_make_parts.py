"""Tests for rig part normalization, metadata and pose-strip preview."""
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import yaml
from PIL import Image, ImageDraw

from tools.item.common import BuildError, sha256_file
from tools.rig.make_parts import BONE_LENGTHS_M, Z_ORDER, build_manifest
from tools.rig.make_placeholder_parts import generate
from tools.rig.preview import SHARED_LIMB_Z, make_strip
from tools.rig import preview
from tools.rig.templates import SOURCE_PARTS, TEMPLATES, VIEWS, PART_TO_TEMPLATE


def synthetic_part(path: Path, part: str) -> None:
    template = TEMPLATES[PART_TO_TEMPLATE[part]]
    image = Image.new("RGBA", (template.size[0] + 24, template.size[1] + 20))
    draw = ImageDraw.Draw(image)
    if part in {"head", "hair_or_headgear"}:
        draw.ellipse((12, 10, image.width - 13, image.height - 11), fill=(90, 70, 55, 255))
    else:
        draw.rounded_rectangle((12, 10, image.width - 13, image.height - 11),
                               radius=6, fill=(62, 91, 105, 255))
    image.save(path)


class RigPartPipelineTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.set_dir = Path(self.temporary.name) / "male_test"
        for view in VIEWS:
            directory = self.set_dir / view
            directory.mkdir(parents=True)
            for part in SOURCE_PARTS:
                synthetic_part(directory / f"{part}.png", part)
        (self.set_dir / "manifest.yaml").write_text(
            yaml.safe_dump({"placeholder": True}, sort_keys=False), encoding="utf-8"
        )

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def test_builds_39_records_and_check_is_deterministic(self) -> None:
        manifest = build_manifest(self.set_dir)
        self.assertEqual(39, len(manifest["parts"]))
        self.assertEqual(256, manifest["ppm"])
        self.assertEqual("L", manifest["nearSide"])
        forearms = [item for item in manifest["parts"] if item["id"].startswith("forearm_")]
        self.assertEqual({-90.0}, {item["restAngle"] for item in forearms})
        torso = next(item for item in manifest["parts"]
                     if item["id"] == "torso" and item["view"] == "front34")
        width, height = torso["size"]
        self.assertTrue(0 <= torso["pivot"][0] < width)
        self.assertTrue(0 <= torso["pivot"][1] < height)
        self.assertEqual({"neck", "shoulder_L", "shoulder_R"}, set(torso["childJoint"]))
        self.assertGreater(torso["childJoint"]["shoulder_L"][0],
                           torso["childJoint"]["shoulder_R"][0])

        before = sha256_file(self.set_dir / "manifest.yaml")
        build_manifest(self.set_dir)
        self.assertEqual(before, sha256_file(self.set_dir / "manifest.yaml"))
        checked = build_manifest(self.set_dir, check=True)
        self.assertEqual(manifest, checked)

    def test_identity_fields_and_canonical_male_bone_lengths(self) -> None:
        identity = Path(self.temporary.name) / "npc_test__ch00_m"
        for view in VIEWS:
            directory = identity / view
            directory.mkdir(parents=True)
            for part in SOURCE_PARTS:
                synthetic_part(directory / f"{part}.png", part)
        (identity / "sheet").mkdir()
        Image.new("RGB", (12, 12), (230, 225, 216)).save(identity / "sheet/sheet_L.png")
        manifest = build_manifest(identity)
        self.assertEqual("identity", manifest["kind"])
        self.assertEqual("npc_test", manifest["identity"]["npcId"])
        self.assertEqual("ch00_m", manifest["identity"]["variant"])
        self.assertEqual("tianshu_humanoid.v1", manifest["skeleton"])
        self.assertEqual({"torso": .52, "head": .24, "upper_arm": .30,
                          "forearm": .26, "hand": .19, "thigh": .44,
                          "shin": .40, "foot": .25}, BONE_LENGTHS_M)
        self.assertEqual(BONE_LENGTHS_M, manifest["boneLengthsM"])
        self.assertEqual(39, len(manifest["assets"]))
        build_manifest(identity, check=True)

    def test_attachment_contract_rejects_invalid_fields(self) -> None:
        layer = self.set_dir / "attachments/hair_back.png"
        layer.parent.mkdir()
        Image.new("RGBA", (16, 24), (40, 30, 25, 255)).save(layer)
        base = {"slot": "hair_back", "parent": "head",
                "view": "back34", "file": "attachments/hair_back.png",
                "pivot": [8, 3], "spring": {"k": 36, "c": 10.8}}
        manifest = build_manifest(self.set_dir)
        for field, value in (("parent", "unknown"), ("view", "front"),
                             ("pivot", [999, 3]), ("spring", {"k": -1})):
            manifest["attachments"] = [{**base, field: value}]
            (self.set_dir / "manifest.yaml").write_text(
                yaml.safe_dump(manifest, sort_keys=False), encoding="utf-8"
            )
            with self.subTest(field=field), self.assertRaises(BuildError):
                build_manifest(self.set_dir, check=True)

    def test_sidecar_joint_outside_alpha_is_kept_inside_normalized_canvas(self) -> None:
        source = self.set_dir / "front34/hair_or_headgear.png"
        image = Image.new("RGBA", (100, 120))
        ImageDraw.Draw(image).ellipse((20, 12, 80, 82), fill=(45, 35, 30, 255))
        image.save(source)
        (self.set_dir / "front34/hair_or_headgear.pivots.yaml").write_text(
            yaml.safe_dump({"coordinates": "source", "keypoints": {
                "neck": [50, 102], "crown": [50, 12]}}, sort_keys=False),
            encoding="utf-8")
        manifest = build_manifest(self.set_dir)
        record = next(item for item in manifest["parts"]
                      if item["view"] == "front34" and
                      item["id"] == "hair_or_headgear")
        self.assertTrue(0 <= record["pivot"][1] < record["size"][1])
        self.assertTrue(0 <= record["childJoint"]["crown"][1] < record["size"][1])
        build_manifest(self.set_dir, check=True)

    def test_failed_build_does_not_partially_rewrite_images(self) -> None:
        target = self.set_dir / "front34/head.png"
        before = target.read_bytes()
        bad = self.set_dir / "side/foot_shared.pivots.yaml"
        bad.write_text(yaml.safe_dump({"coordinates": "source", "keypoints": {
            "ankle_L": [20, 10], "toe_L": [9999, 10]}}, sort_keys=False),
            encoding="utf-8")
        with self.assertRaisesRegex(BuildError, "outside (source )?image"):
            build_manifest(self.set_dir)
        self.assertEqual(before, target.read_bytes())

    def test_prefers_view_keypoint_sidecar_and_records_provenance(self) -> None:
        sidecar = self.set_dir / "front34/torso.keypoints.yaml"
        sidecar.write_text(yaml.safe_dump({"coordinates": "normalized", "keypoints": {
            "pelvis": [60, 130], "neck": [60, 20],
            "shoulder_L": [102, 34], "shoulder_R": [28, 34],
        }}, sort_keys=False), encoding="utf-8")
        manifest = build_manifest(self.set_dir)
        torso = next(item for item in manifest["parts"]
                     if item["id"] == "torso" and item["view"] == "front34")
        self.assertEqual([60, 130], torso["pivot"])
        self.assertEqual([102, 34], torso["childJoint"]["shoulder_L"])
        self.assertEqual("front34/torso.keypoints.yaml", torso["jointSource"])
        build_manifest(self.set_dir, check=True)

    def test_all_views_put_anatomical_left_arm_in_front(self) -> None:
        manifest = build_manifest(self.set_dir)
        for view in VIEWS:
            records = {item["id"]: item for item in manifest["parts"] if item["view"] == view}
            for segment in ("upper_arm", "forearm", "hand"):
                self.assertGreater(records[f"{segment}_L"]["zOrder"],
                                   records[f"{segment}_R"]["zOrder"])
                self.assertGreater(Z_ORDER[view][f"{segment}_L"],
                                   Z_ORDER[view][f"{segment}_R"])
        for view in VIEWS:
            for segment in ("thigh", "shin", "foot"):
                self.assertGreater(SHARED_LIMB_Z[view][segment]["L"],
                                   SHARED_LIMB_Z[view][segment]["R"])

    def test_fallback_joints_follow_each_view_projection(self) -> None:
        records = build_manifest(self.set_dir)["parts"]
        by_view = {view: {item["id"]: item for item in records
                          if item["view"] == view} for view in VIEWS}
        expected_sign = {"front34": 1, "back34": -1, "side": 0}
        for view, sign in expected_sign.items():
            torso = by_view[view]["torso"]["childJoint"]
            pelvis = by_view[view]["pelvis_skirt"]["childJoint"]
            shoulder_delta = torso["shoulder_L"][0] - torso["shoulder_R"][0]
            hip_delta = pelvis["hip_L"][0] - pelvis["hip_R"][0]
            self.assertEqual(sign, (shoulder_delta > 0) - (shoulder_delta < 0))
            self.assertEqual(sign, (hip_delta > 0) - (hip_delta < 0))

    def test_formal_set_without_sidecars_uses_view_fallbacks(self) -> None:
        manifest = build_manifest(self.set_dir, placeholder=False)
        self.assertNotIn("placeholder", manifest)
        self.assertEqual(39, len(manifest["parts"]))
        records = {view: {item["id"]: item for item in manifest["parts"]
                          if item["view"] == view} for view in VIEWS}
        expected_sign = {"front34": 1, "back34": -1, "side": 0}
        for view, sign in expected_sign.items():
            torso = records[view]["torso"]["childJoint"]
            pelvis = records[view]["pelvis_skirt"]["childJoint"]
            shoulder_delta = torso["shoulder_L"][0] - torso["shoulder_R"][0]
            hip_delta = pelvis["hip_L"][0] - pelvis["hip_R"][0]
            self.assertEqual(sign, (shoulder_delta > 0) - (shoulder_delta < 0))
            self.assertEqual(sign, (hip_delta > 0) - (hip_delta < 0))
        self.assertTrue(all("jointSource" not in item for item in manifest["parts"]))
        build_manifest(self.set_dir, check=True, placeholder=False)

    def test_part_pivot_sidecar_accepts_source_coordinates(self) -> None:
        source = self.set_dir / "side/upper_arm_L.png"
        sidecar = self.set_dir / "side/upper_arm_L.pivots.yaml"
        sidecar.write_text(yaml.safe_dump({"keypoints": {
            "shoulder_L": [40, 20], "elbow_L": [40, 90],
        }}, sort_keys=False), encoding="utf-8")
        manifest = build_manifest(self.set_dir)
        record = next(item for item in manifest["parts"]
                      if item["view"] == "side" and item["id"] == "upper_arm_L")
        # synthetic_part 的 alpha 左上为 (12, 10)，规范化补边 4，因此新原点为 (8, 6)。
        self.assertEqual([32, 14], record["pivot"])
        self.assertEqual([32, 84], record["childJoint"]["elbow_L"])
        self.assertEqual("side/upper_arm_L.pivots.yaml", record["jointSource"])
        self.assertTrue(source.is_file())

    def test_view_keypoints_drive_every_part_from_source_coordinates(self) -> None:
        sidecar = self.set_dir / "back34/keypoints.yaml"
        sidecar.write_text(yaml.safe_dump({"coordinates": "source", "keypoints": {
            "neck": [40, 20], "crown": [40, 12], "pelvis": [40, 80],
            "shoulder_L": [55, 30], "shoulder_R": [25, 30],
            "elbow_L": [40, 70], "elbow_R": [40, 70],
            "wrist_L": [40, 65], "wrist_R": [40, 65],
            "grip_L": [40, 45], "grip_R": [40, 45], "hem": [40, 80],
            "hip_L": [50, 20], "hip_R": [30, 20], "knee_L": [40, 90],
            "ankle_L": [40, 80], "toe_L": [60, 50],
        }}, sort_keys=False), encoding="utf-8")
        manifest = build_manifest(self.set_dir)
        records = [item for item in manifest["parts"] if item["view"] == "back34"]
        self.assertEqual(13, len(records))
        self.assertEqual({"back34/keypoints.yaml"},
                         {item["jointSource"] for item in records})
        by_id = {item["id"]: item for item in records}
        self.assertEqual({"knee"}, set(by_id["thigh_shared"]["childJoint"]))
        self.assertEqual({"ankle"}, set(by_id["shin_shared"]["childJoint"]))
        self.assertEqual({"toe"}, set(by_id["foot_shared"]["childJoint"]))
        build_manifest(self.set_dir, check=True)
        self.assertIsNotNone(make_strip(self.set_dir).getbbox())

    def test_placeholder_generator_marks_non_production_output(self) -> None:
        generated = Path(self.temporary.name) / "female_std"
        generate(generated)
        manifest = yaml.safe_load((generated / "manifest.yaml").read_text(encoding="utf-8"))
        self.assertEqual(39, len(manifest["parts"]))
        self.assertEqual(39, len(list(generated.glob("*/*.png"))))
        self.assertEqual(1.62, manifest["heightM"])
        self.assertEqual("L", manifest["nearSide"])
        self.assertTrue(manifest["placeholder"])
        build_manifest(generated, check=True)

    def test_preview_has_idle_plus_four_phases_in_three_rows(self) -> None:
        build_manifest(self.set_dir)
        strip = make_strip(self.set_dir, motion="walk", weight="heavy")
        self.assertEqual((5 * 256 + 4 * 16, 3 * 320 + 2 * 16), strip.size)
        self.assertIsNotNone(strip.getbbox())
        self.assertEqual(strip.tobytes(),
                         make_strip(self.set_dir, motion="walk", weight="heavy").tobytes())

    def test_preview_composites_equipment_layer(self) -> None:
        build_manifest(self.set_dir)
        layer = Image.new("RGBA", (18, 36), (245, 20, 30, 255))
        record = {"slot": "weapon_R", "pivot": [9, 30], "zOrder": 15.25}
        with patch.object(preview, "load_equipment", return_value=[(record, layer)]) as loader:
            equipped = make_strip(self.set_dir, equipment=["eq_testjian"])
        plain = make_strip(self.set_dir)

        self.assertNotEqual(plain.tobytes(), equipped.tobytes())
        self.assertEqual(3, loader.call_count)
        loader.assert_any_call(["eq_testjian"], "front34")

    def test_missing_source_part_is_rejected(self) -> None:
        (self.set_dir / "side/foot_shared.png").unlink()
        with self.assertRaisesRegex(BuildError, "parts mismatch"):
            build_manifest(self.set_dir)

    def test_check_detects_pixel_mutation(self) -> None:
        build_manifest(self.set_dir)
        target = self.set_dir / "front34/head.png"
        with Image.open(target) as opened:
            image = opened.copy()
        image.putpixel((0, 0), (255, 0, 0, 255))
        image.save(target)
        with self.assertRaisesRegex(BuildError, "not normalized"):
            build_manifest(self.set_dir, check=True)

    def test_rejects_non_v1_forearm_rest_angle(self) -> None:
        manifest = build_manifest(self.set_dir)
        record = next(item for item in manifest["parts"]
                      if item["view"] == "front34" and item["id"] == "forearm_L")
        record["restAngle"] = 0.0
        (self.set_dir / "manifest.yaml").write_text(
            yaml.safe_dump(manifest, sort_keys=False), encoding="utf-8"
        )
        with self.assertRaisesRegex(BuildError, "must be -90.0"):
            build_manifest(self.set_dir, check=True)


if __name__ == "__main__":
    unittest.main()
