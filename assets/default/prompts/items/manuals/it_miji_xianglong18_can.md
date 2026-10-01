---
asset_id: it_miji_xianglong18_can
kind: item
name: 降龙十八掌残本
category: manuals
category_name: 武学秘籍
subcategory: 秘籍·残本
grade: 天
source: 《倚天屠龙记》·丐帮降龙掌残传；实体 **（原创扩展）**
effect: '`grade=12; skill=sk_xianglong18; variant=partial; maxLayer=6`'
output: assets/default/item/manuals/it_miji_xianglong18_can.png
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

# 降龙十八掌残本（`it_miji_xianglong18_can`）· 武学秘籍 · 天阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 秘籍·残本 |
| 品阶 | 天 —— 极稀有材质、完整独特轮廓、细密工艺与温润／冷润自然光泽；包装珍贵但克制（禁：自发光、神器光环、天字与星级） |
| 出处 | 《倚天屠龙记》·丐帮降龙掌残传；实体 **（原创扩展）** |
| 效果字段（只作理解，不画） | `grade=12; skill=sk_xianglong18; variant=partial; maxLayer=6` |
| 外观要点（名录） | 旧黄纸残册，竹夹板护持，页角缺损但不散页，无文字 **（原创扩展）** |
| 类别专项 | 单册或名录明确的上下卷；柔软纸书衣、页口、细订线和轻旧化，空题签 |

## 提示词

```text
Keep the complete single book centered with at least 16% empty canvas on every edge (bounding box at most 68% of canvas width and height). Use an absolutely uniform flat RGB(230,225,216) background: no vignette, gradient, texture, floor, or shadow. Critical correction: the visible manuscript itself must be OLD YELLOW FIBROUS PAPER, not blue, gray, black, or cloth-covered. It is a partial damaged manuscript with only small missing page corners, still neatly bound and held between two slim warm bamboo clamping boards integrated along the long edges. No extra cover, no loose pages, no writing, no dragon motif. Use case: stylized-concept
用途：游戏《天书录》default 风格包的二维武侠物品图鉴插画，可供后续图标派生。立即生成一张独立新图；两张输入图只作画风参考，不编辑、不拼贴、不复制其中的剑或书册造型。 题材：降龙十八掌残本（it_miji_xianglong18_can），秘籍·残本，天阶；出处语境：《倚天屠龙记》·丐帮降龙掌残传；实体（原创扩展）。ID、名称和效果只作元数据，画面完全无字。 效果字段：grade=12; skill=sk_xianglong18; variant=partial; maxLayer=6。只用于理解全本、抄本、残本或原本状态；禁止画数值、图标、经文、招式图和魔法特效。 年代：ch04_yitian 倚天书界；元末元顺帝，项目主体年代约1336–1363。年代依据为 docs/design/02-timeline-and-world-tiers.md §1.5 与名录出处；名录标原创扩展者只作原创武侠器物，不冒充原著或文物复原。 参考图：输入图1为倚天剑基线，输入图2为九阴真经基线；二者是唯一图片输入。只取清楚纤细深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖、左上柔光、浅暖灰近象牙底与清晰材质层次；不要复制其物件、轮廓、配色布局、题签位置或磨损。 主体：旧黄纸残册，竹夹板护持，页角缺损但不散页，无文字（原创扩展）。单一完整的被竹夹板夹护残册；缺角有限、页线仍整齐，竹板是装帧一体，不另摆散页。一行一图，只画这一册秘籍及与其装帧不可分的护套、包角、夹板或夹页；保持单一完整物品。 秘籍专项：书衣必须是柔软纸或条目指定的绢纸、皮纸，显示封面、薄页口和细订线或经折结构；轻度旧化，边缘少量毛损。不得画厚硬皮革封壳、金属魔法书、粗绳或错误缝线。 品阶表现：罕见旧黄韧纸、独特残册轮廓和细密修护工艺，以温润竹夹板珍重保护；不发光。品阶只用材质、工艺、包装和旧化表达；禁止彩色光效、品阶框、文字、数字或星级。 风格：清楚纤细的深灰墨线外轮廓，薄层透明罩染，克制而可辨的手绘笔触，低饱和冷暖关系；纸、布、绢、竹、细线材质边界清楚。二维精绘武侠器物，不是照片，不是3D。 构图：1:1 方形，目标 1536×1536；单一完整物品居中，三分之四轻俯视，封面、页口、装订边均可读。物件包围框宽和高都不超过画布 76%，四边留白都至少 12%；任何书角、夹板、护套、缝线与夹页不得截断。 背景：均匀浅暖灰近象牙色，目标 RGB 约 (230,225,216)；无人物、手、场景、桌面、地面、接触投影、落地影、明显底纹或渐变。左上约45度柔光只作用于物体自身，不产生投影，不自发光。 文字：封面、题签、书脊、布套和夹板全部无字、无伪字、无印章、无数字；名称只保留在元数据。 排除项：文字、汉字、伪字、经文、书法、标题、数字、印章、签名、logo、文字水印；招式图、人物、手、人体、演员或画师姓名、具体影视或游戏造型、受保护作品复制；摄影、商品摄影、照片级写实、3D渲染、厚油画、硬皮魔法书、现代书脊、塑料、拉链、订书钉、粗绳、大面积龟裂、过度破损、散页堆；场景、桌面、地面、接触投影、落地影、渐变、底纹；第二件物品、道具堆叠、拼贴、多视图、透视畸变、裁切；UI、品阶框、数字数值、霓虹、bloom、光柱、光环、魔法阵、浮空粒子、巨大宝石、血腥。不要去除或伪造工具自身溯源标识。 专项排除：经文、招式图、硬皮魔法书、粗绳、大面积破损；不用任何具体影视、游戏、演员、画师或作品造型。
```

## 排除项

文字、汉字、伪字、经文、书法、标题、数字、印章、签名、logo、文字水印；招式图、人物、手、人体、演员或画师姓名、具体影视或游戏造型、受保护作品复制；摄影、商品摄影、照片级写实、3D渲染、厚油画、硬皮魔法书、现代书脊、塑料、拉链、订书钉、粗绳、大面积龟裂、过度破损、散页堆；场景、桌面、地面、接触投影、落地影、渐变、底纹；第二件物品、道具堆叠、拼贴、多视图、透视畸变、裁切；UI、品阶框、数字数值、霓虹、bloom、光柱、光环、魔法阵、浮空粒子、巨大宝石、血腥。不要去除或伪造工具自身溯源标识；经文、招式图、硬皮魔法书、粗绳、大面积破损；不用任何具体影视、游戏、演员、画师或作品造型

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：单册或名录明确的上下卷；柔软纸书衣、页口、细订线和轻旧化，空题签；专项排除：经文、招式图、硬皮魔法书、粗绳、大面积破损。
- 品阶信号：极稀有材质、完整独特轮廓、细密工艺与温润／冷润自然光泽；包装珍贵但克制（禁：自发光、神器光环、天字与星级）。
- 对题：画面必须能辨认为“秘籍·残本”里的“降龙十八掌残本”，不得画成同类其他物品。
