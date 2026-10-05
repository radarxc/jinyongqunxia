"""仅创建数个文本文件的临时 git 仓库；不检出项目、不起 codex / traex。"""
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from tools.agents import supervise as V


def git(root, *args):
    return subprocess.run(["git", *args], cwd=root, capture_output=True, text=True, check=True).stdout.strip()


class RebaseTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="tianshu-rebase-test-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        git(self.root, "init", "-q")
        git(self.root, "config", "user.name", "test")
        git(self.root, "config", "user.email", "test@local")
        (self.root / "a.txt").write_text("base\n")
        (self.root / "fix.txt").write_text("before\n")
        git(self.root, "add", "a.txt", "fix.txt")
        git(self.root, "commit", "-qm", "base")
        self.base = git(self.root, "rev-parse", "HEAD")
        self.tid = "ENG-test"
        self.wt = self.root / ".agents/wt" / self.tid
        git(self.root, "worktree", "add", "-q", "--detach", str(self.wt), self.base)
        state = self.root / ".agents/state.json"
        state.write_text(json.dumps({self.tid: {"base": self.base}}))
        script = self.root / ".agents/coord/_handoff/rebase_task.py"
        script.parent.mkdir(parents=True)
        script.write_text("# fixture: never executed\n")
        (self.wt / "a.txt").write_text("task\n")
        for target, value in (("ROOT", self.root),):
            mock = patch.object(V, target, value)
            mock.start()
            self.addCleanup(mock.stop)
        self.running = patch.object(V.S, "is_running", return_value=False).start()
        self.addCleanup(patch.stopall)
        self.log = patch.object(V, "log").start()
        self.real_sh = V.sh
        self.sh = patch.object(V, "sh", side_effect=self.call).start()
        self.rebases = []
        self.rebase_rc = 0

    def call(self, argv, timeout=None):
        if "rebase_task.py" in " ".join(argv):
            self.rebases.append(argv)
            return self.rebase_rc, "带冲突标记 0 个：无" if not self.rebase_rc else "failed"
        return self.real_sh(argv, timeout)

    def advance(self, conflict=False):
        (self.root / ("a.txt" if conflict else "fix.txt")).write_text("integration\n")
        git(self.root, "add", "a.txt", "fix.txt")
        git(self.root, "commit", "-qm", "integration fix")
        return git(self.root, "rev-parse", "HEAD")

    def test_dirty_snapshot_is_previewed_without_touching_index_or_refs(self):
        head = self.advance()
        index = Path(git(self.wt, "rev-parse", "--git-path", "index"))
        before = index.read_bytes()
        refs = git(self.wt, "show-ref")
        self.assertTrue(V.rebase_before_rework(self.tid))
        self.assertEqual(index.read_bytes(), before)
        self.assertEqual(git(self.wt, "show-ref"), refs)
        self.assertEqual(git(self.wt, "rev-parse", "HEAD"), self.base)
        self.assertEqual(self.rebases[0][-2:], ["--new-base", head])

    def test_uncommitted_conflict_is_not_missed(self):
        self.advance(conflict=True)
        self.assertFalse(V.rebase_before_rework(self.tid))
        self.assertFalse(self.rebases)
        self.assertIn("a.txt", " ".join(str(c) for c in self.log.call_args_list))
        self.assertEqual((self.wt / "a.txt").read_text(), "task\n")

    def test_finished_single_commit_can_be_previewed(self):
        git(self.wt, "add", "a.txt")
        git(self.wt, "commit", "-qm", "finished")
        self.advance()
        self.assertTrue(V.rebase_before_rework(self.tid))

    def test_current_base_does_not_rebase(self):
        self.assertFalse(V.rebase_before_rework(self.tid))
        self.assertFalse(self.rebases)

    def test_running_executor_does_not_rebase(self):
        self.advance()
        self.running.return_value = True
        self.assertFalse(V.rebase_before_rework(self.tid))
        self.sh.assert_not_called()

    def test_commit_plus_dirty_change_is_not_supported_by_handoff(self):
        git(self.wt, "add", "a.txt")
        git(self.wt, "commit", "-qm", "finished")
        (self.wt / "a.txt").write_text("further edit\n")
        self.advance()
        self.assertFalse(V.rebase_before_rework(self.tid))

    def test_sparse_snapshot_does_not_delete_absent_files(self):
        git(self.wt, "sparse-checkout", "set", "--no-cone", "/*", "!/fix.txt")
        self.advance()
        self.assertTrue(V.rebase_before_rework(self.tid))
        self.assertFalse((self.wt / "fix.txt").exists())

    def test_failed_rebase_does_not_revalidate(self):
        self.advance()
        self.rebase_rc = 1
        with patch.object(V, "step", return_value=(1, "failure")) as step:
            self.assertEqual(V.validate_with_rebase(self.tid), (1, "failure"))
            self.assertEqual(step.call_count, 1)

    def test_recheck_only_once_even_if_it_fails(self):
        with patch.object(V, "step", side_effect=[(1, "old"), (1, "new")]) as step, patch.object(
                V, "rebase_before_rework", return_value=True) as rebase:
            self.assertEqual(V.validate_with_rebase(self.tid), (1, "new"))
            rebase.assert_called_once_with(self.tid)
            self.assertEqual(step.call_args_list[0], step.call_args_list[1])

    def test_pass_and_flow_error_do_not_rebase(self):
        for rc in (0, 2, 124):
            with self.subTest(rc=rc), patch.object(V, "step", return_value=(rc, "result")), patch.object(
                    V, "rebase_before_rework") as rebase:
                self.assertEqual(V.validate_with_rebase(self.tid), (rc, "result"))
                rebase.assert_not_called()

    def test_executor_started_during_preview_prevents_rebase(self):
        self.advance()
        self.running.side_effect = [False, True]
        self.assertFalse(V.rebase_before_rework(self.tid))
        self.assertFalse(self.rebases)

    def test_successful_recheck_returns_pass_without_rework(self):
        with patch.object(V, "step", side_effect=[(1, "old"), (0, "pass")]) as step, patch.object(
                V, "rebase_before_rework", return_value=True) as rebase:
            self.assertEqual(V.validate_with_rebase(self.tid), (0, "pass"))
            self.assertEqual(step.call_count, 2)
            rebase.assert_called_once()


if __name__ == "__main__":
    unittest.main()
