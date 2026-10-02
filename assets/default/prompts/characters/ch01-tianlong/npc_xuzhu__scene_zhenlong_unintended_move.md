---
asset_id: por_npc_xuzhu__ch01_youth_scene_zhenlong_unintended_move
subject_id: npc_xuzhu
name: 虚竹
book: ch01_tianlong
gender: male
age_variant: youth
tier: S
output: assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_scene_zhenlong_unintended_move.png
manifest: assets/default/character/male/ch01/manifest.yaml
asset_variant: scene
scene_key: zhenlong_unintended_move
scene_title: 珍珑破局·无心一着
stage: 青年，保留质朴而有辨识度的僧人骨相，不作老人。误打误撞破珍珑、进入木屋之前；仍是未获逍遥传承的少林青年僧。 对应《天龙八部》第31回。
references:
- path: assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_lingjiu_base.png
  use: 已实际查看、验证可读的原本人英雄基础 PNG；只取本人身份面容与年龄体型，不作为已完成的新写实产物，不继承旧人物纸纹、碎墨或衣料渲染。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际查看并核验新写实首样 SHA-256 4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922；只取自然皮肤、完整体积、连贯布料及人物写实完成度，绝不借其身份、男性形象、服装、姿势或龙影。
- path: assets/default/baseline/character/male/ref_npc_linghuchong__ch05_base01.png
  use: 已实际查看的同性别项目基线，仅低饱和色卡；不作为人物画法或身份参考，不继承破布、碎墨、纸纹、脸、发饰、武器与姿态。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际查看的用户原水墨参考，仅背景淡墨山水、留白及环境层次；完全忽略图中人物、衣料与肤质画法，不将纸纹和飞白带入新人物。
status: redo
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
redo_reason: "虚竹基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定"
reference_upload:
- assets/default/character/male/ch01/por_npc_xuzhu__ch01_youth_lingjiu_base.png
---

# 虚竹 · 人物写实修正

## Gemini 提示词

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**整体重出（随基础图）**。虚竹基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定。
> 上传参考只按 frontmatter `reference_upload`（共 1 张，按顺序上传）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物剧情场景图：画面里只有这一个人物，完整全身（头顶、双手、双脚和手中器物都在画内），人物是画面主体；头部端正、五官清楚，镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【场景背景】擂鼓山淡墨松石、一小片棋盘与远处木屋；不见其他弈棋者。背景用低对比、低饱和的淡彩水墨来画，只保留能认出地点的少量轮廓，不喧宾夺主；人物轮廓清楚、与背景分开，水墨不侵入人物和衣服。
【人物与场景】虚竹，《天龙八部》，珍珑破局·无心一着。阶段：青年，保留质朴而有辨识度的僧人骨相，不作老人。误打误撞破珍珑、进入木屋之前；仍是未获逍遥传承的少林青年僧。 对应《天龙八部》第31回。
【身份参考】随提示词上传的第 1 张图是虚竹本人的新版基础立绘：保持同一张脸、同样的年龄感、体格与发际（约二十四岁的青年僧人，相貌朴拙：宽短的方脸、额头宽，浓黑的眉毛，眼睛大而圆、眼神质朴诚恳，大鼻子、鼻孔微微朝上，两耳明显外招（招风耳），嘴唇厚，脸颊微胖、下巴短；剃光的头皮带青色发茬；肩背厚实）；本场的服饰、动作、道具与背景按下文，不要照搬基础立绘的姿势与背景。
【衣装】朴素的灰褐僧衣、素白内领、布腰带、深色长裤与僧鞋，剃光的头；此时还没有任何指环。
【动作与神情】站在一张低棋案旁，微微俯身、伸手无心落下一枚棋子，另一手轻收衣袖；神情关切又有些迟疑。
【器物】指间一枚棋子、低棋案一角；所有手指都光着，没有指环（基础立绘上的指环此场必须去掉）。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要第二个人物或人群、分身残影；不要可读文字或图谱口诀；不要换成另一张脸。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

## 人物与阶段

- subject_id：npc_xuzhu
- book：ch01_tianlong
- gender：male
- age_variant：youth
- scene_title：珍珑破局·无心一着
- scene_key：zhenlong_unintended_move
- stage：青年，保留质朴而有辨识度的僧人骨相，不作老人。误打误撞破珍珑、进入木屋之前；仍是未获逍遥传承的少林青年僧。 对应《天龙八部》第31回。

## 本轮人物写实规范

作者最新人物美观写实修正：珍珑破局·无心一着；本人身份连续，人物完整写实，水墨仅背景。本人首幅身份基准建立。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_xuzhu__ch01_youth_scene_zhenlong_unintended_move/prompt-e3c30f08d705c3bf5c09a6d86cbceac6fd0d2b00b082088063d33354daa4974d.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

第一参考已实际查看，是本轮原本人基础 PNG，仅保留虚竹自己的面容骨相、年龄与体型身份；忽略其中人物水墨肌理、碎白、衣装画法和原站姿。当前要重新按第二张首样的写实质量塑造本人，人物衣料完整，服饰、动作、道具与发式以本场阶段为准。
第二参考是已实际查看的新版萧峰少室山首样，仅作为人物渲染质量标准：自然面容、细腻皮肤、连续光影、完整布料、干净收边。它不是身份参考，不能借用萧峰的脸、年龄、胡须、裹巾、体型、男装或动作。本角色仍是虚竹，不可变成萧峰。
第三参考是同性别原项目基线，仅低饱和色卡，不参考脸、人物笔触、碎墨、衣料细节、姿态或器物。
第四参考仅用于背景水墨山水、浅淡墨韵和留白；不参考其中人物、脸、皮肤、白青衣装、发饰或纸纹透衣的画法。

虚竹，《天龙八部》，珍珑破局·无心一着。阶段：青年，保留质朴而有辨识度的僧人骨相，不作老人。误打误撞破珍珑、进入木屋之前；仍是未获逍遥传承的少林青年僧。 对应《天龙八部》第31回。
人物与完整衣装动作：青年男子，面容质朴，较宽鼻梁与温厚眼神，骨相区别于段誉的秀雅与萧峰的雄峻；不是模板美少年，也不以夸张丑相取乐。 剃度僧人头相，保持同一面部身份，不长出道士髻或西夏驸马长发。 朴素完整的灰褐僧衣、少量素白内领、素布腰束、深色长裤与僧鞋。衣料干净、连贯、自然可穿，袖口和下摆规整，少量大褶体现俯身；没有华丽袈裟、毛边、撕裂或碎带。双手所有手指光裸，没有掌门指环。 完整站于一张低棋案侧，微俯身伸手落下一枚棋子，另一手轻收衣袖；神情关切而有些迟疑，非胜券在握的棋圣。 人物面部、皮肤、头发、衣服与鞋采用完整连贯的写实国风插画塑造；实体体积清楚、柔和光影连续、轮廓干净，墨染和纸面纹理只留在背景。
器物与阶段限制：一枚指间棋子、低棋案局部；右手拇指及其余所有手指均光裸。尚未获得七宝指环，必须去掉第一身份参考上的指环。
仅背景使用水墨：擂鼓山淡墨松石、小片棋盘和木屋远影，背景不见其他弈棋者。 不加佛光、道家法阵或预知未来符号；慈悲由目光与动作表达。 背景只作浅淡场景识别；无第二人物、多人战场、完整神像、可读题字或替身残影。
本场具体构图：虚竹在低棋案旁微俯身、无心落子；右手拇指和其余手指均光裸，移除原本人基础图中的指环。此时没有逍遥传承、童姥掌法或生死符，不能画成已掌控全局的宗师。棋盘是原创示意，非宣称可验残局。
单人单视图，完整头顶、躯干、双手、两腿双足及指定器物都入画，站坐依本场而定，自然留边、真实承重。竖幅2:3，目标2048×3072 PNG，接受工具原生输出，不透明。肤质细腻自然、衣料完整连贯，少量宽缓承重褶；画面墨韵与纸感只用于背景，不能侵入人物。

完整排除项：绝对不要指环、扳指、戒指、宫主权杖、逍遥法器、生死符或掌力特效。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制第二参考萧峰的脸、胡须、裹巾、魁梧体型、深灰服装、披氅、掌势或龙影。不要额外人物、多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。
```

## 排除项

绝对不要指环、扳指、戒指、宫主权杖、逍遥法器、生死符或掌力特效。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制第二参考萧峰的脸、胡须、裹巾、魁梧体型、深灰服装、披氅、掌势或龙影。不要额外人物、多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_xuzhu__ch01_youth_scene_zhenlong_unintended_move.prepared.json`。
