---
asset_id: eq_bingpoyinzhen
kind: item
name: 冰魄银针
category: hidden-weapons
category_name: 暗器
subcategory: 暗器·名针
grade: 地
source: 《神雕侠侣》·李莫愁
effect: '`grade=8; hiddenKind=needle; perBattle=10; onHit=bf_judu; gloveCheck=50%` **（原创扩展）**'
output: assets/default/item/hidden-weapons/eq_bingpoyinzhen.png
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

# 冰魄银针（`eq_bingpoyinzhen`）· 暗器 · 地阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 暗器·名针 |
| 品阶 | 地 —— 稀有材质或名家工艺、精细纹理、旧而妥善保存的专属匣；局部玉／银／暗金（禁：金色光柱、满屏宝石） |
| 出处 | 《神雕侠侣》·李莫愁 |
| 效果字段（只作理解，不画） | `grade=8; hiddenKind=needle; perBattle=10; onHit=bf_judu; gloveCheck=50%` **（原创扩展）** |
| 外观要点（名录） | 银蓝细针十枚装入白瓷针管，冷色金属光、无冰魔法 **（原创扩展形制）** |
| 类别专项 | 名针／飞刀按条目数量整齐并置；机括完整闭合，表现孔、簧、筒但不画发射或命中 |

## 提示词

```text
用途：游戏《天书录》default 物品图鉴候选。题材：冰魄银针（eq_bingpoyinzhen），暗器·名针，地中 grade=8；神雕书界 ch03_shendiao，南宋1237–1259投放语境。 主体：恰好十枚银蓝细针整齐并置于白瓷针管旁，冷色金属光但无冰霜、毒雾或魔法。针管与针形为原创扩展。 风格/构图：批准双基线细墨线、薄层低饱和罩染；1:1、1536×1536、完整居中、留白≥12%、包围框≤76%；浅暖平底，无场景地面投影。
```

## 排除项

文字、伪字、logo、水印、人物、手、命中、血迹、发射、弹道线、冰魔法、毒雾、现代注射针、枪械化、影视游戏复刻、摄影、3D、塑料感、霓虹、bloom、魔法阵、品阶框、场景、地面、投影

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：名针／飞刀按条目数量整齐并置；机括完整闭合，表现孔、簧、筒但不画发射或命中；专项排除：命中人体、血迹、现代枪械化、爆炸、弹道线、零件爆炸图。
- 品阶信号：稀有材质或名家工艺、精细纹理、旧而妥善保存的专属匣；局部玉／银／暗金（禁：金色光柱、满屏宝石）。
- 对题：画面必须能辨认为“暗器·名针”里的“冰魄银针”，不得画成同类其他物品。
