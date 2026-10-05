import json
import unittest

import yaml

try:
    from .export_bindings import BINDINGS_OUTPUT, BINDINGS_SOURCE, catalog_payload, _runtime_files
except ImportError:
    from export_bindings import BINDINGS_OUTPUT, BINDINGS_SOURCE, catalog_payload, _runtime_files


class ExportBindingsTest(unittest.TestCase):
    def test_runtime_json_matches_authored_yaml_exactly(self):
        source = yaml.safe_load(BINDINGS_SOURCE.read_text(encoding="utf-8"))
        document = json.loads(BINDINGS_OUTPUT.read_text(encoding="utf-8"))
        self.assertEqual(document["schemaVersion"], "event.v1")
        payload = document["actions"][0]["payload"]
        self.assertEqual(payload["schema"], "tianshu-vfx-bindings.v1")
        exported = payload["bindings"]
        self.assertEqual(source, exported)
        self.assertEqual(len(exported), len({row["move"] for row in exported}))

    def test_catalog_exposes_all_template_effects_and_palette(self):
        catalog = catalog_payload()
        self.assertEqual(catalog["palette"]["yin"], "#5FB5B0")
        self.assertIn("qi_projection/fan", catalog["effects"])
        self.assertIn("plain_strike/arc", catalog["effects"])
        self.assertIn("palm", catalog["emitters"])

    def test_runtime_manifest_includes_effect_atlases_and_emitter_plates(self):
        files = {path.as_posix() for path in _runtime_files()}
        self.assertTrue(any(path.endswith("/source_sheet.png") for path in files))
        for emitter in catalog_payload()["emitters"].values():
            expected = emitter["baseUrl"].lstrip("/") + emitter["emitter"]["file"]
            self.assertTrue(any(path.endswith(expected) for path in files), expected)


if __name__ == "__main__":
    unittest.main()
