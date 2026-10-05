---
asset_id: por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff
subject_id: npc_yangguo
name: 杨过
book: ch03_shendiao
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch03/por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff.png
manifest: assets/default/character/male/ch03/manifest.yaml
asset_variant: scene
scene_key: dashengguan_youth_bamboo_staff
scene_title: 大胜关·少年扬威
stage: 第12–13回英雄大宴、对阵霍都，右臂尚未被斩；青年古墓传人，聪慧灵动的早期侠气。
references:
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_yangguo__ch03_youth_onearm_base.resume3.png", "use": "本轮新立绘；锁定人物身份、年龄与对应阶段造型", "sha256": "0c4fa42a5bbf79f72b7d699ab82766820ad3159245fffec7ed8043781dc42a50"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/yangguo_still1.jpg", "use": "经典影视造型；只借服饰发型配色气质，不照搬演员五官", "sha256": "0215359e2593e5c4b60e2d8893d6688e84af24f9f8feda752c7a5688a41e6696"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/yangguo_game.jpg", "use": "经典武侠游戏插画风格；只借绘画气质、线条、造型感", "sha256": "2d142ff242d716ec4947e179892cb4756395070bbbf850bd115959abf87c441e"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "7e6d79259fbe713df66f3d94cc23a6703181a38c8534373fa436882e0e6f2fe1"}
- {"path": "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg", "use": "项目同性别基线；只取画风", "sha256": "b167bd9f5352842d6bba12d41962da8427cee329dd52d94d4150bcae611143ff"}
status: candidate
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
redo_reason: "作者 10-02 晚：复合基线风格精修"
reference_upload:
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/out/por_npc_yangguo__ch03_youth_onearm_base.resume3.png"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/yangguo_still1.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/codex_w11/resume/refs/yangguo_game.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_linghuchong__ch05_base01.jpg"
- "/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod/.agents/coord/_handoff/gem/baseline_small/male__ref_npc_xiaofeng__ch01_base01.jpg"
composite_job: por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff.resume3
---

# 杨过 · 人物写实修正

## Gemini 提示词

> 作者10-02晚复合精修；任务 `por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff.resume3`；实际上传顺序见frontmatter，末两张为male项目基线。

```text
生成一张 2:3 竖幅全身人物立绘：单人、单一视角、完整全身——头顶、双手、双脚和手中器物的两端都在画面内，四周留出自然空白；人物站姿自然，身体基本朝向正面，头部端正（不歪头、不仰不俯），镜头平视。
输出1024×1536，完全成年，禁止童颜或少年身材。
【身份】第一张是本轮该主角新基础立绘，面部骨相必须保持一致，只依下文变年龄、衣物、姿态、道具与背景；第二张之后的剧照仅借造型，游戏图仅借古典武侠绘画气质，不恢复演员五官。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风，像功力深厚的画师用细腻笔触画出的真实人物。手绘插画质感，不是 CG 渲染：不要过度光滑的皮肤、完美对称的五官、塑料高光、过度锐利的发丝；保留自然的笔触和细微不完美。皮肤有真实质感——细纹、晒痕和自然的左右不对称，不磨皮、不油亮；头发是一缕缕自然的发丝和少量碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。不是照片，不是三维渲染，不是动漫或游戏 CG，也不是油画（没有厚涂笔触和画布纹理）。
【背景】保留下面指定的阶段场景、建筑和道具；淡水墨空间、暖浅灰纸感、自然远近层次，不抠图。
保持本轮杨过基础图同一核心骨相，但是断臂前的成年青年游历阶段：必须双臂和双手完整，绝不继承基础图的空右袖、伤残或玄铁剑。灰褐利落旅装、墨绿腰带、绑腿布靴，黑发高束。右手握普通竹棒，左手自然按腰，轻扬眉眼里有不羁、自信和敏锐。背景保留大胜关客路、远处木台与群山，完整全身，无其他清楚人物。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片或演员复刻。不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；衣襟必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。
最后两张是项目画风基线，只取手绘质感、线条、设色与空气层次，不取其中人物的身份、姿势、道具。
```

## 历史 Gemini 提示词（本轮复合精修之前，不再用于出图）

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**整体重出（随基础图）**。杨过基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定。
> 上传参考只按 frontmatter `reference_upload`（共 1 张，按顺序上传）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物剧情场景图：画面里只有这一个人物，完整全身（头顶、双手、双脚和手中器物都在画内），人物是画面主体；头部端正、五官清楚，镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【场景背景】大胜关英雄宴厅：淡淡的柱影和少量席案轮廓，留出空旷的比试地面。背景用低对比、低饱和的淡彩水墨来画，只保留能认出地点的少量轮廓，不喧宾夺主；人物轮廓清楚、与背景分开，水墨不侵入人物和衣服。
【人物与场景】杨过，《神雕侠侣》，大胜关·少年扬威。阶段：第12–13回英雄大宴、对阵霍都，右臂尚未被斩；青年古墓传人，聪慧灵动的早期侠气。
【身份参考】随提示词上传的第 1 张图是杨过本人的新版基础立绘：保持同一张脸、同样的年龄感、体格与发际（清瘦俊秀的长脸、颧骨略高，浓黑的剑眉斜飞入鬓，一双凤眼细长、眼神锐利，鼻梁高挺，薄唇，脸色偏苍白；身材高挑精瘦）；本场的服饰、动作、道具与背景按下文，不要照搬基础立绘的姿势与背景。
【伤残】本场双臂双手都健全（右臂此时还没有被斩断）。
【衣装】浅苍青交领右衽窄袖江湖长衣、墨灰布腰带、深色束口长裤和轻便布鞋，长黑发用窄布带半束；此时双臂健全（右臂还没被斩）。
【动作与神情】轻巧转身、竹棒点出后的收势，全身姿态完整；目光明亮机敏，带一点临敌从容的笑意（十八九岁的少年英气，但按成年人比例画）。
【器物】一根当场借用的竹质打狗棒（只此一件兵器）；不画玄铁重剑或神雕。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要第二个人物或人群、分身残影；不要可读文字或图谱口诀；不要换成另一张脸。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

## 人物与阶段

- subject_id：npc_yangguo
- book：ch03_shendiao
- gender：male
- age_variant：youth
- scene_title：大胜关·少年扬威
- scene_key：dashengguan_youth_bamboo_staff
- stage：第12–13回英雄大宴、对阵霍都，右臂尚未被斩；青年古墓传人，聪慧灵动的早期侠气。

## 本轮人物写实规范

作者最新人物美观写实修正：大胜关·少年扬威；自然细腻面容与连续人体光影，完整剪裁布料，水墨仅背景，保持原场景阶段。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff/prompt-6b0a5a191cbb94e4941609167e2e50f7feacee3f3dd01795d767e55662c4aa7e.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

本场独立创作杨过的年轻俊美、灵动英侠身份。第一张萧峰写实样图只供人体皮肤、连续体积光影、清楚轮廓及完整布料的渲染品质；它绝不是杨过身份参考，必须放弃其方阔成熟脸、胡须、壮硕体型、头巾、披氅与掌势。第二张令狐冲男性基线严格仅色卡，不复制其脸。第三张女子图只供背景水墨山水与留白，不借人像、服装或女性面容。杨过的具体独立面骨以下文为准。

杨过，《神雕侠侣》，大胜关·少年扬威。
阶段：第12–13回英雄大宴、对阵霍都，右臂尚未被斩；青年古墓传人，聪慧灵动的早期侠气。
人物、完整衣装与动作：双臂双手完全健全的青年杨过，以轻巧转身和竹棒点出后的收势组成完整全身姿态，目光明亮机敏，带一点临敌从容笑意。独立杨过青年身份：修长清俊而有自然骨量的脸，长眉微扬，明亮灵动的清长眼，秀挺鼻梁，自然放松的唇线，下颌清晰不方阔也不尖锥；干净无须，俊美而有英侠精神，不是萧峰的成熟方脸、胡须与壮硕体格，也不是令狐冲基线脸。修长结实的身体、舒展肩背和轻快步法表现才气与担当。皮肤自然细腻，五官具真实结构而不塑料磨皮。 浅苍青南宋青年江湖长衣，交领右衽、窄袖，墨灰完整布腰带，深色束口长裤和轻便布鞋。长黑发用窄布带半束，无网状抹额、胡须、繁复首饰。朴素衣服即使是旧衣也完整干净、有明确裁片与缝边，修长轻快的剪影来自衣装版型，不靠磨损、毛边、碎带或露肌。
器物：当场借用的丐帮打狗棒，竹质朴素，不是普通自有竹棍，也不代表他担任帮主。仅持这一件兵器，不加玄铁重剑、面具或神雕。
背景：大胜关英雄宴厅的淡柱影和少量席案轮廓，保留空旷比试地面；群雄可省略或只作极淡背景意象。
场景重心：完整双臂、灵动俊美青年面容与当场借用的竹质打狗棒，简明宴厅意象；不借用任何基线脸或成熟英雄体格。
仅一个完整人物，头顶、实际存在的手、完整衣摆、两腿双鞋和主要器物入画，自然留边、真实承重。柔和左上光形成连续明暗，人物细腻自然、布料完整，不允许背景墨韵切碎人像。竖幅2:3，目标2048×3072 PNG，工具原生输出，不透明背景。汉式交领按人物自身左襟压右襟，不镜像。
考据边界：初报中普通竹棒的说法经正文复核已更正；本场是临时借用正式打狗棒。 不得用断右臂旧草稿覆盖本场，不加空袖、白鬓、重剑或黯然掌。 以比试中的竹棒阶段为切片，不把后来换剑与多段战斗揉成同一持物画面。 本轮为人物美观写实修正，人物材质与完整服装依2026-10-01新规范，水墨只用于背景；服色、剪裁和全身构图是美术补足。旧版candidate与新revision完成状态分开，本record不代表新图已生成或已审批。

排除项：不要萧峰的脸、胡须、宽大肩背、头巾、披氅或出掌姿势；不要令狐冲脸与网状抹额，不要断臂、空袖、玄铁剑、神雕、面具、白发或黯然掌。 人物本体禁止飞白、碎墨、纸透色、纸屑拼贴、干刷缺口、颗粒侵蚀、划痕、脸部斑驳、水彩污点、破布、撕裂衣角、毛边、碎带和密集细碎褶皱；水墨只用于背景，绝不能侵入脸、皮肤、衣服或鞋。不要复制萧峰的成熟脸、浓须、头巾、披氅、体型、掌势或少室山背景，除郭靖华山明确授权外不继承墨龙。不要照片截图、塑料3D、过度磨皮、动漫大眼、现代物品、王冠金甲、错时代服饰、错误多肢多指、手物融合、头足或器物端点裁断、额外人物、拼贴多格、题款文字、印章logo或新增装饰水印。保留工具自身溯源。
```

## 排除项

不要萧峰的脸、胡须、宽大肩背、头巾、披氅或出掌姿势；不要令狐冲脸与网状抹额，不要断臂、空袖、玄铁剑、神雕、面具、白发或黯然掌。 人物本体禁止飞白、碎墨、纸透色、纸屑拼贴、干刷缺口、颗粒侵蚀、划痕、脸部斑驳、水彩污点、破布、撕裂衣角、毛边、碎带和密集细碎褶皱；水墨只用于背景，绝不能侵入脸、皮肤、衣服或鞋。不要复制萧峰的成熟脸、浓须、头巾、披氅、体型、掌势或少室山背景，除郭靖华山明确授权外不继承墨龙。不要照片截图、塑料3D、过度磨皮、动漫大眼、现代物品、王冠金甲、错时代服饰、错误多肢多指、手物融合、头足或器物端点裁断、额外人物、拼贴多格、题款文字、印章logo或新增装饰水印。保留工具自身溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff.prepared.json`。

## 原著依据

- 《神雕侠侣》第十三回 武林盟主：“杨过却用铁桨柄去打他后臀”；https://www.xuges.com/wuxia/jinyong/sdxl/088.htm
- AR-82 返修约束（本节优先于历史提示词）：只将手里黄褐竹杖换为渔隐断裂铁桨的桨柄，是一根黝黑金属杆、顶部或一端清楚的断裂金属口，不画竹节。保留握持位置、完整双臂、站姿、脸及背景，不提前断臂。
