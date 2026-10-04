#!/usr/bin/env python3
"""AR-77 衣物与护甲扩充总表校验（开发监督 10-03 写，DES-apparel-catalog / CONTENT-apparel-data 的验收命令）。

    python3 tools/agents/check_apparel_catalog.py docs/design/catalog/apparel-master.yaml
    python3 tools/agents/check_apparel_catalog.py docs/design/catalog/apparel-master.yaml --landed 1

只查结构与覆盖（协调者 AR-77 口径），不判内容取舍：
- 必填字段、ID 格式与唯一、不与现有名录（docs/design/catalog/items-*.md）撞 ID / 撞名；existing 引用须真实存在；
- total 与 batches 和新条目一致，每批 ≤ 120；
- 六档品阶映射单调、地上 ≤ 9；
- 八个朝代：男装每档 ≥ 3 色且含白、玄；女装每档 ≥ 2 色；头饰 / 腰带 / 鞋分男女六档齐；披风三档齐；
- 作者点名的铠甲与特殊衣物都在（新条目或 existing 引用）；槽位、名录与子类一致。
--landed N：第 N 批每件已落进名录、content/items/<id>.yaml 与 assets/default/prompts/items/*/<id>.md；
  男装 / 女装按「同朝代、同性别、同档」成组：每组恰一件底图（提示词无 edit_from），其余换色件 edit_from 指向本组底图，
  且第一张参考图是底图（协调者 10-03 23:4x：同款换色上传底图只改主色）。
"""
import argparse
import re
import sys
from collections import defaultdict
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
CATALOG_DIR = ROOT / "docs/design/catalog"
DYNASTIES = ["春秋", "唐", "北宋", "南宋", "元", "明", "明末", "清"]
SIX = ["黄", "玄下", "玄上", "地下", "地中", "地上"]
CAPE = ["黄", "玄", "地"]
ARMOR_NAMES = ["护心镜", "皮甲", "饕餮盔", "饕餮面甲", "锁子甲", "筒袖铠", "明光铠", "细鳞甲", "盆领铁甲", "步人甲", "山文甲"]
SPECIAL_NAMES = ["天师袍", "乌蚕衣", "虎皮衣", "玉莲衣"]
REQUIRED = ["id", "name", "category", "catalog", "sub", "slot", "tier", "grade", "dynasty", "gender",
            "color", "values", "source", "form", "batch"]
SLOTS = {"男装": {"body"}, "女装": {"body"}, "门派服": {"body"}, "特殊衣物": {"body", "innerBody"},
         "铠甲": {"body", "innerBody", "head", "hands", "shoulder"}, "头饰": {"head"}, "腰带": {"waist"},
         "鞋": {"feet"}, "披风": {"cape"}}
CATALOGS = {"男装": {"items-clothing.md"}, "女装": {"items-clothing.md"}, "门派服": {"items-clothing.md"},
            "特殊衣物": {"items-clothing.md", "items-innerarmor.md"},
            "铠甲": {"items-armor.md", "items-innerarmor.md", "items-accessories.md"},
            "头饰": {"items-accessories.md"}, "腰带": {"items-belts.md"}, "鞋": {"items-shoes.md"},
            "披风": {"items-accessories.md"}}
ROW = re.compile(r"^\|\s*`?((?:eq|it)_[a-z0-9_]+)`?\s*\|\s*([^|]+?)\s*\|")


def existing_catalog():
    ids, names = {}, {}
    for p in sorted(CATALOG_DIR.glob("items-*.md")):
        for line in p.read_text(encoding="utf-8").splitlines():
            m = ROW.match(line)
            if m:
                ids[m.group(1)] = p.name
                names[re.sub(r"[`*]", "", m.group(2)).strip()] = m.group(1)
    return ids, names


def prompt_frontmatter(item_id):
    fs = sorted((ROOT / "assets/default/prompts/items").glob(f"*/{item_id}.md"))
    if not fs:
        return None
    m = re.match(r"^---\n(.*?)\n---\n", fs[0].read_text(encoding="utf-8"), re.S)
    return (yaml.safe_load(m.group(1)) or {}) if m else {}


def recolor_problems(new, batch_no):
    """同款换色：每组恰一件底图，其余 edit_from 指向它、第一张参考图是底图。"""
    key = lambda i: (i.get("category"), i.get("dynasty"), i.get("gender"), i.get("tier"))
    groups = defaultdict(list)
    for i in new:
        if i.get("category") in ("男装", "女装"):
            groups[key(i)].append(i)
    bad = []
    for k, members in groups.items():
        if not any(i.get("batch") == batch_no for i in members):
            continue
        present = [(i, prompt_frontmatter(i["id"])) for i in members]
        present = [(i, fm) for i, fm in present if fm is not None]
        bases = [i["id"] for i, fm in present if not fm.get("edit_from")]
        if len(bases) != 1:
            bad.append(f"{'·'.join(map(str, k))} 应恰有一件底图（无 edit_from），现在 {bases}")
            continue
        base = next(i for i in members if i["id"] == bases[0])
        for i, fm in present:
            if i["id"] == base["id"]:
                continue
            if fm.get("edit_from") != base["id"]:
                bad.append(f"{i['id']} edit_from={fm.get('edit_from')}，应为本组底图 {base['id']}")
            refs = fm.get("references") or []
            first = str(refs[0].get("path", "")) if refs and isinstance(refs[0], dict) else ""
            if base["id"] not in first:
                bad.append(f"{i['id']} 第一张参考图应是底图 {base['id']}，现在 {first or '无'}")
    return bad


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("master")
    ap.add_argument("--landed", type=int)
    a = ap.parse_args()
    doc = yaml.safe_load(Path(a.master).read_text(encoding="utf-8"))
    bad = []
    if not isinstance(doc, dict) or doc.get("schema") != "apparel-catalog.v1":
        print("schema 应为 apparel-catalog.v1")
        return 1
    items = doc.get("items") or []
    new = [i for i in items if isinstance(i, dict) and "existing" not in i]
    refs = [i for i in items if isinstance(i, dict) and "existing" in i]
    cat_ids, cat_names = existing_catalog()
    if a.landed is None:
        bad += [f"existing 引用不存在：{r['existing']}" for r in refs if r["existing"] not in cat_ids]
    seen = set()
    for i in new:
        tag = i.get("id") or i.get("name") or "?"
        miss = [k for k in REQUIRED if i.get(k) in (None, "", [], {})]
        if miss:
            bad.append(f"{tag} 缺字段 {miss}")
            continue
        if not re.fullmatch(r"eq_[a-z0-9_]+", i["id"]):
            bad.append(f"{tag} ID 格式不对")
        if i["id"] in seen:
            bad.append(f"{tag} ID 重复")
        seen.add(i["id"])
        if a.landed is None and i["id"] in cat_ids:
            bad.append(f"{tag} 与现有名录 {cat_ids[i['id']]} 撞 ID（已有条目请用 existing 引用）")
        if a.landed is None and i["name"] in cat_names:
            bad.append(f"{tag} 与现有条目 {cat_names[i['name']]} 撞名")
        c = i["category"]
        if c not in SLOTS:
            bad.append(f"{tag} category 不在 {list(SLOTS)}")
            continue
        if i["slot"] not in SLOTS[c] or i["catalog"] not in CATALOGS[c]:
            bad.append(f"{tag} 槽位 / 名录与 {c} 不符：{i['slot']} / {i['catalog']}")
        if i["catalog"] == "items-accessories.md":
            want = "cape" if str(i["sub"]).startswith("披风") else "shoulder" if str(i["sub"]).startswith("护肩") else "head"
            if i["slot"] != want:
                bad.append(f"{tag} 配饰名录里子类「{i['sub']}」会生成 {want} 槽，与 slot={i['slot']} 不符")
        if i["dynasty"] not in DYNASTIES + ["通用"] or i["gender"] not in ("男", "女", "通用"):
            bad.append(f"{tag} 朝代 / 性别取值不对")
        if not isinstance(i["grade"], int) or not 1 <= i["grade"] <= 12 or not isinstance(i["batch"], int):
            bad.append(f"{tag} grade 应为 1–12 整数、batch 应为整数")
    # 总数与分批
    per_batch = defaultdict(int)
    for i in new:
        if isinstance(i.get("batch"), int):
            per_batch[i["batch"]] += 1
    if doc.get("total") != len(new):
        bad.append(f"total={doc.get('total')} 与新条目 {len(new)} 不符")
    declared = {int(k): v for k, v in (doc.get("batches") or {}).items()}
    if declared != dict(per_batch):
        bad.append(f"batches 声明 {declared} 与实际 {dict(per_batch)} 不符")
    if sorted(per_batch) != list(range(1, len(per_batch) + 1)):
        bad.append(f"批号应从 1 连续编号：{sorted(per_batch)}")
    bad += [f"第 {b} 批 {n} 件，超过 120" for b, n in per_batch.items() if n > 120]
    # 品阶映射
    gm = doc.get("gradeMap") or {}
    if [k for k in SIX if not isinstance(gm.get(k), int)] or any(gm[SIX[k]] >= gm[SIX[k + 1]] for k in range(5)) \
            or gm.get("地上", 99) > 9:
        bad.append(f"gradeMap 应含六档、严格递增、地上 ≤ 9：{gm}")
    cm = doc.get("capeGradeMap") or {}
    if [k for k in CAPE if not isinstance(cm.get(k), int)] or not cm.get("黄", 0) < cm.get("玄", 0) < cm.get("地", 0) <= 9:
        bad.append(f"capeGradeMap 应含黄 / 玄 / 地、严格递增、≤ 9：{cm}")
    for i in new:
        if i.get("category") in ("男装", "女装", "头饰", "腰带", "鞋"):
            if i.get("tier") not in SIX or gm.get(i["tier"]) != i.get("grade"):
                bad.append(f"{i.get('id')} 六档 {i.get('tier')} 与 grade {i.get('grade')} 不合 gradeMap")
        if i.get("category") == "披风" and (i.get("tier") not in CAPE or cm.get(i["tier"]) != i.get("grade")):
            bad.append(f"{i.get('id')} 披风档 {i.get('tier')} 与 grade {i.get('grade')} 不合 capeGradeMap")
    # 覆盖
    colors = defaultdict(set)
    tiers = defaultdict(set)
    for i in new:
        c, d, g = i.get("category"), i.get("dynasty"), i.get("gender")
        if c in ("男装", "女装"):
            colors[(c, d, i.get("tier"))].add(str(i.get("color")))
        elif c in ("头饰", "腰带", "鞋"):
            tiers[(c, d, g)].add(i.get("tier"))
        elif c == "披风":
            tiers[(c, d)].add(i.get("tier"))
    for d in DYNASTIES:
        for t in SIX:
            m = colors[("男装", d, t)]
            if len(m) < 3 or not any("白" in x for x in m) or not any("玄" in x for x in m):
                bad.append(f"男装 {d}·{t} 颜色 {sorted(m)}：应 ≥ 3 色且含白、玄")
            if len(colors[("女装", d, t)]) < 2:
                bad.append(f"女装 {d}·{t} 颜色 {sorted(colors[('女装', d, t)])}：应 ≥ 2 色")
        for c in ("头饰", "腰带", "鞋"):
            for g in ("男", "女"):
                lack = [t for t in SIX if t not in tiers[(c, d, g)]]
                if lack:
                    bad.append(f"{c} {d}·{g} 缺档 {lack}")
        lack = [t for t in CAPE if t not in tiers[("披风", d)]]
        if lack:
            bad.append(f"披风 {d} 缺档 {lack}")
    names = [str(i.get("name", "")) for i in items if isinstance(i, dict)]
    bad += [f"缺作者点名的铠甲：{k}" for k in ARMOR_NAMES if not any(k in n for n in names)]
    bad += [f"缺作者点名的特殊衣物：{k}" for k in SPECIAL_NAMES if not any(k in n for n in names)]
    # 落地（CONTENT）
    if a.landed is not None:
        batch = [i for i in new if i.get("batch") == a.landed]
        if not batch:
            bad.append(f"第 {a.landed} 批没有条目")
        for i in batch:
            if cat_ids.get(i["id"]) != i["catalog"]:
                bad.append(f"{i['id']} 未落进 {i['catalog']}（现在：{cat_ids.get(i['id'])}）")
            if not (ROOT / "content/items" / f"{i['id']}.yaml").is_file():
                bad.append(f"{i['id']} 缺 content/items/{i['id']}.yaml")
            if not list((ROOT / "assets/default/prompts/items").glob(f"*/{i['id']}.md")):
                bad.append(f"{i['id']} 缺出图提示词 assets/default/prompts/items/*/{i['id']}.md")
        bad += recolor_problems(new, a.landed)
    cnt = defaultdict(int)
    for i in new:
        cnt[i.get("category")] += 1
    print(f"apparel: 新条目 {len(new)}，引用已有 {len(refs)}；按类 {dict(cnt)}；分批 {dict(sorted(per_batch.items()))}")
    for b in bad[:40]:
        print("✘", b)
    if len(bad) > 40:
        print(f"…… 共 {len(bad)} 处")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
