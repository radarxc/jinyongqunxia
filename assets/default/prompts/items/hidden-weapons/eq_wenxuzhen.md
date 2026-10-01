---
asset_id: eq_wenxuzhen
kind: item
name: 蚊须针
category: hidden-weapons
category_name: 暗器
subcategory: 暗器·名针
grade: 地
source: 《倚天屠龙记》·殷素素
effect: '`grade=7; hiddenKind=needle; perBattle=15; hit=10; onHit=bf_zhongdu` **（待考是否原著淬毒；玩法原创扩展）**'
output: assets/default/item/hidden-weapons/eq_wenxuzhen.png
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

# 蚊须针（`eq_wenxuzhen`）· 暗器 · 地阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 暗器·名针 |
| 品阶 | 地 —— 稀有材质或名家工艺、精细纹理、旧而妥善保存的专属匣；局部玉／银／暗金（禁：金色光柱、满屏宝石） |
| 出处 | 《倚天屠龙记》·殷素素 |
| 效果字段（只作理解，不画） | `grade=7; hiddenKind=needle; perBattle=15; hit=10; onHit=bf_zhongdu` **（待考是否原著淬毒；玩法原创扩展）** |
| 外观要点（名录） | 极细银针束于黑绸针筒旁，针如蚊须、尺寸纤小 **（原创扩展形制）** |
| 类别专项 | 名针／飞刀按条目数量整齐并置；机括完整闭合，表现孔、簧、筒但不画发射或命中 |

## 提示词

```text
用途：游戏《天书录》default 物品图鉴候选。题材：蚊须针（eq_wenxuzhen），暗器·名针，地下 grade=7；倚天书界 ch04_yitian，元末约1336–1363投放语境。 主体：恰好十五枚极细银针平行束列于黑绸针筒旁，针如蚊须、尺寸纤小；形制为原创扩展。 风格：批准双基线的深灰细线、薄层低饱和罩染、克制纸本笔触。构图：1:1、1536×1536，完整居中、四边留白≥12%、包围框≤76%；浅暖平底，无地面投影。
```

## 排除项

文字、伪字、logo、水印、人物、手、血迹、命中、发射、弹道线、现代注射针、枪械化、零件爆炸图、影视游戏复刻、摄影、3D、塑料感、光效、品阶框、场景、地面、投影

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：名针／飞刀按条目数量整齐并置；机括完整闭合，表现孔、簧、筒但不画发射或命中；专项排除：命中人体、血迹、现代枪械化、爆炸、弹道线、零件爆炸图。
- 品阶信号：稀有材质或名家工艺、精细纹理、旧而妥善保存的专属匣；局部玉／银／暗金（禁：金色光柱、满屏宝石）。
- 对题：画面必须能辨认为“暗器·名针”里的“蚊须针”，不得画成同类其他物品。
