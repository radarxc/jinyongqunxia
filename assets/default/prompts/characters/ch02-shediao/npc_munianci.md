---
asset_id: por_npc_munianci__ch02_youth_base
subject_id: npc_munianci
name: 穆念慈
book: ch02_shediao
gender: female
age_variant: youth
tier: A
output: assets/default/character/female/ch02/por_npc_munianci__ch02_youth_base.png
manifest: assets/default/character/female/ch02/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/shediao/munianci_1983_yangpanpan_hk01_20240720.jpg
  use: 第一且唯一面容身份：杨盼盼饰1983 TVB翁美玲版穆念慈，来源角色版次、原图及独立审计已核。只取本人五官骨相，不沿用参考姿势、年龄阶段、衣发器物和背景；本项目阶段优先。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二参考只提供暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白。已实际view；完全忽略王语嫣本人面容、年龄、性别、身体、倾头、发髻、白青衣裙、飘带和饰物。水墨和纸纹仅在人物之外，不能侵蚀皮肤、衣料、头发或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 穆念慈 · 人物写实修正

## 人物与阶段

- subject_id：npc_munianci
- book：ch02_shediao
- gender：female
- age_variant：youth

## 本轮人物写实规范

杨盼盼本人第一，用户图仅背景第二；杨铁心义女，中都比武招亲时具有独立意志的青年女侠；不是后来抱婴母亲阶段。单候选基础立绘，未注册未生成。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_munianci__ch02_youth_base/prompt-75e4bcfacdc8eda3244adfe954c8aeecbf77279e3136e87f43e577c1bb140b20.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT, forehead–nose–chin centreline VERTICAL, both eyes HORIZONTALLY LEVEL. Camera level, chin neutral, head centered over the torso. NO head tilt and NO Dutch angle. Preserve natural facial asymmetry without tilting the head. These rules override every reference pose. Eye focus must follow the stated character condition and never override an explicit visual disability.

Create a REALISTIC Chinese wuxia full-body illustration of 穆念慈. Image 1 is the ONLY facial identity source: 杨盼盼 as this exact role in 1983 TVB 射雕英雄传 starring 翁美玲 and 黄日华. Image 2 supplies ONLY the ink background and ZERO face or anatomy.

身份阶段：穆念慈（npc_munianci），《射雕英雄传》ch02_shediao，南宋、金与蒙古并行。杨铁心义女，中都比武招亲时具有独立意志的青年女侠；不是后来抱婴母亲阶段。约十八至二十岁观感的年轻成年女性，这是项目视觉选段，生卒确岁待考；肩臂灵巧结实，双足稳，清秀而有勇气与自尊。

本人脸部辨识：保留杨盼盼饰穆念慈的本人面容关系：柔和椭圆脸、面颊饱满但下颌自然收窄，圆中略尖而不削锐的下巴；眉尾略挑，双眼自然杏形、眼间距适中，顺直鼻梁、圆小鼻尖，唇峰清楚、自然丰度的下唇。双眼看向正前，不复制剧照歪头、浓眼妆和玫红口红，不改成王语嫣脸或统一锥子脸；温润自然肤质和闭口自持神情。

服饰发式：哑光暗朱红右衽窄袖衫、绛红齐腰长裙，裙内完整长裤、红褐平底布鞋，窄布带收腰。内衬遮蔽胸颈，穿着者左襟压右襟。长发收为利落小髻、深红布带固定，仅少量自然额发；不复制参考的蓝白衣、高花髻、珠饰和浓妆。整衣轮廓连续干净，窄袖适合拳脚，不是舞衣或婚礼嫁衣。

姿态器物：正面平视全身站立，头颈自然竖直、双眼水平、下巴中性，背脊挺拔，重心稳而不僵硬。双手空着，左手低位轻收于身前，右手自然垂落，两只手掌从袖口清楚露出，表现拳脚根基而不作攻击或法印。双足落地，没有剑、绣球、红盖头、婴孩或伴侣，坚韧来自独立目光。

人物画法：美观、精细、完整的写实国风人物插画；自然年龄和骨相，可信肤质、连贯体积与柔和左上漫射光。皮肤、头发、手足、衣料轮廓清楚且实体完整；衣服剪裁连续、衣襟缝线清楚，仅少量宽缓受力褶皱，不以破洞、飞白、碎墨、密集褶皱或纸屑表现真实。低饱和设色配自然肤色，不做照片、电视剧截图、拼贴或三维塑料。原始剧照只保留这个人的可辨面容关系，年龄、视力、发式、服装及器物遵本项目阶段。

参考边界：第一且唯一面容身份：杨盼盼饰1983 TVB翁美玲版穆念慈，来源角色版次、原图及独立审计已核。只取本人五官骨相，不沿用参考姿势、年龄阶段、衣发器物和背景；本项目阶段优先。 第二参考只提供暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白。已实际view；完全忽略王语嫣本人面容、年龄、性别、身体、倾头、发髻、白青衣裙、飘带和饰物。水墨和纸纹仅在人物之外，不能侵蚀皮肤、衣料、头发或器物。

背景与交付：背景只取第二图的极淡水墨远山和留白，不出现明确宫殿、家具、具体剧情陈设、清晰建筑、符号或可读字画；脚下少量接触阴影。单人单视图、水平平视、原生竖幅2:3、完整全身；头顶、双手、双足、衣摆及实际器物端点均入画，四周自然留净空，不用固定占高或头身数字。目标2048×3072不透明PNG，接受工具真实原生2:3尺寸并准确登记，保存原始PNG字节，禁止插值、裁切或重编码。先生成1张候选，基本清晰、主要正面、人物可辨即保存；仅严重身份错误、重大结构错误或不可读才追加，细指、轻微衣装和微角偏差如实记录而不反复重做。全部仍candidate待用户审核，不自动approved。

事实边界：原著指定版本的红衣色度、面貌、发式鞋履及确切年龄未逐字终校；十八至二十观感、暗朱红衫裙、小髻布带和空手静态是现稿项目选择。本人五官依据1983杨盼盼角色剧照覆盖旧原创脸型，不把照片妆发、衣色或身份视为原著证据，不编小说引文和页码。 用户授权本人影视面容覆盖旧禁演员条款；最新单候选、正面头直和背景水墨覆盖旧两张、固定占高及笼统禁山水。

完整排除项：不要抱婴母亲阶段、幼童、依偎杨康、婚礼场景、凤冠霞帔、绣球、红盖头、舞女衣裙、露肩露腰、高开衩、透明衣料；不要长剑或其他无依据专属神兵。不要照抄蓝白剧服、花冠、倾头浓妆；不要明代网巾、清式剃发独辫、马蹄袖、旗装、唐代齐胸裙。 不要 head tilt、Dutch angle、明显歪头、斜镜头、头向肩倾、偏转侧脸、转身回眸、低头藏眼、仰头或夸张抬下巴；不要共用基线脸、统一美人或硬汉模板、动漫大眼、浓妆、塑料磨皮、照片和截图构图。不要多个人、多人拼图、多视图、裁断头足、缺肢、多肢、严重畸形、手物融合；不要碎布、破洞、飞白缺块、纸纹透肤透衣、墨迹侵蚀脸部、碎片化衣料、密集噪点、无依据污损或风化。不要现代服饰、拉链、腕表、手机、运动鞋、晚清官帽大饰、民国服装、日式服制、欧式奇幻装备、水平镜像或错误衣襟；不要血腥、透明衣物、裸露、恶搞丑化、发光掌法、龙蛇能量、法阵和粒子。不要具体剧情场景、清晰建筑家具、可读文字、伪字、题款、签名、印章、logo、字幕或装饰水印。保留工具本身溯源标识和元数据。

FINAL POSE CHECK: 穆念慈 FRONT-FACING, head and neck naturally UPRIGHT, facial centreline VERTICAL, eyes HORIZONTALLY LEVEL, camera level, chin neutral. No head tilt, Dutch angle or copied reference pose.
```

## 排除项

不要抱婴母亲阶段、幼童、依偎杨康、婚礼场景、凤冠霞帔、绣球、红盖头、舞女衣裙、露肩露腰、高开衩、透明衣料；不要长剑或其他无依据专属神兵。不要照抄蓝白剧服、花冠、倾头浓妆；不要明代网巾、清式剃发独辫、马蹄袖、旗装、唐代齐胸裙。 不要 head tilt、Dutch angle、明显歪头、斜镜头、头向肩倾、偏转侧脸、转身回眸、低头藏眼、仰头或夸张抬下巴；不要共用基线脸、统一美人或硬汉模板、动漫大眼、浓妆、塑料磨皮、照片和截图构图。不要多个人、多人拼图、多视图、裁断头足、缺肢、多肢、严重畸形、手物融合；不要碎布、破洞、飞白缺块、纸纹透肤透衣、墨迹侵蚀脸部、碎片化衣料、密集噪点、无依据污损或风化。不要现代服饰、拉链、腕表、手机、运动鞋、晚清官帽大饰、民国服装、日式服制、欧式奇幻装备、水平镜像或错误衣襟；不要血腥、透明衣物、裸露、恶搞丑化、发光掌法、龙蛇能量、法阵和粒子。不要具体剧情场景、清晰建筑家具、可读文字、伪字、题款、签名、印章、logo、字幕或装饰水印。保留工具本身溯源标识和元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_munianci__ch02_youth_base.prepared.json`。
