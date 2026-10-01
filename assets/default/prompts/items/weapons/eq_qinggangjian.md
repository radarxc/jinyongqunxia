---
asset_id: eq_qinggangjian
kind: item
name: 青钢剑
category: weapons
category_name: 兵器
subcategory: 兵器·剑
grade: 黄
source: '**（原创扩展）**'
effect: '`grade=3; cat=sword; hands=1; mainK=1.00`'
output: assets/default/item/weapons/eq_qinggangjian.png
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

# 青钢剑（`eq_qinggangjian`）· 兵器 · 黄阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 兵器·剑 |
| 品阶 | 黄 —— 常见木、陶、麻、普通钢；结构实用，轻微使用痕，素包装（禁：黄色光、黄框、写“黄”） |
| 出处 | **（原创扩展）** |
| 效果字段（只作理解，不画） | `grade=3; cat=sword; hands=1; mainK=1.00` |
| 外观要点（名录） | 素面直身双刃，黑木柄、黄铜小护手，刃长约七十厘米 **（原创扩展）** |
| 类别专项 | 完整兵器剪影；细长件斜置并留足尖、首、杆端，时代装具和手持尺度准确 |

## 提示词

```text
Use case: stylized-concept. Generate one entirely new composition for eq_qinggangjian, 青钢剑, 兵器·剑, 黄阶, an original generic wuxia weapon; the two attached approved item baselines control style only, never copy their objects, silhouettes, fittings, composition, or wear. Subject: one complete practical Chinese straight double-edged sword, plain straight blade about 70 cm, dark charcoal wood grip, small restrained yellow-brass guard, simple pommel, no scabbard, ordinary steel with slight honest use wear; all unspecified form is original wuxia design, not a claimed historical reconstruction. Grade language: common wood, brass, hemp and ordinary steel, practical construction, light use traces only; no colored aura, grade frame, label, lettering or number. Style: crisp fine dark-gray ink outlines, thin transparent color washes, restrained hand-painted brushwork, low-saturation cool-warm palette, clearly distinct steel, wood and brass materials, non-photographic and non-3D. Composition: 1:1 square, requested 1536x1536, exactly one single weapon centered diagonally in a gentle three-quarter view, entire tip, guard, grip and pommel visible, at least 18 percent clear margin on every side, object bounding box no more than 64 percent of canvas width and height and never more than 76 percent, no person, hand, rack, scene, ground or shadow. Lighting: soft upper-left light, narrow subdued steel edge highlight, no glow or bloom. Background: uniform warm light gray near ivory, RGB approximately 230,225,216, with no texture, gradient, floor or contact shadow. Absolutely no text, pseudo-writing, numerals, seal, signature, logo, watermark text, UI, border, collage, multi-view, cropping, broken tip, modern material, specific film or game weapon design, actor, artist, anime, European fantasy, steampunk, Japanese sword, long crossguard, giant gem, hamon, Damascus swirl, serration, fire blade, neon, magic circle, blood, display pedestal, extra object, duplicate sword, scabbard, photographic realism or 3D-render appearance. Preserve any tool-native provenance marker; do not fabricate or erase it.
```

## 排除项

Absolutely no text, pseudo-writing, numerals, seal, signature, logo, watermark text, UI, border, collage, multi-view, cropping, broken tip, modern material, specific film or game weapon design, actor, artist, anime, European fantasy, steampunk, Japanese sword, long crossguard, giant gem, hamon, Damascus swirl, serration, fire blade, neon, magic circle, blood, display pedestal, extra object, duplicate sword, scabbard, photographic realism or 3D-render appearance. Preserve any tool-native provenance marker; do not fabricate or erase it.

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：完整兵器剪影；细长件斜置并留足尖、首、杆端，时代装具和手持尺度准确；专项排除：手持人物、兵器架、断尖、欧式巨剑、日本刀、发光刃。
- 品阶信号：常见木、陶、麻、普通钢；结构实用，轻微使用痕，素包装（禁：黄色光、黄框、写“黄”）。
- 对题：画面必须能辨认为“兵器·剑”里的“青钢剑”，不得画成同类其他物品。
