#!/usr/bin/env python3
"""素材线第三波（AR-47 / AR-48）codex exec 并行跑图器：在沙箱外运行，执行器只往 queue.txt 入队、轮询 jobs.tsv。
抄自 codex_w17/runner.py（10 号出图员）；改动：第 3 列除 male / female 外一律不附画风基线（none / edit / other），
参考图 0–5 张；限流写 rate.log；每轮写 heartbeat。

queue.txt 每行：job_id|asset_id|mode|prompt_file|refs（逗号分隔绝对路径，缩到长边 ≤ 1024 的 JPEG，可空）
    mode = male / female：refs 之后追加两张同性别画风基线（…/gem/baseline_small/）；其他值：只传 refs。
jobs.tsv 每行：job_id \t ok/noimg \t png \t 秒 \t 说明；图在 out/<job_id>.png。
控制文件：STOP（做完手上的就退出）、SLOTS（写 N 只留 N 个槽位）、EXIT_WHEN_EMPTY（队列空就退出）。
磁盘规则：每张出完清该槽位 CODEX_HOME 的 sessions/、generated_images/、thread_history*；可用 < 3 GB 写 STOP 停下。
"""
import os
import re
import shutil
import subprocess
import threading
import time
from pathlib import Path

W = Path(__file__).resolve().parent
QUEUE, JOBS, OUT, LOGS = W / "queue.txt", W / "jobs.tsv", W / "out", W / "logs"
SMALL = Path("/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small")
BASE_UP = {
    "male": [SMALL / "male__ref_npc_linghuchong__ch05_base01.jpg", SMALL / "male__ref_npc_xiaofeng__ch01_base01.jpg"],
    "female": [SMALL / "female__ref_npc_wangyuyan__ch01_base01.jpg", SMALL / "female__ref_npc_xiaolongnv__ch03_base01.jpg"],
}
MIN_FREE = 3.0e9
NSLOTS = int(os.environ.get("RUNNER_SLOTS", "2"))
CODEX = "/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex"
PRE = ("The imagegen skill has already been read. Do not read files, do not call node_repl, shell, or collaboration tools. "
       "Make exactly one built-in image_gen call for this single asset, then reply only with its generated PNG path. ")
RATE = re.compile(r"429|rate.?limit|Too Many Requests|usage limit|quota|try again later", re.I)
lock = threading.Lock()
running: set[str] = set()
state = {"fails": 0, "slots": NSLOTS}


def clean(home: Path) -> None:
    for x in [home / "sessions", home / "generated_images"]:
        shutil.rmtree(x, ignore_errors=True)
    for x in home.glob("thread_history*.sqlite*"):
        x.unlink(missing_ok=True)


def log(msg: str, f: str = "runner.log") -> None:
    with lock:
        with open(W / f, "a") as fh:
            fh.write(time.strftime("%H:%M:%S ") + msg + "\n")


def done_ids() -> set[str]:
    if not JOBS.exists():
        return set()
    return {l.split("\t")[0] for l in JOBS.read_text().splitlines() if l.strip()}


def jobs() -> list:
    out = []
    for l in QUEUE.read_text().splitlines() if QUEUE.exists() else []:
        l = l.strip()
        if l and not l.startswith("#"):
            p = l.split("|")
            out.append((p + [""] * 5)[:5])
    return out


def pick():
    with lock:
        done = done_ids()
        pending = [j for j in jobs() if j[0] not in done and j[0] not in running]
        if pending:
            running.add(pending[0][0])
            return pending[0]
        return None


def record(job_id: str, status: str, png: str, secs: float, note: str) -> None:
    with lock:
        with open(JOBS, "a") as f:
            f.write(f"{job_id}\t{status}\t{png}\t{secs:.0f}\t{note}\n")
        running.discard(job_id)


def run(slot: int, j) -> None:
    job_id, asset, mode, pf, refs_s = j
    home = W / f"home{slot}"
    home.mkdir(exist_ok=True)
    for n in ("auth.json", "config.toml"):
        t = home / n
        if not t.exists() and not t.is_symlink():
            t.symlink_to(Path.home() / ".codex" / n)
    refs = [r for r in refs_s.split(",") if r] + [str(p) for p in BASE_UP.get(mode, [])]
    missing = [r for r in refs if not Path(r).exists()]
    if missing or len(refs) > 5 or not Path(pf).is_file():
        record(job_id, "noimg", "", 0, f"bad job: missing={missing} refs={len(refs)} prompt_exists={Path(pf).is_file()}")
        log(f"slot{slot} BADJOB {job_id}")
        return
    args = [CODEX, "exec", "-m", "gpt-6-astra", "-s", "workspace-write", "--skip-git-repo-check", "-C", str(W / "cwd")]
    for r in refs:
        args += ["-i", r]
    prompt = PRE + Path(pf).read_text(encoding="utf-8").strip()
    t0 = time.time()
    logf = LOGS / f"{job_id}.log"
    env = dict(os.environ, CODEX_HOME=str(home))
    try:
        with open(logf, "w") as lf:
            subprocess.run(args, input=prompt.encode(), stdout=lf, stderr=subprocess.STDOUT, env=env, timeout=1200)
    except subprocess.TimeoutExpired:
        pass
    secs = time.time() - t0
    pngs = [p for p in home.glob("generated_images/*/*.png") if p.stat().st_mtime > t0 - 2]
    text = logf.read_text(errors="ignore")
    if pngs:
        src = max(pngs, key=lambda p: p.stat().st_mtime)
        dst = OUT / f"{job_id}.png"
        shutil.copy2(src, dst)
        clean(home)
        state["fails"] = 0
        record(job_id, "ok", str(dst), secs, src.name)
        log(f"slot{slot} ok {job_id} {secs:.0f}s")
        return
    clean(home)
    tail = " ".join(text.strip().splitlines()[-4:])[-300:].replace("\t", " ")
    if RATE.search(text):
        state["fails"] += 1
        log(f"slot{slot} RATE {job_id} fails={state['fails']} :: {tail}")
        log(f"{job_id} fails={state['fails']} :: {tail}", "rate.log")
        with lock:
            running.discard(job_id)
        if state["fails"] >= 5 and state["slots"] > 1:
            state["slots"] = 1
            log("连续 5 次失败，降到 1 个槽位")
        if state["fails"] >= 10:
            (W / "STOP").write_text("rate limited 10x\n")
            log("连续 10 次失败，停下")
        time.sleep(180)
        return
    state["fails"] += 1 if "error" in text.lower() else 0
    record(job_id, "noimg", "", secs, tail)
    log(f"slot{slot} NOIMG {job_id} {secs:.0f}s :: {tail}")


def worker(slot: int) -> None:
    time.sleep((slot - 1) * 6)
    while True:
        if slot == 1:
            (W / "heartbeat").write_text(time.strftime("%Y-%m-%d %H:%M:%S\n"))
        if (W / "STOP").exists():
            log(f"slot{slot} STOP")
            return
        if shutil.disk_usage("/").free < MIN_FREE:
            (W / "STOP").write_text("磁盘可用空间低于 3 GB\n")
            log(f"slot{slot} 磁盘低于 3 GB，停下")
            return
        want = int((W / "SLOTS").read_text().strip()) if (W / "SLOTS").exists() else state["slots"]
        if slot > min(want, state["slots"]):
            time.sleep(30)
            continue
        j = pick()
        if j is None:
            if (W / "EXIT_WHEN_EMPTY").exists() and not running:
                log(f"slot{slot} queue empty, exit")
                return
            time.sleep(10)
            continue
        log(f"slot{slot} start {j[0]}")
        try:
            run(slot, j)
        except Exception as e:  # noqa: BLE001
            record(j[0], "noimg", "", 0, f"runner error {e!r}")
            log(f"slot{slot} EXC {j[0]} {e!r}")


if __name__ == "__main__":
    for d in (OUT, LOGS, W / "cwd", W / "prompts", W / "staging", W / "sheets"):
        d.mkdir(exist_ok=True)
    ts = [threading.Thread(target=worker, args=(i,), daemon=False) for i in range(1, NSLOTS + 1)]
    for t in ts:
        t.start()
    log("runner started pid=%d slots=%d" % (os.getpid(), NSLOTS))
    for t in ts:
        t.join()
    log("runner exit")
