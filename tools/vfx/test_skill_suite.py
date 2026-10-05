"""单门套件门禁：真实图鉴招式 + 临时抽象图片，不生成正式素材。"""

import base64
import hashlib
import json
from pathlib import Path
import shutil
import tempfile
import unittest

from PIL import Image
import yaml

from check_skill_suite import DELIVERABLES, check_skill_suite
from validation import ROOT, THREE_URL, save_yaml


class SkillSuiteTests(unittest.TestCase):
    moves = ("mv_yuenvjian_zhuying", "mv_yuenvjian_huizhi",
             "mv_yuenvjian_yixian", "mv_yuenvjian_wuhen")

    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.suite = self.root / "assets/default/vfx/sk_yuenvjian"
        self.catalog = ROOT / "docs/design/catalog/skills-general.md"
        emitter = self.root / "assets/default/vfx/emitters/sword"
        emitter.mkdir(parents=True)
        Image.new("RGBA", (8, 8), (80, 80, 80, 120)).save(emitter / "plate.png")
        save_yaml(emitter / "emitter-plate.yaml",
                  {"kind": "EmitterPlate", "file": "plate.png"})
        effect = self.suite / "effect/family"
        effect.mkdir(parents=True)
        Image.new("RGBA", (8, 8), (100, 100, 100, 120)).save(effect / "frame.png")
        save_yaml(effect / "effect-set.yaml", {
            "kind": "EffectSet", "source": {"files": ["frame.png"]},
            "frames": [{"file": "frame.png"}],
        })
        encoded = base64.b64encode((effect / "frame.png").read_bytes()).decode("ascii")
        html = ('<!doctype html><html><body><img src="data:image/png;base64,' + encoded
                + '"><script type="importmap">'
                + json.dumps({"imports": {"three": THREE_URL}})
                + '</script><script type="module">import * as THREE from "three";'
                + '</script></body></html>')
        entries = []
        for move in self.moves:
            directory = self.suite / "moves" / move
            directory.mkdir(parents=True)
            save_yaml(directory / "composition.yaml", {
                "kind": "Composition", "subject_ref": move,
                "effect_set": "../../effect/family/effect-set.yaml",
                "emitter_plate": "../../../emitters/sword/emitter-plate.yaml",
            })
            (directory / "composition.json").write_text("{}", encoding="utf-8")
            (directory / "demo.html").write_text(html, encoding="utf-8")
            shutil.copyfile(effect / "frame.png", directory / "peak.png")
            entries.append({
                "file": f"moves/{move}/peak.png", "size": "8x8",
                "sha256": hashlib.sha256((directory / "peak.png").read_bytes()).hexdigest(),
                "file_integrity": [self.record(directory / name) for name in DELIVERABLES],
            })
        self.manifest = self.suite / "manifest.yaml"
        self.manifest.write_text(yaml.safe_dump(entries), encoding="utf-8")

    def record(self, path):
        raw = path.read_bytes()
        return {"file": path.relative_to(self.suite).as_posix(), "bytes": len(raw),
                "sha256": hashlib.sha256(raw).hexdigest()}

    def check(self):
        return check_skill_suite(self.suite, self.catalog, repo_root=self.root)

    def test_complete_suite_contains_regular_and_ultimate_moves(self):
        # 真实卡含两普通 + 两绝招，不能只依赖绝招路线索引。
        from bind_moves import catalog_moves
        rows = [row for row in catalog_moves(self.catalog) if row["skill"] == self.suite.name]
        self.assertEqual({row["move"] for row in rows}, set(self.moves))
        self.assertEqual(sum(row["ultimate"] for row in rows), 2)
        self.assertEqual(self.check(), [])

    def test_missing_regular_move_reports_all_four_files(self):
        shutil.rmtree(self.suite / "moves" / self.moves[0])
        problems = self.check()
        for filename in DELIVERABLES:
            self.assertTrue(any(f"缺少 moves/{self.moves[0]}/{filename}" in item
                                for item in problems), problems)

    def test_emitter_cannot_be_copied_into_skill_directory(self):
        path = self.suite / "moves" / self.moves[0] / "composition.yaml"
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        data["emitter_plate"] = "../../effect/family/effect-set.yaml"
        save_yaml(path, data)
        self.assertTrue(any("emitter_plate 必须位于" in item for item in self.check()))

    def test_html_rejects_other_external_resource(self):
        path = self.suite / "moves" / self.moves[0] / "demo.html"
        with path.open("a", encoding="utf-8") as output:
            output.write('<img src="https://example.invalid/extra.png">')
        self.assertTrue(any("HTML img.src" in item for item in self.check()))

    def test_manifest_rejects_false_dimensions_and_hash(self):
        entries = yaml.safe_load(self.manifest.read_text(encoding="utf-8"))
        entries[0]["size"] = "16x8"
        entries[1]["file_integrity"][0]["sha256"] = "0" * 64
        self.manifest.write_text(yaml.safe_dump(entries), encoding="utf-8")
        problems = self.check()
        self.assertTrue(any("size=16x8，实际 8x8" in item for item in problems))
        self.assertTrue(any("sha256 不一致" in item for item in problems))


if __name__ == "__main__":
    unittest.main()
