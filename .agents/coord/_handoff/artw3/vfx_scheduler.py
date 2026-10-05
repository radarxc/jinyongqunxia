#!/usr/bin/env python3
"""素材线第三波：招式特效 VFX-sk_* 补位器（main 15:22）。
- 等试点 VFX-sk_zuoyouhubo 合入后开始；按招数从少到多依次起。
- 本线 Codex 任务（ART-* 图像、CITY-layouts-*、VFX-sk_*）同时 ≤ 3；有城图批在跑时特效最多 1 路，没有城图时可用满。
- 磁盘 ≥ 5 GiB、最近 60 分钟本线 runner 无限流才起；两次起跑至少隔 2 分钟。
- 每门合入后清掉 .agents/logs/<ID>/codex-home 的 sessions/、generated_images/（执行器直接调 image_gen 的会话记录）。
事件写 launch.log（前缀 vfx）。
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
G = ROOT / ".agents/coord/_handoff/gem"
CODEX = "/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex"
TERMINAL = ("READY", "MERGED", "HOLD-REVIEWS", "HOLD-RUNS", "HOLD-VALIDATE", "ERROR")
PILOT = "VFX-sk_zuoyouhubo"
GAP_S, MIN_FREE = 120, 5.0


def line_cap() -> int:
    """本线同时在跑的 Codex 任务上限（_handoff/artw3/LINE_CAP；main 17:30 起为 1）。"""
    try:
        return int((A / "LINE_CAP").read_text().strip())
    except (OSError, ValueError):
        return 1


def note(msg: str) -> None:
    with open(A / "launch.log", "a", encoding="utf-8") as f:
        f.write(time.strftime("%H:%M:%S ") + "vfx " + msg + "\n")


def state(t: str) -> str:
    try:
        return json.loads((ROOT / ".agents/coord" / t / "supervise.status.json").read_text()).get("state", "")
    except (OSError, ValueError):
        return ""


def merged_set() -> set:
    p = subprocess.run(["git", "log", "--format=%B"], cwd=ROOT, capture_output=True, text=True)
    return set(re.findall(r"^Agent-Task: (\S+)$", p.stdout, re.M))


def mine() -> list:
    out = []
    for d in (ROOT / ".agents/coord").iterdir():
        if d.is_dir() and re.match(r"(ART-(ui|rig|ruins|cast)|CITY-layouts-|VFX-sk_)", d.name):
            out.append(d.name)
    return out


def recent_rate() -> bool:
    return any((G / f"codex_w{n}" / "rate.log").exists() and time.time() - (G / f"codex_w{n}" / "rate.log").stat().st_mtime < 3600
               for n in range(18, 30))


def queue() -> list:
    tasks = json.loads((ROOT / "tools/agents/tasks.json").read_text(encoding="utf-8"))["tasks"]
    done = merged_set()
    def fresh(tid: str) -> bool:  # 10-01 旧批留下的 HOLD / ERROR 状态（工作区已不在）按从头起处理（main 15:22）
        return not state(tid) or (state(tid) in ("HOLD-REVIEWS", "HOLD-RUNS", "HOLD-VALIDATE", "ERROR")
                                  and not (ROOT / ".agents/wt" / tid).exists())
    vfx = [t for t in tasks if t["id"].startswith("VFX-sk_") and t["id"] not in done and t["id"] != PILOT and fresh(t["id"])]
    return [t["id"] for t in sorted(vfx, key=lambda t: (len(re.findall(r"`mv_", t["vars"]["moves"])), t["id"]))]


def city_pending() -> bool:
    """city-generic 已合入且还有没起过的城图批：城图有活要占路。"""
    done = merged_set()
    if "TOOL-city-generic" not in done:
        return False
    tasks = json.loads((ROOT / "tools/agents/tasks.json").read_text(encoding="utf-8"))["tasks"]
    return any(t["id"].startswith("CITY-layouts-ch") and t["id"] not in done and not state(t["id"]) for t in tasks)


def cleanup(t: str) -> None:
    home = ROOT / ".agents/logs" / t / "codex-home"
    for sub in ("sessions", "generated_images"):
        shutil.rmtree(home / sub, ignore_errors=True)


def main() -> int:
    while state(PILOT) != "MERGED":
        if state(PILOT) in ("HOLD-REVIEWS", "HOLD-RUNS", "HOLD-VALIDATE", "ERROR"):
            note(f"试点 {PILOT} 停在 {state(PILOT)}，补位器等追踪者处理")
            time.sleep(600)
        time.sleep(60)
    note("试点已合入，特效补位开始")
    cleaned, last = set(), 0.0
    q = queue()
    while True:
        for t in [x for x in mine() if x.startswith("VFX-sk_") and x not in cleaned and state(x) == "MERGED"]:
            cleanup(t)
            cleaned.add(t)
            note(f"{t} 合入，已清 codex-home 会话与生成图")
            total = [x for x in json.loads((ROOT / "tools/agents/tasks.json").read_text(encoding="utf-8"))["tasks"] if x["id"].startswith("VFX-sk_")]
            done = merged_set()
            n_done = sum(1 for x in total if x["id"] in done)
            IB.once(f"vfx:{t}", f"特效 {t} 合入：已完成 {n_done}/{len(total)} 门（含 10-01 那批），剩 {len(total) - n_done} 门")
        for x in [x for x in mine() if x.startswith("VFX-sk_") and (ROOT / ".agents/wt" / x).exists()]:
            st = state(x)
            if st in ("HOLD-REVIEWS", "HOLD-RUNS", "HOLD-VALIDATE", "ERROR"):
                IB.once(f"vfx-hold:{x}:{st}", f"⚠ 特效 {x} 停在 {st}，需人处理（见 .agents/coord/{x}/supervise.log 与 _handoff/artw3/HANDOFF_GPT.md §5）")
        running = [t for t in mine() if state(t) and state(t) not in TERMINAL]
        city = [t for t in running if t.startswith("CITY-")]
        vfx = [t for t in running if t.startswith("VFX-")]
        free = shutil.disk_usage(str(ROOT)).free / 2**30
        # main 17:20：城图优先占 2 路；城图还有没起的批（city-generic 已合入）时特效不补位，等城图队列空档
        city_waiting = city_pending()
        cap_vfx = 0 if city_waiting else line_cap() - len(vfx)  # 城图队列空了才用它没占的路
        if q and len(running) < line_cap() and cap_vfx > 0 and free >= MIN_FREE and not recent_rate() and time.time() - last >= GAP_S:
            t = q.pop(0)
            d = ROOT / ".agents/coord" / t
            d.mkdir(parents=True, exist_ok=True)
            out = open(d / "supervise.out", "a", encoding="utf-8")
            p = subprocess.Popen(["python3", "tools/agents/supervise.py", t, "--bin", CODEX, "--model", "gpt-6-astra", "--effort", "xhigh",
                                  "--review-model", "gpt-6-astra", "--max-runs", "3", "--max-reviews", "2", "--auto-merge", "--worker",
                                  "--run-timeout-min", "300", "--stall-min", "40", "--checks", ".agents/coord/PROD/review_checks_vfx_skill.md"],
                                 cwd=str(ROOT), stdin=subprocess.DEVNULL, stdout=out, stderr=subprocess.STDOUT, start_new_session=True)
            note(f"{t} 驱动起（pid {p.pid}；本线在跑 {running}；磁盘 {free:.1f} GiB）")
            last = time.time()
        if not q and not vfx:
            note("特效队列已空且无在跑，补位器退出")
            return 0
        time.sleep(60)


if __name__ == "__main__":
    sys.exit(main())
