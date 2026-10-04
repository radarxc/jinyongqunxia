"""supervise 单任务驱动锁测试；只起本文件的替身 worker，不起 Codex / Traex。"""
import json
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DRIVER = r"""
import os
import sys
import time
from pathlib import Path
from tools.agents import supervise as V

root, tid, marker, release, action = sys.argv[1:]
V.ROOT = Path(root)

def fake_worker(args):
    Path(marker).write_text(str(os.getpid()), encoding="utf-8")
    if action == "hold":
        deadline = time.monotonic() + 30
        while not Path(release).exists():
            if time.monotonic() >= deadline:
                return 9
            time.sleep(0.02)
    return 0

V._worker = fake_worker
sys.argv = [str(V.__file__), tid, "--worker"]
raise SystemExit(V.main())
"""
READ_ONLY = r"""
import sys
from pathlib import Path
from tools.agents import supervise as V

root, tid, flag = sys.argv[1:]
V.ROOT = Path(root)
sys.argv = [str(V.__file__), tid, flag]
raise SystemExit(V.main())
"""


class SingletonTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="tianshu-supervise-lock-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.tid = "TOOL-lock-test"
        self.coord = self.root / ".agents" / "coord" / self.tid
        self.coord.mkdir(parents=True)
        self.status = self.coord / "supervise.status.json"
        self.status.write_text(json.dumps({
            "state": "READY", "runs": 1, "reviews": 0, "detail": "fixture"
        }), encoding="utf-8")
        self.release = self.root / "release"

    def command(self, marker, action):
        return [sys.executable, "-c", DRIVER, str(self.root), self.tid, str(marker),
                str(self.release), action]

    def stop(self, process):
        if process.poll() is None:
            process.terminate()
        try:
            process.wait(timeout=3)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=3)

    def holder(self):
        marker = self.root / "holder.pid"
        process = subprocess.Popen(self.command(marker, "hold"), cwd=ROOT, text=True,
                                   stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        self.addCleanup(self.stop, process)
        deadline = time.monotonic() + 5
        while not marker.exists() and process.poll() is None and time.monotonic() < deadline:
            time.sleep(0.01)
        if not marker.exists():
            self.stop(process)
            stdout, stderr = process.communicate()
            self.fail(f"holder did not start: stdout={stdout!r} stderr={stderr!r}")
        self.assertIsNone(process.poll())
        return process, int(marker.read_text(encoding="utf-8"))

    def finish(self, process):
        self.release.touch()
        stdout, stderr = process.communicate(timeout=5)
        self.assertEqual(process.returncode, 0, (stdout, stderr))

    def run_driver(self, name):
        marker = self.root / name
        result = subprocess.run(self.command(marker, "quick"), cwd=ROOT, text=True,
                                capture_output=True, timeout=5)
        return result, marker

    def test_competing_worker_exits_three_logs_owner_and_preserves_status(self):
        before = self.status.read_bytes()
        first, pid = self.holder()
        lock = (self.coord / "supervise.lock").read_text(encoding="utf-8")
        self.assertRegex(lock, rf"^pid={pid}\nstarted=\d{{4}}-\d{{2}}-\d{{2}} \d{{2}}:\d{{2}}:\d{{2}}\n$")
        second, marker = self.run_driver("contender.pid")
        message = f"已有驱动 pid={pid}，本次退出"
        self.assertEqual(second.returncode, 3, (second.stdout, second.stderr))
        self.assertIn(message, second.stdout)
        self.assertFalse(marker.exists())
        lines = (self.coord / "supervise.log").read_text(encoding="utf-8").splitlines()
        self.assertEqual(sum(message in line for line in lines), 1)
        self.assertEqual(self.status.read_bytes(), before)
        self.finish(first)

    def test_lock_is_available_after_first_worker_exits(self):
        first, _ = self.holder()
        self.finish(first)
        restarted, marker = self.run_driver("restarted.pid")
        self.assertEqual(restarted.returncode, 0, (restarted.stdout, restarted.stderr))
        self.assertTrue(marker.exists())
        owner = marker.read_text(encoding="utf-8")
        self.assertIn(f"pid={owner}\n", (self.coord / "supervise.lock").read_text(encoding="utf-8"))

    def test_status_and_attach_do_not_compete_for_driver_lock(self):
        first, _ = self.holder()
        before = (self.coord / "supervise.lock").read_bytes()
        for flag in ("--status", "--attach"):
            with self.subTest(flag=flag):
                result = subprocess.run([sys.executable, "-c", READ_ONLY, str(self.root), self.tid, flag],
                                        cwd=ROOT, text=True, capture_output=True, timeout=5)
                self.assertEqual(result.returncode, 0, (result.stdout, result.stderr))
                self.assertIn(f"SUPERVISE {self.tid} → READY", result.stdout)
                self.assertIsNone(first.poll())
                self.assertEqual((self.coord / "supervise.lock").read_bytes(), before)
        self.assertFalse((self.coord / "supervise.log").exists())
        self.finish(first)


if __name__ == "__main__":
    unittest.main()
