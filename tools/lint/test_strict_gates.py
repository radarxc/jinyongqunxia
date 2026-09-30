"""Opt-in gates must fail regressions without changing the legacy modes."""

from contextlib import redirect_stderr, redirect_stdout
from dataclasses import replace
from io import StringIO
import json
from pathlib import Path
import tempfile
import unittest
from unittest import mock

from tools.lint import check_skill_catalogs as checker


class StrictGateTests(unittest.TestCase):
    def route(self, **changes):
        values = dict(
            catalog="fixture", source="skills-fixture.md", line=1,
            skill_id="sk_fixture", move_id="mv_fixture", route_id="mfr_fixture",
            signature=("ap_dumai_baihui",), delivery=None,
            purpose="attack", projection=False,
        )
        values.update(changes)
        return checker.DeliveryRoute(**values)

    def run_cli(self, report, *flags):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text("", encoding="utf-8")
            stdout, stderr = StringIO(), StringIO()
            with mock.patch.object(checker, "audit_paths", return_value=[]), \
                    mock.patch.object(checker, "analyze_delivery", return_value=report), \
                    redirect_stdout(stdout), redirect_stderr(stderr):
                code = checker.main([str(path), *flags])
        self.assertEqual("", stderr.getvalue())
        return code, stdout.getvalue()

    def test_each_promoted_endpoint_rule_causes_failure(self):
        # Rule membership is frozen: a new violation must never demote itself.
        empty = checker.analyze_delivery_routes([])
        for rule in checker.DELIVERY_STRICT_RULES:
            with self.subTest(rule=rule):
                finding = checker.DeliveryFinding(self.route(), rule, "fixture")
                report = replace(empty, findings=(finding,))
                code, output = self.run_cli(report, "--delivery-strict", "--json")
                self.assertEqual(1, code)
                payload = json.loads(output)
                self.assertEqual(1, payload["gates"]["delivery"][rule])

    def test_tail_and_normal_projection_are_gated(self):
        routes = [
            self.route(delivery="palm", signature=(
                "ap_shoujueyin_laogong", "ap_dumai_baihui",
                "ap_renmai_qihai", "ap_renmai_guanyuan",
            )),
            self.route(ultimate=False, projection=True),
        ]
        report = checker.analyze_delivery_routes(routes)
        self.assertEqual(1, report.tail_violations)
        self.assertEqual(1, report.nonultimate_projection_violations)
        self.assertEqual(1, self.run_cli(report, "--delivery-strict")[0])

    def test_action_fixtures_cannot_silently_drop_promoted_rules(self):
        # Independent semantic cases, not enumeration of the implementation set.
        cases = [
            ("palm", dict(delivery="palm")),
            ("finger", dict(delivery="finger")),
            ("finger-specific", dict(delivery="finger", move_id="mv_x_shaoshang")),
            ("fist-grapple", dict(delivery="fist-grapple")),
            ("leg", dict(delivery="leg")),
            ("movement", dict(purpose="movement")),
            ("inner-attack", dict(delivery="inner", signature=("ap_shoujueyin_laogong",))),
            ("inner-defense", dict(delivery="inner", purpose="defense",
                                   signature=("ap_shoujueyin_laogong",))),
            ("inner-dantian", dict(delivery="inner", purpose="defense",
                                   signature=("ap_renmai_qihai", "ap_dantian"))),
            ("projection", dict(projection=True)),
            ("weapon-tail", dict(delivery="weapon", signature=(
                "ap_shoutaiyang_wangu", "ap_dumai_baihui",
                "ap_renmai_qihai", "ap_renmai_guanyuan",
            ))),
        ]
        for rule, values in cases:
            with self.subTest(rule=rule):
                report = checker.analyze_delivery_routes([self.route(**values)])
                code, output = self.run_cli(report, "--delivery-strict", "--json")
                self.assertEqual(1, code)
                self.assertEqual(1, json.loads(output)["gates"]["delivery"][rule])

    def test_weapon_missing_and_route_nature_remain_visible_report_only(self):
        report = checker.analyze_delivery_routes([
            self.route(delivery="weapon", nature="yin")
        ])
        self.assertEqual(["weapon"], [item.rule for item in report.findings])
        self.assertEqual(1, report.nature_conflicts)
        code, output = self.run_cli(report, "--delivery-strict", "--details")
        self.assertEqual(0, code)
        self.assertIn("DELIVERY rule=weapon;", output)
        self.assertIn("DELIVERY rule=nature-conflict;", output)

    def test_report_and_legacy_strict_do_not_gate_delivery(self):
        report = checker.analyze_delivery_routes([self.route(delivery="palm")])
        for flags in [("--delivery",), ("--strict", "--delivery")]:
            self.assertEqual(0, self.run_cli(report, *flags)[0])

    def test_inner_missing_and_conflict_have_separate_gate(self):
        empty = checker.analyze_delivery_routes([])
        for field in ("inner_nature_missing_meridians", "inner_nature_conflicts"):
            with self.subTest(field=field):
                report = replace(empty, **{field: 1})
                self.assertEqual(1, self.run_cli(report, "--inner-nature-strict")[0])
                self.assertEqual(0, self.run_cli(report, "--delivery-strict")[0])

    def test_legacy_modes_never_run_new_audits(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text("", encoding="utf-8")
            for flags in [("--strict",), ("--strict", "--details"),
                          ("--strict", "--diversity-strict")]:
                with self.subTest(flags=flags), \
                        mock.patch.object(checker, "audit_paths", return_value=[]), \
                        mock.patch.object(checker, "analyze_delivery", side_effect=
                                          AssertionError("unexpected delivery")), \
                        mock.patch.object(checker.route_checks, "audit_routes", side_effect=
                                          AssertionError("unexpected route audit")), \
                        mock.patch.object(checker, "analyze_route_diversity",
                                          return_value=None), \
                        redirect_stdout(StringIO()):
                    self.assertEqual(0, checker.main([str(path), *flags]))

    def test_current_catalogs_satisfy_promoted_rules(self):
        report = checker.analyze_delivery(checker.CATALOG_PATHS)
        self.assertFalse(any(checker.delivery_gate_counts(report).values()))
        self.assertEqual(0, report.inner_nature_missing_meridians)
        self.assertEqual(0, report.inner_nature_conflicts)


class RouteGateCliTests(unittest.TestCase):
    def run_cli(self, flags, *, point="ap_renmai_qihai", ct="80", grade="6 玄上",
                steps=None):
        text = (
            f"| sk_fixture | {grade} | 定义 |\n"
            "| mv_fixture MoveDef{unlock:7; ultimate:true; rageCost:100; "
            "mpCost:10%; cd:0; recovery:1200} |\n"
            "| mv_fixture→mfr_fixture/true/attack/显式 |\n"
            "<!-- skill-catalog-audit:start -->\n"
            "| 品阶 | 武学 | MoveDef | MeridianRouteDef | steps |\n"
            "|---|---|---|---|---|\n"
            f"| {grade} | sk_fixture | mv_fixture "
            "MoveDef{ultimate:true; recovery:1200} | mfr_fixture "
            "MeridianRouteDef{moveRef:mv_fixture; ultimate:true; purpose:attack} | "
            f"{steps if steps is not None else f'{point}/{ct}/100'} |\n"
            "<!-- skill-catalog-audit:end -->\n"
        )
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-fixture.md"
            path.write_text(text, encoding="utf-8")
            output = StringIO()
            with redirect_stdout(output):
                code = checker.main([str(path), "--json", *flags])
        return code, json.loads(output.getvalue())

    def run_external_cli(self, flag, steps, ending=""):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "skills-wujue.md"
            external, body = Path(directory) / "21.md", Path(directory) / "05.md"
            path.write_text("# 五绝\n", encoding="utf-8")
            yaml, bodies = [], []
            for move_id, (_, route_id, _) in checker.EXTERNAL_WUJUE.items():
                yaml.append(f"  - id: {route_id}\n    moveRef: {move_id}\n    steps:\n" + "\n".join(steps) + "\n")
                bodies.append(f"  - {{ id: {move_id}, recovery: 1200 }}")
            external.write_text("".join(yaml) + ending, encoding="utf-8")
            body.write_text("\n".join(bodies), encoding="utf-8")
            audit_routes = checker.route_checks.audit_routes
            output = StringIO()
            with mock.patch.object(checker, "audit_paths", return_value=[]), \
                    mock.patch.object(checker, "is_official_catalog", return_value=True), \
                    mock.patch.object(checker.route_checks, "audit_routes", side_effect=lambda paths:
                                      audit_routes(paths, registered_acupoints={"ap_alpha", "ap_beta", "ap_gamma"},
                                                   external_path=external, external_body_path=body)), \
                    redirect_stdout(output):
                code = checker.main([str(path), "--json", flag])
            return code, json.loads(output.getvalue())

    def test_grade_six_unknown_requires_explicit_gate(self):
        values = dict(point="ap_fixture_unknown")
        self.assertEqual(0, self.run_cli(["--routes"], **values)[0])
        for flag in ("--routes-strict", "--acupoints-strict"):
            code, report = self.run_cli([flag], **values)
            self.assertEqual(1, code)
            self.assertEqual(1, report["route_values"]["counts"]["unregistered"])

    def test_grade_six_missing_steps_cannot_pass_registry_gate(self):
        code, report = self.run_cli(["--acupoints-strict"], steps="见路线索引")
        self.assertEqual(1, code)
        self.assertEqual(1, report["gates"]["acupoints"]["unparsed"])

    def test_damaged_point_tokens_fail_both_route_gates_for_each_tier(self):
        for grade in ("12 天上", "9 地上", "6 玄上"):
            for bad in ("BAD_NODE", "AP_RENMAI_QIHAI", "ap_renmai_QIHAI",
                        "ap_renmai_qihaiINVALID", "ap_renmai_qihai!", "ap_renmai_qihai;INVALID"):
                for flag in ("--routes-strict", "--acupoints-strict"):
                    with self.subTest(grade=grade, bad=bad, flag=flag):
                        code, report = self.run_cli([flag], grade=grade, point=bad)
                        self.assertEqual(1, code)
                        counts = report["route_values"]["counts"]
                        self.assertGreater(counts["unparsed"] + counts["unregistered"], 0)

    def test_mixed_damaged_steps_fail_both_route_gates_for_each_tier(self):
        for grade in ("12 天上", "9 地上", "6 玄上"):
            for bad in ("BAD_NODE", "AP_RENMAI_QIHAI", "ap_renmai_QIHAI",
                        "ap_renmai_qihaiINVALID", "ap_renmai_qihai!", "ap_renmai_qihai;INVALID"):
                for position in range(3):
                    points = ["ap_renmai_qihai", "ap_dumai_mingmen"]
                    points.insert(position, bad)
                    steps = "→".join(f"{point}/80/100" for point in points)
                    for flag in ("--routes-strict", "--acupoints-strict"):
                        with self.subTest(grade=grade, bad=bad, position=position, flag=flag):
                            code, report = self.run_cli([flag], grade=grade, steps=steps)
                            self.assertEqual(1, code)
                            counts = report["route_values"]["counts"]
                            self.assertGreater(counts["unparsed"] + counts["unregistered"], 0)

    def test_misindented_external_steps_fail_both_gates(self):
        points = ["ap_alpha", "ap_beta", "ap_gamma"]
        valid = [f"      - {{ acupointRef: {point}, segmentCt: 80, riskBp: 100 }}" for point in points]
        for position, point in enumerate(points):
            for payload in ((point, 80, 100), ("ap_unknown", 80, 100), (point, 800, 1300)):
                for indent in (0, 4, 7):
                    steps = valid.copy()
                    steps[position] = " " * indent + (
                        f"- {{ acupointRef: {payload[0]}, segmentCt: {payload[1]}, riskBp: {payload[2]} }}")
                    for flag in ("--routes-strict", "--acupoints-strict"):
                        with self.subTest(position=position, payload=payload, indent=indent, flag=flag):
                            code, report = self.run_external_cli(flag, steps)
                            self.assertEqual(1, code)
                            self.assertEqual(3, report["route_values"]["counts"]["unparsed"])

    def test_external_field_like_steps_fail_both_gates(self):
        valid = "      - { acupointRef: ap_alpha, segmentCt: 80, riskBp: 100 }"
        damaged = (
            "    acupointRef: ap_beta, segmentCt: 80, riskBp: 100",
            "    purpose: attack\n- { acupointRef: ap_beta, segmentCt: 800, riskBp: 1300 }",
        )
        for step in damaged:
            for flag in ("--routes-strict", "--acupoints-strict"):
                with self.subTest(step=step, flag=flag):
                    code, report = self.run_external_cli(flag, [valid, step])
                    self.assertEqual(1, code)
                    self.assertEqual(3, report["route_values"]["counts"]["unparsed"])

    def test_supported_external_boundaries_pass_both_gates(self):
        endings = {
            "next_route": "  - id: mfr_other\n    moveRef: mv_other\n    steps: []\n",
            "skill_patch": "skillPatch:\n  - { id: sk_other, ultimateMoveRef: mv_other }\n",
            "fence": "```\n正文结束。\n",
            "purpose": "    purpose: attack\n",
            "inner_guard": "    innerGuard: { enabled: true, reflectBp: 0 }\n",
        }
        steps = ["      - { acupointRef: ap_alpha, segmentCt: 80, riskBp: 100 }"]
        for boundary, ending in endings.items():
            for flag in ("--routes-strict", "--acupoints-strict"):
                with self.subTest(boundary=boundary, flag=flag):
                    code, report = self.run_external_cli(flag, steps, ending)
                    self.assertEqual(0, code)
                    self.assertFalse(any(report["route_values"]["counts"].values()))

    def test_ct_debt_fails_values_but_not_registry_or_report_mode(self):
        values = dict(grade="9 地上", ct="121")
        self.assertEqual(0, self.run_cli(["--routes"], **values)[0])
        self.assertEqual(0, self.run_cli(["--acupoints-strict"], **values)[0])
        code, report = self.run_cli(["--routes-strict"], **values)
        self.assertEqual(1, code)
        self.assertEqual(1, report["gates"]["route_values"]["ct"])

    def test_grade_six_numeric_scope_remains_registry_only(self):
        code, report = self.run_cli(["--routes-strict"], ct="121")
        self.assertEqual(0, code)
        self.assertEqual(0, report["route_values"]["counts"]["ct"])


if __name__ == "__main__":
    unittest.main()
