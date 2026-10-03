"""run.py 防截断 / 删除检查与稀疏检出（skip-worktree）的单测（2026-10-03，素材线第三波）。

稀疏检出没拉下来的文件不在磁盘上，不是任务删的：baseline_lines 不把它们放进基线，
validate 就不会误报「文件被删除」；真正被任务删掉的已检出文件照旧报。全量检出时行为不变。
"""
import subprocess
import sys
import tempfile
import types
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import run as R  # noqa: E402


def sh(cwd: Path, *args: str) -> None:
    subprocess.run(["git", *args], cwd=cwd, check=True, capture_output=True, text=True)


class SparseBaselineTest(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.repo = Path(self.tmp.name)
        sh(self.repo, "init", "-q")
        sh(self.repo, "config", "user.email", "t@example.com")
        sh(self.repo, "config", "user.name", "t")
        (self.repo / "a").mkdir()
        (self.repo / "a/kept.md").write_text("one\ntwo\nthree\n", encoding="utf-8")
        (self.repo / "a/old.png").write_bytes(b"\x89PNG\r\n\x1a\n\x00\x00fake")
        (self.repo / "a/sub").mkdir()
        (self.repo / "a/sub/deep.png").write_bytes(b"\x89PNG\x00deep")
        (self.repo / "b.md").write_text("b\n", encoding="utf-8")
        sh(self.repo, "add", "-A")
        sh(self.repo, "commit", "-qm", "init")
        self.task = R.Task({"id": "ART-sparse-test", "title": "t", "writes": ["a/**"], "validate": {}})
        self.cfg = types.SimpleNamespace(shrink_guard=0.85)

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def sparse(self) -> None:
        sh(self.repo, "sparse-checkout", "set", "--no-cone", "/*", "!/a/old.png", "!/a/sub/")

    def deletions(self, baseline: dict) -> list:
        return [p for p in R.validate(self.task, self.repo, baseline, self.cfg) if "文件被删除" in p]

    def test_skip_worktree_paths_lists_only_sparse_excluded_files(self) -> None:
        self.assertEqual(R.skip_worktree_paths(self.repo), set())
        self.sparse()
        self.assertEqual(R.skip_worktree_paths(self.repo), {"a/old.png", "a/sub/deep.png"})

    def test_full_checkout_baseline_unchanged(self) -> None:
        self.assertEqual(R.baseline_lines(self.repo, self.task, "HEAD"),
                         {"a/kept.md": 3, "a/old.png": -1, "a/sub/deep.png": -1})

    def test_sparse_excluded_files_are_not_reported_deleted(self) -> None:
        self.sparse()
        baseline = R.baseline_lines(self.repo, self.task, "HEAD")
        self.assertEqual(baseline, {"a/kept.md": 3})
        self.assertFalse((self.repo / "a/old.png").exists())
        self.assertEqual(self.deletions(baseline), [])

    def test_real_deletion_of_checked_out_file_still_reported(self) -> None:
        self.sparse()
        baseline = R.baseline_lines(self.repo, self.task, "HEAD")
        (self.repo / "a/kept.md").unlink()
        self.assertEqual(self.deletions(baseline), ["a/kept.md：文件被删除"])


if __name__ == "__main__":
    unittest.main()
