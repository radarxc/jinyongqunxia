---
asset_id: eq_yitianjian
kind: item
name: 倚天剑
category: weapons
category_name: 兵器
subcategory: 兵器·剑
grade: 天
source: 《倚天屠龙记》
effect: '`grade=12; cat=sword; divine=true; unique=true`'
output: assets/default/item/weapons/eq_yitianjian.png
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

# 倚天剑（`eq_yitianjian`）· 兵器 · 天阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 兵器·剑 |
| 品阶 | 天 —— 极稀有材质、完整独特轮廓、细密工艺与温润／冷润自然光泽；包装珍贵但克制（禁：自发光、神器光环、天字与星级） |
| 出处 | 《倚天屠龙记》 |
| 效果字段（只作理解，不画） | `grade=12; cat=sword; divine=true; unique=true` |
| 外观要点（名录） | 修长直身双刃、冷青灰钢、镂空卷云护手、墨青缠柄 **（原创扩展形制）** |
| 类别专项 | 完整兵器剪影；细长件斜置并留足尖、首、杆端，时代装具和手持尺度准确 |

## 提示词

```text
Use case: stylized-concept. Generate one inventory illustration for 倚天剑 (eq_yitianjian), 兵器·剑, 天 tier. Provenance context: Heaven Sword and Dragon Saber; late-Yuan story context about 1336-1363; fittings are original. The two attached approved item baselines control style only: crisp fine dark-gray ink outlines, thin transparent color washes, restrained hand-painted brushwork, low-saturation cool-warm color, and a warm light-gray near-ivory background. Never copy either reference object, silhouette, fittings, composition, color layout, wear pattern, sword design, or book design. Generate an entirely new composition. Subject: one entirely new complete slender Chinese straight double-edged sword, cold blue-gray steel, an original delicate openwork cloud guard unlike the attached baseline, deep teal wrapped grip and a distinctive restrained ruyi pommel, no scabbard. Any unspecified material, ornament, proportion or wear is an original wuxia extension, not a claimed novel illustration or historical reconstruction. Effect fields inform function only; never draw stats, text, icons or supernatural effects. Grade language: exceptionally rare material, a complete distinctive silhouette, dense controlled craftsmanship and cool or warm natural luster; prestigious but restrained, never magical or self-luminous. Grade is expressed only through material, workmanship and preservation. Style: non-photographic and non-3D, clear fine ink contours, thin translucent washes, restrained visible brushwork and clear material boundaries. Lighting is soft from upper left, with only narrow subdued highlights on the object itself and no glow. Composition: 1:1 square, requested 1536x1536, exactly one coherent inventory item centered diagonally or in the clearest natural arrangement, gentle three-quarter view with minimal foreshortening. The entire point, head, shaft end, handle, pommel, tip, chain or cloth edge must be visible. Keep at least 18 percent clear margin on every side where geometry allows; object bounding box must not exceed 76 percent of canvas width or height. No person, hand, rack, scene, floor, ground or shadow. Background: uniform warm light gray near ivory, RGB approximately 230,225,216, with no texture, vignette, gradient, ground plane or contact shadow. Completely unlettered. Item-specific exclusions: Do not reproduce the attached Yitian sword object, guard, pommel, proportions, diagonal or color placement; no broken blade, scripture cutaway or hidden-scroll depiction. Absolutely no text, pseudo-writing, numerals, seal, signature, logo, watermark text, UI, border, grade frame, collage, multi-view, cropping, broken tip, modern material, specific film or game weapon design, actor, artist, anime, European fantasy, steampunk, Japanese sword, long European crossguard, giant gem, hamon, Damascus swirl, serration, fire blade, neon, bloom, magic circle, aura, colored light column, blood, person, hand, weapon rack, display pedestal, scene, floor, ground, contact shadow, cast shadow, extra unrelated object, duplicate weapon, photographic realism or 3D-render appearance. Preserve any tool-native provenance marker; do not fabricate or erase it.
```

## 排除项

Item-specific exclusions: Do not reproduce the attached Yitian sword object, guard, pommel, proportions, diagonal or color placement; no broken blade, scripture cutaway or hidden-scroll depiction. Absolutely no text, pseudo-writing, numerals, seal, signature, logo, watermark text, UI, border, grade frame, collage, multi-view, cropping, broken tip, modern material, specific film or game weapon design, actor, artist, anime, European fantasy, steampunk, Japanese sword, long European crossguard, giant gem, hamon, Damascus swirl, serration, fire blade, neon, bloom, magic circle, aura, colored light column, blood, person, hand, weapon rack, display pedestal, scene, floor, ground, contact shadow, cast shadow, extra unrelated object, duplicate weapon, photographic realism or 3D-render appearance. Preserve any tool-native provenance marker; do not fabricate or erase it.

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：完整兵器剪影；细长件斜置并留足尖、首、杆端，时代装具和手持尺度准确；专项排除：手持人物、兵器架、断尖、欧式巨剑、日本刀、发光刃。
- 品阶信号：极稀有材质、完整独特轮廓、细密工艺与温润／冷润自然光泽；包装珍贵但克制（禁：自发光、神器光环、天字与星级）。
- 对题：画面必须能辨认为“兵器·剑”里的“倚天剑”，不得画成同类其他物品。
