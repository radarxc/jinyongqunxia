#!/usr/bin/env python3
"""调度器校验辅助：指定图鉴中的绝招路线不得与任何其他武学的路线完全相同。

用法（在工作区根目录运行）：
    python3 tools/agents/check_route_unique_for.py docs/design/catalog/skills-bulu-05-xiaoao.md ...

运行 `tools/lint/check_skill_catalogs.py --diversity --json`（全量），只看"完全相同组"中
是否含有来自指定文件的路线。别处既有的雷同（交给 NR1 / NR2）不影响本校验。
指定文件不存在时视为本任务未新建该图鉴，直接通过。
"""
import json
import subprocess
import sys
from pathlib import Path


def main() -> int:
    targets = [Path(p) for p in sys.argv[1:]]
    if not targets:
        print("用法：check_route_unique_for.py <图鉴文件> [...]")
        return 2
    present = {p.name for p in targets if p.exists()}
    if not present:
        print("指定图鉴均不存在（本任务未新建），跳过。")
        return 0
    proc = subprocess.run(
        [sys.executable, "tools/lint/check_skill_catalogs.py", "--diversity", "--json"],
        capture_output=True, text=True,
    )
    try:
        data = json.loads(proc.stdout)
    except json.JSONDecodeError:
        print("图鉴检查没有输出 JSON：")
        print((proc.stderr or proc.stdout)[-2000:])
        return 2
    bad = []
    for group in data.get("diversity", {}).get("exact_groups", []):
        routes = group.get("routes", [])
        mine = [r for r in routes if Path(r.get("source", "")).name in present]
        if mine:
            others = [f'{r.get("source")}:{r.get("line")} {r.get("route_id")}' for r in routes if r not in mine]
            for r in mine:
                bad.append(f'{r.get("source")}:{r.get("line")} {r.get("route_id")} 与 {"; ".join(others) or "本文件其他路线"} 完全相同')
    for line in bad[:60]:
        print("完全相同：", line)
    print(f"指定图鉴中与其他武学完全相同的绝招路线：{len(bad)}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
