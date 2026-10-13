"""Regression gates for procedural town build-kit layers."""

from __future__ import annotations

import hashlib
import re
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

BUILDGEN = Path(__file__).resolve().parents[1]
ROOT = BUILDGEN.parents[1]
sys.path.insert(0, str(BUILDGEN))

import build_layer_strips as strips  # noqa: E402
import make_placeholder_layers as layers  # noqa: E402
from common import seam_delta_e  # noqa: E402

ASSET_ROOT = ROOT / "assets/default/buildkit"
EXPECTED_IDS = {
    "song_dali": ["tile_roof", "ridge_tiles", "eave_soffit", "timber_lacquer",
                    "timber_raw", "plaster_lime", "earth_plaster", "stone_rubble",
                    "stone_ashlar", "brick_grey", "lattice_window", "door_planks",
                    "floor_pavers", "floor_wood", "painted_band", "cloth_awning"],
    "xiyu": ["mud_roof", "parapet_coping", "joist_soffit", "timber_carved",
               "timber_raw", "mud_plaster_ochre", "mud_plaster_limewash", "brick_fired",
               "adobe_brick", "brick_lattice", "lattice_wood", "door_carved",
               "floor_earth", "carpet_kilim", "dome_plaster", "canvas_awning"],
    "props": ["wood_furniture", "wood_rough", "ceramic_glaze", "iron",
                "cloth_bolt", "paper_books", "straw_basket", "medicine_drawers"],
}


def file_hashes(root: Path) -> dict[str, str]:
    return {
        str(path.relative_to(root)): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in sorted(root.rglob("*")) if path.is_file()
    }


def fft_period_mm(path: Path, repeat_mm: int, collapse_axis: int) -> float:
    with Image.open(path) as image:
        rgb = np.asarray(image.convert("RGB"), dtype=np.float64)
    signal = rgb.mean(axis=(collapse_axis, 2))
    signal -= signal.mean()
    spectrum = np.abs(np.fft.rfft(signal))
    spectrum[0] = 0.0
    peak_cycles = int(np.argmax(spectrum))
    if peak_cycles == 0:
        return float("inf")
    return repeat_mm / peak_cycles


class LayerGenerationTests(unittest.TestCase):
    def test_two_runs_are_byte_identical(self) -> None:
        with tempfile.TemporaryDirectory() as first, tempfile.TemporaryDirectory() as second:
            roots = (Path(first), Path(second))
            for root in roots:
                for kit in layers.KITS:
                    layers.generate_kit(kit, root)
                    strips.build_kit(root, kit)
            self.assertEqual(file_hashes(roots[0]), file_hashes(roots[1]))
            self.assertEqual(48, len(file_hashes(roots[0])))

    def test_all_master_edges_are_ciede2000_seamless(self) -> None:
        seen = 0
        for kit, specs in layers.KITS.items():
            for spec in specs:
                path = ASSET_ROOT / kit / "layers" / f"{spec.id}.png"
                with Image.open(path) as image:
                    rgb = np.asarray(image.convert("RGB"))
                self.assertEqual((1024, 1024, 3), rgb.shape)
                self.assertLess(seam_delta_e(rgb), 2.0, f"{kit}/{spec.id}")
                self.assertLess(path.stat().st_size, 2 * 1024 * 1024)
                seen += 1
        self.assertEqual(40, seen)

    def test_fft_matches_every_declared_design_scale(self) -> None:
        checked = 0
        for kit, specs in layers.KITS.items():
            for spec in specs:
                path = ASSET_ROOT / kit / "layers" / f"{spec.id}.png"
                for axis, target in enumerate(spec.scale_mm):
                    if target is None:
                        continue
                    repeat = spec.repeat_mm[axis]
                    self.assertEqual(
                        0, repeat % target,
                        f"{kit}/{spec.id} axis={'uv'[axis]}: repeat {repeat} not divisible by {target}",
                    )
                    measured = fft_period_mm(path, repeat, collapse_axis=axis)
                    error = abs(measured - target) / target
                    self.assertLessEqual(
                        error, 0.03,
                        (f"{kit}/{spec.id} axis={'uv'[axis]}: target={target:.2f} mm, "
                         f"measured={measured:.2f} mm, error={error:.2%}"),
                    )
                    checked += 1
        self.assertEqual(70, checked)

    def test_strip_sizes_order_and_manifest_hashes(self) -> None:
        expected = {
            "song_dali": {"strip_512.webp": (512, 8192), "strip_256.webp": (256, 4096)},
            "xiyu": {"strip_512.webp": (512, 8192), "strip_256.webp": (256, 4096)},
            "props": {"strip_256.webp": (256, 2048)},
        }
        for kit, files in expected.items():
            manifest_layers = strips.parse_layers(ASSET_ROOT / kit / "manifest.yaml")
            self.assertEqual(EXPECTED_IDS[kit], [layer.id for layer in manifest_layers])
            self.assertEqual([], strips.validate_kit(ASSET_ROOT / kit, kit))
            for filename, size in files.items():
                with Image.open(ASSET_ROOT / kit / filename) as image:
                    self.assertEqual(size, image.size)

    def test_strip_validator_rejects_swapped_slices_even_with_synced_sha(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary) / "song_dali"
            shutil.copytree(ASSET_ROOT / "song_dali", directory)
            path = directory / "strip_256.webp"
            with Image.open(path) as source:
                strip = source.convert("RGB")
            first = strip.crop((0, 0, 256, 256))
            second = strip.crop((0, 256, 256, 512))
            strip.paste(second, (0, 0))
            strip.paste(first, (0, 256))
            strip.save(path, format="WEBP", quality=85, method=6, exact=True)
            manifest = directory / "manifest.yaml"
            text = manifest.read_text(encoding="utf-8")
            block = re.search(
                r"(  - id: song_dali_strip_256\n(?:(?!  - id:).)*?    sha256: )[0-9a-f]{64}",
                text, re.DOTALL,
            )
            self.assertIsNotNone(block)
            text = text[:block.start()] + block.group(1) + strips.sha256_file(path) + text[block.end():]
            manifest.write_text(text, encoding="utf-8")
            errors = strips.validate_kit(directory, "song_dali")
            self.assertTrue(any("slice 0 != tile_roof" in error for error in errors), errors)


if __name__ == "__main__":
    unittest.main()
