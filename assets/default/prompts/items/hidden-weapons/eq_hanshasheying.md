---
asset_id: eq_hanshasheying
kind: item
name: 含沙射影
category: hidden-weapons
category_name: 暗器
subcategory: 暗器·机括
grade: 玄
source: 《碧血剑》归属 **（待考：核何铁手一脉与器物形制）**
effect: '`grade=6; hiddenKind=gun; perBattle=3; range=3; aoe=cone; poisonCoat=true` **（原创扩展）**'
output: assets/default/item/hidden-weapons/eq_hanshasheying.png
manifest: assets/default/item/hidden-weapons/manifest.yaml
size: 1536x1536
background: RGB(230,225,216) 不透明均匀浅暖灰底，无投影、无地面
references:
- path: assets/default/baseline/item/ref_eq_yitianjian__ch04_base01.png
  use: 画风参考（作者已审）：清楚纤细的深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖、左上柔光、浅暖灰近象牙底；不复制剑本身
- path: assets/default/baseline/item/ref_it_miji_jiuyin_shang__ch02_base01.png
  use: 画风参考（作者已审）：同上；不复制书册、题签与磨损
prompt_source: manifest:.agents/wt/ART-item-hidden-weapons/assets/default/item/hidden-weapons/manifest.yaml（任务工作区候选）
status: ready
---

# 含沙射影（`eq_hanshasheying`）· 暗器 · 玄阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 暗器·机括 |
| 品阶 | 玄 —— 选材匀净、接缝细、釉面或金属有克制光泽；布套／木匣较完整（禁：紫色魔光、浮空粒子） |
| 出处 | 《碧血剑》归属 **（待考：核何铁手一脉与器物形制）** |
| 效果字段（只作理解，不画） | `grade=6; hiddenKind=gun; perBattle=3; range=3; aoe=cone; poisonCoat=true` **（原创扩展）** |
| 外观要点（名录） | 乌木掌心机匣，黄铜细孔成扇面排列，无火器枪管 **（原创扩展）** |
| 类别专项 | 名针／飞刀按条目数量整齐并置；机括完整闭合，表现孔、簧、筒但不画发射或命中 |

## 提示词

```text
用途：游戏《天书录》default 物品图鉴候选。题材：含沙射影（eq_hanshasheying），暗器·机括，玄上 grade=6；碧血书界 ch07_bixue，明末1630–1645投放语境；何铁手一脉归属与器物形制待考。 主体：一具闭合乌木掌心机匣，黄铜细孔在端部排成扇面；机括完整，无火器枪管、发射或拆件。 风格与构图：批准双基线细墨线、低饱和薄染、浅暖平底；1:1、1536×1536、完整居中、四边留白≥12%、包围框≤76%，无地面投影。
```

## 排除项

文字、伪字、logo、水印、人物、手、命中、血迹、发射、弹道线、爆炸、枪管、现代枪械化、零件爆炸图、影视游戏复刻、摄影、3D、塑料感、霓虹、bloom、魔法阵、品阶框、场景、地面、投影

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：名针／飞刀按条目数量整齐并置；机括完整闭合，表现孔、簧、筒但不画发射或命中；专项排除：命中人体、血迹、现代枪械化、爆炸、弹道线、零件爆炸图。
- 品阶信号：选材匀净、接缝细、釉面或金属有克制光泽；布套／木匣较完整（禁：紫色魔光、浮空粒子）。
- 对题：画面必须能辨认为“暗器·机括”里的“含沙射影”，不得画成同类其他物品。
