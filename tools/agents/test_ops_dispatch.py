"""决策层夹具 + 小型仓库与假进程执行层；不会启动真实处置会话。"""
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from tools.agents import ops_dispatch as O
from tools.agents.test_supervise_rebase import git

FIXTURES = Path(__file__).parent / "fixtures/ops"


class DecisionsTest(unittest.TestCase):
    def test_event_fixture_matrix(self):
        for row in O.read_json(FIXTURES / "events.json", []):
            with self.subTest(name=row["name"]):
                self.assertEqual(O.classify(O.Event(**row["event"])).kind, row["action"])

    def test_mechanical_and_semantic_conflicts(self):
        imports = (FIXTURES / "import.diff3").read_text()
        table = (FIXTURES / "registry.diff3").read_text()
        semantic = (FIXTURES / "semantic.diff3").read_text()
        self.assertTrue(O.mechanical({"a.ts": imports, "ids.md": table}))
        for conflict in ({}, {"a.ts": semantic}, {"a.ts": imports, "b.ts": semantic},
                         {"a.md": table.replace("entry_b", "entry_a")}, {"a.ts": "incomplete <<<<<<<"},
                         {"a.json": imports}):
            self.assertFalse(O.mechanical(conflict))
        for args, expected in ((["--checks", "original.md"], "mechanical"), (None, "inbox")):
            self.assertEqual(O.classify(O.Event("ready", "ENG-a", "cherry-pick 失败", context={
                "conflicts": {"a.ts": imports}, "args": args})).kind, expected)

    def test_base_retained_append_before_common_line(self):
        content = "<<<<<<< HEAD\nimport a\nimport base\n||||||| base\nimport base\n=======\nimport b\nimport base\n>>>>>>> task\n"
        self.assertTrue(O.mechanical({"a.py": content}))
        self.assertFalse(O.mechanical({"a.py": content.replace("import base\n=======", "import removed\n=======" )}))

    def test_known_fix_patterns(self):
        rules = O.read_json(FIXTURES / "config.json")["fixes"]
        cases = (("content-plugin.test.ts Test timed out in 5000ms", "content-plugin"),
                 ("Unhandled rejection HOST_DISPOSED", "HOST_DISPOSED"),
                 ("BattleSession expected 212 to be ≤ 205", "BattleSession"),
                 ("session total 111.25 110 FAIL", "首次会话"))
        for text, name in cases:
            with self.subTest(text=text):
                found = O.known_fixes(text, rules)
                self.assertEqual(len(found), 1)
                self.assertIn(name, found[0]["name"])
        self.assertEqual(O.known_fixes("unrelated test timed out in 5000ms", rules), [])
        self.assertEqual(O.known_fixes("unrelated expected 1 to be 2", rules), [])

    def test_fix_states_and_missing_original_args(self):
        for state, expected in (("pending", "wait_fix"), ("merged", "revalidate"),
                                ("contained", "inbox"), ("unknown", "inbox")):
            with self.subTest(state=state):
                context = {"args": ["--checks", "x"], "fixes": [{"state": state}]}
                self.assertEqual(O.classify(O.Event("validate", "ENG-a", context=context)).kind, expected)
        self.assertEqual(O.classify(O.Event("validate", "ENG-a", context={
            "fixes": [{"state": "merged"}]})).kind, "inbox")
        self.assertEqual(O.classify(O.Event("validate", "ENG-a", context={
            "args": ["--checks", "x"], "fixes": [{"state": "merged"}, {"state": "pending"}]})).kind, "wait_fix")
        self.assertEqual(O.classify(O.Event("ready", "ENG-a", context={"probe_error": True})).kind, "inbox")
        self.assertEqual(O.classify(O.Event("ready", "ENG-a", context={"already_merged": True})).kind, "skip")

    def test_stall_groups_use_mtime_and_distinct_tasks(self):
        records = [{"task": "ENG-a", "mtime": 100}, {"task": "ENG-a", "mtime": 105},
                   {"task": "ENG-b", "mtime": 390}, {"task": "ENG-c", "mtime": 5000}]
        self.assertEqual(len(O.stall_groups(records)), 1)
        self.assertEqual({r["task"] for r in O.stall_groups(records)[0]}, {"ENG-a", "ENG-b"})
        self.assertEqual(O.stall_groups(records[:2]), [])

    def test_prod_numbers_delta_and_failure_summary(self):
        result = O.parse_prod((FIXTURES / "prod_green.log").read_text(),
                              {"entry": 38, "render": 160, "webgl": 198, "session": 100})
        self.assertEqual(result["rc"], 0)
        self.assertEqual(result["numbers"]["session"], 108.91)
        self.assertEqual(result["delta"]["entry"], 0.79)
        red = O.parse_prod((FIXTURES / "prod_red.log").read_text())
        self.assertEqual(red["rc"], 1)
        self.assertIn("HOST_DISPOSED", red["summary"])
        self.assertIsNone(red["numbers"]["entry"])
        self.assertIsNone(O.parse_prod("build interrupted")["rc"])

    def test_do_not_touch_art_lines_even_with_low_disk(self):
        for prefix in O.PROTECTED:
            for kind in ("ready", "validate", "stall", "merge"):
                with self.subTest(prefix=prefix, kind=kind):
                    self.assertEqual(O.classify(O.Event(kind, prefix + "-a", context={"disk_gib": 0})).kind, "skip")


class CollectorTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="tianshu-ops-test-")
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        git(self.root, "init", "-q")
        git(self.root, "config", "user.name", "test")
        git(self.root, "config", "user.email", "test@local")
        (self.root / "base.txt").write_text("base\n")
        git(self.root, "add", "base.txt")
        git(self.root, "commit", "-qm", "init")
        self.driver = O.Dispatcher(self.root, {"fixes": [], "supervise_args": {}}, dry=True)

    def test_offsets_partial_lines_rotation_and_truncation(self):
        path = self.root / "stream.log"
        path.write_text("one\ntw")
        offsets = {}
        self.assertEqual(O.new_lines(path, offsets), ["one"])
        with path.open("a") as stream:
            stream.write("o\n")
        self.assertEqual(O.new_lines(path, offsets), ["two"])
        self.assertEqual(O.new_lines(path, offsets), [])
        path.write_text("x\n")
        self.assertEqual(O.new_lines(path, offsets), ["x"])
        path.rename(self.root / "old.log")
        path.write_text("rotated\n")
        self.assertEqual(O.new_lines(path, offsets), ["rotated"])

    def test_dry_run_does_not_create_coord_or_launch_process(self):
        event = O.Event("ready", "ENG-a", "cherry-pick 失败", "READY")
        self.driver.enqueue(event, "ready")
        with patch.object(self.driver, "note"), patch.object(self.driver, "preview") as preview, \
                patch.object(self.driver, "launch") as launch:
            self.driver.tick()
        preview.assert_not_called()
        launch.assert_not_called()
        self.assertFalse((self.root / ".agents").exists())

    def test_low_disk_stops_conflict_preview(self):
        event = O.Event("ready", "ENG-a", "cherry-pick 失败", "READY")
        usage = O.shutil._ntuple_diskusage(10 * 2**30, 9 * 2**30, 2**30)
        with patch.object(O.shutil, "disk_usage", return_value=usage), patch.object(
                self.driver, "preview") as preview:
            result = self.driver.context(event)
        preview.assert_not_called()
        self.assertEqual(O.classify(result).kind, "inbox")

    def test_merge_trailers_only_new_commits(self):
        self.driver.collect()
        (self.root / "base.txt").write_text("next\n")
        git(self.root, "add", "base.txt")
        git(self.root, "commit", "-qm", "integrated\n\nAgent-Task: ENG-new")
        self.driver.collect()
        merges = [e for e in self.driver.state["pending"].values() if e["kind"] == "merge"]
        self.assertEqual(len(merges), 1)
        self.assertEqual(merges[0]["task"], "ENG-new")

    def test_stall_uses_old_attempt_mtime_when_current_is_already_resumed(self):
        folder = self.root / ".agents/logs/ENG-a"
        folder.mkdir(parents=True)
        old = folder / "1.log"
        old.write_text("# 命令：codex -m gpt-6.1-sol\ncontext compacted\n")
        os.utime(old, (1000, 1000))
        new = folder / "2.log"
        new.write_text("new attempt\n")
        os.utime(new, (3000, 3000))
        warning = O.dt.datetime.fromtimestamp(2500).strftime("%Y-%m-%d %H:%M:%S")
        self.driver.collect_stall("ENG-a", f"[{warning}] wait: STALLED", {"log": str(new), "model": "other"})
        record = self.driver.state["stalls"][0]
        self.assertEqual(record["mtime"], 1000)
        self.assertEqual(record["last"], "context compacted")
        self.assertEqual(record["model"], "gpt-6.1-sol")

    def test_real_merge_tree_diff3_separates_import_and_semantic_changes(self):
        path = self.root / "a.ts"
        path.write_text("import { base } from './base';\n")
        git(self.root, "add", "a.ts")
        git(self.root, "commit", "-qm", "imports")
        wt = self.root / ".agents/wt/ENG-a"
        git(self.root, "worktree", "add", "-q", "--detach", str(wt), "HEAD")
        (wt / "a.ts").write_text(path.read_text() + "import { b } from './b';\n")
        git(wt, "add", "a.ts")
        git(wt, "commit", "-qm", "task")
        path.write_text(path.read_text() + "import { a } from './a';\n")
        git(self.root, "add", "a.ts")
        git(self.root, "commit", "-qm", "integrated")
        preview = self.driver.preview("ENG-a")
        self.assertIn("a.ts", preview["conflicts"])
        self.assertTrue(O.mechanical(preview["conflicts"]))
        (wt / "a.ts").write_text("export const limit = 30;\n")
        git(wt, "add", "a.ts")
        git(wt, "commit", "--amend", "-qm", "semantic")
        self.assertFalse(O.mechanical(self.driver.preview("ENG-a")["conflicts"]))

    def test_fix_ancestry_merged_contained_and_pending(self):
        base = git(self.root, "rev-parse", "HEAD")
        state = self.root / ".agents/state.json"
        state.parent.mkdir()
        state.write_text(json.dumps({"ENG-a": {"base": base}}))
        (self.root / "base.txt").write_text("fixed\n")
        git(self.root, "add", "base.txt")
        git(self.root, "commit", "-qm", "fix\n\nAgent-Task: ENG-fix")
        tools = self.root / "tools/agents"
        tools.mkdir(parents=True)
        (tools / "tasks.json").write_text(json.dumps({"tasks": [{"id": "ENG-fix"}, {"id": "ENG-pending"}]}))
        self.driver.config["fixes"] = [{"name": "fix", "patterns": ["HOST"], "task": "ENG-fix"}]
        self.assertEqual(self.driver.fix_context("ENG-a", "HOST")[0]["state"], "merged")
        state.write_text(json.dumps({"ENG-a": {"base": git(self.root, "rev-parse", "HEAD")}}))
        self.assertEqual(self.driver.fix_context("ENG-a", "HOST")[0]["state"], "contained")
        self.driver.config["fixes"][0]["task"] = "ENG-pending"
        (self.root / "base.txt").write_text("similar task\n")
        git(self.root, "add", "base.txt")
        git(self.root, "commit", "-qm", "similar ID\n\nAgent-Task: ENG-pending-extra")
        self.assertEqual(self.driver.fix_context("ENG-a", "HOST")[0]["state"], "pending")
        self.driver.config["fixes"][0]["task"] = "ENG-unknown"
        self.assertEqual(self.driver.fix_context("ENG-a", "HOST")[0]["state"], "unknown")

    def test_dry_launch_prints_existing_script_without_execution(self):
        event = O.Event("ready", "ENG-a", "主检出有未提交的改动")
        with patch.object(O.subprocess, "run") as run, patch.object(self.driver, "note") as note:
            self.driver.launch("test", event, O.classify(event))
        run.assert_not_called()
        self.assertIn("merge_when_clean.py", str(note.call_args))

    def test_low_disk_cannot_launch_and_original_checks_are_required(self):
        self.driver.dry = False
        handoff = self.driver.coord / "_handoff"
        handoff.mkdir(parents=True)
        (handoff / "detach_launch.py").write_text("# never executed\n")
        (handoff / "merge_when_clean.py").write_text("# never executed\n")
        event = O.Event("ready", "ENG-a", "主检出有未提交的改动")
        with patch.object(self.driver, "context", return_value=O.Event("ready", "ENG-a", context={"disk_gib": 2})), patch.object(
                O.subprocess, "run") as run, patch.object(self.driver, "note"):
            with self.assertRaisesRegex(ValueError, "状态变化"):
                self.driver.launch("test", event, O.Action("merge_wait", "window"))
            run.assert_not_called()
        event = O.Event("validate", "ENG-a", context={"args": ["--max-runs", "3"]})
        with self.assertRaisesRegex(ValueError, "--checks"):
            self.driver.launch("test", event, O.Action("revalidate", "fix"))

    def test_mechanical_rebases_outside_session_and_brief_does_not_restart(self):
        self.driver.dry = False
        handoff = self.driver.coord / "_handoff"
        handoff.mkdir(parents=True)
        for name in ("detach_launch.py", "rebase_task.py", "codex_session.py"):
            (handoff / name).write_text("# fixture\n")
        checks = self.root / "checks.md"
        checks.write_text("checks\n")
        context = {"args": ["--checks", "checks.md"], "disk_gib": 9,
                   "head": git(self.root, "rev-parse", "HEAD"),
                   "conflicts": {"a.ts": (FIXTURES / "import.diff3").read_text()}}
        event = O.Event("ready", "ENG-a", "cherry-pick 失败", "READY", context)
        results = [O.subprocess.CompletedProcess([], 0, "带冲突标记 1 个：a.ts\n", ""),
                   O.subprocess.CompletedProcess([], 0, "321\n", "")]
        head_result = O.subprocess.CompletedProcess([], 0, context["head"] + "\n", "")
        with patch.object(self.driver, "context", return_value=event), patch.object(
                O, "git", return_value=head_result), patch.object(O.subprocess, "run", side_effect=results) as run, \
                patch.object(self.driver, "note"):
            self.driver.launch("k", event, O.Action("mechanical", "merge"))
        self.assertIn("rebase_task.py", str(run.call_args_list[0]))
        brief = (self.driver.ops / "briefs/k.md").read_text()
        self.assertIn("不要启动 Codex、supervise", brief)
        self.assertNotIn("detach_launch.py", brief)
        self.assertEqual(self.driver.state["jobs"]["k"]["args"], ["--checks", "checks.md"])

    def test_mechanical_stops_if_head_changed_after_preview(self):
        self.driver.dry = False
        handoff = self.driver.coord / "_handoff"
        handoff.mkdir(parents=True)
        (handoff / "detach_launch.py").write_text("# fixture\n")
        checks = self.root / "checks.md"
        checks.write_text("checks\n")
        event = O.Event("ready", "ENG-a", "cherry-pick 失败", "READY", {
            "args": ["--checks", "checks.md"], "head": "old", "disk_gib": 9,
            "conflicts": {"a.ts": (FIXTURES / "import.diff3").read_text()}})
        changed = O.subprocess.CompletedProcess([], 0, "new\n", "")
        with patch.object(self.driver, "context", return_value=event), patch.object(
                O, "git", return_value=changed), patch.object(O.subprocess, "run") as run:
            with self.assertRaisesRegex(ValueError, "HEAD 已变化"):
                self.driver.launch("k", event, O.Action("mechanical", "merge"))
        run.assert_not_called()

    def test_existing_waiter_is_not_duplicated(self):
        process = O.subprocess.CompletedProcess([], 0,
            "python3 /repo/.agents/coord/_handoff/after_merge_revalidate.py ENG-fix ENG-a -- --max-runs 3\n", "")
        with patch.object(O.subprocess, "run", return_value=process):
            self.assertTrue(self.driver.context(O.Event("validate", "ENG-a")).context["busy"])

    def test_imports_with_same_binding_are_semantic(self):
        imports = (FIXTURES / "import.diff3").read_text()
        self.assertFalse(O.mechanical({"a.ts": imports.replace("{ b }", "{ a }")}))

    def test_export_star_is_unknown_without_reading_both_modules(self):
        conflict = ("<<<<<<< HEAD\nexport * from './a';\n||||||| base\n=======\n"
                    "export * from './b';\n>>>>>>> task\n")
        self.assertFalse(O.mechanical({"index.ts": conflict}))
        event = O.Event("ready", "ENG-a", "cherry-pick 失败", context={
            "conflicts": {"index.ts": conflict}, "args": ["--checks", "x"]})
        self.assertEqual(O.classify(event).kind, "inbox")

    def test_unknown_failure_is_not_hidden_by_known_fix(self):
        self.driver.config["fixes"] = [{"name": "fix", "patterns": ["HOST_DISPOSED"], "task": "ENG-fix"}]
        text = "- 校验命令失败：HOST_DISPOSED\n- 缺少报告 foo.md\n"
        self.assertEqual(self.driver.fix_context("ENG-a", text), [])

    def test_prod_result_uses_marker_even_if_shell_exit_would_be_zero(self):
        self.driver.dry = False
        path = self.driver.coord / "_handoff/prod_check_post-ops-k_1200.log"
        path.parent.mkdir(parents=True)
        path.write_text((FIXTURES / "prod_red.log").read_text())
        job_log = self.root / "job.log"
        job_log.write_text("shell wrapper completed\n")
        self.driver.state["jobs"]["k"] = {"task": "ENG-a", "kind": "prod_check", "pid": 123, "log": str(job_log)}
        with patch.object(O, "alive", return_value=False), patch.object(self.driver, "note") as note:
            self.driver.reap()
        self.assertIn("红", str(note.call_args))
        self.assertIn("HOST_DISPOSED", str(note.call_args))
        self.assertFalse(self.driver.state["jobs"])

    def test_mechanical_session_completion_starts_external_revalidation(self):
        self.driver.dry = False
        wt = self.root / ".agents/wt/ENG-a"
        wt.mkdir(parents=True)
        log = self.root / "job.log"
        log.write_text("codex finished\n")
        line = self.driver.coord / "_lines/ops-k"
        line.mkdir(parents=True)
        (line / "exit").write_text("0\n")
        note = self.driver.coord / "ENG-a/devsup_note_rebase.md"
        note.parent.mkdir(parents=True)
        note.write_text("a.ts：保留两边不同 named import。\n")
        self.driver.state["jobs"]["k"] = {"task": "ENG-a", "kind": "mechanical",
            "pid": 123, "log": str(log), "args": ["--checks", "checks.md"]}
        with patch.object(O, "alive", return_value=False), patch.object(
                self.driver, "start_revalidation", return_value=True) as restart:
            self.driver.reap()
        restart.assert_called_once()
        self.assertNotIn("k", self.driver.state["jobs"])

    def test_dry_reap_completed_merge_wait_only_prints(self):
        log = self.root / "job.log"
        log.write_text("MERGED after 2 tries, 3s\n")
        state_path = self.driver.ops / "state.json"
        state_path.parent.mkdir(parents=True)
        state_path.write_text(json.dumps({"jobs": {"k": {"task": "ENG-fix",
            "kind": "merge_wait", "pid": 123, "log": str(log),
            "requested_head": "old"}}}, indent=2))
        before = state_path.read_bytes()
        driver = O.Dispatcher(self.root, self.driver.config, dry=True)
        with patch.object(O, "alive", return_value=False), patch.object(
                O, "merged_task", return_value="a" * 40), patch.object(
                O.SUPERVISE, "set_status") as set_status, patch.object(
                O.subprocess, "run") as run, patch.object(driver, "note") as note:
            driver.reap()
        set_status.assert_not_called()
        run.assert_not_called()
        self.assertEqual(state_path.read_bytes(), before)
        self.assertIn("k", driver.state["jobs"])
        self.assertIn("将同步 MERGED", str(note.call_args))

    def test_dry_reap_successful_mechanical_only_prints(self):
        (self.root / ".agents/wt/ENG-a").mkdir(parents=True)
        log = self.root / "job.log"
        log.write_text("codex finished\n")
        line = self.driver.coord / "_lines/ops-k"
        line.mkdir(parents=True)
        (line / "exit").write_text("0\n")
        note_path = self.driver.coord / "ENG-a/devsup_note_rebase.md"
        note_path.parent.mkdir(parents=True)
        note_path.write_text("机械并集合并。\n")
        state_path = self.driver.ops / "state.json"
        state_path.parent.mkdir(parents=True, exist_ok=True)
        state_path.write_text(json.dumps({"jobs": {"k": {"task": "ENG-a",
            "kind": "mechanical", "pid": 123, "log": str(log),
            "args": ["--checks", "checks.md"]}}}, indent=2))
        before = state_path.read_bytes()
        driver = O.Dispatcher(self.root, self.driver.config, dry=True)
        clean = O.subprocess.CompletedProcess([], 1, "", "")
        usage = O.shutil._ntuple_diskusage(10 * 2**30, 2**30, 9 * 2**30)
        with patch.object(O, "alive", return_value=False), patch.object(
                O, "git", return_value=clean), patch.object(
                O.shutil, "disk_usage", return_value=usage), patch.object(
                O.subprocess, "run") as run, patch.object(driver, "note") as note:
            driver.reap()
        run.assert_not_called()
        self.assertEqual(state_path.read_bytes(), before)
        self.assertEqual(set(driver.state["jobs"]), {"k"})
        self.assertIn("将做", str(note.call_args))

    def test_low_disk_blocks_post_session_revalidation(self):
        usage = O.shutil._ntuple_diskusage(10 * 2**30, 9 * 2**30, 2**30)
        with patch.object(O.shutil, "disk_usage", return_value=usage), patch.object(
                O.subprocess, "run") as run, patch.object(self.driver, "note") as note:
            self.assertFalse(self.driver.start_revalidation("k", {"task": "ENG-a", "args": []}))
        run.assert_not_called()
        self.assertIn("磁盘", str(note.call_args))

    def test_mechanical_session_without_audit_note_does_not_revalidate(self):
        self.driver.dry = False
        wt = self.root / ".agents/wt/ENG-a"
        wt.mkdir(parents=True)
        log = self.root / "job.log"
        log.write_text("codex finished\n")
        line = self.driver.coord / "_lines/ops-k"
        line.mkdir(parents=True)
        (line / "exit").write_text("0\n")
        self.driver.state["jobs"]["k"] = {"task": "ENG-a", "kind": "mechanical",
            "pid": 123, "log": str(log), "args": []}
        with patch.object(O, "alive", return_value=False), patch.object(
                self.driver, "start_revalidation") as restart, patch.object(self.driver, "note") as note:
            self.driver.reap()
        restart.assert_not_called()
        self.assertIn("缺留痕", str(note.call_args))

    def test_normal_tick_saves_offsets_and_deduplicates_inbox_events(self):
        directory = self.driver.coord / "ENG-a"
        directory.mkdir(parents=True)
        (directory / "supervise.status.json").write_text(json.dumps({"state": "HOLD-REVIEWS", "detail": "FAIL"}))
        self.driver.dry = False
        with patch.object(self.driver, "context", side_effect=lambda e: e), patch("builtins.print"):
            self.driver.tick()
            first = (self.driver.coord / "_inbox/ops.md").read_text()
            restarted = O.Dispatcher(self.root, self.driver.config)
            with patch.object(restarted, "context", side_effect=lambda e: e):
                restarted.tick()
        self.assertEqual((self.driver.coord / "_inbox/ops.md").read_text(), first)
        self.assertTrue((self.driver.ops / "offsets.json").is_file())

    def test_waiter_conflict_goes_back_to_conflict_classification(self):
        self.driver.dry = False
        log = self.root / "job.log"
        log.write_text("CONFLICT: cherry-pick failed\n")
        self.driver.state["jobs"]["k"] = {"task": "ENG-a", "kind": "merge_wait", "pid": 123, "log": str(log)}
        with patch.object(O, "alive", return_value=False), patch.object(self.driver, "note"):
            self.driver.reap()
        event = next(iter(self.driver.state["pending"].values()))
        self.assertEqual(event["kind"], "ready")
        self.assertIn("cherry-pick 失败", event["text"])

    def test_window_merge_sets_merged_and_releases_fix_waiter(self):
        self.driver.dry = False
        start = git(self.root, "rev-parse", "HEAD")
        (self.root / "base.txt").write_text("merged task\n")
        git(self.root, "add", "base.txt")
        git(self.root, "commit", "-qm", "done\n\nAgent-Task: ENG-fix")
        log = self.root / "job.log"
        log.write_text("MERGED after 2 tries, 3s\n")
        self.driver.state["jobs"]["k"] = {"task": "ENG-fix", "kind": "merge_wait",
            "pid": 123, "log": str(log), "requested_head": start}
        with patch.object(O, "alive", return_value=False), patch.object(self.driver, "note"):
            self.driver.reap()
        status = O.read_json(self.driver.coord / "ENG-fix/supervise.status.json")
        self.assertEqual(status["state"], "MERGED")
        self.assertIsNotNone(O.merged_task(self.root, "ENG-fix", start))
        # after_merge_revalidate.py 的依赖门只读这个状态。
        self.assertTrue(all(O.read_json(self.driver.coord / f"{dep}/supervise.status.json").get("state") == "MERGED"
                            for dep in ["ENG-fix"]))

    def test_window_merge_without_new_exact_trailer_does_not_set_merged(self):
        self.driver.dry = False
        start = git(self.root, "rev-parse", "HEAD")
        log = self.root / "job.log"
        log.write_text("MERGED after 1 tries, 0s\n")
        self.driver.state["jobs"]["k"] = {"task": "ENG-fix", "kind": "merge_wait",
            "pid": 123, "log": str(log), "requested_head": start}
        with patch.object(O, "alive", return_value=False), patch.object(self.driver, "note") as note:
            self.driver.reap()
        self.assertFalse((self.driver.coord / "ENG-fix/supervise.status.json").exists())
        self.assertIn("未核实", str(note.call_args))

    def test_merged_task_rejects_similar_or_old_trailer(self):
        start = git(self.root, "rev-parse", "HEAD")
        (self.root / "base.txt").write_text("similar\n")
        git(self.root, "add", "base.txt")
        git(self.root, "commit", "-qm", "similar\n\nAgent-Task: ENG-fix-more")
        self.assertIsNone(O.merged_task(self.root, "ENG-fix", start))
        (self.root / "base.txt").write_text("exact\n")
        git(self.root, "add", "base.txt")
        git(self.root, "commit", "-qm", "exact\n\nAgent-Task: ENG-fix")
        exact = git(self.root, "rev-parse", "HEAD")
        self.assertEqual(O.merged_task(self.root, "ENG-fix", start), exact)
        self.assertIsNone(O.merged_task(self.root, "ENG-fix", exact))

    def test_low_disk_records_alert_but_keeps_merge_pending(self):
        self.driver.enqueue(O.Event("merge", "ENG-a", "sha"), "merge-sha")
        usage = O.shutil._ntuple_diskusage(10 * 2**30, 9 * 2**30, 2**30)
        with patch.object(O.shutil, "disk_usage", return_value=usage), patch.object(self.driver, "note") as note:
            self.driver.tick()
        self.assertIn("merge-sha", self.driver.state["pending"])
        self.assertIn("磁盘", str(note.call_args_list))


if __name__ == "__main__":
    unittest.main()
