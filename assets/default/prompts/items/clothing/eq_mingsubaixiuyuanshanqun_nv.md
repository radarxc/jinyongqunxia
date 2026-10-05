---
asset_id: eq_mingsubaixiuyuanshanqun_nv
kind: item
name: 明素白绣缘衫裙·女
category: clothing
category_name: 衣物
subcategory: 衣物·衫裙
grade: 地中
source: 明；出现书界 ch05/ch06；**（原创扩展）**；形制／色系依据：故宫董进《图说明代宫廷服饰（九）——后妃吉服与便服》 https://img.dpm.org.cn/Uploads/File/2020/04/27/u5ea6aea86025c.pdf；官仪服色不直接等同江湖常服；八朝素白通用为原创设计，女服逐朝实证（待考）；公服／女服用色并参《明史》卷67《舆服三·公服／士庶妻冠服》 https://zh.wikisource.org/zh-hans/明史/卷67
effect: '`grade=8; slot=body; armorWeight=light; wearer=female; defOutK=0.16; defInK=0.12; eva=2xG`'
output: assets/default/item/clothing/eq_mingsubaixiuyuanshanqun_nv.png
manifest: assets/default/item/clothing/manifest.yaml
size: 1536x1536
background: RGB(230,225,216) 不透明均匀浅暖灰底，无投影、无地面
references:
- path: assets/default/item/clothing/eq_mingcaolvxiuyuanshanqun_nv.png
  use: 底图：只改主色
- path: assets/default/baseline/item/ref_eq_yitianjian__ch04_base01.png
  use: 画风参考：清楚纤细的深灰墨线、薄层透明罩染、克制手绘笔触、低饱和冷暖、左上柔光、浅暖灰近象牙底；不复制剑本身
- path: assets/default/baseline/item/ref_it_miji_jiuyin_shang__ch02_base01.png
  use: 画风参考：同上；不复制书册、题签与磨损
prompt_source: extract_item_prompts.py；按九列核对，补足 item.md §8 与 design/27 §3（未经出图审核）；同款换色编辑，先出本组草绿底图
status: draft
batch: 6
dynasty: 明
color: 素白
order: 2
edit_from: eq_mingcaolvxiuyuanshanqun_nv
---

# 明素白绣缘衫裙·女（`eq_mingsubaixiuyuanshanqun_nv`）· 衣物 · 地中阶

## 物品要点

| 项 | 内容 |
|---|---|
| 子类 | 衣物·衫裙 |
| 品阶 | 地中 —— 细密花纹绣缘与精细织纹，妥善保存，不堆宝石、不加光效 |
| 出处 | 明；出现书界 ch05/ch06；**（原创扩展）**；形制／色系依据：故宫董进《图说明代宫廷服饰（九）——后妃吉服与便服》 https://img.dpm.org.cn/Uploads/File/2020/04/27/u5ea6aea86025c.pdf；官仪服色不直接等同江湖常服；八朝素白通用为原创设计，女服逐朝实证（待考）；公服／女服用色并参《明史》卷67《舆服三·公服／士庶妻冠服》 https://zh.wikisource.org/zh-hans/明史/卷67 |
| 说明（名录） | **（原创扩展）**据明代衫裙语汇演成素白女式衫裙，交领右衽短衫与前后平幅、侧密褶长裙合为一件外衣。细密花纹绣缘落衣裙缘，行走先整裙带；同档换色同值，素白跨朝常服实证待考，不以衣色授身份。 |
| 属性投影（只作摘要，不画） | `def=62` |
| 效果字段（只作理解，不画） | `grade=8; slot=body; armorWeight=light; wearer=female; defOutK=0.16; defInK=0.12; eva=2xG` |
| 外观要点（名录） | 明女款，主色素白；交领右衽短衫与褶裙，裙侧密褶、前后平幅；不用大红妆花袄与深青裙的既有组合；主色素白，细密花缘绣（原创工艺分档），主体材质按形制保持；官仪服色不直接等同江湖常服；单件平展，内外层合为一件衣物；无人物无文字无自发光；细密丝织衫裙面，工艺落领袖及裙缘，内层完整，组合只计一件 **（原创扩展）** |
| 类别专项 | 交领右衽短衫与前后平幅、侧密褶长裙成套平展，内层完整；整套只计一件body外衣 |

## 提示词

```text
以参考底图 assets/default/item/clothing/eq_mingcaolvxiuyuanshanqun_nv.png 为唯一编辑底本，只把衣物现有主色面料从「草绿」改为「素白」（柔和素白，非浅蓝月白）。这是同一款衣物的换色编辑：款式、剪裁、纹样、刺绣、配件、褶皱、材质、构图、光影、背景完全不变；所有结构的位置、比例、线条和纹饰布局逐一保留，辅色、缘饰、内层与系带颜色保持原样，禁止添加或删去物件。只改变主色面料的颜色，保留原有明暗层次、织纹和局部高光，不将改色覆盖到背景或配件。保留底图的纤细深灰墨线、薄层罩染、手绘笔触与旧化程度，不重新设计、不重新起稿、不另出不同款式。保持原图1:1画幅、1536×1536尺寸、主体完整、四边留白至少10%、均匀浅暖灰背景，无文字、人物、投影或新增光效。
```

## 排除项

文字、汉字、伪字、经文、书法、标题、数字、印章、签名、logo、文字水印；现代元素、塑料、拉链、订书钉、现代装帧、人物与手、真人演员脸；在世或近现代画师风格名、影视剧版造型、受保护画作或剧照的复制；演员名、游戏公司名、被借鉴作品名、具体游戏兵器设计、截图或海报构图；日韩动漫、欧美奇幻、赛博朋克、蒸汽朋克；霓虹、魔法阵、bloom、满屏金光、镜面眩光、血腥、裸露、道具堆叠；复杂布景、UI、品阶框、拼贴、多视图、透视畸变、主体截断、任何投影、地面、底纹；商品摄影、照片级写实、3D 渲染；专项排除：模特、人形支架、大红妆花袄配深青裙、晚清立领镶滚、现代拉链、服饰堆叠

## 质检要点

- 单一完整物品居中，四边留白≥10%，无地面、投影、场景；不透明均匀浅暖灰近象牙底RGB(230,225,216)。
- 无文字、伪字、印章、品阶框、光效、粒子；无人物与手。
- 画风对两张指定基线：纤细深灰墨线、薄层透明罩染、克制笔触、低饱和冷暖、左上柔光。
- 年代／形制：明；交领右衽短衫与前后平幅、侧密褶长裙成套平展，内层完整；整套只计一件body外衣；专项排除：模特、人形支架、大红妆花袄配深青裙、晚清立领镶滚、现代拉链、服饰堆叠。
- 主色：素白，柔和素白，非浅蓝月白；缘饰、金属与配件色照名录。
- 品阶信号：细密花纹绣缘与精细织纹，妥善保存，不堆宝石、不加光效；不以光效、匣盒或跨朝代官服构件代替工艺。
- 具体裁片为原创转换，公服取色不称庶民偏好排名，不从服饰授予身份。女素白跨朝常服实证保留待考。
- 对题：辨认为“衣物·衫裙”中的“明素白绣缘衫裙·女”，不从颜色、莲纹或名称新增装备效果。
- 逐点比对底图：除主色面料颜色外，结构、纹饰、刺绣、配件、内层、褶皱、光影与背景均须相同。

## 同款换色执行

先取得底图 `eq_mingcaolvxiuyuanshanqun_nv` 的PNG，按 [gemini-imagegen §4](../../../../../.claude/skills/gemini-imagegen/SKILL.md) 上传并用 `await __g.stage()` 暂存。两张基线用于画风对照，实际编辑只上传本组底图，不套模板；尚无底图时等待，不独立起稿。
物品要点用于名录核对，实际提交只用本件编辑指令，不另写款式。

```js
const id = 'eq_mingsubaixiuyuanshanqun_nv';
const O = JSON.parse(localStorage.getItem('claudeGemOpts') || '{}');
O[id] = { template: '', refs: ['assets/default/item/clothing/eq_mingcaolvxiuyuanshanqun_nv.png'] };
localStorage.setItem('claudeGemOpts', JSON.stringify(O));
const P = JSON.parse(localStorage.getItem('claudeGemPrompts') || '{}');
P[id] = "以参考底图 assets/default/item/clothing/eq_mingcaolvxiuyuanshanqun_nv.png 为唯一编辑底本，只把衣物现有主色面料从「草绿」改为「素白」（柔和素白，非浅蓝月白）。这是同一款衣物的换色编辑：款式、剪裁、纹样、刺绣、配件、褶皱、材质、构图、光影、背景完全不变；所有结构的位置、比例、线条和纹饰布局逐一保留，辅色、缘饰、内层与系带颜色保持原样，禁止添加或删去物件。只改变主色面料的颜色，保留原有明暗层次、织纹和局部高光，不将改色覆盖到背景或配件。保留底图的纤细深灰墨线、薄层罩染、手绘笔触与旧化程度，不重新设计、不重新起稿、不另出不同款式。保持原图1:1画幅、1536×1536尺寸、主体完整、四边留白至少10%、均匀浅暖灰背景，无文字、人物、投影或新增光效。";
localStorage.setItem('claudeGemPrompts', JSON.stringify(P));
```

再将本件ID放入队列；底图先出并核图入库，换色件后出。禁止代码改色相或整体滤镜；除主色外有变化即返工。
