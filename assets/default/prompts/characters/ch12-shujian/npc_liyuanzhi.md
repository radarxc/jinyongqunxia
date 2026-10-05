---
asset_id: por_npc_liyuanzhi__ch12_youth_disguised_base
subject_id: npc_liyuanzhi
name: 李沅芷
book: ch12_shujian
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch12/por_npc_liyuanzhi__ch12_youth_disguised_base.png
manifest: assets/default/character/female/ch12/manifest.yaml
references:
- path: .agents/coord/imagegen-reference/user_wangyuyan_background_only_20261002.png
  use: 唯一图片输入，已实际view_image：root由用户原背景派生的不含人物纯背景，仅取暖浅灰纸底、极淡远山与宽阔留白。没有面孔、人体、衣服或道具可供身份借用；人物颜色、柔和光线、年龄和具体骨相全部依本稿文字。派生内部参考不是用户原图、不是approved；背景水墨不得侵入写实人物或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 李沅芷 · 人物写实修正

## 人物与阶段

- subject_id：npc_liyuanzhi
- book：ch12_shujian
- gender：female
- age_variant：youth

## 本轮人物写实规范

首次独立原创面貌：李沅芷；青年女性youth，确岁未核，采取保守年轻外观与轻捷身形；不强调成人曲线，不成人化或性感化。 正面端正、头颈竖直、双眼水平；人物完整写实，背景极淡水墨。先1张独立candidate，原始PNG native 2:3；均candidate待用户审核。唯一图片输入为无人纯背景；人物本人由具体原创文字脸锚建立，不借其他人物palette。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_liyuanzhi__ch12_youth_disguised_base/prompt-e4b8f39781fd28faa20abb9499196d3d0067a732ce9ad2de15287346d00e456a.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: one FRONT-FACING full-body figure, head and neck naturally UPRIGHT. The forehead–nose–chin centreline is VERTICAL and both eyes lie on a HORIZONTAL line. Keep the head centered over the torso, neck aligned with the body, chin neutral, gaze directly forward and camera level. NO head tilt, NO Dutch angle, no head leaning toward a shoulder, no rolled camera and no coquettish angled face. Ignore every reference image’s head angle, side-glance and body turn. Preserve natural facial asymmetry without tilting the head.

Create a refined REALISTIC hand-painted Chinese wuxia character illustration: a clear and individually designed face, believable natural age, continuous skin and anatomy, readable eyes and hands, soft connected lighting, complete opaque tailored garments, intact seams and a clean silhouette. Clothing has a few broad weight-bearing folds, fine restrained material variation and real gravity. Ink wash and paper texture belong only to the pale background, never inside the figure. This is a newly composed illustration, not a photograph, movie screenshot, 3D model or collage. Natural age lines are continuous skin anatomy, not dirt, cracks or dry-brush flecks.

THIS IS THE FIRST ORIGINAL IDENTITY IMAGE FOR THIS SUBJECT. No input supplies an identity, face, person, body, costume, prop or pose. Image 1 is the ONLY input: a person-free background derived from the user background, used ONLY for pale warm paper, extremely faint distant ink-wash mountains and open space. Establish this person solely from the specific written age, facial structure, expression, body, costume and stage below. Do not invent an identity-source claim or import another person’s face. The person remains fully realistic, intact and opaque; ink wash is confined to the background.

CHARACTER AND STAGE: 李沅芷 / npc_liyuanzhi, por_npc_liyuanzhi__ch12_youth_disguised_base.
《书剑恩仇录》ch12，陆菲青弟子李沅芷，取西北游历、女扮男装的小公子阶段。主体仍为female，易装仅改变衣着发式，不变成成年男子，也不推定全书永远男装。 本项目书界主线年代为1753–1759年、清乾隆；前史人物严格以其生前回忆阶段为准，不把回忆像当作现时活体。

AGE AND ORIGINAL FACE IDENTITY:
青年女性youth，确岁未核，采取保守年轻外观与轻捷身形；不强调成人曲线，不成人化或性感化。 独立小巧而自然圆润下颌的瓜子脸，上额较开阔、面颊年轻柔软，下脸稍收但下巴不尖。细而有力的眉略带轻挑弧度，正常大小的杏眼眼尾清楚、间距自然，双眼平视明亮机敏。鼻梁短直、鼻尖小而圆，鼻翼与面宽协调；嘴较小、上唇有清楚唇弓而不过薄，下唇稍丰满，闭口浅笑略狡黠。脸上不浓妆、不胡须、不模糊性别，清秀女子以少年公子衣装易装；区别于骆冰成熟饱满的成年脸、关明梅老年骨相及王语嫣模板。神态靠目光与嘴角，头颈始终端正。

CLOTHING AND HAIR:
乾隆汉地少年公子式淡青窄袖长袍、素白里领、窄布腰带、深色长裤与平底布靴；袍襟向人物右侧严整合拢，汉式交领如可见为左襟压右襟。小瓜皮帽把本人长发收住，帽下后方有规整编辫造型，但女性本人前额头发没有真的剃去，帽沿自然收发而非画光秃剃額。无宋式高髻、女式大头饰或宫装；衣袍连续完整、宽松端庄不透明，不紧勒或显露束胸，少量宽缓重力褶。

POSE, EQUIPMENT AND STRUCTURE:
正面轻捷而稳定站立，双脚自然少量错开、肩颈放松，头颈竖直在躯干中线上、眼线水平看前方。穿着者左腰一柄普通中式直身双刃剑完整入足长朴素剑鞘，剑柄—小横剑格—鞘口—鞘尾同轴，两条短挂带接腰带；左手轻搭鞘口外侧不遮挂点。右手空着于腹前自然虚拢，腰旁另有一个闭合小针囊代表师门暗器，不撒金针、不浮空发光，不把容器当玩家已经获得奖励的证明。剑鞘、针囊、双手双靴全部入画，不添令牌文字。

ORIGINAL CHARACTER COLOR AND LIGHT:
淡青公子袍与素白里领用低饱和清浅层次，柔和左上漫射光清楚表现年轻柔软面颊、短直鼻和圆润小下巴。明亮机敏目光与克制浅笑保留，女性易装不变男子、不添加成人曲线或浓妆。

COMPOSITION AND DELIVERY: one person, one view, full body from head to both shoes, both hands, entire hem and all specified prop endpoints comfortably inside the frame. Upright frontal head and body, relaxed level shoulders, believable grounded weight, neutral eye-level perspective. Vertical native 2:3 PNG, target 2048×3072, with natural margins; accept the tool’s actual native 2:3 size and record it truthfully. Preserve original PNG bytes, metadata and tool provenance; no upscaling, cropping or re-encoding to pretend compliance. Opaque warm pale-grey background with only extremely light distant ink-wash mountain/mist suggestions, generous empty space and a modest soft contact shadow. Background never erodes skin, clothes, shoes or equipment. No narrative scene, recognizable temple, building, other person or action effect. Soft upper-left diffuse light makes the face, hand joints, cloth and materials continuous and clearly readable. FAST1 production: first generate ONE candidate. Request another only for a serious identity, structural or readability failure. Every result remains candidate for user review, never automatically approved.

FACT BOUNDARIES: 本图人物身份、年龄与剧情阶段沿当前本地角色稿、名录及故事事件。所选配角在当前已下载原版游戏语料中没有可靠本人头像配对，不等于断言所有版本从无头像。唯一输入为不含人物的派生纯背景参考；独立脸型五官、服色裁制与具体静态展示是原创美术，原稿待考照留，不冒称已逐字核对小说或实际观察到本人图片。项目基线原candidate/approved状态不变。

完整排除项：不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、晚清大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 清代发式依本角色文字，回部民间及女性易装不机械套汉地男子剃额留辫。 不要画成成年男性、胡须、真实剃额或浓重女妆；不要现代男装西服、裙装宫装、性感束胸外露、网红脸；不要仙剑光效、撒针阵列或刻有文字的令牌。

FINAL POSE CHECK: 李沅芷 is FRONT-FACING. Keep forehead–nose–chin vertically aligned, both eyes horizontally level, neck naturally upright and centered above the torso, shoulders relaxed and camera level. NO head tilt. NO Dutch angle. Ignore all input head angles. Preserve this person's own written age and face anchors; No input supplies a face.
```

## 排除项

不要 head tilt、Dutch angle、头歪向肩、头部中线偏斜、双眼高低倾斜、倾斜镜头、仰头、俯首藏眼、明显侧脸、侧身回眸、斜脸卖萌或高耸单肩。不要复制任何参考人物的脸、年龄、体型、发型、服装、姿势或身份，不要统一年轻模板脸、网红尖下巴、动漫大眼、丰唇滤镜、浓妆、塑料磨皮、摄影写真、三维模型、截图或拼贴。不要将老人和中年人年轻化，真实年龄纹理不能变成龟裂或污渍。不要人物本体碎墨、飞白缺块、纸纹透肤透衣、纸屑侵蚀、斑驳模糊脸、断裂衣摆、破洞、毛边、碎布条、无依据尘污和过密细碎褶；不要用雾或墨迹藏住人体轮廓。不要现代服饰、拉链、腕表、运动鞋、数码物件、塑料饰品、高跟鞋、时代族群混搭、晚清大拉翅、唐式齐胸裙、无依据官服补子或飞鱼服。汉式交领不要左衽，不水平镜像。不要和服、日式前结宽腰带、日本刀、圆盘刀镡、菱形缠柄、欧式奇幻甲、赛博或蒸汽朋克。不要新增无依据兵器、发光武器、光翼、龙形能量、法阵、粒子特效、强逆光或泛光。不要多人物、多视角、分格、头像插框、额外肢体、多指、粘手、错接手腕、手物融合、悬空装备、失重衣带、重复武器、断裂器物、过短刀剑鞘或裁断头足器物端点。不要裸露、透衣、性感化、夸张健美肌肉、血腥特写、恶搞或丑化。不要文字、伪字、题款、签名、印章、标签、logo、器物铭文、书信字符或新增装饰水印；保留工具原有溯源信息。 清代发式依本角色文字，回部民间及女性易装不机械套汉地男子剃额留辫。 不要画成成年男性、胡须、真实剃额或浓重女妆；不要现代男装西服、裙装宫装、性感束胸外露、网红脸；不要仙剑光效、撒针阵列或刻有文字的令牌。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_liyuanzhi__ch12_youth_disguised_base.prepared.json`。
