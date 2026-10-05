#!/usr/bin/env python3
"""调度器校验辅助：NR5 单元名下的路线相似配对（显式普通路线新口径）是否都已处理。

用法（在工作区根目录运行）：
    python3 tools/agents/check_nr5_unit.py <单元>      # 单元见 nr5_assign.py 的 ORDER

读取 `tools/agents/nr5/pairs.json`（nr5_assign.py 生成的分派快照），用
`tools/agents/check_route_unique_for.py --all --json` 重新计算当前配对，对本单元名下每一对：
- 已不再 ≥80%（也不再完全相同）：视为"已改开"；
- 仍完全相同：必须改开，写理由不算（21 §4.3.4 第 2 条）；
- 仍 ≥80%：本单元图鉴里必须有一行同时写出两条路线 ID，且该行位于标题含"4.3.4"或"高相似"的小节内（理由条目）。
另查：当前涉及本单元路线、但快照里没有的完全相同 / ≥80% 配对（本任务新造的相似）必须为 0。
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import nr5_assign as A  # noqa: E402


def justified_keys(files: list) -> set:
    found = set()
    for f in files:
        head = ""
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
        print("用法：check_nr5_unit.py <单元>")
        return 2
    unit = sys.argv[1]
    snap = json.loads((A.OUT / "pairs.json").read_text(encoding="utf-8"))
    if unit not in snap["units"]:
        print(f"快照里没有单元 {unit}")
        return 2
    mine = set(snap["units"][unit])
    all_snap = {k for v in snap["units"].values() for k in v}
    cur = {A.pair_key(p): p for p in A.load_pairs()}
    just = justified_keys(A.unit_files(unit))
    resolved = [k for k in mine if k not in cur]
    exact_left = sorted(k for k in mine if k in cur and cur[k]["is_exact"])
    justified = [k for k in mine if k in cur and not cur[k]["is_exact"] and k in just]
    missing = sorted(k for k in mine if k in cur and not cur[k]["is_exact"] and k not in just)
    new = sorted(k for k, p in cur.items()
                 if k not in all_snap and unit in (A.unit_of(p["left"]["catalog"]), A.unit_of(p["right"]["catalog"])))
    print(f"单元 {unit}：名下 {len(mine)} 对；已改开 {len(resolved)}，已写理由 {len(justified)}，"
          f"仍完全相同 {len(exact_left)}，未处理 {len(missing)}；本任务新造配对 {len(new)}")
    for k in exact_left[:40]:
        print("  仍完全相同（必须改开）：", k)
    for k in missing[:60]:
        print("  未处理：", k, cur[k]["shared_count"], "/", cur[k]["denominator"])
    for k in new[:60]:
        print("  新造：", k, cur[k]["shared_count"], "/", cur[k]["denominator"], "完全相同" if cur[k]["is_exact"] else "")
    return 1 if (exact_left or missing or new) else 0


if __name__ == "__main__":
    sys.exit(main())
