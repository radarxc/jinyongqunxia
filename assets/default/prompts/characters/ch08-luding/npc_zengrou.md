---
asset_id: por_npc_zengrou__ch08_youth_base
subject_id: npc_zengrou
name: 曾柔
book: ch08_luding
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch08/por_npc_zengrou__ch08_youth_base.png
manifest: assets/default/character/female/ch08/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/luding/zengrou_1998_chenanqi_sina2016_2.png
  use: 第一且唯一面部身份：陈安琪饰1998 TVB陈小春版曾柔，已核实来源角色版次并实际view。只取本人可辨五官和骨相，不继承剧照姿态、眼神状态、衣装、发式、背景、他人或字幕水印；项目阶段优先。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二参考只提供暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白。已实际view；完全忽略王语嫣本人面容、年龄、性别、身体、倾头、发髻、白青衣裙、飘带和饰物。水墨和纸纹仅在人物之外，不能侵蚀皮肤、衣料、头发或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 曾柔 · 人物写实修正

## 人物与阶段

- subject_id：npc_zengrou
- book：ch08_luding
- gender：female
- age_variant：youth

## 本轮人物写实规范

陈安琪1998本人脸第一、用户图只背景第二；王屋派冲突与赌局放还之后，尚保留本门行旅身份的青年女弟子。小说确切年龄、骰子数量和收取次序未逐字核对；现稿两枚骰子和无点侧面、灰玫瑰衣色、低髻木簪、普通灰木剑鞘均是明确项目美术选择。保留这些选择，不声称已从剧照或小说确认；不编造原著引文、回目或页码。 单候选出齐优先，不注册或生成。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_zengrou__ch08_youth_base/prompt-840380a9eb2fa40688439bdd3976f03d4f90b323557688e0e23a74bc1ecf5e2d.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT, forehead–nose–chin centreline VERTICAL, both eyes HORIZONTALLY LEVEL. Camera level, chin neutral, head centered over the torso. NO head tilt and NO Dutch angle. Preserve natural facial asymmetry without tilting the head. These rules override every reference pose. Eye focus must follow the stated character condition and never override an explicit visual disability.

Create a REALISTIC Chinese wuxia full-body illustration of 曾柔. Image 1 is the ONLY facial identity source: 陈安琪 as this exact character in the 1998 TVB 鹿鼎记 starring 陈小春. Image 2 is ONLY background; it supplies ZERO face or anatomy. Distinct identity must remain recognizable, without sharing another character's face.

身份与阶段：曾柔（npc_zengrou），《鹿鼎记》ch08_luding，清初康熙时期。王屋派冲突与赌局放还之后，尚保留本门行旅身份的青年女弟子。按现稿十八至二十余岁的年轻成年女性设计；这是项目美术范围，小说确岁待考。身量自然，体态轻盈稳定，温和但有山寨女弟子的警觉。

本人面容辨识：以陈安琪1998曾柔的单人剧照为唯一本人面容：较小而偏圆椭圆的脸，饱满柔和面颊、短圆下巴，细弧眉与自然杏眼，双眼清楚、眼距自然，较细鼻梁和圆小鼻尖，小而上唇略薄的嘴。保留本人眼眉鼻唇比例，不套王语嫣、阿珂、沐剑屏的脸，不夸大为幼童或动漫大眼。温柔自持的闭口神情，轻微自然不对称仍可见。

服饰发式：清初汉族山地女弟子：灰玫瑰色右衽窄袖长袄、深烟灰裙裤、棕色窄布带、两只布鞋。左襟压右襟，领胸完整遮蔽，完整连续衣摆，仅少量自然受力褶皱。黑发收拢编入低髻，用小木簪固定；额前碎发少量自然，不复制剧照双侧发髻、绿衣或围领。衣物完整干净，至多轻微行路尘色，不添加破洞、飞白或污损。

姿态与器物：身体与脸主要朝正前，头颈自然竖直、眼睛同高、视线温和清醒、下巴中性，双足稳定落地。左腰佩一柄普通完整入鞘直剑，朴素灰木鞘与真实挂带，剑鞘端点入画；不是名剑。右手在腰前低位轻拢两枚小骰子，只露没有点数和文字的侧面；小物件确实落在掌指中、不悬浮。两枚是现稿选择而非已核原著数量，骰子是放还故事信物，不作暗器。左手自然靠近鞘侧，不抓裸刃，不安排抛骰动作或赌场场景。

人物画法：美观、精细、完整的写实国风人物插画；自然年龄和骨相，可信肤质、连贯体积与柔和左上漫射光。皮肤、头发、手足、衣料轮廓清楚且实体完整；衣服剪裁连续、衣襟缝线清楚，仅少量宽缓受力褶皱，不以破洞、飞白、碎墨、密集褶皱或纸屑表现真实。低饱和设色配自然肤色，不做照片、电视剧截图、拼贴或三维塑料。原始剧照只保留这个人的可辨面容关系，年龄、视力、发式、服装及器物遵本项目阶段。

参考边界：第一且唯一面部身份：陈安琪饰1998 TVB陈小春版曾柔，已核实来源角色版次并实际view。只取本人可辨五官和骨相，不继承剧照姿态、眼神状态、衣装、发式、背景、他人或字幕水印；项目阶段优先。 第二参考只提供暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白。已实际view；完全忽略王语嫣本人面容、年龄、性别、身体、倾头、发髻、白青衣裙、飘带和饰物。水墨和纸纹仅在人物之外，不能侵蚀皮肤、衣料、头发或器物。

背景与交付：背景只取第二图的极淡水墨远山和留白，不出现明确宫殿、家具、具体剧情陈设、清晰建筑、符号或可读字画；脚下少量接触阴影。单人单视图、水平平视、原生竖幅2:3、完整全身；头顶、双手、双足、衣摆、发辫及实际器物端点均入画，四周自然留净空，不用固定占高或头身数字。目标2048×3072不透明PNG，接受工具真实原生2:3尺寸并准确登记，保存原始PNG字节，禁止插值、裁切或重编码。先生成1张候选，基本清晰、主要正面、人物可辨即保存；仅严重身份错误、重大结构错误或不可读才追加，细指、轻微衣装和微角偏差如实记录而不反复重做。全部仍candidate待用户审核，不自动approved。

事实边界：小说确切年龄、骰子数量和收取次序未逐字核对；现稿两枚骰子和无点侧面、灰玫瑰衣色、低髻木簪、普通灰木剑鞘均是明确项目美术选择。保留这些选择，不声称已从剧照或小说确认；不编造原著引文、回目或页码。 服色、姿态细化属于项目美术设计，不冒称原著逐字描写。用户本人影视面容授权覆盖旧稿禁演员脸规则；写实人物与单候选规则覆盖旧纸底禁山水、固定比例和两张默认。

完整排除项：不要幼童脸、道冠道袍、掌门冠、首领旗帜、飞舞骰子、骰子文字数字或朝向镜头的点数、赌桌赌场、浓妆艳服、名剑或法术；不要把曾柔画成王屋首领、道观住持或赌徒职业；不要复制剧照略转头、室内屏风、绿衣围领或其他人物。 不要 head tilt、Dutch angle、明显歪头、斜镜头、头向肩倾、偏转侧脸、转身回眸、低头藏眼、仰头或夸张抬下巴；不要共用基线脸、统一美人或硬汉模板、动漫大眼、浓妆、塑料磨皮、照片和截图构图。不要多个人、多人拼图、多视图、裁断头足、缺肢、多肢、严重畸形、手物融合；不要碎布、破洞、飞白缺块、纸纹透肤透衣、墨迹侵蚀脸部、碎片化衣料、密集噪点、无依据污损或风化。不要现代服饰、拉链、腕表、手机、运动鞋、晚清官帽大饰、民国服装、日式服制、欧式奇幻装备、水平镜像或错误衣襟；不要血腥、透明衣物、裸露、恶搞丑化、发光掌法、龙蛇能量、法阵和粒子。不要具体剧情场景、清晰建筑家具、可读文字、伪字、题款、签名、印章、logo、字幕或装饰水印。保留工具本身溯源标识和元数据。

FINAL POSE CHECK: 曾柔 must be FRONT-FACING, head and neck UPRIGHT, centreline VERTICAL, eyes HORIZONTALLY LEVEL, camera level. No head tilt or Dutch angle. Preserve the stated disability and stage; do not copy the reference pose, gaze, clothes or background.
```

## 排除项

不要幼童脸、道冠道袍、掌门冠、首领旗帜、飞舞骰子、骰子文字数字或朝向镜头的点数、赌桌赌场、浓妆艳服、名剑或法术；不要把曾柔画成王屋首领、道观住持或赌徒职业；不要复制剧照略转头、室内屏风、绿衣围领或其他人物。 不要 head tilt、Dutch angle、明显歪头、斜镜头、头向肩倾、偏转侧脸、转身回眸、低头藏眼、仰头或夸张抬下巴；不要共用基线脸、统一美人或硬汉模板、动漫大眼、浓妆、塑料磨皮、照片和截图构图。不要多个人、多人拼图、多视图、裁断头足、缺肢、多肢、严重畸形、手物融合；不要碎布、破洞、飞白缺块、纸纹透肤透衣、墨迹侵蚀脸部、碎片化衣料、密集噪点、无依据污损或风化。不要现代服饰、拉链、腕表、手机、运动鞋、晚清官帽大饰、民国服装、日式服制、欧式奇幻装备、水平镜像或错误衣襟；不要血腥、透明衣物、裸露、恶搞丑化、发光掌法、龙蛇能量、法阵和粒子。不要具体剧情场景、清晰建筑家具、可读文字、伪字、题款、签名、印章、logo、字幕或装饰水印。保留工具本身溯源标识和元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_zengrou__ch08_youth_base.prepared.json`。
