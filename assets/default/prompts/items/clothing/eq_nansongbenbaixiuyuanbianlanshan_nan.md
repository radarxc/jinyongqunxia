---
asset_id: eq_nansongbenbaixiuyuanbianlanshan_nan
kind: item
name: 南宋本白绣缘便襕衫·男
category: clothing
category_name: 衣物
subcategory: 衣物·袍服
grade: 地中
source: 南宋；出现书界 ch02/ch03；**（原创扩展）**；形制／色系依据：《宋史》卷153《舆服五·公服／襆头／带》 https://zh.wikisource.org/zh-hans/宋史/卷153；黄昇墓包袱随葬衣物仅作实物裁形依据；八朝素白通用为原创设计，女服逐朝实证（待考）
effect: '`grade=8; slot=body; armorWeight=light; wearer=male; defOutK=0.16; defInK=0.12; eva=2xG`'
output: assets/default/item/clothing/eq_nansongbenbaixiuyuanbianlanshan_nan.png
manifest: assets/default/item/clothing/manifest.yaml
size: 1536x1536
background: RGB(230,225,216) 不透明均匀浅暖灰底，无投影、无地面
references:
- path: assets/default/item/clothing/eq_nansongfeihongxiuyuanbianlanshan_nan.png
  use: 底图：只改主色
- path: assets/default/baseline/item/ref_eq_yitianjian__ch04_base01.png
  use: 画风参考（作者已审）：清楚纤细的深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖、左上柔光、浅暖灰近象牙底；不复制剑本身
- path: assets/default/baseline/item/ref_it_miji_jiuyin_shang__ch02_base01.png
  use: 画风参考（作者已审）：同上；不复制书册、题签与磨损
prompt_source: extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3（未经出图审核）；同款换色编辑，先出本组绯红底图
status: draft
batch: 4
dynasty: 南宋
color: 本白
order: 2
edit_from: eq_nansongfeihongxiuyuanbianlanshan_nan
---

# 南宋本白绣缘便襕衫·男（`eq_nansongbenbaixiuyuanbianlanshan_nan`）· 衣物 · 地中阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 衣物·袍服 |
| 品阶 | 地中 —— 细密花缘绣与匀净精织料；花叶细小、针脚清楚，保存妥善，不加光效 |
| 出处 | 南宋；出现书界 ch02/ch03；**（原创扩展）**；形制／色系依据：《宋史》卷153《舆服五·公服／襆头／带》 https://zh.wikisource.org/zh-hans/宋史/卷153；黄昇墓包袱随葬衣物仅作实物裁形依据；八朝素白通用为原创设计，女服逐朝实证（待考） |
| 说明（名录） | **（原创扩展）**据南宋舆服语汇演成本白男式便襕衫，圆领右侧暗系，袖口可束，长摆横襕整齐。细密花缘绣落衣缘，行旅先整袖；绯色不授官阶，裁片为原创转换，同档换色同值。 |
| 属性投影（只作摘要，不画） | `def=62` |
| 效果字段（只作理解，不画） | `grade=8; slot=body; armorWeight=light; wearer=male; defOutK=0.16; defInK=0.12; eva=2xG` |
| 外观要点（名录） | 南宋男款；圆领右侧暗系，袖根宽而袖口可束，横襕长摆；不作紫罗公服；主色本白，细密花缘绣（原创工艺分档），主体材质按形制保持；黄昇墓殓衣仅作实物裁形依据；单件平展，内外层合为一件衣物；无人物无文字无自发光；麻丝织物，工艺只落衣缘，不另加官服构件 **（原创扩展）** |
| 类别专项 | 便襕衫单件平展，圆领右侧暗系、可束袖口与长摆横襕清楚，不用人体撑衣 |

## 提示词

```text
以参考底图 assets/default/item/clothing/eq_nansongfeihongxiuyuanbianlanshan_nan.png 为唯一编辑底本，只把衣物现有主色面料从「绯红」改为「本白」（未染麻丝的暖白，非浅蓝月白）。这是同一款衣物的换色编辑：款式、剪裁、纹样、刺绣、配件、褶皱、材质、构图、光影、背景完全不变；所有结构的位置、比例、线条和纹饰布局逐一保留，辅色、缘饰与系带颜色保持原样，禁止添加或删去物件。只改变主色面料的颜色，保留原有明暗层次、织纹和局部高光，不将改色覆盖到背景或配件。保留底图的纤细深灰墨线、薄层罩染、手绘笔触与旧化程度，不重新设计、不重新起稿、不另出不同款式。保持原图1:1画幅、1536×1536尺寸、主体完整、四边留白至少10%、均匀浅暖灰背景，无文字、人物、投影或新增光效。
```

## 排除项

文字、汉字、伪字、经文、书法、标题、数字、印章、签名、logo、文字水印；现代元素、塑料、拉链、订书钉、现代装帧、人物与手、真人演员脸；在世或近现代画师风格名、影视剧版造型、受保护画作或剧照的复制；演员名、游戏公司名、被借鉴作品名、具体游戏兵器设计、截图或海报构图；日韩动漫、欧美奇幻、赛博朋克、蒸汽朋克；霓虹、魔法阵、bloom、满屏金光、镜面眩光、血腥、裸露、道具堆叠；复杂布景、UI、品阶框、拼贴、多视图、透视畸变、主体截断、任何投影、地面、底纹；商品摄影、照片级写实、3D 渲染；专项排除：模特、空心人形、官阶标识、明清补子、蒙古腰下褶片、现代拉链

## 质检要点

- 单一完整物品居中，四边留白≥10%，无地面、投影、场景；不透明均匀浅暖灰近象牙底RGB(230,225,216)。
- 无文字、伪字、印章、品阶框、光效、粒子或魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、克制笔触、低饱和冷暖、左上柔光。
- 年代／形制：南宋；便襕衫单件平展，圆领右侧暗系、可束袖口与长摆横襕清楚，不用人体撑衣；专项排除：模特、空心人形、官阶标识、明清补子、蒙古腰下褶片、现代拉链。
- 主色：本白，未染麻丝的暖白，非浅蓝月白；缘饰、金属与配件色照名录。
- 品阶信号：细密花缘绣与匀净精织料；花叶细小、针脚清楚，保存妥善，不加光效。
- 黄昇墓包袱随葬衣物仅作裁形依据；不把墓中衣物说成全部穿于遗体的殓服，不虚构墓中披风。
- 对题：辨认为“衣物·袍服”中的“南宋本白绣缘便襕衫·男”，不从颜色或外观新增装备效果。
- 逐点比对底图：除主色面料颜色外，结构、纹饰、刺绣、配件、褶皱、光影与背景均须相同。

## 同款换色执行

先取得底图 `eq_nansongfeihongxiuyuanbianlanshan_nan` 的PNG，按 [gemini-imagegen §4](../../../../../.claude/skills/gemini-imagegen/SKILL.md) 上传并用 `await __g.stage()` 暂存。两张基线用于画风对照，实际编辑只上传本组底图，不套模板；尚无底图时等待，不独立起稿。
物品要点用于名录核对，实际提交只用本件编辑指令，不另写款式。

```js
const id = 'eq_nansongbenbaixiuyuanbianlanshan_nan';
const O = JSON.parse(localStorage.getItem('claudeGemOpts') || '{}');
O[id] = { template: '', refs: ['assets/default/item/clothing/eq_nansongfeihongxiuyuanbianlanshan_nan.png'] };
localStorage.setItem('claudeGemOpts', JSON.stringify(O));
const P = JSON.parse(localStorage.getItem('claudeGemPrompts') || '{}');
P[id] = "以参考底图 assets/default/item/clothing/eq_nansongfeihongxiuyuanbianlanshan_nan.png 为唯一编辑底本，只把衣物现有主色面料从「绯红」改为「本白」（未染麻丝的暖白，非浅蓝月白）。这是同一款衣物的换色编辑：款式、剪裁、纹样、刺绣、配件、褶皱、材质、构图、光影、背景完全不变；所有结构的位置、比例、线条和纹饰布局逐一保留，辅色、缘饰与系带颜色保持原样，禁止添加或删去物件。只改变主色面料的颜色，保留原有明暗层次、织纹和局部高光，不将改色覆盖到背景或配件。保留底图的纤细深灰墨线、薄层罩染、手绘笔触与旧化程度，不重新设计、不重新起稿、不另出不同款式。保持原图1:1画幅、1536×1536尺寸、主体完整、四边留白至少10%、均匀浅暖灰背景，无文字、人物、投影或新增光效。";
localStorage.setItem('claudeGemPrompts', JSON.stringify(P));
```

再将本件ID放入队列；底图先出并核图入库，换色件后出。禁止代码改色相或整体滤镜；除主色外有变化即返工。
