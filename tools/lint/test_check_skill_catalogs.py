"""Unit tests for the martial-arts catalog consistency checker."""

from __future__ import annotations

from contextlib import redirect_stderr, redirect_stdout
from io import StringIO
import re
import tempfile
import unittest
from unittest import mock
from pathlib import Path

from tools.lint import check_skill_catalogs as checker


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


class DeliveryTests(unittest.TestCase):
    def route(
        self, delivery: str | None, points: tuple[str, ...], *,
        purpose: str = "attack", projection: bool = False,
        skill_id: str = "sk_alpha", move_id: str = "mv_alpha_one",
    ) -> checker.DeliveryRoute:
        return checker.DeliveryRoute(
            "fixture", "skills-fixture.md", 7, skill_id, move_id,
            "mfr_" + move_id.removeprefix("mv_"), points, delivery,
            purpose, projection,
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

    def test_ambiguous_fist_palm_bucket_does_not_turn_fists_into_palms(self) -> None:
        fist = "#### `sk_qishangquan` 七伤拳（9 地上 · 拳脚／拳掌）"
        palm = "##### 大金刚掌 `sk_dajingangzhang`（地下 7 · 拳脚·掌）"
        legacy = "`legacy-set:xinglin_qihuang`；推宫治疗"
        self.assertIsNone(checker._delivery_from_context(fist, "阴阳吞吐"))
        self.assertEqual(
            "palm", checker._delivery_from_context(palm, "大力")
        )
        self.assertIsNone(checker._delivery_from_context("", legacy))

    def test_fist_subtype_defers_to_explicit_palm_action(self) -> None:
        fist = "`sk_qishangquan` 七伤拳；subType:fist"
        palm = "`sk_donghaichaoshengzhang` 东海潮生掌；subType:fist"
        self.assertIsNone(checker._delivery_from_context(fist, "阴阳吞吐"))
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


if __name__ == "__main__":
    unittest.main()
