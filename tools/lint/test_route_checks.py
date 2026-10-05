"""Regressions for audits of concrete routes instead of empty index rows."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest import mock

from tools.lint import check_skill_catalogs as checker
from tools.lint import route_checks as routes


def catalog(steps: str, grade: str = "12 天上", recovery: str = "1200",
            suffix: str = "") -> str:
    return f"""
| sk_alpha | {grade} | 定义 |
| mv_alpha_one MoveDef{{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:{recovery}}} |
| mv_alpha_one→mfr_alpha_one/true/attack/显式 |
<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文真值） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| {grade} | sk_alpha | mv_alpha_one MoveDef{{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:{recovery}; meridianRouteRef:mfr_alpha_one}} | mfr_alpha_one | MeridianRouteDef{{moveRef:mv_alpha_one; ultimate:true; purpose:attack}}；{steps}{suffix} |
<!-- skill-catalog-audit:end -->
"""


class ActualRouteTests(unittest.TestCase):
    def audit(self, text: str):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            return routes.audit_routes([path], registered_acupoints={
                "ap_alpha", "ap_beta", *(f"ap_p{number}" for number in range(8))
            })

    def test_actual_final_row_is_used_instead_of_empty_index(self):
        text = catalog("ap_alpha/80/100→ap_beta/80/120")
        mirror = checker.parse_target_routes(text)["mv_alpha_one"]
        self.assertEqual(((), (), ()), checker._route_values(text.splitlines()[mirror.line - 1], mirror.route_id))
        report = self.audit(text)
        self.assertEqual([], report.findings)
        self.assertEqual((80, 80), report.routes[0].segment_ct)
        self.assertEqual(("ap_alpha", "ap_beta"), report.routes[0].points)
        self.assertNotEqual(mirror.line, report.routes[0].line)
        self.assertEqual(1, report.catalogs[0].parsed_by_tier["天"])

    def test_outlet_hints_do_not_add_points_or_hide_duplicate_steps(self):
        report = self.audit(catalog("ap_alpha/80/100→ap_alpha/80/120",
                                   suffix="；出口提示：ap_unknown→ap_beta→ap_unknown"))
        self.assertEqual(("ap_alpha", "ap_alpha"), report.routes[0].points)
        self.assertEqual(["duplicate"], [finding.code for finding in report.findings])

    def test_outlet_only_cannot_replace_missing_steps(self):
        report = self.audit(catalog("见模板", suffix="；出口提示：ap_alpha→ap_beta"))
        self.assertEqual(["unparsed"], [finding.code for finding in report.findings])
        self.assertEqual(0, report.catalogs[0].parsed_by_tier["天"])
        self.assertEqual(1, report.catalogs[0].expected_by_tier["天"])

    def test_index_without_definition_is_explicitly_unparsed(self):
        report = self.audit(catalog("ap_alpha/80/100").split("<!-- skill-catalog-audit:start -->")[0])
        self.assertEqual(1, report.counts["unparsed"])

    def test_each_tier_checks_the_actual_acupoint_registry(self):
        for grade, tier in (("12 天上", "天"), ("9 地上", "地"), ("6 玄上", "玄上")):
            with self.subTest(tier=tier):
                report = self.audit(catalog("ap_unknown/80/100", grade=grade))
                self.assertEqual(1, report.counts["unregistered"])
                self.assertEqual(tier, report.findings[0].tier)

    def test_grade_six_does_not_silently_expand_to_other_constraints(self):
        report = self.audit(catalog("ap_alpha/-5/-7→ap_alpha/300/1300", grade="6 玄上", recovery="3000"))
        self.assertEqual([], report.findings)

    def assert_damaged_points_reported(self, report, expected):
        self.assertGreater(report.counts["unparsed"] + report.counts["unregistered"], 0)
        route = report.routes[0]
        if route.parsed:
            self.assertEqual(expected, route.points)
        if route.tier == "玄上":
            self.assertFalse(set(item.code for item in report.findings) - {"unparsed", "unregistered"})

    def test_each_tier_rejects_wholly_damaged_point_tokens(self):
        for grade in ("12 天上", "9 地上", "6 玄上"):
            for bad in ("BAD_NODE", "AP_ALPHA", "ap_ALPHA", "ap_alphaINVALID",
                        "ap_alpha!", "ap_alpha;INVALID"):
                with self.subTest(grade=grade, bad=bad):
                    report = self.audit(catalog(f"{bad}/80/100", grade=grade))
                    self.assert_damaged_points_reported(report, (bad,))

    def test_each_tier_preserves_damaged_nodes_among_valid_steps(self):
        for grade in ("12 天上", "9 地上", "6 玄上"):
            for bad in ("BAD_NODE", "AP_ALPHA", "ap_ALPHA", "ap_alphaINVALID",
                        "ap_alpha!", "ap_alpha;INVALID"):
                for position in range(3):
                    points = ["ap_alpha", "ap_beta"]
                    points.insert(position, bad)
                    with self.subTest(grade=grade, bad=bad, position=position):
                        steps = "→".join(f"{point}/80/100" for point in points)
                        report = self.audit(catalog(steps, grade=grade,
                                                   suffix="；出口提示：ap_unknown→ap_alpha"))
                        self.assert_damaged_points_reported(report, tuple(points))

    def test_negative_and_noninteger_values_are_never_dropped(self):
        for ct, risk in (("-40", "-1"), ("80.5", "1200.5"), ("bad", "bad")):
            with self.subTest(ct=ct, risk=risk):
                report = self.audit(catalog(f"ap_alpha/{ct}/{risk}→ap_beta/80/100"))
                self.assertEqual(("ap_alpha", "ap_beta"), report.routes[0].points)
                self.assertEqual(1, report.counts["ct"])
                self.assertEqual(1, report.counts["risk"])

    def test_length_check_handles_partial_and_overlong_routes(self):
        for steps in ("ap_alpha/80/100→ap_beta", "→".join(["ap_alpha/40/0"] * 19)):
            with self.subTest(steps=steps):
                self.assertEqual(1, self.audit(catalog(steps)).counts["length"])

    def test_ct_risk_boundaries_and_recovery_sum(self):
        self.assertFalse(self.audit(catalog("ap_alpha/40/0→ap_beta/120/1200")).findings)
        steps = "→".join(f"ap_p{number}/100/100" for number in range(8))
        self.assertFalse(self.audit(catalog(steps, recovery="1200")).findings)
        report = self.audit(catalog(steps, recovery="1201"))
        self.assertEqual(1, report.counts["recovery"])
        self.assertIn("1201 + 800 = 2001", report.findings[0].detail)
        for value in ("bad", "1200.5", "-1200", "699", "1501"):
            self.assertEqual(1, self.audit(catalog("ap_alpha/80/100", recovery=value)).counts["recovery"])
        for value in ("700", "1500"):
            self.assertFalse(self.audit(catalog("ap_alpha/80/100", recovery=value)).findings)

    def test_legacy_pair_steps_expand_scalar_ct_and_preserve_bad_count(self):
        text = """
| sk_alpha | 9 地上 | 定义 |
| mv_alpha_one MoveDef{ultimate:true; recovery:1200} |
| mv_alpha_one→mfr_alpha_one/true/attack/显式 |
| 武学 | 路线 ID | moveRef | 资源字段 | purpose | 计时 CT | steps（依次为穴位/riskBp） |
|---|---|---|---|---|---|---|
| sk_alpha | mfr_alpha_one | mv_alpha_one | 7 / true / 100 / 9% / 0 / 1200 | attack | 2×80 / 160 / 1360 | ap_alpha/100→ap_beta/120 |
"""
        report = self.audit(text)
        self.assertEqual([], report.findings)
        self.assertEqual((80, 80), report.routes[0].segment_ct)
        self.assertEqual(1, self.audit(text.replace("2×80", "3×80")).counts["length"])
        for count in ("9.2", "-2", "2.0", "999999999999999"):
            self.assertEqual(1, self.audit(text.replace("2×80", f"{count}×80")).counts["length"])
        for value in ("1200.5", "bad", "-1200"):
            changed = text.replace("9% / 0 / 1200", f"9% / 0 / {value}")
            self.assertEqual(1, self.audit(changed).counts["recovery"])

    def test_default_registry_uses_registered_table_only(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(catalog("ap_dantian/80/100"), encoding="utf-8")
            with mock.patch.object(checker, "load_acupoint_meridians", return_value={"ap_alpha": "mer_alpha"}) as registry:
                report = routes.audit_routes([path])
            registry.assert_called_once_with()
        self.assertEqual(1, report.counts["unregistered"])

    def test_external_wujue_reads_yaml_values_and_body_recovery(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-wujue.md"
            external = Path(directory) / "21.md"
            body = Path(directory) / "05.md"
            path.write_text("# 五绝\n", encoding="utf-8")
            yaml, bodies = [], []
            for move_id, (_, route_id, _) in checker.EXTERNAL_WUJUE.items():
                yaml.append(f"""  - id: {route_id}
    moveRef: {move_id}
    ultimate: true
    steps:
      - {{ acupointRef: ap_alpha, segmentCt: 80, riskBp: 120 }}
""")
                bodies.append(f"  - {{ id: {move_id}, recovery: 1921 }}")
            external.write_text("".join(yaml), encoding="utf-8")
            body.write_text("\n".join(bodies), encoding="utf-8")
            with mock.patch.object(checker, "is_official_catalog", return_value=True):
                report = routes.audit_routes([path], registered_acupoints={"ap_alpha"},
                                             external_path=external, external_body_path=body)
                self.assertEqual(3, report.catalogs[0].parsed_by_tier["天"])
                self.assertEqual(3, report.counts["recovery"])
                self.assertTrue(all(item.source == "21.md" for item in report.routes))
                external.write_text("".join(yaml[1:]), encoding="utf-8")
                missing = routes.audit_routes([path], registered_acupoints={"ap_alpha"},
                                              external_path=external, external_body_path=body)
                self.assertEqual(1, missing.counts["unparsed"])
                self.assertEqual(3, missing.catalogs[0].expected_by_tier["天"])

    def audit_external_points(self, points, replacement=None, ending=""):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-wujue.md"
            external, body = Path(directory) / "21.md", Path(directory) / "05.md"
            path.write_text("# 五绝\n", encoding="utf-8")
            yaml, bodies = [], []
            for move_id, (_, route_id, _) in checker.EXTERNAL_WUJUE.items():
                yaml.append(f"  - id: {route_id}\n    moveRef: {move_id}\n    steps:\n")
                yaml.extend(f"      - {{ acupointRef: {point}, segmentCt: 80, riskBp: 100 }}\n"
                            for point in points)
                bodies.append(f"  - {{ id: {move_id}, recovery: 1200 }}")
            yaml_text = "".join(yaml) + ending
            if replacement:
                yaml_text = yaml_text.replace(*replacement)
            external.write_text(yaml_text, encoding="utf-8")
            body.write_text("\n".join(bodies), encoding="utf-8")
            with mock.patch.object(checker, "is_official_catalog", return_value=True):
                return routes.audit_routes([path], registered_acupoints={"ap_alpha", "ap_beta", "ap_gamma"},
                                           external_path=external, external_body_path=body)

    def test_external_yaml_rejects_wholly_damaged_point_tokens(self):
        for bad in ("BAD_NODE", "AP_ALPHA", "ap_ALPHA", "ap_alphaINVALID",
                    "ap_alpha!", "ap_alpha;INVALID"):
            with self.subTest(bad=bad):
                report = self.audit_external_points([bad])
                self.assertEqual(3, report.counts["unparsed"] + report.counts["unregistered"])
                self.assert_damaged_points_reported(report, (bad,))

    def test_external_yaml_preserves_damaged_nodes_among_valid_steps(self):
        for bad in ("BAD_NODE", "AP_ALPHA", "ap_ALPHA", "ap_alphaINVALID",
                    "ap_alpha!", "ap_alpha;INVALID"):
            for position in range(3):
                points = ["ap_alpha", "ap_beta"]
                points.insert(position, bad)
                with self.subTest(bad=bad, position=position):
                    report = self.audit_external_points(points)
                    self.assertEqual(3, report.counts["unparsed"] + report.counts["unregistered"])
                    for route in report.routes:
                        if route.parsed:
                            self.assertEqual(tuple(points), route.points)

    def test_external_yaml_rejects_incomplete_or_ambiguous_steps(self):
        bad_steps = (
            ("acupointRef: ap_beta, ", ""),
            ("      - { acupointRef: ap_beta, segmentCt: 80, riskBp: 100 }",
             "      - BAD_NODE"),
            ("acupointRef: ap_beta,", "acupointRef: ap_beta, acupointRef: ap_alpha,"),
            ("      - { acupointRef: ap_beta, segmentCt: 80, riskBp: 100 }",
             "    acupointRef: ap_beta, segmentCt: 80, riskBp: 100"),
            ("      - { acupointRef: ap_beta, segmentCt: 80, riskBp: 100 }",
             "    purpose: attack\n- { acupointRef: ap_beta, segmentCt: 800, riskBp: 1300 }"),
            ("      - { acupointRef: ap_beta, segmentCt: 80, riskBp: 100 }",
             "     - { acupointRef: BAD_NODE, segmentCt: 80, riskBp: 100 }\n"
             "      - { acupointRef: ap_beta, segmentCt: 80, riskBp: 100 }"),
        )
        for replacement in bad_steps:
            with self.subTest(replacement=replacement):
                report = self.audit_external_points(["ap_alpha", "ap_beta"], replacement)
                self.assertEqual(3, report.counts["unparsed"])
                self.assertTrue(all(not route.parsed for route in report.routes))

    def test_external_yaml_rejects_misindented_first_middle_and_last_steps(self):
        points = ["ap_alpha", "ap_beta", "ap_gamma"]
        for position, point in enumerate(points):
            original = f"      - {{ acupointRef: {point}, segmentCt: 80, riskBp: 100 }}"
            for payload in ((point, 80, 100), ("ap_unknown", 80, 100), (point, 800, 1300)):
                for indent in (0, 4, 7):
                    replacement = " " * indent + (
                        f"- {{ acupointRef: {payload[0]}, segmentCt: {payload[1]}, riskBp: {payload[2]} }}")
                    with self.subTest(position=position, payload=payload, indent=indent):
                        report = self.audit_external_points(points, (original, replacement))
                        self.assertEqual(3, report.counts["unparsed"])
                        self.assertTrue(all(not route.parsed for route in report.routes))

    def test_external_yaml_accepts_supported_end_boundaries(self):
        endings = {
            "next_route": "  - id: mfr_other\n    moveRef: mv_other\n    steps: []\n",
            "skill_patch": "skillPatch:\n  - { id: sk_other, ultimateMoveRef: mv_other }\n",
            "fence": "```\n正文结束。\n",
            "purpose": "    purpose: attack\n",
            "inner_guard": "    innerGuard: { enabled: true, reflectBp: 0 }\n",
        }
        for boundary, ending in endings.items():
            with self.subTest(boundary=boundary):
                report = self.audit_external_points(["ap_alpha", "ap_beta"], ending=ending)
                self.assertEqual(dict.fromkeys(routes.ROUTE_CODES, 0), report.counts)
                self.assertTrue(all(route.parsed for route in report.routes))

    def test_current_catalogs_cover_all_routes_including_three_external(self):
        report = routes.audit_routes(checker.CATALOG_PATHS)
        self.assertEqual(25, len(report.catalogs))
        self.assertEqual(654, len(report.routes))
        self.assertTrue(all(route.parsed for route in report.routes))
        self.assertEqual(3, sum(route.source == checker.MERIDIAN_FLOW_PATH.name for route in report.routes))
        self.assertEqual(dict.fromkeys(routes.ROUTE_CODES, 0), report.counts)


if __name__ == "__main__":
    unittest.main()
