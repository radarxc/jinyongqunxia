---
asset_id: eq_tangbenbailingwenyuanlingshan_nan
kind: item
name: 唐本白绫纹圆领衫·男
category: clothing
category_name: 衣物
subcategory: 衣物·袍服
grade: 玄上
source: 唐；出现书界 ch10；**（原创扩展）**；形制／色系依据：《新唐书》卷24《车服志》 https://zh.wikisource.org/zh-hans/新唐書/卷024；702年款式细节（待考），初唐轮廓原创转换；八朝素白通用为原创设计，女服逐朝实证（待考）
effect: '`grade=6; slot=body; armorWeight=light; wearer=male; defOutK=0.16; defInK=0.12; eva=2xG`'
output: assets/default/item/clothing/eq_tangbenbailingwenyuanlingshan_nan.png
manifest: assets/default/item/clothing/manifest.yaml
size: 1536x1536
background: RGB(230,225,216) 不透明均匀浅暖灰底，无投影、无地面
references:
- path: assets/default/item/clothing/eq_tangziluolingwenyuanlingshan_nan.png
  use: 底图：只改主色
- path: assets/default/baseline/item/ref_eq_yitianjian__ch04_base01.png
  use: 画风参考（作者已审）：清楚纤细的深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖、左上柔光、浅暖灰近象牙底；不复制剑本身
- path: assets/default/baseline/item/ref_it_miji_jiuyin_shang__ch02_base01.png
  use: 画风参考（作者已审）：同上；不复制书册、题签与磨损
prompt_source: extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3（未经出图审核）；同款换色编辑，先出本组紫罗底图
status: draft
batch: 2
dynasty: 唐
color: 本白
order: 2
edit_from: eq_tangziluolingwenyuanlingshan_nan
---

# 唐本白绫纹圆领衫·男（`eq_tangbenbailingwenyuanlingshan_nan`）· 衣物 · 玄上阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 衣物·袍服 |
| 品阶 | 玄上 —— 克制绫纹暗织与细密接缝；材质按名录，仅在原有织缘表现工艺，不额外放玉银、匣盒或包装 |
| 出处 | 唐；出现书界 ch10；**（原创扩展）**；形制／色系依据：《新唐书》卷24《车服志》 https://zh.wikisource.org/zh-hans/新唐書/卷024；702年款式细节（待考），初唐轮廓原创转换；八朝素白通用为原创设计，女服逐朝实证（待考） |
| 说明（名录） | **（原创扩展）**据唐代车服语汇演成本白男式圆领衫，窄袖、右侧暗系与缺骻便于行路。克制绫纹暗织缘用于衣缘，主色不表示官阶；702年裁片（待考），默认初唐轮廓，同档换色不增防护。 |
| 属性投影（只作摘要，不画） | `def=48` |
| 效果字段（只作理解，不画） | `grade=6; slot=body; armorWeight=light; wearer=male; defOutK=0.16; defInK=0.12; eva=2xG` |
| 外观要点（名录） | 唐男款，主色本白；圆领右侧暗系，窄袖、膝下长摆，两侧缺骻；不用宋代硬直长脚幞头；主色本白，克制绫织暗纹缘（原创工艺分档），主体材质按形制保持；702年款式细节（待考），初唐轮廓原创转换；单件平展，内外层合为一件衣物；无人物无文字无自发光；主材丝绫与细织缘 **（原创扩展）** |
| 类别专项 | 单件圆领窄袖衫平展，右侧暗系与缺骻清楚，领襟不敞开，不用人体撑衣 |

## 提示词

```text
以参考底图 assets/default/item/clothing/eq_tangziluolingwenyuanlingshan_nan.png 为唯一编辑底本，只把衣物现有主色面料从「紫罗」改为「本白」（未染麻丝般的暖白，非浅蓝月白）。这是同一款衣物的换色编辑：款式、剪裁、纹样、刺绣、配件、褶皱、材质、构图、光影、背景完全不变；所有结构的位置、比例、线条和纹饰布局逐一保留，辅色、缘饰与系带颜色保持原样，禁止添加或删去物件。只改变主色面料的颜色，保留原有明暗层次、织纹和局部高光，不将改色覆盖到背景或配件。保留底图的纤细墨线、薄层罩染、手绘笔触与旧化程度，不重新设计、不重新起稿、不另出不同款式。保持原图1:1画幅、1536×1536尺寸、主体完整、四边留白至少10%、均匀浅暖灰背景，无文字、人物、投影或新增光效。
```

## 排除项

文字、汉字、伪字、经文、书法、标题、数字、印章、签名、logo、文字水印；现代元素、塑料、拉链、订书钉、现代装帧、人物与手、真人演员脸；在世或近现代画师风格名、影视剧版造型、受保护画作或剧照的复制；演员名、游戏公司名、被借鉴作品名、具体游戏兵器设计、截图或海报构图；日韩动漫、欧美奇幻、赛博朋克、蒸汽朋克；霓虹、魔法阵、bloom、满屏金光、镜面眩光、血腥、裸露、道具堆叠；复杂布景、UI、品阶框、拼贴、多视图、透视畸变、主体截断、任何投影、地面、底纹；商品摄影、照片级写实、3D 渲染；专项排除：模特、空心人形、盛唐宽袖、宋代襕衫、跨朝官服构件、拉链

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：单件圆领窄袖衫平展，右侧暗系与缺骻清楚，领襟不敞开，不用人体撑衣；专项排除：模特、空心人形、盛唐宽袖、宋代襕衫、跨朝官服构件、拉链。
- 品阶信号：克制绫纹暗织与细密接缝；材质按名录，仅在原有织缘表现工艺，不额外放玉银、匣盒或包装。
- 对题：画面必须能辨认为“衣物·袍服”里的“唐本白绫纹圆领衫·男”，不得画成同类其他物品。

## 同款换色执行

先取得底图 `eq_tangziluolingwenyuanlingshan_nan` 的 PNG，按 [gemini-imagegen §4](../../../../../.claude/skills/gemini-imagegen/SKILL.md) 上传、暂存底图。两张画风基线保留作对照，实际编辑只上传本组底图，不套模板。

```js
const id = 'eq_tangbenbailingwenyuanlingshan_nan';
const O = JSON.parse(localStorage.getItem('claudeGemOpts') || '{}');
O[id] = { template: '', refs: ['assets/default/item/clothing/eq_tangziluolingwenyuanlingshan_nan.png'] };
localStorage.setItem('claudeGemOpts', JSON.stringify(O));
```

登记 claudeGemPrompts[id] 为本件编辑指令，再放入队列。逐点对比底图，除主色外出现结构、纹饰、配件、褶皱、背景或光影变化即返工。禁止代码改色相。
