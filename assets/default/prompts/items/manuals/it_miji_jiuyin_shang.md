---
asset_id: it_miji_jiuyin_shang
kind: item
name: 九阴真经上卷
category: manuals
category_name: 武学秘籍
subcategory: 秘籍·原本
grade: 天
source: 《射雕英雄传》·九阴真经上下卷
effect: '`grade=12; skill=sk_jiuyin; variant=original; maxLayer=10; volume=upper`'
output: assets/default/item/manuals/it_miji_jiuyin_shang.png
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

# 九阴真经上卷（`it_miji_jiuyin_shang`）· 武学秘籍 · 天阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 秘籍·原本 |
| 品阶 | 天 —— 极稀有材质、完整独特轮廓、细密工艺与温润／冷润自然光泽；包装珍贵但克制（禁：自发光、神器光环、天字与星级） |
| 出处 | 《射雕英雄传》·九阴真经上下卷 |
| 效果字段（只作理解，不画） | `grade=12; skill=sk_jiuyin; variant=original; maxLayer=10; volume=upper` |
| 外观要点（名录） | 南宋墨青蝴蝶装册，柔软纸衣、细线缝缀，居中白绢签配篆隶，轻旧 **（原创扩展装帧）**；旧化程度：轻度；大小：中开本 |
| 类别专项 | 单册或名录明确的上下卷；柔软纸书衣、页口、细订线和轻旧化，空题签 |

## 提示词

```text
这是一本武功秘籍的物品图。请只在封面的题签（竖条书签位置）上用端正的楷书竖写书名「九阴真经上卷」，墨色，字迹清晰、笔画准确；不要添加任何其他文字、印章、注释或标记；书本造型、颜色、光影、构图和背景保持完全不变。
```

## 排除项

文字、汉字、伪字、经文、书法、标题、数字、印章、签名、logo、文字水印；现代元素、塑料、拉链、订书钉、现代装帧、人物与手、真人演员脸；在世或近现代画师风格名、影视剧版造型、受保护画作或剧照的复制；演员名、游戏公司名、被借鉴作品名、具体游戏兵器设计、截图或海报构图；日韩动漫、欧美奇幻、赛博朋克、蒸汽朋克；霓虹、魔法阵、bloom、满屏金光、镜面眩光、血腥、裸露、道具堆叠；复杂布景、UI、品阶框、拼贴、多视图、透视畸变、主体截断、任何投影、地面、底纹；商品摄影、照片级写实、3D 渲染；专项排除：经文、招式图、硬皮魔法书、粗绳、大面积破损

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：单册或名录明确的上下卷；柔软纸书衣、页口、细订线和轻旧化，空题签；专项排除：经文、招式图、硬皮魔法书、粗绳、大面积破损。
- 品阶信号：极稀有材质、完整独特轮廓、细密工艺与温润／冷润自然光泽；包装珍贵但克制（禁：自发光、神器光环、天字与星级）。
- 对题：画面必须能辨认为“秘籍·原本”里的“九阴真经上卷”，不得画成同类其他物品。
