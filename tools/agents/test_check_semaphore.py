"""校验信号量、命令行包装及 step finish 接入测试；不启动真实模型。"""
from __future__ import annotations

import argparse
import multiprocessing
import os
import signal
import subprocess
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import patch

from tools.agents import check_semaphore as C
from tools.agents import ops_dispatch as O
from tools.agents import step as S


def hold_slot(root: str, ready, release) -> None:
    with C.check_slot(Path(root), slots=2, poll_seconds=0.01):
        ready.set()
        release.wait()


def mark_slot(root: str, acquired) -> None:
    with C.check_slot(Path(root), slots=2, poll_seconds=0.01):
        acquired.set()


class SemaphoreProcessTest(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory(prefix="tianshu-check-slot-")
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.processes: list[multiprocessing.Process] = []

    def start(self, target, *args) -> multiprocessing.Process:
        process = multiprocessing.Process(target=target, args=args)
        process.start()
        self.processes.append(process)
        return process

    def tearDown(self) -> None:
        for process in self.processes:
            if process.is_alive():
                process.kill()
            process.join(timeout=3)

    def test_third_process_waits_for_one_of_two_slots(self) -> None:
        ready1, ready2 = multiprocessing.Event(), multiprocessing.Event()
        release1, release2 = multiprocessing.Event(), multiprocessing.Event()
        first = self.start(hold_slot, str(self.root), ready1, release1)
        second = self.start(hold_slot, str(self.root), ready2, release2)
        self.assertTrue(ready1.wait(10) and ready2.wait(10))
        acquired = multiprocessing.Event()
        third = self.start(mark_slot, str(self.root), acquired)
        self.assertFalse(acquired.wait(0.35), "两个槽占满时第三个进程不应进入")
        release1.set()
        self.assertTrue(acquired.wait(10), "释放一个槽后第三个进程应进入")
        release2.set()
        for process in (first, second, third):
            process.join(3)
            self.assertEqual(process.exitcode, 0)

    @unittest.skipUnless(hasattr(signal, "SIGKILL"), "需要 POSIX SIGKILL")
    def test_killed_holder_releases_file_lock(self) -> None:
        ready, release = multiprocessing.Event(), multiprocessing.Event()
        first = self.start(hold_slot, str(self.root), ready, release)
        self.assertTrue(ready.wait(10))
        second_ready, second_release = multiprocessing.Event(), multiprocessing.Event()
        second = self.start(hold_slot, str(self.root), second_ready, second_release)
        self.assertTrue(second_ready.wait(10))
        acquired = multiprocessing.Event()
        third = self.start(mark_slot, str(self.root), acquired)
        self.assertFalse(acquired.wait(0.35))
        os.kill(first.pid, signal.SIGKILL)
        first.join(3)
        self.assertEqual(first.exitcode, -signal.SIGKILL)
        self.assertTrue(acquired.wait(10), "持槽进程被杀后内核应释放 flock")
        second_release.set()
        second.join(3)
        third.join(3)


class WrapperAndEnvironmentTest(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory(prefix="tianshu-check-cli-")
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)

    def test_wrapper_passes_through_exit_code(self) -> None:
        script = Path(C.__file__).resolve()
        result = subprocess.run(
            [sys.executable, str(script), "--root", str(self.root), "--",
             sys.executable, "-c", "raise SystemExit(23)"],
            cwd=self.root, capture_output=True, text=True, timeout=5,
        )
        self.assertEqual(result.returncode, 23)

    def test_wrapper_passes_managed_worker_environment(self) -> None:
        script = Path(C.__file__).resolve()
        code = ("import os; raise SystemExit(os.environ.get("
                f"'{C.VITEST_WORKERS_ENV}') != '{C.vitest_max_workers()}')")
        result = subprocess.run(
            [sys.executable, str(script), "--root", str(self.root), "--",
             sys.executable, "-c", code], cwd=self.root, timeout=5,
        )
        self.assertEqual(result.returncode, 0)

    def test_managed_workers_are_half_cpus_and_environment_is_copied(self) -> None:
        original = {"KEEP": "yes"}
        env = C.check_environment(original, cpu_count=12)
        self.assertEqual(env, {"KEEP": "yes", C.VITEST_WORKERS_ENV: "6"})
        self.assertEqual(original, {"KEEP": "yes"})
        self.assertEqual(C.vitest_max_workers(1), 1)
        self.assertEqual(C.slot_count({}), 2)
        self.assertEqual(C.slot_count({C.SLOTS_ENV: "4"}), 4)

    def test_dispatcher_wraps_prod_check_with_same_semaphore(self) -> None:
        driver = O.Dispatcher(self.root, {}, dry=True)
        event = O.Event("merge", "ENG-a", "sha")
        with patch.object(driver, "note") as note:
            driver.launch("key", event, O.Action("prod_check", "new merge"))
        command = str(note.call_args)
        self.assertIn("check_semaphore.py", command)
        self.assertIn("prod_check.sh", command)
        self.assertLess(command.index("check_semaphore.py"), command.index("prod_check.sh"))


class StepFinishIntegrationTest(unittest.TestCase):
    def test_finish_holds_slot_while_validate_runs(self) -> None:
        root = Path("/repo")
        wt = root / ".agents/wt/TOOL-test"
        task = types.SimpleNamespace(id="TOOL-test", all_writes=["out.txt"], validate={})
        state = types.SimpleNamespace(update=lambda *args, **kwargs: None)
        entered = {"slot": False}

        class Slot:
            def __enter__(self):
                entered["slot"] = True

            def __exit__(self, *exc):
                entered["slot"] = False

        def validate(*args):
            self.assertTrue(entered["slot"], "run.validate 必须在校验槽内执行")
            return []

        args = argparse.Namespace(id=task.id, no_commit=True)
        with patch.object(S, "load", return_value=(root, types.SimpleNamespace(defaults={}), task, state)), \
                patch.object(S, "is_running", return_value=False), \
                patch.object(S, "recover_state", return_value={"base": "base"}), \
                patch.object(S.R, "wt_exists", return_value=True), \
                patch.object(S.R, "head_has_trailer", return_value=False), \
                patch.object(S, "current", return_value=None), \
                patch.object(S.R, "baseline_lines", return_value={}), \
                patch.object(S.R, "validate", side_effect=validate), \
                patch.object(S.R, "changed_files", return_value=["out.txt"]), \
                patch.object(S, "check_slot", return_value=Slot()) as slot:
            self.assertEqual(S.cmd_finish(args), 0)
        slot.assert_called_once_with(root)
        self.assertFalse(entered["slot"])

    def test_run_validate_passes_managed_environment_to_commands(self) -> None:
        with tempfile.TemporaryDirectory(prefix="tianshu-validate-env-") as tmp:
            root = Path(tmp)
            task = S.R.Task({"id": "TOOL-env", "title": "env", "writes": [],
                             "validate": {"cmd": [["checker"]]}})
            report = root / task.report_path
            report.parent.mkdir(parents=True)
            report.write_text("one\ntwo\nthree\nfour\nfive\n", encoding="utf-8")
            completed = subprocess.CompletedProcess(["checker"], 0, "", "")
            cfg = types.SimpleNamespace(shrink_guard=0.85)
            with patch.object(S.R.subprocess, "run", return_value=completed) as run:
                self.assertEqual(S.R.validate(task, root, {}, cfg), [])
            self.assertEqual(run.call_args.kwargs["env"][C.VITEST_WORKERS_ENV],
                             str(C.vitest_max_workers()))


if __name__ == "__main__":
    unittest.main()
