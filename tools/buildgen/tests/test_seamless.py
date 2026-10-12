"""Regression tests for the generated-sample seamless texture pipeline."""

from __future__ import annotations

import contextlib
import hashlib
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

BUILDGEN = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BUILDGEN))

import make_seamless as seamless  # noqa: E402


def save_rgb(path: Path, rgb: np.ndarray) -> None:
    Image.fromarray(np.asarray(rgb, dtype=np.uint8), mode="RGB").save(path)


def periodic_texture(size: int) -> np.ndarray:
    coordinate = np.arange(size, dtype=np.float64)
    y, x = np.meshgrid(coordinate, coordinate, indexing="ij")
    value = 128 + 35 * np.sin(2 * np.pi * x / size) + 24 * np.cos(2 * np.pi * y / size)
    return np.stack((value + 8, value, value - 12), axis=-1).clip(0, 255).astype(np.uint8)


def mulberry32(seed: int, count: int) -> np.ndarray:
    """Return deterministic noise bytes from the fixed 32-bit Mulberry32 PRNG."""
    state = seed & 0xFFFFFFFF
    values = np.empty(count, dtype=np.uint8)
    for index in range(count):
        state = (state + 0x6D2B79F5) & 0xFFFFFFFF
        mixed = state
        mixed = ((mixed ^ (mixed >> 15)) * (mixed | 1)) & 0xFFFFFFFF
        mixed ^= (mixed + (((mixed ^ (mixed >> 7)) * (mixed | 61)) & 0xFFFFFFFF))
        mixed &= 0xFFFFFFFF
        values[index] = ((mixed ^ (mixed >> 14)) & 0xFFFFFFFF) >> 24
    return values


class SeamRepairTests(unittest.TestCase):
    def test_ciede2000_matches_published_reference_pair(self) -> None:
        first = np.array([50.0000, 2.6772, -79.7751])
        second = np.array([50.0000, 0.0000, -82.7485])
        self.assertAlmostEqual(2.0425, float(seamless.delta_e_2000(first, second)), places=4)

    def test_obvious_half_color_seam_becomes_ciede2000_continuous(self) -> None:
        texture = periodic_texture(128)
        texture[:, :64] = np.clip(texture[:, :64].astype(int) - 45, 0, 255)
        texture[:, 64:] = np.clip(texture[:, 64:].astype(int) + 45, 0, 255)
        repaired = seamless.make_seamless(texture, blend=0.12)
        metrics = seamless.seam_delta_e(repaired)
        self.assertLess(metrics["left_right"], 2.0)
        self.assertLess(metrics["top_bottom"], 2.0)

    def test_already_seamless_input_changes_less_than_delta_e_three(self) -> None:
        texture = periodic_texture(128)
        texture[:, -1] = texture[:, 0]
        texture[-1] = texture[0]
        repaired = seamless.make_seamless(texture, blend=0.12)
        self.assertLess(seamless.mean_delta_e(texture, repaired), 3.0)


class ScaleAndColorTests(unittest.TestCase):
    def test_src_two_m_repeat_one_m_shrinks_half_then_tiles_two_by_two(self) -> None:
        source = periodic_texture(128)
        expected_tile = np.asarray(
            Image.fromarray(source).resize((64, 64), Image.Resampling.LANCZOS)
        )
        expected = np.tile(expected_tile, (2, 2, 1))
        actual = seamless.scale_to_repeat(
            Image.fromarray(source), 128, (1.0, 1.0), (2.0, 2.0)
        )
        np.testing.assert_allclose(actual, expected, rtol=0, atol=0)
        repaired = seamless.make_seamless(actual, blend=0.12)
        self.assertLess(np.abs(repaired.astype(int) - expected.astype(int)).mean(), 1.0)

    def test_blue_cast_matches_original_reference_within_delta_e_twelve(self) -> None:
        reference = periodic_texture(128)
        cast = reference.astype(np.int16)
        cast[..., 0] -= 42
        cast[..., 1] -= 20
        cast[..., 2] += 55
        cast = np.clip(cast, 0, 255).astype(np.uint8)
        matched = seamless.match_color_lab(cast, reference)
        self.assertLessEqual(seamless.color_delta_e(matched, reference), 12.0)


class RepetitionTests(unittest.TestCase):
    def test_fft_warns_for_strong_sixty_four_pixel_period(self) -> None:
        size = 256
        x = np.arange(size, dtype=np.float64)[None, :]
        wave = np.broadcast_to(127 + 100 * np.sin(2 * np.pi * x / 64), (size, size))
        texture = np.stack((wave, wave, wave), axis=-1).astype(np.uint8)
        result = seamless.analyze_repetition(texture)
        self.assertTrue(result["warning"])
        self.assertAlmostEqual(64.0, result["period_px"], places=5)
        self.assertGreater(result["energy_ratio"], result["threshold"])

    def test_fft_does_not_warn_for_fixed_seed_random_noise(self) -> None:
        texture = mulberry32(20261012, 256 * 256 * 3).reshape(256, 256, 3)
        result = seamless.analyze_repetition(texture)
        self.assertFalse(result["warning"])
        self.assertLessEqual(result["energy_ratio"], result["threshold"])


class OutputAndCliTests(unittest.TestCase):
    def test_preview_is_three_times_size_and_two_runs_are_byte_identical(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = root / "source.png"
            save_rgb(source, periodic_texture(96))
            hashes: list[tuple[str, str]] = []
            for number in (1, 2):
                output = root / f"layer-{number}.png"
                summary = seamless.process(source, output, 96, (1.0, 1.0))
                preview = Path(summary["preview"])
                with Image.open(preview) as image:
                    self.assertEqual((288, 288), image.size)
                hashes.append(
                    (hashlib.sha256(output.read_bytes()).hexdigest(),
                     hashlib.sha256(preview.read_bytes()).hexdigest())
                )
            self.assertEqual(hashes[0], hashes[1])

    def test_cli_prints_repeat_warning_and_one_json_summary_line(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source, output = root / "periodic.png", root / "layer.png"
            size = 256
            x = np.arange(size, dtype=np.float64)[None, :]
            wave = np.broadcast_to(127 + 100 * np.sin(2 * np.pi * x / 64), (size, size))
            save_rgb(source, np.stack((wave, wave, wave), axis=-1))
            stdout, stderr = io.StringIO(), io.StringIO()
            with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                return_code = seamless.main(
                    ["--in", str(source), "--out", str(output), "--size", "256",
                     "--repeat-m", "1x1", "--blend", "0.12"]
                )
            self.assertEqual(0, return_code)
            self.assertEqual("REPEAT_PATTERN", stderr.getvalue().strip())
            lines = stdout.getvalue().splitlines()
            self.assertEqual(1, len(lines))
            summary = json.loads(lines[0])
            self.assertEqual([256, 256], summary["size"])
            self.assertLess(summary["seam_delta_e2000"]["max"], 2.0)
            self.assertTrue(summary["repeat_peak"]["warning"])

    def test_match_color_cli_requires_reference(self) -> None:
        with self.assertRaises(SystemExit):
            with contextlib.redirect_stderr(io.StringIO()):
                seamless.main(
                    ["--in", "missing.png", "--out", "unused.png",
                     "--repeat-m", "1x1", "--match-color"]
                )


if __name__ == "__main__":
    unittest.main()
