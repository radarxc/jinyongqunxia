"""Unit tests for the martial-arts catalog consistency checker."""

from __future__ import annotations

from contextlib import redirect_stdout
from io import StringIO
import tempfile
import unittest
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
            self.assertEqual(["mfr_alpha_one"], [item.route_id for item in definitions])
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

    def test_skill_counts_are_derived_only_from_target_set(self) -> None:
        text = VALID_INSTANCE + """
| sk_unrelated | 9 地上 | no ultimate |
| txp_alpha | outOfBattleScaleBp:15000 |
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            audit = checker.audit_catalog(path)
        self.assertEqual(1, audit.tier_counts["天"]["skills"])
        self.assertEqual(0, audit.tier_counts["地"]["skills"])

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


if __name__ == "__main__":
    unittest.main()
