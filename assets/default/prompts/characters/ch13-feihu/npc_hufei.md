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
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w12/staging/por_npc_hufei__ch13_youth_base_still0.jpg
  use: 复合造型或身份参考；用途见实际提示词
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w12/staging/por_npc_hufei__ch13_youth_base_game.jpg
  use: 复合造型或身份参考；用途见实际提示词
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg
  use: 项目画风基线
- path: /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg
  use: 项目画风基线
status: candidate
redo_reason: 作者 10-02 晚：复合基线风格精修
reference_upload:
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w12/staging/por_npc_hufei__ch13_youth_base_still0.jpg
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w12/staging/por_npc_hufei__ch13_youth_base_game.jpg
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg
- /Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg
realism_revision: user_identity_pose_20261001
codex_prompt_rev: 2026-10-02 AR-36 retry3
generation_job: por_npc_hufei__ch13_youth_base.retry3.r1
generation_attempts: 1
classic_ref:
  note: 影视造型＋经典游戏绘画气质＋同性别双基线，五官重新设计
---

# 胡斐 · 人物写实修正

## Gemini 提示词

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
【复合参考】第1张是经典影视造型剧照，只借发型、服饰、配色、道具、气质和大致脸型，不照搬演员五官。
第2张是经典武侠游戏画风，只借古典插画的气质、线条、理想化造型感，不抄头像粗像素。
最后两张同性别项目基线，只取画风、自然材质、纸底与淡水墨，不取长相。
五官要向经典武侠游戏插画的理想化脸型靠，成品像这个角色而不是像演员；重新设计眉眼鼻唇，拒绝明星照片修图。

【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细小毛孔、细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】不透明的暖浅灰色纸底，只在远处有极淡的水墨远山和薄雾，大面积留白；人物与背景明暗分明、轮廓边缘干净完整（后续要自动抠图），水墨和纸纹只在背景里，不侵入人物和衣服；脚下只有很淡的一点接触阴影。
【人物辨识与原创面孔】胡斐；见不平即挺身、坦荡豪迈而机敏倔强、普通胡家单刀；原创成年青年新脸：宽颧方颌、浓直眉、略内收眼角、厚实鼻翼和不对称笑纹、小麦肤色与短胡茬；古典游戏豪侠脸，不复制演员。
【造型道具】浓发不剃额不结辫，顶上随手小髻、余发披肩；深褐右衽窄袖短袍、素白内衫、黑灰无袖短褂、低调旧毛皮领、皮护腕宽皮带、深裤黑布靴；腰挎普通中式单刀。
【成人化与姿势】成年人物，头端正、眼平视、双脚落地，人物自然站立，所有道具完整在画幅内。青年是成年青年，不是孩子。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要演员肖像、照片质感；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；衣襟必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。
```

## 审核组 Gemini 提示词（2026-10-02 AR-30 重审稿；AR-31 改写前，历史，不再用于出图）

> 2026-10-02 重要人物重审（C 组，判定：整体重出）：本轮出图只用下面这一段，不上传参考图。下文旧稿（人物要点 / 提示词 / 排除项 / 质检要点）只作历史与考据保留，不再用于出图。

```text
生成一张 2:3 竖幅全身人物立绘。
人物：胡斐，金庸《飞狐外传》的男主角，辽东大侠胡一刀的儿子，胡家刀法传人，在佛山为钟家伸冤、四处行侠的那段时间。
年龄与体态：二十岁上下、已经长成的男人（不是少年），个子高，骨架宽大，肩背厚实，手大有力，约七个半头身。
脸与五官：宽颧骨，方而有力的下颌；浓黑粗重的眉毛；一双大眼睛炯炯有神，目光坦荡又倔强；鼻梁高挺笔直；嘴唇线条分明，嘴角紧抿；唇上和下巴是刚冒出来的浓密青黑胡茬（还没留成胡子）；古铜色、被太阳晒得粗糙的皮肤，颧骨上有风吹的微红。相貌英俊硬朗：五官端正、轮廓分明，粗犷里透着俊气，是让人一眼喜欢的少年英雄（作者 10-02：别画丑，也不要凶相、苦相）。
发式：不剃前额，一头浓密粗硬的黑发蓬松散乱，在脑后随手用一根布条扎成一把，额前和鬓边有支棱着的乱发，不遮眼睛。
服饰：赭灰色素布短袍，外罩花青色短褂，窄袖，交领右衽（穿着者左襟压右襟），窄布带束腰，深色长裤，结实的布靴；衣服干净完整，只有一点旅途尘土。
兵器与道具：左腰挂一柄普通中式单刀（微弧的柳叶形腰刀），完全收在木色刀鞘里；左手轻按刀鞘上段，右手放松垂下。
姿态与神情：正面站稳，胸膛开阔，目光直视前方，豪爽中带着一股不服输的劲。
画风：写实手绘古风人物插画，画风与上传的画风基线图一致：精细写实的数字手绘插画，笔触细腻柔和、边缘干净；不是油画，没有厚涂笔触和画布纹理；不是照片，不是三维渲染，不是动漫或游戏 CG。人物要像真实存在的人：皮肤看得见毛孔、细纹、晒痕和轻微色斑，五官与脸型有自然的左右不对称，不磨皮；衣料看得出织物的经纬、自然的褶皱和穿用后的轻微旧化，但衣服完整，没有破洞碎布。整体低饱和、沉稳的设色；柔和自然的漫射光从左上方照来，不用舞台光和强轮廓光。
背景：暖浅灰色纸底，远处只有极淡的水墨远山和薄雾，大面积留白；人物轮廓清楚、与背景明显分开（便于后期抠图），墨色不压到人物身上，脚下只有很淡的接触阴影。
构图：2:3 竖幅，单人全身，自然站姿，平视镜头，头部端正不歪；从头顶到鞋底完整入画，四周留出余白；双手完整，兵器和道具的两端都在画面内。
不要：任何文字、字母、签名、印章、水印、边框；第二个人物、活的动物、分格、多视角、头像特写；幼态、童颜、娃娃脸、大头小身、儿童身材；网红脸、锥子脸、大眼滤镜、过度对称、塑料皮肤、蜡像感、过度精修、偶像化打光；任何真实演员或明星的长相；现代服饰和物品；日式服饰、日本刀；汉服交领左衽、整幅画面左右镜像；多余或缺失的手指、手与器物粘连；发光特效、血迹；前额剃光留长辫；俊美偶像脸、瘦弱书生；满腮大胡子（那是十年后的样子）；长剑、两把刀、出鞘的刀。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

**出图自查**：二十岁的粗犷青年：浓眉大眼、宽颧方颌、青黑胡茬；浓发不剃不结辫、脑后随手一扎；单刀在鞘、在左腰。

**依据与待考**：《雪山飞狐》写成年胡斐「满腮虬髯，根根如铁，一头浓发却不结辫子，与其父相貌甚为相似」，飞狐期发式原著待考，本稿依雪山原文与胡一刀统一为不剃不结辫（作者拍板项）；程灵素为他粘假胡子、十年后他真留了虬髯（据百科转述）。

---

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
## 本轮精修记录

- 参考分工见实际提示词；配色、姿势、取景及成年化均为（原创扩展）。
- 本轮结果已逐图目检并入库为 candidate；实际作业与参考哈希见 manifest。
