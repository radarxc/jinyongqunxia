---
asset_id: cg_ch01_xiaojinghu_azhu
name: 小镜湖青石桥
book: ch01_tianlong
characters:
- npc_xiaofeng
- npc_azhu
output: assets/default/scene/ch01/cg_ch01_xiaojinghu_azhu.png
manifest: assets/default/scene/ch01/manifest.yaml
size: 1536x1024
status: candidate
author_requirements:
- AR-53
- AR-61
- AR-75
- AR-81
- AR-84
- AR-90（01:41补充）
base_image: .agents/coord/_lines/xiaojinghu-regen/best_candidate_r4.png
edit_job: cg_ch01_xiaojinghu_azhu.ar90_expr_r5
edit_crop:
- 450
- 230
- 810
- 590
reference_upload:
- .agents/coord/_lines/xiaojinghu-r5/refs/r4_azhu_head_edit.jpg
- .agents/coord/_lines/xiaojinghu-r5/refs/azhu_base_face.jpg
references:
- path: .agents/coord/_lines/xiaojinghu-regen/best_candidate_r4.png
  sha256: 85ac2610c23550e95ac97ad4f5bdb152ea8a53edbe78e51bcda107d946dbee32
  use: 作者认可的整张重出r4；唯一构图、萧峰、男袍、雨夜、题字与像素保留底图
- path: assets/default/character/female/ch01/por_npc_azhu__ch01_youth_alive_base.png
  sha256: aa37f35be809f8d93fbf509f4f581dc6e8c9e3204a92f50a8b2c50ee66d4b8c8
  use: AR-61 B修眼稿；只取阿朱五官身份、眼型鼻形脸型唇形与偏薄上唇，不复制笑容
- path: .agents/coord/_lines/xiaojinghu-r5/refs/r4_azhu_head_edit.jpg
  sha256: 09faa28ad7fbf75259e5782c3d62415eae706d01abb792d2da4e61050c51ffc4
  use: 实际上传参考第1张：r4阿朱头部原位裁图，唯一编辑目标
- path: .agents/coord/_lines/xiaojinghu-r5/refs/azhu_base_face.jpg
  sha256: bdb64f81526421e8cda8eb40e590cd7a6db4368a38faa9ae47b382294bed4496
  use: 实际上传参考第2张：阿朱现行base脸部，只取五官身份
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_gaibang_base.png
  sha256: acfe990e0d0e4b2513bb953f50c29d18418ee915c8a2026056ede55b46b720dd
  use: AR-84恢复后的萧峰现行base；与r4并排打开放大核对通过，保留r4、不搬旧构图脸
composite_mask: .agents/coord/_lines/xiaojinghu-r5/azhu_face_mask.png
feather: 12 px，向蒙版内部羽化
comparison: .agents/coord/_lines/xiaojinghu-r5/xiaojinghu_r5.jpg
---

# 小镜湖青石桥：阿朱临终遗憾的笑

作者 AR-90 在 2026-10-04 01:41 的最新口径覆盖先前“不笑”：

> 原著写的是"露出笑容" -  不是这种眉目含情的笑啊，是遗憾的笑。。。

阿朱临终凄然一笑，带歉意、带不舍；嘴角只微微牵起，双唇轻合。眼里含泪、满是哀伤，眉头微蹙带忧。不舍、遗憾、担心都在这一笑里：放不下萧峰，担心他今后，遗憾不能相守。眼睛不弯成月牙，没有娇媚，也不是甜笑。

## 现行场景、动作、状态与关系

- 场景：北宋小镜湖青石桥，雷雨深夜；湿石桥、湖水、柳枝、斜雨、远处闪电与微弱灯火，照作者认可的 r4。
- 动作：萧峰紧紧护抱失力的阿朱，低头悲恸地看她；阿朱头颈由他支撑，虚弱地望着他，位置、姿态和画幅均保持 r4。
- 状态：阿朱此前易容成段正淳，替生父受萧峰一掌，现已恢复女子本来面目；仍穿 r4 的灰色易容男袍。她重伤临终，脸色苍白，嘴角一缕暗红血，不能画成健康幸福的依偎。
- 关系：误伤爱人后的悲恸保护，与阿朱歉意、不舍、遗憾、担心交织的凄然一笑。画面只保留萧峰和阿朱两人。
- 身份：阿朱五官仍像 AR-61 选定 B 并自然放大眼睛后的现行 base，眼型、鼻、圆颊脸型、下巴和唇形一致；上唇偏薄。萧峰 r4 与 AR-84 恢复后的现行 base 并排核对通过，原样保留。
- 画风与题字：保持 r4 的写实手绘古风、雨夜冷光和湿发湿衣质感；右上竖排“镜湖诀别”四字及朱印原样保留。

## 现行局部编辑提示词（实际出图）

本轮只把 r4 的阿朱头部裁出；参考上传顺序是头部编辑底图、阿朱 base 脸部。输出方形裁图后等比例还原到原位，用阿朱脸部多边形蒙版向内羽化 12 px 合回。阿朱头部外逐像素保持 r4，尤其萧峰、易容男袍、雨夜、石桥和题字。湿发、下颌、脖子接缝须实际打开放大检查。

```text
Use case: identity-preserve. Asset type: 小镜湖剧情插图阿朱头部局部表情修正，AR-81 / AR-90 作者01:41最新补充。
图1是唯一编辑底稿：作者认可r4中阿朱头部的原位正方形裁图。输出同样1024×1024裁图，头部位置、大小、倾角、脸部外轮廓、发际线和镜头完全一致。图2是作者AR-61选定阿朱base脸部，只参考五官身份与薄上唇，不复制图2甜笑、肤色、发式、姿态。
【最新作者口径，覆盖之前“不笑”】原著写“露出笑容”，不是眉目含情的笑，是“遗憾的笑”。她重伤临终，凄然一笑，带歉意、带不舍、带担心。嘴角只微微牵起，双唇轻合；眼里含泪、满是哀伤，眉头微蹙带忧。放不下萧峰、担心他的今后、遗憾不能相守，所有情绪都在这一丝凄然的笑里。主情绪是悲伤与歉意，笑幅很小。必须改掉图1眉目含情的甜笑。
【眉眼】目光仍望向图1左上方的萧峰；保持原来的眼型大小和视线角度，眼睛含泪，下眼睑湿润，疲惫、哀伤、不舍。内眉微收、眉头轻蹙带忧。眼睛不弯成月牙、不眯成笑眼，没有娇媚、挑逗、轻快或幸福。不加夸张哭脸。
【嘴唇】双唇轻合，不露牙；保留base自然唇峰与偏薄的上唇，嘴角只微微牵起，唇形克制。是勉力的、临终歉然的凄笑，不能甜笑、媚笑、开心浅笑、幸福依偎、脸颊含情鼓起或酒窝笑。
【身份】图1和图2是同一位阿朱；眼型大小、鼻梁鼻尖鼻翼、圆颊脸型、下巴、唇峰唇形与base一致，不变成厚唇或另一位美女；小痣保留。脸色苍白失血，嘴角一缕暗红血原样保留，不增加伤口。
【原图不变】只改阿朱表情，保留头部倾角、视线方向、脸部轮廓、湿发每束走向、耳朵、粉玉耳坠、发髻、灰色易容男袍、脖子长度位置、下颌到脖子的衔接、手绘笔触和雨夜冷光。图1左上萧峰那一点脸及衣物绝对不动。不要重排、镜像、转正脸、改妆容或发型、文字、水印、照片贴脸。
本版唯一表情细化：更虚弱克制的凄然一笑：嘴角只微微牵起，双唇轻合，上唇照base偏薄。眼睑疲惫但绝不笑眯，眼底满是哀伤与泪光，眉间轻蹙带忧；歉意、不舍、担心、不能相守的遗憾都在这一丝笑里。
```

## 制作与核验记录

先前“不笑”作业 r1–r3 已全部作废。按照作者 01:41 补充重出凄笑 r4–r6，总计 6 次；三张原始裁图、三张合成后接缝放大图均实际打开。选择 r5：眉间忧色更明确，哀伤泪眼和克制的闭唇微牵更贴近临终歉然的遗憾一笑。整图、阿朱脸与 base 脸对照已打开；下颌、脖子和湿发边界自然。蒙版外像素差为 0，萧峰、脖子服装与题字保持 r4。

入库前等待 canon-align 本人有效结束行；按协调者 01:41 指示，萧峰先与现行 base 并排核对，通过则保留 r4，不把旧构图中校过的五官搬过来。

## 历史提示词

以下仅供追溯，不用于本轮出图。旧版本中的“改命回生”、第三人、素衣或粉裙、“镜湖回生”、没有血迹等说法均已由现行场景和作者最新口径覆盖。

### 整张重出 r4 的原始提示词

```text
Generate a completely NEW 1536x1024 landscape painted wuxia scene from a blank canvas. This is NOT image editing. Use references only for identity and correct Chinese glyphs.

IDENTITIES, highest priority: Image1 = 阿朱当前base全身，Image2 = 同一阿朱base脸部特写。Image3 = 萧峰AR-84当前base全身，Image4 = 其脸部特写。Image5 = 正确简体汉字字形样本，仅供题字的字符形状，不是场景。不要复刻这些图片的站姿或背景。阿朱必须明显是Image2的同一个人，别生成泛化美女。

阿朱脸正朝观众，角度尽量与Image2完全相同，头部近乎竖直，只有很轻微三分之四转向；不要仰头，绝对不露鼻孔底部的仰视角。面容自然饱满，圆颊柔和下颌，Image2的眉形、眉眼间距、杏眼眼型、眼睑和微笑时自然的小眼角弧线、鼻翼和嘴角小痣都忠实保留。她只用眼珠朝左上看萧峰，头不追随眼神后仰。脸宽至少220px、脸高至少250px，无遮挡、清晰、成为主焦点。

这是她中掌重伤、临终托付妹妹的浅笑。保持Image2的微笑身份但收小笑容，不露齿；温柔虚弱的笑意明确从眼神和微提嘴角传出。嘴唇轻合。请忠实复制Image2薄而窄的上唇轮廓：上唇的红色唇肉面积明显小于下唇，只有下唇厚度的约三分之一；唇峰是浅而清楚的双峰，嘴角两侧纤薄向上翘。不要把薄上唇填厚，不要心形大唇峰，不要嘟唇，不要下垂嘴角。薄上唇、嘴角和杏眼是阿朱身份的三个不可改点。脸与脖子同一苍白失血肤色，仍有自然光影。嘴角一缕细血，不能遮住唇峰。雨水打湿她的头发，湿发贴额角、颈侧。下颌颈部连接自然。

场景：夜晚暴雨，小镜湖青石桥，后方湖面、远处闪电、朦胧树柳、对岸极少暖灯。两人占左侧和中央约70%；右侧保留桥的石栏和湿青石地面纵深，右上题字。萧峰半跪桥面，紧紧抱住阿朱斜躺的身体，臂膀支撑她的肩背、腰和腿。她的身体软弱无力，一只手垂落。她的脸面向观众，萧峰在左上低头凝望她，但两张脸不相贴，他的脸和手不能挡她脸、耳、下颌。

阿朱穿易容段正淳赴约时的宽大男式宽袖长袍、缓带，右衽，灰青长袍、素白内襟。衣领已合好、肩头遮住，没有粉色女裙、没有露肩；灰青色为项目选色，原著未规定颜色。易容软泥已经被萧峰抓落，画本人女子脸与雨湿散发，不画假男脸或假胡须。只画两位人物。
萧峰完全照Image4浓眉、大眼、宽阔骨相、鼻口及短胡须，黑灰裹巾、灰褐衣袍、深色粗布外衣、魁梧宽肩。悲恸、难以置信、眼含泪，眉头紧锁，男性不笑。脸也用三分之四视角，可以一眼认出base身份。

画风依项目STYLE.md，细腻写实手绘古风武侠插画，皮肤细微纹理、自然不对称、布料经纬和雨湿发丝可读，和base同一手绘媒介。低饱和冷灰青夜景，自然雷光及弱环境光同时照出脸颈，不用舞台聚光或轮廓光；不写真、不照片、不3D、不磨皮、不塑料油光，不出现照片贴脸接缝。仅嘴角一缕血，不在胸襟上增加大片血迹或开放伤口。

题字：参照Image5的四个正确简体汉字，用楷书笔画而非印刷字，右上从上到下单列写「镜湖诀别」，米白色毛笔字，约画宽6%、高28%，下方无可读文字小朱印。第一字的左部必须是简体「钅」，不能写成「金/釒」；第三字左部是「讠」，第四字右部「刂」。全部用中国规范简体字形，字符严格照Image5，不能写成鏡、訣、別，不用日本字形。题字不得挡脸。无其他文字、水印、签名。

原著依据：《天龙八部》第二十三回《塞上牛羊空许约》，宽袍缓带赴约、中掌后易容软泥揉落，衣领拉好遮肩，眼色柔情无限、脸上露笑容，临终托付照看妹妹。此图合并同段情绪并保留作者认可的半跪怀抱构图。

Composition variant: Keep Azhu head upright in the SAME camera angle as Image2; Xiao Feng sits just behind her left shoulder. Her eyes turn left, her head faces us. Keep all four printed sample glyphs, but paint them with Chinese kaishu brush strokes.

```

### 本轮之前的完整提示词文件

````markdown
---
asset_id: cg_ch01_xiaojinghu_azhu
name: "小镜湖青石桥"
book: ch01_tianlong
characters:
- npc_xiaofeng
- npc_azhu
- npc_duanzhengchun
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_juxianzhuang_guard.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_gaibang_base.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/female/ch01/por_npc_azhu__ch01_youth_alive_base.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
output: assets/default/scene/ch01/cg_ch01_xiaojinghu_azhu.png
manifest: assets/default/scene/ch01/manifest.yaml
size: 1536x1024
status: candidate
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_juxianzhuang_guard.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "26770d598a4d432c9cd44f97d4f69b943422e9dec02f03a906888a60967ee734"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_gaibang_base.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "e73c1fd6abb1d97bf1c2b8c275870a9bbcd45e93e8d1a669be99ae03b88c254f"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/wt/ART-hero-refine-a/assets/default/character/female/ch01/por_npc_azhu__ch01_youth_alive_base.png", "use": "既有S级角色立绘；仅保持该角色身份，与其他人物身份隔离", "sha256": "d80304aabc32f6b945696496a5d70d02076549c38fd6460e022e3f919d07e39d"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
redo_reason: "作者 10-02 晚：复合基线风格精修"
composite_job: cg_ch01_xiaojinghu_azhu.resume3
---

## Gemini 提示词

> 作者10-02晚复合精修；任务 `cg_ch01_xiaojinghu_azhu.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成1536×1024横幅写实手绘古风剧情插画。所有人物均为成年人；经典武侠游戏绘画气质。
小镜湖青石桥，夜雨欲至；本作dc_01_05成功改命窗口（原创扩展改命），不是原著阿朱误死的结局。萧峰左侧惊惧收住掌势，阿朱右侧刚卸易容，成年女子素衣伸手，掌与身体间留距离；段正淳锦袍中年男子从桥后远处赶来，按文字塑造。二人认出彼此的瞬间，无伤口血迹。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
参考前两张分别是萧峰本轮阶段和基础，同一个人不可复制成两人；第三张是阿朱，严格隔离身份。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
【题字】画面右上角竖排一列毛笔楷书，严格从上到下仅写「镜湖回生」，每个字独立清晰准确，不可增字减字。题字占画宽约6%、高度约28%，不挡脸，可附一枚无可读文字的小朱印。除了指定题字，禁止其他文字、水印。禁止现代物品、CG塑料光、幼态、裸露、血腥、错肢、串脸、发光武功。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

```text
生成一张 3:2 横幅情景插画，输出尺寸 1536×1024，题材为《天龙八部》多人剧情名场面。所有人类都必须一眼可辨为成年人。

第 1 张参考图是萧峰（npc_xiaofeng）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
第 2 张参考图是阿朱（npc_azhu）的立绘，只用于保持其面容、成年年龄、发式与本场适用服饰；不要复制原图姿势、背景、机位或光线。
参考图之间身份严格隔离，只锁定各自人物，不互换脸、发式、身形或服装；没有列入上传的角色只能依据文字塑造。

原著位置与改编边界：第二十三回，小镜湖青石桥；本作救阿朱窗口。
地点与时刻：小镜湖青石桥；夜雨将至。
画面瞬间：阿朱卸下易容转身伸手，萧峰掌势在她胸前寸许硬生生停住，段正淳从桥后赶来。
构图与站位：中景；萧峰左、阿朱右，双手之间留出高张力负空间，段正淳虚焦在远端。
情绪基调：惊惧、相认、劫后余生。让每个人的视线、表情和身体重心共同传达这一基调。
人物身份与外貌口径：上传萧峰、阿朱；段正淳为风流中年王爷、锦袍却满面震惊。
未上传身份参考的人物文字要点：
段正淳：壮年男性，自然骨相，穿符合本书时代与其身份的完整传统服饰；不得借用未上传图片的脸。
制作边界：（原创扩展改命）；原著结果为阿朱误死，画面对应 dc_01_05 成功窗。

画风：写实手绘古风，与人物立绘一致；真实自然的皮肤、头发、手部与布料质感，衣料完整不透明，低饱和沉稳设色，自然光，电影感构图，可信空间纵深，不要 AI 塑料感。武打只表现动作方向、阵势与张力，不用发光武功或夸张能量特效。

排除项：不要文字、题字、字幕、水印、签名、Logo、边框或分镜格；不要未指定的多余人物（明确要求的远景群像除外）；不要幼态、儿童体态、性化处理、裸露或恋物特写；不要血腥特写、断肢、尸体堆叠或伤口细节；不要真人、演员、影视剧照复刻；不要多余肢体、手指错误、脸部融合、身份串脸、时代错装、现代物件、动漫风、摄影棚感、3D 塑料感。
```


````
