#!/usr/bin/env python3
"""批量生产调度（协调者用）：维持 N 个任务在跑，过审自动合入，返修后自动复审，队列跑空即退出。

    python3 tools/agents/batch_run.py --queue ID [ID ...] [--parallel 12] [--interval 60] [--dry-run]
    python3 tools/agents/batch_run.py --queue-file FILE ...      # 每行一个任务 ID（# 开头为注释）
    python3 tools/agents/batch_run.py --status                   # 打印队列里每个任务的状态

规则（作者 2026-09-30：验收 GPT 做，不要太复杂）：
- 依赖未合入（当前分支没有 `Agent-Task: <dep>` 尾注）的任务先等；
- 空位时按队列顺序启动 `supervise.py <ID> --checks <按前缀选要点> --max-reviews 1 --max-runs 3 --auto-merge`；
- 审核 FAIL → supervise 自己返修一轮后停在 HOLD-REVIEWS（reviews=1）；本脚本自动再起一次 `--from validate` 复审（每个任务最多 2 次）；
- HOLD-VALIDATE / ERROR / 复审仍 FAIL 的任务留给协调者，打印在摘要里；
- 状态记在 .agents/coord/_batch/<name>.json，可随时 Ctrl-C 后重跑（幂等）。
ROOT 取脚本所在仓库：在集成分支工作区 `.agents/wt/_prod` 里运行就调度那里。
"""
import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
import supervise as V  # noqa: E402
import step as S  # noqa: E402
import run as R  # noqa: E402

PY = sys.executable
CHECKS = [  # (ID 前缀, 审核要点文件)
    ("VFX-emitters", ".agents/coord/PROD/review_checks_vfx_foundation.md"),
    ("VFX-templates", ".agents/coord/PROD/review_checks_vfx_templates.md"),
    ("VFX-sk_", ".agents/coord/PROD/review_checks_vfx_skill.md"),
    ("KIT-", ".agents/coord/PROD/review_checks_kit.md"),
    ("CITY-", ".agents/coord/PROD/review_checks_city.md"),
    ("TOWN-tiles-water", ".agents/coord/PROD/review_checks_tile_water.md"),
    ("ART-item-", ".agents/coord/PROD/review_checks_item.md"),
    ("ART-rig-", ".agents/coord/PROD/review_checks_rig_parts.md"),
    ("TOOL-", ".agents/coord/PROD/review_checks_tool.md"),
    ("DES-", ".agents/coord/PROD/review_checks_des.md"),
    ("ENG-", ".agents/coord/PROD/review_checks_eng.md"),
]
MAX_REVALIDATE = 3  # 2026-10-01：改命任务常要三轮才把旧章节的矛盾改干净，多给一次复审


def checks_for(tid: str):
    if tid.startswith("KIT-") and tid.endswith("-hist"):
        return ".agents/coord/PROD/review_checks_kit_hist.md"
    for pre, f in CHECKS:
        if tid.startswith(pre):
            return f
    return None


def merged() -> set:
    return set(R.done_tasks(ROOT))


def running_count(pool: str) -> int:
    return len(S.running_in_pool(ROOT, pool))


def launch(tid: str, extra: list) -> None:
    argv = [PY, "tools/agents/supervise.py", tid, "--max-reviews", "1", "--max-runs", "3", "--auto-merge", "--worker"] + extra
    chk = checks_for(tid)
    if chk:
        argv += ["--checks", chk]
    out = open(V.cdir(tid) / "supervise.out", "a", encoding="utf-8")
    subprocess.Popen(argv, cwd=str(ROOT), stdin=subprocess.DEVNULL, stdout=out, stderr=subprocess.STDOUT, start_new_session=True)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--queue", nargs="*", default=[])
    ap.add_argument("--queue-file")
    ap.add_argument("--name", default="batch")
    ap.add_argument("--parallel", type=int, default=12)
    ap.add_argument("--interval", type=int, default=60)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--status", action="store_true")
    a = ap.parse_args()
    queue = list(a.queue)
    if a.queue_file:
        queue += [ln.strip() for ln in Path(a.queue_file).read_text(encoding="utf-8").splitlines() if ln.strip() and not ln.startswith("#")]
    g = R.Graph()
    queue = [q for q in queue if q in g.tasks] if hasattr(g, "tasks") else queue
    sf = ROOT / ".agents/coord/_batch" / f"{a.name}.json"
    sf.parent.mkdir(parents=True, exist_ok=True)
    state = json.loads(sf.read_text(encoding="utf-8")) if sf.exists() else {"revalidated": {}, "launched": []}

    def save():
        sf.write_text(json.dumps(state, ensure_ascii=False, indent=1), encoding="utf-8")

    def line(tid):
        st = V.get_status(tid)
        return f"{tid:44s} {st.get('state', '—'):13s} runs={st.get('runs', 0)} reviews={st.get('reviews', 0)} {st.get('detail', '')[:50]}"

    if a.status:
        for tid in queue:
            print(line(tid))
        return 0

    while True:
        done = merged()
        # 已合入任务的执行器 / 审核日志不再需要（每个几十到几百 MB；2026-09-30 曾把磁盘写满），顺手清掉
        for tid in queue:
            if tid in done:
                for f in (ROOT / ".agents" / "logs" / tid).glob("*.log"):
                    f.unlink(missing_ok=True)
                for f in (ROOT / ".agents" / "reviews").glob(f"{tid}.r*.log"):
                    f.unlink(missing_ok=True)
        active = 0
        holds, todo = [], []
        for tid in queue:
            if tid in done:
                continue
            st = V.get_status(tid)
            state_ = st.get("state")
            pid = st.get("pid")
            alive = state_ == "RUNNING" and pid and V.proc_alive(int(pid))
            if alive:
                active += 1
                continue
            if state_ == "MERGED":
                continue
            if state_ == "HOLD-REVIEWS" and st.get("reviews", 0) >= 1 and st.get("runs", 0) > 0:
                n = state["revalidated"].get(tid, 0)
                if n < MAX_REVALIDATE:
                    state["revalidated"][tid] = n + 1
                    save()
                    print(f"[{V.now()}] 复审 {tid}（第 {n + 1} 次）")
                    if not a.dry_run:
                        launch(tid, ["--from", "validate"])
                    active += 1
                else:
                    holds.append(tid)
                continue
            if state_ in ("HOLD-VALIDATE", "ERROR", "READY"):
                holds.append(tid)
                continue
            # 未启动或驱动已消失：看依赖
            t = g[tid]
            if any(d not in done for d in t.deps):
                todo.append((tid, "等依赖 " + "、".join(d for d in t.deps if d not in done)))
                continue
            todo.append((tid, "ready"))
        pool_free = a.parallel - active
        started = []
        for tid, why in todo:
            if why != "ready" or pool_free <= 0:
                continue
            if tid in state["launched"] and V.get_status(tid).get("state") in ("HOLD-REVIEWS", "HOLD-VALIDATE", "ERROR"):
                continue
            print(f"[{V.now()}] 启动 {tid}")
            if not a.dry_run:
                launch(tid, [])
            state["launched"].append(tid)
            save()
            started.append(tid)
            pool_free -= 1
        waiting = [f"{t}（{w}）" for t, w in todo if w != "ready" or t not in started]
        remaining = [q for q in queue if q not in done]
        print(f"[{V.now()}] 在跑 {active + len(started)} / 已合入 {len([q for q in queue if q in done])} / 待启动 {len(waiting)} / 停住 {len(holds)}"
              + (f"\n  停住待协调者：{'、'.join(holds)}" if holds else "")
              + (f"\n  待启动：{'；'.join(waiting[:8])}{'…' if len(waiting) > 8 else ''}" if waiting else ""), flush=True)
        if not remaining or (not active and not started and not [t for t, w in todo if w != "ready"] and all(q in done or q in holds for q in remaining)):
            print(f"[{V.now()}] 队列结束：合入 {len([q for q in queue if q in done])}，停住 {len(holds)}")
            return 0 if not holds else 1
        if a.dry_run:
            return 0
        time.sleep(a.interval)


if __name__ == "__main__":
    sys.exit(main())
