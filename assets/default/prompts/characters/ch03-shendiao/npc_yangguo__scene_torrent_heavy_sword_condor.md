---
asset_id: por_npc_yangguo__ch03_youth_scene_torrent_heavy_sword_condor
subject_id: npc_yangguo
name: 杨过
book: ch03_shendiao
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch03/por_npc_yangguo__ch03_youth_scene_torrent_heavy_sword_condor.png
manifest: assets/default/character/male/ch03/manifest.yaml
asset_variant: scene
scene_key: torrent_heavy_sword_condor
scene_title: 剑冢山洪·神雕重剑
stage: 第26回，右臂被斩后，受神雕引领习练重剑，尚未经历十六年等待。
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
---

# 杨过 · 人物写实修正

## Gemini 提示词

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**整体重出（随基础图）**。杨过基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定。
> 上传参考只按 frontmatter `reference_upload`（共 1 张，按顺序上传）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物剧情场景图：画面里只有这一个人物，完整全身（头顶、双手、双脚和手中器物都在画内），人物是画面主体；头部端正、五官清楚，镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【场景背景】剑冢附近的山洪：淡墨山岩、溪流与水势；水不吞没双脚和剑。背景用低对比、低饱和的淡彩水墨来画，只保留能认出地点的少量轮廓，不喧宾夺主；人物轮廓清楚、与背景分开，水墨不侵入人物和衣服。
【人物与场景】杨过，《神雕侠侣》，剑冢山洪·神雕重剑。阶段：第26回，右臂被斩后，受神雕引领习练重剑，尚未经历十六年等待。
【身份参考】随提示词上传的第 1 张图是杨过本人的新版基础立绘：保持同一张脸、同样的年龄感、体格与发际（清瘦俊秀的长脸、颧骨略高，浓黑的剑眉斜飞入鬓，一双凤眼细长、眼神锐利，鼻梁高挺，薄唇，脸色偏苍白；身材高挑精瘦）；本场的服饰、动作、道具与背景按下文，不要照搬基础立绘的姿势与背景。
【伤残】原著断的是右臂：右臂齐上臂断去，右边衣袖空着（不是藏起来的手），只有左手可用；按人物自身左右，不要水平镜像。
【衣装】苍灰青交领右衽练剑衣、深色腰带、长裤和牢靠布靴，黑发束起；右臂已断，右边空袖妥帖收在右腰；衣服被山洪打湿、颜色深浅不一但完整。
【动作与神情】站在山洪中的岩面上，只以左手控制玄铁重剑，肩背真实地抗衡水势，神情专注坚韧。
【器物】左手一柄乌黑厚重、宽而无锋的玄铁重剑；旁边岩上站着一只体形高大的神雕（羽毛褐黑、头顶有肉冠、翅短而有力，是独孤求败留下的神雕，完整真实，不是白雕）。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。除神雕外不要其他人物或动物、分身残影；不要可读文字或图谱口诀；不要换成另一张脸。不要两只手都在、不要左臂断、不要义肢或伤口特写。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

## 人物与阶段

- subject_id：npc_yangguo
- book：ch03_shendiao
- gender：male
- age_variant：youth
- scene_title：剑冢山洪·神雕重剑
- scene_key：torrent_heavy_sword_condor
- stage：第26回，右臂被斩后，受神雕引领习练重剑，尚未经历十六年等待。

## 本轮人物写实规范

作者最新人物美观写实修正：剑冢山洪·神雕重剑；自然细腻面容与连续人体光影，完整剪裁布料，水墨仅背景，保持原场景阶段。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_yangguo__ch03_youth_scene_torrent_heavy_sword_condor/prompt-1e41a6ae4465421bdce5a258f2494d007843c0882508457b0ed745ded7827078.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

第一张必须是已经生成保存、实际查看并核实新写实revision的杨过双臂青年首图，只保持同一人核心骨相、眼鼻口关系与黑发。当前断右臂与本场年龄必须重新落实，不能继承首图双臂、竹棒、衣装或早期轻快表情；旧路径中的初版不能代替该新身份依赖。第二张萧峰仅供自然肤质、完整体积、连贯光影与衣料的写实渲染，不借其脸、胡须、体型或配饰。第三张男性基线只色卡，第四张用户女子图只背景墨韵。

杨过，《神雕侠侣》，剑冢山洪·神雕重剑。
阶段：第26回，右臂被斩后，受神雕引领习练重剑，尚未经历十六年等待。
人物、完整衣装与动作：保留首场青年杨过的核心眼鼻口关系和清俊面骨，仅以左手控制玄铁重剑，双脚在水中岩面承重，肩背真实抗衡水势，神情专注坚韧。皮肤和衣料有完整体积，不作痛苦丑化或粗糙风化。 苍灰青完整交领右衽练剑衣、深色腰束、窄左袖、长裤和牢靠布靴，简洁束起长黑发。人物自身右侧空袖在右腰妥帖收束，布料连续完整且轮廓与躯干分开；缺臂不等于衣料残破。左肩臂有真实练剑力量，水湿只以连续深浅色与光泽表示，不用斑驳噪点或侵蚀纹理。 伤残侧别必须明确：缺失人物自身右臂，只有完整左臂和一只左手可用。近正面右空袖在画面左侧、左手在画面右侧，按人物自身解剖左右，不水平镜像。空袖不是隐藏的右手，不加义肢，不展示创口或额外指定断端。
器物：左手一柄暗黑厚重、宽而无锋感的玄铁重剑，朴素无宝石。神雕在相邻岩边以体形和翅势清楚可见；它是独孤求败遗留的神雕同伴，不是郭靖的一对白雕，也不是可御剑飞行的仙禽。
背景：剑冢附近山洪练剑处，淡山岩、溪流和少量水势墨痕；水势衬托全身，不吞掉脚和剑。剑冢石刻可只作无可读字的轮廓，不把多个时空硬拼为全景。
场景重心：断右臂、仅左手握玄铁剑、旁侧一只神雕与山洪岩面。神雕有真实完整躯体和羽毛，不是碎墨塑形，也不是郭靖白雕；人物与神雕均不能被水墨背景侵蚀。
仅一个完整人物，头顶、实际存在的手、完整衣摆、两腿双鞋和主要器物入画，自然留边、真实承重。柔和左上光形成连续明暗，人物细腻自然、布料完整，不允许背景墨韵切碎人像。竖幅2:3，目标2048×3072 PNG，工具原生输出，不透明背景。汉式交领按人物自身左襟压右襟，不镜像。
考据边界：本地 E34 将断臂归到第23回，但本次读到的原著转录发生于第24回；保留差异供纸本校对，不改上游文件。 chapters/03-shendiao.md:975 的双手重剑是装备分类，不能令独臂杨过用两只手握剑。 不锁定待考的断端精确位置、重剑重量或地理坐标；不加十六年后的面具、白鬓和黯然掌。 本轮为人物美观写实修正，人物材质与完整服装依2026-10-01新规范，水墨只用于背景；服色、剪裁和全身构图是美术补足。旧版candidate与新revision完成状态分开，本record不代表新图已生成或已审批。 本场依赖本人首图的新写实版本，必须核实实际PNG及manifest realism_revision=user_character_realism_20261001；同路径旧图不得视作已满足。

排除项：不要继承首场双臂，不要右手、右前臂、义肢或第二只工作手；不要断左臂、双手握剑、右手握剑或水平镜像，不加细剑、宝石剑、白雕、白鹤或飞行坐骑。 人物本体禁止飞白、碎墨、纸透色、纸屑拼贴、干刷缺口、颗粒侵蚀、划痕、脸部斑驳、水彩污点、破布、撕裂衣角、毛边、碎带和密集细碎褶皱；水墨只用于背景，绝不能侵入脸、皮肤、衣服或鞋。不要复制萧峰的成熟脸、浓须、头巾、披氅、体型、掌势或少室山背景，除郭靖华山明确授权外不继承墨龙。不要照片截图、塑料3D、过度磨皮、动漫大眼、现代物品、王冠金甲、错时代服饰、错误多肢多指、手物融合、头足或器物端点裁断、额外人物、拼贴多格、题款文字、印章logo或新增装饰水印。保留工具自身溯源。
```

## 排除项

不要继承首场双臂，不要右手、右前臂、义肢或第二只工作手；不要断左臂、双手握剑、右手握剑或水平镜像，不加细剑、宝石剑、白雕、白鹤或飞行坐骑。 人物本体禁止飞白、碎墨、纸透色、纸屑拼贴、干刷缺口、颗粒侵蚀、划痕、脸部斑驳、水彩污点、破布、撕裂衣角、毛边、碎带和密集细碎褶皱；水墨只用于背景，绝不能侵入脸、皮肤、衣服或鞋。不要复制萧峰的成熟脸、浓须、头巾、披氅、体型、掌势或少室山背景，除郭靖华山明确授权外不继承墨龙。不要照片截图、塑料3D、过度磨皮、动漫大眼、现代物品、王冠金甲、错时代服饰、错误多肢多指、手物融合、头足或器物端点裁断、额外人物、拼贴多格、题款文字、印章logo或新增装饰水印。保留工具自身溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_yangguo__ch03_youth_scene_torrent_heavy_sword_condor.prepared.json`。
