---
asset_id: por_npc_hufei__ch13_youth_base
subject_id: npc_hufei
name: 胡斐
book: ch13_feihu
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch13/por_npc_hufei__ch13_youth_base.png
manifest: assets/default/character/male/ch13/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/identity-20261001/game/raw-portraits/HDGRP_2-1.png
  use: 第一且唯一面部身份参考：原版《金庸群侠传》胡斐 HDGRP_2-1，已实际view原PNG并对照姓名表第1排第2列。取较长方脸、强而清楚的眉弓、浓而内收的眉、坚定略收窄的眼形、直而有体积的鼻与坚实颧颌关系。按本图约十八岁自然青年化，保留少年余气；不复制原头像成熟胡髭、蓬松散发、灰领、转头和裁切，更不能将头像像素纹理带入新图。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 第二参考，仅项目男性低饱和设色、柔和光照与连贯细腻的写实手绘质量；已在本会话实际view。不得借脸型、眉眼、性别体态、年龄、发型、服饰、器物或姿势；当前基线candidate状态保持不变。不复制令狐冲脸或明式网巾长剑。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第三参考，仅用户背景浅水墨山水、暖浅灰纸底与留白；已在本会话实际view。忽略其中女性脸、身形、侧倾、服装与饰物；水墨与纸纹不侵蚀人物及道具。
status: ready
realism_revision: user_identity_pose_20261001
---

# 胡斐 · 人物写实修正

## 人物与阶段

- subject_id：npc_hufei
- book：ch13_feihu
- gender：male
- age_variant：youth

## 本轮人物写实规范

原版胡斐头像身份自然回溯为ch13约十八岁青年：稍长方脸、浓眉锐目、坚实颧颌，极淡绒须而无成年浓髯；清代剃额单辫、赭灰短袍与花青短褂、普通腰刀完整入鞘。正面头直眼平、完整写实人物与衣料，水墨只在背景。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_hufei__ch13_youth_base/prompt-de1823fbcaf3f5f5653636868b2979185a711e55347dd532abb130a00d697723.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
PRIMARY POSE REQUIREMENT: FRONT-FACING full-body standing portrait, head and neck naturally UPRIGHT. Keep the forehead–nose–chin centreline VERTICAL and both eyes HORIZONTAL, face looking directly at the viewer, head centered over the torso and camera level. NO head tilt and NO Dutch angle. Do not inherit the reference portrait’s turned face, tilted head or shoulder angle. Retain natural facial asymmetry without tilting the head.

Create a NEW realistic full-body identity portrait of HU FEI / 胡斐, using image 1, the verified ORIGINAL Heroes of Jin Yong portrait HDGRP_2-1, as the ONLY facial identity source. Preserve the recognizable brow–eye–nose–jaw relationships while naturally adapting them to a young man around eighteen. The portrait has mature facial hair and loose hair: those age and hairstyle cues MUST NOT override this younger Qing-period project stage. Image 2 supplies only male colour/rendering style; image 3 supplies only background ink-wash.

阶段与面貌：辽东胡家传人，《飞狐外传》ch13_feihu，清乾隆时期，佛山问罪至寻医前的青年行侠形态。不是商家堡幼童，也没有进入雪山飞狐的成名壮年阶段。约十八岁的青年，筋骨已经结实而保留少年余气，宽而有力量的肩背不能膨胀成中年厚重壮汉。以第一头像的稍长方脸、明确颧骨与有厚度的下颌、浓而有力量的眉、内收专注的眉眼、较窄坚定的眼裂、直而立体的鼻梁及坚实鼻口关系建立身份。参考眼神略显沉郁，新图转为坦荡、坚定而有倔强的行侠少年，不画凶恶反派。暖而略经日晒的肤色，脸部尚有青年柔软感；唇颌最多极淡绒须，绝无成熟胡髭或络腮虬髯。不要改成令狐冲的修长温润脸，也不要套用萧峰的宽厚中年脸。

服饰发式：清代汉地江湖青年，前额剃发、后脑保留头发编成一条辫子垂背。正面要清楚看见剃额发际，后辫自然在肩后露出一段即可，不为了展示发辫侧头。不要复制原游戏头像的蓬松散发。赭灰色素布短袍，外穿花青色短褂，窄袖、深色长裤、实用布靴，素窄布带收腰；若露交领必须穿着者左襟压右襟、向本人右侧合拢。衣领严整，衣边和下摆连续完整，只允许极少量轻旅尘，不画破衣、大片污痕或毛边。

姿态与器物：正面开胸站稳，头颈直立、眼睛水平，肩膀自然平展，双脚真实着地，前足可稍向外。一把普通中国柳叶形单刃腰刀完全入鞘，挂在本人左侧腰部，普通小护手、木色刀鞘，刀鞘微弧与刀刃长度相容，挂带真实连接腰带，鞘尾全部可见。这仅是普通腰刀，不是冷月宝刀或天龙宝刀。左手自然轻靠刀鞘上段但不拔刀、不紧抓刀柄，右手空着放松下垂，两手与器物分清。肩臂有训练力量而不摆僵硬擂台架、不拔刀斩杀；无第二武器、易容物或掌门礼服。

画法与交付：人物是美观、完整、清楚的写实国风插画，不是摄影截图、像素放大图、漫画或三维模型。面部、双手和脚部具有连续实体体积与柔和连贯明暗，肤质细腻自然，发丝、衣料与道具材料区分清楚。衣物整片可穿、裁剪完整，少量宽缓承重褶皱和细微织物质感，不以撕裂风化制造角色感。左上方柔和漫射光，人与背景分离。第二参考只提供克制设色及细腻写实画法，不借脸型、年龄、身体、衣服、物件或姿势；第三参考只提供背景：不透明暖浅灰纸底、很淡的远山墨色与薄雾、充分留白和少量脚下接触阴影。水墨纸纹停留在人物轮廓外，不能透进脸、手、衣料、鞋或器物。背景不构成具体经典场景，没有第二个人。
单人单视图，原生竖幅2:3完整全身，头顶、双手、两足、全衣摆及全部物件端点入画，留自然净空，不使用固定占高或头身比例硬限。目标2048×3072不透明PNG；工具若输出其他真实原生2:3尺寸须实测登记，保存原始PNG字节，不插值、裁切或重编码。每幅只画一个人；生产默认两张独立候选供比较，仍全部candidate等待用户审核。

完整排除项：不要 head tilt、Dutch angle、头歪向一肩、斜眼线、脸部中线倾斜、低头藏眼、仰头、明显侧脸、侧身回眸、耸单肩或旋转镜头；不要复制第二或第三参考的脸和身体，不要同一通用脸换装、网红尖下巴、动漫大眼、过度磨皮、浓妆丰唇或塑料皮肤；不要像素格、低清脸、直接放大头像、游戏边框、半身裁切、照片截图、三维模型感。不要时代混搭、现代服饰、拉链、腕表、现代鞋、数码器具、日式服制刀具或欧式奇幻装备；不要水平镜像、错误衣襟、无挂点的悬浮装备、失重衣料。不要多人物、分格、多视角、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合，勿裁断头足或器物端点。人物本体不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、碎布条、撕裂衣摆、大片补丁、过密噪点纹理、脏污斑驳面容或浓雾遮脸；不要靠过曝融边隐藏结构。不要裸体、透衣、性感化、血腥、恶搞或丑化；不要发光兵器、龙形能量、法阵、粒子特效、强泛光或强舞台轮廓光。不要文字、题款、签名、印章、logo、装饰水印、书页或药签可读配方；保留工具原有溯源标识与元数据。 不要雪山时期成熟胡髭、络腮虬髯、四十岁壮汉脸、长白雪裘或厚重灰白冬袍；不要冷月宝刀、天龙宝刀、发光名刀、掌门礼服、明式网巾、顶髻、披散长发、原游戏头像的浓密散发；清代本阶段必须剃额单辫。不要出鞘刀刃、两把刀、日本刀、双手拔刀、刀鞘短于刃或手掌遮没护手。不要把原头像的成年成熟感照搬到约十八岁的少年青年。

FINAL POSE CHECK: one complete FRONT-FACING figure; forehead–nose–chin centreline VERTICAL, both eyes HORIZONTAL, neck naturally upright and camera level. NO head tilt and NO Dutch angle. Use expression and clear anatomy, never a tilted head or rotated camera, to convey character. Preserve the first reference’s facial identity only after adapting it to this project stage.
```

## 排除项

不要 head tilt、Dutch angle、头歪向一肩、斜眼线、脸部中线倾斜、低头藏眼、仰头、明显侧脸、侧身回眸、耸单肩或旋转镜头；不要复制第二或第三参考的脸和身体，不要同一通用脸换装、网红尖下巴、动漫大眼、过度磨皮、浓妆丰唇或塑料皮肤；不要像素格、低清脸、直接放大头像、游戏边框、半身裁切、照片截图、三维模型感。不要时代混搭、现代服饰、拉链、腕表、现代鞋、数码器具、日式服制刀具或欧式奇幻装备；不要水平镜像、错误衣襟、无挂点的悬浮装备、失重衣料。不要多人物、分格、多视角、面部特写框、多肢多指、缺手缺脚、粘连手指、错接手腕、手物融合，勿裁断头足或器物端点。人物本体不要碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、碎布条、撕裂衣摆、大片补丁、过密噪点纹理、脏污斑驳面容或浓雾遮脸；不要靠过曝融边隐藏结构。不要裸体、透衣、性感化、血腥、恶搞或丑化；不要发光兵器、龙形能量、法阵、粒子特效、强泛光或强舞台轮廓光。不要文字、题款、签名、印章、logo、装饰水印、书页或药签可读配方；保留工具原有溯源标识与元数据。 不要雪山时期成熟胡髭、络腮虬髯、四十岁壮汉脸、长白雪裘或厚重灰白冬袍；不要冷月宝刀、天龙宝刀、发光名刀、掌门礼服、明式网巾、顶髻、披散长发、原游戏头像的浓密散发；清代本阶段必须剃额单辫。不要出鞘刀刃、两把刀、日本刀、双手拔刀、刀鞘短于刃或手掌遮没护手。不要把原头像的成年成熟感照搬到约十八岁的少年青年。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_hufei__ch13_youth_base.prepared.json`。
