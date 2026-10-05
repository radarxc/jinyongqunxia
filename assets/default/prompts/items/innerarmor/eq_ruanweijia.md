---
asset_id: eq_ruanweijia
kind: item
name: 软猬甲
category: innerarmor
category_name: 内甲
subcategory: 内甲·猬刺宝甲
grade: 天
source: 《射雕英雄传》·桃花岛宝物
effect: '`grade=10; slot=innerBody; divine=true; buff=bf_weici,bf_daoqiang`'
output: assets/default/item/innerarmor/eq_ruanweijia.png
manifest: assets/default/item/innerarmor/manifest.yaml
size: 1536x1536
background: RGB(230,225,216) 不透明均匀浅暖灰底，无投影、无地面
references:
- path: assets/default/baseline/item/ref_eq_yitianjian__ch04_base01.png
  use: 画风参考（作者已审）：清楚纤细的深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖、左上柔光、浅暖灰近象牙底；不复制剑本身
- path: assets/default/baseline/item/ref_it_miji_jiuyin_shang__ch02_base01.png
  use: 画风参考（作者已审）：同上；不复制书册、题签与磨损
prompt_source: manifest:assets/default/item/innerarmor/manifest.yaml（已入库，GPT 审核已过）
status: ready
---

# 软猬甲（`eq_ruanweijia`）· 内甲 · 天阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 内甲·猬刺宝甲 |
| 品阶 | 天 —— 极稀有材质、完整独特轮廓、细密工艺与温润／冷润自然光泽；包装珍贵但克制（禁：自发光、神器光环、天字与星级） |
| 出处 | 《射雕英雄传》·桃花岛宝物 |
| 效果字段（只作理解，不画） | `grade=10; slot=innerBody; divine=true; buff=bf_weici,bf_daoqiang` |
| 外观要点（名录） | 深褐软甲表面密布短刺，贴身背心轮廓，刺短而不血腥 **（待考形制；原创扩展表现）** |
| 类别专项 | 贴身短甲或背心可折叠，突出竹丝、皮绒、锁环、金丝／蚕丝织法与薄厚尺度 |

## 提示词

```text
Use case: stylized-concept. Create one corrected production item-codex illustration for tianshu/default. Subject: 软猬甲 (eq_ruanweijia), inner armor / short-spiked treasure vest, 天 grade; context: 射雕英雄传, 桃花岛 treasure, Southern Song world circa 1217-1227. Main object: one complete dark-brown soft close-fitting vest whose flexible leather-textile surface is densely covered with thousands of very short, fine, dark bronze-gray protective bristles or quills. The spikes are consistently short, slender, blunt-looking at this illustration scale, functional and non-gory, following the vest surface without turning it into a porcupine animal or fantasy torture armor. Soft brown edge binding, thin profile, supple folds between bristled zones, intact unique silhouette. Catalog form is pending textual verification and the visual expression is original: do not claim an exact novel costume or historical reconstruction. Grade language: 天 grade is expressed only through extremely rare material, dense minute craft, complete distinctive silhouette, flawless preserved bindings, and cool-warm natural sheen. No self-glow, halo, stars, rarity frame, writing, icon, magic, blood, impalement, or oversized spikes. Do not copy, retain, transform, or include the sword, book, fittings, page shapes, colors as identity cues, or composition from either reference. Category construction: one close-fitting short inner armor garment, gently unfolded and freely presented, front readable with a very slight three-quarter turn. Clearly show the named weave, bindings, thinness, and flexible scale. It is not worn, not on a mannequin, and not shaped around an invisible body. Critical composition correction: make the complete garment distinctly smaller and precisely centered than the previous candidate. Square 1:1, target 1536x1536. Exactly one isolated complete object. Keep the object bounding box within the central 68 percent of both canvas width and canvas height, with at least 16 percent clear empty background on every one of the four sides. No cropped edge. Uniform light warm gray near-ivory background approximately RGB (230,225,216), opaque, flat, untextured, with no gradient. No person, hands, mannequin, scene, room, landscape, floor, display stand, contact shadow, cast shadow, reflection, packaging, or accessory. Rendering: clear fine deep-gray ink outline; thin layered translucent washes; restrained handmade strokes; crisp but not photographic; low-saturation natural color with cool shadow notes. Keep weave and material details legible at icon scale. Non-photographic, non-3D, no bloom and no self-luminescence. Exclude: all text, pseudo-writing, characters, labels, titles, numbers, seals, signatures, logos, written watermarks, UI, rarity border, collage, multiple views, exploded view, extra objects, duplicate garments, modern materials, plastic mesh, zipper, snaps, modern buckle hardware, fantasy plate armor, European armor, Japanese armor, full heavy armor, outer robe, long coat, rigid breastplate, neon, colored beams, particles, aura, magic circle, bloom, blood, gore, people, hands, human body, mannequin, hollow invisible-person silhouette, scenery, ground, floor, pedestal, any shadow, gradient, paper texture, photographic realism, product photography, 3D rendering, anime, film or game costume replication, actor likeness, artist name, or work title. No exaggerated spikes except where explicitly requested, and even there keep them short and functional. Do not remove or counterfeit any provenance mark added by the tool.
```

## 排除项

文字、伪字、人物、手、人体、模特、场景、地面、投影、第二件物品、动物造型、酷刑甲、超长尖刺、血、刺穿、光晕、星芒、魔法光效、品阶框、摄影、3D、影视游戏造型复刻

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：贴身短甲或背心可折叠，突出竹丝、皮绒、锁环、金丝／蚕丝织法与薄厚尺度；专项排除：外穿长袍、整套重甲、尖刺夸张、塑料网布。
- 品阶信号：极稀有材质、完整独特轮廓、细密工艺与温润／冷润自然光泽；包装珍贵但克制（禁：自发光、神器光环、天字与星级）。
- 对题：画面必须能辨认为“内甲·猬刺宝甲”里的“软猬甲”，不得画成同类其他物品。
