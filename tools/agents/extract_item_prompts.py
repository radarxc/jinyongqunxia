#!/usr/bin/env python3
"""把物品图的提示词整理成"每物品一份"的提示词文件：assets/default/prompts/items/<类>/<id>.md

    python3 tools/agents/extract_item_prompts.py            # 生成 / 更新全部 11 类
    python3 tools/agents/extract_item_prompts.py --cat food  # 只做一类

来源优先级：已入库 manifest（assets/default/item/<类>/manifest.yaml，GPT 审核已过）→ 任务工作区 manifest
（.agents/wt/ART-item-<类>/…，候选）→ 都没有时按 assets/default/prompts/item.md §8.1–§8.3 骨架从名录生成（status: draft）。
本脚本只整理与套模板，不改名录、不改 manifest。frontmatter 由 build_image_index.py 读取。
"""
import argparse
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets/default/prompts/items"
CATS = [("medicine", "药物 / 补品 / 药材"), ("food", "食材 / 食品"), ("manuals", "武学秘籍"), ("weapons", "兵器"),
        ("clothing", "衣物"), ("armor", "制式盔甲"), ("innerarmor", "内甲"), ("accessories", "护肩 / 披风 / 头饰"),
        ("shoes", "鞋"), ("belts", "腰带"), ("hidden-weapons", "暗器")]
REFS = [("assets/default/baseline/item/ref_eq_yitianjian__ch04_base01.png", "画风参考（作者已审）：清楚纤细的深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖、左上柔光、浅暖灰近象牙底；不复制剑本身"),
        ("assets/default/baseline/item/ref_it_miji_jiuyin_shang__ch02_base01.png", "画风参考（作者已审）：同上；不复制书册、题签与磨损")]
# item.md §8.2：各类在共用骨架"主体"后追加的要求 / 专项排除
CAT_RULES = {
    "medicine": ("药物／补品突出丸、散、膏、露与单个容器；药材突出根、茎、叶、年纹和采集痕，容器仅作从属；瓶塞、蜡封、瓷木玉材质分明", "药片铝板、现代玻璃标签、化学烧杯、过量药材堆、年份文字"),
    "food": ("食材只画一份原料；食品画一份可辨菜点及必要盘碗／油纸，熟食与生料不可混同", "满桌宴席、人物进食、现代餐具、包装字、夸张蒸汽"),
    "manuals": ("单册或名录明确的上下卷；柔软纸书衣、页口、细订线和轻旧化，空题签", "经文、招式图、硬皮魔法书、粗绳、大面积破损"),
    "weapons": ("完整兵器剪影；细长件斜置并留足尖、首、杆端，时代装具和手持尺度准确", "手持人物、兵器架、断尖、欧式巨剑、日本刀、发光刃"),
    "clothing": ("单件衣物平展或自然折叠，领襟、袖、系带和织物厚薄清楚，不用人体撑衣", "模特、空心人形、现代拉链、跨朝代官服构件"),
    "armor": ("单套官甲正面略侧置，札片／棉甲／布衬结构完整；严格区分宋元明清，不出现军号文字", "奇幻板甲、跨朝混搭、血污、人物、现代徽章"),
    "innerarmor": ("贴身短甲或背心可折叠，突出竹丝、皮绒、锁环、金丝／蚕丝织法与薄厚尺度", "外穿长袍、整套重甲、尖刺夸张、塑料网布"),
    "accessories": ("护肩画成一对；披风画单件完整铺展；头饰画冠／巾及必要簪，不把三个槽混成套装", "人头、假发、翼状披风、巨大宝石、无关配饰堆"),
    "shoes": ("一双同款并置，鞋面、鞋底、缝线和磨损一致，保持成人脚掌尺寸感", "人脚、现代运动鞋结构、高跟鞋、只画单只"),
    "belts": ("腰带松弧或盘一圈，完整展示带身、扣具、玉板／护片和弯曲材质", "现代皮带针扣、腰包、悬挂兵器、人物腰身"),
    "hidden-weapons": ("名针／飞刀按条目数量整齐并置；机括完整闭合，表现孔、簧、筒但不画发射或命中", "命中人体、血迹、现代枪械化、爆炸、弹道线、零件爆炸图"),
}
# item.md §8.3：品阶画面语言
GRADE = {"黄": "常见木、陶、麻、普通钢；结构实用，轻微使用痕，素包装（禁：黄色光、黄框、写“黄”）",
         "玄": "选材匀净、接缝细、釉面或金属有克制光泽；布套／木匣较完整（禁：紫色魔光、浮空粒子）",
         "地": "稀有材质或名家工艺、精细纹理、旧而妥善保存的专属匣；局部玉／银／暗金（禁：金色光柱、满屏宝石）",
         "天": "极稀有材质、完整独特轮廓、细密工艺与温润／冷润自然光泽；包装珍贵但克制（禁：自发光、神器光环、天字与星级）"}
COMMON_NEG = ("文字、汉字、伪字、经文、书法、标题、数字、印章、签名、logo、文字水印；现代元素、塑料、拉链、订书钉、现代装帧、人物与手、真人演员脸；"
              "在世或近现代画师风格名、影视剧版造型、受保护画作或剧照的复制；演员名、游戏公司名、被借鉴作品名、具体游戏兵器设计、截图或海报构图；"
              "日韩动漫、欧美奇幻、赛博朋克、蒸汽朋克；霓虹、魔法阵、bloom、满屏金光、镜面眩光、血腥、裸露、道具堆叠；"
              "复杂布景、UI、品阶框、拼贴、多视图、透视畸变、主体截断、任何投影、地面、底纹；商品摄影、照片级写实、3D 渲染")
# 执行器写进 manifest 的工具调用语句，与画面无关，抽取时去掉
TOOL_NOISE = [
    r"The imagegen skill has already been read\..*?reply only with its generated PNG path\.\s*",
    r"This is the (?:first|second|third|final|second and final) candidate\.\s*",
    r"Call image_generation exactly once\.\s*",
    r"Make exactly one built-in image_gen call[^.]*\.\s*",
    r"Do not read files, do not call node_repl, shell, or collaboration tools\.\s*",
]


def catalog_rows(cat):
    rows = {}
    for ln in (ROOT / f"docs/design/catalog/items-{cat}.md").read_text(encoding="utf-8").splitlines():
        m = re.match(r"^\|\s*`((?:it|eq)_[a-z0-9_]+)`\s*\|(.*)$", ln)
        if not m:
            continue
        cells = [c.strip() for c in m.group(2).strip().strip("|").split("|")]
        cells += [""] * (6 - len(cells))
        rows[m.group(1)] = dict(name=cells[0], sub=cells[1], grade=cells[2], source=cells[3], effect=cells[4], look=cells[5])
    return rows


def load_manifest(p):
    if not p.exists():
        return {}
    data = yaml.safe_load(p.read_text(encoding="utf-8")) or []
    return {e["id"]: e for e in data if isinstance(e, dict) and e.get("id")}


TOOL_WORDS = re.compile(r"image_gen|imagegen|referenced_image_paths|transparent_background|spawn agents|call shell|view_image|reply only|PNG path|PNG absolute path|absolute path|output only|node_repl|collaboration tools|After th(e|at) call|generated image path|supplied images|attached images? (are|is)|as (the )?(only )?(image )?inputs?|do not (read|call|use) ", re.I)


def clean_prompt(text):
    s = str(text or "")
    for pat in TOOL_NOISE:
        s = re.sub(pat, "", s, flags=re.S)
    # 执行器写给图像工具的操作语句（英文句，含工具名）与画面无关，整句去掉；中文画面描述保留
    kept = []
    for sent in re.split(r"(?<=[.!?。！？])\s+", s):
        if TOOL_WORDS.search(sent) and re.search(r"[A-Za-z]{4,}", sent) and not re.search(r"[\u4e00-\u9fff]{6,}", sent):
            continue
        if re.search(r"执行[：:]|Pillow|本地渲染|超时后|fallback|回退", sent):  # 执行器的执行记录，不是画面要求
            continue
        kept.append(sent)
    s = " ".join(kept)
    s = re.sub(r"\n{3,}", "\n\n", s).strip()
    return s


def synth_prompt(cat, cname, iid, row):
    rule, neg = CAT_RULES[cat]
    g = row["grade"][:1] if row["grade"] else ""
    return "\n".join([
        f"题材：{row['name']}（{iid}），{row['sub']}，{row['grade']}阶；出处语境：{row['source']}。",
        f"主体：{row['look']}。{rule}。效果字段只用于理解用途，不画数值、文字、图标或魔法特效。",
        "风格：清楚纤细墨线、薄层罩染、克制手绘笔触、低饱和；材质边界清楚，非摄影、非3D。",
        "构图：1:1，目标 1536×1536，单一完整物品居中，三分之四轻俯视，四边留白至少 10%，浅暖灰近象牙均匀底 RGB(230,225,216)，无人物、手、场景、地面或投影。",
        f"品阶表现：{GRADE.get(g, '按名录品阶用材质、工艺、包装与旧化表达')}；不画品阶框、彩色光柱、文字或数字。",
        "年代：按出处书界与 docs/design/02 核形制；名录标原创扩展者只作原创武侠器物，不冒充原著复原。",
        f"排除：{COMMON_NEG}；专项排除：{neg}。",
    ])


def write_item(cat, cname, iid, row, entry, source_tag, status):
    rule, neg = CAT_RULES[cat]
    g = row["grade"][:1] if row["grade"] else ""
    if entry:
        prompt = clean_prompt(entry.get("prompt"))
        negative = clean_prompt(entry.get("negative")) or f"{COMMON_NEG}；专项排除：{neg}"
    else:
        prompt = synth_prompt(cat, cname, iid, row)
        negative = f"{COMMON_NEG}；专项排除：{neg}"
    fm = {
        "asset_id": iid, "kind": "item", "name": row["name"], "category": cat, "category_name": cname,
        "subcategory": row["sub"], "grade": row["grade"], "source": row["source"], "effect": row["effect"],
        "output": f"assets/default/item/{cat}/{iid}.png", "manifest": f"assets/default/item/{cat}/manifest.yaml",
        "size": "1536x1536", "background": "RGB(230,225,216) 不透明均匀浅暖灰底，无投影、无地面",
        "references": [{"path": p, "use": u} for p, u in REFS],
        "prompt_source": source_tag, "status": status,
    }
    body = [
        "---", yaml.safe_dump(fm, allow_unicode=True, sort_keys=False, width=1000).rstrip(), "---", "",
        f"# {row['name']}（`{iid}`）· {cname} · {row['grade']}阶", "",
        "## 物品要点", "", "| 项 | 内容 |", "|---|---|",
        f"| 子类 | {row['sub']} |", f"| 品阶 | {row['grade']} —— {GRADE.get(g, '')} |", f"| 出处 | {row['source']} |",
        f"| 效果字段（只作理解，不画） | {row['effect']} |", f"| 外观要点（名录） | {row['look']} |",
        f"| 类别专项 | {rule} |", "",
        "## 提示词", "", "```text", prompt, "```", "",
        "## 排除项", "", negative, "",
        "## 质检要点", "",
        "- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。",
        "- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。",
        "- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。",
        f"- 类别专项：{rule}；专项排除：{neg}。",
        f"- 品阶信号：{GRADE.get(g, '按名录')}。",
        f"- 对题：画面必须能辨认为“{row['sub']}”里的“{row['name']}”，不得画成同类其他物品。", "",
    ]
    (OUT / cat).mkdir(parents=True, exist_ok=True)
    (OUT / cat / f"{iid}.md").write_text("\n".join(body), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cat")
    a = ap.parse_args()
    total = {"manifest": 0, "worktree": 0, "template": 0}
    for cat, cname in CATS:
        if a.cat and cat != a.cat:
            continue
        rows = catalog_rows(cat)
        merged = load_manifest(ROOT / f"assets/default/item/{cat}/manifest.yaml")
        wt = load_manifest(ROOT / f".agents/wt/ART-item-{cat}/assets/default/item/{cat}/manifest.yaml")
        for iid, row in rows.items():
            if iid in merged and merged[iid].get("prompt"):
                write_item(cat, cname, iid, row, merged[iid], f"manifest:assets/default/item/{cat}/manifest.yaml（已入库，GPT 审核已过）", "ready")
                total["manifest"] += 1
            elif iid in wt and wt[iid].get("prompt"):
                write_item(cat, cname, iid, row, wt[iid], f"manifest:.agents/wt/ART-item-{cat}/assets/default/item/{cat}/manifest.yaml（任务工作区候选）", "ready")
                total["worktree"] += 1
            else:
                write_item(cat, cname, iid, row, None, "template:assets/default/prompts/item.md §8（按名录套骨架生成，未经审核）", "draft")
                total["template"] += 1
        print(f"{cat:15} {len(rows)} 份")
    print(f"来源：已入库 manifest {total['manifest']}、工作区 manifest {total['worktree']}、骨架生成 {total['template']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
