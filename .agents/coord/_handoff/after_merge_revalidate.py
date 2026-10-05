#!/usr/bin/env python3
"""等某个任务合入后，把另一个任务挪基点再 --from validate 重起（协调者 10-03 写）。

    python3 after_merge_revalidate.py <依赖任务ID[,依赖任务ID...]> <任务ID> [-- <supervise 参数 ...>]

用途：任务的校验只栽在一个「已由别的任务修掉」的问题上（如计时断言挪 check:perf），
不让执行器重跑，等修复合入后挪基点重校验。
- 每 30 秒读一次各依赖任务的 supervise.status.json，全部 state==MERGED 后继续；超过 6 小时放弃。
- rebase_task.py 挪到集成分支当前 HEAD；有冲突标记就停，写一行到任务的 supervise.out 交协调者。
- 无冲突：用 detach_launch 起 supervise <任务ID> <参数> --from validate。
所有进展都写进任务的 supervise.out（watch_drivers 会转给协调者）。
"""
import json
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path("/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod")
deps, tid = sys.argv[1].split(","), sys.argv[2]
dep = "、".join(deps)
extra = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
out = ROOT / ".agents/coord" / tid / "supervise.out"


def log(msg):
    with open(out, "a", encoding="utf-8") as f:
        f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] 等待器：{msg}\n")


def dep_state(d):
    p = ROOT / ".agents/coord" / d / "supervise.status.json"
    try:
        return json.loads(p.read_text(encoding="utf-8")).get("state", "")
    except Exception:
        return ""


log(f"等 {dep} 合入后挪基点、--from validate 重起 {tid}")
t0 = time.time()
while not all(dep_state(d) == "MERGED" for d in deps):
    if time.time() - t0 > 6 * 3600:
        log(f"等了 6 小时 {dep} 仍未合入，放弃，交协调者")
        sys.exit(1)
    time.sleep(30)

r = subprocess.run(["python3", ".agents/coord/_handoff/rebase_task.py", tid], cwd=ROOT,
                   capture_output=True, text=True)
summary = " / ".join((r.stdout + r.stderr).strip().splitlines()[-3:])[:400]
if r.returncode != 0 or "带冲突标记 0 个" not in r.stdout:
    log(f"{dep} 已合入，但挪基点未干净完成（rc={r.returncode}）：{summary}。停在这里，交协调者")
    sys.exit(1)
log(f"{dep} 已合入，挪基点完成：{summary}")
args = ["python3", ".agents/coord/_handoff/detach_launch.py", f".agents/coord/{tid}/supervise.out", str(ROOT), "--",
        "python3", "-u", "tools/agents/supervise.py", tid, *extra, "--from", "validate"]
p = subprocess.run(args, cwd=ROOT, capture_output=True, text=True)
log(f"已 --from validate 重起驱动 pid={p.stdout.strip()}")
