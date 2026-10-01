---
asset_id: eq_liehuoqi
kind: item
name: 烈火旗
category: weapons
category_name: 兵器
subcategory: 兵器·奇门旗
grade: 地
source: 《倚天屠龙记》·明教五行旗 **（待考：核旗本体是否直接作为兵器及原著形制）**
effect: '`grade=9; cat=exotic; exoticKind=misc; hands=2; onHit=bf_zhuoshao:20%` **（原创扩展）**'
output: assets/default/item/weapons/eq_liehuoqi.png
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

# 烈火旗（`eq_liehuoqi`）· 兵器 · 地阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 兵器·奇门旗 |
| 品阶 | 地 —— 稀有材质或名家工艺、精细纹理、旧而妥善保存的专属匣；局部玉／银／暗金（禁：金色光柱、满屏宝石） |
| 出处 | 《倚天屠龙记》·明教五行旗 **（待考：核旗本体是否直接作为兵器及原著形制）** |
| 效果字段（只作理解，不画） | `grade=9; cat=exotic; exoticKind=misc; hands=2; onHit=bf_zhuoshao:20%` **（原创扩展）** |
| 外观要点（名录） | 深红窄幅战旗连乌木长杆与小型铜矛头，旗面无字，整件略高于成人 **（原创扩展）** |
| 类别专项 | 完整兵器剪影；细长件斜置并留足尖、首、杆端，时代装具和手持尺度准确 |

## 提示词

```text
Use case: stylized-concept. Generate one inventory illustration for 烈火旗 (eq_liehuoqi), 兵器·奇门旗, 地 tier. Provenance context: Heaven Sword and Dragon Saber, Ming Cult Five-Element Banners; late-Yuan story context about 1336-1363; use as direct weapon pending textual verification. The two attached approved item baselines control style only: crisp fine dark-gray ink outlines, thin transparent color washes, restrained hand-painted brushwork, low-saturation cool-warm color, and a warm light-gray near-ivory background. Never copy either reference object, silhouette, fittings, composition, color layout, wear pattern, sword design, or book design. Generate an entirely new composition. Subject: one complete narrow deep-red battle flag fixed to a long black-wood staff, small practical copper spearhead at the top, entire object slightly taller than an adult; flag cloth is plain and unlettered. Any unspecified material, ornament, proportion or wear is an original wuxia extension, not a claimed novel illustration or historical reconstruction. Effect fields inform function only; never draw stats, text, icons or supernatural effects. Grade language: rare material or master craftsmanship, fine controlled texture and an old but carefully preserved finish; use only local jade, silver or muted old-gold accents where the subject calls for them. Grade is expressed only through material, workmanship and preservation. Style: non-photographic and non-3D, clear fine ink contours, thin translucent washes, restrained visible brushwork and clear material boundaries. Lighting is soft from upper left, with only narrow subdued highlights on the object itself and no glow. Composition: 1:1 square, requested 1536x1536, exactly one coherent inventory item centered diagonally or in the clearest natural arrangement, gentle three-quarter view with minimal foreshortening. The entire point, head, shaft end, handle, pommel, tip, chain or cloth edge must be visible. Keep at least 18 percent clear margin on every side where geometry allows; object bounding box must not exceed 76 percent of canvas width or height. No person, hand, rack, scene, floor, ground or shadow. Background: uniform warm light gray near ivory, RGB approximately 230,225,216, with no texture, vignette, gradient, ground plane or contact shadow. Completely unlettered. Item-specific exclusions: No fire, flame pattern, burning edge, writing, emblem, army formation, person, wind scene, multiple flags or magical aura. Absolutely no text, pseudo-writing, numerals, seal, signature, logo, watermark text, UI, border, grade frame, collage, multi-view, cropping, broken tip, modern material, specific film or game weapon design, actor, artist, anime, European fantasy, steampunk, Japanese sword, long European crossguard, giant gem, hamon, Damascus swirl, serration, fire blade, neon, bloom, magic circle, aura, colored light column, blood, person, hand, weapon rack, display pedestal, scene, floor, ground, contact shadow, cast shadow, extra unrelated object, duplicate weapon, photographic realism or 3D-render appearance. Preserve any tool-native provenance marker; do not fabricate or erase it. REPAIR PRIORITY: the first candidate was otherwise correct but too large. Generate a fresh composition, not an edit. Make the entire object markedly smaller and center it. Keep every extreme endpoint inside the central 16%-84% rectangle, target at least 18% empty background on all four sides, and keep the visible-object bounding box at or below 64% of both canvas width and height. Do not add, remove, coil, bend or shorten parts to achieve this; preserve the complete named form.
```

## 排除项

Item-specific exclusions: No fire, flame pattern, burning edge, writing, emblem, army formation, person, wind scene, multiple flags or magical aura. Absolutely no text, pseudo-writing, numerals, seal, signature, logo, watermark text, UI, border, grade frame, collage, multi-view, cropping, broken tip, modern material, specific film or game weapon design, actor, artist, anime, European fantasy, steampunk, Japanese sword, long European crossguard, giant gem, hamon, Damascus swirl, serration, fire blade, neon, bloom, magic circle, aura, colored light column, blood, person, hand, weapon rack, display pedestal, scene, floor, ground, contact shadow, cast shadow, extra unrelated object, duplicate weapon, photographic realism or 3D-render appearance. Preserve any tool-native provenance marker; do not fabricate or erase it.

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：完整兵器剪影；细长件斜置并留足尖、首、杆端，时代装具和手持尺度准确；专项排除：手持人物、兵器架、断尖、欧式巨剑、日本刀、发光刃。
- 品阶信号：稀有材质或名家工艺、精细纹理、旧而妥善保存的专属匣；局部玉／银／暗金（禁：金色光柱、满屏宝石）。
- 对题：画面必须能辨认为“兵器·奇门旗”里的“烈火旗”，不得画成同类其他物品。
