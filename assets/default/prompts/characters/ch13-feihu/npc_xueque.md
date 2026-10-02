---
asset_id: por_npc_xueque__ch13_youth_base
subject_id: npc_xueque
name: 薛鹊
book: ch13_feihu
gender: female
age_variant: youth
tier: A
output: assets/default/character/female/ch13/por_npc_xueque__ch13_youth_base.png
manifest: assets/default/character/female/ch13/manifest.yaml
references:
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 薛鹊 · 人物写实修正

## 人物与阶段

- subject_id：npc_xueque
- book：ch13_feihu
- gender：female
- age_variant：youth

## 本轮人物写实规范

药王庄提灯赴约、终段毒害之前，保留既有驼背与本人右足跛，不写成全身无伤。年龄按当前catalog青年成年暂取；role明确在线中年分歧待考，未新核指定原著版次，不将分歧伪称已解决。现本地story没有进一步证明致残时序与侧别，采用role已有右足，不额外诊断、不补独眼。头脸正面水平绝不覆盖体态残疾。 正面端正、完整写实人物与极淡水墨背景，先1个原始PNG候选，仍candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_xueque__ch13_youth_base/prompt-670dac1e96b761e671764a0800ab3d8fa8fed3114b6b1469235cfafc2341c52f.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Face forward, forehead–nose–chin centreline VERTICAL, both eyes HORIZONTALLY LEVEL, camera level, chin neutral. NO head tilt and NO Dutch angle. This governs facial orientation ONLY: preserve her HUNCHED BACK and asymmetric stance with her OWN RIGHT FOOT LIMP, LEFT leg carrying most weight, right knee slightly bent and right foot still contacting the ground. NEVER straighten her curved trunk or require symmetric shoulders, legs or weight. Keep all body parts and existing disability, no additional missing limb. These requirements override reference poses.

Create a REALISTIC Chinese wuxia full-body portrait of 薛鹊. THIS IS A TEXT-DEFINED ORIGINAL IDENTITY, not a verified actor or original-game face. NO identity photograph or prior own-character PNG is supplied. Image 1 ONLY provides the corresponding gender palette and soft light; image 2 ONLY provides the pale ink-wash background. Never borrow either reference face, body, age, hair, clothes or pose. Establish the independent written face below.

身份与阶段：薛鹊（npc_xueque），《飞狐外传》ch13_feihu。药王门同门争斗时的薛鹊，药王庄提灯赴约、终段毒害之前。

年龄与体型：暂按名录青年成年女性处理；在线文本的中年说法与名录冲突（待考），不固定具体岁数；容貌文秀、清晰眼眉与收敛嘴角，驼背轮廓真实保留、右足跛行；重心偏左腿，右膝略屈而右足仍有着地支撑，神情沉静警惕，不用妖怪五官表现残疾。年龄及身体状态优先于造型，不使用固定头身和占高强行拉伸。

本人面容辨识：独立原创的文秀成年女性面孔：脸型略窄椭圆、颧颊平顺，额头中等宽，细直眉根清楚而眉尾自然舒缓；偏长真实眼裂和均衡眼距，双眼沉静警惕而不鬼祟斜视。鼻梁中等细直、鼻尖小而圆、鼻翼正常；嘴形较小、上唇较薄下唇适中，嘴角内收，圆钝下巴有成年骨量。暂以名录青年成年自然肤质表现，不幼化，也不把未核年龄强画成固定中年。脸部正常完整，不以妖怪五官、尖牙、伤疤或身体羞辱代替驼背和跛足；不是其他女性换装。

服制与发式：清乾隆汉族女子，灰紫窄袖袄、深灰长裙内有完整长裤、平底布鞋；发髻低而朴素、木簪固定，衣服顺着背部体态垂落，不用披风遮驼背。衣料完整不透明、衣边整洁连续，少量宽缓受力褶，不添破洞和碎布；汉式交领穿着者左襟覆右襟，斜襟向穿着者右侧闭合，不水平镜像。

正面姿态与器物：全身正面可辨，脸朝前、双眼水平、额鼻颏中线竖直，不作侧脸或歪头；这只约束头脸，不矫直躯干。保留真实驼背的背肩起伏和顺势前曲躯干，肩颈自然适配，衣服依背部弧度垂落，不拉成长腿挺直模特。本人右足跛（正面观者左侧）：左腿承担较多重量，右膝略屈，右足仍有着地支撑；两足完整可见，不反成左足跛、不强求左右均分承重。本人右手低提一只小型灯笼，暗木骨架、素纸罩、提梁与手握真实连接，内部只极弱暖光，灯笼放在右腿外侧而不遮脚；左手轻扶腰侧闭口小药囊。无拐杖、轮椅、剑、眼罩或第二灯笼。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。依作者最新提速指示默认一张候选、每张仅一人。只有严重身份错误、重大结构问题或图片不可读才补图，不因细手指、微小装备或轻微角度偏差追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本书清乾隆时代；前史回忆与开局、后期分开，当前图只取已注明阶段，不把全书所有年份混成同一年龄。身份阶段以本地role/catalog/story/chapter为依据，原著概括及具体发饰器型仍待指定版本核，不冒称新查原文。本次原创新脸的具体五官和静态手势为美术补足。药王庄提灯赴约、终段毒害之前，保留既有驼背与本人右足跛，不写成全身无伤。年龄按当前catalog青年成年暂取；role明确在线中年分歧待考，未新核指定原著版次，不将分歧伪称已解决。现本地story没有进一步证明致残时序与侧别，采用role已有右足，不额外诊断、不补独眼。头脸正面水平绝不覆盖体态残疾。

参考边界：对应性别项目基线只作低饱和设色色卡和柔和光线参考；已实际view，不是本人身份图。完全忽略基线脸型、眉眼鼻唇、年龄、体型、发式、服装、道具、手势和头倾。人物完整写实要求来自文字，不能靠借基线面孔实现画风一致。原审批状态保持，不转给新candidate。 已实际view，只取暖浅灰不透明纸底、极淡低对比水墨远山和留白；忽略女性人物、头倾、体型、五官、白青衣饰、亭阁和花枝。背景纸纹墨迹不得侵入目标人物皮肤、头发、衣料或器物。

完整排除项：不要健全挺直模特身姿、左足误跛、独眼眼罩、幼女化、性感曲线、残疾恶搞、女巫尖牙、绿色脸光、毒雾、现代拐杖、宫装大拉翅或字灯笼。 不要 head tilt、Dutch angle、头歪向肩、眼线倾斜、侧脸侧视、回眸、低头藏眼、抬下巴或倾斜镜头。不要复制或混合palette和背景图的人物脸、年龄、身体、发型、衣装、道具和姿势，不借其他game或TV角色冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、浓妆丰唇、Q版、3D塑料或换头拼贴。不要以美化抹去中老年皱纹，病弱成人不画成儿童，不用怪物化和身体羞辱表达性格或健康。不要人物碎墨、飞白缺块、纸纹透肤透衣、墨斑侵蚀、破洞、撕裂衣摆、碎布毛边、密集噪点或过密细皱，衣料皮肤器物完整连续。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰物、晚清大拉翅、民国旗袍、中山装或近现代军装；清乾隆时代服制和男子剃额留辫、女子低髻、汉僧剃度分别依人物本阶段，不泛化成同一种发式。不要左衽、镜像衣襟、无据冠服等级纹章、日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、赛博或蒸汽朋克。不要多人、分格、特写框、多视角、裁断头足器物端点、多肢多指、手物融合、错接手腕、无据缺肢失明、漂浮装备、无挂点鞘带或断裂兵器。不要无据加兵器、发光法阵、光翼、光龙、粒子、浓雾遮结构、强逆光；不要具体剧情场景、清晰建筑、室内布景或拥挤背景，保留极淡水墨远山与留白。不要裸露透衣、色情化、血腥特写、夸张抽搐或恶搞。不要文字、伪字、题款、签名、印章、logo、器物铭文、书页字或新装饰水印；保留工具原有溯源信息。

FINAL POSE CHECK: FRONT-FACING full-body, head oriented UPRIGHT, forehead–nose–chin VERTICAL, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Preserve this person’s own age, facial identity, existing physical condition and narrative stage. Preserve HUNCHED BACK and OWN RIGHT FOOT LIMP; facial alignment does NOT mean a straight spine or symmetrical weight.
```

## 排除项

不要健全挺直模特身姿、左足误跛、独眼眼罩、幼女化、性感曲线、残疾恶搞、女巫尖牙、绿色脸光、毒雾、现代拐杖、宫装大拉翅或字灯笼。 不要 head tilt、Dutch angle、头歪向肩、眼线倾斜、侧脸侧视、回眸、低头藏眼、抬下巴或倾斜镜头。不要复制或混合palette和背景图的人物脸、年龄、身体、发型、衣装、道具和姿势，不借其他game或TV角色冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、浓妆丰唇、Q版、3D塑料或换头拼贴。不要以美化抹去中老年皱纹，病弱成人不画成儿童，不用怪物化和身体羞辱表达性格或健康。不要人物碎墨、飞白缺块、纸纹透肤透衣、墨斑侵蚀、破洞、撕裂衣摆、碎布毛边、密集噪点或过密细皱，衣料皮肤器物完整连续。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰物、晚清大拉翅、民国旗袍、中山装或近现代军装；清乾隆时代服制和男子剃额留辫、女子低髻、汉僧剃度分别依人物本阶段，不泛化成同一种发式。不要左衽、镜像衣襟、无据冠服等级纹章、日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、赛博或蒸汽朋克。不要多人、分格、特写框、多视角、裁断头足器物端点、多肢多指、手物融合、错接手腕、无据缺肢失明、漂浮装备、无挂点鞘带或断裂兵器。不要无据加兵器、发光法阵、光翼、光龙、粒子、浓雾遮结构、强逆光；不要具体剧情场景、清晰建筑、室内布景或拥挤背景，保留极淡水墨远山与留白。不要裸露透衣、色情化、血腥特写、夸张抽搐或恶搞。不要文字、伪字、题款、签名、印章、logo、器物铭文、书页字或新装饰水印；保留工具原有溯源信息。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_xueque__ch13_youth_base.prepared.json`。
