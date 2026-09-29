#!/usr/bin/env python3
"""调度器校验辅助：NR3 单元的跨武学 ≥80% 相似路线对是否都已处理。

用法（在工作区根目录运行）：
    python3 tools/agents/check_nr3_unit.py <单元>      # 单元：shaolin … gulong 或 bulu

读取 `tools/agents/nr3/pairs.json`（nr3_assign.py 生成的分派快照），对本单元名下每一对：
- 已不再 ≥80%：视为"已改开"；
- 仍 ≥80%：本单元图鉴里必须有一行同时写出两条路线 ID，且该行位于标题含"4.3.4"或"高相似"的小节内（理由条目）。
另查：当前涉及本单元路线、但快照里没有的 ≥80% 配对（本任务新造的相似）必须为 0。
"""
import json
import re
import subprocess
import sys
from pathlib import Path

CAT = Path("docs/design/catalog")


def unit_files(unit: str) -> list:
    if unit == "bulu":
        return sorted(CAT.glob("skills-bulu-*.md"))
    return [CAT / f"skills-{unit}.md"]


def unit_of(catalog: str) -> str:
    return "bulu" if catalog.startswith("bulu-") else catalog


def overlap_bp(p: dict) -> int:
    return (10000 * p["shared_count"]) // p["denominator"]


def pair_key(p: dict) -> str:
    a, b = sorted([p["left"]["route_id"], p["right"]["route_id"]])
    return f"{a}|{b}"


def justified_keys(files: list) -> set:
    found = set()
    head = ""
    for f in files:
        for line in f.read_text(encoding="utf-8").splitlines():
            if line.startswith("#"):
                head = line
                continue
            if "4.3.4" not in head and "高相似" not in head:
                continue
            ids = sorted(set(re.findall(r"mfr_[a-z0-9_]+", line)))
            for i in range(len(ids)):
                for j in range(i + 1, len(ids)):
                    found.add(f"{ids[i]}|{ids[j]}")
    return found


def main() -> int:
    if len(sys.argv) != 2:
        print("用法：check_nr3_unit.py <单元>")
        return 2
    unit = sys.argv[1]
    snap_path = Path("tools/agents/nr3/pairs.json")
    snap = json.loads(snap_path.read_text(encoding="utf-8"))
    if unit not in snap:
        print(f"快照里没有单元 {unit}")
        return 2
    mine = set(snap[unit])
    all_snap = {k for v in snap.values() for k in v}
    proc = subprocess.run([sys.executable, "tools/lint/check_skill_catalogs.py", "--diversity", "--json"],
                          capture_output=True, text=True)
    data = json.loads(proc.stdout)
    cur = {pair_key(p): p for p in data["diversity"]["pairs"] if overlap_bp(p) >= 8000}
    just = justified_keys(unit_files(unit))
    resolved = [k for k in mine if k not in cur]
    justified = [k for k in mine if k in cur and k in just]
    missing = sorted(k for k in mine if k in cur and k not in just)
    new = sorted(k for k, p in cur.items()
                 if k not in all_snap and unit in (unit_of(p["left"]["catalog"]), unit_of(p["right"]["catalog"])))
    print(f"单元 {unit}：名下 {len(mine)} 对；已改开 {len(resolved)}，已写理由 {len(justified)}，未处理 {len(missing)}；本任务新造 ≥80% 配对 {len(new)}")
    for k in missing[:40]:
        print("  未处理：", k, cur[k]["shared_count"], "/", cur[k]["denominator"])
    for k in new[:40]:
        print("  新造：", k, cur[k]["shared_count"], "/", cur[k]["denominator"])
    return 1 if (missing or new) else 0


if __name__ == "__main__":
    sys.exit(main())
