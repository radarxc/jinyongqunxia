---
asset_id: eq_jinsijia
kind: item
name: 金丝甲
category: innerarmor
category_name: 内甲
subcategory: 内甲·金丝
grade: 玄
source: 武侠通用意象；本作 **（原创扩展）**
effect: '`grade=6; slot=innerBody; weaponZ4=3%`'
output: assets/default/item/innerarmor/eq_jinsijia.png
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

# 金丝甲（`eq_jinsijia`）· 内甲 · 玄阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 内甲·金丝 |
| 品阶 | 玄 —— 选材匀净、接缝细、釉面或金属有克制光泽；布套／木匣较完整（禁：紫色魔光、浮空粒子） |
| 出处 | 武侠通用意象；本作 **（原创扩展）** |
| 效果字段（只作理解，不画） | `grade=6; slot=innerBody; weaponZ4=3%` |
| 外观要点（名录） | 暗金细丝交织无袖背心，织孔极细、边缘布包条 **（原创扩展）** |
| 类别专项 | 贴身短甲或背心可折叠，突出竹丝、皮绒、锁环、金丝／蚕丝织法与薄厚尺度 |

## 提示词

```text
Use case: stylized-concept. Create one corrected production item-codex illustration for tianshu/default. Subject: 金丝甲 (eq_jinsijia), inner armor / fine golden-wire weave, 玄 grade; generic wuxia imagery developed as an original extension. Main object: one complete sleeveless close-fitting vest interwoven from muted dark-gold hair-fine wire, with extremely tiny regular apertures, soft charcoal-brown cloth binding around neckline, armholes, side openings and hem, subtle overlap at the front, and enough gentle bending to read as flexible rather than rigid metal. Gold is aged, subdued, and sparse in shine; no bright jewelry look, no coins, scales, rings, brocade motifs, or gemstones. Grade language: 玄 grade is expressed only through even selected wire, precise small weave, refined seams, intact edge binding, and restrained metallic luster. No purple glow, particles, rarity frame, writing, icon, or magical effect. This exact material treatment and form are an original wuxia design, not a claimed novel reconstruction. Do not copy, retain, transform, or include the sword, book, fittings, page shapes, colors as identity cues, or composition from either reference. Category construction: one close-fitting short inner armor garment, gently unfolded and freely presented, front readable with a very slight three-quarter turn. Clearly show the named weave, bindings, thinness, and flexible scale. It is not worn, not on a mannequin, and not shaped around an invisible body. Critical composition correction: make the complete garment distinctly smaller and precisely centered than the previous candidate. Square 1:1, target 1536x1536. Exactly one isolated complete object. Keep the object bounding box within the central 68 percent of both canvas width and canvas height, with at least 16 percent clear empty background on every one of the four sides. No cropped edge. Uniform light warm gray near-ivory background approximately RGB (230,225,216), opaque, flat, untextured, with no gradient. No person, hands, mannequin, scene, room, landscape, floor, display stand, contact shadow, cast shadow, reflection, packaging, or accessory. Rendering: clear fine deep-gray ink outline; thin layered translucent washes; restrained handmade strokes; crisp but not photographic; low-saturation natural color with cool shadow notes. Keep weave and material details legible at icon scale. Non-photographic, non-3D, no bloom and no self-luminescence. Exclude: all text, pseudo-writing, characters, labels, titles, numbers, seals, signatures, logos, written watermarks, UI, rarity border, collage, multiple views, exploded view, extra objects, duplicate garments, modern materials, plastic mesh, zipper, snaps, modern buckle hardware, fantasy plate armor, European armor, Japanese armor, full heavy armor, outer robe, long coat, rigid breastplate, neon, colored beams, particles, aura, magic circle, bloom, blood, gore, people, hands, human body, mannequin, hollow invisible-person silhouette, scenery, ground, floor, pedestal, any shadow, gradient, paper texture, photographic realism, product photography, 3D rendering, anime, film or game costume replication, actor likeness, artist name, or work title. No exaggerated spikes except where explicitly requested, and even there keep them short and functional. Do not remove or counterfeit any provenance mark added by the tool.
```

## 排除项

文字、伪字、人物、手、人体、模特、场景、地面、投影、第二件物品、亮金首饰、钱币、甲片、大锁环、锦缎纹、宝石、魔法光效、品阶框、摄影、3D、影视游戏造型复刻

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：贴身短甲或背心可折叠，突出竹丝、皮绒、锁环、金丝／蚕丝织法与薄厚尺度；专项排除：外穿长袍、整套重甲、尖刺夸张、塑料网布。
- 品阶信号：选材匀净、接缝细、釉面或金属有克制光泽；布套／木匣较完整（禁：紫色魔光、浮空粒子）。
- 对题：画面必须能辨认为“内甲·金丝”里的“金丝甲”，不得画成同类其他物品。
