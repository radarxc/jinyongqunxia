"""Unit tests for the story.v1 DAG checker."""

from __future__ import annotations

import copy
import io
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path

import yaml

from tools.lint import check_story_dag


REGISTRIES = check_story_dag.Registries(
    npc=frozenset({"npc_duanyu"}),
    quest=frozenset({"q_01_main_c_01"}),
    scene=frozenset({"sc_01_wuliangyidao"}),
)


def make_story() -> dict:
    return {
        "schemaVersion": "story.v1",
        "chapterId": "ch01_tianlong",
        "lineId": "main",
        "kind": "main",
        "titleKey": "story.test",
        "eraLayer": "ch01",
        "startNodeId": "n_start",
        "source": {"document": "fixture", "anchors": ["test"]},
        "nodes": [
            {
                "id": "n_start",
                "type": "spawn",
                "titleKey": "story.start",
                "completeOn": "npc/spawned",
                "payload": {
                    "npcId": "npc_duanyu",
                    "sceneId": "sc_01_wuliangyidao",
                    "anchor": "roadside",
                    "eraLayer": "ch01",
                },
                "sourceRef": "fixture",
            },
            {
                "id": "n_task",
                "type": "quest",
                "titleKey": "story.task",
                "completeOn": "quest/succeeded",
                "payload": {"questId": "q_01_main_c_01"},
                "sourceRef": "fixture",
            },
            {
                "id": "n_choice",
                "type": "choice",
                "titleKey": "story.choice",
                "completeOn": "story/choiceCommitted",
                "payload": {
                    "decisionId": "dc_01_01",
                    "options": [
                        {"key": "left", "textKey": "story.left"},
                        {"key": "right", "textKey": "story.right"},
                    ],
                },
                "sourceRef": "fixture",
            },
            {
                "id": "n_end_left",
                "type": "end",
                "titleKey": "story.end.left",
                "completeOn": "immediate",
                "payload": {"endingTags": ["left"]},
                "sourceRef": "fixture",
            },
            {
                "id": "n_end_right",
                "type": "end",
                "titleKey": "story.end.right",
                "completeOn": "immediate",
                "payload": {"endingTags": ["right"]},
                "sourceRef": "fixture",
            },
        ],
        "edges": [
            {"id": "e_start_task", "from": "n_start", "to": "n_task", "trigger": "auto", "priority": 0},
            {"id": "e_task_choice", "from": "n_task", "to": "n_choice", "trigger": "auto", "priority": 0},
            {"id": "e_choice_left", "from": "n_choice", "to": "n_end_left", "trigger": "choice", "choiceKey": "left", "priority": 20},
            {"id": "e_choice_right", "from": "n_choice", "to": "n_end_right", "trigger": "choice", "choiceKey": "right", "priority": 10},
        ],
    }


def codes(story: dict) -> set[str]:
    return {issue.code for issue in check_story_dag.validate_story(story, REGISTRIES)}


class GraphValidationTests(unittest.TestCase):
    def test_accepts_valid_story(self) -> None:
        self.assertEqual([], check_story_dag.validate_story(make_story(), REGISTRIES))

    def test_rejects_cycle_including_end_outgoing_edge(self) -> None:
        story = make_story()
        story["edges"].append({"id": "e_back", "from": "n_end_left", "to": "n_start", "trigger": "auto", "priority": 0})
        self.assertTrue({"GRAPH_CYCLE", "END_OUTGOING"}.issubset(codes(story)))

    def test_rejects_two_zero_indegree_nodes(self) -> None:
        story = make_story()
        story["nodes"].append({"id": "n_other_end", "type": "end", "titleKey": "other", "completeOn": "immediate", "payload": {"endingTags": ["other"]}, "sourceRef": "fixture"})
        self.assertIn("GRAPH_START_COUNT", codes(story))

    def test_rejects_dangling_edge(self) -> None:
        story = make_story()
        story["edges"][0]["to"] = "n_missing"
        self.assertIn("EDGE_REFERENCE", codes(story))

    def test_rejects_unreachable_component(self) -> None:
        story = make_story()
        for node_id in ("n_orphan_a", "n_orphan_b"):
            story["nodes"].append({"id": node_id, "type": "merge", "titleKey": node_id, "completeOn": "immediate", "payload": {"mergeKey": node_id}, "sourceRef": "fixture"})
        story["edges"].extend([
            {"id": "e_orphan_ab", "from": "n_orphan_a", "to": "n_orphan_b", "trigger": "auto", "priority": 0},
            {"id": "e_orphan_ba", "from": "n_orphan_b", "to": "n_orphan_a", "trigger": "auto", "priority": 0},
        ])
        self.assertIn("GRAPH_UNREACHABLE", codes(story))

    def test_rejects_duplicate_node_and_edge_ids(self) -> None:
        story = make_story()
        story["nodes"].append(copy.deepcopy(story["nodes"][-1]))
        story["edges"].append(copy.deepcopy(story["edges"][-1]))
        self.assertTrue({"NODE_DUPLICATE", "EDGE_DUPLICATE"}.issubset(codes(story)))

    def test_rejects_end_node_with_outgoing_edge(self) -> None:
        story = make_story()
        story["edges"].append({"id": "e_end_cross", "from": "n_end_left", "to": "n_end_right", "trigger": "auto", "priority": 0})
        self.assertIn("END_OUTGOING", codes(story))

    def test_rejects_incomplete_choice_mapping(self) -> None:
        story = make_story()
        story["edges"] = [edge for edge in story["edges"] if edge["id"] != "e_choice_right"]
        self.assertIn("CHOICE_COVERAGE", codes(story))


class ReferenceValidationTests(unittest.TestCase):
    def test_rejects_unknown_npc_quest_and_scene(self) -> None:
        story = make_story()
        story["nodes"][0]["payload"].update({"npcId": "npc_missing", "sceneId": "sc_01_missing"})
        story["nodes"][1]["payload"]["questId"] = "q_01_main_c_99"
        issues = check_story_dag.validate_story(story, REGISTRIES)
        unknown = [issue for issue in issues if issue.code == "ID_UNKNOWN"]
        self.assertEqual(3, len(unknown))

    def test_rejects_invalid_id_format_and_era(self) -> None:
        story = make_story()
        story["nodes"][0]["payload"].update({"npcId": "duanyu", "eraLayer": "ch02"})
        self.assertTrue({"ID_FORMAT", "ERA_LAYER"}.issubset(codes(story)))

    def test_rejects_unknown_content_id_inside_condition(self) -> None:
        story = make_story()
        story["edges"][0].update({
            "trigger": "condition",
            "condition": {"quest": {"id": "q_01_main_c_99", "state": "completed"}},
        })
        self.assertIn("ID_UNKNOWN", codes(story))


class TimeWindowTests(unittest.TestCase):
    def add_alternate(self, story: dict) -> None:
        story["nodes"][1]["timeWindow"] = {
            "mode": "relative",
            "anchor": {"event": "story/nodeCompleted", "nodeId": "n_start"},
            "opensAfterMinutes": 0,
            "closesAfterMinutes": 120,
            "onMiss": {"policy": "alternate", "targetNodeId": "n_end_right"},
        }
        story["edges"].append({"id": "e_task_timeout", "from": "n_task", "to": "n_end_right", "trigger": "timeout", "priority": 1000})

    def test_accepts_relative_alternate_window(self) -> None:
        story = make_story()
        self.add_alternate(story)
        self.assertEqual([], check_story_dag.validate_story(story, REGISTRIES))

    def test_rejects_reversed_relative_bounds(self) -> None:
        story = make_story()
        self.add_alternate(story)
        story["nodes"][1]["timeWindow"]["opensAfterMinutes"] = 120
        self.assertIn("TIME_ORDER", codes(story))

    def test_rejects_bad_absolute_date(self) -> None:
        story = make_story()
        story["nodes"][1]["timeWindow"] = {
            "mode": "absolute",
            "epochId": "epoch_ch01",
            "opensAt": {"year": 1093, "month": 13, "day": 1, "hour": 0, "minute": 0},
            "closesAt": {"year": 1093, "month": 1, "day": 2, "hour": 0, "minute": 0},
            "onMiss": {"policy": "defer", "deferByMinutes": 60},
        }
        self.assertIn("TIME_RANGE", codes(story))

    def test_rejects_alternate_without_timeout_edge(self) -> None:
        story = make_story()
        self.add_alternate(story)
        story["edges"].pop()
        self.assertIn("TIMEOUT_EDGE", codes(story))

    def test_rejects_timeout_without_alternate_window(self) -> None:
        story = make_story()
        story["edges"].append({"id": "e_task_timeout", "from": "n_task", "to": "n_end_right", "trigger": "timeout", "priority": 1000})
        self.assertIn("TIMEOUT_EDGE", codes(story))

    def test_rejects_expiring_main_line(self) -> None:
        story = make_story()
        story["trigger"] = {"timeWindow": {
            "mode": "relative",
            "anchor": {"event": "quest/accepted", "questId": "q_01_main_c_01"},
            "opensAfterMinutes": 0,
            "closesAfterMinutes": 60,
            "onMiss": {"policy": "expire"},
        }}
        self.assertIn("MAIN_EXPIRE", codes(story))

    def test_rejects_malformed_window_and_defer_policy(self) -> None:
        story = make_story()
        story["nodes"][1]["timeWindow"] = {
            "mode": "relative",
            "anchor": {"event": "unknown"},
            "opensAfterMinutes": -1,
            "closesAfterMinutes": "soon",
            "onMiss": {"policy": "defer", "deferByMinutes": 0, "maxDefers": 10},
            "epochId": "forbidden",
        }
        found = codes(story)
        self.assertTrue({"TIME_ANCHOR", "TIME_RANGE", "TIME_DEFER", "TIME_MODE"}.issubset(found))

    def test_rejects_reversed_absolute_window(self) -> None:
        story = make_story()
        story["nodes"][1]["timeWindow"] = {
            "mode": "absolute",
            "epochId": "epoch_ch01",
            "opensAt": {"year": 1093, "month": 2, "day": 1, "hour": 0, "minute": 0},
            "closesAt": {"year": 1093, "month": 1, "day": 1, "hour": 0, "minute": 0},
            "onMiss": {"policy": "defer", "deferByMinutes": 60},
        }
        self.assertIn("TIME_ORDER", codes(story))


class ShapeValidationTests(unittest.TestCase):
    def test_rejects_invalid_root_and_required_collections(self) -> None:
        self.assertEqual({"ROOT_TYPE"}, {item.code for item in check_story_dag.validate_story([], REGISTRIES)})
        story = make_story()
        story["nodes"] = []
        self.assertIn("NODES", codes(story))
        story = make_story()
        story["edges"] = None
        self.assertIn("EDGES", codes(story))

    def test_rejects_bad_root_identity_fields(self) -> None:
        story = make_story()
        story.update({"schemaVersion": "story.v2", "chapterId": "bad", "lineId": "branch", "kind": "side", "eraLayer": "ch02"})
        found = codes(story)
        self.assertTrue({"SCHEMA_VERSION", "CHAPTER_ID", "LINE_ID", "ERA_LAYER"}.issubset(found))

    def test_rejects_bad_node_payload_shapes(self) -> None:
        story = make_story()
        story["nodes"][0]["payload"] = None
        story["nodes"][1]["payload"] = {"questId": "q_01_main_c_01", "inlineEvent": {}}
        story["nodes"][2]["payload"]["options"] = [{"key": "same"}, {"key": "same"}]
        story["nodes"][3]["payload"]["endingTags"] = []
        found = codes(story)
        self.assertTrue({"NODE_PAYLOAD", "CHOICE_OPTIONS", "END_TAGS"}.issubset(found))

    def test_rejects_non_immediate_inline_event(self) -> None:
        story = make_story()
        story["nodes"][1]["payload"] = {
            "inlineEvent": {"eventKey": "heal", "actions": [{"id": "fx_heal", "op": "event/emit"}]}
        }
        self.assertIn("NODE_COMPLETE_ON", codes(story))

    def test_rejects_bad_edge_shape_and_side_hook(self) -> None:
        story = make_story()
        story["edges"][0].update({"id": "bad", "trigger": "condition", "priority": 2000})
        story["edges"][2].pop("choiceKey")
        story["sideHooks"] = [{"lineId": "main", "atNodeId": "n_missing"}]
        found = codes(story)
        self.assertTrue({"EDGE_ID", "EDGE_PRIORITY", "EDGE_CONDITION", "EDGE_CHOICE", "SIDE_HOOK"}.issubset(found))


class CliAndRegistryTests(unittest.TestCase):
    def write_repository(self, root: Path, story: dict) -> Path:
        (root / "docs/design/catalog").mkdir(parents=True)
        (root / "docs/design/story/examples").mkdir(parents=True)
        (root / "docs/design/chapters").mkdir(parents=True)
        (root / "tools").mkdir()
        (root / "docs/design/catalog/npcs-fixture.md").write_text("| ID | Name |\n|---|---|\n| `npc_duanyu` | D |\n", encoding="utf-8")
        (root / "docs/design/story/fixture.md").write_text("| ID | Name |\n|---|---|\n| `q_01_main_c_01` | Q |\n", encoding="utf-8")
        (root / "docs/design/chapters/fixture.md").write_text("| ID | Name |\n|---|---|\n| `sc_01_wuliangyidao` | S |\n", encoding="utf-8")
        path = root / "docs/design/story/examples/fixture.yaml"
        path.write_text(yaml.safe_dump(story, allow_unicode=True, sort_keys=False), encoding="utf-8")
        return path

    def test_main_accepts_valid_file_and_prints_ok(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            path = self.write_repository(root, make_story())
            stdout = io.StringIO()
            with redirect_stdout(stdout):
                result = check_story_dag.main([str(path), "--repo-root", str(root)])
        self.assertEqual(0, result)
        self.assertIn("story.v1 DAG valid", stdout.getvalue())

    def test_main_reports_yaml_parse_error(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            path = self.write_repository(root, make_story())
            path.write_text("nodes: [\n", encoding="utf-8")
            stderr = io.StringIO()
            with redirect_stderr(stderr):
                result = check_story_dag.main([str(path), "--repo-root", str(root)])
        self.assertEqual(1, result)
        self.assertIn("YAML_PARSE", stderr.getvalue())

    def test_check_file_reports_missing_file_and_repo_root(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            missing = root / "missing.yaml"
            self.assertEqual("FILE_READ", check_story_dag.check_file(missing, root)[0].code)
            path = root / "story.yaml"
            path.write_text(yaml.safe_dump(make_story()), encoding="utf-8")
            self.assertEqual("REPO_ROOT", check_story_dag.check_file(path)[0].code)

    def test_find_repo_root_from_directory(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "docs").mkdir()
            (root / "tools").mkdir()
            self.assertEqual(root.resolve(), check_story_dag.find_repo_root(root))

    def test_repository_example_passes(self) -> None:
        root = Path(__file__).resolve().parents[2]
        path = root / "docs/design/story/examples/01-tianlong-main.yaml"
        self.assertEqual([], check_story_dag.check_file(path, root))


if __name__ == "__main__":
    unittest.main()
