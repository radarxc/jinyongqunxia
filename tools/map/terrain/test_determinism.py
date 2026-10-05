import hashlib
import importlib.util
import json
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("terrain_builder_determinism", HERE / "build_terrain.py")
builder = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = builder
SPEC.loader.exec_module(builder)


class DeterminismTest(unittest.TestCase):
    def test_fresh_build_matches_manifest_hashes(self):
        config = builder.load_config()
        documents, _, _, _ = builder.build_documents(config)
        manifest = json.loads((builder.LAYERS_DIR / "manifest.json").read_text(encoding="utf-8"))
        generated = {f"layers/{name}.json": builder.canonical_bytes(documents[name]) for name in builder.LAYER_NAMES}
        for relative, record in manifest["outputs"].items():
            path = builder.HERE / relative
            self.assertTrue(path.is_file(), relative)
            actual = hashlib.sha256(path.read_bytes()).hexdigest()
            self.assertEqual(actual, record["sha256"], relative)
            if relative in generated:
                self.assertEqual(hashlib.sha256(generated[relative]).hexdigest(), record["sha256"], relative)

    def test_rebuild_is_identical_to_delivery(self):
        config = builder.load_config()
        first, _, _, _ = builder.build_documents(config)
        for name in builder.LAYER_NAMES:
            delivered = (builder.LAYERS_DIR / f"{name}.json").read_bytes()
            self.assertEqual(builder.canonical_bytes(first[name]), delivered, name)

    def test_size_budgets(self):
        json_size = sum(path.stat().st_size for path in builder.LAYERS_DIR.glob("*.json"))
        png_size = sum(path.stat().st_size for path in builder.PREVIEW_DIR.glob("*.png"))
        self.assertLessEqual(json_size, 15 * 1024 * 1024)
        self.assertLessEqual(png_size, 6 * 1024 * 1024)


if __name__ == "__main__":
    unittest.main()
