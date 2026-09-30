#!/usr/bin/env python3
"""NR4 单元验收：本单元图鉴的阴阳性质问题清零（AR-18 新口径）。

对给定图鉴运行 `check_skill_catalogs.py --delivery`，读每册汇总行里的三项计数，
全部为 0 才通过：
  nature_conflicts         路线性质与武学性质冲突（21 §2.4）
  inner_missing_meridians  内功缺 `inner.meridians`（主修经脉）
  inner_nature_conflicts   内功声明性质与按主修经脉推出的性质不一致（05 §5.3.1）

  python3 tools/agents/check_nr4_unit.py docs/design/catalog/skills-yitian.md [...]
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
KEYS = ("nature_conflicts", "inner_missing_meridians", "inner_nature_conflicts")


def main():
    files = sys.argv[1:]
    if not files:
        sys.exit("用法：check_nr4_unit.py <图鉴路径> [...]")
    r = subprocess.run([sys.executable, "tools/lint/check_skill_catalogs.py", "--delivery", "--details", *files],
                       cwd=ROOT, capture_output=True, text=True)
    out = r.stdout + r.stderr
    rows = [l for l in out.splitlines() if re.match(r"^[\w-]+: delivery_routes=", l)]
    if not rows:
        print(out[-2000:])
        sys.exit("✘ 没有读到各册的 delivery 汇总行")
    bad = 0
    for l in rows:
        cat = l.split(":", 1)[0]
        vals = {k: int(m.group(1)) for k in KEYS if (m := re.search(rf"\b{k}=(\d+)", l))}
        miss = [k for k in KEYS if k not in vals]
        if miss:
            print(f"✘ {cat}：汇总行缺少 {', '.join(miss)}")
            bad += 1
            continue
        flag = "✔" if not any(vals.values()) else "✘"
        bad += flag == "✘"
        print(f"{flag} {cat}：" + "；".join(f"{k}={v}" for k, v in vals.items()))
    if bad:
        print("\n命中明细：")
        for l in out.splitlines():
            if l.lstrip().startswith(("DELIVERY rule=nature-conflict", "INNER_NATURE", "INNER_MISSING")):
                print(l)
        sys.exit(1)


if __name__ == "__main__":
    main()
