"""Deterministic tests for three-view sheet, segmentation and clip preview."""
from __future__ import annotations

import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import numpy as np
import yaml
from PIL import Image, ImageDraw

from tools.rig import keypoints, make_placeholder_parts, preview, sheet_split
from tools.rig.clips.clip_metrics import DIR8, LIMB_BONES, analyze_clip, decode_clip
from tools.rig.segment_parts import (core_joint_caps, enforce_joint_disks,
                                     isolation_mask, joint_caps,
                                     hair_mask, keep_primary_component, repair_region,
                                     segment_view)
from tools.rig.templates import SOURCE_PARTS
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
CLIPS = ROOT / "assets/default/rig/clips"


def identity_skin(rgba: np.ndarray) -> np.ndarray:
    """Broad YCbCr skin mask used by real-asset ownership checks."""
    rgb = rgba[..., :3].astype(np.uint8)
    ycbcr = np.asarray(Image.fromarray(rgb, "RGB").convert("YCbCr"))
    red = rgb[..., 0].astype(int)
    cb, cr = ycbcr[..., 1].astype(int), ycbcr[..., 2].astype(int)
    return ((rgba[..., 3] >= 32) & (red > 70) &
            (cr >= 139) & (cr - cb >= 15))


def normalized_silhouette(alpha: np.ndarray) -> np.ndarray:
    ys, xs = np.nonzero(alpha >= 32)
    cropped = alpha[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    resized = Image.fromarray(cropped).resize((32, 64), Image.Resampling.NEAREST)
    return np.asarray(resized) >= 32


def synthetic_sheet(path: Path) -> None:
    image = Image.new("RGB", (420, 220), (230, 225, 216))
    draw = ImageDraw.Draw(image)
    for cx, shoulder in ((72, 50), (210, 24), (348, 46)):
        ink = (76, 91, 76)
        draw.ellipse((cx - 14, 18, cx + 14, 48), fill=(42, 35, 30))
        draw.rectangle((cx - 5, 43, cx + 5, 56), fill=ink)
        draw.polygon(((cx - shoulder // 2, 50), (cx + shoulder // 2, 50),
                      (cx + 22, 122), (cx - 22, 122)), fill=ink)
        draw.line((cx - shoulder // 2, 52, cx - 42, 126), fill=ink, width=11)
        draw.line((cx + shoulder // 2, 52, cx + 42, 126), fill=ink, width=11)
        draw.line((cx - 13, 116, cx - 17, 200), fill=(145, 132, 108), width=15)
        draw.line((cx + 13, 116, cx + 17, 200), fill=(145, 132, 108), width=15)
        draw.line((cx - 21, 199, cx - 8, 199), fill=(45, 43, 39), width=8)
        draw.line((cx + 9, 199, cx + 22, 199), fill=(45, 43, 39), width=8)
    image.save(path)


def synthetic_view(path: Path, keypoints_path: Path, view: str = "front34") -> None:
    image = Image.new("RGBA", (256, 480))
    draw = ImageDraw.Draw(image)
    points = {
        "crown": (128, 24), "neck": (128, 86), "pelvis": (128, 219),
        "hem": (128, 291), "shoulder_L": (174, 112),
        "shoulder_R": (82, 112), "elbow_L": (195, 187),
        "elbow_R": (61, 187), "wrist_L": (205, 254),
        "wrist_R": (51, 254), "grip_L": (207, 281),
        "grip_R": (49, 281), "hip_L": (146, 219),
        "hip_R": (110, 219), "knee_L": (151, 332),
        "knee_R": (105, 332), "ankle_L": (153, 434),
        "ankle_R": (103, 434), "toe_L": (132, 458),
        "toe_R": (82, 458),
    }
    draw.ellipse((92, 24, 164, 100), fill=(45, 36, 30, 255))
    draw.polygon(((82, 103), (174, 103), (166, 225), (90, 225)),
                 fill=(74, 91, 72, 255))
    draw.polygon(((92, 210), (164, 210), (188, 310), (68, 310)),
                 fill=(73, 88, 70, 255))
    for side in ("L", "R"):
        chain = [points[f"shoulder_{side}"], points[f"elbow_{side}"],
                 points[f"wrist_{side}"], points[f"grip_{side}"]]
        draw.line(chain, fill=(202, 165, 137, 255), width=25, joint="curve")
    draw.line((points["hip_L"], points["knee_L"], points["ankle_L"]),
              fill=(201, 190, 169, 255), width=38, joint="curve")
    draw.line((points["hip_R"], points["knee_R"], points["ankle_R"]),
              fill=(201, 190, 169, 255), width=38, joint="curve")
    draw.line((points["ankle_L"], points["toe_L"]), fill=(52, 49, 42, 255), width=20)
    draw.line((points["ankle_R"], points["toe_R"]), fill=(52, 49, 42, 255), width=20)
    image.save(path)
    payload = {"schema": "tianshu-rig-keypoints.v1", "coordinates": "source",
               "view": view, "facing": "L", "imageSize": [256, 480],
               "keypoints": {name: {"xy": list(xy), "confidence": .8,
                                            "source": "synthetic"}
                              for name, xy in points.items()}}
    keypoints_path.write_text(yaml.safe_dump(payload, sort_keys=False), encoding="utf-8")


class SheetPipelineTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.sheet = self.root / "sheet.png"
        synthetic_sheet(self.sheet)

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def test_split_normalizes_height_and_infers_middle_side(self) -> None:
        out = self.root / "work"
        result = sheet_split.split_sheet(
            self.sheet, out, height_m=0.70, ppm=100, method="color-key"
        )
        self.assertEqual(["front34", "side", "back34"],
                         result["viewOrderBySource"])
        self.assertTrue(result["viewRatioCheck"])
        for view in ("front34", "side", "back34"):
            with Image.open(out / f"{view}.png") as image:
                alpha = np.asarray(image.getchannel("A"))
            ys = np.nonzero(alpha >= 24)[0]
            self.assertEqual(70, int(ys.max() - ys.min() + 1))
            self.assertEqual(460, result["views"][view]["footY"])
        self.assertEqual(result, json.loads((out / "sheet.json").read_text()))

    def test_color_key_only_removes_edge_connected_background(self) -> None:
        image = Image.new("RGB", (30, 30), (230, 225, 216))
        draw = ImageDraw.Draw(image)
        draw.rectangle((5, 5, 24, 24), fill=(30, 40, 50))
        draw.rectangle((12, 12, 17, 17), fill=(230, 225, 216))
        cutout, metadata = sheet_split.color_key(image, tolerance=2, feather=2)
        self.assertEqual(0, cutout.getpixel((0, 0))[3])
        self.assertEqual(255, cutout.getpixel((14, 14))[3])
        self.assertEqual("lab-color-key", metadata["method"])

    def test_birefnet_cache_discovery_includes_rembg_models(self) -> None:
        model = self.root / ".rembg/models/birefnet-general-lite/model.onnx"
        model.parent.mkdir(parents=True)
        model.write_bytes(b"model")
        with patch.object(Path, "home", return_value=self.root):
            self.assertTrue(sheet_split._cached_birefnet())

    def test_keypoints_preserve_anatomical_sides_and_hidden_joint_priors(self) -> None:
        out = self.root / "work"
        sheet_split.split_sheet(self.sheet, out, height_m=0.70, ppm=100,
                                method="color-key")
        front = keypoints.geometric_keypoints(Image.open(out / "front34.png"),
                                              "front34", "L")
        back = keypoints.geometric_keypoints(Image.open(out / "back34.png"),
                                             "back34", "L")
        side = keypoints.geometric_keypoints(Image.open(out / "side.png"),
                                             "side", "L")
        self.assertGreater(front["shoulder_L"]["xy"][0],
                           front["shoulder_R"]["xy"][0])
        self.assertLess(back["shoulder_L"]["xy"][0],
                        back["shoulder_R"]["xy"][0])
        self.assertLessEqual(abs(side["shoulder_L"]["xy"][0] -
                                 side["shoulder_R"]["xy"][0]), 4)
        self.assertEqual("bone-prior", front["knee_L"]["source"])
        self.assertLess(front["knee_L"]["confidence"], 0.5)

    def test_female_ankle_robe_uses_canonical_hidden_bone_lengths(self) -> None:
        image = Image.new("RGBA", (256, 480))
        ImageDraw.Draw(image).rectangle((80, 45, 176, 459), fill=(80, 90, 70, 255))
        points = keypoints.geometric_keypoints(
            image, "front34", body_profile="female", garment_profile="ankle-robe")
        self.assertEqual(415, 460 - 45)
        self.assertAlmostEqual(0.38 * 256,
                               points["ankle_L"]["xy"][1] - points["knee_L"]["xy"][1],
                               delta=1)
        self.assertAlmostEqual(0.42 * 256,
                               points["knee_L"]["xy"][1] - points["hip_L"]["xy"][1],
                               delta=1)
        self.assertGreater(points["hem"]["xy"][1], points["knee_L"]["xy"][1])
        self.assertLess(points["hem"]["xy"][1], points["ankle_L"]["xy"][1])

    def test_vision_merge_keeps_low_confidence_and_regularises_knees(self) -> None:
        image = Image.new("RGBA", (120, 200), (0, 0, 0, 0))
        ImageDraw.Draw(image).rectangle((35, 5, 85, 195), fill=(80, 90, 70, 255))
        priors = keypoints.geometric_keypoints(image, "front34")
        old_shoulder = priors["shoulder_L"]["xy"][:]
        raw = {"left_shoulder": [10, 20, .9], "left_knee": [5, 5, .9]}
        merged = keypoints.merge_vision(priors, {"pose2d": raw}, facing="L")
        self.assertLess(abs(merged["shoulder_L"]["xy"][0] - 10),
                        abs(old_shoulder[0] - 10))
        self.assertLess(abs(merged["shoulder_L"]["xy"][1] - 20),
                        abs(old_shoulder[1] - 20))
        self.assertNotEqual([5, 5], merged["knee_L"]["xy"])
        self.assertEqual("vision+bone-prior", merged["knee_L"]["source"])

    def test_vision_compile_uses_writable_module_caches(self) -> None:
        helper, output = self.root / "helper.swift", self.root / "vision_pose"
        helper.write_text("print(1)", encoding="utf-8")
        completed = subprocess.CompletedProcess([], 0, stdout="", stderr="")
        with patch.object(keypoints.shutil, "which", return_value="/usr/bin/swiftc"), \
             patch.object(keypoints.subprocess, "run", return_value=completed) as runner:
            ok, note = keypoints.compile_vision(helper, output)
        self.assertTrue(ok); self.assertEqual("ok", note)
        environment = runner.call_args.kwargs["env"]
        self.assertIn("CLANG_MODULE_CACHE_PATH", environment)
        self.assertIn("SWIFT_MODULECACHE_PATH", environment)
        self.assertEqual(60, runner.call_args.kwargs["timeout"])

    def test_vision_temporary_directory_ignores_swift_cache_cleanup_race(self) -> None:
        class FakeTemporaryDirectory:
            def __init__(self, *args, **kwargs):
                self.kwargs = kwargs
                self.name = str(self_root / "vision-temp")

            def __enter__(self):
                Path(self.name).mkdir()
                return self.name

            def __exit__(self, *_):
                return False

        self_root = self.root
        fake = FakeTemporaryDirectory()
        failed = subprocess.CompletedProcess([], 1, stdout="", stderr="Code=9")
        with patch.object(keypoints.tempfile, "TemporaryDirectory",
                          return_value=fake) as temporary, \
             patch.object(keypoints, "compile_vision", return_value=(True, "ok")), \
             patch.object(keypoints.subprocess, "run", return_value=failed):
            value, note = keypoints.run_vision(self.sheet, self.root / "helper.swift")
        self.assertIsNone(value); self.assertIn("Code=9", note)
        self.assertTrue(temporary.call_args.kwargs["ignore_cleanup_errors"])

    def test_vision_timeout_falls_back_to_manual_prior(self) -> None:
        expired = subprocess.TimeoutExpired(["vision_pose"], 15)
        with patch.object(keypoints, "compile_vision", return_value=(True, "ok")), \
             patch.object(keypoints.subprocess, "run", side_effect=expired):
            value, note = keypoints.run_vision(
                self.sheet, self.root / "helper.swift"
            )
        self.assertIsNone(value)
        self.assertIn("timed out", note)

    def test_vision_runtime_retries_2d_when_3d_process_aborts(self) -> None:
        aborted = subprocess.CompletedProcess([], -6, stdout="", stderr="entitlement")
        fallback = subprocess.CompletedProcess(
            [], 0, stdout=json.dumps({"pose2d": {"left_shoulder_joint": [1, 2, .9]}}),
            stderr="")
        with patch.object(keypoints, "compile_vision", return_value=(True, "ok")), \
             patch.object(keypoints.subprocess, "run", side_effect=[aborted, fallback]) as runner:
            value, note = keypoints.run_vision(self.sheet, self.root / "helper.swift")
        self.assertIn("pose2d", value)
        self.assertIn("2D fallback", note)
        self.assertEqual("--2d-only", runner.call_args_list[1].args[0][-1])

    def test_vision_error_payload_falls_back_to_manual_prior(self) -> None:
        failed = subprocess.CompletedProcess(
            [], 0, stdout=json.dumps({"err2d": "Unable to setup request"}), stderr="")
        with patch.object(keypoints, "compile_vision", return_value=(True, "ok")), \
             patch.object(keypoints.subprocess, "run", return_value=failed):
            value, note = keypoints.run_vision(self.sheet, self.root / "helper.swift")
        self.assertIsNone(value)
        self.assertIn("Unable to setup request", note)

    def test_segment_view_emits_13_parts_with_local_pivots(self) -> None:
        image_path, kp_path = self.root / "view.png", self.root / "keypoints.yaml"
        synthetic_view(image_path, kp_path)
        records = segment_view(image_path, kp_path, self.root / "parts",
                               view="front34")
        self.assertEqual(set(SOURCE_PARTS), {record["part"] for record in records})
        self.assertEqual(13, len(list((self.root / "parts").glob("*.png"))))
        for part in SOURCE_PARTS:
            sidecar = yaml.safe_load((self.root / "parts" /
                                      f"{part}.pivots.yaml").read_text())
            with Image.open(self.root / "parts" / f"{part}.png") as image:
                for point in sidecar["keypoints"].values():
                    self.assertTrue(0 <= point[0] < image.width)
                    self.assertTrue(0 <= point[1] < image.height)
            if part.startswith("forearm_"):
                side_name = part[-1]
                pivot = sidecar["keypoints"][f"elbow_{side_name}"]
                child = sidecar["keypoints"][f"wrist_{side_name}"]
                self.assertLess(child[0], pivot[0])
                self.assertLessEqual(abs(child[1] - pivot[1]), 1)
        side = self.root / "side"
        segment_view(image_path, kp_path, side, view="side")
        self.assertEqual((side / "upper_arm_L.png").read_bytes(),
                         (side / "upper_arm_R.png").read_bytes())

    def test_ankle_robe_marks_hidden_leg_reconstruction(self) -> None:
        image_path, kp_path = self.root / "view.png", self.root / "keypoints.yaml"
        synthetic_view(image_path, kp_path)
        out = self.root / "robe-parts"
        segment_view(image_path, kp_path, out, view="front34",
                     garment_profile="ankle-robe")
        for part in ("thigh_shared", "shin_shared"):
            source = yaml.safe_load((out / f"{part}.pivots.yaml").read_text())["source"]
            self.assertEqual("garmentHidden", source["sourceLimitation"])
            self.assertEqual("sourceRobeTexture", source["reconstruction"])
        foot_note = yaml.safe_load((out / "foot_shared.pivots.yaml").read_text())
        ankle_y = foot_note["keypoints"]["ankle_L"][1]
        foot_alpha = np.asarray(Image.open(out / "foot_shared.png").getchannel("A"))
        self.assertFalse(np.any(foot_alpha[:max(0, ankle_y - 3)] >= 8))
        self.assertGreater(int((foot_alpha >= 8).sum()), 0)

    def test_joint_caps_cover_both_segment_endpoints(self) -> None:
        points = {"shoulder_L": (20, 20), "elbow_L": (60, 75)}
        mask = joint_caps("upper_arm_L", (100, 100), points)
        self.assertTrue(mask[20, 20])
        self.assertTrue(mask[75, 60])
        self.assertGreater(int(mask.sum()), 60)

    def test_hand_joint_cap_stops_at_wrist(self) -> None:
        points = {"wrist_L": (20, 20), "grip_L": (60, 75)}
        mask = joint_caps("hand_L", (100, 100), points)
        self.assertTrue(mask[20, 20])
        self.assertFalse(mask[75, 60])

    def test_repair_region_rejects_large_unobserved_capsule(self) -> None:
        desired = np.zeros((80, 80), dtype=bool)
        desired[10:70, 10:70] = True
        exposed = np.zeros_like(desired)
        exposed[30:50, 30:50] = True
        caps = np.zeros_like(desired)
        caps[5:25, 5:25] = True
        repaired = repair_region(desired, exposed, caps, max_gap=3)
        self.assertFalse(repaired[12, 12])
        self.assertLess(int((repaired & ~exposed).sum()), 200)

    def test_repair_region_keeps_small_enclosed_hole(self) -> None:
        desired = np.ones((40, 40), dtype=bool)
        exposed = desired.copy(); exposed[18:22, 18:22] = False
        repaired = repair_region(desired, exposed, np.zeros_like(desired))
        self.assertTrue(repaired[19, 19])

    def test_hair_mask_rejects_skin_and_collar(self) -> None:
        rgba = np.zeros((100, 100, 4), dtype=np.uint8)
        rgba[5:55, 25:75] = (35, 28, 25, 255)
        rgba[30:70, 37:63] = (205, 160, 132, 255)
        rgba[70:90, 25:75] = (110, 105, 92, 255)
        mask = hair_mask(rgba, {"crown": (50, 8), "neck": (50, 70)})
        self.assertTrue(mask[15, 50])
        self.assertFalse(mask[50, 50])
        self.assertFalse(mask[78, 50])

    def test_core_garment_isolation_excludes_articulated_arm(self) -> None:
        points = {"neck": (45, 4), "pelvis": (45, 55),
                  "hem": (45, 90),
                  "shoulder_L": (20, 10), "wrist_L": (20, 60),
                  "grip_L": (20, 72), "shoulder_R": (70, 10),
                  "wrist_R": (70, 60), "grip_R": (70, 72),
                  "hip_L": (35, 55), "hip_R": (55, 55)}
        torso = isolation_mask("torso", (100, 100), points)
        skirt = isolation_mask("pelvis_skirt", (100, 100), points)
        self.assertFalse(torso[40, 20])
        self.assertFalse(skirt[68, 20])
        self.assertTrue(torso[40, 45])
        self.assertFalse(core_joint_caps("pelvis_skirt", (100, 100), points)[60, 20])

    def test_component_filter_drops_disconnected_neighbour(self) -> None:
        mask = np.zeros((40, 40), dtype=bool)
        mask[4:24, 4:12] = True
        mask[28:34, 30:36] = True
        kept = keep_primary_component(mask, ((8, 8), (8, 20)))
        self.assertTrue(kept[8, 8])
        self.assertFalse(kept[30, 32])

    def test_joint_disk_fill_leaves_no_transparent_pixel(self) -> None:
        rgba = np.zeros((32, 32, 4), dtype=np.uint8)
        rgba[15:17, 15:17] = (70, 80, 60, 255)
        filled, added = enforce_joint_disks(rgba, ((16, 16),), radius=3)
        yy, xx = np.ogrid[:32, :32]
        disk = (xx - 16) ** 2 + (yy - 16) ** 2 <= 9
        self.assertTrue(np.all(filled[..., 3][disk] == 255))
        self.assertGreater(int(added.sum()), 0)

    def test_joint_disk_fill_does_not_create_isolated_caps(self) -> None:
        rgba = np.zeros((48, 48, 4), dtype=np.uint8)
        rgba[20:28, 4:20] = (70, 80, 60, 255)
        filled, added = enforce_joint_disks(rgba, ((16, 24), (40, 24)), radius=5)
        self.assertEqual(1, ndimage.label(filled[..., 3] >= 8)[1])
        self.assertFalse(added[24, 40])

    def test_joint_disk_fill_bridges_hidden_core_anchor(self) -> None:
        rgba = np.zeros((48, 48, 4), dtype=np.uint8)
        rgba[20:28, 4:20] = (70, 80, 60, 255)
        filled, added = enforce_joint_disks(
            rgba, ((36, 24),), radius=4, bridge_disconnected=True
        )
        yy, xx = np.ogrid[:48, :48]
        disk = (xx - 36) ** 2 + (yy - 24) ** 2 <= 4 ** 2
        self.assertTrue(np.all(filled[..., 3][disk] == 255))
        self.assertEqual(1, ndimage.label(filled[..., 3] >= 8)[1])
        self.assertGreater(int(added.sum()), int(disk.sum()))

    def test_segmented_torso_caps_both_shoulders(self) -> None:
        image_path, kp_path = self.root / "view.png", self.root / "keypoints.yaml"
        synthetic_view(image_path, kp_path)
        out = self.root / "parts"
        segment_view(image_path, kp_path, out, view="front34")
        note = yaml.safe_load((out / "torso.pivots.yaml").read_text())
        alpha = np.asarray(Image.open(out / "torso.png").getchannel("A"))
        for name in ("shoulder_L", "shoulder_R"):
            x, y = note["keypoints"][name]
            self.assertGreater(alpha[y, x], 0)

    def test_clip_projection_matches_metrics_for_all_directions(self) -> None:
        clip = json.loads((CLIPS / "clip_walk.json").read_text())
        metrics, frames = analyze_clip(clip)
        definitions = {name: (start, end) for name, start, end in
                       __import__("tools.rig.clips.clip_import", fromlist=["BONE_DEFS"]).BONE_DEFS}
        for name, yaw in DIR8:
            projected = preview.clip_projection(frames[7], yaw)
            self.assertGreaterEqual(min(projected["ratios"][bone]
                                        for bone in LIMB_BONES), .45)
            self.assertEqual(metrics["directions"][name]["renderMinLimbScale"] >= .45,
                             True)
            for bone in LIMB_BONES:
                start, end = definitions[bone]
                dx = projected["points"][end][0] - projected["points"][start][0]
                dy = projected["points"][end][1] - projected["points"][start][1]
                dz = projected["points"][end][2] - projected["points"][start][2]
                expected = max(.45, (dx * dx + dy * dy) ** .5 /
                               max((dx * dx + dy * dy + dz * dz) ** .5, 1e-9))
                self.assertAlmostEqual(expected, projected["ratios"][bone], places=9)

    def test_clip_view_track_matches_metrics_hysteresis(self) -> None:
        clip = json.loads((CLIPS / "clip_sword_attack.json").read_text())
        metrics, frames = analyze_clip(clip)
        for name, yaw in DIR8:
            track = preview.clip_projection_track(frames, yaw)
            switches = sum(left["selected"] != right["selected"]
                           for left, right in zip(track, track[1:]))
            self.assertEqual(
                metrics["directions"][name]["torsoViewSwitches"], switches
            )

    def test_mirrored_projection_does_not_change_rotated_geometry(self) -> None:
        clip = json.loads((CLIPS / "clip_sword_attack.json").read_text())
        frame = decode_clip(clip)[29]
        projected = preview.clip_projection(frame, 45)
        self.assertTrue(projected["mirrored"])
        with patch.object(preview, "_source_map", side_effect=RuntimeError("stop")) as loader:
            with self.assertRaisesRegex(RuntimeError, "stop"):
                preview.compose_clip_pose(Path("/tmp/set"), {"parts": []}, frame, 45)
        loader.assert_called_once_with(Path("/tmp/set"), {"parts": []},
                                       projected["view"])

    def test_dynamic_depth_order_puts_nearer_limb_in_front(self) -> None:
        near = preview.Placement(Image.new("RGBA", (4, 4)), (0, 0), (0, 0),
                                 0, 0, "upper_arm_L", {})
        far = preview.Placement(Image.new("RGBA", (4, 4)), (0, 0), (0, 0),
                                0, 0, "upper_arm_R", {})
        depths = {"upper_arm_L": 1.2, "upper_arm_R": -.7}
        ordered = preview.depth_order([near, far], depths)
        self.assertEqual(["upper_arm_R", "upper_arm_L"],
                         [item.part for item in ordered])

    def test_garment_hidden_leg_sources_render_behind_skirt(self) -> None:
        opaque = Image.new("RGBA", (4, 4), (1, 2, 3, 255))
        skirt = preview.Placement(opaque.copy(), (0, 0),
                                  (0, 0), 0, 7, "pelvis_skirt", {"hem": [0, 30]})
        placement = preview.Placement(opaque.copy(), (0, 0),
                                      (0, 0), 0, 10, "thigh_L", {})
        near_foot = preview.Placement(opaque.copy(), (0, 0),
                                     (0, 32), 0, 12, "foot_L", {"toe": [10, 0]})
        far_foot = preview.Placement(opaque.copy(), (0, 0),
                                    (100, 100), 0, 12, "foot_R", {"toe": [10, 0]})
        source = {"thigh_shared": {"source": {
            "sourceLimitation": "garmentHidden"}}}
        preview._place_legs_behind_skirt(source,
                                         [skirt, placement, near_foot, far_foot])
        self.assertLess(placement.z, skirt.z)
        self.assertIsNone(placement.image.getchannel("A").getbbox())
        self.assertIsNotNone(near_foot.image.getchannel("A").getbbox())
        self.assertIsNone(far_foot.image.getchannel("A").getbbox())
        long_shoe = preview.Placement(opaque.copy(), (0, 0),
                                      (38, 0), 0, 12, "foot_L", {"toe": [30, 0]})
        preview._place_legs_behind_skirt(source, [skirt, long_shoe])
        self.assertIsNone(long_shoe.image.getchannel("A").getbbox())
        depths = {"pelvis_skirt": .2, "thigh_L": .8}
        preview._place_legs_behind_skirt(source, [skirt, placement], depths)
        self.assertLess(depths["thigh_L"], depths["pelvis_skirt"])
        source["thigh_shared"]["source"] = {}
        short_leg = preview.Placement(opaque.copy(), (0, 0),
                                      (0, 0), 0, 10, "thigh_L", {})
        preview._place_legs_behind_skirt(source, [skirt, short_leg])
        self.assertEqual(10, short_leg.z)
        self.assertIsNotNone(short_leg.image.getchannel("A").getbbox())

    def test_scaled_part_preserves_anchor_and_scales_child_from_pivot(self) -> None:
        item = preview.Placement(Image.new("RGBA", (20, 100)), (10, 20),
                                 (77, 88), 0, 3, "shin_L", {"ankle": [10, 80]})
        scaled = preview._scaled(item, .5)
        self.assertEqual((77, 88), scaled.anchor)
        self.assertEqual((10, 10), scaled.pivot)
        self.assertEqual([10, 40], scaled.child["ankle"])
        self.assertEqual((77.0, 118.0), preview._child(scaled, "ankle"))

    def test_scaled_horizontal_part_shortens_along_its_bone_axis(self) -> None:
        image = Image.new("RGBA", (100, 20), (90, 70, 50, 255))
        item = preview.Placement(image, (80, 10), (77, 88), 0, 3,
                                 "forearm_L", {"wrist_L": [20, 10]})
        scaled = preview._scaled(item, .5)
        self.assertEqual((50, 20), scaled.image.size)
        self.assertEqual((40, 10), scaled.pivot)
        self.assertEqual([10, 10], scaled.child["wrist_L"])
        self.assertEqual((47.0, 88.0), preview._child(scaled, "wrist_L"))

    def test_projected_fk_joints_are_finite_and_inside_frame(self) -> None:
        fixture = self.root / "set"
        make_placeholder_parts.generate(fixture)
        clip = json.loads((CLIPS / "clip_walk.json").read_text())
        frame = decode_clip(clip)[8]
        joints = preview.projected_fk_joints(
            fixture, preview._load_manifest(fixture), frame, 45)
        self.assertIn("ankle_L", joints)
        for x, y in joints.values():
            self.assertTrue(0 <= x < preview.CELL[0])
            self.assertTrue(0 <= y < preview.CELL[1])

    def test_walk_joint_centres_are_opaque_in_all_directions(self) -> None:
        fixture = self.root / "set"
        make_placeholder_parts.generate(fixture)
        manifest = preview._load_manifest(fixture)
        clip = json.loads((CLIPS / "clip_walk.json").read_text())
        frame = decode_clip(clip)[8]
        old_background = preview.BACKGROUND
        preview.BACKGROUND = (0, 0, 0, 0)
        try:
            for _, yaw in DIR8:
                image = preview.compose_clip_pose(fixture, manifest, frame, yaw)
                alpha = np.asarray(image.getchannel("A"))
                yy, xx = np.ogrid[:alpha.shape[0], :alpha.shape[1]]
                for x, y in preview.projected_fk_joints(
                        fixture, manifest, frame, yaw).values():
                    x, y = round(x), round(y)
                    disk = (xx - x) ** 2 + (yy - y) ** 2 <= 3 ** 2
                    self.assertTrue(np.all(alpha[disk] > 0))
        finally:
            preview.BACKGROUND = old_background

    def test_identity_walk_has_no_three_pixel_joint_gaps(self) -> None:
        fixture = ROOT / "assets/default/rig/npc_zhujue__ch00_m"
        manifest = preview._load_manifest(fixture)
        clip = json.loads((CLIPS / "clip_walk.json").read_text())
        frames = decode_clip(clip)
        indices = [round(index * (len(frames) - 1) / 11) for index in range(12)]
        tracks = {yaw: preview.clip_projection_track(frames, yaw)
                  for _, yaw in DIR8}
        old_background = preview.BACKGROUND
        preview.BACKGROUND = (0, 0, 0, 0)
        try:
            for index in indices:
                for _, yaw in DIR8:
                    selected = tracks[yaw][index]["selected"]
                    image = preview.compose_clip_pose(
                        fixture, manifest, frames[index], yaw, selected
                    )
                    alpha = np.asarray(image.getchannel("A"))
                    yy, xx = np.ogrid[:alpha.shape[0], :alpha.shape[1]]
                    for x, y in preview.projected_fk_joints(
                            fixture, manifest, frames[index], yaw, selected).values():
                        x, y = round(x), round(y)
                        disk = (xx - x) ** 2 + (yy - y) ** 2 <= 3 ** 2
                        self.assertTrue(np.all(alpha[disk] > 0))
        finally:
            preview.BACKGROUND = old_background

    def test_identity_parts_have_no_isolated_joint_caps_or_side_skin_in_legs(self) -> None:
        fixture = ROOT / "assets/default/rig/npc_zhujue__ch00_f"
        for view in ("front34", "side", "back34"):
            for part in SOURCE_PARTS:
                alpha = np.asarray(Image.open(fixture / view / f"{part}.png").getchannel("A"))
                self.assertEqual(1, ndimage.label(alpha >= 8)[1], f"{view}/{part}")
        for part in ("thigh_shared", "shin_shared", "foot_shared"):
            rgba = np.asarray(Image.open(fixture / "side" / f"{part}.png").convert("RGBA"))
            opaque = rgba[..., 3] >= 32
            red, green, blue = (rgba[..., index].astype(int) for index in range(3))
            skin = opaque & (red - green > 25) & (green - blue > 4) & (red > 140)
            self.assertLess(float(skin.sum()) / max(int(opaque.sum()), 1), .01, part)
        torso = np.asarray(Image.open(fixture / "side/torso.png").getchannel("A"))
        torso_note = yaml.safe_load((fixture / "side/torso.pivots.yaml").read_text())
        for name in ("neck", "shoulder_L", "shoulder_R"):
            x, y = torso_note["keypoints"][name]
            self.assertGreater(int(torso[max(0, y-3):y+4, max(0, x-3):x+4].max()),
                               0, name)
        foot = np.asarray(Image.open(fixture / "front34/foot_shared.png").getchannel("A"))
        self.assertLess(int((foot >= 24).sum(axis=1).max()), 40)
        for part in ("upper_arm_L", "forearm_L", "hand_L"):
            rgba = np.asarray(Image.open(fixture / "side" / f"{part}.png").convert("RGBA"))
            pure_black = ((rgba[..., 3] >= 200) &
                          (rgba[..., :3].max(axis=2) == 0))
            self.assertEqual(0, int(pure_black.sum()), part)

    def test_identity_arm_skin_is_split_at_the_wrist(self) -> None:
        fixture = ROOT / "assets/default/rig/npc_zhujue__ch00_m"
        manifest = preview._load_manifest(fixture)
        for view in ("front34", "back34", "side"):
            source = np.asarray(Image.open(
                fixture / "work/L" / f"{view}.png").convert("RGBA"))
            points = yaml.safe_load((fixture / view / "keypoints.yaml").read_text())["keypoints"]
            for side in ("L", "R"):
                elbow = np.asarray(points[f"elbow_{side}"]["xy"], dtype=float)
                grip = np.asarray(points[f"grip_{side}"]["xy"], dtype=float)
                direction = grip - elbow; length = np.linalg.norm(direction)
                yy, xx = np.indices(source.shape[:2])
                along = ((xx-elbow[0])*direction[0] +
                         (yy-elbow[1])*direction[1]) / length
                across = np.abs((xx-elbow[0])*(-direction[1]) +
                                (yy-elbow[1])*direction[0]) / length
                expected_hand = (identity_skin(source) & (along >= length * .50) &
                                 (along <= length + 8) & (across < 30))
                hand = np.asarray(Image.open(
                    fixture / view / f"hand_{side}.png").convert("RGBA"))
                self.assertGreaterEqual(identity_skin(hand).sum(),
                                        expected_hand.sum() * .78, f"{view}/hand_{side}")
                forearm = np.asarray(Image.open(
                    fixture / view / f"forearm_{side}.png").convert("RGBA"))
                record = next(item for item in manifest["parts"]
                              if item["view"] == view and
                              item["id"] == f"forearm_{side}")
                local_elbow = np.asarray(record["pivot"], dtype=float)
                local_wrist = np.asarray(
                    record["childJoint"][f"wrist_{side}"], dtype=float)
                axis = local_wrist-local_elbow; axis_length = np.linalg.norm(axis)
                fy, fx = np.indices(forearm.shape[:2])
                distal = ((fx-local_elbow[0])*axis[0] +
                          (fy-local_elbow[1])*axis[1]) / axis_length
                self.assertLessEqual(int((identity_skin(forearm) &
                                         (distal > axis_length + 8)).sum()), 10,
                                     f"{view}/forearm_{side}")

    def test_identity_hands_hair_and_fallback_regressions(self) -> None:
        fixture = ROOT / "assets/default/rig/npc_zhujue__ch00_m"
        manifest = preview._load_manifest(fixture)
        for view in ("front34", "back34", "side"):
            hair = np.asarray(Image.open(fixture / view / "hair_or_headgear.png").convert("RGBA"))
            opaque = hair[..., 3] >= 8
            red, green, blue = (hair[..., index].astype(int) for index in range(3))
            skin = opaque & (red > 135) & (red - green > 22) & (green - blue > 2)
            self.assertEqual(0, int(skin.sum()), view)
            for hand in ("hand_L", "hand_R"):
                rgba = np.asarray(Image.open(fixture / view / f"{hand}.png").convert("RGBA"))
                pure_black = ((rgba[..., 3] >= 200) &
                              (rgba[..., :3].max(axis=2) == 0))
                self.assertEqual(0, int(pure_black.sum()), f"{view}/{hand}")
                opaque = rgba[..., 3] >= 64
                red, green, blue = (rgba[..., index].astype(int) for index in range(3))
                cloth = opaque & (green >= red - 8) & (green > blue + 4)
                self.assertLess(float(cloth.sum()) / max(int(opaque.sum()), 1), .05,
                                f"{view}/{hand}")
        thigh = next(item for item in manifest["parts"]
                     if item["view"] == "side" and item["id"] == "thigh_shared")
        self.assertFalse(thigh["source"].get("standardFallback", False))
        self.assertEqual("sourceTrouserPatch", thigh["source"]["reconstruction"])
        rgba = np.asarray(Image.open(fixture / "side/thigh_shared.png").convert("RGBA"))
        opaque = rgba[..., 3] >= 200; colours = rgba[..., :3][opaque]
        self.assertGreater(len(colours), 100)
        self.assertGreater(float(np.median(colours[:, 0])), 120.0)
        self.assertLess(float(np.median(colours[:, 0] - colours[:, 1])), 35.0)
        luminance = (.2126 * colours[:, 0] + .7152 * colours[:, 1] +
                     .0722 * colours[:, 2])
        self.assertGreater(float(luminance.std()), 18.0)
        source = np.asarray(Image.open(fixture / "work/L/side.png").convert("RGBA"))
        source_shape = normalized_silhouette(source[315:383, 100:174, 3])
        part_shape = normalized_silhouette(rgba[..., 3])
        silhouette_iou = float((source_shape & part_shape).sum()) / (source_shape | part_shape).sum()
        self.assertGreater(silhouette_iou, .85)

    def test_identity_side_pelvis_has_no_exposed_anchor_appendage(self) -> None:
        fixture = ROOT / "assets/default/rig/npc_zhujue__ch00_m/side"
        alpha = np.asarray(Image.open(fixture / "pelvis_skirt.png").getchannel("A"))
        note = yaml.safe_load((fixture / "pelvis_skirt.pivots.yaml").read_text())
        for name in ("pelvis", "hip_L", "hip_R"):
            x, y = note["keypoints"][name]
            window = alpha[max(0, y-9):y+10, max(0, x-9):x+10] >= 8
            labels, count = ndimage.label(window)
            self.assertLessEqual(count, 1, name)
            if window.any():
                self.assertGreater(float(window.mean()), .75, name)

    def test_identity_core_garments_exclude_skin_below_shoulders(self) -> None:
        fixture = ROOT / "assets/default/rig/npc_zhujue__ch00_m"
        for view in ("front34", "side", "back34"):
            for part in ("torso", "pelvis_skirt"):
                rgba = np.asarray(Image.open(fixture / view / f"{part}.png").convert("RGBA"))
                red, green, blue = (rgba[..., channel].astype(int) for channel in range(3))
                skin = ((rgba[..., 3] >= 32) & (red > 140) &
                        (red - green > 25) & (green - blue > 4))
                note = yaml.safe_load((fixture / view / f"{part}.pivots.yaml").read_text())
                shoulder = min(note["keypoints"].get("shoulder_L", [0, 0])[1],
                               note["keypoints"].get("shoulder_R", [0, 0])[1])
                if part == "torso": skin[:shoulder + 1] = False
                self.assertEqual(0, int(skin.sum()), f"{view}/{part}")

    def test_sword_clip_uses_tip_axis_and_visible_weapon(self) -> None:
        fixture = ROOT / "assets/default/rig/npc_zhujue__ch00_m"
        clip_path = CLIPS / "clip_sword_attack.json"
        clip = json.loads(clip_path.read_text())
        axes = preview.decode_weapon_axes(clip)
        self.assertEqual(clip["frameCount"], len(axes))
        first_angle, first_depth = preview.weapon_angle_depth(axes[0], 0, .4)
        hit_angle, hit_depth = preview.weapon_angle_depth(axes[25], 0, .4)
        self.assertGreater(abs(first_angle - hit_angle), 20.0)
        self.assertGreater(abs(first_depth - hit_depth), .02)
        with patch.object(preview, "compose_clip_pose",
                          wraps=preview.compose_clip_pose) as composer:
            frames, _ = preview.render_clip_frames(fixture, clip_path, dir8=False)
        self.assertTrue(all(call.args[5] is not None for call in composer.call_args_list))
        plain = preview.compose_clip_pose(
            fixture, preview._load_manifest(fixture), decode_clip(clip)[25], 0)
        self.assertNotEqual(plain.tobytes(), frames[25].tobytes())

    def test_cli_rejects_gif_without_clip(self) -> None:
        out = self.root / "bad.gif"
        with self.assertRaises(SystemExit) as raised:
            preview.main([str(self.root), "--gif", "--out", str(out)])
        self.assertEqual(2, raised.exception.code)
        self.assertFalse(out.exists())
