---
asset_id: por_npc_wusangui__ch08_elder_pingxi_base
subject_id: npc_wusangui
name: 吴三桂
book: ch08_luding
gender: male
age_variant: elder
tier: A
output: assets/default/character/male/ch08/por_npc_wusangui__ch08_elder_pingxi_base.png
manifest: assets/default/character/male/ch08/manifest.yaml
references:
- path: assets/default/character/male/ch07/por_npc_wusangui__ch07_prime_ming_base.png
  use: 第一输入是已实际查看并核验原始字节的本人吴三桂 ch07项目生成候选（por_npc_wusangui__ch07_prime_ming_base），不是原版游戏头像或影视演员照片。只保留本人骨相与眉眼鼻唇相对关系，按ch08年龄显著成熟/老化；本稿年龄、发式、衣装、器物和正面头直眼平要求覆盖参考。本人ch07约三十二岁明将候选仅供骨相。本图平西王府谈判备叛阶段，1669–1673约57–61岁，尚未称帝；剃额灰黑细辫及素帽、深靛便袍外褐短褂、皮带靴、入鞘柳叶刀和无字封书。去掉明甲、网巾束髻、手套与军旗；不穿帝王龙袍冕冠。 参考仍candidate，不转为approved。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 第二输入只取暖浅灰不透明纸底、极淡低对比水墨远山及留白；不取王语嫣的人物、五官、年龄、身体、发式、白青衣饰、头倾、亭阁花枝。墨迹纸纹不得侵入目标人物。
status: ready
realism_revision: user_identity_pose_20261001
---

# 吴三桂 · 人物写实修正

## 人物与阶段

- subject_id：npc_wusangui
- book：ch08_luding
- gender：male
- age_variant：elder

## 本轮人物写实规范

本人ch07约三十二岁明将候选仅供骨相。本图平西王府谈判备叛阶段，1669–1673约57–61岁，尚未称帝；剃额灰黑细辫及素帽、深靛便袍外褐短褂、皮带靴、入鞘柳叶刀和无字封书。去掉明甲、网巾束髻、手套与军旗；不穿帝王龙袍冕冠。 正面头颈竖直、双眼水平，完整写实人物与极淡水墨背景；先1个原始PNG候选，仍candidate待用户审核。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/identity-20261001/backups/por_npc_wusangui__ch08_elder_pingxi_base/prompt-788d5e58b2c7b4f676996d88fde727b8811e03d4aeaed04ba2853a7b74dc81a8.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
POSE IS A PRIMARY REQUIREMENT: ONE FRONT-FACING full-body standing figure. Head and neck naturally UPRIGHT; forehead–nose–chin centreline VERTICAL, both eyes on a HORIZONTAL line. Camera level, chin neutral, gaze forward, head centered over the torso, shoulders naturally relaxed. NO head tilt and NO Dutch angle. These requirements override every reference pose. Preserve natural facial asymmetry without tilting the head.

Create a REALISTIC Chinese wuxia full-body portrait of 吴三桂. Image 1 is THIS SAME PERSON’S saved ch07 project-generated candidate, actually viewed and source-hash verified. It is NOT a TV actor photograph or an original-game portrait. Use only this person’s facial proportions and individual identity; age the face naturally and visibly to the ch08 stage specified below. Do not keep the earlier age, hairstyle, costume, equipment, body pose or background. Image 2 supplies ONLY pale ink-wash background; never copy its woman or face. There is no unrelated character palette portrait among the inputs. Current age, attire and upright front-facing pose take priority over both reference images.

身份与阶段：吴三桂（npc_wusangui），《鹿鼎记》ch08_luding。云南平西王、备叛证据调查与送婚谈判阶段，起兵称帝之前。

年龄与体型：名录1612生；1669–1673窗口约57–61岁，按事件年−1612核算；造型键elder不改系统mature；宽额方脸、下颌收得坚实，眉目沉静精算，眼角皱纹与灰黑整须；中老年将领体格厚实，腹腰有自然重量而不肥大丑化。年龄及身体状态优先于造型，不使用固定头身和占高强行拉伸。

本人面容辨识：实际查看第一参考的本人较长而偏收窄的长方脸、平直较宽额部、清楚但不外张的颧颌角、浓直眉和偏长眼裂、直长鼻梁、较短平的嘴线、小髭与紧凑颏须。保持本人五官比例和脸的纵向关系，按57–61岁加入眼额颊口皱纹、适度成熟软组织和灰黑短须，不能为本稿宽额方脸要求换成另一张宽短圆脸。沉静精算、端正审视，不画怪脸或帝王神像。

服制与发式：清初云南藩王的王府日常便袍，暗靛蓝绸袍、沉褐外褂，右侧掩襟、收袖与皮腰带，便帽和黑靴；剃额灰黑细辫，面料精良但不画未经核实的蟒纹等级与冠珠细则。衣料完整不透明、衣边整洁连续，少量宽缓受力褶，不添破洞和碎布；汉式交领穿着者左襟覆右襟，斜襟向穿着者右侧闭合，不水平镜像。

正面姿态与器物：全身严格正面站立，头颈竖直、眼线水平，下巴中性，双肩自然舒展而不向前压，双足稳落。本人腰侧仅一柄普通柳叶腰刀完全入鞘，刀柄、护手与鞘口连续，鞘长容纳刀刃，窄挂带承重。左手低平持一件闭合无字密封文书，右手轻触腰带；文书与袖口分离，不遮脸，不展开可读文字。无坐骑、宝座、军旗或护卫。

人物画法：美观、精细而可信的写实国风人物插画。面部、双手、身体、衣料和器物都是完整坚实连续的体积，眼睛大小自然，皮肤具有适龄柔和明暗与自然纹理，不塑料磨皮、不复刻像素块。成熟和老年人物保留眼角、颊口、颈部的真实年龄关系；皱纹是完整皮肤的起伏，不是裂缝、污渍或飞白。衣服是可穿的完整不透明织物，剪裁与缝线清楚，只保留少量宽缓受力褶皱，不用密集噪点、碎布条或破损表现真实。脸手头发衣摆轮廓清楚，柔和左上漫射主光，连贯明暗与克制低饱和设色。手绘笔触细腻，不是照片、电视剧截图、3D模型或换头拼贴。水墨只在背景，墨痕与纸纹绝不侵入人物本体。

背景与交付：单人单视图、水平平视镜头、原生竖幅2:3、完整全身，头顶、发饰、双手、两足、衣摆和全部实际道具端点完整入画，四周自然留净空，不用固定占高或头身数字强行拉长人体。目标2048×3072不透明PNG；接受工具真实原生2:3尺寸并如实登记，保存原始PNG字节及元数据，不裁切、放大、旋转或重新编码。暖浅灰不透明纸底，人物之外只有极浅低对比水墨远山、薄雾和留白，脚下少量接触阴影；不画具体剧情场景、建筑、其他人或文字。依作者最新提速指示默认一张候选、每张仅一人。只有严重身份错误、重大结构问题或图片不可读才补图，不因细手指、微小装备或轻微角度偏差追加。所有输出仍为candidate待用户最终审核，不自动approved。

事实边界：本书清初康熙主体窗口1669–1690，当前图只取已注明阶段，不把全书所有年份混成单一年龄。身份阶段以本地role/catalog/story/chapter为依据，原著概括和具体发饰器型仍待指定版本核，不冒称新查原文。本人五官连续性依据已保存的本人ch07候选，年龄适配、衣饰选款和静态手势仍为美术落实，不冒称原版游戏或影视本人。平西王府备叛调查和送婚谈判期，按role1669–1673约57–61而不是全章57–66岁；尚未起兵称帝。ch07长方脸与收窄方颌经成熟软组织适配本稿宽额方脸，不换本人；改剃额细辫和王府便袍，禁提前帝王龙袍冕冠。

参考边界：第一输入是已实际查看并核验原始字节的本人吴三桂 ch07项目生成候选（por_npc_wusangui__ch07_prime_ming_base），不是原版游戏头像或影视演员照片。只保留本人骨相与眉眼鼻唇相对关系，按ch08年龄显著成熟/老化；本稿年龄、发式、衣装、器物和正面头直眼平要求覆盖参考。本人ch07约三十二岁明将候选仅供骨相。本图平西王府谈判备叛阶段，1669–1673约57–61岁，尚未称帝；剃额灰黑细辫及素帽、深靛便袍外褐短褂、皮带靴、入鞘柳叶刀和无字封书。去掉明甲、网巾束髻、手套与军旗；不穿帝王龙袍冕冠。 参考仍candidate，不转为approved。 第二输入只取暖浅灰不透明纸底、极淡低对比水墨远山及留白；不取王语嫣的人物、五官、年龄、身体、发式、白青衣饰、头倾、亭阁花枝。墨迹纸纹不得侵入目标人物。

完整排除项：不要文字、汉字、伪字、题款、签名、印章、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件；不要真人演员脸、明星相貌、剧照构图或具体改编的独创造型，不用画师姓名作风格词，不复制具体画作；不要动漫大眼、低幼化滤镜、统一网红锥子脸、丰唇浓妆、偶像磨皮、摄影写真、塑料皮肤或三维模型渲染感；不要日式服制、前结宽腰带、日本刀、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代与族群混搭、错误衣襟、水平镜像、无依据的冠服与兵器；不要额外人物、多视图、分格、面部特写框、多肢多指、粘连手指、错接手腕、手物融合、失重衣料、悬空装备、弯折断裂兵器或容不下剑刃的短鞘；不要无依据的破衣碎布、畸形健美肌肉、血腥特写、裸露、透明衣料、色情化、恶搞或丑化；不要发光兵器、法阵、仙法、龙形能量、粒子特效、强逆光、浓雾遮挡或具体剧情场景及清晰建筑；不要晚清大拉翅、民国旗袍、中山装与近现代军装；不要裁断头足、衣摆、发饰和兵器端点。不要照搬碧血青年年龄与皮肤状态，保留本人骨相身份、明末将领束髻、帝王龙袍冕旒、皇帝宝座、清廷官员通用补子乱配或沙场骑马；不要仙侠长刀。 不要 head tilt、Dutch angle、头歪向肩、眼线倾斜、侧脸侧视、回眸、低头藏眼、抬下巴或倾斜镜头。不要复制背景参考王语嫣或任何别人的脸、年龄、身体、发型、衣装、道具和姿势；本人ch07第一参考仅保留骨相身份，不沿用前界年龄、服制和器物，不借其他game或TV角色冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、浓妆丰唇、Q版、3D塑料或换头拼贴。不要以美化抹去中老年皱纹，病弱成人不画成儿童，不用怪物化和身体羞辱表达性格或健康。不要人物碎墨、飞白缺块、纸纹透肤透衣、墨斑侵蚀、破洞、撕裂衣摆、碎布毛边、密集噪点或过密细皱，衣料皮肤器物完整连续。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰物、晚清大拉翅、民国旗袍、中山装或近现代军装；清初服制和剃额细辫、女道髻、僧人剃度分别依人物本阶段，不泛化成同一种发式。不要左衽、镜像衣襟、无据冠服等级纹章、日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、赛博或蒸汽朋克。不要多人、分格、特写框、多视角、裁断头足器物端点、多肢多指、手物融合、错接手腕、无据缺肢失明、漂浮装备、无挂点鞘带或断裂兵器。不要无据加兵器、发光法阵、光翼、光龙、粒子、浓雾遮结构、强逆光；不要具体剧情场景、清晰建筑、室内布景或拥挤背景，保留极淡水墨远山与留白。不要裸露透衣、色情化、血腥特写、夸张抽搐或恶搞。不要文字、伪字、题款、签名、印章、logo、器物铭文、书页字或新装饰水印；保留工具原有溯源信息。

FINAL POSE CHECK: FRONT-FACING full-body, head and neck UPRIGHT, forehead–nose–chin VERTICAL, both eyes HORIZONTALLY LEVEL, camera level, NO head tilt, NO Dutch angle. Preserve this person’s own age-adapted facial identity and narrative stage. Preserve ONLY the same-person identity from image 1; make the specified ch08 age and stage clearly readable.
```

## 排除项

不要文字、汉字、伪字、题款、签名、印章、logo或装饰水印；不要现代服饰、拉链、腕表、运动鞋、高跟鞋、数码物件；不要真人演员脸、明星相貌、剧照构图或具体改编的独创造型，不用画师姓名作风格词，不复制具体画作；不要动漫大眼、低幼化滤镜、统一网红锥子脸、丰唇浓妆、偶像磨皮、摄影写真、塑料皮肤或三维模型渲染感；不要日式服制、前结宽腰带、日本刀、圆盘镡、菱形缠柄、欧式奇幻铠甲、赛博或蒸汽朋克；不要时代与族群混搭、错误衣襟、水平镜像、无依据的冠服与兵器；不要额外人物、多视图、分格、面部特写框、多肢多指、粘连手指、错接手腕、手物融合、失重衣料、悬空装备、弯折断裂兵器或容不下剑刃的短鞘；不要无依据的破衣碎布、畸形健美肌肉、血腥特写、裸露、透明衣料、色情化、恶搞或丑化；不要发光兵器、法阵、仙法、龙形能量、粒子特效、强逆光、浓雾遮挡或具体剧情场景及清晰建筑；不要晚清大拉翅、民国旗袍、中山装与近现代军装；不要裁断头足、衣摆、发饰和兵器端点。不要照搬碧血青年年龄与皮肤状态，保留本人骨相身份、明末将领束髻、帝王龙袍冕旒、皇帝宝座、清廷官员通用补子乱配或沙场骑马；不要仙侠长刀。 不要 head tilt、Dutch angle、头歪向肩、眼线倾斜、侧脸侧视、回眸、低头藏眼、抬下巴或倾斜镜头。不要复制背景参考王语嫣或任何别人的脸、年龄、身体、发型、衣装、道具和姿势；本人ch07第一参考仅保留骨相身份，不沿用前界年龄、服制和器物，不借其他game或TV角色冒充本人。不要统一网红锥子脸、偶像磨皮、动漫大眼、浓妆丰唇、Q版、3D塑料或换头拼贴。不要以美化抹去中老年皱纹，病弱成人不画成儿童，不用怪物化和身体羞辱表达性格或健康。不要人物碎墨、飞白缺块、纸纹透肤透衣、墨斑侵蚀、破洞、撕裂衣摆、碎布毛边、密集噪点或过密细皱，衣料皮肤器物完整连续。不要现代服饰、拉链、腕表、运动鞋、高跟鞋、手机、塑料饰物、晚清大拉翅、民国旗袍、中山装或近现代军装；清初服制和剃额细辫、女道髻、僧人剃度分别依人物本阶段，不泛化成同一种发式。不要左衽、镜像衣襟、无据冠服等级纹章、日式服制刀具、圆盘镡、菱形缠柄、前结宽腰带、欧式奇幻甲、赛博或蒸汽朋克。不要多人、分格、特写框、多视角、裁断头足器物端点、多肢多指、手物融合、错接手腕、无据缺肢失明、漂浮装备、无挂点鞘带或断裂兵器。不要无据加兵器、发光法阵、光翼、光龙、粒子、浓雾遮结构、强逆光；不要具体剧情场景、清晰建筑、室内布景或拥挤背景，保留极淡水墨远山与留白。不要裸露透衣、色情化、血腥特写、夸张抽搐或恶搞。不要文字、伪字、题款、签名、印章、logo、器物铭文、书页字或新装饰水印；保留工具原有溯源信息。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/identity-20261001/por_npc_wusangui__ch08_elder_pingxi_base.prepared.json`。
