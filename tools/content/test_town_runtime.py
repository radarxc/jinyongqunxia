import contextlib
import io
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import town_runtime

REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
BASELINE_SOURCES = (
    Path("docs/design/town/city_dali__ch01.yaml"),
    Path("docs/design/town/city_hangzhou__ch02.yaml"),
    Path("assets/default/baseline/town/town_dali__ch01.layout.yaml"),
    Path("assets/default/baseline/town/town_hangzhou__ch02.layout.yaml"),
    Path("assets/default/baseline/tile/manifest.yaml"),
    Path("assets/default/baseline/building-map/manifest.yaml"),
)


def repository_bytes(relative_path):
    """Read a tracked fixture even when sparse checkout omits its file."""
    path = REPOSITORY_ROOT / relative_path
    if path.is_file():
        return path.read_bytes()
    return subprocess.run(
        ["git", "show", f"HEAD:{relative_path.as_posix()}"],
        cwd=REPOSITORY_ROOT, check=True, capture_output=True,
    ).stdout


class TownRuntimeTest(unittest.TestCase):
    @contextlib.contextmanager
    def source_roots(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            old = (town_runtime.ROOT, town_runtime.SPEC_DIR,
                   town_runtime.TOWN_LAYOUT_DIR, town_runtime.LEGACY_LAYOUT_DIR,
                   town_runtime.TILE_MANIFEST, town_runtime.BUILDING_MANIFEST)
            town_runtime.ROOT = root
            town_runtime.SPEC_DIR = root / "docs/design/town"
            town_runtime.TOWN_LAYOUT_DIR = root / "assets/default/town"
            town_runtime.LEGACY_LAYOUT_DIR = root / "assets/default/baseline/town"
            town_runtime.TILE_MANIFEST = (
                root / "assets/default/baseline/tile/manifest.yaml")
            town_runtime.BUILDING_MANIFEST = (
                root / "assets/default/baseline/building-map/manifest.yaml")
            town_runtime.SPEC_DIR.mkdir(parents=True)
            town_runtime.TOWN_LAYOUT_DIR.mkdir(parents=True)
            town_runtime.LEGACY_LAYOUT_DIR.mkdir(parents=True)
            try:
                yield root
            finally:
                (town_runtime.ROOT, town_runtime.SPEC_DIR,
                 town_runtime.TOWN_LAYOUT_DIR, town_runtime.LEGACY_LAYOUT_DIR,
                 town_runtime.TILE_MANIFEST, town_runtime.BUILDING_MANIFEST) = old

    def write_repository_sources(self, sources=BASELINE_SOURCES):
        for relative_path in sources:
            path = town_runtime.ROOT / relative_path
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(repository_bytes(relative_path))

    def write_source(self, stem, *, current=True, status=None):
        spec = town_runtime.SPEC_DIR / f"{stem}.yaml"
        spec.write_text("city_id: city_fixture\n", encoding="utf-8")
        if current:
            directory = town_runtime.TOWN_LAYOUT_DIR / stem
            layout = directory / "layout.yaml"
            directory.mkdir(parents=True)
            layout.write_text("kind: TownLayout\n", encoding="utf-8")
            if status is not None:
                (directory / "manifest.yaml").write_text(
                    f"- id: town_fixture\n  status: {status}\n", encoding="utf-8")
        else:
            suffix = stem.removeprefix("city_")
            layout = town_runtime.LEGACY_LAYOUT_DIR / f"town_{suffix}.layout.yaml"
            layout.write_text("kind: TownLayout\n", encoding="utf-8")
        return spec, layout

    def test_source_pairs_prefers_current_layout_and_falls_back_to_legacy(self):
        with self.source_roots():
            current = self.write_source("city_alpha__ch10", status="candidate")
            legacy_shadow = town_runtime.LEGACY_LAYOUT_DIR / "town_alpha__ch10.layout.yaml"
            legacy_shadow.write_text("kind: LegacyTownLayout\n", encoding="utf-8")
            legacy = self.write_source("city_beta__ch02", current=False)

            self.assertEqual(town_runtime.source_pairs(), [current, legacy])

    def test_source_pairs_resolves_but_excludes_rejected_layout(self):
        with self.source_roots():
            spec, layout = self.write_source(
                "city_luoyang__ch10", status="rejected")

            self.assertEqual(town_runtime.layout_path_for_spec(spec), layout)
            self.assertEqual(town_runtime.source_pairs(), [])

    def test_compiles_baseline_towns_deterministically(self):
        with self.source_roots():
            self.write_repository_sources()
            pairs = town_runtime.source_pairs()
            self.assertEqual([path.stem for path, _ in pairs],
                             ["city_dali__ch01", "city_hangzhou__ch02"])
            for spec, layout in pairs:
                first = town_runtime.compile_town(spec, layout)
                second = town_runtime.compile_town(spec, layout)
                self.assertEqual(town_runtime.encode(first),
                                 town_runtime.encode(second))
                self.assert_runtime_contract(first)

    def test_compiles_current_town_deterministically(self):
        spec = town_runtime.SPEC_DIR / "city_nanjing__ch10.yaml"
        layout = town_runtime.TOWN_LAYOUT_DIR / spec.stem / "layout.yaml"
        first = town_runtime.compile_town(spec, layout)
        second = town_runtime.compile_town(spec, layout)
        self.assertEqual(town_runtime.encode(first), town_runtime.encode(second))
        self.assert_runtime_contract(first)

    def assert_runtime_contract(self, value):
        self.assertEqual(value["projection"]["tilePx"], [64, 32])
        self.assertIn(value["navigation"]["spawn"],
                      [row[:2] for row in value["navigation"]["nodes"]])
        surfaces = {cell["ground"] for cell in value["groundPalette"]}
        tile_kinds = {entry["kind"] for entry in value["assets"]["tile"]["entries"]}
        self.assertLessEqual(surfaces, tile_kinds)
        self.assertIn("road_edge", tile_kinds)
        self.assertIn("riverbank", tile_kinds)
        self.assertTrue(value["edgeTiles"])
        self.assertEqual(value["edgeTiles"], sorted(value["edgeTiles"],
                         key=lambda row: (row[0], row[1])))
        self.assertEqual({row[1] for row in value["edgeTiles"]},
                         {"road_edge", "riverbank"})
        self.assertTrue(all(0 <= row[2] < 255 for row in value["edgeTiles"]))

    def test_check_detects_stale_then_accepts_generated_files(self):
        with self.source_roots() as root:
            self.write_repository_sources((
                BASELINE_SOURCES[0], BASELINE_SOURCES[2],
                BASELINE_SOURCES[4], BASELINE_SOURCES[5],
            ))
            output_root = root / "generated"
            stdout, stderr = io.StringIO(), io.StringIO()
            with contextlib.redirect_stdout(stdout), \
                 contextlib.redirect_stderr(stderr):
                self.assertEqual(town_runtime.main([str(output_root)]), 0)
                self.assertEqual(
                    town_runtime.main(["--check", str(output_root)]), 0)
                path = output_root / "ch01/city_dali.json"
                written = json.loads(path.read_text())
                path.write_text(json.dumps({**written, "revision": "0" * 64}) + chr(10))
                self.assertEqual(
                    town_runtime.main(["--check", str(output_root)]), 1)
            self.assertIn("stale town runtime:", stderr.getvalue())


if __name__ == "__main__":
    unittest.main()
