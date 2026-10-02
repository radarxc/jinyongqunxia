---
asset_id: por_npc_hongantong__ch08_elder_base
subject_id: npc_hongantong
name: 洪安通
book: ch08_luding
gender: male
age_variant: elder
tier: S
output: assets/default/character/male/ch08/por_npc_hongantong__ch08_elder_base.png
manifest: assets/default/character/male/ch08/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/luding/hongantong_1998_baofang_sina2023.jpg
  use: 第一且唯一面部身份：鲍方饰1998 TVB陈小春版洪安通，已核实来源角色版次并实际view。只取本人可辨五官和骨相，不继承剧照姿态、眼神状态、衣装、发式、背景、他人或字幕水印；项目阶段优先。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二参考只提供暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白。已实际view；完全忽略王语嫣本人面容、年龄、性别、身体、倾头、发髻、白青衣裙、飘带和饰物。水墨和纸纹仅在人物之外，不能侵蚀皮肤、衣料、头发或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 洪安通 · 人物写实修正

## 人物与阶段

- subject_id：npc_hongantong
- book：ch08_luding
- gender：male
- age_variant：elder

## 本轮人物写实规范

鲍方1998本人脸第一、用户图只背景第二；神龙岛教主掌权、教内崩解与致命重伤之前的完整在世态。白须皱纹及旧疤是现稿原著概括待考，确切须长、伤痕位置和身高未逐字核对；旧疤仅可淡化自然不指定形状，尤其不将剧照额间红纹当原著证据。现稿剃额细辫优先，不擅自改上游服制。 单候选出齐优先，不注册或生成。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_hongantong__ch08_elder_base/prompt-9e70d9dff2b0b2c810b6f24b8ec783cac8a0c7a1083a61b83e12f4c30c907530.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT, forehead–nose–chin centreline VERTICAL, both eyes HORIZONTALLY LEVEL. Camera level, chin neutral, head centered over the torso. NO head tilt and NO Dutch angle. Preserve natural facial asymmetry without tilting the head. These rules override every reference pose. Eye focus must follow the stated character condition and never override an explicit visual disability.

Create a REALISTIC Chinese wuxia full-body illustration of 洪安通. Image 1 is the ONLY facial identity source: 鲍方 as this exact character in the 1998 TVB 鹿鼎记 starring 陈小春. Image 2 is ONLY background; it supplies ZERO face or anatomy. Distinct identity must remain recognizable, without sharing another character's face.

身份与阶段：洪安通（npc_hongantong），《鹿鼎记》ch08_luding，清初康熙时期。神龙岛教主掌权、教内崩解与致命重伤之前的完整在世态。老年、确岁待考；高瘦长肢，肩背仍有力，老化筋骨和手部可见，白须垂胸。

本人面容辨识：以鲍方1998洪安通单人图为唯一本人脸：高开阔额、灰白粗眉、明显眉骨与深眼窝，垂老眼袋、较长硬朗脸、瘦颊、宽直鼻梁和较厚鼻尖。鼻唇沟与额纹自然，嘴唇克制平合，白须垂胸。长须遮住的下巴不从像素臆造精确轮廓；不将同演员风清扬、扫地僧或张三丰面容装束混入。

服饰发式：清初海岛教主的完整深蛇青厚长袍、暗赭窄衣缘、普通深色腰带和两只布鞋，向穿着者右侧合襟，领胸完整遮蔽，不堆铠甲。遵本项目非僧道男子发式：剃额、规整灰白细辫落后背，白须垂胸；不沿用剧照披散满头白发、红袍或額間红印，不戴皇帝冠冕。

姿态与器物：端正正面站立，头颈自然竖直、双眼水平、下巴中性，直视前方。双足宽稳、肩胸打开但不单肩耸起，身架高瘦有劲；双手空着，一掌低位稍前、另一掌收于身侧下方，手指自然分离而不结法印。威压来自老年眼神与稳固身架，不咆哮、不侧身卖姿态。

人物画法：美观、精细、完整的写实国风人物插画；自然年龄和骨相，可信肤质、连贯体积与柔和左上漫射光。皮肤、头发、手足、衣料轮廓清楚且实体完整；衣服剪裁连续、衣襟缝线清楚，仅少量宽缓受力褶皱，不以破洞、飞白、碎墨、密集褶皱或纸屑表现真实。低饱和设色配自然肤色，不做照片、电视剧截图、拼贴或三维塑料。原始剧照只保留这个人的可辨面容关系，年龄、视力、发式、服装及器物遵本项目阶段。

参考边界：第一且唯一面部身份：鲍方饰1998 TVB陈小春版洪安通，已核实来源角色版次并实际view。只取本人可辨五官和骨相，不继承剧照姿态、眼神状态、衣装、发式、背景、他人或字幕水印；项目阶段优先。 第二参考只提供暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白。已实际view；完全忽略王语嫣本人面容、年龄、性别、身体、倾头、发髻、白青衣裙、飘带和饰物。水墨和纸纹仅在人物之外，不能侵蚀皮肤、衣料、头发或器物。

背景与交付：背景只取第二图的极淡水墨远山和留白，不出现明确宫殿、家具、神龙岛剧情陈设、清晰建筑、符号或可读字画；脚下少量接触阴影。单人单视图、水平平视、原生竖幅2:3、完整全身；头顶、双手、双足、衣摆、发辫、白须及实际器物端点均入画，四周自然留净空，不用固定占高或头身数字。目标2048×3072不透明PNG，接受工具真实原生2:3尺寸并准确登记，保存原始PNG字节，禁止插值、裁切或重编码。先生成1张候选，基本清晰、主要正面、人物可辨即保存；仅严重身份错误、重大结构错误或不可读才追加，细指、轻微衣装和微角偏差如实记录而不反复重做。全部仍candidate待用户审核，不自动approved。

事实边界：白须皱纹及旧疤是现稿原著概括待考，确切须长、伤痕位置和身高未逐字核对；旧疤仅可淡化自然不指定形状，尤其不将剧照额间红纹当原著证据。现稿剃额细辫优先，不擅自改上游服制。 服色、姿态细化属于项目美术设计，不冒称原著逐字描写。用户本人影视面容授权覆盖旧稿禁演员脸规则；写实人物与单候选规则覆盖旧纸底禁山水、固定比例和两张默认。

完整排除项：不要复制剧照额间红印、满头披散白发、红袍、室内字画；不要僧人光头、青年无须脸、皇帝龙袍、巨型龙冠、龙蛇法器、蛇缠身体；不要临终新伤、残肢或教毁后濒死态。 不要 head tilt、Dutch angle、明显歪头、斜镜头、头向肩倾、偏转侧脸、转身回眸、低头藏眼、仰头或夸张抬下巴；不要共用基线脸、统一美人或硬汉模板、青年化老人、动漫大眼、浓妆、塑料磨皮、照片和截图构图。不要多个人、多人拼图、多视图、裁断头足、缺肢、多肢、严重畸形、手物融合；不要碎布、破洞、飞白缺块、纸纹透肤透衣、墨迹侵蚀脸部、碎片化衣料、密集噪点、无依据污损或风化。不要现代服饰、拉链、腕表、手机、运动鞋、晚清官帽大饰、民国服装、日式服制、欧式奇幻装备、水平镜像或错误衣襟；不要血腥、透明衣物、裸露、恶搞丑化、发光掌法、龙蛇能量、法阵和粒子。不要具体剧情场景、清晰建筑家具、可读文字、伪字、题款、签名、印章、logo、字幕或装饰水印。保留工具本身溯源标识和元数据。

FINAL POSE CHECK: 洪安通 must be FRONT-FACING, head and neck UPRIGHT, centreline VERTICAL, eyes HORIZONTALLY LEVEL, camera level. No head tilt or Dutch angle. Preserve the stated disability and stage; do not copy the reference pose, gaze, clothes or background.
```

## 排除项

不要复制剧照额间红印、满头披散白发、红袍、室内字画；不要僧人光头、青年无须脸、皇帝龙袍、巨型龙冠、龙蛇法器、蛇缠身体；不要临终新伤、残肢或教毁后濒死态。 不要 head tilt、Dutch angle、明显歪头、斜镜头、头向肩倾、偏转侧脸、转身回眸、低头藏眼、仰头或夸张抬下巴；不要共用基线脸、统一美人或硬汉模板、青年化老人、动漫大眼、浓妆、塑料磨皮、照片和截图构图。不要多个人、多人拼图、多视图、裁断头足、缺肢、多肢、严重畸形、手物融合；不要碎布、破洞、飞白缺块、纸纹透肤透衣、墨迹侵蚀脸部、碎片化衣料、密集噪点、无依据污损或风化。不要现代服饰、拉链、腕表、手机、运动鞋、晚清官帽大饰、民国服装、日式服制、欧式奇幻装备、水平镜像或错误衣襟；不要血腥、透明衣物、裸露、恶搞丑化、发光掌法、龙蛇能量、法阵和粒子。不要具体剧情场景、清晰建筑家具、可读文字、伪字、题款、签名、印章、logo、字幕或装饰水印。保留工具本身溯源标识和元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_hongantong__ch08_elder_base.prepared.json`。
