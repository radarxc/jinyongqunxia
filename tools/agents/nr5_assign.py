#!/usr/bin/env python3
"""调度器辅助：把"显式普通路线"新口径下的完全相同 / ≥80% 相似路线对分派给 NR5 各任务（每对只归一个任务）。

LINT-outlets 之后 `tools/agents/check_route_unique_for.py --all --json` 把显式写出的普通路线也纳入了
21 §4.3.4 的全仓比较（绝招 vs 普通、普通 vs 普通）。本脚本读它的输出并分派：

    python3 tools/agents/nr5_assign.py            # 只打印统计
    python3 tools/agents/nr5_assign.py --write    # 生成 tools/agents/nr5/<单元>.md 与 pairs.json

单元：11 本门派图鉴各为一个单元；14 本补录图鉴按书号分四组（bulu-a 01–03、bulu-b 04–06、bulu-c 07–10、bulu-d 11–14）。
归属：绝招 vs 普通 → 归普通路线所在单元（绝招路线已在 NR3 定稿，不动）；普通 vs 普通 → 同单元归该单元，
跨单元按"当前负载较少的一方"贪心分派，负载相同取固定顺序靠后的单元。完全相同的配对先分派。
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

ORDER = ["shaolin", "daojia", "general", "wujue", "xiaoyao", "yitian", "xiake-bixue", "wuyue", "kangxi",
         "qianlong", "gulong", "bulu-a", "bulu-b", "bulu-c", "bulu-d"]
BULU_GROUPS = {"bulu-a": ("01", "02", "03"), "bulu-b": ("04", "05", "06"),
               "bulu-c": ("07", "08", "09", "10"), "bulu-d": ("11", "12", "13", "14")}
CAT = Path("docs/design/catalog")
OUT = Path("tools/agents/nr5")


def unit_of(catalog: str) -> str:
    if catalog.startswith("bulu-"):
        no = catalog.split("-")[1]
        for g, nos in BULU_GROUPS.items():
            if no in nos:
                return g
    return catalog


def unit_files(unit: str) -> list:
    if unit in BULU_GROUPS:
        return sorted(f for no in BULU_GROUPS[unit] for f in CAT.glob(f"skills-bulu-{no}-*.md"))
    return [CAT / f"skills-{unit}.md"]


def load_pairs() -> list:
    proc = subprocess.run([sys.executable, "tools/agents/check_route_unique_for.py", "--all", "--json"],
                          capture_output=True, text=True)
    data = json.loads(proc.stdout)
    exact = set()
    for g in data.get("exact_groups", []):
        ids = sorted(r["route_id"] for r in g["routes"])
        for i in range(len(ids)):
            for j in range(i + 1, len(ids)):
                exact.add(f"{ids[i]}|{ids[j]}")
    pairs = [p for p in data["pairs"] if p["overlap_bp"] >= 8000 or p.get("exact")]
    for p in pairs:
        p["is_exact"] = bool(p.get("exact")) or pair_key(p) in exact
    return pairs


def pair_key(p: dict) -> str:
    a, b = sorted([p["left"]["route_id"], p["right"]["route_id"]])
    return f"{a}|{b}"


def assign(pairs: list) -> dict:
    load = {u: 0 for u in ORDER}
    owned = {u: [] for u in ORDER}

    def give(owner, p):
        load[owner] += 1
        sides = [p["left"], p["right"]]
        cands = [s for s in sides if unit_of(s["catalog"]) == owner]
        mine = ([s for s in cands if s["kind"] == "normal"] or cands)[0]  # 本单元一侧，优先普通路线
        other = sides[1] if mine is sides[0] else sides[0]
        owned[owner].append({"key": pair_key(p), "bp": p["overlap_bp"], "shared": p["shared_count"],
                             "den": p["denominator"], "exact": p["is_exact"], "type": p["pair_type"],
                             "mine": mine, "other": other,
                             "intra": unit_of(p["left"]["catalog"]) == unit_of(p["right"]["catalog"])})

    order = sorted(pairs, key=lambda q: (not q["is_exact"], -q["overlap_bp"], pair_key(q)))
    for p in order:  # 绝招 vs 普通：归普通一侧
        kinds = (p["left"]["kind"], p["right"]["kind"])
        if kinds == ("ultimate", "normal"):
            give(unit_of(p["right"]["catalog"]), p)
        elif kinds == ("normal", "ultimate"):
            give(unit_of(p["left"]["catalog"]), p)
    for p in order:  # 普通 vs 普通（以及万一出现的绝招 vs 绝招）
        kinds = (p["left"]["kind"], p["right"]["kind"])
        if kinds in (("ultimate", "normal"), ("normal", "ultimate")):
            continue
        ul, ur = unit_of(p["left"]["catalog"]), unit_of(p["right"]["catalog"])
        owner = ul if ul == ur else min((ul, ur), key=lambda u: (load[u], -ORDER.index(u)))
        give(owner, p)
    return owned


def fmt(r: dict) -> str:
    kind = "绝" if r["kind"] == "ultimate" else "普"
    return f"`{r['route_id']}`（{kind}，`{r['skill_id']}` / {Path(r['source']).name}:{r['line']}）"


def render(unit: str, rows: list) -> str:
    out = [f"# NR5 · {unit} 名下的路线相似配对（显式普通路线新口径，{len(rows)} 对）", "",
           "由 `tools/agents/nr5_assign.py` 生成。每对只归一个任务：本表\"本单元路线\"一侧由本任务处理（改开或写理由）；",
           "\"另一侧\"不要改（绝招路线已定稿，或属于别的并行任务）。同单元的普通 vs 普通配对任选一侧处理。",
           "\"完全相同\"一列为\"是\"的配对必须改开，不能写理由。", "",
           "| # | overlapBp | 共享/分母 | 完全相同 | 本单元路线 | 另一侧路线 | 同单元 |",
           "|---:|---:|---:|---|---|---|---|"]
    for i, r in enumerate(rows, 1):
        out.append(f"| {i} | {r['bp']} | {r['shared']}/{r['den']} | {'是' if r['exact'] else ''} | {fmt(r['mine'])} | "
                   f"{fmt(r['other'])} | {'是' if r['intra'] else ''} |")
    return "\n".join(out) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    a = ap.parse_args()
    pairs = load_pairs()
    owned = assign(pairs)
    total = sum(len(v) for v in owned.values())
    print(f"完全相同或 ≥80% 配对 {len(pairs)}（分派 {total}）")
    for u in ORDER:
        ex = sum(1 for r in owned[u] if r["exact"])
        full = sum(1 for r in owned[u] if r["bp"] >= 10000)
        routes = len({r["mine"]["route_id"] for r in owned[u]})
        print(f"  {u:12s} {len(owned[u]):4d} 对（完全相同 {ex}，10000 bp {full}；涉及本单元路线 {routes} 条）")
    if a.write:
        OUT.mkdir(parents=True, exist_ok=True)
        for u in ORDER:
            (OUT / f"{u}.md").write_text(render(u, owned[u]), encoding="utf-8")
        snap = {"units": {u: [r["key"] for r in owned[u]] for u in ORDER},
                "exact": sorted(r["key"] for u in ORDER for r in owned[u] if r["exact"])}
        (OUT / "pairs.json").write_text(json.dumps(snap, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print(f"已写入 {OUT}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
