---
asset_id: it_xiujian
kind: item
name: 袖箭
category: hidden-weapons
category_name: 暗器
subcategory: 暗器·弩箭
grade: 黄
source: 武侠通用暗器；定级 **（原创扩展）**
effect: '`grade=3; hiddenKind=bolt; ammoMul=0.985; hiddenHit=3.6` **（原创扩展）**'
output: assets/default/item/hidden-weapons/it_xiujian.png
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

# 袖箭（`it_xiujian`）· 暗器 · 黄阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 暗器·弩箭 |
| 品阶 | 黄 —— 常见木、陶、麻、普通钢；结构实用，轻微使用痕，素包装（禁：黄色光、黄框、写“黄”） |
| 出处 | 武侠通用暗器；定级 **（原创扩展）** |
| 效果字段（只作理解，不画） | `grade=3; hiddenKind=bolt; ammoMul=0.985; hiddenHit=3.6` **（原创扩展）** |
| 外观要点（名录） | 小型铜木袖弩与一支短箭并置，无手臂人物，约一掌长 **（原创扩展）** |
| 类别专项 | 名针／飞刀按条目数量整齐并置；机括完整闭合，表现孔、簧、筒但不画发射或命中 |

## 提示词

```text
用途：游戏《天书录》default 风格包二维物品图鉴候选。 题材：袖箭（it_xiujian），暗器·弩箭，黄阶 grade=3；通用前工业武侠语境。 主体：一具约一掌长的小型铜木袖弩机括，与恰好一支短箭并置；机括闭合，无手臂或人物。 风格：批准双基线的深灰细线、低饱和薄罩染与克制纸本笔触；非摄影、非3D。 构图：1:1、1536×1536，单组完整器物居中，四边留白≥12%，包围框≤76%；浅暖平底，无地面或投影。 品阶表现：普通木、铜与钢，结构实用且轻微旧化；禁止发光、品阶框与文字。 年代：不指定朝代；不画现代腕弩、枪械扳机或复合材料。
```

## 排除项

文字、伪字、logo、水印文字、UI、拼贴、多视图、截断、人物、手臂、命中、血迹、发射、弹道线、爆炸、现代枪械化、现代腕弩、零件爆炸图、影视游戏造型复刻、演员或画师名、摄影、3D、塑料感、霓虹、bloom、魔法阵、品阶框、场景、地面、投影

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：名针／飞刀按条目数量整齐并置；机括完整闭合，表现孔、簧、筒但不画发射或命中；专项排除：命中人体、血迹、现代枪械化、爆炸、弹道线、零件爆炸图。
- 品阶信号：常见木、陶、麻、普通钢；结构实用，轻微使用痕，素包装（禁：黄色光、黄框、写“黄”）。
- 对题：画面必须能辨认为“暗器·弩箭”里的“袖箭”，不得画成同类其他物品。
