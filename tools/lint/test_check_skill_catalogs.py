"""Unit tests for the martial-arts catalog consistency checker."""

from __future__ import annotations

from contextlib import redirect_stderr, redirect_stdout
from dataclasses import asdict
from io import StringIO
import re
import tempfile
import unittest
from unittest import mock
from pathlib import Path

from tools.lint import check_skill_catalogs as checker
from tools.agents import check_route_unique_for as route_unique


VALID_INSTANCE = """
| sk_alpha | 12 天上 | 定义 |
| mv_alpha_one MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200} |
| mv_alpha_one→mfr_alpha_one/true/attack/显式 |
<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文真值） | MeridianRouteDef（路线镜像） | steps |
|---|---|---|---|---|
| 12 天上 | sk_alpha | mv_alpha_one MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_alpha_one} | mfr_alpha_one MeridianRouteDef{moveRef:mv_alpha_one; ultimate:true; purpose:attack} | ap_renmai_qihai/80/100→ap_renmai_guanyuan/80/120 |
<!-- skill-catalog-audit:end -->
"""


def diversity_row(
    skill_id: str, move_id: str, route_id: str, points: tuple[str, ...]
) -> str:
    steps = "→".join(f"{point}/80/100" for point in points)
    return (
        f"| 9 地上 | {skill_id} | {move_id} "
        "MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; "
        f"cd:0; recovery:1200; meridianRouteRef:{route_id}}} | "
        f"{route_id} MeridianRouteDef{{moveRef:{move_id}; "
        f"ultimate:true; purpose:attack}} | {steps} |"
    )


class CatalogParserTests(unittest.TestCase):
    ROUTE_DEFINITION_SHAPES = {
        "front_index": """
### 绝招显式路线索引（镜像正文卡，非覆写层；2026-09-28）
<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 9 地上 | `sk_alpha` | `mv_alpha_one` | `mfr_alpha_one` | `MeridianRouteDef{moveRef:mv_alpha_one; ultimate:true; purpose:attack}`；`ap_renmai_qihai/80/100→ap_renmai_guanyuan/80/120` |
<!-- skill-catalog-audit:end -->
""",
        "second_or_third_ultimate": """
#### 同门第二／第三绝招显式路线
| 武学 | moveRef | 路线 ID | purpose | 职责 | 显式步骤（`ap_*/CT/风险`） |
|---|---|---|---|---|---|
| 甲门武学 | `mv_alpha_one` | `mfr_alpha_one` | attack | 单体 | `ap_renmai_qihai/80/100 → ap_renmai_guanyuan/80/120` |
""",
        "section_0_12_1": """
| `sk_alpha` | 9 地上 | 定义 |
| `mv_alpha_one` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
#### 0.12.1 天 / 地阶最终绝招路线
| 武学（品） | 路线 ID | moveRef | 资源字段 | purpose | 计时 CT | steps（依次为穴位/riskBp） |
|---|---|---|---|---|---|---|
| `sk_alpha`（9） | `mfr_alpha_one` | `mv_alpha_one` | `7 / true / 100 / 9% / 0 / 1200` | attack | `2×80 / 160 / 1360` | `ap_renmai_qihai/100→ap_renmai_guanyuan/120` |
""",
    }

    def test_route_steps_defined_once_passes_for_supported_table_shapes(self) -> None:
        for shape, text in self.ROUTE_DEFINITION_SHAPES.items():
            with self.subTest(shape=shape), tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / f"skills-{shape}.md"
                path.write_text(text, encoding="utf-8")
                definitions = checker.parse_route_step_definitions(text, path.name)
                audits = checker.audit_paths([path])
                self.assertEqual(
                    ["mfr_alpha_one"], [item.route_id for item in definitions]
                )
                self.assertEqual(0, audits[0].duplicate_step_definitions)
                self.assertFalse(any(
                    "steps defined more than once" in error
                    for error in audits[0].errors
                ))

    def test_route_steps_repeated_with_different_sequences_reports_both_locations(self) -> None:
        first = self.ROUTE_DEFINITION_SHAPES["front_index"]
        second = self.ROUTE_DEFINITION_SHAPES["section_0_12_1"].replace(
            "ap_renmai_qihai/100→ap_renmai_guanyuan/120",
            "ap_dumai_mingmen/100→ap_dumai_zhiyang/120",
        )
        with tempfile.TemporaryDirectory() as directory:
            first_path = Path(directory) / "skills-first.md"
            second_path = Path(directory) / "skills-second.md"
            first_path.write_text(first, encoding="utf-8")
            second_path.write_text(second, encoding="utf-8")
            definitions = [
                *checker.parse_route_step_definitions(first, first_path.name),
                *checker.parse_route_step_definitions(second, second_path.name),
            ]
            first_audit, second_audit = checker.audit_paths(
                [first_path, second_path]
            )
        self.assertEqual(2, len(definitions))
        self.assertEqual([], first_audit.errors)
        self.assertEqual(0, first_audit.duplicate_step_definitions)
        self.assertEqual(1, second_audit.duplicate_step_definitions)
        duplicate_errors = [
            error for error in second_audit.errors
            if "mfr_alpha_one steps defined more than once" in error
        ]
        self.assertEqual(1, len(duplicate_errors))
        for definition in definitions:
            self.assertIn(definition.location, duplicate_errors[0])

    def test_route_steps_reference_after_definition_passes(self) -> None:
        text = self.ROUTE_DEFINITION_SHAPES["front_index"] + """
#### 同门第二／第三绝招显式路线
| 武学 | moveRef | 路线 ID | 显式步骤 |
|---|---|---|---|
| 甲门武学 | `mv_alpha_one` | `mfr_alpha_one` | 见文首索引 |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            audit = checker.audit_paths([path])[0]
        self.assertEqual(0, audit.duplicate_step_definitions)
        self.assertEqual([], audit.errors)

    def test_strict_fails_on_duplicate_route_step_definition(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            first_path = Path(directory) / "skills-first.md"
            second_path = Path(directory) / "skills-second.md"
            first_path.write_text(
                "| `mfr_alpha_one` | `ap_renmai_qihai/80/100` |",
                encoding="utf-8",
            )
            second_path.write_text(
                "| `mfr_alpha_one` | `ap_renmai_qihai/80/100` |",
                encoding="utf-8",
            )
            with redirect_stdout(StringIO()):
                result = checker.main(
                    ["--strict", str(first_path), str(second_path)]
                )
        self.assertEqual(1, result)

    def test_final_instance_is_body_truth_and_route_mirror(self) -> None:
        item = checker.parse_final_instances(VALID_INSTANCE)["mv_alpha_one"]
        self.assertEqual(("sk_alpha", 12), (item.skill_id, item.grade))
        self.assertEqual(("ap_renmai_qihai", "ap_renmai_guanyuan"), item.signature)
        self.assertEqual((7, 100, 10, 0, 1200),
                         (item.layer, item.rage, item.mp_pct, item.cd, item.recovery))
        self.assertTrue(item.body_ultimate)
        self.assertTrue(item.route_ultimate)

    def test_two_moves_on_one_line_do_not_share_boolean(self) -> None:
        text = "| sk_alpha（12 天上） | mv_alpha_one ultimate:true；mv_alpha_two ultimate:false |"
        moves = checker.parse_body_moves(text)
        self.assertTrue(moves["mv_alpha_one"].ultimate)
        self.assertFalse(moves["mv_alpha_two"].ultimate)

    def test_chinese_yes_no_route_flags(self) -> None:
        text = """
| 武学 | moveRef | route | 绝／模板 |
| sk_alpha | mv_alpha_one | mfr_alpha_one | 是／A10H |
| sk_alpha | mv_alpha_two | mfr_alpha_two | 否／A6H |
"""
        routes = checker.parse_route_mirrors(text)
        self.assertTrue(routes["mv_alpha_one"].ultimate)
        self.assertFalse(routes["mv_alpha_two"].ultimate)

    def test_split_index_and_template_are_not_explicit_routes(self) -> None:
        text = """
| sk_alpha（6 玄上） | mv_alpha_one | mfr_alpha_one | 是／H6U |
| H6U | ap_renmai_qihai/75/100→ap_renmai_guanyuan/75/100 |
"""
        self.assertEqual({}, checker.explicit_route_signatures(text))
        self.assertEqual({}, checker.parse_final_instances(text))

    def test_compact_suffix_does_not_match_longer_suffix(self) -> None:
        self.assertIsNone(checker._compact_fragment(
            "| sk_alpha | 大喝 `_juyin`；狮吼 `_shizihou` |", "_hou"
        ))
        self.assertIn("_juyin", checker._compact_fragment(
            "| sk_alpha | 大喝 `_juyin`；狮吼 `_shizihou` |", "_juyin"
        ) or "")

    def test_target_body_ignores_validation_section(self) -> None:
        text = """
### sk_alpha（9 地上）
| 一式 `mv_alpha_one`（绝招；`ultimate:true`；`rageCost:100`） | 7 | 9%/0/1200 |
| mv_alpha_one→mfr_alpha_one/true/attack/A8H |
### 数据校验规则与测试用例
| 用例 | 删除 mv_alpha_one 的 ultimate:true 后应失败 |
"""
        target = checker.parse_target_routes(text)
        body = checker.parse_body_for_targets(text, target)["mv_alpha_one"]
        self.assertEqual(3, body.line)
        self.assertTrue(body.ultimate)

    def test_route_values_accept_separate_ct_column(self) -> None:
        line = (
            "| mfr_alpha_one | mv_alpha_one | 7 / true / 100 / 9% / 0 / 1200 "
            "| 2x90 / 180 / 1380 | ap_renmai_qihai/100→ap_renmai_guanyuan/120 |"
        )
        points, cts, risks = checker._route_values(line, "mfr_alpha_one")
        self.assertEqual(("ap_renmai_qihai", "ap_renmai_guanyuan"), points)
        self.assertEqual((90, 90), cts)
        self.assertEqual((100, 120), risks)

    def test_route_tokens_require_a_word_boundary(self) -> None:
        text = "| xmfr_alpha | xap_alpha/80/100 | mfr_beta | ap_beta/80/100 |"
        definitions = checker.parse_route_step_definitions(text, "fixture.md")
        self.assertEqual(1, len(definitions))
        self.assertEqual("mfr_beta", definitions[0].route_id)
        self.assertEqual(("ap_beta",), definitions[0].steps)

    def test_each_grade_uses_its_rule_quota(self) -> None:
        expected = {
            1: (0, 0), 2: (0, 0), 3: (0, 0), 4: (0, 0),
            5: (0, 0), 6: (1, 1), 7: (1, 1), 8: (1, 2),
            9: (2, 2), 10: (2, 2), 11: (2, 3), 12: (3, 3),
        }
        for grade, quota in expected.items():
            with self.subTest(grade=grade):
                self.assertEqual(
                    quota, checker.ultimate_quota(grade, "sk_new", {})
                )

    def test_tianzhong_and_dizhong_use_exact_rulings(self) -> None:
        rulings = {"sk_tian": 2, "sk_di": 1}
        self.assertEqual((2, 2), checker.ultimate_quota(11, "sk_tian", rulings))
        self.assertEqual((1, 1), checker.ultimate_quota(8, "sk_di", rulings))

    def test_actual_ruling_table_parses_all_rows(self) -> None:
        rulings = checker.parse_ultimate_rulings(checker.ULTIMATE_RULINGS_PATH)
        text = checker.ULTIMATE_RULINGS_PATH.read_text(encoding="utf-8")
        section = text.split("## 3. ", 1)[1].split("## 4. ", 1)[0]
        expected = {}
        for line in section.splitlines():
            if not line.lstrip().startswith("|"):
                continue
            skill = re.search(r"\bsk_[a-z0-9_]+\b", line)
            decided = re.search(r"\d+\s*→\s*(\d+)\s*（", line)
            if skill and decided:
                expected[skill.group(0)] = int(decided.group(1))
        self.assertEqual(expected, rulings)
        self.assertEqual(1, rulings["sk_jinzhongzhao"])
        self.assertEqual(3, rulings["sk_dagou"])

    def test_malformed_ruling_row_is_an_explicit_error(self) -> None:
        text = """
## 3. 全局逐门裁定表
| 图鉴 | `sk_*` / 名称 | 现→裁（变动） |
|---|---|---|
| 测试 | `sk_alpha` | 2→坏（0） |
## 4. 汇总
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "rulings.md"
            path.write_text(text, encoding="utf-8")
            with self.assertRaisesRegex(
                checker.UltimateRulingsError, "cannot parse skill/count"
            ):
                checker.parse_ultimate_rulings(path)

    def test_missing_ruling_table_is_an_explicit_error(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            missing = Path(directory) / "missing.md"
            with self.assertRaisesRegex(
                checker.UltimateRulingsError, "cannot read ultimate rulings"
            ):
                checker.parse_ultimate_rulings(missing)

    def test_main_returns_two_when_ruling_table_is_unreadable(self) -> None:
        original = checker.ULTIMATE_RULINGS_PATH
        try:
            checker.ULTIMATE_RULINGS_PATH = Path("/missing/nu5p-rulings.md")
            with redirect_stderr(StringIO()) as stderr:
                result = checker.main([str(checker.CATALOG_PATHS[0])])
        finally:
            checker.ULTIMATE_RULINGS_PATH = original
        self.assertEqual(2, result)
        self.assertIn("ERROR: cannot read ultimate rulings", stderr.getvalue())

    def test_unlisted_mid_grade_outside_range_warns_and_fails_quota(self) -> None:
        path = checker.CATALOG_DIR / "skills-nl3-fixture.md"
        text = """
| `sk_new_tian` | 新天中 | 11 天中 |
| `sk_new_di` | 新地中 | 8 地中 |
"""
        original_read_text = Path.read_text

        def fake_read_text(target: Path, *args: object, **kwargs: object) -> str:
            if target == path:
                return text
            return original_read_text(target, *args, **kwargs)

        with mock.patch.object(Path, "read_text", fake_read_text):
            audit = checker.audit_catalog(path, {})
        self.assertEqual(2, len(audit.warnings))
        self.assertTrue(all("未入裁定表" in item for item in audit.warnings))
        self.assertEqual(2, audit.ultimate_quota_violations)
        self.assertEqual(2, len(audit.errors))

        self.assertEqual((2, 3), checker.ultimate_quota(11, "sk_new_tian", {}))
        self.assertEqual((1, 2), checker.ultimate_quota(8, "sk_new_di", {}))
        self.assertIn("提示=2", checker.summary_row(audit))

    def test_unlisted_mid_grade_inside_range_has_warning_only(self) -> None:
        path = checker.CATALOG_DIR / "skills-nl3-fixture.md"
        original_read_text = Path.read_text
        fake_text = VALID_INSTANCE.replace(
            "sk_alpha | 12 天上", "sk_alpha | 11 天中"
        ).replace(
            "| 12 天上 | sk_alpha |", "| 11 天中 | sk_alpha |"
        ).replace(
            "<!-- skill-catalog-audit:end -->",
            "| 11 天中 | sk_alpha | mv_alpha_two "
            "MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; "
            "cd:0; recovery:1200; meridianRouteRef:mfr_alpha_two} | "
            "mfr_alpha_two MeridianRouteDef{moveRef:mv_alpha_two; "
            "ultimate:true; purpose:attack} | "
            "ap_dumai_mingmen/80/100→ap_dumai_zhiyang/80/120 |\n"
            "<!-- skill-catalog-audit:end -->",
        ).replace(
            "<!-- skill-catalog-audit:start -->",
            "| mv_alpha_two MoveDef{unlock:9; ultimate:true; rageCost:100; "
            "mpCost:10%; cd:0; recovery:1200} |\n"
            "| mv_alpha_two→mfr_alpha_two/true/attack/显式 |\n"
            "<!-- skill-catalog-audit:start -->",
        ) + "\n| txp_alpha | outOfBattleScaleBp:15000 |\n"

        def fake_read_text(target: Path, *args: object, **kwargs: object) -> str:
            if target == path:
                return fake_text
            return original_read_text(target, *args, **kwargs)

        with mock.patch.object(Path, "read_text", fake_read_text):
            audit = checker.audit_catalog(path, {})
        quota_errors = [
            item for item in audit.errors if "ultimates, expected" in item
        ]
        self.assertEqual([], quota_errors)
        self.assertEqual(0, audit.ultimate_quota_violations)
        self.assertEqual(1, len(audit.warnings))
        self.assertIn("未入裁定表", audit.warnings[0])

    def test_official_catalog_inventory_includes_zero_ultimate_low_grade(self) -> None:
        path = checker.CATALOG_DIR / "skills-nl3-fixture.md"
        original_read_text = Path.read_text
        text = "| `sk_low` | 入门武学 | 1 黄下 |\n"

        def fake_read_text(target: Path, *args: object, **kwargs: object) -> str:
            if target == path:
                return text
            return original_read_text(target, *args, **kwargs)

        with mock.patch.object(Path, "read_text", fake_read_text):
            audit = checker.audit_catalog(path, {})
        self.assertEqual(0, audit.ultimate_quota_violations)
        self.assertEqual([], audit.errors)

    def test_official_catalog_rejects_low_grade_ultimate(self) -> None:
        path = checker.CATALOG_DIR / "skills-nl3-fixture.md"
        original_read_text = Path.read_text
        text = VALID_INSTANCE.replace(
            "sk_alpha | 12 天上", "sk_alpha | 5 玄中"
        ).replace(
            "| 12 天上 | sk_alpha |", "| 5 玄中 | sk_alpha |"
        ) + "\n| txp_alpha | outOfBattleScaleBp:15000 |\n"

        def fake_read_text(target: Path, *args: object, **kwargs: object) -> str:
            if target == path:
                return text
            return original_read_text(target, *args, **kwargs)

        with mock.patch.object(Path, "read_text", fake_read_text):
            audit = checker.audit_catalog(path, {})
        self.assertEqual(1, audit.ultimate_quota_violations)
        self.assertTrue(any(
            "grade 5 has 1 ultimates, expected 0..0" in error
            for error in audit.errors
        ))

    def test_quota_counts_body_ultimate_without_route_target(self) -> None:
        path = checker.CATALOG_DIR / "skills-nl3-fixture.md"
        original_read_text = Path.read_text
        text = """
#### `sk_new_di` 新地中（8 地中）
| 招式 | ID | 运行字段 |
|---|---|---|
| 一式 | `mv_new_di_one` | `MoveDef{ultimate:true}` |
| 二式 | `mv_new_di_two` | `MoveDef{ultimate:true}` |
"""

        def fake_read_text(target: Path, *args: object, **kwargs: object) -> str:
            if target == path:
                return text
            return original_read_text(target, *args, **kwargs)

        with mock.patch.object(Path, "read_text", fake_read_text):
            audit = checker.audit_catalog(path, {"sk_new_di": 1})
        self.assertEqual(1, audit.ultimate_quota_violations)
        self.assertEqual(2, audit.body_ultimate_count)
        self.assertEqual(2, audit.tier_counts["地"]["body_ultimates"])
        self.assertTrue(any(
            "sk_new_di grade 8 has 2 ultimates, expected 1..1" in error
            for error in audit.errors
        ))
        self.assertEqual(2, sum(
            "缺路线" in error for error in audit.errors
        ))

    def test_body_ultimate_without_route_has_named_missing_route_error(self) -> None:
        path = checker.CATALOG_DIR / "skills-nl3-fixture.md"
        text = """
#### `sk_alpha` 测试武学（6 玄上）
| 招式 | 层 | 字段 |
|---|---:|---|
| 无路绝招 `mv_alpha_lost` | 7 | `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
"""
        original_read_text = Path.read_text

        def fake_read_text(target: Path, *args: object, **kwargs: object) -> str:
            if target == path:
                return text
            return original_read_text(target, *args, **kwargs)

        with mock.patch.object(Path, "read_text", fake_read_text):
            audit = checker.audit_catalog(path, {})
        self.assertTrue(any(
            "mv_alpha_lost" in error and "缺路线" in error
            for error in audit.errors
        ))

    def test_trailing_contract_belongs_to_the_move_labelled_ultimate(self) -> None:
        text = """
#### `sk_alpha` 测试武学（6 玄上）
- 招式：绝式 `mv_alpha_final`（绝招，单体）；换手 `mv_alpha_swap`（换位）；收势 `mv_alpha_close`（防守）。；`MoveDef{unlock:7; ultimate:true}`
"""
        grades, _ = checker.parse_skill_grades(text)
        items = checker.parse_body_ultimates(text, grades, {})
        self.assertEqual(["mv_alpha_final"], [item.move_id for item in items])

    def test_parallel_inline_contracts_are_bound_to_their_own_moves(self) -> None:
        text = """
#### `sk_alpha` 测试武学（9 地上）
- `mv_alpha_first` `MoveDef{ultimate:true}`；`mv_alpha_second` `MoveDef{ultimate:true}`
"""
        grades, _ = checker.parse_skill_grades(text)
        items = checker.parse_body_ultimates(text, grades, {})
        self.assertEqual(
            ["mv_alpha_first", "mv_alpha_second"],
            [item.move_id for item in items],
        )

    def test_ruling_for_non_mid_grade_is_reported_as_stale(self) -> None:
        path = checker.CATALOG_DIR / "skills-nl3-fixture.md"
        text = """
#### `sk_old_ruling` 测试武学（9 地上）
| 一式 `mv_old_ruling_one` | `MoveDef{ultimate:true}` |
| 二式 `mv_old_ruling_two` | `MoveDef{ultimate:true}` |
"""
        original_read_text = Path.read_text

        def fake_read_text(target: Path, *args: object, **kwargs: object) -> str:
            if target == path:
                return text
            return original_read_text(target, *args, **kwargs)

        with mock.patch.object(Path, "read_text", fake_read_text):
            audit = checker.audit_catalog(path, {"sk_old_ruling": 1})
        self.assertEqual(0, audit.ultimate_quota_violations)
        self.assertTrue(any(
            "sk_old_ruling" in warning and "过时裁定" in warning
            for warning in audit.warnings
        ))

    def test_unowned_body_ultimate_is_explicit_error(self) -> None:
        counts, issues = checker.parse_body_ultimate_counts(
            "`MoveDef{ultimate:true}`", {}, {}
        )
        self.assertEqual({}, counts)
        self.assertEqual(
            [(1, "ultimate MoveDef has no formal skill owner")], issues
        )

    def test_each_breath_profile_needs_field_on_its_own_row(self) -> None:
        text = """
| id | outOfBattleScaleBp |
| txp_ok | outOfBattleScaleBp:15000 |
| txp_bad | 1000 / 0 / 15000 |
说明：所有档案统一 outOfBattleScaleBp:15000。
"""
        profiles = checker.parse_breath_profiles(text)
        self.assertTrue(profiles["txp_ok"][1])
        self.assertFalse(profiles["txp_bad"][1])

    def test_later_formal_breath_definition_beats_reference(self) -> None:
        text = """
说明文字先引用 txp_alpha。
| sk_alpha | txp_alpha | 6/10/harmony/2/1000/0/15000 |
| sk_beta | txp_beta | outOfBattleScaleBp:15000 |
"""
        profiles = checker.parse_breath_profiles(text)
        self.assertEqual({"txp_alpha", "txp_beta"}, set(profiles))
        self.assertFalse(profiles["txp_alpha"][1])
        self.assertTrue(profiles["txp_beta"][1])

    def test_target_routes_include_grade_six_final_table(self) -> None:
        text = """
| sk_alpha | 6 玄上 | 说明 |
| sk_alpha | mv_alpha_one | mfr_alpha_one | A6H（§2） |
"""
        targets = checker.parse_target_routes(text)
        self.assertEqual(["mv_alpha_one"], list(targets))
        self.assertTrue(targets["mv_alpha_one"].ultimate)

    def test_target_route_rejects_multi_id_summary_row(self) -> None:
        text = """
| sk_alpha | 6 玄上 | 说明 |
| sk_alpha / sk_beta | mv_alpha / mv_beta | mfr_alpha | A6H |
"""
        self.assertEqual({}, checker.parse_target_routes(text))

    def test_grade_six_signature_checks_only_unregistered_warning(self) -> None:
        text = """
| sk_alpha | 6 玄上 | 定义 |
| mv_alpha_one MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200} |
| mv_alpha_one→mfr_alpha_one/true/attack/显式；ap_fixture_unknown/200/100 |
<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文真值） | MeridianRouteDef（路线镜像） | steps |
|---|---|---|---|---|
| 6 玄上 | sk_alpha | mv_alpha_one MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_alpha_one} | mfr_alpha_one MeridianRouteDef{moveRef:mv_alpha_one; ultimate:true; purpose:attack} | ap_fixture_unknown/200/100→ap_fixture_unknown/200/100 |
<!-- skill-catalog-audit:end -->
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            registry = Path(directory) / "acupoints.md"
            path.write_text(text, encoding="utf-8")
            registry.write_text(
                "`ap_renmai_qihai` `ap_renmai_guanyuan`", encoding="utf-8"
            )
            with mock.patch.object(checker, "is_official_catalog", return_value=True), \
                    mock.patch.object(checker, "ACUPOINT_REGISTRY", registry):
                audit = checker.audit_catalog(path, {})

        self.assertEqual(1, audit.unregistered_acupoint_warnings)
        self.assertIn("未登记穴位提示=1", checker.summary_row(audit))
        self.assertTrue(any(
            "mfr_alpha_one uses unregistered acupoints ap_fixture_unknown"
            in warning for warning in audit.warnings
        ))
        self.assertFalse(any(
            "unregistered acupoints" in error for error in audit.errors
        ))
        self.assertFalse(any(
            token in error for error in audit.errors
            for token in ("repeats an acupoint", "segmentCt outside")
        ))

    def test_registered_acupoint_check_ignores_external_route_sentinel(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-wujue.md"
            registry = Path(directory) / "acupoints.md"
            path.write_text("# fixture\n", encoding="utf-8")
            registry.write_text("`ap_renmai_qihai`", encoding="utf-8")
            with mock.patch.object(
                checker, "is_official_catalog", return_value=True
            ), mock.patch.object(checker, "ACUPOINT_REGISTRY", registry):
                audit = checker.audit_catalog(path, {})

        self.assertFalse(any(
            "unregistered acupoints external:" in error
            for error in audit.errors
        ))

    def test_final_signature_unregistered_is_warning_for_heaven_and_earth(self) -> None:
        for grade in (9, 12):
            text = VALID_INSTANCE.replace(
                "12 天上", f"{grade} {'地上' if grade == 9 else '天上'}"
            ).replace("ap_renmai_guanyuan/80/120", "ap_fixture_unknown/80/120")
            if grade == 9:
                text = text.replace("mpCost:10%", "mpCost:9%")
            with self.subTest(grade=grade), tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / "skills-fixture.md"
                registry = Path(directory) / "acupoints.md"
                path.write_text(text, encoding="utf-8")
                registry.write_text("`ap_renmai_qihai`", encoding="utf-8")
                with mock.patch.object(checker, "is_official_catalog", return_value=True), \
                        mock.patch.object(checker, "ACUPOINT_REGISTRY", registry):
                    audit = checker.audit_catalog(path, {})
            self.assertEqual(1, audit.unregistered_acupoint_warnings)
            self.assertFalse(any(
                "unregistered acupoints" in error for error in audit.errors
            ))

    def test_route_line_unregistered_keeps_legacy_strict_error(self) -> None:
        text = VALID_INSTANCE.replace(
            "mv_alpha_one→mfr_alpha_one/true/attack/显式",
            "mv_alpha_one→mfr_alpha_one/true/attack/显式；"
            "ap_renmai_qihai/80/100→ap_fixture_unknown/80/120",
        )
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            registry = Path(directory) / "acupoints.md"
            path.write_text(text, encoding="utf-8")
            registry.write_text(
                "`ap_renmai_qihai` `ap_renmai_guanyuan`", encoding="utf-8"
            )
            with mock.patch.object(checker, "is_official_catalog", return_value=True), \
                    mock.patch.object(checker, "ACUPOINT_REGISTRY", registry):
                audit = checker.audit_catalog(path, {})
        self.assertTrue(any(
            "uses unregistered acupoints ap_fixture_unknown" in error
            for error in audit.errors
        ))
        self.assertEqual(0, audit.unregistered_acupoint_warnings)

    def test_wujue_external_xianglong_targets_are_canonical(self) -> None:
        targets = checker.parse_target_routes("", "wujue")
        self.assertEqual(set(checker.EXTERNAL_WUJUE), set(targets))
        self.assertEqual("mfr_eighteen_palms_chain",
                         targets["mv_xianglong18_lianhuan"].route_id)
        self.assertNotEqual(
            "mfr_" + "mv_xianglong18_lianhuan".removeprefix("mv_"),
            targets["mv_xianglong18_lianhuan"].route_id,
        )

    def test_target_body_ignores_route_and_prefers_move_def(self) -> None:
        text = """
| sk_alpha | 9 地上 | 定义 |
| mv_alpha_one | 7 | 绝招但无字段 |
| mv_alpha_one→mfr_alpha_one/true/attack/A8H |
| mv_alpha_one MoveDef{unlock:7,ultimate:true,rageCost:100,mpCost:9%,cd:0,recovery:1200} |
"""
        targets = checker.parse_target_routes(text)
        body = checker.parse_body_for_targets(text, targets)["mv_alpha_one"]
        self.assertTrue(body.ultimate)
        self.assertEqual((7, 100, 9, 1200),
                         (body.layer, body.rage, body.mp_pct, body.recovery))

    def test_duplicate_acupoint_sequence_is_counted_within_skill(self) -> None:
        text = """
<!-- skill-catalog-audit:start -->
| 9 地上 | sk_alpha | mv_alpha_one MoveDef{unlock:7,ultimate:true,rageCost:100,mpCost:9%,cd:0,recovery:1200} | mfr_alpha_one MeridianRouteDef{moveRef:mv_alpha_one,ultimate:true,purpose:attack} | ap_renmai_qihai/90/100→ap_renmai_guanyuan/90/100 |
| 9 地上 | sk_alpha | mv_alpha_two MoveDef{unlock:9,ultimate:true,rageCost:100,mpCost:9%,cd:0,recovery:1200} | mfr_alpha_two MeridianRouteDef{moveRef:mv_alpha_two,ultimate:true,purpose:defense} | ap_renmai_qihai/90/100→ap_renmai_guanyuan/90/100 |
<!-- skill-catalog-audit:end -->
| txp_alpha | outOfBattleScaleBp:15000 |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            audit = checker.audit_catalog(path)
        self.assertEqual(1, audit.duplicate_routes)

    def test_duplicate_route_template_is_counted_within_skill(self) -> None:
        text = """
| sk_alpha | 9 地上 | 定义 |
| mv_alpha_one MoveDef{unlock:7,rageCost:100,mpCost:9%,cd:0,recovery:1200} |
| mv_alpha_two MoveDef{unlock:9,rageCost:100,mpCost:9%,cd:0,recovery:1200} |
| sk_alpha | mv_alpha_one | mfr_alpha_one | 是／K-A1 |
| sk_alpha | mv_alpha_two | mfr_alpha_two | 是／K-A1 |
| txp_alpha | outOfBattleScaleBp:15000 |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            audit = checker.audit_catalog(path)
        self.assertEqual(1, audit.duplicate_routes)

    def test_rotated_and_high_overlap_routes_are_rejected(self) -> None:
        a = tuple(f"ap_a{i}" for i in range(8))
        rotated = a[1:] + a[:1]
        overlap = a[:5] + tuple(f"ap_b{i}" for i in range(3))
        self.assertEqual("cyclic rotation",
                         checker._route_similarity_reason(a, rotated))
        self.assertIn("shared acupoints 5/8",
                      checker._route_similarity_reason(a, overlap) or "")

    def test_half_shared_routes_are_allowed(self) -> None:
        a = tuple(f"ap_a{i}" for i in range(8))
        b = a[:4] + tuple(f"ap_b{i}" for i in range(4))
        self.assertIsNone(checker._route_similarity_reason(a, b))

    def test_summary_skill_counts_include_formal_skills_without_targets(self) -> None:
        text = VALID_INSTANCE + """
| sk_unrelated | 9 地上 | no ultimate |
| txp_alpha | outOfBattleScaleBp:15000 |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            audit = checker.audit_catalog(path)
        self.assertEqual(1, audit.tier_counts["天"]["skills"])
        self.assertEqual(1, audit.tier_counts["地"]["skills"])

    def test_missing_body_counts_as_unlock_and_implicit_route_violation(self) -> None:
        text = """
| sk_alpha | 9 地上 | definition |
| sk_alpha | mv_alpha_one | mfr_alpha_one | 是／A8H |
| txp_alpha | outOfBattleScaleBp:15000 |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            audit = checker.audit_catalog(path)
        self.assertEqual(1, audit.unlock_violations)
        self.assertEqual(1, audit.implicit_routes)

    def test_legacy_buff_migration_prose_is_ignored(self) -> None:
        text = """
迁移说明：旧 ID bf_fengxue 替换为 bf_xueweishoufeng。
| mv_alpha_one | 命中施加 bf_fengxue 50%·1 |
"""
        found = checker.old_buff_runtime_lines(text)
        self.assertEqual(1, len(found))

    def test_compact_legacy_buff_runtime_is_rejected(self) -> None:
        text = "| 控制系数 | bf_fengjingmai 30%；bf_chanrao 20% |"
        self.assertEqual(2, checker.old_buff_runtime_occurrences(text))

    def test_mirror_unlock_cannot_override_body_card(self) -> None:
        marker = "<!-- skill-catalog-audit:start -->"
        before, separator, after = VALID_INSTANCE.partition(marker)
        text = before + separator + after.replace(
            "unlock:7; ultimate:true; rageCost:100",
            "unlock:9; ultimate:true; rageCost:100", 1)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            audit = checker.audit_catalog(path)
        self.assertEqual(1, audit.body_index_mismatches)
        self.assertTrue(any("mirror" in error for error in audit.errors))

    def test_body_without_literal_ultimate_is_rejected(self) -> None:
        text = VALID_INSTANCE.replace("ultimate:true; ", "", 1)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            audit = checker.audit_catalog(path)
        self.assertTrue(any("lacks ultimate:true" in error for error in audit.errors))

    def test_visible_resource_must_match_inline_move_def(self) -> None:
        text = VALID_INSTANCE.replace(
            "| mv_alpha_one MoveDef{unlock:7; ultimate:true; rageCost:100; "
            "mpCost:10%; cd:0; recovery:1200} |",
            "| mv_alpha_one | 7 | 10%/—/1200 | MoveDef{unlock:7; "
            "ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200} |",
            1,
        )
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            audit = checker.audit_catalog(path)
        self.assertTrue(any(
            "visible mpCost=10 != MoveDef 9" in error for error in audit.errors
        ))

    def test_move_id_prefix_does_not_claim_longer_normal_move(self) -> None:
        text = """
| sk_alpha | 9 地上 | 定义 |
| 普通招 mv_x_poqiang | 3 | ultimate:true |
| sk_alpha | mv_x_poqi | mfr_x_poqi | 是／A8H |
"""
        targets = checker.parse_target_routes(text)
        body = checker.parse_body_for_targets(text, targets)
        self.assertNotIn("mv_x_poqi", body)

    def test_audit_accepts_valid_machine_contract(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(
                VALID_INSTANCE + "\n| txp_alpha | outOfBattleScaleBp:15000 |\n",
                encoding="utf-8",
            )
            audit = checker.audit_catalog(path)
        self.assertEqual((1, 1), (audit.body_ultimate_count, audit.route_ultimate_count))
        self.assertEqual([], audit.errors)


class DiversityTests(unittest.TestCase):
    POINTS = tuple(f"ap_test_{index}" for index in range(1, 6))

    def write_catalog(
        self, directory: str, name: str, rows: list[str]
    ) -> Path:
        path = Path(directory) / f"skills-{name}.md"
        path.write_text("\n".join(rows), encoding="utf-8")
        return path

    def test_analysis_counts_exact_and_eighty_percent_across_skills(self) -> None:
        exact = diversity_row(
            "sk_alpha", "mv_alpha_one", "mfr_alpha_one", self.POINTS
        )
        copied = diversity_row(
            "sk_beta", "mv_beta_one", "mfr_beta_one", self.POINTS
        )
        overlap = diversity_row(
            "sk_gamma", "mv_gamma_one", "mfr_gamma_one",
            self.POINTS[:4] + ("ap_other",),
        )
        with tempfile.TemporaryDirectory() as directory:
            first = self.write_catalog(directory, "first", [exact, copied])
            second = self.write_catalog(directory, "second", [overlap])
            report = checker.analyze_route_diversity([first, second])

        self.assertEqual((3, 2), (report.route_count, report.distinct_sequences))
        self.assertEqual(1, len(report.exact_groups))
        self.assertEqual(2, report.exact_groups[0].skill_count)
        self.assertEqual(3, report.similar_pair_count)
        self.assertEqual(1, report.exact_pair_count)
        self.assertEqual(2, report.warning_pair_count)
        self.assertEqual(1, report.catalogs[0].exact_group_count)
        self.assertEqual(0, report.catalogs[1].exact_group_count)
        self.assertEqual(2, report.cross_catalog_similar_pair_count)
        self.assertEqual(2, report.catalogs[0].cross_catalog_similar_pair_count)
        self.assertEqual(2, report.catalogs[1].cross_catalog_similar_pair_count)
        self.assertEqual(0, report.catalogs[0].cross_catalog_exact_pair_count)

    def test_similarity_uses_smaller_route_and_excludes_same_skill(self) -> None:
        left = checker.DiversityRoute(
            "first", "first.md", 1, "sk_alpha", "mv_a", "mfr_a",
            self.POINTS,
        )
        eighty = checker.DiversityRoute(
            "first", "first.md", 2, "sk_beta", "mv_b", "mfr_b",
            self.POINTS[:4],
        )
        seventy_five = checker.DiversityRoute(
            "first", "first.md", 3, "sk_gamma", "mv_c", "mfr_c",
            self.POINTS[:3] + ("ap_other",),
        )
        same_skill = checker.DiversityRoute(
            "first", "first.md", 4, "sk_alpha", "mv_d", "mfr_d",
            self.POINTS,
        )
        report = checker.analyze_diversity_routes(
            [left, eighty, seventy_five, same_skill]
        )
        pairs = {(pair.left.route_id, pair.right.route_id) for pair in report.pairs}
        self.assertIn(("mfr_a", "mfr_b"), pairs)
        self.assertNotIn(("mfr_a", "mfr_c"), pairs)
        self.assertNotIn(("mfr_a", "mfr_d"), pairs)

    def test_reordered_same_points_is_warning_not_exact_sequence(self) -> None:
        left = checker.DiversityRoute(
            "first", "first.md", 1, "sk_alpha", "mv_a", "mfr_a",
            self.POINTS,
        )
        reordered = checker.DiversityRoute(
            "second", "second.md", 2, "sk_beta", "mv_b", "mfr_b",
            tuple(reversed(self.POINTS)),
        )
        report = checker.analyze_diversity_routes([left, reordered])

        self.assertEqual(0, len(report.exact_groups))
        self.assertEqual(0, report.exact_pair_count)
        self.assertEqual(1, report.warning_pair_count)
        self.assertEqual(10000, report.pairs[0].overlap_bp)

    def test_external_wujue_routes_are_read_from_design_21(self) -> None:
        route_ids = list(checker.EXTERNAL_WUJUE.values())
        blocks = []
        for index, (skill_id, route_id, _grade) in enumerate(route_ids, 1):
            move_id = next(
                move for move, owner in checker.EXTERNAL_WUJUE.items()
                if owner[1] == route_id
            )
            blocks.append(
                f"  - id: {route_id}\n"
                f"    moveRef: {move_id}\n"
                "    ultimate: true\n"
                "    steps:\n"
                f"      - {{ acupointRef: ap_test_{index} }}"
            )
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "21.md"
            path.write_text("\n".join(blocks), encoding="utf-8")
            routes = checker.parse_external_wujue_diversity_routes(path)

        self.assertEqual(3, len(routes))
        self.assertEqual("wujue", routes[0].catalog)
        self.assertEqual(
            set(checker.EXTERNAL_WUJUE), {route.move_id for route in routes}
        )

    def test_cli_report_never_fails_and_strict_fails_only_on_exact(self) -> None:
        exact_rows = [
            diversity_row("sk_alpha", "mv_a", "mfr_a", self.POINTS),
            diversity_row("sk_beta", "mv_b", "mfr_b", self.POINTS),
        ]
        warning_rows = [
            diversity_row("sk_alpha", "mv_a", "mfr_a", self.POINTS),
            diversity_row(
                "sk_beta", "mv_b", "mfr_b",
                self.POINTS[:4] + ("ap_other",),
            ),
        ]
        with tempfile.TemporaryDirectory() as directory:
            exact = self.write_catalog(directory, "exact", exact_rows)
            warning = self.write_catalog(directory, "warning", warning_rows)
            with redirect_stdout(StringIO()) as output:
                report_code = checker.main(["--diversity", str(exact)])
            with redirect_stdout(StringIO()) as strict_output:
                strict_code = checker.main(["--diversity-strict", str(exact)])
            with redirect_stdout(StringIO()) as warning_output:
                warning_code = checker.main(["--diversity-strict", str(warning)])

        self.assertEqual(0, report_code)
        self.assertIn("exact_groups=1", output.getvalue())
        self.assertIn("EXACT sequence", output.getvalue())
        self.assertNotIn("ERROR exact sequence", output.getvalue())
        self.assertEqual(1, strict_code)
        self.assertIn(
            "ERROR: identical ordered sequences exist across different skills",
            strict_output.getvalue(),
        )
        self.assertIn("ERROR exact sequence", strict_output.getvalue())
        self.assertNotIn("  EXACT sequence", strict_output.getvalue())
        self.assertEqual(0, warning_code)
        self.assertIn("WARNING", warning_output.getvalue())
        self.assertIn("mfr_a", output.getvalue())

    def test_existing_strict_does_not_run_diversity(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = self.write_catalog(directory, "empty", [])
            with mock.patch.object(
                checker, "analyze_route_diversity",
                side_effect=AssertionError("diversity must be opt-in"),
            ), redirect_stdout(StringIO()):
                result = checker.main(["--strict", str(path)])
        self.assertEqual(0, result)


class OutletRegressionTests(unittest.TestCase):
    def route(
        self, delivery: str | None, points: tuple[str, ...], *,
        voice: bool | None = None, purpose: str = "attack",
        skill_id: str = "sk_fixture",
    ) -> checker.DeliveryRoute:
        return checker.DeliveryRoute(
            "fixture", "skills-fixture.md", 1, skill_id, "mv_fixture_one",
            "mfr_fixture_one", points, delivery, purpose, voice is True,
            True, voice,
        )

    def test_each_outlet_type_excludes_tail_but_keeps_same_point_in_body(self) -> None:
        cases = (
            ("palm", "ap_shoujueyin_laogong", None),
            ("fist-grapple", "ap_shouyangming_hegu", None),
            ("finger", "ap_shoutaiyin_shaoshang", None),
            ("leg", "ap_zuyangming_lidui", None),
            ("weapon", "ap_shoushaoyang_yangchi", None),
            ("weapon", "ap_shoushaoyang_waiguan", None),
            (None, "ap_yinwei_tiantu", True),
            (None, "ap_yinwei_lianquan", True),
            ("movement", "ap_zushaoyang_zuqiaoyin", None),
            ("movement", "ap_yangqiao_shenmai", None),
            ("movement", "ap_zushaoyin_yongquan", None),
            ("inner", "ap_renmai_qihai", None),
            ("inner", "ap_dumai_mingmen", None),
        )
        ownership = checker.load_acupoint_meridians()
        natures = checker.load_meridian_natures()
        for delivery, point, voice in cases:
            with self.subTest(delivery=delivery, point=point):
                point_nature = natures[ownership[point]]
                other = ("ap_renmai_qihai" if point_nature == "yang"
                         else "ap_dumai_mingmen")
                route = self.route(delivery, (
                    point, other, "ap_unknown_a", "ap_unknown_b", point,
                ), voice=voice)
                outlets = checker.route_outlet_points(route, ownership)
                self.assertEqual({point}, outlets)
                self.assertEqual(point_nature, checker.route_nature(
                    route.signature, ownership, natures,
                ))
                self.assertEqual("harmony", checker.route_nature(
                    route.signature, ownership, natures, outlets,
                ))

    def test_movement_uses_registered_meridian_and_keeps_unmatched_tail(self) -> None:
        route = self.route("movement", (
            "ap_daimai_wushu", "ap_zutaiyang_chengshan",
            "ap_zushaoyang_xuanzhong",
        ))
        self.assertEqual(
            {"ap_daimai_wushu", "ap_zushaoyang_xuanzhong"},
            checker.route_outlet_points(route),
        )
        self.assertEqual("yang", checker.route_nature(
            route.signature, outlet_points=checker.route_outlet_points(route),
        ))
        # Ownership, not a misleading legacy ID prefix, selects the outlet.
        remapped = self.route(None, (
            "ap_alias_step", "ap_zushaoyang_fake",
        ), purpose="movement")
        self.assertEqual({"ap_alias_step"}, checker.route_outlet_points(
            remapped, {"ap_alias_step": "mer_daimai",
                       "ap_zushaoyang_fake": "mer_shoutaiyin"},
        ))

    def test_inner_tail_only_excludes_registered_ren_du_points(self) -> None:
        route = self.route("inner", (
            "ap_dumai_mingmen", "ap_shouyangming_hegu", "ap_renmai_qihai",
        ), purpose="defense")
        self.assertEqual(
            {"ap_dumai_mingmen", "ap_renmai_qihai"},
            checker.route_outlet_points(route),
        )
        self.assertEqual("yang", checker.route_nature(
            route.signature, outlet_points=checker.route_outlet_points(route),
        ))

    def test_card_actions_classify_fist_rope_and_physical_hidden_weapon(self) -> None:
        cases = (
            ("sk_fist", "测试拳", "拳脚/拳掌", "", "fist-grapple",
             "ap_shouyangming_hegu"),
            ("sk_rope", "索阵", "杂学/阵法",
             "- **简述**：三人各持长索结阵。\n", "weapon",
             "ap_shoushaoyang_yangchi"),
            ("sk_dagger", "水榭飞刀", "暗器", "", "weapon",
             "ap_shoushaoyang_waiguan"),
        )
        for skill, name, category, synopsis, expected, point in cases:
            with self.subTest(skill=skill):
                text = (
                    f"### `{skill}` {name}（9 地上 · {category}）\n"
                    + synopsis
                    + "| 绝招 `mv_fixture_one` | `MoveDef{ultimate:true}` |\n"
                    + diversity_row(skill, "mv_fixture_one", "mfr_fixture_one",
                                    ("ap_dumai_mingmen", point))
                )
                with tempfile.TemporaryDirectory() as directory:
                    path = Path(directory) / "skills-fixture.md"
                    path.write_text(text, encoding="utf-8")
                    routes = checker.collect_delivery_routes([path])
                self.assertEqual(1, len(routes))
                self.assertEqual(expected, routes[0].delivery)
                self.assertIn(point, checker.route_outlet_points(routes[0]))

    def test_hidden_or_formation_category_alone_does_not_prove_held_weapon(self) -> None:
        for skill, move in (
            ("`sk_smoke` 毒烟（暗器）", "毒雾外散"),
            ("`sk_insect` 毒虫（subType:hidden）", "放虫"),
            ("`sk_pattern` 合阵（杂学/阵法）", "阵势支援"),
            ("`sk_coarse` 旧拳掌（拳脚/拳掌）", "第一式"),
            ("`sk_xinyiba` 心意把（拳脚/拳掌）", "第一式"),
            ("`sk_pattern` 合阵（杂学/阵法）；前置：持长索", "第一式"),
            ("`sk_coarse` 旧拳掌；prereq:[sk_xinyiba]", "第一式"),
            ("`sk_smoke` 毒煙（暗器）；reqs:{note:飞刀}", "第一式"),
        ):
            with self.subTest(skill=skill):
                self.assertIsNone(checker._delivery_from_context(skill, move))
        for context in ("持索击敌", "持长索结阵", "持鞭索锁拿"):
            with self.subTest(context=context):
                self.assertEqual("weapon", checker._delivery_from_context(
                    "`sk_pattern` 合阵（杂学/阵法）", context,
                ))
        self.assertEqual("weapon", checker._delivery_from_context(
            "`sk_needle` 飞针；category:hidden; subType:hidden", "投针",
        ))

    def test_route_action_fallback_requires_own_explicit_action_column(self) -> None:
        cases = (
            ("动作末端或关键段", "末以天泉—合谷成拳", "mfr_fixture_one",
             "fist-grapple"),
            ("本轮换穴", "末以天泉—合谷成拳", "mfr_fixture_one", None),
            ("前置动作", "末以天泉—合谷成拳", "mfr_fixture_one", None),
            ("动作末端", "第一式；前置：成拳", "mfr_fixture_one", None),
            ("动作末端", "末以天泉—合谷成拳", "mfr_other_one", None),
            ("动作末端", "成拳", "mfr_fixture_one mfr_other_one", None),
        )
        for header, description, reference, expected in cases:
            with self.subTest(header=header, description=description,
                              reference=reference):
                text = (
                    "### `sk_arbitrary` 无名把（9 地上 · 拳脚/拳掌）\n"
                    "| 绝招 `mv_fixture_one` | `MoveDef{ultimate:true}` |\n"
                    + diversity_row("sk_arbitrary", "mv_fixture_one",
                                    "mfr_fixture_one",
                                    ("ap_dumai_mingmen", "ap_shouyangming_hegu"))
                    + f"\n\n| 路线 | {header} | 前置 | 本轮换穴 |\n"
                    "|---|---|---|---|\n"
                    f"| {reference} | {description} | 成拳 | 成拳 |\n"
                )
                with tempfile.TemporaryDirectory() as directory:
                    path = Path(directory) / "skills-fixture.md"
                    path.write_text(text, encoding="utf-8")
                    route = checker.collect_delivery_routes([path])[0]
                self.assertEqual(expected, route.delivery)
                if expected:
                    self.assertIn("成拳", route.action_context)
                    self.assertEqual({"ap_shouyangming_hegu"},
                                     checker.route_outlet_points(route))

    def test_route_action_fallback_does_not_override_a_classified_palm(self) -> None:
        text = (
            "### `sk_alpha` 测试掌（9 地上 · 拳脚/拳掌）\n"
            "| 绝招 `mv_fixture_one` | `MoveDef{ultimate:true}` |\n"
            + diversity_row("sk_alpha", "mv_fixture_one", "mfr_fixture_one",
                            ("ap_dumai_mingmen", "ap_shouyangming_hegu"))
            + "\n\n| 路线 | 动作末端 |\n|---|---|\n"
            "| mfr_fixture_one | 虎口抓拿成拳 |\n"
        )
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            route = checker.collect_delivery_routes([path])[0]
        self.assertEqual("palm", route.delivery)
        self.assertNotIn("虎口抓拿成拳", route.action_context)
        self.assertEqual(set(), checker.route_outlet_points(route))

    def test_vocal_false_overrides_legacy_and_other_types_do_not_gain_outlets(self) -> None:
        points = ("ap_yinwei_tiantu", "ap_yinwei_lianquan")
        for voice, expected in ((True, set(points)), (None, set(points)),
                                (False, set())):
            with self.subTest(voice=voice):
                route = self.route(None, points, voice=voice,
                                   skill_id="sk_shizihou")
                self.assertEqual(expected, checker.route_outlet_points(route))
        for delivery, point in ((None, "ap_yinwei_tiantu"),
                                ("weapon", "ap_zushaoyin_yongquan"),
                                ("palm", "ap_renmai_qihai")):
            with self.subTest(delivery=delivery, point=point):
                self.assertEqual(set(), checker.route_outlet_points(
                    self.route(delivery, (point,)),
                ))


class DeliveryTests(unittest.TestCase):
    def route(
        self, delivery: str | None, points: tuple[str, ...], *,
        purpose: str = "attack", projection: bool = False,
        skill_id: str = "sk_alpha", move_id: str = "mv_alpha_one",
        ultimate: bool = True, voice: bool | None = None,
        nature: str | None = None, allow_opposed_nature: bool = False,
        action_context: str | None = None,
    ) -> checker.DeliveryRoute:
        kwargs = {} if action_context is None else {
            "action_context": action_context
        }
        return checker.DeliveryRoute(
            "fixture", "skills-fixture.md", 7, skill_id, move_id,
            "mfr_" + move_id.removeprefix("mv_"), points, delivery,
            purpose, projection, ultimate, voice, nature,
            allow_opposed_nature,
            **kwargs,
        )

    def test_nature_parser_reads_id_and_chinese_nature_in_one_cell(self) -> None:
        text = """
| `sk_baihuacuo` | 百花错拳 | 拳脚 | 10 天下 |
| 武学 / 性质 | 逐招路线 |
| `sk_baihuacuo` / 和 | `mv_baihuacuo_luanhua` |
"""
        self.assertEqual(
            "harmony", checker._skill_natures(text)["sk_baihuacuo"]
        )

    def test_nature_parser_assigns_idless_field_to_enclosing_card(self) -> None:
        text = """
### `sk_jueqingbixuejue` 绝情碧血诀（7 地下 · 内功）
| nature · wOut/wIn · moveSlots | `yin` · `0/1` · 4 |
"""
        self.assertEqual(
            "yin", checker._skill_natures(text)["sk_jueqingbixuejue"]
        )

    def test_nature_parser_reads_field_table_and_semicolon_cards(self) -> None:
        text = """
### `sk_table` 表格功（8 地中 · 内功）
| source / nature | `[ch08_luding]`；`yang`；`wOut/wIn:0/1`；`meridians:[mer_dumai]` |
### `sk_semicolon` 行文功（7 地下 · 内功）
`expanded / sect_demo`；调和；`meridians:[mer_chongmai]`。
"""
        self.assertEqual(
            {"sk_table": "yang", "sk_semicolon": "harmony"},
            checker._skill_natures(text),
        )

    def test_nature_parser_uses_compact_card_owner_not_prerequisite(self) -> None:
        text = """
| `sk_huashanjianfa` 华山剑法 | 5玄中·兵器/剑·neutral·0.8/0.2 | 无 |
| `sk_yangwujian` 养吾剑 | 6玄上·兵器/剑·yang·0.65/0.35 | prereq sk_huashanjianfa |
"""
        natures = checker._skill_natures(text)
        self.assertEqual("yang", natures["sk_yangwujian"])
        self.assertEqual("neutral", natures["sk_huashanjianfa"])

    def test_nature_field_does_not_belong_to_prerequisite_id(self) -> None:
        text = """
#### `sk_gaibanghuxinfa` 丐帮护心法（5 玄中 · 内功）
**字段**｜`nature:harmony`；`inner.meridians:[mer_renmai,mer_dumai]`
#### `sk_jiudaixingong` 九袋行功（6 玄上 · 内功）
**字段**｜`nature:yang`；`reqs:{prereq:[{skill:sk_gaibanghuxinfa}]}`；`inner.meridians:[mer_dumai]`
"""
        natures = checker._skill_natures(text)
        self.assertEqual("yang", natures["sk_jiudaixingong"])
        self.assertEqual("harmony", natures["sk_gaibanghuxinfa"])

    def test_move_owner_uses_first_card_id_and_matching_skill_stem(self) -> None:
        text = """
**`sk_xuanfengsaoyetui` 旋风扫叶腿**（5 玄中 · 拳脚/腿）
**`sk_pikongzhang` 劈空掌**（5 玄中；prereq sk_bibozhang）
- `mv_pikongzhang_pikong` `MoveDef{projection:true}`
| `sk_luohanquan` 罗汉拳 | 1黄下·拳脚/拳·yang | 无 |
> `mv_jingangzhi_zhili` `MoveDef{projection:true}`
| `sk_jingangzhi` 金刚指 | 4玄下·拳脚/指·yang | 无 |
"""
        owners = checker._move_owners(text)
        self.assertEqual("sk_pikongzhang", owners["mv_pikongzhang_pikong"])
        self.assertNotEqual(
            "sk_xuanfengsaoyetui", owners["mv_pikongzhang_pikong"]
        )
        self.assertEqual("sk_jingangzhi", owners["mv_jingangzhi_zhili"])

    def test_move_context_ignores_generated_audit_projection(self) -> None:
        text = """
### `sk_alpha` 测试掌（6 玄上 · 拳脚/掌）
| 真劈 `mv_alpha_one` | `MoveDef{ultimate:true}` |
<!-- skill-catalog-audit:start -->
| `mv_alpha_one` 切磋镜像 | `MoveDef{ultimate:true}` |
<!-- skill-catalog-audit:end -->
"""
        self.assertNotIn(
            "切磋", checker._move_contexts(text)["mv_alpha_one"]
        )

    def test_all_six_delivery_rules_accept_matching_endpoints(self) -> None:
        routes = [
            self.route("palm", ("ap_dumai_mingmen", "ap_shoujueyin_laogong")),
            self.route("finger", ("ap_renmai_qihai", "ap_shoutaiyin_shaoshang")),
            self.route("leg", ("ap_daimai_daimai", "ap_zuyangming_lidui")),
            self.route("weapon", ("ap_dumai_zhiyang", "ap_shoutaiyang_wangu")),
            self.route("inner", ("ap_renmai_qihai", "ap_shouyangming_hegu")),
            self.route(None, ("ap_dumai_mingmen", "ap_shoushaoyang_waiguan"), projection=True),
        ]
        report = checker.analyze_delivery_routes(routes)
        self.assertEqual(0, len(report.findings))
        self.assertEqual(6, report.checked_rule_count)

    def test_vocal_projection_accepts_throat_endpoints_only_for_allowlist(self) -> None:
        vocal_routes = [
            self.route(
                None, (endpoint,), projection=True, skill_id=skill_id,
                move_id=f"mv_{skill_id.removeprefix('sk_')}_voice",
            )
            for index, skill_id in enumerate(sorted(checker.VOCAL_SONIC_SKILLS))
            for endpoint in (
                "ap_yinwei_tiantu", "ap_yinwei_lianquan"
            )[index % 2:index % 2 + 1]
        ]
        instrument = self.route(
            None, ("ap_yinwei_tiantu",), projection=True,
            skill_id="sk_jindifa", move_id="mv_jindifa_luaner",
        )

        report = checker.analyze_delivery_routes([*vocal_routes, instrument])

        self.assertEqual(
            ["mv_jindifa_luaner"],
            [finding.route.move_id for finding in report.findings
             if finding.rule == "projection"],
        )
        self.assertEqual(
            {
                "sk_shizihou",
                "sk_jingangnuhou",
                "sk_chuanyunxiao",
                "sk_chuanyinsouhun",
                "sk_damingzhou",
            },
            set(checker.VOCAL_SONIC_SKILLS),
        )

    def test_voice_field_precedes_vocal_allowlist(self) -> None:
        explicit_true = self.route(
            None, ("ap_yinwei_tiantu",), projection=True,
            skill_id="sk_not_allowlisted", voice=True,
            move_id="mv_not_allowlisted_voice",
        )
        explicit_false = self.route(
            None, ("ap_yinwei_lianquan",), projection=True,
            skill_id="sk_shizihou", voice=False,
            move_id="mv_shizihou_instrument",
        )
        fallback = self.route(
            None, ("ap_yinwei_lianquan",), projection=True,
            skill_id="sk_shizihou", voice=None,
            move_id="mv_shizihou_legacy",
        )
        findings = checker.analyze_delivery_routes(
            [explicit_true, explicit_false, fallback]
        ).findings
        self.assertEqual(
            ["mv_shizihou_instrument"],
            [item.route.move_id for item in findings if item.rule == "projection"],
        )

    def test_compact_bold_palm_and_fist_grapple_classification(self) -> None:
        self.assertEqual(
            "palm", checker._delivery_from_context(
                "**鹰扬掌**（8 地中 · 拳脚/拳掌）", "双鹰并击"
            )
        )
        self.assertEqual(
            "fist-grapple", checker._delivery_from_context(
                "`sk_test` 擒拿；subType:grapple", "锁腕"
            )
        )
        self.assertIsNone(checker._delivery_from_context(
            "`sk_test` 拳掌；subType:fist", "阴阳吞吐"
        ))

    def test_fist_grapple_endpoint_rules_cover_pass_missing_and_tail(self) -> None:
        routes = [
            self.route("fist-grapple", ("ap_shouyangming_quchi",)),
            self.route("fist-grapple", ("ap_renmai_qihai",),
                       move_id="mv_alpha_missing"),
            self.route(
                "fist-grapple",
                ("ap_shouyangming_hegu", "ap_a", "ap_b", "ap_c"),
                move_id="mv_alpha_tail",
            ),
        ]
        report = checker.analyze_delivery_routes(routes)
        self.assertEqual(
            ["mv_alpha_missing"],
            [item.route.move_id for item in report.findings
             if item.rule == "fist-grapple"],
        )
        self.assertEqual(
            ["mv_alpha_tail"],
            [item.route.move_id for item in report.tail_findings
             if item.rule == "fist-grapple-tail"],
        )

    def test_movement_uses_registry_meridian_not_id_prefix_guess(self) -> None:
        mapping = {
            "ap_step": "mer_yangqiao",
            "ap_zushaoyang_fake": "mer_renmai",
        }
        with mock.patch.object(checker, "load_acupoint_meridians",
                               return_value=mapping):
            report = checker.analyze_delivery_routes([
                self.route("movement", ("ap_step",), purpose="movement"),
                self.route("movement", ("ap_zushaoyang_fake",),
                           purpose="movement", move_id="mv_alpha_fake"),
            ])
        self.assertEqual(
            ["mv_alpha_fake"],
            [item.route.move_id for item in report.findings
             if item.rule == "movement"],
        )

    def test_inner_defense_requires_ren_du_and_rejects_fake_dantian(self) -> None:
        mapping = {"ap_renmai_qihai": "mer_renmai"}
        with mock.patch.object(checker, "load_acupoint_meridians",
                               return_value=mapping):
            report = checker.analyze_delivery_routes([
                self.route("inner", ("ap_renmai_qihai",), purpose="defense"),
                self.route("inner", ("ap_yinwei_fuai",), purpose="defense",
                           move_id="mv_alpha_no_ren_du"),
                self.route("inner", ("ap_dantian",), purpose="defense",
                           move_id="mv_alpha_fake_dantian"),
            ])
        by_move = {item.route.move_id: item.rule for item in report.findings}
        self.assertEqual("inner-defense", by_move["mv_alpha_no_ren_du"] )
        self.assertEqual("inner-dantian", by_move["mv_alpha_fake_dantian"] )

    def test_route_nature_conflict_and_allow_opposed_override(self) -> None:
        mapping = {
            "ap_yin_a": "mer_renmai", "ap_yin_b": "mer_yinwei",
            "ap_yang": "mer_dumai", "ap_unknown": None,
        }
        with mock.patch.object(checker, "load_acupoint_meridians",
                               return_value=mapping):
            report = checker.analyze_delivery_routes([
                self.route(None, ("ap_yin_a", "ap_yin_b"), nature="yang"),
                self.route(None, ("ap_yin_a", "ap_yin_b"), nature="yang",
                           allow_opposed_nature=True, move_id="mv_alpha_allowed"),
                self.route(None, ("ap_yin_a", "ap_yang", "ap_unknown"),
                           nature="yang", move_id="mv_alpha_tie"),
            ])
        self.assertEqual(
            ["mv_alpha_one"],
            [item.route.move_id for item in report.nature_findings],
        )
        self.assertEqual("harmony", checker.route_nature(
            ("ap_yin_a", "ap_yang", "ap_unknown"), mapping
        ))

    def test_nonultimate_nature_checks_override_and_inner_gate(self) -> None:
        mapping = {
            "ap_yin": "mer_renmai",
            "ap_yang": "mer_dumai",
            "ap_shoujueyin_neiguan": "mer_shoujueyin",
            "ap_shoujueyin_laogong": "mer_shoujueyin",
        }
        natures = {
            "mer_renmai": "yin", "mer_dumai": "yang",
            "mer_shoujueyin": "yin",
        }
        routes = [
            self.route(
                None, ("ap_yin",), projection=True, ultimate=False,
                nature="yang", move_id="mv_alpha_conflict",
            ),
            self.route(
                None, ("ap_yin",), projection=True, ultimate=False,
                nature="yang", allow_opposed_nature=True,
                move_id="mv_alpha_allowed",
            ),
            self.route(
                "palm",
                (
                    "ap_yang", "ap_shoujueyin_neiguan",
                    "ap_shoujueyin_laogong",
                ),
                projection=True, ultimate=False, nature="yang",
                move_id="mv_alpha_inner_gate",
            ),
        ]
        with mock.patch.object(
            checker, "load_acupoint_meridians", return_value=mapping
        ), mock.patch.object(
            checker, "load_meridian_natures", return_value=natures
        ):
            report = checker.analyze_delivery_routes(routes)

        self.assertEqual(
            ["mv_alpha_conflict"],
            [item.route.move_id for item in report.nature_findings],
        )

    def test_route_nature_uses_game_owner_for_confluent_acupoint(self) -> None:
        ownership = checker.load_acupoint_meridians()
        natures = checker.load_meridian_natures()
        self.assertEqual("mer_chongmai", ownership["ap_chongmai_qichong"])
        self.assertEqual(
            "harmony",
            checker.route_nature(
                ("ap_chongmai_qichong",), ownership, natures
            ),
        )

    def test_palm_outlet_does_not_vote_on_yang_body_nature(self) -> None:
        mapping = {
            "ap_body": "mer_dumai",
            "ap_shoujueyin_neiguan": "mer_shoujueyin",
            "ap_shoujueyin_laogong": "mer_shoujueyin",
        }
        natures = {"mer_dumai": "yang", "mer_shoujueyin": "yin"}
        route = self.route(
            "palm",
            (
                "ap_body",
                "ap_shoujueyin_neiguan",
                "ap_shoujueyin_laogong",
            ),
            nature="yang",
        )
        with mock.patch.object(
            checker, "load_acupoint_meridians", return_value=mapping
        ), mock.patch.object(
            checker, "load_meridian_natures", return_value=natures
        ):
            report = checker.analyze_delivery_routes([route])

        self.assertEqual([], list(report.nature_findings))
        self.assertEqual(
            "yang",
            checker.route_nature(
                route.signature, mapping, natures,
                outlet_points={
                    "ap_shoujueyin_neiguan",
                    "ap_shoujueyin_laogong",
                },
            ),
        )

    def test_palm_action_endpoints_are_conservative_and_unionized(self) -> None:
        routes = [
            self.route(
                "palm", ("ap_dumai_mingmen", "ap_shoutaiyang_houxi"),
                move_id="mv_alpha_shoudao", action_context="手刀劈落",
            ),
            self.route(
                "palm", ("ap_dumai_mingmen", "ap_shouyangming_hegu"),
                move_id="mv_alpha_pizhang", action_context="虎口劈掌",
            ),
            self.route(
                "palm", ("ap_dumai_mingmen", "ap_shoushaoyang_waiguan"),
                move_id="mv_alpha_fanbei", action_context="反背摔掌",
            ),
            self.route(
                "palm", ("ap_dumai_mingmen", "ap_shoutaiyang_houxi"),
                move_id="mv_alpha_ambiguous", action_context="正面掌击",
            ),
            self.route(
                "palm", ("ap_dumai_mingmen", "ap_shouyangming_hegu"),
                move_id="mv_alpha_priority", action_context="掌刃劈击",
            ),
            self.route(
                "palm", ("ap_dumai_mingmen", "ap_shoutaiyang_houxi"),
                move_id="mv_alpha_pizhang_houxi", action_context="迎面劈掌",
            ),
        ]

        report = checker.analyze_delivery_routes(routes)

        self.assertEqual(
            ["mv_alpha_ambiguous"],
            [finding.route.move_id for finding in report.findings
             if finding.rule == "palm"],
        )
        self.assertEqual(6, report.catalogs[0].palm_routes)
        self.assertEqual(5, report.catalogs[0].palm_endpoint_matches)
        self.assertEqual(6, report.palm_route_count)
        self.assertEqual(5, report.palm_endpoint_match_count)
        self.assertEqual(
            {
                "ap_shoujueyin_laogong",
                "ap_shouyangming_hegu",
                "ap_shoutaiyang_houxi",
            },
            checker.palm_endpoints("掌刃劈击"),
        )

    def test_palm_action_rejects_non_action_cut_and_pikong_words(self) -> None:
        for phrase in (
            "一切", "切磋", "亲切", "切换", "迫切", "切勿",
            "切记", "密切", "确切", "急切", "恳切", "切实",
            "劈空掌",
        ):
            with self.subTest(phrase=phrase):
                self.assertEqual(
                    {"ap_shoujueyin_laogong"},
                    checker.palm_endpoints(phrase),
                )
        self.assertIn(
            "ap_shouyangming_hegu", checker.palm_endpoints("横切敌腕")
        )

    def test_palm_action_context_ignores_requirement_and_source_fields(self) -> None:
        text = """
| `sk_alpha` 测试掌 | 6玄上·拳脚/掌·yang·0.6/0.4 | reqs: 与师父切磋；sourceChapters: 劈空旧闻 | 掌击 `mv_alpha_one` `MoveDef{ultimate:true}` |
| 6 玄上 | sk_alpha | mv_alpha_one MoveDef{ultimate:true} | mfr_alpha_one MeridianRouteDef{moveRef:mv_alpha_one; ultimate:true; purpose:attack} | ap_dumai_mingmen/80/100→ap_shouyangming_hegu/80/120 |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            route = checker.collect_delivery_routes([path])[0]
        self.assertEqual({"ap_shoujueyin_laogong"}, checker.palm_endpoints(
            route.action_context
        ))

    def test_palm_action_context_excludes_unlabelled_metadata(self) -> None:
        cases = (
            (
                "prerequisite",
                "prereq sk_beta 劈掌5重",
                "正面掌击",
                "ap_shouyangming_hegu",
            ),
            (
                "braced_reqs",
                "reqs {note:掌刃考核}",
                "正面掌击",
                "ap_shoutaiyang_houxi",
            ),
            (
                "acquisition_column",
                "",
                "正面掌击",
                "ap_shoushaoyang_waiguan",
            ),
        )
        for label, heading_metadata, move_name, endpoint in cases:
            acquisition = " | 获取 | 外关格挡考核" if label == "acquisition_column" else ""
            text = f"""
### `sk_alpha` 测试掌（9 地上 · 拳脚/掌；{heading_metadata}）
| {move_name} `mv_alpha_one` `MoveDef{{ultimate:true}}`{acquisition} |
"""
            action_context = (
                checker._skill_identity_context(
                    checker._skill_contexts(text)["sk_alpha"]
                )
                + " "
                + checker._move_action_context(
                    checker._move_contexts(text)["mv_alpha_one"]
                )
            )
            with self.subTest(case=label):
                self.assertEqual(
                    {"ap_shoujueyin_laogong"},
                    checker.palm_endpoints(action_context),
                )
                self.assertNotIn(endpoint, checker.palm_endpoints(action_context))

    def test_acquisition_header_cannot_supply_palm_action(self) -> None:
        cases = (
            ("chop", "完成劈掌考核", "ap_shouyangming_hegu"),
            ("edge", "完成掌刃考核", "ap_shoutaiyang_houxi"),
            ("block", "完成格挡考核", "ap_shoushaoyang_waiguan"),
        )
        for label, acquisition, endpoint in cases:
            text = f"""
| ID | 名称 | 大类/子类 | 品阶 | 性质 | 获取方式 |
|---|---|---|---|---|---|
| `sk_alpha` | 测试掌 | 拳脚/拳掌 | 9 地上 | 阳 | {acquisition} |
| 招式 | 定义 |
| 正面掌击 `mv_alpha_one` | `MoveDef{{ultimate:true; projection:false}}` |
| 9 地上 | sk_alpha | mv_alpha_one MoveDef{{ultimate:true}} | mfr_alpha_one MeridianRouteDef{{moveRef:mv_alpha_one; ultimate:true; purpose:attack}} | ap_dumai_mingmen/80/100→{endpoint}/80/120 |
"""
            with tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / "skills-fixture.md"
                path.write_text(text, encoding="utf-8")
                route = checker.collect_delivery_routes([path])[0]
                report = checker.analyze_delivery_routes([route])
            with self.subTest(case=label):
                self.assertEqual(
                    {"ap_shoujueyin_laogong"},
                    checker.palm_endpoints(route.action_context),
                )
                self.assertEqual(
                    ["palm"],
                    [finding.rule for finding in report.findings],
                )

    def test_skill_metadata_cannot_authorize_houxi_outlet(self) -> None:
        cases = (
            (
                "headerless_skill_cell_prereq",
                """
| `sk_alpha` 测试掌；prereq sk_beta 掌刃5重 | 9地上·拳脚/掌·yang·0.6/0.4 |
""",
            ),
            (
                "skill_cell_reqs",
                """
| ID | 武学 | 大类/子类 | 品阶 | 性质 |
|---|---|---|---|---|
| `sk_alpha` | 测试掌；reqs {note:掌刃考核} | 拳脚/拳掌 | 9 地上 | 阳 |
""",
            ),
            (
                "heading_prerequisite",
                """
### `sk_alpha` 测试掌（9 地上 · 拳脚 / 拳掌；nature:yang；前置：掌刃5重）
""",
            ),
        )
        body = """
| 招式 | 定义 |
|---|---|
| 正面掌击 `mv_alpha_one` | `MoveDef{ultimate:true; projection:false}` |
| 品阶 | 武学 | MoveDef（正文真值） | MeridianRouteDef（路线镜像） | steps |
|---|---|---|---|---|
| 9 地上 | sk_alpha | mv_alpha_one MoveDef{ultimate:true} | mfr_alpha_one MeridianRouteDef{moveRef:mv_alpha_one; ultimate:true; purpose:attack} | ap_renmai_qihai/80/100→ap_shoutaiyang_houxi/80/120 |
"""
        for label, card in cases:
            with self.subTest(case=label), tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / "skills-fixture.md"
                path.write_text(card + body, encoding="utf-8")
                route = checker.collect_delivery_routes([path])[0]
                report = checker.analyze_delivery_routes([route])

                self.assertEqual("yang", route.nature)
                self.assertIn("测试掌", route.action_context)
                self.assertIn("正面掌击", route.action_context)
                self.assertNotIn("掌刃", route.action_context)
                self.assertEqual(
                    {"ap_shoujueyin_laogong"},
                    checker.palm_endpoints(route.action_context),
                )
                self.assertEqual(frozenset(), checker.route_outlet_points(route))
                self.assertEqual(
                    "harmony",
                    checker.route_nature(
                        route.signature,
                        outlet_points=checker.route_outlet_points(route),
                    ),
                )
                self.assertEqual(
                    ["palm"],
                    [finding.rule for finding in report.findings],
                )
                self.assertEqual(
                    [],
                    [finding.required for finding in report.nature_findings
                     if finding.required == "route=yin; declared=yang"],
                )

    def test_move_metadata_cannot_authorize_houxi_outlet(self) -> None:
        text = """
### `sk_alpha` 测试掌（9 地上 · 拳脚 / 拳掌；nature:yang）
| 正面掌击 `mv_alpha_one`；前置：掌刃5重 | `MoveDef{ultimate:true; projection:false}` |
| 9 地上 | sk_alpha | mv_alpha_one MoveDef{ultimate:true} | mfr_alpha_one MeridianRouteDef{moveRef:mv_alpha_one; ultimate:true; purpose:attack} | ap_renmai_qihai/80/100→ap_shoutaiyang_houxi/80/120 |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            route = checker.collect_delivery_routes([path])[0]
            report = checker.analyze_delivery_routes([route])

        self.assertEqual(
            {"ap_shoujueyin_laogong"},
            checker.palm_endpoints(route.action_context),
        )
        self.assertEqual(frozenset(), checker.route_outlet_points(route))
        self.assertEqual(
            "harmony",
            checker.route_nature(
                route.signature,
                outlet_points=checker.route_outlet_points(route),
            ),
        )
        self.assertEqual(
            ["palm"], [finding.rule for finding in report.findings]
        )
        self.assertEqual([], list(report.nature_findings))

    def test_same_yin_point_votes_in_body_but_not_as_tail_outlet(self) -> None:
        mapping = {
            "ap_body_yang": "mer_dumai",
            "ap_shoujueyin_laogong": "mer_shoujueyin",
        }
        natures = {"mer_dumai": "yang", "mer_shoujueyin": "yin"}
        early = self.route(
            "palm",
            ("ap_shoujueyin_laogong", "ap_a", "ap_b", "ap_c"),
            move_id="mv_alpha_early_yin", nature="yang",
        )
        trailing = self.route(
            "palm", ("ap_body_yang", "ap_a", "ap_shoujueyin_laogong"),
            move_id="mv_alpha_tail_yin", nature="yang",
        )
        with mock.patch.object(
            checker, "load_acupoint_meridians", return_value=mapping
        ), mock.patch.object(
            checker, "load_meridian_natures", return_value=natures
        ):
            report = checker.analyze_delivery_routes([early, trailing])
        self.assertEqual(frozenset(), checker.route_outlet_points(early))
        self.assertEqual(
            frozenset({"ap_shoujueyin_laogong"}),
            checker.route_outlet_points(trailing),
        )
        self.assertEqual(
            ["mv_alpha_early_yin"],
            [finding.route.move_id for finding in report.nature_findings],
        )

    def test_inner_nature_audit_counts_missing_and_mismatched_cards(self) -> None:
        text = """
### `sk_yang` 阳功（6 玄上 · 内功）
| nature · wOut/wIn | `yang` · 0/1 |
| meridians | `[mer_dumai,mer_shouyangming]` |
### `sk_wrong` 错标功（5 玄中 · 内功）
**字段**｜`nature:yin`；`inner.meridians:[mer_dumai]`；`reqs:{prereq:[{skill:sk_yang}]} `
### `sk_missing` 无脉功（4 玄下 · 内功）
| nature · wOut/wIn | `harmony` · 0/1 |
### `sk_outer` 外掌（4 玄下 · 拳脚/掌）
| nature · wOut/wIn | `yang` · 0.8/0.2 |
| 经脉 | `meridians:[mer_renmai]`；招式路线 |
"""
        result = checker.audit_inner_natures(
            "fixture", "skills-fixture.md", text,
            {
                "mer_dumai": "yang",
                "mer_shouyangming": "yang",
                "mer_renmai": "yin",
            },
        )
        self.assertEqual(3, result.total)
        self.assertEqual(2, result.with_meridians)
        self.assertEqual(("sk_missing",), result.missing_meridians)
        self.assertEqual(1, len(result.findings))
        self.assertEqual("sk_wrong", result.findings[0].skill_id)
        self.assertEqual("yin", result.findings[0].declared)
        self.assertEqual("yang", result.findings[0].derived)

    def test_inner_nature_audit_deduplicates_index_and_reads_field_variants(self) -> None:
        text = """
| `sk_alpha` | 6 玄上 | 内功 |
### `sk_alpha` 甲功（6 玄上 · 内功）
| source / nature | `[ch01]`；`yang`；`wOut/wIn:0/1` |
| meridians / breathProfileRef | `[mer_dumai]` / `txp_alpha` |
### `sk_beta` 乙功（5 玄中 · 内功）
**字段**｜`nature:yin`；`meridians [mer_renmai]`
"""
        result = checker.audit_inner_natures(
            "fixture", "skills-fixture.md", text,
            {"mer_dumai": "yang", "mer_renmai": "yin"},
        )
        self.assertEqual(2, result.total)
        self.assertEqual(2, result.with_meridians)
        self.assertEqual((), result.missing_meridians)
        self.assertEqual((), result.findings)

    def test_inner_nature_audit_distinguishes_empty_field_from_missing(self) -> None:
        text = """
### `sk_empty_harmony` 空脉调和功（5 玄中 · 内功）
| nature | `harmony` |
| inner.meridians | `[]` |
### `sk_empty_yang` 空脉阳功（5 玄中 · 内功）
| nature | `yang` |
| meridians | `[]` |
### `sk_missing` 缺字段功（5 玄中 · 内功）
| nature | `harmony` |
"""
        result = checker.audit_inner_natures(
            "fixture", "skills-fixture.md", text, {}
        )
        self.assertEqual(3, result.total)
        self.assertEqual(2, result.with_meridians)
        self.assertEqual(("sk_missing",), result.missing_meridians)
        self.assertEqual(1, len(result.findings))
        self.assertEqual("sk_empty_yang", result.findings[0].skill_id)
        self.assertEqual("harmony", result.findings[0].derived)
        self.assertEqual((), result.findings[0].meridians)

    def test_delivery_report_includes_inner_nature_audit_without_failure(self) -> None:
        text = """
### `sk_wrong` 错标功（5 玄中 · 内功）
**字段**｜`nature:yin`；`inner.meridians:[mer_dumai]`
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            with mock.patch.object(
                checker, "load_meridian_natures",
                return_value={"mer_dumai": "yang"},
            ), redirect_stdout(StringIO()) as output:
                report = checker.analyze_delivery([path])
                checker.print_delivery_report(report, details=True)
                code = checker.main(["--delivery", "--strict", str(path)])
        self.assertEqual(1, report.inner_nature_total)
        self.assertEqual(1, report.inner_nature_conflicts)
        self.assertIn("INNER_NATURE skill=sk_wrong", output.getvalue())
        self.assertEqual(0, code)

    def test_leg_accepts_any_foot_yang_acupoint(self) -> None:
        routes = [
            self.route(
                "leg", ("ap_daimai_daimai", "ap_zuyangming_zusanli"),
                move_id="mv_alpha_pass",
            ),
            self.route(
                "leg", ("ap_daimai_daimai", "ap_zushaoyin_taixi"),
                move_id="mv_alpha_fail",
            ),
        ]
        report = checker.analyze_delivery_routes(routes)
        self.assertEqual(1, len(report.findings))
        self.assertEqual("mv_alpha_fail", report.findings[0].route.move_id)
        self.assertEqual("leg", report.findings[0].rule)

    def test_delivery_rules_report_each_missing_endpoint(self) -> None:
        routes = [
            self.route("palm", ("ap_dumai_mingmen",)),
            self.route("finger", ("ap_renmai_qihai",)),
            self.route("leg", ("ap_daimai_daimai",)),
            self.route("weapon", ("ap_dumai_zhiyang",)),
            self.route("inner", ("ap_yinwei_fuai",)),
            self.route(None, ("ap_zushaoyin_taixi",), projection=True),
        ]
        report = checker.analyze_delivery_routes(routes)
        self.assertEqual(6, len(report.findings))
        self.assertEqual(0, len(report.tail_findings))
        self.assertEqual(
            {"palm", "finger", "leg", "weapon", "inner-attack", "projection"},
            {item.rule for item in report.findings},
        )

    def test_action_endpoint_must_be_within_last_three_steps(self) -> None:
        in_tail = self.route(
            "palm",
            ("ap_shoujueyin_laogong", "ap_a", "ap_b"),
            move_id="mv_alpha_tail",
        )
        too_early = self.route(
            "weapon",
            ("ap_shoutaiyang_wangu", "ap_a", "ap_b", "ap_c"),
            move_id="mv_alpha_early",
        )
        report = checker.analyze_delivery_routes([in_tail, too_early])
        self.assertEqual(0, len(report.findings))
        self.assertEqual(1, len(report.tail_findings))
        self.assertEqual(1, report.tail_violations)
        self.assertEqual("weapon-tail", report.tail_findings[0].rule)
        self.assertEqual(0, report.catalogs[0].violations)
        self.assertEqual(1, report.catalogs[0].tail_violations)

    def test_inner_and_projection_rules_do_not_check_tail_position(self) -> None:
        routes = [
            self.route(
                "inner", ("ap_renmai_qihai", "ap_a", "ap_b", "ap_c")
            ),
            self.route(
                None,
                ("ap_shoujueyin_laogong", "ap_a", "ap_b", "ap_c"),
                projection=True, move_id="mv_alpha_projection",
            ),
        ]
        report = checker.analyze_delivery_routes(routes)
        self.assertEqual(0, len(report.findings))
        self.assertEqual(0, len(report.tail_findings))
        self.assertEqual(0, report.tail_violations)

    def test_named_six_meridians_finger_uses_corresponding_endpoint(self) -> None:
        route = self.route(
            "finger", ("ap_shoutaiyang_shaoze",),
            move_id="mv_liumai_shaoshang",
        )
        findings = checker.analyze_delivery_routes([route]).findings
        self.assertEqual(1, len(findings))
        self.assertEqual("finger-specific", findings[0].rule)
        self.assertIn("ap_shoutaiyin_shaoshang", findings[0].required)

    def test_unclassified_non_projection_route_is_not_guessed(self) -> None:
        report = checker.analyze_delivery_routes([
            self.route(None, ("ap_dumai_mingmen",))
        ])
        self.assertEqual(0, report.checked_rule_count)
        self.assertEqual(1, report.catalogs[0].unclassified)
        self.assertEqual(0, len(report.findings))

    def test_collect_delivery_reads_body_type_and_projection(self) -> None:
        text = """
### `sk_alpha` 测试掌（9 地上 · 拳脚 / 拳掌）
| 绝招 `mv_alpha_one` | `MoveDef{ultimate:true; projection:true}` |
| 9 地上 | sk_alpha | mv_alpha_one MoveDef{ultimate:true} | mfr_alpha_one MeridianRouteDef{moveRef:mv_alpha_one; ultimate:true; purpose:attack} | ap_dumai_mingmen/80/100→ap_shoujueyin_laogong/80/120 |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            routes = checker.collect_delivery_routes([path])
        self.assertEqual(1, len(routes))
        self.assertEqual("palm", routes[0].delivery)
        self.assertTrue(routes[0].projection)
        self.assertIn("测试掌", routes[0].action_context)

    def test_collect_delivery_keeps_move_action_for_palm_outlet(self) -> None:
        text = """
### `sk_alpha` 测试掌（9 地上 · 拳脚 / 拳掌；nature:yang）
| 手刀 `mv_alpha_one` | `MoveDef{ultimate:true; projection:false}`；掌刃劈落 |
| 9 地上 | sk_alpha | mv_alpha_one MoveDef{ultimate:true} | mfr_alpha_one MeridianRouteDef{moveRef:mv_alpha_one; ultimate:true; purpose:attack} | ap_dumai_mingmen/80/100→ap_shoutaiyang_houxi/80/120 |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            routes = checker.collect_delivery_routes([path])

        self.assertIn("掌刃", routes[0].action_context)
        self.assertEqual(0, len(checker.analyze_delivery_routes(routes).findings))

    def test_named_move_table_drives_palm_outlet_and_body_nature(self) -> None:
        cases = (
            ("hand_knife", "手刀", "ap_shoutaiyang_houxi"),
            ("tiger_chop", "虎口劈掌", "ap_shouyangming_hegu"),
            ("back_throw", "反背摔掌", "ap_shoushaoyang_waiguan"),
            ("union", "掌刃抓拿", "ap_shoutaiyang_houxi"),
        )
        expected_by_case = {
            "hand_knife": {
                "ap_shoujueyin_laogong", "ap_shoutaiyang_houxi",
            },
            "tiger_chop": {
                "ap_shoujueyin_laogong", "ap_shouyangming_hegu",
                "ap_shoutaiyang_houxi",
            },
            "back_throw": {
                "ap_shoujueyin_laogong", "ap_shoushaoyang_waiguan",
            },
            "union": {
                "ap_shoujueyin_laogong", "ap_shouyangming_hegu",
                "ap_shoutaiyang_houxi",
            },
        }
        for label, move_name, endpoint in cases:
            text = f"""
### `sk_alpha` 测试掌（9 地上 · 拳脚 / 拳掌；nature:yang）
| 招式 | 定义 |
|---|---|
| {move_name} `mv_alpha_one` | `MoveDef{{ultimate:true; projection:false}}` |
| 品阶 | 武学 | MoveDef（正文真值） | MeridianRouteDef（路线镜像） | steps |
|---|---|---|---|---|
| 9 地上 | sk_alpha | mv_alpha_one MoveDef{{ultimate:true}} | mfr_alpha_one MeridianRouteDef{{moveRef:mv_alpha_one; ultimate:true; purpose:attack}} | ap_renmai_qihai/80/100→{endpoint}/80/120 |
"""
            with tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / "skills-fixture.md"
                path.write_text(text, encoding="utf-8")
                routes = checker.collect_delivery_routes([path])
                report = checker.analyze_delivery_routes(routes)

            with self.subTest(case=label):
                self.assertEqual(1, len(routes))
                self.assertEqual(
                    expected_by_case[label],
                    checker.palm_endpoints(routes[0].action_context),
                )
                self.assertFalse(any(
                    finding.rule == "palm" for finding in report.findings
                ))
                self.assertEqual(
                    ["mv_alpha_one"],
                    [finding.route.move_id
                     for finding in report.nature_findings],
                )
                self.assertEqual(
                    "route=yin; declared=yang",
                    report.nature_findings[0].required,
                )

    def test_move_action_table_isolates_moves_and_metadata(self) -> None:
        text = """
### `sk_alpha` 测试掌（9 地上 · 拳脚 / 拳掌；nature:yang）
| 招式 | 定义 | 获取方式 |
|---|---|---|
| 手刀 `mv_alpha_one`；反背摔掌 `mv_alpha_two` | `mv_alpha_one` `MoveDef{ultimate:true; projection:false}`；`mv_alpha_two` `MoveDef{ultimate:true; projection:false}` | 完成虎口劈掌考核 |
| 品阶 | 武学 | MoveDef（正文真值） | MeridianRouteDef（路线镜像） | steps |
|---|---|---|---|---|
| 9 地上 | sk_alpha | mv_alpha_one MoveDef{ultimate:true} | mfr_alpha_one MeridianRouteDef{moveRef:mv_alpha_one; ultimate:true; purpose:attack} | ap_renmai_qihai/80/100→ap_shoutaiyang_houxi/80/120 |
| 9 地上 | sk_alpha | mv_alpha_two MoveDef{ultimate:true} | mfr_alpha_two MeridianRouteDef{moveRef:mv_alpha_two; ultimate:true; purpose:attack} | ap_renmai_qihai/80/100→ap_shoushaoyang_waiguan/80/120 |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            routes = checker.collect_delivery_routes([path])
            report = checker.analyze_delivery_routes(routes)

        by_move = {route.move_id: route for route in routes}
        self.assertEqual(
            {"ap_shoujueyin_laogong", "ap_shoutaiyang_houxi"},
            checker.palm_endpoints(by_move["mv_alpha_one"].action_context),
        )
        self.assertEqual(
            {"ap_shoujueyin_laogong", "ap_shoushaoyang_waiguan"},
            checker.palm_endpoints(by_move["mv_alpha_two"].action_context),
        )
        self.assertEqual(
            [],
            [finding.route.move_id for finding in report.findings
             if finding.rule == "palm"],
        )
        self.assertEqual(
            ["mv_alpha_one", "mv_alpha_two"],
            [finding.route.move_id for finding in report.nature_findings],
        )

    def test_collects_nonultimate_projection_but_not_projection_false(self) -> None:
        text = """
### `sk_alpha` 测试音功（8 地中 · 杂学 / 音功；nature:yin）
| 外放 `mv_alpha_wave` | `MoveDef{ultimate:false; projection:true; voice:true}` |
| 普通 `mv_alpha_plain` | `MoveDef{ultimate:false; projection:false}` |
| `sk_alpha` | `mv_alpha_wave` | `mfr_alpha_wave` | `[yin]` | `ap_yinwei_tiantu/70/90` |
| `sk_alpha` | `mv_alpha_plain` | `mfr_alpha_plain` | `[yin]` | `ap_yinwei_tiantu/70/90` |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            routes = checker.collect_delivery_routes([path])
        self.assertEqual(["mv_alpha_wave"], [route.move_id for route in routes])
        self.assertFalse(routes[0].ultimate)
        self.assertTrue(routes[0].voice)

    def test_compact_card_keeps_own_move_def_after_semicolon(self) -> None:
        text = """
### `sk_alpha` 测试掌（6 玄上 · 拳脚 / 拳掌；nature:yin）
**招式**：外放 `mv_alpha_wave`（远程，拉敌 1；`MoveDef{range:{min:1,max:3}; projection:true; ultimate:false}`）、近击 `mv_alpha_plain`（近身；`MoveDef{projection:false; ultimate:false}`）。
| `sk_alpha` | `mv_alpha_wave` | `mfr_alpha_wave` | `[yin]` | `ap_shoutaiyin_shaoshang/70/90` |
| `sk_alpha` | `mv_alpha_plain` | `mfr_alpha_plain` | `[yin]` | `ap_renmai_qihai/70/90` |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            routes = checker.collect_delivery_routes([path])
        self.assertEqual(["mv_alpha_wave"], [route.move_id for route in routes])
        self.assertEqual("mfr_alpha_wave", routes[0].route_id)

    def test_collects_nonultimate_projection_from_route_first_row(self) -> None:
        text = """
### `sk_chuanyunxiao` 穿云啸（8 地中 · 杂学 / 音功；nature:yang）
| 人声 `mv_chuanyunxiao_chuanyun` | `MoveDef{ultimate:false; projection:true}` |
| `mfr_chuanyunxiao_chuanyun` | `mv_chuanyunxiao_chuanyun`；`MeridianRouteDef{moveRef:mv_chuanyunxiao_chuanyun; ultimate:false; purpose:attack; requiredNature:[yang,harmony]}` | `ap_dumai_mingmen/70/100→ap_yinwei_tiantu/80/320→ap_yinwei_lianquan/70/160` |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            routes = checker.collect_delivery_routes([path])
        self.assertEqual(1, len(routes))
        self.assertEqual("mfr_chuanyunxiao_chuanyun", routes[0].route_id)
        self.assertFalse(routes[0].ultimate)
        self.assertEqual(0, checker.analyze_delivery_routes(
            routes
        ).nonultimate_projection_violations)

    def test_voice_field_is_parsed_as_explicit_tristate(self) -> None:
        text = """
### `sk_shizihou` 狮子吼（10 天下 · 杂学/音功；nature:yang）
| 人声 `mv_alpha_true` | `MoveDef{ultimate:true; projection:true; voice:true}` |
| 乐器 `mv_alpha_false` | `MoveDef{ultimate:true; projection:true; voice:false}` |
| 旧卡 `mv_alpha_legacy` | `MoveDef{ultimate:true; projection:true}` |
| 10 天下 | sk_shizihou | mv_alpha_true MoveDef{ultimate:true} | mfr_alpha_true MeridianRouteDef{moveRef:mv_alpha_true; ultimate:true; purpose:attack} | ap_yinwei_tiantu/80/100 |
| 10 天下 | sk_shizihou | mv_alpha_false MoveDef{ultimate:true} | mfr_alpha_false MeridianRouteDef{moveRef:mv_alpha_false; ultimate:true; purpose:attack} | ap_yinwei_tiantu/80/100 |
| 10 天下 | sk_shizihou | mv_alpha_legacy MoveDef{ultimate:true} | mfr_alpha_legacy MeridianRouteDef{moveRef:mv_alpha_legacy; ultimate:true; purpose:attack} | ap_yinwei_tiantu/80/100 |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            routes = checker.collect_delivery_routes([path])
        self.assertEqual([True, False, None], [route.voice for route in routes])

    def test_nonultimate_projection_has_separate_report_totals(self) -> None:
        report = checker.analyze_delivery_routes([
            self.route(None, ("ap_renmai_qihai",), projection=True),
            self.route(None, ("ap_renmai_qihai",), projection=True,
                       ultimate=False, move_id="mv_alpha_normal"),
        ])
        self.assertEqual(1, report.route_count)
        self.assertEqual(1, report.nonultimate_projection_routes)
        self.assertEqual(1, report.nonultimate_projection_violations)
        self.assertEqual(1, report.catalogs[0].routes)
        self.assertEqual(1, len(report.routes))
        self.assertTrue(all(route.ultimate for route in report.routes))
        self.assertEqual(1, len(report.nonultimate_projection_route_details))

    def test_vocal_allowlist_entries_are_defined_and_sonic(self) -> None:
        definitions: dict[str, tuple[Path, int]] = {}
        for path in checker.CATALOG_PATHS:
            text = path.read_text(encoding="utf-8")
            grades, _lines = checker.parse_skill_grades(text)
            for skill_id in checker.VOCAL_SONIC_SKILLS & grades.keys():
                formal_lines = [
                    line for line in text.splitlines()
                    if skill_id in line and checker._grade_from_line(line) is not None
                    and "音功" in line
                ]
                self.assertTrue(formal_lines, f"{skill_id} lacks sonic definition")
                definitions[skill_id] = (path, grades[skill_id])
        self.assertEqual(set(checker.VOCAL_SONIC_SKILLS), set(definitions))

    def test_delivery_json_exposes_new_independent_totals(self) -> None:
        report = checker.analyze_delivery_routes([
            self.route(None, ("ap_renmai_qihai",), projection=True,
                       ultimate=False, nature="yang"),
        ])
        self.assertEqual(1, report.nonultimate_projection_routes)
        self.assertEqual(1, report.nonultimate_projection_violations)
        # Normal projection routes retain endpoint totals and the historical
        # nature-audit coverage, now evaluated with AR-18 body-step voting.
        self.assertEqual(1, len(report.nature_findings))
        payload = asdict(report)
        self.assertEqual((), payload["routes"])
        self.assertEqual(
            1, len(payload["nonultimate_projection_route_details"])
        )

    def test_ambiguous_fist_palm_bucket_does_not_turn_fists_into_palms(self) -> None:
        fist = "#### `sk_qishangquan` 七伤拳（9 地上 · 拳脚／拳掌）"
        palm = "##### 大金刚掌 `sk_dajingangzhang`（地下 7 · 拳脚·掌）"
        legacy = "`legacy-set:xinglin_qihuang`；推宫治疗"
        self.assertEqual(
            "fist-grapple", checker._delivery_from_context(fist, "阴阳吞吐")
        )
        self.assertEqual(
            "palm", checker._delivery_from_context(palm, "大力")
        )
        self.assertIsNone(checker._delivery_from_context("", legacy))

    def test_fist_name_ignores_misc_prerequisite_chain(self) -> None:
        misc = (
            "| `sk_honghuahuiheji` | 红花会合击 | 7 地下 | 杂学/阵法 | "
            "红花长拳 → 红花心法 → 本门 |"
        )
        own_fist = "| `sk_alphaquan` | 测试拳 | 7 地下 | 拳脚/拳掌 |"
        self.assertIsNone(
            checker._delivery_from_context(misc, "十四当家合击")
        )
        self.assertEqual(
            "fist-grapple",
            checker._delivery_from_context(own_fist, "第一式"),
        )

    def test_fist_subtype_defers_to_explicit_palm_action(self) -> None:
        fist = "`sk_qishangquan` 七伤拳；subType:fist"
        palm = "`sk_donghaichaoshengzhang` 东海潮生掌；subType:fist"
        self.assertEqual(
            "fist-grapple", checker._delivery_from_context(fist, "阴阳吞吐")
        )
        self.assertEqual(
            "palm", checker._delivery_from_context(palm, "怒海潮生")
        )
        self.assertEqual(
            "palm", checker._delivery_from_context(fist, "掌风外吐")
        )
        self.assertEqual(
            "palm", checker._delivery_from_context(fist, "烈阳贯掌 `mv_test`")
        )

    def test_mind_skill_effect_reference_does_not_imply_weapon_delivery(self) -> None:
        mind = "`sk_wanmeixinjing` 万梅静境（6 玄上 · misc/mind）"
        effect = "静候（绝招，架势；下次剑招获得加成），无伤害"
        weapon = "`sk_sanwusanbushou` 三无三不手（兵器/鞭索）"
        palm = "`sk_huoyandao` 火焰刀（拳脚/拳掌（刀气））"
        self.assertIsNone(checker._delivery_from_context(mind, effect))
        self.assertEqual(
            "weapon", checker._delivery_from_context(weapon, "拂尘挥击")
        )
        self.assertEqual(
            "palm", checker._delivery_from_context(palm, "掌力化作刀气")
        )

    def test_external_wujue_delivery_routes_are_palm_and_projection(self) -> None:
        blocks = []
        for index, (move_id, owner) in enumerate(
            checker.EXTERNAL_WUJUE.items(), 1
        ):
            _skill_id, route_id, _grade = owner
            endpoint = (
                "ap_zushaoyin_yongquan" if move_id.endswith("shenlong")
                else "ap_shoujueyin_laogong"
            )
            blocks.append(
                f"  - id: {route_id}\n"
                f"    moveRef: {move_id}\n"
                "    ultimate: true\n"
                "    purpose: attack\n"
                "    steps:\n"
                f"      - {{ acupointRef: {endpoint} }}"
            )
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "21.md"
            path.write_text("\n".join(blocks), encoding="utf-8")
            routes = checker.parse_external_wujue_delivery_routes(path)

        self.assertEqual(3, len(routes))
        self.assertTrue(all(route.delivery == "palm" for route in routes))
        self.assertTrue(all(route.projection for route in routes))
        findings = checker.analyze_delivery_routes(routes).findings
        self.assertEqual(
            {"palm", "projection"},
            {item.rule for item in findings if item.route.move_id.endswith("shenlong")},
        )

    def test_projection_does_not_leak_between_moves_on_one_line(self) -> None:
        text = """
### `sk_alpha` 测试掌（9 地上 · 拳脚 / 拳掌）
| 外放 `mv_alpha_other` `MoveDef{projection:true}`；绝招 `mv_alpha_final` `MoveDef{ultimate:true; projection:false}` |
| 9 地上 | sk_alpha | mv_alpha_final MoveDef{ultimate:true} | mfr_alpha_final MeridianRouteDef{moveRef:mv_alpha_final; ultimate:true; purpose:attack} | ap_shoujueyin_laogong/80/100 |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            routes = checker.collect_delivery_routes([path])
        self.assertFalse(routes[0].projection)

    def test_analyze_delivery_lists_catalog_with_zero_routes(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            empty = Path(directory) / "skills-empty.md"
            full = Path(directory) / "skills-full.md"
            empty.write_text("", encoding="utf-8")
            full.write_text(
                diversity_row(
                    "sk_alpha", "mv_alpha_one", "mfr_alpha_one",
                    ("ap_shoujueyin_laogong",),
                ),
                encoding="utf-8",
            )
            report = checker.analyze_delivery([empty, full])
        self.assertEqual(["empty", "full"], [x.name for x in report.catalogs])
        self.assertEqual(0, report.catalogs[0].routes)

    def test_delivery_cli_reports_but_never_changes_exit_status(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(
                "### `sk_alpha` 测试掌（9 地上 · 拳脚 / 拳掌）\n"
                + diversity_row(
                    "sk_alpha", "mv_alpha_one", "mfr_alpha_one",
                    ("ap_dumai_mingmen",),
                ),
                encoding="utf-8",
            )
            with redirect_stdout(StringIO()) as output:
                code = checker.main(["--delivery", "--details", str(path)])
        self.assertEqual(0, code)
        self.assertIn("delivery: routes=1", output.getvalue())
        self.assertIn("rule=palm", output.getvalue())
        self.assertIn("tail_violations=0", output.getvalue())

    def test_existing_strict_does_not_run_delivery(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-empty.md"
            path.write_text("", encoding="utf-8")
            with mock.patch.object(
                checker, "analyze_delivery",
                side_effect=AssertionError("delivery must be opt-in"),
            ), redirect_stdout(StringIO()):
                result = checker.main(["--strict", str(path)])
        self.assertEqual(0, result)

    def test_delivery_json_is_added_without_changing_audit_shape_otherwise(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-empty.md"
            path.write_text("", encoding="utf-8")
            with redirect_stdout(StringIO()) as output:
                code = checker.main(["--json", "--delivery", str(path)])
        self.assertEqual(0, code)
        self.assertIn('"delivery"', output.getvalue())
        self.assertIn('"tail_violations": 0', output.getvalue())
        self.assertIn('"tail_findings"', output.getvalue())


class OutletParsingRegressionTests(unittest.TestCase):
    def test_sequence_column_excludes_endpoint_hints(self) -> None:
        headers = ("路线 ID", "合法端点", "显式步骤", "核算提示")
        row = (
            "| mfr_alpha | ap_shouyangming_hegu | "
            "ap_renmai_qihai/70/80→ap_dumai_mingmen/70/90→"
            "ap_shouyangming_hegu/70/100 | 出口 ap_shouyangming_hegu |"
        )
        self.assertEqual(
            ("ap_renmai_qihai", "ap_dumai_mingmen", "ap_shouyangming_hegu"),
            checker.route_sequence_points(row, headers),
        )

    def test_sequence_parser_keeps_repeated_nodes_but_not_prose_endpoints(self) -> None:
        self.assertEqual(
            ("ap_renmai_qihai", "ap_dumai_mingmen", "ap_renmai_qihai"),
            checker.route_sequence_points(
                "路线 `ap_renmai_qihai/80/100→ap_dumai_mingmen/80/120→"
                "ap_renmai_qihai/80/150`；终点说明：`ap_renmai_qihai`。"
            ),
        )
        self.assertEqual(
            ("ap_renmai_qihai", "ap_dumai_mingmen"),
            checker.route_sequence_points(
                "| mfr_alpha | ap_renmai_qihai ap_dumai_mingmen |",
                ("路线", "有序穴位序列"),
            ),
        )

    def test_template_endpoint_hints_are_not_explicit_routes(self) -> None:
        self.assertEqual((), checker.route_sequence_points(
            "| mfr_alpha | mv_alpha | P6LG | "
            "ap_shoujueyin_neiguan、ap_shoujueyin_laogong |",
            ("路线 ID", "moveRef", "展开码", "合法外放端点"),
        ))

    def test_projection_collector_uses_steps_once_and_ignores_template_hints(self) -> None:
        text = """
### `sk_alpha` 测试音功（8 地中 · 杂学 / 音功；nature:yin）
| 人声 `mv_alpha_wave` | `MoveDef{ultimate:false; projection:true; voice:true}` |
| 共享 `mv_alpha_shared` | `MoveDef{ultimate:false; projection:true; voice:true}` |
| 路线 ID | moveRef | 展开码 / 显式步骤 | 合法外放端点 |
|---|---|---|---|
| mfr_alpha_wave | mv_alpha_wave | ap_renmai_qihai/70/90→ap_renmai_danzhong/70/90→ap_yinwei_lianquan/70/90→ap_yinwei_tiantu/70/90 | ap_yinwei_lianquan、ap_yinwei_tiantu |
| mfr_alpha_shared | mv_alpha_shared | P6LG | ap_yinwei_tiantu |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            routes = checker.collect_delivery_routes([path])
        self.assertEqual(["mv_alpha_wave"], [route.move_id for route in routes])
        self.assertEqual((
            "ap_renmai_qihai", "ap_renmai_danzhong",
            "ap_yinwei_lianquan", "ap_yinwei_tiantu",
        ), routes[0].signature)

    def test_yellow_one_line_inner_cards_count_fields_and_conflicts(self) -> None:
        text = """
| 武学 ID | 名称 | 来源 | 类别 | 书界 | 核心效果 | 前置 |
|---|---|---|---|---|---|---|
| sk_alpha | 甲吐纳 | 山民 | 内功（3 黄上·yin） | 序章 | inner.meridians:[mer_renmai] | 无 |
| sk_beta | 乙养气 | 拳师 | 内功(2 黄中·yin) | ALL14 | inner.meridians:[mer_dumai] | sk_alpha≥1 |
| sk_empty | 空脉 | 山民 | 内功（1 黄下·harmony） | 序章 | inner.meridians:[] | 无 |
| sk_missing | 缺脉 | 山民 | 内功（1 黄下·yang） | 序章 | IP=19 | 无 |
| sk_outer | 丙掌 | 山民 | 拳脚（1 黄下·yang） | 序章 | 掌击 | sk_missing≥1 |
"""
        result = checker.audit_inner_natures(
            "fixture", "skills-fixture.md", text,
            {"mer_renmai": "yin", "mer_dumai": "yang"},
        )
        self.assertEqual(4, result.total)
        self.assertEqual(3, result.with_meridians)
        self.assertEqual(("sk_missing",), result.missing_meridians)
        self.assertEqual([("sk_beta", "yin", "yang")], [
            (finding.skill_id, finding.declared, finding.derived)
            for finding in result.findings
        ])

    def test_yitian_and_general_inner_audit_includes_yellow_cards(self) -> None:
        natures = checker.load_meridian_natures()
        for catalog, expected in (("yitian", 18), ("general", 14)):
            with self.subTest(catalog=catalog):
                path = checker.ROOT / "docs/design/catalog" / f"skills-{catalog}.md"
                result = checker.audit_inner_natures(
                    catalog, path.name, path.read_text(encoding="utf-8"), natures,
                )
                self.assertEqual(expected, result.total)
                self.assertEqual(expected, result.with_meridians)
                self.assertEqual((), result.missing_meridians)
                self.assertEqual((), result.findings)


class NormalRouteUniquenessTests(unittest.TestCase):
    POINTS = tuple(f"ap_test_{index}" for index in range(5))

    def test_collects_explicit_normal_steps_without_projection_or_template_expansion(self):
        text = """
| 武学 | 招式 | 路线 | 配置 | steps | 合法端点提示 |
|---|---|---|---|---|---|
| sk_alpha | mv_alpha_a MoveDef{ultimate:false; projection:false} | mfr_alpha_a | MeridianRouteDef{ultimate:false; purpose:defense} | ap_a/70/80→ap_b/70/80→ap_c/70/80 | ap_b / ap_c |
| sk_beta | mv_beta_a MoveDef{ultimate:false} | mfr_beta_a | DF-Y3 | 见共享模板 | ap_b / ap_c |
| sk_gamma | mv_gamma_a MoveDef{ultimate:false} | mfr_gamma_a | MeridianRouteDef{ultimate:false} | ap_a, ap_d, ap_e | ap_e |
| sk_delta | mv_delta_a MoveDef{ultimate:false} | mfr_delta_a | MeridianRouteDef{ultimate:false} | ap_a -> ap_f -> ap_g | ap_g |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-test.md"
            path.write_text(text, encoding="utf-8")
            routes = route_unique.collect_normal_routes([path])
        by_id = {route.route_id: route for route in routes}
        self.assertEqual({"mfr_alpha_a", "mfr_gamma_a", "mfr_delta_a"}, set(by_id))
        self.assertEqual(("ap_a", "ap_b", "ap_c"), by_id["mfr_alpha_a"].signature)
        self.assertEqual(("ap_a", "ap_d", "ap_e"), by_id["mfr_gamma_a"].signature)
        self.assertEqual(("ap_a", "ap_f", "ap_g"), by_id["mfr_delta_a"].signature)

    def test_collects_skill_local_alias_but_not_unbound_shared_template(self):
        text = """
| 武学 | 局部模板别名 | steps |
|---|---|---|
| sk_alpha | D3I-ALPHA | ap_a/70/80→ap_b/70/80→ap_c/70/80 |
| 无绑定武学的共享模板 | D3I | ap_a/70/80→ap_b/70/80→ap_c/70/80 |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-test.md"
            path.write_text(text, encoding="utf-8")
            routes = route_unique.collect_normal_routes([path])
        self.assertEqual(1, len(routes))
        self.assertEqual("D3I-ALPHA", routes[0].route_id)
        self.assertEqual("sk_alpha", routes[0].skill_id)

    def test_normal_collection_excludes_ultimate_routes(self):
        text = diversity_row("sk_alpha", "mv_alpha_a", "mfr_alpha_a", self.POINTS)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-test.md"
            path.write_text(text, encoding="utf-8")
            self.assertEqual([], route_unique.collect_normal_routes([path]))

    def test_collects_explicit_derived_steps_before_runtime_ids_are_assigned(self):
        text = """
| 武学／招式 | 路线定义 | steps |
|---|---|---|
| sk_alpha／mv_alpha_a | 同体派生；不提前登记 ID | ap_a/70/80→ap_b/70/80→ap_c/70/80 |

| 内功 | requiredNature | 专属 steps |
|---|---|---|
| sk_beta | [yin,harmony] | ap_d/70/80→ap_e/70/80→ap_f/70/80 |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-test.md"
            path.write_text(text, encoding="utf-8")
            routes = route_unique.collect_normal_routes([path])
        self.assertEqual({"sk_alpha", "sk_beta"}, {r.skill_id for r in routes})
        self.assertEqual({("ap_a", "ap_b", "ap_c"), ("ap_d", "ap_e", "ap_f")},
                         {r.signature for r in routes})

    def test_target_filter_reports_cross_catalog_counterparts_only(self):
        report = route_unique.analyze_routes([
            self.route("a", source="mine.md"), self.route("b"), self.route("c"),
        ], targets={"mine.md"})
        self.assertEqual(2, len(report["pairs"]))
        self.assertTrue(all("mine.md" in (p["left"]["source"], p["right"]["source"])
                            for p in report["pairs"]))

    def route(self, name, kind="normal", points=None, source=None, skill=None):
        return route_unique.CatalogRoute(
            catalog=name, source=source or f"skills-{name}.md", line=10,
            skill_id=skill or f"sk_{name}", move_id=f"mv_{name}",
            route_id=f"mfr_{name}", signature=points or self.POINTS,
            kind=kind,
        )

    def test_normal_exact_pairs_include_ultimate_and_normal_counterparts(self):
        report = route_unique.analyze_routes([
            self.route("a", "ultimate"), self.route("b"), self.route("c"),
        ])
        self.assertEqual(2, report["summary"]["normal_route_count"])
        self.assertEqual(3, report["summary"]["normal_exact_pair_count"])
        self.assertEqual(3, len(report["pairs"]))
        self.assertTrue(all(pair["exact"] for pair in report["pairs"]))

    def test_normal_similarity_includes_eighty_percent_and_reordered_routes(self):
        report = route_unique.analyze_routes([
            self.route("a", "ultimate"),
            self.route("b", points=self.POINTS[:4] + ("ap_other",)),
            self.route("c", points=tuple(reversed(self.POINTS))),
        ])
        self.assertEqual(0, report["summary"]["normal_exact_pair_count"])
        self.assertEqual([8000, 8000, 10000], sorted(
            pair["overlap_bp"] for pair in report["pairs"]
        ))

    def test_normal_similarity_uses_shorter_denominator_and_excludes_same_skill(self):
        a = self.route("a", "ultimate")
        report = route_unique.analyze_routes([
            a, self.route("b", points=self.POINTS[:3]),
            self.route("c", points=self.POINTS[:3] + ("ap_other",)),
            self.route("d", skill=a.skill_id),
        ])
        pairs = {frozenset((p["left"]["route_id"], p["right"]["route_id"]))
                 for p in report["pairs"]}
        self.assertIn(frozenset(("mfr_a", "mfr_b")), pairs)
        self.assertNotIn(frozenset(("mfr_a", "mfr_c")), pairs)
        self.assertNotIn(frozenset(("mfr_a", "mfr_d")), pairs)

    def test_normal_cli_defaults_to_report_and_strict_only_rejects_exact(self):
        cases = [
            ([self.route("a"), self.route("b")], 0, 1),
            ([self.route("a", "ultimate"), self.route("b")], 0, 1),
            ([self.route("a", "ultimate"), self.route("b", "ultimate")], 1, 1),
            ([self.route("a"), self.route("b", points=tuple(reversed(self.POINTS)))], 0, 0),
        ]
        for routes, default_code, strict_code in cases:
            with self.subTest(routes=routes), mock.patch.object(
                route_unique, "collect_routes", return_value=routes
            ), redirect_stdout(StringIO()):
                self.assertEqual(default_code, route_unique.main(["--all"]))
                self.assertEqual(strict_code, route_unique.main([
                    "--all", "--strict-normal",
                ]))


if __name__ == "__main__":
    unittest.main()
