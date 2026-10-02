---
asset_id: por_npc_huangyaoshi__ch02_elder_base
subject_id: npc_huangyaoshi
name: 黄药师
book: ch02_shediao
gender: male
age_variant: elder
tier: S
output: assets/default/character/male/ch02/por_npc_huangyaoshi__ch02_elder_base.png
manifest: assets/default/character/male/ch02/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/shediao/huangyaoshi_1983_zengjiang_sina_role.jpg
  use: 第一参考仅为本人身份：1983 TVB 曾江饰黄药师。保持其宽而较高的额面、清楚眉骨、灰色上挑眉梢、收长眼形与紧凑眉眼关系；鼻梁挺直有体量、鼻头自然不尖削，嘴部克制，灰髭与颏下整齐灰须区分。颧颊有真实宽度，不强行套旧稿狭长尖脸，不把下颌被须遮挡部分伪画成网红锥子脸。保留自然中老年纹理，不复制剧照拧眉侧视，不复制白发老仙样板。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 仅男性色卡、柔和明暗与细腻写实完整人物画法；禁止借脸、年龄、体型、衣型、剑或倾头。基线candidate原状态保留。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 仅暖浅灰纸底、极淡山水薄雾和留白；不复制王语嫣的脸、发型、薄纱裙或姿势。水墨不得侵入人物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 黄药师 · 人物写实修正

## 人物与阶段

- subject_id：npc_huangyaoshi
- book：ch02_shediao
- gender：male
- age_variant：elder

## 本轮人物写实规范

1983曾江黄药师本人脸，正面头直、清傲中老年青衣文士、实体素青玉箫外侧斜向下；完整写实人物与极浅水墨背景。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_huangyaoshi__ch02_elder_base/prompt-8a7042c733dc70511fc91e1e301fdf732cc8d09a318593689a7f6ee0dbbbe588.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body standing figure, head and neck naturally UPRIGHT. Forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, shoulders relaxed and camera level. Gaze straight ahead; NO head tilt, NO Dutch angle, no chin lift and no leaning toward either shoulder. Override the pose and camera angle in every reference.

Create HUANG YAOSHI / 黄药师 as a beautiful REALISTIC full-body Chinese wuxia character illustration.

第一参考仅为本人身份：1983 TVB 曾江饰黄药师。保持其宽而较高的额面、清楚眉骨、灰色上挑眉梢、收长眼形与紧凑眉眼关系；鼻梁挺直有体量、鼻头自然不尖削，嘴部克制，灰髭与颏下整齐灰须区分。颧颊有真实宽度，不强行套旧稿狭长尖脸，不把下颌被须遮挡部分伪画成网红锥子脸。保留自然中老年纹理，不复制剧照拧眉侧视，不复制白发老仙样板。第二图令狐冲只供灰青炭灰色卡、柔光和细腻写实手绘质感，不取他的脸、年轻年龄、胡茬、衣型、剑或歪头。第三图王语嫣只供极淡背景水墨和留白，不取女性脸、身体、薄纱裙、头倾。

黄药师，东邪、桃花岛主，射雕桃花岛三试与五绝相会阶段。五十至六十余岁视觉大档，精确生年未定；清癯修长而筋骨有力的中老年文士，冷静、清傲、审慎，不画衰弱垂暮。正面站稳，头颈自然挺直，气势来自目光与骨架。黑灰头发收整束髻、小型素木簪、鬓边霜色；髭须可灰但不能让整头发全部雪白、长须拖腰。无道冠，无面具，额头与完整脸部可读。

宋式青灰交领右衽窄袖长袍，淡灰内衬、墨青窄布带、深裤与黑布鞋；穿着者左襟覆盖右襟并向本人右侧合拢。青衣是完整连续实体布料，有少量宽缓受力褶皱与自然下垂；不复制影视黑金锦袍、夸张肩饰和摄影背景，不机械复制男性基线衣款。

只持一支素青玉箫 eq_yuxiao。右手于本人右侧、观者左侧低位轻持，管身斜向下伸到身体轮廓外；箫是完整直管，指孔、上端吹口与下端管口有清楚的乐器结构，保持整个端点入画。不要将其画成横笛吹奏动作、剑刃、短剑或发光法杖。左手腰侧自然收放、手指完整露出，不藏在袖内。玉箫与手、衣摆不熔合，无第二件武器，不展示未经核实的箫中机关。

人物本体采用美观精细的写实国风插画，可信骨相、自然皮肤体积、清楚双手双脚、柔和左上光、连续完整衣料与器物、干净实体轮廓。只用少量自然笔触，不做照片截图、3D塑料或拼贴。背景为不透明暖浅灰纸底，极淡低对比远山薄雾水墨与大量留白，脚下少量接触阴影；墨痕和纸纹不能侵蚀皮肤、衣服和玉箫。无桃林实体剧情场景。

单人单视图，原生竖幅2:3，正面水平镜头。头顶、双手、两足、完整衣摆与玉箫两端均入画，四周自然净空；不以固定占高或头身数拉伸。目标2048×3072不透明PNG，接受工具真实原生2:3尺寸并如实记录；保留原始PNG字节，不裁切、插值或重新编码。默认两张独立候选比较，仍为candidate待用户审核。

完整排除项：不要 head tilt、Dutch angle、歪头向肩、双眼高低倾斜、侧脸回眸、俯首遮眼、抬下巴；不要用令狐冲、萧峰或通用老者脸代替曾江黄药师。不要动漫大眼、尖瘦锥脸、磨皮年轻脸、现代西服、全白老仙发须、仙人法冠、全真道袍、神雕后期垂暮形象、人皮面具、长剑、蛇杖、酒葫芦、打狗棒、第二人、笛箫光效。不要抄影视黑金服、电视半身构图、原图水印文字或原照头转角；不要破布、撕裂、碎墨、飞白缺块、纸纹透人、脏污斑驳脸、密集碎褶皱、手物粘连、多肢多指、错接手腕、无依据伤残、端点裁切、背景吞掉鞋足、汉式左衽、清辫、日本刀、现代物品、裸露透明衣、血腥恶搞、文字标签题款logo；工具原有溯源标识和元数据原样保留。

FINAL POSE CHECK: FRONT-FACING HUANG YAOSHI, head centreline VERTICAL, both eyes HORIZONTAL, head and neck UPRIGHT, camera level. NO head tilt, NO Dutch angle. Keep the recognizable 1983 Kenneth Tsang face; do not inherit the turned face or raised brow tension of the photograph.
```

## 排除项

不要 head tilt、Dutch angle、歪头向肩、双眼高低倾斜、侧脸回眸、俯首遮眼、抬下巴；不要用令狐冲、萧峰或通用老者脸代替曾江黄药师。不要动漫大眼、尖瘦锥脸、磨皮年轻脸、现代西服、全白老仙发须、仙人法冠、全真道袍、神雕后期垂暮形象、人皮面具、长剑、蛇杖、酒葫芦、打狗棒、第二人、笛箫光效。不要抄影视黑金服、电视半身构图、原图水印文字或原照头转角；不要破布、撕裂、碎墨、飞白缺块、纸纹透人、脏污斑驳脸、密集碎褶皱、手物粘连、多肢多指、错接手腕、无依据伤残、端点裁切、背景吞掉鞋足、汉式左衽、清辫、日本刀、现代物品、裸露透明衣、血腥恶搞、文字标签题款logo；工具原有溯源标识和元数据原样保留。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_huangyaoshi__ch02_elder_base.prepared.json`。
