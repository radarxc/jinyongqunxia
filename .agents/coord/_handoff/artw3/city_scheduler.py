#!/usr/bin/env python3
"""素材线第三波：城图批补位器。TOOL-city-generic 合入后按 SEQ 依次起 CITY-layouts-* 驱动；
同时在跑的城图批数 = _handoff/artw3/CITY_LANES 文件里的数字（默认 2，main 批准后改 3）；
磁盘 ≥ 5 GiB、最近 60 分钟城图执行器日志无限流（usage limit / quota / 429）才起新批；两次起跑至少隔 2 分钟。
每有一批合入，跑 city_consolidate.py 汇总进度并提交。事件写 launch.log。
"""
import json
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path("/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod")
A = ROOT / ".agents/coord/_handoff/artw3"
sys.path.insert(0, str(A))
import inbox_lib as IB  # noqa: E402
CODEX = "/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex"
TERMINAL = ("READY", "MERGED", "HOLD-REVIEWS", "HOLD-RUNS", "HOLD-VALIDATE", "ERROR")
RATE = re.compile(r"usage limit|rate[ _-]?limit|Too Many Requests|quota (?:exceeded|exhausted)|exceeded your (?:current )?quota|HTTP 429|status(?: code)?:? 429", re.I)
GAP_S, MIN_FREE = 120, 5.0


def note(msg: str) -> None:
    with open(A / "launch.log", "a", encoding="utf-8") as f:
        f.write(time.strftime("%H:%M:%S ") + "city " + msg + "\n")


def state(t: str) -> str:
    try:
        return json.loads((ROOT / ".agents/coord" / t / "supervise.status.json").read_text()).get("state", "")
    except (OSError, ValueError):
        return ""


def merged(t: str) -> bool:
    p = subprocess.run(["git", "log", "--format=%B", "-n", "5000"], cwd=ROOT, capture_output=True, text=True)
    return f"Agent-Task: {t}" in p.stdout


def order() -> list:
    tasks = json.loads((ROOT / "tools/agents/tasks.json").read_text(encoding="utf-8"))["tasks"]
    ids = [t["id"] for t in tasks if t["id"].startswith("CITY-layouts-ch")]
    seq = ["ch10", "ch01", "ch02", "ch04", "ch05", "ch08", "ch11"]
    return sorted(ids, key=lambda i: (seq.index(i.split("-")[2]), i.split("-")[3] == "g", i))


def rate_hit(running: list) -> list:
    hits = []
    for t in running:
        try:
            cur = json.loads((ROOT / ".agents/logs" / t / "current.json").read_text())
            log = Path(cur["log"])
            if time.time() - log.stat().st_mtime > 3600:
                continue
            tail = log.read_bytes()[-20000:].decode("utf-8", "ignore")
            if RATE.search(tail):
                hits.append(t)
        except (OSError, ValueError, KeyError):
            continue
    return hits


def lanes() -> int:
    try:
        return int((A / "CITY_LANES").read_text().strip())
    except (OSError, ValueError):
        return 2


def main() -> int:
    while not merged("TOOL-city-generic"):
        time.sleep(120)
    note("TOOL-city-generic 已合入，城图补位开始")
    queue = [t for t in order() if not merged(t) and not state(t)]
    last = 0.0
    done_seen = set()
    while True:
        allc = order()
        running = [t for t in allc if state(t) and state(t) not in TERMINAL]
        # 本线 Codex 任务总数 ≤ 3（main 15:22）：城图优先，但不抢在跑的特效 / 图像任务，等它们收尾腾位
        others = [d.name for d in (ROOT / ".agents/coord").iterdir() if d.is_dir() and re.match(r"(ART-(ui|rig|ruins|cast)|VFX-sk_)", d.name)
                  and state(d.name) and state(d.name) not in TERMINAL]
        for t in allc:
            if t not in done_seen and state(t) == "MERGED":
                done_seen.add(t)
                p = subprocess.run(["python3", str(A / "city_consolidate.py")], cwd=ROOT, capture_output=True, text=True)
                note(f"{t} 合入；汇总：{(p.stdout + p.stderr).strip().splitlines()[-1:] }")
                u, ut, r, rt = IB.city_units()
                mins = [m for m in (IB.batch_minutes(x) for x in allc if state(x) == "MERGED") if m]
                left = [x for x in allc if state(x) != "MERGED"]
                avg = sum(mins) / len(mins) if mins else 0
                eta = len(left) * avg / 60 / max(1, lanes())
                this = IB.batch_minutes(t)
                IB.once(f"city:{t}", f"城图 {t} 合入：本批 {this:.0f} 分钟；完成 城×年代 {u}/{ut}（城×章节 {r}/{rt}）；"
                                     f"剩 {len(left)} 批，按均值 {avg:.0f} 分/批、{lanes()} 路预计 {eta:.1f} 小时")
            st = state(t)
            if st in ("HOLD-REVIEWS", "HOLD-RUNS", "HOLD-VALIDATE", "ERROR"):
                IB.once(f"city-hold:{t}:{st}", f"⚠ 城图 {t} 停在 {st}，需人处理（见 .agents/coord/{t}/supervise.log 与 _handoff/artw3/HANDOFF_GPT.md §5）")
        free = shutil.disk_usage(str(ROOT)).free / 2**30
        hits = rate_hit(running)
        if hits:
            note(f"停新起：城图执行器日志有限流字样 {hits}")
            time.sleep(600)
            continue
        cap = int((A / "LINE_CAP").read_text().strip()) if (A / "LINE_CAP").exists() else 1  # main 17:30：本线最多 1 路
        if queue and len(running) < lanes() and len(running) + len(others) < cap and free >= MIN_FREE and time.time() - last >= GAP_S:
            t = queue.pop(0)
            d = ROOT / ".agents/coord" / t
            d.mkdir(parents=True, exist_ok=True)
            out = open(d / "supervise.out", "a", encoding="utf-8")
            p = subprocess.Popen(["python3", "tools/agents/supervise.py", t, "--bin", CODEX, "--model", "gpt-6-astra", "--effort", "xhigh",
                                  "--review-model", "gpt-6-astra", "--max-reviews", "2", "--max-runs", "6", "--auto-merge", "--worker",
                                  "--run-timeout-min", "600", "--stall-min", "40", "--checks", ".agents/coord/PROD/review_checks_city_batch.md"],
                                 cwd=str(ROOT), stdin=subprocess.DEVNULL, stdout=out, stderr=subprocess.STDOUT, start_new_session=True)
            note(f"{t} 驱动起（pid {p.pid}；在跑 {running}；其他 {others}；路数 {lanes()}；磁盘 {free:.1f} GiB）")
            last = time.time()
        if not queue and not running:
            note("城图队列已空且无在跑批，补位器退出")
            return 0
        time.sleep(60)


if __name__ == "__main__":
    sys.exit(main())
