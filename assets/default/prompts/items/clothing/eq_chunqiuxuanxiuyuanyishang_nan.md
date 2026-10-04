---
asset_id: eq_chunqiuxuanxiuyuanyishang_nan
kind: item
name: 春秋玄绣缘衣裳·男
category: clothing
category_name: 衣物
subcategory: 衣物·袍服
grade: 地中
source: 春秋；**（原创扩展）**；形制／色系依据：《周礼·天官·染人／内司服／追师／屦人》 https://zh.wikisource.org/zh-hans/周禮/天官冢宰；越地具体制式与女性纁红主色（待考）；八朝素白通用为原创设计，女服逐朝实证（待考）
effect: '`grade=8; slot=body; armorWeight=light; wearer=male; defOutK=0.16; defInK=0.12; eva=2xG`'
output: assets/default/item/clothing/eq_chunqiuxuanxiuyuanyishang_nan.png
manifest: assets/default/item/clothing/manifest.yaml
size: 1536x1536
background: RGB(230,225,216) 不透明均匀浅暖灰底，无投影、无地面
references:
- path: assets/default/item/clothing/eq_chunqiuxunhongxiuyuanyishang_nan.png
  use: 底图：只改主色
- path: assets/default/baseline/item/ref_eq_yitianjian__ch04_base01.png
  use: 画风参考（作者已审）：清楚纤细的深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖、左上柔光、浅暖灰近象牙底；不复制剑本身
- path: assets/default/baseline/item/ref_it_miji_jiuyin_shang__ch02_base01.png
  use: 画风参考（作者已审）：同上；不复制书册、题签与磨损
prompt_source: extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3（未经出图审核）；同款换色编辑，先出本组纁红底图
status: draft
batch: 1
dynasty: 春秋
color: 玄
order: 2
edit_from: eq_chunqiuxunhongxiuyuanyishang_nan
---

# 春秋玄绣缘衣裳·男（`eq_chunqiuxuanxiuyuanyishang_nan`）· 衣物 · 地中阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 衣物·袍服 |
| 品阶 | 地中 —— 稀有材质或名家工艺、精细纹理、旧而妥善保存的专属匣；局部玉／银／暗金（禁：金色光柱、满屏宝石） |
| 出处 | 春秋；**（原创扩展）**；形制／色系依据：《周礼·天官·染人／内司服／追师／屦人》 https://zh.wikisource.org/zh-hans/周禮/天官冢宰；越地具体制式与女性纁红主色（待考）；八朝素白通用为原创设计，女服逐朝实证（待考） |
| 说明（名录） | **（原创扩展）**据先秦衣裳语汇演成春秋玄男衣，上下分裁，以右衽系带收襟。细密花缘绣便于辨识工艺，行路时须束整袖摆；越地裁片仍（待考），颜色不改变防护，也不代表礼制身份。 |
| 属性投影（只作摘要，不画） | `def=62` |
| 效果字段（只作理解，不画） | `grade=8; slot=body; armorWeight=light; wearer=male; defOutK=0.16; defInK=0.12; eva=2xG` |
| 外观要点（名录） | 春秋男款，主色玄；交领右衽上衣与下裳分裁；系带闭襟，及膝上衣，袖不过宽，麻与丝织物；主色玄，细密花缘绣（原创工艺分档），主体材质按形制保持；越地具体制式与女性纁红主色（待考）；单件平展，内外层合为一件衣物；无人物无文字无自发光 **（原创扩展）** |
| 类别专项 | 上下衣裳作为一件装备成套平展，交领右衽与系带清楚，袖摆适中，不用人体撑衣 |

## 提示词

```text
以参考底图 assets/default/item/clothing/eq_chunqiuxunhongxiuyuanyishang_nan.png 为唯一编辑底本，只把衣物现有主色面料从「纁红」改为「玄」（近黑的深暗色，保留可辨织纹）。这是同一款衣物的换色编辑：款式、剪裁、纹样、刺绣、配件、褶皱、材质、构图、光影、背景完全不变；所有结构的位置、比例、线条和纹饰布局都逐一保留，辅色、缘饰与系带颜色保持原样，禁止添加或删去任何物件。只改变主色面料的颜色，保留原有明暗层次、织纹和局部高光，不将改色覆盖到背景或配件。保留底图的纤细墨线、薄层罩染、手绘笔触与原有旧化程度，不重新设计、不重新起稿、不另出不同款式。保持原图1:1画幅、1536×1536尺寸、主体完整、四边留白至少10%、均匀浅暖灰背景，无文字、人物、投影或新增光效。
```

## 排除项

文字、汉字、伪字、经文、书法、标题、数字、印章、签名、logo、文字水印；现代元素、塑料、拉链、订书钉、现代装帧、人物与手、真人演员脸；在世或近现代画师风格名、影视剧版造型、受保护画作或剧照的复制；演员名、游戏公司名、被借鉴作品名、具体游戏兵器设计、截图或海报构图；日韩动漫、欧美奇幻、赛博朋克、蒸汽朋克；霓虹、魔法阵、bloom、满屏金光、镜面眩光、血腥、裸露、道具堆叠；复杂布景、UI、品阶框、拼贴、多视图、透视畸变、主体截断、任何投影、地面、底纹；商品摄影、照片级写实、3D 渲染；专项排除：唐式圆领、现代纽扣、冕旒、后世官服构件

## 质检要点

- 单一完整物品居中，四边留白 ≥ 10%，无地面、无投影、无场景；背景为均匀浅暖灰近象牙底。
- 无文字 / 伪字 / 印章 / 品阶框 / 光效 / 粒子 / 魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、低饱和、左上柔光；不是粗黑描边或平涂色块。
- 类别专项：上下衣裳作为一件装备成套平展，交领右衽与系带清楚，袖摆适中，不用人体撑衣；专项排除：唐式圆领、现代纽扣、冕旒、后世官服构件。
- 品阶信号：稀有材质或名家工艺、精细纹理、旧而妥善保存的专属匣；局部玉／银／暗金（禁：金色光柱、满屏宝石）。
- 对题：画面必须能辨认为“衣物·袍服”里的“春秋玄绣缘衣裳·男”，不得画成同类其他物品。

## 同款换色执行

先取得底图 `eq_chunqiuxunhongxiuyuanyishang_nan` 的 PNG，再按 [gemini-imagegen §4](../../../../../.claude/skills/gemini-imagegen/SKILL.md) 上传、暂存底图。以下登记不套模板；两张画风基线在 references 中保留作对照，实际编辑只上传本组底图。

```js
const id = 'eq_chunqiuxuanxiuyuanyishang_nan';
const O = JSON.parse(localStorage.getItem('claudeGemOpts') || '{}');
O[id] = { template: '', refs: ['assets/default/item/clothing/eq_chunqiuxunhongxiuyuanyishang_nan.png'] };
localStorage.setItem('claudeGemOpts', JSON.stringify(O));
```

- 逐点对比底图：除主色外，结构、纹饰、配件、褶皱、背景和光影均须一致；发现款式漂移就返工。
