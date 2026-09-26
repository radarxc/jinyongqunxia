#!/usr/bin/env python3
"""
天书录 · 多代理调度器

按 tools/agents/tasks.json 的依赖图，在本机并行调用 TraeX CLI（`traex exec`）执行代理任务。
每个任务在独立的 git worktree（.agents/wt/<任务>）中运行；结束后校验产出，只把任务声明过的
文件提交回当前分支（提交信息带 `Agent-Task: <任务>` 尾注，据此判断完成状态、支持断点续跑）。

    python tools/agents/run.py check [--live]    检查环境；--live 用一个极小的请求验证模型与登录
    python tools/agents/run.py list              查看任务图与进度
    python tools/agents/run.py prompt B1         打印某任务发给代理的完整提示词
    python tools/agents/run.py run [-j 3]        运行所有可运行的任务，直到全部完成或停在作者闸门
    python tools/agents/run.py approve G1        作者确认闸门，放行后续任务

只依赖 Python 3.8+ 标准库与 git。说明见 tools/agents/README.md。
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import queue
import re
import shlex
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROMPTS_DIR = HERE / "prompts"
TASKS_FILE = HERE / "tasks.json"
MOCK_AGENT = HERE / "mock_agent.py"
TRAILER = "Agent-Task"
REPORTS_REL = "tools/agents/reports"
APPROVALS_REL = "tools/agents/APPROVALS.md"
IS_WINDOWS = os.name == "nt"
HEARTBEAT_SEC = 600
# 预检：答案不出现在提示词里，避免 CLI 回显提示词造成误判
PREFLIGHT_PROMPT = ("Reply with the word tianshu spelled backwards in uppercase letters, and nothing else. "
                    "Do not read or write any files and do not run any commands.")
PREFLIGHT_ANSWER = "UHSNAIT"

WEB_NOTE = (
    "## 联网核实\n\n"
    "本任务涉及技术事实。若你的工具可以联网搜索或抓取网页，逐条核实版本号、API 与浏览器支持、价格与限额，"
    "并在“参考资料”中给出来源链接与访问日期；无法联网时保留（待核实），并在报告中说明哪些条目没能核实。\n"
)


class Fatal(Exception):
    """可预期的错误：打印信息后退出，不打印堆栈。"""


def now() -> _dt.datetime:
    return _dt.datetime.now()


def today() -> str:
    return now().strftime("%Y-%m-%d")


def log(msg: str) -> None:
    print(f"[{now():%H:%M:%S}] {msg}", flush=True)


def git(args, cwd, check=True, input=None):
    p = subprocess.run(["git", *args], cwd=str(cwd), input=input, capture_output=True,
                       text=True, encoding="utf-8", errors="replace")
    if check and p.returncode != 0:
        raise Fatal(f"git {' '.join(args)} 失败（{p.returncode}）：{(p.stderr or p.stdout).strip()}")
    return p


def repo_root() -> Path:
    p = git(["rev-parse", "--show-toplevel"], HERE, check=False)
    if p.returncode != 0:
        raise Fatal("找不到 git 仓库。请在仓库内运行本脚本。")
    return Path(p.stdout.strip())


def count_lines(text: str) -> int:
    return len(text.splitlines())


# ---------------------------------------------------------------- 路径模式

def glob_regex(pat: str):
    out, i = [], 0
    while i < len(pat):
        if pat.startswith("**", i):
            out.append(".*")
            i += 2
            if i < len(pat) and pat[i] == "/":
                i += 1
            continue
        c = pat[i]
        out.append("[^/]*" if c == "*" else "[^/]" if c == "?" else re.escape(c))
        i += 1
    return re.compile("^" + "".join(out) + "$")


def matches_any(path: str, patterns) -> bool:
    return any(glob_regex(p).match(path) for p in patterns)


def _prefix(pat: str):
    idx = [pat.find(c) for c in "*?[" if c in pat]
    return (pat, True) if not idx else (pat[:min(idx)], False)


def patterns_overlap(a: str, b: str) -> bool:
    pa, exact_a = _prefix(a)
    pb, exact_b = _prefix(b)
    if exact_a and exact_b:
        return pa == pb
    if exact_a:
        return pa.startswith(pb)
    if exact_b:
        return pb.startswith(pa)
    return pa.startswith(pb) or pb.startswith(pa)


def writes_overlap(w1, w2) -> bool:
    return any(patterns_overlap(a, b) for a in w1 for b in w2)



# ---------------------------------------------------------------- 任务图

class Task:
    def __init__(self, d: dict):
        self.id = d["id"]
        self.title = d["title"]
        self.kind = d.get("kind", "draft")          # draft | revise | tool | review | gate
        self.wave = int(d.get("wave", 0))
        self.phase = d.get("phase", "")
        self.raw_deps = list(d.get("deps", []))
        self.deps: list = []
        self.prompt = d.get("prompt")
        self.vars = dict(d.get("vars", {}))
        self.writes = list(d.get("writes", []))
        self.review = bool(d.get("review", False))
        self.review_focus = d.get("review_focus", "")
        self.web = bool(d.get("web", False))
        self.validate = dict(d.get("validate", {}))
        self.note = d.get("note", "")
        self.priority = int(d.get("priority", 0))
        self.target: Task | None = None             # 审校任务的被审对象
        self.score = 0                              # 调度优先级：后继任务数 + priority

    @property
    def is_gate(self) -> bool:
        return self.kind == "gate"

    @property
    def report_path(self) -> str:
        return f"{REPORTS_REL}/{self.id}.md"

    @property
    def all_writes(self) -> list:
        return [] if self.is_gate else self.writes + [self.report_path]


class Graph:
    def __init__(self, path: Path = TASKS_FILE):
        data = json.loads(path.read_text(encoding="utf-8"))
        self.defaults = data.get("defaults", {})
        self.tasks: dict = {}
        base = [Task(d) for d in data["tasks"]]
        for t in base:
            if t.id in self.tasks:
                raise Fatal(f"tasks.json：任务 ID 重复：{t.id}")
            self.tasks[t.id] = t
        for t in base:
            if t.review and not t.is_gate:
                r = Task({"id": t.id + ".R", "title": "审校 · " + t.title, "kind": "review",
                          "wave": t.wave, "phase": t.phase, "writes": t.writes, "web": t.web,
                          "validate": t.validate, "priority": t.priority})
                r.target, r.raw_deps = t, [t.id]
                self.tasks[r.id] = r
        for t in self.tasks.values():
            for d in t.raw_deps:
                if d not in self.tasks:
                    raise Fatal(f"tasks.json：{t.id} 依赖未知任务 {d}")
                dt = self.tasks[d]
                # 依赖一个有审校的任务 = 依赖它审校完成后的版本
                t.deps.append(d + ".R" if t.kind != "review" and dt.review and not dt.is_gate else d)
        self.order = self._toposort()
        children = {k: [] for k in self.tasks}
        for t in self.tasks.values():
            for d in t.deps:
                children[d].append(t.id)
        memo: dict = {}
        for tid in reversed(self.order):
            s = set()
            for c in children[tid]:
                s.add(c)
                s |= memo[c]
            memo[tid] = s
            self.tasks[tid].score = len(s) + self.tasks[tid].priority

    def _toposort(self) -> list:
        indeg = {k: len(t.deps) for k, t in self.tasks.items()}
        users = {k: [] for k in self.tasks}
        for t in self.tasks.values():
            for d in t.deps:
                users[d].append(t.id)
        ready = sorted(k for k, n in indeg.items() if n == 0)
        order = []
        while ready:
            k = ready.pop(0)
            order.append(k)
            for u in users[k]:
                indeg[u] -= 1
                if indeg[u] == 0:
                    ready.append(u)
        if len(order) != len(self.tasks):
            raise Fatal("tasks.json：依赖图有环：" + ", ".join(k for k in self.tasks if k not in order))
        return order

    def __getitem__(self, tid: str) -> Task:
        return self.tasks[tid]


def done_tasks(root: Path) -> set:
    p = git(["log", "--format=%B%x1e"], root, check=False)
    done = set()
    if p.returncode == 0:
        for m in re.finditer(rf"^{TRAILER}:\s*(\S+)\s*$", p.stdout, re.M):
            done.add(m.group(1))
    return done


# ---------------------------------------------------------------- 提示词

_VAR = re.compile(r"\{\{(\w+)\}\}")


def fill(template: str, values: dict, where: str) -> str:
    def rep(m):
        k = m.group(1)
        if k not in values:
            raise Fatal(f"提示词 {where} 用了未定义的变量 {{{{{k}}}}}")
        return str(values[k])
    return _VAR.sub(rep, template)


def read_prompt(name: str) -> str:
    f = PROMPTS_DIR / name
    if not f.exists():
        raise Fatal(f"缺少提示词文件 {f}")
    return f.read_text(encoding="utf-8")


def quote_md(text: str) -> str:
    return "\n".join("> " + line if line else ">" for line in text.rstrip().splitlines())


def task_body(t: Task) -> str:
    v = {"date": today(), "task_id": t.id, "task_title": t.title, **t.vars}
    if t.kind == "review":
        tg = t.target
        v.update(target_id=tg.id, target_title=tg.title,
                 target_files="、".join(f"`{w}`" for w in tg.writes),
                 review_focus=f"8. **本次审校重点**：{tg.review_focus}" if tg.review_focus else "",
                 target_prompt=quote_md(task_body(tg)))
        return fill(read_prompt("_review.md"), v, f"{t.id} / _review.md")
    if not t.prompt:
        raise Fatal(f"任务 {t.id} 没有指定 prompt")
    return fill(read_prompt(t.prompt), v, f"{t.id} / {t.prompt}")


def render_prompt(t: Task, attempt: int = 1, failure: str | None = None) -> str:
    common = {"task_id": t.id, "task_title": t.title, "report_path": t.report_path,
              "writes": "\n".join(t.all_writes), "web_note": WEB_NOTE if t.web else "", "date": today()}
    text = fill(read_prompt("_common.md"), common, f"{t.id} / _common.md") + task_body(t)
    if failure:
        text += fill(read_prompt("_retry.md"), {"attempt": attempt, "failure": failure}, "_retry.md")
    return text


# ---------------------------------------------------------------- 配置

class Config:
    def __init__(self, args, defaults: dict):
        g = lambda name, default=None: getattr(args, name, default)  # noqa: E731
        env = os.environ.get
        self.mock = bool(g("mock", False))
        self.dry_run = bool(g("dry_run", False))
        self.model = g("model") or env("TRAEX_MODEL") or defaults.get("model", "")
        self.effort = g("effort") or env("TRAEX_EFFORT") or defaults.get("effort", "")
        self.jobs = int(g("jobs") or defaults.get("jobs", 3))
        self.timeout_min = float(g("timeout_min") or defaults.get("timeout_min", 180))
        retries = g("retries")
        self.retries = int(defaults.get("retries", 1) if retries is None else retries)
        self.exec_args = list(defaults.get("exec_args", ["exec"]))
        self.model_args = list(defaults.get("model_args", ["--model", "{model}"]))
        self.effort_args = list(defaults.get("effort_args", []))
        self.web_args = (list(g("web_arg") or []) or shlex.split(env("TRAEX_WEB_ARGS", ""))
                         or list(defaults.get("web_args", [])))
        self.extra_args = list(g("agent_arg") or []) or shlex.split(env("TRAEX_EXTRA_ARGS", ""))
        self.prompt_via = g("prompt_via") or defaults.get("prompt_via", "arg")
        self.shrink_guard = float(defaults.get("shrink_guard", 0.85))
        self.push = bool(g("push", False))
        self.no_review = bool(g("no_review", False))
        self.keep_worktrees = bool(g("keep_worktrees", False))
        self.fresh = bool(g("fresh", False))
        self.bin = self._find_bin(g("bin") or env("TRAEX_BIN"), defaults.get("bin", ["traex"]))

    @staticmethod
    def _find_bin(explicit, candidates):
        if explicit:
            return shutil.which(explicit) or explicit
        for c in ([candidates] if isinstance(candidates, str) else candidates):
            found = shutil.which(c)
            if found:
                return found
        return None

    def build_cmd(self, t: Task | None, prompt: str):
        if self.mock:
            argv = [sys.executable, str(MOCK_AGENT)]
        else:
            if not self.bin:
                raise Fatal("找不到 traex / traecli。请确认 TraeX CLI 已安装并在 PATH 中，或用 --bin 指定路径。")
            argv = [self.bin, *self.exec_args]
            if self.model:
                argv += [a.format(model=self.model) for a in self.model_args]
            if self.effort:
                argv += [a.format(effort=self.effort) for a in self.effort_args]
            if t is not None and t.web:
                argv += self.web_args
            argv += self.extra_args
        if self.prompt_via == "stdin":
            return argv + ["-"], prompt
        size = len(prompt) if IS_WINDOWS else len(prompt.encode("utf-8"))
        if size > (30000 if IS_WINDOWS else 120000):
            raise Fatal("提示词超过命令行长度上限，请加 --prompt-via stdin（需 CLI 支持从标准输入读取任务）。")
        return argv + ["--", prompt], None


# ---------------------------------------------------------------- 状态与工作区

class State:
    def __init__(self, path: Path):
        self.path = path
        self.lock = threading.Lock()
        self.data = {}
        if path.exists():
            try:
                self.data = json.loads(path.read_text(encoding="utf-8"))
            except ValueError:
                self.data = {}

    def get(self, tid: str) -> dict:
        with self.lock:
            return dict(self.data.get(tid, {}))

    def update(self, tid: str, **kw) -> None:
        with self.lock:
            self.data.setdefault(tid, {}).update(kw)
            self.path.parent.mkdir(parents=True, exist_ok=True)
            tmp = self.path.with_suffix(".tmp")
            tmp.write_text(json.dumps(self.data, ensure_ascii=False, indent=1), encoding="utf-8")
            os.replace(tmp, self.path)


def wt_path(root: Path, tid: str) -> Path:
    return root / ".agents" / "wt" / tid


def wt_exists(path: Path) -> bool:
    return (path / ".git").exists()


def wt_remove(root: Path, path: Path) -> None:
    git(["worktree", "remove", "--force", str(path)], root, check=False)
    if path.exists():
        shutil.rmtree(path, ignore_errors=True)
    git(["worktree", "prune"], root, check=False)


def changed_files(wt: Path, base: str) -> list:
    files = set()
    p = git(["diff", "--name-only", "-z", base], wt)
    files.update(x for x in p.stdout.split("\0") if x)
    p = git(["ls-files", "--others", "--exclude-standard", "-z"], wt)
    files.update(x for x in p.stdout.split("\0") if x)
    return sorted(files)


def head_has_trailer(wt: Path, tid: str) -> bool:
    p = git(["log", "-1", "--format=%B"], wt, check=False)
    return p.returncode == 0 and re.search(rf"^{TRAILER}:\s*{re.escape(tid)}\s*$", p.stdout, re.M) is not None


def main_is_clean(root: Path) -> bool:
    return git(["status", "--porcelain", "--untracked-files=no"], root).stdout.strip() == ""


def current_branch(root: Path):
    p = git(["symbolic-ref", "--short", "-q", "HEAD"], root, check=False)
    return p.stdout.strip() or None


# ---------------------------------------------------------------- 校验

_FENCE = re.compile(r"^\s*(```|~~~)")


def baseline_lines(wt: Path, t: Task, base: str) -> dict:
    """任务开始时，写入范围内已有文件的行数（用于防截断检查）。"""
    out = {}
    if not t.writes:
        return out
    p = git(["ls-tree", "-r", "--name-only", "-z", base], wt, check=False)
    for rel in p.stdout.split("\0"):
        if rel and matches_any(rel, t.writes):
            q = git(["show", f"{base}:{rel}"], wt, check=False)
            if q.returncode == 0:
                out[rel] = count_lines(q.stdout)
    return out


def validate(t: Task, wt: Path, baseline: dict, cfg: Config) -> list:
    problems = []
    v = t.validate

    def text(rel):
        f = wt / rel
        return f.read_text(encoding="utf-8", errors="replace") if f.is_file() else None

    rep = text(t.report_path)
    if rep is None or count_lines(rep.strip()) < 5:
        problems.append(f"缺少报告 {t.report_path}（至少 5 行）")
    for rel in v.get("exists", []):
        if not (wt / rel).exists():
            problems.append(f"缺少文件 {rel}")
    for rel in v.get("fences", []):
        s = text(rel)
        if s is not None:
            n = sum(1 for line in s.splitlines() if _FENCE.match(line))
            if n % 2:
                problems.append(f"{rel}：代码块围栏数为奇数（{n}），疑似截断或未闭合")
    for rel, n in v.get("min_lines", {}).items():
        s = text(rel)
        if s is not None and count_lines(s) < n:
            problems.append(f"{rel}：只有 {count_lines(s)} 行，要求至少 {n} 行")
    for rel, needle in v.get("contains", []):
        s = text(rel)
        if s is not None and needle not in s:
            problems.append(f"{rel}：缺少必需内容“{needle}”")
    for rel, patterns in v.get("headings", {}).items():
        s = text(rel)
        if s is not None:
            for rx in patterns:
                if not re.search(rx, s, re.M):
                    problems.append(f"{rel}：缺少章节标题（应匹配 {rx}）")
    ratio = float(v.get("shrink_guard", cfg.shrink_guard))
    for rel, before in baseline.items():
        s = text(rel)
        if s is None:
            problems.append(f"{rel}：文件被删除")
        elif before >= 20 and count_lines(s) < before * ratio:
            problems.append(f"{rel}：从 {before} 行缩短到 {count_lines(s)} 行（低于 {ratio:.0%}），疑似被截断或覆盖")
    if problems:
        return problems
    for cmd in v.get("cmd", []):
        argv = [sys.executable if a == "{python}" else a for a in cmd]
        shown = " ".join(cmd).replace("{python}", "python")
        try:
            p = subprocess.run(argv, cwd=str(wt), capture_output=True, text=True,
                               encoding="utf-8", errors="replace", timeout=900)
        except subprocess.TimeoutExpired:
            problems.append(f"校验命令超时：{shown}")
            continue
        except OSError as e:
            problems.append(f"校验命令无法运行：{shown}（{e}）")
            continue
        if p.returncode != 0:
            tail = "\n".join((p.stdout + p.stderr).strip().splitlines()[-25:])
            problems.append(f"校验命令失败（退出码 {p.returncode}）：{shown}\n{tail}")
    return problems


# ---------------------------------------------------------------- 执行

def kill_tree(proc: subprocess.Popen) -> None:
    try:
        if IS_WINDOWS:
            proc.kill()
        else:
            os.killpg(proc.pid, signal.SIGTERM)
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            if IS_WINDOWS:
                proc.kill()
            else:
                os.killpg(proc.pid, signal.SIGKILL)
    except (ProcessLookupError, PermissionError, OSError):
        pass


class Runner:
    def __init__(self, root: Path, graph: Graph, cfg: Config):
        self.root, self.g, self.cfg = root, graph, cfg
        self.state = State(root / ".agents" / "state.json")
        self.git_lock = threading.Lock()
        self.proc_lock = threading.Lock()
        self.procs: dict = {}
        self.results: queue.Queue = queue.Queue()
        self.stop = threading.Event()
        self.done = done_tasks(root)

    # 依赖是否满足：闸门需作者确认且其前置均已满足；--no-review 时审校视同其对象
    def satisfied(self, tid: str) -> bool:
        t = self.g[tid]
        if t.kind == "review" and self.cfg.no_review:
            return self.satisfied(t.target.id)
        if t.is_gate:
            return tid in self.done and all(self.satisfied(d) for d in t.deps)
        return tid in self.done

    def deps_ok(self, t: Task) -> bool:
        return all(self.satisfied(d) for d in t.deps)

    # ---- 单个任务（工作线程）
    def run_task(self, t: Task) -> None:
        try:
            res = self._run_task(t)
        except Fatal as e:
            res = {"ok": False, "error": str(e)}
        except Exception as e:  # noqa: BLE001
            res = {"ok": False, "error": f"调度器内部错误：{e!r}"}
        self.results.put((t.id, res))

    def _run_task(self, t: Task) -> dict:
        wt = wt_path(self.root, t.id)
        st = self.state.get(t.id)
        failure = None
        with self.git_lock:
            if wt_exists(wt) and self.cfg.fresh:
                wt_remove(self.root, wt)
            if wt_exists(wt) and st.get("base"):
                if head_has_trailer(wt, t.id):
                    return {"ok": True, "sha": git(["rev-parse", "HEAD"], wt).stdout.strip(), "pending": True}
                base = st["base"]
                failure = st.get("last_failure") or "上一次运行被中断（调度器退出时任务仍在运行）。"
                log(f"… {t.id} 在保留的工作区中续作")
            else:
                if wt.exists():
                    wt_remove(self.root, wt)
                wt.parent.mkdir(parents=True, exist_ok=True)
                git(["worktree", "add", "--detach", str(wt), "HEAD"], self.root)
                base = git(["rev-parse", "HEAD"], wt).stdout.strip()
                self.state.update(t.id, base=base, attempts=0, last_failure=None)
        baseline = baseline_lines(wt, t, base)
        attempt = int(self.state.get(t.id).get("attempts", 0))
        for _ in range(1 + self.cfg.retries):
            attempt += 1
            self.state.update(t.id, attempts=attempt)
            prompt = render_prompt(t, attempt, failure)
            logf = self.root / ".agents" / "logs" / t.id / f"{attempt}.log"
            rc, timed_out = self.exec_agent(t, prompt, wt, logf)
            if self.stop.is_set():
                return {"ok": False, "interrupted": True}
            if timed_out:
                problems = [f"代理运行超过 {self.cfg.timeout_min:g} 分钟被终止"]
            elif rc != 0:
                problems = [f"代理进程退出码 {rc}"]
            else:
                problems = validate(t, wt, baseline, self.cfg)
            if not problems:
                break
            failure = "\n".join(f"- {p}" for p in problems)
            self.state.update(t.id, last_failure=failure, last_log=str(logf))
            log(f"⚠ {t.id} 第 {attempt} 次运行未通过：{problems[0].splitlines()[0][:100]}")
        else:
            return {"ok": False, "error": failure, "log": str(logf)}
        # 只提交声明过的文件：把工作区索引重置到基点，再逐个加入允许的路径
        files = changed_files(wt, base)
        allowed = [f for f in files if matches_any(f, t.all_writes)]
        discarded = [f for f in files if f not in allowed]
        if not allowed:
            return {"ok": False, "error": "没有任何声明范围内的产出"}
        with self.git_lock:
            git(["reset", "-q", "--mixed", base], wt)
            git(["add", "-A", "--", *allowed], wt)
            body = f"变更文件：{len(allowed)}；运行次数：{attempt}"
            if discarded:
                body += "\n已丢弃未声明的改动：" + "、".join(discarded)
            git(["commit", "-q", "--no-verify", "-m", f"agents({t.id}): {t.title}", "-m", body,
                 "-m", f"{TRAILER}: {t.id}"], wt)
            sha = git(["rev-parse", "HEAD"], wt).stdout.strip()
        self.state.update(t.id, last_failure=None)
        return {"ok": True, "sha": sha, "files": allowed, "discarded": discarded, "attempts": attempt}

    def exec_agent(self, t: Task, prompt: str, wt: Path, logf: Path):
        argv, stdin_data = self.cfg.build_cmd(t, prompt)
        env = dict(os.environ, TIANSHU_TASK_ID=t.id)
        if self.cfg.mock:
            env["MOCK_SPEC"] = json.dumps({"validate": t.validate, "writes": t.all_writes,
                                           "report": t.report_path}, ensure_ascii=False)
        logf.parent.mkdir(parents=True, exist_ok=True)
        logf.with_suffix(".prompt.md").write_text(prompt, encoding="utf-8")
        shown = shlex.join(argv[:-1]) + (" <提示词>" if stdin_data is None else " < 提示词")
        kw = {"creationflags": subprocess.CREATE_NEW_PROCESS_GROUP} if IS_WINDOWS else {"start_new_session": True}
        with open(logf, "wb") as lf:
            lf.write(f"# {t.id} · {t.title}\n# 开始：{now():%Y-%m-%d %H:%M:%S}\n# 命令：{shown}\n"
                     f"# 工作区：{wt}\n\n".encode("utf-8"))
            lf.flush()
            proc = subprocess.Popen(argv, cwd=str(wt), env=env, stdout=lf, stderr=subprocess.STDOUT,
                                    stdin=subprocess.PIPE if stdin_data is not None else subprocess.DEVNULL, **kw)
            with self.proc_lock:
                self.procs[t.id] = proc
            if stdin_data is not None:
                try:
                    proc.stdin.write(stdin_data.encode("utf-8"))
                    proc.stdin.close()
                except (BrokenPipeError, OSError):
                    pass
            timed_out = False
            try:
                rc = proc.wait(timeout=self.cfg.timeout_min * 60)
            except subprocess.TimeoutExpired:
                timed_out = True
                kill_tree(proc)
                rc = proc.wait()
            finally:
                with self.proc_lock:
                    self.procs.pop(t.id, None)
            lf.write(f"\n# 结束：{now():%Y-%m-%d %H:%M:%S}，退出码 {rc}{'（超时）' if timed_out else ''}\n".encode("utf-8"))
        return rc, timed_out

    # ---- 合入（主线程）
    def merge(self, t: Task, res: dict) -> bool:
        with self.git_lock:
            if not main_is_clean(self.root):
                log(f"✘ {t.id} 已完成但无法合入：当前工作区有未提交的改动。提交或暂存后重新运行即可直接合入（不会重跑代理）。")
                return False
            p = git(["cherry-pick", res["sha"]], self.root, check=False)
            if p.returncode != 0:
                git(["cherry-pick", "--abort"], self.root, check=False)
                log(f"✘ {t.id} 合入冲突：{(p.stderr or p.stdout).strip()[:300]}")
                return False
            if self.cfg.push:
                self.push()
        if not self.cfg.keep_worktrees:
            with self.git_lock:
                wt_remove(self.root, wt_path(self.root, t.id))
        return True

    def push(self) -> None:
        branch = current_branch(self.root)
        if not branch:
            log("⚠ 当前不在分支上（detached HEAD），跳过推送")
            return
        for delay in (0, 2, 4, 8, 16):
            time.sleep(delay)
            if git(["push", "-u", "origin", branch], self.root, check=False).returncode == 0:
                return
        log(f"⚠ 推送 {branch} 失败（已重试 4 次），提交仍在本地")

    def interrupt(self) -> None:
        self.stop.set()
        with self.proc_lock:
            procs = list(self.procs.values())
        for p in procs:
            kill_tree(p)

    # ---- 调度循环
    def candidates(self, only, until_wave):
        out = []
        for tid in self.g.order:
            t = self.g[tid]
            if t.is_gate or tid in self.done:
                continue
            if t.kind == "review" and self.cfg.no_review:
                continue
            if only and tid not in only:
                continue
            if until_wave is not None and t.wave > until_wave:
                continue
            out.append(t)
        return out

    def loop(self, only=None, until_wave=None) -> int:
        todo = self.candidates(only, until_wave)
        running: dict = {}
        finished, failed = [], {}
        last_beat = time.time()
        while not self.stop.is_set():
            ready = [t for t in todo if t.id not in running and t.id not in failed
                     and t.id not in self.done and self.deps_ok(t)]
            ready.sort(key=lambda t: (-t.score, t.wave, t.id))
            for t in ready:
                if len(running) >= self.cfg.jobs:
                    break
                if any(writes_overlap(t.all_writes, self.g[r].all_writes) for r in running):
                    continue
                running[t.id] = time.time()
                log(f"▶ {t.id} 开始：{t.title}")
                threading.Thread(target=self.run_task, args=(t,), daemon=True).start()
            if not running:
                break
            try:
                tid, res = self.results.get(timeout=15)
            except queue.Empty:
                if time.time() - last_beat >= HEARTBEAT_SEC:
                    last_beat = time.time()
                    log("… 运行中：" + "、".join(f"{k}（{(time.time() - s) / 60:.0f} 分钟）" for k, s in running.items()))
                continue
            started = running.pop(tid)
            t = self.g[tid]
            if res.get("interrupted"):
                continue
            if res.get("ok") and self.merge(t, res):
                self.done.add(tid)
                finished.append(tid)
                extra = "（合入此前已完成的结果）" if res.get("pending") else \
                    f"，{len(res.get('files', []))} 个文件，{res.get('attempts', 1)} 次运行"
                log(f"✔ {tid} 完成（{(time.time() - started) / 60:.0f} 分钟{extra}）")
                if res.get("discarded"):
                    log(f"  ⚠ 丢弃了 {tid} 对未声明文件的改动：{'、'.join(res['discarded'])}")
            else:
                failed[tid] = res.get("error") or "合入失败"
                if not res.get("ok"):
                    log(f"✘ {tid} 失败：{failed[tid].splitlines()[0][:160]}" + (f"（日志：{res['log']}）" if res.get("log") else ""))
        return self.summary(todo, finished, failed)

    def summary(self, todo, finished, failed) -> int:
        print()
        log(f"本轮完成 {len(finished)} 个任务" + (f"：{'、'.join(finished)}" if finished else ""))
        if self.stop.is_set():
            log("已中断。重新运行同一命令即可续跑：中断的任务会在保留的工作区里继续。")
            return 130
        if failed:
            log(f"失败 {len(failed)} 个：{'、'.join(failed)}。日志在 .agents/logs/<任务>/；修正后重新运行即可重试。")
        waiting = [t for t in self.g.tasks.values() if t.is_gate and not self.satisfied(t.id)
                   and self.deps_ok(t) and t.id not in self.done]
        for gt in waiting:
            log(f"⏸ 闸门 {gt.id}（{gt.title}）等待作者确认：{gt.note}")
        left = [t.id for t in todo if t.id not in self.done]
        if left and not failed and not waiting:
            log(f"仍有 {len(left)} 个任务未运行（依赖未满足）：{'、'.join(left[:20])}")
        if not left and not waiting and not failed:
            log("所选任务全部完成。")
        return 1 if failed else 0


# ---------------------------------------------------------------- 子命令

def load(args):
    root = repo_root()
    graph = Graph()
    cfg = Config(args, graph.defaults)
    return root, graph, cfg


def cmd_list(args) -> int:
    root, g, cfg = load(args)
    r = Runner(root, g, cfg)
    icons = {"done": "✅", "gate": "⏸", "ready": "🟢", "wait": "⏳", "failed": "❌", "resume": "🔄"}
    counts: dict = {}
    wave = None
    for tid in sorted(g.order, key=lambda k: (g[k].wave, g.order.index(k))):
        t = g[tid]
        if t.kind == "review" and cfg.no_review:
            continue
        if t.is_gate:
            st = "done" if r.satisfied(tid) else ("gate" if r.deps_ok(t) else "wait")
        elif tid in r.done:
            st = "done"
        elif wt_exists(wt_path(root, tid)):
            st = "resume"
        elif r.state.get(tid).get("last_failure"):
            st = "failed"
        else:
            st = "ready" if r.deps_ok(t) else "wait"
        counts[st] = counts.get(st, 0) + 1
        if t.wave != wave:
            wave = t.wave
            print(f"\n── 第 {wave} 波 ──")
        pending = [d for d in t.deps if not r.satisfied(d)]
        tail = f"  ← 等待 {', '.join(pending)}" if pending and st != "done" else ""
        print(f"{icons[st]} {tid:<7} {t.kind:<6} {t.title}{tail}")
    print("\n合计：" + "，".join(f"{icons[k]} {v}" for k, v in counts.items())
          + "（✅ 完成 ⏸ 等作者 🟢 可运行 ⏳ 等依赖 🔄 可续作 ❌ 上次失败）")
    return 0


def cmd_prompt(args) -> int:
    _, g, _ = load(args)
    if args.id not in g.tasks:
        raise Fatal(f"没有任务 {args.id}")
    t = g[args.id]
    if t.is_gate:
        print(f"{t.id} 是作者闸门，不发给代理：{t.note}")
        return 0
    sys.stdout.write(render_prompt(t))
    return 0


def preflight(cfg: Config) -> bool:
    with tempfile.TemporaryDirectory(prefix="tianshu-preflight-") as d:
        argv, stdin_data = cfg.build_cmd(None, PREFLIGHT_PROMPT)
        log(f"预检：{shlex.join(argv[:-1])} …")
        try:
            p = subprocess.run(argv, cwd=d, input=stdin_data, capture_output=True, text=True,
                               encoding="utf-8", errors="replace", timeout=300)
        except subprocess.TimeoutExpired:
            log("✘ 预检超时（300 秒）。可能在等待交互确认或登录。")
            return False
        except OSError as e:
            log(f"✘ 预检无法启动：{e}")
            return False
        out = (p.stdout or "") + (p.stderr or "")
        if p.returncode == 0 and PREFLIGHT_ANSWER in out:
            log(f"✔ 预检通过（模型 {cfg.model or '（CLI 默认）'}）")
            return True
        log(f"✘ 预检失败，退出码 {p.returncode}。输出末尾：\n" + "\n".join(out.strip().splitlines()[-20:]))
        return False


def cmd_check(args) -> int:
    root, g, cfg = load(args)
    ok = True
    print(f"Python {sys.version.split()[0]}；{git(['--version'], root).stdout.strip()}")
    print(f"仓库：{root}；分支：{current_branch(root) or '（detached HEAD）'}")
    if not main_is_clean(root):
        print("⚠ 工作区有未提交的改动：run 之前需要提交或暂存")
    if git(["check-ignore", "-q", ".agents/x"], root, check=False).returncode != 0:
        print("⚠ .agents/ 未被 .gitignore 忽略，请加入 .gitignore")
        ok = False
    for t in g.tasks.values():
        if not t.is_gate:
            render_prompt(t)
    print(f"✔ 任务图：{len(g.tasks)} 个节点（代理任务 {sum(not t.is_gate for t in g.tasks.values())} 个），提示词全部可渲染")
    if cfg.bin:
        try:
            p = subprocess.run([cfg.bin, "--version"], capture_output=True, text=True, errors="replace", timeout=30)
            ver = ((p.stdout or p.stderr).strip().splitlines() or ["版本未知"])[0]
        except (OSError, subprocess.TimeoutExpired) as e:
            ver = f"无法获取版本：{e}"
        print(f"✔ TraeX CLI：{cfg.bin}（{ver}）")
    else:
        print("✘ 找不到 traex / traecli（可用 --bin 指定，或设置环境变量 TRAEX_BIN）")
        ok = False
    print(f"模型：{cfg.model or '（CLI 默认）'}；推理强度：{cfg.effort or '（CLI 默认）'}；并发：{cfg.jobs}")
    if args.live and cfg.bin:
        ok = preflight(cfg) and ok
    return 0 if ok else 1


def cmd_run(args) -> int:
    root, g, cfg = load(args)
    only = set()
    for part in (args.only or []):
        only.update(x.strip() for x in part.split(",") if x.strip())
    unknown = only - set(g.tasks)
    if unknown:
        raise Fatal(f"没有这些任务：{', '.join(sorted(unknown))}")
    if git(["check-ignore", "-q", ".agents/x"], root, check=False).returncode != 0:
        raise Fatal(".agents/ 未被 .gitignore 忽略。请先把 `.agents/` 加入 .gitignore 并提交。")
    if not cfg.dry_run and not main_is_clean(root):
        raise Fatal("工作区有未提交的改动。请先提交或暂存（调度器需要把代理的结果逐个提交到当前分支）。")
    runner = Runner(root, g, cfg)
    if args.force and only:
        runner.done -= only
    for t in g.tasks.values():
        if not t.is_gate:
            render_prompt(t)  # 提前发现模板错误
    if cfg.dry_run:
        return dry_run(runner, only, args.until_wave)
    if not cfg.mock and not cfg.bin:
        raise Fatal("找不到 traex / traecli。请确认 TraeX CLI 已安装并在 PATH 中，或用 --bin 指定路径。")
    lock = root / ".agents" / "run.lock"
    lock.parent.mkdir(parents=True, exist_ok=True)
    try:
        fd = os.open(str(lock), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        os.write(fd, str(os.getpid()).encode())
        os.close(fd)
    except FileExistsError:
        raise Fatal(f"另一个调度器似乎正在运行（{lock}）。若确认没有，删除该文件后重试。")
    try:
        if not cfg.mock and not args.no_preflight and not preflight(cfg):
            raise Fatal("预检失败，未启动任何任务。检查登录状态与模型名（--model），或加 --no-preflight 跳过。")
        log(f"开始：并发 {cfg.jobs}，模型 {cfg.model or '（CLI 默认）'}" + ("，模拟代理" if cfg.mock else "")
            + ("，跳过审校" if cfg.no_review else ""))
        try:
            return runner.loop(only or None, args.until_wave)
        except KeyboardInterrupt:
            runner.interrupt()
            print()
            log("收到中断，已终止运行中的代理。工作区已保留；重新运行同一命令即可续跑。")
            return 130
    finally:
        try:
            lock.unlink()
        except OSError:
            pass


def dry_run(runner: Runner, only, until_wave) -> int:
    todo = runner.candidates(only or None, until_wave)
    out_dir = runner.root / ".agents" / "prompts"
    out_dir.mkdir(parents=True, exist_ok=True)
    for t in todo:
        (out_dir / f"{t.id}.md").write_text(render_prompt(t), encoding="utf-8")
    sim = set(runner.done)
    real_done = runner.done
    runner.done = sim
    rounds, remaining = [], list(todo)
    while remaining:
        ready = [t for t in remaining if runner.deps_ok(t)]
        if not ready:
            break
        rounds.append([t.id for t in sorted(ready, key=lambda t: (-t.score, t.wave, t.id))])
        for t in ready:
            sim.add(t.id)
            remaining.remove(t)
    runner.done = real_done
    for i, ids in enumerate(rounds, 1):
        print(f"第 {i} 批（依赖就绪后最多并发 {runner.cfg.jobs} 个）：{'、'.join(ids)}")
    if remaining:
        gates = sorted({d for t in remaining for d in t.deps if runner.g[d].is_gate and not runner.satisfied(d)})
        print(f"停在作者闸门 {'、'.join(gates) or '（无）'} 之前，其后还有 {len(remaining)} 个任务")
    print(f"提示词已写到 {out_dir}")
    return 0


def cmd_approve(args) -> int:
    root, g, _ = load(args)
    t = g.tasks.get(args.id)
    if not t or not t.is_gate:
        raise Fatal(f"{args.id} 不是作者闸门（可选：{', '.join(k for k, v in g.tasks.items() if v.is_gate)}）")
    done = done_tasks(root)
    if t.id in done:
        print(f"{t.id} 已经确认过。")
        return 0
    unmet = [d for d in t.deps if d not in done]
    if unmet and not args.force:
        raise Fatal(f"{t.id} 的前置任务尚未完成：{', '.join(unmet)}。如要提前放行（前置完成后自动生效），加 --force。")
    f = root / APPROVALS_REL
    if not f.exists():
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text("# 作者闸门确认记录\n\n由 `python tools/agents/run.py approve <闸门>` 追加。\n\n", encoding="utf-8")
    note = args.message or "（无备注）"
    with open(f, "a", encoding="utf-8") as fh:
        fh.write(f"- {now():%Y-%m-%d %H:%M} · {t.id} · {t.title}：{note}" + ("（提前放行）" if unmet else "") + "\n")
    staged = [APPROVALS_REL]
    p = git(["status", "--porcelain", "--untracked-files=all", "--", "docs/decisions"], root)
    staged += [line[3:] for line in p.stdout.splitlines() if line[3:]]
    git(["add", "--", *staged], root)
    git(["commit", "-q", "-m", f"agents({t.id}): 作者确认 · {t.title}", "-m", note, "-m", f"{TRAILER}: {t.id}"], root)
    print(f"✔ 已确认 {t.id}，提交了：{'、'.join(staged)}")
    return 0


def build_parser():
    ap = argparse.ArgumentParser(description="天书录多代理调度器（TraeX CLI）")
    sub = ap.add_subparsers(dest="cmd", required=True)

    def agent_opts(p):
        p.add_argument("--bin", help="TraeX CLI 可执行文件（默认在 PATH 中找 traex、traecli；环境变量 TRAEX_BIN）")
        p.add_argument("--model", help="模型名（默认见 tasks.json；环境变量 TRAEX_MODEL）")
        p.add_argument("--effort", help="推理强度，传给 -c model_reasoning_effort=…（环境变量 TRAEX_EFFORT）")
        p.add_argument("--agent-arg", action="append", metavar="ARG", help="追加给 traex exec 的参数，可重复（环境变量 TRAEX_EXTRA_ARGS）")
        p.add_argument("--web-arg", action="append", metavar="ARG", help="仅对需要联网核实的任务追加的参数，可重复（环境变量 TRAEX_WEB_ARGS）")
        p.add_argument("--prompt-via", choices=["arg", "stdin"], help="提示词作为命令行参数（默认）或经标准输入传入")
        p.add_argument("--mock", action="store_true", help="用 mock_agent.py 代替真实代理（测试调度器，不消耗额度）")

    p = sub.add_parser("check", help="检查环境")
    agent_opts(p)
    p.add_argument("--live", action="store_true", help="发送一个极小的请求，验证登录与模型名")
    p.set_defaults(func=cmd_check)

    p = sub.add_parser("list", help="查看任务图与进度")
    p.add_argument("--no-review", action="store_true", help="隐藏审校任务")
    p.set_defaults(func=cmd_list)

    p = sub.add_parser("prompt", help="打印某任务的完整提示词")
    p.add_argument("id")
    p.set_defaults(func=cmd_prompt)

    p = sub.add_parser("run", help="运行任务")
    agent_opts(p)
    p.add_argument("-j", "--jobs", type=int, help="最大并发代理数（默认见 tasks.json）")
    p.add_argument("--only", action="append", metavar="IDS", help="只运行这些任务（逗号分隔，可重复）；依赖未完成的不会运行")
    p.add_argument("--force", action="store_true", help="与 --only 连用：即使已完成也重新运行")
    p.add_argument("--until-wave", type=int, help="只运行波次 ≤ N 的任务")
    p.add_argument("--no-review", action="store_true", help="跳过全部审校任务（省额度，不推荐）")
    p.add_argument("--retries", type=int, help="每个任务失败后的续作次数（默认 1）")
    p.add_argument("--timeout-min", type=float, help="单次代理运行的超时分钟数（默认 180）")
    p.add_argument("--push", action="store_true", help="每合入一个任务就推送当前分支")
    p.add_argument("--fresh", action="store_true", help="丢弃中断任务保留的工作区，从头重跑")
    p.add_argument("--keep-worktrees", action="store_true", help="任务完成后保留其工作区（调试用）")
    p.add_argument("--no-preflight", action="store_true", help="跳过启动前的模型预检")
    p.add_argument("--dry-run", action="store_true", help="只打印执行计划并把提示词写到 .agents/prompts/")
    p.set_defaults(func=cmd_run)

    p = sub.add_parser("approve", help="作者确认闸门")
    p.add_argument("id")
    p.add_argument("-m", "--message", help="备注")
    p.add_argument("--force", action="store_true", help="前置任务未完成也先放行（前置完成后自动生效）")
    p.set_defaults(func=cmd_approve)
    return ap


def main(argv=None) -> int:
    for s in (sys.stdout, sys.stderr):
        try:
            s.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass
    args = build_parser().parse_args(argv)
    try:
        return args.func(args)
    except Fatal as e:
        print(f"错误：{e}", file=sys.stderr)
        return 2
    except BrokenPipeError:  # 输出被 head 等提前关闭
        return 0


if __name__ == "__main__":
    sys.exit(main())
