#!/usr/bin/env python3
"""把 assets/default/prompts/ 下某张图的提示词文件整理成交给 Gemini 网页的一段话（JSON 字符串，可直接嵌进 JS）。

    python3 tools/imagegen/gemini_prompt.py <asset_id>            # 打印 JSON 字符串
    python3 tools/imagegen/gemini_prompt.py <asset_id> --plain    # 打印纯文本

规则（作者 2026-10-01：不上传参考图，网页上选「Oil painting」模板）：开头说明画幅与画风；正文取提示词文件「提示词」节，
去掉英文工具调用句和所有讲"输入图 / 参考图 / 附图"的句子；结尾附排除项。加 --refs 时保留"附图只作画风参考"的说法（上传参考图时用）。
透明底素材（rig_*）改为要求浅暖灰 RGB(230,225,216) 均匀平涂背景，出图后用 tools/imagegen/key_background.py 抠成透明（复用 tools/item/common.remove_background）。
"""
import json
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "assets/default/prompts"


def find_prompt(asset_id: str) -> Path:
    # 立绘 / 情景图 / 路人（AR-30）也走 Gemini：先找物品、地图等，再找 characters/ 与 scenes/
    later = []
    for f in BASE.rglob("*.md"):
        if f.name in ("INDEX.md", "GUIDE.md", "REDO.md"):
            continue
        if "characters" in f.parts:
            later.append(f)
            continue
        t = f.read_text(encoding="utf-8")
        if t.startswith("---\n") and f"asset_id: {asset_id}\n" in t[: t.find("\n---\n", 4) + 1]:
            return f
    for f in later:
        t = f.read_text(encoding="utf-8")
        if t.startswith("---\n") and f"asset_id: {asset_id}\n" in t[: t.find("\n---\n", 4) + 1]:
            return f
    raise SystemExit(f"找不到 asset_id={asset_id} 的提示词文件")


def gemini_block(text: str) -> str | None:
    """提示词文件里现成的「## Gemini 提示词」段（立绘重审、情景图、路人任务写的自成一体的中文提示词），有就原样用。"""
    m = re.search(r"^## Gemini 提示词[^\n]*\n(?:.*?\n)??```text\n(.*?)\n```", text, re.S | re.M)
    return m.group(1).strip() if m else None


def build(asset_id: str) -> str:
    f = find_prompt(asset_id)
    text = f.read_text(encoding="utf-8")
    end = text.find("\n---\n", 4)
    fm = yaml.safe_load(text[4:end])
    body = text[end + 5:]
    m = re.search(r"## 提示词.*?```text\n(.*?)\n```", body, re.S)
    prompt = m.group(1).strip() if m else ""
    prompt = re.sub(r"^Use case:[^\n]*\n?", "", prompt)
    neg = re.search(r"## 排除项\n\n(.*?)(?:\n\n## |\Z)", body, re.S)
    neg = neg.group(1).strip() if neg else ""
    kind = fm.get("kind")
    size = str(fm.get("size") or fm.get("canvas") or "1536x1536")
    w, h = (int(x) for x in size.lower().split("x")) if "x" in size.lower() else (1, 1)
    ratio = "1:1" if abs(w - h) < 8 else ("3:2" if w > h else "2:3")
    refs = [r.get("path") for r in (fm.get("references") or []) if isinstance(r, dict) and str(r.get("path", "")).endswith(".png")]
    head = f"生成一张 {ratio} 图片。"
    if refs and "--refs" in sys.argv:
        head += "附图只作画风参考（墨线、罩染、设色、光线与底色），不要复制附图里的具体物件与构图。"
    else:
        # 不传参考图：删掉讲输入图 / 参考图的句子，画风用文字说明
        sents = re.split(r"(?<=[。；])", prompt)
        prompt = "".join(x for x in sents if not re.search(r"输入图|参考图|附图|图片输入|referenced|reference image", x, re.I))
        prompt = re.sub(r"[A-Za-z][^。；\n]*(image_gen|imagegen|PNG path|tool)[^。；\n]*[.。]?", "", prompt)
        if kind == "item":
            # 作者 2026-10-01：「看起来不够写实，希望能写实一些。要跟角色图对应上」——画风对齐角色立绘基线（写实古风绘画）
            head += ("画风：写实古风绘画，与写实武侠人物立绘一致——真实材质质感（布料的经纬纹理、毛边与洗旧褪色，金属的冷光、锻打痕与细微锈蚀，"
                     "皮革的皱纹、磨损与油亮，木、玉、瓷、纸的真实肌理），柔和的体积光影与自然明暗，低饱和沉稳设色，手绘写实概念画质感；"
                     "不是线稿、不是平涂、不是卡通、不是照片。背景：均匀平涂的浅暖灰底色（约 RGB 230,225,216），无纸纹、无暗角、无边框、无渐变、无地面、无投影、无场景（后续要程序抠图）。")
            prompt = re.sub(r"[^。；]*(纤细[^。；]*墨线|薄层[^。；]*罩染|墨线外轮廓)[^。；]*[。；]", "", prompt)
        elif kind == "map":
            head += "画风：古风水墨山水地图，浓淡墨与干笔皴擦，留白水面，暖纸白。"
    if kind in ("rig_ref", "rig_part"):
        head += "背景必须是均匀平涂的浅暖灰 RGB(230,225,216)（无渐变、无纸纹、无投影、无光晕），主体外不能有任何杂物；出图后由程序抠成透明。"
        prompt = re.sub(r"真正的透明 RGBA 背景|透明 RGBA 背景|透明 RGBA|透明底", "浅暖灰 RGB(230,225,216) 均匀背景", prompt)
    # 盔甲：作者意见是类别级的通用说明（列了宋元明清各种甲），交给模型时只保留针对本件的一句，避免几个朝代混在一张图里
    if fm.get("category") == "armor":
        prompt = re.sub(r"作者 2026-10-01：盔甲要突出年代特色.*?不用奇幻配色。", "", prompt, flags=re.S)
        prompt += f" 要一眼看出这是「{fm.get('name')}」这一朝代、这一兵种的制式甲：甲片形制、编缀方式、披膊 / 护心 / 甲裙等部件和主色配色都符合该朝史料，颜色克制（作者要求突出年代特色，包括制式与颜色）。"
    # 正文里出现两次排除项时只留第一次
    parts = re.split(r"(?=排除项[：:])", prompt)
    if len(parts) > 2:
        prompt = parts[0] + parts[1]
    out = head + prompt.replace("\n", " ")
    if neg and "排除" not in prompt:  # 提示词正文里已有排除项的不再重复附加
        out += " 排除：" + neg.replace("\n", " ")
    return re.sub(r"\s{2,}", " ", out)


REALISTIC = ("画风：写实古风绘画，与写实武侠人物立绘一致——真实材质质感（布料的经纬纹理、毛边与洗旧褪色，金属的冷光、锻打痕与细微锈蚀，"
             "皮革的皱纹、磨损与油亮，木、玉、瓷、纸的真实肌理），柔和的体积光影与自然明暗，低饱和沉稳设色，手绘写实概念画质感；"
             "不是线稿、不是平涂、不是卡通、不是照片。背景：均匀平涂的浅暖灰底色（约 RGB 230,225,216），无纸纹、无暗角、无边框、无渐变、无地面、无投影、无场景（后续要程序抠图）。")
SHORT_NEG = ("排除：人物、脸、手、人体、模特、衣架、支架、文字、伪字、印章、logo、边框、品阶框；奇幻造型、日式或欧美风格、跨朝混搭、现代材料；霓虹、魔法、粒子、发光。"
             "画面里不要出现任何文字：没有标题、标注、说明栏、引线标签（这是单独的物品图，不是设定稿）。")  # 2026-10-01 霍都折扇出过带标题与标注的设定稿式图
# 品阶行里的包装说法（玄「布套／木匣较完整」、地「专属匣」……）会让模型在兵器底下垫木匣（天龙寺戒刀、段延庆钢杖、崆峒双钩）。
# 兵器、甲、衣饰只画物品本身；食品、药物的包装可能就是物品的一部分，保留（食品地阶的「专属匣」除外，见 build_short）。
PACKAGING = re.compile(r"[；;，,、]?\s*(?:布套／木匣较完整|旧而妥善保存的专属匣|包装珍贵但克制|素包装)")
NO_PACK_CATS = {"weapons", "hidden-weapons", "armor", "innerarmor", "clothing", "accessories", "shoes", "belts"}


def manual_title(name: str) -> str:
    """秘籍封面题签上写的书名：去掉版本 / 载体后缀——藏本 / 残本 / 秘本 / 抄本 / 古抄本 / 手抄本 / 全本 / 原本 / 古本 / 残卷 / 秘籍 / 遗谱 / 残谱，
    以及紧挨着它们的载体词（梵文 / 袈裟 / 夹注 / 羊皮 / 帛卷 / 帛书）；「图谱」「秘笈」是书名的一部分，保留（作者 10-02：秘籍都要写名字；协调者 10-02 19:30 扩充）。"""
    return re.sub(r"(梵文|袈裟|夹注|羊皮|帛卷|帛书)?(全本|原本|古本|古抄本|手抄本|抄本|残本|残卷|藏本|秘本|秘籍|遗谱|残谱)$", "", name) or name


def build_short(asset_id: str) -> str:
    """精简版（2026-10-01 实测效果最好）：画风 + 题材 + 名录外观要点 + 类别专项 + 品阶 + 年代要求 + 短排除项，约 400–600 字。"""
    f = find_prompt(asset_id)
    text = f.read_text(encoding="utf-8")
    ready = gemini_block(text)
    if ready:
        return ready
    end = text.find("\n---\n", 4)
    fm = yaml.safe_load(text[4:end])
    body = text[end + 5:]
    def row(label):
        m = re.search(r"\| " + re.escape(label) + r"[^|]*\| (.*?) \|", body)
        return re.sub(r"\*\*|（原创扩展[^）]*）|\(原创扩展[^)]*\)", "", m.group(1)).strip() if m else ""
    look, special, grade_line = row("外观要点"), row("类别专项"), row("品阶")
    # 完整提示词「主体：」段的描写更细（年代形制都在里面），有就优先用它
    full = re.search(r"## 提示词.*?```text\n(.*?)\n```", body, re.S)
    if full:
        m = re.search(r"主体[：:](.*?)(?=\s*(?:风格|构图|品阶表现|年代|排除项?)[：:]|$)", full.group(1), re.S)
        if m:
            desc = re.sub(r"具体[^。]*?(?:复原|造型)[^。]*。", "", m.group(1))
            desc = re.sub(r"[^。]*(?:非摄影|非3D|边界清楚)[^。]*。", "", desc)
            desc = re.sub(r"\s*（(?:原创扩展|待考)[^）]*）", "", desc.replace("**", "")).strip()
            if len(desc) > 20:
                look = desc.rstrip("。")
    if fm.get("category") == "accessories":
        # 衣饰三槽共用的句子「护肩画成一对；披风画单件完整铺展；头饰画冠／巾及必要簪，不把三个槽混成套装」会诱导模型
        # 把三个槽画在一起（10-01 实测 3 张失败）：主体段与类别专项里都删掉，只留本件槽位的说法
        slot = str(fm.get("subcategory", "")).split("·")[0]
        look = re.sub(r"护肩画成一对[^。]*?混成套装。?", "", look).strip()
        clauses = [re.sub(r"，?不把三个槽混成套装", "", c) for c in re.split(r"[；;]", special) if slot and slot in c]
        others = "、".join(x for x in ["帽子", "头饰", "护肩", "护臂", "披风"] if x != slot and not (slot == "头饰" and x == "帽子"))
        special = (clauses[0] if clauses else "") + f"；画面里只画这一件{slot}，没有{others}或其他配件"
    if special and special.rstrip("。") in look:  # 主体段常已含类别专项原句（食品 10-02 实测每条重复两次）
        special = ""
    name, sub, grade, src = fm.get("name", ""), fm.get("subcategory", ""), fm.get("grade", ""), str(fm.get("source", ""))
    neg = SHORT_NEG
    if fm.get("category") == "manuals":
        # 名录原写「空题签」，10-01 出的 18 本都没有书名；改为封面题签写书名，排除项只放行这一处文字
        title = manual_title(name)
        sign = f"封面题签上用端正楷书竖写书名「{title}」，墨色，字迹清楚、笔画准确"
        look, special = (x.replace("空题签", sign) for x in (look, special))
        if sign not in look + special:
            special = (special + "；" if special else "") + sign
        neg = SHORT_NEG.replace("文字、伪字、印章", "印章").replace(
            "画面里不要出现任何文字：没有标题、标注、说明栏、引线标签（这是单独的物品图，不是设定稿）。",
            f"除封面题签上的书名「{title}」外，不要任何其他文字、伪字、印章、标注或说明栏（这是单独的物品图，不是设定稿）。")
    src = re.sub(r"\s*（(?:原创扩展|待考)[^）]*）", "", src.replace("**", "")).strip(" ；;")
    grade_line = grade_line.split("（禁")[0]
    if fm.get("category") in NO_PACK_CATS:
        grade_line = PACKAGING.sub("", grade_line) + "；只画物品本身，不画木匣、布套、托架或包装"
    elif fm.get("category") == "food":
        # 地阶「专属匣」会盖过名录写的盛器（10-02 鲍鱼、豹胎 3 张里 2 张画出木匣）；玄 / 黄 / 天的包装说法实测无害，保留
        grade_line = re.sub(r"[；;，,、]?\s*旧而妥善保存的专属匣", "", grade_line) + "；盛器照形制描述，不另加木匣或礼盒"
    out = [f"生成一张 1:1 图片。{REALISTIC}",
           f"题材：武侠游戏物品图鉴里的「{name}」（{sub}，{grade}阶{('；出处：' + src) if src and '原创' not in src else ''}），单一完整物品、无人持用，正面略三分之四视角居中，四边留白至少 12%。",
           (f"形制与外观：{look}。" + (f"{special}。" if special else "")) if look else "",
           f"品阶表现：{grade_line}；只用材质、工艺与旧化表达，不画光效。" if grade_line else "",
           f"要一眼看出这是「{name}」这一朝代、这一兵种的制式甲：甲片形制、编缀方式、披膊 / 护心 / 甲裙等部件和主色配色都符合该朝史料，颜色克制。" if fm.get("category") == "armor" else "年代与形制符合出处书界的时代，不混搭。",
           neg]
    return re.sub(r"[；;，,]\s*。", "。", " ".join(x for x in out if x))


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    s = build_short(sys.argv[1]) if "--short" in sys.argv else build(sys.argv[1])
    print(s if "--plain" in sys.argv else json.dumps(s, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
