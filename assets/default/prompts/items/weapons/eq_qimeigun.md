---
asset_id: eq_qimeigun
kind: item
name: 齐眉棍
category: weapons
category_name: 兵器
subcategory: 兵器·棍
grade: 黄
source: 江湖通用；定级 **（原创扩展）**
effect: '`grade=3; cat=staff; hands=2; mainK=1.10`'
output: assets/default/item/weapons/eq_qimeigun.png
manifest: assets/default/item/weapons/manifest.yaml
size: 1536x1536
background: RGB(230,225,216) 不透明均匀浅暖灰底，无投影、无地面
references:
- path: assets/default/baseline/item/ref_eq_yitianjian__ch04_base01.png
  use: 画风参考（作者已审）：清楚纤细的深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖、左上柔光、浅暖灰近象牙底；不复制剑本身
- path: assets/default/baseline/item/ref_it_miji_jiuyin_shang__ch02_base01.png
  use: 画风参考（作者已审）：同上；不复制书册、题签与磨损
prompt_source: manifest:assets/default/item/weapons/manifest.yaml（已入库，GPT 审核已过）
status: ready
---

# 齐眉棍（`eq_qimeigun`）· 兵器 · 黄阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 兵器·棍 |
| 品阶 | 黄 —— 常见木、陶、麻、普通钢；结构实用，轻微使用痕，素包装（禁：黄色光、黄框、写“黄”） |
| 出处 | 江湖通用；定级 **（原创扩展）** |
| 效果字段（只作理解，不画） | `grade=3; cat=staff; hands=2; mainK=1.10` |
| 外观要点（名录） | 深色白蜡木长棍，齐眉长度，两端磨亮，粗细合手 |
| 类别专项 | 完整兵器剪影；细长件斜置并留足尖、首、杆端，时代装具和手持尺度准确 |

## 提示词

```text
Use case: stylized-concept. Generate one inventory illustration for 齐眉棍 (eq_qimeigun), 兵器·棍, 黄 tier. Provenance context: generic premodern jianghu context. The two attached approved item baselines control style only: crisp fine dark-gray ink outlines, thin transparent color washes, restrained hand-painted brushwork, low-saturation cool-warm color, and a warm light-gray near-ivory background. Never copy either reference object, silhouette, fittings, composition, color layout, wear pattern, sword design, or book design. Generate an entirely new composition. Subject: one complete dark waxwood eyebrow-height staff, straight and hand-thick, naturally tapered, both ends smoothly polished by use. Any unspecified material, ornament, proportion or wear is an original wuxia extension, not a claimed novel illustration or historical reconstruction. Effect fields inform function only; never draw stats, text, icons or supernatural effects. Grade language: common wood, brass, hemp, leather and ordinary steel as applicable; practical construction, restrained finish and light honest use wear. Grade is expressed only through material, workmanship and preservation. Style: non-photographic and non-3D, clear fine ink contours, thin translucent washes, restrained visible brushwork and clear material boundaries. Lighting is soft from upper left, with only narrow subdued highlights on the object itself and no glow. Composition: 1:1 square, requested 1536x1536, exactly one coherent inventory item centered diagonally or in the clearest natural arrangement, gentle three-quarter view with minimal foreshortening. The entire point, head, shaft end, handle, pommel, tip, chain or cloth edge must be visible. Keep at least 18 percent clear margin on every side where geometry allows; object bounding box must not exceed 76 percent of canvas width or height. No person, hand, rack, scene, floor, ground or shadow. Background: uniform warm light gray near ivory, RGB approximately 230,225,216, with no texture, vignette, gradient, ground plane or contact shadow. Completely unlettered. Item-specific exclusions: No spearhead, metal mace head, carved writing, multiple sticks or standing display. Absolutely no text, pseudo-writing, numerals, seal, signature, logo, watermark text, UI, border, grade frame, collage, multi-view, cropping, broken tip, modern material, specific film or game weapon design, actor, artist, anime, European fantasy, steampunk, Japanese sword, long European crossguard, giant gem, hamon, Damascus swirl, serration, fire blade, neon, bloom, magic circle, aura, colored light column, blood, person, hand, weapon rack, display pedestal, scene, floor, ground, contact shadow, cast shadow, extra unrelated object, duplicate weapon, photographic realism or 3D-render appearance. Preserve any tool-native provenance marker; do not fabricate or erase it. REPAIR PRIORITY: the first candidate was otherwise correct but too large. Generate a fresh composition, not an edit. Make the entire object markedly smaller and center it. Keep every extreme endpoint inside the central 16%-84% rectangle, target at least 18% empty background on all four sides, and keep the visible-object bounding box at or below 64% of both canvas width and height. Do not add, remove, coil, bend or shorten parts to achieve this; preserve the complete named form.
```

## 排除项

Item-specific exclusions: No spearhead, metal mace head, carved writing, multiple sticks or standing display. Absolutely no text, pseudo-writing, numerals, seal, signature, logo, watermark text, UI, border, grade frame, collage, multi-view, cropping, broken tip, modern material, specific film or game weapon design, actor, artist, anime, European fantasy, steampunk, Japanese sword, long European crossguard, giant gem, hamon, Damascus swirl, serration, fire blade, neon, bloom, magic circle, aura, colored light column, blood, person, hand, weapon rack, display pedestal, scene, floor, ground, contact shadow, cast shadow, extra unrelated object, duplicate weapon, photographic realism or 3D-render appearance. Preserve any tool-native provenance marker; do not fabricate or erase it.

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：完整兵器剪影；细长件斜置并留足尖、首、杆端，时代装具和手持尺度准确；专项排除：手持人物、兵器架、断尖、欧式巨剑、日本刀、发光刃。
- 品阶信号：常见木、陶、麻、普通钢；结构实用，轻微使用痕，素包装（禁：黄色光、黄框、写“黄”）。
- 对题：画面必须能辨认为“兵器·棍”里的“齐眉棍”，不得画成同类其他物品。
