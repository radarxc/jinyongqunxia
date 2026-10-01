#!/usr/bin/env python3
"""生成"待出图总索引" assets/default/prompts/INDEX.md，并检查各提示词文件的结构。

    python3 tools/agents/build_image_index.py            # 生成 INDEX.md
    python3 tools/agents/build_image_index.py --check    # 只检查（frontmatter、输出路径、重复、占位符、INDEX 是否最新）
    python3 tools/agents/build_image_index.py --queue [--group items|maps|rig] [--json]
                                                         # 出图队列：图片尚不存在（或列在 items/REDO.md 里）的行

扫描的组（每份文件 = 一张要出的图，frontmatter 由 extract_item_prompts.py / gen_map_prompts.py / gen_rig_prompts.py 写）：
- items/<类>/<id>.md           物品图（kind: item）
- maps/region/<rg>.md, maps/*.md  地图（kind: map）
- rig/<set>/ref_<view>.md, rig/<set>/<view>/<part>.md  角色部件（kind: rig_ref / rig_part）
人物立绘不在本索引内（另有 characters/INDEX.md，由别的 agent 在出）。建筑套件与贴片已出齐，只列完成度。
"""
import argparse
import json
import re
import sys
from collections import Counter, OrderedDict
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "assets/default/prompts"
INDEX = BASE / "INDEX.md"
REDO = BASE / "items/REDO.md"
KEYS = {"item": ("asset_id", "kind", "name", "category", "grade", "output", "manifest", "size", "references", "status"),
        "map": ("asset_id", "kind", "name", "output", "manifest", "size", "references", "status"),
        "rig_ref": ("asset_id", "kind", "set", "view", "output", "manifest", "size", "references", "status"),
        "rig_part": ("asset_id", "kind", "set", "view", "part", "canvas", "pivot", "output", "manifest", "references", "status")}
PLACEHOLDER = re.compile(r"\{\{[^}]{1,60}\}\}|\{[^{}\n]{1,30}\}|TODO|待补充")
ITEM_CATS = OrderedDict([("medicine", "药物 / 补品 / 药材"), ("food", "食材 / 食品"), ("manuals", "武学秘籍"), ("weapons", "兵器"),
                         ("clothing", "衣物"), ("armor", "制式盔甲"), ("innerarmor", "内甲"), ("accessories", "护肩 / 披风 / 头饰"),
                         ("shoes", "鞋"), ("belts", "腰带"), ("hidden-weapons", "暗器")])
GRADE_ORDER = {"天": 0, "地": 1, "玄": 2, "黄": 3}


def frontmatter(f: Path):
    text = f.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return None, text
    end = text.find("\n---\n", 4)
    if end < 0:
        return None, text
    try:
        fm = yaml.safe_load(text[4:end])
    except yaml.YAMLError:
        return None, text
    return (fm if isinstance(fm, dict) else None), text[end + 5:]


def prompt_block(body: str) -> str:
    m = re.search(r"## 提示词.*?```text\n(.*?)\n```", body, re.S)
    return m.group(1) if m else ""


def redo_ids():
    ids = set()
    if REDO.exists():
        for ln in REDO.read_text(encoding="utf-8").splitlines():
            m = re.match(r"^\s*[-*]?\s*`?((?:it|eq|map|rig)_[a-z0-9_]+)`?", ln)
            if m and not ln.lstrip().startswith("#"):
                ids.add(m.group(1))
    return ids


_WT_CACHE = {}


def worktree_entry(cat, aid):
    if cat not in _WT_CACHE:
        p = ROOT / ".agents/wt" / f"ART-item-{cat}" / "assets/default/item" / str(cat) / "manifest.yaml"
        data = yaml.safe_load(p.read_text(encoding="utf-8")) if p.exists() else []
        _WT_CACHE[cat] = {e["id"]: e for e in (data or []) if isinstance(e, dict) and e.get("id")}
    return _WT_CACHE[cat].get(aid)


_MERGED_CACHE = {}


def merged_entry(fm):
    man = str(fm.get("manifest", ""))
    if man not in _MERGED_CACHE:
        p = ROOT / man
        data = yaml.safe_load(p.read_text(encoding="utf-8")) if p.exists() else []
        _MERGED_CACHE[man] = {e["id"]: e for e in (data or []) if isinstance(e, dict) and e.get("id")}
    return _MERGED_CACHE[man].get(fm.get("asset_id"))


def image_state(fm, redo):
    """图片状态：已入库 / 工作区候选 / 待重出 / 待出图。"""
    out = ROOT / str(fm.get("output", ""))
    if fm.get("asset_id") in redo:
        return "待重出"
    if out.exists():
        ent = merged_entry(fm)
        return "已通过（作者）" if ent and str(ent.get("status")) == "approved" else "已入库"
    if fm.get("kind") == "item":
        wt = ROOT / ".agents/wt" / f"ART-item-{fm.get('category')}" / str(fm.get("output", ""))
        if wt.exists():
            ent = worktree_entry(fm.get("category"), fm.get("asset_id"))
            tool = str((ent or {}).get("tool", "")) + " " + str((ent or {}).get("model", ""))
            if re.search(r"pillow|fallback|none|程序|代码", tool, re.I):
                return "待重出（候选是代码画的假图）"
            return "工作区候选"
    return "待出图"


def collect():
    rows, problems = [], []
    redo = redo_ids()
    for f in sorted(BASE.rglob("*.md")):
        rel = f.relative_to(BASE).as_posix()
        if rel.startswith("characters/") or f.name in ("INDEX.md", "GUIDE.md", "REDO.md") or rel.count("/") == 0:
            continue
        fm, body = frontmatter(f)
        if not fm or "asset_id" not in fm:
            continue  # 旧的提示词规范文件（item.md 等）没有 frontmatter，跳过
        kind = str(fm.get("kind", ""))
        if kind not in KEYS:
            problems.append(f"{rel}：kind `{kind}` 未知")
            continue
        for k in KEYS[kind]:
            if k not in fm or fm[k] in (None, ""):
                problems.append(f"{rel}：frontmatter 缺 `{k}`")
        if not str(fm.get("output", "")).startswith("assets/default/"):
            problems.append(f"{rel}：output 应在 assets/default/ 下")
        if f.stem != fm["asset_id"] and not (kind in ("map",) and fm["asset_id"].startswith("map_region_")) and kind not in ("rig_ref", "rig_part", "map"):
            problems.append(f"{rel}：文件名应为 `{fm['asset_id']}.md`")
        blk = prompt_block(body)
        if len(blk) < 200:
            problems.append(f"{rel}：`## 提示词` 代码块缺失或不足 200 字（{len(blk)}）")
        m = PLACEHOLDER.search(blk)
        if m:
            problems.append(f"{rel}：提示词里有未替换的占位符 `{m.group(0)}`")
        group = rel.split("/")[0]
        rows.append(dict(group=group, rel=rel, fm=fm, kind=kind, state=image_state(fm, redo)))
    ids = Counter(r["fm"]["asset_id"] for r in rows)
    problems += [f"asset_id 重复：{k}（{v} 次）" for k, v in ids.items() if v > 1]
    outs = Counter(str(r["fm"].get("output")) for r in rows)
    problems += [f"output 重复：{k}（{v} 次）" for k, v in outs.items() if v > 1]
    return rows, problems


def kits_table():
    lines = ["| 套件 | 建筑 | 贴片 | 历史图片重出 | 目录 |", "|---|---:|---:|---|---|"]
    bm = ROOT / "assets/default/building-map"
    for d in sorted(p for p in bm.iterdir() if p.is_dir()) if bm.exists() else []:
        ents = yaml.safe_load((d / "manifest.yaml").read_text(encoding="utf-8")) if (d / "manifest.yaml").exists() else []
        ents = [e for e in ents if isinstance(e, dict)]
        nb = sum(1 for e in ents if (d / str(e.get("file", ""))).exists())
        hist = sum(1 for e in ents if "historical" in json.dumps(e, ensure_ascii=False, default=str))
        td = ROOT / "assets/default/tile" / d.name
        nt = len(list(td.glob("*.png"))) if td.exists() else 0
        lines.append(f"| {d.name} | {nb} | {nt} | {'✓ 全部' if hist >= nb and nb else f'{hist}/{nb}'} | `assets/default/building-map/{d.name}/`、`assets/default/tile/{d.name}/` |")
    bb = ROOT / "assets/default/baseline/building-map"
    for kit in ("song_dali", "song_southern"):
        n = len(list(bb.glob(f"bld_kit_{kit}_*.png"))) if bb.exists() else 0
        if n:
            lines.append(f"| {kit}（基线，作者已审） | {n} | — | ✗ 未重出（待作者定） | `assets/default/baseline/building-map/` |")
    bt = ROOT / "assets/default/baseline/tile"
    if bt.exists():
        lines.append(f"| 通用贴片（基线 TOWN-tiles） | — | {len(list(bt.glob('*.png')))} | — | `assets/default/baseline/tile/` |")
    return lines


def render(rows):
    by_group = OrderedDict()
    for r in rows:
        by_group.setdefault(r["group"], []).append(r)
    states = Counter(r["state"] for r in rows)
    queue = [r for r in rows if r["state"].startswith(("待出图", "待重出"))]
    out = ["# 天书录 · 待出图总索引（物品 / 地图 / 角色部件）", "",
           "> 本文件由 `tools/agents/build_image_index.py` 生成，不要手改；改提示词就改各文件，改规程就改各组 `GUIDE.md`，然后重新生成。",
           "> 人物立绘另见 `characters/INDEX.md`（别的 agent 在出，不在本索引）。建筑套件与贴片已出齐，只列完成度。",
           "",
           f"提示词 **{len(rows)}** 份：" + "、".join(f"{k} {v}" for k, v in states.most_common()) + f"。**待出图队列 {len(queue)} 行**（`python3 tools/agents/build_image_index.py --queue`）。",
           "", "## 出图 agent 怎么用", "",
           "1. 先读本节与「出图位置约定」，再读目标组的 `GUIDE.md`（`items/GUIDE.md`、`maps/GUIDE.md`、`rig/GUIDE.md`），最后读每张图自己的提示词文件（frontmatter = 输出路径 / 规格 / 参考图；正文 = 要点、完整提示词、排除项、质检要点）。",
           "2. 列出能做的行：`python3 tools/agents/build_image_index.py --queue --group maps`（`--json` 给脚本用）。队列 = 图片文件尚不存在的行 + `items/REDO.md` 里作者点名重出的 ID。",
           "3. 每行：加载 frontmatter `references` 里的参考图 → 按「提示词」生成 2 张候选选 1 张（有明确缺陷再补，单轮 ≤ 4 张）→ 按 `output` 存 PNG（文件名 = asset_id 或指定名）→ 在 `manifest` 追加一条（字段见 `assets/README.md`：id、file、category、style、subject、prompt、negative、references、tool、model、created、source_path、size、sha256、`status: candidate`）→ 跑该组 GUIDE 里的检查命令。",
           "4. 不要改提示词文件和本索引；生成完一组，重新运行本脚本，状态会从「待出图」变成「已入库」。作者的审批在审批页做，`candidate` 不等于通过。",
           "", "## 出图位置约定", "",
           "| 类别 | 输出 PNG | 登记清单 | 规格 |", "|---|---|---|---|",
           "| 物品 | `assets/default/item/<类>/<物品ID>.png` | `assets/default/item/<类>/manifest.yaml` | 1536×1536（≥1024），不透明浅暖灰底 RGB(230,225,216)，单一物品、四边留白 ≥10% |",
           "| 区域地图 | `assets/default/map/regions/<rg_id>.png` | `assets/default/map/regions/manifest.yaml` | 1536×1024，北上，不透明暖纸白，无文字（标签由代码叠加） |",
           "| 全国水墨衬纸（可选） | `assets/default/map/jianghu_world/ink_base.png` | `assets/default/map/jianghu_world/manifest.yaml` | 4096×3072，与 `docs/design/map/jianghu-base.svg` 对位 |",
           "| 角色部件 | `assets/default/rig/<set>/ref_<view>.png`、`assets/default/rig/<set>/<view>/<part>.png` | `assets/default/rig/<set>/manifest.yaml`（`tianshu-rig.v1`，由 `tools/rig/make_parts.py` 写） | 透明 RGBA，256 px/m，画布见各文件 |",
           "| 建筑 / 贴片（已出齐） | `assets/default/building-map/<kit>/`、`assets/default/tile/<kit>/` | 各目录 `manifest.yaml` | 45° 俯视 2:1，透明 RGBA |",
           "",
           "运行时怎么找到这些图：根 `CLAUDE.md`「素材接入」与 `apps/game/CLAUDE.md`「素材」一节——构建时从 `assets/default/<类别>/` 按 manifest 复制到 `apps/game/public/assets/default/`，运行时只认 manifest 里 `status` 不为 `rejected` 的条目。",
           "", "## 待出图队列", ""]
    if queue:
        out += ["| 组 | asset_id | 名称 | 输出 | 状态 | 提示词 |", "|---|---|---|---|---|---|"]
        for r in queue:
            fm = r["fm"]
            out.append(f"| {r['group']} | `{fm['asset_id']}` | {fm.get('name', '')} | `{fm.get('output', '')}` | {r['state']} | [{Path(r['rel']).name}]({r['rel']}) |")
    else:
        out.append("（空：所有提示词对应的图都已入库。）")
    # 物品
    items = [r for r in rows if r["kind"] == "item"]
    out += ["", "## 物品（11 类，名录 170 项）", "",
            "每张图的提示词在各文件「提示词」节。「已入库」= 图在 `assets/default/item/` 下（作者尚未审批，manifest `status: candidate`）；「工作区候选」= 图在任务工作区还没合入；作者要重出的，把 ID 写进 `items/REDO.md` 再重建索引即可进队列。", ""]
    for cat, cname in ITEM_CATS.items():
        rs = sorted([r for r in items if r["fm"].get("category") == cat], key=lambda r: (GRADE_ORDER.get(str(r["fm"].get("grade", ""))[:1], 9), r["fm"]["asset_id"]))
        if not rs:
            continue
        st = Counter(r["state"] for r in rs)
        out += [f"### {cname}（{len(rs)}）· " + "、".join(f"{k} {v}" for k, v in st.most_common()), "",
                "| # | 名称 | ID | 品阶 | 子类 | 图 | 提示词 | 来源 |", "|---:|---|---|---|---|---|---|---|"]
        for i, r in enumerate(rs, 1):
            fm = r["fm"]
            out.append(f"| {i} | {fm.get('name', '')} | `{fm['asset_id']}` | {fm.get('grade', '')} | {fm.get('subcategory', '')} | {r['state']} | [{Path(r['rel']).name}]({r['rel']}) | {str(fm.get('prompt_source', '')).split('（')[0].split(':')[0]} |")
        out.append("")
    # 地图
    maps = [r for r in rows if r["kind"] == "map"]
    if maps:
        out += ["## 地图", "",
                "全国导航图是 `tools/map/render_map.py` 从 design/19 数据生成的 SVG（14 个时代图层），**不是出图任务**。要画的是 30 个区域的水墨局部图（类比作者已审的大理苍洱局部图）；全国水墨衬纸为可选项。", "",
                "| # | 名称 | asset_id | 输出 | 图 | 提示词 |", "|---:|---|---|---|---|---|"]
        for i, r in enumerate(sorted(maps, key=lambda r: (r["fm"].get("map_kind", ""), r["fm"]["asset_id"])), 1):
            fm = r["fm"]
            out.append(f"| {i} | {fm.get('name', '')} | `{fm['asset_id']}` | `{fm.get('output', '')}` | {r['state'] if fm.get('status') != 'optional' else r['state'] + '（可选）'} | [{Path(r['rel']).name}]({r['rel']}) |")
        out.append("")
    # rig
    rig = [r for r in rows if r["kind"] in ("rig_ref", "rig_part")]
    if rig:
        out += ["## 角色分层部件（AR-22，tech/09）", "",
                "两套标准体型各 3 张全身参考图 + 13 部件 × 3 视图 = 42 份。**顺序**：先出该视图的全身参考图，再以它为唯一图片输入逐部件出图；全部出完跑 `python3 tools/rig/make_parts.py assets/default/rig/<set>` 裁边定枢轴写 manifest，`python3 tools/rig/preview.py assets/default/rig/<set> --out assets/default/rig/<set>/preview.png` 看姿势条带。是否现在就出由作者定。", "",
                "| 体型集 | 视图 | 参考图 | 部件（13） | 图 |", "|---|---|---|---|---|"]
        for set_id in ("male_std", "female_std"):
            for view in ("front34", "back34", "side"):
                ref = [r for r in rig if r["kind"] == "rig_ref" and r["fm"].get("set") == set_id and r["fm"].get("view") == view]
                parts = [r for r in rig if r["kind"] == "rig_part" and r["fm"].get("set") == set_id and r["fm"].get("view") == view]
                st = Counter(r["state"] for r in parts)
                reflink = f"[ref_{view}.md]({ref[0]['rel']})" if ref else "—"
                out.append(f"| {set_id} | {view} | {reflink}（{ref[0]['state'] if ref else '—'}） | " + "、".join(f"[{r['fm']['part']}]({r['rel']})" for r in parts) + " | " + "、".join(f"{k} {v}" for k, v in st.most_common()) + " |")
        out.append("")
    out += ["## 建筑套件与贴片（已出齐，只列完成度）", ""] + kits_table() + ["",
            "全部 11 套年代套件均已按历史图片重出并合入；城镇合成图由 `tools/town/` 代码用这些素材拼装，不是出图任务。基线两套宋套件是否也按历史图片重出，待作者定（要做就复制 `tools/agents/prompts/KIT.md` 的做法）。", ""]
    return "\n".join(out)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--queue", action="store_true")
    ap.add_argument("--group", help="items / maps / rig")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    rows, problems = collect()
    if a.queue:
        q = [r for r in rows if r["state"].startswith(("待出图", "待重出")) and (not a.group or r["group"] == a.group)]
        if a.json:
            print(json.dumps([dict(group=r["group"], asset_id=r["fm"]["asset_id"], name=r["fm"].get("name"), output=r["fm"].get("output"),
                                   manifest=r["fm"].get("manifest"), prompt=f"assets/default/prompts/{r['rel']}", state=r["state"],
                                   order=r["fm"].get("order", 1)) for r in q], ensure_ascii=False, indent=2))
        else:
            for r in q:
                print("\t".join([r["group"], r["fm"]["asset_id"], str(r["fm"].get("name")), r["fm"].get("output", ""), f"assets/default/prompts/{r['rel']}"]))
        print(f"共 {len(q)} 行待出图" + (f"（{a.group}）" if a.group else ""), file=sys.stderr)
        return 0
    text = render(rows)
    if a.check:
        if not INDEX.exists() or INDEX.read_text(encoding="utf-8") != text:
            problems.append("INDEX.md 不是最新（重新运行本脚本生成）")
    else:
        INDEX.write_text(text, encoding="utf-8")
        print(f"已生成 {INDEX.relative_to(ROOT)}：{len(rows)} 份提示词")
    for p in problems[:60]:
        print("✘ " + p)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
