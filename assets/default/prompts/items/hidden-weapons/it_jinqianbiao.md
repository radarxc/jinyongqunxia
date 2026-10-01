---
asset_id: it_jinqianbiao
kind: item
name: 金钱镖
category: hidden-weapons
category_name: 暗器
subcategory: 暗器·飞镖
grade: 黄
source: 武侠通用暗器；定级 **（原创扩展）**
effect: '`grade=3; hiddenKind=dart; ammoMul=0.985; hiddenHit=3.6` **（原创扩展）**'
output: assets/default/item/hidden-weapons/it_jinqianbiao.png
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

# 金钱镖（`it_jinqianbiao`）· 暗器 · 黄阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 暗器·飞镖 |
| 品阶 | 黄 —— 常见木、陶、麻、普通钢；结构实用，轻微使用痕，素包装（禁：黄色光、黄框、写“黄”） |
| 出处 | 武侠通用暗器；定级 **（原创扩展）** |
| 效果字段（只作理解，不画） | `grade=3; hiddenKind=dart; ammoMul=0.985; hiddenHit=3.6` **（原创扩展）** |
| 外观要点（名录） | 三枚铜钱形薄镖，方孔但无文字，刃缘克制、掌心尺度 **（原创扩展）** |
| 类别专项 | 名针／飞刀按条目数量整齐并置；机括完整闭合，表现孔、簧、筒但不画发射或命中 |

## 提示词

```text
用途：游戏《天书录》default 风格包的二维武侠物品图鉴候选。 题材：金钱镖（it_jinqianbiao），暗器·飞镖，黄阶 grade=3；跨年代武侠通用语境，定级与形制为原创扩展。 主体：恰好三枚掌心尺度的铜钱形薄镖紧凑并置；方孔完全空白，刃缘克制，不画钱文。 风格：批准双基线的深灰细线、薄层低饱和罩染和克制纸本笔触；材质边界清楚，非摄影、非3D。 构图：1:1、1536×1536，完整居中，四边留白≥12%，包围框≤76%；RGB(230,225,216) 浅暖平底，无场景、地面、投影。 品阶表现：仅以普通铜材、实用冲制、少量磨痕表达黄阶；禁用黄色光、品阶框、文字与数字。 年代：不指定朝代，不冒充古钱或原著外观复原。
```

## 排除项

文字、钱文、伪字、logo、水印文字、UI、拼贴、多视图、截断、人物、手、命中、血迹、发射、弹道线、爆炸、现代材料、影视游戏造型复刻、演员或画师名、摄影、3D、塑料感、霓虹、bloom、魔法阵、光效、品阶框、场景、地面、桌面、投影、渐变背景

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：名针／飞刀按条目数量整齐并置；机括完整闭合，表现孔、簧、筒但不画发射或命中；专项排除：命中人体、血迹、现代枪械化、爆炸、弹道线、零件爆炸图。
- 品阶信号：常见木、陶、麻、普通钢；结构实用，轻微使用痕，素包装（禁：黄色光、黄框、写“黄”）。
- 对题：画面必须能辨认为“暗器·飞镖”里的“金钱镖”，不得画成同类其他物品。
