---
asset_id: por_npc_huazheng__ch02_youth_base
subject_id: npc_huazheng
name: 华筝
book: ch02_shediao
gender: female
age_variant: youth
tier: A
output: assets/default/character/female/ch02/por_npc_huazheng__ch02_youth_base.png
manifest: assets/default/character/female/ch02/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/shediao/huazheng_1983_huangzaoshi_sina2022.jpg
  use: 第一且唯一面容身份：黄造时饰1983 TVB翁美玲版华筝，来源角色版次、原图及独立审计已核。只取本人五官骨相，不沿用参考姿势、年龄阶段、衣发器物和背景；本项目阶段优先。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二参考只提供暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白。已实际view；完全忽略王语嫣本人面容、年龄、性别、身体、倾头、发髻、白青衣裙、飘带和饰物。水墨和纸纹仅在人物之外，不能侵蚀皮肤、衣料、头发或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 华筝 · 人物写实修正

## 人物与阶段

- subject_id：npc_huazheng
- book：ch02_shediao
- gender：female
- age_variant：youth

## 本轮人物写实规范

黄造时本人第一，用户图仅背景第二；青年蒙古公主，参与军情与情感选择的大漠生活阶段，尚未离开既有草原生活；不以郭靖婚约归属定义人格。单候选基础立绘，未注册未生成。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_huazheng__ch02_youth_base/prompt-3031d556516114959f2d72f38867d556d882c83b60bec5bb7f57e7035a628048.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT, forehead–nose–chin centreline VERTICAL, both eyes HORIZONTALLY LEVEL. Camera level, chin neutral, head centered over the torso. NO head tilt and NO Dutch angle. Preserve natural facial asymmetry without tilting the head. These rules override every reference pose. Eye focus must follow the stated character condition and never override an explicit visual disability.

Create a REALISTIC Chinese wuxia full-body illustration of 华筝. Image 1 is the ONLY facial identity source: 黄造时 as this exact role in 1983 TVB 射雕英雄传 starring 翁美玲 and 黄日华. Image 2 supplies ONLY the ink background and ZERO face or anatomy.

身份阶段：华筝（npc_huazheng），《射雕英雄传》ch02_shediao，南宋、金与蒙古并行。青年蒙古公主，参与军情与情感选择的大漠生活阶段，尚未离开既有草原生活；不以郭靖婚约归属定义人格。约十八至二十余岁观感的年轻成年女性，项目视觉范围而非确岁。草原成长、熟悉骑射，健康自然肤色，肩背健实而腰腿有行动力，明朗有主见。

本人脸部辨识：保留黄造时饰华筝的本人面容关系：椭圆略长脸、较平的两颊与清楚颧部，下颌向短圆下巴收拢；眉线平直略挑，双眼自然杏形且眼尾微扬，鼻梁顺直而鼻尖圆，上唇较薄、下唇自然饱满。眼神直接明朗、看向正前，肤色轻微日晒而非脏污或夸张族群化；与穆念慈、黄蓉、王语嫣保持不同五官和脸型。

服饰发式：十三世纪蒙古贵族女子简洁骑乘长袍，低饱和蓝绿色、窄赭红衣缘，领口完整合拢并向穿着者右侧系扣，内穿完整长裤及软皮靴，腰束实用革带。黑发收成紧实发辫，少量银饰；不套男子髡发，不套清代剃额独辫。衣装完整有实际剪裁，无飞白破洞；不复制参考深红珠饰帽和厚白毛领，不戴后世夸张高冠或改宋式褙子套装。

姿态器物：身体和脸主要朝正前，头颈自然竖直、双眼水平、平视且下巴中性，双脚自然站稳。左手低位松持一张小型反曲弓，弓身与完整弓弦连贯、上下弓梢全入画，不张弓、不搭箭、不瞄准任何人；右手空着轻搭腰带，手臂与身体分开。腰后箭囊固定在革带上，少量箭羽露出；弓箭是骑射身份器物。没有马、白雕或任何动物，不加帐篷和草原剧情场景；自信自主而不悲情等待。

人物画法：美观、精细、完整的写实国风人物插画；自然年龄和骨相，可信肤质、连贯体积与柔和左上漫射光。皮肤、头发、手足、衣料轮廓清楚且实体完整；衣服剪裁连续、衣襟缝线清楚，仅少量宽缓受力褶皱，不以破洞、飞白、碎墨、密集褶皱或纸屑表现真实。低饱和设色配自然肤色，不做照片、电视剧截图、拼贴或三维塑料。原始剧照只保留这个人的可辨面容关系，年龄、视力、发式、服装及器物遵本项目阶段。

参考边界：第一且唯一面容身份：黄造时饰1983 TVB翁美玲版华筝，来源角色版次、原图及独立审计已核。只取本人五官骨相，不沿用参考姿势、年龄阶段、衣发器物和背景；本项目阶段优先。 第二参考只提供暖浅灰不透明纸底、极浅低对比水墨远山、薄雾和留白。已实际view；完全忽略王语嫣本人面容、年龄、性别、身体、倾头、发髻、白青衣裙、飘带和饰物。水墨和纸纹仅在人物之外，不能侵蚀皮肤、衣料、头发或器物。

背景与交付：背景只取第二图的极淡水墨远山和留白，不出现明确宫殿、家具、具体剧情陈设、清晰建筑、符号或可读字画；脚下少量接触阴影。单人单视图、水平平视、原生竖幅2:3、完整全身；头顶、双手、双足、衣摆及实际器物端点均入画，四周自然留净空，不用固定占高或头身数字。目标2048×3072不透明PNG，接受工具真实原生2:3尺寸并准确登记，保存原始PNG字节，禁止插值、裁切或重编码。先生成1张候选，基本清晰、主要正面、人物可辨即保存；仅严重身份错误、重大结构错误或不可读才追加，细指、轻微衣装和微角偏差如实记录而不反复重做。全部仍candidate待用户审核，不自动approved。

事实边界：小说华筝确切年龄、外貌、发辫、服饰及公主饰件未逐字终校；本图十八至二十余观感、蓝绿骑乘袍、少量银饰、小反曲弓与箭囊按现稿美术方案。白雕只属探索关系，不是本幅实体；参考本人身份不证明剧服历史准确，不编引文、回目或页码。 用户授权本人影视面容覆盖旧禁演员条款；最新单候选、正面头直和背景水墨覆盖旧两张、固定占高及笼统禁山水。

完整排除项：不要汉族宋式褙子套装、清宫旗装、晚期蒙古贵妇高冠、男子髡发、清式剃额独辫、低胸短裙、皮甲比基尼；不要悲情依偎郭靖、婚礼姿态、白雕、马或帐篷。不要复制剧照珠帽毛领、侧看抿嘴或现代蒙古节庆服。不要弓弦断裂、弓梢出画或手指握住锋利箭头。 不要 head tilt、Dutch angle、明显歪头、斜镜头、头向肩倾、偏转侧脸、转身回眸、低头藏眼、仰头或夸张抬下巴；不要共用基线脸、统一美人或硬汉模板、动漫大眼、浓妆、塑料磨皮、照片和截图构图。不要多个人、多人拼图、多视图、裁断头足、缺肢、多肢、严重畸形、手物融合；不要碎布、破洞、飞白缺块、纸纹透肤透衣、墨迹侵蚀脸部、碎片化衣料、密集噪点、无依据污损或风化。不要现代服饰、拉链、腕表、手机、运动鞋、晚清官帽大饰、民国服装、日式服制、欧式奇幻装备、水平镜像或错误衣襟；不要血腥、透明衣物、裸露、恶搞丑化、发光掌法、龙蛇能量、法阵和粒子。不要具体剧情场景、清晰建筑家具、可读文字、伪字、题款、签名、印章、logo、字幕或装饰水印。保留工具本身溯源标识和元数据。

FINAL POSE CHECK: 华筝 FRONT-FACING, head and neck naturally UPRIGHT, facial centreline VERTICAL, eyes HORIZONTALLY LEVEL, camera level, chin neutral. No head tilt, Dutch angle or copied reference pose.
```

## 排除项

不要汉族宋式褙子套装、清宫旗装、晚期蒙古贵妇高冠、男子髡发、清式剃额独辫、低胸短裙、皮甲比基尼；不要悲情依偎郭靖、婚礼姿态、白雕、马或帐篷。不要复制剧照珠帽毛领、侧看抿嘴或现代蒙古节庆服。不要弓弦断裂、弓梢出画或手指握住锋利箭头。 不要 head tilt、Dutch angle、明显歪头、斜镜头、头向肩倾、偏转侧脸、转身回眸、低头藏眼、仰头或夸张抬下巴；不要共用基线脸、统一美人或硬汉模板、动漫大眼、浓妆、塑料磨皮、照片和截图构图。不要多个人、多人拼图、多视图、裁断头足、缺肢、多肢、严重畸形、手物融合；不要碎布、破洞、飞白缺块、纸纹透肤透衣、墨迹侵蚀脸部、碎片化衣料、密集噪点、无依据污损或风化。不要现代服饰、拉链、腕表、手机、运动鞋、晚清官帽大饰、民国服装、日式服制、欧式奇幻装备、水平镜像或错误衣襟；不要血腥、透明衣物、裸露、恶搞丑化、发光掌法、龙蛇能量、法阵和粒子。不要具体剧情场景、清晰建筑家具、可读文字、伪字、题款、签名、印章、logo、字幕或装饰水印。保留工具本身溯源标识和元数据。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_huazheng__ch02_youth_base.prepared.json`。
