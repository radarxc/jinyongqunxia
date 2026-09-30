#!/usr/bin/env python3
"""Synthetic, offline regression tests for the VFX production contracts."""

from __future__ import annotations

import copy
import json
import math
from pathlib import Path
import re
import tempfile
import unittest

import numpy as np
from PIL import Image

from build_demo import build_demo
from compose import PeakRenderer, write_peak
from cut_frames import cut_effect, quality_metrics, white_to_rgba
from imaging import blend, from_premultiplied, srgb_decode, srgb_encode, to_premultiplied
from _test_fixture import KEYING, fixture_configs, reference_quality, write_fixture
from validation import VFXError, check_html, load_yaml, save_yaml, validate_document, validate_schema


class KeyingTests(unittest.TestCase):
    def test_threshold_and_white_reconstruction(self):
        colors = [(255, 255, 255), (250, 250, 250), (249, 249, 249),
                  (240, 240, 240), (128, 128, 128), (201, 164, 92)]
        source = Image.fromarray(np.array([colors], dtype=np.uint8), "RGB")
        for method in ("white_key", "white_luma"):
            with self.subTest(method=method):
                result = white_to_rgba(source, dict(KEYING, method=method))
                array = np.asarray(result)
                np.testing.assert_array_equal(array[0, :2], 0)
                self.assertTrue(np.all(array[0, 2:, 3] > 0))
                back = to_premultiplied(Image.new("RGBA", source.size, "white"))
                rebuilt = np.asarray(from_premultiplied(blend(
                    back, to_premultiplied(result), "normal")))[:, :, :3]
                error = np.abs(rebuilt[:, 2:].astype(int) - np.asarray(source)[:, 2:])
                self.assertLessEqual(error.max(), 2)
                self.assertTrue(np.isfinite(array).all())

    def test_quality_reports_residual_white_and_border(self):
        source = Image.new("RGB", (32, 32), "white")
        source.paste((201, 164, 92), (10, 10, 22, 22))
        good = white_to_rgba(source, KEYING)
        metrics = quality_metrics(source, good)
        self.assertEqual(metrics["border_alpha_ratio"], 0)
        self.assertEqual(metrics["residual_white_edge_ratio"], 0)
        self.assertLessEqual(metrics["white_rebuild_max_8bit"], 2)
        bad = np.asarray(good).copy()
        bad[0, 0] = [255, 255, 255, 128]
        metrics = quality_metrics(source, Image.fromarray(bad, "RGBA"))
        self.assertGreater(metrics["border_alpha_ratio"], 0)
        self.assertGreater(metrics["residual_white_edge_ratio"], 0)

    def test_known_gold_soft_edges_on_black_and_gray(self):
        # Known pre-matte coverage detects opaque pale edges missed by quality_metrics.
        coverage = np.zeros((32, 80))
        for index, amount in enumerate((0.05, 0.1, 0.25, 0.5, 0.75, 0.85, 0.95, 1)):
            coverage[8:24, 8 + index * 8:16 + index * 8] = amount
        gold = srgb_decode(np.array([201, 164, 92]) / 255)
        rgb = srgb_encode(gold * coverage[..., None] + 1 - coverage[..., None])
        source = Image.fromarray(np.rint(rgb * 255).astype(np.uint8), "RGB")
        result = white_to_rgba(source, KEYING)
        metrics = reference_quality(result, coverage)
        for background in ("black", "gray"):
            with self.subTest(background=background):
                measured = metrics["backgrounds"][background]
                self.assertEqual(measured["bright_edge_ratio"], 0)
                self.assertLessEqual(measured["edge_bright_max_8bit"], 2)
                # The linear alpha floor can remove gold's blue (92); reject erasure.
                self.assertLessEqual(measured["edge_abs_max_8bit"], 92 + 2)
        self.assertEqual(metrics["solid_color_max_error_8bit"], 0)
        self.assertTrue(np.all(np.asarray(result)[coverage == 1, 3] == 255))
        self.assertTrue(np.all(np.asarray(result)[coverage == 0, 3] == 0))
        self.assertTrue(np.all(np.asarray(result)[coverage >= 0.1, 3] > 0))
        self.assertTrue(np.all(np.asarray(result)[coverage == 0.05, 3] == 0))
        self.assertTrue(np.all(np.asarray(result)[coverage == 0.25, 3] < 80))
        # Both prior settings must fail this oracle even when near-white ratio is zero.
        for key_full in (25, 128):
            bad = white_to_rgba(source, dict(KEYING, key_full_8bit=key_full))
            self.assertEqual(quality_metrics(source, bad)["residual_white_edge_ratio"], 0)
            for background in ("black", "gray"):
                error = reference_quality(bad, coverage)["backgrounds"][background]
                self.assertGreater(error["bright_edge_ratio"], 0)
                self.assertGreater(error["edge_bright_max_8bit"], 20)

    def test_linear_srgb_and_blend_oracles(self):
        values = np.array([0, 0.003, 0.04045, 0.25, 0.5, 1])
        np.testing.assert_allclose(srgb_encode(srgb_decode(values)), values, atol=1e-7)
        cb, cs = np.array([0.2, 0.4, 0.6]), np.array([0.7, 0.3, 0.1])
        ab, a_s = 0.6, 0.4
        back = np.array([[list(cb * ab) + [ab]]])
        front = np.array([[list(cs * a_s) + [a_s]]])
        for mode, mixed in [("normal", cs), ("multiply", cb * cs),
                            ("screen", 1 - (1 - cb) * (1 - cs))]:
            expected = a_s * (1 - ab) * cs + a_s * ab * mixed + ab * (1 - a_s) * cb
            result = blend(back, front, mode)
            np.testing.assert_allclose(result[0, 0, :3], expected, atol=1e-7)
            self.assertAlmostEqual(result[0, 0, 3], a_s + ab * (1 - a_s))
        expected_alpha = min(1, ab + a_s)
        expected = np.minimum(np.minimum(1, ab * cb + a_s * cs), expected_alpha)
        np.testing.assert_allclose(blend(back, front, "lighter")[0, 0, :3], expected)


class SchemaTests(unittest.TestCase):
    def test_valid_minimal_documents(self):
        for document in fixture_configs():
            validate_schema(document)

    def test_schema_rejects_unknown_fields_wrong_types_and_nonfinite(self):
        effect, _, composition = fixture_configs()
        mutations = [dict(effect, invented=True), dict(effect, version=True),
                     dict(effect, reference_length_px=float("nan")),
                     dict(effect, reference_length_px=float("inf")),
                     dict(effect, size_px=[320.5, 160]), dict(effect, blend="lighten")]
        missing = copy.deepcopy(composition)
        del missing["output"]["fps"]
        mutations.append(missing)
        resolved = dict(composition, mode="resolved_preview")
        mutations.append(resolved)
        for document in mutations:
            with self.subTest(document=document):
                with self.assertRaises(VFXError):
                    validate_schema(document)

    def test_yaml_duplicate_keys_custom_tags_nonfinite_and_cycles(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.yaml"
            for payload in ("kind: EffectSet\nkind: EmitterPlate\n", "x: .nan\n",
                            "x: !!python/object:builtins.dict {}\n", "x: &x [*x]\n",
                            "1: value\n", "date: 2026-09-30\n"):
                with self.subTest(payload=payload):
                    path.write_text(payload, encoding="utf-8")
                    with self.assertRaises(VFXError):
                        load_yaml(path)


class FixtureTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.path = write_fixture(self.root)
        self.effect_path = self.root / "effect/effect-set.yaml"
        self.effect = load_yaml(self.effect_path)
        self.composition = load_yaml(self.path)

    def assert_bad_effect(self, effect):
        save_yaml(self.effect_path, effect)
        with self.assertRaises(VFXError):
            validate_document(self.effect_path, suite_root=self.root)

    def test_grid_and_singles_have_identical_order(self):
        grid_pixels = [np.asarray(Image.open(self.root / "effect" / frame["file"]))
                       for frame in self.effect["frames"]]
        single = copy.deepcopy(self.effect)
        source = Image.open(self.root / "effect/source_test.png")
        single["source"]["mode"] = "singles"
        single["source"]["files"] = [f"single_{i}.png" for i in range(4)]
        for index, rect in enumerate(single["source"]["rects"]):
            source.crop((index * 336, 0, index * 336 + 320, 160)).save(
                self.root / "effect" / single["source"]["files"][index])
            rect.update(file_index=index, rect_px=[0, 0, 320, 160])
        cut_effect(single, self.effect_path, suite_root=self.root)
        for frame, expected in zip(single["frames"], grid_pixels):
            np.testing.assert_array_equal(Image.open(self.root / "effect" / frame["file"]), expected)
        validate_document(self.path, suite_root=self.root)

    def test_preview_collision_never_overwrites_white_source(self):
        source = self.root / "effect/source_test.png"
        protected = source.with_name("preview_black.png")
        source.rename(protected)
        before = protected.read_bytes()
        self.effect["source"]["files"] = ["preview_black.png"]
        with self.assertRaises(VFXError):
            cut_effect(self.effect, self.effect_path, suite_root=self.root, preview=True)
        self.assertEqual(protected.read_bytes(), before)

    def test_crop_phase_anchor_and_direction_failures(self):
        mutations = []
        for change in ("overlap", "outside", "index", "size", "phase", "anchor", "direction"):
            effect = copy.deepcopy(self.effect)
            if change == "overlap":
                effect["source"]["rects"][1]["rect_px"][0] = 16
            elif change == "outside":
                effect["source"]["rects"][0]["rect_px"][1] = 1
            elif change == "index":
                effect["source"]["rects"][0]["file_index"] = 8
            elif change == "size":
                effect["source"]["rects"][0]["rect_px"][2] = 319
            elif change == "phase":
                effect["frames"][1]["phase"] = 0
            elif change == "anchor":
                effect["frames"][0]["anchor_px"] = [320, 80]
            else:
                effect["direction"] = [0.5, 0]
            mutations.append((change, effect))
        for label, effect in mutations:
            with self.subTest(label=label):
                self.assert_bad_effect(effect)

    def test_paths_cannot_escape_suite_or_use_external_resources(self):
        for file in ("/tmp/image.png", "../../escape.png", "https://host/image.png"):
            with self.subTest(file=file):
                effect = copy.deepcopy(self.effect)
                effect["frames"][0]["file"] = file
                self.assert_bad_effect(effect)

    def test_symlink_cannot_escape_suite(self):
        with tempfile.TemporaryDirectory() as outside:
            external = Path(outside) / "external.png"
            Image.open(self.root / "effect/frame_000.png").save(external)
            (self.root / "effect/escape.png").symlink_to(external)
            self.effect["frames"][0]["file"] = "escape.png"
            self.assert_bad_effect(self.effect)

    def test_alpha_and_frame_dimensions_are_checked(self):
        frame_path = self.root / "effect/frame_000.png"
        original = Image.open(frame_path).copy()
        for label, image in [("opaque", Image.new("RGBA", (320, 160), "gold")),
                             ("empty", Image.new("RGBA", (320, 160))),
                             ("rgb", original.convert("RGB")),
                             ("wrong_size", original.resize((160, 80)))]:
            with self.subTest(label=label):
                image.save(frame_path)
                with self.assertRaises(VFXError):
                    validate_document(self.effect_path, suite_root=self.root)
        original.save(frame_path)

    def test_render_direction_and_reference_length(self):
        image = Image.new("RGBA", (320, 160))
        image.paste((255, 0, 0, 255), (79, 79, 81, 81))
        for frame in self.effect["frames"]:
            image.save(self.root / "effect" / frame["file"])
        self.composition["pixels_per_hex"] = 224
        self.composition["background"] = "#000000"
        for angle in (0, 90, 37):
            with self.subTest(angle=angle):
                self.composition["angle_deg"] = angle
                save_yaml(self.path, self.composition)
                renderer = PeakRenderer(self.path, suite_root=self.root)
                result = np.asarray(renderer.render_peak())
                y, x = np.where((result[:, :, 0] > 50) & (result[:, :, 1] == 0))
                expected = np.array([160, 200]) + 32 * np.array([
                    math.cos(math.radians(angle)), math.sin(math.radians(angle))])
                np.testing.assert_allclose([np.mean(x + 0.5), np.mean(y + 0.5)],
                                           expected, atol=1.1)

    def test_qi_sword_rejects_drift_and_scale(self):
        self.effect.update(style="qi_sword", blend="screen")
        save_yaml(self.effect_path, self.effect)
        for scale, drift in ((0.95, 0), (1, 0.02)):
            with self.subTest(scale=scale, drift=drift):
                self.composition["transition"].update(scale_from=scale, drift_fraction=drift)
                save_yaml(self.path, self.composition)
                with self.assertRaises(VFXError):
                    validate_document(self.path, suite_root=self.root)

    def test_zero_range_positive_length_is_local_preview(self):
        self.composition.update(range_hex=0, length_px=224)
        save_yaml(self.path, self.composition)
        validate_document(self.path, suite_root=self.root)
        del self.composition["length_px"]
        save_yaml(self.path, self.composition)
        with self.assertRaises(VFXError):
            validate_document(self.path, suite_root=self.root)

    def test_out_of_canvas_is_rejected(self):
        self.composition["emit_at_px"] = [639, 200]
        save_yaml(self.path, self.composition)
        with self.assertRaises(VFXError):
            PeakRenderer(self.path, suite_root=self.root)

    def test_missing_source_never_becomes_synthetic_fallback(self):
        (self.root / "effect/frame_000.png").unlink()
        with self.assertRaises(VFXError):
            build_demo(self.path)

    def test_static_peak_is_only_composed_output_and_protects_sources(self):
        target = write_peak(self.path)
        with Image.open(target) as image:
            self.assertEqual(image.size, (640, 400))
            np.testing.assert_array_equal(image, PeakRenderer(self.path).render_peak())
        self.assertFalse((self.root / 'frames').exists())
        with self.assertRaises(VFXError):
            write_peak(self.path, self.root / 'effect/frame_000.png')

    def test_peak_crossfade_aligns_different_roots(self):
        reference = None
        for shifted in (False, True):
            for index, frame in enumerate(self.effect['frames']):
                shift = index * 3 if shifted else 0
                image = Image.new('RGBA', (320, 160))
                image.paste((201, 164, 92, 128), (48 + shift, 70, 80 + shift, 90))
                image.save(self.root / 'effect' / frame['file'])
                frame['anchor_px'] = [48 + shift, 80]
            save_yaml(self.effect_path, self.effect)
            result = np.asarray(PeakRenderer(self.path).render_peak())
            if reference is None:
                reference = result
            else:
                np.testing.assert_array_equal(result, reference)

    def test_peak_at_duration_without_dissipate_is_emitter_only(self):
        self.composition['rhythm']['dissipate_s'] = 0
        self.composition['output']['peak_phase'] = 1
        save_yaml(self.path, self.composition)
        renderer = PeakRenderer(self.path)
        np.testing.assert_array_equal(renderer.render_peak(), from_premultiplied(renderer.background))

    def test_peak_directional_mask_and_full_visibility(self):
        self.composition['output']['peak_phase'] = 0.025 / 0.6
        self.composition['transition']['directional_mask'] = {'enabled': False, 'softness': 0.08}
        save_yaml(self.path, self.composition)
        unmasked = np.asarray(PeakRenderer(self.path).render_peak())
        self.composition['transition']['directional_mask']['enabled'] = True
        save_yaml(self.path, self.composition)
        masked = np.asarray(PeakRenderer(self.path).render_peak())
        self.assertFalse(np.array_equal(masked, unmasked))
        self.composition['output']['peak_phase'] = 0.25 / 0.6
        save_yaml(self.path, self.composition)
        masked = np.asarray(PeakRenderer(self.path).render_peak())
        self.composition['transition']['directional_mask']['enabled'] = False
        save_yaml(self.path, self.composition)
        np.testing.assert_array_equal(masked, PeakRenderer(self.path).render_peak())

    def test_build_embeds_only_source_layers_and_exports_metadata(self):
        result = build_demo(self.path)
        self.assertLessEqual(result['bytes'], 3000000)
        self.assertEqual(result['source_frames'], 4)
        self.assertEqual(result['inline_scripts_checked'], 1)
        self.assertFalse((self.root / 'frames').exists())
        self.assertFalse((self.root / 'animation.json').exists())
        document = json.loads((self.root / 'composition.json').read_text())
        self.assertEqual(document['effect'], self.effect)
        self.assertEqual(document['emitter']['size_px'], [128, 128])
        content = (self.root / 'demo.html').read_text()
        payload = json.loads(re.search(r'<script id="vfx-data" type="application/json">(.*?)</script>',
                                       content, re.S).group(1))
        self.assertEqual(len(payload['effectFrames']), 4)
        self.assertNotIn('times', payload)
        self.assertIn('prefers-reduced-motion', content)
        self.assertIn('createVfxPlayer(THREE', content)
        self.assertEqual(check_html(self.root / 'demo.html')['unique_images'], 6)

    def test_build_rejects_retired_optional_animation(self):
        self.composition['output']['optional_animation'] = 'apng'
        save_yaml(self.path, self.composition)
        with self.assertRaisesRegex(VFXError, 'optional_animation'):
            build_demo(self.path)

    def test_html_rejects_extra_dependency_and_invalid_inline_script(self):
        build_demo(self.path)
        path = self.root / 'demo.html'
        original = path.read_text()
        mutations = [original.replace("const THREE = await import('three');", 'const = ;'),
                     original.replace("const THREE = await import('three');", "import x from 'other';"),
                     original.replace('</body>', '<img src="https://host/x.png"></body>'),
                     original.replace('@0.186.1/', '@0.185.0/')]
        for payload in mutations:
            with self.subTest(payload=payload[:50]):
                path.write_text(payload)
                with self.assertRaises(VFXError):
                    check_html(path)


class HtmlTests(unittest.TestCase):
    def test_html_rejects_network_external_paths_and_budget_overflow(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.html"
            for payload in ("<script src='https://example.org/a.js'></script>",
                            "<img src='frame.png'>", "<style>a{background:url(x.png)}</style>",
                            "<img src='//example.org/a.webp'>",
                            "<script>fetch('https://example.org')</script>"):
                with self.subTest(payload=payload):
                    path.write_text(payload, encoding="utf-8")
                    with self.assertRaises(VFXError):
                        check_html(path)
            path.write_text("x" * 3000001, encoding="utf-8")
            with self.assertRaises(VFXError):
                check_html(path)


if __name__ == "__main__":
    unittest.main()
