---
asset_id: eq_kongqueling
kind: item
name: 孔雀翎
category: hidden-weapons
category_name: 暗器
subcategory: 暗器·机括
grade: 地
source: 古龙《七种武器·孔雀翎》
effect: '`grade=9; hiddenKind=gun; perBattle=1; unique=true; skill=sk_kongquelingfa` **（原创扩展）**'
output: assets/default/item/hidden-weapons/eq_kongqueling.png
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

# 孔雀翎（`eq_kongqueling`）· 暗器 · 地阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 暗器·机括 |
| 品阶 | 地 —— 稀有材质或名家工艺、精细纹理、旧而妥善保存的专属匣；局部玉／银／暗金（禁：金色光柱、满屏宝石） |
| 出处 | 古龙《七种武器·孔雀翎》 |
| 效果字段（只作理解，不画） | `grade=9; hiddenKind=gun; perBattle=1; unique=true; skill=sk_kongquelingfa` **（原创扩展）** |
| 外观要点（名录） | 黄金与青铜复合圆筒机括，端面如收拢孔雀尾，前臂长 **（原创扩展）** |
| 类别专项 | 名针／飞刀按条目数量整齐并置；机括完整闭合，表现孔、簧、筒但不画发射或命中 |

## 提示词

```text
用途：游戏《天书录》default 物品图鉴候选，非商业致敬。题材：孔雀翎（eq_kongqueling），暗器·机括，地上 grade=9；古龙《七种武器·孔雀翎》，跨书界投放不据此断定历史年代。 主体：一件前臂长、黄金与青铜复合的闭合圆筒机括；端面以收拢尾屏般的放射刻线和青蓝圆心表达辨识度，不展开、不发射、不拆件。外观为原创扩展。 风格/构图：批准双基线细墨线、低饱和薄染；1:1、1536×1536、完整居中、留白≥12%、包围框≤76%；浅暖平底，无地面投影。
```

## 排除项

文字、伪字、logo、水印、人物、手、孔雀整鸟、展开羽翼、发射、命中、血迹、弹道、爆炸、现代枪械化、零件爆炸图、影视游戏复刻、摄影、3D、塑料感、霓虹、bloom、魔法阵、品阶框、场景、地面、投影

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：名针／飞刀按条目数量整齐并置；机括完整闭合，表现孔、簧、筒但不画发射或命中；专项排除：命中人体、血迹、现代枪械化、爆炸、弹道线、零件爆炸图。
- 品阶信号：稀有材质或名家工艺、精细纹理、旧而妥善保存的专属匣；局部玉／银／暗金（禁：金色光柱、满屏宝石）。
- 对题：画面必须能辨认为“暗器·机括”里的“孔雀翎”，不得画成同类其他物品。
