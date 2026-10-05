---
asset_id: eq_yuansubaijingxiukuanxiupao_nv
kind: item
name: 元素白精绣宽袖袍·女
category: clothing
category_name: 衣物
subcategory: 衣物·衫裙
grade: 地上
source: 元；出现书界 ch04；**（原创扩展）**；形制／色系依据：故宫《蒙元时期的罟罟冠》 https://www.dpm.org.cn/explode/others/210566.html；女性绛红袍色从首服借色，袍面偏好（待考）；八朝素白通用为原创设计，女服逐朝实证（待考）
effect: '`grade=9; slot=body; armorWeight=light; wearer=female; defOutK=0.16; defInK=0.12; eva=2xG`'
output: assets/default/item/clothing/eq_yuansubaijingxiukuanxiupao_nv.png
manifest: assets/default/item/clothing/manifest.yaml
size: 1536x1536
background: RGB(230,225,216) 不透明均匀浅暖灰底，无投影、无地面
references:
- path: assets/default/item/clothing/eq_yuanjianghongjingxiukuanxiupao_nv.png
  use: 底图：只改主色
- path: assets/default/baseline/item/ref_eq_yitianjian__ch04_base01.png
  use: 画风参考（作者已审）：清楚纤细的深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖、左上柔光、浅暖灰近象牙底；不复制剑本身
- path: assets/default/baseline/item/ref_it_miji_jiuyin_shang__ch02_base01.png
  use: 画风参考（作者已审）：同上；不复制书册、题签与磨损
prompt_source: extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3（未经出图审核）；同款换色编辑，先出本组绛红底图
status: draft
batch: 5
dynasty: 元
color: 素白
order: 2
edit_from: eq_yuanjianghongjingxiukuanxiupao_nv
---

# 元素白精绣宽袖袍·女（`eq_yuansubaijingxiukuanxiupao_nv`）· 衣物 · 地上阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 衣物·衫裙 |
| 品阶 | 地上 —— 精织与双丝细绣缘、细密匀净工艺，妥善保存，主材不因高档替换 |
| 出处 | 元；出现书界 ch04；**（原创扩展）**；形制／色系依据：故宫《蒙元时期的罟罟冠》 https://www.dpm.org.cn/explode/others/210566.html；女性绛红袍色从首服借色，袍面偏好（待考）；八朝素白通用为原创设计，女服逐朝实证（待考） |
| 说明（名录） | **（原创扩展）**依蒙元贵妇袍形语汇演成素白女式宽袖袍，大襟右衽、长摆侧衩与完整内层相合。精织双丝细绣缘落袍缘，收存前理顺宽袖；贵妇廓形推广为原创，绛红袍面与素白常服实证待考，同档换色同值。 |
| 属性投影（只作摘要，不画） | `def=67` |
| 效果字段（只作理解，不画） | `grade=9; slot=body; armorWeight=light; wearer=female; defOutK=0.16; defInK=0.12; eva=2xG` |
| 外观要点（名录） | 元女款，主色素白；大襟右衽宽袖直袍，长摆与侧衩；贵妇廓形推广至六档为原创扩展，红色袍面偏好（待考）；主色素白，精织双丝细绣缘（原创工艺分档），主体材质按形制保持；女性绛红袍色从首服借色，袍面偏好（待考）；单件平展，内外层合为一件衣物；无人物无文字无自发光；精织丝面与双丝细绣缘，工艺只按档位落袍缘，内层完整，不另加官阶构件 **（原创扩展）** |
| 类别专项 | 宽袖直袍单件平展，大襟右衽、长摆侧衩与内层完整，宽袖自然摊开，不用人体撑衣 |

## 提示词

```text
以参考底图 assets/default/item/clothing/eq_yuanjianghongjingxiukuanxiupao_nv.png 为唯一编辑底本，只把衣物现有主色面料从「绛红」改为「素白」（柔和素白，非浅蓝月白，不以素白默认丧服）。这是同一款衣物的换色编辑：款式、剪裁、纹样、刺绣、配件、褶皱、材质、构图、光影、背景完全不变；所有结构的位置、比例、线条和纹饰布局逐一保留，辅色、缘饰与系带颜色保持原样，禁止添加或删去物件。只改变主色面料的颜色，保留原有明暗层次、织纹和局部高光，不将改色覆盖到背景或配件。保留底图的纤细深灰墨线、薄层罩染、手绘笔触与旧化程度，不重新设计、不重新起稿、不另出不同款式。保持原图1:1画幅、1536×1536尺寸、主体完整、四边留白至少10%、均匀浅暖灰背景，无文字、人物、投影或新增光效。
```

## 排除项

文字、汉字、伪字、经文、书法、标题、数字、印章、签名、logo、文字水印；现代元素、塑料、拉链、订书钉、现代装帧、人物与手、真人演员脸；在世或近现代画师风格名、影视剧版造型、受保护画作或剧照的复制；演员名、游戏公司名、被借鉴作品名、具体游戏兵器设计、截图或海报构图；日韩动漫、欧美奇幻、赛博朋克、蒸汽朋克；霓虹、魔法阵、bloom、满屏金光、镜面眩光、血腥、裸露、道具堆叠；复杂布景、UI、品阶框、拼贴、多视图、透视畸变、主体截断、任何投影、地面、底纹；商品摄影、照片级写实、3D 渲染；专项排除：模特、人形支架、现代旗袍、马蹄袖、露胸透衣、额外珠饰罟罟冠

## 质检要点

- 单一完整物品居中，四边留白≥10%，无地面、投影、场景；不透明均匀浅暖灰近象牙底RGB(230,225,216)。
- 无文字、伪字、印章、品阶框、光效、粒子或魔法特效；无人物与手。
- 画风对两张基线：纤细深灰墨线、薄层透明罩染、克制笔触、低饱和冷暖、左上柔光。
- 年代／形制：元；宽袖直袍单件平展，大襟右衽、长摆侧衩与内层完整，宽袖自然摊开，不用人体撑衣；专项排除：模特、人形支架、现代旗袍、马蹄袖、露胸透衣、额外珠饰罟罟冠。
- 主色：素白，柔和素白，非浅蓝月白，不以素白默认丧服；缘饰、金属与配件色照名录。
- 品阶信号：精织与双丝细绣缘、细密匀净工艺，妥善保存，主材不因高档替换。
- 女绛红袍面借色与素白常服实证保留待考；贵妇廓形推广为原创，不以取色宣称史实偏好排行。
- 对题：辨认为“衣物·衫裙”中的“元素白精绣宽袖袍·女”，不从颜色或外观新增装备效果。
- 逐点比对底图：除主色面料颜色外，结构、纹饰、刺绣、配件、褶皱、光影与背景均须相同。

## 同款换色执行

先取得底图 `eq_yuanjianghongjingxiukuanxiupao_nv` 的PNG，按 [gemini-imagegen §4](../../../../../.claude/skills/gemini-imagegen/SKILL.md) 上传并用 `await __g.stage()` 暂存。两张基线用于画风对照，实际编辑只上传本组底图，不套模板；尚无底图时等待，不独立起稿。
物品要点用于名录核对，实际提交只用本件编辑指令，不另写款式。

```js
const id = 'eq_yuansubaijingxiukuanxiupao_nv';
const O = JSON.parse(localStorage.getItem('claudeGemOpts') || '{}');
O[id] = { template: '', refs: ['assets/default/item/clothing/eq_yuanjianghongjingxiukuanxiupao_nv.png'] };
localStorage.setItem('claudeGemOpts', JSON.stringify(O));
const P = JSON.parse(localStorage.getItem('claudeGemPrompts') || '{}');
P[id] = "以参考底图 assets/default/item/clothing/eq_yuanjianghongjingxiukuanxiupao_nv.png 为唯一编辑底本，只把衣物现有主色面料从「绛红」改为「素白」（柔和素白，非浅蓝月白，不以素白默认丧服）。这是同一款衣物的换色编辑：款式、剪裁、纹样、刺绣、配件、褶皱、材质、构图、光影、背景完全不变；所有结构的位置、比例、线条和纹饰布局逐一保留，辅色、缘饰与系带颜色保持原样，禁止添加或删去物件。只改变主色面料的颜色，保留原有明暗层次、织纹和局部高光，不将改色覆盖到背景或配件。保留底图的纤细深灰墨线、薄层罩染、手绘笔触与旧化程度，不重新设计、不重新起稿、不另出不同款式。保持原图1:1画幅、1536×1536尺寸、主体完整、四边留白至少10%、均匀浅暖灰背景，无文字、人物、投影或新增光效。";
localStorage.setItem('claudeGemPrompts', JSON.stringify(P));
```

再将本件ID放入队列；底图先出并核图入库，换色件后出。禁止代码改色相或整体滤镜；除主色外有变化即返工。
