---
asset_id: eq_qingbenbaixiuyuanchangpao_nan
kind: item
name: 清本白绣缘长袍·男
category: clothing
category_name: 衣物
subcategory: 衣物·袍服
grade: 地中
source: 清（康熙至乾隆）；出现书界 ch08/ch09/ch11/ch12/ch13/ch14；**（原创扩展）**；形制／色系依据：故宫《第四届专题论坛——清代宫廷服饰探讨》 https://www.dpm.org.cn/learing_detail/258734.html；乾隆红青推广到康熙属原创扩展；本白、浅黄不冒充皇家身份色；八朝素白通用为原创设计，女服逐朝实证（待考）
effect: '`grade=8; slot=body; armorWeight=light; wearer=male; defOutK=0.16; defInK=0.12; eva=2xG`'
output: assets/default/item/clothing/eq_qingbenbaixiuyuanchangpao_nan.png
manifest: assets/default/item/clothing/manifest.yaml
size: 1536x1536
background: RGB(230,225,216) 不透明均匀浅暖灰底，无投影、无地面
references:
- path: assets/default/item/clothing/eq_qinghongqingxiuyuanchangpao_nan.png
  use: 底图：只改主色
- path: assets/default/baseline/item/ref_eq_yitianjian__ch04_base01.png
  use: 画风参考：纤细深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖、左上柔光、浅暖灰近象牙底；不复制剑本身
- path: assets/default/baseline/item/ref_it_miji_jiuyin_shang__ch02_base01.png
  use: 画风参考：同上；不复制书册、题签与磨损
prompt_source: extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3／§4（未经出图审核）；同款换色编辑，先出本组红青底图
status: draft
batch: 8
dynasty: 清
color: 本白
order: 2
edit_from: eq_qinghongqingxiuyuanchangpao_nan
---

# 清本白绣缘长袍·男（`eq_qingbenbaixiuyuanchangpao_nan`）· 衣物 · 地中阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 衣物·袍服 |
| 品阶 | 地中 —— 细密花缘绣与平整精织面料，精细纹理和妥善保存痕迹，绣缘不放大成官阶徽纹 |
| 出处 | 清（康熙至乾隆）；出现书界 ch08/ch09/ch11/ch12/ch13/ch14；**（原创扩展）**；形制／色系依据：故宫《第四届专题论坛——清代宫廷服饰探讨》 https://www.dpm.org.cn/learing_detail/258734.html；乾隆红青推广到康熙属原创扩展；本白、浅黄不冒充皇家身份色；八朝素白通用为原创设计，女服逐朝实证（待考） |
| 说明（名录） | **（原创扩展）**清本白款采用细密花缘绣，圆领右衽长袍保持长身与平袖，行前理顺大襟布纽；同档换色同值，乾隆红青向康熙推广为原创，不凭衣色授身份。 |
| 属性投影（只作摘要，不画） | `def=62` |
| 效果字段（只作理解，不画） | `grade=8; slot=body; armorWeight=light; wearer=male; defOutK=0.16; defInK=0.12; eva=2xG` |
| 外观要点（名录） | 清（康熙至乾隆）男款，主色本白；圆领大襟右衽、布纽、平袖与侧衩；不用马褂短身、补子、马蹄袖；主色本白，细密花缘绣（原创工艺分档），主体材质按形制保持；乾隆红青推广到康熙属原创扩展；本白、浅黄不冒充皇家身份色；单件平展，内外层合为一件衣物；无人物无文字无自发光；圆领大襟右衽长袍、布纽、平袖与侧衩，领袖和摆缘工艺克制，麻丝或丝织料按档保持厚薄；完整平展；取色：带暖意的未染本白，非浅蓝月白 **（原创扩展）** |
| 类别专项 | 圆领大襟右衽长袍、布纽、平袖与侧衩，领袖和摆缘工艺克制，麻丝或丝织料按档保持厚薄；完整平展 |

## 提示词

```text
以参考底图 assets/default/item/clothing/eq_qinghongqingxiuyuanchangpao_nan.png 为唯一编辑底本，只把衣物现有主色面料从「红青」改为「本白」（带暖意的未染本白，非浅蓝月白）。这是同一款衣物的换色编辑：款式、剪裁、纹样、刺绣、配件、褶皱、材质、构图、光影、背景完全不变；逐一保留所有结构的位置、比例、线条和纹饰布局，辅色、缘饰、内层与系带颜色保持原样，禁止添加或删去物件。只改变主色面料的颜色，保留原有明暗层次、织纹和局部高光，不覆盖背景或配件。保留底图的纤细深灰墨线、薄层罩染、手绘笔触与旧化程度，不重新设计、不重新起稿、不另出不同款式。保持原图1:1画幅、1536×1536尺寸、主体完整、四边留白至少10%、均匀浅暖灰背景，无文字、人物、投影或新增光效。
```

## 排除项

文字、汉字、伪字、经文、书法、标题、数字、印章、签名、logo、水印、UI、品阶框；现代材料、塑料、拉链；人物、手、真人演员脸；影视剧造型、受保护画作或剧照复制、演员名或画师名指定风格；日韩动漫、欧美奇幻、赛博朋克、霓虹、魔法阵、bloom、光柱、粒子、镜面眩光、血腥、裸露；复杂布景、地面、投影、底纹、拼贴、多视图、透视畸变、主体截断；商品摄影、照片级写实、3D渲染；专项排除：马褂短身、马蹄袖、补子、龙纹、明黄皇家组合、唐代圆领衫短身、现代旗袍、人形支架

## 质检要点

- 单一完整物品居中，四边留白≥10%，无地面、投影、场景；均匀浅暖灰近象牙底RGB(230,225,216)。
- 无文字、伪字、印章、品阶框、光效、粒子；无人物与手。
- 画风对两张指定基线：纤细深灰墨线、薄层透明罩染、克制笔触、低饱和冷暖、左上柔光。
- 年代／形制：清（康熙至乾隆）；圆领大襟右衽长袍、布纽、平袖与侧衩，领袖和摆缘工艺克制，麻丝或丝织料按档保持厚薄；完整平展；专项排除：马褂短身、马蹄袖、补子、龙纹、明黄皇家组合、唐代圆领衫短身、现代旗袍、人形支架。
- 主色：本白，带暖意的未染本白，非浅蓝月白；辅色、缘饰、内层与金属按名录。
- 品阶信号：细密花缘绣与平整精织面料，精细纹理和妥善保存痕迹，绣缘不放大成官阶徽纹；不以光效、匣盒或官阶构件代替工艺。
- 乾隆红青推广到康熙、具体裁片为原创；女素白逐朝实证、镜带结构及康熙护镜配置保留待考。
- 对题：辨认为“衣物·袍服”中的“清本白绣缘长袍·男”，不从名称和衣色补造身份或额外数值。
- 逐点对照底图：除主色面料外，结构、纹饰、刺绣、配件、内层、褶皱、光影与背景均须相同。

## 同款换色执行

先取得底图 `eq_qinghongqingxiuyuanchangpao_nan` 的PNG，按 [gemini-imagegen §4](../../../../../.claude/skills/gemini-imagegen/SKILL.md) 上传，并用 `await __g.stage()` 暂存。两张基线供画风对照，实际编辑只上传本组底图，不套模板；尚无底图时等待，不独立起稿。
物品要点仅用于核对，实际提交只用本件编辑指令，不另写款式。

```js
const id = 'eq_qingbenbaixiuyuanchangpao_nan';
const O = JSON.parse(localStorage.getItem('claudeGemOpts') || '{}');
O[id] = { template: '', refs: ['assets/default/item/clothing/eq_qinghongqingxiuyuanchangpao_nan.png'] };
localStorage.setItem('claudeGemOpts', JSON.stringify(O));
const P = JSON.parse(localStorage.getItem('claudeGemPrompts') || '{}');
P[id] = "以参考底图 assets/default/item/clothing/eq_qinghongqingxiuyuanchangpao_nan.png 为唯一编辑底本，只把衣物现有主色面料从「红青」改为「本白」（带暖意的未染本白，非浅蓝月白）。这是同一款衣物的换色编辑：款式、剪裁、纹样、刺绣、配件、褶皱、材质、构图、光影、背景完全不变；逐一保留所有结构的位置、比例、线条和纹饰布局，辅色、缘饰、内层与系带颜色保持原样，禁止添加或删去物件。只改变主色面料的颜色，保留原有明暗层次、织纹和局部高光，不覆盖背景或配件。保留底图的纤细深灰墨线、薄层罩染、手绘笔触与旧化程度，不重新设计、不重新起稿、不另出不同款式。保持原图1:1画幅、1536×1536尺寸、主体完整、四边留白至少10%、均匀浅暖灰背景，无文字、人物、投影或新增光效。";
localStorage.setItem('claudeGemPrompts', JSON.stringify(P));
```

再将本件ID放入队列；底图先出并核图入库，换色件后出。禁止代码改色相或整体滤镜；除主色外有变化即返工。
