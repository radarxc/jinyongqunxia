---
asset_id: it_miji_quanzhenxinfa
kind: item
name: 全真心法抄本
category: manuals
category_name: 武学秘籍
subcategory: 秘籍·抄本
grade: 玄
source: 《射雕英雄传》《神雕侠侣》·全真内功；载体 **（原创扩展）**
effect: '`grade=5; skill=sk_quanzhenxinfa; variant=copy; maxLayer=8`'
output: assets/default/item/manuals/it_miji_quanzhenxinfa.png
manifest: assets/default/item/manuals/manifest.yaml
size: 1536x1536
background: RGB(230,225,216) 不透明均匀浅暖灰底，无投影、无地面
references:
- path: assets/default/baseline/item/ref_eq_yitianjian__ch04_base01.png
  use: 画风参考（作者已审）：清楚纤细的深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖、左上柔光、浅暖灰近象牙底；不复制剑本身
- path: assets/default/baseline/item/ref_it_miji_jiuyin_shang__ch02_base01.png
  use: 画风参考（作者已审）：同上；不复制书册、题签与磨损
prompt_source: manifest:assets/default/item/manuals/manifest.yaml（已入库，GPT 审核已过）
status: ready
---

# 全真心法抄本（`it_miji_quanzhenxinfa`）· 武学秘籍 · 玄阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 秘籍·抄本 |
| 品阶 | 玄 —— 选材匀净、接缝细、釉面或金属有克制光泽；布套／木匣较完整（禁：紫色魔光、浮空粒子） |
| 出处 | 《射雕英雄传》《神雕侠侣》·全真内功；载体 **（原创扩展）** |
| 效果字段（只作理解，不画） | `grade=5; skill=sk_quanzhenxinfa; variant=copy; maxLayer=8` |
| 外观要点（名录） | 南宋灰青蝴蝶装软纸册，麻线缝缀，右上月白纸签、瘦楷，道观藏书轻旧化 **（原创扩展）**；旧化程度：轻度；大小：中开本 |
| 类别专项 | 单册或名录明确的上下卷；柔软纸书衣、页口、细订线和轻旧化，空题签 |

## 提示词

```text
这是一本武功秘籍的物品图。请只在封面的题签（竖条书签位置）上用端正的楷书竖写书名「全真心法」，墨色，字迹清晰、笔画准确；不要添加任何其他文字、印章、注释或标记；书本造型、颜色、光影、构图和背景保持完全不变。
```

## 排除项

文字、汉字、伪字、经文、书法、标题、数字、印章、签名、logo、文字水印；现代元素、塑料、拉链、订书钉、现代装帧、人物与手、真人演员脸；在世或近现代画师风格名、影视剧版造型、受保护画作或剧照的复制；演员名、游戏公司名、被借鉴作品名、具体游戏兵器设计、截图或海报构图；日韩动漫、欧美奇幻、赛博朋克、蒸汽朋克；霓虹、魔法阵、bloom、满屏金光、镜面眩光、血腥、裸露、道具堆叠；复杂布景、UI、品阶框、拼贴、多视图、透视畸变、主体截断、任何投影、地面、底纹；商品摄影、照片级写实、3D 渲染；专项排除：经文、招式图、硬皮魔法书、粗绳、大面积破损

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：单册或名录明确的上下卷；柔软纸书衣、页口、细订线和轻旧化，空题签；专项排除：经文、招式图、硬皮魔法书、粗绳、大面积破损。
- 品阶信号：选材匀净、接缝细、釉面或金属有克制光泽；布套／木匣较完整（禁：紫色魔光、浮空粒子）。
- 对题：画面必须能辨认为“秘籍·抄本”里的“全真心法抄本”，不得画成同类其他物品。
