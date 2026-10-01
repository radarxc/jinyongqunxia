---
asset_id: eq_jindi
kind: item
name: 金笛
category: weapons
category_name: 兵器
subcategory: 兵器·奇门笛
grade: 玄
source: 《书剑恩仇录》·余鱼同
effect: '`grade=6; cat=exotic; exoticKind=flute; hands=1` **（原创扩展定级）**'
output: assets/default/item/weapons/eq_jindi.png
manifest: assets/default/item/weapons/manifest.yaml
size: 1536x1536
background: RGB(230,225,216) 不透明均匀浅暖灰底，无投影、无地面
references:
- path: assets/default/baseline/item/ref_eq_yitianjian__ch04_base01.png
  use: 画风参考（作者已审）：清楚纤细的深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖、左上柔光、浅暖灰近象牙底；不复制剑本身
- path: assets/default/baseline/item/ref_it_miji_jiuyin_shang__ch02_base01.png
  use: 画风参考（作者已审）：同上；不复制书册、题签与磨损
prompt_source: manifest:.agents/wt/ART-item-weapons/assets/default/item/weapons/manifest.yaml（任务工作区候选）
status: ready
---

# 金笛（`eq_jindi`）· 兵器 · 玄阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 兵器·奇门笛 |
| 品阶 | 玄 —— 选材匀净、接缝细、釉面或金属有克制光泽；布套／木匣较完整（禁：紫色魔光、浮空粒子） |
| 出处 | 《书剑恩仇录》·余鱼同 |
| 效果字段（只作理解，不画） | `grade=6; cat=exotic; exoticKind=flute; hands=1` **（原创扩展定级）** |
| 外观要点（名录） | 哑光旧金色横笛，七孔与细卷草纹，无文字，约两尺 **（原创扩展形制）** |
| 类别专项 | 完整兵器剪影；细长件斜置并留足尖、首、杆端，时代装具和手持尺度准确 |

## 提示词

```text
Use case: stylized-concept. Generate one inventory illustration for 金笛 (eq_jindi), 兵器·奇门笛, 玄 tier. Provenance context: Book and Sword, Yu Yutong; Qing Qianlong-era story context 1753-1759, exact object form is original. The two attached approved item baselines control style only: crisp fine dark-gray ink outlines, thin transparent color washes, restrained hand-painted brushwork, low-saturation cool-warm color, and a warm light-gray near-ivory background. Never copy either reference object, silhouette, fittings, composition, color layout, wear pattern, sword design, or book design. Generate an entirely new composition. Subject: one complete transverse flute about two chi long, muted aged-gold metal, seven clearly spaced finger holes, delicate non-textual scrolling vine incisions and capped ends. Any unspecified material, ornament, proportion or wear is an original wuxia extension, not a claimed novel illustration or historical reconstruction. Effect fields inform function only; never draw stats, text, icons or supernatural effects. Grade language: carefully selected even material, precise joints and restrained natural metal or lacquer sheen; workmanship is clearly finer than common gear but remains practical. Grade is expressed only through material, workmanship and preservation. Style: non-photographic and non-3D, clear fine ink contours, thin translucent washes, restrained visible brushwork and clear material boundaries. Lighting is soft from upper left, with only narrow subdued highlights on the object itself and no glow. Composition: 1:1 square, requested 1536x1536, exactly one coherent inventory item centered diagonally or in the clearest natural arrangement, gentle three-quarter view with minimal foreshortening. The entire point, head, shaft end, handle, pommel, tip, chain or cloth edge must be visible. Keep at least 18 percent clear margin on every side where geometry allows; object bounding box must not exceed 76 percent of canvas width or height. No person, hand, rack, scene, floor, ground or shadow. Background: uniform warm light gray near ivory, RGB approximately 230,225,216, with no texture, vignette, gradient, ground plane or contact shadow. Completely unlettered. Item-specific exclusions: No readable inscription, vertical xiao, modern keys, gemstone, glaring polished gold, instrument case or floating music notes. Absolutely no text, pseudo-writing, numerals, seal, signature, logo, watermark text, UI, border, grade frame, collage, multi-view, cropping, broken tip, modern material, specific film or game weapon design, actor, artist, anime, European fantasy, steampunk, Japanese sword, long European crossguard, giant gem, hamon, Damascus swirl, serration, fire blade, neon, bloom, magic circle, aura, colored light column, blood, person, hand, weapon rack, display pedestal, scene, floor, ground, contact shadow, cast shadow, extra unrelated object, duplicate weapon, photographic realism or 3D-render appearance. Preserve any tool-native provenance marker; do not fabricate or erase it. REPAIR PRIORITY: the first candidate was otherwise correct but too large. Generate a fresh composition, not an edit. Make the entire object markedly smaller and center it. Keep every extreme endpoint inside the central 16%-84% rectangle, target at least 18% empty background on all four sides, and keep the visible-object bounding box at or below 64% of both canvas width and height. Do not add, remove, coil, bend or shorten parts to achieve this; preserve the complete named form.
```

## 排除项

Item-specific exclusions: No readable inscription, vertical xiao, modern keys, gemstone, glaring polished gold, instrument case or floating music notes. Absolutely no text, pseudo-writing, numerals, seal, signature, logo, watermark text, UI, border, grade frame, collage, multi-view, cropping, broken tip, modern material, specific film or game weapon design, actor, artist, anime, European fantasy, steampunk, Japanese sword, long European crossguard, giant gem, hamon, Damascus swirl, serration, fire blade, neon, bloom, magic circle, aura, colored light column, blood, person, hand, weapon rack, display pedestal, scene, floor, ground, contact shadow, cast shadow, extra unrelated object, duplicate weapon, photographic realism or 3D-render appearance. Preserve any tool-native provenance marker; do not fabricate or erase it.

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：完整兵器剪影；细长件斜置并留足尖、首、杆端，时代装具和手持尺度准确；专项排除：手持人物、兵器架、断尖、欧式巨剑、日本刀、发光刃。
- 品阶信号：选材匀净、接缝细、釉面或金属有克制光泽；布套／木匣较完整（禁：紫色魔光、浮空粒子）。
- 对题：画面必须能辨认为“兵器·奇门笛”里的“金笛”，不得画成同类其他物品。
