---
asset_id: eq_biyudao
kind: item
name: 碧玉刀
category: weapons
category_name: 兵器
subcategory: 兵器·刀
grade: 地
source: 古龙《七种武器·碧玉刀》
effect: '`grade=9; cat=blade; hands=1; unique=true` **（原创扩展）**'
output: assets/default/item/weapons/eq_biyudao.png
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

# 碧玉刀（`eq_biyudao`）· 兵器 · 地阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 兵器·刀 |
| 品阶 | 地 —— 稀有材质或名家工艺、精细纹理、旧而妥善保存的专属匣；局部玉／银／暗金（禁：金色光柱、满屏宝石） |
| 出处 | 古龙《七种武器·碧玉刀》 |
| 效果字段（只作理解，不画） | `grade=9; cat=blade; hands=1; unique=true` **（原创扩展）** |
| 外观要点（名录） | 碧玉色刀装配窄直背短刀，玉质集中在柄与鞘，非整刃翡翠 **（原创扩展）** |
| 类别专项 | 完整兵器剪影；细长件斜置并留足尖、首、杆端，时代装具和手持尺度准确 |

## 提示词

```text
Use case: stylized-concept. Generate one inventory illustration for 碧玉刀 (eq_biyudao), 兵器·刀, 地 tier. Provenance context: Gu Long Seven Weapons tribute; no dynasty claimed. The two attached approved item baselines control style only: crisp fine dark-gray ink outlines, thin transparent color washes, restrained hand-painted brushwork, low-saturation cool-warm color, and a warm light-gray near-ivory background. Never copy either reference object, silhouette, fittings, composition, color layout, wear pattern, sword design, or book design. Generate an entirely new composition. Subject: one complete narrow straight-backed short saber with muted blue-green jade concentrated in grip fittings and fitted scabbard panels, while the blade remains ordinary refined steel; jade and metal boundaries unmistakable. Any unspecified material, ornament, proportion or wear is an original wuxia extension, not a claimed novel illustration or historical reconstruction. Effect fields inform function only; never draw stats, text, icons or supernatural effects. Grade language: rare material or master craftsmanship, fine controlled texture and an old but carefully preserved finish; use only local jade, silver or muted old-gold accents where the subject calls for them. Grade is expressed only through material, workmanship and preservation. Style: non-photographic and non-3D, clear fine ink contours, thin translucent washes, restrained visible brushwork and clear material boundaries. Lighting is soft from upper left, with only narrow subdued highlights on the object itself and no glow. Composition: 1:1 square, requested 1536x1536, exactly one coherent inventory item centered diagonally or in the clearest natural arrangement, gentle three-quarter view with minimal foreshortening. The entire point, head, shaft end, handle, pommel, tip, chain or cloth edge must be visible. Keep at least 18 percent clear margin on every side where geometry allows; object bounding box must not exceed 76 percent of canvas width or height. No person, hand, rack, scene, floor, ground or shadow. Background: uniform warm light gray near ivory, RGB approximately 230,225,216, with no texture, vignette, gradient, ground plane or contact shadow. Completely unlettered. Item-specific exclusions: No blade made entirely of translucent emerald, no neon green glow, giant gemstone, writing, fantasy dagger or copied screen design. Absolutely no text, pseudo-writing, numerals, seal, signature, logo, watermark text, UI, border, grade frame, collage, multi-view, cropping, broken tip, modern material, specific film or game weapon design, actor, artist, anime, European fantasy, steampunk, Japanese sword, long European crossguard, giant gem, hamon, Damascus swirl, serration, fire blade, neon, bloom, magic circle, aura, colored light column, blood, person, hand, weapon rack, display pedestal, scene, floor, ground, contact shadow, cast shadow, extra unrelated object, duplicate weapon, photographic realism or 3D-render appearance. Preserve any tool-native provenance marker; do not fabricate or erase it. REPAIR PRIORITY: the first candidate was otherwise correct but too large. Generate a fresh composition, not an edit. Make the entire object markedly smaller and center it. Keep every extreme endpoint inside the central 16%-84% rectangle, target at least 18% empty background on all four sides, and keep the visible-object bounding box at or below 64% of both canvas width and height. Do not add, remove, coil, bend or shorten parts to achieve this; preserve the complete named form.
```

## 排除项

Item-specific exclusions: No blade made entirely of translucent emerald, no neon green glow, giant gemstone, writing, fantasy dagger or copied screen design. Absolutely no text, pseudo-writing, numerals, seal, signature, logo, watermark text, UI, border, grade frame, collage, multi-view, cropping, broken tip, modern material, specific film or game weapon design, actor, artist, anime, European fantasy, steampunk, Japanese sword, long European crossguard, giant gem, hamon, Damascus swirl, serration, fire blade, neon, bloom, magic circle, aura, colored light column, blood, person, hand, weapon rack, display pedestal, scene, floor, ground, contact shadow, cast shadow, extra unrelated object, duplicate weapon, photographic realism or 3D-render appearance. Preserve any tool-native provenance marker; do not fabricate or erase it.

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：完整兵器剪影；细长件斜置并留足尖、首、杆端，时代装具和手持尺度准确；专项排除：手持人物、兵器架、断尖、欧式巨剑、日本刀、发光刃。
- 品阶信号：稀有材质或名家工艺、精细纹理、旧而妥善保存的专属匣；局部玉／银／暗金（禁：金色光柱、满屏宝石）。
- 对题：画面必须能辨认为“兵器·刀”里的“碧玉刀”，不得画成同类其他物品。
