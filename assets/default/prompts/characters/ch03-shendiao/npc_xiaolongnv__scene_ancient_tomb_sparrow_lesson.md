---
asset_id: por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson
subject_id: npc_xiaolongnv
name: 小龙女
book: ch03_shendiao
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch03/por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson.png
manifest: assets/default/character/female/ch03/manifest.yaml
asset_variant: scene
scene_key: ancient_tomb_sparrow_lesson
scene_title: 古墓授艺·天罗雀影
stage: 第5回接纳杨过之后、第6回古墓授艺阶段；早期青年掌门，未到绝情谷取淑女剑，也未从周伯通学左右互搏。
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_xiaolongnv__ch03_youth_jueqing_base.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "a1ec611c1fca7f9fafafd935e164f3fb9233dd2ce20a804fdc86457ae3cdf6e0"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/xiaolongnv_still1.jpg", "use": "经典影视造型；只借服饰发型配色气质，不照搬演员五官", "sha256": "b5f8ec35745a490181f3c22777c2a4abb8258f56a23aa4510a6294120a6bc146"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/xiaolongnv_game.jpg", "use": "经典武侠游戏插画风格；只借绘画气质、线条、造型感", "sha256": "af8aec7687638c1cc8fbbf5721170e552d8369151dc4722954700a60224f3dc9"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_wangyuyan__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "cd6b69da364b28cfc91738d9647b8a94962e740cc8adbef303c721bfcf352bed"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_xiaolongnv__ch03_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "f45e437fad61090b11ba36df0779b783b1996e6a61942c019d49a121b7d9feae"}
status: candidate
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
redo_reason: "作者 10-02 晚：复合基线风格精修"
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_xiaolongnv__ch03_youth_jueqing_base.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/xiaolongnv_still1.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/xiaolongnv_game.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_wangyuyan__ch01_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/female__ref_npc_xiaolongnv__ch03_base01.jpg"
composite_job: por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson.resume3
---

# 小龙女 · 人物写实修正

## Gemini 提示词

> 作者10-02晚复合精修；任务 `por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson.resume3`；实际上传顺序见frontmatter，末两张为female项目基线。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
输出1024×1536，完全成年，禁止童颜或少年身材。
【身份】第一张是本轮该主角新基础立绘，面部骨相必须保持一致，只依下文变年龄、衣物、姿态、道具与背景；第二张之后的剧照仅借造型，游戏图仅借古典武侠绘画气质，不恢复演员五官。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】保留下面指定的阶段场景、建筑和道具；淡水墨空间、暖浅灰纸感、自然远近层次，不抠图。
同一小龙女的早期成年青年古墓授艺阶段，眼神宁静、疏离里有耐心。素白短外衣叠浅灰白长裙，右衽，窄袖便于练功，发髻简净。双手展开短段白绸金铃，一只麻雀停在邻近石面、少量麻雀掠过远处。完整全身置于古墓石室，油灯微暖、石门和寒玉台只作低对比环境；不画第二人物，不把她画幼女。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片或演员复刻。不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；衣襟必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**整体重出（随基础图）**。小龙女基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定。
> 上传参考只按 frontmatter `reference_upload`（共 1 张，按顺序上传）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物剧情场景图：画面里只有这一个人物，完整全身（头顶、双手、双脚和手中器物都在画内），人物是画面主体；头部端正、五官清楚，镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【场景背景】古墓练功石室的淡石壁、入口与少量光线。背景用低对比、低饱和的淡彩水墨来画，只保留能认出地点的少量轮廓，不喧宾夺主；人物轮廓清楚、与背景分开，水墨不侵入人物和衣服。
【人物与场景】小龙女，《神雕侠侣》，古墓授艺·天罗雀影。阶段：第5回接纳杨过之后、第6回古墓授艺阶段；早期青年掌门，未到绝情谷取淑女剑，也未从周伯通学左右互搏。
【身份参考】随提示词上传的第 1 张图是小龙女本人的新版基础立绘：保持同一张脸、同样的年龄感、体格与发际（清丽的长鹅蛋脸、下颌线柔和，眉毛细长平直、颜色偏淡，眼睛清澈而冷、眼神淡漠出尘，鼻梁细直，唇色极淡，肌肤苍白如雪、几乎没有血色（久居古墓），素面无妆）；本场的服饰、动作、道具与背景按下文，不要照搬基础立绘的姿势与背景。
【衣装】素白不透明右衽长衫、白色齐腰长裙、窄白布腰带、平底素布鞋；乌发用窄白布带简洁束起、余发顺垂；双手戴素白贴手的五指手套。
【动作与神情】在古墓石室门前完整站立，双掌轻巧分合，掌势有节奏地拢住几只普通麻雀（天罗地网势），眼神专注沉静——是在给画外的杨过示范。
【器物】几只普通麻雀围绕掌势飞动（不是仙鸟或能量）。
【体态】成年女性的身体比例（约 7 头身），衣着完整端庄、不透明、不暴露、不性感化。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要第二个人物或人群、分身残影；不要可读文字或图谱口诀；不要换成另一张脸。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

## 人物与阶段

- subject_id：npc_xiaolongnv
- book：ch03_shendiao
- gender：female
- age_variant：youth
- scene_title：古墓授艺·天罗雀影
- scene_key：ancient_tomb_sparrow_lesson
- stage：第5回接纳杨过之后、第6回古墓授艺阶段；早期青年掌门，未到绝情谷取淑女剑，也未从周伯通学左右互搏。

## 本轮人物写实规范

作者最新人物美观写实修正：古墓授艺·天罗雀影；独立女主面容、自然肤质、连贯光影、完整剪裁衣料；水墨只用于背景。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson/prompt-c0273574727802ddd1365a27da487301c074410b5800ff600bc5150392568961.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

参考顺序：第一张女性王语嫣基线仅提供低饱和色卡，不提供面容或身份；第二张萧峰新写实样图仅示范自然肤质、连续光影、人体体积和完整布料的渲染品质，严禁复制男性面孔、胡须、宽颌、肩胸体型、深色服饰与掌势；第三张用户图仅提供背景水墨空间，不借其中女子。依下文独立塑造本人的脸和气质，不套任何参考人物。

人物：小龙女（npc_xiaolongnv），《神雕侠侣》，独立经典场景《古墓授艺·天罗雀影》。
阶段：第5回接纳杨过之后、第6回古墓授艺阶段；早期青年掌门，未到绝情谷取淑女剑，也未从周伯通学左右互搏。
身份与动作：为小龙女独立设计清雅美丽的成年青年面容：修长而不过窄的鹅蛋脸，额面与颧颊有自然体积，平直舒展的细眉，清澈沉静的中等大小长眼形，鼻梁线条清楚柔和，唇形自然饱满适度，下颌完整而不尖削。眼神专注，有自己的判断，清冷而有生命感；面部有细腻自然肤质和连贯光影，不苍白成纸片。身形修长匀称、肩颈舒展，成年自然比例，不低幼、不性感化；不复制黄蓉的俏皮眉眼，也不套王语嫣或演员的五官。 小龙女双臂健全，完整站立、双足着地，肩颈安静舒展；双掌轻巧分合、掌袖方向有清楚节奏，控制少量普通麻雀的活动范围。眼神专注沉静，以实际示范表达师父的武学与判断，不使能量法术，不添加杨过到画内。
服饰与材质：素白不透明右衽长衫、自然垂坠的白色齐腰长裙、窄白布腰带和平底素布鞋；以柔和真实阴影和极浅冷灰体积分清衣片，不在衣料内加水墨或纸纹。乌黑长发以窄白布带简洁束起，余发顺垂。双手戴完整素白贴手五指手套，指尖、手腕与袖口边界清楚；衣服缝边完整，不加华丽花簪、粉纱披帛或珠串耳坠。
器物：双手不持兵器，少量普通麻雀围绕掌势作为捕雀教学意象；不画一对白雕、仙鸟或由手心发出的鸟形能量。手套可保留项目素白贴手表现，不遮掌势。
背景：古墓练功石室或相连门前的淡石壁、入口与少量光线，少年杨过可在画外学习；不画花丛内功合练或卧床画面。

人物绘制要求：优美而可信的写实手绘国风插画，面骨、五官、双手和全身结构细致自然；柔和左上光在脸、皮肤和衣料上形成连续光影与坚实体积。皮肤不透纸，衣料密实完整、有明确剪裁，少量宽而有分量的衣褶顺重力和动作连接，领襟袖口下摆有连续缝边。所有人物轮廓干净清楚，人物外的背景才使用淡墨晕染、留白和低对比场景轮廓；背景不能侵入脸、手、衣服和鞋，动物与器物也保留可读的完整结构。朴素旧衣依然完整可穿；只有本场明确的乔装灰痕或病容保留，其余不增加污渍、风化和破损。

构图交付：仅一位完整女主人物、单视图，竖幅2:3，目标2048×3072 PNG，工具原生实际尺寸如实保存；不透明暖浅灰底，不生成透明棋盘格。头顶、双手、双腿、双鞋、衣摆及器物端点完整入画并留自然边距，坐姿也完整呈现身体与足部；真实承重与正常关节，器物握持和挂接可追踪。汉式交领保持穿着者左襟压右襟，不镜像。衣物完全遮蔽，不性感化；英雄气来自眼神、判断与行动，不靠破损和华丽装备。具体姿势、剪裁、配色和场景简化为美术补足，不冒称原著固定画面。

情节与考据边界：雀数在本地图鉴仍待考，画少量代表性雀影是场景简化，不宣称已逐只还原原著计数。 不将手套、淑女剑、金铃索基础组合全数套入早期授艺；不提前画淑女剑或左右互搏双剑。 单人示范姿势与雀群位置是美术补足，保持清楚的授艺情节。 本record仅为独立场景设计，不覆盖基础立绘；不代表已生成、已保存或已审批，成图仍为candidate并由实际执行结果登记。 作者最新人物写实修正：人物本体美观写实、自然肤质、完整布料和连续光影；水墨仅在背景。剧情乔装和伤病按本场保留，不以破损画法代替。此record只声明新方向，实际成图须查看验证后才计本轮candidate，不自行approved。

完整排除项：不要人物飞白、干笔断裂、碎墨、墨线勾满五官、纸透皮肤、斑驳脸、拼贴纸屑、颗粒侵蚀、破洞、撕裂衣角、碎带或过度密集褶皱。不要王语嫣脸、演员或明星脸、男性胡须宽颌厚胸、萧峰体型与衣装、统一网红脸、动漫大眼、塑料磨皮、摄影截图或三维模型。不要性感化、低领露腰、透明衣料、夸张成人曲线或婴幼儿比例。不要现代物件、清式服饰、日式服装兵器、左右镜像、多肢多指、手物融合、裁断头足器物、分格拼贴、额外完整人物、可读文字、题款、印章、logo或新增装饰水印；保留工具本身溯源。 不要淑女剑、金铃索、双剑、左右互搏姿势、白雕、仙鸟、鸟形能量或多人教学群像；不要华丽花髻和珠串。
```

## 排除项

不要人物飞白、干笔断裂、碎墨、墨线勾满五官、纸透皮肤、斑驳脸、拼贴纸屑、颗粒侵蚀、破洞、撕裂衣角、碎带或过度密集褶皱。不要王语嫣脸、演员或明星脸、男性胡须宽颌厚胸、萧峰体型与衣装、统一网红脸、动漫大眼、塑料磨皮、摄影截图或三维模型。不要性感化、低领露腰、透明衣料、夸张成人曲线或婴幼儿比例。不要现代物件、清式服饰、日式服装兵器、左右镜像、多肢多指、手物融合、裁断头足器物、分格拼贴、额外完整人物、可读文字、题款、印章、logo或新增装饰水印；保留工具本身溯源。 不要淑女剑、金铃索、双剑、左右互搏姿势、白雕、仙鸟、鸟形能量或多人教学群像；不要华丽花髻和珠串。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_xiaolongnv__ch03_youth_scene_ancient_tomb_sparrow_lesson.prepared.json`。
