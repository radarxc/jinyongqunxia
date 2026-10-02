---
asset_id: por_npc_yangguo__ch03_prime_scene_sixteen_years_valley_reunion
subject_id: npc_yangguo
name: 杨过
book: ch03_shendiao
gender: male
age_variant: prime
tier: S
output: assets/default/character/male/ch03/por_npc_yangguo__ch03_prime_scene_sixteen_years_valley_reunion.png
manifest: assets/default/character/male/ch03/manifest.yaml
asset_variant: scene
scene_key: sixteen_years_valley_reunion
scene_title: 十六年后·谷底重逢
stage: 十六年之约结束，跃下断肠崖后在谷底与小龙女重逢；第38–39回交界叙事的壮年阶段。
references:
- path: assets/default/character/male/ch03/por_npc_yangguo__ch03_youth_scene_dashengguan_youth_bamboo_staff.png
  use: 未来杨过本人新写实双臂青年首图身份参考。必须真正生成保存、实际查看并核实manifest realism_revision=user_character_realism_20261001后使用；旧路径PNG或初版candidate不满足此依赖，本record未声称未来新图已生成/已查看。仅继承核心眼鼻口骨相与黑发，当前右臂已断且青年/壮年按本场，不能继承双臂、竹棒或原衣装。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际查看并核SHA256=4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922，manifest realism_revision=user_character_realism_20261001且candidate；只参考自然肤质、连续人体体积/光影与完整衣料的渲染质量。严禁复制萧峰脸、胡须、宽大体型、头巾、披氅、掌势或背景龙，人物身份由本场另定。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 已查看的项目男性基线，仅低饱和色卡，不作为人物身份或人物笔触样板；不继承令狐冲的脸、抹额、剑、站姿，也不继承纸感侵入皮肤、碎墨或粗糙布料处理。原审批状态不变。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际查看，仅参考背景水墨山水、轻淡晕染与留白；人物、脸、女性衣装、发饰与人像画法均不借用，纸纹水墨不能侵入人物本体。
status: redo
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
redo_reason: "杨过基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定"
reference_upload:
- assets/default/character/male/ch03/por_npc_yangguo__ch03_youth_onearm_base.png
- assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
---

# 杨过 · 人物写实修正

## Gemini 提示词

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**整体重出（随基础图）**。杨过基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定。
> 上传参考只按 frontmatter `reference_upload`（共 1 张，按顺序上传）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物剧情场景图：画面里只有这一个人物，完整全身（头顶、双手、双脚和手中器物都在画内），人物是画面主体；头部端正、五官清楚，镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【场景背景】绝情谷底的淡淡潭水、岩壁、洞口和朴素居所，柔和水汽。背景用低对比、低饱和的淡彩水墨来画，只保留能认出地点的少量轮廓，不喧宾夺主；人物轮廓清楚、与背景分开，水墨不侵入人物和衣服。
【人物与场景】杨过，《神雕侠侣》，十六年后·谷底重逢。阶段：十六年之约结束，跃下断肠崖后在谷底与小龙女重逢；第38–39回交界叙事的壮年阶段。
【身份参考】随提示词上传的第 1 张图是杨过本人的新版基础立绘：保持同一张脸、同样的年龄感、体格与发际（清瘦俊秀的长脸、颧骨略高，浓黑的剑眉斜飞入鬓，一双凤眼细长、眼神锐利，鼻梁高挺，薄唇，脸色偏苍白；身材高挑精瘦）；本场的服饰、动作、道具与背景按下文，不要照搬基础立绘的姿势与背景。注意：本场是十六年后，他约三十六七岁——同一张脸更成熟、添了风霜与短须，眉眼鼻唇关系不变。
【伤残】原著断的是右臂：右臂齐上臂断去，右边衣袖空着（不是藏起来的手），只有左手可用；按人物自身左右，不要水平镜像。
【衣装】十六年后的壮年杨过：深灰青右衽江湖衣、暗色腰带、长裤与行旅布靴，长黑发简束；衣衫带一点潭水浸湿的深浅；右边空袖自然垂落。
【动作与神情】左手空着微微伸出，身体向画外的故人（小龙女）倾近，眼神由难以置信转为温柔激动，全身站稳。
【器物】左手空着；没有重剑或面具。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要第二个人物或人群、分身残影；不要可读文字或图谱口诀；不要换成另一张脸。不要两只手都在、不要左臂断、不要义肢或伤口特写。
【画风基线】上传的参考图里，最后一张是本项目的立绘画风基线（只上传了一张时就是它）：只参考它的画风、用色、光线、质感和暖浅灰纸底加淡水墨的背景处理，整体画风必须与它一致——精细写实的数字手绘插画，不是油画，不要厚涂笔触和画布纹理；不要照搬基线图里那个人的长相、年龄、发型、服饰和姿势。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

## 人物与阶段

- subject_id：npc_yangguo
- book：ch03_shendiao
- gender：male
- age_variant：prime
- scene_title：十六年后·谷底重逢
- scene_key：sixteen_years_valley_reunion
- stage：十六年之约结束，跃下断肠崖后在谷底与小龙女重逢；第38–39回交界叙事的壮年阶段。

## 本轮人物写实规范

作者最新人物美观写实修正：十六年后·谷底重逢；自然细腻面容与连续人体光影，完整剪裁布料，水墨仅背景，保持原场景阶段。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_yangguo__ch03_prime_scene_sixteen_years_valley_reunion/prompt-10c4c42a031542c508b56399bb8779d3acd2a1ea4c3eabfeb5f34cfd7cd03dc3.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

第一张必须是已经生成保存、实际查看并核实新写实revision的杨过双臂青年首图，只保持同一人核心骨相、眼鼻口关系与黑发。当前断右臂与本场年龄必须重新落实，不能继承首图双臂、竹棒、衣装或早期轻快表情；旧路径中的初版不能代替该新身份依赖。第二张萧峰仅供自然肤质、完整体积、连贯光影与衣料的写实渲染，不借其脸、胡须、体型或配饰。第三张男性基线只色卡，第四张用户女子图只背景墨韵。

杨过，《神雕侠侣》，十六年后·谷底重逢。
阶段：十六年之约结束，跃下断肠崖后在谷底与小龙女重逢；第38–39回交界叙事的壮年阶段。
人物、完整衣装与动作：首场同一个杨过经过十六年进入壮年，保留可辨识的眼鼻口关系与俊朗修长面骨；阅历只从目光、气度和适度成熟肩背体现，面容依然自然细腻，不加风化斑点和老年皱纹。左手空着微伸，身体向画外故人倾近，眼神由难以置信转为温柔激动，全身站稳。 成熟杨过的完整深灰青右衽江湖衣、暗色腰带、长裤与整齐行旅布靴，长黑发简束。衣衫可带少量潭水浸湿的连续深浅变化，但布料仍完整合体不透明；右空袖自然垂落，清楚显示内部无右臂，左手与双足完整。无粗糙脸斑、蓬乱白发、破洞或丝带碎片。 伤残侧别必须明确：缺失人物自身右臂，只有完整左臂和一只左手可用。近正面右空袖在画面左侧、左手在画面右侧，按人物自身解剖左右，不水平镜像。空袖不是隐藏的右手，不加义肢，不展示创口或额外指定断端。
器物：左手空着，右袖为空；无玄铁重剑、双剑、金针或面具遮脸。
背景：绝情谷底的淡潭水、岩壁、洞口和朴素居所意象，柔和水汽留出重逢气氛。若出现画外衣色提示，仅为小龙女方向的轻淡线索。
场景重心：同一杨过成熟面貌、右空袖、空左手与克制重逢情绪，背景潭水与居所意象轻淡；不展示武器或第二人物。
仅一个完整人物，头顶、实际存在的手、完整衣摆、两腿双鞋和主要器物入画，自然留边、真实承重。柔和左上光形成连续明暗，人物细腻自然、布料完整，不允许背景墨韵切碎人像。竖幅2:3，目标2048×3072 PNG，工具原生输出，不透明背景。汉式交领按人物自身左襟压右襟，不镜像。
考据边界：事件真实，伸手站姿与只表现单一主体属于场景立绘改编，不称原文定格。 不画回断臂前、不把小龙女的十六年变成死亡后复生，也不把郭襄被白雕救回误画成杨过神雕救援。 服饰颜色与白发程度待统一身份设计决定，不能将壮年画成苍老白发老人。 本轮为人物美观写实修正，人物材质与完整服装依2026-10-01新规范，水墨只用于背景；服色、剪裁和全身构图是美术补足。旧版candidate与新revision完成状态分开，本record不代表新图已生成或已审批。 本场依赖本人首图的新写实版本，必须核实实际PNG及manifest realism_revision=user_character_realism_20261001；同路径旧图不得视作已满足。

排除项：不要继承青年首图的双臂、竹棒或轻佻笑容；不要右手、义肢、断左臂或镜像，不加剑、面具、金针、白发老人、粗糙脸或双人拥抱。 人物本体禁止飞白、碎墨、纸透色、纸屑拼贴、干刷缺口、颗粒侵蚀、划痕、脸部斑驳、水彩污点、破布、撕裂衣角、毛边、碎带和密集细碎褶皱；水墨只用于背景，绝不能侵入脸、皮肤、衣服或鞋。不要复制萧峰的成熟脸、浓须、头巾、披氅、体型、掌势或少室山背景，除郭靖华山明确授权外不继承墨龙。不要照片截图、塑料3D、过度磨皮、动漫大眼、现代物品、王冠金甲、错时代服饰、错误多肢多指、手物融合、头足或器物端点裁断、额外人物、拼贴多格、题款文字、印章logo或新增装饰水印。保留工具自身溯源。
```

## 排除项

不要继承青年首图的双臂、竹棒或轻佻笑容；不要右手、义肢、断左臂或镜像，不加剑、面具、金针、白发老人、粗糙脸或双人拥抱。 人物本体禁止飞白、碎墨、纸透色、纸屑拼贴、干刷缺口、颗粒侵蚀、划痕、脸部斑驳、水彩污点、破布、撕裂衣角、毛边、碎带和密集细碎褶皱；水墨只用于背景，绝不能侵入脸、皮肤、衣服或鞋。不要复制萧峰的成熟脸、浓须、头巾、披氅、体型、掌势或少室山背景，除郭靖华山明确授权外不继承墨龙。不要照片截图、塑料3D、过度磨皮、动漫大眼、现代物品、王冠金甲、错时代服饰、错误多肢多指、手物融合、头足或器物端点裁断、额外人物、拼贴多格、题款文字、印章logo或新增装饰水印。保留工具自身溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_yangguo__ch03_prime_scene_sixteen_years_valley_reunion.prepared.json`。
