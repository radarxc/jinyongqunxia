"""step.py 池位优先级（pool_priority.txt）的单测（2026-10-03，开发监督）。

没有名单文件时行为与原来一样：有空位就拿。有名单时，空位只给「名单里排最前、且确实在等」的任务；
名单外的排在名单之后、按开始等的时间先来先得；登记的进程已死就当作没在等。
"""
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import step as S  # noqa: E402


class ParsePriorityTest(unittest.TestCase):
    def test_comments_blanks_duplicates(self) -> None:
        text = "# 代码池\nENG-a\n\n  ENG-b  # 注释\nENG-a\n#ENG-c\n"
        self.assertEqual(S.parse_priority(text), ["ENG-a", "ENG-b"])


class SlotOrderTest(unittest.TestCase):
    def test_listed_first_in_list_order(self) -> None:
        waiting = {"ENG-x": 1.0, "ENG-b": 5.0, "ENG-a": 9.0}
        self.assertEqual(S.slot_order(waiting, ["ENG-a", "ENG-b"]), ["ENG-a", "ENG-b", "ENG-x"])

    def test_unlisted_fifo_then_id(self) -> None:
        waiting = {"ENG-z": 3.0, "ENG-y": 2.0, "ENG-w": 2.0}
        self.assertEqual(S.slot_order(waiting, ["ENG-a"]), ["ENG-w", "ENG-y", "ENG-z"])


class MayTakeSlotTest(unittest.TestCase):
    def test_no_priority_file_keeps_old_behaviour(self) -> None:
        self.assertTrue(S.may_take_slot("ENG-x", 1, {"ENG-a": 0.0}, None, 9.0))
        self.assertFalse(S.may_take_slot("ENG-x", 0, {}, None, 9.0))

    def test_defers_to_higher_priority_waiter(self) -> None:
        waiting = {"ENG-a": 5.0, "ENG-b": 1.0}
        self.assertTrue(S.may_take_slot("ENG-a", 1, waiting, ["ENG-a", "ENG-b"], 5.0))
        self.assertFalse(S.may_take_slot("ENG-b", 1, waiting, ["ENG-a", "ENG-b"], 1.0))
        self.assertTrue(S.may_take_slot("ENG-b", 2, waiting, ["ENG-a", "ENG-b"], 1.0))

    def test_unlisted_waits_for_listed_but_not_for_absent(self) -> None:
        self.assertFalse(S.may_take_slot("ENG-x", 1, {"ENG-a": 9.0, "ENG-x": 1.0}, ["ENG-a"], 1.0))
        self.assertTrue(S.may_take_slot("ENG-x", 1, {"ENG-x": 1.0}, ["ENG-a"], 1.0))

    def test_me_missing_from_registry_uses_own_since(self) -> None:
        self.assertTrue(S.may_take_slot("ENG-x", 1, {"ENG-y": 5.0}, [], 1.0))
        self.assertFalse(S.may_take_slot("ENG-x", 1, {"ENG-y": 5.0}, [], 7.0))


class LiveWaitersTest(unittest.TestCase):
    def test_dead_and_other_pool_entries(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            d = root / S.WAITING_DIR
            d.mkdir(parents=True)
            dead = subprocess.Popen([sys.executable, "-c", "pass"])
            dead.wait()
            (d / "ENG-live.json").write_text(json.dumps({"pid": os.getpid(), "since": 2.0}), encoding="utf-8")
            (d / "ENG-dead.json").write_text(json.dumps({"pid": dead.pid, "since": 1.0}), encoding="utf-8")
            (d / "ENG-zero.json").write_text(json.dumps({"pid": 0, "since": 1.0}), encoding="utf-8")
            (d / "DES-other.json").write_text(json.dumps({"pid": os.getpid(), "since": 1.0}), encoding="utf-8")
            self.assertEqual(S.live_waiters(root, "code"), {"ENG-live": 2.0})
            self.assertFalse((d / "ENG-dead.json").exists())
            self.assertTrue((d / "DES-other.json").exists())

    def test_register_and_unregister_own_entry_only(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            S.register_waiting(root, "ENG-me", "code", 3.0)
            self.assertEqual(S.live_waiters(root, "code"), {"ENG-me": 3.0})
            other = root / S.WAITING_DIR / "ENG-other.json"
            other.write_text(json.dumps({"pid": os.getpid() + 1, "since": 1.0}), encoding="utf-8")
            S.unregister_waiting(root, "ENG-other")
            self.assertTrue(other.exists())
            S.unregister_waiting(root, "ENG-me")
            self.assertFalse((root / S.WAITING_DIR / "ENG-me.json").exists())

    def test_missing_priority_file_is_none(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            self.assertIsNone(S.read_priority(Path(tmp)))
            f = Path(tmp) / S.PRIORITY_FILE
            f.parent.mkdir(parents=True)
            f.write_text("ENG-a\n", encoding="utf-8")
            self.assertEqual(S.read_priority(Path(tmp)), ["ENG-a"])


if __name__ == "__main__":
    unittest.main()


class SlotPoolOverrideTest(unittest.TestCase):
    """defaults.slot_pool_overrides 只改占位池，不改检出用的 pool_of（AR-85：素材线不占 M1 池位）。"""

    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.orig = S.R.TASKS_FILE
        self.addCleanup(setattr, S.R, "TASKS_FILE", self.orig)
        S.R.TASKS_FILE = Path(self.tmp.name) / "tasks.json"
        S._SLOT_OVR = (None, [])

    def write(self, rules) -> None:
        S.R.TASKS_FILE.write_text(json.dumps({"defaults": {"slot_pool_overrides": rules}}), encoding="utf-8")
        os.utime(S.R.TASKS_FILE, (os.path.getmtime(S.R.TASKS_FILE) + 1,) * 2)

    def test_override_moves_only_slot_pool(self) -> None:
        self.write([["^TOOL-(map|rig|ingest|assets)-", "assets"]])
        self.assertEqual(S.slot_pool_of("TOOL-map-terrain"), "assets")
        self.assertEqual(S.pool_of("TOOL-map-terrain"), "code")
        self.assertEqual(S.slot_pool_of("TOOL-ops-dispatch"), "code")
        self.assertEqual(S.slot_pool_of("ENG-19e-m1-order"), "code")

    def test_no_rules_or_bad_file_falls_back(self) -> None:
        self.write([])
        self.assertEqual(S.slot_pool_of("TOOL-map-terrain"), "code")
        S.R.TASKS_FILE.write_text("{not json", encoding="utf-8")
        os.utime(S.R.TASKS_FILE, (os.path.getmtime(S.R.TASKS_FILE) + 2,) * 2)
        self.assertEqual(S.slot_pool_of("TOOL-map-terrain"), "code")

    def test_first_matching_rule_wins(self) -> None:
        self.write([["^TOOL-map-", "assets"], ["^TOOL-", "docs"]])
        self.assertEqual(S.slot_pool_of("TOOL-map-compose"), "assets")
        self.assertEqual(S.slot_pool_of("TOOL-city-generic"), "docs")
