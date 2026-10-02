---
asset_id: por_npc_zhaomin__ch04_youth_scene_lvliu
subject_id: npc_zhaomin
name: 赵敏
book: ch04_yitian
gender: female
age_variant: youth
tier: S
output: assets/default/character/female/ch04/por_npc_zhaomin__ch04_youth_scene_lvliu.png
manifest: assets/default/character/female/ch04/manifest.yaml
asset_variant: scene
scene_key: lvliu
scene_title: 绿柳邀客
stage: 汝阳王府郡主布局绿柳庄，尚以俊秀少年公子形象接客。
references:
- path: .agents/coord/imagegen-reference/hero-20261001/classic_zhaomin_1993_portrait.jpg
  use: 已实际查看的赵敏经典影视形象 JPG，按作者授权作为本人容貌、英气与机智灵动神态的参考；不是已完成新写实身份 PNG，不照搬照片纹理、原影视服装、姿态、水印、字幕或背景。阶段衣装按本场独立设计。
- path: assets/default/character/male/ch01/por_npc_xiaofeng__ch01_prime_scene_shaoshi_dragon_palm.png
  use: 已实际查看并核验新写实首样 SHA-256 4bddf4a7b9583d717383a938a189f113be5bbb58a4859c6d84635f14e686e922；仅借自然面容与肤质的描绘质量、完整坚实体积、连贯光影、连贯布料和干净轮廓，不复制萧峰的脸、性别、年龄、胡须、头巾、体型、服饰、姿态或龙影。
- path: assets/default/baseline/character/female/ref_npc_wangyuyan__ch01_base01.png
  use: 已实际查看的对应性别项目基线，仅低饱和配色色卡；此位置不作本人身份或人物画法参考，不继承碎墨、飞白、纸纹透衣、破布、脸、年龄、衣饰、武器与姿势。
- path: .agents/coord/imagegen-reference/user_wangyuyan_style_20260930.png
  use: 已实际查看的用户王语嫣水墨图，只用于背景的浅淡山水、留白与环境层次；完全忽略其中人物、脸、体型、肤质、服饰、发饰和人物笔触，不让背景纸纹与飞白侵入本场人物。
status: redo
scene_revision: user_scenes_20261001
realism_revision: user_character_realism_20261001
redo_reason: "赵敏基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定"
reference_upload:
- assets/default/character/female/ch04/por_npc_zhaomin__ch04_youth_lvliu_base.png
---

# 赵敏 · 人物写实修正

## Gemini 提示词

> 2026-10-02 重要人物立绘重审（A 组，`tools/agents/reports/REVIEW-portraits-A-ch00-04.md`）：**整体重出（随基础图）**。赵敏基础立绘整体重出（新面容），本场景随之重出以保持同一张脸；场景内容沿用原设定。
> 上传参考只按 frontmatter `reference_upload`（共 1 张，按顺序上传）；frontmatter 的 `references` 与本节以下内容是旧出图管线的历史记录，不再用于出图。

```text
生成一张 2:3 竖幅全身人物剧情场景图：画面里只有这一个人物，完整全身（头顶、双手、双脚和手中器物都在画内），人物是画面主体；头部端正、五官清楚，镜头平视。
【画风】写实手绘古风人物插画，与本项目写实武侠角色立绘同一画风：人物是完整、坚实、比例真实的写实绘画；皮肤有真实质感——细小毛孔、细纹、晒痕、轻微色斑和自然的左右不对称，不磨皮、不油亮；头发有一根根的发丝和自然碎发；布料看得出经纬纹理、厚薄和自然垂坠的褶皱，带穿用过的轻微旧化，但完整不破烂；整体设色低饱和、沉稳；柔和的自然光从左上方照来，明暗过渡自然，不打舞台光、轮廓光或美颜柔光。这是手绘写实绘画，不是照片，不是三维渲染，也不是动漫或游戏 CG。
【场景背景】绿柳山庄：柳条、曲廊、池岸与一小片清水，庄园纵深极淡。背景用低对比、低饱和的淡彩水墨来画，只保留能认出地点的少量轮廓，不喧宾夺主；人物轮廓清楚、与背景分开，水墨不侵入人物和衣服。
【人物与场景】赵敏，《倚天屠龙记》，绿柳邀客。阶段：汝阳王府郡主布局绿柳庄，尚以俊秀少年公子形象接客。
【身份参考】随提示词上传的第 1 张图是赵敏本人的新版基础立绘：保持同一张脸、同样的年龄感、体格与发际（偏短的鹅蛋脸、下颌线清楚，浓而上扬的英气长眉，一双黑白分明、炯炯有神的大眼睛（眼神自信、狡黠、带挑战意味），鼻梁挺直，唇形饱满、嘴角含笑，肌肤白皙；明艳中带英气与贵气，比黄蓉更锐利、更有王府郡主的气派）；本场的服饰、动作、道具与背景按下文，不要照搬基础立绘的姿势与背景。
【衣装】与基础立绘相同的男装公子打扮：宝蓝色绸衫（汉式交领右衽长袍）、玉白内领、窄腰带系玉佩、深色短靴，乌发束成男子发髻戴小玉冠。
【动作与神情】侧身迎客，手执折扇轻收，眉梢轻挑，传达郡主的机智与自信（不妖媚）。
【器物】一柄白玉柄折扇；腰间少量佩饰。
【体态】成年女性的身体比例（约 7 头身），衣着完整端庄、不透明、不暴露、不性感化。
【不要】画面里不要任何文字、题款、印章、签名、水印、边框、分格或多视图；不要第二个人；不要幼态（童颜、娃娃脸、婴儿肥、儿童或少年身材、大头小身）；不要塑料感皮肤、磨皮美颜、网红脸（尖下巴大眼高鼻的模板脸）、过度对称、浓妆、偶像式打光、蜡像感；不要照片质感、三维渲染或动漫大眼；不要歪头、斜镜头；不要多指、缺指（设定的伤残除外）、手与器物粘连或悬空；汉式交领必须右衽（穿着者的左襟压在右襟上），不要左衽（设定为少数民族服制的除外），不要水平镜像；不要现代物品、发光特效、法阵或能量光。不要第二个人物或人群、分身残影；不要可读文字或图谱口诀；不要换成另一张脸。
```

---

以下为 2026-10-02 之前的历史提示词与说明，仅作历史保留。

## 人物与阶段

- subject_id：npc_zhaomin
- book：ch04_yitian
- gender：female
- age_variant：youth
- scene_title：绿柳邀客
- scene_key：lvliu
- stage：汝阳王府郡主布局绿柳庄，尚以俊秀少年公子形象接客。

## 本轮人物写实规范

作者最新写实修正：绿柳邀客；本人身份连续、实体人物完整美观写实、水墨仅背景。首场建立本人的新写实身份锚点。

人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景保留水墨韵味，但不切碎人物，不用背景墨迹吞没衣料或肢体。人物身份与场景阶段按完整新设计保留。

本轮实际请求以下文完整提示词为准；旧生成限制及返修文本仅作历史，见备份 `.agents/coord/portrait-generation/realism-20261001/backups/por_npc_zhaomin__ch04_youth_scene_lvliu/prompt-ea7041a6eda2c1216b33c74804639b09f092a6666fe41795f75803b7b35d6242.md`。人物身份与阶段事实保留。原参考审批状态不变；本轮仍为候选。

## 提示词

```text
Create a premium REALISTIC Chinese wuxia character illustration with a delicate INK-WASH BACKGROUND. The human figure is beautifully and coherently painted: solid continuous anatomy, fine natural skin, credible facial structure, soft connected light and shade, intact carefully tailored cloth, clean continuous silhouette. Render the figure with refined hand-painted realism, not a photo, movie screenshot, 3D render or plastic model. No dry-brush gaps, white flecks, torn edges, collage fragments, paper erosion, scratches or watercolor mottling anywhere on face, skin, clothes or boots. Keep ink washes and loose expressive marks only in the background, separated from the clean figure. Clothes have few broad weight-bearing folds and clean sewn hems, never shredded ribbons or noisy patchwork. Heroism comes from eyes, bearing, physique and fitting clothes, not raggedness. Traditional understated clothing remains handsome without excess ornament.

第一参考为已实际查看且获作者授权的赵敏经典形象，用于本人容貌与英气、机智灵动神态；重新绘成完整写实国风人物，绝不照搬摄影服装、截图材质、水印和相同姿势，衣装按本场元末男装设计。
第二参考为新版萧峰少室山首样，只提供人物绘画质量：细腻真实肤质、完整体积、连贯柔和光影、连贯完整布料及干净轮廓；绝不复用其脸、胡须、头巾、体型、年龄、男性特征、服装、姿态或龙影。本角色仍是赵敏。
第三参考为对应性别项目基线，仅低饱和色卡，不取人物笔触与衣料细节。
第四参考仅用于背景水墨与留白；不取其中人物、白青衣装、肤质或纸纹透衣。

人物身份设计：赵敏的独立设计：略短的鹅蛋脸，眉尾轻扬、灵动而锐利的杏眼，鼻梁清楚，唇形自然；女性身材修长利落，肩颈舒展，审视时带自信机敏、笑时有明亮灵气。男装仍是一位有主见的蒙古贵族女子，无胡须，不把她变成清宫格格。经典图仅帮助神态设计，不复制演员摄影脸、服装细节和相同坐姿。
赵敏，《倚天屠龙记》，绿柳邀客。
阶段：汝阳王府郡主布局绿柳庄，尚以俊秀少年公子形象接客。
人物与完整衣装动作：单人全身男装公子，元末汉式锦袍与束发冠，姿态自信，手执折扇轻收，不妖媚。 衣装设计：元末贵公子浅暖白直身长袍、低饱和浅青内领、简洁束腰与青灰鞋，束发小冠；这是美术选款，不复制影视图全套。 衣料保持完整可穿、连贯成片、剪裁清楚和整洁收边；旧衣仅显使用后的柔软色泽，不撕烂、不掉碎片、不加成排补丁、密集皱纹或碎带。 人物面部、皮肤、头发、衣服与鞋均采用美观写实的高级国风插画塑造；解剖与实体体积清楚、细腻自然肤质、连贯柔和光影、干净完整轮廓。人物上没有碎墨、纸纹侵蚀或飞白。衣料完整连贯、剪裁明确，袖口与下摆干净连续收边，只有少量自然宽缓承重褶，英雄气来自眼神、体格、姿势与合身份的衣饰。
器物与阶段限制：折扇一把；不额外加屠龙刀；腰间普通佩饰，数量克制
仅背景使用水墨：浅淡水墨背景，人物为画面主体。柳条、曲廊、池岸与小片清水错落，庄园纵深极淡；背景以柳而非通用山峰识别。
本场具体构图：赵敏侧身迎客，半收素扇与轻挑眉眼传达郡主的机智；淡柳池廊与完整人物清楚分开。
单人单视图完整全身，站姿从头顶到足；坐跪姿完整呈现躯干、双手、膝腿与足，主要器物端点入画，留自然边距。仅保留本场明确授权的代表动物，动物肢体不与人粘连。竖幅2:3，目标2048×3072 PNG，接受工具原生输出，不透明。真实承重、关节清楚，不机械限定占高、不因衣摆轻微遮鞋返工；人物清楚居前，水墨只在背景且不侵入人体和衣服。
情节与美术边界：郡主身份不是清宫格格；男装保留同脸与女性身份。庭园几何、衣色为美术设计；不把毒局画成魔法。 本场为独立经典场景变体，保留基础立绘；production record 不表示 PNG 已生成或已查看，不代表审批通过，未来实际成图仍为 candidate。服色、站坐姿及具体衣纹是美术补足，阶段装备与明确伤残优先。 本次执行 REALISTIC-CHARACTERS-20261001.md：人物美观写实、皮肤与衣料完整连续，水墨仅用于背景。旧候选仅为历史记录，不计本轮写实完成；本记录本身不是生成、保存或审批，新图实际查看通过后仍为 candidate。

完整排除项：不要摄影皮肤、剧照水印、原照片姿势、男性胡须、清式格格头、屠龙刀或额外人物。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、粗糙斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制萧峰首样的脸、年龄、胡须、裹巾、魁梧体型、性别特征、深灰服装、披氅、掌势或龙影。不要额外人物、错误多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。不要添加剧情未要求的破损污渍、无依据伤残、武器或跨阶段装备；年少人物衣着完整得体，不成人化或性感化。
```

## 排除项

不要摄影皮肤、剧照水印、原照片姿势、男性胡须、清式格格头、屠龙刀或额外人物。 人物本体不要飞白、碎墨、撕裂边、拼贴纸屑、纸面透肤透衣、白色斑点、颗粒侵蚀、粗糙斑驳脸、破布、过度密集褶皱或碎带。不要把背景墨迹、龙纹、山水或符号延伸到人的皮肤、衣服、手脚；不要复制萧峰首样的脸、年龄、胡须、裹巾、魁梧体型、性别特征、深灰服装、披氅、掌势或龙影。不要额外人物、错误多肢多指、手物融合、裁切头足器物、多视图拼贴、照片截图、3D塑料质感、现代物件、文字题款、印章logo或新增水印；保留工具自身溯源。不要添加剧情未要求的破损污渍、无依据伤残、武器或跨阶段装备；年少人物衣着完整得体，不成人化或性感化。

## 质检要点

- 人物精细写实、完整坚实体积、连贯衣料、清楚轮廓；背景墨韵但不切碎人物，采用宽松candidate自查。
- 采用作者授权宽松自查；偏差如实记录，candidate不代表approved。
- 源PNG通常为1024×1536 RGB；其他原生2:3尺寸如实登记，原字节保存，不裁切、重编码、放大或去除溯源。
- 完整请求、实际参考哈希及旧版本备份见 `.agents/coord/portrait-generation/realism-20261001/por_npc_zhaomin__ch04_youth_scene_lvliu.prepared.json`。
