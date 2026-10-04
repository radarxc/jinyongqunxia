---
asset_id: eq_qingsubaixicaihanshishanqun_nv
kind: item
name: 清素白细裁汉式衫裙·女
category: clothing
category_name: 衣物
subcategory: 衣物·衫裙
grade: 玄下
source: 清（康熙至乾隆）；出现书界 ch08/ch09/ch11/ch12/ch13/ch14；**（原创扩展）**；形制／色系依据：中国丝绸博物馆《清代华服上的红色源头》 https://www.chinasilkmuseum.com/gskt/info_319.aspx?itemid=28395；乾隆红青推广到康熙属原创扩展；本白、浅黄不冒充皇家身份色；八朝素白通用为原创设计，女服逐朝实证（待考）
effect: '`grade=4; slot=body; armorWeight=light; wearer=female; defOutK=0.16; defInK=0.12; eva=2xG`'
output: assets/default/item/clothing/eq_qingsubaixicaihanshishanqun_nv.png
manifest: assets/default/item/clothing/manifest.yaml
size: 1536x1536
background: RGB(230,225,216) 不透明均匀浅暖灰底，无投影、无地面
references:
- path: assets/default/item/clothing/eq_qingshuihongxicaihanshishanqun_nv.png
  use: 底图：只改主色
- path: assets/default/baseline/item/ref_eq_yitianjian__ch04_base01.png
  use: 画风参考：纤细深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖、左上柔光、浅暖灰近象牙底；不复制剑本身
- path: assets/default/baseline/item/ref_it_miji_jiuyin_shang__ch02_base01.png
  use: 画风参考：同上；不复制书册、题签与磨损
prompt_source: extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3／§4（未经出图审核）；同款换色编辑，先出本组水红底图
status: draft
batch: 8
dynasty: 清
color: 素白
order: 2
edit_from: eq_qingshuihongxicaihanshishanqun_nv
---

# 清素白细裁汉式衫裙·女（`eq_qingsubaixicaihanshishanqun_nv`）· 衣物 · 玄下阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 衣物·衫裙 |
| 品阶 | 玄下 —— 选材匀净、细织边与密缝，克制布面光泽；玄下不套玄上暗绫工艺 |
| 出处 | 清（康熙至乾隆）；出现书界 ch08/ch09/ch11/ch12/ch13/ch14；**（原创扩展）**；形制／色系依据：中国丝绸博物馆《清代华服上的红色源头》 https://www.chinasilkmuseum.com/gskt/info_319.aspx?itemid=28395；乾隆红青推广到康熙属原创扩展；本白、浅黄不冒充皇家身份色；八朝素白通用为原创设计，女服逐朝实证（待考） |
| 说明（名录） | **（原创扩展）**清素白款采用细织缘与密缝，汉式长衫与长裙合为一件外衣，着装先理顺斜襟与裙带；窄滚边不套晚清宽镶滚，同档换色同值，女素白常服实证（待考）。 |
| 属性投影（只作摘要，不画） | `def=39` |
| 效果字段（只作理解，不画） | `grade=4; slot=body; armorWeight=light; wearer=female; defOutK=0.16; defInK=0.12; eva=2xG` |
| 外观要点（名录） | 清（康熙至乾隆）女款，主色素白；汉式斜襟右衽长衫配长裙，窄滚边；不作灰蓝夹袄或石青旗装吉服，水红不限宫廷；主色素白，细织缘与密缝（原创工艺分档），主体材质按形制保持；乾隆红青推广到康熙属原创扩展；本白、浅黄不冒充皇家身份色；单件平展，内外层合为一件衣物；无人物无文字无自发光；汉式斜襟右衽长衫覆长裙，窄滚边与裙褶清楚；内层、衫与裙合为一件body衣物平展，不画人形支架；取色：柔和素白织物，非浅蓝月白，金属保留材色 **（原创扩展）** |
| 类别专项 | 汉式斜襟右衽长衫覆长裙，窄滚边与裙褶清楚；内层、衫与裙合为一件body衣物平展，不画人形支架 |

## 提示词

```text
以参考底图 assets/default/item/clothing/eq_qingshuihongxicaihanshishanqun_nv.png 为唯一编辑底本，只把衣物现有主色面料从「水红」改为「素白」（柔和素白织物，非浅蓝月白，金属保留材色）。这是同一款衣物的换色编辑：款式、剪裁、纹样、刺绣、配件、褶皱、材质、构图、光影、背景完全不变；逐一保留所有结构的位置、比例、线条和纹饰布局，辅色、缘饰、内层与系带颜色保持原样，禁止添加或删去物件。只改变主色面料的颜色，保留原有明暗层次、织纹和局部高光，不覆盖背景或配件。保留底图的纤细深灰墨线、薄层罩染、手绘笔触与旧化程度，不重新设计、不重新起稿、不另出不同款式。保持原图1:1画幅、1536×1536尺寸、主体完整、四边留白至少10%、均匀浅暖灰背景，无文字、人物、投影或新增光效。
```

## 排除项

文字、汉字、伪字、经文、书法、标题、数字、印章、签名、logo、水印、UI、品阶框；现代材料、塑料、拉链；人物、手、真人演员脸；影视剧造型、受保护画作或剧照复制、演员名或画师名指定风格；日韩动漫、欧美奇幻、赛博朋克、霓虹、魔法阵、bloom、光柱、粒子、镜面眩光、血腥、裸露；复杂布景、地面、投影、底纹、拼贴、多视图、透视畸变、主体截断；商品摄影、照片级写实、3D渲染；专项排除：石青旗装吉服、灰蓝夹袄、晚清宽镶滚、大拉翅、现代修身旗袍、袒露领口、人形支架

## 质检要点

- 单一完整物品居中，四边留白≥10%，无地面、投影、场景；均匀浅暖灰近象牙底RGB(230,225,216)。
- 无文字、伪字、印章、品阶框、光效、粒子；无人物与手。
- 画风对两张指定基线：纤细深灰墨线、薄层透明罩染、克制笔触、低饱和冷暖、左上柔光。
- 年代／形制：清（康熙至乾隆）；汉式斜襟右衽长衫覆长裙，窄滚边与裙褶清楚；内层、衫与裙合为一件body衣物平展，不画人形支架；专项排除：石青旗装吉服、灰蓝夹袄、晚清宽镶滚、大拉翅、现代修身旗袍、袒露领口、人形支架。
- 主色：素白，柔和素白织物，非浅蓝月白，金属保留材色；辅色、缘饰、内层与金属按名录。
- 品阶信号：选材匀净、细织边与密缝，克制布面光泽；玄下不套玄上暗绫工艺；不以光效、匣盒或官阶构件代替工艺。
- 乾隆红青推广到康熙、具体裁片为原创；女素白逐朝实证、镜带结构及康熙护镜配置保留待考。
- 对题：辨认为“衣物·衫裙”中的“清素白细裁汉式衫裙·女”，不从名称和衣色补造身份或额外数值。
- 逐点对照底图：除主色面料外，结构、纹饰、刺绣、配件、内层、褶皱、光影与背景均须相同。

## 同款换色执行

先取得底图 `eq_qingshuihongxicaihanshishanqun_nv` 的PNG，按 [gemini-imagegen §4](../../../../../.claude/skills/gemini-imagegen/SKILL.md) 上传，并用 `await __g.stage()` 暂存。两张基线供画风对照，实际编辑只上传本组底图，不套模板；尚无底图时等待，不独立起稿。
物品要点仅用于核对，实际提交只用本件编辑指令，不另写款式。

```js
const id = 'eq_qingsubaixicaihanshishanqun_nv';
const O = JSON.parse(localStorage.getItem('claudeGemOpts') || '{}');
O[id] = { template: '', refs: ['assets/default/item/clothing/eq_qingshuihongxicaihanshishanqun_nv.png'] };
localStorage.setItem('claudeGemOpts', JSON.stringify(O));
const P = JSON.parse(localStorage.getItem('claudeGemPrompts') || '{}');
P[id] = "以参考底图 assets/default/item/clothing/eq_qingshuihongxicaihanshishanqun_nv.png 为唯一编辑底本，只把衣物现有主色面料从「水红」改为「素白」（柔和素白织物，非浅蓝月白，金属保留材色）。这是同一款衣物的换色编辑：款式、剪裁、纹样、刺绣、配件、褶皱、材质、构图、光影、背景完全不变；逐一保留所有结构的位置、比例、线条和纹饰布局，辅色、缘饰、内层与系带颜色保持原样，禁止添加或删去物件。只改变主色面料的颜色，保留原有明暗层次、织纹和局部高光，不覆盖背景或配件。保留底图的纤细深灰墨线、薄层罩染、手绘笔触与旧化程度，不重新设计、不重新起稿、不另出不同款式。保持原图1:1画幅、1536×1536尺寸、主体完整、四边留白至少10%、均匀浅暖灰背景，无文字、人物、投影或新增光效。";
localStorage.setItem('claudeGemPrompts', JSON.stringify(P));
```

再将本件ID放入队列；底图先出并核图入库，换色件后出。禁止代码改色相或整体滤镜；除主色外有变化即返工。
