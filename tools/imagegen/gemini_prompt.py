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
    for f in BASE.rglob("*.md"):
        if f.name in ("INDEX.md", "GUIDE.md", "REDO.md") or "characters" in f.parts:
            continue
        t = f.read_text(encoding="utf-8")
        if t.startswith("---\n") and f"asset_id: {asset_id}\n" in t[: t.find("\n---\n", 4) + 1]:
            return f
    raise SystemExit(f"找不到 asset_id={asset_id} 的提示词文件")


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
                     "不是线稿、不是平涂、不是卡通、不是照片。背景：均匀的浅暖灰纸色（约 RGB 230,225,216），带极淡的纸面纹理，无地面、无投影、无场景。")
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


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    s = build(sys.argv[1])
    print(s if "--plain" in sys.argv else json.dumps(s, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
