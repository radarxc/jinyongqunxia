#!/usr/bin/env python3
"""OPS_RUNBOOK §2 的保守执行层。默认当前仓库，--dry-run 不写文件、不启动进程。

配置：.agents/coord/_ops/config.json；缺省采用 fixtures/ops/config.json。
supervise_args 按任务保存原驱动参数，缺参数只报收件箱，不猜审核口径。
"""
from __future__ import annotations

import argparse
import datetime as dt
import difflib
import fcntl
import hashlib
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
try:
    from . import supervise as SUPERVISE
except ImportError:  # 直接执行 tools/agents/ops_dispatch.py
    import supervise as SUPERVISE

ROOT = Path(__file__).resolve().parents[2]
FIXTURES = Path(__file__).resolve().parent / "fixtures/ops"
LIMIT = 256 * 1024
PROTECTED = ("ART", "TOWN", "VFX", "CITY", "SKILL", "KIT", "GEMINI", "TRIPO")
ANSI = re.compile(r"\x1b\[[0-9;]*[a-zA-Z]")
BLOCK = re.compile(r"^<<<<<<< [^\n]*\n(.*?)^\|\|\|\|\|\|\| [^\n]*\n(.*?)^=======\n(.*?)^>>>>>>> [^\n]*\n?", re.M | re.S)


@dataclass(frozen=True)
class Event:
    kind: str
    task: str = ""
    text: str = ""
    state: str = ""
    context: dict = field(default_factory=dict)


@dataclass(frozen=True)
class Action:
    kind: str
    reason: str


def protected(task: str, model: str = "") -> bool:
    return task.upper().startswith(PROTECTED) or bool(re.search("gemini|tripo", model, re.I))


def bindings(line: str) -> set[str]:
    """提取单行 import / named export 的本地绑定；不推测 export * 的模块内容。"""
    match = re.match(r"(?:import|export) (?:type )?(.+?) from ['\"]", line)
    if match:
        clause = match[1]
        if clause == "*":
            return set()
        return {part.strip().removeprefix("type ").split(" as ")[-1].strip()
                for part in clause.replace("{", "").replace("}", "").split(",") if part.strip()}
    match = re.match(r"from [\w.]+ import (.*)|import ([\w., ]+)$", line)
    if match:
        return {part.strip().split(" as ")[-1].split(".")[0] for part in (match[1] or match[2]).split(",")}
    return set()


def mechanical(conflicts: dict[str, str]) -> bool:
    """只接受有共同基线且两边纯追加的完整冲突块；重命名需人工对照，默认不猜。"""
    if not conflicts:
        return False
    for path, content in conflicts.items():
        blocks = list(BLOCK.finditer(content))
        if not blocks or any(marker in BLOCK.sub("", content) for marker in ("<<<<<<<", ">>>>>>>")):
            return False
        outer = BLOCK.sub("", content).splitlines()
        used = set().union(*(bindings(line.strip()) for line in outer))
        used_keys = {line.split("|")[1].strip() for line in outer if re.fullmatch(r"\|[^\n]+\|", line)}
        for match in blocks:
            ours, base, theirs = ([line.strip() for line in group.splitlines() if line.strip()]
                                  for group in match.groups())
            additions = []
            for side in (ours, theirs):
                inserted = []
                for tag, _, _, start, end in difflib.SequenceMatcher(a=base, b=side, autojunk=False).get_opcodes():
                    if tag not in ("equal", "insert"):
                        return False
                    if tag == "insert":
                        inserted.extend(side[start:end])
                additions.append(inserted)
            added = additions[0] + additions[1]
            if not all(additions):
                return False
            if path.endswith(".md"):
                # 登记表各加不同 ID，已有同 ID 不按并集处置。
                if not all(re.fullmatch(r"\|[^\n]+\|", line) for line in added):
                    return False
                keys = [line.split("|")[1].strip() for line in added]
                base_keys = {line.split("|")[1].strip() for line in base if line.startswith("|")}
                if len(keys) != len(set(keys)) or set(keys) & (base_keys | used_keys):
                    return False
                used_keys.update(keys)
            elif path.endswith((".ts", ".tsx", ".js", ".mjs", ".py")):
                pattern = (r"(?:import [^;]+ from ['\"][^'\"]+['\"];?|"
                           r"import ['\"][^'\"]+['\"];?|export (?:\*|\{[^}]+\}) from ['\"][^'\"]+['\"];?|"
                           r"from [\w.]+ import [\w, ]+|import [\w., ]+)")
                if not all(re.fullmatch(pattern, line) for line in added):
                    return False
                # export * 的真实绑定需读取并解析两个模块；仅凭冲突块无法排除同名导出。
                if any(re.fullmatch(r"export \* from ['\"][^'\"]+['\"];?", line)
                       for line in added):
                    return False
                # 同模块 / 绑定不同写法可能语义冲突，留给协调者。
                names = [re.findall(r"['\"]([^'\"]+)['\"]", line) or [line] for line in added]
                if len({tuple(n) for n in names}) != len(names):
                    return False
                used.update(set().union(*(bindings(line) for line in base)))
                for line in added:
                    declared = bindings(line)
                    if used & declared:
                        return False
                    used.update(declared)
            else:
                return False
    return True


def known_fixes(text: str, rules: list[dict]) -> list[dict]:
    return [rule for rule in rules if all(re.search(p, text, re.I | re.S) for p in rule["patterns"])]


def stall_groups(records: list[dict], window: float = 300) -> list[list[dict]]:
    """按执行器日志 mtime 聚集，不按 STALLED 告警到达时间分桶。"""
    groups = []
    for record in sorted(records, key=lambda r: r["mtime"]):
        if not groups or record["mtime"] - groups[-1][0]["mtime"] > window:
            groups.append([])
        groups[-1].append(record)
    return [group for group in groups if len({r["task"] for r in group}) > 1]


def parse_prod(text: str, previous: dict | None = None) -> dict:
    text = ANSI.sub("", text)
    numbers = {}
    for label, name in (("entry", "entry"), ("render", "render"), ("webgl total", "webgl"),
                        ("session total", "session")):
        rows = re.findall(rf"^{label}\s+(\d+(?:\.\d+)?)\s+", text, re.M)
        numbers[name] = float(rows[-1]) if rows else None
    rc = re.findall(r"PNPM_CHECK_RC=(\d+)", text)
    heads = re.findall(r"^HEAD\s+(\S+)", text, re.M)
    summary = [line for line in text.splitlines() if re.search(
        r"FAIL|✗|MISSING_EXPORT|error TS|Error:|timed out|HOST_DISPOSED|ELIFECYCLE", line)]
    return {"head": heads[-1] if heads else "未知", "rc": int(rc[-1]) if rc else None,
            "numbers": numbers, "delta": {k: round(v - previous[k], 2)
                if v is not None and previous and previous.get(k) is not None else None
                for k, v in numbers.items()}, "summary": " / ".join(summary[-6:])[:1200]}


def classify(event: Event) -> Action:
    c = event.context
    if protected(event.task, c.get("model", "")):
        return Action("skip", "出图线 / Gemini / Tripo 不处置")
    if c.get("disk_gib", 99) < 2.5:
        return Action("inbox", "【请判断】磁盘可用 < 2.5 GiB；默认只记录，不启动处置；" + event.text[-1200:])
    if event.kind == "stall":
        stamp = dt.datetime.fromtimestamp(c["mtime"]).strftime("%Y-%m-%d %H:%M:%S") if c.get("mtime") else "未知"
        return Action("inbox", f"停滞：最后写日志 {stamp}；模型 {c.get('model')}；末行 {event.text}")
    if event.kind == "cluster":
        return Action("inbox", "【请判断】是否降池上限一档；默认保留现上限，等待协调者裁定；" + event.text)
    if event.kind == "merge":
        return Action("defer", "等 1 分钟负载均值 < 25 / 上轮检查结束") if (
            c.get("load", 99) >= 25 or c.get("busy")) else Action("prod_check", "新合入，运行 prod_check")
    if c.get("probe_error"):
        return Action("inbox", "【请判断】无法探测现有进程，不能确认无执行器 / 等待器；默认不启动处置")
    if c.get("already_merged"):
        return Action("skip", "任务尾注已在集成 HEAD 中，撤销过时处置")
    if c.get("running") or c.get("driver") or c.get("busy"):
        return Action("defer", "执行器、驱动或已有处置在跑，等待，不停进程")
    if event.kind == "ready":
        # 用最后一次 merge 失败证据；历史窗口期不能掩盖最新真冲突。
        failures = re.findall(r"^.*(?:主检出有未提交的改动|cherry-pick 失败|could not apply).*$", event.text, re.M)
        last = failures[-1] if failures else ""
        if "主检出有未提交的改动" in last:
            return Action("merge_wait", "出图入库窗口期，等干净再合入")
        if c.get("preview_clean"):
            return Action("merge_wait", "冲突已消失，预演干净，等合入窗口")
        if "cherry-pick 失败" in last or "could not apply" in last:
            if mechanical(c.get("conflicts", {})) and c.get("args"):
                return Action("mechanical", "纯追加冲突，交 Codex gpt-6.1-sol 按 §2.1 合并")
            return Action("inbox", "【请判断】语义 / 未知冲突或缺原驱动参数；默认保留 READY；" + c.get("files", ""))
        return Action("inbox", "【请判断】auto-merge 未成功但缺可靠原因；默认保留 READY")
    if event.kind == "validate":
        fixes = c.get("fixes", [])
        if fixes and c.get("args"):
            if any(f["state"] == "unknown" for f in fixes):
                return Action("inbox", "【请判断】修复引用或依赖未登记；默认保持 HOLD-VALIDATE")
            if any(f["state"] == "pending" for f in fixes):
                return Action("wait_fix", "修复未合入，保持 HOLD-VALIDATE，挂 after_merge_revalidate")
            if any(f["state"] == "merged" for f in fixes):
                return Action("revalidate", "已合入修复未在基点中，交 supervise 返修前挪基点重校验")
        return Action("inbox", f"【请判断】校验失败需裁定；当前 1 分钟负载={c.get('load', '未知')}；"
                      "失败值 / 阈值见下列日志，失败时负载未知；默认保持 HOLD，不改门禁；" + event.text[-1600:])
    return Action("inbox", "【请判断】" + event.kind + "；默认保留当前状态；" + event.text[-1200:])


def read_json(path: Path, default=None):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {} if default is None else default


def tail(path: Path, limit: int = LIMIT) -> str:
    try:
        with path.open("rb") as stream:
            stream.seek(max(0, path.stat().st_size - limit))
            return stream.read(limit).decode("utf-8", "replace")
    except OSError:
        return ""


def header(path: Path) -> str:
    try:
        with path.open("rb") as stream:
            return stream.read(4096).decode("utf-8", "replace")
    except OSError:
        return ""


def alive(pid) -> bool:
    if not pid:
        return False
    try:
        p = subprocess.run(["ps", "-o", "stat=", "-p", str(pid)], capture_output=True, text=True)
    except OSError:
        return True
    state = p.stdout.strip()
    if p.returncode and p.stderr.strip():
        return True  # 无权探测时不冒险并行启动另一个驱动。
    return bool(state) and not state.startswith("Z")


def git(root: Path, *args) -> subprocess.CompletedProcess:
    return subprocess.run(["git", "--no-optional-locks", *args], cwd=root, capture_output=True, text=True,
                          encoding="utf-8", errors="replace")


def digest(value) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:20]


def failure_summary(text: str) -> str:
    """取失败尾段，忽略末尾空白，供事件去重；原文仍保留给分类与报告。"""
    return text.rstrip()[-1600:]


def ready_summary(text: str) -> list[str] | str:
    """READY 只用最新失败尝试的冲突集；无冲突则用其首行。"""
    attempts = []
    current = None
    for order, raw in enumerate(text.splitlines()):
        line = ANSI.sub("", raw).strip()
        stamped = re.match(r"^\[(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d)\]\s*", line)
        stamp = stamped[1] if stamped else ""
        clean = line[stamped.end():] if stamped else line
        rc = re.search(r"\b(?:finish|merge) rc=(\d+)", clean)
        if rc or stamped:
            current = None
        fallback = current is None and re.search(
            r"主检出有未提交的改动|cherry-pick 失败|could not apply", clean)
        if (rc and int(rc[1]) != 0) or (not rc and fallback):
            current = {"stamp": stamp, "order": order, "first": clean, "files": set()}
            attempts.append(current)
        match = re.search(r"CONFLICT \([^)]*\): Merge conflict in (.+)$", clean)
        if match and current is not None:
            current["files"].add(match[1].strip())
    if not attempts:
        return "auto-merge 未成功"
    stamped_attempts = [attempt for attempt in attempts if attempt["stamp"]]
    latest = max(stamped_attempts, key=lambda attempt: (attempt["stamp"], attempt["order"])) \
        if stamped_attempts else attempts[-1]
    return sorted(latest["files"]) if latest["files"] else latest["first"]


def status_event_key(event: Event, summary) -> str:
    return digest([event.task, event.state, summary])


def task_commit(root: Path, task: str) -> str | None:
    lines = git(root, "log", "--format=%H", "-1", "--extended-regexp", "--grep",
                rf"^Agent-Task:[[:space:]]*{re.escape(task)}[[:space:]]*$").stdout.splitlines()
    return lines[0] if lines else None


def merged_task(root: Path, task: str, after: str = "") -> str | None:
    """只接受 HEAD 历史中的精确 Agent-Task 尾注，且须在等待起点之后。"""
    commit = task_commit(root, task)
    if not commit:
        return None
    if after and (commit == after or git(root, "merge-base", "--is-ancestor", after, commit).returncode):
        return None
    return commit


def new_lines(path: Path, offsets: dict) -> list[str]:
    """每轮有界读取；半行留待下轮；替换 / 截短重置 offset。"""
    try:
        stat = path.stat()
        old = offsets.get(str(path), {})
        pos = old.get("pos", max(0, stat.st_size - LIMIT))
        if old.get("inode", stat.st_ino) != stat.st_ino or pos > stat.st_size:
            pos = 0
        with path.open("rb") as stream:
            stream.seek(pos)
            data = stream.read(LIMIT)
        end = data.rfind(b"\n") + 1
        # 超长单行也推进，防止永久堵在同一个 offset。
        if not end and len(data) == LIMIT:
            end = len(data)
        offsets[str(path)] = {"inode": stat.st_ino, "pos": pos + end}
        return data[:end].decode("utf-8", "replace").splitlines()
    except OSError:
        return []


class Dispatcher:
    def __init__(self, root: Path, config: dict, dry: bool = False):
        self.root, self.config, self.dry = root, config, dry
        self.coord = root / ".agents/coord"
        self.ops = self.coord / "_ops"
        self.state = read_json(self.ops / "state.json")
        self.offsets = read_json(self.ops / "offsets.json")
        for name, default in (("seen", []), ("pending", {}), ("jobs", {}), ("stalls", []),
                              ("status_events", {})):
            self.state.setdefault(name, default)
        if "numbers" not in self.state:
            logs = sorted((self.coord / "_handoff").glob("prod_check_post-*.log"), key=lambda p: p.stat().st_mtime)
            for path in reversed(logs[-20:]):
                parsed = parse_prod(tail(path))
                if parsed["rc"] == 0 and all(v is not None for v in parsed["numbers"].values()):
                    self.state["numbers"] = parsed["numbers"]
                    break

    def note(self, message: str, inbox: bool = False):
        line = f"- [{dt.datetime.now():%H:%M}] {message.replace(chr(10), ' / ')}"
        print(line, flush=True)
        if self.dry:
            return
        path = self.coord / "_inbox/ops.md" if inbox else self.ops / "ops_dispatch.log"
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("a", encoding="utf-8") as stream:
            stream.write(line + "\n")

    def enqueue(self, event: Event, key=None):
        key = key or digest(asdict(event))
        if key not in self.state["seen"]:
            self.state["pending"].setdefault(key, asdict(event))

    def enqueue_status(self, event: Event, summary):
        """同一任务当前状态摘要只报一次；离开后清槽，回来即视为新一次。"""
        key = status_event_key(event, summary)
        previous = self.state["status_events"].get(event.task)
        if previous == key:
            if key in self.state["pending"]:
                self.state["pending"][key] = asdict(event)
            return
        if previous:
            self.state["pending"].pop(previous, None)
        self.state["status_events"][event.task] = key
        # seen 保留已报键；状态槽发生切换时允许同一个历史键重新入队。
        self.state["pending"].setdefault(key, asdict(event))

    def clear_status_event(self, task: str):
        key = self.state["status_events"].pop(task, None)
        if key:
            self.state["pending"].pop(key, None)

    def collect(self):
        free = shutil.disk_usage(self.root).free / 2**30
        if free < 2.5 and not self.state.get("low_disk"):
            self.enqueue(Event("resource", text=f"磁盘可用 {free:.2f} GiB，暂停新处置"),
                         digest(["disk-low", time.time()]))
        self.state["low_disk"] = free < 2.5
        head = git(self.root, "rev-parse", "HEAD").stdout.strip()
        old = self.state.get("head")
        # 首轮只看当前提交；后续读取 old..HEAD，不回放全部历史。
        spec = [f"{old}..{head}"] if old and old != head else ["-1", head]
        if not old or old != head:
            p = git(self.root, "log", "--reverse", "--format=%H%x00%B%x00", *spec)
            if p.returncode:
                self.enqueue(Event("history", text="HEAD 历史不可读，请核对集成分支"))
            else:
                if old and git(self.root, "merge-base", "--is-ancestor", old, head).returncode != 0:
                    self.enqueue(Event("history", text="集成 HEAD 非快进变化，请核对分支；默认不回放历史"))
                    self.state["head"] = head
                    return
                fields = p.stdout.split("\0")
                for sha, body in zip(fields[::2], fields[1::2]):
                    tasks = re.findall(r"^Agent-Task:\s*(\S+)\s*$", body, re.M)
                    if tasks:
                        self.enqueue(Event("merge", tasks[0], text=sha.strip()), "merge-" + sha.strip())
            self.state["head"] = head
        for path in sorted(self.coord.glob("*/supervise.status.json")):
            tid = path.parent.name
            current = read_json(self.root / ".agents/logs" / tid / "current.json")
            if protected(tid, current.get("model", "")):
                continue
            status = read_json(path)
            texts = []
            for name in ("supervise.log", "supervise.out"):
                texts.extend(new_lines(path.parent / name, self.offsets))
            for line in texts:
                if "wait: STALLED" in line:
                    self.collect_stall(tid, line, current)
                elif "等待器" in line and re.search("放弃|未干净|停在", line):
                    self.enqueue(Event("waiter-failed", tid, line))
            state = status.get("state", "")
            if state == "READY" and "auto-merge 未成功" in status.get("detail", ""):
                raw = tail(path.parent / "supervise.log") + "\n" + tail(path.parent / "supervise.out")
                lines = raw.splitlines()
                text = "\n".join(sorted(lines, key=lambda line: line[:21] if line.startswith("[20") else ""))
                self.enqueue_status(Event("ready", tid, text, state), ready_summary(raw))
            elif state == "HOLD-VALIDATE":
                text = tail(self.root / ".agents/logs" / tid / "last_failure.md")
                self.enqueue_status(Event("validate", tid, text, state), failure_summary(text))
            elif state.startswith("HOLD") or state == "ERROR":
                detail = status.get("detail", "")
                self.enqueue_status(Event(state, tid, detail, state), detail)
            else:
                self.clear_status_event(tid)

    def collect_stall(self, tid: str, line: str, current: dict):
        match = re.search(r"\[(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d)\]", line)
        warning = dt.datetime.strptime(match[1], "%Y-%m-%d %H:%M:%S").timestamp() if match else time.time()
        folder = self.root / ".agents/logs" / tid
        candidates = [p for p in folder.glob("*.log") if p.stem.isdigit() and p.stat().st_mtime <= warning]
        # supervise 常已起续作；选告警之前最后有输出的执行日志，而非新 current。
        log = max(candidates, key=lambda p: p.stat().st_mtime) if candidates else Path(current.get("log", ""))
        if not log.is_file() or log.stat().st_mtime > warning:
            self.enqueue(Event("stall-unknown", tid, "无法找到告警前的执行器日志；" + line))
            return
        text = tail(log)
        model = current.get("model", "未知")
        command = re.search(r"^# 命令：([^\n]+)", header(log), re.M)
        if command:
            m = re.search(r"(?:-m|--model)\s+(\S+)", command[1])
            model = m[1] if m else model
        record = {"task": tid, "mtime": log.stat().st_mtime, "model": model,
                  "last": (text.strip().splitlines() or ["空日志"])[-1][:500], "log": str(log)}
        if record not in self.state["stalls"]:
            self.state["stalls"].append(record)
            self.enqueue(Event("stall", tid, record["last"], context=record))
            if sum(r["task"] == tid for r in self.state["stalls"]) >= 2:
                self.enqueue(Event("stall-repeat", tid, "同一任务连续停滞至少两次；默认不手动重起"))
        for group in stall_groups(self.state["stalls"], self.config.get("stall_window_seconds", 300)):
            self.enqueue(Event("cluster", text=json.dumps(group, ensure_ascii=False)), digest(["cluster", group]))

    def fix_context(self, task: str, text: str) -> list[dict]:
        base = read_json(self.root / ".agents/state.json").get(task, {}).get("base")
        registered = {t["id"] for t in read_json(self.root / "tools/agents/tasks.json").get("tasks", [])}
        result = []
        # 一个失败文件可以包含多条校验失败；未知失败不能被已知修复掩盖后挂等待器。
        blocks = re.split(r"(?m)(?=^- (?:校验|缺少|代理进程|没有任何))", text)
        rules = self.config.get("fixes", [])
        if any(block.strip() and not known_fixes(block, rules) for block in blocks):
            return []
        for rule in known_fixes(text, rules):
            sha = rule.get("commit")
            dep = rule.get("task")
            if not sha and dep:
                sha = task_commit(self.root, dep)
            state = "unknown"
            if sha and git(self.root, "merge-base", "--is-ancestor", sha, "HEAD").returncode == 0:
                state = "contained" if base and git(self.root, "merge-base", "--is-ancestor", sha, base).returncode == 0 else "merged"
            elif dep in registered:
                state = "pending"
            result.append({"name": rule["name"], "task": dep, "commit": sha, "state": state})
        return result

    def preview(self, task: str) -> dict:
        wt = self.root / ".agents/wt" / task
        p = git(wt, "rev-parse", "HEAD") if wt.is_dir() else None
        if not p or p.returncode or git(wt, "status", "--porcelain").stdout.strip():
            return {"files": "缺工作区或 finish 提交后仍有改动，需人工核对"}
        tip = p.stdout.strip()
        parent = git(wt, "rev-parse", tip + "^").stdout.strip()
        head = git(self.root, "rev-parse", "HEAD").stdout.strip()
        p = git(self.root, "-c", "merge.conflictStyle=diff3", "merge-tree", "--write-tree", "--name-only", f"--merge-base={parent}", head, tip)
        if p.returncode == 0:
            return {"preview_clean": True}
        if p.returncode != 1:
            return {"files": "merge-tree 不可用：" + p.stderr[-400:]}
        lines = p.stdout.split("\n\n", 1)[0].splitlines()
        conflicts = {}
        for path in lines[1:]:
            blob = git(self.root, "show", f"{lines[0]}:{path}")
            if blob.returncode or len(blob.stdout) > LIMIT:
                return {"files": "无法完整读取冲突块：" + path}
            conflicts[path] = blob.stdout
        return {"conflicts": conflicts, "files": "、".join(conflicts), "head": head}

    def context(self, event: Event, inspect_conflicts: bool = True) -> Event:
        c = dict(event.context)
        c.update(disk_gib=shutil.disk_usage(self.root).free / 2**30, load=os.getloadavg()[0])
        jobs = self.state["jobs"].values()
        c["busy"] = any(j["task"] == event.task or (event.kind == "merge" and j["kind"] == "prod_check") for j in jobs)
        # 也认协调者已经挂的等待器，避免首轮 / 重启后重复挂。
        listing = ""
        if event.kind in ("ready", "validate"):
            try:
                processes = subprocess.run(["ps", "-axo", "command="], capture_output=True, text=True)
                if processes.returncode:
                    c["probe_error"] = True
                else:
                    listing = processes.stdout
            except OSError:
                c["probe_error"] = True
        for line in listing.splitlines():
            try:
                words = shlex.split(line)
            except ValueError:
                continue
            for name in ("merge_when_clean.py", "after_merge_revalidate.py"):
                indices = [i for i, word in enumerate(words) if word.endswith("/" + name) or word == name]
                if indices:
                    index = indices[0] + (1 if name == "merge_when_clean.py" else 2)
                    if len(words) > index and words[index] == event.task:
                        c["busy"] = True
        current = read_json(self.root / ".agents/logs" / event.task / "current.json")
        status = read_json(self.coord / event.task / "supervise.status.json")
        c["running"] = bool(current) and not Path(current.get("exit", "")).is_file() and alive(current.get("pid"))
        c["driver"] = alive(status.get("pid"))
        c["model"] = c.get("model", current.get("model", ""))
        c["args"] = self.config.get("supervise_args", {}).get(event.task)
        if event.kind in ("ready", "validate") and not (self.root / ".agents/wt" / event.task).is_dir():
            c["already_merged"] = bool(task_commit(self.root, event.task))
        if event.kind == "validate":
            c["fixes"] = self.fix_context(event.task, event.text)
        can_preview = inspect_conflicts and not self.dry and c["disk_gib"] >= 2.5
        if event.kind == "ready" and can_preview and not c["running"] and not c["driver"] and "cherry-pick" in event.text:
            c.update(self.preview(event.task))
        return Event(event.kind, event.task, event.text, event.state, c)

    def launch(self, key: str, event: Event, action: Action):
        if action.kind not in ("merge_wait", "wait_fix", "revalidate", "prod_check", "mechanical"):
            raise ValueError("未知执行动作")
        handoff = self.coord / "_handoff"
        args = event.context.get("args") or []
        if action.kind in ("mechanical", "revalidate", "wait_fix"):
            # 参数原样保留，入口从 validate；禁止从配置引入跳过审核 / 门禁的选项。
            if not isinstance(args, list) or not all(isinstance(a, str) for a in args) or any(
                a in ("--from", "--detach", "--worker", "--no-review", "--no-same-failure-stop", "--status", "--attach") for a in args):
                raise ValueError("原驱动参数无效或含绕过选项")
            if "--checks" not in args or args.index("--checks") + 1 >= len(args):
                raise ValueError("缺原审核 --checks，不能猜审核口径")
            checks = Path(args[args.index("--checks") + 1])
            if not (checks if checks.is_absolute() else self.root / checks).is_file():
                raise ValueError("原审核 checks 文件不存在")
        if self.dry and action.kind == "mechanical":
            self.note(f"mechanical {event.task}：{action.reason}；将先在会话外挪基点，"
                      "再起 Codex 短会话，完成后由 dispatcher 以原参数 --from validate")
            return
        if not self.dry:
            if not handoff.is_dir() or not (handoff / "detach_launch.py").is_file():
                raise ValueError("缺交接脚本；请在集成仓库运行")
            fresh = self.context(event, inspect_conflicts=False)
            fresh_context = dict(fresh.context)
            if action.kind == "mechanical":
                fresh_context.update(conflicts=event.context.get("conflicts"),
                                     files=event.context.get("files"), head=event.context.get("head"))
                fresh = Event(fresh.kind, fresh.task, fresh.text, fresh.state, fresh_context)
            if classify(fresh).kind != action.kind:
                raise ValueError("启动前状态变化，停止自动处置")
        log = self.ops / "jobs" / f"{key}.log"
        requested_head = ""
        if action.kind == "merge_wait":
            if not self.dry:
                requested_head = git(self.root, "rev-parse", "HEAD").stdout.strip()
                if not requested_head:
                    raise ValueError("无法记录窗口合入起点 HEAD")
            command = [sys.executable, str(handoff / "merge_when_clean.py"), event.task]
        elif action.kind == "wait_fix":
            deps = [f["task"] for f in event.context["fixes"] if f["state"] == "pending"]
            command = [sys.executable, str(handoff / "after_merge_revalidate.py"), ",".join(deps), event.task, "--", *args]
        elif action.kind == "revalidate":
            command = [sys.executable, str(self.root / "tools/agents/supervise.py"), event.task, *args, "--from", "validate", "--worker"]
        elif action.kind == "prod_check":
            command = ["zsh", str(handoff / "prod_check.sh"), "post-ops-" + key]
        else:
            current_head = git(self.root, "rev-parse", "HEAD").stdout.strip()
            if not event.context.get("head") or current_head != event.context["head"]:
                raise ValueError("预演后集成 HEAD 已变化，停止机械处置")
            rebase = subprocess.run([sys.executable, str(handoff / "rebase_task.py"), event.task,
                "--new-base", event.context["head"]], cwd=self.root, capture_output=True, text=True)
            summary = (rebase.stdout + rebase.stderr).strip()[-600:]
            if rebase.returncode or "带冲突标记 0 个" in rebase.stdout:
                raise ValueError("机械处置挪基点未留下预期冲突：" + summary)
            brief = self.ops / "briefs" / f"{key}.md"
            text = (f"# 运维机械合并 {event.task}\n仅按 tools/agents/OPS_RUNBOOK.md §2.1 处置。\n"
                "这是一次短处置，只处理本次冲突，不扩大任务；每次补丁 ≤ 50 行。\n"
                "禁止停进程、改门禁、跨任务修改；可用磁盘 < 2.5 GiB 或执行器/驱动在跑则只报 ops.md 后退出。\n"
                "先核对当前 HEAD 与预演 HEAD 一致；不同则只报【请判断】，禁止沿用过时冲突判断。\n"
                f"预演 HEAD：{event.context.get('head')}；dispatcher 已在会话外挪基点：{summary}。只把下列冲突块做并集；"
                "其他文件不改。出现新冲突或语义选择只报【请判断】并退出。\n"
                "按 §2.1 扫描整个任务工作区确认无冲突标记，报告 §7 记新基点及合并依据，"
                f"写 .agents/coord/{event.task}/devsup_note_rebase.md。只在任务工作区改冲突与报告；不要自行提交或合入。\n"
                "不要启动 Codex、supervise 或其他后台进程。完成后往 .agents/coord/_inbox/ops.md 追加冲突文件与依据。\n"
                "```json\n" + json.dumps(event.context["conflicts"], ensure_ascii=False, indent=2) + "\n```\n")
            if not self.dry:
                brief.parent.mkdir(parents=True, exist_ok=True)
                brief.write_text(text, encoding="utf-8")
            command = [sys.executable, str(handoff / "codex_session.py"), "ops-" + key, str(brief),
                       "--model", "gpt-6.1-sol", "--effort", "xhigh", "--add-dir",
                       str(self.root / ".agents/wt" / event.task), "--add-dir", str(self.coord)]
        argv = [sys.executable, str(handoff / "detach_launch.py"), str(log), str(self.root), "--", *command]
        self.note(f"{action.kind} {event.task}：{action.reason}；将做：{shlex.join(argv)}")
        if self.dry:
            return
        for name in ("merge_when_clean.py", "after_merge_revalidate.py", "prod_check.sh", "codex_session.py",
                     "rebase_task.py"):
            if any(str(handoff / name) == word for word in command) and not (handoff / name).is_file():
                raise ValueError("缺处置脚本：" + name)
        p = subprocess.run(argv, cwd=self.root, capture_output=True, text=True)
        if p.returncode or not p.stdout.strip().isdigit():
            raise ValueError("detach_launch 失败：" + p.stderr[-600:])
        self.state["jobs"][key] = {"pid": int(p.stdout.strip()), "task": event.task,
            "kind": action.kind, "log": str(log), "started": time.time(),
            "requested_head": requested_head or (event.text if event.kind == "merge" else ""),
            "args": args}
        self.note(f"{action.kind} {event.task}：已启动 pid={p.stdout.strip()}；需要你定：无", inbox=True)

    def start_revalidation(self, key: str, job: dict) -> bool:
        args = job.get("args") or []
        if shutil.disk_usage(self.root).free / 2**30 < 2.5:
            self.note(f"【请判断】机械合并已结束，但磁盘可用 < 2.5 GiB；默认不启动重校验 {job['task']}", inbox=True)
            return False
        command = [sys.executable, "tools/agents/supervise.py", job["task"], *args,
                   "--from", "validate", "--worker"]
        log = self.ops / "jobs" / f"{key}-validate.log"
        detach = self.coord / "_handoff/detach_launch.py"
        argv = [sys.executable, str(detach), str(log), str(self.root), "--", *command]
        if self.dry:
            self.note(f"revalidate {job['task']}：机械会话已成功；将做：{shlex.join(argv)}")
            return True
        p = subprocess.run(argv, cwd=self.root, capture_output=True, text=True)
        if p.returncode or not p.stdout.strip().isdigit():
            self.note(f"【请判断】机械合并已结束，但重校验启动失败 {job['task']}：{p.stderr[-600:]}", inbox=True)
            return False
        self.state["jobs"][key + "-validate"] = {"pid": int(p.stdout.strip()), "task": job["task"],
            "kind": "revalidate", "log": str(log), "started": time.time()}
        self.note(f"机械合并 {job['task']}：会话完成，外部重校验 pid={p.stdout.strip()}", inbox=True)
        return True

    def reap(self):
        for key, job in list(self.state["jobs"].items()):
            if alive(job["pid"]):
                continue
            text = tail(Path(job["log"]))
            if job["kind"] == "prod_check":
                files = sorted((self.coord / "_handoff").glob(f"prod_check_post-ops-{key}_*.log"),
                               key=lambda p: p.stat().st_mtime)
                result = parse_prod(header(files[-1]) + "\n" + tail(files[-1]) if files else text, self.state.get("numbers"))
                values = "；".join(f"{k}={v if v is not None else '缺失'} KiB Δ={result['delta'][k]}"
                                    for k, v in result["numbers"].items())
                green = result["rc"] == 0 and all(v is not None for v in result["numbers"].values())
                self.note(f"prod_check {job['task']} HEAD={result['head']} 合入={job.get('requested_head', '未知')} {'绿' if green else '【请判断】红 / 不完整'}；"
                          f"{values}；失败摘要：{result['summary'] or '无'}", inbox=True)
                if green and not self.dry:
                    self.state["numbers"] = result["numbers"]
                    if result["numbers"]["session"] > 100:
                        self.note("【请判断】首次会话余量 < 10 KiB；默认保留 110 门，建议瘦身任务前移", inbox=True)
            elif job["kind"] == "merge_wait" and "MERGED after" in text:
                commit = merged_task(self.root, job["task"], job.get("requested_head", ""))
                if commit and self.dry:
                    self.note(f"合入 {job['task']}：尾注核实为 {commit[:12]}；将同步 MERGED；{text[-500:]}")
                elif commit:
                    old_root = SUPERVISE.ROOT
                    try:
                        SUPERVISE.ROOT = self.root
                        SUPERVISE.set_status(job["task"], "MERGED", detail=f"窗口合入 {commit[:12]}")
                    finally:
                        SUPERVISE.ROOT = old_root
                    self.note(f"合入 {job['task']}：尾注核实为 {commit[:12]}，已同步 MERGED；{text[-500:]}", inbox=True)
                else:
                    self.note(f"【请判断】合入 {job['task']}：等待器声称完成但未核实到新 Agent-Task 尾注；默认不写 MERGED", inbox=True)
            elif job["kind"] == "merge_wait" and "CONFLICT:" in text:
                if self.dry:
                    self.note(f"合入 {job['task']}：窗口等待发现真冲突；将重新排队交预演分类")
                else:
                    self.enqueue(Event("ready", job["task"], "cherry-pick 失败：" + text, "READY"),
                                 digest(["waiter-conflict", key, text]))
                    self.note(f"合入 {job['task']}：窗口等待发现真冲突，交预演分类", inbox=True)
            elif job["kind"] == "wait_fix" and "已 --from validate 重起" in tail(
                    self.coord / job["task"] / "supervise.out"):
                status = read_json(self.coord / job["task"] / "supervise.status.json")
                self.note(f"基点 {job['task']}：修复合入等待完成，校验驱动 pid={status.get('pid', '见 supervise.out')}", inbox=True)
            elif job["kind"] == "mechanical":
                text += tail(self.coord / "_lines" / ("ops-" + key) / "last.md")
                exit_code = tail(self.coord / "_lines" / ("ops-" + key) / "exit").strip()
                scan = git(self.root / ".agents/wt" / job["task"], "grep", "-n",
                           r"^\(<<<<<<< \|>>>>>>> \)")
                note = self.coord / job["task"] / "devsup_note_rebase.md"
                clean = scan.returncode == 1 and note.is_file() and bool(tail(note).strip())
                if exit_code == "0" and clean:
                    self.start_revalidation(key, job)
                else:
                    self.note(f"【请判断】机械处置未干净完成或缺留痕 {job['task']}；默认不重校验；{text[-1000:]}", inbox=True)
            else:
                self.note(f"【请判断】处置进程结束 {job['task']} {job['kind']}；核对结果；默认不重复起；{text[-1000:]}", inbox=True)
            if not self.dry:
                del self.state["jobs"][key]

    def tick(self):
        self.reap()
        self.collect()
        counts = {}
        for key, raw in list(self.state["pending"].items()):
            try:
                event = self.context(Event(**raw))
                # HOLD 已恢复、READY 已合入或原失败已变，撤销过时的待处置。
                if event.kind in ("ready", "validate"):
                    status = read_json(self.coord / event.task / "supervise.status.json")
                    failure = tail(self.root / ".agents/logs" / event.task / "last_failure.md")
                    if status.get("state") != event.state or (event.kind == "validate" and failure != event.text):
                        del self.state["pending"][key]
                        self.state["seen"].append(key)
                        continue
                action = classify(event)
                counts[action.kind] = counts.get(action.kind, 0) + 1
                if action.kind == "defer":
                    self.note(f"等待 {event.task}：{action.reason}")
                    continue
                if action.kind in ("skip", "inbox"):
                    if event.context.get("disk_gib", 99) < 2.5 and event.kind in ("ready", "validate", "merge"):
                        # 告警由 resource 事件集中写；处置保留，空间恢复后重新决策。
                        continue
                    self.note(f"{event.kind} {event.task}：{action.reason}", inbox=action.kind == "inbox")
                else:
                    self.launch(key, event, action)
            except (OSError, ValueError, KeyError, subprocess.SubprocessError) as exc:
                self.note(f"【请判断】处置失败 {raw.get('task')}：{exc}；默认只记录", inbox=True)
            del self.state["pending"][key]
            self.state["seen"].append(key)
        self.note(f"本轮 HEAD={self.state.get('head', '未知')[:12]}；动作={counts}；待处理={len(self.state['pending'])}")
        if not self.dry:
            self.ops.mkdir(parents=True, exist_ok=True)
            for name, value in (("state.json", self.state), ("offsets.json", self.offsets)):
                path = self.ops / name
                tmp = path.with_suffix(".tmp")
                tmp.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")
                os.replace(tmp, path)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT, help="明确指定集成仓库；不自动跳到其他工作区")
    parser.add_argument("--config", type=Path)
    parser.add_argument("--once", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--interval", type=float, default=45, help="轮询秒数，30–60")
    args = parser.parse_args()
    if not 30 <= args.interval <= 60:
        parser.error("--interval 必须为 30–60 秒")
    root = args.root.resolve()
    config_path = args.config or root / ".agents/coord/_ops/config.json"
    if args.config or config_path.exists():
        try:
            config = json.loads(config_path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            parser.error(f"配置不可读：{exc}")
    else:
        config = read_json(FIXTURES / "config.json")
    driver = Dispatcher(root, config, args.dry_run)
    lock = None
    if not args.dry_run:
        driver.ops.mkdir(parents=True, exist_ok=True)
        lock = (driver.ops / "dispatch.lock").open("a")
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print("已有 ops_dispatch 在运行，不重复启动")
            return 1
        (driver.ops / "pid").write_text(str(os.getpid()), encoding="utf-8")
    try:
        while True:
            driver.tick()
            if args.once or args.dry_run:
                return 0
            time.sleep(args.interval)
    except KeyboardInterrupt:
        return 0
    finally:
        if lock:
            lock.close()


if __name__ == "__main__":
    sys.exit(main())
