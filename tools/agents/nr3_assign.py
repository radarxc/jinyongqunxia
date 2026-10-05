#!/usr/bin/env python3
"""调度器辅助：把跨武学 ≥80% 相似路线对分派给 NR3 各任务（每对只归一个任务处理）。

用法（在仓库根目录运行）：
    python3 tools/agents/nr3_assign.py            # 只打印统计
    python3 tools/agents/nr3_assign.py --write    # 生成 tools/agents/nr3/<单元>.md 与 pairs.json

单元：11 本门派图鉴各为一个单元；14 本补录图鉴合为 "bulu" 一个单元。
归属：同单元内的配对归该单元；跨单元的配对按"当前负载较少的一方"贪心分派，
负载相同时按固定顺序取靠后的单元（补录最后，优先由补录一侧让路）。
配对按 overlapBp 从高到低处理，保证完全重合（10000 bp）的配对先被均衡分配。
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

ORDER = ["shaolin", "daojia", "general", "wujue", "xiaoyao", "yitian",
         "xiake-bixue", "wuyue", "kangxi", "qianlong", "gulong", "bulu"]


def unit_of(catalog: str) -> str:
    return "bulu" if catalog.startswith("bulu-") else catalog


def overlap_bp(p: dict) -> int:
    return (10000 * p["shared_count"]) // p["denominator"]


def load_pairs() -> list:
    proc = subprocess.run(
        [sys.executable, "tools/lint/check_skill_catalogs.py", "--diversity", "--json"],
        capture_output=True, text=True)
    data = json.loads(proc.stdout)
    return [p for p in data["diversity"]["pairs"] if overlap_bp(p) >= 8000]


def pair_key(p: dict) -> str:
    a, b = sorted([p["left"]["route_id"], p["right"]["route_id"]])
    return f"{a}|{b}"


def assign(pairs: list) -> dict:
    load = {u: 0 for u in ORDER}
    owned = {u: [] for u in ORDER}
    for p in sorted(pairs, key=lambda q: (-overlap_bp(q), pair_key(q))):
        ul, ur = unit_of(p["left"]["catalog"]), unit_of(p["right"]["catalog"])
        if ul == ur:
            owner = ul
        else:
            owner = min((ul, ur), key=lambda u: (load[u], -ORDER.index(u)))
        load[owner] += 1
        mine, other = (p["left"], p["right"]) if unit_of(p["left"]["catalog"]) == owner else (p["right"], p["left"])
        owned[owner].append({"key": pair_key(p), "bp": overlap_bp(p), "shared": p["shared_count"],
                             "den": p["denominator"], "mine": mine, "other": other,
                             "intra": ul == ur})
    return owned


def render(unit: str, rows: list) -> str:
    out = [f"# NR3 · {unit} 名下的跨武学高相似路线对（{len(rows)} 对）", "",
           "由 `tools/agents/nr3_assign.py` 生成。每对只归一个任务：本表的\"本单元路线\"一侧由本任务处理（改开或写理由）；",
           "\"另一侧\"不要改（它可能属于别的任务）。同单元配对两侧都在本单元，任选一侧处理。", "",
           "| # | overlapBp | 共享/分母 | 本单元路线（武学 / 图鉴:行） | 另一侧路线（武学 / 图鉴:行） | 同单元 |",
           "|---:|---:|---:|---|---|---|"]
    for i, r in enumerate(rows, 1):
        m, o = r["mine"], r["other"]
        out.append(f"| {i} | {r['bp']} | {r['shared']}/{r['den']} | `{m['route_id']}`（`{m['skill_id']}` / {m['source']}:{m['line']}） | "
                   f"`{o['route_id']}`（`{o['skill_id']}` / {o['source']}:{o['line']}） | {'是' if r['intra'] else ''} |")
    return "\n".join(out) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    a = ap.parse_args()
    pairs = load_pairs()
    owned = assign(pairs)
    total = sum(len(v) for v in owned.values())
    print(f"≥80% 配对 {len(pairs)}（分派 {total}）")
    for u in ORDER:
        full = sum(1 for r in owned[u] if r["bp"] >= 10000)
        print(f"  {u:12s} {len(owned[u]):4d} 对（其中 10000 bp {full}）")
    if a.write:
        d = Path("tools/agents/nr3")
        d.mkdir(parents=True, exist_ok=True)
        for u in ORDER:
            (d / f"{u}.md").write_text(render(u, owned[u]), encoding="utf-8")
        snap = {u: [r["key"] for r in owned[u]] for u in ORDER}
        (d / "pairs.json").write_text(json.dumps(snap, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print(f"已写入 {d}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
